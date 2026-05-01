"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CarFront,
  Plus,
  Search,
  AlertTriangle,
  User,
  Phone,
  Calendar,
  Clock,
  Wrench,
  Bell,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Trash2,
  Filter,
  AlertCircle,
  Car,
  Truck,
  Bus,
  CalendarClock,
  UserCheck,
  MapPin,
  FileText,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { format, differenceInDays, addDays, isPast, isToday } from "date-fns";

// Types
interface FleetVehicle {
  id: string;
  vehicleName: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  vehicleType: "sedan" | "suv" | "van" | "truck" | "bus" | "pickup" | "motorcycle";
  fuelType: "petrol" | "diesel" | "electric" | "hybrid";
  color: string;
  status: "available" | "assigned" | "maintenance" | "out-of-service";
  currentAssignment?: Assignment;
  maintenanceSchedule?: MaintenanceSchedule;
  createdAt: string;
}

interface Assignment {
  id: string;
  vehicleId: string;
  staffName: string;
  staffPhone: string;
  staffId: string;
  purpose: string;
  destination?: string;
  dateOut: string;
  expectedDateIn: string;
  actualDateIn?: string;
  status: "active" | "completed" | "overdue";
  notes?: string;
}

interface MaintenanceSchedule {
  nextServiceDate: string;
  nextServiceType: "oil-change" | "full-service" | "tire-rotation" | "brake-check" | "inspection";
  lastServiceDate?: string;
  mileageAtLastService?: number;
  currentMileage?: number;
}

interface Notification {
  id: string;
  type: "overdue" | "due-soon" | "maintenance-due" | "returned";
  vehicleId: string;
  vehicleName: string;
  registrationNumber: string;
  message: string;
  staffName?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high" | "critical";
  isRead: boolean;
  createdAt: string;
}

// Form schema for adding/editing vehicles
const vehicleFormSchema = z.object({
  vehicleName: z.string().min(2, "Vehicle name is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().min(4, "Year is required"),
  registrationNumber: z.string().min(4, "Registration number is required"),
  vehicleType: z.enum(["sedan", "suv", "van", "truck", "bus", "pickup", "motorcycle"]),
  fuelType: z.enum(["petrol", "diesel", "electric", "hybrid"]),
  color: z.string().min(1, "Color is required"),
});

// Form schema for assignments
const assignmentFormSchema = z.object({
  staffName: z.string().min(2, "Staff name is required"),
  staffPhone: z.string().min(10, "Valid phone number is required"),
  staffId: z.string().min(1, "Staff ID is required"),
  purpose: z.string().min(5, "Purpose is required"),
  destination: z.string().optional(),
  dateOut: z.string().min(1, "Date out is required"),
  expectedDateIn: z.string().min(1, "Expected return date is required"),
  notes: z.string().optional(),
});

// Mock data
const mockVehicles: FleetVehicle[] = [
  {
    id: "v1",
    vehicleName: "Safari Cruiser 1",
    make: "Toyota",
    model: "Land Cruiser V8",
    year: 2022,
    registrationNumber: "KDA 123A",
    vehicleType: "suv",
    fuelType: "diesel",
    color: "White",
    status: "assigned",
    currentAssignment: {
      id: "a1",
      vehicleId: "v1",
      staffName: "John Kamau",
      staffPhone: "+254 712 345 678",
      staffId: "EMP001",
      purpose: "Safari tour to Masai Mara",
      destination: "Masai Mara",
      dateOut: "2026-04-28",
      expectedDateIn: "2026-05-05",
      status: "active",
    },
    maintenanceSchedule: {
      nextServiceDate: "2026-05-15",
      nextServiceType: "full-service",
      lastServiceDate: "2026-03-15",
      mileageAtLastService: 45000,
      currentMileage: 47500,
    },
    createdAt: "2024-01-15",
  },
  {
    id: "v2",
    vehicleName: "Executive Sedan",
    make: "Mercedes-Benz",
    model: "E-Class",
    year: 2023,
    registrationNumber: "KDB 456B",
    vehicleType: "sedan",
    fuelType: "petrol",
    color: "Black",
    status: "available",
    maintenanceSchedule: {
      nextServiceDate: "2026-05-03",
      nextServiceType: "oil-change",
      lastServiceDate: "2026-02-03",
      mileageAtLastService: 20000,
      currentMileage: 23500,
    },
    createdAt: "2024-02-20",
  },
  {
    id: "v3",
    vehicleName: "Cargo Van 1",
    make: "Toyota",
    model: "HiAce",
    year: 2021,
    registrationNumber: "KDC 789C",
    vehicleType: "van",
    fuelType: "diesel",
    color: "Silver",
    status: "assigned",
    currentAssignment: {
      id: "a2",
      vehicleId: "v3",
      staffName: "Peter Ochieng",
      staffPhone: "+254 723 456 789",
      staffId: "EMP015",
      purpose: "Goods delivery to Mombasa",
      destination: "Mombasa",
      dateOut: "2026-04-25",
      expectedDateIn: "2026-04-30",
      status: "overdue",
    },
    createdAt: "2023-08-10",
  },
  {
    id: "v4",
    vehicleName: "Staff Bus",
    make: "Isuzu",
    model: "NQR",
    year: 2020,
    registrationNumber: "KDD 012D",
    vehicleType: "bus",
    fuelType: "diesel",
    color: "Blue",
    status: "maintenance",
    maintenanceSchedule: {
      nextServiceDate: "2026-05-01",
      nextServiceType: "brake-check",
      lastServiceDate: "2026-01-01",
      mileageAtLastService: 80000,
      currentMileage: 85000,
    },
    createdAt: "2022-05-15",
  },
  {
    id: "v5",
    vehicleName: "Premium SUV",
    make: "Range Rover",
    model: "Vogue",
    year: 2024,
    registrationNumber: "KDE 345E",
    vehicleType: "suv",
    fuelType: "diesel",
    color: "Gray",
    status: "available",
    maintenanceSchedule: {
      nextServiceDate: "2026-06-01",
      nextServiceType: "inspection",
      lastServiceDate: "2025-12-01",
      mileageAtLastService: 10000,
      currentMileage: 15000,
    },
    createdAt: "2024-06-01",
  },
];

// Generate notifications based on fleet status
function generateNotifications(vehicles: FleetVehicle[]): Notification[] {
  const notifications: Notification[] = [];
  const today = new Date();

  vehicles.forEach((vehicle) => {
    // Check for overdue assignments
    if (vehicle.currentAssignment && vehicle.status === "assigned") {
      const expectedReturn = new Date(vehicle.currentAssignment.expectedDateIn);
      const daysOverdue = differenceInDays(today, expectedReturn);

      if (daysOverdue > 0) {
        notifications.push({
          id: `notif-overdue-${vehicle.id}`,
          type: "overdue",
          vehicleId: vehicle.id,
          vehicleName: vehicle.vehicleName,
          registrationNumber: vehicle.registrationNumber,
          message: `Vehicle is ${daysOverdue} day(s) overdue. Expected return: ${format(expectedReturn, "MMM dd, yyyy")}`,
          staffName: vehicle.currentAssignment.staffName,
          dueDate: vehicle.currentAssignment.expectedDateIn,
          priority: daysOverdue > 3 ? "critical" : daysOverdue > 1 ? "high" : "medium",
          isRead: false,
          createdAt: today.toISOString(),
        });
      } else if (daysOverdue >= -2 && daysOverdue <= 0) {
        // Due in 2 days or today
        notifications.push({
          id: `notif-due-${vehicle.id}`,
          type: "due-soon",
          vehicleId: vehicle.id,
          vehicleName: vehicle.vehicleName,
          registrationNumber: vehicle.registrationNumber,
          message: daysOverdue === 0 
            ? `Vehicle due for return today` 
            : `Vehicle due for return in ${Math.abs(daysOverdue)} day(s)`,
          staffName: vehicle.currentAssignment.staffName,
          dueDate: vehicle.currentAssignment.expectedDateIn,
          priority: daysOverdue === 0 ? "high" : "medium",
          isRead: false,
          createdAt: today.toISOString(),
        });
      }
    }

    // Check for maintenance due
    if (vehicle.maintenanceSchedule) {
      const nextService = new Date(vehicle.maintenanceSchedule.nextServiceDate);
      const daysUntilService = differenceInDays(nextService, today);

      if (daysUntilService <= 0) {
        notifications.push({
          id: `notif-maint-overdue-${vehicle.id}`,
          type: "maintenance-due",
          vehicleId: vehicle.id,
          vehicleName: vehicle.vehicleName,
          registrationNumber: vehicle.registrationNumber,
          message: `Maintenance overdue: ${vehicle.maintenanceSchedule.nextServiceType.replace("-", " ")} was due on ${format(nextService, "MMM dd, yyyy")}`,
          dueDate: vehicle.maintenanceSchedule.nextServiceDate,
          priority: "critical",
          isRead: false,
          createdAt: today.toISOString(),
        });
      } else if (daysUntilService <= 7) {
        notifications.push({
          id: `notif-maint-${vehicle.id}`,
          type: "maintenance-due",
          vehicleId: vehicle.id,
          vehicleName: vehicle.vehicleName,
          registrationNumber: vehicle.registrationNumber,
          message: `Maintenance due in ${daysUntilService} day(s): ${vehicle.maintenanceSchedule.nextServiceType.replace("-", " ")}`,
          dueDate: vehicle.maintenanceSchedule.nextServiceDate,
          priority: daysUntilService <= 3 ? "high" : "medium",
          isRead: false,
          createdAt: today.toISOString(),
        });
      }
    }
  });

  return notifications.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export default function FleetManagementPage() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>(mockVehicles);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAssignVehicleOpen, setIsAssignVehicleOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [viewVehicle, setViewVehicle] = useState<FleetVehicle | null>(null);
  const [activeTab, setActiveTab] = useState("vehicles");

  // Generate notifications on load and when vehicles change
  useEffect(() => {
    setNotifications(generateNotifications(vehicles));
  }, [vehicles]);

  const vehicleForm = useForm<z.infer<typeof vehicleFormSchema>>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      vehicleName: "",
      make: "",
      model: "",
      year: "",
      registrationNumber: "",
      vehicleType: "sedan",
      fuelType: "petrol",
      color: "",
    },
  });

  const assignmentForm = useForm<z.infer<typeof assignmentFormSchema>>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      staffName: "",
      staffPhone: "",
      staffId: "",
      purpose: "",
      destination: "",
      dateOut: format(new Date(), "yyyy-MM-dd"),
      expectedDateIn: "",
      notes: "",
    },
  });

  // Filter vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.currentAssignment?.staffName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
    const matchesType = typeFilter === "all" || vehicle.vehicleType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Stats
  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === "available").length,
    assigned: vehicles.filter((v) => v.status === "assigned").length,
    maintenance: vehicles.filter((v) => v.status === "maintenance").length,
    overdue: vehicles.filter(
      (v) =>
        v.currentAssignment &&
        isPast(new Date(v.currentAssignment.expectedDateIn)) &&
        !v.currentAssignment.actualDateIn
    ).length,
    criticalNotifications: notifications.filter((n) => n.priority === "critical").length,
  };

  const handleAddVehicle = (data: z.infer<typeof vehicleFormSchema>) => {
    const newVehicle: FleetVehicle = {
      id: `v${Date.now()}`,
      vehicleName: data.vehicleName,
      make: data.make,
      model: data.model,
      year: parseInt(data.year),
      registrationNumber: data.registrationNumber.toUpperCase(),
      vehicleType: data.vehicleType,
      fuelType: data.fuelType,
      color: data.color,
      status: "available",
      createdAt: new Date().toISOString(),
    };

    setVehicles([...vehicles, newVehicle]);
    toast.success("Vehicle added successfully");
    setIsAddVehicleOpen(false);
    vehicleForm.reset();
  };

  const handleAssignVehicle = (data: z.infer<typeof assignmentFormSchema>) => {
    if (!selectedVehicle) return;

    const newAssignment: Assignment = {
      id: `a${Date.now()}`,
      vehicleId: selectedVehicle.id,
      staffName: data.staffName,
      staffPhone: data.staffPhone,
      staffId: data.staffId,
      purpose: data.purpose,
      destination: data.destination,
      dateOut: data.dateOut,
      expectedDateIn: data.expectedDateIn,
      status: "active",
      notes: data.notes,
    };

    setVehicles(
      vehicles.map((v) =>
        v.id === selectedVehicle.id
          ? { ...v, status: "assigned" as const, currentAssignment: newAssignment }
          : v
      )
    );

    toast.success(`Vehicle assigned to ${data.staffName}`);
    setIsAssignVehicleOpen(false);
    setSelectedVehicle(null);
    assignmentForm.reset();
  };

  const handleReturnVehicle = (vehicleId: string) => {
    setVehicles(
      vehicles.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              status: "available" as const,
              currentAssignment: v.currentAssignment
                ? { ...v.currentAssignment, actualDateIn: new Date().toISOString(), status: "completed" as const }
                : undefined,
            }
          : v
      )
    );
    toast.success("Vehicle marked as returned");
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles(vehicles.filter((v) => v.id !== vehicleId));
    toast.success("Vehicle removed from fleet");
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications(
      notifications.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "assigned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "maintenance":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "out-of-service":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "sedan":
        return <Car className="h-4 w-4" />;
      case "suv":
        return <CarFront className="h-4 w-4" />;
      case "van":
      case "truck":
      case "pickup":
        return <Truck className="h-4 w-4" />;
      case "bus":
        return <Bus className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CarFront className="h-7 w-7 text-primary" />
            Fleet Management
          </h1>
          <p className="text-muted-foreground">
            Manage vehicles, assignments, and track fleet status
          </p>
        </div>
        <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CarFront className="h-5 w-5 text-primary" />
                Add New Vehicle
              </DialogTitle>
              <DialogDescription>
                Add a new vehicle to your fleet inventory
              </DialogDescription>
            </DialogHeader>
            <Form {...vehicleForm}>
              <form onSubmit={vehicleForm.handleSubmit(handleAddVehicle)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={vehicleForm.control}
                    name="vehicleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Safari Cruiser 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={vehicleForm.control}
                    name="registrationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., KDA 123A" className="uppercase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={vehicleForm.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Toyota" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={vehicleForm.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Land Cruiser" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={vehicleForm.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 2023" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={vehicleForm.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
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
                    )}
                  />
                  <FormField
                    control={vehicleForm.control}
                    name="fuelType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuel Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select fuel type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="petrol">Petrol</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={vehicleForm.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., White" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddVehicleOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Vehicle</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Fleet</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CarFront className="h-8 w-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Available</p>
                <p className="text-2xl font-bold text-emerald-700">{stats.available}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Assigned</p>
                <p className="text-2xl font-bold text-blue-700">{stats.assigned}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Maintenance</p>
                <p className="text-2xl font-bold text-amber-700">{stats.maintenance}</p>
              </div>
              <Wrench className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Overdue</p>
                <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Alerts</p>
                <p className="text-2xl font-bold text-purple-700">{stats.criticalNotifications}</p>
              </div>
              <Bell className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="vehicles" className="gap-2">
            <CarFront className="h-4 w-4" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 relative">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, registration, or staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
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
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Vehicles Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Date Out</TableHead>
                    <TableHead>Expected Return</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No vehicles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVehicles.map((vehicle) => {
                      const isOverdue =
                        vehicle.currentAssignment &&
                        isPast(new Date(vehicle.currentAssignment.expectedDateIn)) &&
                        !vehicle.currentAssignment.actualDateIn;

                      return (
                        <TableRow key={vehicle.id} className={isOverdue ? "bg-red-50 dark:bg-red-900/10" : ""}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                {getVehicleIcon(vehicle.vehicleType)}
                              </div>
                              <div>
                                <p className="font-medium">{vehicle.vehicleName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {vehicle.make} {vehicle.model} ({vehicle.year})
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                              {vehicle.registrationNumber}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(vehicle.status)}>
                              {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                            </Badge>
                            {isOverdue && (
                              <Badge variant="destructive" className="ml-2">
                                Overdue
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {vehicle.currentAssignment ? (
                              <div>
                                <p className="font-medium flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {vehicle.currentAssignment.staffName}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {vehicle.currentAssignment.staffPhone}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {vehicle.currentAssignment ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {format(new Date(vehicle.currentAssignment.dateOut), "MMM dd, yyyy")}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {vehicle.currentAssignment ? (
                              <div className={`flex items-center gap-1 text-sm ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                                <CalendarClock className="h-3 w-3" />
                                {format(new Date(vehicle.currentAssignment.expectedDateIn), "MMM dd, yyyy")}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewVehicle(vehicle)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {vehicle.status === "available" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedVehicle(vehicle);
                                    setIsAssignVehicleOpen(true);
                                  }}
                                >
                                  Assign
                                </Button>
                              )}
                              {vehicle.status === "assigned" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                                  onClick={() => handleReturnVehicle(vehicle.id)}
                                >
                                  Return
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Vehicle?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove {vehicle.vehicleName} ({vehicle.registrationNumber}) from the fleet? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteVehicle(vehicle.id)}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Fleet Alerts & Notifications
              </CardTitle>
              <CardDescription>
                Stay updated on overdue returns, upcoming maintenance, and fleet status changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
                  <p>All clear! No pending notifications.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${getPriorityColor(notification.priority)} ${
                        notification.isRead ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {notification.type === "overdue" && (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            )}
                            {notification.type === "due-soon" && (
                              <Clock className="h-5 w-5 text-orange-500" />
                            )}
                            {notification.type === "maintenance-due" && (
                              <Wrench className="h-5 w-5 text-amber-500" />
                            )}
                            {notification.type === "returned" && (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{notification.vehicleName}</p>
                              <code className="text-xs bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded">
                                {notification.registrationNumber}
                              </code>
                              <Badge variant="outline" className="text-xs capitalize">
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-sm">{notification.message}</p>
                            {notification.staffName && (
                              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Assigned to: {notification.staffName}
                              </p>
                            )}
                          </div>
                        </div>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markNotificationRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign Vehicle Dialog */}
      <Dialog open={isAssignVehicleOpen} onOpenChange={setIsAssignVehicleOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Assign Vehicle
            </DialogTitle>
            <DialogDescription>
              {selectedVehicle && (
                <span>
                  Assigning: <strong>{selectedVehicle.vehicleName}</strong> ({selectedVehicle.registrationNumber})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <Form {...assignmentForm}>
            <form onSubmit={assignmentForm.handleSubmit(handleAssignVehicle)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={assignmentForm.control}
                  name="staffName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Staff Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={assignmentForm.control}
                  name="staffPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+254 7XX XXX XXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={assignmentForm.control}
                name="staffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="Employee ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={assignmentForm.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Safari tour, Client pickup" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={assignmentForm.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Masai Mara, Mombasa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={assignmentForm.control}
                  name="dateOut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Out *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={assignmentForm.control}
                  name="expectedDateIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Return *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={assignmentForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAssignVehicleOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Assign Vehicle</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Vehicle Dialog */}
      <Dialog open={!!viewVehicle} onOpenChange={() => setViewVehicle(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewVehicle && getVehicleIcon(viewVehicle.vehicleType)}
              Vehicle Details
            </DialogTitle>
          </DialogHeader>
          {viewVehicle && (
            <div className="space-y-6">
              {/* Vehicle Info */}
              <div className="rounded-lg border p-4 bg-muted/30">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CarFront className="h-4 w-4 text-primary" />
                  Vehicle Information
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle Name</p>
                    <p className="font-medium">{viewVehicle.vehicleName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registration</p>
                    <code className="font-mono">{viewVehicle.registrationNumber}</code>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Make & Model</p>
                    <p className="font-medium">{viewVehicle.make} {viewVehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="font-medium">{viewVehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{viewVehicle.vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Color</p>
                    <p className="font-medium">{viewVehicle.color}</p>
                  </div>
                </div>
              </div>

              {/* Current Assignment */}
              {viewVehicle.currentAssignment && (
                <div className="rounded-lg border border-blue-200 p-4 bg-blue-50/50 dark:bg-blue-950/20">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <UserCheck className="h-4 w-4" />
                    Current Assignment
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Staff Name</p>
                      <p className="font-medium">{viewVehicle.currentAssignment.staffName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{viewVehicle.currentAssignment.staffPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Purpose</p>
                      <p className="font-medium">{viewVehicle.currentAssignment.purpose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Destination</p>
                      <p className="font-medium">{viewVehicle.currentAssignment.destination || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date Out</p>
                      <p className="font-medium">
                        {format(new Date(viewVehicle.currentAssignment.dateOut), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Return</p>
                      <p className="font-medium">
                        {format(new Date(viewVehicle.currentAssignment.expectedDateIn), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Maintenance Schedule */}
              {viewVehicle.maintenanceSchedule && (
                <div className="rounded-lg border border-amber-200 p-4 bg-amber-50/50 dark:bg-amber-950/20">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <Wrench className="h-4 w-4" />
                    Maintenance Schedule
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Next Service</p>
                      <p className="font-medium">
                        {format(new Date(viewVehicle.maintenanceSchedule.nextServiceDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Service Type</p>
                      <p className="font-medium capitalize">
                        {viewVehicle.maintenanceSchedule.nextServiceType.replace("-", " ")}
                      </p>
                    </div>
                    {viewVehicle.maintenanceSchedule.currentMileage && (
                      <div>
                        <p className="text-sm text-muted-foreground">Current Mileage</p>
                        <p className="font-medium">
                          {viewVehicle.maintenanceSchedule.currentMileage.toLocaleString()} km
                        </p>
                      </div>
                    )}
                    {viewVehicle.maintenanceSchedule.lastServiceDate && (
                      <div>
                        <p className="text-sm text-muted-foreground">Last Service</p>
                        <p className="font-medium">
                          {format(new Date(viewVehicle.maintenanceSchedule.lastServiceDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
