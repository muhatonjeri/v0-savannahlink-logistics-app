import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const sb = createAdminClient();
  
  const receipts = await sb.from("receipts").select("*").order("created_at", { ascending: false });
  const invoices = await sb.from("invoices").select("*").order("created_at", { ascending: false });
  const clients  = await sb.from("clients").select("*").order("created_at", { ascending: false });
  
  return NextResponse.json({
    receipts: { count: receipts.data?.length, error: receipts.error?.message, sample: receipts.data?.[0] },
    invoices: { count: invoices.data?.length, error: invoices.error?.message, sample: invoices.data?.[0] },
    clients:  { count: clients.data?.length,  error: clients.error?.message,  sample: clients.data?.[0] },
  });
}
