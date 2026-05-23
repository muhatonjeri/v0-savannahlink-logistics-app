import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const sb = createAdminClient();
  const { data, error } = await sb.from("receipts").select("id, receipt_number, customer_name, total_amount, status, created_at").order("created_at", { ascending: false });
  return NextResponse.json({ count: data?.length, error: error?.message, records: data });
}
