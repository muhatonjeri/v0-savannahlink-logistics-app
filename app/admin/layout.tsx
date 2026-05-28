"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Car, Compass, Plane, Truck, Bus, Wrench, Package, Ship, HardHat,
  Eye, EyeOff, Loader2,
  LogOut, User as UserIcon, Gauge, UsersRound, Users, Fingerprint,
  ShieldX, ReceiptText, BadgeDollarSign, FileBadge, Sliders, Anchor, Calculator, FileSignature,
  Menu, X, Bell, Search, Settings, BarChart3, ShieldCheck,
  ChevronRight, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:       "#050A14",
  surface:  "#0B1220",
  elevated: "#0F1929",
  border:   "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  accent:   "#F97316",
  accentDim:"rgba(249,115,22,0.12)",
  text:     "#F1F5F9",
  muted:    "#64748B",
  subtle:   "#1E2D42",
};

// ─── Nav definitions ──────────────────────────────────────────────────────────
const NAV_MAIN: { title:string; href:string; icon:LucideIcon; color:string }[] = [
  { title:"Dashboard",      href:"/admin",                icon:Gauge,          color:"#38BDF8" },
  { title:"Users",          href:"/admin/users",          icon:UsersRound,     color:"#A3E635" },
  { title:"Clients",        href:"/admin/clients",        icon:Users,          color:"#4ADE80" },
  { title:"Client Lookup",  href:"/admin/client-lookup",  icon:Fingerprint,    color:"#A78BFA" },
  { title:"Blacklist",      href:"/admin/blacklist",      icon:ShieldX,        color:"#F87171" },
  { title:"Verify Payment", href:"/admin/verify-payment", icon:ShieldCheck,    color:"#34D399" },
  { title:"Fleet",          href:"/admin/fleet",          icon:Truck,          color:"#E879F9" },
  { title:"Receipts",       href:"/admin/receipts",       icon:ReceiptText,    color:"#2DD4BF" },
  { title:"Accounts",       href:"/admin/accounts",       icon:BadgeDollarSign,color:"#FACC15" },
  { title:"Invoices",       href:"/admin/invoices",       icon:FileBadge,      color:"#FB923C" },
  { title:"Reports",        href:"/admin/reports",        icon:BarChart3,      color:"#C084FC" },
  { title:"Services",       href:"/admin/services",       icon:Sliders,        color:"#F472B6" },
  { title:"Business Tools",   href:"/admin/tools",          icon:Calculator,     color:"#34D399" },
];

const NAV_SERVICES: { title:string; href:string; icon:LucideIcon; color:string }[] = [
  { title:"Car Rental",              href:"/admin/car-rental",             icon:Car,         color:"#818CF8" },
  { title:"Hire Agreement",          href:"/admin/car-rental/contract",    icon:FileSignature, color:"#F97316" },
  { title:"Safari Tours",            href:"/admin/safari-tours",           icon:Compass, color:"#FBBF24" },
  { title:"Transfers",               href:"/admin/transfers",              icon:Plane,   color:"#38BDF8" },
  { title:"Movers",                  href:"/admin/movers",                 icon:Package, color:"#A78BFA" },
  { title:"Corporate Rental",        href:"/admin/corporate-rental",       icon:Bus,     color:"#C084FC" },
  { title:"Road Recovery",           href:"/admin/road-recovery",          icon:Wrench,  color:"#FB7185" },
  { title:"Cargo Handling",          href:"/admin/cargo-handling",         icon:Anchor,  color:"#FB923C" },
  { title:"Shipment Imports",        href:"/admin/shipment-imports",       icon:Ship,    color:"#60A5FA" },
  { title:"Construction Equipment",  href:"/admin/construction-equipment", icon:HardHat, color:"#FACC15" },
];

function breadcrumb(pathname: string) {
  const all = [...NAV_MAIN, ...NAV_SERVICES];
  return all.find(i => pathname.startsWith(i.href) && i.href !== "/admin")?.title || "Dashboard";
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted,      setMounted]      = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [collapsed,    setCollapsed]    = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQ,      setSearchQ]      = useState("");
  const [searchRes,    setSearchRes]    = useState<{type:string;label:string;sub:string;href:string}[]>([]);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [alerts,       setAlerts]       = useState<{severity:string;message:string;href:string}[]>([]);
  const [adminName,    setAdminName]    = useState("Admin");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab,  setSettingsTab]  = useState<"profile"|"security"|"appearance"|"notifications"|"system">("profile");
  const [adminEmail,   setAdminEmail]   = useState("admin@moventrasafarislogisticsltd.com");
  const [adminPhone,   setAdminPhone]   = useState("+254 727 247 032");
  const [adminRole,    setAdminRole]    = useState("admin");
  const [pwForm,       setPwForm]       = useState({current:"",newPw:"",confirm:""});
  const [pwShow,       setPwShow]       = useState(false);
  const [pwError,      setPwError]      = useState("");
  const [pwSuccess,    setPwSuccess]    = useState(false);
  const [theme,        setTheme]        = useState<"dark"|"system">("dark");
  const [accentColor,  setAccentColor]  = useState("#F97316");
  const [sidebarCollapsedPref, setSidebarCollapsedPref] = useState(false);
  const [notifPrefs,   setNotifPrefs]   = useState({ email:true, sms:true, overdue:true, payments:true, bookings:true, fleet:false });
  const [twoFactor,    setTwoFactor]    = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("24");
  const [companyName,  setCompanyName]  = useState("Moventra Safaris & Logistics Ltd");
  const [companyPhone, setCompanyPhone] = useState("+254 727 247 032");
  const [companyEmail, setCompanyEmail] = useState("info@moventrasafarislogisticsltd.com");
  const [taxRate,      setTaxRate]      = useState("16");
  const [currency,     setCurrency]     = useState("KES");
  const [saving,       setSaving]       = useState(false);
  const [saveSuccess,  setSaveSuccess]  = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const name = localStorage.getItem("moventra-admin-name");
    if (name) setAdminName(name);
    fetch("/api/notifications").then(r=>r.json()).then(d => { if(d.alerts) setAlerts(d.alerts); }).catch(()=>{});
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    if (!searchOpen) return;
    setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") { setSearchOpen(false); setNotifOpen(false); setSettingsOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const doSearch = async (q: string) => {
    setSearchQ(q);
    if (q.length < 2) { setSearchRes([]); return; }
    try {
      const r = await fetch("/api/search?q=" + encodeURIComponent(q));
      const d = await r.json();
      setSearchRes(d.results || []);
    } catch {}
  };

  const signOut = () => {
    document.cookie = "mock_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/moventra-access";
  };

  // ── Nav item ─────────────────────────────────────────────────────────────────
  const NavItem = ({ item, mini }: { item: typeof NAV_MAIN[0]; mini?: boolean }) => {
    const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
    return (
      <Link href={item.href}
        title={mini ? item.title : undefined}
        className={`group flex items-center gap-3 rounded-xl transition-all duration-150 ${
          mini ? "justify-center p-2.5" : "px-3 py-2"
        } ${active
          ? "text-white"
          : "text-slate-400 hover:text-white hover:bg-white/5"
        }`}
        style={active ? { background:`${item.color}18`, boxShadow:`inset 0 0 0 1px ${item.color}30` } : {}}>
        <item.icon className={`shrink-0 transition-transform group-hover:scale-110 ${mini?"h-5 w-5":"h-4 w-4"}`}
          style={{ color: item.color }} />
        {!mini && <span className="text-sm font-medium truncate leading-none">{item.title}</span>}
        {!mini && active && <span className="ml-auto h-1.5 w-1.5 rounded-full shrink-0" style={{background:item.color}} />}
      </Link>
    );
  };

  // ── Sidebar content ───────────────────────────────────────────────────────────
  const SidebarContent = ({ mini }: { mini?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center shrink-0 ${mini ? "justify-center px-3 py-4" : "gap-3 px-4 py-4"}`}
        style={{ borderBottom:`1px solid ${T.border}` }}>
        <div className="relative shrink-0">
          <Image src="/images/logo.png" alt="M" width={36} height={36}
            className="rounded-xl object-contain" />
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2"
            style={{borderColor:T.surface}} />
        </div>
        {!mini && (
          <div>
            <p className="text-white font-bold text-sm leading-tight tracking-tight">MOVENTRA</p>
            <p className="text-slate-500 text-[10px] leading-tight">Safaris & Logistics</p>
          </div>
        )}
        {!mini && (
          <button onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {/* Main */}
        {!mini && <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 px-3 pb-1.5 pt-1">Main</p>}
        {NAV_MAIN.map(item => <NavItem key={item.href} item={item} mini={mini} />)}

        {/* Services */}
        <div className={`${mini ? "mt-3 pt-3" : "mt-4 pt-3"}`} style={{borderTop:`1px solid ${T.border}`}}>
          {!mini && <p className="text-[9px] font-bold uppercase tracking-widest text-[#F97316] px-3 pb-1.5 pt-1">Services</p>}
          {mini && <div className="h-px mx-2 mb-2" style={{background:T.border}} />}
          {NAV_SERVICES.map(item => <NavItem key={item.href} item={item} mini={mini} />)}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-2 py-3" style={{borderTop:`1px solid ${T.border}`}}>
        {!mini && (
          <button onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group mb-1">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
              style={{background:`${T.accent}20`, color:T.accent}}>
              {adminName.slice(0,2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white text-xs font-semibold truncate">{adminName}</p>
              <p className="text-slate-500 text-[10px] truncate">Administrator</p>
            </div>
            <Settings className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </button>
        )}
        {mini && (
          <button onClick={() => setSettingsOpen(true)}
            title="Settings"
            className="flex items-center justify-center w-full p-2.5 rounded-xl hover:bg-white/5 transition-colors">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{background:`${T.accent}20`, color:T.accent}}>
              {adminName.slice(0,2).toUpperCase()}
            </div>
          </button>
        )}
        <button onClick={signOut}
          className={`flex items-center gap-2 w-full rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/8 transition-all text-xs font-medium ${mini?"justify-center p-2.5":"px-3 py-2"}`}>
          <LogOut className={mini?"h-4 w-4":"h-3.5 w-3.5"} />
          {!mini && "Sign Out"}
        </button>
      </div>
    </div>
  );

  const crumb = breadcrumb(pathname);
  const crumbIcon = [...NAV_MAIN,...NAV_SERVICES].find(i => pathname.startsWith(i.href) && i.href !== "/admin");

  return (
    <div className="flex h-screen overflow-hidden" style={{background:T.bg, fontFamily:"'Outfit', system-ui, sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,.18); }
        .admin-font { font-family: 'Outfit', system-ui, sans-serif; }
        .admin-display { font-family: 'Syne', sans-serif; }
        .admin-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        .slide-in { animation: slideIn .2s ease both; }
        .fade-in  { animation: fadeIn .15s ease both; }
        .scale-in { animation: scaleIn .2s ease both; }
      `}</style>

      {/* ── Accent line ────────────────────────────────────────────────────── */}
      <div className="fixed top-0 inset-x-0 h-px z-[100]"
        style={{background:`linear-gradient(90deg, transparent, ${T.accent}, transparent)`}} />

      {/* ── Desktop sidebar (collapsible) ─────────────────────────────────── */}
      <aside className={`hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out`}
        style={{ width: collapsed ? 64 : 240, background:T.surface, borderRight:`1px solid ${T.border}` }}>
        {collapsed
          ? <SidebarContent mini />
          : <SidebarContent />}
        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(v => !v)}
          className="absolute left-0 hidden lg:flex items-center justify-center w-5 h-8 rounded-r-lg transition-all hover:w-6"
          style={{ top:"50%", transform:"translateY(-50%)", marginLeft: collapsed ? 64 : 240, background:T.elevated, border:`1px solid ${T.border}`, color:T.muted }}>
          <ChevronRight className={`h-3 w-3 transition-transform ${collapsed ? "" : "rotate-180"}`} />
        </button>
      </aside>

      {/* ── Mobile overlay ─────────────────────────────────────────────────── */}
      {mounted && sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden fade-in"
          style={{background:"rgba(0,0,0,.6)", backdropFilter:"blur(4px)"}}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Mobile sidebar ─────────────────────────────────────────────────── */}
      {mounted && (
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 lg:hidden transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{background:T.surface, borderRight:`1px solid ${T.border}`}}>
          <SidebarContent />
        </aside>
      )}

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Topbar ─────────────────────────────────────────────────────── */}
        <header className="flex items-center gap-3 h-14 px-4 shrink-0"
          style={{ background:`${T.surface}e8`, borderBottom:`1px solid ${T.border}`, backdropFilter:"blur(12px)" }}>

          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/8 transition-colors">
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <Image src="/images/logo.png" alt="M" width={24} height={24} className="rounded-lg" />
            <span className="text-white font-bold text-sm">Moventra</span>
          </div>

          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/admin" className="text-slate-500 hover:text-white text-sm transition-colors">Admin</Link>
            {pathname !== "/admin" && (
              <div className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-slate-700" />
                {crumbIcon && <crumbIcon.icon className="h-3.5 w-3.5" style={{color:crumbIcon.color}} />}
                <span className="text-white text-sm font-semibold">{crumb}</span>
              </div>
            )}
          </div>

          {/* Mobile page title */}
          <div className="lg:hidden ml-auto flex items-center gap-1.5">
            {crumbIcon && <crumbIcon.icon className="h-4 w-4" style={{color:crumbIcon.color}} />}
            <span className="text-white text-sm font-semibold">{crumb}</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">

            {/* Search */}
            <button onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 h-8 rounded-xl text-slate-500 hover:text-white transition-all text-xs"
              style={{background:T.subtle, border:`1px solid ${T.border}`}}>
              <Search className="h-3.5 w-3.5" />
              <span className="hidden md:block">Search</span>
              <kbd className="hidden md:block text-[9px] px-1.5 py-0.5 rounded font-mono"
                style={{background:T.elevated, color:T.muted, border:`1px solid ${T.border}`}}>⌘K</kbd>
            </button>
            <button onClick={() => setSearchOpen(true)}
              className="sm:hidden p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/8 transition-colors">
              <Search className="h-4 w-4" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(v => !v)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/8 transition-colors">
                <Bell className="h-4 w-4" />
                {alerts.filter(a=>a.severity==="critical").length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 w-80 rounded-2xl shadow-2xl overflow-hidden z-50 slide-in"
                  style={{background:T.elevated, border:`1px solid ${T.border}`}}>
                  <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:`1px solid ${T.border}`}}>
                    <p className="text-white font-semibold text-sm">Notifications</p>
                    <button onClick={() => setNotifOpen(false)} className="text-slate-500 hover:text-white text-xs">Close</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-10 text-slate-500">
                        <Bell className="h-8 w-8 opacity-30" />
                        <p className="text-sm">All clear</p>
                      </div>
                    ) : alerts.map((a, i) => (
                      <a key={i} href={a.href} onClick={() => setNotifOpen(false)}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-l-2 ${a.severity==="critical"?"border-l-red-500":"border-l-amber-500"}`}
                        style={{borderBottom:`1px solid ${T.border}`}}>
                        <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${a.severity==="critical"?"bg-red-400":"bg-amber-400"}`} />
                        <p className="text-slate-300 text-xs leading-relaxed">{a.message}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <button onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-white/5 transition-colors">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                style={{background:`${T.accent}20`, color:T.accent}}>
                {adminName.slice(0,2).toUpperCase()}
              </div>
              <span className="text-white text-xs font-medium hidden sm:block">{adminName}</span>
            </button>

          </div>
        </header>

        {/* ── Page content ───────────────────────────────────────────────── */}
        <main className="flex-1 overflow-auto relative admin-font"
          style={{background:T.bg}}>
          {/* Subtle background pattern */}
          <div className="fixed inset-0 pointer-events-none"
            style={{
              backgroundImage:`radial-gradient(circle at 20% 20%, rgba(249,115,22,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(56,189,248,0.02) 0%, transparent 50%)`,
              zIndex:0,
            }} />
          {/* Watermark */}
          <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.025] select-none" style={{zIndex:0}}>
            <Image src="/images/logo.png" alt="" width={400} height={400} className="object-contain" unoptimized />
          </div>
          <div className="relative z-10 p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* ── Search modal ─────────────────────────────────────────────────── */}
      {mounted && searchOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-20 px-4 fade-in"
          style={{background:"rgba(0,0,0,.7)", backdropFilter:"blur(8px)"}}
          onClick={() => { setSearchOpen(false); setSearchQ(""); setSearchRes([]); }}>
          <div className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl scale-in"
            style={{background:T.elevated, border:`1px solid ${T.borderHover}`}}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3.5" style={{borderBottom:`1px solid ${T.border}`}}>
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input ref={searchRef} value={searchQ} onChange={e => doSearch(e.target.value)}
                placeholder="Search clients, bookings, invoices..."
                className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm admin-font" />
              <div className="flex items-center gap-2">
                <kbd className="text-[10px] px-2 py-0.5 rounded admin-mono"
                  style={{background:T.subtle, color:T.muted, border:`1px solid ${T.border}`}}>ESC</kbd>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {searchQ.length < 2 ? (
                <div className="grid grid-cols-3 gap-2 p-4">
                  {[...NAV_MAIN.slice(0,6)].map(item => (
                    <a key={item.href} href={item.href} onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-all"
                      style={{background:T.subtle, border:`1px solid ${T.border}`}}>
                      <item.icon className="h-3.5 w-3.5 shrink-0" style={{color:item.color}} />
                      <span className="truncate">{item.title}</span>
                    </a>
                  ))}
                </div>
              ) : searchRes.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-slate-500 text-sm">No results for &ldquo;{searchQ}&rdquo;</p>
                </div>
              ) : searchRes.map((r, i) => (
                <a key={i} href={r.href} onClick={() => { setSearchOpen(false); setSearchQ(""); setSearchRes([]); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  style={{borderBottom:`1px solid ${T.border}`}}>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                    style={{background:"rgba(249,115,22,.12)", color:T.accent}}>
                    {r.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{r.label}</p>
                    <p className="text-slate-500 text-xs truncate">{r.sub}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Settings modal ────────────────────────────────────────────────── */}
      {mounted && settingsOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-4 fade-in"
          style={{background:"rgba(0,0,0,.8)", backdropFilter:"blur(12px)"}}
          onClick={() => setSettingsOpen(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl scale-in flex flex-col"
            style={{background:T.surface, border:`1px solid ${T.borderHover}`}}
            onClick={e => e.stopPropagation()}>

            {/* ── Header ── */}
            <div className="flex items-center gap-4 px-6 py-4 shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-base"
                  style={{background:`${T.accent}20`, color:T.accent, fontFamily:"'Syne', sans-serif"}}>
                  {adminName.slice(0,2).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2"
                  style={{borderColor:T.surface}} />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-base">{adminName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{background:`${T.accent}15`, color:T.accent}}>
                    {adminRole === "admin" ? "Administrator" : "Staff Member"}
                  </span>
                  <span className="text-slate-600 text-[10px]">Moventra Safaris & Logistics</span>
                </div>
              </div>
              <button onClick={() => setSettingsOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/8 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-0.5 px-4 py-2 shrink-0" style={{borderBottom:`1px solid ${T.border}`, overflowX:"auto"}}>
              {([
                {k:"profile",       label:"Profile"},
                {k:"security",      label:"Security"},
                {k:"appearance",    label:"Appearance"},
                {k:"notifications", label:"Notifications"},
                {k:"system",        label:"System"},
              ] as const).map(({k, label}) => (
                <button key={k} onClick={() => setSettingsTab(k)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
                  style={{
                    background: settingsTab===k ? `${T.accent}18` : "transparent",
                    color: settingsTab===k ? T.accent : "#64748B",
                    border: settingsTab===k ? `1px solid ${T.accent}30` : "1px solid transparent",
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{scrollbarWidth:"thin"}}>

              {/* PROFILE */}
              {settingsTab === "profile" && (
                <div className="space-y-5 slide-in">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Personal Information</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        {label:"Display Name",   value:adminName,   set:(v:string)=>setAdminName(v),   type:"text",  ph:"Your name"},
                        {label:"Email Address",  value:adminEmail,  set:(v:string)=>setAdminEmail(v),  type:"email", ph:"admin@example.com"},
                        {label:"Phone Number",   value:adminPhone,  set:(v:string)=>setAdminPhone(v),  type:"tel",   ph:"+254 700 000 000"},
                      ].map(({label,value,set,type,ph}) => (
                        <div key={label} className={label==="Email Address"?"sm:col-span-2":""}>
                          <label className="text-xs font-medium text-slate-400 block mb-1.5">{label}</label>
                          <input type={type} value={value} onChange={e=>set(e.target.value)} placeholder={ph}
                            className="w-full rounded-xl h-10 px-3 text-sm text-white outline-none transition-all"
                            style={{background:T.elevated, border:`1px solid ${T.border}`, fontFamily:"'Outfit', sans-serif"}}
                            onFocus={e=>e.target.style.border=`1px solid ${T.accent}50`}
                            onBlur={e=>e.target.style.border=`1px solid ${T.border}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{borderTop:`1px solid ${T.border}`, paddingTop:20}}>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Role & Access</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {([
                        {k:"admin", label:"Administrator", sub:"Full system access — all modules"},
                        {k:"staff", label:"Staff Member",  sub:"Limited access — bookings & clients"},
                      ] as const).map(({k,label,sub}) => (
                        <button key={k} type="button" onClick={()=>setAdminRole(k)}
                          className="text-left p-3 rounded-xl border transition-all"
                          style={{
                            background: adminRole===k ? `${T.accent}10` : T.elevated,
                            border: adminRole===k ? `1.5px solid ${T.accent}40` : `1px solid ${T.border}`,
                          }}>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full border-2 flex items-center justify-center"
                              style={{borderColor: adminRole===k ? T.accent : "#64748B"}}>
                              {adminRole===k && <div className="w-1.5 h-1.5 rounded-full" style={{background:T.accent}} />}
                            </div>
                            <span className="text-white text-sm font-semibold">{label}</span>
                          </div>
                          <p className="text-slate-500 text-xs pl-5">{sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{borderTop:`1px solid ${T.border}`, paddingTop:20}}>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Session Activity</p>
                    <div className="rounded-xl p-4 space-y-3" style={{background:T.elevated, border:`1px solid ${T.border}`}}>
                      {[
                        {label:"Last Login",      val:"Today, 9:14 AM · Nairobi, KE"},
                        {label:"Device",          val:"Windows 11 · Chrome 124"},
                        {label:"IP Address",      val:"197.136.xxx.xxx"},
                        {label:"Session Expires", val:"In 23 hours 46 minutes"},
                      ].map(({label,val}) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-slate-500 text-xs">{label}</span>
                          <span className="text-slate-300 text-xs font-mono">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY */}
              {settingsTab === "security" && (
                <div className="space-y-5 slide-in">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Change Password</p>
                    <div className="space-y-3">
                      {[
                        {label:"Current Password", key:"current" as const, ph:"Enter current password"},
                        {label:"New Password",      key:"newPw"   as const, ph:"At least 8 characters"},
                        {label:"Confirm New",       key:"confirm" as const, ph:"Repeat new password"},
                      ].map(({label,key,ph}) => (
                        <div key={key}>
                          <label className="text-xs font-medium text-slate-400 block mb-1.5">{label}</label>
                          <div className="relative">
                            <input type={pwShow?"text":"password"} value={pwForm[key]}
                              onChange={e=>setPwForm(p=>({...p,[key]:e.target.value}))} placeholder={ph}
                              className="w-full rounded-xl h-10 px-3 pr-10 text-sm text-white outline-none transition-all"
                              style={{background:T.elevated, border:`1px solid ${T.border}`, fontFamily:"'Outfit', sans-serif"}}
                              onFocus={e=>e.target.style.border=`1px solid ${T.accent}50`}
                              onBlur={e=>e.target.style.border=`1px solid ${T.border}`} />
                            {key==="current" && (
                              <button type="button" onClick={()=>setPwShow(v=>!v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                                {pwShow ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {pwError && <p className="text-red-400 text-xs">{pwError}</p>}
                      {pwSuccess && <p className="text-emerald-400 text-xs">Password changed successfully ✓</p>}
                      <button type="button"
                        onClick={() => {
                          setPwError("");
                          if (!pwForm.current) { setPwError("Enter current password"); return; }
                          if (pwForm.newPw.length < 8) { setPwError("New password must be 8+ characters"); return; }
                          if (pwForm.newPw !== pwForm.confirm) { setPwError("Passwords do not match"); return; }
                          setPwSuccess(true);
                          setTimeout(() => { setPwSuccess(false); setPwForm({current:"",newPw:"",confirm:""}); }, 3000);
                        }}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all text-white"
                        style={{background:`${T.accent}`, border:`1px solid ${T.accent}`}}>
                        Update Password
                      </button>
                    </div>
                  </div>
                  <div style={{borderTop:`1px solid ${T.border}`, paddingTop:20}}>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Two-Factor Authentication</p>
                    <div className="flex items-center justify-between p-4 rounded-xl"
                      style={{background:T.elevated, border:`1px solid ${T.border}`}}>
                      <div>
                        <p className="text-white text-sm font-semibold">Authenticator App</p>
                        <p className="text-slate-500 text-xs mt-0.5">Generate one-time codes for each login</p>
                      </div>
                      <button type="button" onClick={() => setTwoFactor(v=>!v)}
                        className="relative w-11 h-6 rounded-full transition-all"
                        style={{background: twoFactor ? T.accent : T.subtle}}>
                        <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                          style={{left: twoFactor ? "calc(100% - 22px)" : 2}} />
                      </button>
                    </div>
                  </div>
                  <div style={{borderTop:`1px solid ${T.border}`, paddingTop:20}}>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Session Management</p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-400 block mb-1.5">Session Timeout</label>
                        <select value={sessionTimeout} onChange={e=>setSessionTimeout(e.target.value)}
                          className="w-full rounded-xl h-10 px-3 text-sm text-white outline-none"
                          style={{background:T.elevated, border:`1px solid ${T.border}`, fontFamily:"'Outfit', sans-serif", appearance:"none"}}>
                          {[["1","1 hour"],["8","8 hours"],["24","24 hours"],["168","7 days"]].map(([v,l])=>(
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                      </div>
                      <button type="button"
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-400 transition-all"
                        style={{background:"rgba(248,113,113,.08)", border:"1px solid rgba(248,113,113,.2)"}}>
                        Sign Out All Other Sessions
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* APPEARANCE */}
              {settingsTab === "appearance" && (
                <div className="space-y-5 slide-in">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Theme</p>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        {k:"dark",   label:"Dark Mode",   sub:"Deep obsidian — default"},
                        {k:"system", label:"System",      sub:"Follows OS preference"},
                      ] as const).map(({k,label,sub})=>(
                        <button key={k} type="button" onClick={()=>setTheme(k)}
                          className="text-left p-4 rounded-xl border transition-all"
                          style={{
                            background: theme===k ? `${T.accent}10` : T.elevated,
                            border: theme===k ? `1.5px solid ${T.accent}40` : `1px solid ${T.border}`,
                          }}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-3 h-3 rounded-full border-2 flex items-center justify-center"
                              style={{borderColor: theme===k ? T.accent : "#64748B"}}>
                              {theme===k && <div className="w-1.5 h-1.5 rounded-full" style={{background:T.accent}} />}
                            </div>
                            <span className="text-white text-sm font-semibold">{label}</span>
                          </div>
                          <p className="text-slate-500 text-xs pl-5">{sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{borderTop:`1px solid ${T.border}`, paddingTop:20}}>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Accent Color</p>
                    <div className="flex gap-3 flex-wrap">
                      {[
                        {c:"#F97316",label:"Moventra Orange"},
                        {c:"#38BDF8",label:"Sky Blue"},
                        {c:"#34D399",label:"Emerald"},
                        {c:"#A78BFA",label:"Violet"},
                        {c:"#FB7185",label:"Rose"},
                        {c:"#FBBF24",label:"Amber"},
                      ].map(({c,label})=>(
                        <button key={c} type="button" onClick={()=>setAccentColor(c)}
                          title={label}
                          className="w-9 h-9 rounded-xl transition-all"
                          style={{
                            background:c,
                            boxShadow: accentColor===c ? `0 0 0 2px ${T.surface}, 0 0 0 4px ${c}` : "none",
                            transform: accentColor===c ? "scale(1.1)" : "scale(1)",
                          }} />
                      ))}
                    </div>
                    <p className="text-slate-600 text-[10px] mt-2">Current: {accentColor}</p>
                  </div>
                  <div style={{borderTop:`1px solid ${T.border}`, paddingTop:20}}>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Layout</p>
                    <div className="flex items-center justify-between p-4 rounded-xl"
                      style={{background:T.elevated, border:`1px solid ${T.border}`}}>
                      <div>
                        <p className="text-white text-sm font-semibold">Collapsed Sidebar by Default</p>
                        <p className="text-slate-500 text-xs mt-0.5">Start with icon-only rail on load</p>
                      </div>
                      <button type="button" onClick={()=>setSidebarCollapsedPref(v=>!v)}
                        className="relative w-11 h-6 rounded-full transition-all"
                        style={{background: sidebarCollapsedPref ? T.accent : T.subtle}}>
                        <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                          style={{left: sidebarCollapsedPref ? "calc(100% - 22px)" : 2}} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS */}
              {settingsTab === "notifications" && (
                <div className="space-y-5 slide-in">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Notification Channels</p>
                    <div className="space-y-3">
                      {([
                        {k:"email",    label:"Email Notifications",    sub:"Receive alerts via email"},
                        {k:"sms",      label:"SMS Alerts",             sub:"Critical alerts via SMS"},
                      ] as const).map(({k,label,sub})=>(
                        <div key={k} className="flex items-center justify-between p-4 rounded-xl"
                          style={{background:T.elevated, border:`1px solid ${T.border}`}}>
                          <div>
                            <p className="text-white text-sm font-semibold">{label}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
                          </div>
                          <button type="button" onClick={()=>setNotifPrefs(p=>({...p,[k]:!p[k]}))}
                            className="relative w-11 h-6 rounded-full transition-all"
                            style={{background: notifPrefs[k] ? T.accent : T.subtle}}>
                            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                              style={{left: notifPrefs[k] ? "calc(100% - 22px)" : 2}} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{borderTop:`1px solid ${T.border}`, paddingTop:20}}>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Alert Types</p>
                    <div className="space-y-2">
                      {([
                        {k:"overdue",  label:"Overdue Payments",      sub:"Alert when invoice is past due"},
                        {k:"payments", label:"Payment Received",       sub:"M-Pesa & bank confirmations"},
                        {k:"bookings", label:"New Bookings",           sub:"When a booking is created"},
                        {k:"fleet",    label:"Fleet Due for Service",  sub:"Vehicle maintenance reminders"},
                      ] as const).map(({k,label,sub})=>(
                        <label key={k} className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-white/3 transition-colors"
                          style={{border:`1px solid ${T.border}`}}>
                          <div>
                            <p className="text-white text-sm font-medium">{label}</p>
                            <p className="text-slate-500 text-xs">{sub}</p>
                          </div>
                          <div className="relative shrink-0">
                            <input type="checkbox" className="sr-only" checked={notifPrefs[k]}
                              onChange={()=>setNotifPrefs(p=>({...p,[k]:!p[k]}))} />
                            <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
                              style={{
                                background: notifPrefs[k] ? T.accent : "transparent",
                                borderColor: notifPrefs[k] ? T.accent : "#475569",
                              }}>
                              {notifPrefs[k] && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SYSTEM */}
              {settingsTab === "system" && (
                <div className="space-y-5 slide-in">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Company Information</p>
                    <div className="space-y-3">
                      {[
                        {label:"Company Name",  value:companyName,  set:setCompanyName,  ph:"Moventra Safaris & Logistics Ltd"},
                        {label:"Phone",         value:companyPhone, set:setCompanyPhone, ph:"+254 727 247 032"},
                        {label:"Email",         value:companyEmail, set:setCompanyEmail, ph:"info@company.com"},
                      ].map(({label,value,set,ph})=>(
                        <div key={label}>
                          <label className="text-xs font-medium text-slate-400 block mb-1.5">{label}</label>
                          <input value={value} onChange={e=>set(e.target.value)} placeholder={ph}
                            className="w-full rounded-xl h-10 px-3 text-sm text-white outline-none transition-all"
                            style={{background:T.elevated, border:`1px solid ${T.border}`, fontFamily:"'Outfit', sans-serif"}}
                            onFocus={e=>e.target.style.border=`1px solid ${T.accent}50`}
                            onBlur={e=>e.target.style.border=`1px solid ${T.border}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{borderTop:`1px solid ${T.border}`, paddingTop:20}}>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Financial Defaults</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium text-slate-400 block mb-1.5">Default Currency</label>
                        <select value={currency} onChange={e=>setCurrency(e.target.value)}
                          className="w-full rounded-xl h-10 px-3 text-sm text-white outline-none"
                          style={{background:T.elevated, border:`1px solid ${T.border}`, fontFamily:"'Outfit', sans-serif", appearance:"none"}}>
                          {["KES","USD","EUR","GBP","TZS","UGX"].map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-400 block mb-1.5">VAT / Tax Rate (%)</label>
                        <input type="number" min="0" max="100" value={taxRate} onChange={e=>setTaxRate(e.target.value)}
                          className="w-full rounded-xl h-10 px-3 text-sm text-white outline-none"
                          style={{background:T.elevated, border:`1px solid ${T.border}`, fontFamily:"'JetBrains Mono', monospace"}}
                          onFocus={e=>e.target.style.border=`1px solid ${T.accent}50`}
                          onBlur={e=>e.target.style.border=`1px solid ${T.border}`} />
                      </div>
                    </div>
                  </div>
                  <div style={{borderTop:`1px solid ${T.border}`, paddingTop:20}}>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">System Info</p>
                    <div className="rounded-xl p-4 space-y-2.5" style={{background:T.elevated, border:`1px solid ${T.border}`}}>
                      {[
                        {label:"Version",       val:"v2.1.0 · Build 267f1f4"},
                        {label:"Database",      val:"Supabase PostgreSQL"},
                        {label:"Environment",   val:"Development"},
                        {label:"Framework",     val:"Next.js 15.3.2 · Turbopack"},
                        {label:"Last Deploy",   val:"May 2025"},
                      ].map(({label,val})=>(
                        <div key={label} className="flex justify-between text-xs">
                          <span className="text-slate-500">{label}</span>
                          <span className="text-slate-300 font-mono">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{borderTop:`1px solid ${T.border}`, paddingTop:20}}>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Danger Zone</p>
                    <div className="rounded-xl p-4 space-y-3" style={{border:"1px solid rgba(248,113,113,.2)", background:"rgba(248,113,113,.04)"}}>
                      <p className="text-slate-400 text-xs">These actions are permanent and cannot be undone.</p>
                      <button type="button"
                        onClick={()=>{ if(confirm("Clear browser cache and reload?")){ window.location.reload(); } }}
                        className="w-full py-2 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-all"
                        style={{border:"1px solid rgba(251,191,36,.2)"}}>
                        Clear Cache & Reload
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 shrink-0" style={{borderTop:`1px solid ${T.border}`}}>
              <button onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all"
                style={{border:"1px solid rgba(248,113,113,.2)"}}>
                <LogOut className="h-3.5 w-3.5" />Sign Out
              </button>
              <div className="flex items-center gap-2">
                {saveSuccess && <p className="text-emerald-400 text-xs">{saveSuccess}</p>}
                <button type="button"
                  onClick={async () => {
                    setSaving(true);
                    await new Promise(r=>setTimeout(r,800));
                    localStorage.setItem("moventra-admin-name", adminName);
                    localStorage.setItem("moventra-theme", theme);
                    setSaving(false);
                    setSaveSuccess("Saved ✓");
                    setTimeout(()=>setSaveSuccess(""),2500);
                  }}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white transition-all"
                  style={{background:T.accent}}>
                  {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving...</> : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
