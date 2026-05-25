"use client";
import Link from "next/link";
import { Car, Compass, Plane, Truck, Bus, Wrench, Package, Ship, HardHat } from "lucide-react";

const SERVICES = [
  { id: "car-rental",             label: "Car Rental",           Icon: Car,     color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", href: "/admin/car-rental" },
  { id: "safari-tours",           label: "Safari Tours",         Icon: Compass, color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/30",   href: "/admin/safari-tours" },
  { id: "transfers",              label: "Transfers",            Icon: Plane,   color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/30",       href: "/admin/transfers" },
  { id: "movers",                 label: "Movers",               Icon: Truck,   color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/30", href: "/admin/movers" },
  { id: "corporate-rental",       label: "Corporate Rental",     Icon: Bus,     color: "text-indigo-400",  bg: "bg-indigo-500/10 border-indigo-500/30", href: "/admin/corporate-rental" },
  { id: "road-recovery",          label: "Road Recovery",        Icon: Wrench,  color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/30",     href: "/admin/road-recovery" },
  { id: "cargo-handling",         label: "Cargo Handling",       Icon: Package, color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/30", href: "/admin/cargo-handling" },
  { id: "shipment-imports",       label: "Shipment Imports",     Icon: Ship,    color: "text-cyan-400",    bg: "bg-cyan-500/10 border-cyan-500/30",     href: "/admin/shipment-imports" },
  { id: "construction-equipment", label: "Construction Equip.",  Icon: HardHat, color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/30", href: "/admin/construction-equipment" },
];

export function ServiceSelector({ clientName, clientPhone, clientEmail }: {
  clientName: string; clientPhone: string; clientEmail?: string;
}) {
  const prefill = encodeURIComponent(JSON.stringify({ customerName: clientName, customerPhone: clientPhone, customerEmail: clientEmail || "" }));
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {SERVICES.map(({ id, label, Icon, color, bg, href }) => (
        <Link key={id} href={`${href}?prefill=${prefill}`}
          className={`flex items-center gap-2 p-3 rounded-xl border transition-all hover:brightness-110 hover:scale-[1.02] ${bg}`}>
          <Icon className={`h-4 w-4 shrink-0 ${color}`} />
          <span className={`text-xs font-medium ${color}`}>{label}</span>
        </Link>
      ))}
    </div>
  );
}
