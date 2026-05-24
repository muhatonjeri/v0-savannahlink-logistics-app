"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Truck, Building2, ArrowUpRight, Loader2 } from "lucide-react";

const TABS = [
  { key: "vehicles",  label: "Company Fleet",  icon: Truck,        color: "text-fuchsia-400" },
  { key: "sublets",   label: "Sublet Assets",  icon: Building2,    color: "text-cyan-400"    },
  { key: "fleet-out", label: "Fleet Out",       icon: ArrowUpRight, color: "text-purple-400"  },
];

const Spinner = () => (
  <div className="flex h-64 items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
  </div>
);

// Lazy load components only when needed
function TabContent({ tab }: { tab: string }) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    setComponent(null);
    if (tab === "vehicles") {
      import("./tabs/company-fleet").then(m => setComponent(() => m.default));
    } else if (tab === "sublets") {
      import("./tabs/sublet-assets").then(m => setComponent(() => m.default));
    } else if (tab === "fleet-out") {
      import("./tabs/fleet-out").then(m => setComponent(() => m.default));
    }
  }, [tab]);

  if (!Component) return <Spinner />;
  return <Component />;
}

function FleetHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") || "vehicles";

  return (
    <div className="space-y-6">
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
      <TabContent tab={tab} />
    </div>
  );
}

export default function FleetPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <FleetHubContent />
    </Suspense>
  );
}
