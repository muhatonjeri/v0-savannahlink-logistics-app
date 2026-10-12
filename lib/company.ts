// ══════════════════════════════════════════════════════════════════
// Moventra company & payment details — the ONE place to change them.
// Used by invoices, receipts, emails, SMS and WhatsApp messages, so a
// paybill or PIN change here updates every document and message.
// Optional fields left as "" are hidden on documents.
// ══════════════════════════════════════════════════════════════════

export const COMPANY = {
  name: "Moventra Safaris & Logistics Ltd",
  tagline: "Experience. Move. Deliver. Beyond Borders.",
  address: "Muthaiga Square, off Thika Rd",
  city: "Nairobi, Kenya",
  phone: "+254 727 247 032",
  email: "info@moventrasafarislogisticsltd.com",
  website: "www.moventrasafarislogisticsltd.com",
  kraPin: "P052540073A",
  bankName: "I&M Bank Kenya Ltd",
  bankAccount: "0100 9406 6363 50",
  bankBranch: "Nairobi Main Branch",
  mpesaPaybill: "542542",
  mpesaAccountNo: "247032",
} as const;

/** One-line payment instruction for SMS / WhatsApp / email text. */
export const MPESA_PAY_TEXT = `M-Pesa Paybill ${COMPANY.mpesaPaybill}, Account ${COMPANY.mpesaAccountNo}`;
