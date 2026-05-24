import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sb = createAdminClient();
    const today = new Date().toISOString().split("T")[0];
    const soon = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];

    const [invoices, fleetOut, subletBookings] = await Promise.all([
      sb.from("invoices").select("id,invoice_number,customer_name,total,amount_paid,due_date,status").neq("status", "paid").lt("due_date", today).limit(10),
      sb.from("fleet_out").select("id,vehicle_reg,receiver_name,end_date,status").eq("status", "active").lte("end_date", soon).limit(10),
      sb.from("sublet_bookings").select("id,client_name,end_date,status,amount_paid,total_client_charge").eq("status", "active").lte("end_date", soon).limit(10),
    ]);

    const alerts: { type: string; severity: "critical"|"warning"|"info"; message: string; href: string }[] = [];

    (invoices.data || []).forEach(inv => {
      const balance = Number(inv.total || 0) - Number(inv.amount_paid || 0);
      alerts.push({ type: "invoice", severity: "critical", message: `Invoice ${inv.invoice_number} — ${inv.customer_name} owes KES ${balance.toLocaleString()} (overdue)`, href: "/admin/invoices" });
    });

    (fleetOut.data || []).forEach(f => {
      const diff = Math.ceil((new Date(f.end_date).getTime() - Date.now()) / 86400000);
      alerts.push({ type: "fleet", severity: diff < 0 ? "critical" : "warning", message: `${f.vehicle_reg} (${f.receiver_name}) ${diff < 0 ? `overdue by ${Math.abs(diff)} days` : `due back in ${diff} day(s)`}`, href: "/admin/fleet?tab=fleet-out" });
    });

    (subletBookings.data || []).forEach(b => {
      const diff = Math.ceil((new Date(b.end_date).getTime() - Date.now()) / 86400000);
      const balance = Number(b.total_client_charge || 0) - Number(b.amount_paid || 0);
      if (diff <= 0) alerts.push({ type: "sublet", severity: "critical", message: `Sublet booking for ${b.client_name} ${diff < 0 ? `overdue by ${Math.abs(diff)} days` : "ends today"}`, href: "/admin/fleet?tab=sublets" });
      if (balance > 0 && diff <= 1) alerts.push({ type: "payment", severity: "warning", message: `${b.client_name} has KES ${balance.toLocaleString()} sublet balance due`, href: "/admin/fleet?tab=sublets" });
    });

    return NextResponse.json({ alerts, count: alerts.length });
  } catch (e) { return NextResponse.json({ error: String(e), alerts: [], count: 0 }, { status: 500 }); }
}
