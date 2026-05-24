import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sb = createAdminClient();
    
    // Test insert to sublet_vehicles
    const { data: sv, error: sve } = await sb.from("sublet_vehicles").insert([{
      service_type: "Car Rental", supplier_name: "Test Supplier",
      make: "Toyota", model: "Corolla", registration: "KDA TEST",
      supplier_daily_rate: 3000, our_daily_rate: 5000, status: "available"
    }]).select().single();
    
    if (sve) return NextResponse.json({ step: "sublet_vehicles INSERT FAILED", error: sve.message, code: sve.code, hint: sve.hint });

    // Read it back
    const { data: read } = await sb.from("sublet_vehicles").select("*").eq("id", sv.id).single();
    
    // Clean up
    await sb.from("sublet_vehicles").delete().eq("id", sv.id);
    
    return NextResponse.json({ step: "SUCCESS", inserted: sv.id, readBack: read?.supplier_name });
  } catch(e) {
    return NextResponse.json({ step: "EXCEPTION", error: String(e) });
  }
}
