import Link from "next/link";
import {
  Car,
  Compass,
  Plane,
  Truck,
  Wrench,
  Package,
  Ship,
  HardHat,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Service } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  Car,
  Compass,
  Plane,
  Truck,
  Wrench,
  Package,
  Ship,
  HardHat,
};

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = iconMap[service.icon] || Package;

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <CardHeader>
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-lg">{service.name}</CardTitle>
        <CardDescription className="line-clamp-2">{service.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="ghost" className="group/btn gap-2 p-0 text-primary hover:bg-transparent" asChild>
          <Link href={service.href}>
            Book Now
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
