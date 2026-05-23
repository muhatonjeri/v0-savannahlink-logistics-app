import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { Client, Booking, FleetVehicle, Invoice, Receipt, Transaction, Blacklist, SubletVehicle, SubletBooking, FleetOut, Staff } from "@/lib/models";

export async function GET() {
  try {
    await connectDB();
    const results = await Promise.all([
      Client.countDocuments(),
      Booking.countDocuments(),
      FleetVehicle.countDocuments(),
      Invoice.countDocuments(),
      Receipt.countDocuments(),
      Transaction.countDocuments(),
      Blacklist.countDocuments(),
      SubletVehicle.countDocuments(),
      SubletBooking.countDocuments(),
      FleetOut.countDocuments(),
      Staff.countDocuments(),
    ]);
    const names = ["clients","bookings","fleet_vehicles","invoices","receipts","transactions","blacklist","sublet_vehicles","sublet_bookings","fleet_out","staff"];
    const tables: Record<string,string> = {};
    names.forEach((n,i) => tables[n] = `OK (${results[i]} docs)`);
    return NextResponse.json({ status: "connected", message: "MongoDB connection successful", tables, timestamp: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ status: "error", message: String(e) }, { status: 500 });
  }
}
