"use client";

// ── M-Pesa Client Library ──────────────────────────────────────────
// Connects the UI components to the real Daraja API via /api/mpesa

export interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  bookingId: string;
  accountReference: string;
  transactionDesc: string;
}

export interface STKPushResponse {
  success: boolean;
  merchantRequestId?: string;
  checkoutRequestId?: string;
  responseCode?: string;
  responseDescription?: string;
  customerMessage?: string;
  error?: string;
  mock?: boolean;
}

// Validate Kenyan phone number
export function validatePhoneNumber(phone: string): { valid: boolean; formatted: string } {
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("+254")) cleaned = "0" + cleaned.slice(4);
  if (cleaned.startsWith("254")) cleaned = "0" + cleaned.slice(3);
  const valid = /^(07|01)\d{8}$/.test(cleaned);
  const formatted = valid ? "+254" + cleaned.slice(1) : cleaned;
  return { valid, formatted };
}

export function formatCurrency(amount: number): string {
  return "KES " + amount.toLocaleString("en-KE");
}

// Initiate STK Push via our API route
export async function initiateStkPush(req: STKPushRequest): Promise<STKPushResponse> {
  try {
    const { valid, formatted } = validatePhoneNumber(req.phoneNumber);
    if (!valid) return { success: false, error: "Invalid phone number. Use format 07XXXXXXXX" };

    const res = await fetch("/api/mpesa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: formatted,
        amount: req.amount,
        reference: req.accountReference,
        description: req.transactionDesc,
      }),
    });

    const data = await res.json();

    if (data.success) {
      return {
        success: true,
        checkoutRequestId: data.checkoutRequestId,
        merchantRequestId: data.merchantRequestId,
        responseCode: "0",
        responseDescription: "Success",
        customerMessage: data.message || `STK Push sent to ${formatted}`,
        mock: data.mock,
      };
    }

    // If not configured, simulate success for testing
    if (data.error === "M-Pesa not configured") {
      return {
        success: true,
        checkoutRequestId: "MOCK-" + Date.now(),
        merchantRequestId: "MOCK-MR-" + Date.now(),
        responseCode: "0",
        responseDescription: "Simulated (M-Pesa not configured)",
        customerMessage: "Simulated STK Push — add M-Pesa keys to go live",
        mock: true,
      };
    }

    return { success: false, error: data.error || "STK Push failed" };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// Poll payment status
export async function checkPaymentStatus(checkoutRequestId: string): Promise<{ paid: boolean; status: string }> {
  try {
    if (checkoutRequestId.startsWith("MOCK-")) {
      // Simulate payment after 3 seconds
      return { paid: true, status: "completed" };
    }

    const res = await fetch(`/api/mpesa?checkoutId=${checkoutRequestId}`);
    const data = await res.json();

    if (data.ResultCode === "0") return { paid: true, status: "completed" };
    if (data.ResultCode === "1032") return { paid: false, status: "cancelled" };
    return { paid: false, status: "pending" };
  } catch {
    return { paid: false, status: "unknown" };
  }
}

// Simulate callback for testing (dev only)
export async function simulatePaymentCallback(checkoutRequestId: string, amount: number): Promise<boolean> {
  try {
    const res = await fetch("/api/mpesa/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Body: {
          stkCallback: {
            MerchantRequestID: "MOCK-MR",
            CheckoutRequestID: checkoutRequestId,
            ResultCode: 0,
            ResultDesc: "The service request is processed successfully.",
            CallbackMetadata: {
              Item: [
                { Name: "Amount", Value: amount },
                { Name: "MpesaReceiptNumber", Value: "MOCK" + Date.now() },
                { Name: "TransactionDate", Value: new Date().toISOString() },
                { Name: "PhoneNumber", Value: "254700000000" },
              ],
            },
          },
        },
      }),
    });
    return res.ok;
  } catch { return false; }
}
