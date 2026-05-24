// ── Email API via Resend ───────────────────────────────────────────
// Sends receipts, invoices, booking confirmations to clients
// Docs: https://resend.com/docs

import { NextRequest, NextResponse } from "next/server";

const RESEND_KEY  = process.env.RESEND_API_KEY || "";
const FROM_EMAIL  = process.env.FROM_EMAIL || "receipts@moventrasafarislogisticsltd.com";
const FROM_NAME   = "Moventra Safaris & Logistics Ltd";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, type, data } = body;

    if (!to || !subject) return NextResponse.json({ error: "to and subject are required" }, { status: 400 });

    if (!RESEND_KEY) {
      return NextResponse.json({
        error: "Email not configured",
        message: "Add RESEND_API_KEY to .env.local. Get it free at resend.com",
        mock: true,
        wouldSend: { to, subject, type },
      }, { status: 503 });
    }

    // Build HTML based on type
    const html = buildEmailHtml(type, data, subject);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    const result = await res.json();
    if (!res.ok) return NextResponse.json({ error: result.message || "Email failed", raw: result }, { status: 400 });

    return NextResponse.json({ success: true, id: result.id, message: `Email sent to ${to}` });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function buildEmailHtml(type: string, data: any, subject: string): string {
  const header = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
    <div style="background:linear-gradient(135deg,#0a1628,#1a3a5c);padding:24px;text-align:center">
      <img src="https://moventrasafarislogisticsltd.com/images/logo.png" style="width:70px;height:70px;border-radius:50%;object-fit:contain" />
      <h1 style="color:white;margin:12px 0 4px;font-size:18px">Moventra Safaris & Logistics Ltd</h1>
      <p style="color:#e67e22;margin:0;font-size:12px">Experience. Move. Deliver. Beyond Borders.</p>
    </div>
    <div style="padding:28px 24px">`;

  const footer = `
    </div>
    <div style="background:#f8f9ff;padding:16px 24px;border-top:2px solid #e67e22;text-align:center">
      <p style="color:#888;font-size:11px;margin:0">Muthaiga Square, off Thika Rd, Nairobi, Kenya</p>
      <p style="color:#888;font-size:11px;margin:4px 0 0">+254 727 247 032 &nbsp;|&nbsp; info@moventrasafarislogisticsltd.com</p>
    </div></div>`;

  if (type === "receipt") {
    return `${header}
      <h2 style="color:#0a1628;margin:0 0 16px">Payment Receipt — ${data?.receiptNumber || ""}</h2>
      <p style="color:#555">Dear <strong>${data?.customerName || "Customer"}</strong>,</p>
      <p style="color:#555">Thank you for your payment. Your receipt is confirmed.</p>
      <div style="background:#f8f9ff;border-left:4px solid #e67e22;padding:16px;border-radius:4px;margin:16px 0">
        <p style="margin:0;font-size:13px;color:#555"><strong>Receipt No:</strong> ${data?.receiptNumber}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#555"><strong>Service:</strong> ${data?.serviceType}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#555"><strong>Amount:</strong> KES ${Number(data?.totalAmount || 0).toLocaleString()}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#555"><strong>Payment:</strong> ${data?.paymentMethod}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#555"><strong>Date:</strong> ${new Date().toLocaleDateString("en-KE", { day:"numeric", month:"long", year:"numeric" })}</p>
      </div>
      <p style="color:#555">This receipt is eTIMS compliant as required by KRA.</p>
      <p style="color:#888;font-size:12px">Please retain this for your records.</p>
    ${footer}`;
  }

  if (type === "invoice") {
    return `${header}
      <h2 style="color:#0a1628;margin:0 0 16px">Invoice — ${data?.invoiceNumber || ""}</h2>
      <p style="color:#555">Dear <strong>${data?.customerName || "Customer"}</strong>,</p>
      <p style="color:#555">Please find your invoice details below.</p>
      <div style="background:#f8f9ff;border-left:4px solid #e67e22;padding:16px;border-radius:4px;margin:16px 0">
        <p style="margin:0;font-size:13px;color:#555"><strong>Invoice No:</strong> ${data?.invoiceNumber}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#555"><strong>Service:</strong> ${data?.serviceType}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#555"><strong>Amount:</strong> KES ${Number(data?.total || 0).toLocaleString()}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#555"><strong>Due Date:</strong> ${data?.dueDate}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#555"><strong>Payment Terms:</strong> ${data?.paymentTerms}</p>
      </div>
      <p style="color:#555"><strong>M-Pesa Paybill:</strong> ${process.env.NEXT_PUBLIC_MPESA_PAYBILL || "522533"} | Account: ${data?.invoiceNumber}</p>
    ${footer}`;
  }

  if (type === "booking") {
    return `${header}
      <h2 style="color:#0a1628;margin:0 0 16px">Booking Confirmation</h2>
      <p style="color:#555">Dear <strong>${data?.customerName || "Customer"}</strong>,</p>
      <p style="color:#555">Your booking with Moventra has been confirmed.</p>
      <div style="background:#f8f9ff;border-left:4px solid #e67e22;padding:16px;border-radius:4px;margin:16px 0">
        <p style="margin:0;font-size:13px;color:#555"><strong>Service:</strong> ${data?.serviceType}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#555"><strong>Ref:</strong> ${data?.bookingRef}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#555"><strong>Amount:</strong> KES ${Number(data?.totalAmount || 0).toLocaleString()}</p>
      </div>
      <p style="color:#555">For any inquiries, contact us at +254 727 247 032.</p>
    ${footer}`;
  }

  // Generic email
  return `${header}<h2 style="color:#0a1628">${subject}</h2><p style="color:#555">${data?.message || ""}</p>${footer}`;
}
