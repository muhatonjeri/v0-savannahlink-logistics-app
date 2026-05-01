import type { Service } from "@/types";

export const services: Service[] = [
  {
    id: "car-rental",
    name: "Car Rental",
    description: "Self-drive and chauffeured vehicle rentals for all your transportation needs. Wide range of vehicles from economy to luxury.",
    icon: "Car",
    href: "/services/car-rental",
    color: "emerald",
  },
  {
    id: "safari-tours",
    name: "Safari Tours",
    description: "Experience the magic of Kenya with our expertly guided safari tours. Explore Maasai Mara, Amboseli, and more.",
    icon: "Compass",
    href: "/services/safari-tours",
    color: "amber",
  },
  {
    id: "hotel-airport-transfers",
    name: "Hotel & Airport Transfers",
    description: "Reliable pickup and drop-off services between airports, hotels, and any location in Nairobi and beyond.",
    icon: "Plane",
    href: "/services/hotel-airport-transfers",
    color: "sky",
  },
  {
    id: "movers",
    name: "Movers",
    description: "Professional moving services for residential and commercial relocations. Packing, loading, and safe delivery.",
    icon: "Truck",
    href: "/services/movers",
    color: "violet",
  },
  {
    id: "road-recovery",
    name: "Road Recovery",
    description: "24/7 emergency road recovery and towing services. We get you back on the road quickly and safely.",
    icon: "Wrench",
    href: "/services/road-recovery",
    color: "rose",
  },
  {
    id: "cargo-handling",
    name: "Cargo Handling",
    description: "Efficient cargo handling and logistics solutions. Port clearance, warehousing, and distribution services.",
    icon: "Package",
    href: "/services/cargo-handling",
    color: "orange",
  },
  {
    id: "shipment-imports",
    name: "Shipment (Imports)",
    description: "Complete import facilitation services. Customs clearance, documentation, and door-to-door delivery.",
    icon: "Ship",
    href: "/services/shipment-imports",
    color: "cyan",
  },
  {
    id: "construction-equipment",
    name: "Construction Equipment",
    description: "Heavy machinery and construction equipment rentals. Excavators, cranes, bulldozers, and more.",
    icon: "Tractor",
    href: "/services/construction-equipment",
    color: "yellow",
  },
];

export function getServiceById(id: string): Service | undefined {
  return services.find((service) => service.id === id);
}

export function getServiceByHref(href: string): Service | undefined {
  return services.find((service) => service.href === href);
}
