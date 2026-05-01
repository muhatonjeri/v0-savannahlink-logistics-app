"use client";

import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingsTable } from "@/components/admin/bookings-table";
import { getBookingsByService } from "@/lib/store";
import type { Booking } from "@/types";

export default function MoversAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadBookings = () => {
    setBookings(getBookingsByService("movers"));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    revenue: bookings
      .filter((b) => b.paymentStatus === "completed")
      .reduce((sum, b) => sum + b.totalAmount, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Movers</h1>
        <p className="text-muted-foreground">Manage moving service bookings</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardDescription>Total Bookings</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Revenue</CardDescription>
            <CardTitle className="text-2xl">KES {stats.revenue.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Moving Bookings</CardTitle>
          <CardDescription>View and manage moving service bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <BookingsTable bookings={bookings} onRefresh={loadBookings} />
        </CardContent>
      </Card>
    </div>
  );
}
