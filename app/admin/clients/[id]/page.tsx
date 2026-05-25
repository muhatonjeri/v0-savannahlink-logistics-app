"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, Phone, Mail, MapPin, Briefcase, CreditCard,
  FileText, Receipt, DollarSign, Car, Compass, Plane, Truck,
  Bus, Wrench, Package, Ship, HardHat, ShieldCheck, ShieldAlert,
  ShieldX, Calendar, TrendingUp, Clock, CheckCircle2, XCircle,
  AlertCircle, Building2, Loader2, Activity, Edit, Printer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const serviceIcons: Record<string, React.ElementType> = {
  "car-rental": Car, "Car Rental": Car,
  "safari-tours": Compass, "Safari Tours": Compass,
  "transfers": Plane, "hotel-airport-transfers": Plane,
  "movers": Truck, "Movers": Truck,
  "corporate-rental": Bus, "Corporate Rental": Bus,
  "road-recovery": Wrench, "Road Recovery": Wrench,
  "cargo-handling": Package, "Cargo Handling": Package,
  "shipment-imports": Ship, "Shipment Imports": Ship,
  "construction-equipment": HardHat, "Construction Equipment": HardHat,
  "sublet": Building2,
};

const serviceColors: Record<string, string> = {
  "car-rental": "text-emerald-400", "safari-tours": "text-amber-400",
  "transfers": "text-sky-400", "hotel-airport-transfers": "text-sky-400",
  "movers": "text-violet-400", "corporate-rental": "text-indigo-400",
  "road-recovery": "text-rose-400", "cargo-handling": "text-orange-400",
  "shipment-imports": "text-cyan-400", "construction-equipment": "text-yellow-400",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "in-progress": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  partial: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  overdue: "bg-red-500/20 text-red-400 border-red-500/30",
  issued: "bg-teal-500/20 text-teal-400 border-teal-500/30",
};

const getRisk = (level?: string) => {
  if (level === "high" || level === "blocked") return { label: "High Risk", color: "bg-red-600 text-white", Icon: ShieldX };
  if (level === "medium") return { label: "Medium Risk", color: "bg-amber-500 text-white", Icon: ShieldAlert };
  return { label: "Low Risk", color: "bg-emerald-600 text-white", Icon: ShieldCheck };
};

const fmt = (n: number) => "KES " + n.toLocaleString();
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "-";
const fmtDateTime = (d: string) => d ? new Date(d).toLocaleString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

export default function ClientProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "timeline" | "bookings" | "invoices" | "receipts" | "transactions">("overview");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/client-profile?id=${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load client profile"); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#e67e22]" />
        <p className="text-gray-400 text-sm">Loading client profile...</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="flex h-[60vh] items-center justify-center flex-col gap-4">
      <AlertCircle className="h-10 w-10 text-red-400" />
      <p className="text-gray-400">{error || "Client not found"}</p>
      <Button asChild variant="outline"><Link href="/admin/clients"><ArrowLeft className="h-4 w-4 mr-2" />Back to Clients</Link></Button>
    </div>
  );

  const client = data.client as Record<string, unknown> | null;
  const summary = data.summary as Record<string, unknown>;
  const bookings = (data.bookings as Record<string, unknown>[]) || [];
  const invoices = (data.invoices as Record<string, unknown>[]) || [];
  const receipts = (data.receipts as Record<string, unknown>[]) || [];
  const transactions = (data.transactions as Record<string, unknown>[]) || [];
  const risk = getRisk(String(client?.risk_level || "low"));
  const RiskIcon = risk.Icon;
  const serviceBreakdown = summary.serviceBreakdown as Record<string, number> || {};

  // Build unified timeline from all activity
  const timeline = [
    ...bookings.map(b => ({ type: "booking", date: String(b.created_at || ""), data: b, icon: serviceIcons[String(b.service_type || "")] || Package, color: serviceColors[String(b.service_type || "")] || "text-gray-400" })),
    ...invoices.map(i => ({ type: "invoice", date: String(i.created_at || ""), data: i, icon: FileText, color: "text-orange-400" })),
    ...receipts.map(r => ({ type: "receipt", date: String(r.created_at || r.issued_at || ""), data: r, icon: Receipt, color: "text-teal-400" })),
    ...transactions.map(t => ({ type: "transaction", date: String(t.date || t.created_at || ""), data: t, icon: DollarSign, color: t.type === "income" ? "text-emerald-400" : "text-red-400" })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const TABS = [
    { key: "overview",     label: "Overview",     count: null },
    { key: "timeline",     label: "Timeline",     count: timeline.length },
    { key: "bookings",     label: "Bookings",     count: bookings.length },
    { key: "invoices",     label: "Invoices",     count: invoices.length },
    { key: "receipts",     label: "Receipts",     count: receipts.length },
    { key: "transactions", label: "Transactions", count: transactions.length },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-gray-400 gap-2" asChild>
            <Link href="/admin/clients"><ArrowLeft className="h-4 w-4" />Back</Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{String(client?.full_name || "Unknown Client")}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className={risk.color + " gap-1 text-xs"}>
                <RiskIcon className="h-3 w-3" />{risk.label}
              </Badge>
              {client?.client_type && (
                <Badge className={client.client_type === "foreigner" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"}>
                  {String(client.client_type) === "foreigner" ? "Foreign National" : "Kenyan Resident"}
                </Badge>
              )}
              {client?.phone && (
                <a href={`tel:${client.phone}`} className="text-gray-400 hover:text-white text-xs flex items-center gap-1 transition-colors">
                  <Phone className="h-3 w-3" />{String(client.phone)}
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/20 text-gray-300 gap-2" asChild>
            <Link href={`/admin/clients`}><Edit className="h-4 w-4" />Edit</Link>
          </Button>
          <Button className="bg-[#e67e22] hover:bg-[#d35400] gap-2" asChild>
            <Link href={`/admin/client-lookup?prefill=${encodeURIComponent(String(client?.full_name || ""))}`}>
              <Car className="h-4 w-4" />New Booking
            </Link>
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Bookings", value: Number(summary.totalBookings || 0), color: "text-blue-400",    border: "border-blue-500/30",    bg: "from-blue-500/10",    icon: Calendar  },
          { label: "Total Spent",    value: fmt(Number(summary.totalSpent || 0)), color: "text-emerald-400", border: "border-emerald-500/30", bg: "from-emerald-500/10", icon: TrendingUp },
          { label: "Outstanding",    value: fmt(Number(summary.totalDebt || 0)),  color: Number(summary.totalDebt) > 0 ? "text-red-400" : "text-emerald-400", border: Number(summary.totalDebt) > 0 ? "border-red-500/30" : "border-emerald-500/30", bg: Number(summary.totalDebt) > 0 ? "from-red-500/10" : "from-emerald-500/10", icon: DollarSign },
          { label: "Last Activity",  value: summary.lastSeen ? fmtDate(String(summary.lastSeen)) : "None", color: "text-gray-300", border: "border-white/10", bg: "from-white/5", icon: Clock },
        ].map(({ label, value, color, border, bg, icon: Icon }) => (
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

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-white/10 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={"px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap " +
              (tab === t.key ? "bg-white/10 text-white border border-b-0 border-white/10" : "text-gray-400 hover:text-gray-300")}>
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className="text-xs bg-white/10 rounded-full px-1.5 py-0.5">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-white/10 bg-white/5">
            <CardHeader className="pb-3"><CardTitle className="text-sm text-blue-400 uppercase tracking-wide flex items-center gap-2"><User className="h-4 w-4" />Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { icon: Phone, label: "Phone", value: String(client?.phone || "-") },
                { icon: Phone, label: "Alt Phone", value: String(client?.alternative_phone || "-") },
                { icon: Mail, label: "Email", value: String(client?.email || "-") },
                { icon: MapPin, label: "Residence", value: String(client?.residence || "-") },
                { icon: Briefcase, label: "Place of Work", value: String(client?.place_of_work || "-") },
              ].filter(f => f.value !== "-").map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                  <div><p className="text-gray-400 text-xs">{label}</p><p className="text-white">{value}</p></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5">
            <CardHeader className="pb-3"><CardTitle className="text-sm text-violet-400 uppercase tracking-wide flex items-center gap-2"><CreditCard className="h-4 w-4" />Identity Documents</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: "ID / Passport No.", value: String(client?.id_number || "-") },
                { label: "KRA PIN",           value: String(client?.kra_pin || "-") },
                { label: "Driving License",   value: String(client?.driving_license_number || "-") },
              ].filter(f => f.value !== "-").map(({ label, value }) => (
                <div key={label}>
                  <p className="text-gray-400 text-xs">{label}</p>
                  <p className="text-white font-mono">{value}</p>
                </div>
              ))}
              {client?.notes && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                  <p className="text-amber-400 text-xs font-semibold mb-1">Notes</p>
                  <p className="text-gray-300 text-xs">{String(client.notes)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {Object.keys(serviceBreakdown).length > 0 && (
            <Card className="border-white/10 bg-white/5 lg:col-span-2">
              <CardHeader className="pb-3"><CardTitle className="text-sm text-emerald-400 uppercase tracking-wide flex items-center gap-2"><TrendingUp className="h-4 w-4" />Services Used</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {Object.entries(serviceBreakdown).map(([svc, count]) => {
                    const Icon = serviceIcons[svc] || Package;
                    const color = serviceColors[svc] || "text-gray-400";
                    return (
                      <div key={svc} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                        <Icon className={"h-5 w-5 shrink-0 " + color} />
                        <div>
                          <p className={"text-sm font-bold " + color}>{count}×</p>
                          <p className="text-xs text-gray-400 capitalize leading-tight">{svc.replace(/-/g, " ")}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── TIMELINE ── */}
      {tab === "timeline" && (
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#e67e22]" />Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No activity recorded yet</p>
            ) : (
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />
                <div className="space-y-0">
                  {timeline.map((item, i) => {
                    const Icon = item.icon;
                    let title = "";
                    let subtitle = "";
                    let amount = "";
                    let status = "";

                    if (item.type === "booking") {
                      title = `${String(item.data.service_type || "").replace(/-/g," ")} Booking`;
                      subtitle = String(item.data.customer_name || "");
                      amount = fmt(Number(item.data.total_amount || 0));
                      status = String(item.data.status || "");
                    } else if (item.type === "invoice") {
                      title = `Invoice ${String(item.data.invoice_number || "")}`;
                      subtitle = String(item.data.service_type || "");
                      amount = fmt(Number(item.data.total || 0));
                      status = String(item.data.status || "");
                    } else if (item.type === "receipt") {
                      title = `Receipt ${String(item.data.receipt_number || "")}`;
                      subtitle = String(item.data.service_type || "");
                      amount = fmt(Number(item.data.total_amount || 0));
                      status = "issued";
                    } else if (item.type === "transaction") {
                      title = String(item.data.description || "Transaction");
                      subtitle = String(item.data.category || "");
                      amount = (item.data.type === "income" ? "+" : "-") + fmt(Number(item.data.amount || 0));
                      status = String(item.data.status || "completed");
                    }

                    return (
                      <div key={i} className="flex gap-4 pb-5 relative group">
                        {/* Dot */}
                        <div className={"relative z-10 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border border-white/20 bg-[#0a1628] transition-all group-hover:scale-110 group-hover:border-[#e67e22]/50"}>
                          <Icon className={"h-3.5 w-3.5 " + item.color} />
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <p className="text-white text-sm font-medium capitalize">{title}</p>
                              {subtitle && <p className="text-gray-400 text-xs capitalize">{subtitle}</p>}
                            </div>
                            <div className="text-right shrink-0">
                              {amount && <p className={"font-semibold text-sm " + (item.type === "transaction" && item.data.type === "expense" ? "text-red-400" : "text-emerald-400")}>{amount}</p>}
                              {status && <Badge className={"text-[10px] border " + (statusColors[status] || "bg-gray-500/20 text-gray-400")}>{status}</Badge>}
                            </div>
                          </div>
                          <p className="text-gray-600 text-xs mt-1">{fmtDateTime(item.date)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── BOOKINGS ── */}
      {tab === "bookings" && (
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-3"><CardTitle className="text-base text-white">All Bookings ({bookings.length})</CardTitle></CardHeader>
          <CardContent>
            {bookings.length === 0 ? <p className="text-gray-500 text-sm py-8 text-center">No bookings found</p> : (
              <div className="space-y-2">
                {bookings.map((b, i) => {
                  const Icon = serviceIcons[String(b.service_type || "")] || Package;
                  const color = serviceColors[String(b.service_type || "")] || "text-gray-400";
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors">
                      <Icon className={"h-5 w-5 shrink-0 " + color} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={"text-sm font-medium capitalize " + color}>{String(b.service_type || "").replace(/-/g, " ")}</p>
                          <Badge className={"text-xs border " + (statusColors[String(b.status || "")] || "bg-gray-500/20 text-gray-400")}>{String(b.status || "")}</Badge>
                          {b.booking_ref && <span className="text-[10px] font-mono text-[#e67e22]">{String(b.booking_ref)}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{fmtDate(String(b.created_at || ""))}</p>
                      </div>
                      <p className="text-emerald-400 font-semibold text-sm shrink-0">{fmt(Number(b.total_amount || 0))}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── INVOICES ── */}
      {tab === "invoices" && (
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-3"><CardTitle className="text-base text-white">Invoices ({invoices.length})</CardTitle></CardHeader>
          <CardContent>
            {invoices.length === 0 ? <p className="text-gray-500 text-sm py-8 text-center">No invoices found</p> : (
              <div className="space-y-2">
                {invoices.map((inv, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                    <FileText className="h-5 w-5 text-orange-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-mono text-white">{String(inv.invoice_number || "")}</p>
                        <Badge className={"text-xs border " + (statusColors[String(inv.status || "")] || "bg-gray-500/20 text-gray-400")}>{String(inv.status || "")}</Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Due: {fmtDate(String(inv.due_date || ""))}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white font-semibold text-sm">{fmt(Number(inv.total || 0))}</p>
                      {Number(inv.amount_paid) > 0 && <p className="text-xs text-emerald-400">Paid: {fmt(Number(inv.amount_paid))}</p>}
                      {Number(inv.total || 0) - Number(inv.amount_paid || 0) > 0 && (
                        <p className="text-xs text-red-400">Bal: {fmt(Number(inv.total||0)-Number(inv.amount_paid||0))}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── RECEIPTS ── */}
      {tab === "receipts" && (
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-3"><CardTitle className="text-base text-white">Receipts ({receipts.length})</CardTitle></CardHeader>
          <CardContent>
            {receipts.length === 0 ? <p className="text-gray-500 text-sm py-8 text-center">No receipts found</p> : (
              <div className="space-y-2">
                {receipts.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-teal-500/20 bg-teal-500/5 px-4 py-3">
                    <Receipt className="h-5 w-5 text-teal-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-white">{String(r.receipt_number || "")}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{String(r.service_type || "")} · {fmtDate(String(r.issued_at || r.created_at || ""))}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-emerald-400 font-semibold text-sm">{fmt(Number(r.total_amount || 0))}</p>
                      <p className="text-xs text-gray-400 capitalize">{String(r.payment_method || "")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── TRANSACTIONS ── */}
      {tab === "transactions" && (
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-3"><CardTitle className="text-base text-white">Transactions ({transactions.length})</CardTitle></CardHeader>
          <CardContent>
            {transactions.length === 0 ? <p className="text-gray-500 text-sm py-8 text-center">No transactions found</p> : (
              <div className="space-y-2">
                {transactions.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                    <div className={"p-2 rounded-lg " + (String(t.type) === "income" ? "bg-emerald-500/10" : "bg-red-500/10")}>
                      <DollarSign className={"h-4 w-4 " + (String(t.type) === "income" ? "text-emerald-400" : "text-red-400")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{String(t.description || "")}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{String(t.category || "")} · {String(t.date || "")}</p>
                    </div>
                    <p className={"font-semibold text-sm shrink-0 " + (String(t.type) === "income" ? "text-emerald-400" : "text-red-400")}>
                      {String(t.type) === "income" ? "+" : "-"}{fmt(Number(t.amount || 0))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
