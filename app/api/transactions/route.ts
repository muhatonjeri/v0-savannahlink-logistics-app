import { connectDB } from "@/lib/mongodb";
import { Transaction } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const filter: Record<string,string> = {};
    if (type) filter.type = type;
    const docs = await Transaction.find(filter).sort({ date: -1 }).lean();
    return NextResponse.json(docs);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const records = Array.isArray(body) ? body : [body];
    const docs = await Transaction.insertMany(records);
    return NextResponse.json(docs);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
