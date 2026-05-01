"use client";

import { useState, useEffect } from "react";
import {
  Search,
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
import { toast } from "sonner";

// Record type configuration with icons
const recordTypeConfig: Record<string, { label: string; icon: LucideIcon; color: string; bgColor: string }> = {
  theft: { 
    label: "Theft", 
    icon: Skull, 
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-950/50 border-red-300 dark:border-red-800"
  },
  fraud: { 
    label: "Fraud", 
    icon: Banknote, 
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-950/50 border-orange-300 dark:border-orange-800"
  },
  damage: { 
    label: "Vehicle Damage", 
    icon: Hammer, 
    color: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-950/50 border-yellow-300 dark:border-yellow-800"
  },
  "non-payment": { 
    label: "Non-Payment", 
    icon: CreditCard, 
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800"
  },
  accident: { 
    label: "Accident", 
    icon: Car, 
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800"
  },
  "drug-related": { 
    label: "Drug Related", 
    icon: Syringe, 
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800"
  },
  "violent-dangerous": { 
    label: "Violent / Dangerous", 
    icon: Sword, 
    color: "text-rose-700 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800"
  },
  suspicious: { 
    label: "Suspicious Activity", 
    icon: CircleAlert, 
    color: "text-amber-700 dark:text-amber-400",
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

// Record type configuration
const recordTypeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  theft: { label: "Theft", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertOctagon },
  fraud: { label: "Fraud", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: Ban },
  damage: { label: "Vehicle Damage", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Car },
  "non-payment": { label: "Non-Payment", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: CreditCard },
  accident: { label: "Accident", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: AlertTriangle },
  "drug-related": { label: "Drug Related", color: "bg-pink-500/20 text-pink-400 border-pink-500/30", icon: AlertOctagon },
  "violent-dangerous": { label: "Violent/Dangerous", color: "bg-red-600/20 text-red-500 border-red-600/30", icon: Skull },
  suspicious: { label: "Suspicious Activity", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Eye },
  other: { label: "Other", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: FileText },
};

// Severity configuration
const severityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  medium: { label: "Medium", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  high: { label: "High", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  critical: { label: "Critical", color: "bg-red-500/20 text-red-400 border-red-500/30" },
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

export default function ClientLookupPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"name" | "id" | "phone">("name");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    client: Client | null;
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
      
      if (searchType === "name") return nameMatch;
      if (searchType === "id") return idMatch;
      if (searchType === "phone") return phoneMatch;
      return nameMatch || idMatch || phoneMatch;
    });

    // Search clients
    const matchedClient = sampleClients.find((client) => {
      const nameMatch = client.fullName.toLowerCase().includes(query);
      const idMatch = client.idNumber.toLowerCase().includes(query);
      const phoneMatch = client.phone.toLowerCase().includes(query);
      
      if (searchType === "name") return nameMatch;
      if (searchType === "id") return idMatch;
      if (searchType === "phone") return phoneMatch;
      return nameMatch || idMatch || phoneMatch;
    });

    const isBlacklisted = matchedBlacklist.length > 0 && matchedBlacklist.some(e => e.status === "active");

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
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Client Lookup</h1>
          <p className="text-muted-foreground">
            Search clients by name, ID number, or phone number. Automatically checks against blacklist.
          </p>
        </div>
        <Link href="/admin/blacklist">
          <Button variant="outline" className="gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            View Full Blacklist
          </Button>
        </Link>
      </div>

      {/* Search Section */}
      <Card className="border-indigo-200 dark:border-indigo-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Search className="h-5 w-5" />
            Search Client
          </CardTitle>
          <CardDescription>
            Enter client details to search. The system will automatically check against the blacklist database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex gap-2">
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
                ID Number
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
            </div>
            <div className="flex flex-1 gap-2">
              <Input
                placeholder={
                  searchType === "name"
                    ? "Enter client name..."
                    : searchType === "id"
                    ? "Enter ID/Passport number..."
                    : "Enter phone number..."
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
        </CardContent>
      </Card>

      {/* Fingerprint Scan Section */}
      <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Fingerprint className="h-5 w-5" />
            Biometric Verification
          </CardTitle>
          <CardDescription>
            Use fingerprint scanner for instant client identification and blacklist verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6">
            {/* Fingerprint Scanner Visual */}
            <div 
              className={`relative w-40 h-40 rounded-2xl border-4 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                fingerprintStatus === "idle" 
                  ? "border-emerald-300 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-900/50 hover:border-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900"
                  : fingerprintStatus === "scanning"
                  ? "border-blue-400 bg-blue-100 dark:bg-blue-900/50 animate-pulse"
                  : fingerprintStatus === "success"
                  ? "border-green-500 bg-green-100 dark:bg-green-900/50"
                  : fingerprintStatus === "failed"
                  ? "border-red-500 bg-red-100 dark:bg-red-900/50"
                  : "border-yellow-500 bg-yellow-100 dark:bg-yellow-900/50"
              }`}
              onClick={!isFingerprintScanning ? handleFingerprintScan : undefined}
            >
              {/* Scanning Animation Rings */}
              {fingerprintStatus === "scanning" && (
                <>
                  <div className="absolute inset-4 rounded-xl border-2 border-blue-400 animate-ping opacity-75" />
                  <div className="absolute inset-8 rounded-lg border-2 border-blue-300 animate-ping opacity-50" style={{ animationDelay: "0.2s" }} />
                </>
              )}
              
              {/* Fingerprint Icon */}
              <Fingerprint 
                className={`h-20 w-20 transition-colors duration-300 ${
                  fingerprintStatus === "idle" 
                    ? "text-emerald-500"
                    : fingerprintStatus === "scanning"
                    ? "text-blue-500 animate-pulse"
                    : fingerprintStatus === "success"
                    ? "text-green-500"
                    : fingerprintStatus === "failed"
                    ? "text-red-500"
                    : "text-yellow-500"
                }`} 
              />

              {/* Status Overlay Icons */}
              {fingerprintStatus === "success" && (
                <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-1">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
              )}
              {fingerprintStatus === "failed" && (
                <div className="absolute bottom-2 right-2 bg-red-500 rounded-full p-1">
                  <X className="h-5 w-5 text-white" />
                </div>
              )}
              {fingerprintStatus === "not-found" && (
                <div className="absolute bottom-2 right-2 bg-yellow-500 rounded-full p-1">
                  <HelpCircle className="h-5 w-5 text-white" />
                </div>
              )}
            </div>

            {/* Status Text */}
            <div className="text-center">
              {fingerprintStatus === "idle" && (
                <p className="text-muted-foreground">
                  Click the scanner or place finger on device to scan
                </p>
              )}
              {fingerprintStatus === "scanning" && (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="font-medium">Scanning fingerprint...</span>
                </div>
              )}
              {fingerprintStatus === "success" && (
                <p className="text-green-600 dark:text-green-400 font-medium">
                  Fingerprint matched successfully!
                </p>
              )}
              {fingerprintStatus === "failed" && (
                <p className="text-red-600 dark:text-red-400 font-medium">
                  Scan failed. Please try again.
                </p>
              )}
              {fingerprintStatus === "not-found" && (
                <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                  No matching fingerprint found in system.
                </p>
              )}
            </div>

            {/* Scan Button */}
            <Button
              onClick={handleFingerprintScan}
              disabled={isFingerprintScanning}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              {isFingerprintScanning ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Fingerprint className="h-5 w-5" />
                  Start Fingerprint Scan
                </>
              )}
            </Button>

            {/* Info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldAlert className="h-4 w-4 text-emerald-500" />
              <span>Fingerprints are securely stored and encrypted</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-6">
          {/* Blacklist Alert */}
          {searchResults.isBlacklisted && (
            <Card className="border-red-500 bg-red-500/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-red-500 p-3">
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
            <Card className="border-green-500/50 bg-green-500/10">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="rounded-full bg-green-500/20 p-3">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-600 dark:text-green-400">No Negative Records Found</h3>
                      <p className="text-muted-foreground">
                        This person has no blacklist records. Safe to register as a new client or proceed with services.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button 
                      onClick={openRegisterDialog}
                      className="bg-green-600 hover:bg-green-700 gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Register New Client
                    </Button>
                    <Link href="/admin/car-rental/new">
                      <Button variant="outline" className="gap-2 w-full border-indigo-500 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950">
                        <Car className="h-4 w-4" />
                        Start Car Rental
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clear Status (Not Blacklisted) */}
          {!searchResults.isBlacklisted && (searchResults.client || searchResults.blacklistEntries.length > 0) && (
            <Card className="border-green-500/50 bg-green-500/10">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="font-semibold text-green-500">Client Status: CLEAR</h3>
                      <p className="text-muted-foreground">
                        No active blacklist records found for this client. Safe to proceed with services.
                      </p>
                    </div>
                  </div>
                  <Link href="/admin/car-rental/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                      <Car className="h-4 w-4" />
                      Start Car Rental
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Client Information */}
            {searchResults.client && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-green-500" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20">
                      <User className="h-8 w-8 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{searchResults.client.fullName}</h3>
                      <p className="text-sm text-muted-foreground">Client since {searchResults.client.createdAt}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm">
                      <IdCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-medium">{searchResults.client.idNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{searchResults.client.phone}</span>
                    </div>
                    {searchResults.client.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{searchResults.client.email}</span>
                      </div>
                    )}
                    {searchResults.client.kraPin && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">KRA PIN:</span>
                        <span className="font-medium">{searchResults.client.kraPin}</span>
                      </div>
                    )}
                    {searchResults.client.residence && (
                      <div className="flex items-center gap-2 text-sm sm:col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Residence:</span>
                        <span className="font-medium">{searchResults.client.residence}</span>
                      </div>
                    )}
                    {searchResults.client.placeOfWork && (
                      <div className="flex items-center gap-2 text-sm sm:col-span-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Employer:</span>
                        <span className="font-medium">{searchResults.client.placeOfWork}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Client Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="rounded-lg bg-blue-500/10 p-3">
                      <p className="text-2xl font-bold text-blue-500">{searchResults.client.totalBookings}</p>
                      <p className="text-xs text-muted-foreground">Total Bookings</p>
                    </div>
                    <div className="rounded-lg bg-green-500/10 p-3">
                      <p className="text-lg font-bold text-green-500">{formatCurrency(searchResults.client.totalSpent)}</p>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                    </div>
                    <div className="rounded-lg bg-amber-500/10 p-3">
                      <p className="text-sm font-bold text-amber-500">{searchResults.client.lastBookingDate || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">Last Booking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                            entry.status === "active" ? "border-red-500/50 bg-red-500/5" : "border-muted"
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
                                className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
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
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : txn.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
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
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
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
                <div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/50 p-4 shadow-sm">
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
                <div className="rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/50 p-4 shadow-sm">
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
                        <FormControl><Input type="date" {...field} /></FormControl>
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
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
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
              <div className="rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/50 p-4 shadow-sm">
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
