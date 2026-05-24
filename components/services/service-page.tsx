"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus, Search, Eye, Pencil, Printer, Trash2, Filter,
  TrendingUp, DollarSign, Calendar, Users, CheckCircle2,
  Clock, XCircle, ChevronDown, ChevronUp, Loader2,
  FileText, Phone, Mail, CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import type { ServiceInfo } from "@/lib/service-data";

// ── Types ─────────────────────────────────────────────────────────
interface Booking {
  id: string;
  serviceType: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  paymentStatus: "pending" | "partial" | "completed";
  paymentMethod: string;
  totalAmount: number;
  amountPaid: number;
  bookingDate: string;
  notes: string;
  formData: Record<string, string>;
  createdAt: string;
}

const STATUS_CFG = {
  pending:     { label: "Pending",     color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",   dot: "bg-yellow-400" },
  confirmed:   { label: "Confirmed",   color: "bg-blue-500/20 text-blue-300 border-blue-500/30",         dot: "bg-blue-400" },
  "in-progress":{ label: "In Progress",color: "bg-purple-500/20 text-purple-300 border-purple-500/30",   dot: "bg-purple-400" },
  completed:   { label: "Completed",   color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",dot: "bg-emerald-400" },
  cancelled:   { label: "Cancelled",   color: "bg-red-500/20 text-red-300 border-red-500/30",            dot: "bg-red-400" },
};

const PAYMENT_CFG = {
  pending:   "bg-red-500/20 text-red-300",
  partial:   "bg-amber-500/20 text-amber-300",
  completed: "bg-emerald-500/20 text-emerald-300",
};

const fmt = (n: number) => "KES " + n.toLocaleString();
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "-";

// ── Props ─────────────────────────────────────────────────────────
interface ServicePageProps {
  service: ServiceInfo;
  accentColor?: string;
}

function ServicePageInner({ service, accentColor = "blue" }: ServicePageProps) {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandFaq, setExpandFaq] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState<Record<string, string>>({
    customerName: "", customerPhone: "", customerEmail: "",
    totalAmount: "", paymentMethod: "mpesa", amountPaid: "",
    status: "pending", notes: "",
  });

  const loadBookings = async () => {
    try {
      const res = await fetch(`/api/bookings?service=${service.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data.map((b: Record<string, unknown>) => ({
          id: String(b.id || ""),
          serviceType: String(b.service_type || service.id),
          customerName: String(b.customer_name || ""),
          customerPhone: String(b.customer_phone || ""),
          customerEmail: String(b.customer_email || ""),
          status: String(b.status || "pending") as Booking["status"],
          paymentStatus: String(b.payment_status || "pending") as Booking["paymentStatus"],
          paymentMethod: String(b.payment_method || ""),
          totalAmount: Number(b.total_amount || 0),
          amountPaid: Number(b.amount_paid || 0),
          bookingDate: String(b.booking_date || b.created_at || ""),
          notes: String(b.notes || ""),
          formData: (b.form_data as Record<string, string>) || {},
          createdAt: String(b.created_at || ""),
        })));
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { loadBookings(); }, [service.id]);

  // Prefill client data from Client Lookup
  useEffect(() => {
    const prefill = searchParams.get("prefill");
    if (prefill) {
      try {
        const data = JSON.parse(decodeURIComponent(prefill));
        if (data.customerName || data.customerPhone) {
          setForm(f => ({
            ...f,
            customerName: data.customerName || f.customerName,
            customerPhone: data.customerPhone || f.customerPhone,
            customerEmail: data.customerEmail || f.customerEmail,
          }));
          setShowForm(true); // Auto-open the booking form
        }
      } catch {}
    }
  }, [searchParams]);

  const handleSave = async () => {
    if (!form.customerName || !form.customerPhone) {
      toast.error("Customer name and phone are required"); return;
    }
    setSaving(true);
    try {
      const formData: Record<string, string> = {};
      service.formFields.forEach(f => { if (form[f.id]) formData[f.id] = form[f.id]; });

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_type: service.id,
          customer_name: form.customerName,
          customer_phone: form.customerPhone,
          customer_email: form.customerEmail,
          status: form.status || "pending",
          payment_status: Number(form.amountPaid || 0) >= Number(form.totalAmount || 1) ? "completed" : Number(form.amountPaid || 0) > 0 ? "partial" : "pending",
          payment_method: form.paymentMethod,
          total_amount: Number(form.totalAmount || 0),
          amount_paid: Number(form.amountPaid || 0),
          booking_date: new Date().toISOString().split("T")[0],
          notes: form.notes,
          form_data: formData,
        }),
      });
      if (res.ok) {
        toast.success("Booking saved successfully");
        // Auto-sync to accounts if payment received
        if (Number(form.amountPaid) > 0) {
          fetch("/api/transactions", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: new Date().toISOString().split("T")[0],
              type: "income", category: service.title,
              description: `${service.title} — ${form.customerName}`,
              amount: Number(form.amountPaid), payment_method: form.paymentMethod,
              customer_name: form.customerName, status: "completed",
            }),
          }).catch(e => console.error("Accounts sync:", e));
        }
        setShowForm(false);
        setForm({ customerName: "", customerPhone: "", customerEmail: "", totalAmount: "", paymentMethod: "mpesa", amountPaid: "", status: "pending", notes: "" });
        loadBookings();
      } else {
        const d = await res.json();
        toast.error(d.error || "Save failed");
      }
    } catch (e) { toast.error(String(e)); } finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!editBooking) return;
    setSaving(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editBooking.id,
          status: editBooking.status,
          payment_status: editBooking.amountPaid >= editBooking.totalAmount && editBooking.totalAmount > 0 ? "completed" : editBooking.amountPaid > 0 ? "partial" : "pending",
          amount_paid: editBooking.amountPaid,
          total_amount: editBooking.totalAmount,
          notes: editBooking.notes,
        }),
      });
      if (res.ok) { toast.success("Booking updated"); setEditBooking(null); loadBookings(); }
    } catch (e) { toast.error(String(e)); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this booking? This cannot be undone.")) return;
    try {
      await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
      toast.success("Booking deleted");
      loadBookings();
    } catch (e) { toast.error(String(e)); }
  };

  const printBooking = (b: Booking) => {
    const win = window.open("", "_blank");
    if (!win) return;
    const details = Object.entries(b.formData).map(([k, v]) =>
      `<tr><td style="color:#888;padding:6px 0;font-size:12px;width:180px">${k}</td><td style="color:#111;font-size:12px">${v}</td></tr>`
    ).join("");
    win.document.write(`<html><head><title>Booking — ${b.customerName}</title>
      <style>body{font-family:Arial;padding:32px;max-width:640px;margin:0 auto;color:#111}
      h1{color:#0a1628;font-size:18px;margin:0}h2{color:#e67e22;font-size:13px}
      .badge{display:inline-block;padding:3px 12px;border-radius:99px;font-size:11px;font-weight:600;background:#0a1628;color:#fff}
      table{width:100%;border-collapse:collapse}td{vertical-align:top}
      .section{background:#f8f9ff;border-left:3px solid #0a1628;padding:12px 16px;margin:12px 0;border-radius:0 6px 6px 0}
      .footer{color:#aaa;font-size:11px;border-top:1px solid #eee;padding-top:12px;margin-top:20px}
      </style></head><body>
      <img src="/images/logo.png" style="width:55px;height:55px;border-radius:50%;float:right" />
      <h1>Moventra Safaris & Logistics Ltd</h1>
      <h2>${service.title} — Booking Record</h2>
      <div class="section"><table>
        <tr><td style="color:#888;font-size:12px;width:180px">Customer</td><td style="font-size:13px;font-weight:600">${b.customerName}</td></tr>
        <tr><td style="color:#888;font-size:12px">Phone</td><td style="font-size:12px">${b.customerPhone}</td></tr>
        ${b.customerEmail ? `<tr><td style="color:#888;font-size:12px">Email</td><td style="font-size:12px">${b.customerEmail}</td></tr>` : ""}
        <tr><td style="color:#888;font-size:12px">Status</td><td><span class="badge">${b.status.toUpperCase()}</span></td></tr>
        <tr><td style="color:#888;font-size:12px">Total Amount</td><td style="font-size:13px;font-weight:600">KES ${b.totalAmount.toLocaleString()}</td></tr>
        <tr><td style="color:#888;font-size:12px">Amount Paid</td><td style="font-size:12px">KES ${b.amountPaid.toLocaleString()}</td></tr>
        <tr><td style="color:#888;font-size:12px">Payment Method</td><td style="font-size:12px">${b.paymentMethod}</td></tr>
        <tr><td style="color:#888;font-size:12px">Date</td><td style="font-size:12px">${fmtDate(b.createdAt)}</td></tr>
      </table></div>
      ${details ? `<div class="section"><p style="font-weight:700;font-size:11px;color:#0a1628;text-transform:uppercase;margin:0 0 8px">Service Details</p><table>${details}</table></div>` : ""}
      ${b.notes ? `<div class="section"><p style="font-weight:700;font-size:11px;color:#0a1628;text-transform:uppercase;margin:0 0 6px">Notes</p><p style="font-size:12px;margin:0">${b.notes}</p></div>` : ""}
      <div class="footer">Printed: ${new Date().toLocaleString()} | Moventra Safaris & Logistics Ltd | +254 727 247 032</div>
      <script>window.onload=function(){window.print()}<\/script></body></html>`);
    win.document.close();
  };

  const filtered = bookings.filter(b => {
    const matchSearch = !search ||
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.customerPhone.includes(search);
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = bookings.reduce((s, b) => s + b.amountPaid, 0);
  const outstanding  = bookings.reduce((s, b) => s + (b.totalAmount - b.amountPaid), 0);
  const activeCount  = bookings.filter(b => ["pending","confirmed","in-progress"].includes(b.status)).length;

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><Label className="text-gray-300 text-xs mb-1 block">{label}</Label>{children}</div>
  );

  const SelectField = ({ id, label, options, required }: { id: string; label: string; options: string[]; required?: boolean }) => (
    <Field label={label + (required ? " *" : "")}>
      <select className="w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm"
        value={form[id] || ""} onChange={e => setForm({ ...form, [id]: e.target.value })}>
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  );

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">{service.icon}</span>{service.title}
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">{service.tagline}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            className="gap-2 bg-[#e67e22] hover:bg-[#d35400] text-white"
            onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />New Booking
          </Button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Bookings", value: bookings.length,     icon: Users,      color: "text-blue-400",    border: "border-blue-500/30",    bg: "from-blue-500/10" },
          { label: "Active",         value: activeCount,          icon: Clock,      color: "text-amber-400",   border: "border-amber-500/30",   bg: "from-amber-500/10" },
          { label: "Revenue",        value: fmt(totalRevenue),    icon: TrendingUp, color: "text-emerald-400", border: "border-emerald-500/30", bg: "from-emerald-500/10" },
          { label: "Outstanding",    value: fmt(outstanding),     icon: DollarSign, color: outstanding > 0 ? "text-red-400" : "text-emerald-400", border: outstanding > 0 ? "border-red-500/30" : "border-emerald-500/30", bg: outstanding > 0 ? "from-red-500/10" : "from-emerald-500/10" },
        ].map(({ label, value, icon: Icon, color, border, bg }) => (
          <Card key={label} className={"border bg-gradient-to-br to-transparent " + border + " " + bg}>
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                <Icon className={"h-4 w-4 " + color} />
              </div>
              <p className={"text-xl font-bold " + color}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Packages Info ── */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-300 uppercase tracking-wide">Service Packages & Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
            {service.packages.map(pkg => (
              <div key={pkg.id} className={"relative rounded-xl border p-3 " + (pkg.popular ? "border-[#e67e22]/50 bg-[#e67e22]/5" : "border-white/10 bg-white/5")}>
                {pkg.popular && <span className="absolute -top-2 right-3 bg-[#e67e22] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">POPULAR</span>}
                <p className="text-white font-semibold text-sm">{pkg.name}</p>
                <p className="text-gray-400 text-xs mt-0.5 mb-2">{pkg.description}</p>
                <p className="text-[#e67e22] font-bold text-base">{fmt(pkg.price)}<span className="text-gray-400 text-xs font-normal"> {pkg.unit}</span></p>
                <div className="mt-2 space-y-0.5">
                  {pkg.features.map(f => (
                    <p key={f} className="text-gray-400 text-xs flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />{f}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Search & Filter ── */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-9 bg-white/5 border-white/10 text-white" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="rounded-lg bg-white/5 border border-white/10 text-white px-3 py-2 text-sm"
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* ── Bookings Table ── */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">{service.title} Bookings ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl">{service.icon}</span>
              <p className="text-gray-400 mt-3">{search || statusFilter !== "all" ? "No matching bookings" : "No bookings yet"}</p>
              {!search && statusFilter === "all" && (
                <Button className="mt-4 bg-[#e67e22] hover:bg-[#d35400]" onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />Create First Booking
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(b => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <p className="text-white font-medium text-sm">{b.customerName}</p>
                      <p className="text-gray-400 text-xs">{b.customerPhone}</p>
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm">{fmtDate(b.bookingDate || b.createdAt)}</TableCell>
                    <TableCell className="text-white font-semibold text-sm">{fmt(b.totalAmount)}</TableCell>
                    <TableCell className="text-emerald-400 font-semibold text-sm">{fmt(b.amountPaid)}</TableCell>
                    <TableCell className="text-gray-300 text-sm capitalize">{b.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge className={"border text-xs gap-1 " + (STATUS_CFG[b.status]?.color || "bg-gray-500/20 text-gray-300")}>
                        <span className={"w-1.5 h-1.5 rounded-full " + (STATUS_CFG[b.status]?.dot || "bg-gray-400")} />
                        {STATUS_CFG[b.status]?.label || b.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={"text-xs " + (PAYMENT_CFG[b.paymentStatus] || "bg-gray-500/20 text-gray-300")}>
                        {b.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setViewBooking(b)} title="View"><Eye className="h-4 w-4 text-gray-400" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditBooking({ ...b })} title="Edit"><Pencil className="h-4 w-4 text-amber-400" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => printBooking(b)} title="Print"><Printer className="h-4 w-4 text-teal-400" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)} title="Delete"><Trash2 className="h-4 w-4 text-red-400" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── FAQs ── */}
      {service.faqs.length > 0 && (
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300 uppercase tracking-wide">FAQs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {service.faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/10 overflow-hidden">
                <button className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors"
                  onClick={() => setExpandFaq(expandFaq === i ? null : i)}>
                  <p className="text-white text-sm font-medium">{faq.q}</p>
                  {expandFaq === i ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                </button>
                {expandFaq === i && (
                  <div className="px-4 pb-3 border-t border-white/5">
                    <p className="text-gray-300 text-sm mt-2">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── New Booking Dialog ── */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#e67e22] flex items-center gap-2 text-lg">
              <span>{service.icon}</span>New {service.title} Booking
            </DialogTitle>
            <DialogDescription>{service.tagline}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Client Info */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />Client Information
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Field label="Full Name *">
                    <Input className="bg-[#0a1628] border-white/20 text-white" placeholder="Full name" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
                  </Field>
                </div>
                <Field label="Phone *">
                  <Input className="bg-[#0a1628] border-white/20 text-white" placeholder="+254 7XX XXX XXX" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} />
                </Field>
                <Field label="Email">
                  <Input type="email" className="bg-[#0a1628] border-white/20 text-white" placeholder="email@example.com" value={form.customerEmail} onChange={e => setForm({ ...form, customerEmail: e.target.value })} />
                </Field>
              </div>
            </div>

            {/* Service-specific fields */}
            <div className="rounded-xl border border-[#e67e22]/20 bg-[#e67e22]/5 p-4 space-y-3">
              <p className="text-[#e67e22] text-xs font-bold uppercase tracking-wide">Service Details</p>
              <div className="grid grid-cols-2 gap-3">
                {service.formFields.map(field => {
                  if (field.type === "select") {
                    return (
                      <div key={field.id} className={field.id.includes("notes") || field.id.includes("address") || field.id.includes("location") ? "col-span-2" : ""}>
                        <SelectField id={field.id} label={field.label} options={field.options || []} required={field.required} />
                      </div>
                    );
                  }
                  if (field.type === "textarea") {
                    return (
                      <div key={field.id} className="col-span-2">
                        <Field label={field.label + (field.required ? " *" : "")}>
                          <textarea className="w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm resize-none h-20"
                            placeholder={field.placeholder || ""} value={form[field.id] || ""}
                            onChange={e => setForm({ ...form, [field.id]: e.target.value })} />
                        </Field>
                      </div>
                    );
                  }
                  return (
                    <div key={field.id} className={field.id.includes("address") || field.id.includes("location") || field.id.includes("description") ? "col-span-2" : ""}>
                      <Field label={field.label + (field.required ? " *" : "")}>
                        <Input type={field.type} className="bg-[#0a1628] border-white/20 text-white"
                          placeholder={field.placeholder || ""}
                          value={form[field.id] || ""}
                          onChange={e => setForm({ ...form, [field.id]: e.target.value })} />
                      </Field>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5" />Payment
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Total Amount (KES)">
                  <Input type="number" className="bg-[#0a1628] border-white/20 text-white" placeholder="0" value={form.totalAmount} onChange={e => setForm({ ...form, totalAmount: e.target.value })} />
                </Field>
                <Field label="Amount Paid (KES)">
                  <Input type="number" className="bg-[#0a1628] border-white/20 text-white" placeholder="0" value={form.amountPaid} onChange={e => setForm({ ...form, amountPaid: e.target.value })} />
                </Field>
                <div>
                  <Field label="Payment Method">
                    <select className="w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm"
                      value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                      {service.paymentMethods.map(m => <option key={m.id} value={m.id}>{m.icon} {m.label}</option>)}
                    </select>
                  </Field>
                </div>
                <div>
                  <Field label="Booking Status">
                    <select className="w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm"
                      value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Notes">
                    <textarea className="w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm resize-none h-16"
                      placeholder="Any additional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                  </Field>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button className="flex-1 bg-[#e67e22] hover:bg-[#d35400]" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Booking"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── View Dialog ── */}
      <Dialog open={!!viewBooking} onOpenChange={() => setViewBooking(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {viewBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">{viewBooking.customerName}</DialogTitle>
                <DialogDescription>{service.title} Booking</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm py-2">
                <div className="flex gap-2">
                  <Badge className={"border " + (STATUS_CFG[viewBooking.status]?.color || "")}>{STATUS_CFG[viewBooking.status]?.label}</Badge>
                  <Badge className={PAYMENT_CFG[viewBooking.paymentStatus] || ""}>{viewBooking.paymentStatus}</Badge>
                </div>
                {[
                  { title: "Client", items: [["Phone", viewBooking.customerPhone], ["Email", viewBooking.customerEmail || "-"]] },
                  { title: "Payment", items: [["Total", fmt(viewBooking.totalAmount)], ["Paid", fmt(viewBooking.amountPaid)], ["Balance", fmt(viewBooking.totalAmount - viewBooking.amountPaid)], ["Method", viewBooking.paymentMethod]] },
                ].map(({ title, items }) => (
                  <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">{title}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {items.map(([k, v]) => (
                        <><span className="text-gray-400 text-xs">{k}</span><span className="text-white text-xs font-medium">{v}</span></>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(viewBooking.formData).length > 0 && (
                  <div className="rounded-xl border border-[#e67e22]/20 bg-[#e67e22]/5 p-3">
                    <p className="text-[#e67e22] text-xs font-bold uppercase mb-2">Service Details</p>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(viewBooking.formData).map(([k, v]) => (
                        <><span className="text-gray-400 text-xs capitalize">{k.replace(/([A-Z])/g, " $1")}</span><span className="text-white text-xs">{v}</span></>
                      ))}
                    </div>
                  </div>
                )}
                {viewBooking.notes && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Notes</p>
                    <p className="text-white text-xs">{viewBooking.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => printBooking(viewBooking)}><Printer className="h-4 w-4" />Print</Button>
                <Button className="flex-1 bg-amber-600 hover:bg-amber-700 gap-2" onClick={() => { setEditBooking({ ...viewBooking }); setViewBooking(null); }}><Pencil className="h-4 w-4" />Edit</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editBooking} onOpenChange={() => setEditBooking(null)}>
        <DialogContent className="max-w-md">
          {editBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="text-amber-400 flex items-center gap-2"><Pencil className="h-5 w-5" />Edit Booking — {editBooking.customerName}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-2">
                <div>
                  <Field label="Status">
                    <select className="w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm"
                      value={editBooking.status} onChange={e => setEditBooking({ ...editBooking, status: e.target.value as Booking["status"] })}>
                      {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </Field>
                </div>
                <div>
                  <Field label="Payment Method">
                    <select className="w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm"
                      value={editBooking.paymentMethod} onChange={e => setEditBooking({ ...editBooking, paymentMethod: e.target.value })}>
                      {service.paymentMethods.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Total Amount (KES)">
                  <Input type="number" className="bg-[#0a1628] border-white/20 text-white" value={editBooking.totalAmount} onChange={e => setEditBooking({ ...editBooking, totalAmount: Number(e.target.value) })} />
                </Field>
                <Field label="Amount Paid (KES)">
                  <Input type="number" className="bg-[#0a1628] border-white/20 text-white" value={editBooking.amountPaid} onChange={e => setEditBooking({ ...editBooking, amountPaid: Number(e.target.value) })} />
                </Field>
                <div className="col-span-2">
                  <Field label="Notes">
                    <textarea className="w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm resize-none h-16"
                      value={editBooking.notes} onChange={e => setEditBooking({ ...editBooking, notes: e.target.value })} />
                  </Field>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditBooking(null)}>Cancel</Button>
                <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleUpdate} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ServicePage(props: ServicePageProps) {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center text-gray-400 animate-pulse">Loading...</div>}>
      <ServicePageInner {...props} />
    </Suspense>
  );
}
