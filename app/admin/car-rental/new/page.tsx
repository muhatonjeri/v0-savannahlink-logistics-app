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
import { saveBooking, generateId, searchClients, saveClientFromBooking, getClients } from "@/lib/store";
import type { Client } from "@/types";
import { toast } from "sonner";
import type { CarRentalBooking } from "@/types";

// Comprehensive validation schema for admin car rental form
const adminCarRentalSchema = z.object({
  // Personal Details
  fullName: z.string().min(2, "Full name is required"),
  idNumber: z.string().min(6, "ID/Passport number is required"),
  idPhotoUrl: z.string().optional(),
  drivingLicenseNumber: z.string().min(4, "Driving license number is required"),
  drivingLicenseUrl: z.string().optional(),
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

  const form = useForm<AdminCarRentalFormData>({
    resolver: zodResolver(adminCarRentalSchema),
    defaultValues: {
      fullName: "",
      idNumber: "",
      idPhotoUrl: "",
      drivingLicenseNumber: "",
      drivingLicenseUrl: "",
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
          idPhotoUrl: data.idPhotoUrl || undefined,
          drivingLicenseNumber: data.drivingLicenseNumber,
          drivingLicenseUrl: data.drivingLicenseUrl || undefined,
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

  // Client search function
  const handleClientSearch = (query: string) => {
    setClientSearchQuery(query);
    if (query.length >= 2) {
      const results = searchClients(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
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
    form.setValue("idPhotoUrl", client.idPhotoUrl || "");
    form.setValue("drivingLicenseNumber", client.drivingLicenseNumber || "");
    form.setValue("drivingLicenseUrl", client.drivingLicenseUrl || "");
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
    
    toast.success(`Client "${client.fullName}" loaded! Previous bookings: ${client.totalBookings}`);
  };

  // Clear selected client and reset form for new client
  const handleNewClient = () => {
    setSelectedClient(null);
    setIsNewClient(true);
    form.reset();
    toast.info("Form cleared for new client registration");
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
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Client Lookup
              </CardTitle>
              <CardDescription>
                Search for returning clients by name, ID number, or phone number to auto-fill their details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, ID number, or phone..."
                    value={clientSearchQuery}
                    onChange={(e) => handleClientSearch(e.target.value)}
                    className="pl-10"
                  />
                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-card shadow-lg">
                      {searchResults.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => handleSelectClient(client)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <UserCheck className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{client.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              ID: {client.idNumber} | Tel: {client.phone}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              {client.totalBookings} booking{client.totalBookings !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {showSearchResults && searchResults.length === 0 && clientSearchQuery.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-border bg-card p-4 text-center text-sm text-muted-foreground shadow-lg">
                      No clients found matching "{clientSearchQuery}"
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant={isNewClient ? "default" : "outline"}
                  onClick={handleNewClient}
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  New Client
                </Button>
              </div>
              
              {/* Selected Client Banner */}
              {selectedClient && (
                <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-700 dark:text-green-400">
                      Returning Client: {selectedClient.fullName}
                    </p>
                    <p className="text-sm text-green-600/80 dark:text-green-500/80">
                      ID: {selectedClient.idNumber} | {selectedClient.totalBookings} previous booking(s)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleNewClient}
                    className="text-green-600 hover:text-green-700"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 1: Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Details
                {selectedClient && (
                  <span className="ml-2 text-xs font-normal text-green-600 bg-green-500/10 px-2 py-1 rounded-full">
                    Auto-filled from saved client
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Customer identification and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {/* Basic Info */}
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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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

              <Separator />

              {/* ID & License */}
              <div className="grid gap-4 sm:grid-cols-2">
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
                  name="idPhotoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FileUpload
                        id="id-photo"
                        label="ID/Passport Photo"
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

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="drivingLicenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driving License Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="DL123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="drivingLicenseUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FileUpload
                        id="driving-license"
                        label="Driving License Photo"
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

              <Separator />

              {/* Work & Residence */}
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
              </div>

              {/* KRA PIN with verification */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="kraPin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KRA PIN *</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="A012345678A" {...field} />
                        </FormControl>
                        <Button type="button" variant="outline" onClick={verifyKraPin}>
                          Verify
                        </Button>
                      </div>
                      <FormDescription>Format: A012345678A</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Next of Kin */}
              <div>
                <h4 className="mb-4 font-medium">Next of Kin</h4>
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
                Fingerprints and passport photo for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="fingerprintLeftUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FileUpload
                        id="fingerprint-left"
                        label="Left Thumb Print"
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
                <FormField
                  control={form.control}
                  name="fingerprintRightUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FileUpload
                        id="fingerprint-right"
                        label="Right Thumb Print"
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
                        <Input placeholder="KBX 123A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <FormField
                  control={form.control}
                  name="currentMileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Mileage (km) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="45000" {...field} />
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
                      <FormLabel>Fuel Level *</FormLabel>
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
                        <Input type="number" placeholder="500" {...field} />
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
                      <FormLabel>Destination *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mombasa / Local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Rental Period & Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Rental Period & Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
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
    </div>
  );
}
