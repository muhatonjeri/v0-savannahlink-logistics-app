import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const { searchParams } = new URL(req.url);
    const service = searchParams.get("service");
    const clientId = searchParams.get("clientId");

    let q = sb.from("bookings").select("*").order("created_at", { ascending: false });
    if (service) q = q.eq("service_type", service);
    if (clientId) q = q.eq("client_id", clientId);

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const body = await req.json();
    const { data, error } = await sb.from("bookings").insert([{
      service_type: body.service_type,
      client_id: body.client_id || null,
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email,
      status: body.status || "pending",
      payment_status: body.payment_status || "pending",
      payment_method: body.payment_method,
      total_amount: body.total_amount || 0,
      amount_paid: body.amount_paid || 0,
      booking_date: body.booking_date || new Date().toISOString().split("T")[0],
      notes: body.notes,
      form_data: body.form_data || {},
    }]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const { id, ...updates } = await req.json();
    const { data, error } = await sb.from("bookings").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const { error } = await sb.from("bookings").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
