import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sb = createAdminClient();
    const start = Date.now();
    const { count } = await sb.from("clients").select("*", { count: "exact", head: true });
    const latency = Date.now() - start;
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: { connected: true, latency_ms: latency, clients: count },
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV,
    });
  } catch (e) {
    return NextResponse.json({ status: "error", error: String(e) }, { status: 503 });
  }
}
