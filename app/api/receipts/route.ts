import { createServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.from("receipts").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient();
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
      transaction_code: body.transactionCode,
      bank_name: body.bankName,
      status: body.status || "issued",
      etims_receipt_number: body.etimsReceiptNumber,
      etims_device_number: body.etimsDeviceNumber,
      etims_verification_url: body.etimsVerificationUrl,
      issued_by: body.issuedBy,
    };

    const { data, error } = await supabase.from("receipts").insert([record]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const { data, error } = await supabase.from("receipts").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
