import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const { searchParams } = new URL(req.url);
    const page  = Number(searchParams.get("page")  || 1);
    const limit = Number(searchParams.get("limit") || 100);
    const offset = (page - 1) * limit;
    const type = searchParams.get("type");
    let query = sb.from("transactions").select("*").order("date", { ascending: false });
    if (type) query = query.eq("type", type);
    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data, page, limit, total: count });
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

export async function PUT(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const { data, error } = await sb.from("transactions").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
