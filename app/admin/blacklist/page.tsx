"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ShieldAlert,
  Plus,
  Search,
  AlertTriangle,
  User,
  Phone,
  CreditCard,
  Calendar,
  MapPin,
  FileText,
  Trash2,
  Edit,
  Eye,
  X,
  Car,
  Ban,
  AlertOctagon,
  Fingerprint,
  Upload,
  IdCard,
  Banknote,
  Skull,
  Syringe,
  Sword,
  CircleAlert,
  HelpCircle,
  Hammer,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { FileUpload } from "@/components/forms/file-upload";

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

// Types
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
  // Document URLs
  idFrontUrl?: string;
  idBackUrl?: string;
  drivingLicenseFrontUrl?: string;
  drivingLicenseBackUrl?: string;
  policeReportUrl?: string;
  status: "active" | "resolved" | "under-review";
  createdAt: string;
  updatedAt: string;
}

// Form schema
const blacklistFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  idNumber: z.string().min(6, "Valid ID number is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  drivingLicenseNumber: z.string().optional(),
  kraPin: z.string().optional(),
  residence: z.string().optional(),
  recordType: z.enum(["theft", "fraud", "damage", "non-payment", "accident", "drug-related", "violent-dangerous", "suspicious", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(20, "Please provide a detailed description (min 20 characters)"),
  incidentDate: z.string().min(1, "Incident date is required"),
  vehicleInvolved: z.string().optional(),
  amountOwed: z.string().optional(),
  policeReportNumber: z.string().optional(),
  // Document uploads
  idFrontUrl: z.string().optional(),
  idBackUrl: z.string().optional(),
  drivingLicenseFrontUrl: z.string().optional(),
  drivingLicenseBackUrl: z.string().optional(),
  policeReportUrl: z.string().optional(),
});

type BlacklistFormValues = z.infer<typeof blacklistFormSchema>;

const severityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  medium: { label: "Medium", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  high: { label: "High", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  critical: { label: "Critical", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  resolved: { label: "Resolved", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  "under-review": { label: "Under Review", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

// Blacklist data
const initialBlacklistData: BlacklistEntry[] = [
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

export default function BlacklistPage() {
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>(initialBlacklistData);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<BlacklistEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<BlacklistEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BlacklistFormValues>({
    resolver: zodResolver(blacklistFormSchema),
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
      idFrontUrl: "",
      idBackUrl: "",
      drivingLicenseFrontUrl: "",
      drivingLicenseBackUrl: "",
      policeReportUrl: "",
    },
  });

  const editForm = useForm<BlacklistFormValues>({
    resolver: zodResolver(blacklistFormSchema),
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
      idFrontUrl: "",
      idBackUrl: "",
      drivingLicenseFrontUrl: "",
      drivingLicenseBackUrl: "",
      policeReportUrl: "",
    },
  });

  // Filter blacklist entries
  const filteredBlacklist = blacklist.filter((entry) => {
    const matchesSearch =
      entry.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.idNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.phoneNumber.includes(searchQuery) ||
      entry.drivingLicenseNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || entry.recordType === filterType;
    const matchesSeverity = filterSeverity === "all" || entry.severity === filterSeverity;
    const matchesStatus = filterStatus === "all" || entry.status === filterStatus;

    return matchesSearch && matchesType && matchesSeverity && matchesStatus;
  });

  // Stats
  const stats = {
    total: blacklist.length,
    active: blacklist.filter((e) => e.status === "active").length,
    critical: blacklist.filter((e) => e.severity === "critical").length,
    totalOwed: blacklist.reduce((sum, e) => sum + (e.amountOwed || 0), 0),
  };

  const onSubmit = async (data: BlacklistFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newEntry: BlacklistEntry = {
        id: `BL${String(blacklist.length + 1).padStart(3, "0")}`,
        ...data,
        email: data.email || undefined,
        amountOwed: data.amountOwed ? parseFloat(data.amountOwed) : undefined,
        reportedBy: "Admin",
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };

      setBlacklist([newEntry, ...blacklist]);
      setIsAddDialogOpen(false);
      form.reset();
      toast.success("Blacklist entry added successfully");
    } catch {
      toast.error("Failed to add blacklist entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setBlacklist(blacklist.filter((entry) => entry.id !== id));
    toast.success("Blacklist entry removed");
  };

  const handleStatusChange = (id: string, newStatus: BlacklistEntry["status"]) => {
    setBlacklist(
      blacklist.map((entry) =>
        entry.id === id
          ? { ...entry, status: newStatus, updatedAt: new Date().toISOString().split("T")[0] }
          : entry
      )
    );
    toast.success(`Status updated to ${statusConfig[newStatus].label}`);
  };

  const handleEdit = (entry: BlacklistEntry) => {
    setEditingEntry(entry);
    editForm.reset({
      fullName: entry.fullName,
      idNumber: entry.idNumber,
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
      idFrontUrl: entry.idFrontUrl || "",
      idBackUrl: entry.idBackUrl || "",
      drivingLicenseFrontUrl: entry.drivingLicenseFrontUrl || "",
      drivingLicenseBackUrl: entry.drivingLicenseBackUrl || "",
      policeReportUrl: entry.policeReportUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  const onEditSubmit = async (data: BlacklistFormValues) => {
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

      setBlacklist(
        blacklist.map((entry) =>
          entry.id === editingEntry.id ? updatedEntry : entry
        )
      );
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-red-500" />
            Client Blacklist
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage clients with negative records to prevent future issues
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add to Blacklist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="h-5 w-5" />
                Add Client to Blacklist
              </DialogTitle>
              <DialogDescription>
                Enter the client details and incident information. All blacklisted entries will be
                checked during new bookings.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 p-4">
                  <h4 className="font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 dark:text-gray-200">Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Kamau Mwangi" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="idNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 dark:text-gray-200">ID/Passport Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="12345678" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 dark:text-gray-200">Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="0712345678" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 dark:text-gray-200">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@example.com" type="email" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="drivingLicenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 dark:text-gray-200">Driving License Number</FormLabel>
                          <FormControl>
                            <Input placeholder="DL123456" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kraPin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 dark:text-gray-200">KRA PIN</FormLabel>
                          <FormControl>
                            <Input placeholder="A012345678B" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="residence"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="text-gray-800 dark:text-gray-200">Residence/Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Westlands, Nairobi" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Incident Details */}
                <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20 p-4">
                  <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <AlertTriangle className="h-4 w-4" />
                    Incident Details
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="recordType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 dark:text-gray-200">Record Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="theft">Theft</SelectItem>
                              <SelectItem value="fraud">Fraud</SelectItem>
                              <SelectItem value="damage">Vehicle Damage</SelectItem>
                              <SelectItem value="non-payment">Non-Payment</SelectItem>
                              <SelectItem value="accident">Accident</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 dark:text-gray-200">Severity *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
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
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="incidentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 dark:text-gray-200">Incident Date *</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")}
                              placeholder="Select incident date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vehicleInvolved"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 dark:text-gray-200">Vehicle Involved</FormLabel>
                          <FormControl>
                            <Input placeholder="Toyota Prado KCX 123A" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amountOwed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 dark:text-gray-200">Amount Owed (KES)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="150000" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="policeReportNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 dark:text-gray-200">Police Report Number</FormLabel>
                          <FormControl>
                            <Input placeholder="OB/123/2024" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                            If a police report was filed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="text-gray-800 dark:text-gray-200">Detailed Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide a detailed account of the incident, including dates, amounts, and any relevant circumstances..."
                              className="min-h-[100px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                            Be as detailed as possible for future reference
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Supporting Documents */}
                <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Upload className="h-4 w-4" />
                    Supporting Documents
                  </h4>
                  
                  {/* ID Document Uploads */}
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-3 flex items-center gap-2">
                      <IdCard className="h-4 w-4" />
                      National ID / Passport
                    </h5>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="idFrontUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FileUpload
                              id="blacklist-id-front"
                              label="ID Front Side"
                              accept="image/*,.pdf"
                              maxSize={5}
                              value={field.value || null}
                              onChange={(url) => field.onChange(url || "")}
                              showCamera
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="idBackUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FileUpload
                              id="blacklist-id-back"
                              label="ID Back Side"
                              accept="image/*,.pdf"
                              maxSize={5}
                              value={field.value || null}
                              onChange={(url) => field.onChange(url || "")}
                              showCamera
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Driving License Uploads */}
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Driving License
                    </h5>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="drivingLicenseFrontUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FileUpload
                              id="blacklist-dl-front"
                              label="License Front Side"
                              accept="image/*,.pdf"
                              maxSize={5}
                              value={field.value || null}
                              onChange={(url) => field.onChange(url || "")}
                              showCamera
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="drivingLicenseBackUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FileUpload
                              id="blacklist-dl-back"
                              label="License Back Side"
                              accept="image/*,.pdf"
                              maxSize={5}
                              value={field.value || null}
                              onChange={(url) => field.onChange(url || "")}
                              showCamera
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Police Report Upload */}
                  <div>
                    <h5 className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Police Report (OB)
                    </h5>
                    <FormField
                      control={form.control}
                      name="policeReportUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FileUpload
                            id="blacklist-police-report"
                            label="Police Report / OB Document"
                            accept="image/*,.pdf"
                            maxSize={10}
                            value={field.value || null}
                            onChange={(url) => field.onChange(url || "")}
                            showCamera
                          />
                          <FormDescription className="text-xs text-blue-500">
                            Upload scanned copy of police report or OB extract
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add to Blacklist"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-300">Total Blacklisted</CardTitle>
            <ShieldAlert className="h-5 w-5 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-100">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-300">Active Cases</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-100">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-300">Critical Severity</CardTitle>
            <AlertOctagon className="h-5 w-5 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-100">{stats.critical}</div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-300">Total Amount Owed</CardTitle>
            <CreditCard className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-100">
              KES {stats.totalOwed.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, phone, or license..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="theft">Theft</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="damage">Damage</SelectItem>
                  <SelectItem value="non-payment">Non-Payment</SelectItem>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blacklist Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Blacklist Records</CardTitle>
          <CardDescription>
            {filteredBlacklist.length} record(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Client</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Record Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Amount Owed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBlacklist.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No blacklist records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBlacklist.map((entry) => {
                    const TypeIcon = recordTypeConfig[entry.recordType].icon;
                    return (
                      <TableRow key={entry.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                              <User className="h-5 w-5 text-red-400" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{entry.fullName}</p>
                              <p className="text-sm text-muted-foreground">{entry.phoneNumber}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{entry.idNumber}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${recordTypeConfig[entry.recordType].color} ${recordTypeConfig[entry.recordType].bgColor} gap-1.5 font-medium`}
                          >
                            <TypeIcon className="h-3.5 w-3.5" />
                            {recordTypeConfig[entry.recordType].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={severityConfig[entry.severity].color}>
                            {severityConfig[entry.severity].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {entry.amountOwed ? (
                            <span className="font-semibold text-red-400">
                              KES {entry.amountOwed.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={entry.status}
                            onValueChange={(value: BlacklistEntry["status"]) =>
                              handleStatusChange(entry.id, value)
                            }
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <Badge className={statusConfig[entry.status].color}>
                                {statusConfig[entry.status].label}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="under-review">Under Review</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedEntry(entry);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                              onClick={() => handleEdit(entry)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove from Blacklist?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {entry.fullName} from the
                                    blacklist? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(entry.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              Blacklist Entry Details
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="rounded-lg border-2 border-red-300 dark:border-red-600 bg-white dark:bg-gray-800 p-4">
                <h4 className="font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Personal Information
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Full Name:</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{selectedEntry.fullName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">ID Number:</span>
                    <p className="font-mono font-semibold text-gray-900 dark:text-white mt-0.5">{selectedEntry.idNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Phone:</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{selectedEntry.phoneNumber}</p>
                  </div>
                  {selectedEntry.email && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-300 font-medium">Email:</span>
                      <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{selectedEntry.email}</p>
                    </div>
                  )}
                  {selectedEntry.drivingLicenseNumber && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-300 font-medium">License:</span>
                      <p className="font-mono font-semibold text-gray-900 dark:text-white mt-0.5">{selectedEntry.drivingLicenseNumber}</p>
                    </div>
                  )}
                  {selectedEntry.kraPin && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-300 font-medium">KRA PIN:</span>
                      <p className="font-mono font-semibold text-gray-900 dark:text-white mt-0.5">{selectedEntry.kraPin}</p>
                    </div>
                  )}
                  {selectedEntry.residence && (
                    <div className="sm:col-span-2">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">Residence:</span>
                      <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{selectedEntry.residence}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Incident Info */}
              <div className="rounded-lg border-2 border-orange-300 dark:border-orange-600 bg-white dark:bg-gray-800 p-4">
                <h4 className="font-bold text-orange-600 dark:text-orange-400 mb-3 flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4" />
                  Incident Details
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Record Type:</span>
                    <div className="mt-1">
                      <Badge className={recordTypeConfig[selectedEntry.recordType].color}>
                        {recordTypeConfig[selectedEntry.recordType].label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Severity:</span>
                    <div className="mt-1">
                      <Badge className={severityConfig[selectedEntry.severity].color}>
                        {severityConfig[selectedEntry.severity].label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Incident Date:</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{new Date(selectedEntry.incidentDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Status:</span>
                    <div className="mt-1">
                      <Badge className={statusConfig[selectedEntry.status].color}>
                        {statusConfig[selectedEntry.status].label}
                      </Badge>
                    </div>
                  </div>
                  {selectedEntry.vehicleInvolved && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-300 font-medium">Vehicle:</span>
                      <p className="font-mono font-semibold text-gray-900 dark:text-white mt-0.5">{selectedEntry.vehicleInvolved}</p>
                    </div>
                  )}
                  {selectedEntry.amountOwed && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-300 font-medium">Amount Owed:</span>
                      <p className="font-bold text-red-600 dark:text-red-400 mt-0.5">
                        KES {selectedEntry.amountOwed.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedEntry.policeReportNumber && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-300 font-medium">Police Report:</span>
                      <p className="font-mono font-semibold text-gray-900 dark:text-white mt-0.5">{selectedEntry.policeReportNumber}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Reported By:</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{selectedEntry.reportedBy}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Description:</span>
                    <p className="mt-1 font-medium text-gray-900 dark:text-white leading-relaxed">{selectedEntry.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Created: {new Date(selectedEntry.createdAt).toLocaleDateString()}</span>
                <span>Updated: {new Date(selectedEntry.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <DialogTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Edit className="h-5 w-5" />
              Edit Blacklist Entry
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update information for this blacklist record. You can add new phone numbers, update crime types, or modify any other details.
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
                        <FormLabel className="text-gray-800 dark:text-gray-200">Full Name *</FormLabel>
                        <FormControl><Input placeholder="Full legal name" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="idNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 dark:text-gray-200">ID Number *</FormLabel>
                        <FormControl><Input placeholder="National ID number" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="phoneNumber" render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-gray-800 dark:text-gray-200">Phone Number(s) *</FormLabel>
                        <FormControl><Input placeholder="e.g., 0712345678 / 0723456789 (separate multiple with /)" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} /></FormControl>
                        <FormDescription className="text-xs text-blue-600 dark:text-blue-400">
                          Add multiple phone numbers separated by / if the person uses different numbers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 dark:text-gray-200">Email</FormLabel>
                        <FormControl><Input type="email" placeholder="email@example.com" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="drivingLicenseNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 dark:text-gray-200">Driving License</FormLabel>
                        <FormControl><Input placeholder="License number" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="kraPin" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 dark:text-gray-200">KRA PIN</FormLabel>
                        <FormControl><Input placeholder="KRA PIN" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="residence" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 dark:text-gray-200">Known Locations/Residence</FormLabel>
                        <FormControl><Input placeholder="e.g., Westlands / Kilimani / Karen" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} /></FormControl>
                        <FormDescription className="text-xs text-blue-600 dark:text-blue-400">
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
                        <FormLabel className="text-gray-800 dark:text-gray-200">Record Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
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
                        <FormLabel className="text-gray-800 dark:text-gray-200">Severity *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
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
                        <FormLabel className="text-gray-800 dark:text-gray-200">Incident Date *</FormLabel>
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
                        <FormLabel className="text-gray-800 dark:text-gray-200">Vehicle Involved</FormLabel>
                        <FormControl><Input placeholder="e.g., Toyota Prado KCX 123A" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="amountOwed" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 dark:text-gray-200">Amount Owed (KES)</FormLabel>
                        <FormControl><Input type="number" placeholder="0" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="policeReportNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 dark:text-gray-200">Police Report / OB Number</FormLabel>
                        <FormControl><Input placeholder="e.g., OB/123/2024" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="description" render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-gray-800 dark:text-gray-200">Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed description of the incident, additional crimes, aliases used, etc." 
                            className="min-h-[100px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-orange-600 dark:text-orange-400">
                          Include any new crimes, additional details, or updates to the original incident
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Document Uploads */}
                <div className="rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/50 p-4 shadow-sm">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Upload className="h-4 w-4" />
                    Supporting Documents
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={editForm.control} name="idFrontUrl" render={({ field }) => (
                      <FormItem>
                        <FileUpload
                          id="edit-id-front"
                          label="ID Front Side"
                          accept="image/*,.pdf"
                          maxSize={5}
                          value={field.value || null}
                          onChange={(url) => field.onChange(url || "")}
                          showCamera
                        />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="idBackUrl" render={({ field }) => (
                      <FormItem>
                        <FileUpload
                          id="edit-id-back"
                          label="ID Back Side"
                          accept="image/*,.pdf"
                          maxSize={5}
                          value={field.value || null}
                          onChange={(url) => field.onChange(url || "")}
                          showCamera
                        />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="drivingLicenseFrontUrl" render={({ field }) => (
                      <FormItem>
                        <FileUpload
                          id="edit-dl-front"
                          label="License Front Side"
                          accept="image/*,.pdf"
                          maxSize={5}
                          value={field.value || null}
                          onChange={(url) => field.onChange(url || "")}
                          showCamera
                        />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="drivingLicenseBackUrl" render={({ field }) => (
                      <FormItem>
                        <FileUpload
                          id="edit-dl-back"
                          label="License Back Side"
                          accept="image/*,.pdf"
                          maxSize={5}
                          value={field.value || null}
                          onChange={(url) => field.onChange(url || "")}
                          showCamera
                        />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="policeReportUrl" render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FileUpload
                          id="edit-police-report"
                          label="Police Report / OB Document"
                          accept="image/*,.pdf"
                          maxSize={10}
                          value={field.value || null}
                          onChange={(url) => field.onChange(url || "")}
                          showCamera
                        />
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
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
