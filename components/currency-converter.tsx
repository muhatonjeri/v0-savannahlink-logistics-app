"use client";
import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

const CURRENCIES = [
  { code: "KES", name: "Kenyan Shilling",    flag: "🇰🇪" },
  { code: "USD", name: "US Dollar",           flag: "🇺🇸" },
  { code: "EUR", name: "Euro",                flag: "🇪🇺" },
  { code: "GBP", name: "British Pound",       flag: "🇬🇧" },
  { code: "UGX", name: "Ugandan Shilling",   flag: "🇺🇬" },
  { code: "TZS", name: "Tanzanian Shilling", flag: "🇹🇿" },
  { code: "RWF", name: "Rwandan Franc",       flag: "🇷🇼" },
  { code: "ETB", name: "Ethiopian Birr",      flag: "🇪🇹" },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦" },
  { code: "AED", name: "UAE Dirham",          flag: "🇦🇪" },
];

// Approximate rates against KES (update periodically)
const FALLBACK_RATES: Record<string, number> = {
  USD: 130, EUR: 140, GBP: 165, UGX: 0.034,
  TZS: 0.051, RWF: 0.10, ETB: 2.28, ZAR: 7.1, AED: 35.4,
};

export function CurrencyConverter({ amountKES }: { amountKES: number }) {
  const [rates, setRates]       = useState<Record<string,number>>(FALLBACK_RATES);
  const [selected, setSelected] = useState("USD");
  const [loading, setLoading]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/KES");
      const data = await res.json();
      if (data.rates) {
        setRates(data.rates);
        setLastUpdated(new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }));
      }
    } catch { /* use fallback */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchRates(); }, []);

  const rate = rates[selected] || FALLBACK_RATES[selected] || 0;
  const converted = amountKES * rate;
  const currency = CURRENCIES.find(c => c.code === selected);

  if (!amountKES) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        className="bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-[#e67e22]/50">
        {CURRENCIES.filter(c => c.code !== "KES").map(c => (
          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
        ))}
      </select>
      <span className="text-gray-300 text-sm font-medium">
        ≈ {currency?.flag} {converted.toLocaleString(undefined, { maximumFractionDigits: 0 })} {selected}
      </span>
      <button onClick={fetchRates} disabled={loading}
        className="text-gray-500 hover:text-gray-300 transition-colors">
        <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
      </button>
      {lastUpdated && <span className="text-gray-600 text-[10px]">Live rate</span>}
    </div>
  );
}
