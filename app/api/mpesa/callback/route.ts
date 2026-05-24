// ── M-Pesa Callback Handler ────────────────────────────────────────
// Safaricom calls this URL after payment success/failure
// Must be publicly accessible (use ngrok in dev)

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const callback = body?.Body?.stkCallback;

    if (!callback) return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;
    const sb = createAdminClient();

    if (ResultCode === 0) {
      // Payment successful — extract metadata
      const meta = CallbackMetadata?.Item || [];
      const get  = (name: string) => meta.find((i: any) => i.Name === name)?.Value;

      const mpesaRef   = get("MpesaReceiptNumber");
      const amount     = get("Amount");
      const phone      = get("PhoneNumber");
      const transDate  = get("TransactionDate");

      // Update transaction status
      await sb.from("transactions")
        .update({ status: "completed", reference: mpesaRef })
        .eq("reference", CheckoutRequestID);

      // Update any booking with this checkout ID
      await sb.from("bookings")
        .update({ payment_status: "completed", mpesa_ref: mpesaRef, amount_paid: amount })
        .eq("mpesa_ref", CheckoutRequestID);

      console.log(`✅ M-Pesa payment confirmed: ${mpesaRef} - KES ${amount} from ${phone}`);
    } else {
      // Payment failed/cancelled
      await sb.from("transactions")
        .update({ status: "cancelled" })
        .eq("reference", CheckoutRequestID);

      console.log(`❌ M-Pesa payment failed: ${ResultDesc}`);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (e) {
    console.error("M-Pesa callback error:", e);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" }); // Always return 0 to Safaricom
  }
}
