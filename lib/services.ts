// ── Moventra External Services Client ─────────────────────────────
// Use these helpers in pages to call the external APIs

// ── M-Pesa ────────────────────────────────────────────────────────
export const mpesaApi = {
  /** Trigger STK Push payment prompt on customer's phone */
  stkPush: async (phone: string, amount: number, reference: string, description?: string, customerName?: string) => {
    const res = await fetch("/api/mpesa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, amount, reference, description, customerName }),
    });
    return res.json();
  },

  /** Check if STK Push payment was completed */
  checkStatus: async (checkoutId: string) => {
    const res = await fetch(`/api/mpesa?checkoutId=${checkoutId}`);
    return res.json();
  },
};

// ── eTIMS ─────────────────────────────────────────────────────────
export const etimsApi = {
  /** Sign a receipt with eTIMS before issuing */
  signReceipt: async (receiptData: {
    receiptNumber: string; customerName: string; customerPin?: string;
    items: { description: string; quantity: number; unitPrice: number; amount: number }[];
    totalAmount: number; taxAmount: number; paymentMethod: string;
  }) => {
    const res = await fetch("/api/etims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(receiptData),
    });
    return res.json();
  },
};

// ── Email ─────────────────────────────────────────────────────────
export const emailApi = {
  sendReceipt: (to: string, receiptData: Record<string, unknown>) =>
    fetch("/api/email", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject: `Receipt ${receiptData.receiptNumber} - Moventra`, type: "receipt", data: receiptData }) }).then(r => r.json()),

  sendInvoice: (to: string, invoiceData: Record<string, unknown>) =>
    fetch("/api/email", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject: `Invoice ${invoiceData.invoiceNumber} - Moventra`, type: "invoice", data: invoiceData }) }).then(r => r.json()),

  sendBookingConfirmation: (to: string, bookingData: Record<string, unknown>) =>
    fetch("/api/email", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject: "Booking Confirmed - Moventra", type: "booking", data: bookingData }) }).then(r => r.json()),
};

// ── SMS ───────────────────────────────────────────────────────────
export const smsApi = {
  sendBookingConfirm: (phone: string, data: Record<string, unknown>) =>
    fetch("/api/sms", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, type: "booking_confirm", data }) }).then(r => r.json()),

  sendPaymentReceived: (phone: string, data: Record<string, unknown>) =>
    fetch("/api/sms", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, type: "payment_received", data }) }).then(r => r.json()),

  sendReturnReminder: (phone: string, data: Record<string, unknown>) =>
    fetch("/api/sms", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, type: "return_reminder", data }) }).then(r => r.json()),

  sendBalanceReminder: (phone: string, data: Record<string, unknown>) =>
    fetch("/api/sms", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, type: "balance_reminder", data }) }).then(r => r.json()),

  send: (phone: string, message: string) =>
    fetch("/api/sms", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message }) }).then(r => r.json()),
};

// ── KRA ───────────────────────────────────────────────────────────
export const kraApi = {
  lookupPin: async (pin: string) => {
    const res = await fetch(`/api/kra?pin=${encodeURIComponent(pin)}`);
    return res.json();
  },
};

// ── Google Maps ───────────────────────────────────────────────────
export const mapsApi = {
  geocode: async (address: string) => {
    const res = await fetch(`/api/maps?address=${encodeURIComponent(address)}`);
    return res.json();
  },
  autocomplete: async (input: string) => {
    const res = await fetch(`/api/maps?type=places&address=${encodeURIComponent(input)}`);
    return res.json();
  },
  reverse: async (lat: number, lng: number) => {
    const res = await fetch(`/api/maps?type=reverse&lat=${lat}&lng=${lng}`);
    return res.json();
  },
};
