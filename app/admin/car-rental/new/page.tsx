"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
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
  
  clientType: z.enum(["citizen", "foreigner"]).default("citizen"),
  countryCode: z.string().default("+254"),
  countryName: z.string().default("Kenya"),
  idType: z.enum(["national_id", "passport", "alien_id", "military_id"]).default("national_id"),
  countryCode: z.string().default("+254"),
  countryName: z.string().default("Kenya"),
  idType: z.enum(["national_id", "passport", "alien_id", "military_id"]).default("national_id"),
  // Payment Type
  paymentType: z.enum(["full", "partial"]).default("full"),
  depositAmount: z.string().optional(),
  // Payment Method
  paymentMethod: z.enum(["mpesa", "bank", "cash"]),
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

// Vehicle makes and models data
const vehicleData = [
  { make: "Toyota", models: ["Land Cruiser V8", "Land Cruiser Prado", "Fortuner", "Hilux", "RAV4", "Corolla", "Camry", "Fielder", "Premio", "Axio", "Vitz", "Noah", "Voxy", "Alphard", "Harrier", "C-HR"] },
  { make: "Nissan", models: ["X-Trail", "Patrol", "Navara", "Note", "Juke", "Qashqai", "Serena", "Tiida", "Wingroad", "Murano", "Pathfinder"] },
  { make: "Honda", models: ["CR-V", "HR-V", "Vezel", "Fit", "Civic", "Accord", "Odyssey", "Stepwagon", "Jazz"] },
  { make: "Mazda", models: ["CX-5", "CX-3", "CX-7", "Demio", "Axela", "Atenza", "BT-50", "MPV"] },
  { make: "Subaru", models: ["Forester", "Outback", "XV", "Impreza", "Legacy", "Levorg", "WRX"] },
  { make: "Mercedes-Benz", models: ["E-Class", "C-Class", "S-Class", "GLE", "GLC", "GLA", "A-Class", "V-Class", "Sprinter"] },
  { make: "BMW", models: ["X5", "X3", "X1", "3 Series", "5 Series", "7 Series", "X6", "X7"] },
  { make: "Audi", models: ["Q7", "Q5", "Q3", "A4", "A6", "A3", "A8", "e-tron"] },
  { make: "Land Rover", models: ["Range Rover", "Range Rover Sport", "Discovery", "Defender", "Evoque", "Velar"] },
  { make: "Mitsubishi", models: ["Pajero", "Outlander", "L200", "ASX", "Eclipse Cross", "Delica", "Colt"] },
  { make: "Isuzu", models: ["D-Max", "MU-X", "Trooper", "NQR", "FRR"] },
  { make: "Volkswagen", models: ["Tiguan", "Touareg", "Golf", "Passat", "Polo", "T-Cross", "Amarok"] },
  { make: "Ford", models: ["Ranger", "Everest", "Explorer", "Escape", "F-150", "Transit"] },
  { make: "Jeep", models: ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Renegade"] },
  { make: "Suzuki", models: ["Jimny", "Vitara", "Swift", "Alto", "Escudo", "S-Cross"] },
  { make: "Hyundai", models: ["Tucson", "Santa Fe", "Creta", "Elantra", "Sonata", "Palisade", "H-1"] },
  { make: "Kia", models: ["Sportage", "Sorento", "Seltos", "Carnival", "Picanto", "Rio", "Cerato"] },
  { make: "Peugeot", models: ["3008", "5008", "2008", "508", "308", "Partner"] },
  { make: "Porsche", models: ["Cayenne", "Macan", "Panamera", "911", "Taycan"] },
];


// Country list with phone codes
const COUNTRIES = [
  { name: "Kenya", code: "+254", flag: "" },
  { name: "Uganda", code: "+256", flag: "" },
  { name: "Tanzania", code: "+255", flag: "" },
  { name: "Rwanda", code: "+250", flag: "" },
  { name: "Ethiopia", code: "+251", flag: "" },
  { name: "Nigeria", code: "+234", flag: "" },
  { name: "South Africa", code: "+27", flag: "" },
  { name: "United Kingdom", code: "+44", flag: "" },
  { name: "United States", code: "+1", flag: "" },
  { name: "Germany", code: "+49", flag: "" },
  { name: "France", code: "+33", flag: "" },
  { name: "China", code: "+86", flag: "" },
  { name: "India", code: "+91", flag: "" },
  { name: "UAE", code: "+971", flag: "" },
  { name: "Saudi Arabia", code: "+966", flag: "" },
  { name: "Canada", code: "+1", flag: "" },
  { name: "Australia", code: "+61", flag: "" },
  { name: "Japan", code: "+81", flag: "" },
  { name: "Italy", code: "+39", flag: "" },
  { name: "Netherlands", code: "+31", flag: "" },
];

export default function NewCarRentalAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientIdFromUrl = searchParams.get("clientId");
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

  // Load existing client from URL parameter
  useEffect(() => {
    if (clientIdFromUrl) {
      const clients = getClients();
      const existingClient = clients.find(c => c.id === clientIdFromUrl);
      if (existingClient) {
        setSelectedClient(existingClient);
        setIsNewClient(false);
        // Load booking history for this client
        const history = getClientBookingHistory(existingClient.idNumber);
        setClientBookingHistory(history);
        toast.success(`Existing client loaded: ${existingClient.fullName} (${existingClient.totalBookings} previous bookings)`);
      }
    }
  }, [clientIdFromUrl]);
  
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
      clientType: "citizen",
      countryCode: "+254",
      countryName: "Kenya",
      idType: "national_id",
      countryCode: "+254",
      countryName: "Kenya",
      idType: "national_id",
      paymentType: "full",
      depositAmount: "",
      paymentType: "full",
      depositAmount: "",
      paymentMethod: "mpesa",
    },
  });

  const watchDailyRate = form.watch("dailyRate");
  const watchNumberOfDays = form.watch("numberOfDays");
  const watchRentalType = form.watch("rentalType");
  const watchPaymentMethod = form.watch("paymentMethod");
  const watchStartDate = form.watch("startDate");
  const watchStartTime = form.watch("startTime");

  // Pre-fill form when existing client is selected
  useEffect(() => {
    if (selectedClient && !isNewClient) {
      form.setValue("fullName", selectedClient.fullName);
      form.setValue("idNumber", selectedClient.idNumber);
      form.setValue("phone", selectedClient.phone);
      form.setValue("alternativePhone", selectedClient.alternativePhone || "");
      form.setValue("email", selectedClient.email || "");
      form.setValue("residence", selectedClient.residence || "");
      form.setValue("placeOfWork", selectedClient.placeOfWork || "");
      form.setValue("kraPin", selectedClient.kraPin || "");
      form.setValue("drivingLicenseNumber", selectedClient.drivingLicenseNumber || "");
      if (selectedClient.nextOfKin) {
        form.setValue("nextOfKinName", selectedClient.nextOfKin.name);
        form.setValue("nextOfKinPhone", selectedClient.nextOfKin.phone);
        form.setValue("nextOfKinRelationship", selectedClient.nextOfKin.relationship);
      }
      // Set fingerprint captured status if they exist
      if (selectedClient.leftFingerprint || selectedClient.fingerprintLeftUrl) {
        setLeftThumbCaptured(true);
      }
      if (selectedClient.rightFingerprint || selectedClient.fingerprintRightUrl) {
        setRightThumbCaptured(true);
      }
    }
  }, [selectedClient, isNewClient, form]);

  // Auto-populate start date/time and set end to 24hrs later
  useEffect(() => {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 5);
    if (!form.getValues("startDate")) form.setValue("startDate", currentDate);
    if (!form.getValues("startTime")) form.setValue("startTime", currentTime);
    if (!form.getValues("endDate")) {
      const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      form.setValue("endDate", end.toISOString().split("T")[0]);
      form.setValue("endTime", end.toTimeString().slice(0, 5));
    }
  }, [form]);

  // Auto-calculate end date/time from start + days (default 24hrs)
  useEffect(() => {
    const startDate = form.getValues("startDate");
    const startTime = form.getValues("startTime") || "00:00";
    const numberOfDays = parseInt(form.getValues("numberOfDays") || "0");
    if (!startDate) return;
    const start = new Date(startDate + "T" + startTime + ":00");
    if (isNaN(start.getTime())) return;
    const hrs = numberOfDays > 0 ? numberOfDays * 24 : 24;
    const end = new Date(start.getTime() + hrs * 60 * 60 * 1000);
    form.setValue("endDate", end.toISOString().split("T")[0]);
    form.setValue("endTime", end.toTimeString().slice(0, 5));
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

  // KRA PIN lookup - auto-fills client details from iTax
  // TODO: Replace mockKraLookup with real KRA iTax API call when credentials are available
  // API endpoint: https://itax.kra.go.ke/KRA-Portal/pinChecker.htm
  const [kraLookupLoading, setKraLookupLoading] = useState(false);
  const [kraVerified, setKraVerified] = useState(false);

  const mockKraLookup = (pin: string) => {
    // Simulated KRA iTax response - replace with real API
    const mockData: Record<string, {
      fullName: string; idNumber: string; phone: string;
      email: string; address: string; pinType: string;
    }> = {
      "A012345678A": { fullName: "John Kamau Mwangi", idNumber: "12345678", phone: "+254722000001", email: "john.kamau@email.com", address: "Westlands, Nairobi", pinType: "Individual" },
      "P012345678B": { fullName: "Jane Wanjiru Njoroge", idNumber: "23456789", phone: "+254733000002", email: "jane.wanjiru@email.com", address: "Kilimani, Nairobi", pinType: "Individual" },
    };
    return mockData[pin] || null;
  };

  const lookupKraPin = async () => {
    const kraPin = form.getValues("kraPin");
    if (!kraPin) { toast.error("Enter a KRA PIN first"); return; }
    if (!/^[A-Z]\d{9}[A-Z]$/.test(kraPin)) {
      toast.error("Invalid KRA PIN format. Expected: A012345678A");
      return;
    }

    setKraLookupLoading(true);
    setKraVerified(false);

    // Simulate API call delay
    await new Promise(r => setTimeout(r, 1200));

    try {
      // -- Real API call would go here --
      // const res = await fetch("/api/kra/lookup?pin=" + kraPin);
      // const data = await res.json();

      const data = mockKraLookup(kraPin);

      if (data) {
        form.setValue("fullName", data.fullName);
        form.setValue("idNumber", data.idNumber);
        form.setValue("phone", data.phone);
        if (data.email) form.setValue("email", data.email);
        setKraVerified(true);
        toast.success("KRA PIN verified - details auto-filled for " + data.fullName);
      } else {
        // PIN valid format but not found - still mark as verified format-wise
        setKraVerified(true);
        toast.info("KRA PIN format valid. No pre-existing record found - please fill details manually.");
      }
    } catch (err) {
      toast.error("KRA lookup failed. Please fill details manually.");
    } finally {
      setKraLookupLoading(false);
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
                    Account: Moventra Safaris & Logistics Ltd Ltd
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
            className="mb-2 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Car Rental
          </Link>
          <h1 className="text-2xl font-bold text-white">New Car Rental Booking</h1>
          <p className="text-gray-300">
            Complete customer registration and vehicle assignment
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Personal Details */}
          <Card className="border-l-4 border-l-blue-500 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-900/40 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    1. Customer Registration
                    {selectedClient && (
                      <span className="ml-2 text-xs font-normal text-green-600 bg-green-500/10 px-2 py-1 rounded-full">
                        Auto-filled from saved client
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Customer identification and contact information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Existing Client Banner - Shows when returning client is loaded */}
              {selectedClient && !isNewClient && (
                <div className={`rounded-lg border-2 p-4 ${
                  selectedClient.riskLevel === "blocked" 
                    ? "border-red-500 bg-red-50 dark:bg-red-950/50" 
                    : selectedClient.riskLevel === "high"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/50"
                    : selectedClient.riskLevel === "medium"
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50"
                    : "border-green-500 bg-green-50 dark:bg-green-950/50"
                }`}>
                  <div className="flex items-center justify-between flex-wrap gap-4">
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
                        ) : (
                          <UserCheck className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white flex items-center gap-2">
                          {selectedClient.fullName}
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            selectedClient.riskLevel === "blocked" 
                              ? "bg-red-600 text-white" 
                              : selectedClient.riskLevel === "high"
                              ? "bg-orange-500 text-white"
                              : selectedClient.riskLevel === "medium"
                              ? "bg-yellow-500 text-black"
                              : "bg-green-500 text-white"
                          }`}>
                            {selectedClient.riskLevel === "blocked" ? "BLOCKED" : `${selectedClient.riskLevel?.toUpperCase()} RISK`}
                          </span>
                        </h3>
                        <p className="text-sm text-gray-300 dark:text-gray-400">
                          ID: {selectedClient.idNumber} | Phone: {selectedClient.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center px-4 py-2 bg-[#0f1d32] rounded-lg shadow-sm">
                        <p className="text-2xl font-bold text-blue-600">{selectedClient.totalBookings || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Previous Bookings</p>
                      </div>
                      {clientBookingHistory.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowClientHistory(!showClientHistory)}
                          className="gap-2 border-[#e67e22] text-[#e67e22] hover:bg-[#e67e22] hover:text-white"
                        >
                          <History className="h-4 w-4" />
                          View History
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClient(null);
                          setIsNewClient(true);
                          setClientBookingHistory([]);
                          form.reset();
                          router.push("/admin/car-rental/new");
                        }}
                        className="gap-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                      >
                        <User className="h-4 w-4" />
                        Different Client
                      </Button>
                    </div>
                  </div>
                  {selectedClient.riskLevel === "blocked" && (
                    <div className="mt-4 p-3 bg-red-600 text-white rounded-lg flex items-center gap-3 animate-pulse">
                      <Ban className="h-6 w-6 flex-shrink-0" />
                      <div>
                        <p className="font-bold uppercase">DO NOT RENT TO THIS CLIENT</p>
                        <p className="text-sm opacity-90">This client has been blacklisted. Contact management immediately.</p>
                      </div>
                    </div>
                  )}
                  {selectedClient.totalDebt && selectedClient.totalDebt > 0 && (
                    <div className="mt-4 p-3 bg-orange-900/40 border border-orange-500 rounded-lg flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-orange-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-orange-400">Outstanding Debt: KES {selectedClient.totalDebt.toLocaleString()}</p>
                        <p className="text-sm text-orange-400">Client must clear balance before new rental</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Information Block */}
              <div className="rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-[#0f1d32] p-4 shadow-sm">
                <h4 className="font-semibold text-blue-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </h4>
                {/* Citizen / Foreigner Toggle */}
                <FormField
                  control={form.control}
                  name="clientType"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-gray-200">Client Type *</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <button type="button"
                            onClick={() => { field.onChange("citizen"); form.setValue("countryCode", "+254"); form.setValue("countryName", "Kenya"); form.setValue("idType", "national_id"); }}
                            className={`flex-1 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${field.value === "citizen" ? "border-blue-500 bg-blue-500/20 text-blue-300" : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"}`}>
                             Kenyan Citizen
                          </button>
                          <button type="button"
                            onClick={() => { field.onChange("foreigner"); form.setValue("idType", "passport"); }}
                            className={`flex-1 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${field.value === "foreigner" ? "border-amber-500 bg-amber-500/20 text-amber-300" : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"}`}>
                             Foreign National
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Country selector - shown for foreigners */}
                {form.watch("clientType") === "foreigner" && (
                  <div className="grid gap-4 sm:grid-cols-2 mb-4">
                    <FormField control={form.control} name="countryName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Country of Origin *</FormLabel>
                        <FormControl>
                          <select
                            className="w-full rounded-lg bg-[#0a1628] border border-amber-500/50 text-white p-2 text-sm"
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              const country = COUNTRIES.find(c => c.name === e.target.value);
                              if (country) form.setValue("countryCode", country.code);
                            }}
                          >
                            {COUNTRIES.filter(c => c.name !== "Kenya").map(c => (
                              <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="countryCode" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Phone Country Code</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 rounded-lg bg-[#0a1628] border border-amber-500/50 px-3 py-2">
                            <span className="text-amber-400 font-mono font-bold">{field.value}</span>
                            <span className="text-gray-500 text-xs">{form.watch("countryName")}</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* Document Type selector */}
                <FormField control={form.control} name="idType" render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel className="text-gray-200">Document Type *</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {(form.watch("clientType") === "citizen"
                          ? [
                              { value: "national_id", label: " National ID" },
                              { value: "passport", label: " Passport" },
                              { value: "military_id", label: " Military ID" },
                            ]
                          : [
                              { value: "passport", label: " Passport" },
                              { value: "alien_id", label: " Alien ID" },
                            ]
                        ).map(({ value, label }) => (
                          <button key={value} type="button"
                            onClick={() => field.onChange(value)}
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${field.value === value ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {/* Client Type */}
                <div className="mb-4">
                  <p className="text-sm text-gray-200 mb-2 font-medium">Client Type</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { form.setValue("clientType", "citizen"); form.setValue("countryCode", "+254"); form.setValue("countryName", "Kenya"); form.setValue("idType", "national_id"); }}
                      className={form.watch("clientType") === "citizen" ? "flex-1 py-2 rounded-lg border-2 border-blue-500 bg-blue-500/20 text-blue-300 text-sm font-semibold" : "flex-1 py-2 rounded-lg border-2 border-white/10 bg-white/5 text-gray-400 text-sm font-semibold"}
                    >
                      Kenyan Citizen
                    </button>
                    <button
                      type="button"
                      onClick={() => { form.setValue("clientType", "foreigner"); form.setValue("idType", "passport"); }}
                      className={form.watch("clientType") === "foreigner" ? "flex-1 py-2 rounded-lg border-2 border-amber-500 bg-amber-500/20 text-amber-300 text-sm font-semibold" : "flex-1 py-2 rounded-lg border-2 border-white/10 bg-white/5 text-gray-400 text-sm font-semibold"}
                    >
                      Foreign National
                    </button>
                  </div>
                </div>

                {/* Country selector for foreigners */}
                {form.watch("clientType") === "foreigner" && (
                  <div className="grid gap-4 sm:grid-cols-2 mb-4">
                    <div>
                      <p className="text-sm text-gray-200 mb-2 font-medium">Country of Origin</p>
                      <select
                        className="w-full rounded-lg bg-[#0a1628] border border-amber-500/50 text-white p-2 text-sm"
                        value={form.watch("countryName")}
                        onChange={(e) => {
                          const name = e.target.value;
                          form.setValue("countryName", name);
                          const codes: Record<string, string> = { Uganda: "+256", Tanzania: "+255", Rwanda: "+250", Ethiopia: "+251", Nigeria: "+234", "South Africa": "+27", "United Kingdom": "+44", "United States": "+1", Germany: "+49", France: "+33", China: "+86", India: "+91", UAE: "+971", "Saudi Arabia": "+966", Canada: "+1", Australia: "+61", Japan: "+81" };
                          form.setValue("countryCode", codes[name] || "+000");
                        }}
                      >
                        <option value="Uganda">Uganda</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Rwanda">Rwanda</option>
                        <option value="Ethiopia">Ethiopia</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="South Africa">South Africa</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United States">United States</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="China">China</option>
                        <option value="India">India</option>
                        <option value="UAE">UAE</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Japan">Japan</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-sm text-gray-200 mb-2 font-medium">Phone Country Code</p>
                      <div className="flex items-center gap-2 rounded-lg bg-[#0a1628] border border-amber-500/50 px-3 py-2">
                        <span className="text-amber-400 font-mono font-bold">{form.watch("countryCode")}</span>
                        <span className="text-gray-500 text-xs">{form.watch("countryName")}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Type */}
                <div className="mb-4">
                  <p className="text-sm text-gray-200 mb-2 font-medium">Document Type</p>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("clientType") === "citizen" && (
                      <button type="button" onClick={() => form.setValue("idType", "national_id")} className={form.watch("idType") === "national_id" ? "px-3 py-1.5 rounded-lg border-2 border-emerald-500 bg-emerald-500/20 text-emerald-300 text-sm font-medium" : "px-3 py-1.5 rounded-lg border-2 border-white/10 bg-white/5 text-gray-400 text-sm font-medium"}>National ID</button>
                    )}
                    <button type="button" onClick={() => form.setValue("idType", "passport")} className={form.watch("idType") === "passport" ? "px-3 py-1.5 rounded-lg border-2 border-emerald-500 bg-emerald-500/20 text-emerald-300 text-sm font-medium" : "px-3 py-1.5 rounded-lg border-2 border-white/10 bg-white/5 text-gray-400 text-sm font-medium"}>Passport</button>
                    {form.watch("clientType") === "citizen" && (
                      <button type="button" onClick={() => form.setValue("idType", "military_id")} className={form.watch("idType") === "military_id" ? "px-3 py-1.5 rounded-lg border-2 border-emerald-500 bg-emerald-500/20 text-emerald-300 text-sm font-medium" : "px-3 py-1.5 rounded-lg border-2 border-white/10 bg-white/5 text-gray-400 text-sm font-medium"}>Military ID</button>
                    )}
                    {form.watch("clientType") === "foreigner" && (
                      <button type="button" onClick={() => form.setValue("idType", "alien_id")} className={form.watch("idType") === "alien_id" ? "px-3 py-1.5 rounded-lg border-2 border-emerald-500 bg-emerald-500/20 text-emerald-300 text-sm font-medium" : "px-3 py-1.5 rounded-lg border-2 border-white/10 bg-white/5 text-gray-400 text-sm font-medium"}>Alien ID</button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Kamau Mwangi" className="bg-[#0a1628] border-blue-500/50 focus:border-blue-400 text-white" {...field} />
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
                        <FormLabel className="text-gray-200">Phone Number (M-Pesa) *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="0712345678" className="bg-[#0a1628] border-blue-500/50 focus:border-blue-400 text-white" {...field} />
                        </FormControl>
                        <FormDescription className="text-blue-600 dark:text-blue-400 text-xs">Primary M-Pesa registered number</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="alternativePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Alternative Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="0722333444" className="bg-[#0a1628] border-blue-500/50 focus:border-blue-400 text-white" {...field} />
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
                        <FormLabel className="text-gray-200">Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@email.com" className="bg-[#0a1628] border-blue-500/50 focus:border-blue-400 text-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* ID Documents Block */}
              <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-700 bg-[#0f1d32] p-4 shadow-sm">
                <h4 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <FileText className="h-4 w-4" />
                  ID / Passport Documents
                </h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem className="max-w-sm">
                        {(() => {
                          const idType = form.watch("idType");
                          const placeholders: Record<string, string> = {
                            national_id: "e.g. 12345678",
                            passport: "e.g. A12345678",
                            alien_id: "e.g. 0012345",
                            military_id: "e.g. KE-MIL-001",
                          };
                          const labels: Record<string, string> = {
                            national_id: "National ID Number *",
                            passport: "Passport Number *",
                            alien_id: "Alien ID Number *",
                            military_id: "Military ID Number *",
                          };
                          return (
                            <>
                              <FormLabel className="text-gray-200">{labels[idType] || "Document Number *"}</FormLabel>
                              <FormControl>
                                <Input placeholder={placeholders[idType] || "Enter number"} className="bg-[#0a1628] border-emerald-500/50 focus:border-emerald-400 text-white font-mono text-lg" {...field} />
                              </FormControl>
                            </>
                          );
                        })()}
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
                            label={form.watch("idType") === "passport" ? "Passport - Photo Page" : "ID - Front Side"}
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
                            label={form.watch("idType") === "passport" ? "Passport - Visa/Entry Page" : "ID - Back Side"}
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

                  {/* Passport photo for foreigners */}
                  {form.watch("clientType") === "foreigner" && (
                    <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                      <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-3">Foreign National - Additional Documents</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField control={form.control} name="passportPhotoUrl" render={({ field }) => (
                          <FormItem>
                            <FileUpload
                              id="passport-photo-foreign"
                              label="Passport Photo (Face)"
                              accept="image/*"
                              maxSize={5}
                              value={field.value}
                              onChange={field.onChange}
                              showCamera
                            />
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="rounded-lg border border-amber-500/20 bg-[#0a1628] p-3 text-xs text-gray-400 space-y-1">
                          <p className="text-amber-300 font-semibold">Required for foreign nationals:</p>
                          <p>+ Valid passport (not expired)</p>
                          <p>+ Valid visa / entry permit</p>
                          <p>+ Alien ID (if applicable)</p>
                          <p>+ International driving permit</p>
                          <p className="text-amber-400 mt-2">Code: {form.watch("countryCode")} ({form.watch("countryName")})</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Driving License Block */}
              <div className="rounded-lg border-2 border-amber-300 dark:border-amber-700 bg-[#0f1d32] p-4 shadow-sm">
                <h4 className="font-semibold text-amber-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Car className="h-4 w-4" />
                  Driving License
                </h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="drivingLicenseNumber"
                    render={({ field }) => (
                      <FormItem className="max-w-sm">
                        <FormLabel className="text-gray-200">Driving License Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="DL123456" className="bg-[#0a1628] border-amber-500/50 focus:border-amber-400 text-white font-mono text-lg" {...field} />
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
              </div>

              {/* Work & Residence Block */}
              <div className="rounded-lg border-2 border-violet-300 dark:border-violet-700 bg-[#0f1d32] p-4 shadow-sm">
                <h4 className="font-semibold text-violet-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Building className="h-4 w-4" />
                  Work & Residence
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="placeOfWork"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Place of Work *</FormLabel>
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
                        <FormLabel className="text-gray-200">Residence/Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="Estate, Building, Area" className="bg-[#0a1628] border-violet-500/50 focus:border-violet-400 text-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="kraPin"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-gray-200 flex items-center gap-2">
                          KRA PIN
                          <span className="text-xs text-violet-400 font-normal">(auto-fills client details)</span>
                        </FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="A012345678A"
                              className={`bg-[#0a1628] font-mono text-white ${kraVerified ? "border-green-500 focus:border-green-400" : "border-violet-500/50 focus:border-violet-400"}`}
                              {...field}
                              onChange={(e) => { field.onChange(e); setKraVerified(false); }}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            onClick={lookupKraPin}
                            disabled={kraLookupLoading}
                            className="bg-violet-600 hover:bg-violet-700 text-white shrink-0 gap-2"
                          >
                            {kraLookupLoading ? (
                              <><Loader2 className="h-4 w-4 animate-spin" />Looking up...</>
                            ) : kraVerified ? (
                              <><CheckCircle2 className="h-4 w-4 text-green-300" />Verified</>
                            ) : (
                              <> Lookup</>
                            )}
                          </Button>
                        </div>
                        {kraVerified && (
                          <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                            <CheckCircle2 className="h-3 w-3" />
                            KRA PIN verified - details auto-filled from iTax
                          </p>
                        )}
                        {!kraVerified && (
                          <FormDescription className="text-violet-400 text-xs">
                            Format: A012345678A - Enter PIN and click Lookup to auto-fill client details
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Next of Kin Block */}
              <div className="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 p-4">
                <h4 className="font-semibold text-rose-700 dark:text-rose-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
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
          <Card className="border-l-4 border-l-purple-500 shadow-md">
            <CardHeader className="bg-gradient-to-r from-purple-900/40 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 text-white">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-purple-400">
                    2. Biometric & Photo Verification
                  </CardTitle>
                  <CardDescription>
                    Scan fingerprints and capture passport photo for verification
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-lg border-2 border-purple-300 dark:border-purple-700 bg-[#0f1d32] p-4 shadow-sm">
                <div className="grid gap-6 sm:grid-cols-3">
                  {/* Left Thumb Fingerprint Scanner */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-purple-700 dark:text-purple-300">Left Thumb Print *</label>
                    <div className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-6 transition-all ${
                      leftThumbCaptured 
                        ? "border-green-500 bg-green-50 dark:bg-green-950/30" 
                        : leftThumbScanning
                        ? "border-purple-500 bg-purple-900/20 animate-pulse"
                        : "border-dashed border-gray-600 bg-[#0a1628] hover:border-purple-400"
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
                          <div className="mt-2 h-2 w-full max-w-[120px] rounded-full bg-purple-900 overflow-hidden">
                            <div className="h-full bg-purple-500 animate-[scan_2s_ease-in-out_infinite]" style={{width: '100%'}} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0f1d32] text-gray-400 mb-3">
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
                    <label className="text-sm font-medium text-purple-700 dark:text-purple-300">Right Thumb Print *</label>
                    <div className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-6 transition-all ${
                      rightThumbCaptured 
                        ? "border-green-500 bg-green-50 dark:bg-green-950/30" 
                        : rightThumbScanning
                        ? "border-purple-500 bg-purple-900/20 animate-pulse"
                        : "border-dashed border-gray-600 bg-[#0a1628] hover:border-purple-400"
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
                          <div className="mt-2 h-2 w-full max-w-[120px] rounded-full bg-purple-900 overflow-hidden">
                            <div className="h-full bg-purple-500 animate-[scan_2s_ease-in-out_infinite]" style={{width: '100%'}} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0f1d32] text-gray-400 mb-3">
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
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Rental Type */}
          <Card className="border-l-4 border-l-teal-500 shadow-md">
            <CardHeader className="bg-gradient-to-r from-teal-900/40 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-white">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-teal-400">
                    3. Rental Type
                  </CardTitle>
                  <CardDescription>
                    Choose between self-drive or chauffeured service
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-900/20 p-4">
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
                          <div className="relative flex cursor-pointer items-start gap-4 rounded-lg border-2 border-teal-200 bg-[#0f1d32] p-4 hover:border-teal-400 has-[[data-state=checked]]:border-teal-500 has-[[data-state=checked]]:bg-teal-900/30">
                            <RadioGroupItem value="self-drive" id="admin-self-drive" className="mt-1" />
                            <div className="flex-1">
                              <label htmlFor="admin-self-drive" className="block cursor-pointer font-medium text-teal-800 dark:text-teal-200">
                                Self-Drive
                              </label>
                              <p className="text-sm text-teal-600 dark:text-teal-400">
                                Customer drives the vehicle themselves
                              </p>
                            </div>
                          </div>
                          <div className="relative flex cursor-pointer items-start gap-4 rounded-lg border-2 border-teal-200 bg-[#0f1d32] p-4 hover:border-teal-400 has-[[data-state=checked]]:border-teal-500 has-[[data-state=checked]]:bg-teal-900/30">
                            <RadioGroupItem value="chauffeured" id="admin-chauffeured" className="mt-1" />
                            <div className="flex-1">
                              <label htmlFor="admin-chauffeured" className="block cursor-pointer font-medium text-teal-800 dark:text-teal-200">
                                Chauffeured
                              </label>
                              <p className="text-sm text-teal-600 dark:text-teal-400">
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
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Car Details */}
          <Card className="border-l-4 border-l-orange-500 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-900/40 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-orange-400">
                    4. Car Details
                  </CardTitle>
                  <CardDescription>
                    Vehicle information and current status
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Vehicle Selection Block */}
              <div className="rounded-lg border-2 border-orange-300 dark:border-orange-700 bg-[#0f1d32] p-4 shadow-sm">
                <h4 className="font-semibold text-orange-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Car className="h-4 w-4" />
                  Vehicle Selection
                </h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="carMake"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Make *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedMake(value);
                            form.setValue("carModel", "");
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-[#0a1628] border-orange-500/50 focus:border-orange-400 text-white">
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
                        <FormLabel className="text-gray-200">Model *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[#0a1628] border-orange-500/50 focus:border-orange-400 text-white">
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
                      <FormLabel className="text-gray-200">Number Plate *</FormLabel>
                      <FormControl>
                        <Input placeholder="KBX 123A" className="bg-[#0a1628] border-orange-500/50 focus:border-orange-400 text-white font-mono text-lg uppercase" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
              </div>

              {/* Vehicle Status Block */}
              <div className="rounded-lg border-2 border-cyan-300 dark:border-cyan-700 bg-[#0f1d32] p-4 shadow-sm">
                <h4 className="font-semibold text-cyan-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Gauge className="h-4 w-4" />
                  Vehicle Status
                </h4>
                <div className="grid gap-4 sm:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="currentMileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Current Mileage (km) *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="45000" className="bg-[#0a1628] border-cyan-500/50 focus:border-cyan-400 text-white font-mono" {...field} />
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
                        <FormLabel className="text-gray-200 dark:text-gray-300 flex items-center gap-1">
                          <Fuel className="h-3 w-3" />
                          Fuel Level *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[#0a1628] border-cyan-500/50 focus:border-cyan-400 text-white">
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
                        <FormLabel className="text-gray-200">ETC Amount (KES)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="500" className="bg-[#0a1628] border-cyan-500/50 focus:border-cyan-400 text-white font-mono" {...field} />
                        </FormControl>
                        <FormDescription className="text-cyan-600 text-xs">Electronic toll amount</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200 dark:text-gray-300 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Destination *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Mombasa / Local" className="bg-[#0a1628] border-cyan-500/50 focus:border-cyan-400 text-white" {...field} />
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
          <Card className="border-l-4 border-l-indigo-500 shadow-md">
            <CardHeader className="bg-gradient-to-r from-indigo-900/40 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-indigo-400">
                    5. Rental Period & Pricing
                  </CardTitle>
                  <CardDescription>
                    Set duration and daily rate for this booking
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Rental Dates Block */}
              <div className="rounded-lg border-2 border-indigo-300 dark:border-indigo-700 bg-[#0f1d32] p-4 shadow-sm">
                <h4 className="font-semibold text-indigo-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Calendar className="h-4 w-4" />
                  Rental Period
                </h4>
                <div className="grid gap-4 sm:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="pickupDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Pickup Date *</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={(date) => {
                              const dateStr = date ? date.toISOString().split("T")[0] : "";
                              field.onChange(dateStr);
                              // Auto-calculate return date based on number of days
                              const days = form.getValues("numberOfDays");
                              if (days && dateStr) {
                                const pickupDate = new Date(dateStr);
                                pickupDate.setDate(pickupDate.getDate() + parseInt(days));
                                form.setValue("returnDate", pickupDate.toISOString().split("T")[0]);
                              }
                            }}
                            placeholder="Select pickup date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pickupTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Pickup Time *</FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numberOfDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Number of Days *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            placeholder="3"
                            className="bg-[#0a1628] border-indigo-500/50 focus:border-indigo-400 text-white font-bold text-lg text-center"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-calculate return date based on pickup date
                              const pickupDate = form.getValues("pickupDate");
                              if (pickupDate && e.target.value) {
                                const date = new Date(pickupDate);
                                date.setDate(date.getDate() + parseInt(e.target.value));
                                form.setValue("returnDate", date.toISOString().split("T")[0]);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="returnDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Return Date (Auto)</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={(date) => {
                              const dateStr = date ? date.toISOString().split("T")[0] : "";
                              field.onChange(dateStr);
                            }}
                            placeholder="Auto-calculated"
                            disabled
                            className="bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                          />
                        </FormControl>
                        <FormDescription className="text-green-600 dark:text-green-400 text-xs">Calculated automatically</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Pricing Details Block */}
              <div className="rounded-lg border-2 border-indigo-300 dark:border-indigo-700 bg-[#0f1d32] p-4 shadow-sm">
                <h4 className="font-semibold text-indigo-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <CreditCard className="h-4 w-4" />
                  Pricing Details
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date *</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={(date) => {
                                const dateStr = date ? date.toISOString().split("T")[0] : "";
                                field.onChange(dateStr);
                              }}
                              placeholder="Select start date"
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
                            <TimePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select time"
                            />
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
                            <DatePicker
                              value={field.value}
                              onChange={(date) => {
                                const dateStr = date ? date.toISOString().split("T")[0] : "";
                                field.onChange(dateStr);
                                // Auto-calculate number of days when end date is manually changed
                                const startDate = form.getValues("startDate");
                                if (startDate && dateStr) {
                                  const days = calculateDaysBetween(startDate, dateStr);
                                  if (days > 0) {
                                    form.setValue("numberOfDays", days.toString());
                                  }
                                }
                              }}
                              placeholder="Select end date"
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
                            <TimePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

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

          {/* Section 6: Payment */}
          <Card className="border-l-4 border-l-green-500 shadow-md">
            <CardHeader className="bg-gradient-to-r from-green-900/40 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-green-400">6. Payment</CardTitle>
                  <CardDescription>Choose payment type and method</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">

              {/* Full / Partial toggle */}
              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Payment Type *</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => field.onChange("full")}
                          className={`flex-1 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all ${field.value === "full" ? "border-green-500 bg-green-500/20 text-green-300" : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"}`}>
                           Full Payment
                        </button>
                        <button type="button" onClick={() => field.onChange("partial")}
                          className={`flex-1 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all ${field.value === "partial" ? "border-amber-500 bg-amber-500/20 text-amber-300" : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"}`}>
                           Partial / Deposit
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Deposit amount - shown when partial */}
              {form.watch("paymentType") === "partial" && (
                <FormField
                  control={form.control}
                  name="depositAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Deposit Amount (KES) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 10000" className="bg-[#0a1628] border-amber-500/50 text-white" {...field} />
                      </FormControl>
                      <p className="text-xs text-amber-400 mt-1">Balance will be collected before service completion</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Payment Method */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Payment Method *</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid gap-3 sm:grid-cols-3">
                        {[
                          { value: "mpesa", label: "M-Pesa", desc: "Lipa Na M-Pesa" },
                          { value: "bank",  label: "Bank Transfer", desc: "Bank deposit" },
                          { value: "cash",  label: "Cash", desc: "Cash payment" },
                        ].map(({ value, label, desc }) => (
                          <div key={value} className="relative flex cursor-pointer items-start gap-3 rounded-lg border-2 border-green-800 bg-[#0f1d32] p-3 hover:border-green-500 has-[[data-state=checked]]:border-green-500 has-[[data-state=checked]]:bg-green-900/30">
                            <RadioGroupItem value={value} id={`pay-${value}`} className="mt-0.5" />
                            <div>
                              <label htmlFor={`pay-${value}`} className="block cursor-pointer font-medium text-green-200 text-sm">{label}</label>
                              <p className="text-xs text-green-400">{desc}</p>
                            </div>
                          </div>
                        ))}
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
                <p className="text-gray-200 dark:text-gray-300 text-sm">
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
                          <span className="text-xs text-gray-300">
                            {new Date(incident.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-200 dark:text-gray-300">{incident.description}</p>
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
