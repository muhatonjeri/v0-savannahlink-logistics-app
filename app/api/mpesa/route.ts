// ── M-Pesa Daraja API ──────────────────────────────────────────────
// Handles STK Push (Lipa Na M-Pesa Online) for payment collection
// Docs: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate

import { NextRequest, NextResponse } from "next/server";
import { verifyInternalRequest, unauthorized } from "@/lib/api-auth";

import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

const MPESA_ENV       = process.env.MPESA_ENV || "sandbox";
const CONSUMER_KEY    = process.env.MPESA_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "";
const SHORTCODE       = process.env.MPESA_SHORTCODE || "174379";
const PASSKEY         = process.env.MPESA_PASSKEY || "";
const CALLBACK_URL    = process.env.MPESA_CALLBACK_URL || "https://yourdomain.com/api/mpesa/callback";

const BASE_URL = MPESA_ENV === "production"
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

// Generate OAuth token
async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`M-Pesa auth failed: ${data.errorMessage || JSON.stringify(data)}`);
  return data.access_token;
}

// Generate password (base64 of shortcode + passkey + timestamp)
function generatePassword(timestamp: string): string {
  return Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");
}

// Format phone: 0712345678 → 254712345678
function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) return "254" + clean.slice(1);
  if (clean.startsWith("254")) return clean;
  if (clean.startsWith("+254")) return clean.slice(1);
  return clean;
}

// ── STK Push ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!verifyInternalRequest(req)) return unauthorized();
  try {
    // Rate limit: 10 STK push requests per minute per IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`mpesa:${ip}`, 10, 60_000);
    if (!rl.ok) return NextResponse.json({ error: "Too many requests. Try again in 1 minute." }, { status: 429 });

    const body = await req.json();
    const { phone, amount, reference, description, bookingId, invoiceId } = body;

    if (!phone || !amount) {
      return NextResponse.json({ error: "phone and amount are required" }, { status: 400 });
    }

    // When credentials not configured — return mock STK push so UI flow works
    if (!CONSUMER_KEY || !CONSUMER_SECRET || !PASSKEY) {
      const mockId = `MOCK-${Date.now().toString(36).toUpperCase()}`;
      console.log(`[M-PESA MOCK] STK push to ${body.phone} for KES ${body.amount}`);
      return NextResponse.json({
        success: true,
        mock: true,
        checkoutRequestId: mockId,
        merchantRequestId: mockId,
        customerMessage: `Demo: STK push simulated to ${body.phone}. Add M-Pesa credentials to .env.local for live payments.`,
      });
    }

    const token     = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    const password  = generatePassword(timestamp);
    const formattedPhone = formatPhone(phone);

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(Number(amount)),
      PartyA: formattedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: reference || "MOVENTRA",
      TransactionDesc: description || "Moventra Payment",
    };

    const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.ResponseCode === "0") {
      // Log pending transaction to Supabase
      const sb = createAdminClient();
      await sb.from("transactions").insert([{
        date: new Date().toISOString().split("T")[0],
        type: "income",
        category: "M-Pesa",
        description: description || `M-Pesa STK Push - ${reference}`,
        amount: Number(amount),
        payment_method: "mpesa",
        reference: data.CheckoutRequestID,
        status: "pending",
        customer_name: body.customerName || "",
      }]);

      return NextResponse.json({
        success: true,
        checkoutRequestId: data.CheckoutRequestID,
        merchantRequestId: data.MerchantRequestID,
        message: `STK Push sent to ${formattedPhone}. Customer should enter M-Pesa PIN.`,
      });
    }

    return NextResponse.json({ error: data.errorMessage || "STK Push failed", raw: data }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── Check STK Push Status ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!verifyInternalRequest(req)) return unauthorized();
  try {
    const checkoutId = new URL(req.url).searchParams.get("checkoutId");
    if (!checkoutId) return NextResponse.json({ error: "checkoutId required" }, { status: 400 });
    if (!CONSUMER_KEY) return NextResponse.json({ error: "M-Pesa not configured" }, { status: 503 });

    const token     = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    const password  = generatePassword(timestamp);

    const res = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutId,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
