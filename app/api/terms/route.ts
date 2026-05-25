import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// Default terms per service if none set in DB
const DEFAULT_TERMS: Record<string, string[]> = {
  "car-rental": [
    "Valid driving license (minimum 2 years) must be presented at vehicle collection.",
    "A refundable security deposit of KES 10,000–50,000 is required depending on vehicle class.",
    "Fuel is not included — vehicles are provided and must be returned on a full-to-full basis.",
    "The hirer is responsible for all traffic fines and parking fees incurred during the hire period.",
    "Vehicles must not be driven on unsurfaced roads unless a 4x4 vehicle has been hired for that purpose.",
    "Sub-letting or allowing an unauthorized person to drive the vehicle is strictly prohibited.",
    "Any damage, accident, or theft must be reported to Moventra and the police within 24 hours.",
    "Cross-border travel requires prior written approval and additional insurance documentation.",
    "Vehicles must be returned by the agreed time — late returns are charged at the daily rate pro-rata.",
    "Moventra reserves the right to repossess the vehicle if these terms are violated.",
  ],
  "safari-tours": [
    "All park entry fees are included in quoted packages unless explicitly stated otherwise.",
    "A 50% non-refundable deposit is required to confirm all safari bookings.",
    "Cancellations within 7 days of departure forfeit the full payment.",
    "Clients must have valid travel/medical insurance — Moventra is not liable for medical emergencies.",
    "Children under 5 may not be permitted in certain national parks — please confirm in advance.",
    "Photography of wildlife is permitted but flash photography near animals is prohibited.",
    "Clients must remain inside the vehicle during game drives unless instructed otherwise by the guide.",
    "Moventra is not responsible for delays due to weather, road conditions, or wildlife activity.",
    "Accommodation is allocated based on availability — specific room requests cannot be guaranteed.",
    "Itineraries may be adjusted at the guide's discretion for safety or wildlife viewing opportunities.",
  ],
  "transfers": [
    "Flight tracking is included — pickup times are adjusted for delays at no extra charge.",
    "60 minutes free waiting time is provided for airport arrivals. Beyond that, KES 500 per 30 minutes.",
    "Cancellations within 2 hours of scheduled pickup may attract a 50% cancellation fee.",
    "Clients must provide accurate flight numbers and destination addresses at booking.",
    "Moventra is not responsible for delays caused by traffic, weather, or road closures.",
    "Child seats must be requested in advance — availability is not guaranteed.",
    "Luggage is limited to what fits safely in the booked vehicle class.",
    "The driver will wait at the arrival gate with a name board unless otherwise instructed.",
    "Additional stops during transfers are subject to extra charges.",
    "Smoking, alcohol consumption, and eating are not permitted in Moventra vehicles.",
  ],
  "movers": [
    "A pre-move survey is mandatory for 3-bedroom houses and above.",
    "Moventra is not responsible for items not declared or improperly packed by the client.",
    "Basic transit insurance is included — additional coverage for high-value items must be declared.",
    "Access routes and elevator/stair availability must be accurately communicated at booking.",
    "Hazardous materials, illegal items, and live animals cannot be transported.",
    "Moventra crew will not move items from unauthorized premises (e.g., leased property with disputes).",
    "Payment in full is required before unloading at the destination.",
    "Any damage claims must be raised on the day of the move — no retrospective claims accepted.",
    "Weekend and public holiday moves attract a surcharge of 20%.",
    "Cancellations within 48 hours forfeit the booking deposit.",
  ],
  "road-recovery": [
    "Response times are estimates only — Moventra cannot guarantee arrival within a specific time.",
    "The client must ensure their safety and that of others at the scene before our arrival.",
    "Payment is required upon completion of the recovery service.",
    "Moventra is not responsible for pre-existing vehicle damage.",
    "Towing destination is the client's choice subject to route accessibility.",
    "Recovery from private property requires the property owner's permission.",
    "Moventra crew have the right to refuse unsafe or illegal towing requests.",
    "For accident scenes, a police abstract may be required before vehicle release.",
    "Long-distance towing (over 200km) requires full payment in advance.",
    "Moventra is not liable for secondary damage occurring during towing due to pre-existing mechanical faults.",
  ],
  "cargo-handling": [
    "All cargo must be accurately described — misdeclaration of weight or contents voids insurance.",
    "Moventra is not responsible for cargo not properly packed by the client.",
    "Hazardous, illegal, or restricted goods cannot be transported without prior written approval.",
    "Basic transit protection is included — all-risk insurance must be requested at booking.",
    "The declared cargo value is used for insurance purposes — ensure it is accurate.",
    "Moventra is not liable for delays caused by traffic, weather, strikes, or customs.",
    "Clients must provide a valid recipient contact and full delivery address.",
    "Any shortages or damage must be noted on the delivery receipt at the time of delivery.",
    "Storage beyond agreed period will be charged at the daily warehousing rate.",
    "Restricted items include alcohol, tobacco, firearms, and pharmaceuticals without proper licensing.",
  ],
  "shipment-imports": [
    "All import documentation (invoice, packing list, BL/AWB) must be provided promptly to avoid demurrage.",
    "KRA customs duty and other government levies are payable by the client.",
    "Moventra will advance customs duty subject to pre-authorization and immediate reimbursement.",
    "Delays caused by incorrect or incomplete documentation are not Moventra's responsibility.",
    "Clients are responsible for obtaining import permits, IDF, and pre-shipment inspections.",
    "Cargo must comply with Kenya Bureau of Standards (KEBS) requirements.",
    "Demurrage and storage charges at port accrue from day of vessel arrival.",
    "Moventra's clearing fees do not include port charges, KRA duties, or government levies.",
    "Vehicle imports are subject to KEBS inspection and NTSA age restrictions.",
    "Clients must hold a valid KRA PIN for all commercial imports.",
  ],
  "construction-equipment": [
    "All equipment is subject to a pre-hire inspection — any pre-existing damage is documented.",
    "The client is fully responsible for all damage, theft, or loss during the hire period.",
    "Only certified and licensed operators may operate Moventra equipment (bare hire).",
    "Fuel, lubricants, and daily operator allowance (if applicable) are the client's responsibility.",
    "Equipment must be used only for its intended purpose and not overloaded.",
    "Access to site and ground suitability must be confirmed before delivery.",
    "Equipment must be returned clean and in the same condition as delivered.",
    "Minimum hire period is 1 working day (8 hours) — half-day rates apply for select equipment.",
    "Client is liable for breakdown costs caused by misuse or negligence.",
    "A signed hire agreement and deposit cheque are required before equipment deployment.",
  ],
  "corporate-rental": [
    "A signed Master Service Agreement (MSA) is required before fleet deployment.",
    "Vehicles may only be driven by authorized drivers listed in the MSA.",
    "All traffic fines, penalties, and parking fees are the client company's responsibility.",
    "Fuel management is the client's responsibility unless a fuel card arrangement is agreed.",
    "Monthly invoices are due within 14 days of issuance — late payment attracts 2% per month.",
    "Moventra reserves the right to withdraw vehicles if payment is more than 30 days overdue.",
    "Contract renewal terms must be agreed 30 days before expiry.",
    "GPS tracking data may be shared with the client company's fleet manager on request.",
    "Vehicles must be returned in the same condition — fair wear and tear excepted.",
    "Moventra provides a replacement vehicle within 4 hours in case of breakdown.",
  ],
};

export async function GET(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const serviceId = new URL(req.url).searchParams.get("service");

    if (serviceId) {
      const { data } = await sb.from("service_terms").select("*").eq("service_id", serviceId).single();
      const terms = data?.terms || DEFAULT_TERMS[serviceId] || [];
      return NextResponse.json({ serviceId, terms, customized: !!data });
    }

    // Return all terms
    const { data } = await sb.from("service_terms").select("*");
    return NextResponse.json(data || []);
  } catch {
    // Table may not exist yet — return defaults
    const serviceId = new URL(req.url).searchParams.get("service");
    if (serviceId) {
      return NextResponse.json({ serviceId, terms: DEFAULT_TERMS[serviceId] || [], customized: false });
    }
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const { serviceId, terms } = await req.json();
    const { error } = await sb.from("service_terms").upsert({ service_id: serviceId, terms, updated_at: new Date().toISOString() }, { onConflict: "service_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
