import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sb = createAdminClient();
    const { data: inserted, error: insertError } = await sb
      .from("clients")
      .insert([{ full_name: "Test Client", phone: "+254700000000", id_number: "TEST001" }])
      .select().single();
    if (insertError) return NextResponse.json({ step: "INSERT FAILED", error: insertError.message, code: insertError.code, hint: insertError.hint });
    const { data: fetched } = await sb.from("clients").select("*").eq("id", inserted.id).single();
    await sb.from("clients").delete().eq("id", inserted.id);
    return NextResponse.json({ step: "SUCCESS", inserted: inserted.id, fetched: fetched?.full_name });
  } catch (e) {
    return NextResponse.json({ step: "EXCEPTION", error: String(e) });
  }
}
