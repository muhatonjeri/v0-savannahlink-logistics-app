import { sanitizeSearch } from "@/lib/sanitize";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { sanitizeBody, isValidUUID } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const { searchParams } = new URL(req.url);
    const page   = Number(searchParams.get("page")  || 1);
    const limit  = Number(searchParams.get("limit") || 100);
    const offset = (page - 1) * limit;
    const rawQ   = searchParams.get("q");
    const q      = rawQ ? sanitizeSearch(rawQ) : null;
    const id     = searchParams.get("id");

    if (id) {
      const { data, error } = await sb.from("clients").select("*").eq("id", id).single();
      if (error) return NextResponse.json({ error: error.message }, { status: 404 });
      return NextResponse.json(data);
    }
    if (q) {
      const { data, error } = await sb.from("clients").select("*")
        .or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,id_number.ilike.%${q}%,email.ilike.%${q}%`)
        .limit(20);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data || []);
    }
    const { data, error } = await sb.from("clients").select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb   = createAdminClient();
    const body = sanitizeBody(await req.json()) as Record<string, unknown>;

    const record = {
      full_name:                body.fullName          || body.full_name,
      id_number:                body.idNumber          || body.id_number,
      phone:                    body.phone,
      alternative_phone:        body.alternativePhone  || body.alternative_phone,
      email:                    body.email,
      residence:                body.residence,
      place_of_work:            body.placeOfWork       || body.place_of_work,
      kra_pin:                  body.kraPin            || body.kra_pin,
      driving_license_number:   body.drivingLicenseNumber || body.driving_license_number,
      // New fields from register-client page
      nationality:              body.nationality,
      id_type:                  body.idType            || body.id_type,
      next_of_kin_name:         body.nextOfKinName     || (body.nextOfKin as Record<string,string>)?.name,
      next_of_kin_phone:        body.nextOfKinPhone    || (body.nextOfKin as Record<string,string>)?.phone,
      next_of_kin_relationship: body.nextOfKinRelationship || (body.nextOfKin as Record<string,string>)?.relationship,
      // Photo / biometric fields
      id_photo_url:             body.idPhotoFront      || body.id_photo_url,
      id_photo_back_url:        body.idPhotoBack       || body.id_photo_back_url,
      driving_license_url:      body.dlPhotoFront      || body.driving_license_url,
      driving_license_back_url: body.dlPhotoBack       || body.driving_license_back_url,
      fingerprint_right_url:    body.fingerprintRight  || body.fingerprint_right_url,
      fingerprint_left_url:     body.fingerprintLeft   || body.fingerprint_left_url,
      passport_photo_url:       body.passportPhoto     || body.passport_photo_url,
      // Defaults
      risk_level:               body.riskLevel         || "low",
      client_type:              body.clientType        || (body.nationality === "Kenyan" ? "citizen" : "foreigner"),
      country_of_origin:        body.nationality       || "Kenya",
      notes:                    body.notes,
    };

    const { data, error } = await sb.from("clients").insert([record]).select().single();
    if (error) {
      // If Supabase not configured, return a local mock response
      if (!isSupabaseConfigured()) {
        return NextResponse.json({ id: `CLT-${Date.now()}`, ...record, created_at: new Date().toISOString() });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const { id, ...updates } = await req.json();
    if (!id || !isValidUUID(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    const clean = sanitizeBody(updates);
    const { data, error } = await sb.from("clients").update(clean).eq("id", id).select().single();
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
