import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  try {
    const sb = createAdminClient();
    const { data, error } = await sb.from("receipts").select("*").order("created_at", { ascending: false });
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
      receipt_number: body.receiptNumber,
      invoice_id: body.invoiceId || null,
      client_id: body.clientId || null,
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      customer_email: body.customerEmail,
      customer_kra_pin: body.customerKraPin,
      service_type: body.serviceType,
      items: body.items,
      subtotal: body.subtotal,
      tax_amount: body.taxAmount,
      total_amount: body.totalAmount,
      payment_method: body.paymentMethod,
      transaction_code: body.transactionCode || body.transaction_code || "",
      payment_reference: body.paymentReference || body.payment_reference || body.transactionCode || "",
      booking_ref: body.bookingRef || body.booking_ref || "",
      invoice_ref: body.invoiceRef || body.invoice_ref || "",
      bank_name: body.bankName,
      status: body.status || "issued",
      etims_receipt_number: body.etimsReceiptNumber,
      etims_device_number: body.etimsDeviceNumber,
      etims_verification_url: body.etimsVerificationUrl,
      issued_by: body.issuedBy,
    };
    const { data, error } = await sb.from("receipts").insert([record]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

// Fields a receipt edit may change. Money fields (amounts, payment method),
// the receipt number and the invoice link are deliberately absent: once money is
// recorded it isn't edited — the receipt is voided and a new one issued.
const EDITABLE = new Set([
  "customer_name", "customer_phone", "customer_email", "customer_kra_pin",
  "service_type", "items", "transaction_code", "payment_reference", "bank_name",
]);

export async function PUT(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const { id, ...body } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing receipt id" }, { status: 400 });

    const { data: current, error: readErr } = await sb.from("receipts").select("status, items").eq("id", id).single();
    if (readErr || !current) return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    if (current.status === "cancelled") {
      return NextResponse.json({ error: "This receipt has been voided and can't be changed." }, { status: 409 });
    }

    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (EDITABLE.has(key)) updates[key] = value;
    }
    // Voiding: the UI says "voided"; the database calls it "cancelled"
    if (body.status === "voided" || body.status === "cancelled") updates.status = "cancelled";

    // Items may only change their wording — never quantities, prices or tax
    if (Array.isArray(updates.items) && Array.isArray(current.items)) {
      const before = current.items as Record<string, unknown>[];
      const after = updates.items as Record<string, unknown>[];
      const sameMoney = before.length === after.length && before.every((item, i) =>
        Number(item.quantity) === Number(after[i]?.quantity) &&
        Number(item.unitPrice) === Number(after[i]?.unitPrice) &&
        Number(item.amount) === Number(after[i]?.amount));
      if (!sameMoney) {
        return NextResponse.json({ error: "Amounts on a receipt can't be edited. Void it and issue a new receipt." }, { status: 409 });
      }
    }

    if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No editable fields supplied" }, { status: 400 });

    const { data, error } = await sb.from("receipts").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
