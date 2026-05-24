import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const id = new URL(req.url).searchParams.get("id");
    if (id) {
      const { data, error } = await sb.from("fleet_vehicles").select("*").eq("id", id).single();
      if (error) return NextResponse.json({ error: error.message }, { status: 404 });
      return NextResponse.json(data);
    }
    const { data, error } = await sb.from("fleet_vehicles").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const body = await req.json();
    const record = {
      vehicle_name: body.vehicleName,
      vehicle_make: body.vehicleMake,
      vehicle_model: body.vehicleModel,
      registration_no: body.registrationNo,
      vehicle_type: body.vehicleType,
      fuel_type: body.fuelType,
      year: body.year ? parseInt(body.year) : null,
      color: body.color,
      ownership_type: body.ownershipType || "own",
      supplier_name: body.supplierName,
      supplier_phone: body.supplierPhone,
      supplier_daily_rate: body.supplierDailyRate,
      our_daily_rate: body.ourDailyRate,
      status: body.status || "available",
      current_mileage: body.currentMileage,
      notes: body.notes,
    };
    const { data, error } = await sb.from("fleet_vehicles").insert([record]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const { id, ...updates } = await req.json();
    const { data, error } = await sb.from("fleet_vehicles").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const id = new URL(req.url).searchParams.get("id");
    const { error } = await sb.from("fleet_vehicles").delete().eq("id", id!);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
