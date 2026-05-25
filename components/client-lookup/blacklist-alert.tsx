"use client";
import { ShieldX, AlertTriangle, Phone } from "lucide-react";

interface BlacklistEntry {
  id: string;
  client_name: string;
  record_type: string;
  severity: string;
  description: string;
  phone: string;
}

export function BlacklistAlert({ entries }: { entries: BlacklistEntry[] }) {
  if (!entries.length) return null;
  const isCritical = entries.some(e => e.severity === "high" || e.severity === "critical");
  return (
    <div className={`rounded-xl border p-4 space-y-3 ${isCritical ? "border-red-500/50 bg-red-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
      <div className="flex items-center gap-2">
        <ShieldX className={`h-5 w-5 shrink-0 ${isCritical ? "text-red-400" : "text-amber-400"}`} />
        <p className={`font-bold text-sm ${isCritical ? "text-red-300" : "text-amber-300"}`}>
          ⚠️ BLACKLIST ALERT — {entries.length} record{entries.length !== 1 ? "s" : ""} found
        </p>
      </div>
      {entries.map((e, i) => (
        <div key={i} className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs space-y-1">
          <p className="text-red-300 font-semibold">{e.client_name} — {e.record_type?.toUpperCase()}</p>
          <p className="text-gray-400">Severity: <span className="text-red-400 font-medium uppercase">{e.severity}</span></p>
          {e.description && <p className="text-gray-400">{e.description}</p>}
          {e.phone && <p className="text-gray-400 flex items-center gap-1"><Phone className="h-3 w-3" />{e.phone}</p>}
        </div>
      ))}
      {isCritical && (
        <p className="text-red-400 text-xs font-bold">Do NOT proceed without manager approval</p>
      )}
    </div>
  );
}
