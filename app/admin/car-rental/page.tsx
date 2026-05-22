"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Car, Clock, CheckCircle2, TrendingUp, DollarSign, ArrowRight, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingsTable } from "@/components/admin/bookings-table";
import { getBookingsByService } from "@/lib/store";
import type { Booking } from "@/types";

export default function CarRentalAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadBookings = () => setBookings(getBookingsByService("car-rental"));

  useEffect(() => { loadBookings(); }, []);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    inProgress: bookings.filter((b) => b.status === "in-progress").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    revenue: bookings.filter((b) => b.paymentStatus === "completed").reduce((sum, b) => sum + b.totalAmount, 0),
    pending_payment: bookings.filter((b) => b.paymentStatus !== "completed").reduce((sum, b) => sum + b.totalAmount, 0),
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Car className="h-7 w-7 text-emerald-400" />
            Car Rental
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Manage all car rental bookings and payments</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" asChild>
          <Link href="/admin/client-lookup?service=car-rental">
            <Plus className="h-4 w-4" />
            New Booking
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Bookings", value: stats.total,    icon: TrendingUp,   color: "blue",    iconColor: "text-blue-400",    bg: "from-blue-500/10 to-blue-600/5",    border: "border-blue-500/30"    },
          { label: "Pending",        value: stats.pending,  icon: Clock,        color: "yellow",  iconColor: "text-yellow-400",  bg: "from-yellow-500/10 to-yellow-600/5",border: "border-yellow-500/30"  },
          { label: "Active",         value: stats.inProgress + stats.confirmed, icon: Activity, color: "emerald", iconColor: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-500/30" },
          { label: "Completed",      value: stats.completed,icon: CheckCircle2, color: "purple",  iconColor: "text-purple-400",  bg: "from-purple-500/10 to-purple-600/5",border: "border-purple-500/30"  },
        ].map(({ label, value, icon: Icon, iconColor, bg, border }) => (
          <Card key={label} className={`relative overflow-hidden ${border} bg-gradient-to-br ${bg}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-white">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-3 grid-cols-2">
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-emerald-500/20 p-2.5">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Revenue Collected</p>
              <p className="text-xl font-bold text-emerald-400">KES {stats.revenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-amber-500/20 p-2.5">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Pending Payments</p>
              <p className="text-xl font-bold text-amber-400">KES {stats.pending_payment.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">All Bookings</CardTitle>
              <CardDescription className="text-gray-500 text-xs mt-0.5">View and manage all car rental bookings</CardDescription>
            </div>
            <Badge className="bg-white/10 text-gray-300 text-xs">{stats.total} total</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <BookingsTable bookings={bookings} onRefresh={loadBookings} />
        </CardContent>
      </Card>
    </div>
  );
}
