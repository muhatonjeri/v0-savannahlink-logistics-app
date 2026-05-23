import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const service = searchParams.get("service");
    const clientId = searchParams.get("clientId");
    const filter: Record<string,string> = {};
    if (service) filter.serviceType = service;
    if (clientId) filter.clientId = clientId;
    const docs = await Booking.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(docs);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const doc = await Booking.create(body);
    return NextResponse.json(doc);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { id, ...updates } = await req.json();
    const doc = await Booking.findByIdAndUpdate(id, updates, { new: true }).lean();
    return NextResponse.json(doc);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
