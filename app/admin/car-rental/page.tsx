"use client";
import { Suspense } from "react";
import Link from "next/link";
import ServicePage from "@/components/services/service-page";
import { SERVICES } from "@/lib/service-data";
import { FileSignature, Printer, Download } from "lucide-react";

const service = SERVICES.find(s => s.id === "car-rental")!;

function Content() {
  return (
    <div className="space-y-4">
      {/* Contract quick-access bar */}
      <div className="flex items-center gap-3 p-4 rounded-xl border"
        style={{ background:"rgba(249,115,22,.06)", borderColor:"rgba(249,115,22,.25)" }}>
        <FileSignature className="h-5 w-5 shrink-0" style={{ color:"#F97316" }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Hire / Lease Agreement</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Print or download the physical contract for walk-in clients — works offline, no system required
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <a href="/moventra-contract.html" target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background:"#F97316" }}>
            <Printer className="h-4 w-4" />Open Contract Form
          </a>
          <a href="/moventra-contract.html" download="Moventra-HireAgreement.html"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ color:"#F97316", borderColor:"rgba(249,115,22,.3)", background:"rgba(249,115,22,.08)" }}>
            <Download className="h-4 w-4" />Save to Device
          </a>
        </div>
      </div>
      <ServicePage service={service} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center text-gray-400 animate-pulse">
        Loading...
      </div>
    }>
      <Content />
    </Suspense>
  );
}
