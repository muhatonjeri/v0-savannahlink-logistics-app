"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Car,
  Calendar,
  CreditCard,
  Fingerprint,
  FileText,
  Camera,
  CheckCircle2,
  Search,
  UserCheck,
  UserPlus,
  ScanLine,
  Loader2,
  AlertTriangle,
  Ban,
  AlertCircle,
  ShieldAlert,
  XCircle,
  DollarSign,
  Clock,
  FileWarning,
  Plus,
  X,
  History,
  MapPin,
  Eye,
  Skull,
  Phone,
  Mail,
  Building,
  Users,
  Gauge,
  Fuel,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/forms/file-upload";
import { MpesaPayment } from "@/components/payment/mpesa-payment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveBooking, generateId, searchClients, saveClientFromBooking, getClients, saveClient, getClientBookingHistory, initializeDemoBookingHistory, checkRogueClient, searchRogueClients } from "@/lib/store";
import type { ClientAlert, ClientAlertType, Booking, RogueClient } from "@/types";
import type { Client } from "@/types";
import { toast } from "sonner";
import type { CarRentalBooking } from "@/types";

// Comprehensive validation schema for admin car rental form
const adminCarRentalSchema = z.object({
  // Personal Details
  fullName: z.string().min(2, "Full name is required"),
  idNumber: z.string().min(6, "ID/Passport number is required"),
  idPhotoFrontUrl: z.string().optional(),
  idPhotoBackUrl: z.string().optional(),
  drivingLicenseNumber: z.string().min(4, "Driving license number is required"),
  drivingLicenseFrontUrl: z.string().optional(),
  drivingLicenseBackUrl: z.string().optional(),
  placeOfWork: z.string().min(2, "Place of work is required"),
  kraPin: z.string().min(10, "KRA PIN is required (e.g., A012345678A)"),
  residence: z.string().min(2, "Residence/Address is required"),
  phone: z.string().min(10, "Phone number is required"),
  alternativePhone: z.string().optional(),
  email: z.string().email("Invalid email address"),
  
  // Next of Kin
  nextOfKinName: z.string().min(2, "Next of kin name is required"),
  nextOfKinPhone: z.string().min(10, "Next of kin phone is required"),
  nextOfKinRelationship: z.string().min(2, "Relationship is required"),
  
  // Biometric/ID uploads
  fingerprintLeftUrl: z.string().optional(),
  fingerprintRightUrl: z.string().optional(),
  passportPhotoUrl: z.string().optional(),
  
  // Rental Type
  rentalType: z.enum(["self-drive", "chauffeured"]),
  
  // Car Details
  carMake: z.string().min(1, "Car make is required"),
  carModel: z.string().min(1, "Car model is required"),
  numberPlate: z.string().min(4, "Number plate is required"),
  currentMileage: z.string().min(1, "Current mileage is required"),
  fuelLevel: z.string().min(1, "Fuel level is required"),
  etcAmount: z.string().optional(),
  destination: z.string().min(2, "Destination is required"),
  
  // Rental Period
  numberOfDays: z.string().min(1, "Number of days is required"),
  dailyRate: z.string().min(1, "Daily rate is required"),
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endDate: z.string().min(1, "End date is required"),
  endTime: z.string().min(1, "End time is required"),
  
  // Payment Method
  paymentMethod: z.enum(["mpesa", "bank"]),
});

type AdminCarRentalFormData = z.infer<typeof adminCarRentalSchema>;

const fuelLevels = ["Empty", "1/4", "1/2", "3/4", "Full"];

const carOptions = [
  { make: "Toyota", models: ["Corolla", "Camry", "Land Cruiser", "Prado", "Hilux", "RAV4", "Fortuner"] },
  { make: "Nissan", models: ["Note", "X-Trail", "Patrol", "Navara", "Sunny"] },
  { make: "Mazda", models: ["Demio", "Axela", "CX-5", "CX-3"] },
  { make: "Subaru", models: ["Impreza", "Forester", "Outback", "Legacy"] },
  { make: "Honda", models: ["Fit", "CR-V", "Accord", "Vezel"] },
  { make: "Mercedes-Benz", models: ["C-Class", "E-Class", "S-Class", "GLE", "GLC"] },
  { make: "BMW", models: ["3 Series", "5 Series", "X3", "X5"] },
  { make: "Isuzu", models: ["D-Max", "MU-X"] },
];

export default function NewCarRentalAdminPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<CarRentalBooking | null>(null);
  const [selectedMake, setSelectedMake] = useState<string>("");
  
  // Client search state
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isNewClient, setIsNewClient] = useState(true);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Fingerprint scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "matching" | "found" | "not-found">("idle");
  
  // Add Alert Dialog state
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertType, setAlertType] = useState<ClientAlertType>("warning");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [alertAmount, setAlertAmount] = useState("");
  const [newRiskLevel, setNewRiskLevel] = useState<"low" | "medium" | "high" | "blocked">("medium");
  
  // Quick booking form state
  const [showQuickBookingForm, setShowQuickBookingForm] = useState(false);
  
  // Blacklist dialog state
  const [showBlacklistDialog, setShowBlacklistDialog] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState("");
  
  // Client history state
  const [clientBookingHistory, setClientBookingHistory] = useState<Booking[]>([]);
  const [showClientHistory, setShowClientHistory] = useState(false);
  
  // Rogue client alert state
  const [rogueClientAlert, setRogueClientAlert] = useState<RogueClient | null>(null);
  const [showRogueAlert, setShowRogueAlert] = useState(false);
  
  // Initialize demo data on mount
  useEffect(() => {
    initializeDemoBookingHistory();
  }, []);
  
  // Fingerprint capture state for new clients
  const [leftThumbScanning, setLeftThumbScanning] = useState(false);
  const [rightThumbScanning, setRightThumbScanning] = useState(false);
  const [leftThumbCaptured, setLeftThumbCaptured] = useState(false);
  const [rightThumbCaptured, setRightThumbCaptured] = useState(false);

  const form = useForm<AdminCarRentalFormData>({
    resolver: zodResolver(adminCarRentalSchema),
    defaultValues: {
      fullName: "",
      idNumber: "",
      idPhotoFrontUrl: "",
    idPhotoBackUrl: "",
      drivingLicenseNumber: "",
      drivingLicenseFrontUrl: "",
    drivingLicenseBackUrl: "",
      placeOfWork: "",
      kraPin: "",
      residence: "",
      phone: "",
      alternativePhone: "",
      email: "",
      nextOfKinName: "",
      nextOfKinPhone: "",
      nextOfKinRelationship: "",
      fingerprintLeftUrl: "",
      fingerprintRightUrl: "",
      passportPhotoUrl: "",
      rentalType: "self-drive",
      carMake: "",
      carModel: "",
      numberPlate: "",
      currentMileage: "",
      fuelLevel: "Full",
      etcAmount: "",
      destination: "",
      numberOfDays: "",
      dailyRate: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      paymentMethod: "mpesa",
    },
  });

  const watchDailyRate = form.watch("dailyRate");
  const watchNumberOfDays = form.watch("numberOfDays");
  const watchRentalType = form.watch("rentalType");
  const watchPaymentMethod = form.watch("paymentMethod");
  const watchStartDate = form.watch("startDate");
  const watchStartTime = form.watch("startTime");

  // Auto-populate start date/time to current date/time on mount
  useEffect(() => {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Only set if not already set
    if (!form.getValues("startDate")) {
      form.setValue("startDate", currentDate);
    }
    if (!form.getValues("startTime")) {
      form.setValue("startTime", currentTime);
    }
  }, [form]);

  // Auto-calculate end date when start date or number of days changes
  useEffect(() => {
    const startDate = form.getValues("startDate");
    const numberOfDays = parseInt(form.getValues("numberOfDays") || "0");
    const startTime = form.getValues("startTime");
    
    if (startDate && numberOfDays > 0) {
      const start = new Date(startDate);
      start.setDate(start.getDate() + numberOfDays);
      const endDate = start.toISOString().split("T")[0];
      form.setValue("endDate", endDate);
      
      // Keep the same time for return
      if (startTime) {
        form.setValue("endTime", startTime);
      }
    }
  }, [watchStartDate, watchNumberOfDays, watchStartTime, form]);

  // Helper function to calculate days between dates
  const calculateDaysBetween = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateTotal = () => {
    const rate = parseFloat(watchDailyRate) || 0;
    const days = parseInt(watchNumberOfDays) || 0;
    let total = rate * days;
    // Add chauffeur fee if applicable
    if (watchRentalType === "chauffeured") {
      total += 2000 * days;
    }
    return total;
  };

  const onSubmit = async (data: AdminCarRentalFormData) => {
    setIsSubmitting(true);

    try {
      const total = calculateTotal();

      const booking: CarRentalBooking = {
        id: generateId(),
        serviceType: "car-rental",
        customerName: data.fullName,
        customerPhone: data.phone,
        customerEmail: data.email,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: data.paymentMethod,
        totalAmount: total,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rentalType: data.rentalType,
        personalDetails: {
          fullName: data.fullName,
          idNumber: data.idNumber,
          idPhotoUrl: data.idPhotoFrontUrl || undefined,
          drivingLicenseNumber: data.drivingLicenseNumber,
          drivingLicenseUrl: data.drivingLicenseFrontUrl || undefined,
          placeOfWork: data.placeOfWork,
          kraPin: data.kraPin,
          residence: data.residence,
          phone: data.phone,
          alternativePhone: data.alternativePhone || undefined,
          nextOfKin: {
            name: data.nextOfKinName,
            phone: data.nextOfKinPhone,
            relationship: data.nextOfKinRelationship,
          },
          fingerprintLeftUrl: data.fingerprintLeftUrl || undefined,
          fingerprintRightUrl: data.fingerprintRightUrl || undefined,
          passportPhotoUrl: data.passportPhotoUrl || undefined,
        },
        carDetails: {
          make: data.carMake,
          model: data.carModel,
          numberPlate: data.numberPlate,
          currentMileage: parseInt(data.currentMileage) || 0,
          fuelLevel: data.fuelLevel,
          etcAmount: parseFloat(data.etcAmount || "0") || 0,
          destination: data.destination,
        },
        rentalPeriod: {
          numberOfDays: parseInt(data.numberOfDays) || 0,
          dailyRate: parseFloat(data.dailyRate) || 0,
          startDate: data.startDate,
          startTime: data.startTime,
          endDate: data.endDate,
          endTime: data.endTime,
        },
      };

      saveBooking(booking);
      
      // Save or update client record for future bookings
      saveClientFromBooking(booking);
      
      setCurrentBooking(booking);
      setBookingComplete(true);
      toast.success("Car rental booking created successfully!");
    } catch (error) {
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success("Payment received! Booking confirmed.");
    setTimeout(() => {
      router.push("/admin/car-rental");
    }, 2000);
  };

  // Fingerprint scanning function
  const handleFingerprintScan = async () => {
    setIsScanning(true);
    setScanStatus("scanning");
    setScanProgress(0);
    
    // Simulate fingerprint scanning progress
    const scanInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    // Wait for scan to complete
    await new Promise((resolve) => setTimeout(resolve, 2500));
    clearInterval(scanInterval);
    setScanProgress(100);
    setScanStatus("matching");
    
    // Simulate matching against database
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Get all clients with fingerprints and randomly select one for demo
    const allClients = getClients();
    const clientsWithFingerprints = allClients.filter(
      (c) => c.fingerprintLeftUrl || c.fingerprintRightUrl
    );
    
    // For demo: randomly match a client (in real app, this would use actual fingerprint matching)
    // Simulate 70% match success rate
    const matchSuccess = Math.random() > 0.3;
    
    if (matchSuccess && allClients.length > 0) {
      // Select a random client for demo purposes
      const matchedClient = allClients[Math.floor(Math.random() * allClients.length)];
      setScanStatus("found");
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Auto-fill client details
      handleSelectClient(matchedClient);
      toast.success(`Fingerprint matched! Welcome back, ${matchedClient.fullName}`);
    } else {
      setScanStatus("not-found");
      toast.error("Fingerprint not found in database. Please register as new client.");
    }
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsScanning(false);
      setScanStatus("idle");
      setScanProgress(0);
    }, 3000);
  };

  // Client search function with rogue client check
  const handleClientSearch = (query: string) => {
    setClientSearchQuery(query);
    if (query.length >= 2) {
      // First, check if this matches any rogue clients
      const rogueMatches = searchRogueClients(query);
      if (rogueMatches.length > 0) {
        // Show alert for the most severe match
        const sortedByRisk = rogueMatches.sort((a, b) => {
          const severityOrder = { blacklisted: 0, fraud: 1, "high-risk": 2, warning: 3 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        });
        setRogueClientAlert(sortedByRisk[0]);
        setShowRogueAlert(true);
      }
      
      // Also search regular clients
      const results = searchClients(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
      setRogueClientAlert(null);
    }
  };

  // Select existing client and auto-fill form
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setIsNewClient(false);
    setShowSearchResults(false);
    setClientSearchQuery("");
    
    // Auto-fill form with client data
    form.setValue("fullName", client.fullName);
    form.setValue("idNumber", client.idNumber);
    form.setValue("idPhotoFrontUrl", client.idPhotoUrl || "");
    form.setValue("idPhotoBackUrl", "");
    form.setValue("drivingLicenseNumber", client.drivingLicenseNumber || "");
    form.setValue("drivingLicenseFrontUrl", client.drivingLicenseUrl || "");
    form.setValue("drivingLicenseBackUrl", "");
    form.setValue("placeOfWork", client.placeOfWork || "");
    form.setValue("kraPin", client.kraPin || "");
    form.setValue("residence", client.residence || "");
    form.setValue("phone", client.phone);
    form.setValue("alternativePhone", client.alternativePhone || "");
    form.setValue("email", client.email || "");
    form.setValue("nextOfKinName", client.nextOfKin?.name || "");
    form.setValue("nextOfKinPhone", client.nextOfKin?.phone || "");
    form.setValue("nextOfKinRelationship", client.nextOfKin?.relationship || "");
    form.setValue("fingerprintLeftUrl", client.fingerprintLeftUrl || "");
    form.setValue("fingerprintRightUrl", client.fingerprintRightUrl || "");
    form.setValue("passportPhotoUrl", client.passportPhotoUrl || "");
    
    // Load client booking history
    const history = getClientBookingHistory(client.idNumber);
    setClientBookingHistory(history);
    setShowClientHistory(true);
    
    toast.success(`Client "${client.fullName}" loaded! Previous bookings: ${client.totalBookings}`);
  };

  // Clear selected client and reset form for new client
  const handleNewClient = () => {
    setSelectedClient(null);
    setIsNewClient(true);
    form.reset();
    setSelectedMake("");
    toast.info("Form cleared for new client registration");
  };

  // Clear only booking details (vehicle, locations, dates) - keep client info
  const handleNewBookingForClient = () => {
    // Reset vehicle and booking fields only
    setSelectedMake("");
    form.setValue("vehicleMake", "");
    form.setValue("vehicleModel", "");
    form.setValue("rentalType", "self-drive");
    form.setValue("pickupLocation", "");
    form.setValue("dropoffLocation", "");
    form.setValue("pickupDate", "");
    form.setValue("pickupTime", "");
    form.setValue("returnDate", "");
    form.setValue("returnTime", "");
    form.setValue("specialRequests", "");
    toast.info("Booking details cleared - client info retained for new booking");
  };

  // Add alert to client
  const handleAddAlert = () => {
    if (!selectedClient || !alertTitle || !alertDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newAlert: ClientAlert = {
      id: generateId(),
      type: alertType,
      title: alertTitle,
      description: alertDescription,
      amount: alertAmount ? parseFloat(alertAmount) : undefined,
      date: new Date().toISOString(),
      resolved: false,
    };

    // Update client with new alert
    const updatedClient: Client = {
      ...selectedClient,
      alerts: [...(selectedClient.alerts || []), newAlert],
      riskLevel: newRiskLevel,
      totalDebt: alertType === "debt" && alertAmount 
        ? (selectedClient.totalDebt || 0) + parseFloat(alertAmount)
        : selectedClient.totalDebt,
      updatedAt: new Date().toISOString(),
    };

    // Save to store
    saveClient(updatedClient);
    setSelectedClient(updatedClient);

    // Reset form
    setShowAlertDialog(false);
    setAlertTitle("");
    setAlertDescription("");
    setAlertAmount("");
    setAlertType("warning");
    setNewRiskLevel("medium");

    toast.success(`Alert added to ${selectedClient.fullName}'s profile`);
  };

  // Capture fingerprint for new client registration
  const handleCaptureFingerprint = async (hand: "left" | "right") => {
    if (hand === "left") {
      setLeftThumbScanning(true);
    } else {
      setRightThumbScanning(true);
    }

    // Simulate fingerprint scanning progress
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate successful capture
    const capturedData = `fingerprint_${hand}_${Date.now()}`;
    
    if (hand === "left") {
      form.setValue("fingerprintLeftUrl", capturedData);
      setLeftThumbScanning(false);
      setLeftThumbCaptured(true);
      toast.success("Left thumb fingerprint captured successfully!");
    } else {
      form.setValue("fingerprintRightUrl", capturedData);
      setRightThumbScanning(false);
      setRightThumbCaptured(true);
      toast.success("Right thumb fingerprint captured successfully!");
    }
  };

  // Blacklist a client
  const handleBlacklistClient = () => {
    if (!selectedClient || !blacklistReason) {
      toast.error("Please provide a reason for blacklisting");
      return;
    }

    const blacklistAlert: ClientAlert = {
      id: generateId(),
      type: "blacklisted",
      title: "BLACKLISTED - DO NOT RENT",
      description: blacklistReason,
      date: new Date().toISOString(),
      resolved: false,
    };

    const updatedClient: Client = {
      ...selectedClient,
      alerts: [...(selectedClient.alerts || []), blacklistAlert],
      riskLevel: "blocked",
      notes: `BLACKLISTED: ${blacklistReason}${selectedClient.notes ? `\n\nPrevious notes: ${selectedClient.notes}` : ""}`,
      updatedAt: new Date().toISOString(),
    };

    saveClient(updatedClient);
    setSelectedClient(updatedClient);
    setShowBlacklistDialog(false);
    setBlacklistReason("");
    toast.error(`${selectedClient.fullName} has been BLACKLISTED`);
  };

  // Resolve an alert
  const handleResolveAlert = (alertId: string) => {
    if (!selectedClient) return;

    const updatedAlerts = selectedClient.alerts?.map(alert => 
      alert.id === alertId 
        ? { ...alert, resolved: true, resolvedDate: new Date().toISOString() }
        : alert
    );

    const updatedClient: Client = {
      ...selectedClient,
      alerts: updatedAlerts,
      updatedAt: new Date().toISOString(),
    };

    saveClient(updatedClient);
    setSelectedClient(updatedClient);
    toast.success("Alert marked as resolved");
  };

  // KRA PIN verification mock
  const verifyKraPin = () => {
    const kraPin = form.getValues("kraPin");
    if (kraPin && /^[A-Z]\d{9}[A-Z]$/.test(kraPin)) {
      toast.success("KRA PIN verified successfully!");
    } else {
      toast.error("Invalid KRA PIN format. Expected: A012345678A");
    }
  };

  // Show payment screen after form submission
  if (bookingComplete && currentBooking) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/admin/car-rental"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Car Rental
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Car className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Booking Created!</CardTitle>
            <CardDescription>
              Complete the payment process below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Booking Summary */}
            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="mb-3 font-semibold">Booking Summary</h3>
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Booking ID</dt>
                  <dd className="font-mono">{currentBooking.id.substring(0, 12)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Customer</dt>
                  <dd>{currentBooking.customerName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Vehicle</dt>
                  <dd>{currentBooking.carDetails.make} {currentBooking.carDetails.model}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Number Plate</dt>
                  <dd>{currentBooking.carDetails.numberPlate}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd>{currentBooking.rentalPeriod.numberOfDays} day(s)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pickup</dt>
                  <dd>{currentBooking.rentalPeriod.startDate} at {currentBooking.rentalPeriod.startTime}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Return</dt>
                  <dd>{currentBooking.rentalPeriod.endDate} at {currentBooking.rentalPeriod.endTime}</dd>
                </div>
                <Separator />
                <div className="flex justify-between pt-2">
                  <dt className="font-semibold">Total Amount</dt>
                  <dd className="font-semibold text-primary">
                    KES {currentBooking.totalAmount.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Payment Actions */}
            <div className="flex flex-col gap-3">
              {currentBooking.paymentMethod === "mpesa" ? (
                <MpesaPayment
                  bookingId={currentBooking.id}
                  amount={currentBooking.totalAmount}
                  defaultPhone={currentBooking.customerPhone}
                  onSuccess={handlePaymentSuccess}
                />
              ) : (
                <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
                  <p className="mb-2 font-medium">Bank Transfer Details</p>
                  <p className="text-sm text-muted-foreground">
                    Bank: KCB Bank
                    <br />
                    Account: Savannah Link Ltd
                    <br />
                    A/C No: 1234567890
                    <br />
                    Branch: Westlands
                  </p>
                  <Button onClick={handlePaymentSuccess} className="mt-4">
                    Mark as Paid
                  </Button>
                </div>
              )}
              <Button variant="outline" asChild>
                <Link href="/admin/car-rental">Back to Car Rental List</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/car-rental"
            className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Car Rental
          </Link>
          <h1 className="text-2xl font-bold text-foreground">New Car Rental Booking</h1>
          <p className="text-muted-foreground">
            Complete customer registration and vehicle assignment
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Client Search Section */}
          <Card className="border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <Search className="h-5 w-5" />
                Client Lookup
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-400">
                Search for returning clients by name, ID number, or phone number to auto-fill their details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600" />
                  <Input
                    placeholder="Search by name, ID number, or phone..."
                    value={clientSearchQuery}
                    onChange={(e) => handleClientSearch(e.target.value)}
                    className="pl-10 border-2 border-amber-400 bg-white text-gray-900 placeholder:text-gray-500 focus:border-amber-600 focus:ring-amber-500 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                  />
                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-[100] mt-2 max-h-80 overflow-auto rounded-lg border-4 border-amber-500 bg-white shadow-2xl dark:bg-gray-800">
                      <div className="bg-amber-500 text-white px-4 py-2 font-semibold text-sm">
                        Found {searchResults.length} client(s) - Click to select
                      </div>
                      {searchResults.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => handleSelectClient(client)}
                          className="flex w-full items-center gap-4 px-4 py-4 text-left bg-white hover:bg-amber-50 transition-colors border-b-2 border-amber-200 last:border-b-0 dark:bg-gray-800 dark:hover:bg-amber-900/30 dark:border-amber-700"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white flex-shrink-0">
                            <UserCheck className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg text-gray-900 dark:text-white truncate">{client.fullName}</p>
                            <p className="text-base text-gray-700 dark:text-gray-200">
                              ID: <span className="font-semibold">{client.idNumber}</span> | Tel: <span className="font-semibold">{client.phone}</span>
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-sm font-bold bg-amber-500 text-white px-3 py-1.5 rounded-full">
                              {client.totalBookings} booking{client.totalBookings !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {showSearchResults && searchResults.length === 0 && clientSearchQuery.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 z-[100] mt-2 rounded-lg border-4 border-red-400 bg-red-50 p-4 text-center shadow-2xl dark:bg-red-900/30 dark:border-red-600">
                      <p className="text-lg font-semibold text-red-700 dark:text-red-300">No clients found matching "{clientSearchQuery}"</p>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">Register as new client below</p>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={handleNewClient}
                  className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <UserPlus className="h-4 w-4" />
                  New Client
                </Button>
              </div>
              
              {/* Fingerprint Scanner Section */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex-1 h-px bg-amber-300" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">OR</span>
                <div className="flex-1 h-px bg-amber-300" />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Fingerprint Scanner Button */}
                <Button
                  type="button"
                  onClick={handleFingerprintScan}
                  disabled={isScanning}
                  className={`gap-3 h-16 px-6 text-lg font-semibold transition-all ${
                    scanStatus === "found" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : scanStatus === "not-found"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-purple-600 hover:bg-purple-700"
                  } text-white`}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      {scanStatus === "scanning" && "Scanning..."}
                      {scanStatus === "matching" && "Matching..."}
                      {scanStatus === "found" && "Found!"}
                      {scanStatus === "not-found" && "Not Found"}
                    </>
                  ) : (
                    <>
                      <Fingerprint className="h-6 w-6" />
                      Scan Fingerprint
                    </>
                  )}
                </Button>
                
                {/* Scan Progress */}
                {isScanning && (
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-purple-700 dark:text-purple-300">
                        {scanStatus === "scanning" && "Scanning fingerprint..."}
                        {scanStatus === "matching" && "Matching against database..."}
                        {scanStatus === "found" && "Client identified!"}
                        {scanStatus === "not-found" && "No match found"}
                      </span>
                      <span className="text-purple-600 dark:text-purple-400">{scanProgress}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-purple-100 dark:bg-purple-900 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 rounded-full ${
                          scanStatus === "found" 
                            ? "bg-green-500" 
                            : scanStatus === "not-found"
                            ? "bg-red-500"
                            : "bg-purple-500"
                        }`}
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    {scanStatus === "scanning" && (
                      <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-2">
                        <ScanLine className="h-4 w-4 animate-pulse" />
                        Place finger on scanner...
                      </p>
                    )}
                  </div>
                )}
                
                {!isScanning && (
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Returning clients can scan their fingerprint for instant identification
                  </p>
                )}
              </div>

              {/* Selected Client Banner */}
              {selectedClient && (
                <div className="space-y-3">
                  {/* Client Info Banner - Color based on risk level */}
                  <div className={`flex flex-col gap-3 rounded-lg border-2 p-4 ${
                    selectedClient.riskLevel === "blocked" 
                      ? "border-red-600 bg-red-100 dark:bg-red-900/40" 
                      : selectedClient.riskLevel === "high"
                      ? "border-orange-500 bg-orange-100 dark:bg-orange-900/40"
                      : selectedClient.riskLevel === "medium"
                      ? "border-yellow-500 bg-yellow-100 dark:bg-yellow-900/40"
                      : "border-green-500 bg-green-100 dark:bg-green-900/40"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${
                        selectedClient.riskLevel === "blocked" 
                          ? "bg-red-600" 
                          : selectedClient.riskLevel === "high"
                          ? "bg-orange-500"
                          : selectedClient.riskLevel === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}>
                        {selectedClient.riskLevel === "blocked" ? (
                          <Ban className="h-6 w-6" />
                        ) : selectedClient.riskLevel === "high" ? (
                          <ShieldAlert className="h-6 w-6" />
                        ) : selectedClient.riskLevel === "medium" ? (
                          <AlertTriangle className="h-6 w-6" />
                        ) : (
                          <UserCheck className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-bold text-lg ${
                            selectedClient.riskLevel === "blocked" 
                              ? "text-red-800 dark:text-red-300" 
                              : selectedClient.riskLevel === "high"
                              ? "text-orange-800 dark:text-orange-300"
                              : selectedClient.riskLevel === "medium"
                              ? "text-yellow-800 dark:text-yellow-300"
                              : "text-green-800 dark:text-green-300"
                          }`}>
                            {selectedClient.fullName}
                          </p>
                          {selectedClient.riskLevel && selectedClient.riskLevel !== "low" && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                              selectedClient.riskLevel === "blocked" 
                                ? "bg-red-600 text-white" 
                                : selectedClient.riskLevel === "high"
                                ? "bg-orange-500 text-white"
                                : "bg-yellow-500 text-black"
                            }`}>
                              {selectedClient.riskLevel} risk
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${
                          selectedClient.riskLevel === "blocked" 
                            ? "text-red-700 dark:text-red-400" 
                            : selectedClient.riskLevel === "high"
                            ? "text-orange-700 dark:text-orange-400"
                            : selectedClient.riskLevel === "medium"
                            ? "text-yellow-700 dark:text-yellow-400"
                            : "text-green-700 dark:text-green-400"
                        }`}>
                          ID: {selectedClient.idNumber} | {selectedClient.totalBookings} previous booking(s)
                          {selectedClient.totalDebt && selectedClient.totalDebt > 0 && (
                            <span className="ml-2 font-bold text-red-600">
                              | Debt: KES {selectedClient.totalDebt.toLocaleString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-auto">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          handleNewBookingForClient();
                          setShowQuickBookingForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={selectedClient.riskLevel === "blocked"}
                      >
                        <Car className="h-4 w-4 mr-1" />
                        New Vehicle/Trip
                      </Button>
                      {selectedClient.riskLevel !== "blocked" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowBlacklistDialog(true)}
                          className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Blacklist
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleNewClient}
                      >
                        Different Client
                      </Button>
                    </div>
                  </div>
                  
                  {/* Quick Booking Form */}
                  {showQuickBookingForm && (
                    <div className="rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/30 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                          <Car className="h-5 w-5" />
                          Quick Booking - New Vehicle/Trip
                        </h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowQuickBookingForm(false)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Vehicle Make */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle Make *</label>
                          <Select 
                            value={selectedMake} 
                            onValueChange={(value) => {
                              setSelectedMake(value);
                              form.setValue("vehicleMake", value);
                              form.setValue("vehicleModel", "");
                            }}
                          >
                            <SelectTrigger className="bg-white dark:bg-gray-800">
                              <SelectValue placeholder="Select make" />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicleData.map((vehicle) => (
                                <SelectItem key={vehicle.make} value={vehicle.make}>
                                  {vehicle.make}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Vehicle Model */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle Model *</label>
                          <Select 
                            value={form.watch("vehicleModel")} 
                            onValueChange={(value) => form.setValue("vehicleModel", value)}
                            disabled={!selectedMake}
                          >
                            <SelectTrigger className="bg-white dark:bg-gray-800">
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedMake && vehicleData
                                .find((v) => v.make === selectedMake)
                                ?.models.map((model) => (
                                  <SelectItem key={model} value={model}>
                                    {model}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Rental Type */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rental Type *</label>
                          <Select 
                            value={form.watch("rentalType")} 
                            onValueChange={(value) => form.setValue("rentalType", value as "self-drive" | "chauffeur-driven")}
                          >
                            <SelectTrigger className="bg-white dark:bg-gray-800">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="self-drive">Self Drive</SelectItem>
                              <SelectItem value="chauffeur-driven">Chauffeur Driven</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Pickup Location */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Pickup Location *</label>
                          <Input 
                            placeholder="e.g., JKIA Airport"
                            value={form.watch("pickupLocation") || ""}
                            onChange={(e) => form.setValue("pickupLocation", e.target.value)}
                            className="bg-white dark:bg-gray-800"
                          />
                        </div>
                        
                        {/* Dropoff Location */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dropoff Location *</label>
                          <Input 
                            placeholder="e.g., Nairobi CBD"
                            value={form.watch("dropoffLocation") || ""}
                            onChange={(e) => form.setValue("dropoffLocation", e.target.value)}
                            className="bg-white dark:bg-gray-800"
                          />
                        </div>
                        
                        {/* Pickup Date */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Pickup Date *</label>
                          <Input 
                            type="date"
                            value={form.watch("pickupDate") || ""}
                            onChange={(e) => form.setValue("pickupDate", e.target.value)}
                            className="bg-white dark:bg-gray-800"
                          />
                        </div>
                        
                        {/* Pickup Time */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Pickup Time *</label>
                          <Input 
                            type="time"
                            value={form.watch("pickupTime") || ""}
                            onChange={(e) => form.setValue("pickupTime", e.target.value)}
                            className="bg-white dark:bg-gray-800"
                          />
                        </div>
                        
                        {/* Return Date */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Return Date *</label>
                          <Input 
                            type="date"
                            value={form.watch("returnDate") || ""}
                            onChange={(e) => form.setValue("returnDate", e.target.value)}
                            className="bg-white dark:bg-gray-800"
                          />
                        </div>
                        
                        {/* Return Time */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Return Time *</label>
                          <Input 
                            type="time"
                            value={form.watch("returnTime") || ""}
                            onChange={(e) => form.setValue("returnTime", e.target.value)}
                            className="bg-white dark:bg-gray-800"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowQuickBookingForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            setShowQuickBookingForm(false);
                            toast.success("Vehicle and trip details saved! Continue filling the form below.");
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Apply & Continue
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* BLOCKED CLIENT WARNING */}
                  {selectedClient.riskLevel === "blocked" && (
                    <div className="rounded-lg border-4 border-red-600 bg-red-600 p-4 text-white animate-pulse">
                      <div className="flex items-center gap-3">
                        <Ban className="h-10 w-10 flex-shrink-0" />
                        <div>
                          <p className="text-xl font-bold uppercase">DO NOT RENT TO THIS CLIENT</p>
                          <p className="text-sm opacity-90">This client has been blacklisted. Contact management immediately.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Client Alerts Section */}
                  <div className="rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h4 className="font-bold text-gray-800 dark:text-gray-200">
                          Client Alerts {selectedClient.alerts && selectedClient.alerts.filter(a => !a.resolved).length > 0 && (
                            <span className="ml-2 text-red-600">({selectedClient.alerts.filter(a => !a.resolved).length} active)</span>
                          )}
                        </h4>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setShowAlertDialog(true)}
                        className="bg-red-600 hover:bg-red-700 text-white gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Alert
                      </Button>
                    </div>
                    
                    {/* Active Alerts List */}
                    {selectedClient.alerts && selectedClient.alerts.filter(a => !a.resolved).length > 0 ? (
                      <div className="space-y-2">
                        {selectedClient.alerts.filter(a => !a.resolved).map((alert) => (
                          <div 
                            key={alert.id} 
                            className={`flex items-start gap-3 rounded-lg p-3 ${
                              alert.type === "blacklisted" || alert.type === "fraud"
                                ? "bg-red-200 dark:bg-red-900/50 border border-red-400"
                                : alert.type === "debt"
                                ? "bg-orange-100 dark:bg-orange-900/30 border border-orange-300"
                                : alert.type === "damage"
                                ? "bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300"
                                : "bg-gray-100 dark:bg-gray-800 border border-gray-300"
                            }`}
                          >
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${
                              alert.type === "blacklisted" || alert.type === "fraud"
                                ? "bg-red-600 text-white"
                                : alert.type === "debt"
                                ? "bg-orange-500 text-white"
                                : alert.type === "damage"
                                ? "bg-yellow-500 text-black"
                                : alert.type === "late-return"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-500 text-white"
                            }`}>
                              {alert.type === "debt" && <DollarSign className="h-4 w-4" />}
                              {alert.type === "damage" && <XCircle className="h-4 w-4" />}
                              {alert.type === "late-return" && <Clock className="h-4 w-4" />}
                              {alert.type === "fraud" && <ShieldAlert className="h-4 w-4" />}
                              {alert.type === "blacklisted" && <Ban className="h-4 w-4" />}
                              {alert.type === "warning" && <AlertCircle className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-900 dark:text-white">{alert.title}</p>
                                {alert.amount && (
                                  <span className="text-sm font-bold text-red-600 bg-red-100 dark:bg-red-900 px-2 py-0.5 rounded">
                                    KES {alert.amount.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{alert.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Reported: {new Date(alert.date).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveAlert(alert.id)}
                              className="text-green-600 border-green-500 hover:bg-green-100 dark:hover:bg-green-900 flex-shrink-0"
                            >
                              Resolve
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                        No active alerts for this client. Click "Add Alert" to report an issue.
                      </p>
                    )}
                  </div>

                  {/* Client Notes */}
                  {selectedClient.notes && (
                    <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/30 p-3">
                      <div className="flex items-start gap-2">
                        <FileWarning className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Staff Notes:</p>
                          <p className="text-sm text-blue-700 dark:text-blue-400">{selectedClient.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Client Booking History Timeline */}
                  {showClientHistory && (
                    <div className="rounded-lg border-2 border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/30 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          <h4 className="font-bold text-indigo-800 dark:text-indigo-300">
                            Booking History
                            <span className="ml-2 text-sm font-normal text-indigo-600 dark:text-indigo-400">
                              ({clientBookingHistory.length} records)
                            </span>
                          </h4>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowClientHistory(false)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {clientBookingHistory.length > 0 ? (
                        <Tabs defaultValue="timeline" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="timeline" className="gap-2">
                              <History className="h-4 w-4" />
                              Timeline View
                            </TabsTrigger>
                            <TabsTrigger value="summary" className="gap-2">
                              <Eye className="h-4 w-4" />
                              Summary
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="timeline" className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {clientBookingHistory.map((booking, index) => (
                              <div 
                                key={booking.id}
                                className="relative pl-6 pb-4 border-l-2 border-indigo-300 dark:border-indigo-600 last:border-l-0 last:pb-0"
                              >
                                {/* Timeline dot */}
                                <div className={`absolute -left-2 top-0 h-4 w-4 rounded-full border-2 ${
                                  booking.status === "completed" 
                                    ? "bg-green-500 border-green-300"
                                    : booking.status === "cancelled"
                                    ? "bg-red-500 border-red-300"
                                    : "bg-amber-500 border-amber-300"
                                }`} />
                                
                                <div className={`rounded-lg p-4 ${
                                  booking.paymentStatus === "paid"
                                    ? "bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800"
                                    : booking.paymentStatus === "partial"
                                    ? "bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800"
                                    : "bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800"
                                }`}>
                                  {/* Header */}
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <p className="font-bold text-gray-900 dark:text-white">
                                        {booking.vehicleDetails?.make} {booking.vehicleDetails?.model}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Booking #{booking.id.slice(-8).toUpperCase()}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                        booking.status === "completed"
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                                          : booking.status === "cancelled"
                                          ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                                      }`}>
                                        {booking.status?.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Trip Details */}
                                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                      <MapPin className="h-3 w-3" />
                                      <span className="truncate">{booking.tripDetails?.pickupLocation}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                      <MapPin className="h-3 w-3 text-red-500" />
                                      <span className="truncate">{booking.tripDetails?.dropoffLocation}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Date & Payment */}
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1 text-gray-500">
                                      <Calendar className="h-3 w-3" />
                                      <span>
                                        {new Date(booking.tripDetails?.pickupDate || "").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                        {" - "}
                                        {new Date(booking.tripDetails?.returnDate || "").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`font-bold ${
                                        booking.paymentStatus === "paid"
                                          ? "text-green-600"
                                          : booking.paymentStatus === "partial"
                                          ? "text-amber-600"
                                          : "text-red-600"
                                      }`}>
                                        KES {booking.totalAmount?.toLocaleString() || 0}
                                      </span>
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                                        booking.paymentStatus === "paid"
                                          ? "bg-green-100 text-green-700"
                                          : booking.paymentStatus === "partial"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-red-100 text-red-700"
                                      }`}>
                                        {booking.paymentStatus?.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </TabsContent>
                          
                          <TabsContent value="summary">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-xs text-muted-foreground">Total Bookings</p>
                                <p className="text-2xl font-bold">
                                  {clientBookingHistory.length}
                                </p>
                              </div>
                              <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-xs text-muted-foreground">Total Spent</p>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                  KES {clientBookingHistory.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()}
                                </p>
                              </div>
                              <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-xs text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                  {clientBookingHistory.filter(b => b.status === "completed").length}
                                </p>
                              </div>
                              <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-xs text-muted-foreground">Unpaid Balance</p>
                                <p className="text-lg font-bold text-destructive">
                                  KES {clientBookingHistory
                                    .filter(b => b.paymentStatus !== "paid")
                                    .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
                                    .toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4 rounded-lg bg-muted/50 p-3">
                              <p className="text-xs text-muted-foreground mb-2">Frequently Rented Vehicles</p>
                              <div className="flex flex-wrap gap-2">
                                {Array.from(new Set(clientBookingHistory.map(b => `${b.vehicleDetails?.make} ${b.vehicleDetails?.model}`))).slice(0, 5).map((vehicle, i) => (
                                  <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                    {vehicle}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mt-3 rounded-lg bg-muted/50 p-3">
                              <p className="text-xs text-muted-foreground mb-2">Frequent Destinations</p>
                              <div className="flex flex-wrap gap-2">
                                {Array.from(new Set(clientBookingHistory.map(b => b.tripDetails?.dropoffLocation))).filter(Boolean).slice(0, 5).map((dest, i) => (
                                  <span key={i} className="text-xs bg-muted text-foreground px-2 py-1 rounded-full flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {dest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No booking history found for this client.</p>
                          <p className="text-sm">This appears to be their first booking.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 1: Personal Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Customer Registration
                {selectedClient && (
                  <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                    Auto-filled
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Customer identification and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Information
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (M-Pesa) *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="0712345678" {...field} />
                        </FormControl>
                        <FormDescription>Primary M-Pesa registered number</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="alternativePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alternative Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="0722333444" {...field} />
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
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* ID Documents */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  ID / Passport Documents
                </h4>
                <FormField
                  control={form.control}
                  name="idNumber"
                  render={({ field }) => (
                    <FormItem className="max-w-xs">
                      <FormLabel>ID/Passport Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" className="font-mono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="idPhotoFrontUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FileUpload
                          id="id-photo-front"
                          label="ID/Passport - Front Side"
                          accept="image/*"
                          maxSize={5}
                          value={field.value}
                          onChange={field.onChange}
                          showCamera
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idPhotoBackUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FileUpload
                          id="id-photo-back"
                          label="ID/Passport - Back Side"
                          accept="image/*"
                          maxSize={5}
                          value={field.value}
                          onChange={field.onChange}
                          showCamera
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Driving License */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Driving License
                </h4>
                <FormField
                  control={form.control}
                  name="drivingLicenseNumber"
                  render={({ field }) => (
                    <FormItem className="max-w-xs">
                      <FormLabel>Driving License Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="DL123456" className="font-mono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="drivingLicenseFrontUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FileUpload
                          id="driving-license-front"
                          label="Driving License - Front Side"
                          accept="image/*"
                          maxSize={5}
                          value={field.value}
                          onChange={field.onChange}
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
                          id="driving-license-back"
                          label="Driving License - Back Side"
                          accept="image/*"
                          maxSize={5}
                          value={field.value}
                          onChange={field.onChange}
                          showCamera
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Work & Residence */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Work & Residence
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="placeOfWork"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Place of Work *</FormLabel>
                        <FormControl>
                          <Input placeholder="Company Name, Location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="residence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Residence/Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="Estate, Building, Area" {...field} />
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
                        <FormLabel>KRA PIN *</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="A012345678A" className="font-mono" {...field} />
                          </FormControl>
                          <Button type="button" variant="outline" size="sm" onClick={verifyKraPin}>
                            Verify
                          </Button>
                        </div>
                        <FormDescription>Format: A012345678A</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Emergency Contact / Next of Kin
                </h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="nextOfKinName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Wanjiku" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nextOfKinPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="0712345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nextOfKinRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Spouse">Spouse</SelectItem>
                            <SelectItem value="Parent">Parent</SelectItem>
                            <SelectItem value="Sibling">Sibling</SelectItem>
                            <SelectItem value="Child">Child</SelectItem>
                            <SelectItem value="Friend">Friend</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Biometric & Photo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-primary" />
                Biometric & Photo
              </CardTitle>
              <CardDescription>
                Scan fingerprints and capture passport photo for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-3">
                {/* Left Thumb Fingerprint Scanner */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Left Thumb Print *</label>
                  <div className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-6 transition-all ${
                    leftThumbCaptured 
                      ? "border-green-500 bg-green-50 dark:bg-green-950/30" 
                      : leftThumbScanning
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 animate-pulse"
                      : "border-dashed border-gray-300 bg-gray-50 dark:bg-gray-900 hover:border-purple-400 hover:bg-purple-50/50"
                  }`}>
                    {leftThumbCaptured ? (
                      <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white mb-3">
                          <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">Captured Successfully</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setLeftThumbCaptured(false);
                            form.setValue("fingerprintLeftUrl", "");
                          }}
                          className="mt-2 text-green-600 hover:text-green-800"
                        >
                          Re-scan
                        </Button>
                      </>
                    ) : leftThumbScanning ? (
                      <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 text-white mb-3">
                          <Fingerprint className="h-8 w-8 animate-pulse" />
                        </div>
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Scanning...</p>
                        <p className="text-xs text-purple-600 dark:text-purple-500">Place left thumb on scanner</p>
                        <div className="mt-2 h-2 w-full max-w-[120px] rounded-full bg-purple-200 overflow-hidden">
                          <div className="h-full bg-purple-500 animate-[scan_2s_ease-in-out_infinite]" style={{width: '100%'}} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 mb-3">
                          <Fingerprint className="h-8 w-8" />
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleCaptureFingerprint("left")}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <ScanLine className="h-4 w-4 mr-2" />
                          Scan Left Thumb
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Thumb Fingerprint Scanner */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Right Thumb Print *</label>
                  <div className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-6 transition-all ${
                    rightThumbCaptured 
                      ? "border-green-500 bg-green-50 dark:bg-green-950/30" 
                      : rightThumbScanning
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 animate-pulse"
                      : "border-dashed border-gray-300 bg-gray-50 dark:bg-gray-900 hover:border-purple-400 hover:bg-purple-50/50"
                  }`}>
                    {rightThumbCaptured ? (
                      <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white mb-3">
                          <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">Captured Successfully</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRightThumbCaptured(false);
                            form.setValue("fingerprintRightUrl", "");
                          }}
                          className="mt-2 text-green-600 hover:text-green-800"
                        >
                          Re-scan
                        </Button>
                      </>
                    ) : rightThumbScanning ? (
                      <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 text-white mb-3">
                          <Fingerprint className="h-8 w-8 animate-pulse" />
                        </div>
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Scanning...</p>
                        <p className="text-xs text-purple-600 dark:text-purple-500">Place right thumb on scanner</p>
                        <div className="mt-2 h-2 w-full max-w-[120px] rounded-full bg-purple-200 overflow-hidden">
                          <div className="h-full bg-purple-500 animate-[scan_2s_ease-in-out_infinite]" style={{width: '100%'}} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 mb-3">
                          <Fingerprint className="h-8 w-8" />
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleCaptureFingerprint("right")}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <ScanLine className="h-4 w-4 mr-2" />
                          Scan Right Thumb
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Passport Photo - Keep as upload/camera */}
                <FormField
                  control={form.control}
                  name="passportPhotoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FileUpload
                        id="passport-photo"
                        label="Passport Photo"
                        accept="image/*"
                        maxSize={2}
                        value={field.value}
                        onChange={field.onChange}
                        showCamera
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Rental Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Rental Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="rentalType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid gap-4 sm:grid-cols-2"
                      >
                        <div className="relative flex cursor-pointer items-start gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                          <RadioGroupItem value="self-drive" id="admin-self-drive" className="mt-1" />
                          <div className="flex-1">
                            <label htmlFor="admin-self-drive" className="block cursor-pointer font-medium">
                              Self-Drive
                            </label>
                            <p className="text-sm text-muted-foreground">
                              Customer drives the vehicle themselves
                            </p>
                          </div>
                        </div>
                        <div className="relative flex cursor-pointer items-start gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                          <RadioGroupItem value="chauffeured" id="admin-chauffeured" className="mt-1" />
                          <div className="flex-1">
                            <label htmlFor="admin-chauffeured" className="block cursor-pointer font-medium">
                              Chauffeured
                            </label>
                            <p className="text-sm text-muted-foreground">
                              Professional driver (+KES 2,000/day)
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section 4: Car Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Car Details
              </CardTitle>
              <CardDescription>
                Vehicle information and current status
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="carMake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedMake(value);
                          form.setValue("carModel", "");
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select make" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {carOptions.map((car) => (
                            <SelectItem key={car.make} value={car.make}>
                              {car.make}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="carModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {carOptions
                            .find((c) => c.make === selectedMake)
                            ?.models.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberPlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number Plate *</FormLabel>
                      <FormControl>
                        <Input placeholder="KBX 123A" className="font-mono uppercase" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Vehicle Status */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Vehicle Status
                </h4>
                <div className="grid gap-4 sm:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="currentMileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Mileage (km) *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="45000" className="font-mono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fuelLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Fuel className="h-3 w-3" />
                          Fuel Level *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fuelLevels.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="etcAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ETC Amount (KES)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="500" className="font-mono" {...field} />
                        </FormControl>
                        <FormDescription>Electronic toll amount</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Destination *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Mombasa / Local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Rental Period & Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Rental Period & Pricing
              </CardTitle>
              <CardDescription>
                Set duration and daily rate for this booking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pricing Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Pricing Details
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="numberOfDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Days *</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" placeholder="3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dailyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Rate (KES) *</FormLabel>
                        <FormControl>
                          <Input type="number" min="1000" placeholder="5000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Dates & Times */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Dates & Times</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date *</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              min={new Date().toISOString().split("T")[0]}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time *</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date *</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                // Auto-calculate number of days when end date is manually changed
                                const startDate = form.getValues("startDate");
                                if (startDate && e.target.value) {
                                  const days = calculateDaysBetween(startDate, e.target.value);
                                  if (days > 0) {
                                    form.setValue("numberOfDays", days.toString());
                                  }
                                }
                              }}
                              min={form.getValues("startDate") || undefined}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time *</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Price Summary */}
              {calculateTotal() > 0 && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-3 font-medium">Price Summary</h4>
                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">
                        KES {watchDailyRate} x {watchNumberOfDays} day(s)
                      </dt>
                      <dd>KES {(parseFloat(watchDailyRate || "0") * parseInt(watchNumberOfDays || "0")).toLocaleString()}</dd>
                    </div>
                    {watchRentalType === "chauffeured" && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">
                          Chauffeur fee (KES 2,000 x {watchNumberOfDays} days)
                        </dt>
                        <dd>KES {(2000 * parseInt(watchNumberOfDays || "0")).toLocaleString()}</dd>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between pt-2 text-lg font-semibold">
                      <dt>Total Amount</dt>
                      <dd className="text-primary">KES {calculateTotal().toLocaleString()}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 6: Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid gap-4 sm:grid-cols-2"
                      >
                        <div className="relative flex cursor-pointer items-start gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                          <RadioGroupItem value="mpesa" id="payment-mpesa" className="mt-1" />
                          <div className="flex-1">
                            <label htmlFor="payment-mpesa" className="block cursor-pointer font-medium">
                              M-Pesa
                            </label>
                            <p className="text-sm text-muted-foreground">
                              Pay via Lipa Na M-Pesa
                            </p>
                          </div>
                        </div>
                        <div className="relative flex cursor-pointer items-start gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                          <RadioGroupItem value="bank" id="payment-bank" className="mt-1" />
                          <div className="flex-1">
                            <label htmlFor="payment-bank" className="block cursor-pointer font-medium">
                              Bank Transfer
                            </label>
                            <p className="text-sm text-muted-foreground">
                              Direct bank deposit/transfer
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/car-rental">Cancel</Link>
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Creating Booking..." : "Create Booking & Proceed to Payment"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Add Alert Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Add Client Alert
            </DialogTitle>
            <DialogDescription>
              Record an issue with this client to alert other staff members.
              {selectedClient && (
                <span className="block mt-1 font-medium text-foreground">
                  Client: {selectedClient.fullName} (ID: {selectedClient.idNumber})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Alert Type */}
            <div className="space-y-2">
              <Label htmlFor="alertType">Alert Type *</Label>
              <Select value={alertType} onValueChange={(v) => setAlertType(v as ClientAlertType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select alert type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debt">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-orange-500" />
                      Debt / Outstanding Payment
                    </div>
                  </SelectItem>
                  <SelectItem value="damage">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-yellow-500" />
                      Vehicle Damage
                    </div>
                  </SelectItem>
                  <SelectItem value="late-return">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Late Return
                    </div>
                  </SelectItem>
                  <SelectItem value="warning">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-gray-500" />
                      General Warning
                    </div>
                  </SelectItem>
                  <SelectItem value="fraud">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                      Fraud / Suspicious Activity
                    </div>
                  </SelectItem>
                  <SelectItem value="blacklisted">
                    <div className="flex items-center gap-2">
                      <Ban className="h-4 w-4 text-red-600" />
                      Blacklist Client
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Alert Title */}
            <div className="space-y-2">
              <Label htmlFor="alertTitle">Alert Title *</Label>
              <Input
                id="alertTitle"
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                placeholder="e.g., Outstanding balance from Nov rental"
                className="border-gray-300"
              />
            </div>

            {/* Amount (for debt/damage) */}
            {(alertType === "debt" || alertType === "damage") && (
              <div className="space-y-2">
                <Label htmlFor="alertAmount">Amount (KES)</Label>
                <Input
                  id="alertAmount"
                  type="number"
                  value={alertAmount}
                  onChange={(e) => setAlertAmount(e.target.value)}
                  placeholder="e.g., 15000"
                  className="border-gray-300"
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="alertDescription">Description *</Label>
              <Textarea
                id="alertDescription"
                value={alertDescription}
                onChange={(e) => setAlertDescription(e.target.value)}
                placeholder="Provide details about the incident..."
                rows={3}
                className="border-gray-300"
              />
            </div>

            {/* Update Risk Level */}
            <div className="space-y-2">
              <Label>Update Client Risk Level</Label>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  type="button"
                  variant={newRiskLevel === "low" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewRiskLevel("low")}
                  className={newRiskLevel === "low" ? "bg-green-600 hover:bg-green-700" : "border-green-500 text-green-600"}
                >
                  Low
                </Button>
                <Button
                  type="button"
                  variant={newRiskLevel === "medium" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewRiskLevel("medium")}
                  className={newRiskLevel === "medium" ? "bg-yellow-500 hover:bg-yellow-600" : "border-yellow-500 text-yellow-600"}
                >
                  Medium
                </Button>
                <Button
                  type="button"
                  variant={newRiskLevel === "high" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewRiskLevel("high")}
                  className={newRiskLevel === "high" ? "bg-orange-500 hover:bg-orange-600" : "border-orange-500 text-orange-600"}
                >
                  High
                </Button>
                <Button
                  type="button"
                  variant={newRiskLevel === "blocked" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewRiskLevel("blocked")}
                  className={newRiskLevel === "blocked" ? "bg-red-600 hover:bg-red-700" : "border-red-500 text-red-600"}
                >
                  Block
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {newRiskLevel === "blocked" && "Warning: Blocked clients cannot make any new bookings."}
                {newRiskLevel === "high" && "High risk clients require manager approval for bookings."}
                {newRiskLevel === "medium" && "Medium risk clients should be monitored closely."}
                {newRiskLevel === "low" && "Low risk - normal client status."}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAlertDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddAlert}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!alertTitle || !alertDescription}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Add Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blacklist Client Dialog */}
      <Dialog open={showBlacklistDialog} onOpenChange={setShowBlacklistDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-6 w-6" />
              Blacklist Client
            </DialogTitle>
            <DialogDescription>
              This action will permanently block this client from making any future bookings.
              {selectedClient && (
                <span className="block mt-2 p-2 bg-red-50 dark:bg-red-950/50 rounded border border-red-200 dark:border-red-800">
                  <span className="font-bold text-red-700 dark:text-red-400">{selectedClient.fullName}</span>
                  <br />
                  <span className="text-sm text-red-600 dark:text-red-500">ID: {selectedClient.idNumber}</span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-300">
                  <p className="font-bold">Warning: This action is serious</p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-red-700 dark:text-red-400">
                    <li>Client will be blocked from all services</li>
                    <li>Staff will see a DO NOT RENT warning</li>
                    <li>This should only be used for serious violations</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="blacklistReason" className="text-red-700 dark:text-red-400">
                Reason for Blacklisting *
              </Label>
              <Textarea
                id="blacklistReason"
                value={blacklistReason}
                onChange={(e) => setBlacklistReason(e.target.value)}
                placeholder="Explain why this client is being blacklisted (e.g., fraud, theft, repeated violations)..."
                rows={4}
                className="border-red-300 focus:border-red-500 focus:ring-red-500"
              />
              <p className="text-xs text-muted-foreground">
                This reason will be visible to all staff members.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowBlacklistDialog(false);
                setBlacklistReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBlacklistClient}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!blacklistReason.trim()}
            >
              <Ban className="h-4 w-4 mr-2" />
              Confirm Blacklist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ROGUE CLIENT ALERT DIALOG */}
      <Dialog open={showRogueAlert} onOpenChange={setShowRogueAlert}>
        <DialogContent className="sm:max-w-[550px] border-4 border-red-600">
          <DialogHeader className="bg-red-600 -m-6 mb-0 p-6 rounded-t-lg">
            <DialogTitle className="flex items-center gap-3 text-white text-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 animate-pulse">
                <Skull className="h-7 w-7 text-white" />
              </div>
              ROGUE CLIENT ALERT
            </DialogTitle>
            <DialogDescription className="text-red-100 text-base">
              This person is flagged in the industry-wide rogue client database!
            </DialogDescription>
          </DialogHeader>
          
          {rogueClientAlert && (
            <div className="space-y-4 pt-4">
              {/* Severity Badge */}
              <div className="flex justify-center">
                <span className={`text-lg font-bold px-6 py-2 rounded-full ${
                  rogueClientAlert.severity === "blacklisted"
                    ? "bg-black text-white"
                    : rogueClientAlert.severity === "fraud"
                    ? "bg-red-600 text-white"
                    : rogueClientAlert.severity === "high-risk"
                    ? "bg-orange-500 text-white"
                    : "bg-yellow-500 text-black"
                }`}>
                  {rogueClientAlert.severity === "blacklisted" && "BLACKLISTED - DO NOT RENT"}
                  {rogueClientAlert.severity === "fraud" && "FRAUD ALERT"}
                  {rogueClientAlert.severity === "high-risk" && "HIGH RISK CLIENT"}
                  {rogueClientAlert.severity === "warning" && "PROCEED WITH CAUTION"}
                </span>
              </div>

              {/* Client Details */}
              <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border-2 border-red-300 dark:border-red-700 p-4">
                <h4 className="font-bold text-red-800 dark:text-red-300 text-lg mb-3">
                  {rogueClientAlert.fullName}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <FileText className="h-4 w-4" />
                    <span>ID: {rogueClientAlert.idNumber}</span>
                  </div>
                  {rogueClientAlert.phone && (
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                      <Phone className="h-4 w-4" />
                      <span>{rogueClientAlert.phone}</span>
                    </div>
                  )}
                  {rogueClientAlert.email && (
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 col-span-2">
                      <Mail className="h-4 w-4" />
                      <span>{rogueClientAlert.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4">
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Reason for Flag:
                </h5>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {rogueClientAlert.reason}
                </p>
              </div>

              {/* Incidents */}
              {rogueClientAlert.incidents && rogueClientAlert.incidents.length > 0 && (
                <div className="rounded-lg border border-gray-300 dark:border-gray-600 p-4">
                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Reported Incidents ({rogueClientAlert.incidents.length}):
                  </h5>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto">
                    {rogueClientAlert.incidents.map((incident, index) => (
                      <div key={incident.id} className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            incident.type === "theft" ? "bg-black text-white" :
                            incident.type === "fraud" ? "bg-red-600 text-white" :
                            incident.type === "damage" ? "bg-orange-500 text-white" :
                            incident.type === "non-payment" ? "bg-yellow-500 text-black" :
                            incident.type === "accident" ? "bg-purple-500 text-white" :
                            "bg-gray-500 text-white"
                          }`}>
                            {incident.type.toUpperCase().replace("-", " ")}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(incident.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{incident.description}</p>
                        {incident.amountOwed && incident.amountOwed > 0 && (
                          <p className="text-sm font-bold text-red-600 mt-1">
                            Amount Owed: KES {incident.amountOwed.toLocaleString()}
                          </p>
                        )}
                        {incident.vehicleInvolved && (
                          <p className="text-xs text-gray-500 mt-1">
                            Vehicle: {incident.vehicleInvolved}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          Reported by: {incident.reportedBy}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Amount Owed */}
              {rogueClientAlert.incidents && rogueClientAlert.incidents.some(i => i.amountOwed && i.amountOwed > 0) && (
                <div className="rounded-lg bg-red-100 dark:bg-red-900/50 p-3 text-center">
                  <p className="text-sm text-red-700 dark:text-red-400">Total Amount Owed (Industry-wide)</p>
                  <p className="text-2xl font-bold text-red-600">
                    KES {rogueClientAlert.incidents.reduce((sum, i) => sum + (i.amountOwed || 0), 0).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Reporter Info */}
              <div className="text-xs text-gray-500 text-center">
                Originally reported by <span className="font-semibold">{rogueClientAlert.reportedBy}</span> on{" "}
                {new Date(rogueClientAlert.reportedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRogueAlert(false)}
              className="flex-1"
            >
              Close & Continue Checking
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowRogueAlert(false);
                setClientSearchQuery("");
                setSearchResults([]);
                toast.error("Search cleared - DO NOT proceed with this client!");
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Ban className="h-4 w-4 mr-2" />
              Refuse Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
