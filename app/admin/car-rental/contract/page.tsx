"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Printer, Download, QrCode, ArrowLeft, Car } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";

// ─── QR code generator ────────────────────────────────────────────────────────
function useQRCode(url: string) {
  const [dataUrl, setDataUrl] = useState("");
  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, {
      width: 120, margin: 1,
      color: { dark: "#050A14", light: "#FFFFFF" },
    }).then(setDataUrl).catch(() => {});
  }, [url]);
  return dataUrl;
}

// ─── Field line ───────────────────────────────────────────────────────────────
function FL({ label, value, wide }: { label: string; value?: string; wide?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 6, width: wide ? "100%" : undefined }}>
      <span style={{ fontSize: 9, fontWeight: 700, whiteSpace: "nowrap", color: "#1a1a1a", minWidth: 0 }}>{label}:</span>
      <div style={{ flex: 1, borderBottom: "1px solid #1a1a1a", minWidth: 80, paddingBottom: 1 }}>
        <span style={{ fontSize: 9, color: "#1a1a1a" }}>{value || ""}</span>
      </div>
    </div>
  );
}

// ─── Checklist row ────────────────────────────────────────────────────────────
function CR({ items }: { items: { label: string; out?: boolean; inn?: boolean }[] }) {
  return (
    <>
      {items.map((item, i) => (
        <tr key={i} style={{ borderBottom: "0.5px solid #ccc" }}>
          <td style={{ fontSize: 7.5, padding: "1.5px 4px", borderRight: "0.5px solid #ccc" }}>{item.label}</td>
          <td style={{ fontSize: 7.5, padding: "1.5px 4px", textAlign: "center", borderRight: "0.5px solid #ccc", width: 18 }}>{item.out ? "✓" : ""}</td>
          <td style={{ fontSize: 7.5, padding: "1.5px 4px", textAlign: "center", width: 18 }}>{item.inn ? "✓" : ""}</td>
        </tr>
      ))}
    </>
  );
}

// ─── Car diagram SVG ──────────────────────────────────────────────────────────
function CarDiagram() {
  return (
    <svg viewBox="0 0 200 280" width="160" height="224" style={{ display: "block", margin: "0 auto" }}>
      {/* Car body top-down view */}
      {/* Outer body */}
      <rect x="30" y="40" width="140" height="200" rx="30" fill="none" stroke="#333" strokeWidth="2"/>
      {/* Windscreen front */}
      <rect x="45" y="60" width="110" height="35" rx="6" fill="none" stroke="#666" strokeWidth="1.5"/>
      {/* Windscreen rear */}
      <rect x="45" y="185" width="110" height="35" rx="6" fill="none" stroke="#666" strokeWidth="1.5"/>
      {/* Hood */}
      <rect x="55" y="42" width="90" height="20" rx="4" fill="#f0f0f0" stroke="#aaa" strokeWidth="1"/>
      {/* Boot */}
      <rect x="55" y="218" width="90" height="20" rx="4" fill="#f0f0f0" stroke="#aaa" strokeWidth="1"/>
      {/* Left doors */}
      <rect x="30" y="104" width="18" height="40" rx="3" fill="#e8e8e8" stroke="#999" strokeWidth="1"/>
      <rect x="30" y="152" width="18" height="36" rx="3" fill="#e8e8e8" stroke="#999" strokeWidth="1"/>
      {/* Right doors */}
      <rect x="152" y="104" width="18" height="40" rx="3" fill="#e8e8e8" stroke="#999" strokeWidth="1"/>
      <rect x="152" y="152" width="18" height="36" rx="3" fill="#e8e8e8" stroke="#999" strokeWidth="1"/>
      {/* Wheels */}
      <ellipse cx="30" cy="100" rx="12" ry="16" fill="#333" stroke="#111" strokeWidth="1.5"/>
      <ellipse cx="170" cy="100" rx="12" ry="16" fill="#333" stroke="#111" strokeWidth="1.5"/>
      <ellipse cx="30" cy="180" rx="12" ry="16" fill="#333" stroke="#111" strokeWidth="1.5"/>
      <ellipse cx="170" cy="180" rx="12" ry="16" fill="#333" stroke="#111" strokeWidth="1.5"/>
      {/* Interior */}
      <rect x="52" y="100" width="96" height="80" rx="4" fill="#f9f9f9" stroke="#ccc" strokeWidth="1"/>
      {/* Seats front */}
      <rect x="57" y="105" width="36" height="28" rx="4" fill="#ddd" stroke="#aaa" strokeWidth="1"/>
      <rect x="107" y="105" width="36" height="28" rx="4" fill="#ddd" stroke="#aaa" strokeWidth="1"/>
      {/* Seats rear */}
      <rect x="57" y="145" width="86" height="26" rx="4" fill="#ddd" stroke="#aaa" strokeWidth="1"/>
      {/* Steering wheel */}
      <circle cx="75" cy="120" r="8" fill="none" stroke="#666" strokeWidth="1.5"/>
      {/* Labels */}
      <text x="100" y="36" textAnchor="middle" fontSize="8" fontWeight="700" fill="#333">FRONT</text>
      <text x="100" y="274" textAnchor="middle" fontSize="8" fontWeight="700" fill="#333">TAIL</text>
      <text x="12" y="142" textAnchor="middle" fontSize="7" fill="#555" transform="rotate(-90,12,142)">PASSENGER SIDE</text>
      <text x="188" y="142" textAnchor="middle" fontSize="7" fill="#555" transform="rotate(90,188,142)">DRIVER'S SIDE</text>
    </svg>
  );
}

// ─── Contract page ────────────────────────────────────────────────────────────
function ContractContent() {
  const params = useSearchParams();
  const printRef = useRef<HTMLDivElement>(null);

  const termsUrl = typeof window !== "undefined"
    ? `${window.location.origin}/car-rental-terms`
    : "https://www.savannalink.com/car-rental-terms";

  const qrDataUrl = useQRCode(termsUrl);

  // Parse prefill data from URL
  const prefillRaw = params.get("prefill") || "{}";
  const data = (() => { try { return JSON.parse(decodeURIComponent(prefillRaw)); } catch { return {}; } })();

  const [form, setForm] = useState({
    // Hirer details
    name:           data.customerName   || data.fullName       || "",
    driversName:    data.driversName    || data.fullName       || "",
    idNo:           data.idNumber       || "",
    nationality:    data.nationality    || "Kenyan",
    placeOfWork:    data.placeOfWork    || "",
    residence:      data.residence      || "",
    primaryPhone:   data.customerPhone  || data.phone          || "",
    secondaryPhone: data.alternativePhone || "",
    referenceName:  data.nextOfKinName  || "",
    contactNo:      data.nextOfKinPhone || "",
    // Car details
    makeModel:      `${data.carMake || ""} ${data.carModel || ""}`.trim(),
    platNo:         data.numberPlate    || "",
    checkedOut:     data.startDate      || "",
    destination:    data.destination    || "",
    // Hire period
    noDays:         data.numberOfDays   || "",
    payPerDay:      data.dailyRate      || "",
    totalAmount:    data.totalAmount    || "",
    dateOut:        data.startDate      || "",
    timeOut:        data.startTime      || "",
    dateIn:         data.endDate        || "",
    timeIn:         data.endTime        || "",
    // Mileage & fuel
    kmBack:         "",
    kmOut:          data.mileage        || "",
    kmDriver:       "",
    fuelOut:        data.fuelLevel      || "Full",
    fuelBack:       "",
    contractNo:     `MVT-${Date.now().toString(36).toUpperCase().slice(-6)}`,
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const checklist1 = [
    "S / WHEEL","JACK","W / SPANNER","LIFESAVER","FIRST AID KIT","FIRE EXTINGUISHER",
    "FRONT WSCREEN","REAR WSCREEN","MUDGUARDS","FRONT RIGHT","FRONT LEFT",
    "REAR RIGHT","REAR LEFT","ENGINE","OIL CAP","WATER CAP","RADIATOR","ALARM",
    "OTHERS","JUMPER CABLES","TOWEL","TOW ROPE",
  ];
  const checklist2 = [
    "WINDOWS","FRONT RIGHT","FRONT LEFT","REAR RIGHT","REAR LEFT","WHEEL CAPS",
    "FRONT RIGHT","FRONT LEFT","REAR RIGHT","REAR LEFT","NORMAL","FLOORMAT",
    "PLASTICS","SPEAKERS","FRONT","REAR","CD PLAYER","OTHERS","SPANNER No. 10","SPECIAL NUT",
  ];
  const checklist2Labels = [
    "WINDOWS","FRONT RIGHT","FRONT LEFT","REAR RIGHT","REAR LEFT","WHEEL CAPS",
    "REAR RIGHT","REAR LEFT","REAR RIGHT","REAR LEFT","NORMAL","FLOORMAT",
    "PLASTICS","SPEAKERS","FRONT","REAR","CD PLAYER","OTHERS","SPANNER No. 10","SPECIAL NUT",
  ];
  const checklist2Header = [
    "WINDOWS","FRONT RIGHT","FRONT LEFT","REAR RIGHT","REAR LEFT","WHEEL CAPS",
    "FRONT RIGHT","FRONT LEFT","REAR RIGHT","REAR LEFT","NORMAL","FLOORMAT",
    "PLASTICS","SPEAKERS","FRONT","REAR","CD PLAYER","OTHERS","SPANNER No. 10","SPECIAL NUT",
  ];

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank", "width=900,height=1200");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head>
<title>Hire Agreement — ${form.contractNo}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Arial',sans-serif; background:white; color:#1a1a1a; }
  @media print { body { margin:0; } @page { margin:10mm; size:A4; } }
  .no-print { display:none; }
  input { border:none; outline:none; background:transparent; font-size:9px; width:100%; }
  table { border-collapse:collapse; }
</style>
</head><body>
${printRef.current.innerHTML}
</body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 600);
  };

  const inputStyle: React.CSSProperties = {
    border: "none", outline: "none", background: "transparent",
    fontSize: 9, width: "100%", color: "#1a1a1a",
    fontFamily: "Arial, sans-serif",
  };

  const pageStyle: React.CSSProperties = {
    width: 794, background: "white", margin: "0 auto",
    fontFamily: "Arial, sans-serif", color: "#1a1a1a", fontSize: 9,
    padding: "20px 28px",
  };

  return (
    <div style={{ background: "#F1F5F9", minHeight: "100vh", padding: "20px 16px" }}>
      {/* Toolbar */}
      <div style={{ maxWidth: 860, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <Link href="/admin/car-rental" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748B", textDecoration: "none" }}>
          <ArrowLeft style={{ width: 14, height: 14 }} />Back to Car Rental
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handlePrint}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 10, background: "#050A14", border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Printer style={{ width: 14, height: 14 }} />Print Contract
          </button>
          <a href="/car-rental-terms" target="_blank"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 10, background: "#F97316", border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>
            <QrCode style={{ width: 14, height: 14 }} />View Terms Page
          </a>
        </div>
      </div>

      {/* ── CONTRACT SHEET ── */}
      <div ref={printRef} style={pageStyle}>

        {/* ═══ HEADER ═══ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingBottom: 10, borderBottom: "2px solid #F97316" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="Moventra" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", border: "1.5px solid #F97316" }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#050A14", letterSpacing: "-.01em", lineHeight: 1 }}>MOVENTRA</div>
              <div style={{ fontSize: 9, color: "#F97316", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 700 }}>Safaris & Logistics Ltd</div>
              <div style={{ fontSize: 7.5, color: "#64748B", marginTop: 2 }}>Muthaiga Square, off Thika Rd, Nairobi</div>
              <div style={{ fontSize: 7.5, color: "#64748B" }}>www.savannalink.com · info@savannalink.com · 0727 247 032</div>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#050A14", textTransform: "uppercase", letterSpacing: ".04em" }}>HIRE / LEASE AGREEMENT</div>
            <div style={{ fontSize: 11, color: "#F97316", fontWeight: 700 }}>OF A VEHICLE</div>
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700 }}>Contract No.:</span>
              <span style={{ fontSize: 11, fontWeight: 900, color: "#F97316", fontFamily: "monospace", borderBottom: "1.5px solid #F97316", paddingBottom: 1 }}>{form.contractNo}</span>
            </div>
          </div>
          {/* QR Code */}
          <div style={{ textAlign: "center" }}>
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="QR Terms" style={{ width: 72, height: 72, display: "block", border: "1px solid #E2E8F0", borderRadius: 6 }} />
            )}
            <div style={{ fontSize: 6.5, color: "#64748B", marginTop: 3, textAlign: "center" }}>Scan for T&Cs</div>
          </div>
        </div>

        {/* ═══ HIRES DETAILS ═══ */}
        <div style={{ background: "#F97316", color: "white", fontWeight: 900, fontSize: 9, padding: "3px 8px", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".08em" }}>
          Hirer Details
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px", marginBottom: 10 }}>
          <div>
            <FL label="Name" value={form.name} />
            <FL label="Driver's Name" value={form.driversName} />
            <FL label="ID/Passport No" value={form.idNo} />
            <FL label="Nationality" value={form.nationality} />
            <FL label="Place of Work" value={form.placeOfWork} />
            <FL label="Residence" value={form.residence} />
          </div>
          <div>
            <FL label="Primary Phone No" value={form.primaryPhone} />
            <FL label="Secondary Phone No" value={form.secondaryPhone} />
            <FL label="Reference Name" value={form.referenceName} />
            <FL label="Contact No" value={form.contactNo} />
          </div>
        </div>

        {/* ═══ CAR DETAILS ═══ */}
        <div style={{ background: "#050A14", color: "white", fontWeight: 900, fontSize: 9, padding: "3px 8px", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".08em" }}>
          Car Details
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px", marginBottom: 12 }}>
          <div>
            <FL label="Make / Model" value={form.makeModel} />
            <FL label="Plate No" value={form.platNo} />
          </div>
          <div>
            <FL label="Car Checked Out" value={form.checkedOut} />
            <FL label="Destination" value={form.destination} />
          </div>
        </div>

        {/* ═══ CHECKLIST + DIAGRAM ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 180px 140px", gap: 8, marginBottom: 12 }}>

          {/* Checklist left */}
          <table style={{ border: "1px solid #999", fontSize: 7.5 }}>
            <thead>
              <tr style={{ background: "#F0F0F0" }}>
                <th style={{ padding: "2px 4px", borderRight: "0.5px solid #ccc", textAlign: "left", width: 90 }}>DETAIL</th>
                <th style={{ padding: "2px 4px", borderRight: "0.5px solid #ccc", width: 18 }}>OUT</th>
                <th style={{ padding: "2px 4px", width: 18 }}>IN</th>
              </tr>
            </thead>
            <tbody>
              {checklist1.map((label, i) => (
                <tr key={i} style={{ borderBottom: "0.5px solid #ddd" }}>
                  <td style={{ fontSize: 7.5, padding: "1.5px 4px", borderRight: "0.5px solid #ccc" }}>{label}</td>
                  <td style={{ width: 18, borderRight: "0.5px solid #ccc" }}></td>
                  <td style={{ width: 18 }}></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Checklist right */}
          <table style={{ border: "1px solid #999", fontSize: 7.5 }}>
            <thead>
              <tr style={{ background: "#F0F0F0" }}>
                <th style={{ padding: "2px 4px", borderRight: "0.5px solid #ccc", textAlign: "left", width: 90 }}>DETAIL</th>
                <th style={{ padding: "2px 4px", borderRight: "0.5px solid #ccc", width: 18 }}>OUT</th>
                <th style={{ padding: "2px 4px", width: 18 }}>IN</th>
              </tr>
            </thead>
            <tbody>
              {checklist2Header.map((label, i) => (
                <tr key={i} style={{ borderBottom: "0.5px solid #ddd" }}>
                  <td style={{ fontSize: 7.5, padding: "1.5px 4px", borderRight: "0.5px solid #ccc" }}>{label}</td>
                  <td style={{ width: 18, borderRight: "0.5px solid #ccc" }}></td>
                  <td style={{ width: 18 }}></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Fuel + Mileage panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Fuel gauges */}
            <div style={{ border: "1px solid #999", padding: 6, borderRadius: 4 }}>
              <div style={{ fontSize: 8, fontWeight: 700, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                <span>FUEL OUT</span><span>FUEL BACK</span>
              </div>
              {/* Fuel gauge OUT */}
              <div style={{ display: "flex", gap: 4, justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 7, color: "#666", marginBottom: 2 }}>OUT</div>
                  <div style={{ display: "flex", gap: 1 }}>
                    {["E","1/4","1/2","3/4","F"].map((lv) => (
                      <div key={lv} style={{ width: 16, height: 14, border: "0.5px solid #999", background: form.fuelOut === (lv === "E" ? "Empty" : lv === "F" ? "Full" : lv) ? "#F97316" : "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 5 }}>
                        {lv}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 7, color: "#666", marginBottom: 2 }}>BACK</div>
                  <div style={{ display: "flex", gap: 1 }}>
                    {["E","¼","½","¾","F"].map((lv) => (
                      <div key={lv} style={{ width: 16, height: 14, border: "0.5px solid #999", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 5 }}>
                        {lv}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Mileage */}
            <div style={{ border: "1px solid #999", padding: 6, borderRadius: 4 }}>
              <div style={{ fontSize: 8, fontWeight: 700, marginBottom: 6 }}>MILEAGE</div>
              {[["Km Back", form.kmBack], ["Km Out", form.kmOut], ["Km Driven", form.kmDriver]].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 7.5 }}>
                  <span>{label}</span>
                  <div style={{ borderBottom: "0.5px solid #999", minWidth: 60, textAlign: "right" }}>
                    <span>{val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Car diagram + fingerprints */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ border: "1px solid #999", padding: 4, borderRadius: 4 }}>
              <CarDiagram />
            </div>
            <div style={{ border: "1px solid #999", padding: 6, borderRadius: 4, flex: 1 }}>
              <div style={{ fontSize: 7.5, fontWeight: 700, marginBottom: 4 }}>RIGHT FINGER PRINT</div>
              <div style={{ height: 40, border: "0.5px solid #ccc", borderRadius: 4, background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 6.5, color: "#999" }}>Place thumb here</span>
              </div>
              <div style={{ fontSize: 7.5, fontWeight: 700, margin: "6px 0 4px" }}>LEFT FINGER PRINT</div>
              <div style={{ height: 40, border: "0.5px solid #ccc", borderRadius: 4, background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 6.5, color: "#999" }}>Place thumb here</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ HIRE PERIOD ═══ */}
        <div style={{ background: "#F97316", color: "white", fontWeight: 900, fontSize: 9, padding: "3px 8px", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".08em" }}>
          Hire Period
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 20px", marginBottom: 8 }}>
          <FL label="No. of Days" value={form.noDays} />
          <FL label="Pay per Day" value={form.payPerDay ? `KES ${Number(form.payPerDay).toLocaleString()}` : ""} />
          <FL label="Total Amount" value={form.totalAmount ? `KES ${Number(form.totalAmount).toLocaleString()}` : ""} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0 16px", marginBottom: 8 }}>
          <FL label="Date Out" value={form.dateOut} />
          <FL label="Time Out" value={form.timeOut} />
          <FL label="Date In" value={form.dateIn} />
          <FL label="Time In" value={form.timeIn} />
        </div>
        <p style={{ fontSize: 8, fontStyle: "italic", color: "#555", margin: "6px 0 10px" }}>
          b) <em>(with an option of renewal on expiry of the said period. Later return fees KSh. 300/= per Hr)</em>
        </p>

        {/* ═══ KEY TERMS (condensed) ═══ */}
        <div style={{ background: "#050A14", color: "white", fontWeight: 900, fontSize: 9, padding: "3px 8px", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".08em" }}>
          Terms & Conditions Summary — Full terms at savannalink.com/car-rental-terms
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 20px", marginBottom: 10 }}>
          {[
            "1. Vehicle remains property of owner. Return in same condition.",
            "2. Hirer is fully liable and responsible for the car at all times.",
            "3. Vehicle shall not be used for illegal, immoral or racing purposes.",
            "4. Exceeding hire period without notice = vehicle considered stolen.",
            "5. Owner insures vehicle to comply with laws of the land.",
            "6. Owner not liable for death/injury of persons using the vehicle.",
            "7. Hirer meets all expenses from loss of parts or accident damage.",
            "8. Hirer pays KES 100,000 excess + garage daily rate during repairs.",
            "9. Hirer is solely responsible for all fines and penalties incurred.",
            "10. Hirer shall not sell or transfer ownership of the vehicle.",
            "11. Owner may vary vehicle hired with reasonable notice.",
            "12. Hirer may terminate with 30-day notice (or 1-month pay if longer).",
            "13. Hirer pays all charges in accordance with this agreement.",
            "14. Breach of terms — owner may repossess vehicle without court order.",
            "15. No variation to terms unless authorized in writing by owner.",
            "16. Disputes subject to jurisdiction of the courts of Kenya.",
          ].map((term, i) => (
            <p key={i} style={{ fontSize: 7, color: "#374151", margin: 0, lineHeight: 1.5 }}>{term}</p>
          ))}
        </div>

        {/* ═══ SIGNATURE BLOCK ═══ */}
        <div style={{ borderTop: "1.5px solid #F97316", paddingTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0 16px" }}>
          {[
            ["I agree to all terms above",""],
            ["Hirer Signature",""],
            ["Date","          /          /20    "],
            ["Time",""],
          ].map(([label, hint]) => (
            <div key={label}>
              <p style={{ fontSize: 7, color: "#666", marginBottom: 4 }}>{label}:</p>
              <div style={{ borderBottom: "1px solid #1a1a1a", height: 20, paddingBottom: 2 }}>
                <span style={{ fontSize: 8, color: "#aaa" }}>{hint}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ FOOTER ═══ */}
        <div style={{ marginTop: 12, paddingTop: 8, borderTop: "0.5px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 7.5, color: "#64748B" }}>
            <strong style={{ color: "#050A14" }}>Moventra Safaris & Logistics Ltd</strong> ·
            Muthaiga Square, off Thika Road, Nairobi ·
            info@savannalink.com · www.savannalink.com · 0727 247 032
          </div>
          {qrDataUrl && (
            <div style={{ textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR" style={{ width: 36, height: 36, border: "0.5px solid #ccc", borderRadius: 3 }} />
              <div style={{ fontSize: 6, color: "#999", marginTop: 1 }}>Full T&Cs</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function ContractPage() {
  return (
    <Suspense fallback={
      <div style={{ display:"flex", height:"60vh", alignItems:"center", justifyContent:"center" }}>
        <Car style={{ width:32, height:32, color:"#F97316", animation:"spin 1s linear infinite" }} />
      </div>
    }>
      <ContractContent />
    </Suspense>
  );
}
