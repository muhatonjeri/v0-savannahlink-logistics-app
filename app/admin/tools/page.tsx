"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw, Globe, Calculator, Fuel, Car, ArrowRight,
  MapPin, DollarSign, Clock, TrendingUp, Zap, RotateCcw,
  ChevronDown, Building2, Plane,
} from "lucide-react";

// ── Fonts & keyframes ──────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin   { to{transform:rotate(360deg)} }
@keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.5} }
.tool-card { animation: fadeUp .35s ease both; }
.tool-card:nth-child(2) { animation-delay:.06s }
.tool-card:nth-child(3) { animation-delay:.12s }
.tool-card:nth-child(4) { animation-delay:.18s }
.tool-card:nth-child(5) { animation-delay:.24s }
.tool-card:nth-child(6) { animation-delay:.30s }
`;

// ── Token system ───────────────────────────────────────────────────────────────
const T = {
  bg:       "#050A14",
  surface:  "#0B1220",
  elevated: "#0F1929",
  subtle:   "#1A2740",
  border:   "rgba(255,255,255,0.07)",
  text:     "#F1F5F9",
  muted:    "#64748B",
  accent:   "#F97316",
};

// ── Helper components ──────────────────────────────────────────────────────────
function Card({ children, accent = T.accent, style }: { children: React.ReactNode; accent?: string; style?: React.CSSProperties }) {
  return (
    <div className="tool-card" style={{
      background: T.surface, borderRadius: 20,
      border: `1px solid rgba(255,255,255,.07)`,
      boxShadow: `0 0 0 1px ${accent}18, 0 8px 32px rgba(0,0,0,.4)`,
      overflow: "hidden", ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ icon: Icon, title, subtitle, accent }: { icon: React.ElementType; title: string; subtitle?: string; accent: string }) {
  return (
    <div style={{
      padding: "14px 18px", borderBottom: `1px solid rgba(255,255,255,.06)`,
      background: `linear-gradient(90deg, ${accent}10 0%, transparent 60%)`,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: `${accent}18`, border: `1px solid ${accent}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon style={{ width: 15, height: 15, color: accent }} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "white", letterSpacing: "-.01em" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder, prefix, suffix, style }: {
  value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; prefix?: string; suffix?: string; style?: React.CSSProperties;
}) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {prefix && <span style={{ position: "absolute", left: 12, fontSize: 12, color: T.muted, pointerEvents: "none", userSelect: "none" }}>{prefix}</span>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 10,
          padding: `9px ${suffix ? 36 : 12}px 9px ${prefix ? 28 : 12}px`,
          color: "white", fontSize: 13, outline: "none", fontFamily: "'JetBrains Mono', monospace",
          transition: "border-color .15s", ...style,
        }}
        onFocus={e => e.target.style.borderColor = "rgba(249,115,22,.5)"}
        onBlur={e => e.target.style.borderColor = T.border} />
      {suffix && <span style={{ position: "absolute", right: 12, fontSize: 11, color: T.muted, pointerEvents: "none" }}>{suffix}</span>}
    </div>
  );
}

function Select({ value, onChange, options, style }: {
  value: string; onChange: (v: string) => void; options: {value:string;label:string}[]; style?: React.CSSProperties;
}) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: "100%", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 10,
        padding: "9px 36px 9px 12px", color: "white", fontSize: 13, outline: "none",
        appearance: "none", fontFamily: "'Outfit', sans-serif", cursor: "pointer", ...style,
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: T.muted, pointerEvents: "none" }} />
    </div>
  );
}

function ResultRow({ label, value, accent, bold }: { label: string; value: string; accent?: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid rgba(255,255,255,.04)` }}>
      <span style={{ fontSize: 12, color: T.muted }}>{label}</span>
      <span style={{ fontSize: bold ? 16 : 13, fontWeight: bold ? 700 : 500, color: accent || "white", fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
  );
}

const fmtKES = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;
const fmtCur = (n: number, sym: string, dec = 2) => `${sym}${n.toLocaleString("en", { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;

// ── CURRENCIES ────────────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: "KES", name: "Kenyan Shilling",     symbol: "KES " },
  { code: "USD", name: "US Dollar",           symbol: "$"    },
  { code: "EUR", name: "Euro",                symbol: "€"    },
  { code: "GBP", name: "British Pound",       symbol: "£"    },
  { code: "TZS", name: "Tanzanian Shilling",  symbol: "TZS " },
  { code: "UGX", name: "Ugandan Shilling",    symbol: "UGX " },
  { code: "AED", name: "UAE Dirham",          symbol: "AED " },
  { code: "INR", name: "Indian Rupee",        symbol: "₹"    },
  { code: "ZAR", name: "South African Rand",  symbol: "R"    },
  { code: "CNY", name: "Chinese Yuan",        symbol: "¥"    },
  { code: "RWF", name: "Rwandan Franc",       symbol: "RWF " },
  { code: "ETB", name: "Ethiopian Birr",      symbol: "ETB " },
];

// ── WORLD ZONES ────────────────────────────────────────────────────────────────
const ZONES = [
  { city: "Nairobi",      flag: "🇰🇪", tz: "Africa/Nairobi",     offset: "+3"  },
  { city: "Dubai",        flag: "🇦🇪", tz: "Asia/Dubai",         offset: "+4"  },
  { city: "London",       flag: "🇬🇧", tz: "Europe/London",      offset: "+0/+1"},
  { city: "New York",     flag: "🇺🇸", tz: "America/New_York",   offset: "-5/-4"},
  { city: "Kampala",      flag: "🇺🇬", tz: "Africa/Kampala",     offset: "+3"  },
  { city: "Dar es Salaam",flag: "🇹🇿", tz: "Africa/Dar_es_Salaam",offset: "+3"  },
  { city: "Kigali",       flag: "🇷🇼", tz: "Africa/Kigali",      offset: "+2"  },
  { city: "Johannesburg", flag: "🇿🇦", tz: "Africa/Johannesburg", offset: "+2"  },
  { city: "Mumbai",       flag: "🇮🇳", tz: "Asia/Kolkata",       offset: "+5:30"},
  { city: "Beijing",      flag: "🇨🇳", tz: "Asia/Shanghai",      offset: "+8"  },
  { city: "Frankfurt",    flag: "🇩🇪", tz: "Europe/Berlin",      offset: "+1/+2"},
  { city: "Tokyo",        flag: "🇯🇵", tz: "Asia/Tokyo",         offset: "+9"  },
];

// ── KENYA ROUTES ───────────────────────────────────────────────────────────────
const ROUTES = [
  { from: "Nairobi", to: "Mombasa",    km: 490  },
  { from: "Nairobi", to: "Kisumu",     km: 350  },
  { from: "Nairobi", to: "Nakuru",     km: 160  },
  { from: "Nairobi", to: "Naivasha",   km: 90   },
  { from: "Nairobi", to: "Maasai Mara",km: 270  },
  { from: "Nairobi", to: "Malindi",    km: 580  },
  { from: "Nairobi", to: "Eldoret",    km: 310  },
  { from: "Nairobi", to: "Nyeri",      km: 150  },
  { from: "Nairobi", to: "Amboseli",   km: 230  },
  { from: "Nairobi", to: "Kampala",    km: 680  },
  { from: "Nairobi", to: "Arusha",     km: 273  },
  { from: "Nairobi", to: "Zanzibar",   km: 935  },
  { from: "Nairobi", to: "JKIA",       km: 18   },
  { from: "Nairobi", to: "Thika",      km: 42   },
  { from: "Nairobi", to: "Machakos",   km: 64   },
];

// ══════════════════════════════════════════════════════════════════════════════
// WIDGET 1 — Currency Converter
// ══════════════════════════════════════════════════════════════════════════════
function CurrencyConverter() {
  const [amount, setAmount]   = useState("1000");
  const [from,   setFrom]     = useState("USD");
  const [to,     setTo]       = useState("KES");
  const [rates,  setRates]    = useState<Record<string,number>>({});
  const [loading,setLoading]  = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      // Use a free open exchange rates API (no key needed for latest)
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      const json = await res.json();
      if (json.rates) {
        setRates(json.rates);
        setLastUpdated(new Date().toLocaleTimeString("en-KE"));
      }
    } catch {
      // Fallback hardcoded rates (approximate)
      setRates({ KES:130, USD:1, EUR:0.92, GBP:0.79, TZS:2600, UGX:3800, AED:3.67, INR:83.5, ZAR:18.7, CNY:7.24, RWF:1310, ETB:110 });
      setLastUpdated("Approx. rates");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  const fromRate = rates[from] || 1;
  const toRate   = rates[to]   || 1;
  const result   = (parseFloat(amount) || 0) * (toRate / fromRate);

  const fromSym  = CURRENCIES.find(c => c.code === from)?.symbol || "";
  const toSym    = CURRENCIES.find(c => c.code === to)?.symbol   || "";

  const popularPairs = [
    { from:"USD", to:"KES" }, { from:"EUR", to:"KES" },
    { from:"GBP", to:"KES" }, { from:"AED", to:"KES" },
  ];

  const curOpts = CURRENCIES.map(c => ({ value: c.code, label: `${c.code} — ${c.name}` }));

  return (
    <Card accent="#38BDF8">
      <CardHeader icon={DollarSign} title="Currency Converter" subtitle="Live exchange rates" accent="#38BDF8" />
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        <Input type="number" value={amount} onChange={setAmount} placeholder="1000" prefix={fromSym} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 36px 1fr", alignItems: "center", gap: 8 }}>
          <Select value={from} onChange={setFrom} options={curOpts} />
          <button onClick={() => { setFrom(to); setTo(from); }}
            style={{ width: 36, height: 36, borderRadius: 10, background: T.subtle, border: `1px solid ${T.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RefreshCw style={{ width: 14, height: 14, color: "#38BDF8" }} />
          </button>
          <Select value={to} onChange={setTo} options={curOpts} />
        </div>

        {/* Result */}
        <div style={{ background: "rgba(56,189,248,.08)", border: "1px solid rgba(56,189,248,.2)", borderRadius: 14, padding: "14px 16px", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: T.muted, margin: "0 0 6px" }}>{amount} {from} =</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#38BDF8", margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
            {loading ? "..." : `${toSym}${result.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          <p style={{ fontSize: 10, color: T.muted, margin: "6px 0 0" }}>
            1 {from} = {toSym}{(toRate / fromRate).toFixed(4)} {to}
          </p>
        </div>

        {/* Quick pairs */}
        <div>
          <p style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Quick Pairs (1 unit)</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {popularPairs.map(p => {
              const r1 = rates[p.from] || 1;
              const r2 = rates[p.to]   || 1;
              const sym2 = CURRENCIES.find(c => c.code === p.to)?.symbol || "";
              return (
                <div key={`${p.from}-${p.to}`} style={{ background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 12px" }}>
                  <p style={{ fontSize: 10, color: T.muted, margin: "0 0 2px" }}>1 {p.from}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                    {sym2}{(r2/r1).toLocaleString("en", { maximumFractionDigits: 0 })} {p.to}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: T.muted }}>Updated: {lastUpdated}</span>
          <button onClick={fetchRates} style={{ background: "none", border: "none", cursor: "pointer", color: "#38BDF8", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
            <RefreshCw style={{ width: 11, height: 11, animation: loading ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>
      </div>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WIDGET 2 — Rental Cost Calculator
// ══════════════════════════════════════════════════════════════════════════════
function RentalCalculator() {
  const [days,         setDays]         = useState("3");
  const [rate,         setRate]         = useState("8000");
  const [chauffeur,    setChauffeur]    = useState(false);
  const [deposit,      setDeposit]      = useState("50");  // percent
  const [vatRate,      setVatRate]      = useState("16");
  const [includeVat,   setIncludeVat]   = useState(false);
  const [extraKm,      setExtraKm]      = useState("0");
  const [kmRate,       setKmRate]       = useState("50");

  const d        = parseInt(days)    || 0;
  const r        = parseFloat(rate)  || 0;
  const base     = d * r;
  const chauffSur= chauffeur ? d * 2000 : 0;
  const extraCost= (parseFloat(extraKm)||0) * (parseFloat(kmRate)||0);
  const subtotal = base + chauffSur + extraCost;
  const vat      = includeVat ? subtotal * (parseFloat(vatRate)/100) : 0;
  const total    = subtotal + vat;
  const dep      = total * (parseFloat(deposit)/100);
  const balance  = total - dep;

  const toggle = (fn: (v: boolean) => void, cur: boolean) => () => fn(!cur);

  return (
    <Card accent="#F97316">
      <CardHeader icon={Calculator} title="Rental Cost Calculator" subtitle="Car hire pricing breakdown" accent="#F97316" />
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 5 }}>Number of Days</label>
            <Input type="number" value={days} onChange={setDays} suffix="days" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 5 }}>Daily Rate</label>
            <Input type="number" value={rate} onChange={setRate} prefix="KES" />
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "Chauffeured (+KES 2k/day)", val: chauffeur, fn: toggle(setChauffeur, chauffeur) },
            { label: `Include VAT (${vatRate}%)`,  val: includeVat, fn: toggle(setIncludeVat, includeVat) },
          ].map(({ label, val, fn }) => (
            <button key={label} onClick={fn} style={{
              padding: "6px 12px", borderRadius: 8, border: `1px solid ${val ? "#F97316" : T.border}`,
              background: val ? "rgba(249,115,22,.12)" : T.elevated, color: val ? "#F97316" : T.muted,
              fontSize: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 500,
            }}>{label}</button>
          ))}
        </div>

        {/* Extra KM */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 5 }}>Extra KM</label>
            <Input type="number" value={extraKm} onChange={setExtraKm} suffix="km" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 5 }}>Rate/KM</label>
            <Input type="number" value={kmRate} onChange={setKmRate} prefix="KES" />
          </div>
        </div>

        {/* Deposit % */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <label style={{ fontSize: 11, color: T.muted }}>Deposit / Down Payment</label>
            <span style={{ fontSize: 12, color: "#F97316", fontFamily: "'JetBrains Mono', monospace" }}>{deposit}%</span>
          </div>
          <input type="range" min="0" max="100" value={deposit} onChange={e => setDeposit(e.target.value)}
            style={{ width: "100%", accentColor: "#F97316" }} />
        </div>

        {/* Results */}
        <div style={{ background: T.elevated, borderRadius: 12, padding: "12px 14px", border: `1px solid ${T.border}` }}>
          <ResultRow label={`Base (${d}d × ${fmtKES(r)})`} value={fmtKES(base)} />
          {chauffeur  && <ResultRow label={`Chauffeur (${d}d × KES 2,000)`} value={fmtKES(chauffSur)} accent="#FBBF24" />}
          {parseFloat(extraKm) > 0 && <ResultRow label={`Extra KM (${extraKm}km × KES${kmRate})`} value={fmtKES(extraCost)} />}
          {includeVat && <ResultRow label={`VAT (${vatRate}%)`} value={fmtKES(vat)} />}
          <ResultRow label="TOTAL" value={fmtKES(total)} bold accent="#F97316" />
          <div style={{ marginTop: 10, padding: "10px 0 0", borderTop: `1px solid rgba(255,255,255,.06)`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ background: "rgba(52,211,153,.08)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(52,211,153,.15)" }}>
              <p style={{ fontSize: 10, color: "#34D399", margin: "0 0 2px" }}>Deposit ({deposit}%)</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#34D399", margin: 0, fontFamily: "'JetBrains Mono',monospace" }}>{fmtKES(dep)}</p>
            </div>
            <div style={{ background: "rgba(251,191,36,.08)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(251,191,36,.15)" }}>
              <p style={{ fontSize: 10, color: "#FBBF24", margin: "0 0 2px" }}>Balance Due</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#FBBF24", margin: 0, fontFamily: "'JetBrains Mono',monospace" }}>{fmtKES(balance)}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WIDGET 3 — World Time Zones
// ══════════════════════════════════════════════════════════════════════════════
function WorldTime() {
  const [tick, setTick] = useState(0);
  const [highlighted, setHighlighted] = useState("Africa/Nairobi");

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const getTime = (tz: string) => {
    try {
      return new Date().toLocaleTimeString("en-US", { timeZone: tz, hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch { return "--:--:--"; }
  };
  const getDate = (tz: string) => {
    try {
      return new Date().toLocaleDateString("en-KE", { timeZone: tz, weekday: "short", month: "short", day: "numeric" });
    } catch { return ""; }
  };
  const isDay = (tz: string) => {
    try {
      const h = parseInt(new Date().toLocaleString("en-US", { timeZone: tz, hour: "numeric", hour12: false }));
      return h >= 6 && h < 20;
    } catch { return true; }
  };

  return (
    <Card accent="#A78BFA">
      <CardHeader icon={Globe} title="World Time Zones" subtitle={`Live · ${tick > 0 ? "synced" : "syncing..."}`} accent="#A78BFA" />
      <div style={{ padding: "12px 18px 16px" }}>
        {/* Highlighted city big display */}
        {(() => {
          const z = ZONES.find(z => z.tz === highlighted) || ZONES[0];
          const time = getTime(z.tz);
          const day = isDay(z.tz);
          return (
            <div style={{ background: "rgba(167,139,250,.08)", border: "1px solid rgba(167,139,250,.2)", borderRadius: 14, padding: "14px 18px", marginBottom: 14, textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{z.flag}</div>
              <div style={{ fontSize: 11, color: T.muted, margin: "4px 0 2px" }}>{z.city}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#A78BFA", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{time}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{getDate(z.tz)} · {day ? "☀️ Day" : "🌙 Night"}</div>
            </div>
          );
        })()}
        {/* Grid of all zones */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {ZONES.map(z => {
            const time = getTime(z.tz);
            const day  = isDay(z.tz);
            const active = highlighted === z.tz;
            return (
              <button key={z.tz} onClick={() => setHighlighted(z.tz)} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10,
                background: active ? "rgba(167,139,250,.12)" : T.elevated,
                border: `1px solid ${active ? "rgba(167,139,250,.35)" : T.border}`,
                cursor: "pointer", textAlign: "left", transition: "all .15s",
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{z.flag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{z.city}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: active ? "#A78BFA" : "white", fontFamily: "'JetBrains Mono', monospace" }}>{time.slice(0,5)}</div>
                </div>
                <span style={{ fontSize: 10 }}>{day ? "☀️" : "🌙"}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WIDGET 4 — Fuel Cost Estimator
// ══════════════════════════════════════════════════════════════════════════════
function FuelEstimator() {
  const [distance,     setDistance]     = useState("270");
  const [consumption,  setConsumption]  = useState("10");
  const [pricePerLitre,setPricePerLitre] = useState("205");
  const [returnTrip,   setReturnTrip]   = useState(false);
  const [selectedRoute,setSelectedRoute] = useState("");

  const dist = (parseFloat(distance) || 0) * (returnTrip ? 2 : 1);
  const litres = dist / (parseFloat(consumption) || 10);
  const cost   = litres * (parseFloat(pricePerLitre) || 0);

  const vehiclePresets = [
    { label: "Vitz / Axio",        l: "13" },
    { label: "Corolla / Premio",   l: "12" },
    { label: "RAV4 / Fielder",     l: "11" },
    { label: "Prado / Fortuner",   l: "9"  },
    { label: "Land Cruiser V8",    l: "7"  },
    { label: "Hilux / D-Max",      l: "8"  },
  ];

  return (
    <Card accent="#34D399">
      <CardHeader icon={Fuel} title="Fuel Cost Estimator" subtitle="Distance · Consumption · Price" accent="#34D399" />
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Route quick-select */}
        <div>
          <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 6 }}>Quick Route</label>
          <Select value={selectedRoute} onChange={v => { setSelectedRoute(v); if (v) setDistance(v); }}
            options={[{ value: "", label: "Select a route..." }, ...ROUTES.map(r => ({ value: String(r.km), label: `${r.from} → ${r.to} (${r.km} km)` }))]} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 5 }}>Distance</label>
            <Input type="number" value={distance} onChange={setDistance} suffix="km" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 5 }}>Consumption</label>
            <Input type="number" value={consumption} onChange={setConsumption} suffix="km/L" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 5 }}>Price/Litre</label>
            <Input type="number" value={pricePerLitre} onChange={setPricePerLitre} prefix="KES" />
          </div>
        </div>

        {/* Vehicle presets */}
        <div>
          <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 6 }}>Vehicle Preset (consumption)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {vehiclePresets.map(p => (
              <button key={p.label} onClick={() => setConsumption(p.l)} style={{
                padding: "4px 10px", borderRadius: 7, fontSize: 11, cursor: "pointer",
                background: consumption === p.l ? "rgba(52,211,153,.15)" : T.elevated,
                border: `1px solid ${consumption === p.l ? "rgba(52,211,153,.4)" : T.border}`,
                color: consumption === p.l ? "#34D399" : T.muted, fontFamily: "'Outfit',sans-serif",
              }}>{p.label}</button>
            ))}
          </div>
        </div>

        {/* Return trip toggle */}
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: T.muted }}>
          <div onClick={() => setReturnTrip(v => !v)} style={{ width: 38, height: 22, borderRadius: 11, background: returnTrip ? "#34D399" : T.subtle, position: "relative", transition: "background .2s", cursor: "pointer", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 3, left: returnTrip ? 18 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left .2s" }} />
          </div>
          Round trip ({returnTrip ? `${parseFloat(distance)*2} km total` : "one way"})
        </label>

        {/* Result */}
        <div style={{ background: "rgba(52,211,153,.06)", border: "1px solid rgba(52,211,153,.2)", borderRadius: 12, padding: "14px 16px" }}>
          <ResultRow label="Total Distance" value={`${dist.toFixed(0)} km`} />
          <ResultRow label="Litres Required" value={`${litres.toFixed(1)} L`} />
          <ResultRow label="Fuel Cost" value={fmtKES(cost)} bold accent="#34D399" />
          <p style={{ fontSize: 10, color: T.muted, marginTop: 8 }}>
            Add 10–15% buffer for traffic and AC usage.
            Approx. cost including buffer: <span style={{ color: "#34D399" }}>{fmtKES(cost * 1.13)}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WIDGET 5 — Invoice / VAT Calculator
// ══════════════════════════════════════════════════════════════════════════════
function VatCalculator() {
  const [amount,   setAmount]   = useState("50000");
  const [vatPct,   setVatPct]   = useState("16");
  const [mode,     setMode]     = useState<"add"|"extract">("add");
  const [currency, setCurrency] = useState("KES");

  const a   = parseFloat(amount) || 0;
  const pct = parseFloat(vatPct) || 0;

  let excl = 0, vat = 0, incl = 0;
  if (mode === "add") {
    excl = a; vat = a * pct / 100; incl = a + vat;
  } else {
    incl = a; excl = a / (1 + pct/100); vat = a - excl;
  }

  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || "";
  const fmt = (n: number) => `${sym}${Math.round(n).toLocaleString("en")}`;

  const commonRates = [
    { label: "Kenya VAT",    pct: "16" },
    { label: "Uganda VAT",   pct: "18" },
    { label: "Tanzania VAT", pct: "18" },
    { label: "No VAT",       pct: "0"  },
  ];

  return (
    <Card accent="#FB923C">
      <CardHeader icon={TrendingUp} title="VAT & Invoice Calculator" subtitle="Add or extract tax" accent="#FB923C" />
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Mode toggle */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {([["add", "Add VAT to amount"], ["extract", "Extract VAT from amount"]] as const).map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "8px 10px", borderRadius: 10, border: `1px solid ${mode===m ? "#FB923C" : T.border}`,
              background: mode===m ? "rgba(251,146,60,.12)" : T.elevated, color: mode===m ? "#FB923C" : T.muted,
              fontSize: 11, cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 500,
            }}>{label}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px", gap: 10, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 5 }}>
              {mode === "add" ? "Amount (Exc. VAT)" : "Amount (Inc. VAT)"}
            </label>
            <Input type="number" value={amount} onChange={setAmount} prefix={sym} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 5 }}>VAT %</label>
            <Input type="number" value={vatPct} onChange={setVatPct} suffix="%" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 5 }}>Currency</label>
            <Select value={currency} onChange={setCurrency} options={CURRENCIES.map(c => ({ value: c.code, label: c.code }))} />
          </div>
        </div>

        {/* Common rates */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {commonRates.map(r => (
            <button key={r.label} onClick={() => setVatPct(r.pct)} style={{
              padding: "4px 10px", borderRadius: 7, fontSize: 11, cursor: "pointer",
              background: vatPct === r.pct ? "rgba(251,146,60,.12)" : T.elevated,
              border: `1px solid ${vatPct === r.pct ? "rgba(251,146,60,.4)" : T.border}`,
              color: vatPct === r.pct ? "#FB923C" : T.muted, fontFamily: "'Outfit',sans-serif",
            }}>{r.label}</button>
          ))}
        </div>

        <div style={{ background: T.elevated, borderRadius: 12, padding: "12px 14px", border: `1px solid ${T.border}` }}>
          <ResultRow label="Excl. VAT"     value={fmt(excl)} />
          <ResultRow label={`VAT (${vatPct}%)`} value={fmt(vat)} accent="#FB923C" />
          <ResultRow label="Incl. VAT"     value={fmt(incl)} bold accent="#FB923C" />
        </div>
      </div>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WIDGET 6 — Distance & Route Planner
// ══════════════════════════════════════════════════════════════════════════════
function RouteCalculator() {
  const [from, setFrom] = useState("Nairobi");
  const [to,   setTo]   = useState("");
  const [days, setDays] = useState("1");
  const [dailyRate, setDailyRate] = useState("8000");

  const route = ROUTES.find(r =>
    r.from.toLowerCase() === from.toLowerCase() &&
    r.to.toLowerCase() === to.toLowerCase()
  );
  const km = route?.km || 0;
  const fuelCost = km > 0 ? km / 9 * 205 : 0; // Prado avg
  const rentalTotal = parseInt(days) * parseFloat(dailyRate);

  const destinations = [...new Set(ROUTES.map(r => r.to))];

  return (
    <Card accent="#C084FC">
      <CardHeader icon={MapPin} title="Route & Trip Planner" subtitle="Kenya routes · Rental cost included" accent="#C084FC" />
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr", alignItems: "center", gap: 8 }}>
          <div>
            <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 5 }}>From</label>
            <Input value={from} onChange={setFrom} placeholder="Nairobi" />
          </div>
          <ArrowRight style={{ width: 16, height: 16, color: "#C084FC", marginTop: 18, flexShrink: 0 }} />
          <div>
            <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 5 }}>To</label>
            <Select value={to} onChange={setTo} options={[{ value: "", label: "Select destination..." }, ...destinations.map(d => ({ value: d, label: d }))]} />
          </div>
        </div>

        {/* Quick route tiles */}
        <div>
          <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 6 }}>Popular Routes from Nairobi</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {ROUTES.slice(0, 8).map(r => (
              <button key={r.to} onClick={() => { setFrom(r.from); setTo(r.to); }} style={{
                padding: "4px 10px", borderRadius: 7, fontSize: 11, cursor: "pointer",
                background: to === r.to ? "rgba(192,132,252,.12)" : T.elevated,
                border: `1px solid ${to === r.to ? "rgba(192,132,252,.4)" : T.border}`,
                color: to === r.to ? "#C084FC" : T.muted, fontFamily: "'Outfit',sans-serif",
              }}>{r.to} ({r.km}km)</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 5 }}>Hire Days</label>
            <Input type="number" value={days} onChange={setDays} suffix="days" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: T.muted, display: "block", marginBottom: 5 }}>Daily Rate</label>
            <Input type="number" value={dailyRate} onChange={setDailyRate} prefix="KES" />
          </div>
        </div>

        {km > 0 ? (
          <div style={{ background: "rgba(192,132,252,.06)", border: "1px solid rgba(192,132,252,.2)", borderRadius: 12, padding: "12px 14px" }}>
            <ResultRow label="Distance (one way)" value={`${km} km`} />
            <ResultRow label="Round trip" value={`${km * 2} km`} />
            <ResultRow label="Est. fuel cost (Prado)" value={fmtKES(fuelCost)} />
            <ResultRow label={`Rental (${days}d)`} value={fmtKES(rentalTotal)} />
            <ResultRow label="Trip Total (est.)" value={fmtKES(rentalTotal + fuelCost * 1.13)} bold accent="#C084FC" />
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0", color: T.muted, fontSize: 13 }}>
            Select a destination to see distance & cost estimates
          </div>
        )}
      </div>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function ToolsPage() {
  const [nairobiTime, setNairobiTime] = useState("");
  useEffect(() => {
    const update = () => setNairobiTime(
      new Date().toLocaleTimeString("en-KE", { timeZone: "Africa/Nairobi", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
    );
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ fontFamily: "'Outfit', system-ui, sans-serif", color: T.text }}>
      <style>{STYLES}</style>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "white", margin: 0, fontFamily: "'Syne', sans-serif", letterSpacing: "-.01em" }}>
              Business Tools
            </h1>
            <p style={{ fontSize: 13, color: T.muted, margin: "4px 0 0" }}>
              Currency · Calculator · World Time · Fuel Estimator · VAT · Route Planner
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12 }}>
            <Clock style={{ width: 14, height: 14, color: "#34D399" }} />
            <span style={{ fontSize: 12, color: T.muted }}>Nairobi</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#34D399", fontFamily: "'JetBrains Mono', monospace" }}>{nairobiTime}</span>
          </div>
        </div>

        {/* Tool strip */}
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {[
            { icon: DollarSign, label: "Currency",    color: "#38BDF8", href: "#currency"   },
            { icon: Calculator, label: "Rental Calc", color: "#F97316", href: "#rental"     },
            { icon: Globe,      label: "World Time",  color: "#A78BFA", href: "#time"       },
            { icon: Fuel,       label: "Fuel Cost",   color: "#34D399", href: "#fuel"       },
            { icon: TrendingUp, label: "VAT Calc",    color: "#FB923C", href: "#vat"        },
            { icon: MapPin,     label: "Routes",      color: "#C084FC", href: "#routes"     },
          ].map(({ icon: Icon, label, color, href }) => (
            <a key={label} href={href} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99, background: T.surface, border: `1px solid rgba(255,255,255,.08)`, textDecoration: "none", fontSize: 12, fontWeight: 500, color: T.muted, transition: "all .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = color; (e.currentTarget as HTMLAnchorElement).style.borderColor = `${color}40`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = T.muted; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,.08)"; }}>
              <Icon style={{ width: 12, height: 12, color }} />
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Grid layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 18 }}>
        <div id="currency"><CurrencyConverter /></div>
        <div id="rental"><RentalCalculator /></div>
        <div id="time"><WorldTime /></div>
        <div id="fuel"><FuelEstimator /></div>
        <div id="vat"><VatCalculator /></div>
        <div id="routes"><RouteCalculator /></div>
      </div>

      {/* Footer note */}
      <div style={{ marginTop: 24, padding: "14px 18px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <Zap style={{ width: 14, height: 14, color: T.accent, flexShrink: 0 }} />
        <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>
          Currency rates update live from open.er-api.com. Fuel prices and route distances are estimates — verify before quoting clients.
          Kenya fuel price default: KES 205/L. Vehicle consumption based on typical Prado (9 km/L).
        </p>
      </div>
    </div>
  );
}
