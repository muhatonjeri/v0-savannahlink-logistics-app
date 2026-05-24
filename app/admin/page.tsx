"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Car, Compass, Plane, Truck, Bus, Wrench, Package, Ship, HardHat,
  TrendingUp, Users, CreditCard, Clock, ArrowRight, CheckCircle2,
  AlertCircle, XCircle, Gauge, Activity, DollarSign, Bell,
  Search, Receipt, FileText, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const serviceIcons: Record<string, React.ElementType> = {
  "car-rental": Car, "safari-tours": Compass, "transfers": Plane,
  "hotel-airport-transfers": Plane, "movers": Truck, "corporate-rental": Bus,
  "road-recovery": Wrench, "cargo-handling": Package, "shipment-imports": Ship,
  "construction-equipment": HardHat,
};

const serviceNames: Record<string, string> = {
  "car-rental": "Car Rental", "safari-tours": "Safari Tours", "transfers": "Transfers",
  "hotel-airport-transfers": "Transfers", "movers": "Movers", "corporate-rental": "Corporate Rental",
  "road-recovery": "Road Recovery", "cargo-handling": "Cargo Handling",
  "shipment-imports": "Shipment Imports", "construction-equipment": "Construction Equipment",
};

const serviceColors: Record<string, string> = {
  "car-rental": "text-emerald-400 bg-emerald-500/10",
  "safari-tours": "text-amber-400 bg-amber-500/10",
  "transfers": "text-sky-400 bg-sky-500/10",
  "hotel-airport-transfers": "text-sky-400 bg-sky-500/10",
  "movers": "text-violet-400 bg-violet-500/10",
  "corporate-rental": "text-indigo-400 bg-indigo-500/10",
  "road-recovery": "text-rose-400 bg-rose-500/10",
  "cargo-handling": "text-orange-400 bg-orange-500/10",
  "shipment-imports": "text-cyan-400 bg-cyan-500/10",
  "construction-equipment": "text-yellow-400 bg-yellow-500/10",
};

const serviceLinks: Record<string, string> = {
  "car-rental": "/admin/car-rental", "safari-tours": "/admin/safari-tours",
  "transfers": "/admin/transfers", "hotel-airport-transfers": "/admin/transfers",
  "movers": "/admin/movers", "corporate-rental": "/admin/corporate-rental",
  "road-recovery": "/admin/road-recovery", "cargo-handling": "/admin/cargo-handling",
  "shipment-imports": "/admin/shipment-imports", "construction-equipment": "/admin/construction-equipment",
};

const quickServices = [
  { href: "/admin/client-lookup?service=car-rental",             label: "Car Rental",   Icon: Car,     color: "emerald" },
  { href: "/admin/client-lookup?service=safari-tours",           label: "Safari Tours", Icon: Compass, color: "amber"   },
  { href: "/admin/client-lookup?service=transfers",              label: "Transfers",    Icon: Plane,   color: "sky"     },
  { href: "/admin/client-lookup?service=movers",                 label: "Movers",       Icon: Truck,   color: "violet"  },
  { href: "/admin/client-lookup?service=corporate-rental",       label: "Corporate",    Icon: Bus,     color: "indigo"  },
  { href: "/admin/client-lookup?service=road-recovery",          label: "Recovery",     Icon: Wrench,  color: "rose"    },
  { href: "/admin/client-lookup?service=cargo-handling",         label: "Cargo",        Icon: Package, color: "orange"  },
  { href: "/admin/client-lookup?service=shipment-imports",       label: "Shipment",     Icon: Ship,    color: "cyan"    },
  { href: "/admin/client-lookup?service=construction-equipment", label: "Construction", Icon: HardHat, color: "yellow"  },
];

const colorMap: Record<string, string> = {
  emerald: "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400",
  amber:   "border-amber-500/30   bg-amber-500/10   hover:bg-amber-500/20   text-amber-400",
  sky:     "border-sky-500/30     bg-sky-500/10     hover:bg-sky-500/20     text-sky-400",
  violet:  "border-violet-500/30  bg-violet-500/10  hover:bg-violet-500/20  text-violet-400",
  indigo:  "border-indigo-500/30  bg-indigo-500/10  hover:bg-indigo-500/20  text-indigo-400",
  rose:    "border-rose-500/30    bg-rose-500/10    hover:bg-rose-500/20    text-rose-400",
  orange:  "border-orange-500/30  bg-orange-500/10  hover:bg-orange-500/20  text-orange-400",
  cyan:    "border-cyan-500/30    bg-cyan-500/10    hover:bg-cyan-500/20    text-cyan-400",
  yellow:  "border-yellow-500/30  bg-yellow-500/10  hover:bg-yellow-500/20  text-yellow-400",
};

const fmt = (n: number) => "KES " + n.toLocaleString();

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Record<string,unknown>[]>([]);
  const [clients, setClients] = useState<Record<string,unknown>[]>([]);
  const [invoices, setInvoices] = useState<Record<string,unknown>[]>([]);
  const [transactions, setTransactions] = useState<Record<string,unknown>[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings").then(r => r.json()),
      fetch("/api/clients").then(r => r.json()),
      fetch("/api/invoices").then(r => r.json()),
      fetch("/api/transactions").then(r => r.json()),
    ]).then(([b, c, i, t]) => {
      if (Array.isArray(b)) setBookings(b);
      if (Array.isArray(c)) setClients(c);
      if (Array.isArray(i)) setInvoices(i);
      if (Array.isArray(t)) setTransactions(t);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // ── Computed stats ──────────────────────────────────────────────
  const totalRevenue = transactions
    .filter(t => t.type === "income")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const netProfit = totalRevenue - totalExpenses;

  const pendingBookings  = bookings.filter(b => b.status === "pending").length;
  const activeBookings   = bookings.filter(b => ["confirmed","in-progress"].includes(String(b.status))).length;
  const completedBookings = bookings.filter(b => b.status === "completed").length;

  const unpaidInvoices = invoices.filter(i => i.status !== "paid");
  const outstandingDebt = unpaidInvoices.reduce((s, i) => s + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0);

  // Bookings by service
  const byService: Record<string, { count: number; revenue: number }> = {};
  bookings.forEach(b => {
    const svc = String(b.service_type || "other");
    if (!byService[svc]) byService[svc] = { count: 0, revenue: 0 };
    byService[svc].count++;
    byService[svc].revenue += Number(b.total_amount || 0);
  });

  const topServices = Object.entries(byService)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6);

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(String(b.created_at || 0)).getTime() - new Date(String(a.created_at || 0)).getTime())
    .slice(0, 6);

  // Alerts
  const alerts: { type: string; msg: string; href: string }[] = [];
  if (pendingBookings > 0) alerts.push({ type: "warn", msg: `${pendingBookings} booking${pendingBookings > 1 ? "s" : ""} awaiting confirmation`, href: "/admin/car-rental" });
  if (unpaidInvoices.length > 0) alerts.push({ type: "warn", msg: `${unpaidInvoices.length} unpaid invoice${unpaidInvoices.length > 1 ? "s" : ""} — KES ${outstandingDebt.toLocaleString()} outstanding`, href: "/admin/invoices" });
  if (clients.length === 0) alerts.push({ type: "info", msg: "No clients registered yet — use Client Lookup to register your first client", href: "/admin/client-lookup" });

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Gauge className="h-6 w-6 text-sky-400" />Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Button asChild className="bg-[#e67e22] hover:bg-[#d35400] gap-2">
          <Link href="/admin/client-lookup"><Users className="h-4 w-4" />New Booking</Link>
        </Button>
      </div>

      {/* ── Alerts ── */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <Link key={i} href={a.href} className={"flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm transition-all " +
              (a.type === "warn" ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/15" : "border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15")}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{a.msg}</span>
              <ArrowRight className="h-4 w-4 ml-auto shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {/* ── KPI Cards ── */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-gray-400" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Revenue",   value: fmt(totalRevenue),      icon: TrendingUp,  color: "text-emerald-400", border: "border-emerald-500/30", bg: "from-emerald-500/10" },
              { label: "Net Profit",      value: fmt(netProfit),         icon: DollarSign,  color: netProfit >= 0 ? "text-emerald-400" : "text-red-400", border: netProfit >= 0 ? "border-emerald-500/30" : "border-red-500/30", bg: netProfit >= 0 ? "from-emerald-500/10" : "from-red-500/10" },
              { label: "Total Clients",   value: clients.length,         icon: Users,       color: "text-blue-400",    border: "border-blue-500/30",    bg: "from-blue-500/10"    },
              { label: "Total Bookings",  value: bookings.length,        icon: CreditCard,  color: "text-purple-400",  border: "border-purple-500/30",  bg: "from-purple-500/10"  },
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Pending",    value: pendingBookings,   color: "text-yellow-400", border: "border-yellow-500/30", bg: "from-yellow-500/10", icon: Clock         },
              { label: "Active",     value: activeBookings,    color: "text-blue-400",   border: "border-blue-500/30",   bg: "from-blue-500/10",   icon: Activity      },
              { label: "Completed",  value: completedBookings, color: "text-emerald-400",border: "border-emerald-500/30",bg: "from-emerald-500/10", icon: CheckCircle2  },
              { label: "Outstanding",value: fmt(outstandingDebt), color: outstandingDebt > 0 ? "text-red-400" : "text-emerald-400", border: outstandingDebt > 0 ? "border-red-500/30" : "border-emerald-500/30", bg: outstandingDebt > 0 ? "from-red-500/10" : "from-emerald-500/10", icon: AlertCircle },
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

          {/* ── Main Grid ── */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Quick Actions */}
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-300 uppercase tracking-wide">Quick New Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {quickServices.map(({ href, label, Icon, color }) => (
                    <Link key={href} href={href}
                      className={"flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all " + colorMap[color]}>
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium leading-tight">{label}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Services */}
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-300 uppercase tracking-wide">Bookings by Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topServices.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No bookings yet</p>
                ) : topServices.map(([svc, data]) => {
                  const pct = bookings.length > 0 ? Math.round(data.count / bookings.length * 100) : 0;
                  const Icon = serviceIcons[svc] || Package;
                  const colors = serviceColors[svc] || "text-gray-400 bg-gray-500/10";
                  const [tc, bgc] = colors.split(" ");
                  return (
                    <Link key={svc} href={serviceLinks[svc] || "/admin"}
                      className="flex items-center gap-3 group">
                      <div className={"p-1.5 rounded-lg " + bgc}><Icon className={"h-3.5 w-3.5 " + tc} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-white text-xs font-medium">{serviceNames[svc] || svc}</p>
                          <span className="text-gray-400 text-xs">{data.count} booking{data.count !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className={"h-full rounded-full transition-all " + bgc.replace("/10", "/60")} style={{ width: pct + "%" }} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card className="border-white/10 bg-white/5 lg:col-span-2">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-gray-300 uppercase tracking-wide">Recent Bookings</CardTitle>
                <Link href="/admin/car-rental" className="text-xs text-[#e67e22] hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent>
                {recentBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No bookings yet</p>
                    <Button asChild className="mt-3 bg-[#e67e22] hover:bg-[#d35400] text-sm" size="sm">
                      <Link href="/admin/client-lookup">Create First Booking</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentBookings.map((b, i) => {
                      const svc = String(b.service_type || "");
                      const Icon = serviceIcons[svc] || Package;
                      const colors = serviceColors[svc] || "text-gray-400 bg-gray-500/10";
                      const [tc, bgc] = colors.split(" ");
                      const statusColors: Record<string,string> = {
                        pending: "bg-yellow-500/20 text-yellow-300",
                        confirmed: "bg-blue-500/20 text-blue-300",
                        "in-progress": "bg-purple-500/20 text-purple-300",
                        completed: "bg-emerald-500/20 text-emerald-300",
                        cancelled: "bg-red-500/20 text-red-300",
                      };
                      return (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/5 bg-white/5">
                          <div className={"p-2 rounded-lg " + bgc}><Icon className={"h-4 w-4 " + tc} /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{String(b.customer_name || "")}</p>
                            <p className="text-gray-400 text-xs">{serviceNames[svc] || svc} · {String(b.customer_phone || "")}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge className={"text-xs " + (statusColors[String(b.status || "")] || "bg-gray-500/20 text-gray-300")}>
                              {String(b.status || "")}
                            </Badge>
                            <p className="text-emerald-400 text-xs font-semibold mt-0.5">KES {Number(b.total_amount || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Quick Links ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/admin/invoices",  label: "Invoices",  icon: FileText,  color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
              { href: "/admin/receipts",  label: "Receipts",  icon: Receipt,   color: "text-teal-400 bg-teal-500/10 border-teal-500/30"      },
              { href: "/admin/accounts",  label: "Accounts",  icon: DollarSign,color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
              { href: "/admin/blacklist", label: "Blacklist", icon: XCircle,   color: "text-rose-400 bg-rose-500/10 border-rose-500/30"      },
            ].map(({ href, label, icon: Icon, color }) => (
              <Link key={href} href={href}
                className={"flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:brightness-110 " + color}>
                <Icon className="h-5 w-5" />
                <span className="font-medium text-sm">{label}</span>
                <ArrowRight className="h-4 w-4 ml-auto opacity-50" />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
