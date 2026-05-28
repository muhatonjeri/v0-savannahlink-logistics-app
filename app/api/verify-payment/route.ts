// ── Payment Verification API ────────────────────────────────────
// Search by M-Pesa code, bank reference, booking ref, or receipt number
// across bookings, transactions, receipts, invoices

import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authErr = requireAuth(req); if (authErr) return authErr;
  try {
    const sb  = createAdminClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      return NextResponse.json([]);
    }
    const ref = new URL(req.url).searchParams.get("ref")?.trim();
    if (!ref || ref.length < 3) return NextResponse.json({ error: "ref required (min 3 chars)" }, { status: 400 });

    const like = `%${ref}%`;

    const [bookings, transactions, receipts, invoices] = await Promise.all([
      sb.from("bookings").select("*").or(`booking_ref.ilike.${like},payment_reference.ilike.${like}`).limit(10),
      sb.from("transactions").select("*").or(`reference.ilike.${like},payment_reference.ilike.${like}`).limit(10),
      sb.from("receipts").select("*").or(`receipt_number.ilike.${like},transaction_code.ilike.${like},booking_ref.ilike.${like}`).limit(10),
      sb.from("invoices").select("*").or(`invoice_number.ilike.${like},payment_reference.ilike.${like}`).limit(10),
    ]);

    const results = {
      bookings:     bookings.data     || [],
      transactions: transactions.data || [],
      receipts:     receipts.data     || [],
      invoices:     invoices.data     || [],
      total: (bookings.data?.length || 0) + (transactions.data?.length || 0) +
             (receipts.data?.length || 0) + (invoices.data?.length || 0),
    };

    return NextResponse.json(results);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
