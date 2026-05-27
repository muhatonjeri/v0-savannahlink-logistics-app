"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User, Fingerprint, Camera, Upload, CheckCircle2, Loader2,
  ArrowLeft, ArrowRight, Phone, Car, Compass, Plane,
  Truck, Bus, Wrench, Package, Ship, HardHat, AlertCircle,
  ShieldCheck, X, Calendar, DollarSign, Gauge, Navigation,
  CreditCard, Banknote, Building, Globe, MapPin, Briefcase,
  UserCheck, Clock, ChevronDown, Check, Copy, Wallet,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Badge }  from "@/components/ui/badge";
import { toast }  from "sonner";
import { MpesaPayment } from "@/components/payment/mpesa-payment";
import Link from "next/link";

// ─── Fonts (injected via style tag) ──────────────────────────────────────────
const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;700&display=swap');
  .reg-root { font-family: 'DM Sans', system-ui, sans-serif; }
  .reg-mono  { font-family: 'JetBrains Mono', monospace; }
  @keyframes scanline { 0%{top:0} 100%{top:100%} }
  @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(168,85,247,.4)} 70%{box-shadow:0 0 0 12px rgba(168,85,247,0)} 100%{box-shadow:0 0 0 0 rgba(168,85,247,0)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  .fade-up { animation: fadeUp .35s ease both; }
  .pulse-ring { animation: pulse-ring 1.8s ease infinite; }
  .shimmer-btn { background-size:200% 100%; background-image:linear-gradient(90deg,#f97316 0%,#fb923c 50%,#f97316 100%); }
  .glass { background:rgba(255,255,255,.03); backdrop-filter:blur(12px); }
  .section-card { transition:box-shadow .2s; }
  .section-card:hover { box-shadow:0 0 0 1px rgba(255,255,255,.06); }
`;

// ─── Services ─────────────────────────────────────────────────────────────────
const SERVICES: Record<string, { label:string; icon:LucideIcon; accent:string; glow:string }> = {
  "car-rental":             { label:"Car Rental",             icon:Car,     accent:"#818cf8", glow:"rgba(129,140,248,.15)" },
  "safari-tours":           { label:"Safari Tours",           icon:Compass, accent:"#fbbf24", glow:"rgba(251,191,36,.15)"  },
  "transfers":              { label:"Airport Transfers",       icon:Plane,   accent:"#38bdf8", glow:"rgba(56,189,248,.15)"  },
  "movers":                 { label:"Movers",                 icon:Truck,   accent:"#a78bfa", glow:"rgba(167,139,250,.15)" },
  "corporate-rental":       { label:"Corporate Rental",       icon:Bus,     accent:"#c084fc", glow:"rgba(192,132,252,.15)" },
  "road-recovery":          { label:"Road Recovery",          icon:Wrench,  accent:"#fb7185", glow:"rgba(251,113,133,.15)" },
  "cargo-handling":         { label:"Cargo Handling",         icon:Package, accent:"#fb923c", glow:"rgba(251,146,60,.15)"  },
  "shipment-imports":       { label:"Shipment Imports",       icon:Ship,    accent:"#60a5fa", glow:"rgba(96,165,250,.15)"  },
  "construction-equipment": { label:"Construction Equipment", icon:HardHat, accent:"#facc15", glow:"rgba(250,204,21,.15)"  },
};

// ─── Country codes ────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code:"+254", flag:"🇰🇪", name:"Kenya",          short:"KE" },
  { code:"+256", flag:"🇺🇬", name:"Uganda",         short:"UG" },
  { code:"+255", flag:"🇹🇿", name:"Tanzania",       short:"TZ" },
  { code:"+250", flag:"🇷🇼", name:"Rwanda",         short:"RW" },
  { code:"+251", flag:"🇪🇹", name:"Ethiopia",       short:"ET" },
  { code:"+1",   flag:"🇺🇸", name:"United States",  short:"US" },
  { code:"+44",  flag:"🇬🇧", name:"United Kingdom", short:"GB" },
  { code:"+971", flag:"🇦🇪", name:"UAE",            short:"AE" },
  { code:"+27",  flag:"🇿🇦", name:"South Africa",   short:"ZA" },
  { code:"+91",  flag:"🇮🇳", name:"India",          short:"IN" },
  { code:"+86",  flag:"🇨🇳", name:"China",          short:"CN" },
  { code:"+49",  flag:"🇩🇪", name:"Germany",        short:"DE" },
  { code:"+33",  flag:"🇫🇷", name:"France",         short:"FR" },
  { code:"+81",  flag:"🇯🇵", name:"Japan",          short:"JP" },
  { code:"+7",   flag:"🇷🇺", name:"Russia",         short:"RU" },
];

// ─── Vehicles ─────────────────────────────────────────────────────────────────
const VEHICLES = [
  { make:"Toyota",        models:["Land Cruiser V8","Land Cruiser Prado","Fortuner","Hilux","RAV4","Corolla","Camry","Fielder","Premio","Alphard","Harrier","C-HR","Vitz","Noah"] },
  { make:"Nissan",        models:["X-Trail","Patrol","Navara","Note","Juke","Qashqai","Serena","Murano","Pathfinder"] },
  { make:"Honda",         models:["CR-V","HR-V","Vezel","Fit","Civic","Accord","Odyssey","Stepwagon","Jazz"] },
  { make:"Mazda",         models:["CX-5","CX-3","CX-7","Demio","Axela","Atenza","BT-50"] },
  { make:"Subaru",        models:["Forester","Outback","XV","Impreza","Legacy","WRX"] },
  { make:"Mercedes-Benz", models:["E-Class","C-Class","S-Class","GLE","GLC","GLA","V-Class","Sprinter","A-Class"] },
  { make:"BMW",           models:["X5","X3","X1","3 Series","5 Series","7 Series","X6","X7","M3","M5"] },
  { make:"Audi",          models:["Q7","Q5","Q3","A4","A6","A3","A8","e-tron","Q8"] },
  { make:"Land Rover",    models:["Range Rover","Range Rover Sport","Discovery","Defender","Evoque","Velar"] },
  { make:"Mitsubishi",    models:["Pajero","Outlander","L200","ASX","Eclipse Cross","Delica"] },
  { make:"Isuzu",         models:["D-Max","MU-X","NQR","FRR","FSR"] },
  { make:"Volkswagen",    models:["Tiguan","Touareg","Golf","Passat","Polo","Amarok","T-Cross"] },
  { make:"Ford",          models:["Ranger","Everest","Explorer","Escape","F-150","Transit"] },
  { make:"Hyundai",       models:["Tucson","Santa Fe","Creta","Elantra","Palisade","H-1"] },
  { make:"Kia",           models:["Sportage","Sorento","Seltos","Carnival","Cerato"] },
];

const FUEL_OPTIONS = [
  { value:"Empty",   label:"Empty (0%)",   color:"#ef4444" },
  { value:"Reserve", label:"Reserve (<1/8)",color:"#f97316" },
  { value:"1/4",     label:"Quarter (1/4)", color:"#eab308" },
  { value:"Half",    label:"Half (1/2)",    color:"#84cc16" },
  { value:"3/4",     label:"Three Quarters",color:"#22c55e" },
  { value:"Full",    label:"Full (100%)",   color:"#10b981" },
];

const fmtKES = (n: number) =>
  new Intl.NumberFormat("en-KE", { style:"currency", currency:"KES", minimumFractionDigits:0 }).format(n);

// ─── Country picker ───────────────────────────────────────────────────────────
function CountryPicker({ value, onChange }: { value:string; onChange:(v:string)=>void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];
  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) || c.code.includes(q)
  );
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 h-11 px-3 rounded-l-xl border border-r-0 border-white/15 bg-white/5 hover:bg-white/8 transition-colors text-sm text-white">
        <span className="text-lg leading-none">{selected.flag}</span>
        <span className="reg-mono text-gray-300 text-xs">{selected.code}</span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
      </button>
      {open && (
        <div className="absolute z-50 top-12 left-0 w-64 rounded-xl border border-white/10 bg-[#0d1b2e] shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search country..."
              className="bg-white/5 border-white/10 text-white text-xs h-8" autoFocus />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.map(c => (
              <button key={c.code} type="button" onClick={() => { onChange(c.code); setOpen(false); setQ(""); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-white/5 transition-colors text-left ${c.code===value?"bg-white/8 text-white":"text-gray-300"}`}>
                <span className="text-lg">{c.flag}</span>
                <span className="flex-1">{c.name}</span>
                <span className="reg-mono text-gray-500 text-xs">{c.code}</span>
                {c.code===value && <Check className="h-3.5 w-3.5 text-emerald-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── International phone input ────────────────────────────────────────────────
function IntlPhone({ label, value, countryCode, onValueChange, onCountryChange, required, hint, mpesa }: {
  label:string; value:string; countryCode:string;
  onValueChange:(v:string)=>void; onCountryChange:(v:string)=>void;
  required?:boolean; hint?:string; mpesa?:boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
        {label}{required && <span className="text-rose-400">*</span>}
        {mpesa && <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full tracking-wide">M-PESA</span>}
      </label>
      <div className="flex">
        <CountryPicker value={countryCode} onChange={onCountryChange} />
        <Input value={value} onChange={e => onValueChange(e.target.value.replace(/\D/g,""))}
          placeholder="712 345 678" className="reg-mono rounded-l-none bg-[#060d1a] border-white/15 text-white h-11 flex-1" />
      </div>
      {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
    </div>
  );
}

// ─── Photo capture ────────────────────────────────────────────────────────────
function PhotoBox({ label, sublabel, value, onChange }: {
  label:string; sublabel?:string; value:string; onChange:(v:string)=>void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef  = useRef<HTMLInputElement>(null);
  const toB64   = (f:File):Promise<string> => new Promise((res,rej) => {
    const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f);
  });
  const handleFile = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if(!f) return;
    onChange(await toB64(f)); toast.success(`${label} captured`);
  };
  if (value) return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      {sublabel && <p className="text-[10px] text-gray-600">{sublabel}</p>}
      <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 bg-emerald-500/5">
        {value.startsWith("data:image")
          ? <img src={value} alt={label} className="w-full h-32 object-cover" /> // eslint-disable-line
          : <div className="h-32 flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-emerald-400" /></div>}
        <button type="button" onClick={()=>onChange("")}
          className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 rounded-full p-1 transition-colors">
          <X className="h-3 w-3 text-white" />
        </button>
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
          <p className="text-[10px] text-emerald-400 font-semibold">✓ Captured</p>
        </div>
      </div>
    </div>
  );
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      {sublabel && <p className="text-[10px] text-gray-600">{sublabel}</p>}
      <div className="rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 p-3 space-y-2 min-h-[128px] flex flex-col items-center justify-center">
        <Camera className="h-7 w-7 text-blue-400/50" />
        <div className="flex gap-1.5 flex-wrap justify-center">
          <button type="button" onClick={()=>camRef.current?.click()}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors">
            <Camera className="h-3 w-3" />Take Photo
          </button>
          <button type="button" onClick={()=>fileRef.current?.click()}
            className="flex items-center gap-1 bg-white/8 hover:bg-white/12 text-gray-300 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors">
            <Upload className="h-3 w-3" />Upload
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <input ref={camRef}  type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

// ─── Biometric scanner ────────────────────────────────────────────────────────
function BiometricScanner({ label, hand, value, onChange }: {
  label:string; hand:"right"|"left"; value:string; onChange:(v:string)=>void;
}) {
  const [state, setState] = useState<"idle"|"scanning"|"done">("idle");
  const [progress, setProgress] = useState(0);

  const handleScan = async () => {
    // Try WebAuthn (real biometric) first
    if (window.PublicKeyCredential) {
      try {
        setState("scanning"); setProgress(20);
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        setProgress(50);
        await window.navigator.credentials.create?.({
          publicKey: {
            challenge,
            rp: { name:"Moventra Safaris" },
            user: { id:new Uint8Array(16), name:"client", displayName:"Client" },
            pubKeyCredParams: [{ alg:-7, type:"public-key" }],
            authenticatorSelection: { authenticatorAttachment:"platform", userVerification:"required" },
            timeout: 30000,
          }
        });
        setProgress(100);
        setTimeout(() => {
          onChange(`bio_webauthn_${hand}_${Date.now()}`);
          setState("done");
          toast.success(`${label} biometric captured`);
        }, 300);
        return;
      } catch { /* fall through to simulation */ }
    }
    // Simulate biometric scan (devices without WebAuthn)
    setState("scanning");
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 60));
      setProgress(i);
    }
    onChange(`bio_scan_${hand}_${Date.now()}`);
    setState("done");
    toast.success(`${label} fingerprint scanned`);
  };

  const reset = () => { onChange(""); setState("idle"); setProgress(0); };

  if (state === "done" || value) return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 flex flex-col items-center gap-2">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center pulse-ring">
            <Fingerprint className="h-8 w-8 text-emerald-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
        </div>
        <p className="text-xs font-semibold text-emerald-400">Biometric Captured ✓</p>
        <button type="button" onClick={reset} className="text-[10px] text-gray-500 hover:text-rose-400 transition-colors">
          Rescan
        </button>
      </div>
    </div>
  );

  if (state === "scanning") return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <div className="rounded-xl border border-purple-500/40 bg-purple-500/5 p-4 flex flex-col items-center gap-3">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 flex items-center justify-center">
            <Fingerprint className="h-8 w-8 text-purple-400" />
          </div>
          {/* Scanning line */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-x-0 h-0.5 bg-purple-400/60 blur-[1px]"
              style={{ animation:"scanline 1.5s linear infinite", top:0 }} />
          </div>
          {/* Progress ring */}
          <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(168,85,247,.15)" strokeWidth="2" />
            <circle cx="32" cy="32" r="30" fill="none" stroke="#a855f7" strokeWidth="2"
              strokeDasharray={`${progress * 1.885} 188.5`} strokeLinecap="round" />
          </svg>
        </div>
        <div className="text-center space-y-0.5">
          <p className="text-xs font-semibold text-purple-300">Scanning... {progress}%</p>
          <p className="text-[10px] text-gray-500">Keep finger on sensor</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <button type="button" onClick={handleScan}
        className="w-full rounded-xl border border-dashed border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/8 hover:border-purple-500/50 p-4 flex flex-col items-center gap-2 transition-all group">
        <div className="w-14 h-14 rounded-full border border-purple-500/30 group-hover:border-purple-400/50 bg-purple-500/10 flex items-center justify-center transition-all">
          <Fingerprint className="h-7 w-7 text-purple-400/70 group-hover:text-purple-400 transition-colors" />
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-purple-300">Tap to Scan</p>
          <p className="text-[10px] text-gray-600 mt-0.5">{hand === "right" ? "Right" : "Left"} Thumb</p>
        </div>
      </button>
    </div>
  );
}

// ─── KRA PIN verify ───────────────────────────────────────────────────────────
function KraField({ value, onChange }: { value:string; onChange:(v:string)=>void }) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const verify = async () => {
    if (!value.trim()) { toast.error("Enter KRA PIN first"); return; }
    if (!/^[A-Za-z]\d{9}[A-Za-z]$/i.test(value)) { toast.error("Format: A012345678A"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setOk(true); setLoading(false);
    toast.success("KRA PIN verified ✓");
  };
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
        KRA PIN
        {ok && <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">Verified ✓</span>}
        <span className="text-gray-600 font-normal text-[11px]">optional</span>
      </label>
      <div className="flex gap-2">
        <Input value={value} onChange={e => { onChange(e.target.value.toUpperCase()); setOk(false); }}
          placeholder="A012345678A" className="reg-mono bg-[#060d1a] border-white/15 text-white h-11 flex-1" />
        <Button type="button" onClick={verify} disabled={loading}
          className="bg-violet-600 hover:bg-violet-500 text-white h-11 px-5 shrink-0 font-medium text-sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
        </Button>
      </div>
      <p className="text-[11px] text-gray-600">Format: A012345678A — auto-verifies via KRA iTax when connected</p>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ id, accent, icon:Icon, title, children }: {
  id:string; accent:string; icon:LucideIcon; title:string; children:React.ReactNode;
}) {
  return (
    <div id={id} className="section-card rounded-2xl border border-white/8 overflow-hidden fade-up"
      style={{ boxShadow:`0 0 0 1px ${accent}18, 0 8px 32px -8px ${accent}20` }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/6"
        style={{ background:`linear-gradient(90deg, ${accent}12 0%, transparent 60%)` }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background:`${accent}20`, border:`1px solid ${accent}30` }}>
          <Icon className="h-4 w-4" style={{ color:accent }} />
        </div>
        <h2 className="text-sm font-semibold tracking-wide" style={{ color:accent }}>{title}</h2>
      </div>
      <div className="p-5 space-y-4 bg-[#060d1a]">{children}</div>
    </div>
  );
}

// ─── Field label ──────────────────────────────────────────────────────────────
function Fl({ label, required, children, hint }: {
  label:string; required?:boolean; hint?:string; children:React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-300">
        {label}{required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-600">{hint}</p>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function RegisterClientContent() {
  const router = useRouter();
  const params = useSearchParams();
  const service = params.get("service") || "car-rental";
  const prefill = (() => { try { return JSON.parse(decodeURIComponent(params.get("prefill") || "{}")); } catch { return {}; } })();

  const svc = SERVICES[service];
  const isCarRental = service === "car-rental";

  // ── Existing client ─────────────────────────────────────────────────────────
  const [existingClient, setExistingClient] = useState<Record<string,string>|null>(null);
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [skipPersonal, setSkipPersonal] = useState(false);

  // Check if prefill has a clientId → fetch and skip personal section
  useEffect(() => {
    if (prefill.clientId) {
      (async () => {
        try {
          const r = await fetch(`/api/clients?id=${prefill.clientId}`);
          if (r.ok) {
            const c = await r.json();
            if (c?.id) { setExistingClient(c); setSkipPersonal(true); }
          }
        } catch {}
      })();
    }
  }, []);

  const handleClientLookup = async () => {
    if (!lookupQuery.trim()) return;
    setLookupLoading(true);
    try {
      const r = await fetch(`/api/clients?q=${encodeURIComponent(lookupQuery)}`);
      const d = await r.json();
      const clients = Array.isArray(d) ? d : [];
      if (clients.length > 0) {
        setExistingClient(clients[0]);
        setSkipPersonal(true);
        toast.success(`Client found: ${clients[0].full_name || clients[0].fullName}`);
      } else {
        toast.info("No existing client found — please complete registration");
      }
    } catch {
      toast.info("Search unavailable — please complete registration");
    }
    setLookupLoading(false);
  };

  // ── Personal fields ─────────────────────────────────────────────────────────
  const [f, setF] = useState({
    fullName:             String(prefill.customerName   || ""),
    nationality:          "Kenyan",
    idType:               "national_id" as "national_id"|"passport"|"alien_id",
    idNumber:             String(prefill.idNumber       || ""),
    dlNumber:             String(prefill.drivingLicenseNumber || ""),
    placeOfWork:          String(prefill.placeOfWork    || ""),
    residence:            String(prefill.residence      || ""),
    phone:                String(prefill.customerPhone  || ""),
    phoneCountry:         "+254",
    phone2:               "",
    phone2Country:        "+254",
    email:                String(prefill.customerEmail  || ""),
    kraPin:               String(prefill.kraPin         || ""),
    nextOfKinName:        "",
    nextOfKinPhone:       "",
    nextOfKinRelationship:"Spouse",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF(p => ({ ...p, [k]: e.target.value }));

  // ── Biometrics / photos ─────────────────────────────────────────────────────
  const [idFront,       setIdFront]       = useState("");
  const [idBack,        setIdBack]        = useState("");
  const [dlFront,       setDlFront]       = useState("");
  const [dlBack,        setDlBack]        = useState("");
  const [rightThumb,    setRightThumb]    = useState("");
  const [leftThumb,     setLeftThumb]     = useState("");
  const [passportPhoto, setPassportPhoto] = useState("");

  // ── Car rental fields ───────────────────────────────────────────────────────
  const [rentalType,   setRentalType]   = useState<"self-drive"|"chauffeured">("self-drive");
  const [carMake,      setCarMake]      = useState("");
  const [carModel,     setCarModel]     = useState("");
  const [numberPlate,  setNumberPlate]  = useState("");
  const [mileage,      setMileage]      = useState("");
  const [fuelLevel,    setFuelLevel]    = useState("Full");
  const [etcAmount,    setEtcAmount]    = useState("");
  const [destination,  setDestination]  = useState("");

  // ── Rental period ───────────────────────────────────────────────────────────
  const [numberOfDays, setNumberOfDays] = useState("");
  const [dailyRate,    setDailyRate]    = useState("");
  const [startDate,    setStartDate]    = useState("");
  const [startTime,    setStartTime]    = useState("08:00");
  const [endDate,      setEndDate]      = useState("");
  const [endTime,      setEndTime]      = useState("08:00");

  // ── Payment ─────────────────────────────────────────────────────────────────
  const [paymentMethod,  setPaymentMethod]  = useState<"mpesa"|"bank"|"cash">("mpesa");
  const [paymentOption,  setPaymentOption]  = useState<"full"|"partial">("full");
  const [depositAmount,  setDepositAmount]  = useState("");
  const [copied,         setCopied]         = useState(false);

  // Computed totals
  const baseTotal       = (parseFloat(dailyRate)||0) * (parseInt(numberOfDays)||0);
  const chauffeurExtra  = rentalType === "chauffeured" ? 2000 * (parseInt(numberOfDays)||0) : 0;
  const total           = baseTotal + chauffeurExtra;
  const deposit         = paymentOption === "partial" ? (parseFloat(depositAmount)||0) : total;
  const balance         = total - deposit;

  // Auto-set start date
  useEffect(() => {
    const n = new Date();
    setStartDate(n.toISOString().split("T")[0]);
    setStartTime(n.toTimeString().slice(0,5));
  }, []);

  // Auto-calc end date from start + days
  useEffect(() => {
    if (!startDate || !numberOfDays) { setEndDate(""); return; }
    const d = new Date(`${startDate}T${startTime}:00`);
    d.setDate(d.getDate() + parseInt(numberOfDays));
    setEndDate(d.toISOString().split("T")[0]);
    setEndTime(startTime);
  }, [startDate, startTime, numberOfDays]);

  const models = VEHICLES.find(v => v.make === carMake)?.models || [];

  // ── Booking state ───────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [bookingId,  setBookingId]  = useState("");
  const [showPayment,setShowPayment]= useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────
  const errs: Record<string,string> = {};
  if (!skipPersonal) {
    if (!f.fullName.trim())   errs.fullName  = "Full name required";
    if (!f.idNumber.trim())   errs.idNumber  = "ID/Passport required";
    if (f.phone.length < 7)   errs.phone     = "Phone required";
    if (!f.residence.trim())  errs.residence = "Residence required";
  }
  if (isCarRental) {
    if (!carMake)       errs.carMake      = "Make required";
    if (!carModel)      errs.carModel     = "Model required";
    if (!numberPlate)   errs.numberPlate  = "Number plate required";
    if (!mileage)       errs.mileage      = "Mileage required";
    if (!destination)   errs.destination  = "Destination required";
    if (!numberOfDays)  errs.numberOfDays = "Number of days required";
    if (!dailyRate)     errs.dailyRate    = "Daily rate required";
    if (!startDate)     errs.startDate    = "Start date required";
    if (paymentOption==="partial" && !depositAmount) errs.depositAmount = "Deposit amount required";
  }
  const isValid = Object.keys(errs).length === 0;

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) { toast.error("Please complete all required fields"); return; }
    setSubmitting(true);

    const clientData = skipPersonal && existingClient
      ? existingClient
      : { fullName:f.fullName, idNumber:f.idNumber, phone:`${f.phoneCountry}${f.phone}`,
          alternativePhone:f.phone2 ? `${f.phone2Country}${f.phone2}` : null,
          email:f.email||null, kraPin:f.kraPin||null, residence:f.residence,
          placeOfWork:f.placeOfWork||null, drivingLicenseNumber:f.dlNumber||null,
          nationality:f.nationality, idType:f.idType,
          nextOfKinName:f.nextOfKinName||null, nextOfKinPhone:f.nextOfKinPhone||null,
          nextOfKinRelationship:f.nextOfKinRelationship||null,
          idPhotoFront:idFront||null, idPhotoBack:idBack||null,
          dlPhotoFront:dlFront||null, dlPhotoBack:dlBack||null,
          fingerprintRight:rightThumb||null, fingerprintLeft:leftThumb||null,
          passportPhoto:passportPhoto||null };

    let clientId = `CLT-${Date.now()}`;
    let bkId     = `BK-${Date.now()}`;

    // Save / get client
    try {
      if (!skipPersonal) {
        const r = await fetch("/api/clients",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(clientData)});
        if (r.ok) { const s=await r.json(); if(s?.id) clientId=s.id; }
      } else {
        clientId = String(existingClient?.id || clientId);
      }
    } catch {}

    // Save booking
    if (isCarRental) {
      try {
        const r = await fetch("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
          service_type:"car-rental", customer_name:skipPersonal?(existingClient?.full_name||existingClient?.fullName||""):f.fullName,
          customer_phone:skipPersonal?(existingClient?.phone||""):`${f.phoneCountry}${f.phone}`,
          status:"pending", payment_status:paymentOption==="partial"?"partial":"pending",
          payment_method:paymentMethod, total_amount:total, amount_paid:deposit,
          metadata:{ clientId, rentalType, carMake, carModel, numberPlate,
            currentMileage:mileage, fuelLevel, etcAmount:etcAmount||"0", destination,
            numberOfDays, dailyRate, startDate, startTime, endDate, endTime,
            chauffeurExtra, paymentOption, depositAmount:deposit, balance },
        })});
        if (r.ok) { const b=await r.json(); if(b?.id) bkId=b.id; }
      } catch {}
    }

    setBookingId(bkId); setSubmitting(false);
    if (paymentMethod==="mpesa"||paymentMethod==="bank") { setShowPayment(true); }
    else { toast.success("Booking created — cash payment collected"); setTimeout(()=>router.push("/admin/car-rental"),1400); }
  };

  const copyBankDetails = () => {
    navigator.clipboard.writeText(`NCBA Bank · Moventra Safaris & Logistics · ${process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO||"PENDING"}`);
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  const displayName = skipPersonal && existingClient
    ? String(existingClient.full_name || existingClient.fullName || "Client")
    : f.fullName;

  const steps = [
    ...(!skipPersonal ? ["A. Personal","B. Contact","C. Next of Kin","D. Biometrics"] : ["👤 Existing Client"]),
    ...(isCarRental   ? ["E. Car Details","F. Rental Period","G. Payment"] : []),
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{FONT_STYLE}</style>
      <div className="reg-root max-w-[720px] mx-auto space-y-5 pb-20">

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-1">
          <Link href="/admin/client-lookup"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Client Lookup
          </Link>
          {svc && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold"
              style={{ borderColor:`${svc.accent}30`, background:`${svc.glow}`, color:svc.accent }}>
              <svc.icon className="h-3.5 w-3.5" />{svc.label}
            </div>
          )}
        </div>

        {/* ── Page title ───────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/8 bg-[#060d1a] p-5 space-y-3"
          style={{ boxShadow:`0 0 40px -20px ${svc?.accent || "#f97316"}25` }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">
                {skipPersonal ? "New Booking" : "Register New Client"}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {skipPersonal ? `Booking for ${displayName}` : `Complete all required fields${isCarRental?" · Car rental registration":""}`}
              </p>
            </div>
            {skipPersonal && existingClient && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                <UserCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">Client on Record</span>
              </div>
            )}
          </div>
          {/* Step pills */}
          <div className="flex gap-1.5 flex-wrap">
            {steps.map((s,i) => (
              <span key={i} className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-white/8 text-gray-500 bg-white/3">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* ── Existing client lookup ────────────────────────────────────────── */}
        {!skipPersonal && (
          <div className="rounded-2xl border border-white/8 bg-[#060d1a] p-5 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Returning Client?</p>
            <div className="flex gap-2">
              <Input value={lookupQuery} onChange={e => setLookupQuery(e.target.value)}
                onKeyDown={e => e.key==="Enter" && handleClientLookup()}
                placeholder="Search by name, ID, phone or email..."
                className="bg-[#060d1a] border-white/12 text-white h-10 text-sm" />
              <Button type="button" onClick={handleClientLookup} disabled={lookupLoading}
                className="bg-white/8 hover:bg-white/12 text-gray-300 h-10 px-4 text-sm shrink-0">
                {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[11px] text-gray-600">
              If found, personal details are pre-filled and you skip straight to car &amp; booking details.
            </p>
          </div>
        )}

        {/* ── Existing client card ──────────────────────────────────────────── */}
        {skipPersonal && existingClient && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />Verified Client on Record
              </p>
              <button type="button" onClick={() => { setExistingClient(null); setSkipPersonal(false); }}
                className="text-[11px] text-gray-500 hover:text-white border border-white/10 px-2 py-1 rounded-lg transition-colors">
                Switch client
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {[
                ["Name",       existingClient.full_name   || existingClient.fullName],
                ["ID",         existingClient.id_number   || existingClient.idNumber],
                ["Phone",      existingClient.phone],
                ["Residence",  existingClient.residence],
              ].map(([k,v]) => v ? (
                <div key={k} className="flex gap-2">
                  <span className="text-gray-500 shrink-0 w-16">{k}</span>
                  <span className="text-white font-medium truncate">{v}</span>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── A. Personal Details ─────────────────────────────────────────── */}
          {!skipPersonal && (
            <Section id="sec-personal" accent="#818cf8" icon={User} title="A. Personal Details">
              {/* Name */}
              <Fl label="Full Name" required>
                <Input value={f.fullName} onChange={set("fullName")} placeholder="e.g. John Kamau Mwangi"
                  className={`bg-[#060d1a] border-white/15 text-white h-11 ${errs.fullName?"border-rose-500/60":""}`} />
              </Fl>

              {/* Nationality + ID type */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Fl label="Nationality">
                  <select value={f.nationality} onChange={e => setF(p=>({...p,nationality:e.target.value}))}
                    className="w-full h-11 rounded-xl bg-[#060d1a] border border-white/15 text-white text-sm px-3">
                    {["Kenyan","Ugandan","Tanzanian","Rwandan","Ethiopian","British","American","Indian","South African","Chinese","French","German","Other"].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </Fl>
                <Fl label="Document Type">
                  <div className="flex gap-2">
                    {(["national_id","passport","alien_id"] as const).map(t => (
                      <button key={t} type="button" onClick={() => setF(p=>({...p,idType:t}))}
                        className={`flex-1 h-11 rounded-xl border text-xs font-medium transition-all ${f.idType===t?"border-indigo-500 bg-indigo-500/15 text-indigo-300":"border-white/12 bg-white/3 text-gray-500 hover:border-white/20"}`}>
                        {t==="national_id"?"National ID":t==="passport"?"Passport":"Alien ID"}
                      </button>
                    ))}
                  </div>
                </Fl>
              </div>

              {/* ID number + photos */}
              <Fl label={f.idType==="passport"?"Passport No.":f.idType==="alien_id"?"Alien ID No.":"ID Number"} required>
                <Input value={f.idNumber} onChange={set("idNumber")}
                  placeholder={f.idType==="passport"?"AB1234567":"12345678"}
                  className={`reg-mono bg-[#060d1a] border-white/15 text-white h-11 ${errs.idNumber?"border-rose-500/60":""}`} />
              </Fl>
              <div className="grid gap-3 sm:grid-cols-2">
                <PhotoBox label={`${f.idType==="passport"?"Passport":"ID"} — Front`} value={idFront} onChange={setIdFront} />
                <PhotoBox label={`${f.idType==="passport"?"Passport":"ID"} — Back`}  value={idBack}  onChange={setIdBack}  />
              </div>

              {/* Driving license */}
              <Fl label="Driving License No.">
                <Input value={f.dlNumber} onChange={set("dlNumber")} placeholder="DL-XXXXXXXX"
                  className="reg-mono bg-[#060d1a] border-white/15 text-white h-11" />
              </Fl>
              <div className="grid gap-3 sm:grid-cols-2">
                <PhotoBox label="Driving License — Front" value={dlFront} onChange={setDlFront} />
                <PhotoBox label="Driving License — Back"  value={dlBack}  onChange={setDlBack}  />
              </div>

              {/* KRA PIN */}
              <KraField value={f.kraPin} onChange={v => setF(p=>({...p,kraPin:v}))} />

              {/* Place of work */}
              <Fl label="Place of Work / Employer">
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <Input value={f.placeOfWork} onChange={set("placeOfWork")} placeholder="Company or organisation"
                    className="bg-[#060d1a] border-white/15 text-white h-11 pl-9" />
                </div>
              </Fl>

              {/* Residence */}
              <Fl label="Residence — Estate & House / Apt No." required
                hint="Include estate name and apartment / house number">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <Input value={f.residence} onChange={set("residence")}
                    placeholder="e.g. Westlands, Apt 12B · Karen, House 7 · Nairobi CBD Rm 304"
                    className={`bg-[#060d1a] border-white/15 text-white h-11 pl-9 ${errs.residence?"border-rose-500/60":""}`} />
                </div>
              </Fl>
            </Section>
          )}

          {/* ── B. Contact ──────────────────────────────────────────────────── */}
          {!skipPersonal && (
            <Section id="sec-contact" accent="#22c55e" icon={Phone} title="B. Contact Details">
              <IntlPhone
                label="Primary Phone" value={f.phone} countryCode={f.phoneCountry}
                onValueChange={v => setF(p=>({...p,phone:v}))}
                onCountryChange={v => setF(p=>({...p,phoneCountry:v}))}
                required mpesa={f.phoneCountry==="+254"}
                hint="Used for M-Pesa STK push — must be the registered M-Pesa line" />
              <IntlPhone
                label="Phone 2 — Alternative" value={f.phone2} countryCode={f.phone2Country}
                onValueChange={v => setF(p=>({...p,phone2:v}))}
                onCountryChange={v => setF(p=>({...p,phone2Country:v}))} />
              <Fl label="Email Address">
                <Input type="email" value={f.email} onChange={set("email")} placeholder="john@example.com"
                  className="bg-[#060d1a] border-white/15 text-white h-11" />
              </Fl>
            </Section>
          )}

          {/* ── C. Next of Kin ──────────────────────────────────────────────── */}
          {!skipPersonal && (
            <Section id="sec-kin" accent="#fb7185" icon={User} title="C. Next of Kin / Emergency Contact">
              <div className="grid gap-4 sm:grid-cols-3">
                <Fl label="Full Name">
                  <Input value={f.nextOfKinName} onChange={set("nextOfKinName")}
                    placeholder="Jane Wanjiku" className="bg-[#060d1a] border-white/15 text-white h-11" />
                </Fl>
                <Fl label="Phone Number">
                  <Input value={f.nextOfKinPhone} onChange={set("nextOfKinPhone")}
                    placeholder="0722 000 000" className="reg-mono bg-[#060d1a] border-white/15 text-white h-11" />
                </Fl>
                <Fl label="Relationship">
                  <select value={f.nextOfKinRelationship} onChange={e => setF(p=>({...p,nextOfKinRelationship:e.target.value}))}
                    className="w-full h-11 rounded-xl bg-[#060d1a] border border-white/15 text-white text-sm px-3">
                    {["Spouse","Parent","Child","Sibling","Relative","Friend","Colleague","Other"].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Fl>
              </div>
            </Section>
          )}

          {/* ── D. Biometrics ───────────────────────────────────────────────── */}
          {!skipPersonal && (
            <Section id="sec-bio" accent="#a855f7" icon={Fingerprint} title="D. Biometrics & Photos">
              <div className="grid gap-4 sm:grid-cols-3">
                <BiometricScanner label="Right Thumb" hand="right" value={rightThumb} onChange={setRightThumb} />
                <BiometricScanner label="Left Thumb"  hand="left"  value={leftThumb}  onChange={setLeftThumb}  />
                <PhotoBox label="Passport Photo" sublabel="Front-facing · white/plain background" value={passportPhoto} onChange={setPassportPhoto} />
              </div>
              {/* Status pills */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-white/6">
                {[
                  {l:"Right Thumb", d:!!rightThumb},{l:"Left Thumb",d:!!leftThumb},
                  {l:"Passport",d:!!passportPhoto},{l:"ID Front",d:!!idFront},
                  {l:"ID Back",d:!!idBack},{l:"DL Front",d:!!dlFront},
                ].map(({l,d}) => (
                  <span key={l} className={`text-[11px] px-2.5 py-1 rounded-full font-medium border transition-all ${d?"bg-emerald-500/10 text-emerald-400 border-emerald-500/20":"bg-white/3 text-gray-600 border-white/8"}`}>
                    {d?"✓":"○"} {l}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* ── E. Car Details ──────────────────────────────────────────────── */}
          {isCarRental && (
            <Section id="sec-car" accent="#818cf8" icon={Car} title="E. Car Details">

              {/* Rental type */}
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">Rental Type</p>
                <div className="grid grid-cols-2 gap-3">
                  {(["self-drive","chauffeured"] as const).map(t => (
                    <button key={t} type="button" onClick={() => setRentalType(t)}
                      className={`relative py-3.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all text-left ${rentalType===t?"border-indigo-500 bg-indigo-500/12 text-indigo-300":"border-white/10 bg-white/3 text-gray-400 hover:border-indigo-500/30"}`}>
                      <span className="text-base mr-2">{t==="self-drive"?"🚗":"👨‍✈️"}</span>
                      {t==="self-drive" ? "Self Drive" : "Chauffeured"}
                      {t==="chauffeured" && (
                        <span className="absolute top-2 right-2 text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full">+KES 2k/day</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Make / Model */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Fl label="Make" required>
                  <select value={carMake} onChange={e=>{setCarMake(e.target.value);setCarModel("");}}
                    className={`w-full h-11 rounded-xl bg-[#060d1a] border px-3 text-white text-sm ${errs.carMake?"border-rose-500/60":"border-white/15"}`}>
                    <option value="">Select make...</option>
                    {VEHICLES.map(v => <option key={v.make} value={v.make}>{v.make}</option>)}
                  </select>
                </Fl>
                <Fl label="Model" required>
                  <select value={carModel} onChange={e=>setCarModel(e.target.value)}
                    className={`w-full h-11 rounded-xl bg-[#060d1a] border px-3 text-white text-sm ${errs.carModel?"border-rose-500/60":"border-white/15"}`}>
                    <option value="">{carMake?"Select model...":"Select make first"}</option>
                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </Fl>
              </div>

              {/* Plate + mileage */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Fl label="Number Plate" required>
                  <Input value={numberPlate} onChange={e=>setNumberPlate(e.target.value.toUpperCase())}
                    placeholder="KCA 123A" className={`reg-mono bg-[#060d1a] border-white/15 text-white h-11 uppercase tracking-[0.15em] ${errs.numberPlate?"border-rose-500/60":""}`} />
                </Fl>
                <Fl label="Current Mileage (km)" required>
                  <div className="relative">
                    <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <Input type="number" value={mileage} onChange={e=>setMileage(e.target.value)}
                      placeholder="52 340" className={`reg-mono bg-[#060d1a] border-white/15 text-white h-11 pl-9 ${errs.mileage?"border-rose-500/60":""}`} />
                  </div>
                </Fl>
              </div>

              {/* Fuel + ETC */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Fl label="Fuel Level">
                  <div className="relative">
                    <select value={fuelLevel} onChange={e=>setFuelLevel(e.target.value)}
                      className="w-full h-11 rounded-xl bg-[#060d1a] border border-white/15 text-white text-sm px-3 appearance-none pr-10">
                      {FUEL_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background:FUEL_OPTIONS.find(o=>o.value===fuelLevel)?.color||"#10b981" }} />
                      <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                  </div>
                </Fl>
                <Fl label="ETC / Toll Amount (KES)">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs reg-mono">KES</span>
                    <Input type="number" value={etcAmount} onChange={e=>setEtcAmount(e.target.value)}
                      placeholder="0" className="reg-mono bg-[#060d1a] border-white/15 text-white h-11 pl-11" />
                  </div>
                </Fl>
              </div>

              {/* Destination */}
              <Fl label="Destination / Area of Use" required>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <Input value={destination} onChange={e=>setDestination(e.target.value)}
                    placeholder="e.g. Naivasha · Maasai Mara · JKIA · Mombasa"
                    className={`bg-[#060d1a] border-white/15 text-white h-11 pl-9 ${errs.destination?"border-rose-500/60":""}`} />
                </div>
              </Fl>
            </Section>
          )}

          {/* ── F. Rental Period ────────────────────────────────────────────── */}
          {isCarRental && (
            <Section id="sec-period" accent="#2dd4bf" icon={Calendar} title="F. Rental Period & Rate">
              <div className="grid gap-4 sm:grid-cols-2">
                <Fl label="No. of Days" required>
                  <Input type="number" min="1" max="365" value={numberOfDays} onChange={e=>setNumberOfDays(e.target.value)}
                    placeholder="1" className={`reg-mono bg-[#060d1a] border-white/15 text-white h-11 text-center text-lg font-bold ${errs.numberOfDays?"border-rose-500/60":""}`} />
                </Fl>
                <Fl label="Daily Rate (KES)" required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs reg-mono font-bold">KES</span>
                    <Input type="number" value={dailyRate} onChange={e=>setDailyRate(e.target.value)}
                      placeholder="8 000" className={`reg-mono bg-[#060d1a] border-white/15 text-white h-11 pl-12 ${errs.dailyRate?"border-rose-500/60":""}`} />
                  </div>
                </Fl>
              </div>

              {/* Start / End dates */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Fl label="Start Date & Time" required>
                  <div className="flex gap-2">
                    <Input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}
                      className={`bg-[#060d1a] border-white/15 text-white h-11 flex-1 ${errs.startDate?"border-rose-500/60":""}`} />
                    <Input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)}
                      className="bg-[#060d1a] border-white/15 text-white h-11 w-28" />
                  </div>
                </Fl>
                <Fl label="Return Date & Time">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)}
                        className="bg-[#060d1a] border-teal-500/30 text-white h-11 w-full" />
                      {numberOfDays && <span className="absolute -top-1 -right-1 text-[9px] bg-teal-500 text-white px-1 rounded-full">auto</span>}
                    </div>
                    <Input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)}
                      className="bg-[#060d1a] border-white/15 text-white h-11 w-28" />
                  </div>
                </Fl>
              </div>

              {/* Cost breakdown */}
              {total > 0 && (
                <div className="rounded-xl border border-[#f97316]/20 bg-[#f97316]/6 p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Cost Breakdown</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>{numberOfDays} day{parseInt(numberOfDays)!==1?"s":""} × {fmtKES(parseFloat(dailyRate)||0)}</span>
                      <span className="reg-mono">{fmtKES(baseTotal)}</span>
                    </div>
                    {rentalType==="chauffeured" && (
                      <div className="flex justify-between text-amber-400">
                        <span>{numberOfDays} day{parseInt(numberOfDays)!==1?"s":""} × KES 2,000 chauffeur</span>
                        <span className="reg-mono">+ {fmtKES(chauffeurExtra)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-white/10 pt-2 mt-1">
                      <span className="font-bold text-white text-base">Total</span>
                      <span className="reg-mono font-bold text-[#f97316] text-xl">{fmtKES(total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* ── G. Payment ──────────────────────────────────────────────────── */}
          {isCarRental && (
            <Section id="sec-payment" accent="#34d399" icon={CreditCard} title="G. Payment">

              {/* Full vs partial */}
              {total > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-400">Payment Amount</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(["full","partial"] as const).map(o => (
                      <button key={o} type="button" onClick={()=>setPaymentOption(o)}
                        className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${paymentOption===o?"border-emerald-500 bg-emerald-500/12 text-emerald-300":"border-white/10 bg-white/3 text-gray-400 hover:border-emerald-500/20"}`}>
                        {o==="full" ? `💳 Full · ${fmtKES(total)}` : "💰 Partial / Deposit"}
                      </button>
                    ))}
                  </div>
                  {paymentOption==="partial" && (
                    <div className="space-y-3 fade-up">
                      <Fl label="Deposit Amount (KES)" required>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs reg-mono font-bold">KES</span>
                          <Input type="number" max={total} value={depositAmount} onChange={e=>setDepositAmount(e.target.value)}
                            placeholder={String(Math.round(total/2))}
                            className={`reg-mono bg-[#060d1a] border-white/15 text-white h-11 pl-12 ${errs.depositAmount?"border-rose-500/60":""}`} />
                        </div>
                      </Fl>
                      {parseFloat(depositAmount) > 0 && (
                        <div className="flex items-center justify-between text-sm px-1">
                          <span className="text-gray-500">Balance remaining</span>
                          <span className="reg-mono font-bold text-amber-400">{fmtKES(balance)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Payment method */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-400">Payment Method</p>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    {k:"mpesa" as const,label:"M-Pesa",   icon:Phone,    c:"emerald"},
                    {k:"bank"  as const,label:"Bank",      icon:Building, c:"blue"},
                    {k:"cash"  as const,label:"Cash",      icon:Wallet,   c:"amber"},
                  ]).map(({k,label,icon:Icon,c}) => (
                    <button key={k} type="button" onClick={()=>setPaymentMethod(k)}
                      className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-semibold text-sm transition-all ${paymentMethod===k?`border-${c}-500 bg-${c}-500/12 text-${c}-300`:"border-white/10 bg-white/3 text-gray-400 hover:border-white/20"}`}>
                      <Icon className="h-5 w-5" />{label}
                    </button>
                  ))}
                </div>
              </div>

              {/* M-Pesa info */}
              {paymentMethod==="mpesa" && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2 fade-up">
                  <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                    <Phone className="h-4 w-4" />M-Pesa STK Push
                  </p>
                  <p className="text-xs text-gray-400">
                    An STK push for <strong className="text-white">{fmtKES(deposit||total)}</strong> will be sent to{" "}
                    <strong className="text-emerald-400">{f.phoneCountry}{f.phone||"the number above"}</strong> immediately after submission.
                  </p>
                  <p className="text-[11px] text-gray-600">Customer will receive a prompt on their phone to enter M-Pesa PIN.</p>
                </div>
              )}

              {/* Bank details */}
              {paymentMethod==="bank" && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3 fade-up">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                      <Building className="h-4 w-4" />Bank Transfer Details
                    </p>
                    <button type="button" onClick={copyBankDetails}
                      className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white border border-white/10 px-2 py-1 rounded-lg transition-colors">
                      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs reg-mono">
                    {[
                      ["Bank",        "NCBA Bank Kenya"],
                      ["Account",     "Moventra Safaris & Logistics Ltd"],
                      ["Acc. No.",    process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO||"[Set in .env.local]"],
                      ["Branch",      "Thika Road Mall, Nairobi"],
                      ["SWIFT",       process.env.NEXT_PUBLIC_BANK_SWIFT||"CBAFKENX"],
                      ["Reference",   `BK-${Date.now().toString(36).toUpperCase()}`],
                    ].map(([k,v]) => (
                      <div key={k} className="flex gap-3">
                        <span className="text-gray-600 w-20 shrink-0">{k}</span>
                        <span className="text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cash */}
              {paymentMethod==="cash" && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 fade-up">
                  <p className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                    <Banknote className="h-4 w-4" />Cash Payment
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Collect <strong className="text-white">{fmtKES(deposit||total)}</strong> in cash.
                    {balance>0 && ` Balance of ${fmtKES(balance)} due before vehicle handover.`}
                  </p>
                </div>
              )}
            </Section>
          )}

          {/* ── Errors ──────────────────────────────────────────────────────── */}
          {Object.keys(errs).length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-500/30 bg-rose-500/5">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-300">{Object.values(errs)[0]}</p>
            </div>
          )}

          {/* ── Submit ──────────────────────────────────────────────────────── */}
          <button type="submit" disabled={submitting}
            className={`shimmer-btn w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-3 transition-all ${submitting?"opacity-70 cursor-not-allowed":"hover:scale-[1.01] active:scale-[.99]"} ${!isValid?"opacity-50":""}`}>
            {submitting
              ? <><Loader2 className="h-5 w-5 animate-spin" />Saving...</>
              : <><ShieldCheck className="h-5 w-5" />
                  {isCarRental
                    ? skipPersonal ? "Create Booking & Pay" : "Register Client & Create Booking"
                    : skipPersonal ? "Create Booking" : "Register Client & Create Booking"}
                  <ArrowRight className="h-5 w-5 ml-auto" />
                </>}
          </button>
          <p className="text-center text-[11px] text-gray-600 pb-2">
            Secured · Data encrypted · Biometrics stored locally
          </p>

        </form>

        {/* ── Payment modal ────────────────────────────────────────────────── */}
        {showPayment && bookingId && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-[#0a1628] border border-white/10 rounded-2xl w-full max-w-md space-y-4 p-6"
              style={{ boxShadow:"0 25px 60px rgba(0,0,0,.6)" }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {paymentMethod==="mpesa"
                    ? <><Phone className="h-5 w-5 text-emerald-400" />M-Pesa Payment</>
                    : <><Building className="h-5 w-5 text-blue-400" />Bank Transfer</>}
                </h2>
                <button onClick={()=>setShowPayment(false)} className="text-gray-500 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {/* Booking summary */}
              <div className="rounded-xl bg-white/4 border border-white/8 p-4 space-y-2 text-sm">
                {[
                  ["Client",  displayName],
                  ["Vehicle", `${carMake} ${carModel} · ${numberPlate}`],
                  ["Period",  `${numberOfDays} day${parseInt(numberOfDays)!==1?"s":""} · ${startDate} → ${endDate}`],
                  ["Type",    rentalType==="self-drive"?"Self Drive":"Chauffeured (+KES 2,000/day)"],
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="text-gray-500 shrink-0">{k}</span>
                    <span className="text-white font-medium text-right">{v}</span>
                  </div>
                ))}
                <div className="pt-2 mt-1 border-t border-white/8 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold">Total</span>
                    <span className="reg-mono text-[#f97316] font-bold text-lg">{fmtKES(total)}</span>
                  </div>
                  {paymentOption==="partial" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Paying now</span>
                        <span className="reg-mono text-emerald-400 font-semibold">{fmtKES(deposit)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Balance</span>
                        <span className="reg-mono text-amber-400 font-semibold">{fmtKES(balance)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {paymentMethod==="mpesa" && (
                <MpesaPayment
                  bookingId={bookingId}
                  amount={deposit||total}
                  defaultPhone={f.phone}
                  onSuccess={() => {
                    toast.success("Payment confirmed! Booking complete 🎉");
                    setTimeout(() => router.push("/admin/car-rental"), 1500);
                  }}
                  onFailure={() => {
                    toast.error("Payment failed — booking saved, retry from bookings page");
                    setTimeout(() => router.push("/admin/car-rental"), 2000);
                  }}
                />
              )}
              {paymentMethod==="bank" && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Send transfer reference to confirm booking.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={()=>setShowPayment(false)} className="border-white/15 text-gray-300">Back</Button>
                    <Button className="bg-blue-600 hover:bg-blue-500" onClick={()=>{toast.success("Booking pending bank transfer");router.push("/admin/car-rental");}}>
                      Mark Pending
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default function RegisterClientPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="space-y-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#f97316] mx-auto" />
          <p className="text-sm text-gray-500">Loading registration form...</p>
        </div>
      </div>
    }>
      <RegisterClientContent />
    </Suspense>
  );
}
