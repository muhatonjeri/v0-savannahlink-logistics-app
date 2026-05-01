"use client";

import { useEffect, useState } from "react";
import { Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingsTable } from "@/components/admin/bookings-table";
import { getBookingsByService } from "@/lib/store";
import type { Booking } from "@/types";

export default function RoadRecoveryAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadBookings = () => {
    setBookings(getBookingsByService("road-recovery"));
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
        <h1 className="text-2xl font-bold text-foreground">Road Recovery</h1>
        <p className="text-muted-foreground">Manage road recovery requests</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardDescription>Total Requests</CardDescription>
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
          <CardTitle>All Recovery Requests</CardTitle>
          <CardDescription>View and manage road recovery requests</CardDescription>
        </CardHeader>
        <CardContent>
          <BookingsTable bookings={bookings} onRefresh={loadBookings} />
        </CardContent>
      </Card>
    </div>
  );
}
