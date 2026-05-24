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


// ── Service Catalogue (used by public pages) ─────────────────────
import type { Service } from "@/types";

export const services: Service[] = [
  {
    id: "car-rental",
    name: "Car Rental",
    description: "Self-drive and chauffeured vehicle rentals for all your transportation needs. Wide range of vehicles from economy to luxury.",
    icon: "Car",
    href: "/services/car-rental",
    color: "emerald",
    image: "/images/services/car-rental.jpg",
  },
  {
    id: "safari-tours",
    name: "Safari Tours",
    description: "Experience the magic of Kenya with our expertly guided safari tours. Explore Maasai Mara, Amboseli, and more.",
    icon: "Compass",
    href: "/services/safari-tours",
    color: "amber",
    image: "/images/services/safari-tours.jpg",
  },
  {
    id: "hotel-airport-transfers",
    name: "Hotel & Airport Transfers",
    description: "Reliable pickup and drop-off services between airports, hotels, and any location in Nairobi and beyond.",
    icon: "Plane",
    href: "/services/hotel-airport-transfers",
    color: "sky",
    image: "/images/services/hotel-transfers.jpg",
  },
  {
    id: "movers",
    name: "Movers",
    description: "Professional moving services for residential and commercial relocations. Packing, loading, and safe delivery.",
    icon: "Truck",
    href: "/services/movers",
    color: "violet",
    image: "/images/services/movers.jpg",
  },
  {
    id: "corporate-rental",
    name: "Corporate Rental",
    description: "Luxury vans and buses for corporate events, group travel, and tours. 10-seaters, 14-seaters, and buses from 22-seater onwards.",
    icon: "Bus",
    href: "/services/corporate-rental",
    color: "indigo",
    image: "/images/services/corporate-rental.jpg",
  },
  {
    id: "road-recovery",
    name: "Road Recovery",
    description: "24/7 emergency road recovery and towing services. We get you back on the road quickly and safely.",
    icon: "Wrench",
    href: "/services/road-recovery",
    color: "rose",
    image: "/images/services/road-recovery.jpg",
  },
  {
    id: "cargo-handling",
    name: "Cargo Handling",
    description: "Efficient cargo handling and logistics solutions. Port clearance, warehousing, and distribution services.",
    icon: "Package",
    href: "/services/cargo-handling",
    color: "orange",
    image: "/images/services/cargo-handling.jpg",
  },
  {
    id: "shipment-imports",
    name: "Shipment (Imports)",
    description: "Complete import facilitation services. Customs clearance, documentation, and door-to-door delivery.",
    icon: "Ship",
    href: "/services/shipment-imports",
    color: "cyan",
    image: "/images/services/shipment-imports.jpg",
  },
  {
    id: "construction-equipment",
    name: "Construction Equipment",
    description: "Heavy machinery and construction equipment rentals. Excavators, cranes, bulldozers, and more.",
    icon: "Tractor",
    href: "/services/construction-equipment",
    color: "yellow",
    image: "/images/services/construction-equipment.jpg",
  },
];

export function getServiceById(id: string): Service | undefined {
  return services.find((service) => service.id === id);
}

export function getServiceByHref(href: string): Service | undefined {
  return services.find((service) => service.href === href);
}
