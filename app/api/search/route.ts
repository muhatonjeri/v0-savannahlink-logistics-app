import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb = createAdminClient();
    const q = new URL(req.url).searchParams.get("q");
    if (!q || q.length < 2) return NextResponse.json({ results: [] });

    const like = `%${q}%`;

    const [clients, bookings, invoices, receipts, blacklist] = await Promise.all([
      sb.from("clients").select("id,full_name,phone,email").ilike("full_name", like).limit(5),
      sb.from("bookings").select("id,customer_name,service_type,status,total_amount").ilike("customer_name", like).limit(5),
      sb.from("invoices").select("id,invoice_number,customer_name,total,status").or(`invoice_number.ilike.${like},customer_name.ilike.${like}`).limit(5),
      sb.from("receipts").select("id,receipt_number,customer_name,total_amount").or(`receipt_number.ilike.${like},customer_name.ilike.${like}`).limit(5),
      sb.from("blacklist").select("id,client_name,phone,record_type,severity").ilike("client_name", like).limit(3),
    ]);

    const results: { type: string; label: string; sub: string; href: string; flag?: string }[] = [];
    (clients.data || []).forEach(c => results.push({ type: "client",   label: c.full_name,       sub: c.phone || c.email || "",                                                         href: `/admin/clients/${c.id}` }));
    (bookings.data || []).forEach(b => results.push({ type: "booking", label: b.customer_name,   sub: `${b.service_type} · ${b.status}`,                                               href: `/admin/${b.service_type}` }));
    (invoices.data || []).forEach(i => results.push({ type: "invoice", label: i.invoice_number,  sub: `${i.customer_name} · KES ${Number(i.total||0).toLocaleString()}`,               href: "/admin/invoices" }));
    (receipts.data || []).forEach(r => results.push({ type: "receipt", label: r.receipt_number,  sub: `${r.customer_name} · KES ${Number(r.total_amount||0).toLocaleString()}`,        href: "/admin/receipts" }));
    (blacklist.data || []).forEach(b => results.push({ type: "blacklist", label: b.client_name, sub: `${b.record_type} · ${b.severity}`, href: "/admin/blacklist", flag: "blacklisted" }));

    return NextResponse.json({ results });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
