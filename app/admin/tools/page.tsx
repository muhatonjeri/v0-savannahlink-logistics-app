"use client";
import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw, DollarSign, Calculator, Globe, Fuel,
  ReceiptText, MapPin, Zap, Clock,
} from "lucide-react";

/* ── Data ─────────────────────────────────────────────────────────────────── */
const CURRENCIES = [
  { code:"KES", sym:"KES ",  name:"Kenyan Shilling"    },
  { code:"USD", sym:"$",     name:"US Dollar"          },
  { code:"EUR", sym:"€",     name:"Euro"               },
  { code:"GBP", sym:"£",     name:"British Pound"      },
  { code:"AED", sym:"AED ",  name:"UAE Dirham"         },
  { code:"TZS", sym:"TZS ",  name:"Tanzanian Shilling" },
  { code:"UGX", sym:"UGX ",  name:"Ugandan Shilling"   },
  { code:"INR", sym:"₹",     name:"Indian Rupee"       },
  { code:"ZAR", sym:"R",     name:"S. African Rand"    },
  { code:"CNY", sym:"¥",     name:"Chinese Yuan"       },
  { code:"RWF", sym:"RWF ",  name:"Rwandan Franc"      },
  { code:"GHS", sym:"₵",     name:"Ghanaian Cedi"      },
  { code:"NGN", sym:"₦",     name:"Nigerian Naira"     },
];
const FALLBACK: Record<string,number> = {
  KES:1,USD:0.0077,EUR:0.0071,GBP:0.006,AED:0.0283,
  TZS:20,UGX:29,INR:0.64,ZAR:0.14,CNY:0.056,RWF:10.1,GHS:0.12,NGN:6.2,
};
const ZONES = [
  { city:"Nairobi",       tz:"Africa/Nairobi",        flag:"🇰🇪" },
  { city:"Dubai",         tz:"Asia/Dubai",            flag:"🇦🇪" },
  { city:"London",        tz:"Europe/London",         flag:"🇬🇧" },
  { city:"New York",      tz:"America/New_York",      flag:"🇺🇸" },
  { city:"Kampala",       tz:"Africa/Kampala",        flag:"🇺🇬" },
  { city:"Dar es Salaam", tz:"Africa/Dar_es_Salaam",  flag:"🇹🇿" },
  { city:"Kigali",        tz:"Africa/Kigali",         flag:"🇷🇼" },
  { city:"Mumbai",        tz:"Asia/Kolkata",          flag:"🇮🇳" },
  { city:"Beijing",       tz:"Asia/Shanghai",         flag:"🇨🇳" },
  { city:"Frankfurt",     tz:"Europe/Berlin",         flag:"🇩🇪" },
  { city:"Johannesburg",  tz:"Africa/Johannesburg",   flag:"🇿🇦" },
  { city:"Tokyo",         tz:"Asia/Tokyo",            flag:"🇯🇵" },
];
const ROUTES = [
  { label:"Mombasa",   km:490 },{ label:"Kisumu",     km:350 },
  { label:"Mara",      km:270 },{ label:"Nakuru",     km:160 },
  { label:"Naivasha",  km:90  },{ label:"Malindi",    km:580 },
  { label:"Eldoret",   km:310 },{ label:"Amboseli",   km:230 },
  { label:"Kampala",   km:680 },{ label:"Arusha",     km:273 },
  { label:"Zanzibar",  km:935 },{ label:"JKIA",       km:18  },
];
const VEHICLES = [
  { label:"Vitz / Axio",      kpl:13 },
  { label:"Corolla / Premio", kpl:12 },
  { label:"RAV4 / Fielder",   kpl:11 },
  { label:"Prado / Fortuner", kpl:9  },
  { label:"Land Cruiser V8",  kpl:7  },
  { label:"Hilux / D-Max",    kpl:8  },
];

/* ── Design tokens ────────────────────────────────────────────────────────── */
const T = {
  surface:  "#0B1220",
  elevated: "#0F1929",
  subtle:   "#162032",
  border:   "rgba(255,255,255,.07)",
  muted:    "#64748B",
  text:     "#F1F5F9",
};
const fmtN = (n: number) => Math.round(n).toLocaleString("en-KE");
const fmtK = (n: number) => `KES ${fmtN(n)}`;
const tzStr = (tz: string, sec = false) => {
  try {
    return new Date().toLocaleTimeString("en-US", {
      timeZone: tz, hour12: false,
      hour: "2-digit", minute: "2-digit",
      ...(sec ? { second: "2-digit" } : {}),
    });
  } catch { return "--:--"; }
};
const tzDt = (tz: string) => {
  try { return new Date().toLocaleDateString("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric" }); }
  catch { return ""; }
};

/* ── Shared atoms ─────────────────────────────────────────────────────────── */
function CardShell({ accent, icon: Icon, title, sub, topRight, children }: {
  accent: string; icon: React.ElementType; title: string; sub?: string;
  topRight?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18,
      overflow: "hidden", boxShadow: `0 0 0 1px ${accent}12` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px",
        borderBottom: `1px solid ${T.border}`,
        background: `linear-gradient(90deg, ${accent}0d 0%, transparent 60%)` }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `${accent}18`,
          border: `1px solid ${accent}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon style={{ width: 15, height: 15, color: accent }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: "-.01em" }}>{title}</div>
          {sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{sub}</div>}
        </div>
        {topRight}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const,
    letterSpacing: ".08em", color: T.muted, marginBottom: 5 }}>{children}</div>;
}

function Inp({ value, onChange, type = "number", min, placeholder, right }: {
  value: string; onChange: (v: string) => void; type?: string;
  min?: string; placeholder?: string; right?: boolean;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      min={min} placeholder={placeholder}
      style={{ width: "100%", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 10,
        padding: "9px 12px", color: T.text, fontSize: 13, outline: "none",
        fontFamily: "'JetBrains Mono', monospace", textAlign: right ? "right" : undefined,
        transition: "border-color .15s" }}
      onFocus={e => e.target.style.borderColor = "rgba(249,115,22,.5)"}
      onBlur={e => e.target.style.borderColor = T.border} />
  );
}

function Sel({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 10,
        padding: "9px 12px", color: T.text, fontSize: 13, outline: "none",
        fontFamily: "'Outfit', sans-serif", appearance: "none", cursor: "pointer" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Toggle({ on, onClick, accent = "#34D399" }: { on: boolean; onClick: () => void; accent?: string }) {
  return (
    <button type="button" onClick={onClick}
      style={{ width: 38, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
        background: on ? accent : T.subtle, position: "relative", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%",
        background: "white", transition: "left .2s", left: on ? 19 : 3 }} />
    </button>
  );
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: T.elevated, borderRadius: 12, padding: "12px 14px",
      border: `1px solid ${T.border}`, marginTop: 12 }}>
      {children}
    </div>
  );
}

function BRow({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "5px 0", borderBottom: `1px solid rgba(255,255,255,.04)` }}>
      <span style={{ fontSize: bold ? 13 : 12, color: bold ? T.text : T.muted }}>{label}</span>
      <span style={{ fontSize: bold ? 15 : 13, fontWeight: bold ? 800 : 500,
        color: accent || (bold ? "#F97316" : T.text), fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* WIDGET 1 — Currency Converter                                            */
/* ══════════════════════════════════════════════════════════════════════════ */
function CurrencyConverter() {
  const [rates,   setRates]   = useState<Record<string,number>>(FALLBACK);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState("Approx. rates");
  const [amount,  setAmount]  = useState("1000");
  const [from,    setFrom]    = useState("USD");
  const [to,      setTo]      = useState("KES");

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("https://open.er-api.com/v6/latest/KES");
      const d = await r.json();
      if (d.rates) {
        const mapped: Record<string,number> = { KES: 1 };
        for (const k of Object.keys(FALLBACK)) {
          if (d.rates[k]) mapped[k] = d.rates[k] / d.rates.KES || FALLBACK[k];
        }
        setRates(mapped);
        setUpdated("Live · " + new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }));
      }
    } catch {
      setUpdated("Approx. rates");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  const fr = rates[from] || 1;
  const tr = rates[to]   || 1;
  const result = (parseFloat(amount) || 0) * (tr / fr);
  const toSym  = CURRENCIES.find(c => c.code === to)?.sym || "";
  const curOpts = CURRENCIES.map(c => ({ value: c.code, label: `${c.code} — ${c.name}` }));
  const pairs = [["USD","KES"],["EUR","KES"],["GBP","KES"],["AED","KES"]];

  return (
    <CardShell accent="#38BDF8" icon={DollarSign} title="Currency Converter" sub={updated}
      topRight={
        <button onClick={fetchRates} style={{ background: "none", border: "none", cursor: "pointer",
          color: T.muted, display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
          <RefreshCw style={{ width: 12, height: 12, animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      }>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div><Lbl>Amount</Lbl><Inp value={amount} onChange={setAmount} /></div>
        <div><Lbl>From</Lbl><Sel value={from} onChange={setFrom} options={curOpts} /></div>
        <div><Lbl>To</Lbl><Sel value={to} onChange={setTo} options={curOpts} /></div>
      </div>
      {/* Result */}
      <div style={{ background: "rgba(56,189,248,.08)", border: "1px solid rgba(56,189,248,.2)",
        borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: T.muted }}>{amount || "0"} {from} =</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#38BDF8", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-.02em" }}>
          {toSym}{result.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
          1 {from} = {toSym}{(tr / fr).toFixed(4)} {to}
        </div>
      </div>
      {/* Quick pairs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
        {pairs.map(([f, t]) => {
          const sym = CURRENCIES.find(c => c.code === t)?.sym || "";
          const val = (rates[t] || 1) / (rates[f] || 1);
          return (
            <div key={`${f}-${t}`} style={{ background: T.elevated, borderRadius: 10, padding: "8px 12px",
              border: `1px solid ${T.border}`, cursor: "pointer" }}
              onClick={() => { setFrom(f); setTo(t); }}>
              <div style={{ fontSize: 10, color: T.muted }}>1 {f}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>
                {sym}{Math.round(val).toLocaleString("en-KE")} {t}
              </div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* WIDGET 2 — Rental Calculator                                             */
/* ══════════════════════════════════════════════════════════════════════════ */
function RentalCalc() {
  const [days,       setDays]       = useState("3");
  const [rate,       setRate]       = useState("8000");
  const [chauffeur,  setChauffeur]  = useState(false);
  const [includeVat, setIncludeVat] = useState(false);
  const [deposit,    setDeposit]    = useState(50);
  const [extraKm,    setExtraKm]    = useState("0");
  const [kmRate,     setKmRate]     = useState("50");

  const d     = parseInt(days)    || 0;
  const r     = parseFloat(rate)  || 0;
  const base  = d * r;
  const chauf = chauffeur ? d * 2000 : 0;
  const extra = (parseFloat(extraKm) || 0) * (parseFloat(kmRate) || 0);
  const sub   = base + chauf + extra;
  const vat   = includeVat ? sub * .16 : 0;
  const total = sub + vat;
  const dep   = total * deposit / 100;
  const bal   = total - dep;

  return (
    <CardShell accent="#F97316" icon={Calculator} title="Rental Cost Calculator" sub="Days · rate · chauffeur · VAT">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div><Lbl>No. of days</Lbl><Inp value={days} onChange={setDays} min="1" /></div>
        <div><Lbl>Daily rate (KES)</Lbl><Inp value={rate} onChange={setRate} /></div>
      </div>
      {/* Toggles */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
        {[
          { label: "Chauffeured", sub: "+KES 2,000/day", val: chauffeur, fn: () => setChauffeur(v => !v) },
          { label: "Include VAT", sub: "16%",            val: includeVat, fn: () => setIncludeVat(v => !v) },
        ].map(({ label, sub: s, val, fn }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "7px 10px", background: T.elevated, borderRadius: 8, border: `1px solid ${T.border}` }}>
            <div>
              <span style={{ fontSize: 12, color: T.text }}>{label}</span>
              <span style={{ fontSize: 11, color: T.muted, marginLeft: 6 }}>{s}</span>
            </div>
            <Toggle on={val} onClick={fn} accent="#F97316" />
          </div>
        ))}
      </div>
      {/* Extra KM */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div><Lbl>Extra KM</Lbl><Inp value={extraKm} onChange={setExtraKm} placeholder="0" /></div>
        <div><Lbl>Rate / km (KES)</Lbl><Inp value={kmRate} onChange={setKmRate} /></div>
      </div>
      {/* Deposit slider */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <Lbl>Deposit / down payment</Lbl>
          <span style={{ fontSize: 12, color: "#F97316", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{deposit}%</span>
        </div>
        <input type="range" min="0" max="100" value={deposit} step="1"
          onChange={e => setDeposit(parseInt(e.target.value))}
          style={{ width: "100%", accentColor: "#F97316" }} />
      </div>
      <ResultBox>
        {base > 0 && <BRow label={`Base (${d}d × ${fmtK(r)})`} value={fmtK(base)} />}
        {chauf > 0 && <BRow label={`Chauffeur (${d}d × KES 2,000)`} value={fmtK(chauf)} accent="#FBBF24" />}
        {extra > 0 && <BRow label={`Extra KM`} value={fmtK(extra)} />}
        {vat > 0   && <BRow label="VAT (16%)" value={fmtK(vat)} accent="#F87171" />}
        <BRow label="Total" value={fmtK(total)} bold />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          <div style={{ background: "rgba(52,211,153,.08)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(52,211,153,.15)" }}>
            <div style={{ fontSize: 10, color: "#34D399", marginBottom: 2 }}>Deposit ({deposit}%)</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#34D399", fontFamily: "'JetBrains Mono', monospace" }}>{fmtK(dep)}</div>
          </div>
          <div style={{ background: "rgba(251,191,36,.08)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(251,191,36,.15)" }}>
            <div style={{ fontSize: 10, color: "#FBBF24", marginBottom: 2 }}>Balance</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#FBBF24", fontFamily: "'JetBrains Mono', monospace" }}>{fmtK(bal)}</div>
          </div>
        </div>
      </ResultBox>
    </CardShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* WIDGET 3 — World Time                                                    */
/* ══════════════════════════════════════════════════════════════════════════ */
function WorldTime() {
  const [tick,   setTick]   = useState(0);
  const [active, setActive] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 1000); return () => clearInterval(t); }, []);

  const z = ZONES[active];
  const bigTime = tzStr(z.tz, true);
  const bigDate = tzDt(z.tz);

  return (
    <CardShell accent="#A78BFA" icon={Globe} title="World Time Zones"
      sub={tick > 0 ? tzStr("Africa/Nairobi") + " Nairobi" : "Live"}>
      {/* Big display */}
      <div style={{ background: "rgba(167,139,250,.08)", border: "1px solid rgba(167,139,250,.2)",
        borderRadius: 12, padding: "14px", textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 20 }}>{z.flag}</div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{z.city}</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: "#A78BFA", fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "-.02em", lineHeight: 1.1, marginTop: 2 }}>{bigTime}</div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{bigDate}</div>
      </div>
      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        {ZONES.map((zone, i) => (
          <button key={zone.tz} onClick={() => setActive(i)} type="button"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
              borderRadius: 9, border: `1px solid ${i === active ? "rgba(167,139,250,.4)" : T.border}`,
              background: i === active ? "rgba(167,139,250,.1)" : T.elevated,
              cursor: "pointer", textAlign: "left", transition: "all .12s" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{zone.flag}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{zone.city}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: i === active ? "#A78BFA" : T.text,
                fontFamily: "'JetBrains Mono', monospace" }}>
                {tzStr(zone.tz).slice(0, 5)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </CardShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* WIDGET 4 — Fuel Estimator                                                */
/* ══════════════════════════════════════════════════════════════════════════ */
function FuelEstimator() {
  const [km,       setKm]       = useState("270");
  const [price,    setPrice]    = useState("205");
  const [vehicle,  setVehicle]  = useState("9");
  const [rtn,      setRtn]      = useState(false);

  const dist   = (parseFloat(km) || 0) * (rtn ? 2 : 1);
  const litres = dist / (parseFloat(vehicle) || 9);
  const cost   = litres * (parseFloat(price) || 0);
  const buf    = cost * 1.13;

  return (
    <CardShell accent="#34D399" icon={Fuel} title="Fuel Cost Estimator" sub="Kenya routes · vehicle presets">
      <div style={{ marginBottom: 10 }}>
        <Lbl>Quick route from Nairobi</Lbl>
        <Sel value="" onChange={v => setKm(v)} options={[
          { value: "", label: "Custom distance…" },
          ...ROUTES.map(r => ({ value: String(r.km), label: `→ ${r.label} (${r.km} km)` })),
        ]} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div><Lbl>Distance (km)</Lbl><Inp value={km} onChange={setKm} /></div>
        <div><Lbl>Price / litre (KES)</Lbl><Inp value={price} onChange={setPrice} /></div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <Lbl>Vehicle preset</Lbl>
        <Sel value={vehicle} onChange={setVehicle}
          options={VEHICLES.map(v => ({ value: String(v.kpl), label: `${v.label} (${v.kpl} km/L)` }))} />
      </div>
      {/* Route chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {ROUTES.slice(0, 8).map(r => (
          <button key={r.label} type="button" onClick={() => setKm(String(r.km))}
            style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, cursor: "pointer",
              background: km === String(r.km) ? "rgba(52,211,153,.15)" : T.elevated,
              border: `1px solid ${km === String(r.km) ? "rgba(52,211,153,.4)" : T.border}`,
              color: km === String(r.km) ? "#34D399" : T.muted, fontFamily: "'Outfit', sans-serif" }}>
            {r.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 12, fontSize: 13, color: T.text }}>
        Round trip <Toggle on={rtn} onClick={() => setRtn(v => !v)} accent="#34D399" />
      </div>
      <ResultBox>
        <BRow label="Distance" value={`${fmtN(dist)} km`} />
        <BRow label="Litres required" value={`${litres.toFixed(1)} L`} />
        <BRow label="Fuel cost" value={fmtK(cost)} />
        <BRow label="With 13% buffer" value={fmtK(buf)} bold accent="#34D399" />
      </ResultBox>
    </CardShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* WIDGET 5 — VAT Calculator                                                */
/* ══════════════════════════════════════════════════════════════════════════ */
function VatCalc() {
  const [mode,   setMode]   = useState<"add"|"extract">("add");
  const [amount, setAmount] = useState("50000");
  const [vatPct, setVatPct] = useState("16");

  const a   = parseFloat(amount) || 0;
  const pct = parseFloat(vatPct) || 0;
  let excl = 0, vat = 0, incl = 0;
  if (mode === "add")     { excl = a;   vat = a * pct / 100; incl = a + vat; }
  else                    { incl = a;   excl = a / (1 + pct / 100); vat = a - excl; }

  const commonRates = [
    { label: "Kenya",    pct: "16" },
    { label: "Uganda",   pct: "18" },
    { label: "Tanzania", pct: "18" },
    { label: "No VAT",   pct: "0"  },
  ];

  return (
    <CardShell accent="#FB923C" icon={ReceiptText} title="VAT & Invoice Calculator" sub="Add or extract tax">
      {/* Mode */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        {(["add", "extract"] as const).map(m => (
          <button key={m} type="button" onClick={() => setMode(m)}
            style={{ padding: "8px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: mode === m ? "rgba(251,146,60,.15)" : T.elevated,
              border: `${mode === m ? "1.5" : "1"}px solid ${mode === m ? "rgba(251,146,60,.4)" : T.border}`,
              color: mode === m ? "#FB923C" : T.muted, fontFamily: "'Outfit', sans-serif" }}>
            {m === "add" ? "Add VAT to amount" : "Extract VAT from amount"}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 8, marginBottom: 10 }}>
        <div>
          <Lbl>{mode === "add" ? "Amount (excl. VAT)" : "Amount (incl. VAT)"}</Lbl>
          <Inp value={amount} onChange={setAmount} />
        </div>
        <div>
          <Lbl>VAT %</Lbl>
          <Inp value={vatPct} onChange={setVatPct} />
        </div>
      </div>
      {/* Rate presets */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
        {commonRates.map(r => (
          <button key={r.label} type="button" onClick={() => setVatPct(r.pct)}
            style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, cursor: "pointer",
              background: vatPct === r.pct ? "rgba(251,146,60,.15)" : T.elevated,
              border: `1px solid ${vatPct === r.pct ? "rgba(251,146,60,.4)" : T.border}`,
              color: vatPct === r.pct ? "#FB923C" : T.muted, fontFamily: "'Outfit', sans-serif" }}>
            {r.label} ({r.pct}%)
          </button>
        ))}
      </div>
      <ResultBox>
        <BRow label="Excl. VAT"      value={fmtK(excl)} />
        <BRow label={`VAT (${vatPct}%)`} value={fmtK(vat)}  accent="#F87171" />
        <BRow label="Incl. VAT"      value={fmtK(incl)} bold accent="#FB923C" />
      </ResultBox>
    </CardShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* WIDGET 6 — Trip Planner                                                  */
/* ══════════════════════════════════════════════════════════════════════════ */
function TripPlanner() {
  const [km,    setKm]    = useState("270");
  const [days,  setDays]  = useState("2");
  const [rate,  setRate]  = useState("8000");
  const [fuel,  setFuel]  = useState("205");

  const rental   = (parseInt(days) || 0) * (parseFloat(rate) || 0);
  const dist     = (parseFloat(km) || 0) * 2;
  const litres   = dist / 9;
  const fuelCost = litres * (parseFloat(fuel) || 0) * 1.13;
  const total    = rental + fuelCost;

  return (
    <CardShell accent="#C084FC" icon={MapPin} title="Trip Cost Planner" sub="Rental + fuel combined">
      {/* Route chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {ROUTES.slice(0, 9).map(r => (
          <button key={r.label} type="button" onClick={() => setKm(String(r.km))}
            style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, cursor: "pointer",
              background: km === String(r.km) ? "rgba(192,132,252,.15)" : T.elevated,
              border: `1px solid ${km === String(r.km) ? "rgba(192,132,252,.4)" : T.border}`,
              color: km === String(r.km) ? "#C084FC" : T.muted, fontFamily: "'Outfit', sans-serif" }}>
            {r.label} {r.km}km
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div><Lbl>Distance (km)</Lbl><Inp value={km}   onChange={setKm}   /></div>
        <div><Lbl>Hire days</Lbl>    <Inp value={days} onChange={setDays} min="1" /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div><Lbl>Daily rate (KES)</Lbl>  <Inp value={rate} onChange={setRate} /></div>
        <div><Lbl>Fuel price / L (KES)</Lbl><Inp value={fuel} onChange={setFuel} /></div>
      </div>
      <ResultBox>
        <BRow label={`Rental (${days} day${parseInt(days) !== 1 ? "s" : ""})`} value={fmtK(rental)} />
        <BRow label="Fuel (Prado, round trip + buffer)" value={fmtK(fuelCost)} />
        <BRow label="Estimated trip total" value={fmtK(total)} bold accent="#C084FC" />
      </ResultBox>
    </CardShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* PAGE                                                                     */
/* ══════════════════════════════════════════════════════════════════════════ */
export default function ToolsPage() {
  const [nbi, setNbi] = useState("");
  useEffect(() => {
    const t = setInterval(() => setNbi(tzStr("Africa/Nairobi", true)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ fontFamily: "'Outfit', system-ui, sans-serif", paddingBottom: 48 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0,
            fontFamily: "'Outfit', sans-serif", letterSpacing: "-.02em" }}>
            Business Tools
          </h1>
          <p style={{ fontSize: 13, color: T.muted, margin: "4px 0 0" }}>
            6 live tools — currency, rental, world time, fuel, VAT, route planner
          </p>
        </div>
        {/* Live Nairobi clock */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12 }}>
          <Clock style={{ width: 14, height: 14, color: "#34D399" }} />
          <span style={{ fontSize: 12, color: T.muted }}>Nairobi</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#34D399",
            fontFamily: "'JetBrains Mono', monospace" }}>{nbi}</span>
        </div>
      </div>

      {/* Tool nav pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { icon: DollarSign, label: "Currency",    color: "#38BDF8" },
          { icon: Calculator, label: "Rental calc", color: "#F97316" },
          { icon: Globe,      label: "World time",  color: "#A78BFA" },
          { icon: Fuel,       label: "Fuel cost",   color: "#34D399" },
          { icon: ReceiptText,label: "VAT",         color: "#FB923C" },
          { icon: MapPin,     label: "Trip planner",color: "#C084FC" },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px",
            borderRadius: 99, background: T.surface, border: `1px solid ${T.border}`,
            fontSize: 12, fontWeight: 500, color: T.muted }}>
            <Icon style={{ width: 12, height: 12, color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Grid of tools */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
        <CurrencyConverter />
        <RentalCalc />
        <WorldTime />
        <FuelEstimator />
        <VatCalc />
        <TripPlanner />
      </div>

      {/* Footer note */}
      <div style={{ marginTop: 20, padding: "12px 16px", background: T.surface,
        border: `1px solid ${T.border}`, borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <Zap style={{ width: 14, height: 14, color: "#F97316", flexShrink: 0 }} />
        <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>
          Currency rates live from open.er-api.com · Kenya fuel default KES 205/L ·
          Fuel consumption based on Prado (9 km/L) · Route distances approximate
        </p>
      </div>
    </div>
  );
}
