"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bus, Calendar, User, CreditCard, ArrowLeft, MapPin, Users } from "lucide-react";
import Link from "next/link";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MpesaPayment } from "@/components/payment/mpesa-payment";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { toast } from "sonner";
import type { CorporateRentalBooking } from "@/types";

const corporateRentalSchema = z.object({
  vehicleType: z.enum(["10-seater-van", "14-seater-van", "22-seater-bus", "33-seater-bus", "45-seater-bus", "52-seater-bus"]),
  rentalType: z.enum(["with-driver", "self-drive"]),
  tripType: z.enum(["one-way", "round-trip", "multi-day"]),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  companyName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  pickupLocation: z.string().min(5, "Please enter pickup location"),
  dropoffLocation: z.string().min(5, "Please enter dropoff location"),
  startDate: z.string().min(1, "Please select start date"),
  startTime: z.string().min(1, "Please select start time"),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  numberOfPassengers: z.string().min(1, "Please enter number of passengers"),
  purpose: z.string().min(5, "Please describe the purpose"),
  specialRequests: z.string().optional(),
});

type CorporateRentalFormData = z.infer<typeof corporateRentalSchema>;

const vehicleRates: Record<string, { name: string; capacity: number; rate: number }> = {
  "10-seater-van": { name: "10 Seater Luxury Van", capacity: 10, rate: 8000 },
  "14-seater-van": { name: "14 Seater Luxury Van", capacity: 14, rate: 12000 },
  "22-seater-bus": { name: "22 Seater Bus", capacity: 22, rate: 18000 },
  "33-seater-bus": { name: "33 Seater Bus", capacity: 33, rate: 25000 },
  "45-seater-bus": { name: "45 Seater Bus", capacity: 45, rate: 35000 },
  "52-seater-bus": { name: "52 Seater Bus", capacity: 52, rate: 45000 },
};

const tripTypeMultipliers: Record<string, number> = {
  "one-way": 1,
  "round-trip": 1.8,
  "multi-day": 2.5,
};

export default function CorporateRentalPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<CorporateRentalBooking | null>(null);

  const form = useForm<CorporateRentalFormData>({
    resolver: zodResolver(corporateRentalSchema),
    defaultValues: {
      vehicleType: "14-seater-van",
      rentalType: "with-driver",
      tripType: "one-way",
      fullName: "",
      companyName: "",
      email: "",
      phone: "",
      pickupLocation: "",
      dropoffLocation: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      numberOfPassengers: "",
      purpose: "",
      specialRequests: "",
    },
  });

  const watchVehicleType = form.watch("vehicleType");
  const watchTripType = form.watch("tripType");
  const watchRentalType = form.watch("rentalType");

  const calculateTotal = () => {
    const vehicle = vehicleRates[watchVehicleType];
    if (!vehicle) return 0;
    let total = vehicle.rate * tripTypeMultipliers[watchTripType];
    if (watchRentalType === "self-drive") {
      total *= 0.85; // 15% discount for self-drive
    }
    return Math.round(total);
  };

  const onSubmit = async (data: CorporateRentalFormData) => {
    setIsSubmitting(true);
    try {
      const booking: CorporateRentalBooking = {
        id: crypto.randomUUID(),
        serviceType: "corporate-rental",
        customerName: data.fullName,
        customerPhone: data.phone,
        customerEmail: data.email,
        status: "pending",
        paymentStatus: "pending",
        totalAmount: calculateTotal(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        vehicleType: data.vehicleType,
        rentalType: data.rentalType,
        companyName: data.companyName,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        tripType: data.tripType,
        startDate: data.startDate,
        startTime: data.startTime,
        endDate: data.endDate,
        endTime: data.endTime,
        numberOfPassengers: parseInt(data.numberOfPassengers),
        purpose: data.purpose,
        specialRequests: data.specialRequests,
      };
      fetch("/api/bookings", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          service_type: newBooking.serviceType || newBooking.service_type || "service",
          customer_name: newBooking.customerName || newBooking.customer_name || "",
          customer_phone: newBooking.customerPhone || newBooking.customer_phone || "",
          customer_email: newBooking.customerEmail || newBooking.customer_email || "",
          status: "pending", payment_status: "pending",
          total_amount: newBooking.totalAmount || newBooking.total_amount || 0,
          notes: newBooking.notes || "",
        }),
      }).catch(e => console.error("Save booking:", e));
      setCurrentBooking(booking);
      setBookingComplete(true);
      toast.success("Booking created successfully!");
    } catch (error) {
      toast.error("Failed to create booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success("Payment received! Your booking is confirmed.");
    setTimeout(() => router.push("/services"), 2000);
  };

  if (bookingComplete && currentBooking) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Bus className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
                <CardDescription>Complete payment to secure your vehicle.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-muted/50 p-4">
                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Booking ID</dt>
                      <dd className="font-mono">{currentBooking.id.substring(0, 12)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Vehicle</dt>
                      <dd>{vehicleRates[currentBooking.vehicleType]?.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Trip Type</dt>
                      <dd className="capitalize">{currentBooking.tripType.replace("-", " ")}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Date</dt>
                      <dd>{currentBooking.startDate}</dd>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <dt className="font-semibold">Total Amount</dt>
                      <dd className="font-semibold text-primary">KES {currentBooking.totalAmount.toLocaleString()}</dd>
                    </div>
                  </dl>
                </div>
                <div className="flex flex-col gap-3">
                  <MpesaPayment bookingId={currentBooking.id} amount={currentBooking.totalAmount} defaultPhone={currentBooking.customerPhone} onSuccess={handlePaymentSuccess} />
                  <Button variant="outline" asChild><Link href="/services">Back to Services</Link></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link href="/services" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />Back to Services
          </Link>

          <div className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Bus className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Corporate Rental</h1>
            <p className="mt-2 text-muted-foreground">Luxury vans and buses for corporate events, group travel, weddings, and tours.</p>
          </div>

          {/* Vehicle Options Display */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(vehicleRates).map(([key, vehicle]) => (
              <Card key={key} className={`cursor-pointer transition-all ${watchVehicleType === key ? "border-primary ring-2 ring-primary" : "hover:border-primary/50"}`} onClick={() => form.setValue("vehicleType", key as any)}>
                <CardContent className="p-4 text-center">
                  <Bus className="mx-auto mb-2 h-8 w-8 text-primary" />
                  <h3 className="font-semibold">{vehicle.name}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.capacity} passengers</p>
                  <p className="mt-1 text-lg font-bold text-primary">KES {vehicle.rate.toLocaleString()}/trip</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Bus className="h-5 w-5 text-primary" />Vehicle & Trip Details</CardTitle></CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <FormField control={form.control} name="vehicleType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(vehicleRates).map(([key, vehicle]) => (
                            <SelectItem key={key} value={key}>{vehicle.name} - KES {vehicle.rate.toLocaleString()}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="rentalType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rental Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="with-driver">With Professional Driver</SelectItem>
                          <SelectItem value="self-drive">Self Drive (15% off)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tripType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trip Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select trip type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="one-way">One Way (x1)</SelectItem>
                          <SelectItem value="round-trip">Round Trip (x1.8)</SelectItem>
                          <SelectItem value="multi-day">Multi-Day (x2.5)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="numberOfPassengers" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Passengers</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 12" max={vehicleRates[watchVehicleType]?.capacity} {...field} />
                      </FormControl>
                      <FormDescription>Max: {vehicleRates[watchVehicleType]?.capacity} passengers</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5 text-primary" />Contact Information</CardTitle></CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Kamau" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="companyName" render={({ field }) => (
                    <FormItem><FormLabel>Company Name (Optional)</FormLabel><FormControl><Input placeholder="ABC Ltd" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="0712345678" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><MapPin className="h-5 w-5 text-primary" />Trip Details</CardTitle></CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField control={form.control} name="pickupLocation" render={({ field }) => (
                      <FormItem><FormLabel>Pickup Location</FormLabel><FormControl><Input placeholder="e.g., Nairobi CBD" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="dropoffLocation" render={({ field }) => (
                      <FormItem><FormLabel>Dropoff Location</FormLabel><FormControl><Input placeholder="e.g., Maasai Mara" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField control={form.control} name="startDate" render={({ field }) => (
                      <FormItem><FormLabel>Start Date</FormLabel><FormControl><DatePicker value={field.value} onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")} placeholder="Select start date" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="startTime" render={({ field }) => (
                      <FormItem><FormLabel>Pickup Time</FormLabel><FormControl><TimePicker value={field.value} onChange={field.onChange} placeholder="Select time" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  {watchTripType !== "one-way" && (
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField control={form.control} name="endDate" render={({ field }) => (
                        <FormItem><FormLabel>End Date</FormLabel><FormControl><DatePicker value={field.value} onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")} placeholder="Select end date" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="endTime" render={({ field }) => (
                        <FormItem><FormLabel>Return Time</FormLabel><FormControl><TimePicker value={field.value} onChange={field.onChange} placeholder="Select time" /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  )}
                  <FormField control={form.control} name="purpose" render={({ field }) => (
                    <FormItem><FormLabel>Purpose of Trip</FormLabel><FormControl><Textarea placeholder="e.g., Corporate team building event, Wedding guests transport, School trip..." className="min-h-[80px]" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="specialRequests" render={({ field }) => (
                    <FormItem><FormLabel>Special Requests (Optional)</FormLabel><FormControl><Textarea placeholder="Any special requirements or requests..." className="min-h-[60px]" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="h-5 w-5 text-primary" />Price Summary</CardTitle></CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">{vehicleRates[watchVehicleType]?.name} (Base)</dt>
                      <dd>KES {vehicleRates[watchVehicleType]?.rate.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Trip Type ({watchTripType.replace("-", " ")})</dt>
                      <dd>x{tripTypeMultipliers[watchTripType]}</dd>
                    </div>
                    {watchRentalType === "self-drive" && (
                      <div className="flex justify-between text-sm text-green-600">
                        <dt>Self-Drive Discount</dt>
                        <dd>-15%</dd>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold">
                      <dt>Total</dt>
                      <dd className="text-primary">KES {calculateTotal().toLocaleString()}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Continue to Payment"}
              </Button>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
