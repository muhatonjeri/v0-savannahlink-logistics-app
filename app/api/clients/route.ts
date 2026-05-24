import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { sanitizeBody, isValidUUID } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const { searchParams } = new URL(req.url);
    const page  = Number(searchParams.get("page")  || 1);
    const limit = Number(searchParams.get("limit") || 100);
    const offset = (page - 1) * limit;
    const q = searchParams.get("q");
    const id = searchParams.get("id");
    if (id) {
      const { data, error } = await sb.from("clients").select("*").eq("id", id).single();
      if (error) return NextResponse.json({ error: error.message }, { status: 404 });
      return NextResponse.json(data);
    }
    if (q) {
      const { data, error } = await sb.from("clients").select("*")
        .or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,id_number.ilike.%${q}%`).limit(10);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }
    const { data, error } = await sb.from("clients").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data, page, limit, total: count });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const body = await req.json();
    const record = {
      full_name: body.fullName || body.full_name,
      id_number: body.idNumber || body.id_number,
      phone: body.phone,
      alternative_phone: body.alternativePhone,
      email: body.email,
      residence: body.residence,
      place_of_work: body.placeOfWork,
      kra_pin: body.kraPin,
      driving_license_number: body.drivingLicenseNumber,
      next_of_kin_name: body.nextOfKin?.name,
      next_of_kin_phone: body.nextOfKin?.phone,
      next_of_kin_relationship: body.nextOfKin?.relationship,
      risk_level: body.riskLevel || "low",
      client_type: body.clientType || "citizen",
      country_of_origin: body.countryOfOrigin || "Kenya",
      notes: body.notes,
    };
    const { data, error } = await sb.from("clients").insert([record]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const { id, ...updates } = await req.json();
    const { data, error } = await sb.from("clients").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const id = new URL(req.url).searchParams.get("id");
    if (!id || !isValidUUID(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    const { error } = await sb.from("clients").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
