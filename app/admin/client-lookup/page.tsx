"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Search,
  ScanSearch,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  XCircle,
  Eye,
  History,
  Car,
  FileText,
  Clock,
  DollarSign,
  Ban,
  Skull,
  AlertOctagon,
  CreditCard,
  Building,
  Fingerprint,
  IdCard,
  Loader2,
  UserCheck,
  UserX,
  ExternalLink,
  Plane,
  Truck,
  Package,
  Ship,
  Wrench,
  Compass,
  Bus,
  HardHat,
  Edit,
  Upload,
  Save,
  UserPlus,
  ArrowRight,
  Banknote,
  Syringe,
  Sword,
  CircleAlert,
  HelpCircle,
  Hammer,
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
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { getClients } from "@/lib/store";
import type { Client as StoreClient } from "@/types";

// Service configuration - hrefs match actual page paths
const serviceConfig: Record<string, { title: string; icon: LucideIcon; href: string; color: string; bgColor: string; hoverColor: string }> = {
  "car-rental": { title: "Car Rental", icon: Car, href: "/admin/car-rental/new", color: "text-indigo-400", bgColor: "bg-indigo-900/40 border-indigo-500", hoverColor: "hover:bg-indigo-900/60" },
  "safari-tours": { title: "Safari Tours", icon: Compass, href: "/admin/safari-tours", color: "text-amber-400", bgColor: "bg-amber-900/40 border-amber-500", hoverColor: "hover:bg-amber-900/60" },
  "transfers": { title: "Airport Transfers", icon: Plane, href: "/admin/transfers", color: "text-sky-400", bgColor: "bg-sky-900/40 border-sky-500", hoverColor: "hover:bg-sky-900/60" },
  "movers": { title: "Movers", icon: Truck, href: "/admin/movers", color: "text-violet-400", bgColor: "bg-violet-900/40 border-violet-500", hoverColor: "hover:bg-violet-900/60" },
  "corporate-rental": { title: "Corporate Rental", icon: Bus, href: "/admin/car-rental/new", color: "text-purple-400", bgColor: "bg-purple-900/40 border-purple-500", hoverColor: "hover:bg-purple-900/60" },
  "road-recovery": { title: "Road Recovery", icon: Wrench, href: "/admin/road-recovery", color: "text-rose-400", bgColor: "bg-rose-900/40 border-rose-500", hoverColor: "hover:bg-rose-900/60" },
  "cargo-handling": { title: "Cargo Handling", icon: Package, href: "/admin/cargo-handling", color: "text-orange-400", bgColor: "bg-orange-900/40 border-orange-500", hoverColor: "hover:bg-orange-900/60" },
  "shipment-imports": { title: "Shipment Imports", icon: Ship, href: "/admin/shipment-imports", color: "text-blue-400", bgColor: "bg-blue-900/40 border-blue-500", hoverColor: "hover:bg-blue-900/60" },
  "construction-equipment": { title: "Construction Equipment", icon: HardHat, href: "/admin/construction-equipment", color: "text-yellow-400", bgColor: "bg-yellow-900/40 border-yellow-500", hoverColor: "hover:bg-yellow-900/60" },
};

// Record type configuration with icons
const recordTypeConfig: Record<string, { label: string; icon: LucideIcon; color: string; bgColor: string }> = {
  theft: { 
    label: "Theft", 
    icon: Skull, 
    color: "text-red-300 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-950/50 border-red-300 dark:border-red-800"
  },
  fraud: { 
    label: "Fraud", 
    icon: Banknote, 
    color: "text-orange-300 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-950/50 border-orange-300 dark:border-orange-800"
  },
  damage: { 
    label: "Vehicle Damage", 
    icon: Hammer, 
    color: "text-yellow-300 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-950/50 border-yellow-300 dark:border-yellow-800"
  },
  "non-payment": { 
    label: "Non-Payment", 
    icon: CreditCard, 
    color: "text-purple-300 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800"
  },
  accident: { 
    label: "Accident", 
    icon: Car, 
    color: "text-blue-300 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800"
  },
  "drug-related": { 
    label: "Drug Related", 
    icon: Syringe, 
    color: "text-emerald-300 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800"
  },
  "violent-dangerous": { 
    label: "Violent / Dangerous", 
    icon: Sword, 
    color: "text-rose-300 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800"
  },
  suspicious: { 
    label: "Suspicious Activity", 
    icon: CircleAlert, 
    color: "text-amber-300 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800"
  },
  other: { 
    label: "Other", 
    icon: HelpCircle, 
    color: "text-gray-700 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700"
  },
};

// Edit form schema
const blacklistEditSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  idNumber: z.string().optional(),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  drivingLicenseNumber: z.string().optional(),
  kraPin: z.string().optional(),
  residence: z.string().optional(),
  recordType: z.enum(["theft", "fraud", "damage", "non-payment", "accident", "drug-related", "violent-dangerous", "suspicious", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  incidentDate: z.string().min(1, "Incident date is required"),
  vehicleInvolved: z.string().optional(),
  amountOwed: z.string().optional(),
  policeReportNumber: z.string().optional(),
});

type BlacklistEditFormValues = z.infer<typeof blacklistEditSchema>;

// New client registration schema
const newClientSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  idNumber: z.string().min(6, "ID/Passport number is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  kraPin: z.string().optional(),
  residence: z.string().optional(),
  placeOfWork: z.string().optional(),
  drivingLicenseNumber: z.string().optional(),
});

type NewClientFormValues = z.infer<typeof newClientSchema>;

// Blacklist entry type (matching blacklist page)
interface BlacklistEntry {
  id: string;
  fullName: string;
  idNumber: string;
  phoneNumber: string;
  email?: string;
  drivingLicenseNumber?: string;
  kraPin?: string;
  residence?: string;
  recordType: "theft" | "fraud" | "damage" | "non-payment" | "accident" | "drug-related" | "violent-dangerous" | "suspicious" | "other";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  incidentDate: string;
  reportedBy: string;
  vehicleInvolved?: string;
  amountOwed?: number;
  policeReportNumber?: string;
  status: "active" | "under-review" | "resolved" | "expired";
  createdAt: string;
  updatedAt: string;
}

// Client type
interface Client {
  id: string;
  fullName: string;
  idNumber: string;
  phone: string;
  email?: string;
  kraPin?: string;
  residence?: string;
  drivingLicenseNumber?: string;
  placeOfWork?: string;
  createdAt: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate?: string;
  status: "active" | "suspended" | "blacklisted";
}

// Transaction history type
interface TransactionHistory {
  id: string;
  date: string;
  service: string;
  serviceIcon: React.ElementType;
  description: string;
  amount: number;
  status: "completed" | "pending" | "cancelled";
  paymentMethod: string;
  reference: string;
}

// Blacklist data (same as blacklist page)
const blacklistData: BlacklistEntry[] = [
  { id: "INC-001", fullName: "Charles Ikiro Kahuthu", idNumber: "14518266", phoneNumber: "0743143539 / 0702301197", recordType: "theft", severity: "critical", description: "Car Theft - Jommu Safaris", incidentDate: "2024-01-15", reportedBy: "Admin", status: "active", createdAt: "2024-01-15", updatedAt: "2024-01-15" },
  { id: "INC-002", fullName: "Christine Wambui Muthoni", idNumber: "37445643", phoneNumber: "", recordType: "theft", severity: "critical", description: "Car Theft - Accomplice", incidentDate: "2024-01-15", reportedBy: "Admin", status: "active", createdAt: "2024-01-15", updatedAt: "2024-01-15" },
  { id: "INC-003", fullName: "Kelvin Sibuor", idNumber: "", phoneNumber: "0717889934", recordType: "fraud", severity: "high", description: "Broker Obtaining - Fraud", incidentDate: "2024-02-01", reportedBy: "Admin", status: "active", createdAt: "2024-02-01", updatedAt: "2024-02-01" },
  { id: "INC-004", fullName: "Ezra Kingori", idNumber: "", phoneNumber: "0729222825 / 0707021111", recordType: "fraud", severity: "high", description: "Broker Obtaining - Fraud", incidentDate: "2024-02-05", reportedBy: "Admin", status: "active", createdAt: "2024-02-05", updatedAt: "2024-02-05" },
  { id: "INC-005", fullName: "Bonface Osieyo", idNumber: "", phoneNumber: "0718330310", residence: "Kitengela/Riverside/Kilimani", recordType: "fraud", severity: "critical", description: "Broker Obtaining - Multiple victims", incidentDate: "2024-02-10", reportedBy: "Admin", status: "active", createdAt: "2024-02-10", updatedAt: "2024-02-10" },
  { id: "INC-006", fullName: "Samuel Omondi Audi", idNumber: "28392618", phoneNumber: "", recordType: "drug-related", severity: "critical", description: "Drug Transport", incidentDate: "2024-02-15", reportedBy: "Admin", status: "active", createdAt: "2024-02-15", updatedAt: "2024-02-15" },
  { id: "INC-007", fullName: "Cyrus Musroka", idNumber: "", phoneNumber: "0722288081 / 0722662244 / 0720500992", recordType: "theft", severity: "critical", description: "Car Theft - Multiple contact numbers", incidentDate: "2024-02-20", reportedBy: "Admin", status: "active", createdAt: "2024-02-20", updatedAt: "2024-02-20" },
  { id: "INC-008", fullName: "Jacklyn Wanjiku", idNumber: "", phoneNumber: "0711521026", recordType: "fraud", severity: "high", description: "Broker Obtaining - Fraud", incidentDate: "2024-02-25", reportedBy: "Admin", status: "active", createdAt: "2024-02-25", updatedAt: "2024-02-25" },
  { id: "INC-009", fullName: "Allidan Munyao", idNumber: "", phoneNumber: "0715253242", recordType: "fraud", severity: "high", description: "Broker Obtaining - Fraud", incidentDate: "2024-03-01", reportedBy: "Admin", status: "active", createdAt: "2024-03-01", updatedAt: "2024-03-01" },
  { id: "INC-010", fullName: "Oscar Tumuti Njoki", idNumber: "", phoneNumber: "0705061000", residence: "Karen/Ngong Rd/Ruaka", recordType: "violent-dangerous", severity: "critical", description: "Dangerous - Violent/Dangerous individual", incidentDate: "2024-03-05", reportedBy: "Admin", status: "active", createdAt: "2024-03-05", updatedAt: "2024-03-05" },
  { id: "INC-011", fullName: "Kelvin Odhiambo Omondi", idNumber: "32214919", phoneNumber: "0706072557", recordType: "drug-related", severity: "critical", description: "Changaa Distribution - Drug related activities", incidentDate: "2024-03-10", reportedBy: "Admin", status: "active", createdAt: "2024-03-10", updatedAt: "2024-03-10" },
  { id: "INC-012", fullName: "Martin Njenga", idNumber: "", phoneNumber: "0715867722", recordType: "theft", severity: "critical", description: "Car Theft", incidentDate: "2024-03-15", reportedBy: "Admin", status: "active", createdAt: "2024-03-15", updatedAt: "2024-03-15" },
  { id: "INC-013", fullName: "Gabriel Muiruri", idNumber: "", phoneNumber: "0706661422", recordType: "theft", severity: "critical", description: "Car Theft", incidentDate: "2024-03-20", reportedBy: "Admin", status: "active", createdAt: "2024-03-20", updatedAt: "2024-03-20" },
  { id: "INC-014", fullName: "Oliver Musyoki Mutisya", idNumber: "", phoneNumber: "0732237545 / 0712541354", recordType: "theft", severity: "critical", description: "Car Theft - Multiple contact numbers", incidentDate: "2024-03-25", reportedBy: "Admin", status: "active", createdAt: "2024-03-25", updatedAt: "2024-03-25" },
  { id: "INC-015", fullName: "Humfrey Karimi Wachira", idNumber: "27303133", phoneNumber: "0722960207", recordType: "theft", severity: "critical", description: "Car Theft", incidentDate: "2024-04-01", reportedBy: "Admin", status: "active", createdAt: "2024-04-01", updatedAt: "2024-04-01" },
  { id: "INC-016", fullName: "Ogeto Car Hire", idNumber: "", phoneNumber: "0733757671", recordType: "fraud", severity: "high", description: "Broker Obtaining - Fraudulent car hire business", incidentDate: "2024-04-05", reportedBy: "Admin", status: "active", createdAt: "2024-04-05", updatedAt: "2024-04-05" },
  { id: "INC-017", fullName: "Jackline Wanjiku Kungu", idNumber: "", phoneNumber: "0711521026", recordType: "fraud", severity: "high", description: "Broker Obtaining - Fraud", incidentDate: "2024-04-10", reportedBy: "Admin", status: "active", createdAt: "2024-04-10", updatedAt: "2024-04-10" },
  { id: "INC-018", fullName: "Allidan Munyao", idNumber: "", phoneNumber: "0715253242", recordType: "fraud", severity: "high", description: "Broker Obtaining - Duplicate entry", incidentDate: "2024-04-15", reportedBy: "Admin", status: "active", createdAt: "2024-04-15", updatedAt: "2024-04-15" },
  { id: "INC-019", fullName: "Oscar Tumuti Njoki", idNumber: "", phoneNumber: "0705061000", recordType: "fraud", severity: "high", description: "Broker Obtaining - Duplicate entry", incidentDate: "2024-04-20", reportedBy: "Admin", status: "active", createdAt: "2024-04-20", updatedAt: "2024-04-20" },
  { id: "INC-020", fullName: "Eliya Waningilo", idNumber: "", phoneNumber: "0722873856", recordType: "fraud", severity: "high", description: "Broker Obtaining - Savenger Hire", incidentDate: "2024-04-25", reportedBy: "Admin", status: "active", createdAt: "2024-04-25", updatedAt: "2024-04-25" },
  { id: "INC-021", fullName: "Benedict Chacha", idNumber: "", phoneNumber: "0783804680 / 0717509344", recordType: "fraud", severity: "high", description: "Broker Obtaining - Multiple contact numbers", incidentDate: "2024-05-01", reportedBy: "Admin", status: "active", createdAt: "2024-05-01", updatedAt: "2024-05-01" },
  { id: "INC-022", fullName: "Joseph Wandera", idNumber: "", phoneNumber: "0722690518 / 0111050962", recordType: "fraud", severity: "high", description: "Broker Obtaining - Multiple contact numbers", incidentDate: "2024-05-05", reportedBy: "Admin", status: "active", createdAt: "2024-05-05", updatedAt: "2024-05-05" },
  { id: "INC-023", fullName: "Frank Nganga", idNumber: "", phoneNumber: "0739538712 / 0796440037", recordType: "fraud", severity: "high", description: "Broker Obtaining - Multiple contact numbers", incidentDate: "2024-05-10", reportedBy: "Admin", status: "active", createdAt: "2024-05-10", updatedAt: "2024-05-10" },
  { id: "INC-024", fullName: "Israeli 1", idNumber: "", phoneNumber: "+254720245288", recordType: "theft", severity: "critical", description: "Car Theft - Alias used", incidentDate: "2024-05-15", reportedBy: "Admin", status: "active", createdAt: "2024-05-15", updatedAt: "2024-05-15" },
  { id: "INC-025", fullName: "Dan", idNumber: "", phoneNumber: "0724559878", recordType: "theft", severity: "critical", description: "Car Theft - Senior member", incidentDate: "2024-05-20", reportedBy: "Admin", status: "active", createdAt: "2024-05-20", updatedAt: "2024-05-20" },
  { id: "INC-026", fullName: "Peter Munyao", idNumber: "", phoneNumber: "0757354282 / 0782668144", recordType: "fraud", severity: "high", description: "Broker Obtaining - Bonnke Logistics", incidentDate: "2024-05-25", reportedBy: "Admin", status: "active", createdAt: "2024-05-25", updatedAt: "2024-05-25" },
  { id: "INC-027", fullName: "Godfrey Mwangi", idNumber: "", phoneNumber: "0721372494", recordType: "fraud", severity: "high", description: "Broker Obtaining - Fraud", incidentDate: "2024-06-01", reportedBy: "Admin", status: "active", createdAt: "2024-06-01", updatedAt: "2024-06-01" },
  { id: "INC-028", fullName: "Erick Ngarama", idNumber: "", phoneNumber: "0732300444", recordType: "fraud", severity: "high", description: "Malice Broker - Fraudulent activities", incidentDate: "2024-06-05", reportedBy: "Admin", status: "active", createdAt: "2024-06-05", updatedAt: "2024-06-05" },
  { id: "INC-029", fullName: "Chris Isura", idNumber: "", phoneNumber: "0713985762", recordType: "fraud", severity: "high", description: "Con Car Owner - Undercutting practices", incidentDate: "2024-06-10", reportedBy: "Admin", status: "active", createdAt: "2024-06-10", updatedAt: "2024-06-10" },
  { id: "INC-030", fullName: "Simon Nyambura", idNumber: "", phoneNumber: "0790024972", recordType: "violent-dangerous", severity: "critical", description: "Criminal - Armed and dangerous", incidentDate: "2024-06-15", reportedBy: "Admin", status: "active", createdAt: "2024-06-15", updatedAt: "2024-06-15" },
  { id: "INC-031", fullName: "Kelvin Kyalo", idNumber: "32249208", phoneNumber: "0729234822", recordType: "violent-dangerous", severity: "critical", description: "Criminal - Housebreaking activities", incidentDate: "2024-06-20", reportedBy: "Admin", status: "active", createdAt: "2024-06-20", updatedAt: "2024-06-20" },
  { id: "INC-032", fullName: "George Mutinda", idNumber: "", phoneNumber: "0726599168", recordType: "fraud", severity: "high", description: "Fraudster - General fraud activities", incidentDate: "2024-06-25", reportedBy: "Admin", status: "active", createdAt: "2024-06-25", updatedAt: "2024-06-25" },
  { id: "INC-033", fullName: "Victor Kipng'eno Langat", idNumber: "", phoneNumber: "+254792608358 / +254791776034", recordType: "theft", severity: "critical", description: "Car Theft - Multiple contact numbers", incidentDate: "2024-07-01", reportedBy: "Admin", status: "active", createdAt: "2024-07-01", updatedAt: "2024-07-01" },
  { id: "INC-034", fullName: "Benson Kimeu", idNumber: "", phoneNumber: "+254723234943", recordType: "suspicious", severity: "medium", description: "Suspicious Activity - Under monitoring", incidentDate: "2024-07-05", reportedBy: "Admin", status: "under-review", createdAt: "2024-07-05", updatedAt: "2024-07-05" },
  { id: "INC-035", fullName: "Sammy Odongo", idNumber: "", phoneNumber: "+254742895551 / 0786565706", recordType: "fraud", severity: "high", description: "Broker Obtaining - Multiple contact numbers", incidentDate: "2024-07-10", reportedBy: "Admin", status: "active", createdAt: "2024-07-10", updatedAt: "2024-07-10" },
  { id: "INC-036", fullName: "Dominic Muendo", idNumber: "", phoneNumber: "0742861626 / 0706142295", recordType: "fraud", severity: "high", description: "Obtaining - Turbo Miles connection", incidentDate: "2024-07-15", reportedBy: "Admin", status: "active", createdAt: "2024-07-15", updatedAt: "2024-07-15" },
  { id: "INC-037", fullName: "Margaret Wangari", idNumber: "28445340", phoneNumber: "0722466830", recordType: "fraud", severity: "high", description: "Broker Obtaining - Fraud", incidentDate: "2024-07-20", reportedBy: "Admin", status: "active", createdAt: "2024-07-20", updatedAt: "2024-07-20" },
  { id: "INC-038", fullName: "Antony Mahua", idNumber: "", phoneNumber: "0722026950 / +254723026950", recordType: "fraud", severity: "high", description: "Broker Obtaining - Multiple contact numbers", incidentDate: "2024-07-25", reportedBy: "Admin", status: "active", createdAt: "2024-07-25", updatedAt: "2024-07-25" },
  { id: "INC-039", fullName: "Chacha Maroa", idNumber: "", phoneNumber: "+254706821486", recordType: "fraud", severity: "high", description: "Broker Obtaining - Fraud", incidentDate: "2024-08-01", reportedBy: "Admin", status: "active", createdAt: "2024-08-01", updatedAt: "2024-08-01" },
  { id: "INC-040", fullName: "David Kimanzi Mutua", idNumber: "", phoneNumber: "+254712852455", recordType: "theft", severity: "critical", description: "Owner Obtainer - Theft related", incidentDate: "2024-08-05", reportedBy: "Admin", status: "active", createdAt: "2024-08-05", updatedAt: "2024-08-05" },
  { id: "INC-041", fullName: "Churchill Adipo", idNumber: "", phoneNumber: "0737050363 / 0724815420", recordType: "fraud", severity: "high", description: "Obtaining - Multiple contact numbers", incidentDate: "2024-08-10", reportedBy: "Admin", status: "active", createdAt: "2024-08-10", updatedAt: "2024-08-10" },
  { id: "INC-042", fullName: "Daniel Nyabuti", idNumber: "", phoneNumber: "+254100411895 / 0759298442", recordType: "fraud", severity: "critical", description: "Conman - Professional fraudster", incidentDate: "2024-08-15", reportedBy: "Admin", status: "active", createdAt: "2024-08-15", updatedAt: "2024-08-15" },
];

// Severity configuration
const severityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-green-900/300/20 text-green-400 border-green-500/30" },
  medium: { label: "Medium", color: "bg-yellow-900/300/20 text-yellow-400 border-yellow-500/30" },
  high: { label: "High", color: "bg-orange-900/300/20 text-orange-400 border-orange-500/30" },
  critical: { label: "Critical", color: "bg-red-900/300/20 text-red-400 border-red-500/30" },
};

// Sample clients data
const sampleClients: Client[] = [
  {
    id: "CLT-001",
    fullName: "John Kamau Mwangi",
    idNumber: "12345678",
    phone: "0712345678",
    email: "john.kamau@email.com",
    kraPin: "A012345678B",
    residence: "Westlands, Nairobi",
    drivingLicenseNumber: "DL123456",
    placeOfWork: "Safaricom PLC",
    createdAt: "2023-06-15",
    totalBookings: 15,
    totalSpent: 450000,
    lastBookingDate: "2024-08-20",
    status: "active",
  },
  {
    id: "CLT-002",
    fullName: "Mary Wanjiku Njeri",
    idNumber: "23456789",
    phone: "0723456789",
    email: "mary.wanjiku@email.com",
    kraPin: "A023456789C",
    residence: "Kilimani, Nairobi",
    drivingLicenseNumber: "DL234567",
    placeOfWork: "KCB Bank",
    createdAt: "2023-08-20",
    totalBookings: 8,
    totalSpent: 220000,
    lastBookingDate: "2024-08-15",
    status: "active",
  },
  {
    id: "CLT-003",
    fullName: "Peter Ochieng Otieno",
    idNumber: "34567890",
    phone: "0734567890",
    email: "peter.ochieng@email.com",
    residence: "Kisumu",
    drivingLicenseNumber: "DL345678",
    placeOfWork: "EABL",
    createdAt: "2024-01-10",
    totalBookings: 3,
    totalSpent: 85000,
    lastBookingDate: "2024-07-05",
    status: "active",
  },
];

// Sample transaction history
const sampleTransactions: TransactionHistory[] = [
  { id: "TXN-001", date: "2024-08-20", service: "Car Rental", serviceIcon: Car, description: "Toyota Prado - 5 Days", amount: 75000, status: "completed", paymentMethod: "M-Pesa", reference: "RKL8J2M4XY" },
  { id: "TXN-002", date: "2024-07-15", service: "Safari Tour", serviceIcon: Compass, description: "Masai Mara - 3 Days", amount: 120000, status: "completed", paymentMethod: "Bank Transfer", reference: "BNK-20240715-001" },
  { id: "TXN-003", date: "2024-06-10", service: "Airport Transfer", serviceIcon: Plane, description: "JKIA to Hilton Hotel", amount: 3500, status: "completed", paymentMethod: "Cash", reference: "CSH-20240610" },
  { id: "TXN-004", date: "2024-05-22", service: "Cargo Transport", serviceIcon: Package, description: "Nairobi to Mombasa - 2 Tons", amount: 45000, status: "completed", paymentMethod: "M-Pesa", reference: "QWE5T7P9KL" },
  { id: "TXN-005", date: "2024-04-18", service: "Car Rental", serviceIcon: Car, description: "Nissan X-Trail - 3 Days", amount: 36000, status: "completed", paymentMethod: "Card", reference: "CRD-20240418-99" },
];

function ClientLookupContent() {
  const searchParams = useSearchParams();
  const selectedService = searchParams.get("service");
  const currentService = selectedService && serviceConfig[selectedService] ? serviceConfig[selectedService] : null;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"name" | "id" | "phone" | "krapin" | "license" | "payment">("name");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    client: (Client | StoreClient) | null;
    blacklistEntries: BlacklistEntry[];
    isBlacklisted: boolean;
  } | null>(null);
  const [selectedBlacklistEntry, setSelectedBlacklistEntry] = useState<BlacklistEntry | null>(null);
  const [isBlacklistDetailOpen, setIsBlacklistDetailOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BlacklistEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localBlacklistData, setLocalBlacklistData] = useState<BlacklistEntry[]>(blacklistData);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [vehicleSource, setVehicleSource] = useState<'own' | 'sublet' | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isFingerprintScanning, setIsFingerprintScanning] = useState(false);
  const [fingerprintStatus, setFingerprintStatus] = useState<"idle" | "scanning" | "success" | "failed" | "not-found">("idle");

  const editForm = useForm<BlacklistEditFormValues>({
    resolver: zodResolver(blacklistEditSchema),
    defaultValues: {
      fullName: "",
      idNumber: "",
      phoneNumber: "",
      email: "",
      drivingLicenseNumber: "",
      kraPin: "",
      residence: "",
      recordType: "other",
      severity: "medium",
      description: "",
      incidentDate: "",
      vehicleInvolved: "",
      amountOwed: "",
      policeReportNumber: "",
    },
  });

  const handleEditEntry = (entry: BlacklistEntry) => {
    setEditingEntry(entry);
    editForm.reset({
      fullName: entry.fullName,
      idNumber: entry.idNumber || "",
      phoneNumber: entry.phoneNumber,
      email: entry.email || "",
      drivingLicenseNumber: entry.drivingLicenseNumber || "",
      kraPin: entry.kraPin || "",
      residence: entry.residence || "",
      recordType: entry.recordType,
      severity: entry.severity,
      description: entry.description,
      incidentDate: entry.incidentDate,
      vehicleInvolved: entry.vehicleInvolved || "",
      amountOwed: entry.amountOwed?.toString() || "",
      policeReportNumber: entry.policeReportNumber || "",
    });
    setIsBlacklistDetailOpen(false);
    setIsEditDialogOpen(true);
  };

  const onEditSubmit = async (data: BlacklistEditFormValues) => {
    if (!editingEntry) return;
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedEntry: BlacklistEntry = {
        ...editingEntry,
        ...data,
        email: data.email || undefined,
        amountOwed: data.amountOwed ? parseFloat(data.amountOwed) : undefined,
        updatedAt: new Date().toISOString().split("T")[0],
      };

      // Update local blacklist data
      setLocalBlacklistData(
        localBlacklistData.map((entry) =>
          entry.id === editingEntry.id ? updatedEntry : entry
        )
      );

      // Update search results if they exist
      if (searchResults) {
        setSearchResults({
          ...searchResults,
          blacklistEntries: searchResults.blacklistEntries.map((entry) =>
            entry.id === editingEntry.id ? updatedEntry : entry
          ),
        });
      }

      setIsEditDialogOpen(false);
      setEditingEntry(null);
      editForm.reset();
      toast.success("Blacklist entry updated successfully");
    } catch {
      toast.error("Failed to update blacklist entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  // New client registration form
  const registerForm = useForm<NewClientFormValues>({
    resolver: zodResolver(newClientSchema),
    defaultValues: {
      fullName: "",
      idNumber: "",
      phone: "",
      email: "",
      kraPin: "",
      residence: "",
      placeOfWork: "",
      drivingLicenseNumber: "",
    },
  });

  // Pre-populate registration form with search query
  const openRegisterDialog = () => {
    // Pre-fill based on search type
    if (searchType === "name") {
      registerForm.setValue("fullName", searchQuery);
    } else if (searchType === "id") {
      registerForm.setValue("idNumber", searchQuery);
    } else if (searchType === "phone") {
      registerForm.setValue("phone", searchQuery);
    } else if (searchType === "krapin") {
      registerForm.setValue("kraPin", searchQuery);
    } else if (searchType === "license") {
      registerForm.setValue("drivingLicense", searchQuery);
    }
    setIsRegisterDialogOpen(true);
  };

  const onRegisterSubmit = async (data: NewClientFormValues) => {
    setIsRegistering(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create new client
      const newClient = {
        id: `CLT-${Date.now()}`,
        fullName: data.fullName,
        idNumber: data.idNumber,
        phone: data.phone,
        email: data.email || undefined,
        kraPin: data.kraPin || undefined,
        residence: data.residence || undefined,
        placeOfWork: data.placeOfWork || undefined,
        drivingLicenseNumber: data.drivingLicenseNumber || undefined,
        totalBookings: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString().split("T")[0],
        riskLevel: "low" as const,
      };

      // Update search results to show the new client
      setSearchResults({
        client: newClient,
        blacklistEntries: [],
        isBlacklisted: false,
      });

      setIsRegisterDialogOpen(false);
      registerForm.reset();
      toast.success("Client registered successfully", {
        description: `${data.fullName} has been added to the system.`,
      });
    } catch {
      toast.error("Failed to register client");
    } finally {
      setIsRegistering(false);
    }
  };

  // Search function
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults(null);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const query = searchQuery.toLowerCase().trim();
    
    // Search blacklist
    const matchedBlacklist = localBlacklistData.filter((entry) => {
      const nameMatch = entry.fullName.toLowerCase().includes(query);
      const idMatch = entry.idNumber.toLowerCase().includes(query);
      const phoneMatch = entry.phoneNumber.toLowerCase().replace(/\s/g, "").includes(query.replace(/\s/g, ""));
      const kraPinMatch = entry.kraPin?.toLowerCase().includes(query) || false;
      const licenseMatch = entry.drivingLicenseNumber?.toLowerCase().includes(query) || false;
      
      if (searchType === "name") return nameMatch;
      if (searchType === "id") return idMatch;
      if (searchType === "phone") return phoneMatch;
      if (searchType === "krapin") return kraPinMatch;
      if (searchType === "license") return licenseMatch;
      if (searchType === "payment") return phoneMatch || idMatch; // Payment codes often use phone/ID
      return nameMatch || idMatch || phoneMatch || kraPinMatch || licenseMatch;
    });

    // Search clients from store (includes both demo and registered clients)
    const allClients = getClients();
    console.log("[v0] All clients from store:", allClients.length, "clients");
    console.log("[v0] Search query:", query, "Search type:", searchType);
    const matchedClient = allClients.find((client) => {
      const nameMatch = client.fullName.toLowerCase().includes(query);
      const idMatch = client.idNumber.toLowerCase().includes(query);
      const phoneMatch = client.phone.toLowerCase().includes(query);
      const kraPinMatch = client.kraPin?.toLowerCase().includes(query) || false;
      const licenseMatch = client.drivingLicense?.toLowerCase().includes(query) || false;
      
      if (searchType === "name") return nameMatch;
      if (searchType === "id") return idMatch;
      if (searchType === "phone") return phoneMatch;
      if (searchType === "krapin") return kraPinMatch;
      if (searchType === "license") return licenseMatch;
      if (searchType === "payment") return phoneMatch || idMatch;
      return nameMatch || idMatch || phoneMatch || kraPinMatch || licenseMatch;
    });

    const isBlacklisted = matchedBlacklist.length > 0 && matchedBlacklist.some(e => e.status === "active");

    console.log("[v0] Matched client:", matchedClient ? matchedClient.fullName : "None found");
    
    setSearchResults({
      client: matchedClient || null,
      blacklistEntries: matchedBlacklist,
      isBlacklisted,
    });

    // Play warning sound if blacklisted client found
    if (isBlacklisted) {
      playWarningSound();
    }

    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Fingerprint scan function
  const handleFingerprintScan = async () => {
    setIsFingerprintScanning(true);
    setFingerprintStatus("scanning");
    
    try {
      // Simulate fingerprint scanning process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Simulate a random result for demo purposes
      const results = ["success", "failed", "not-found"] as const;
      const randomResult = results[Math.floor(Math.random() * results.length)];
      
      setFingerprintStatus(randomResult);
      
      if (randomResult === "success") {
        // Simulate finding a client by fingerprint
        const matchedClient = clientsData[Math.floor(Math.random() * clientsData.length)];
        const matchedBlacklist = localBlacklistData.filter(
          (entry) => entry.fullName.toLowerCase() === matchedClient.fullName.toLowerCase()
        );
        const isBlacklisted = matchedBlacklist.length > 0 && matchedBlacklist.some(e => e.status === "active");
        
        setSearchResults({
          client: matchedClient,
          blacklistEntries: matchedBlacklist,
          isBlacklisted,
        });
        
        if (isBlacklisted) {
          playWarningSound();
        }
        
        toast.success("Fingerprint matched", {
          description: `Client identified: ${matchedClient.fullName}`,
        });
      } else if (randomResult === "failed") {
        toast.error("Scan failed", {
          description: "Could not read fingerprint. Please try again.",
        });
      } else {
        toast.warning("No match found", {
          description: "Fingerprint not registered in the system.",
        });
      }
    } catch {
      setFingerprintStatus("failed");
      toast.error("Scanner error", {
        description: "Failed to connect to fingerprint scanner.",
      });
    } finally {
      setIsFingerprintScanning(false);
      // Reset status after 3 seconds
      setTimeout(() => setFingerprintStatus("idle"), 3000);
    }
  };

  // Play warning sound when blacklisted client is found
  const playWarningSound = () => {
    try {
      // Create audio context for generating warning sound
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Play 3 beeps for urgent warning
      const playBeep = (startTime: number, frequency: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = "square";
        
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
      };

      // Play 3 warning beeps with increasing frequency
      const now = audioContext.currentTime;
      playBeep(now, 800);
      playBeep(now + 0.3, 1000);
      playBeep(now + 0.6, 1200);
    } catch (error) {
      console.error("Failed to play warning sound:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Banner - Show when accessing via service */}
      {currentService && (
        <div className={`rounded-xl border ${currentService.bgColor} p-4 flex items-center gap-4`}>
          <div className={`rounded-xl p-2.5 bg-[#0a1628] border border-white/10 shrink-0`}>
            <currentService.icon className={`h-5 w-5 ${currentService.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`font-semibold text-sm ${currentService.color}`}>
              {currentService.title} — Verify Client First
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              Blacklist check required before proceeding with this service.
            </p>
          </div>
          <Badge variant="outline" className={`${currentService.color} border-current shrink-0 text-xs`}>
            Step 1 of 2
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Fingerprint className="h-7 w-7 text-violet-400" />
            Client Lookup
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Search, verify and manage clients. Automatically checks against the blacklist.
          </p>
        </div>
        <Link href="/admin/blacklist">
          <Button variant="outline" size="sm" className="gap-2 border-red-500/40 text-red-400 hover:bg-red-500/10">
            <ShieldAlert className="h-4 w-4" />
            Blacklist
          </Button>
        </Link>
      </div>

      {/* Search Section */}
      <Card className="border-violet-500/30 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-violet-400 text-base">
            <Search className="h-4 w-4" />
            Search Client
          </CardTitle>
          <CardDescription className="text-gray-500 text-xs">
            Enter client details below. System checks blacklist automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={searchType === "name" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("name")}
                className="gap-1"
              >
                <User className="h-4 w-4" />
                Name
              </Button>
              <Button
                variant={searchType === "id" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("id")}
                className="gap-1"
              >
                <IdCard className="h-4 w-4" />
                ID No
              </Button>
              <Button
                variant={searchType === "phone" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("phone")}
                className="gap-1"
              >
                <Phone className="h-4 w-4" />
                Phone
              </Button>
              <Button
                variant={searchType === "krapin" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("krapin")}
                className="gap-1"
              >
                <Building className="h-4 w-4" />
                KRA PIN
              </Button>
              <Button
                variant={searchType === "license" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("license")}
                className="gap-1"
              >
                <Car className="h-4 w-4" />
                DL No
              </Button>
              <Button
                variant={searchType === "payment" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("payment")}
                className="gap-1"
              >
                <CreditCard className="h-4 w-4" />
                Payment Code
              </Button>
            </div>
            <div className="flex flex-1 gap-2">
              <Input
                placeholder={
                  searchType === "name"
                    ? "Enter client name..."
                    : searchType === "id"
                    ? "Enter ID/Passport number..."
                    : searchType === "phone"
                    ? "Enter phone number..."
                    : searchType === "krapin"
                    ? "Enter KRA PIN (e.g., A012345678X)..."
                    : searchType === "license"
                    ? "Enter driving license number..."
                    : "Enter M-Pesa code or payment reference..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()} className="gap-2">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
          </div>
          <div className="mt-4 border-t border-emerald-500/20 pt-4">
            <div className="flex items-center gap-4">
            {/* Fingerprint Scanner Visual - Smaller */}
            <div 
              className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all duration-300 shrink-0 ${
                fingerprintStatus === "idle" 
                  ? "border-emerald-300 dark:border-emerald-700 bg-emerald-900/30 dark:bg-emerald-900/50 hover:border-emerald-400 hover:bg-emerald-100"
                  : fingerprintStatus === "scanning"
                  ? "border-blue-400 bg-blue-900/30 dark:bg-blue-900/50 animate-pulse"
                  : fingerprintStatus === "success"
                  ? "border-green-500 bg-green-900/30 dark:bg-green-900/50"
                  : fingerprintStatus === "failed"
                  ? "border-red-500 bg-red-900/30 dark:bg-red-900/50"
                  : "border-yellow-500 bg-yellow-900/30 dark:bg-yellow-900/50"
              }`}
              onClick={!isFingerprintScanning ? handleFingerprintScan : undefined}
            >
              {fingerprintStatus === "scanning" && (
                <div className="absolute inset-2 rounded-lg border border-blue-400 animate-ping opacity-75" />
              )}
              <Fingerprint 
                className={`h-8 w-8 transition-colors duration-300 ${
                  fingerprintStatus === "idle" ? "text-emerald-500"
                    : fingerprintStatus === "scanning" ? "text-blue-500 animate-pulse"
                    : fingerprintStatus === "success" ? "text-green-500"
                    : fingerprintStatus === "failed" ? "text-red-500"
                    : "text-yellow-500"
                }`} 
              />
              {fingerprintStatus === "success" && (
                <div className="absolute -bottom-1 -right-1 bg-green-900/300 rounded-full p-0.5">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}
              {fingerprintStatus === "failed" && (
                <div className="absolute -bottom-1 -right-1 bg-red-900/300 rounded-full p-0.5">
                  <X className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            {/* Info and Status */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-emerald-300 dark:text-emerald-300 text-sm">Biometric Verification</h4>
              <p className="text-xs text-muted-foreground">
                {fingerprintStatus === "idle" && "Click scanner or place finger on device"}
                {fingerprintStatus === "scanning" && "Scanning fingerprint..."}
                {fingerprintStatus === "success" && "Fingerprint matched successfully!"}
                {fingerprintStatus === "failed" && "Scan failed. Please try again."}
                {fingerprintStatus === "not-found" && "No matching fingerprint found."}
              </p>
            </div>

            {/* Scan Button */}
            <Button
              onClick={handleFingerprintScan}
              disabled={isFingerprintScanning}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 shrink-0"
              size="sm"
            >
              {isFingerprintScanning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Fingerprint className="h-4 w-4" />
              )}
              {isFingerprintScanning ? "Scanning..." : "Scan"}
            </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-6">
          {/* Blacklist Alert */}
          {searchResults.isBlacklisted && (
            <Card className="border-red-500 bg-red-900/300/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-red-900/300 p-3">
                    <Skull className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-500">BLACKLISTED CLIENT</h3>
                    <p className="text-red-400 mt-1">
                      This person is on the blacklist. DO NOT proceed with any services without manager approval.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {searchResults.blacklistEntries.filter(e => e.status === "active").map((entry) => {
                        const config = recordTypeConfig[entry.recordType];
                        const TypeIcon = config.icon;
                        return (
                          <Badge 
                            key={entry.id} 
                            variant="outline" 
                            className={`${config.color} ${config.bgColor} gap-1.5 font-medium px-3 py-1`}
                          >
                            <TypeIcon className="h-3.5 w-3.5" />
                            {config.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results - New Client Option */}
          {!searchResults.client && searchResults.blacklistEntries.length === 0 && (
            <Card className="border-green-500/50 bg-green-900/300/10">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-green-900/300/20 p-3">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-600 dark:text-green-400 text-lg">No Negative Records Found</h3>
                      <p className="text-muted-foreground">
                        This person has no blacklist records. Safe to register as a new client or proceed with services.
                      </p>
                    </div>

                  </div>
                  
                  {/* Selected Service - Prominent CTA */}
                  {currentService && (
                    <div className="border-t border-green-500/50 pt-4 space-y-3">
                      <p className="text-sm text-gray-400 font-medium">Select vehicle source to proceed:</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Link href={`${currentService.href}?clientId=${searchResults.client?.id || ""}`}>
                          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 p-4 hover:bg-emerald-500/20 transition-all cursor-pointer group">
                            <currentService.icon className="h-7 w-7 text-emerald-400" />
                            <span className="text-emerald-300 font-semibold text-sm text-center">Company Vehicle</span>
                            <span className="text-gray-400 text-xs text-center">Use Moventra own fleet</span>
                          </div>
                        </Link>
                        <Link href={`/admin/sublets?clientId=${searchResults.client?.id || ""}&service=${currentService.title}&clientName=${encodeURIComponent(searchResults.client?.fullName || "")}&clientPhone=${encodeURIComponent(searchResults.client?.phone || "")}`}>
                          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-cyan-500 bg-cyan-500/10 p-4 hover:bg-cyan-500/20 transition-all cursor-pointer group">
                            <Building2 className="h-7 w-7 text-cyan-400" />
                            <span className="text-cyan-300 font-semibold text-sm text-center">Sublet Vehicle</span>
                            <span className="text-gray-400 text-xs text-center">Source from another company</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {/* All Services - Only show if no specific service selected */}
                  {!currentService && (
                    <div className="border-t border-green-500/50 dark:border-green-800 pt-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Service Access - Select a service to proceed:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Link href={`/admin/car-rental/new?clientId=${searchResults.client?.id || ""}`}>
                          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-indigo-500/50 hover:border-indigo-400 hover:bg-indigo-900/30 dark:hover:bg-indigo-950 group">
                            <Car className="h-6 w-6 text-indigo-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Car Rental</span>
                          </Button>
                        </Link>
                        <Link href="/admin/safari-tours">
                          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-amber-500/50 hover:border-amber-400 hover:bg-amber-900/30 dark:hover:bg-amber-950 group">
                            <Compass className="h-6 w-6 text-amber-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Safari Tours</span>
                          </Button>
                        </Link>
                        <Link href="/admin/transfers">
                          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-sky-200 hover:border-sky-400 hover:bg-sky-900/30 dark:hover:bg-sky-950 group">
                            <Plane className="h-6 w-6 text-sky-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Airport Transfers</span>
                          </Button>
                        </Link>
                        <Link href="/admin/cargo-handling">
                          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-orange-500/50 hover:border-orange-400 hover:bg-orange-900/30 dark:hover:bg-orange-950 group">
                            <Package className="h-6 w-6 text-orange-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Cargo Handling</span>
                          </Button>
                        </Link>
                        <Link href="/admin/movers">
                          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-violet-200 hover:border-violet-400 hover:bg-violet-900/30 dark:hover:bg-violet-950 group">
                            <Truck className="h-6 w-6 text-violet-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Movers</span>
                          </Button>
                        </Link>
                        <Link href="/admin/construction-equipment">
                          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-yellow-500/50 hover:border-yellow-400 hover:bg-yellow-900/30 dark:hover:bg-yellow-950 group">
                            <HardHat className="h-6 w-6 text-yellow-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Construction Equipment</span>
                          </Button>
                        </Link>
                        <Link href="/admin/shipment-imports">
                          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-blue-500/50 hover:border-blue-400 hover:bg-blue-900/30 dark:hover:bg-blue-950 group">
                            <Ship className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Shipment Imports</span>
                          </Button>
                        </Link>
                        <Link href="/admin/road-recovery">
                          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-rose-200 hover:border-rose-400 hover:bg-rose-900/30 dark:hover:bg-rose-950 group">
                            <Wrench className="h-6 w-6 text-rose-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Road Recovery</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clear Status (Not Blacklisted) */}
          {!searchResults.isBlacklisted && (searchResults.client || searchResults.blacklistEntries.length > 0) && (
            <Card className="border-green-500/50 bg-green-900/300/10">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-green-900/300/20 p-3">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-500 text-lg">Client Status: CLEAR</h3>
                      <p className="text-muted-foreground">
                        No active blacklist records found for this client. Safe to proceed with any service.
                      </p>
                    </div>
                  </div>
                  
                  {/* Selected Service - Prominent CTA */}
                  {currentService && (
                    <div className="border-t border-green-500/50 pt-4 space-y-3">
                      <p className="text-sm text-gray-400 font-medium">Select vehicle source to proceed:</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Link href={`${currentService.href}?clientId=${searchResults.client?.id || ""}`}>
                          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 p-4 hover:bg-emerald-500/20 transition-all cursor-pointer group">
                            <currentService.icon className="h-7 w-7 text-emerald-400" />
                            <span className="text-emerald-300 font-semibold text-sm text-center">Company Vehicle</span>
                            <span className="text-gray-400 text-xs text-center">Use Moventra own fleet</span>
                          </div>
                        </Link>
                        <Link href={`/admin/sublets?clientId=${searchResults.client?.id || ""}&service=${currentService.title}&clientName=${encodeURIComponent(searchResults.client?.fullName || "")}&clientPhone=${encodeURIComponent(searchResults.client?.phone || "")}`}>
                          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-cyan-500 bg-cyan-500/10 p-4 hover:bg-cyan-500/20 transition-all cursor-pointer group">
                            <Building2 className="h-7 w-7 text-cyan-400" />
                            <span className="text-cyan-300 font-semibold text-sm text-center">Sublet Vehicle</span>
                            <span className="text-gray-400 text-xs text-center">Source from another company</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {/* All Services - Only show if no specific service selected */}
                  {!currentService && (
                    <div className="border-t border-green-500/50 dark:border-green-800 pt-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Proceed with Service:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Link href={`/admin/car-rental/new?clientId=${searchResults.client?.id || ""}`}>
                          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-indigo-500/50 hover:border-indigo-400 hover:bg-indigo-900/30 dark:hover:bg-indigo-950 group">
                            <Car className="h-6 w-6 text-indigo-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Car Rental</span>
                          </Button>
                        </Link>
                        <Link href="/admin/safari-tours">
                          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-amber-500/50 hover:border-amber-400 hover:bg-amber-900/30 dark:hover:bg-amber-950 group">
                            <Compass className="h-6 w-6 text-amber-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Safari Tours</span>
                          </Button>
                        </Link>
                        <Link href="/admin/transfers">
                          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-sky-200 hover:border-sky-400 hover:bg-sky-900/30 dark:hover:bg-sky-950 group">
                            <Plane className="h-6 w-6 text-sky-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Airport Transfers</span>
                          </Button>
                        </Link>
                        <Link href="/admin/cargo-handling">
                          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-orange-500/50 hover:border-orange-400 hover:bg-orange-900/30 dark:hover:bg-orange-950 group">
                            <Package className="h-6 w-6 text-orange-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Cargo Handling</span>
                          </Button>
                        </Link>
                        <Link href="/admin/movers">
                          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-violet-200 hover:border-violet-400 hover:bg-violet-900/30 dark:hover:bg-violet-950 group">
                            <Truck className="h-6 w-6 text-violet-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Movers</span>
                          </Button>
                        </Link>
                        <Link href="/admin/construction-equipment">
                          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-yellow-500/50 hover:border-yellow-400 hover:bg-yellow-900/30 dark:hover:bg-yellow-950 group">
                            <HardHat className="h-6 w-6 text-yellow-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Construction Equipment</span>
                          </Button>
                        </Link>
                        <Link href="/admin/shipment-imports">
                          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-blue-500/50 hover:border-blue-400 hover:bg-blue-900/30 dark:hover:bg-blue-950 group">
                            <Ship className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Shipment Imports</span>
                          </Button>
                        </Link>
                        <Link href="/admin/road-recovery">
                          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-rose-200 hover:border-rose-400 hover:bg-rose-900/30 dark:hover:bg-rose-950 group">
                            <Wrench className="h-6 w-6 text-rose-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Road Recovery</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Client Profile - Comprehensive View */}
          {searchResults.client && (
            <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <UserCheck className="h-6 w-6" />
                    Complete Client Profile
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {searchResults.client.riskLevel && (
                      <Badge className={`text-sm font-bold ${
                        searchResults.client.riskLevel === "blocked" 
                          ? "bg-red-600 text-white" 
                          : searchResults.client.riskLevel === "high"
                          ? "bg-orange-900/300 text-white"
                          : searchResults.client.riskLevel === "medium"
                          ? "bg-yellow-900/300 text-black"
                          : "bg-green-900/300 text-white"
                      }`}>
                        {searchResults.client.riskLevel === "blocked" ? "BLOCKED" : `${searchResults.client.riskLevel.toUpperCase()} RISK`}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-500">
                      Verified Client
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Header with Photo */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Passport Photo */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className={`w-32 h-40 rounded-lg border-4 overflow-hidden ${
                        searchResults.client.riskLevel === "blocked" 
                          ? "border-red-500" 
                          : searchResults.client.riskLevel === "high"
                          ? "border-orange-500"
                          : searchResults.client.riskLevel === "medium"
                          ? "border-yellow-500"
                          : "border-green-500"
                      }`}>
                        {searchResults.client.passportPhotoUrl ? (
                          <img 
                            src={searchResults.client.passportPhotoUrl} 
                            alt="Passport Photo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <User className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                      {searchResults.client.riskLevel !== "blocked" && (
                        <div className="absolute -bottom-2 -right-2 bg-green-900/300 rounded-full p-1.5">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Passport Photo</p>
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{searchResults.client.fullName}</h2>
                      <p className="text-sm text-muted-foreground">
                        Client ID: {searchResults.client.id} | Member since {searchResults.client.createdAt}
                      </p>
                    </div>

                    {/* Client Stats - Horizontal */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="rounded-lg bg-blue-900/300/10 p-3 text-center">
                        <p className="text-xl font-bold text-blue-500">{searchResults.client.totalBookings}</p>
                        <p className="text-xs text-muted-foreground">Bookings</p>
                      </div>
                      <div className="rounded-lg bg-green-900/300/10 p-3 text-center">
                        <p className="text-lg font-bold text-green-500">{formatCurrency((searchResults.client as typeof searchResults.client & { totalSpent?: number }).totalSpent || 0)}</p>
                        <p className="text-xs text-muted-foreground">Total Spent</p>
                      </div>
                      <div className="rounded-lg bg-amber-900/300/10 p-3 text-center">
                        <p className="text-sm font-bold text-amber-500">{searchResults.client.lastBookingDate || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">Last Booking</p>
                      </div>
                      <div className="rounded-lg bg-purple-900/300/10 p-3 text-center">
                        <p className="text-lg font-bold text-purple-500">{formatCurrency(searchResults.client.totalDebt || 0)}</p>
                        <p className="text-xs text-muted-foreground">Outstanding</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Personal Details Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Identification Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-[#e67e22] uppercase tracking-wide flex items-center gap-2">
                      <IdCard className="h-4 w-4" />
                      Identification Details
                    </h3>
                    <div className="grid gap-3 bg-muted/30 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">ID/Passport Number</span>
                        <span className="font-mono font-bold text-foreground">{searchResults.client.idNumber}</span>
                      </div>
                      <Separator className="bg-border/50" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Driving License</span>
                        <span className="font-mono font-bold text-foreground">{searchResults.client.drivingLicenseNumber || "Not provided"}</span>
                      </div>
                      <Separator className="bg-border/50" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">KRA PIN</span>
                        <span className="font-mono font-bold text-foreground">{searchResults.client.kraPin || "Not provided"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-[#e67e22] uppercase tracking-wide flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contact Information
                    </h3>
                    <div className="grid gap-3 bg-muted/30 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Primary Phone</span>
                        <span className="font-bold text-foreground">{searchResults.client.phone}</span>
                      </div>
                      <Separator className="bg-border/50" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Alternative Phone</span>
                        <span className="font-bold text-foreground">{searchResults.client.alternativePhone || "Not provided"}</span>
                      </div>
                      <Separator className="bg-border/50" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="font-bold text-foreground">{searchResults.client.email || "Not provided"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Residence & Work */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-[#e67e22] uppercase tracking-wide flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address & Work
                    </h3>
                    <div className="grid gap-3 bg-muted/30 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">Residence</span>
                        <span className="font-bold text-foreground text-right max-w-[60%]">{searchResults.client.residence || "Not provided"}</span>
                      </div>
                      <Separator className="bg-border/50" />
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">Place of Work</span>
                        <span className="font-bold text-foreground text-right max-w-[60%]">{searchResults.client.placeOfWork || "Not provided"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Next of Kin */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-[#e67e22] uppercase tracking-wide flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Next of Kin
                    </h3>
                    <div className="grid gap-3 bg-muted/30 rounded-lg p-4">
                      {searchResults.client.nextOfKin ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Name</span>
                            <span className="font-bold text-foreground">{searchResults.client.nextOfKin.name}</span>
                          </div>
                          <Separator className="bg-border/50" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Phone</span>
                            <span className="font-bold text-foreground">{searchResults.client.nextOfKin.phone}</span>
                          </div>
                          <Separator className="bg-border/50" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Relationship</span>
                            <Badge variant="secondary">{searchResults.client.nextOfKin.relationship}</Badge>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No next of kin information provided</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Document Photos Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-[#e67e22] uppercase tracking-wide flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents & Biometrics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* ID Photo */}
                    <div className="space-y-2">
                      <div className="aspect-[3/2] rounded-lg border-2 border-dashed border-muted-foreground/30 overflow-hidden bg-muted/30">
                        {searchResults.client.idPhotoUrl ? (
                          <img 
                            src={searchResults.client.idPhotoUrl} 
                            alt="ID Document"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                            <IdCard className="h-8 w-8 mb-1" />
                            <span className="text-xs">No ID Photo</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center text-muted-foreground font-medium">ID Document</p>
                    </div>

                    {/* Driving License Photo */}
                    <div className="space-y-2">
                      <div className="aspect-[3/2] rounded-lg border-2 border-dashed border-muted-foreground/30 overflow-hidden bg-muted/30">
                        {searchResults.client.drivingLicenseUrl ? (
                          <img 
                            src={searchResults.client.drivingLicenseUrl} 
                            alt="Driving License"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                            <Car className="h-8 w-8 mb-1" />
                            <span className="text-xs">No DL Photo</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center text-muted-foreground font-medium">Driving License</p>
                    </div>

                    {/* Left Fingerprint */}
                    <div className="space-y-2">
                      <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 overflow-hidden bg-muted/30">
                        {searchResults.client.fingerprintLeftUrl ? (
                          <img 
                            src={searchResults.client.fingerprintLeftUrl} 
                            alt="Left Fingerprint"
                            className="w-full h-full object-contain bg-white dark:bg-gray-800 p-2"
                          />
                        ) : searchResults.client.leftFingerprint ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-green-900/300/10">
                            <Fingerprint className="h-12 w-12 text-green-500" />
                            <span className="text-xs text-green-600 dark:text-green-400 mt-1">Captured</span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                            <Fingerprint className="h-8 w-8 mb-1" />
                            <span className="text-xs">Not Captured</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center text-muted-foreground font-medium">Left Thumb</p>
                    </div>

                    {/* Right Fingerprint */}
                    <div className="space-y-2">
                      <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 overflow-hidden bg-muted/30">
                        {searchResults.client.fingerprintRightUrl ? (
                          <img 
                            src={searchResults.client.fingerprintRightUrl} 
                            alt="Right Fingerprint"
                            className="w-full h-full object-contain bg-white dark:bg-gray-800 p-2"
                          />
                        ) : searchResults.client.rightFingerprint ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-green-900/300/10">
                            <Fingerprint className="h-12 w-12 text-green-500" />
                            <span className="text-xs text-green-600 dark:text-green-400 mt-1">Captured</span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                            <Fingerprint className="h-8 w-8 mb-1" />
                            <span className="text-xs">Not Captured</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center text-muted-foreground font-medium">Right Thumb</p>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {searchResults.client.notes && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-[#e67e22] uppercase tracking-wide flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Notes
                      </h3>
                      <div className="bg-amber-900/300/10 rounded-lg p-4 border border-amber-500/30">
                        <p className="text-sm text-foreground">{searchResults.client.notes}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">

            {/* Blacklist Records */}
            {searchResults.blacklistEntries.length > 0 && (
              <Card className={searchResults.isBlacklisted ? "border-red-500/50" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className={`h-5 w-5 ${searchResults.isBlacklisted ? "text-red-500" : "text-yellow-500"}`} />
                    Blacklist Records ({searchResults.blacklistEntries.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {searchResults.blacklistEntries.map((entry) => {
                      const recordConfig = recordTypeConfig[entry.recordType];
                      const sevConfig = severityConfig[entry.severity];
                      const RecordTypeIcon = recordConfig.icon;
                      return (
                        <div
                          key={entry.id}
                          className={`rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                            entry.status === "active" ? "border-red-500/50 bg-red-900/300/5" : "border-muted"
                          }`}
                          onClick={() => {
                            setSelectedBlacklistEntry(entry);
                            setIsBlacklistDetailOpen(true);
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">{entry.fullName}</span>
                                <Badge 
                                  variant="outline" 
                                  className={`${recordConfig.color} ${recordConfig.bgColor} text-xs gap-1 font-medium`}
                                >
                                  <RecordTypeIcon className="h-3 w-3" />
                                  {recordConfig.label}
                                </Badge>
                                <Badge variant="outline" className={`${sevConfig.color} text-xs`}>
                                  {sevConfig.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {entry.incidentDate}
                                </span>
                                {entry.idNumber && (
                                  <span className="flex items-center gap-1">
                                    <IdCard className="h-3 w-3" />
                                    {entry.idNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/300/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEntry(entry);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Transaction History (if client found) */}
          {searchResults.client && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-indigo-500" />
                  Transaction History
                </CardTitle>
                <CardDescription>
                  Recent transactions and bookings for this client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleTransactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="font-medium">{txn.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <txn.serviceIcon className="h-4 w-4 text-muted-foreground" />
                            {txn.service}
                          </div>
                        </TableCell>
                        <TableCell>{txn.description}</TableCell>
                        <TableCell>{txn.paymentMethod}</TableCell>
                        <TableCell className="font-mono text-xs">{txn.reference}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(txn.amount)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              txn.status === "completed"
                                ? "bg-green-900/300/20 text-green-400 border-green-500/30"
                                : txn.status === "pending"
                                ? "bg-yellow-900/300/20 text-yellow-400 border-yellow-500/30"
                                : "bg-red-900/300/20 text-red-400 border-red-500/30"
                            }
                          >
                            {txn.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Blacklist Detail Dialog */}
      <Dialog open={isBlacklistDetailOpen} onOpenChange={setIsBlacklistDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <ShieldAlert className="h-5 w-5" />
              Blacklist Record Details
            </DialogTitle>
            <DialogDescription>
              Full details of the blacklist record
            </DialogDescription>
          </DialogHeader>
          {selectedBlacklistEntry && (
            <div className="space-y-4">
              <div className="rounded-lg border border-red-500/30 bg-red-900/300/10 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{selectedBlacklistEntry.fullName}</h3>
                  <Badge
                    variant="outline"
                    className={severityConfig[selectedBlacklistEntry.severity].color}
                  >
                    {severityConfig[selectedBlacklistEntry.severity].label} Severity
                  </Badge>
                </div>
                <Badge
                  variant="outline"
                  className={`${recordTypeConfig[selectedBlacklistEntry.recordType].color} mt-2`}
                >
                  {recordTypeConfig[selectedBlacklistEntry.recordType].label}
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {selectedBlacklistEntry.idNumber && (
                  <div className="flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">ID Number:</span>
                    <span className="font-medium">{selectedBlacklistEntry.idNumber}</span>
                  </div>
                )}
                {selectedBlacklistEntry.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{selectedBlacklistEntry.phoneNumber}</span>
                  </div>
                )}
                {selectedBlacklistEntry.residence && (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Known Locations:</span>
                    <span className="font-medium">{selectedBlacklistEntry.residence}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Incident Date:</span>
                  <span className="font-medium">{selectedBlacklistEntry.incidentDate}</span>
                </div>
                {selectedBlacklistEntry.vehicleInvolved && (
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Vehicle:</span>
                    <span className="font-medium">{selectedBlacklistEntry.vehicleInvolved}</span>
                  </div>
                )}
                {selectedBlacklistEntry.amountOwed && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Amount Owed:</span>
                    <span className="font-medium text-red-500">{formatCurrency(selectedBlacklistEntry.amountOwed)}</span>
                  </div>
                )}
                {selectedBlacklistEntry.policeReportNumber && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Police Report:</span>
                    <span className="font-medium">{selectedBlacklistEntry.policeReportNumber}</span>
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedBlacklistEntry.description}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Reported by: {selectedBlacklistEntry.reportedBy}</span>
                <span>Last updated: {selectedBlacklistEntry.updatedAt}</span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Link href="/admin/blacklist">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                View in Blacklist
              </Button>
            </Link>
            <Button 
              variant="default"
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => selectedBlacklistEntry && handleEditEntry(selectedBlacklistEntry)}
            >
              <Edit className="h-4 w-4" />
              Edit Record
            </Button>
            <Button variant="outline" onClick={() => setIsBlacklistDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Blacklist Entry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-600 dark:border-gray-700">
          <DialogHeader className="border-b border-gray-600 dark:border-gray-700 pb-4">
            <DialogTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Edit className="h-5 w-5" />
              Edit Blacklist Record
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update blacklist record details. You can add new phone numbers, update crime types, or modify any other information.
            </DialogDescription>
          </DialogHeader>
          {editingEntry && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-900/30 dark:bg-red-950/50 p-4 shadow-sm">
                  <h4 className="font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={editForm.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl><Input placeholder="Full legal name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="idNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number</FormLabel>
                        <FormControl><Input placeholder="National ID number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="phoneNumber" render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Phone Number(s) *</FormLabel>
                        <FormControl><Input placeholder="e.g., 0712345678 / 0723456789 (separate multiple with /)" {...field} /></FormControl>
                        <FormDescription className="text-xs text-blue-600">
                          Add multiple phone numbers separated by / if the person uses different numbers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="email@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="drivingLicenseNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driving License</FormLabel>
                        <FormControl><Input placeholder="License number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="kraPin" render={({ field }) => (
                      <FormItem>
                        <FormLabel>KRA PIN</FormLabel>
                        <FormControl><Input placeholder="KRA PIN" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="residence" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Known Locations/Residence</FormLabel>
                        <FormControl><Input placeholder="e.g., Westlands / Kilimani / Karen" {...field} /></FormControl>
                        <FormDescription className="text-xs text-blue-600">
                          Add multiple locations separated by / if known
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Incident Details */}
                <div className="rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-900/30 dark:bg-orange-950/50 p-4 shadow-sm">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <AlertTriangle className="h-4 w-4" />
                    Incident Details
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={editForm.control} name="recordType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Record Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="theft">Theft</SelectItem>
                            <SelectItem value="fraud">Fraud / Broker Obtaining</SelectItem>
                            <SelectItem value="damage">Vehicle Damage</SelectItem>
                            <SelectItem value="non-payment">Non-Payment</SelectItem>
                            <SelectItem value="accident">Accident</SelectItem>
                            <SelectItem value="drug-related">Drug Related</SelectItem>
                            <SelectItem value="violent-dangerous">Violent / Dangerous</SelectItem>
                            <SelectItem value="suspicious">Suspicious Activity</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="severity" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Severity *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="incidentDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incident Date *</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")}
                            placeholder="Select incident date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="vehicleInvolved" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Involved</FormLabel>
                        <FormControl><Input placeholder="e.g., Toyota Prado KCX 123A" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="amountOwed" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Owed (KES)</FormLabel>
                        <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="policeReportNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Police Report / OB Number</FormLabel>
                        <FormControl><Input placeholder="e.g., OB/123/2024" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="description" render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed description of the incident, additional crimes, aliases used, etc." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-orange-600">
                          Include any new crimes, additional details, or updates to the original incident
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingEntry(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 gap-2" disabled={isSubmitting}>
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Register New Client Dialog */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-gray-600 dark:border-gray-700">
          <DialogHeader className="border-b border-gray-600 dark:border-gray-700 pb-4">
            <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <UserPlus className="h-5 w-5" />
              Register New Client
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Add a new client to the system. This client has no negative records on the blacklist.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
              <div className="rounded-lg border border-green-300 dark:border-green-700 bg-green-900/30 dark:bg-green-950/50 p-4 shadow-sm">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <User className="h-4 w-4" />
                  Personal Information
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={registerForm.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl><Input placeholder="Full legal name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={registerForm.control} name="idNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Number *</FormLabel>
                      <FormControl><Input placeholder="National ID / Passport" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={registerForm.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl><Input placeholder="0712345678" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={registerForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="email@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={registerForm.control} name="kraPin" render={({ field }) => (
                    <FormItem>
                      <FormLabel>KRA PIN</FormLabel>
                      <FormControl><Input placeholder="A012345678B" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={registerForm.control} name="drivingLicenseNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driving License</FormLabel>
                      <FormControl><Input placeholder="License number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={registerForm.control} name="residence" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Residence</FormLabel>
                      <FormControl><Input placeholder="City / Area" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={registerForm.control} name="placeOfWork" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of Work</FormLabel>
                      <FormControl><Input placeholder="Employer / Company" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsRegisterDialogOpen(false);
                    registerForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 gap-2" disabled={isRegistering}>
                  <UserPlus className="h-4 w-4" />
                  {isRegistering ? "Registering..." : "Register Client"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ClientLookupPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-muted-foreground">Loading client lookup...</p>
        </div>
      </div>
    }>
      <ClientLookupContent />
    </Suspense>
  );
}
