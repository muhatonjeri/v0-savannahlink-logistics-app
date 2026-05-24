"use client";
import ServicePage from "@/components/services/service-page";
import { SERVICES } from "@/lib/service-data";

const service = SERVICES.find(s => s.id === "construction-equipment")!;

export default function Page() {
  return <ServicePage service={service} />;
}
