import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const _rawQ = new URL(req.url).searchParams.get("q");
    const q = _rawQ ? sanitizeSearch(_rawQ) : null;
    let query = sb.from("blacklist").select("*").order("created_at", { ascending: false });
    if (q) query = query.or(`client_name.ilike.%${q}%,id_number.ilike.%${q}%,phone.ilike.%${q}%`);
    query = query.range(offset, offset + limit - 1);
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const rawBody = await req.json();
    const body = sanitizeBody(rawBody);
    const record = {
      client_id: body.clientId || null,
      client_name: body.clientName,
      id_number: body.idNumber,
      phone: body.phone,
      record_type: body.recordType,
      severity: body.severity,
      status: body.status || "active",
      incident_date: body.incidentDate || null,
      description: body.description,
      reported_by: body.reportedBy,
    };
    const { data, error } = await sb.from("blacklist").insert([record]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const { id, ...updates } = await req.json();
    const { data, error } = await sb.from("blacklist").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const id = new URL(req.url).searchParams.get("id");
    const { error } = await sb.from("blacklist").delete().eq("id", id!);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
