import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { sanitizeSearch } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(200, Number(searchParams.get("limit") || 100));
    const offset = (page - 1) * limit;
    const rawQ = searchParams.get("q");
    const q = rawQ ? sanitizeSearch(rawQ) : null;
    let query = sb.from("blacklist").select("*").order("created_at", { ascending: false });
    if (q) query = query.or(`client_name.ilike.%${q}%,id_number.ilike.%${q}%,phone.ilike.%${q}%`);
    query = query.range(offset, offset + limit - 1);
    const { data, error } = await query;
    if (error?.message?.includes("not configured")) return NextResponse.json([]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const body = await req.json();
    const record = {
      client_name: body.fullName || body.clientName || body.client_name,
      id_number:   body.idNumber || body.id_number,
      phone:       body.phoneNumber || body.phone,
      email:       body.email,
      record_type: body.recordType || body.record_type || "other",
      severity:    body.severity || "medium",
      status:      body.status || "active",
      description: body.description,
      incident_date: body.incidentDate || body.incident_date,
      reported_by: body.reportedBy || "Admin",
      vehicle_involved: body.vehicleInvolved,
      amount_owed: body.amountOwed ? Number(body.amountOwed) : null,
      police_report_number: body.policeReportNumber,
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
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const { error } = await sb.from("blacklist").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
