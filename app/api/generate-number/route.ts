// Generates unique sequential receipt/invoice numbers using Supabase as counter
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const type = new URL(req.url).searchParams.get("type") || "receipt";
    const prefix = type === "invoice" ? "INV" : "RCP";
    const year = new Date().getFullYear().toString().slice(-2);
    const month = String(new Date().getMonth() + 1).padStart(2, "0");

    // Count existing records to generate sequence
    const table = type === "invoice" ? "invoices" : "receipts";
    const { count } = await sb.from(table).select("*", { count: "exact", head: true });
    const seq = String((count || 0) + 1).padStart(4, "0");
    const number = `${prefix}-${year}${month}-${seq}`;

    return NextResponse.json({ number });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
