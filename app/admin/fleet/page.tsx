"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInDays, addDays, isPast, isToday } from "date-fns";
import {
  Car,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Bell,
  Calendar,
  User,
  Phone,
  FileText,
  Wrench,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  CarFront,
  BadgeCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DatePicker } from "@/components/ui/date-picker";

// Vehicle makes and models data
const vehicleData = [
  { make: "Toyota", models: ["Land Cruiser V8", "Land Cruiser Prado", "Fortuner", "Hilux", "RAV4", "Corolla", "Camry", "Fielder", "Premio", "Axio", "Vitz", "Noah", "Voxy", "Alphard", "Harrier", "C-HR", "Hiace"] },
  { make: "Nissan", models: ["X-Trail", "Patrol", "Navara", "Note", "Juke", "Qashqai", "Serena", "Tiida", "Wingroad", "Murano", "Pathfinder", "Caravan"] },
  { make: "Honda", models: ["CR-V", "HR-V", "Vezel", "Fit", "Civic", "Accord", "Odyssey", "Stepwagon", "Jazz"] },
  { make: "Mazda", models: ["CX-5", "CX-3", "CX-7", "Demio", "Axela", "Atenza", "BT-50", "MPV"] },
  { make: "Subaru", models: ["Forester", "Outback", "XV", "Impreza", "Legacy", "Levorg", "WRX"] },
  { make: "Mercedes-Benz", models: ["E-Class", "C-Class", "S-Class", "GLE", "GLC", "GLA", "A-Class", "V-Class", "Sprinter"] },
  { make: "BMW", models: ["X5", "X3", "X1", "3 Series", "5 Series", "7 Series", "X6", "X7"] },
  { make: "Audi", models: ["Q7", "Q5", "Q3", "A4", "A6", "A3", "A8", "e-tron"] },
  { make: "Land Rover", models: ["Range Rover", "Range Rover Sport", "Discovery", "Defender", "Evoque", "Velar"] },
  { make: "Mitsubishi", models: ["Pajero", "Outlander", "L200", "ASX", "Eclipse Cross", "Delica", "Colt", "Rosa Bus"] },
  { make: "Isuzu", models: ["D-Max", "MU-X", "Trooper", "NQR", "FRR", "NPR"] },
  { make: "Volkswagen", models: ["Tiguan", "Touareg", "Golf", "Passat", "Polo", "T-Cross", "Amarok", "Transporter"] },
  { make: "Ford", models: ["Ranger", "Everest", "Explorer", "Escape", "F-150", "Transit"] },
  { make: "Jeep", models: ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Renegade"] },
  { make: "Suzuki", models: ["Jimny", "Vitara", "Swift", "Alto", "Escudo", "S-Cross"] },
  { make: "Hyundai", models: ["Tucson", "Santa Fe", "Creta", "Elantra", "Sonata", "Palisade", "H-1", "County Bus"] },
  { make: "Kia", models: ["Sportage", "Sorento", "Seltos", "Carnival", "Picanto", "Rio", "Cerato"] },
  { make: "Peugeot", models: ["3008", "5008", "2008", "508", "308", "Partner"] },
  { make: "Porsche", models: ["Cayenne", "Macan", "Panamera", "911", "Taycan"] },
  { make: "Scania", models: ["R-Series", "P-Series", "G-Series", "S-Series"] },
  { make: "MAN", models: ["TGX", "TGS", "TGM", "TGL", "Lions Coach"] },
  { make: "Hino", models: ["300 Series", "500 Series", "700 Series"] },
  { make: "Fuso", models: ["Fighter", "Canter", "Super Great", "Rosa"] },
];

// Color options for vehicles
const colorOptions = ["White", "Black", "Silver", "Gray", "Blue", "Red", "Green", "Beige", "Brown", "Orange", "Yellow", "Maroon", "Navy Blue", "Champagne"];

// Types
interface FleetVehicle {
  id: string;
  vehicleName: string;
  vehicleMake: string;
  vehicleModel: string;
  registrationNo: string;
  vehicleType: "sedan" | "suv" | "van" | "truck" | "bus" | "pickup" | "motorcycle";
  fuelType: "petrol" | "diesel" | "electric" | "hybrid";
  year: number;
  color: string;
  status: "available" | "assigned" | "maintenance" | "out-of-service";
  // Assignment details
  assignedStaffName?: string;
  assignedStaffPhone?: string;
  assignmentPurpose?: string;
  dateOut?: string;
  expectedDateIn?: string;
  actualDateIn?: string;
  // Maintenance
  lastServiceDate?: string;
  nextServiceDate?: string;
  nextServiceMileage?: number;
  serviceInterval?: number;
  currentMileage?: number;
  // Metadata
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: string;
  vehicleId: string;
  vehicleName: string;
  registrationNo: string;
  type: "overdue" | "due-soon" | "service-due" | "service-overdue";
  message: string;
  priority: "low" | "medium" | "high" | "critical";
  daysOverdue?: number;
  createdAt: string;
}

// Form schema
const fleetFormSchema = z.object({
  vehicleName: z.string().min(2, "Vehicle name is required"),
  vehicleMake: z.string().min(2, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  registrationNo: z.string().min(4, "Valid registration number is required"),
  vehicleType: z.enum(["sedan", "suv", "van", "truck", "bus", "pickup", "motorcycle"]),
  fuelType: z.enum(["petrol", "diesel", "electric", "hybrid"]),
  year: z.string().min(4, "Year is required"),
  color: z.string().min(2, "Color is required"),
  currentMileage: z.string().optional(),
  serviceInterval: z.string().optional(),
  lastServiceDate: z.string().optional(),
  nextServiceDate: z.string().optional(),
  nextServiceMileage: z.string().optional(),
  notes: z.string().optional(),
});

const assignmentFormSchema = z.object({
  assignedStaffName: z.string().min(2, "Staff name is required"),
  assignedStaffPhone: z.string().min(10, "Valid phone number is required"),
  assignmentPurpose: z.string().min(5, "Assignment purpose is required"),
  dateOut: z.string().min(1, "Date out is required"),
  numberOfDays: z.string().optional(),
  expectedDateIn: z.string().min(1, "Expected return date is required"),
});

// Mock data
const mockFleetData: FleetVehicle[] = [
  {
    id: "1",
    vehicleName: "Safari Cruiser 1",
    vehicleMake: "Toyota",
    vehicleModel: "Land Cruiser V8",
    registrationNo: "KDA 123A",
    vehicleType: "suv",
    fuelType: "diesel",
    year: 2022,
    color: "White",
    status: "assigned",
    assignedStaffName: "John Kamau",
    assignedStaffPhone: "0722123456",
    assignmentPurpose: "Masai Mara Safari Tour",
    dateOut: "2024-01-15",
    expectedDateIn: "2024-01-20",
    lastServiceDate: "2024-01-01",
    nextServiceDate: "2024-04-01",
    currentMileage: 45000,
    nextServiceMileage: 50000,
    createdAt: "2023-06-01",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    vehicleName: "Executive Sedan 1",
    vehicleMake: "Mercedes-Benz",
    vehicleModel: "E-Class",
    registrationNo: "KDB 456B",
    vehicleType: "sedan",
    fuelType: "petrol",
    year: 2023,
    color: "Black",
    status: "available",
    lastServiceDate: "2024-01-10",
    nextServiceDate: "2024-04-10",
    currentMileage: 15000,
    nextServiceMileage: 20000,
    createdAt: "2023-08-15",
    updatedAt: "2024-01-10",
  },
  {
    id: "3",
    vehicleName: "Cargo Van 1",
    vehicleMake: "Isuzu",
    vehicleModel: "NQR",
    registrationNo: "KDC 789C",
    vehicleType: "van",
    fuelType: "diesel",
    year: 2021,
    color: "White",
    status: "assigned",
    assignedStaffName: "Peter Ochieng",
    assignedStaffPhone: "0733987654",
    assignmentPurpose: "Office Relocation - Westlands to Karen",
    dateOut: "2024-01-10",
    expectedDateIn: "2024-01-12",
    lastServiceDate: "2023-12-15",
    nextServiceDate: "2024-01-20",
    currentMileage: 78000,
    nextServiceMileage: 80000,
    createdAt: "2022-03-20",
    updatedAt: "2024-01-10",
  },
  {
    id: "4",
    vehicleName: "Tour Bus 1",
    vehicleMake: "Scania",
    vehicleModel: "K360",
    registrationNo: "KDD 012D",
    vehicleType: "bus",
    fuelType: "diesel",
    year: 2020,
    color: "Blue",
    status: "maintenance",
    lastServiceDate: "2024-01-05",
    nextServiceDate: "2024-02-05",
    currentMileage: 120000,
    nextServiceMileage: 125000,
    notes: "Engine overhaul in progress",
    createdAt: "2020-11-10",
    updatedAt: "2024-01-05",
  },
  {
    id: "5",
    vehicleName: "Airport Shuttle 1",
    vehicleMake: "Toyota",
    vehicleModel: "HiAce",
    registrationNo: "KDE 345E",
    vehicleType: "van",
    fuelType: "diesel",
    year: 2022,
    color: "Silver",
    status: "assigned",
    assignedStaffName: "Mary Wanjiku",
    assignedStaffPhone: "0711456789",
    assignmentPurpose: "JKIA Airport Transfer",
    dateOut: "2024-01-18",
    expectedDateIn: "2024-01-18",
    lastServiceDate: "2023-12-20",
    nextServiceDate: "2024-03-20",
    currentMileage: 35000,
    nextServiceMileage: 40000,
    createdAt: "2022-07-05",
    updatedAt: "2024-01-18",
  },
];

// Generate notifications from fleet data
function generateNotifications(fleet: FleetVehicle[]): Notification[] {
  const notifications: Notification[] = [];
  const today = new Date();

  fleet.forEach((vehicle) => {
    // Check for overdue returns
    if (vehicle.status === "assigned" && vehicle.expectedDateIn) {
      const expectedDate = new Date(vehicle.expectedDateIn);
      const daysOverdue = differenceInDays(today, expectedDate);

      if (daysOverdue > 0) {
        notifications.push({
          id: `overdue-${vehicle.id}`,
          vehicleId: vehicle.id,
          vehicleName: vehicle.vehicleName,
          registrationNo: vehicle.registrationNo,
          type: "overdue",
          message: `Vehicle is ${daysOverdue} day(s) overdue for return`,
          priority: daysOverdue > 3 ? "critical" : daysOverdue > 1 ? "high" : "medium",
          daysOverdue,
          createdAt: today.toISOString(),
        });
      } else if (daysOverdue >= -2 && daysOverdue <= 0) {
        notifications.push({
          id: `due-soon-${vehicle.id}`,
          vehicleId: vehicle.id,
          vehicleName: vehicle.vehicleName,
          registrationNo: vehicle.registrationNo,
          type: "due-soon",
          message: daysOverdue === 0 ? "Vehicle is due for return today" : `Vehicle is due for return in ${Math.abs(daysOverdue)} day(s)`,
          priority: daysOverdue === 0 ? "high" : "medium",
          createdAt: today.toISOString(),
        });
      }
    }

    // Check for service due
    if (vehicle.nextServiceDate) {
      const serviceDate = new Date(vehicle.nextServiceDate);
      const daysUntilService = differenceInDays(serviceDate, today);

      if (daysUntilService < 0) {
        notifications.push({
          id: `service-overdue-${vehicle.id}`,
          vehicleId: vehicle.id,
          vehicleName: vehicle.vehicleName,
          registrationNo: vehicle.registrationNo,
          type: "service-overdue",
          message: `Service is ${Math.abs(daysUntilService)} day(s) overdue`,
          priority: Math.abs(daysUntilService) > 7 ? "critical" : "high",
          daysOverdue: Math.abs(daysUntilService),
          createdAt: today.toISOString(),
        });
      } else if (daysUntilService <= 7) {
        notifications.push({
          id: `service-due-${vehicle.id}`,
          vehicleId: vehicle.id,
          vehicleName: vehicle.vehicleName,
          registrationNo: vehicle.registrationNo,
          type: "service-due",
          message: daysUntilService === 0 ? "Service is due today" : `Service is due in ${daysUntilService} day(s)`,
          priority: daysUntilService <= 2 ? "high" : "medium",
          createdAt: today.toISOString(),
        });
      }
    }
  });

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export default function FleetManagementPage() {
  const router = useRouter();
  const [fleet, setFleet] = useState<FleetVehicle[]>(mockFleetData);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [activeTab, setActiveTab] = useState("fleet");
  const [selectedMake, setSelectedMake] = useState<string>("");

  // Generate notifications on mount and when fleet changes
  useEffect(() => {
    setNotifications(generateNotifications(fleet));
  }, [fleet]);

  const form = useForm<z.infer<typeof fleetFormSchema>>({
    resolver: zodResolver(fleetFormSchema),
    defaultValues: {
      vehicleName: "",
      vehicleMake: "",
      vehicleModel: "",
      registrationNo: "",
      vehicleType: "sedan",
      fuelType: "petrol",
      year: "",
      color: "",
      currentMileage: "",
      lastServiceDate: "",
      nextServiceDate: "",
      nextServiceMileage: "",
      notes: "",
    },
  });

  const assignmentForm = useForm<z.infer<typeof assignmentFormSchema>>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      assignedStaffName: "",
      assignedStaffPhone: "",
      assignmentPurpose: "",
      dateOut: "",
      expectedDateIn: "",
    },
  });

  // Filter fleet
  const filteredFleet = fleet.filter((vehicle) => {
    const matchesSearch =
      vehicle.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.registrationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.vehicleMake.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vehicle.assignedStaffName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
    const matchesType = typeFilter === "all" || vehicle.vehicleType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Stats
  const stats = {
    total: fleet.length,
    available: fleet.filter((v) => v.status === "available").length,
    assigned: fleet.filter((v) => v.status === "assigned").length,
    maintenance: fleet.filter((v) => v.status === "maintenance").length,
    outOfService: fleet.filter((v) => v.status === "out-of-service").length,
    criticalAlerts: notifications.filter((n) => n.priority === "critical").length,
  };

  // Add vehicle
  function onSubmitVehicle(data: z.infer<typeof fleetFormSchema>) {
    const newVehicle: FleetVehicle = {
      id: Date.now().toString(),
      vehicleName: data.vehicleName,
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      registrationNo: data.registrationNo.toUpperCase(),
      vehicleType: data.vehicleType,
      fuelType: data.fuelType,
      year: parseInt(data.year),
      color: data.color,
      status: "available",
      currentMileage: data.currentMileage ? parseInt(data.currentMileage) : undefined,
      lastServiceDate: data.lastServiceDate || undefined,
      nextServiceDate: data.nextServiceDate || undefined,
      nextServiceMileage: data.nextServiceMileage ? parseInt(data.nextServiceMileage) : undefined,
      notes: data.notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFleet([newVehicle, ...fleet]);
    setIsAddDialogOpen(false);
    form.reset();
    toast.success("Vehicle added to fleet successfully");
  }

  // Assign vehicle
  function onSubmitAssignment(data: z.infer<typeof assignmentFormSchema>) {
    if (!selectedVehicle) return;

    const updatedFleet = fleet.map((v) =>
      v.id === selectedVehicle.id
        ? {
            ...v,
            status: "assigned" as const,
            assignedStaffName: data.assignedStaffName,
            assignedStaffPhone: data.assignedStaffPhone,
            assignmentPurpose: data.assignmentPurpose,
            dateOut: data.dateOut,
            expectedDateIn: data.expectedDateIn,
            updatedAt: new Date().toISOString(),
          }
        : v
    );

    setFleet(updatedFleet);
    setIsAssignDialogOpen(false);
    assignmentForm.reset();
    toast.success(`Vehicle assigned to ${data.assignedStaffName}`);
  }

  // Return vehicle
  function handleReturnVehicle(vehicle: FleetVehicle) {
    const updatedFleet = fleet.map((v) =>
      v.id === vehicle.id
        ? {
            ...v,
            status: "available" as const,
            actualDateIn: new Date().toISOString().split("T")[0],
            assignedStaffName: undefined,
            assignedStaffPhone: undefined,
            assignmentPurpose: undefined,
            dateOut: undefined,
            expectedDateIn: undefined,
            updatedAt: new Date().toISOString(),
          }
        : v
    );

    setFleet(updatedFleet);
    toast.success("Vehicle marked as returned");
  }

  // Delete vehicle
  function handleDeleteVehicle() {
    if (!selectedVehicle) return;
    setFleet(fleet.filter((v) => v.id !== selectedVehicle.id));
    setIsDeleteDialogOpen(false);
    setSelectedVehicle(null);
    toast.success("Vehicle removed from fleet");
  }

  // Get status badge
  function getStatusBadge(status: FleetVehicle["status"]) {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="h-3 w-3 mr-1" />Available</Badge>;
      case "assigned":
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"><Car className="h-3 w-3 mr-1" />Assigned</Badge>;
      case "maintenance":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><Wrench className="h-3 w-3 mr-1" />Maintenance</Badge>;
      case "out-of-service":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><XCircle className="h-3 w-3 mr-1" />Out of Service</Badge>;
    }
  }

  // Get notification badge
  function getNotificationBadge(notification: Notification) {
    const colors = {
      critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300",
      high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300",
      medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300",
      low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300",
    };
    return colors[notification.priority];
  }

  // Get notification icon
  function getNotificationIcon(type: Notification["type"]) {
    switch (type) {
      case "overdue":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "due-soon":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "service-due":
        return <Wrench className="h-5 w-5 text-blue-500" />;
      case "service-overdue":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
<h1 className="text-2xl font-bold tracking-tight text-[#e67e22]">Fleet Management</h1>
            <p className="text-gray-300">Manage your vehicle fleet, assignments, and maintenance schedules</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#e67e22] hover:bg-[#d35400] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a1628] text-white border-2 border-[#e67e22]/50">
            <DialogHeader className="border-b border-[#e67e22]/30 pb-4">
              <DialogTitle className="flex items-center gap-2 text-[#e67e22]">
                <Car className="h-5 w-5" />
                Add New Vehicle
              </DialogTitle>
              <DialogDescription className="text-gray-300">Add a new vehicle to your fleet inventory</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitVehicle)} className="space-y-6">
                {/* Vehicle Details */}
                <div className="rounded-lg border-2 border-[#e67e22]/50 bg-[#0f1d32] text-white p-4 shadow-sm">
                  <h4 className="font-semibold text-[#e67e22] mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <CarFront className="h-4 w-4" />
                    Vehicle Information
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={form.control} name="vehicleName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Name *</FormLabel>
                        <FormControl><Input placeholder="e.g., Safari Cruiser 1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="registrationNo" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration No. *</FormLabel>
                        <FormControl><Input placeholder="e.g., KDA 123A" className="uppercase" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="vehicleMake" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedMake(value);
                            form.setValue("vehicleModel", "");
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select make" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicleData.map((v) => (
                              <SelectItem key={v.make} value={v.make}>{v.make}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="vehicleModel" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedMake && !form.getValues("vehicleMake")}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedMake || form.getValues("vehicleMake") ? "Select model" : "Select make first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicleData
                              .find((v) => v.make === (selectedMake || form.getValues("vehicleMake")))
                              ?.models.map((model) => (
                                <SelectItem key={model} value={model}>{model}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="vehicleType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="sedan">Sedan</SelectItem>
                            <SelectItem value="suv">SUV</SelectItem>
                            <SelectItem value="van">Van</SelectItem>
                            <SelectItem value="truck">Truck</SelectItem>
                            <SelectItem value="bus">Bus</SelectItem>
                            <SelectItem value="pickup">Pickup</SelectItem>
                            <SelectItem value="motorcycle">Motorcycle</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="fuelType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuel Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="petrol">Petrol</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="year" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="color" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {colorOptions.map((color) => (
                              <SelectItem key={color} value={color}>{color}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Service & Mileage */}
                <div className="rounded-lg border-2 border-blue-500/50 bg-[#0f1d32] text-white p-4 shadow-sm">
                  <h4 className="font-semibold text-blue-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Wrench className="h-4 w-4" />
                    Service & Mileage
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField control={form.control} name="currentMileage" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Current Mileage (KM)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 45000" 
                            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              // Auto-calculate next service mileage based on interval
                              const interval = form.getValues("serviceInterval") || "10000";
                              if (e.target.value) {
                                const nextService = parseInt(e.target.value) + parseInt(interval);
                                form.setValue("nextServiceMileage", nextService.toString());
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="serviceInterval" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Service Interval (KM)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 10000" 
                            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              // Recalculate next service when interval changes
                              const currentMileage = form.getValues("currentMileage");
                              if (currentMileage && e.target.value) {
                                const nextService = parseInt(currentMileage) + parseInt(e.target.value);
                                form.setValue("nextServiceMileage", nextService.toString());
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500 dark:text-gray-400 text-xs">
                          Default: 10,000 KM
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="nextServiceMileage" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Next Service (KM)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Auto-calculated" 
                            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500 dark:text-gray-400 text-xs">
                          Auto-calculated or edit manually
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lastServiceDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Last Service Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")}
                            placeholder="Select date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="nextServiceDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Next Service Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")}
                            placeholder="Select date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Notes */}
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl><Textarea placeholder="Additional notes about the vehicle..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-gray-500 text-gray-300 hover:bg-gray-700">Cancel</Button>
                  <Button type="submit" className="bg-[#e67e22] hover:bg-[#d35400] text-white">Add Vehicle</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Fleet</CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Available</CardDescription>
            <CardTitle className="text-2xl font-bold text-green-600">{stats.available}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Assigned</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600">{stats.assigned}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Maintenance</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">{stats.maintenance}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Out of Service</CardDescription>
            <CardTitle className="text-2xl font-bold text-red-600">{stats.outOfService}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-rose-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Critical Alerts</CardDescription>
            <CardTitle className="text-2xl font-bold text-rose-600">{stats.criticalAlerts}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs for Fleet and Notifications */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#0a1628] text-white border border-[#e67e22]/50">
          <TabsTrigger value="fleet" className="flex items-center gap-2 text-white data-[state=active]:bg-[#e67e22] data-[state=active]:text-white">
            <Car className="h-4 w-4" />
            <span className="font-semibold">Fleet Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 text-white data-[state=active]:bg-[#e67e22] data-[state=active]:text-white">
            <Bell className="h-4 w-4" />
            <span className="font-semibold">Notifications</span>
            {notifications.length > 0 && (
              <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5">{notifications.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Fleet Inventory Tab */}
        <TabsContent value="fleet" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, registration, make, or staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="out-of-service">Out of Service</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Vehicle Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Fleet Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#0a1628] text-white border-b-2 border-[#e67e22]">
                    <TableHead className="text-[#e67e22]">Vehicle</TableHead>
                    <TableHead className="text-[#e67e22]">Registration</TableHead>
                    <TableHead className="text-[#e67e22]">Status</TableHead>
                    <TableHead className="text-[#e67e22]">Assigned To</TableHead>
                    <TableHead className="text-[#e67e22]">Date Out</TableHead>
                    <TableHead className="text-[#e67e22]">Expected In</TableHead>
                    <TableHead className="text-[#e67e22]">Next Service</TableHead>
                    <TableHead className="text-[#e67e22] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFleet.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Car className="h-8 w-8" />
                          <p>No vehicles found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFleet.map((vehicle) => (
                      <TableRow key={vehicle.id} className="hover:bg-[#0f1d32]/50 dark:hover:bg-[#0f1d32]/80 cursor-pointer">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{vehicle.vehicleName}</span>
                            <span className="text-xs text-muted-foreground">{vehicle.vehicleMake} {vehicle.vehicleModel} ({vehicle.year})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">{vehicle.registrationNo}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                        <TableCell>
                          {vehicle.assignedStaffName ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{vehicle.assignedStaffName}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />{vehicle.assignedStaffPhone}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {vehicle.dateOut ? (
                            <span className="text-sm">{format(new Date(vehicle.dateOut), "MMM dd, yyyy")}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {vehicle.expectedDateIn ? (
                            <div className="flex items-center gap-1">
                              <span className="text-sm">{format(new Date(vehicle.expectedDateIn), "MMM dd, yyyy")}</span>
                              {isPast(new Date(vehicle.expectedDateIn)) && vehicle.status === "assigned" && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {vehicle.nextServiceDate ? (
                            <div className="flex items-center gap-1">
                              <span className="text-sm">{format(new Date(vehicle.nextServiceDate), "MMM dd")}</span>
                              {isPast(new Date(vehicle.nextServiceDate)) && (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/admin/fleet/${vehicle.id}`)}>
                                <CarFront className="h-4 w-4 mr-2" />View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedVehicle(vehicle); setIsViewDialogOpen(true); }}>
                                <Eye className="h-4 w-4 mr-2" />Quick View
                              </DropdownMenuItem>
                              {vehicle.status === "available" && (
                                <DropdownMenuItem onClick={() => { setSelectedVehicle(vehicle); setIsAssignDialogOpen(true); }}>
                                  <User className="h-4 w-4 mr-2" />Assign Vehicle
                                </DropdownMenuItem>
                              )}
                              {vehicle.status === "assigned" && (
                                <DropdownMenuItem onClick={() => handleReturnVehicle(vehicle)}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />Mark as Returned
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600" 
                                onClick={() => { setSelectedVehicle(vehicle); setIsDeleteDialogOpen(true); }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />Remove Vehicle
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                Fleet Notifications & Alerts
              </CardTitle>
              <CardDescription>Vehicles due for return or requiring service attention</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Clear!</h3>
                  <p className="text-muted-foreground">No pending notifications or alerts</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border ${getNotificationBadge(notification)}`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-gray-900 dark:text-white">{notification.vehicleName}</span>
                            <Badge variant="outline" className="font-mono text-xs">{notification.registrationNo}</Badge>
                            <Badge className={`text-xs ${
                              notification.priority === "critical" ? "bg-red-500" :
                              notification.priority === "high" ? "bg-orange-500" :
                              notification.priority === "medium" ? "bg-amber-500" : "bg-blue-500"
                            } text-white`}>
                              {notification.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.type === "overdue" && "Vehicle has exceeded its expected return date"}
                            {notification.type === "due-soon" && "Vehicle is approaching its return date"}
                            {notification.type === "service-due" && "Scheduled service maintenance is approaching"}
                            {notification.type === "service-overdue" && "Vehicle has missed its scheduled service date"}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const vehicle = fleet.find(v => v.id === notification.vehicleId);
                            if (vehicle) {
                              setSelectedVehicle(vehicle);
                              setIsViewDialogOpen(true);
                            }
                          }}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign Vehicle Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <DialogTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <User className="h-5 w-5" />
              Assign Vehicle
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Assign {selectedVehicle?.vehicleName} ({selectedVehicle?.registrationNo}) to a staff member
            </DialogDescription>
          </DialogHeader>
          <Form {...assignmentForm}>
            <form onSubmit={assignmentForm.handleSubmit(onSubmitAssignment)} className="space-y-4">
              {/* Staff Details Section */}
              <div className="rounded-lg border-2 border-blue-400 dark:border-blue-600 bg-white dark:bg-gray-900 p-4 shadow-sm">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <User className="h-4 w-4" />
                  Staff Details
                </h4>
                <div className="space-y-4">
                  <FormField control={assignmentForm.control} name="assignedStaffName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Staff Name *</FormLabel>
                      <FormControl><Input placeholder="Enter staff full name" className="bg-white dark:bg-gray-800" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={assignmentForm.control} name="assignedStaffPhone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Staff Phone *</FormLabel>
                      <FormControl><Input placeholder="e.g., 0722123456" className="bg-white dark:bg-gray-800" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Assignment Details Section */}
              <div className="rounded-lg border-2 border-amber-400 dark:border-amber-600 bg-white dark:bg-gray-900 p-4 shadow-sm">
                <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Calendar className="h-4 w-4" />
                  Assignment Details
                </h4>
                <div className="space-y-4">
                  <FormField control={assignmentForm.control} name="assignmentPurpose" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Assignment Purpose *</FormLabel>
                      <FormControl><Textarea placeholder="e.g., Masai Mara Safari Tour" className="bg-white dark:bg-gray-800" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField control={assignmentForm.control} name="dateOut" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Date Out *</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={(date) => {
                              field.onChange(date ? date.toISOString().split("T")[0] : "");
                              // Auto-calculate expected return if days is set
                              const days = assignmentForm.getValues("numberOfDays");
                              if (date && days) {
                                const returnDate = addDays(date, parseInt(days));
                                assignmentForm.setValue("expectedDateIn", returnDate.toISOString().split("T")[0]);
                              }
                            }}
                            placeholder="Select date out"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={assignmentForm.control} name="numberOfDays" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">No. of Days</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 3" 
                            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              // Auto-calculate expected return date
                              const dateOut = assignmentForm.getValues("dateOut");
                              if (dateOut && e.target.value) {
                                const returnDate = addDays(new Date(dateOut), parseInt(e.target.value));
                                assignmentForm.setValue("expectedDateIn", returnDate.toISOString().split("T")[0]);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={assignmentForm.control} name="expectedDateIn" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Expected Return *</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")}
                            placeholder="Select return date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Assign Vehicle</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Vehicle Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-emerald-600" />
              Vehicle Details
            </DialogTitle>
          </DialogHeader>
          {selectedVehicle && (
            <div className="space-y-6">
              {/* Vehicle Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                    <CarFront className="h-4 w-4 text-emerald-600" />
                    Vehicle Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedVehicle.vehicleName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registration:</span>
                      <Badge variant="outline" className="font-mono">{selectedVehicle.registrationNo}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Make/Model:</span>
                      <span>{selectedVehicle.vehicleMake} {selectedVehicle.vehicleModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year:</span>
                      <span>{selectedVehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color:</span>
                      <span>{selectedVehicle.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{selectedVehicle.vehicleType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fuel:</span>
                      <span className="capitalize">{selectedVehicle.fuelType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(selectedVehicle.status)}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                    <Wrench className="h-4 w-4 text-blue-600" />
                    Service Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Mileage:</span>
                      <span className="font-mono">{selectedVehicle.currentMileage?.toLocaleString() || "-"} KM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Service At:</span>
                      <span className="font-mono">{selectedVehicle.nextServiceMileage?.toLocaleString() || "-"} KM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Service:</span>
                      <span>{selectedVehicle.lastServiceDate ? format(new Date(selectedVehicle.lastServiceDate), "MMM dd, yyyy") : "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Service:</span>
                      <span>{selectedVehicle.nextServiceDate ? format(new Date(selectedVehicle.nextServiceDate), "MMM dd, yyyy") : "-"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment Info (if assigned) */}
              {selectedVehicle.status === "assigned" && selectedVehicle.assignedStaffName && (
                <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                    <User className="h-4 w-4" />
                    Current Assignment
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Assigned To:</span>
                      <p className="font-medium">{selectedVehicle.assignedStaffName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-medium">{selectedVehicle.assignedStaffPhone}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground">Purpose:</span>
                      <p className="font-medium">{selectedVehicle.assignmentPurpose}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date Out:</span>
                      <p className="font-medium">{selectedVehicle.dateOut ? format(new Date(selectedVehicle.dateOut), "MMM dd, yyyy") : "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expected Return:</span>
                      <p className="font-medium flex items-center gap-2">
                        {selectedVehicle.expectedDateIn ? format(new Date(selectedVehicle.expectedDateIn), "MMM dd, yyyy") : "-"}
                        {selectedVehicle.expectedDateIn && isPast(new Date(selectedVehicle.expectedDateIn)) && (
                          <Badge className="bg-red-500 text-white text-xs">OVERDUE</Badge>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedVehicle.notes && (
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    Notes
                  </h4>
                  <p className="text-sm text-muted-foreground">{selectedVehicle.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Vehicle from Fleet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{selectedVehicle?.vehicleName}</strong> ({selectedVehicle?.registrationNo}) from the fleet?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVehicle} className="bg-red-600 hover:bg-red-700">
              Remove Vehicle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
