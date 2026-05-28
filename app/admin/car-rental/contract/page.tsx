"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Printer, ArrowLeft, Car, ExternalLink } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";

// ── QR generator ──────────────────────────────────────────────────────────────
function useQRCode(url: string) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, { width: 90, margin: 1, color: { dark: "#000000", light: "#FFFFFF" } })
      .then(setSrc).catch(() => {});
  }, [url]);
  return src;
}

// ── Thin underline field ──────────────────────────────────────────────────────
function F({ label, value, flex = 1 }: { label: string; value?: string; flex?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, flex, minWidth: 0 }}>
      <span style={{ fontSize: 8.5, fontWeight: 700, whiteSpace: "nowrap", color: "#111", flexShrink: 0 }}>{label}:</span>
      <div style={{ flex: 1, borderBottom: "1px solid #111", minWidth: 60 }}>
        <span style={{ fontSize: 8.5, color: "#111", paddingLeft: 3 }}>{value || "\u00a0"}</span>
      </div>
    </div>
  );
}

// ── Checklist table ───────────────────────────────────────────────────────────
const LEFT_ITEMS = [
  "S/WHEEL","JACK","W/SPANNER","LIFESAVER","FIRST AID KIT",
  "FIRE EXTINGUISHER","FRONT WSCREEN","REAR WSCREEN","MUDGUARDS",
  "FRONT RIGHT","FRONT LEFT","REAR RIGHT","REAR LEFT","ENGINE",
  "OIL CAP","WATER CAP","RADIATOR","ALARM","OTHERS","JUMPER CABLES",
  "TOWEL","TOW ROPE",
];
const RIGHT_ITEMS = [
  "WINDOWS","FRONT RIGHT","FRONT LEFT","REAR RIGHT","REAR LEFT",
  "WHEEL CAPS","FRONT RIGHT","FRONT LEFT","REAR RIGHT","REAR LEFT",
  "NORMAL","FLOORMAT","PLASTICS","SPEAKERS","FRONT","REAR",
  "CD PLAYER","OTHERS","SPANNER No.10","SPECIAL NUT",
];
const RIGHT_HEADERS = [
  "WINDOWS","FRONT RIGHT","FRONT LEFT","REAR RIGHT","REAR LEFT",
  "WHEEL CAPS","FRONT RIGHT (M)","FRONT LEFT (M)","REAR RIGHT (M)","REAR LEFT (M)",
  "NORMAL","FLOORMAT","PLASTICS","SPEAKERS","FRONT","REAR",
  "CD PLAYER","OTHERS","SPANNER No.10","SPECIAL NUT",
];

const TERMS = [
  "The Vehicle is and remains the property of the owner and the hirer shall return it in the order and condition as when received, exception ordinary wear and tear, to the place the owner will communicate or such other place and at such other time as the owner was direct.",
  "The Hirer will not affect any major services notice and consent of the agent. The hirer is however still fully liable and responsible for the car.",
  "The vehicle should NEVER be used: (a) By any person without a valid driving license recognized in this country. (b) For any illegal or immoral purpose. (c) To propel or tow a vehicle or trailer. (d) Transport or carry NARCOTICS or other forbidden substances. (e) If the vehicle does not have a valid insurance. (f) In a rally speed or contest.",
  "The hirer is the authorized person to use the car and the specified period. If the period is exceeded, immediate contact or owner or other written agreement is needed else the vehicle will be considered stolen and or in unlawful use of motor vehicle and may report to the police.",
  "The owner shall insure the vehicle so as to comply with the laws of the land.",
  "The agent/owner shall not be liable to meet any claims in respect of death or of bodily harm to persons being carried in or getting on or alighting the vehicle.",
  "The hirer shall meet all the expenses which may result as a result of loss of minor parts at any one time during the period of the contract. This will include daily rates as agreed on the contract during repair period in case of an accident involving the client as well as the cost of repairing the damage.",
  "The hirer must pay KES 100,000 on top of what insurance will add and it will start for those days the car will be at the garage. The hirer will pay the excess fee for the insurance company when a claim is made as a result of an incident/accident while hirer was using the car.",
  "The hirer is solely responsible for all fines, penalties and for features imposed by reason of bleach by persons in control of vehicle of any law or by-law or other regulations of any competent authority. The hirer shall on completion of the hire, hand over to the agent/owner all demands, summon and notifications arising out of any offence in relation to the use of the vehicle as well as notification of any penalty and charges incurred during the period of hire.",
  "The hirer shall not during the hiring or thereafter sell or otherwise part with the possession or ownership of the vehicle otherwise than to the company.",
  "The owner may vary the vehicle hired provided the hirer has been given reasonable notice as to the intention by the owner.",
  "The hirer can terminate the contract by giving a 30-day notice or paying one month's equivalent — pay on immediate cancellation of the contract before agreed time. (*If contract longer than a month).",
  "The hirer will pay on demand all charges in accordance with this agreement.",
  "In the event of the Hirer breaching any terms of the agreement set out herein, the owner has the right to terminate the contract and take possession of the vehicle without recourse to court and the hirer shall be liable for all costs of such repossession.",
  "No waiver or variation of the terms hereof shall be binding to the owner unless authorized and signed by the owner.",
  "It is understood and agreed that any dispute under this contract shall be subject to the jurisdiction of the court of Kenya.",
];

// ── Car diagram SVG ───────────────────────────────────────────────────────────
function CarSVG() {
  return (
    <svg viewBox="0 0 180 250" style={{ width: "100%", height: "100%", display: "block" }}>
      {/* body */}
      <rect x="22" y="30" width="136" height="190" rx="28" fill="none" stroke="#333" strokeWidth="1.8"/>
      {/* windscreen front */}
      <rect x="38" y="50" width="104" height="32" rx="5" fill="none" stroke="#666" strokeWidth="1.2"/>
      {/* windscreen rear */}
      <rect x="38" y="168" width="104" height="32" rx="5" fill="none" stroke="#666" strokeWidth="1.2"/>
      {/* hood */}
      <rect x="48" y="32" width="84" height="18" rx="4" fill="#ECECEC" stroke="#AAA" strokeWidth="1"/>
      {/* boot */}
      <rect x="48" y="200" width="84" height="18" rx="4" fill="#ECECEC" stroke="#AAA" strokeWidth="1"/>
      {/* wheels */}
      <ellipse cx="22" cy="90" rx="11" ry="15" fill="#333" stroke="#111" strokeWidth="1.2"/>
      <ellipse cx="158" cy="90" rx="11" ry="15" fill="#333" stroke="#111" strokeWidth="1.2"/>
      <ellipse cx="22" cy="160" rx="11" ry="15" fill="#333" stroke="#111" strokeWidth="1.2"/>
      <ellipse cx="158" cy="160" rx="11" ry="15" fill="#333" stroke="#111" strokeWidth="1.2"/>
      {/* doors left */}
      <rect x="22" y="96" width="16" height="36" rx="2" fill="#E0E0E0" stroke="#999" strokeWidth="1"/>
      <rect x="22" y="138" width="16" height="30" rx="2" fill="#E0E0E0" stroke="#999" strokeWidth="1"/>
      {/* doors right */}
      <rect x="142" y="96" width="16" height="36" rx="2" fill="#E0E0E0" stroke="#999" strokeWidth="1"/>
      <rect x="142" y="138" width="16" height="30" rx="2" fill="#E0E0E0" stroke="#999" strokeWidth="1"/>
      {/* interior */}
      <rect x="42" y="88" width="96" height="74" rx="4" fill="#F8F8F8" stroke="#DDD" strokeWidth="1"/>
      {/* seats front */}
      <rect x="47" y="93" width="34" height="26" rx="4" fill="#D8D8D8" stroke="#AAA" strokeWidth="1"/>
      <rect x="99" y="93" width="34" height="26" rx="4" fill="#D8D8D8" stroke="#AAA" strokeWidth="1"/>
      {/* seats rear */}
      <rect x="47" y="130" width="86" height="24" rx="4" fill="#D8D8D8" stroke="#AAA" strokeWidth="1"/>
      {/* steering */}
      <circle cx="64" cy="108" r="7" fill="none" stroke="#666" strokeWidth="1.4"/>
      <line x1="64" y1="101" x2="64" y2="115" stroke="#666" strokeWidth="1"/>
      <line x1="57" y1="108" x2="71" y2="108" stroke="#666" strokeWidth="1"/>
      {/* labels */}
      <text x="90" y="26" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#333">FRONT</text>
      <text x="90" y="228" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#333">TAIL</text>
      <text x="11" y="125" textAnchor="middle" fontSize="6" fill="#555" transform="rotate(-90 11 125)">PASSENGER SIDE</text>
      <text x="169" y="125" textAnchor="middle" fontSize="6" fill="#555" transform="rotate(90 169 125)">DRIVER&apos;S SIDE</text>
    </svg>
  );
}

// ── Fuel gauge ────────────────────────────────────────────────────────────────
function FuelGauge({ label, filled }: { label: string; filled?: string }) {
  const levels = ["E", "¼", "½", "¾", "F"];
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 7, fontWeight: 700, marginBottom: 3, color: "#111" }}>{label}</div>
      <div style={{ display: "flex", gap: 1, justifyContent: "center" }}>
        {levels.map(l => (
          <div key={l} style={{
            width: 18, height: 16, border: "0.75px solid #555",
            background: filled === l ? "#333" : "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 5.5, color: filled === l ? "white" : "#333", fontWeight: 600,
          }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTRACT CONTENT
// ══════════════════════════════════════════════════════════════════════════════
function ContractContent() {
  const params    = useSearchParams();
  const raw       = params.get("prefill") || "{}";
  const prefill   = (() => { try { return JSON.parse(decodeURIComponent(raw)); } catch { return {}; } })();
  const termsUrl  = "https://www.savannalink.com/car-rental-terms";
  const qrSrc     = useQRCode(termsUrl);

  // Contract number
  const [contractNo] = useState(`MVT-${Date.now().toString(36).toUpperCase().slice(-7)}`);

  // Form state
  const [f, setF] = useState({
    name:         prefill.fullName        || prefill.customerName  || "",
    driversName:  prefill.driversName     || prefill.fullName      || "",
    idNo:         prefill.idNumber        || "",
    nationality:  prefill.nationality     || "Kenyan",
    placeOfWork:  prefill.placeOfWork     || "",
    residence:    prefill.residence       || "",
    primaryPhone: prefill.customerPhone   || prefill.phone         || "",
    secondPhone:  prefill.alternativePhone|| "",
    refName:      prefill.nextOfKinName   || "",
    contactNo:    prefill.nextOfKinPhone  || "",
    makeModel:    `${prefill.carMake||""} ${prefill.carModel||""}`.trim(),
    plateNo:      prefill.numberPlate     || "",
    checkedOut:   prefill.startDate       || "",
    destination:  prefill.destination     || "",
    noDays:       prefill.numberOfDays    || "",
    payPerDay:    prefill.dailyRate ? `KES ${Number(prefill.dailyRate).toLocaleString()}` : "",
    totalAmount:  prefill.totalAmount     ? `KES ${Number(prefill.totalAmount).toLocaleString()}` : "",
    dateOut:      prefill.startDate       || "",
    timeOut:      prefill.startTime       || "",
    dateIn:       prefill.endDate         || "",
    timeIn:       prefill.endTime         || "",
    kmOut:        prefill.mileage         || "",
    kmBack:       "",
    kmDriven:     "",
    fuelOut:      prefill.fuelLevel       || "Full",
    fuelBack:     "",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF(p => ({ ...p, [k]: e.target.value }));

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const content = document.getElementById("contract-print")?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank", "width=900,height=1200");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
<title>Hire Agreement — ${contractNo}</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:Arial,Helvetica,sans-serif; background:white; color:#111; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
input { border:none; outline:none; background:transparent; font-family:Arial,sans-serif; width:100%; }
@media print { @page { margin:6mm; size:A4; } }
</style></head><body>${content}</body></html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 500);
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
  const page: React.CSSProperties = {
    width: 794, background: "white", margin: "0 auto 0",
    fontFamily: "Arial, Helvetica, sans-serif", fontSize: 9, color: "#111",
    padding: "14px 20px 10px",
  };
  const input: React.CSSProperties = {
    border: "none", outline: "none", background: "transparent",
    fontFamily: "Arial, sans-serif", fontSize: 9, color: "#111", width: "100%",
  };
  const underline: React.CSSProperties = {
    borderBottom: "0.75px solid #111", flex: 1, paddingBottom: 1, minWidth: 40,
  };
  const label: React.CSSProperties = { fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 };
  const row: React.CSSProperties = { display: "flex", alignItems: "flex-end", gap: 5, marginBottom: 5 };
  const sectionTitle: React.CSSProperties = {
    fontWeight: 900, fontSize: 9.5, textTransform: "uppercase" as const,
    letterSpacing: ".04em", color: "#111", marginBottom: 6, marginTop: 10,
  };

  // ── Checklist cell ─────────────────────────────────────────────────────────
  const TD: React.CSSProperties = { border: "0.5px solid #AAA", padding: "1px 3px", fontSize: 7.5, whiteSpace: "nowrap" as const };
  const TH: React.CSSProperties = { ...TD, fontWeight: 700, background: "#F0F0F0", textAlign: "center" as const, fontSize: 7 };

  return (
    <div style={{ background: "#E5E7EB", minHeight: "100vh", padding: 20 }}>

      {/* ── Toolbar ── */}
      <div style={{ maxWidth: 854, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <Link href="/admin/car-rental" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151", textDecoration: "none", fontFamily: "system-ui" }}>
          <ArrowLeft style={{ width: 15, height: 15 }} />Back to Car Rental
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/car-rental-terms" target="_blank"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "white", border: "1px solid #D1D5DB", color: "#374151", fontSize: 13, textDecoration: "none", fontFamily: "system-ui" }}>
            <ExternalLink style={{ width: 13, height: 13 }} />Terms Page
          </a>
          <button onClick={handlePrint}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 8, background: "#050A14", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui" }}>
            <Printer style={{ width: 14, height: 14 }} />Print Contract
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PRINTABLE AREA                                                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div id="contract-print">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* PAGE 1 — FRONT                                                    */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{ ...page, pageBreakAfter: "always" as const }}>

          {/* ── HEADER ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1.5px solid #111", marginBottom: 8 }}>
            {/* Logo + brand */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" alt="Moventra" style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover" }} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-.01em", lineHeight: 1, color: "#111" }}>MOVENTRA</div>
                <div style={{ fontSize: 7.5, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".1em", color: "#555" }}>Safaris & Logistics Ltd</div>
                <div style={{ fontSize: 7, color: "#666", marginTop: 2 }}>Muthaiga Square, off Thika Rd, Nairobi</div>
                <div style={{ fontSize: 7, color: "#666" }}>www.savannalink.com · info@savannalink.com · 0727 247 032</div>
              </div>
            </div>
            {/* Title */}
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: ".06em", color: "#111" }}>HIRE / LEASE AGREEMENT</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#555" }}>OF A VEHICLE</div>
              <div style={{ marginTop: 5, display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700 }}>Contract No.:</span>
                <span style={{ fontSize: 11, fontWeight: 900, fontFamily: "monospace", borderBottom: "1px solid #111", paddingBottom: 1 }}>{contractNo}</span>
              </div>
            </div>
            {/* QR */}
            <div style={{ textAlign: "center" }}>
              {qrSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrSrc} alt="QR" style={{ width: 68, height: 68, display: "block", border: "0.5px solid #CCC" }} />
              )}
              <div style={{ fontSize: 6, color: "#777", marginTop: 2 }}>Scan for full T&Cs</div>
            </div>
          </div>

          {/* ── HIRES DETAILS ── */}
          <div style={{ ...sectionTitle, borderBottom: "0.75px solid #111", paddingBottom: 2 }}>Hires Details</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <div>
              <div style={row}><span style={label}>Name</span><div style={underline}><input style={input} value={f.name} onChange={set("name")} /></div></div>
              <div style={row}><span style={label}>ID/Passport No</span><div style={underline}><input style={input} value={f.idNo} onChange={set("idNo")} /></div></div>
              <div style={row}><span style={label}>Place of Work</span><div style={underline}><input style={input} value={f.placeOfWork} onChange={set("placeOfWork")} /></div></div>
              <div style={row}><span style={label}>Primary Phone No</span><div style={underline}><input style={input} value={f.primaryPhone} onChange={set("primaryPhone")} /></div></div>
              <div style={row}><span style={label}>Reference Name</span><div style={underline}><input style={input} value={f.refName} onChange={set("refName")} /></div></div>
            </div>
            <div>
              <div style={row}><span style={label}>Drivers Name</span><div style={underline}><input style={input} value={f.driversName} onChange={set("driversName")} /></div></div>
              <div style={row}><span style={label}>Nationality</span><div style={underline}><input style={input} value={f.nationality} onChange={set("nationality")} /></div></div>
              <div style={row}><span style={label}>Residence</span><div style={underline}><input style={input} value={f.residence} onChange={set("residence")} /></div></div>
              <div style={row}><span style={label}>Secondary Phone No</span><div style={underline}><input style={input} value={f.secondPhone} onChange={set("secondPhone")} /></div></div>
              <div style={row}><span style={label}>Contact No</span><div style={underline}><input style={input} value={f.contactNo} onChange={set("contactNo")} /></div></div>
            </div>
          </div>

          {/* ── CAR DETAILS ── */}
          <div style={{ ...sectionTitle, borderBottom: "0.75px solid #111", paddingBottom: 2, marginTop: 8 }}>Car Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <div>
              <div style={row}><span style={label}>Make/Model</span><div style={underline}><input style={input} value={f.makeModel} onChange={set("makeModel")} /></div></div>
              <div style={row}><span style={label}>Plate No</span><div style={underline}><input style={input} value={f.plateNo} onChange={set("plateNo")} /></div></div>
            </div>
            <div>
              <div style={row}><span style={label}>Car Checked out</span><div style={underline}><input style={input} value={f.checkedOut} onChange={set("checkedOut")} /></div></div>
              <div style={row}><span style={label}>Destination</span><div style={underline}><input style={input} value={f.destination} onChange={set("destination")} /></div></div>
            </div>
          </div>

          {/* ── CHECKLIST + DIAGRAM + GAUGES ── */}
          <div style={{ display: "grid", gridTemplateColumns: "168px 150px auto 96px", gap: 6, marginTop: 10, alignItems: "start" }}>

            {/* Left checklist */}
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ ...TH, width: 90, textAlign: "left" as const }}>DETAIL</th>
                  <th style={{ ...TH, width: 20 }}>OUT</th>
                  <th style={{ ...TH, width: 20 }}>IN</th>
                </tr>
              </thead>
              <tbody>
                {LEFT_ITEMS.map((item, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, width: 90 }}>{item}</td>
                    <td style={{ ...TD, width: 20 }}>&nbsp;</td>
                    <td style={{ ...TD, width: 20 }}>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Right checklist */}
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ ...TH, textAlign: "left" as const }}>DETAIL</th>
                  <th style={{ ...TH, width: 20 }}>OUT</th>
                  <th style={{ ...TH, width: 20 }}>IN</th>
                </tr>
              </thead>
              <tbody>
                {RIGHT_HEADERS.map((item, i) => (
                  <tr key={i}>
                    <td style={TD}>{item}</td>
                    <td style={{ ...TD, width: 20 }}>&nbsp;</td>
                    <td style={{ ...TD, width: 20 }}>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Centre column — fuel + mileage + car diagram */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {/* Fuel gauges */}
              <div style={{ border: "0.75px solid #AAA", padding: "5px 6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <FuelGauge label="FUEL OUT"  filled={f.fuelOut === "Full" ? "F" : f.fuelOut === "Empty" ? "E" : f.fuelOut} />
                  <FuelGauge label="FUEL BACK" />
                </div>
                {/* Mileage */}
                <div style={{ border: "0.75px solid #AAA", padding: "4px 5px", marginTop: 2 }}>
                  <div style={{ fontSize: 7, fontWeight: 700, marginBottom: 3, color: "#111" }}>MILEAGE</div>
                  {[["Km Back", f.kmBack], ["Km Out", f.kmOut], ["Km Driven", f.kmDriven]].map(([lbl, val], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "0.5px solid #CCC", marginBottom: 2, paddingBottom: 1, fontSize: 7 }}>
                      <span style={{ fontWeight: 700 }}>{lbl}</span>
                      <div style={{ borderBottom: "0.5px solid #AAA", minWidth: 60, textAlign: "right", fontSize: 7 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Car diagram */}
              <div style={{ border: "0.75px solid #AAA", padding: 4, flex: 1 }}>
                <CarSVG />
              </div>
            </div>

            {/* Right column — fingerprints */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ border: "0.75px solid #AAA", padding: "5px 6px", flex: 1 }}>
                <div style={{ fontSize: 7.5, fontWeight: 700, marginBottom: 4, color: "#111" }}>RIGHT FINGER PRINT</div>
                <div style={{ height: 74, border: "0.5px solid #CCC", background: "#FAFAFA" }} />
                <div style={{ fontSize: 7.5, fontWeight: 700, margin: "7px 0 4px", color: "#111" }}>LEFT FINGER PRINT</div>
                <div style={{ height: 74, border: "0.5px solid #CCC", background: "#FAFAFA" }} />
              </div>
            </div>
          </div>

          {/* ── HIRE PERIOD ── */}
          <div style={{ ...sectionTitle, borderBottom: "0.75px solid #111", paddingBottom: 2, marginTop: 8 }}>Hire Period</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 20px", marginBottom: 5 }}>
            <div style={row}><span style={label}>No. of Days</span><div style={underline}><input style={input} value={f.noDays} onChange={set("noDays")} /></div></div>
            <div style={row}><span style={label}>Pay per Day</span><div style={underline}><input style={input} value={f.payPerDay} onChange={set("payPerDay")} /></div></div>
            <div style={row}><span style={label}>Total Amount</span><div style={underline}><input style={input} value={f.totalAmount} onChange={set("totalAmount")} /></div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0 16px", marginBottom: 5 }}>
            <div style={row}><span style={label}>Date Out</span><div style={underline}><input style={input} value={f.dateOut} onChange={set("dateOut")} /></div></div>
            <div style={row}><span style={label}>Time Out</span><div style={underline}><input style={input} value={f.timeOut} onChange={set("timeOut")} /></div></div>
            <div style={row}><span style={label}>Date In</span><div style={underline}><input style={input} value={f.dateIn} onChange={set("dateIn")} /></div></div>
            <div style={row}><span style={label}>Time In</span><div style={underline}><input style={input} value={f.timeIn} onChange={set("timeIn")} /></div></div>
          </div>
          <p style={{ fontSize: 8, fontStyle: "italic", color: "#555", margin: "4px 0 8px" }}>
            b) <em>(with an option of renewal on expiry of the said period. Later return fees Ksh. 300/= per Hr)</em>
          </p>

          {/* ── PAGE 1 SIGNATURE ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 20px", marginTop: 6, borderTop: "0.75px solid #111", paddingTop: 6 }}>
            <div style={row}><span style={label}>Date</span><div style={underline}><input style={input} /></div></div>
            <div style={row}><span style={label}>Signature</span><div style={underline}><input style={input} /></div></div>
            <div style={row}><span style={label}>Name</span><div style={underline}><input style={input} /></div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 20px", marginTop: 4 }}>
            <div style={row}><span style={label}>Time</span><div style={underline}><input style={input} /></div></div>
          </div>

          {/* ── PAGE 1 FOOTER ── */}
          <div style={{ marginTop: 8, paddingTop: 5, borderTop: "0.5px solid #CCC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 7, color: "#777" }}>
              <strong style={{ color: "#111" }}>Moventra Safaris & Logistics Ltd</strong> · Muthaiga Square, off Thika Rd ·
              info@savannalink.com · www.savannalink.com · 0727 247 032
            </span>
            <span style={{ fontSize: 7, color: "#AAA" }}>Page 1 of 2</span>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* PAGE 2 — TERMS & CONDITIONS                                       */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{ ...page, pageBreakBefore: "always" as const }}>

          {/* Header strip */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 6, borderBottom: "1.5px solid #111", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" alt="Moventra" style={{ width: 36, height: 36, borderRadius: 5, objectFit: "cover" }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#111" }}>MOVENTRA <span style={{ fontWeight: 400, fontSize: 9 }}>Safaris & Logistics Ltd</span></div>
                <div style={{ fontSize: 6.5, color: "#777" }}>Contract No: <strong style={{ fontFamily: "monospace" }}>{contractNo}</strong> · Hire/Lease Agreement — Terms & Conditions</div>
              </div>
            </div>
            {qrSrc && (
              <div style={{ textAlign: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc} alt="QR" style={{ width: 48, height: 48, border: "0.5px solid #CCC" }} />
                <div style={{ fontSize: 5.5, color: "#999", marginTop: 1 }}>Full T&Cs online</div>
              </div>
            )}
          </div>

          {/* Terms title */}
          <div style={{ fontSize: 12, fontWeight: 900, color: "#111", marginBottom: 8, textDecoration: "underline", textUnderlineOffset: 3 }}>
            Further Terms and Conditions
          </div>

          {/* All 16 terms */}
          <ol style={{ paddingLeft: 16, margin: 0 }}>
            {TERMS.map((term, i) => (
              <li key={i} style={{ fontSize: 8, color: "#222", lineHeight: 1.65, marginBottom: i < TERMS.length - 1 ? 5 : 0 }}>
                {term}
              </li>
            ))}
          </ol>

          {/* Agreement line */}
          <div style={{ marginTop: 14, borderTop: "0.5px solid #CCC", paddingTop: 8 }}>
            <p style={{ fontSize: 8.5, fontStyle: "italic", marginBottom: 10, color: "#333" }}>
              I hereby agree to all items on this page and overleaf.
            </p>
            <p style={{ fontSize: 9, fontWeight: 700, marginBottom: 8 }}>Hirer</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 100px", gap: "0 16px" }}>
              <div style={row}><span style={label}>Name</span><div style={underline} /></div>
              <div style={row}><span style={label}>Signature</span><div style={underline} /></div>
              <div style={row}><span style={label}>Date</span><div style={underline}><span style={{ fontSize: 9, paddingLeft: 3 }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / 20</span></div></div>
              <div style={row}><div style={underline} /></div>
            </div>

            {/* Agent */}
            <p style={{ fontSize: 9, fontWeight: 700, margin: "10px 0 6px" }}>Authorised Agent / Owner</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
              <div style={row}><span style={label}>Name</span><div style={underline} /></div>
              <div style={row}><span style={label}>Signature</span><div style={underline} /></div>
              <div style={row}><span style={label}>Date</span><div style={underline}><span style={{ fontSize: 9, paddingLeft: 3 }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / 20</span></div></div>
            </div>

            {/* Stamp area */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <div style={{ width: 90, height: 60, border: "0.75px dashed #AAA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 7, color: "#BBB" }}>Company Stamp</span>
              </div>
            </div>
          </div>

          {/* ── PAGE 2 FOOTER ── */}
          <div style={{ marginTop: 10, paddingTop: 5, borderTop: "0.75px solid #111", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 7.5, fontWeight: 700, color: "#111" }}>Moventra Safaris & Logistics Ltd</div>
              <div style={{ fontSize: 7, color: "#666" }}>
                Muthaiga Square, off Thika Road, Nairobi &nbsp;|&nbsp;
                www.savannalink.com &nbsp;|&nbsp; info@savannalink.com &nbsp;|&nbsp; 0727 247 032
              </div>
            </div>
            <span style={{ fontSize: 7, color: "#AAA" }}>Page 2 of 2</span>
          </div>
        </div>

      </div>{/* end #contract-print */}
    </div>
  );
}

export default function ContractPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", height: "60vh", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "system-ui" }}>
        <Car style={{ width: 28, height: 28, color: "#F97316" }} />
        <span style={{ color: "#64748B" }}>Loading contract...</span>
      </div>
    }>
      <ContractContent />
    </Suspense>
  );
}
