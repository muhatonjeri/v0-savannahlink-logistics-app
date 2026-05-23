import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const sb = createAdminClient();
    const { data, error } = await sb.from("receipts").select("count").single();
    return NextResponse.json({ ok: true, data, error: error?.message });
  } catch(e) {
    return NextResponse.json({ ok: false, error: String(e) });
  }
}
