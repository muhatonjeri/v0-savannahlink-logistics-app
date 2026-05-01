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
  recordType: "theft" | "fraud" | "damage" | "non-payment" | "accident" | "other";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  incidentDate: string;
  reportedBy: string;
  vehicleInvolved?: string;
  amountOwed?: number;
  policeReportNumber?: string;
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
  recordType: z.enum(["theft", "fraud", "damage", "non-payment", "accident", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(20, "Please provide a detailed description (min 20 characters)"),
  incidentDate: z.string().min(1, "Incident date is required"),
  vehicleInvolved: z.string().optional(),
  amountOwed: z.string().optional(),
  policeReportNumber: z.string().optional(),
});

type BlacklistFormValues = z.infer<typeof blacklistFormSchema>;

// Record type configuration
const recordTypeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  theft: { label: "Theft", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertOctagon },
  fraud: { label: "Fraud", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: Ban },
  damage: { label: "Vehicle Damage", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Car },
  "non-payment": { label: "Non-Payment", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: CreditCard },
  accident: { label: "Accident", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: AlertTriangle },
  other: { label: "Other", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: FileText },
};

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

// Mock data for demonstration
const initialBlacklistData: BlacklistEntry[] = [
  {
    id: "BL001",
    fullName: "John Kamau Mwangi",
    idNumber: "12345678",
    phoneNumber: "0712345678",
    email: "john.kamau@email.com",
    drivingLicenseNumber: "DL123456",
    kraPin: "A012345678B",
    residence: "Westlands, Nairobi",
    recordType: "theft",
    severity: "critical",
    description: "Customer rented Toyota Prado KCX 123A and failed to return. Vehicle was later found stripped in Eastleigh. Police report filed.",
    incidentDate: "2024-01-15",
    reportedBy: "Admin",
    vehicleInvolved: "Toyota Prado KCX 123A",
    amountOwed: 2500000,
    policeReportNumber: "OB/123/2024",
    status: "active",
    createdAt: "2024-01-20",
    updatedAt: "2024-01-20",
  },
  {
    id: "BL002",
    fullName: "Mary Wanjiku Njeri",
    idNumber: "23456789",
    phoneNumber: "0723456789",
    drivingLicenseNumber: "DL234567",
    residence: "Kilimani, Nairobi",
    recordType: "non-payment",
    severity: "high",
    description: "Customer accumulated rental charges of KES 150,000 over 2 months and disappeared without payment. Multiple contact attempts failed.",
    incidentDate: "2024-02-10",
    reportedBy: "Finance",
    vehicleInvolved: "Mazda CX-5 KDG 456B",
    amountOwed: 150000,
    status: "active",
    createdAt: "2024-02-15",
    updatedAt: "2024-02-15",
  },
  {
    id: "BL003",
    fullName: "Peter Ochieng Otieno",
    idNumber: "34567890",
    phoneNumber: "0734567890",
    drivingLicenseNumber: "DL345678",
    residence: "Kisumu",
    recordType: "damage",
    severity: "medium",
    description: "Customer returned vehicle with significant underbody damage not reported during rental. Refused to pay for repairs claiming it was pre-existing.",
    incidentDate: "2024-03-05",
    reportedBy: "Fleet Manager",
    vehicleInvolved: "Nissan X-Trail KDA 789C",
    amountOwed: 85000,
    status: "under-review",
    createdAt: "2024-03-08",
    updatedAt: "2024-03-10",
  },
];

export default function BlacklistPage() {
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>(initialBlacklistData);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<BlacklistEntry | null>(null);
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
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Kamau Mwangi" {...field} />
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
                          <FormLabel>ID/Passport Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="12345678" {...field} />
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
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="0712345678" {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@example.com" type="email" {...field} />
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
                          <FormLabel>Driving License Number</FormLabel>
                          <FormControl>
                            <Input placeholder="DL123456" {...field} />
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
                          <FormLabel>KRA PIN</FormLabel>
                          <FormControl>
                            <Input placeholder="A012345678B" {...field} />
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
                          <FormLabel>Residence/Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Westlands, Nairobi" {...field} />
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
                          <FormLabel>Record Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
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
                          <FormLabel>Severity *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="incidentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Incident Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
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
                          <FormLabel>Vehicle Involved</FormLabel>
                          <FormControl>
                            <Input placeholder="Toyota Prado KCX 123A" {...field} />
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
                          <FormLabel>Amount Owed (KES)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="150000" {...field} />
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
                          <FormLabel>Police Report Number</FormLabel>
                          <FormControl>
                            <Input placeholder="OB/123/2024" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
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
                          <FormLabel>Detailed Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide a detailed account of the incident, including dates, amounts, and any relevant circumstances..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Be as detailed as possible for future reference
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
                          <Badge className={`${recordTypeConfig[entry.recordType].color} gap-1`}>
                            <TypeIcon className="h-3 w-3" />
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              Blacklist Entry Details
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 p-4">
                <h4 className="font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Full Name:</span>
                    <p className="font-medium">{selectedEntry.fullName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ID Number:</span>
                    <p className="font-mono">{selectedEntry.idNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p>{selectedEntry.phoneNumber}</p>
                  </div>
                  {selectedEntry.email && (
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p>{selectedEntry.email}</p>
                    </div>
                  )}
                  {selectedEntry.drivingLicenseNumber && (
                    <div>
                      <span className="text-muted-foreground">License:</span>
                      <p className="font-mono">{selectedEntry.drivingLicenseNumber}</p>
                    </div>
                  )}
                  {selectedEntry.kraPin && (
                    <div>
                      <span className="text-muted-foreground">KRA PIN:</span>
                      <p className="font-mono">{selectedEntry.kraPin}</p>
                    </div>
                  )}
                  {selectedEntry.residence && (
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground">Residence:</span>
                      <p>{selectedEntry.residence}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Incident Info */}
              <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20 p-4">
                <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Incident Details
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Record Type:</span>
                    <div className="mt-1">
                      <Badge className={recordTypeConfig[selectedEntry.recordType].color}>
                        {recordTypeConfig[selectedEntry.recordType].label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Severity:</span>
                    <div className="mt-1">
                      <Badge className={severityConfig[selectedEntry.severity].color}>
                        {severityConfig[selectedEntry.severity].label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Incident Date:</span>
                    <p>{new Date(selectedEntry.incidentDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="mt-1">
                      <Badge className={statusConfig[selectedEntry.status].color}>
                        {statusConfig[selectedEntry.status].label}
                      </Badge>
                    </div>
                  </div>
                  {selectedEntry.vehicleInvolved && (
                    <div>
                      <span className="text-muted-foreground">Vehicle:</span>
                      <p className="font-mono">{selectedEntry.vehicleInvolved}</p>
                    </div>
                  )}
                  {selectedEntry.amountOwed && (
                    <div>
                      <span className="text-muted-foreground">Amount Owed:</span>
                      <p className="font-semibold text-red-500">
                        KES {selectedEntry.amountOwed.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedEntry.policeReportNumber && (
                    <div>
                      <span className="text-muted-foreground">Police Report:</span>
                      <p className="font-mono">{selectedEntry.policeReportNumber}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Reported By:</span>
                    <p>{selectedEntry.reportedBy}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">Description:</span>
                    <p className="mt-1 text-foreground">{selectedEntry.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
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
    </div>
  );
}
