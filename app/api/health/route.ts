import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { connectDB } = await import("@/lib/mongodb");
    const { Client, Booking, FleetVehicle, Invoice, Receipt, Transaction, Blacklist, SubletVehicle, SubletBooking, FleetOut, Staff } = await import("@/lib/models");
    
    await connectDB();
    
    const counts = await Promise.all([
      Client.countDocuments(), Booking.countDocuments(), FleetVehicle.countDocuments(),
      Invoice.countDocuments(), Receipt.countDocuments(), Transaction.countDocuments(),
      Blacklist.countDocuments(), SubletVehicle.countDocuments(), SubletBooking.countDocuments(),
      FleetOut.countDocuments(), Staff.countDocuments(),
    ]);

    const names = ["clients","bookings","fleet_vehicles","invoices","receipts","transactions","blacklist","sublet_vehicles","sublet_bookings","fleet_out","staff"];
    const tables: Record<string,string> = {};
    names.forEach((n,i) => tables[n] = `OK (${counts[i]} docs)`);

    return NextResponse.json({ status: "connected", message: "MongoDB connection successful", tables, timestamp: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ status: "error", message: String(e) }, { status: 500 });
  }
}
