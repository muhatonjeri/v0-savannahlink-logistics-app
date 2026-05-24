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
  ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard",        href: "/admin",                     icon: Gauge,         color: "text-sky-400"     },
  { title: "Users",            href: "/admin/users",               icon: UsersRound,    color: "text-lime-400"    },
  { title: "Clients",          href: "/admin/clients",             icon: Users,         color: "text-green-400"   },
  { title: "Client Lookup",    href: "/admin/client-lookup",       icon: Fingerprint,   color: "text-violet-400"  },
  { title: "Blacklist",        href: "/admin/blacklist",           icon: ShieldX,       color: "text-rose-500"    },
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

  useEffect(() => { setIsMounted(true); }, []);

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

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = item.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.href);
    return (
      <Link href={item.href}
        className={"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all " +
          (isActive
            ? "bg-white/10 text-white"
            : "text-gray-400 hover:text-white hover:bg-white/5")}>
        <item.icon className={"h-4 w-4 shrink-0 " + (isActive ? item.color : "text-gray-500")} />
        <span className="truncate">{item.title}</span>
        {isActive && <span className={"ml-auto h-1.5 w-1.5 rounded-full shrink-0 " + item.color.replace("text-", "bg-")} />}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0">
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
            className="flex items-center justify-between w-full px-3 pb-1 pt-1">
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
        <header className="flex items-center gap-3 h-14 px-4 border-b border-white/10 bg-[#0d1f35] shrink-0">
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

          {/* Right side actions — desktop */}
          <div className="hidden lg:flex ml-auto items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#e67e22]/20 flex items-center justify-center">
              <span className="text-[#e67e22] text-xs font-bold">AD</span>
            </div>
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
    </div>
  );
}
