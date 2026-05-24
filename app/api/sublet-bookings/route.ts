import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const sb = createAdminClient();
    const { data, error } = await sb.from("sublet_bookings").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const body = await req.json();
    const { data, error } = await sb.from("sublet_bookings").insert([{
      vehicle_id: body.vehicleId,
      client_id: body.clientId || null,
      service_type: body.serviceType,
      area_of_use: body.areaOfUse,
      client_name: body.clientName,
      client_phone: body.clientPhone,
      start_date: body.startDate,
      end_date: body.endDate,
      number_of_days: body.numberOfDays,
      supplier_daily_rate: body.supplierDailyRate,
      our_daily_rate: body.ourDailyRate,
      total_supplier_cost: body.totalSupplierCost,
      total_client_charge: body.totalClientCharge,
      expenses: body.expenses || [],
      total_expenses: body.totalExpenses || 0,
      net_profit: body.netProfit,
      profit_per_day: body.profitPerDay,
      status: body.status || "active",
      payment_method: body.paymentMethod,
      payment_reference: body.paymentReference,
      amount_paid: body.amountPaid || 0,
      notes: body.notes,
    }]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const { id, ...updates } = await req.json();
    const { data, error } = await sb.from("sublet_bookings").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
