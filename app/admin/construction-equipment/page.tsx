"use client";
import { Suspense } from "react";
import ServicePage from "@/components/services/service-page";
import { SERVICES } from "@/lib/service-data";

const service = SERVICES.find(s => s.id === "construction-equipment")!;

function Content() {
  return <ServicePage service={service} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center text-gray-400 animate-pulse">Loading...</div>}>
      <Content />
    </Suspense>
  );
}
