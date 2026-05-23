import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sb = createAdminClient();
    const tables = ["clients","blacklist","bookings","fleet_vehicles","invoices","receipts","transactions","sublet_vehicles","sublet_bookings","fleet_out","staff"];
    const results: Record<string,string> = {};
    for (const t of tables) {
      const { count, error } = await sb.from(t).select("*", { count: "exact", head: true });
      results[t] = error ? "ERROR: " + error.message : "OK (" + count + " rows)";
    }
    return NextResponse.json({ status: "connected", message: "Supabase connected", tables: results, timestamp: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ status: "error", message: String(e) }, { status: 500 });
  }
}
