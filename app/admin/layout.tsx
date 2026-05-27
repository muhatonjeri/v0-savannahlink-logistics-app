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
  ChevronDown, ChevronUp, Bell, Search, Settings, Lock, Eye, EyeOff, Save, ShieldCheck, BarChart3,
  Sun, Moon, Monitor, Fingerprint as FingerprintIcon, Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  { title: "Reports",          href: "/admin/reports",             icon: BarChart3,     color: "text-purple-400"  },
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
  const [lastLogin, setLastLogin] = useState<string>("");
  const [currentTheme, setCurrentTheme] = useState<"dark"|"light"|"system">("dark");
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"profile"|"security"|"theme"|"notifications"|"system">("profile");
  const [notifPrefs, setNotifPrefs] = useState({ email: true, sms: true, whatsapp: false, overdue: true, payments: true, bookings: true });
  const [companyName, setCompanyName] = useState("Moventra Safaris & Logistics Ltd");
  const [companyPhone, setCompanyPhone] = useState("+254 727 247 032");
  const [companyEmail, setCompanyEmail] = useState("info@moventrasafarislogisticsltd.com");
  const [userRole, setUserRole] = useState("admin");
  const [sessionTimeout, setSessionTimeout] = useState("24");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Detect role from cookie
    const cookies = document.cookie.split(";");
    const authCookie = cookies.find(c => c.trim().startsWith("mock_auth="));
    const role = authCookie?.split("=")?.[1]?.trim() || "admin";
    setUserRole(role === "staff" ? "staff" : "admin");

    // Load saved settings
    const _savedName = localStorage.getItem("moventra-admin-name");
    if (_savedName) setAdminName(_savedName);
    const savedTimeout = localStorage.getItem("moventra-session-timeout");
    if (savedTimeout) setSessionTimeout(savedTimeout);

    // Record last login
    const now = new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const prev = localStorage.getItem("moventra-last-login") || "";
    setLastLogin(prev);
    localStorage.setItem("moventra-last-login", now);

    // Init theme
    const stored = localStorage.getItem("moventra-theme") as "dark"|"light"|"system" || "dark";
    setCurrentTheme(stored);
    document.documentElement.classList.toggle("dark", stored === "dark" || (stored === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches));
    
    // Check biometrics support
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(available => {
        setBiometricsAvailable(available);
        setBiometricsEnabled(localStorage.getItem("moventra-biometrics") === "true");
      }).catch(() => {});
    }

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

  const applyTheme = (theme: "dark"|"light"|"system") => {
    setCurrentTheme(theme);
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("light", !isDark);
    localStorage.setItem("moventra-theme", theme);
  };

  const toggleBiometrics = async () => {
    if (!biometricsAvailable) { alert("Biometric authentication is not available on this device."); return; }
    if (biometricsEnabled) {
      localStorage.removeItem("moventra-biometrics");
      setBiometricsEnabled(false);
      toast.success("Biometrics disabled");
    } else {
      try {
        // Register biometric credential
        const credential = await navigator.credentials.create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: "Moventra Admin", id: window.location.hostname },
            user: { id: new Uint8Array(16), name: adminName || "admin", displayName: adminName || "Admin" },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }],
            authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
            timeout: 60000,
          }
        });
        if (credential) {
          localStorage.setItem("moventra-biometrics", "true");
          setBiometricsEnabled(true);
          toast.success("Biometrics enabled successfully");
        }
      } catch(e) {
        toast.error("Biometrics setup failed: " + String(e));
      }
    }
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
    "text-sky-400":"#38bdf8","text-lime-400":"#a3e635","text-green-400":"#4ade80",
    "text-violet-400":"#a78bfa","text-violet-500":"#8b5cf6","text-rose-400":"#fb7185",
    "text-rose-500":"#f43f5e","text-fuchsia-400":"#e879f9","text-teal-400":"#2dd4bf",
    "text-purple-400":"#c084fc","text-yellow-400":"#facc15","text-yellow-500":"#eab308",
    "text-orange-400":"#fb923c","text-orange-500":"#f97316","text-pink-400":"#f472b6",
    "text-emerald-400":"#34d399","text-amber-400":"#fbbf24","text-indigo-400":"#818cf8",
    "text-cyan-500":"#06b6d4",
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
<span className="text-white text-xs hidden sm:block font-medium">{adminName || "Admin"}</span>
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
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setSettingsOpen(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] bg-[#0d1f35] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}>

            {/* Settings Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#e67e22]/20 flex items-center justify-center">
                  <span className="text-[#e67e22] font-bold text-sm">{adminName.slice(0,2).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-white font-bold">{adminName}</p>
                  <div className="flex items-center gap-2">
                    <span className={"text-xs px-2 py-0.5 rounded-full font-semibold " + (userRole === "admin" ? "bg-[#e67e22]/20 text-[#e67e22]" : "bg-blue-500/20 text-blue-300")}>
                      {userRole === "admin" ? "Administrator" : "Staff Member"}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSettingsOpen(false)} className="text-gray-400 hover:text-white text-xl leading-none">✕</button>
            </div>

            {/* Settings Tabs */}
            <div className="flex gap-0 border-b border-white/10 shrink-0 overflow-x-auto">
              {([
                ["profile",      "👤", "Profile"      ],
                ["security",     "🔐", "Security"     ],
                ["theme",        "🎨", "Appearance"   ],
                ["notifications","🔔", "Alerts"       ],
                ["system",       "⚙️", "System"       ],
              ] as const).map(([tab, icon, label]) => (
                <button key={tab} onClick={() => setSettingsTab(tab)}
                  className={"flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all " +
                    (settingsTab === tab ? "border-[#e67e22] text-[#e67e22]" : "border-transparent text-gray-400 hover:text-white")}>
                  <span>{icon}</span>{label}
                </button>
              ))}
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* ─── PROFILE TAB ─── */}
              {settingsTab === "profile" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Personal Details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="text-gray-300 text-xs font-semibold block mb-1">Display Name</label>
                        <input className="w-full bg-[#0a1628] border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#e67e22]/50"
                          value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="Your name" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-gray-300 text-xs font-semibold block mb-1">Role</label>
                        <div className={"px-3 py-2.5 rounded-xl border border-white/10 text-sm " + (userRole==="admin"?"text-[#e67e22]":"text-blue-300")}>
                          {userRole === "admin" ? "🔑 Administrator — Full access" : "👤 Staff Member — Limited access"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {userRole === "admin" && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Company Details</p>
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-300 text-xs font-semibold block mb-1">Company Name</label>
                          <input className="w-full bg-[#0a1628] border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#e67e22]/50"
                            value={companyName} onChange={e => setCompanyName(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-gray-300 text-xs font-semibold block mb-1">Phone</label>
                            <input className="w-full bg-[#0a1628] border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#e67e22]/50"
                              value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} />
                          </div>
                          <div>
                            <label className="text-gray-300 text-xs font-semibold block mb-1">Email</label>
                            <input className="w-full bg-[#0a1628] border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#e67e22]/50"
                              value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── SECURITY TAB ─── */}
              {settingsTab === "security" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5" />Change Password
                    </p>
                    <p className="text-gray-500 text-xs">
                      {userRole === "staff" ? "Staff password: staff123 → change to a strong password" : "Admin password: admin123 → change to a strong password"}
                    </p>
                    {[
                      { key: "current", label: "Current Password", placeholder: userRole === "staff" ? "staff123" : "admin123" },
                      { key: "newPw",   label: "New Password",     placeholder: "Min 8 characters" },
                      { key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="text-gray-400 text-xs block mb-1">{label}</label>
                        <div className="relative">
                          <input type={pwShow ? "text" : "password"}
                            className="w-full bg-[#0a1628] border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#e67e22]/50 pr-10"
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
                    {pwError && <p className="text-red-400 text-xs flex items-center gap-1">⚠ {pwError}</p>}
                    {pwSuccess && <p className="text-emerald-400 text-xs flex items-center gap-1">✓ Password updated successfully</p>}
                    <button onClick={handlePasswordChange}
                      className="w-full py-2.5 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-semibold text-sm transition-all">
                      Update Password
                    </button>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                      <FingerprintIcon className="h-3.5 w-3.5" />Biometric Authentication
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm">Fingerprint / Face ID</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {biometricsAvailable ? "Skip password — use your device biometrics to sign in" : "Not supported on this device/browser"}
                        </p>
                      </div>
                      <button onClick={toggleBiometrics} disabled={!biometricsAvailable}
                        className={"relative w-12 h-6 rounded-full transition-all duration-300 " + (biometricsEnabled ? "bg-[#e67e22]" : "bg-gray-600") + (!biometricsAvailable ? " opacity-40 cursor-not-allowed" : " cursor-pointer")}>
                        <span className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 " + (biometricsEnabled ? "translate-x-6" : "")} />
                      </button>
                    </div>
                    {biometricsEnabled && <p className="text-emerald-400 text-xs">✓ Active on this device</p>}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Session Settings</p>
                    <div>
                      <label className="text-gray-300 text-xs font-semibold block mb-1">Auto-logout after</label>
                      <select className="w-full bg-[#0a1628] border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#e67e22]/50"
                        value={sessionTimeout} onChange={e => { setSessionTimeout(e.target.value); localStorage.setItem("moventra-session-timeout", e.target.value); }}>
                        <option value="1">1 hour</option>
                        <option value="4">4 hours</option>
                        <option value="8">8 hours (work day)</option>
                        <option value="24">24 hours</option>
                        <option value="168">7 days</option>
                      </select>
                    </div>
                    <button onClick={() => { document.cookie = "mock_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; window.location.href = "/moventra-access"; }}
                      className="w-full py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all">
                      Sign Out All Devices
                    </button>
                  </div>
                </div>
              )}

              {/* ─── APPEARANCE TAB ─── */}
              {settingsTab === "theme" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Color Theme</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([["dark","🌙","Dark Mode","Deep navy background — easy on eyes at night"],["light","☀️","Light Mode","Clean white — ideal for bright environments"],["system","💻","Follow System","Matches your device setting automatically"]] as const).map(([val,icon,label,desc]) => (
                        <button key={val} onClick={() => applyTheme(val)}
                          className={"py-3 px-2 rounded-xl border text-center transition-all " +
                            (currentTheme===val ? "border-[#e67e22] bg-[#e67e22]/15" : "border-white/10 hover:border-white/30")}>
                          <div className="text-2xl mb-1">{icon}</div>
                          <p className={"text-xs font-bold " + (currentTheme===val?"text-[#e67e22]":"text-white")}>{label}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Accent Color</p>
                    <div className="flex gap-2">
                      {["#e67e22","#3b82f6","#10b981","#8b5cf6","#ef4444","#f59e0b"].map(color => (
                        <button key={color} onClick={() => { document.documentElement.style.setProperty("--accent", color); localStorage.setItem("moventra-accent", color); }}
                          className="w-8 h-8 rounded-full border-2 border-white/20 hover:border-white/60 transition-all"
                          style={{backgroundColor: color}} />
                      ))}
                    </div>
                    <p className="text-gray-600 text-xs">Customise the system accent colour</p>
                  </div>
                </div>
              )}

              {/* ─── NOTIFICATIONS TAB ─── */}
              {settingsTab === "notifications" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Notification Channels</p>
                    {([
                      ["email","📧","Email Notifications","Receive alerts and confirmations by email"],
                      ["sms","📱","SMS Notifications","Get critical alerts by SMS (Africa's Talking)"],
                      ["whatsapp","💬","WhatsApp Notifications","Send booking confirmations via WhatsApp"],
                    ] as [keyof typeof notifPrefs, string, string, string][]).map(([key, icon, label, desc]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{icon}</span>
                          <div>
                            <p className="text-white text-sm font-medium">{label}</p>
                            <p className="text-gray-500 text-xs">{desc}</p>
                          </div>
                        </div>
                        <button onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                          className={"relative w-12 h-6 rounded-full transition-all duration-300 " + (notifPrefs[key] ? "bg-[#e67e22]" : "bg-gray-600")}>
                          <span className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 " + (notifPrefs[key] ? "translate-x-6" : "")} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Alert Types</p>
                    {([
                      ["overdue","🚨","Overdue payments & returns","Get alerted when payments or vehicle returns are overdue"],
                      ["payments","💰","Payment received","Notify when M-Pesa or bank payment is confirmed"],
                      ["bookings","📅","New bookings","Alert on new booking creation across all services"],
                    ] as [keyof typeof notifPrefs, string, string, string][]).map(([key, icon, label, desc]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{icon}</span>
                          <div>
                            <p className="text-white text-sm font-medium">{label}</p>
                            <p className="text-gray-500 text-xs">{desc}</p>
                          </div>
                        </div>
                        <button onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                          className={"relative w-12 h-6 rounded-full transition-all duration-300 " + (notifPrefs[key] ? "bg-[#e67e22]" : "bg-gray-600")}>
                          <span className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 " + (notifPrefs[key] ? "translate-x-6" : "")} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── SYSTEM TAB ─── */}
              {settingsTab === "system" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">System Information</p>
                    {[
                      ["Version", "v1.0.0"],
                      ["Environment", process.env.NODE_ENV || "development"],
                      ["Database", "Supabase PostgreSQL"],
                      ["Payments", "Safaricom M-Pesa Daraja"],
                      ["Tax Compliance", "KRA eTIMS"],
                      ["Hosting", window.location.hostname],
                    ].map(([k,v]) => (
                      <div key={k} className="flex justify-between text-sm border-b border-white/5 pb-2">
                        <span className="text-gray-400">{k}</span>
                        <span className="text-white font-mono text-xs">{v}</span>
                      </div>
                    ))}
                  </div>
                  {userRole === "admin" && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
                      <p className="text-red-400 text-xs font-bold uppercase tracking-wide">Danger Zone</p>
                      <p className="text-gray-500 text-xs">These actions are irreversible. Admin only.</p>
                      <button onClick={() => { if (confirm("Clear browser cache and reload?")) { const cs = (window as Window & { caches?: CacheStorage }).caches; if (cs) { cs.keys().then(keys => Promise.all(keys.map(k => cs.delete(k)))).then(() => window.location.reload()); } else { window.location.reload(); } } }}
                        className="w-full py-2 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-sm transition-all">
                        Clear Cache & Reload
                      </button>
                      <button onClick={() => { const data = { exported: new Date().toISOString(), url: window.location.href }; const a = document.createElement("a"); a.href = "data:application/json," + JSON.stringify(data,null,2); a.download = "moventra-settings.json"; a.click(); }}
                        className="w-full py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-sm transition-all">
                        Export Settings
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Settings Footer */}
            <div className="flex gap-3 px-5 py-4 border-t border-white/10 shrink-0">
              <button onClick={() => setSettingsOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm">
                Close
              </button>
              <button onClick={() => {
                localStorage.setItem("moventra-admin-name", adminName);
                localStorage.setItem("moventra-notif-prefs", JSON.stringify(notifPrefs));
                setSettingsOpen(false);
                // Show brief confirmation
                setTimeout(() => {}, 0);
              }}
                className="flex-1 py-2.5 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all">
                <Save className="h-4 w-4" />Save All Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
