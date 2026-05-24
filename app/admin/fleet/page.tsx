"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Truck, Building2, ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";

const CompanyFleet = dynamic(
  () => import("./tabs/company-fleet").then(m => ({ default: m.default })),
  { ssr: false, loading: () => <Loader /> }
);
const SubletAssets = dynamic(
  () => import("./tabs/sublet-assets").then(m => ({ default: m.default })),
  { ssr: false, loading: () => <Loader /> }
);
const FleetOut = dynamic(
  () => import("./tabs/fleet-out").then(m => ({ default: m.default })),
  { ssr: false, loading: () => <Loader /> }
);

const Loader = () => (
  <div className="flex h-64 items-center justify-center text-gray-400 animate-pulse">Loading...</div>
);

const TABS = [
  { key: "vehicles",  label: "Company Fleet",  icon: Truck,        color: "text-fuchsia-400" },
  { key: "sublets",   label: "Sublet Assets",  icon: Building2,    color: "text-cyan-400"    },
  { key: "fleet-out", label: "Fleet Out",       icon: ArrowUpRight, color: "text-purple-400"  },
];

function FleetHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") || "vehicles";

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-1 w-fit">
        {TABS.map(t => (
          <button key={t.key}
            onClick={() => router.push(`/admin/fleet?tab=${t.key}`, { scroll: false })}
            className={"flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all " +
              (tab === t.key
                ? "bg-[#0a1628] text-white shadow-lg border border-white/10"
                : "text-gray-400 hover:text-white hover:bg-white/5")}>
            <t.icon className={"h-4 w-4 " + (tab === t.key ? t.color : "text-gray-500")} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "vehicles"  && <CompanyFleet />}
      {tab === "sublets"   && <SubletAssets />}
      {tab === "fleet-out" && <FleetOut />}
    </div>
  );
}

export default function FleetPage() {
  return (
    <Suspense fallback={<Loader />}>
      <FleetHubContent />
    </Suspense>
  );
}
