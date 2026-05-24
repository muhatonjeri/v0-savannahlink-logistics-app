import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const id = new URL(req.url).searchParams.get("id");
    const phone = new URL(req.url).searchParams.get("phone");
    const name = new URL(req.url).searchParams.get("name");

    if (!id && !phone && !name) {
      return NextResponse.json({ error: "id, phone or name required" }, { status: 400 });
    }

    // Find client
    let clientQuery = sb.from("clients").select("*");
    if (id) clientQuery = clientQuery.eq("id", id);
    else if (phone) clientQuery = clientQuery.ilike("phone", "%" + phone + "%");
    else if (name) clientQuery = clientQuery.ilike("full_name", "%" + name + "%");

    const { data: clients } = await clientQuery.limit(1);
    const client = clients?.[0] || null;

    // Find all bookings for this client (by id, phone, or name)
    let bookingQuery = sb.from("bookings").select("*").order("created_at", { ascending: false });
    if (client?.id) {
      bookingQuery = bookingQuery.or(`client_id.eq.${client.id},customer_phone.ilike.%${client.phone || ""}%,customer_name.ilike.%${client.full_name || ""}%`);
    } else if (phone) {
      bookingQuery = bookingQuery.ilike("customer_phone", "%" + phone + "%");
    } else if (name) {
      bookingQuery = bookingQuery.ilike("customer_name", "%" + name + "%");
    }
    const { data: bookings } = await bookingQuery;

    // Find all invoices
    let invoiceQuery = sb.from("invoices").select("*").order("created_at", { ascending: false });
    if (client?.id) invoiceQuery = invoiceQuery.or(`client_id.eq.${client.id},customer_name.ilike.%${client.full_name || ""}%`);
    else if (name) invoiceQuery = invoiceQuery.ilike("customer_name", "%" + name + "%");
    const { data: invoices } = await invoiceQuery;

    // Find all receipts
    let receiptQuery = sb.from("receipts").select("*").order("created_at", { ascending: false });
    if (client?.id) receiptQuery = receiptQuery.or(`client_id.eq.${client.id},customer_name.ilike.%${client.full_name || ""}%`);
    else if (name) receiptQuery = receiptQuery.ilike("customer_name", "%" + name + "%");
    const { data: receipts } = await receiptQuery;

    // Find sublet bookings
    let subletQuery = sb.from("sublet_bookings").select("*").order("created_at", { ascending: false });
    if (client?.id) subletQuery = subletQuery.or(`client_id.eq.${client.id},client_name.ilike.%${client.full_name || ""}%`);
    else if (name) subletQuery = subletQuery.ilike("client_name", "%" + name + "%");
    const { data: subletBookings } = await subletQuery;

    // Check blacklist
    let blacklistQuery = sb.from("blacklist").select("*");
    if (client?.id) blacklistQuery = blacklistQuery.eq("client_id", client.id);
    else if (name) blacklistQuery = blacklistQuery.ilike("client_name", "%" + name + "%");
    const { data: blacklist } = await blacklistQuery;

    // Summary stats
    const allBookings = bookings || [];
    const totalSpent = (receipts || []).reduce((s: number, r: Record<string,unknown>) => s + (Number(r.total_amount) || 0), 0);
    const totalDebt = (invoices || []).filter((i: Record<string,unknown>) => i.status !== "paid").reduce((s: number, i: Record<string,unknown>) => s + (Number(i.total) || 0) - (Number(i.amount_paid) || 0), 0);
    const serviceBreakdown: Record<string, number> = {};
    allBookings.forEach((b: Record<string,unknown>) => {
      const svc = String(b.service_type || "Other");
      serviceBreakdown[svc] = (serviceBreakdown[svc] || 0) + 1;
    });

    return NextResponse.json({
      client,
      summary: {
        totalBookings: allBookings.length,
        totalSpent,
        totalDebt,
        totalInvoices: (invoices || []).length,
        totalReceipts: (receipts || []).length,
        totalSublets: (subletBookings || []).length,
        isBlacklisted: (blacklist || []).length > 0,
        serviceBreakdown,
      },
      bookings: allBookings,
      invoices: invoices || [],
      receipts: receipts || [],
      subletBookings: subletBookings || [],
      blacklist: blacklist || [],
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
