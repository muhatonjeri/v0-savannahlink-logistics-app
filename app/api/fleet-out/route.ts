import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  try {
    const sb = createAdminClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("supabase.co")) return NextResponse.json([]);
    const { data, error } = await sb.from("fleet_out").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const body = await req.json();
    const { data, error } = await sb.from("fleet_out").insert([{
      vehicle_make: body.vehicleMake,
      vehicle_model: body.vehicleModel,
      vehicle_reg: body.vehicleReg,
      vehicle_color: body.vehicleColor,
      receiver_name: body.receiverName,
      receiver_phone: body.receiverPhone,
      receiver_email: body.receiverEmail,
      receiver_type: body.receiverType || "company",
      our_daily_rate: body.ourDailyRate,
      start_date: body.startDate,
      end_date: body.endDate,
      number_of_days: body.numberOfDays,
      payment_method: body.paymentMethod,
      payment_reference: body.paymentReference,
      amount_paid: body.amountPaid || 0,
      status: body.status || "active",
      return_condition: body.returnCondition,
      follow_up_notes: body.followUpNotes,
      notes: body.notes,
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
    const { data, error } = await sb.from("fleet_out").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
