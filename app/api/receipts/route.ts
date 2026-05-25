import { createAdminClient } from "@/lib/supabase/admin";
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

export async function PUT(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const { id, ...updates } = await req.json();
    const { data, error } = await sb.from("receipts").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
