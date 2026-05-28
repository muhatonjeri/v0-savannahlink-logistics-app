import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { verifyInternalRequest, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  if (!verifyInternalRequest(req)) return unauthorized();
  try {
    const sb = createAdminClient();
    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table");
    const limit = Number(searchParams.get("limit") || 50);

    let q = sb.from("audit_log").select("*").order("created_at", { ascending: false }).limit(limit);
    if (table) q = q.eq("table_name", table);

    const { data, error } = await q;
    if (error?.message?.includes("not configured")) return NextResponse.json([]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
