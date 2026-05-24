"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Car, Building2, ArrowUpRight, Compass, Plane, Truck, Bus,
  Wrench, Package, Ship, HardHat, LogOut, User as UserIcon,
  Gauge, UsersRound, Users, Fingerprint, ShieldX, ReceiptText,
  BadgeDollarSign, FileBadge, Sliders, Anchor, Menu, X,
  ChevronDown, ChevronUp, Bell, Search, Settings, Lock, Eye, EyeOff, Save, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard",        href: "/admin",                     icon: Gauge,         color: "text-sky-400"     },
  { title: "Users",            href: "/admin/users",               icon: UsersRound,    color: "text-lime-400"    },
  { title: "Clients",          href: "/admin/clients",             icon: Users,         color: "text-green-400"   },
  { title: "Client Lookup",    href: "/admin/client-lookup",       icon: Fingerprint,   color: "text-violet-400"  },
  { title: "Blacklist",        href: "/admin/blacklist",           icon: ShieldX,       color: "text-rose-500"    },
  { title: "Verify Payment",   href: "/admin/verify-payment",      icon: ShieldCheck,   color: "text-emerald-400" },
  { title: "Fleet Management", href: "/admin/fleet",               icon: Truck,         color: "text-fuchsia-400" },
  { title: "Receipts",         href: "/admin/receipts",            icon: ReceiptText,   color: "text-teal-400"    },
  { title: "Accounts",         href: "/admin/accounts",            icon: BadgeDollarSign, color: "text-yellow-400"},
  { title: "Invoices",         href: "/admin/invoices",            icon: FileBadge,     color: "text-orange-400"  },
  { title: "Services Config",  href: "/admin/services",            icon: Sliders,       color: "text-pink-400"    },
];

const serviceItems = [
  { title: "Car Rental",              href: "/admin/car-rental",             icon: Car,     color: "text-emerald-400" },
  { title: "Safari Tours",            href: "/admin/safari-tours",           icon: Compass, color: "text-amber-400"   },
  { title: "Transfers",               href: "/admin/transfers",              icon: Plane,   color: "text-sky-400"     },
  { title: "Movers",                  href: "/admin/movers",                 icon: Package, color: "text-violet-500"  },
  { title: "Corporate Rental",        href: "/admin/corporate-rental",       icon: Bus,     color: "text-indigo-400"  },
  { title: "Road Recovery",           href: "/admin/road-recovery",          icon: Wrench,  color: "text-rose-400"    },
  { title: "Cargo Handling",          href: "/admin/cargo-handling",         icon: Anchor,  color: "text-orange-500"  },
  { title: "Shipment Imports",        href: "/admin/shipment-imports",       icon: Ship,    color: "text-cyan-500"    },
  { title: "Construction Equipment",  href: "/admin/construction-equipment", icon: HardHat, color: "text-yellow-500"  },
];

function getBreadcrumb(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  const all = [...navItems, ...serviceItems];
  const match = all.find(i => pathname.startsWith(i.href) && i.href !== "/admin");
  return match?.title || "Admin";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{type:string;label:string;sub:string;href:string;flag?:string}[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [alerts, setAlerts] = useState<{type:string;severity:string;message:string;href:string}[]>([]);
  const [alertCount, setAlertCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwShow, setPwShow] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    setIsMounted(true);
    // Load notifications
    fetch("/api/notifications").then(r => r.json()).then(d => {
      if (d.alerts) { setAlerts(d.alerts); setAlertCount(d.count || 0); }
    }).catch(() => {});
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Close sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSignOut = () => {
    document.cookie = "mock_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/moventra-access";
  };

  const doSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await fetch("/api/search?q=" + encodeURIComponent(q));
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {}
  };

  const handlePasswordChange = () => {
    setPwError("");
    if (!pwForm.current) { setPwError("Enter current password"); return; }
    if (pwForm.current !== "moventra2024") { setPwError("Current password incorrect"); return; }
    if (pwForm.newPw.length < 8) { setPwError("New password must be at least 8 characters"); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError("Passwords do not match"); return; }
    // In production this would update the auth system
    setPwSuccess(true);
    setTimeout(() => { setSettingsOpen(false); setPwSuccess(false); setPwForm({ current: "", newPw: "", confirm: "" }); }, 2000);
  };

  const typeColors: Record<string,string> = {
    client: "text-blue-400 bg-blue-500/10",
    booking: "text-purple-400 bg-purple-500/10",
    invoice: "text-orange-400 bg-orange-500/10",
    receipt: "text-teal-400 bg-teal-500/10",
    blacklist: "text-red-400 bg-red-500/10",
  };

  // Map Tailwind color class to actual hex for active state
  const colorHex: Record<string,string> = {
    "text-sky-400":"#38bdf8", "text-lime-400":"#a3e635", "text-green-400":"#4ade80",
    "text-violet-400":"#a78bfa", "text-rose-500":"#f43f5e", "text-fuchsia-400":"#e879f9",
    "text-teal-400":"#2dd4bf", "text-emerald-400":"#34d399", "text-yellow-400":"#facc15", "text-orange-400":"#fb923c",
    "text-pink-400":"#f472b6", "text-emerald-400":"#34d399", "text-amber-400":"#fbbf24",
    "text-indigo-400":"#818cf8", "text-cyan-500":"#06b6d4", "text-rose-400":"#fb7185",
    "text-orange-500":"#f97316", "text-yellow-500":"#eab308", "text-violet-500":"#8b5cf6",
  };

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = item.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.href);
    const hex = colorHex[item.color] || "#ffffff";
    return (
      <Link href={item.href}
        className={"flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all "}
        style={isActive ? {
          background: hex + "1a",
          border: "1px solid " + hex + "40",
          color: "white",
        } : {
          border: "1px solid transparent",
          color: "#9ca3af",
        }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "white"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
        onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; (e.currentTarget as HTMLElement).style.background = ""; } }}>
        <item.icon className={"h-4 w-4 shrink-0"} style={{ color: hex }} />
        <span className="truncate">{item.title}</span>
        {isActive && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full shrink-0" style={{ background: hex }} />
        )}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0" style={{borderBottom:"1px solid rgba(230,126,34,0.25)"}}>
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="Moventra" width={40} height={40}
            className="rounded-full object-contain" />
          <div>
            <p className="text-white font-bold text-xs leading-tight">MOVENTRA</p>
            <p className="text-gray-400 text-[10px] leading-tight">Safaris & Logistics</p>
          </div>
        </Link>
        {/* Close button — mobile only */}
        <button onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-3 pb-1 pt-1">Main</p>
        {navItems.map(item => <NavLink key={item.href} item={item} />)}

        <div className="pt-3">
          <button
            onClick={() => setServicesExpanded(v => !v)}
            className="flex items-center justify-between w-full px-3 pb-1 pt-2 mt-1" style={{borderTop:"1px solid rgba(230,126,34,0.15)"}}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#e67e22]">Services</p>
            {servicesExpanded
              ? <ChevronUp className="h-3 w-3 text-[#e67e22]" />
              : <ChevronDown className="h-3 w-3 text-[#e67e22]" />}
          </button>
          {servicesExpanded && (
            <div className="space-y-0.5">
              {serviceItems.map(item => <NavLink key={item.href} item={item} />)}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/10 px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 mb-2">
          <div className="h-7 w-7 rounded-full bg-[#e67e22]/20 flex items-center justify-center shrink-0">
            <span className="text-[#e67e22] text-xs font-bold">AD</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">Admin</p>
            <p className="text-gray-500 text-[10px] truncate">admin@moventra.co.ke</p>
          </div>
        </div>
        <button onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm">
          <LogOut className="h-4 w-4" />Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a1628]">
      {/* ── Orange top accent bar ── */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#e67e22] to-transparent z-[100]" />

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-white/10 bg-[#0d1f35]">
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay ── */}
      {isMounted && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile sidebar ── */}
      {isMounted && (
        <aside className={"fixed inset-y-0 left-0 z-50 w-72 bg-[#0d1f35] border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:hidden " +
          (sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
          <SidebarContent />
        </aside>
      )}

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center gap-3 h-14 px-4 bg-[#0d1f35] shrink-0" style={{borderBottom:"1px solid rgba(230,126,34,0.3)"}}>
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <Image src="/images/logo.png" alt="Moventra" width={28} height={28} className="rounded-full object-contain" />
            <span className="text-white font-bold text-sm">Moventra</span>
          </div>

          {/* Breadcrumb — desktop */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">Admin</Link>
            {pathname !== "/admin" && (
              <>
                <span className="text-gray-600">/</span>
                <span className="text-white font-medium">{getBreadcrumb(pathname)}</span>
              </>
            )}
          </div>

          {/* Right side — current page on mobile */}
          <div className="lg:hidden ml-auto">
            <span className="text-white text-sm font-medium">{getBreadcrumb(pathname)}</span>
          </div>

          {/* Right side actions */}
          <div className="flex ml-auto items-center gap-1">
            {/* Search */}
            <button onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Search">
              <Search className="h-4 w-4" />
            </button>
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(v => !v)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors relative" title="Alerts">
                <Bell className="h-4 w-4" />
                {alertCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                    {alertCount > 9 ? "9+" : alertCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 bg-[#0d1f35] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <p className="text-white font-semibold text-sm">Alerts</p>
                    <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-white text-xs">Close</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <p className="text-gray-400 text-sm px-4 py-6 text-center">All clear — no alerts</p>
                    ) : alerts.map((a, i) => (
                      <a key={i} href={a.href} onClick={() => setNotifOpen(false)}
                        className={"flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors " + (a.severity === "critical" ? "border-l-2 border-l-red-500" : "border-l-2 border-l-amber-500")}>
                        <span className={"mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 " + (a.severity === "critical" ? "bg-red-400" : "bg-amber-400")} />
                        <p className="text-gray-300 text-xs leading-relaxed">{a.message}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Admin avatar + settings */}
            <button onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="h-7 w-7 rounded-full bg-[#e67e22]/20 flex items-center justify-center shrink-0">
                <span className="text-[#e67e22] text-xs font-bold">AD</span>
              </div>
              <span className="text-white text-xs hidden sm:block">{adminName}</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 relative">
          {/* Watermark */}
          <div className="pointer-events-none select-none print:hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.04] w-[500px] h-[500px]">
            <Image src="/images/logo.png" alt="" fill className="object-contain" unoptimized />
          </div>
          <div className="relative z-10">{children}</div>
        </main>
      </div>
      {/* ── Global Search Modal ── */}
      {isMounted && searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-start justify-center pt-24 px-4"
          onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}>
          <div className="w-full max-w-lg bg-[#0d1f35] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search className="h-5 w-5 text-gray-400 shrink-0" />
              <input autoFocus className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
                placeholder="Search clients, bookings, invoices, receipts..." value={searchQuery}
                onChange={e => doSearch(e.target.value)} />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-white/10">Esc</button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {searchQuery.length < 2 ? (
                <p className="text-gray-500 text-sm px-4 py-6 text-center">Type at least 2 characters to search</p>
              ) : searchResults.length === 0 ? (
                <p className="text-gray-500 text-sm px-4 py-6 text-center">No results for "{searchQuery}"</p>
              ) : searchResults.map((r, i) => (
                <a key={i} href={r.href} onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 border-b border-white/5 transition-colors">
                  <span className={"text-[10px] font-bold uppercase px-2 py-0.5 rounded-full " + (typeColors[r.type] || "text-gray-400 bg-gray-500/10")}>
                    {r.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{r.label}</p>
                    <p className="text-gray-400 text-xs truncate">{r.sub}</p>
                  </div>
                  {r.flag && <span className="text-red-400 text-[10px] font-bold uppercase bg-red-500/20 px-2 py-0.5 rounded-full shrink-0">{r.flag}</span>}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Settings Modal ── */}
      {isMounted && settingsOpen && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center px-4"
          onClick={() => setSettingsOpen(false)}>
          <div className="w-full max-w-md bg-[#0d1f35] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#e67e22]/20 flex items-center justify-center">
                  <span className="text-[#e67e22] font-bold">AD</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Admin Settings</p>
                  <p className="text-gray-400 text-xs">admin@moventrasafarislogisticsltd.com</p>
                </div>
              </div>
              <button onClick={() => setSettingsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {/* Display Name */}
              <div>
                <label className="text-gray-300 text-xs font-semibold block mb-1.5">DISPLAY NAME</label>
                <input className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#e67e22]/50"
                  value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="Your name" />
              </div>
              {/* Change Password */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                <p className="text-gray-300 text-xs font-semibold flex items-center gap-2"><Lock className="h-3.5 w-3.5" />CHANGE PASSWORD</p>
                {[
                  { key: "current", label: "Current Password", placeholder: "Current password" },
                  { key: "newPw",   label: "New Password",     placeholder: "Min 8 characters" },
                  { key: "confirm", label: "Confirm Password", placeholder: "Repeat new password" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-gray-400 text-xs block mb-1">{label}</label>
                    <div className="relative">
                      <input type={pwShow ? "text" : "password"}
                        className="w-full bg-[#0a1628] border border-white/20 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#e67e22]/50 pr-10"
                        placeholder={placeholder}
                        value={(pwForm as Record<string,string>)[key]}
                        onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} />
                      {key === "newPw" && (
                        <button type="button" onClick={() => setPwShow(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                          {pwShow ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {pwError && <p className="text-red-400 text-xs">{pwError}</p>}
                {pwSuccess && <p className="text-emerald-400 text-xs font-semibold">✓ Password changed successfully</p>}
              </div>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => setSettingsOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm">Cancel</button>
              <button onClick={handlePasswordChange}
                className="flex-1 py-2.5 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all">
                <Save className="h-4 w-4" />Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
