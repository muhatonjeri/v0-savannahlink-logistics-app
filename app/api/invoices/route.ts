import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const id = new URL(req.url).searchParams.get("id");
    if (id) {
      const { data, error } = await sb.from("invoices").select("*").eq("id", id).single();
      if (error) return NextResponse.json({ error: error.message }, { status: 404 });
      return NextResponse.json(data);
    }
    const { data, error } = await sb.from("invoices").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const body = await req.json();
    const record = {
      invoice_number: body.invoiceNumber,
      client_id: body.clientId || null,
      customer_name: body.customerName,
      customer_email: body.customerEmail,
      customer_phone: body.customerPhone,
      customer_address: body.customerAddress,
      customer_kra_pin: body.customerKraPin,
      service_type: body.serviceType,
      items: body.items,
      subtotal: body.subtotal,
      vat_rate: body.vatRate,
      vat_amount: body.vatAmount,
      total: body.total,
      amount_paid: body.amountPaid || 0,
      payments: body.payments || [],
      status: body.status || "draft",
      issue_date: body.issueDate,
      due_date: body.dueDate,
      payment_terms: body.paymentTerms,
      notes: body.notes,
      // Corporate fields (migration 009). Empty strings → null so blank dates don't fail the date columns.
      customer_attention: body.customerAttention || null,
      lpo_number: body.lpoNumber || null,
      service_start: body.serviceStart || null,
      service_end: body.serviceEnd || null,
      vehicle_route: body.vehicleRoute || null,
    };
    const { data, error } = await sb.from("invoices").insert([record]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

// Columns a client may change. invoice_number, issue_date, id and created_at are
// intentionally absent: an invoice's identity never changes once issued.
const PAYMENT_FIELDS = new Set(["amount_paid", "payments", "status", "payment_reference"]);
const CONTENT_FIELDS = new Set([
  "customer_name", "customer_email", "customer_phone", "customer_address", "customer_kra_pin",
  "customer_attention", "service_type", "items", "subtotal", "vat_rate", "vat_amount", "total",
  "due_date", "payment_terms", "notes", "lpo_number", "service_start", "service_end", "vehicle_route",
]);
const DATE_FIELDS = new Set(["due_date", "service_start", "service_end"]);

export async function PUT(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const { id, ...body } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing invoice id" }, { status: 400 });

    // Keep only known columns; blank dates become null (Postgres rejects "")
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!PAYMENT_FIELDS.has(key) && !CONTENT_FIELDS.has(key)) continue;
      updates[key] = DATE_FIELDS.has(key) && value === "" ? null : value;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No editable fields supplied" }, { status: 400 });
    }

    // Content edits are only allowed before any payment is received
    const editsContent = Object.keys(updates).some((k) => CONTENT_FIELDS.has(k));
    if (editsContent) {
      const { data: current, error: readErr } = await sb
        .from("invoices").select("amount_paid, status").eq("id", id).single();
      if (readErr || !current) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      if (Number(current.amount_paid) > 0 || ["paid", "partial", "cancelled"].includes(current.status)) {
        return NextResponse.json(
          { error: "This invoice has payments recorded (or is cancelled) and can no longer be edited. Issue a credit note instead." },
          { status: 409 }
        );
      }
    }

    const { data, error } = await sb.from("invoices").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const id = new URL(req.url).searchParams.get("id");
    const { error } = await sb.from("invoices").delete().eq("id", id!);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
