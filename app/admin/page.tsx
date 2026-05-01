"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Car,
  Compass,
  Plane,
  Truck,
  Bus,
  Wrench,
  Package,
  Ship,
  HardHat,
  TrendingUp,
  Users,
  CreditCard,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBookingStats, getBookings, getUsers } from "@/lib/store";
import type { Booking } from "@/types";

// Service colors for visual distinction
const serviceColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  "car-rental": { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", icon: "text-emerald-500" },
  "safari-tours": { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", icon: "text-amber-500" },
  "hotel-airport-transfers": { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/30", icon: "text-sky-500" },
  "movers": { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/30", icon: "text-violet-500" },
  "corporate-rental": { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30", icon: "text-indigo-500" },
  "road-recovery": { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30", icon: "text-rose-500" },
  "cargo-handling": { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", icon: "text-orange-500" },
  "shipment-imports": { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30", icon: "text-cyan-500" },
  "construction-equipment": { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30", icon: "text-yellow-500" },
};

const serviceIcons: Record<string, React.ElementType> = {
  "car-rental": Car,
  "safari-tours": Compass,
  "hotel-airport-transfers": Plane,
  "movers": Truck,
  "corporate-rental": Bus,
  "road-recovery": Wrench,
  "cargo-handling": Package,
  "shipment-imports": Ship,
  "construction-equipment": HardHat,
};

const serviceNames: Record<string, string> = {
  "car-rental": "Car Rental",
  "safari-tours": "Safari Tours",
  "hotel-airport-transfers": "Transfers",
  "movers": "Movers",
  "corporate-rental": "Corporate Rental",
  "road-recovery": "Road Recovery",
  "cargo-handling": "Cargo Handling",
  "shipment-imports": "Shipment Imports",
  "construction-equipment": "Construction Equipment",
};

const serviceLinks: Record<string, string> = {
  "car-rental": "/admin/car-rental",
  "safari-tours": "/admin/safari-tours",
  "hotel-airport-transfers": "/admin/transfers",
  "movers": "/admin/movers",
  "corporate-rental": "/admin/corporate-rental",
  "road-recovery": "/admin/road-recovery",
  "cargo-handling": "/admin/cargo-handling",
  "shipment-imports": "/admin/shipment-imports",
  "construction-equipment": "/admin/construction-equipment",
};

const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: Clock },
  confirmed: { bg: "bg-blue-500/20", text: "text-blue-400", icon: CheckCircle2 },
  "in-progress": { bg: "bg-purple-500/20", text: "text-purple-400", icon: TrendingUp },
  completed: { bg: "bg-emerald-500/20", text: "text-emerald-400", icon: CheckCircle2 },
  cancelled: { bg: "bg-red-500/20", text: "text-red-400", icon: XCircle },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<ReturnType<typeof getBookingStats> | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const bookingStats = getBookingStats();
    setStats(bookingStats);

    const allBookings = getBookings();
    setRecentBookings(allBookings.slice(-5).reverse());

    const users = getUsers();
    setUserCount(users.length);
  }, []);

  if (!stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Bookings */}
        <Card className="relative overflow-hidden border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-4 rounded-full bg-blue-500/10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-300">
              Total Bookings
            </CardTitle>
            <div className="rounded-lg bg-blue-500/20 p-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-100">{stats.total}</div>
            <p className="text-sm text-blue-300/70 mt-1">
              <span className="inline-flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {stats.pending} pending
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="relative overflow-hidden border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-4 rounded-full bg-emerald-500/10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-300">
              Revenue
            </CardTitle>
            <div className="rounded-lg bg-emerald-500/20 p-2">
              <CreditCard className="h-5 w-5 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-100">
              KES {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-emerald-300/70 mt-1">
              KES {stats.pendingPayments.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>

        {/* Active Bookings */}
        <Card className="relative overflow-hidden border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-4 rounded-full bg-purple-500/10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-300">
              Active Bookings
            </CardTitle>
            <div className="rounded-lg bg-purple-500/20 p-2">
              <Clock className="h-5 w-5 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-100">{stats.confirmed + stats.inProgress}</div>
            <p className="text-sm text-purple-300/70 mt-1">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {stats.completed} completed
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-4 rounded-full bg-amber-500/10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-300">
              Team Members
            </CardTitle>
            <div className="rounded-lg bg-amber-500/20 p-2">
              <Users className="h-5 w-5 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-100">{userCount}</div>
            <p className="text-sm text-amber-300/70 mt-1">1 admin, {userCount - 1} staff</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Services Overview */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Bookings by Service</CardTitle>
            <CardDescription>Distribution of bookings across services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byService).length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No bookings yet</p>
              ) : (
                Object.entries(stats.byService).map(([service, count]) => {
                  const Icon = serviceIcons[service] || Package;
                  const colors = serviceColors[service] || { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/30", icon: "text-gray-500" };
                  return (
                    <div 
                      key={service} 
                      className={`flex items-center justify-between rounded-xl border ${colors.border} ${colors.bg} p-4 transition-all hover:scale-[1.02]`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg}`}>
                          <Icon className={`h-6 w-6 ${colors.icon}`} />
                        </div>
                        <div>
                          <p className={`font-semibold ${colors.text}`}>{serviceNames[service]}</p>
                          <p className="text-sm text-muted-foreground">{count} booking(s)</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className={`${colors.text} hover:${colors.bg}`} asChild>
                        <Link href={serviceLinks[service]}>
                          View
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Recent Bookings</CardTitle>
            <CardDescription>Latest customer bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No bookings yet</p>
              ) : (
                recentBookings.map((booking) => {
                  const Icon = serviceIcons[booking.serviceType] || Package;
                  const colors = serviceColors[booking.serviceType] || { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/30", icon: "text-gray-500" };
                  const status = statusColors[booking.status] || { bg: "bg-gray-500/20", text: "text-gray-400", icon: AlertCircle };
                  const StatusIcon = status.icon;
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg}`}>
                          <Icon className={`h-5 w-5 ${colors.icon}`} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{booking.customerName}</p>
                          <p className={`text-sm ${colors.text}`}>
                            {serviceNames[booking.serviceType]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${status.bg} ${status.text} border-0 gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {booking.status}
                        </Badge>
                        <span className="text-sm font-semibold text-emerald-400">
                          KES {booking.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - All Services */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Quick Actions</CardTitle>
          <CardDescription>Create new bookings for all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <Link href="/admin/car-rental/new" className="group">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 transition-all hover:scale-105 hover:border-emerald-500/50 hover:bg-emerald-500/20">
                <div className="rounded-full bg-emerald-500/20 p-3 group-hover:bg-emerald-500/30">
                  <Car className="h-8 w-8 text-emerald-500" />
                </div>
                <span className="text-sm font-medium text-emerald-400 text-center">Car Rental</span>
              </div>
            </Link>
            
            <Link href="/admin/safari-tours/new" className="group">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 transition-all hover:scale-105 hover:border-amber-500/50 hover:bg-amber-500/20">
                <div className="rounded-full bg-amber-500/20 p-3 group-hover:bg-amber-500/30">
                  <Compass className="h-8 w-8 text-amber-500" />
                </div>
                <span className="text-sm font-medium text-amber-400 text-center">Safari Tours</span>
              </div>
            </Link>
            
            <Link href="/admin/transfers/new" className="group">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 p-6 transition-all hover:scale-105 hover:border-sky-500/50 hover:bg-sky-500/20">
                <div className="rounded-full bg-sky-500/20 p-3 group-hover:bg-sky-500/30">
                  <Plane className="h-8 w-8 text-sky-500" />
                </div>
                <span className="text-sm font-medium text-sky-400 text-center">Transfers</span>
              </div>
            </Link>
            
            <Link href="/admin/movers/new" className="group">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 p-6 transition-all hover:scale-105 hover:border-violet-500/50 hover:bg-violet-500/20">
                <div className="rounded-full bg-violet-500/20 p-3 group-hover:bg-violet-500/30">
                  <Truck className="h-8 w-8 text-violet-500" />
                </div>
                <span className="text-sm font-medium text-violet-400 text-center">Movers</span>
              </div>
            </Link>
            
            <Link href="/admin/corporate-rental/new" className="group">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-6 transition-all hover:scale-105 hover:border-indigo-500/50 hover:bg-indigo-500/20">
                <div className="rounded-full bg-indigo-500/20 p-3 group-hover:bg-indigo-500/30">
                  <Bus className="h-8 w-8 text-indigo-500" />
                </div>
                <span className="text-sm font-medium text-indigo-400 text-center">Corporate</span>
              </div>
            </Link>
            
            <Link href="/admin/road-recovery/new" className="group">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 transition-all hover:scale-105 hover:border-rose-500/50 hover:bg-rose-500/20">
                <div className="rounded-full bg-rose-500/20 p-3 group-hover:bg-rose-500/30">
                  <Wrench className="h-8 w-8 text-rose-500" />
                </div>
                <span className="text-sm font-medium text-rose-400 text-center">Recovery</span>
              </div>
            </Link>
            
            <Link href="/admin/cargo-handling/new" className="group">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 p-6 transition-all hover:scale-105 hover:border-orange-500/50 hover:bg-orange-500/20">
                <div className="rounded-full bg-orange-500/20 p-3 group-hover:bg-orange-500/30">
                  <Package className="h-8 w-8 text-orange-500" />
                </div>
                <span className="text-sm font-medium text-orange-400 text-center">Cargo</span>
              </div>
            </Link>
            
            <Link href="/admin/shipment-imports/new" className="group">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-6 transition-all hover:scale-105 hover:border-cyan-500/50 hover:bg-cyan-500/20">
                <div className="rounded-full bg-cyan-500/20 p-3 group-hover:bg-cyan-500/30">
                  <Ship className="h-8 w-8 text-cyan-500" />
                </div>
                <span className="text-sm font-medium text-cyan-400 text-center">Shipment</span>
              </div>
            </Link>
            
            <Link href="/admin/construction-equipment/new" className="group">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 transition-all hover:scale-105 hover:border-yellow-500/50 hover:bg-yellow-500/20">
                <div className="rounded-full bg-yellow-500/20 p-3 group-hover:bg-yellow-500/30">
                  <HardHat className="h-8 w-8 text-yellow-500" />
                </div>
                <span className="text-sm font-medium text-yellow-400 text-center">Construction</span>
              </div>
            </Link>
            
            <Link href="/admin/users" className="group">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-500/30 bg-gray-500/10 p-6 transition-all hover:scale-105 hover:border-gray-500/50 hover:bg-gray-500/20">
                <div className="rounded-full bg-gray-500/20 p-3 group-hover:bg-gray-500/30">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <span className="text-sm font-medium text-gray-400 text-center">Users</span>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
