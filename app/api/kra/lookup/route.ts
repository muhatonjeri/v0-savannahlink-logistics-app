// Redirect /api/kra/lookup?pin=X → /api/kra?pin=X
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const pin = new URL(req.url).searchParams.get("pin") || "";
  const res = await fetch(`${new URL(req.url).origin}/api/kra?pin=${encodeURIComponent(pin)}`);
  const data = await res.json();
  return NextResponse.json(data);
}
