import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    let query = sb.from("transactions").select("*").order("date", { ascending: false });
    if (type) query = query.eq("type", type);
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const body = await req.json();
    const records = Array.isArray(body) ? body : [body];
    const { data, error } = await sb.from("transactions").insert(records).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
