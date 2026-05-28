import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET() {
  const supabaseOk = isSupabaseConfigured();
  const mpesaOk    = !!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_PASSKEY);
  const emailOk    = !!process.env.RESEND_API_KEY;
  const smsOk      = !!process.env.AT_API_KEY;
  const etimsOk    = !!process.env.ETIMS_API_KEY;

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "2.1.0",
    services: {
      supabase:  supabaseOk ? "configured" : "demo-mode",
      mpesa:     mpesaOk    ? "configured" : "demo-mode",
      email:     emailOk    ? "configured" : "demo-mode",
      sms:       smsOk      ? "configured" : "demo-mode",
      etims:     etimsOk    ? "configured" : "demo-mode",
    },
    demo_mode: !supabaseOk,
  });
}
