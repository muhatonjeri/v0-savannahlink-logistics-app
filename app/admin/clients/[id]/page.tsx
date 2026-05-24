"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, Phone, Mail, MapPin, Briefcase, CreditCard,
  FileText, Receipt, DollarSign, Car, Compass, Plane, Truck,
  Bus, Wrench, Package, Ship, HardHat, ShieldCheck, ShieldAlert,
  ShieldX, Calendar, TrendingUp, Clock, CheckCircle2, XCircle,
  AlertCircle, Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const serviceIcons: Record<string, React.ElementType> = {
  "car-rental": Car, "Car Rental": Car,
  "safari-tours": Compass, "Safari Tours": Compass,
  "transfers": Plane, "hotel-airport-transfers": Plane, "Transfers": Plane,
  "movers": Truck, "Movers": Truck,
  "corporate-rental": Bus, "Corporate Rental": Bus,
  "road-recovery": Wrench, "Road Recovery": Wrench,
  "cargo-handling": Package, "Cargo Handling": Package,
  "shipment-imports": Ship, "Shipment Imports": Ship,
  "construction-equipment": HardHat, "Construction Equipment": HardHat,
  "sublet": Building2,
};

const serviceColors: Record<string, string> = {
  "car-rental": "text-emerald-400 bg-emerald-500/10",
  "Car Rental": "text-emerald-400 bg-emerald-500/10",
  "safari-tours": "text-amber-400 bg-amber-500/10",
  "Safari Tours": "text-amber-400 bg-amber-500/10",
  "transfers": "text-sky-400 bg-sky-500/10",
  "Transfers": "text-sky-400 bg-sky-500/10",
  "movers": "text-violet-400 bg-violet-500/10",
  "Movers": "text-violet-400 bg-violet-500/10",
  "corporate-rental": "text-indigo-400 bg-indigo-500/10",
  "road-recovery": "text-rose-400 bg-rose-500/10",
  "cargo-handling": "text-orange-400 bg-orange-500/10",
  "shipment-imports": "text-cyan-400 bg-cyan-500/10",
  "construction-equipment": "text-yellow-400 bg-yellow-500/10",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  "in-progress": "bg-purple-500/20 text-purple-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  cancelled: "bg-red-500/20 text-red-400",
  paid: "bg-emerald-500/20 text-emerald-400",
  draft: "bg-gray-500/20 text-gray-400",
  sent: "bg-blue-500/20 text-blue-400",
  partial: "bg-amber-500/20 text-amber-400",
  overdue: "bg-red-500/20 text-red-400",
  issued: "bg-teal-500/20 text-teal-400",
};

const getRisk = (level?: string) => {
  if (level === "high" || level === "blocked") return { label: "High Risk", color: "bg-red-600 text-white", Icon: ShieldX };
  if (level === "medium") return { label: "Medium Risk", color: "bg-amber-500 text-white", Icon: ShieldAlert };
  return { label: "Low Risk", color: "bg-emerald-600 text-white", Icon: ShieldCheck };
};

const fmt = (n: number) => "KES " + n.toLocaleString();
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "-";

export default function ClientProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "bookings" | "invoices" | "receipts" | "transactions">("overview");

  useEffect(() => {
    fetch(`/api/client-profile?id=${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-gray-400 animate-pulse">Loading client profile...</div>
    </div>
  );

  if (!data) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-gray-400">Client not found</div>
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

  const tabs = [
    { key: "overview",     label: "Overview",     count: null },
    { key: "bookings",     label: "Bookings",     count: bookings.length },
    { key: "invoices",     label: "Invoices",     count: invoices.length },
    { key: "receipts",     label: "Receipts",     count: receipts.length },
    { key: "transactions", label: "Transactions", count: transactions.length },
  ];

  return (
    <div className="space-y-6">

      {/* Back + Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-gray-400 gap-2" asChild>
            <Link href="/admin/clients"><ArrowLeft className="h-4 w-4" />Back</Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{String(client?.full_name || "Unknown Client")}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={risk.color + " gap-1 text-xs"}>
                <RiskIcon className="h-3 w-3" />{risk.label}
              </Badge>
              {client?.client_type && (
                <Badge className={client.client_type === "foreigner" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"}>
                  {String(client.client_type) === "foreigner" ? "Foreign National" : "Kenyan Resident"}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700 gap-2" asChild>
          <Link href={`/admin/client-lookup?prefill=${encodeURIComponent(String(client?.full_name || ""))}`}>
            <Car className="h-4 w-4" />New Booking
          </Link>
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Bookings", value: Number(summary.totalBookings || 0), color: "text-blue-400", border: "border-blue-500/30", icon: Calendar },
          { label: "Total Spent",   value: fmt(Number(summary.totalSpent || 0)),   color: "text-emerald-400", border: "border-emerald-500/30", icon: TrendingUp },
          { label: "Outstanding",   value: fmt(Number(summary.totalDebt || 0)),    color: Number(summary.totalDebt) > 0 ? "text-red-400" : "text-emerald-400", border: Number(summary.totalDebt) > 0 ? "border-red-500/30" : "border-emerald-500/30", icon: DollarSign },
          { label: "Last Activity", value: summary.lastSeen ? fmtDate(String(summary.lastSeen)) : "None", color: "text-gray-300", border: "border-white/10", icon: Clock },
        ].map(({ label, value, color, border, icon: Icon }) => (
          <Card key={label} className={"border bg-white/5 " + border}>
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                <Icon className={"h-4 w-4 " + color} />
              </div>
              <p className={"text-xl font-bold " + color}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 pb-0">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={"px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center gap-1.5 " +
              (tab === t.key ? "bg-white/10 text-white border border-b-0 border-white/10" : "text-gray-400 hover:text-gray-300")}>
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className="text-xs bg-white/10 rounded-full px-1.5 py-0.5">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Personal Info */}
          <Card className="border-white/10 bg-white/5">
            <CardHeader className="pb-3"><CardTitle className="text-sm text-blue-400 uppercase tracking-wide flex items-center gap-2"><User className="h-4 w-4" />Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              {[
                { icon: Phone, label: "Phone", value: String(client?.phone || "-") },
                { icon: Phone, label: "Alt Phone", value: String(client?.alternative_phone || "-") },
                { icon: Mail, label: "Email", value: String(client?.email || "-") },
                { icon: MapPin, label: "Residence", value: String(client?.residence || "-") },
                { icon: Briefcase, label: "Place of Work", value: String(client?.place_of_work || "-") },
              ].map(({ icon: Icon, label, value }) => value !== "-" && (
                <div key={label} className="flex items-start gap-2">
                  <Icon className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs">{label}</p>
                    <p className="text-white">{value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Identity */}
          <Card className="border-white/10 bg-white/5">
            <CardHeader className="pb-3"><CardTitle className="text-sm text-violet-400 uppercase tracking-wide flex items-center gap-2"><CreditCard className="h-4 w-4" />Identity Documents</CardTitle></CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              {[
                { label: "ID / Passport No.", value: String(client?.id_number || "-") },
                { label: "KRA PIN", value: String(client?.kra_pin || "-") },
                { label: "Driving License", value: String(client?.driving_license_number || "-") },
              ].map(({ label, value }) => value !== "-" && (
                <div key={label}>
                  <p className="text-gray-400 text-xs">{label}</p>
                  <p className="text-white font-mono">{value}</p>
                </div>
              ))}
              {client?.notes && (
                <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                  <p className="text-amber-400 text-xs font-semibold mb-1">Notes</p>
                  <p className="text-gray-300 text-xs">{String(client.notes)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services Used */}
          {Object.keys(serviceBreakdown).length > 0 && (
            <Card className="border-white/10 bg-white/5 lg:col-span-2">
              <CardHeader className="pb-3"><CardTitle className="text-sm text-emerald-400 uppercase tracking-wide flex items-center gap-2"><TrendingUp className="h-4 w-4" />Services Used</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.entries(serviceBreakdown).map(([svc, count]) => {
                    const Icon = serviceIcons[svc] || Package;
                    const colors = serviceColors[svc] || "text-gray-400 bg-gray-500/10";
                    const [textColor, bgColor] = colors.split(" ");
                    return (
                      <div key={svc} className={"flex items-center gap-3 rounded-xl border border-white/10 p-3 " + bgColor}>
                        <Icon className={"h-5 w-5 " + textColor} />
                        <div>
                          <p className={"text-sm font-semibold " + textColor}>{count}x</p>
                          <p className="text-xs text-gray-400 capitalize">{svc.replace(/-/g, " ")}</p>
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

      {tab === "bookings" && (
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-3"><CardTitle className="text-base text-white">All Bookings ({bookings.length})</CardTitle></CardHeader>
          <CardContent>
            {bookings.length === 0 ? <p className="text-gray-500 text-sm py-6 text-center">No bookings found</p> : (
              <div className="space-y-2">
                {bookings.map((b, i) => {
                  const Icon = serviceIcons[String(b.service_type || "")] || Package;
                  const colors = serviceColors[String(b.service_type || "")] || "text-gray-400 bg-gray-500/10";
                  const [textColor, bgColor] = colors.split(" ");
                  const statusColor = statusColors[String(b.status || "")] || "bg-gray-500/20 text-gray-400";
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-4 py-3">
                      <div className={"p-2 rounded-lg " + bgColor}><Icon className={"h-4 w-4 " + textColor} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={"text-sm font-medium capitalize " + textColor}>{String(b.service_type || "").replace(/-/g, " ")}</p>
                          <Badge className={"text-xs px-1.5 py-0 " + statusColor}>{String(b.status || "")}</Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{fmtDate(String(b.created_at || ""))}{b.booking_ref ? " · " + b.booking_ref : ""}</p>
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

      {tab === "invoices" && (
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-3"><CardTitle className="text-base text-white">Invoices ({invoices.length})</CardTitle></CardHeader>
          <CardContent>
            {invoices.length === 0 ? <p className="text-gray-500 text-sm py-6 text-center">No invoices found</p> : (
              <div className="space-y-2">
                {invoices.map((inv, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-4 py-3">
                    <FileText className="h-5 w-5 text-orange-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono text-white">{String(inv.invoice_number || "")}</p>
                        <Badge className={"text-xs px-1.5 py-0 " + (statusColors[String(inv.status || "")] || "bg-gray-500/20 text-gray-400")}>{String(inv.status || "")}</Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{String(inv.service_type || "")} · Due: {fmtDate(String(inv.due_date || ""))}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white font-semibold text-sm">{fmt(Number(inv.total || 0))}</p>
                      {Number(inv.amount_paid) > 0 && <p className="text-xs text-gray-400">Paid: {fmt(Number(inv.amount_paid))}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "receipts" && (
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-3"><CardTitle className="text-base text-white">Receipts ({receipts.length})</CardTitle></CardHeader>
          <CardContent>
            {receipts.length === 0 ? <p className="text-gray-500 text-sm py-6 text-center">No receipts found</p> : (
              <div className="space-y-2">
                {receipts.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-4 py-3">
                    <Receipt className="h-5 w-5 text-teal-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono text-white">{String(r.receipt_number || "")}</p>
                        <Badge className="bg-teal-500/20 text-teal-400 text-xs px-1.5 py-0">{String(r.payment_method || "")}</Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{String(r.service_type || "")} · {fmtDate(String(r.issued_at || r.created_at || ""))}</p>
                    </div>
                    <p className="text-emerald-400 font-semibold text-sm shrink-0">{fmt(Number(r.total_amount || 0))}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "transactions" && (
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-3"><CardTitle className="text-base text-white">Transactions ({transactions.length})</CardTitle></CardHeader>
          <CardContent>
            {transactions.length === 0 ? <p className="text-gray-500 text-sm py-6 text-center">No transactions found</p> : (
              <div className="space-y-2">
                {transactions.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-4 py-3">
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
