import Link from "next/link";
import {
  Car,
  Compass,
  Plane,
  Truck,
  Wrench,
  Package,
  Ship,
  Tractor,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Service } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  Car,
  Compass,
  Plane,
  Truck,
  Wrench,
  Package,
  Ship,
  Tractor,
};

interface ServiceCardProps {
  service: Service;
}

const colorClasses: Record<string, { bg: string; text: string; hoverBg: string; border: string; shadow: string; gradient: string }> = {
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    hoverBg: "group-hover:bg-emerald-500",
    border: "hover:border-emerald-500/50",
    shadow: "hover:shadow-emerald-500/10",
    gradient: "from-emerald-500/10",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    hoverBg: "group-hover:bg-amber-500",
    border: "hover:border-amber-500/50",
    shadow: "hover:shadow-amber-500/10",
    gradient: "from-amber-500/10",
  },
  sky: {
    bg: "bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    hoverBg: "group-hover:bg-sky-500",
    border: "hover:border-sky-500/50",
    shadow: "hover:shadow-sky-500/10",
    gradient: "from-sky-500/10",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    hoverBg: "group-hover:bg-violet-500",
    border: "hover:border-violet-500/50",
    shadow: "hover:shadow-violet-500/10",
    gradient: "from-violet-500/10",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    hoverBg: "group-hover:bg-rose-500",
    border: "hover:border-rose-500/50",
    shadow: "hover:shadow-rose-500/10",
    gradient: "from-rose-500/10",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    hoverBg: "group-hover:bg-orange-500",
    border: "hover:border-orange-500/50",
    shadow: "hover:shadow-orange-500/10",
    gradient: "from-orange-500/10",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-600 dark:text-cyan-400",
    hoverBg: "group-hover:bg-cyan-500",
    border: "hover:border-cyan-500/50",
    shadow: "hover:shadow-cyan-500/10",
    gradient: "from-cyan-500/10",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-600 dark:text-yellow-400",
    hoverBg: "group-hover:bg-yellow-500",
    border: "hover:border-yellow-500/50",
    shadow: "hover:shadow-yellow-500/10",
    gradient: "from-yellow-500/10",
  },
};

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = iconMap[service.icon] || Package;
  const colors = colorClasses[service.color] || colorClasses.emerald;

  return (
    <Link href={service.href} className="block">
      <Card className={`group relative h-full cursor-pointer overflow-hidden transition-all duration-300 ${colors.border} hover:shadow-lg ${colors.shadow}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
        <CardHeader>
          <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-lg ${colors.bg} ${colors.text} transition-colors ${colors.hoverBg} group-hover:text-white`}>
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg">{service.name}</CardTitle>
          <CardDescription className="line-clamp-2">{service.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <span className={`inline-flex items-center gap-2 ${colors.text}`}>
            Book Now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
