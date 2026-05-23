import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sb = createAdminClient();
    
    // Test receipt insert with exact field names
    const { data, error } = await sb.from("receipts").insert([{
      receipt_number: "RCP-TEST-001",
      customer_name: "Test Customer",
      customer_phone: "+254700000001",
      service_type: "Car Rental",
      items: [{ description: "Test", quantity: 1, unit_price: 1000, amount: 1000 }],
      subtotal: 1000,
      tax_amount: 160,
      total_amount: 1160,
      payment_method: "mpesa",
      transaction_code: "TEST123",
      status: "issued",
      issued_by: "Admin",
    }]).select().single();

    if (error) return NextResponse.json({ step: "RECEIPT INSERT FAILED", error: error.message, code: error.code, hint: error.hint });

    // Clean up
    await sb.from("receipts").delete().eq("id", data.id);
    return NextResponse.json({ step: "RECEIPT SUCCESS", id: data.id });
  } catch (e) {
    return NextResponse.json({ step: "EXCEPTION", error: String(e) });
  }
}
