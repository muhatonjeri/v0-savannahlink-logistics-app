import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  try {
    const sb = createAdminClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("supabase.co")) return NextResponse.json([]);
    const { data, error } = await sb.from("sublet_vehicles").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const body = await req.json();
    const { data, error } = await sb.from("sublet_vehicles").insert([{
      service_type: body.serviceType,
      supplier_name: body.supplierName,
      supplier_phone: body.supplierPhone,
      supplier_type: body.supplierType || "company",
      make: body.make,
      model: body.model,
      registration: body.registration,
      color: body.color,
      year: body.year,
      supplier_daily_rate: body.supplierDailyRate,
      our_daily_rate: body.ourDailyRate,
      status: body.status || "available",
    }]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const { id, ...updates } = await req.json();
    const { data, error } = await sb.from("sublet_vehicles").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all");
    if (all === "true") {
      const { error } = await sb.from("sublet_vehicles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, deleted: "all" });
    }
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const { error } = await sb.from("sublet_vehicles").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
// Note: above handler updated to support ?all=true for bulk delete
// Note: DELETE by id already exists above — this adds delete-all via ?all=true
