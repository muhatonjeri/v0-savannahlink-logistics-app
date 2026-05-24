import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const id = new URL(req.url).searchParams.get("id");
    const phone = new URL(req.url).searchParams.get("phone");
    const name = new URL(req.url).searchParams.get("name");

    if (!id && !phone && !name) return NextResponse.json({ error: "id, phone or name required" }, { status: 400 });

    // Find client
    let clientQuery = sb.from("clients").select("*");
    if (id) clientQuery = clientQuery.eq("id", id);
    else if (phone) clientQuery = clientQuery.ilike("phone", `%${phone}%`);
    else if (name) clientQuery = clientQuery.ilike("full_name", `%${name}%`);
    
    const { data: clients } = await clientQuery.limit(1);
    const client = clients?.[0];

    // Get all bookings for this client
    let bookings: Record<string,unknown>[] = [];
    if (client) {
      const { data: b } = await sb.from("bookings").select("*")
        .or(`client_id.eq.${client.id},customer_name.ilike.%${client.full_name}%`)
        .order("created_at", { ascending: false });
      bookings = b || [];
    } else if (name) {
      const { data: b } = await sb.from("bookings").select("*")
        .ilike("customer_name", `%${name}%`)
        .order("created_at", { ascending: false });
      bookings = b || [];
    }

    // Get invoices
    const { data: invoices } = await sb.from("invoices").select("*")
      .ilike("customer_name", `%${client?.full_name || name}%`)
      .order("created_at", { ascending: false });

    // Get receipts
    const { data: receipts } = await sb.from("receipts").select("*")
      .ilike("customer_name", `%${client?.full_name || name}%`)
      .order("created_at", { ascending: false });

    // Get transactions
    const { data: transactions } = await sb.from("transactions").select("*")
      .ilike("customer_name", `%${client?.full_name || name}%`)
      .order("date", { ascending: false });

    // Calculate summary
    const totalSpent = (receipts || []).reduce((s, r) => s + (Number(r.total_amount) || 0), 0);
    const totalDebt = (invoices || []).filter(i => i.status !== "paid").reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid || 0)), 0);
    const serviceBreakdown: Record<string, number> = {};
    (bookings || []).forEach(b => {
      const svc = String(b.service_type || "other");
      serviceBreakdown[svc] = (serviceBreakdown[svc] || 0) + 1;
    });

    return NextResponse.json({
      client: client || null,
      summary: {
        totalBookings: bookings.length,
        totalSpent,
        totalDebt,
        serviceBreakdown,
        lastSeen: bookings[0]?.created_at || null,
      },
      bookings: bookings || [],
      invoices: invoices || [],
      receipts: receipts || [],
      transactions: transactions || [],
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
