// ── SMS API via Africa's Talking ───────────────────────────────────
// Sends booking confirmations, payment alerts, reminders to clients
// Docs: https://developers.africastalking.com/docs/sms/sending

import { NextRequest, NextResponse } from "next/server";

const AT_KEY      = process.env.AT_API_KEY || "";
const AT_USERNAME = process.env.AT_USERNAME || "sandbox";
const AT_SENDER   = process.env.AT_SENDER_ID || "MOVENTRA";

const AT_URL = AT_USERNAME === "sandbox"
  ? "https://api.sandbox.africastalking.com/version1/messaging"
  : "https://api.africastalking.com/version1/messaging";

// Format phone for AT: 0712345678 → +254712345678
function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) return "+254" + clean.slice(1);
  if (clean.startsWith("254")) return "+" + clean;
  if (clean.startsWith("+")) return clean;
  return "+" + clean;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, message, type, data } = body;

    if (!phone || (!message && !type)) {
      return NextResponse.json({ error: "phone and message/type required" }, { status: 400 });
    }

    if (!AT_KEY || AT_KEY === "") {
      return NextResponse.json({
        error: "SMS not configured",
        message: "Add AT_API_KEY and AT_USERNAME to .env.local. Register at africastalking.com",
        mock: true,
        wouldSend: { phone, message: message || buildSmsMessage(type, data) },
      }, { status: 503 });
    }

    const smsText = message || buildSmsMessage(type, data);
    const formattedPhone = formatPhone(phone);

    const params = new URLSearchParams({
      username: AT_USERNAME,
      to: formattedPhone,
      message: smsText,
      from: AT_SENDER,
    });

    const res = await fetch(AT_URL, {
      method: "POST",
      headers: {
        apiKey: AT_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
    });

    const result = await res.json();
    const recipient = result?.SMSMessageData?.Recipients?.[0];

    if (recipient?.status === "Success") {
      return NextResponse.json({ success: true, messageId: recipient.messageId, cost: recipient.cost, message: `SMS sent to ${formattedPhone}` });
    }

    return NextResponse.json({ error: recipient?.status || "SMS failed", raw: result }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function buildSmsMessage(type: string, data: any): string {
  const co = "Moventra Safaris & Logistics";
  switch (type) {
    case "booking_confirm":
      return `${co}: Booking confirmed! Ref: ${data?.bookingRef}. Service: ${data?.serviceType}. Amount: KES ${Number(data?.totalAmount || 0).toLocaleString()}. Call +254727247032`;
    case "payment_received":
      return `${co}: Payment received. KES ${Number(data?.amount || 0).toLocaleString()} via ${data?.paymentMethod}. Receipt: ${data?.receiptNumber}. Thank you!`;
    case "invoice_due":
      return `${co}: Invoice ${data?.invoiceNumber} of KES ${Number(data?.amount || 0).toLocaleString()} is due on ${data?.dueDate}. Pay via Paybill 522533 Acc: ${data?.invoiceNumber}`;
    case "return_reminder":
      return `${co}: Reminder - Vehicle ${data?.vehicleReg} is due for return on ${data?.endDate}. Contact us: +254727247032`;
    case "balance_reminder":
      return `${co}: You have an outstanding balance of KES ${Number(data?.balance || 0).toLocaleString()}. Please clear at your earliest. Call +254727247032`;
    default:
      return data?.message || `Message from ${co}. Call +254727247032`;
  }
}
