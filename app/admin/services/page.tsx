"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Car,
  Compass,
  Plane,
  Truck,
  Bus,
  Wrench,
  Package,
  Ship,
  HardHat,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Settings,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ToggleLeft,
  ToggleRight,
  Info,
  Loader2,
  Copy,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Service icon mapping
const serviceIcons: Record<string, LucideIcon> = {
  "car-rental": Car,
  "safari-tours": Compass,
  "hotel-airport-transfers": Plane,
  "movers": Truck,
  "corporate-rental": Bus,
  "road-recovery": Wrench,
  "cargo-handling": Package,
  "shipment-imports": Ship,
  "construction-equipment": HardHat,
};

const serviceColors: Record<string, { bg: string; text: string; border: string }> = {
  "car-rental": { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-300 dark:text-emerald-400", border: "border-emerald-300 dark:border-emerald-700" },
  "safari-tours": { bg: "bg-amber-100 dark:bg-amber-950", text: "text-amber-300 dark:text-amber-400", border: "border-amber-300 dark:border-amber-700" },
  "hotel-airport-transfers": { bg: "bg-sky-100 dark:bg-sky-950", text: "text-sky-300 dark:text-sky-400", border: "border-sky-300 dark:border-sky-700" },
  "movers": { bg: "bg-violet-100 dark:bg-violet-950", text: "text-violet-300 dark:text-violet-400", border: "border-violet-300 dark:border-violet-700" },
  "corporate-rental": { bg: "bg-indigo-100 dark:bg-indigo-950", text: "text-indigo-300 dark:text-indigo-400", border: "border-indigo-300 dark:border-indigo-700" },
  "road-recovery": { bg: "bg-rose-100 dark:bg-rose-950", text: "text-rose-300 dark:text-rose-400", border: "border-rose-300 dark:border-rose-700" },
  "cargo-handling": { bg: "bg-orange-100 dark:bg-orange-950", text: "text-orange-300 dark:text-orange-400", border: "border-orange-300 dark:border-orange-700" },
  "shipment-imports": { bg: "bg-cyan-100 dark:bg-cyan-950", text: "text-cyan-300 dark:text-cyan-400", border: "border-cyan-300 dark:border-cyan-700" },
  "construction-equipment": { bg: "bg-yellow-100 dark:bg-yellow-950", text: "text-yellow-300 dark:text-yellow-400", border: "border-yellow-300 dark:border-yellow-700" },
};

// Types
interface ServiceItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  unit: string;
  isActive: boolean;
  category?: string;
}

interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  vatRate: number;
  items: ServiceItem[];
  settings: Record<string, unknown>;
}

// Initial service configurations
const initialServicesConfig: ServiceConfig[] = [
  {
    id: "car-rental",
    name: "Car Rental",
    description: "Self-drive and chauffeured vehicle rentals",
    isActive: true,
    vatRate: 16,
    items: [
      { id: "sedan-economy", name: "Economy Sedan", description: "Toyota Corolla, Mazda Demio", basePrice: 4500, unit: "per day", isActive: true, category: "Sedan" },
      { id: "sedan-standard", name: "Standard Sedan", description: "Toyota Premio, Nissan Sylphy", basePrice: 6000, unit: "per day", isActive: true, category: "Sedan" },
      { id: "sedan-luxury", name: "Luxury Sedan", description: "Mercedes C-Class, BMW 3 Series", basePrice: 15000, unit: "per day", isActive: true, category: "Sedan" },
      { id: "suv-compact", name: "Compact SUV", description: "Toyota RAV4, Mazda CX-5", basePrice: 8000, unit: "per day", isActive: true, category: "SUV" },
      { id: "suv-midsize", name: "Midsize SUV", description: "Toyota Fortuner, Mitsubishi Pajero Sport", basePrice: 12000, unit: "per day", isActive: true, category: "SUV" },
      { id: "suv-fullsize", name: "Full-size SUV", description: "Toyota Land Cruiser V8, Range Rover", basePrice: 25000, unit: "per day", isActive: true, category: "SUV" },
      { id: "driver-local", name: "Driver (Local)", description: "Within Nairobi", basePrice: 2000, unit: "per day", isActive: true, category: "Add-ons" },
      { id: "driver-upcountry", name: "Driver (Upcountry)", description: "Outside Nairobi", basePrice: 3500, unit: "per day", isActive: true, category: "Add-ons" },
      { id: "gps-tracker", name: "GPS Tracker", description: "Real-time vehicle tracking", basePrice: 500, unit: "per day", isActive: true, category: "Add-ons" },
      { id: "baby-seat", name: "Baby Seat", description: "Child safety seat", basePrice: 300, unit: "per day", isActive: true, category: "Add-ons" },
    ],
    settings: {
      minRentalDays: 1,
      maxRentalDays: 30,
      depositPercentage: 30,
      lateFeePerHour: 500,
      fuelPolicy: "full-to-full",
      mileageLimit: 200,
      excessMileageRate: 15,
    },
  },
  {
    id: "safari-tours",
    name: "Safari Tours",
    description: "Guided safari tours across Kenya",
    isActive: true,
    vatRate: 16,
    items: [
      { id: "maasai-mara-3d", name: "Maasai Mara 3 Days", description: "3 days, 2 nights game drive", basePrice: 45000, unit: "per person", isActive: true, category: "Maasai Mara" },
      { id: "maasai-mara-4d", name: "Maasai Mara 4 Days", description: "4 days, 3 nights game drive", basePrice: 60000, unit: "per person", isActive: true, category: "Maasai Mara" },
      { id: "amboseli-2d", name: "Amboseli 2 Days", description: "2 days, 1 night safari", basePrice: 28000, unit: "per person", isActive: true, category: "Amboseli" },
      { id: "amboseli-3d", name: "Amboseli 3 Days", description: "3 days, 2 nights safari", basePrice: 40000, unit: "per person", isActive: true, category: "Amboseli" },
      { id: "lake-nakuru-1d", name: "Lake Nakuru Day Trip", description: "Full day excursion", basePrice: 12000, unit: "per person", isActive: true, category: "Day Trips" },
      { id: "nairobi-park-half", name: "Nairobi Park Half Day", description: "Morning or afternoon game drive", basePrice: 6000, unit: "per person", isActive: true, category: "Day Trips" },
      { id: "giraffe-center", name: "Giraffe Center Visit", description: "Including transport", basePrice: 4500, unit: "per person", isActive: true, category: "Day Trips" },
      { id: "wildebeest-migration", name: "Wildebeest Migration Special", description: "5 days migration safari", basePrice: 120000, unit: "per person", isActive: true, category: "Special" },
    ],
    settings: {
      minGroupSize: 2,
      maxGroupSize: 12,
      childDiscount: 30,
      groupDiscountThreshold: 6,
      groupDiscountPercentage: 10,
      includesParkFees: true,
      includesAccommodation: true,
      includesMeals: true,
    },
  },
  {
    id: "hotel-airport-transfers",
    name: "Hotel & Airport Transfers",
    description: "Reliable pickup and drop-off services",
    isActive: true,
    vatRate: 16,
    items: [
      { id: "jkia-cbd-sedan", name: "JKIA to CBD (Sedan)", description: "Nairobi CBD", basePrice: 2500, unit: "one way", isActive: true, category: "JKIA Airport" },
      { id: "jkia-cbd-suv", name: "JKIA to CBD (SUV)", description: "Nairobi CBD", basePrice: 3500, unit: "one way", isActive: true, category: "JKIA Airport" },
      { id: "jkia-westlands-sedan", name: "JKIA to Westlands (Sedan)", description: "Westlands area", basePrice: 3000, unit: "one way", isActive: true, category: "JKIA Airport" },
      { id: "jkia-westlands-suv", name: "JKIA to Westlands (SUV)", description: "Westlands area", basePrice: 4000, unit: "one way", isActive: true, category: "JKIA Airport" },
      { id: "jkia-karen-sedan", name: "JKIA to Karen (Sedan)", description: "Karen/Langata", basePrice: 3500, unit: "one way", isActive: true, category: "JKIA Airport" },
      { id: "jkia-karen-suv", name: "JKIA to Karen (SUV)", description: "Karen/Langata", basePrice: 4500, unit: "one way", isActive: true, category: "JKIA Airport" },
      { id: "wilson-cbd-sedan", name: "Wilson to CBD (Sedan)", description: "Nairobi CBD", basePrice: 1500, unit: "one way", isActive: true, category: "Wilson Airport" },
      { id: "wilson-cbd-suv", name: "Wilson to CBD (SUV)", description: "Nairobi CBD", basePrice: 2500, unit: "one way", isActive: true, category: "Wilson Airport" },
      { id: "hourly-sedan", name: "Hourly Rate (Sedan)", description: "Minimum 3 hours", basePrice: 1500, unit: "per hour", isActive: true, category: "Hourly" },
      { id: "hourly-suv", name: "Hourly Rate (SUV)", description: "Minimum 3 hours", basePrice: 2500, unit: "per hour", isActive: true, category: "Hourly" },
    ],
    settings: {
      waitingTimePerHour: 500,
      flightTrackingIncluded: true,
      freeWaitingMinutes: 45,
      nightSurchargeStart: "22:00",
      nightSurchargeEnd: "06:00",
      nightSurchargePercentage: 25,
    },
  },
  {
    id: "movers",
    name: "Movers",
    description: "Professional moving services",
    isActive: true,
    vatRate: 16,
    items: [
      { id: "small-pickup", name: "Small Pickup", description: "Ideal for bedsitters & single rooms", basePrice: 5000, unit: "per trip", isActive: true, category: "Vehicles" },
      { id: "large-pickup", name: "Large Pickup", description: "Perfect for 1-bedroom apartments", basePrice: 8000, unit: "per trip", isActive: true, category: "Vehicles" },
      { id: "1-ton-truck", name: "1 Ton Truck", description: "Suitable for 2-bedroom houses", basePrice: 12000, unit: "per trip", isActive: true, category: "Vehicles" },
      { id: "3-ton-truck", name: "3 Ton Truck", description: "Great for 3-bedroom houses", basePrice: 18000, unit: "per trip", isActive: true, category: "Vehicles" },
      { id: "5-ton-truck", name: "5 Ton Truck", description: "For larger homes & offices", basePrice: 25000, unit: "per trip", isActive: true, category: "Vehicles" },
      { id: "7-ton-truck", name: "7 Ton Truck", description: "Commercial & industrial moves", basePrice: 35000, unit: "per trip", isActive: true, category: "Vehicles" },
      { id: "10-ton-truck", name: "10 Ton Truck", description: "Heavy commercial relocations", basePrice: 50000, unit: "per trip", isActive: true, category: "Vehicles" },
      { id: "packing-service", name: "Packing Service", description: "Professional packing included", basePrice: 5000, unit: "flat fee", isActive: true, category: "Add-ons" },
      { id: "floor-surcharge", name: "Floor Surcharge (Stairs)", description: "Per floor without elevator", basePrice: 1000, unit: "per floor", isActive: true, category: "Add-ons" },
      { id: "office-move-multiplier", name: "Office Move Multiplier", description: "30% additional for office moves", basePrice: 30, unit: "percent", isActive: true, category: "Multipliers" },
      { id: "commercial-multiplier", name: "Commercial Multiplier", description: "50% additional for commercial", basePrice: 50, unit: "percent", isActive: true, category: "Multipliers" },
    ],
    settings: {
      minBookingHours: 24,
      distanceIncluded: 20,
      extraKmRate: 50,
      insuranceIncluded: true,
      maxFloorWithoutElevator: 5,
    },
  },
  {
    id: "corporate-rental",
    name: "Corporate Rental",
    description: "Luxury vans and buses for corporate events",
    isActive: true,
    vatRate: 16,
    items: [
      { id: "van-7-seater", name: "7 Seater Van", description: "Toyota Noah/Voxy", basePrice: 8000, unit: "per day", isActive: true, category: "Vans" },
      { id: "van-10-seater", name: "10 Seater Van", description: "Toyota Hiace", basePrice: 10000, unit: "per day", isActive: true, category: "Vans" },
      { id: "van-14-seater", name: "14 Seater Van", description: "Toyota Hiace Long", basePrice: 12000, unit: "per day", isActive: true, category: "Vans" },
      { id: "bus-22-seater", name: "22 Seater Bus", description: "Coaster", basePrice: 18000, unit: "per day", isActive: true, category: "Buses" },
      { id: "bus-33-seater", name: "33 Seater Bus", description: "Rosa", basePrice: 25000, unit: "per day", isActive: true, category: "Buses" },
      { id: "bus-45-seater", name: "45 Seater Bus", description: "Full size coach", basePrice: 35000, unit: "per day", isActive: true, category: "Buses" },
      { id: "bus-53-seater", name: "53 Seater Bus", description: "Luxury coach", basePrice: 45000, unit: "per day", isActive: true, category: "Buses" },
      { id: "bus-luxury-vip", name: "VIP Luxury Bus", description: "Executive coach", basePrice: 65000, unit: "per day", isActive: true, category: "Buses" },
      { id: "driver-included", name: "Driver Included", description: "Professional driver", basePrice: 0, unit: "included", isActive: true, category: "Add-ons" },
      { id: "fuel-excluded", name: "Fuel (Client provides)", description: "Fuel not included", basePrice: 0, unit: "note", isActive: true, category: "Add-ons" },
    ],
    settings: {
      minRentalDays: 1,
      weeklyDiscount: 10,
      monthlyDiscount: 20,
      fuelPolicy: "client-provides",
      driverIncluded: true,
    },
  },
  {
    id: "road-recovery",
    name: "Road Recovery",
    description: "24/7 emergency road recovery and towing",
    isActive: true,
    vatRate: 16,
    items: [
      { id: "flatbed-small", name: "Flatbed (Small Vehicles)", description: "Sedans, hatchbacks", basePrice: 8000, unit: "within 20km", isActive: true, category: "Flatbed" },
      { id: "flatbed-suv", name: "Flatbed (SUV/Pickup)", description: "SUVs, pickups", basePrice: 12000, unit: "within 20km", isActive: true, category: "Flatbed" },
      { id: "flatbed-heavy", name: "Flatbed (Heavy)", description: "Trucks, buses", basePrice: 25000, unit: "within 20km", isActive: true, category: "Flatbed" },
      { id: "tow-truck", name: "Standard Tow Truck", description: "Wheel lift towing", basePrice: 6000, unit: "within 20km", isActive: true, category: "Towing" },
      { id: "heavy-tow", name: "Heavy Duty Tow", description: "Large vehicles", basePrice: 18000, unit: "within 20km", isActive: true, category: "Towing" },
      { id: "per-km-extra", name: "Extra Distance Rate", description: "Beyond 20km", basePrice: 150, unit: "per km", isActive: true, category: "Distance" },
      { id: "jump-start", name: "Jump Start Service", description: "Battery boost", basePrice: 2500, unit: "flat fee", isActive: true, category: "Assistance" },
      { id: "tire-change", name: "Tire Change", description: "Flat tire assistance", basePrice: 2000, unit: "flat fee", isActive: true, category: "Assistance" },
      { id: "fuel-delivery", name: "Fuel Delivery", description: "Emergency fuel", basePrice: 2000, unit: "plus fuel cost", isActive: true, category: "Assistance" },
      { id: "lockout-service", name: "Lockout Service", description: "Key locked in car", basePrice: 3000, unit: "flat fee", isActive: true, category: "Assistance" },
    ],
    settings: {
      responseTimeMinutes: 45,
      available24Hours: true,
      nightSurchargePercentage: 30,
      holidaySurchargePercentage: 50,
      baseDistanceKm: 20,
    },
  },
  {
    id: "cargo-handling",
    name: "Cargo Handling",
    description: "Efficient cargo handling and logistics",
    isActive: true,
    vatRate: 16,
    items: [
      { id: "container-20ft", name: "20ft Container Handling", description: "Standard 20ft container", basePrice: 35000, unit: "per container", isActive: true, category: "Containers" },
      { id: "container-40ft", name: "40ft Container Handling", description: "Standard 40ft container", basePrice: 55000, unit: "per container", isActive: true, category: "Containers" },
      { id: "container-40ft-hc", name: "40ft High Cube Handling", description: "40ft high cube container", basePrice: 65000, unit: "per container", isActive: true, category: "Containers" },
      { id: "loose-cargo-ton", name: "Loose Cargo", description: "Handling per ton", basePrice: 3000, unit: "per ton", isActive: true, category: "Loose Cargo" },
      { id: "palletized", name: "Palletized Cargo", description: "Per pallet", basePrice: 1500, unit: "per pallet", isActive: true, category: "Loose Cargo" },
      { id: "warehousing-daily", name: "Warehousing (Daily)", description: "Storage per CBM/day", basePrice: 50, unit: "per CBM/day", isActive: true, category: "Storage" },
      { id: "warehousing-monthly", name: "Warehousing (Monthly)", description: "Storage per CBM/month", basePrice: 1200, unit: "per CBM/month", isActive: true, category: "Storage" },
      { id: "port-clearance", name: "Port Clearance", description: "Documentation handling", basePrice: 15000, unit: "flat fee", isActive: true, category: "Services" },
      { id: "customs-agency", name: "Customs Agency", description: "Customs clearance", basePrice: 25000, unit: "flat fee", isActive: true, category: "Services" },
    ],
    settings: {
      demurrageRatePerDay: 5000,
      freeStorageDays: 3,
      hazmatSurcharge: 50,
      oversizedSurcharge: 30,
    },
  },
  {
    id: "shipment-imports",
    name: "Shipment (Imports)",
    description: "Complete import facilitation services",
    isActive: true,
    vatRate: 16,
    items: [
      { id: "lcl-cbm", name: "LCL Shipment", description: "Less than container load", basePrice: 8000, unit: "per CBM", isActive: true, category: "Sea Freight" },
      { id: "fcl-20ft", name: "FCL 20ft Import", description: "Full container 20ft", basePrice: 180000, unit: "per container", isActive: true, category: "Sea Freight" },
      { id: "fcl-40ft", name: "FCL 40ft Import", description: "Full container 40ft", basePrice: 280000, unit: "per container", isActive: true, category: "Sea Freight" },
      { id: "air-freight-kg", name: "Air Freight", description: "Per kilogram", basePrice: 1200, unit: "per kg", isActive: true, category: "Air Freight" },
      { id: "air-freight-min", name: "Air Freight Minimum", description: "Minimum charge", basePrice: 35000, unit: "minimum", isActive: true, category: "Air Freight" },
      { id: "customs-clearance", name: "Customs Clearance", description: "Full service", basePrice: 45000, unit: "flat fee", isActive: true, category: "Services" },
      { id: "documentation", name: "Documentation", description: "All paperwork", basePrice: 15000, unit: "flat fee", isActive: true, category: "Services" },
      { id: "insurance", name: "Cargo Insurance", description: "Percentage of value", basePrice: 0.5, unit: "percent of value", isActive: true, category: "Insurance" },
      { id: "door-delivery", name: "Door Delivery", description: "Last mile delivery", basePrice: 25000, unit: "within Nairobi", isActive: true, category: "Delivery" },
    ],
    settings: {
      transitTimeSeaDays: 35,
      transitTimeAirDays: 5,
      minimumInsuranceValue: 100000,
      dutiesAndTaxesSeparate: true,
    },
  },
  {
    id: "construction-equipment",
    name: "Construction Equipment",
    description: "Heavy machinery and equipment rentals",
    isActive: true,
    vatRate: 16,
    items: [
      { id: "excavator-small", name: "Mini Excavator (3-5T)", description: "Small excavation works", basePrice: 18000, unit: "per day", isActive: true, category: "Excavators" },
      { id: "excavator-medium", name: "Medium Excavator (10-15T)", description: "Standard excavation", basePrice: 35000, unit: "per day", isActive: true, category: "Excavators" },
      { id: "excavator-large", name: "Large Excavator (20-30T)", description: "Heavy excavation", basePrice: 55000, unit: "per day", isActive: true, category: "Excavators" },
      { id: "bulldozer", name: "Bulldozer D6", description: "Land clearing", basePrice: 45000, unit: "per day", isActive: true, category: "Earth Moving" },
      { id: "grader", name: "Motor Grader", description: "Road grading", basePrice: 40000, unit: "per day", isActive: true, category: "Earth Moving" },
      { id: "roller-vibro", name: "Vibratory Roller", description: "Compaction", basePrice: 25000, unit: "per day", isActive: true, category: "Compaction" },
      { id: "roller-pneumatic", name: "Pneumatic Roller", description: "Surface finishing", basePrice: 20000, unit: "per day", isActive: true, category: "Compaction" },
      { id: "crane-mobile", name: "Mobile Crane (25T)", description: "Lifting operations", basePrice: 65000, unit: "per day", isActive: true, category: "Cranes" },
      { id: "crane-tower", name: "Tower Crane", description: "High-rise construction", basePrice: 150000, unit: "per month", isActive: true, category: "Cranes" },
      { id: "concrete-mixer", name: "Concrete Mixer Truck", description: "Ready-mix delivery", basePrice: 15000, unit: "per trip", isActive: true, category: "Concrete" },
      { id: "tipper-truck", name: "Tipper Truck (20T)", description: "Material hauling", basePrice: 18000, unit: "per day", isActive: true, category: "Trucks" },
      { id: "operator", name: "Equipment Operator", description: "Certified operator", basePrice: 3500, unit: "per day", isActive: true, category: "Personnel" },
    ],
    settings: {
      minRentalDays: 1,
      weeklyDiscount: 15,
      monthlyDiscount: 25,
      operatorRequired: true,
      fuelByClient: true,
      mobilizationFee: 15000,
    },
  },
];

// Schema for editing items
const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  basePrice: z.number().min(0, "Price must be 0 or greater"),
  unit: z.string().min(1, "Unit is required"),
  category: z.string().optional(),
  isActive: z.boolean(),
});

type ItemFormData = z.infer<typeof itemSchema>;

// Booking & payment types
interface ServicePayment {
  id: string;
  date: string;
  amount: number;
  method: "mpesa" | "bank" | "cash" | "cheque";
  reference: string;
  note?: string;
}

interface ServiceBooking {
  id: string;
  serviceId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  description: string;
  totalAmount: number;
  amountPaid: number;
  payments: ServicePayment[];
  status: "pending" | "partial" | "paid" | "cancelled";
  bookingDate: string;
  notes?: string;
}

export default function ServicesManagementPage() {
  const [services, setServices] = useState<ServiceConfig[]>(initialServicesConfig);
  const [selectedService, setSelectedService] = useState<ServiceConfig | null>(null);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("rates");

  // Booking state
  const [bookings, setBookings] = useState<ServiceBooking[]>([
    {
      id: "bk-001", serviceId: "car-rental", clientName: "John Kamau", clientPhone: "+254 722 111 222",
      clientEmail: "john@example.com", description: "Toyota Fortuner – 5 days", totalAmount: 60000,
      amountPaid: 18000, payments: [
        { id: "p1", date: "2024-03-10", amount: 18000, method: "mpesa", reference: "QGH7Y3K1P2", note: "30% deposit" }
      ], status: "partial", bookingDate: "2024-03-10",
    },
    {
      id: "bk-002", serviceId: "safari-tours", clientName: "Sarah Wanjiku", clientPhone: "+254 733 999 888",
      description: "Maasai Mara 3 Days – 2 pax", totalAmount: 90000, amountPaid: 90000, payments: [
        { id: "p1", date: "2024-03-05", amount: 45000, method: "bank", reference: "EQB-00456", note: "Deposit" },
        { id: "p2", date: "2024-03-12", amount: 45000, method: "mpesa", reference: "RKL9P2W1X3", note: "Balance" },
      ], status: "paid", bookingDate: "2024-03-05",
    },
  ]);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [bookingForm, setBookingForm] = useState({ clientName: "", clientPhone: "", clientEmail: "", description: "", totalAmount: "", notes: "" });
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "mpesa" as ServicePayment["method"], reference: "", note: "" });

  const itemForm = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      unit: "",
      category: "",
      isActive: true,
    },
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("Moventra Safaris & Logistics Ltd_services_config");
    if (saved) {
      try {
        setServices(JSON.parse(saved));
      } catch {
        // Use initial config
      }
    }
  }, []);

  // Save to localStorage
  const saveServices = (updatedServices: ServiceConfig[]) => {
    setServices(updatedServices);
    localStorage.setItem("Moventra Safaris & Logistics Ltd_services_config", JSON.stringify(updatedServices));
    toast.success("Services configuration saved");
  };

  // Toggle service active status
  const toggleServiceActive = (serviceId: string) => {
    const updated = services.map(s =>
      s.id === serviceId ? { ...s, isActive: !s.isActive } : s
    );
    saveServices(updated);
  };

  // Update VAT rate
  const updateVatRate = (serviceId: string, vatRate: number) => {
    const updated = services.map(s =>
      s.id === serviceId ? { ...s, vatRate } : s
    );
    saveServices(updated);
  };

  // Toggle item active status
  const toggleItemActive = (serviceId: string, itemId: string) => {
    const updated = services.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          items: s.items.map(item =>
            item.id === itemId ? { ...item, isActive: !item.isActive } : item
          ),
        };
      }
      return s;
    });
    saveServices(updated);
  };

  // Open edit dialog
  const openEditDialog = (item: ServiceItem) => {
    setEditingItem(item);
    setIsAddingItem(false);
    itemForm.reset({
      name: item.name,
      description: item.description,
      basePrice: item.basePrice,
      unit: item.unit,
      category: item.category || "",
      isActive: item.isActive,
    });
    setIsEditDialogOpen(true);
  };

  // Open add dialog
  const openAddDialog = () => {
    setEditingItem(null);
    setIsAddingItem(true);
    itemForm.reset({
      name: "",
      description: "",
      basePrice: 0,
      unit: "per unit",
      category: "",
      isActive: true,
    });
    setIsEditDialogOpen(true);
  };

  // Save item
  const saveItem = (data: ItemFormData) => {
    if (!selectedService) return;

    const updated = services.map(s => {
      if (s.id === selectedService.id) {
        if (isAddingItem) {
          // Add new item
          const newItem: ServiceItem = {
            id: `${selectedService.id}-${Date.now()}`,
            name: data.name,
            description: data.description,
            basePrice: data.basePrice,
            unit: data.unit,
            category: data.category,
            isActive: data.isActive,
          };
          return { ...s, items: [...s.items, newItem] };
        } else if (editingItem) {
          // Update existing item
          return {
            ...s,
            items: s.items.map(item =>
              item.id === editingItem.id
                ? { ...item, ...data }
                : item
            ),
          };
        }
      }
      return s;
    });

    saveServices(updated);
    setIsEditDialogOpen(false);
    toast.success(isAddingItem ? "Item added successfully" : "Item updated successfully");
  };

  // Delete item
  const deleteItem = (serviceId: string, itemId: string) => {
    const updated = services.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          items: s.items.filter(item => item.id !== itemId),
        };
      }
      return s;
    });
    saveServices(updated);
    toast.success("Item deleted");
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter items by search
  const filterItems = (items: ServiceItem[]) => {
    if (!searchTerm) return items;
    return items.filter(
      item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Group items by category
  const groupByCategory = (items: ServiceItem[]) => {
    const groups: Record<string, ServiceItem[]> = {};
    items.forEach(item => {
      const category = item.category || "Uncategorized";
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    });
    return groups;
  };

  // Booking handlers
  const handleCreateBooking = () => {
    if (!selectedService) return;
    const total = parseFloat(bookingForm.totalAmount);
    if (!bookingForm.clientName || !bookingForm.description || !total) {
      toast.error("Please fill in all required fields"); return;
    }
    const booking: ServiceBooking = {
      id: `bk-${Date.now()}`, serviceId: selectedService.id,
      clientName: bookingForm.clientName, clientPhone: bookingForm.clientPhone,
      clientEmail: bookingForm.clientEmail, description: bookingForm.description,
      totalAmount: total, amountPaid: 0, payments: [], status: "pending",
      bookingDate: new Date().toISOString().split("T")[0], notes: bookingForm.notes,
    };
    setBookings([booking, ...bookings]);
    setIsBookingDialogOpen(false);
    setBookingForm({ clientName: "", clientPhone: "", clientEmail: "", description: "", totalAmount: "", notes: "" });
    toast.success("Booking created successfully");
  };

  const handleRecordPayment = () => {
    if (!selectedBooking) return;
    const amount = parseFloat(paymentForm.amount);
    const balance = selectedBooking.totalAmount - selectedBooking.amountPaid;
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }
    if (amount > balance) { toast.error(`Exceeds balance of KES ${balance.toLocaleString()}`); return; }
    if (!paymentForm.reference) { toast.error("Enter a payment reference"); return; }

    const payment: ServicePayment = {
      id: Date.now().toString(), date: new Date().toISOString().split("T")[0],
      amount, method: paymentForm.method, reference: paymentForm.reference, note: paymentForm.note,
    };
    const newPaid = selectedBooking.amountPaid + amount;
    const newStatus: ServiceBooking["status"] = newPaid >= selectedBooking.totalAmount ? "paid" : "partial";
    const updated = { ...selectedBooking, amountPaid: newPaid, payments: [...selectedBooking.payments, payment], status: newStatus };
    setBookings(bookings.map(b => b.id === selectedBooking.id ? updated : b));
    setSelectedBooking(updated);
    setIsPaymentDialogOpen(false);
    setPaymentForm({ amount: "", method: "mpesa", reference: "", note: "" });
    toast.success(`Payment of KES ${amount.toLocaleString()} recorded`);
  };

  const serviceBookings = selectedService ? bookings.filter(b => b.serviceId === selectedService.id) : [];

  const bookingStatusConfig = {
    pending: { label: "Pending", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
    partial: { label: "Partial", color: "bg-amber-900/300/20 text-amber-500 border-amber-500/30" },
    paid: { label: "Paid", color: "bg-green-900/300/20 text-green-500 border-green-500/30" },
    cancelled: { label: "Cancelled", color: "bg-red-900/300/20 text-red-400 border-red-500/30" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Services Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure service rates, items, and settings for all Moventra Safaris & Logistics Ltd services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-900/30 text-emerald-300 dark:bg-emerald-950 dark:text-emerald-400">
            {services.filter(s => s.isActive).length} Active Services
          </Badge>
          <Badge variant="outline" className="bg-blue-900/30 text-blue-300 dark:bg-blue-950 dark:text-blue-400">
            {services.reduce((acc, s) => acc + s.items.length, 0)} Total Items
          </Badge>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(service => {
          const Icon = serviceIcons[service.id] || Package;
          const colors = serviceColors[service.id] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" };

          return (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedService?.id === service.id
                  ? `ring-2 ring-emerald-500 ${colors.bg}`
                  : "hover:border-emerald-300 dark:hover:border-emerald-700"
              } ${!service.isActive ? "opacity-60" : ""}`}
              onClick={() => setSelectedService(service)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={service.isActive ? "bg-emerald-900/30 text-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300" : "bg-gray-700 text-gray-300"}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={e => {
                        e.stopPropagation();
                        toggleServiceActive(service.id);
                      }}
                    >
                      {service.isActive ? (
                        <ToggleRight className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">{service.name}</CardTitle>
                <CardDescription className="line-clamp-1">{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#e67e22]">
                    {service.items.length} items
                  </span>
                  <span className="text-[#e67e22]">
                    VAT: {service.vatRate}%
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {service.items.filter(i => i.isActive).length} active
                  </Badge>
                  <Badge variant="outline" className="text-xs text-orange-600">
                    {service.items.filter(i => !i.isActive).length} inactive
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Service Details */}
      {selectedService && (
        <Card className="border-2 border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = serviceIcons[selectedService.id] || Package;
                  const colors = serviceColors[selectedService.id];
                  return (
                    <div className={`p-3 rounded-lg ${colors.bg}`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                  );
                })()}
                <div>
                  <CardTitle className="text-xl">{selectedService.name}</CardTitle>
                  <CardDescription>{selectedService.description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#e67e22]">VAT Rate:</span>
                  <Select
                    value={selectedService.vatRate.toString()}
                    onValueChange={(v) => updateVatRate(selectedService.id, parseInt(v))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="8">8%</SelectItem>
                      <SelectItem value="16">16%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {activeTab === "rates" && (
                  <Button onClick={openAddDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                )}
                {activeTab === "bookings" && (
                  <Button onClick={() => setIsBookingDialogOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4" />
                    New Booking
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="rates">Rates & Items</TabsTrigger>
                <TabsTrigger value="bookings">
                  Bookings
                  {serviceBookings.length > 0 && (
                    <span className="ml-2 bg-emerald-100 text-emerald-300 dark:bg-emerald-900 dark:text-emerald-300 text-xs px-1.5 py-0.5 rounded-full">
                      {serviceBookings.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* ── RATES TAB ── */}
              <TabsContent value="rates">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Accordion type="multiple" defaultValue={Object.keys(groupByCategory(selectedService.items))} className="space-y-2">
                  {Object.entries(groupByCategory(filterItems(selectedService.items))).map(([category, items]) => (
                    <AccordionItem key={category} value={category} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-white">{category}</span>
                          <Badge variant="secondary">{items.length} items</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">Status</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead className="hidden md:table-cell">Description</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead className="text-right w-[120px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map(item => (
                              <TableRow key={item.id} className={!item.isActive ? "opacity-50" : ""}>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => toggleItemActive(selectedService.id, item.id)}
                                  >
                                    {item.isActive ? (
                                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    ) : (
                                      <AlertCircle className="h-5 w-5 text-gray-400" />
                                    )}
                                  </Button>
                                </TableCell>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="hidden md:table-cell text-[#e67e22] max-w-[200px] truncate">
                                  {item.description}
                                </TableCell>
                                <TableCell className="text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                  {item.unit === "percent" || item.unit === "percent of value"
                                    ? `${item.basePrice}%`
                                    : formatCurrency(item.basePrice)}
                                </TableCell>
                                <TableCell className="text-[#e67e22]">{item.unit}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openEditDialog(item)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-300 hover:bg-red-900/30 dark:hover:bg-red-950"
                                      onClick={() => deleteItem(selectedService.id, item.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Service Settings
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(selectedService.settings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="font-medium text-white">
                          {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* ── BOOKINGS TAB ── */}
              <TabsContent value="bookings">
                {serviceBookings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No bookings yet</p>
                    <p className="text-sm mt-1">Click "New Booking" to add one</p>
                  </div>
                ) : (
                  <>
                    {/* Summary row */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="rounded-lg border bg-muted/30 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Total Billed</p>
                        <p className="font-bold text-lg">KES {serviceBookings.reduce((s, b) => s + b.totalAmount, 0).toLocaleString()}</p>
                      </div>
                      <div className="rounded-lg border bg-green-900/300/10 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Collected</p>
                        <p className="font-bold text-lg text-green-600">KES {serviceBookings.reduce((s, b) => s + b.amountPaid, 0).toLocaleString()}</p>
                      </div>
                      <div className="rounded-lg border bg-red-900/300/10 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Outstanding</p>
                        <p className="font-bold text-lg text-red-500">KES {serviceBookings.reduce((s, b) => s + (b.totalAmount - b.amountPaid), 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Paid</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {serviceBookings.map(booking => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <p className="font-medium">{booking.clientName}</p>
                              <p className="text-xs text-muted-foreground">{booking.clientPhone}</p>
                            </TableCell>
                            <TableCell className="max-w-[180px] truncate text-sm">{booking.description}</TableCell>
                            <TableCell className="font-semibold">KES {booking.totalAmount.toLocaleString()}</TableCell>
                            <TableCell className="text-green-600 font-medium">KES {booking.amountPaid.toLocaleString()}</TableCell>
                            <TableCell className={`font-semibold ${(booking.totalAmount - booking.amountPaid) > 0 ? "text-red-500" : "text-green-600"}`}>
                              KES {(booking.totalAmount - booking.amountPaid).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={bookingStatusConfig[booking.status].color}>
                                {bookingStatusConfig[booking.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {(booking.status === "pending" || booking.status === "partial") && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                                  onClick={() => { setSelectedBooking(booking); setIsPaymentDialogOpen(true); }}
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Pay
                                </Button>
                              )}
                              {booking.status === "paid" && (
                                <Badge variant="outline" className="text-green-600 border-green-500/30">Cleared</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Edit/Add Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isAddingItem ? "Add New Item" : "Edit Item"}
            </DialogTitle>
            <DialogDescription>
              {isAddingItem
                ? `Add a new item to ${selectedService?.name}`
                : `Update ${editingItem?.name}`}
            </DialogDescription>
          </DialogHeader>
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit(saveItem)} className="space-y-4">
              <FormField
                control={itemForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Economy Sedan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={itemForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Toyota Corolla, Mazda Demio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={itemForm.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price (KES)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={itemForm.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="per day">per day</SelectItem>
                          <SelectItem value="per hour">per hour</SelectItem>
                          <SelectItem value="per trip">per trip</SelectItem>
                          <SelectItem value="per person">per person</SelectItem>
                          <SelectItem value="per km">per km</SelectItem>
                          <SelectItem value="per kg">per kg</SelectItem>
                          <SelectItem value="per ton">per ton</SelectItem>
                          <SelectItem value="per CBM">per CBM</SelectItem>
                          <SelectItem value="per container">per container</SelectItem>
                          <SelectItem value="per pallet">per pallet</SelectItem>
                          <SelectItem value="one way">one way</SelectItem>
                          <SelectItem value="flat fee">flat fee</SelectItem>
                          <SelectItem value="percent">percent</SelectItem>
                          <SelectItem value="included">included</SelectItem>
                          <SelectItem value="minimum">minimum</SelectItem>
                          <SelectItem value="within 20km">within 20km</SelectItem>
                          <SelectItem value="within Nairobi">within Nairobi</SelectItem>
                          <SelectItem value="per month">per month</SelectItem>
                          <SelectItem value="per floor">per floor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={itemForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sedan, SUV, Add-ons" {...field} />
                    </FormControl>
                    <FormDescription>Group similar items together</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={itemForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Show this item in bookings</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  {isAddingItem ? "Add Item" : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* New Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-500" />
              New Booking — {selectedService?.name}
            </DialogTitle>
            <DialogDescription>Record a new client booking and set the total charge</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client Name *</label>
              <Input placeholder="Full name" value={bookingForm.clientName} onChange={e => setBookingForm({ ...bookingForm, clientName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone *</label>
                <Input placeholder="+254 7XX XXX XXX" value={bookingForm.clientPhone} onChange={e => setBookingForm({ ...bookingForm, clientPhone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input placeholder="email@example.com" value={bookingForm.clientEmail} onChange={e => setBookingForm({ ...bookingForm, clientEmail: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Description *</label>
              <Input placeholder="e.g. Toyota Fortuner – 5 days" value={bookingForm.description} onChange={e => setBookingForm({ ...bookingForm, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Amount (KES) *</label>
              <Input type="number" placeholder="0" value={bookingForm.totalAmount} onChange={e => setBookingForm({ ...bookingForm, totalAmount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Input placeholder="Any additional notes..." value={bookingForm.notes} onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateBooking} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Record Payment
            </DialogTitle>
            <DialogDescription>
              {selectedBooking && (
                <span>{selectedBooking.clientName} — Balance: <strong className="text-red-500">KES {(selectedBooking.totalAmount - selectedBooking.amountPaid).toLocaleString()}</strong></span>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-muted/40 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold">KES {selectedBooking.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Paid:</span>
                  <span className="font-semibold">KES {selectedBooking.amountPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-500 font-bold border-t pt-2">
                  <span>Outstanding:</span>
                  <span>KES {(selectedBooking.totalAmount - selectedBooking.amountPaid).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quick Select</label>
                <div className="flex gap-2 flex-wrap">
                  {[25, 50, 75, 100].map(pct => {
                    const amt = Math.round((selectedBooking.totalAmount - selectedBooking.amountPaid) * pct / 100);
                    return (
                      <Button key={pct} variant="outline" size="sm"
                        className={pct === 100 ? "border-green-500 text-green-600" : ""}
                        onClick={() => setPaymentForm({ ...paymentForm, amount: amt.toString() })}>
                        {pct === 100 ? "Full" : `${pct}%`} — KES {amt.toLocaleString()}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (KES) *</label>
                <Input type="number" placeholder="Enter amount" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
                {paymentForm.amount && parseFloat(paymentForm.amount) > 0 && (
                  <p className="text-xs text-muted-foreground">Remaining after payment: <span className="font-semibold text-amber-500">KES {Math.max(0, (selectedBooking.totalAmount - selectedBooking.amountPaid) - parseFloat(paymentForm.amount)).toLocaleString()}</span></p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method *</label>
                <Select value={paymentForm.method} onValueChange={v => setPaymentForm({ ...paymentForm, method: v as ServicePayment["method"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reference / Transaction ID *</label>
                <Input placeholder={paymentForm.method === "mpesa" ? "e.g. QGH7Y3K2P1" : "e.g. TXN-00123"} value={paymentForm.reference} onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Note (Optional)</label>
                <Input placeholder="e.g. Deposit, Partial, Final balance..." value={paymentForm.note} onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsPaymentDialogOpen(false); setPaymentForm({ amount: "", method: "mpesa", reference: "", note: "" }); }}>Cancel</Button>
            <Button onClick={handleRecordPayment} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
