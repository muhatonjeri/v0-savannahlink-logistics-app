import { connectDB } from "@/lib/mongodb";
import { Client } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const id = searchParams.get("id");

    if (id) {
      const doc = await Client.findById(id).lean();
      return NextResponse.json(doc);
    }
    if (q) {
      const docs = await Client.find({
        $or: [
          { fullName: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
          { idNumber: { $regex: q, $options: "i" } },
        ]
      }).limit(10).lean();
      return NextResponse.json(docs);
    }
    const docs = await Client.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(docs);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const doc = await Client.create(body);
    return NextResponse.json(doc);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { id, ...updates } = await req.json();
    const doc = await Client.findByIdAndUpdate(id, updates, { new: true }).lean();
    return NextResponse.json(doc);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const id = new URL(req.url).searchParams.get("id");
    await Client.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
