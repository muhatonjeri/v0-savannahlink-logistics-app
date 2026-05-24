import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// Generate unique booking reference: BK-YYMMDD-XXXX
function generateBookingRef(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK-${yy}${mm}${dd}-${rand}`;
}

export async function GET(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const { searchParams } = new URL(req.url);
    const page  = Number(searchParams.get("page")  || 1);
    const limit = Number(searchParams.get("limit") || 100);
    const offset = (page - 1) * limit;
    const service  = searchParams.get("service");
    const clientId = searchParams.get("clientId");
    const q_param  = searchParams.get("q");

    let q = sb.from("bookings").select("*").order("created_at", { ascending: false });
    if (service)  q = q.eq("service_type", service);
    if (clientId) q = q.eq("client_id", clientId);
    if (q_param)  q = q.ilike("customer_name", `%${q_param}%`);

    q = q.range(offset, offset + limit - 1);
    const { data, error, count } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data, page, limit, total: count });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const sb   = createAdminClient();
    const body = await req.json();
    const bookingRef = generateBookingRef();

    const force = new URL(req.url).searchParams.get("force") === "true";

    // Duplicate detection: same client + service within last 24hrs
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const { data: existing } = await sb.from("bookings")
      .select("id,booking_ref,created_at")
      .eq("customer_phone", body.customer_phone || "")
      .eq("service_type", body.service_type || "")
      .gte("created_at", yesterday)
      .neq("status", "cancelled")
      .limit(1);

    if (!force && existing && existing.length > 0) {
      return NextResponse.json({
        warning: "duplicate",
        message: `A booking for this client and service already exists in the last 24hrs (${existing[0].booking_ref}). Proceed anyway?`,
        existing_ref: existing[0].booking_ref,
      }, { status: 409 });
    }

    const { data, error } = await sb.from("bookings").insert([{
      booking_ref:      bookingRef,
      service_type:     body.service_type,
      client_id:        body.client_id || null,
      customer_name:    body.customer_name,
      customer_phone:   body.customer_phone,
      customer_email:   body.customer_email,
      status:           body.status || "pending",
      payment_status:   body.payment_status || "pending",
      payment_method:   body.payment_method,
      payment_reference: body.payment_reference || "",
      total_amount:     body.total_amount || 0,
      amount_paid:      body.amount_paid || 0,
      booking_date:     body.booking_date || new Date().toISOString().split("T")[0],
      notes:            body.notes,
      form_data:        body.form_data || {},
    }]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Auto-post income transaction to accounts if payment received
    if (Number(body.amount_paid) > 0) {
      await sb.from("transactions").insert([{
        date:             body.booking_date || new Date().toISOString().split("T")[0],
        type:             "income",
        category:         body.service_type?.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Service",
        description:      `${body.service_type?.replace(/-/g, " ")} — ${body.customer_name}`,
        amount:           Number(body.amount_paid),
        payment_method:   body.payment_method || "cash",
        reference:        bookingRef,
        payment_reference: body.payment_reference || "",
        customer_name:    body.customer_name,
        invoice_number:   bookingRef,
        status:           "completed",
        created_by:       "System",
      }]);
    }

    return NextResponse.json({ ...data, booking_ref: bookingRef });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const { id, ...updates } = await req.json();

    // If payment amount changed, update the linked transaction too
    if (updates.amount_paid !== undefined || updates.payment_reference !== undefined) {
      const { data: existing } = await sb.from("bookings").select("booking_ref,amount_paid,payment_method,customer_name").eq("id", id).single();
      if (existing?.booking_ref) {
        // Update the linked transaction reference
        await sb.from("transactions").update({
          payment_reference: updates.payment_reference || "",
          amount: Number(updates.amount_paid || existing.amount_paid || 0),
        }).eq("reference", existing.booking_ref);
      }
    }

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
