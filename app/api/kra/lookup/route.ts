import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  try {
    const pin = new URL(req.url).searchParams.get("pin") || "";
    if (!pin) return NextResponse.json({ error: "pin required" }, { status: 400 });
    const res = await fetch(`${new URL(req.url).origin}/api/kra?pin=${encodeURIComponent(pin)}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
