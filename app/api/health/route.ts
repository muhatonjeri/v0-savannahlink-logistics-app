import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test connection by checking each table exists
    const tables = [
      "clients",
      "bookings", 
      "fleet_vehicles",
      "invoices",
      "receipts",
      "transactions",
      "blacklist",
      "sublet_vehicles",
      "sublet_bookings",
      "fleet_out",
      "staff",
    ];

    const results: Record<string, string> = {};

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      
      results[table] = error ? `ERROR: ${error.message}` : `OK (${count} rows)`;
    }

    return NextResponse.json({
      status: "connected",
      message: "Supabase connection successful",
      tables: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: String(error),
    }, { status: 500 });
  }
}
