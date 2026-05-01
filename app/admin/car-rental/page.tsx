"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Car } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingsTable } from "@/components/admin/bookings-table";
import { getBookingsByService } from "@/lib/store";
import type { Booking } from "@/types";

export default function CarRentalAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadBookings = () => {
    setBookings(getBookingsByService("car-rental"));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    revenue: bookings
      .filter((b) => b.paymentStatus === "completed")
      .reduce((sum, b) => sum + b.totalAmount, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Car Rental</h1>
          <p className="text-muted-foreground">Manage car rental bookings</p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/admin/car-rental/new">
            <Plus className="h-4 w-4" />
            New Booking
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Car className="h-5 w-5 text-primary" />
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
            <CardDescription>Confirmed</CardDescription>
            <CardTitle className="text-2xl">{stats.confirmed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Revenue</CardDescription>
            <CardTitle className="text-2xl">KES {stats.revenue.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Car Rental Bookings</CardTitle>
          <CardDescription>View and manage all car rental bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <BookingsTable bookings={bookings} onRefresh={loadBookings} />
        </CardContent>
      </Card>
    </div>
  );
}
