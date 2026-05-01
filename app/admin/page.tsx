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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBookingStats, getBookings, getUsers } from "@/lib/store";
import type { Booking } from "@/types";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pending} pending confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              KES {stats.pendingPayments.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Bookings
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed + stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completed} completed this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">1 admin, {userCount - 1} staff</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Services Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Service</CardTitle>
            <CardDescription>Distribution of bookings across services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.byService).length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings yet</p>
              ) : (
                Object.entries(stats.byService).map(([service, count]) => {
                  const Icon = serviceIcons[service] || Package;
                  return (
                    <div key={service} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{serviceNames[service]}</p>
                          <p className="text-xs text-muted-foreground">{count} booking(s)</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={serviceLinks[service]}>
                          <ArrowRight className="h-4 w-4" />
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
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest customer bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings yet</p>
              ) : (
                recentBookings.map((booking) => {
                  const Icon = serviceIcons[booking.serviceType] || Package;
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{booking.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {serviceNames[booking.serviceType]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            booking.status === "completed"
                              ? "default"
                              : booking.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {booking.status}
                        </Badge>
                        <span className="text-sm font-medium">
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
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions - New Bookings</CardTitle>
          <CardDescription>Create new bookings for all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950" asChild>
              <Link href="/admin/car-rental/new">
                <Car className="h-6 w-6 text-emerald-600" />
                <span className="text-xs text-center">New Car Rental</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 border-amber-200 hover:bg-amber-50 hover:border-amber-400 dark:border-amber-800 dark:hover:bg-amber-950" asChild>
              <Link href="/admin/safari-tours/new">
                <Compass className="h-6 w-6 text-amber-600" />
                <span className="text-xs text-center">New Safari Tour</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 border-sky-200 hover:bg-sky-50 hover:border-sky-400 dark:border-sky-800 dark:hover:bg-sky-950" asChild>
              <Link href="/admin/transfers/new">
                <Plane className="h-6 w-6 text-sky-600" />
                <span className="text-xs text-center">New Transfer</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 border-violet-200 hover:bg-violet-50 hover:border-violet-400 dark:border-violet-800 dark:hover:bg-violet-950" asChild>
              <Link href="/admin/movers/new">
                <Truck className="h-6 w-6 text-violet-600" />
                <span className="text-xs text-center">New Movers</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-950" asChild>
              <Link href="/admin/corporate-rental/new">
                <Bus className="h-6 w-6 text-indigo-600" />
                <span className="text-xs text-center">New Corporate</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 border-rose-200 hover:bg-rose-50 hover:border-rose-400 dark:border-rose-800 dark:hover:bg-rose-950" asChild>
              <Link href="/admin/road-recovery/new">
                <Wrench className="h-6 w-6 text-rose-600" />
                <span className="text-xs text-center">New Recovery</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 border-orange-200 hover:bg-orange-50 hover:border-orange-400 dark:border-orange-800 dark:hover:bg-orange-950" asChild>
              <Link href="/admin/cargo-handling/new">
                <Package className="h-6 w-6 text-orange-600" />
                <span className="text-xs text-center">New Cargo</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 border-cyan-200 hover:bg-cyan-50 hover:border-cyan-400 dark:border-cyan-800 dark:hover:bg-cyan-950" asChild>
              <Link href="/admin/shipment-imports/new">
                <Ship className="h-6 w-6 text-cyan-600" />
                <span className="text-xs text-center">New Shipment</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-400 dark:border-yellow-800 dark:hover:bg-yellow-950" asChild>
              <Link href="/admin/construction-equipment/new">
                <HardHat className="h-6 w-6 text-yellow-600" />
                <span className="text-xs text-center">New Construction</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 border-gray-200 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-700 dark:hover:bg-gray-900" asChild>
              <Link href="/admin/users">
                <Users className="h-6 w-6 text-gray-600" />
                <span className="text-xs text-center">Manage Users</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
