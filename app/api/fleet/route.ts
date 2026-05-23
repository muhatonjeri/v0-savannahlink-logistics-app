import { connectDB } from "@/lib/mongodb";
import { FleetVehicle } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const id = new URL(req.url).searchParams.get("id");
    if (id) {
      const doc = await FleetVehicle.findById(id).lean();
      return NextResponse.json(doc);
    }
    const docs = await FleetVehicle.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(docs);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const doc = await FleetVehicle.create(body);
    return NextResponse.json(doc);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { id, ...updates } = await req.json();
    const doc = await FleetVehicle.findByIdAndUpdate(id, updates, { new: true }).lean();
    return NextResponse.json(doc);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const id = new URL(req.url).searchParams.get("id");
    await FleetVehicle.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
