"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Car, Compass, Plane, Truck, Bus, Wrench, Package, Ship, HardHat,
  LogOut, User as UserIcon, Gauge, UsersRound, Users, Fingerprint,
  ShieldX, ReceiptText, BadgeDollarSign, FileBadge, Sliders, Anchor,
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
];

const NAV_SERVICES: { title:string; href:string; icon:LucideIcon; color:string }[] = [
  { title:"Car Rental",              href:"/admin/car-rental",             icon:Car,     color:"#818CF8" },
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 fade-in"
          style={{background:"rgba(0,0,0,.7)", backdropFilter:"blur(8px)"}}
          onClick={() => setSettingsOpen(false)}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl scale-in"
            style={{background:T.elevated, border:`1px solid ${T.borderHover}`}}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:`1px solid ${T.border}`}}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{background:`${T.accent}20`, color:T.accent}}>
                  {adminName.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{adminName}</p>
                  <p className="text-slate-500 text-xs">Administrator · Moventra</p>
                </div>
              </div>
              <button onClick={() => setSettingsOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { href:"/admin/users",   icon:UserIcon,  label:"Manage Users",       sub:"Add, edit, remove admin users" },
                { href:"/admin/services",icon:Sliders,   label:"Services Config",     sub:"Edit service packages & pricing" },
                { href:"/admin/reports", icon:BarChart3,  label:"Reports & Analytics", sub:"Revenue, bookings, performance" },
              ].map(({ href, icon:Icon, label, sub }) => (
                <Link key={href} href={href} onClick={() => setSettingsOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                  style={{border:`1px solid ${T.border}`}}>
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{background:T.subtle}}>
                    <Icon className="h-4 w-4" style={{color:T.accent}} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className="text-slate-500 text-xs">{sub}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </Link>
              ))}
            </div>
            <div className="px-5 pb-5">
              <button onClick={signOut}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                style={{border:`1px solid rgba(248,113,113,.2)`}}>
                <LogOut className="h-4 w-4" />Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
