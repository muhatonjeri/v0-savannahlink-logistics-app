import { NextResponse } from "next/server";

// Test endpoint disabled in production
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  return NextResponse.json({ status: "ok", env: process.env.NODE_ENV });
}
