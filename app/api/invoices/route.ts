import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
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
    };
    const { data, error } = await sb.from("invoices").insert([record]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const { id, ...updates } = await req.json();
    const { data, error } = await sb.from("invoices").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const id = new URL(req.url).searchParams.get("id");
    const { error } = await sb.from("invoices").delete().eq("id", id!);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
