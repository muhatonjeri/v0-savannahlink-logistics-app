import { createServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const id = searchParams.get("id");

    if (id) {
      const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
      if (error) return NextResponse.json({ error: error.message }, { status: 404 });
      return NextResponse.json(data);
    }

    if (query) {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,id_number.ilike.%${query}%`)
        .limit(10);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }

    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await req.json();

    // Map camelCase fields to snake_case for Supabase
    const record = {
      full_name: body.fullName || body.full_name,
      id_number: body.idNumber || body.id_number,
      phone: body.phone,
      alternative_phone: body.alternativePhone || body.alternative_phone,
      email: body.email,
      residence: body.residence,
      place_of_work: body.placeOfWork || body.place_of_work,
      kra_pin: body.kraPin || body.kra_pin,
      driving_license_number: body.drivingLicenseNumber || body.driving_license_number,
      next_of_kin_name: body.nextOfKin?.name || body.next_of_kin_name,
      next_of_kin_phone: body.nextOfKin?.phone || body.next_of_kin_phone,
      next_of_kin_relationship: body.nextOfKin?.relationship || body.next_of_kin_relationship,
      risk_level: body.riskLevel || body.risk_level || "low",
      client_type: body.clientType || body.client_type || "citizen",
      country_of_origin: body.countryOfOrigin || body.country_of_origin || "Kenya",
      notes: body.notes,
    };

    const { data, error } = await supabase.from("clients").insert([record]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { data, error } = await supabase.from("clients").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
