"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Car, Compass, Plane, Truck, Bus, Wrench, Package, Ship, HardHat,
  TrendingUp, Users, CreditCard, Clock, ArrowRight, CheckCircle2,
  AlertCircle, XCircle, Gauge, BarChart3, Activity, DollarSign,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/types";

const serviceColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  "car-rental":            { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", icon: "text-emerald-500" },
  "safari-tours":          { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/30",   icon: "text-amber-500"   },
  "hotel-airport-transfers":{ bg: "bg-sky-500/10",    text: "text-sky-400",     border: "border-sky-500/30",     icon: "text-sky-500"     },
  "movers":                { bg: "bg-violet-500/10",  text: "text-violet-400",  border: "border-violet-500/30",  icon: "text-violet-500"  },
  "corporate-rental":      { bg: "bg-indigo-500/10",  text: "text-indigo-400",  border: "border-indigo-500/30",  icon: "text-indigo-500"  },
  "road-recovery":         { bg: "bg-rose-500/10",    text: "text-rose-400",    border: "border-rose-500/30",    icon: "text-rose-500"    },
  "cargo-handling":        { bg: "bg-orange-500/10",  text: "text-orange-400",  border: "border-orange-500/30",  icon: "text-orange-500"  },
  "shipment-imports":      { bg: "bg-cyan-500/10",    text: "text-cyan-400",    border: "border-cyan-500/30",    icon: "text-cyan-500"    },
  "construction-equipment":{ bg: "bg-yellow-500/10",  text: "text-yellow-400",  border: "border-yellow-500/30",  icon: "text-yellow-500"  },
};

const serviceIcons: Record<string, React.ElementType> = {
  "car-rental": Car, "safari-tours": Compass, "hotel-airport-transfers": Plane,
  "movers": Truck, "corporate-rental": Bus, "road-recovery": Wrench,
  "cargo-handling": Package, "shipment-imports": Ship, "construction-equipment": HardHat,
};

const serviceNames: Record<string, string> = {
  "car-rental": "Car Rental", "safari-tours": "Safari Tours", "hotel-airport-transfers": "Transfers",
  "movers": "Movers", "corporate-rental": "Corporate Rental", "road-recovery": "Road Recovery",
  "cargo-handling": "Cargo Handling", "shipment-imports": "Shipment Imports", "construction-equipment": "Construction Equipment",
};

const serviceLinks: Record<string, string> = {
  "car-rental": "/admin/car-rental", "safari-tours": "/admin/safari-tours",
  "hotel-airport-transfers": "/admin/transfers", "movers": "/admin/movers",
  "corporate-rental": "/admin/corporate-rental", "road-recovery": "/admin/road-recovery",
  "cargo-handling": "/admin/cargo-handling", "shipment-imports": "/admin/shipment-imports",
  "construction-equipment": "/admin/construction-equipment",
};

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  pending:     { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: Clock,         label: "Pending"     },
  confirmed:   { bg: "bg-blue-500/20",   text: "text-blue-400",   icon: CheckCircle2,  label: "Confirmed"   },
  "in-progress":{ bg: "bg-purple-500/20",text: "text-purple-400", icon: Activity,      label: "In Progress" },
  completed:   { bg: "bg-emerald-500/20",text: "text-emerald-400",icon: CheckCircle2,  label: "Completed"   },
  cancelled:   { bg: "bg-red-500/20",    text: "text-red-400",    icon: XCircle,       label: "Cancelled"   },
};

const quickServices = [
  { href: "/admin/client-lookup?service=car-rental",             label: "Car Rental",     Icon: Car,     color: "emerald" },
  { href: "/admin/client-lookup?service=safari-tours",           label: "Safari Tours",   Icon: Compass, color: "amber"   },
  { href: "/admin/client-lookup?service=transfers",              label: "Transfers",      Icon: Plane,   color: "sky"     },
  { href: "/admin/client-lookup?service=movers",                 label: "Movers",         Icon: Truck,   color: "violet"  },
  { href: "/admin/client-lookup?service=corporate-rental",       label: "Corporate",      Icon: Bus,     color: "indigo"  },
  { href: "/admin/client-lookup?service=road-recovery",          label: "Road Recovery",  Icon: Wrench,  color: "rose"    },
  { href: "/admin/client-lookup?service=cargo-handling",         label: "Cargo",          Icon: Package, color: "orange"  },
  { href: "/admin/client-lookup?service=shipment-imports",       label: "Shipment",       Icon: Ship,    color: "cyan"    },
  { href: "/admin/client-lookup?service=construction-equipment", label: "Construction",   Icon: HardHat, color: "yellow"  },
];

const colorMap: Record<string, string> = {
  emerald: "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400",
  amber:   "border-amber-500/40   bg-amber-500/10   hover:bg-amber-500/20   text-amber-400",
  sky:     "border-sky-500/40     bg-sky-500/10     hover:bg-sky-500/20     text-sky-400",
  violet:  "border-violet-500/40  bg-violet-500/10  hover:bg-violet-500/20  text-violet-400",
  indigo:  "border-indigo-500/40  bg-indigo-500/10  hover:bg-indigo-500/20  text-indigo-400",
  rose:    "border-rose-500/40    bg-rose-500/10    hover:bg-rose-500/20    text-rose-400",
  orange:  "border-orange-500/40  bg-orange-500/10  hover:bg-orange-500/20  text-orange-400",
  cyan:    "border-cyan-500/40    bg-cyan-500/10    hover:bg-cyan-500/20    text-cyan-400",
  yellow:  "border-yellow-500/40  bg-yellow-500/10  hover:bg-yellow-500/20  text-yellow-400",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0, pending: 0, confirmed: 0, inProgress: 0,
    completed: 0, cancelled: 0, totalRevenue: 0, pendingPayments: 0,
    byService: {} as Record<string, number>,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    // Load bookings from Supabase
    fetch("/api/bookings")
      .then(r => r.json())
      .then((bookings: Record<string,unknown>[]) => {
        if (!Array.isArray(bookings)) return;

        // Calculate stats from real data
        const total = bookings.length;
        const pending = bookings.filter(b => b.status === "pending").length;
        const confirmed = bookings.filter(b => b.status === "confirmed").length;
        const inProgress = bookings.filter(b => b.status === "in-progress" || b.status === "in_progress").length;
        const completed = bookings.filter(b => b.status === "completed").length;
        const cancelled = bookings.filter(b => b.status === "cancelled").length;
        const totalRevenue = bookings.reduce((s, b) => s + (Number(b.total_amount) || 0), 0);
        const pendingPayments = bookings.filter(b => b.payment_status !== "completed").reduce((s, b) => s + (Number(b.total_amount) || 0), 0);

        // Group by service
        const byService: Record<string, number> = {};
        bookings.forEach(b => {
          const svc = String(b.service_type || "other");
          byService[svc] = (byService[svc] || 0) + 1;
        });

        setStats({ total, pending, confirmed, inProgress, completed, cancelled, totalRevenue, pendingPayments, byService });
        setRecentBookings(bookings.slice(0, 5).map(b => ({
          id: String(b.id || ""),
          customerName: String(b.customer_name || b.customerName || ""),
          serviceType: String(b.service_type || b.serviceType || ""),
          status: String(b.status || "pending"),
          paymentStatus: String(b.payment_status || b.paymentStatus || "pending"),
          totalAmount: Number(b.total_amount || b.totalAmount || 0),
          createdAt: String(b.created_at || b.createdAt || ""),
        } as Booking)));
      })
      .catch(e => console.error("Dashboard load error:", e));

    // Load staff count
    fetch("/api/clients")
      .then(r => r.json())
      .then((data: unknown[]) => { if (Array.isArray(data)) setUserCount(data.length); })
      .catch(() => {});
  }, []);



  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Gauge className="h-8 w-8 text-sky-400" />
            Dashboard
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Welcome back — here's what's happening today.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-500">{new Date().toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Bookings",  value: stats.total,                                    sub: `${stats.pending} pending`,                  icon: BarChart3,   color: "blue",    iconColor: "text-blue-400",    bg: "from-blue-500/10 to-blue-600/5",    border: "border-blue-500/30"    },
          { label: "Revenue (KES)",   value: `${(stats.totalRevenue/1000).toFixed(0)}K`,     sub: `${(stats.pendingPayments/1000).toFixed(0)}K pending`, icon: DollarSign, color: "emerald", iconColor: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-500/30" },
          { label: "Active Bookings", value: stats.confirmed + stats.inProgress,             sub: `${stats.completed} completed`,              icon: Activity,    color: "purple",  iconColor: "text-purple-400",  bg: "from-purple-500/10 to-purple-600/5", border: "border-purple-500/30"  },
          { label: "Team Members",    value: userCount,                                       sub: `1 admin, ${userCount - 1} staff`,            icon: Users,       color: "amber",   iconColor: "text-amber-400",   bg: "from-amber-500/10 to-amber-600/5",  border: "border-amber-500/30"   },
        ].map(({ label, value, sub, icon: Icon, iconColor, bg, border }) => (
          <Card key={label} className={`relative overflow-hidden ${border} bg-gradient-to-br ${bg}`}>
            <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-4 rounded-full opacity-20 blur-xl bg-current" />
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</CardTitle>
              <div className={`rounded-lg bg-white/5 p-1.5`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-white">{value}</div>
              <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Middle Row ── */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* Bookings by Service — 3 cols */}
        <Card className="lg:col-span-3 border-white/10 bg-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-white">Bookings by Service</CardTitle>
                <CardDescription className="text-gray-500 text-xs mt-0.5">Distribution across all services</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            {Object.entries(stats.byService).length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No bookings yet</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.byService).map(([service, count]) => {
                  const Icon = serviceIcons[service] || Package;
                  const colors = serviceColors[service] || { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/30", icon: "text-gray-400" };
                  const total = Object.values(stats.byService).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={service} className={`flex items-center gap-3 rounded-lg border ${colors.border} ${colors.bg} px-3 py-2.5`}>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.bg}`}>
                        <Icon className={`h-4 w-4 ${colors.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${colors.text} truncate`}>{serviceNames[service]}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 h-1 rounded-full bg-white/10">
                            <div className={`h-1 rounded-full ${colors.icon.replace("text-", "bg-")}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 shrink-0">{count} ({pct}%)</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className={`shrink-0 h-7 px-2 text-xs ${colors.text}`} asChild>
                        <Link href={serviceLinks[service]}>View <ArrowRight className="ml-1 h-3 w-3" /></Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings — 2 cols */}
        <Card className="lg:col-span-2 border-white/10 bg-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-white">Recent Bookings</CardTitle>
                <CardDescription className="text-gray-500 text-xs mt-0.5">Latest 5 bookings</CardDescription>
              </div>
              <Clock className="h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No bookings yet</p>
            ) : (
              <div className="space-y-2">
                {recentBookings.map((booking) => {
                  const Icon = serviceIcons[booking.serviceType] || Package;
                  const colors = serviceColors[booking.serviceType] || { bg: "bg-gray-500/10", icon: "text-gray-400" };
                  const status = statusConfig[booking.status] || { bg: "bg-gray-500/20", text: "text-gray-400", icon: AlertCircle, label: booking.status };
                  const StatusIcon = status.icon;
                  return (
                    <div key={booking.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.bg}`}>
                        <Icon className={`h-4 w-4 ${colors.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{booking.customerName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge className={`${status.bg} ${status.text} border-0 gap-1 text-xs px-1.5 py-0`}>
                            <StatusIcon className="h-2.5 w-2.5" />
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 shrink-0">
                        KES {booking.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Actions ── */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">Quick Actions</CardTitle>
          <CardDescription className="text-gray-500 text-xs">Start a new booking for any service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {quickServices.map(({ href, label, Icon, color }) => (
              <Link key={href} href={href} className="group">
                <div className={`flex flex-col items-center gap-2 rounded-xl border ${colorMap[color]} p-3 transition-all hover:scale-105 cursor-pointer`}>
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium text-center leading-tight">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
