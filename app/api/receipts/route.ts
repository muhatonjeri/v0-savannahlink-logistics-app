import { connectDB } from "@/lib/mongodb";
import { Receipt } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const docs = await Receipt.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(docs);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const doc = await Receipt.create(body);
    return NextResponse.json(doc);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { id, ...updates } = await req.json();
    const doc = await Receipt.findByIdAndUpdate(id, updates, { new: true }).lean();
    return NextResponse.json(doc);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
