"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Car, Calendar, User, CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { MpesaPayment } from "@/components/payment/mpesa-payment";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { saveBooking, generateId } from "@/lib/store";
import { toast } from "sonner";
import type { CarRentalBooking } from "@/types";

const carRentalSchema = z.object({
  rentalType: z.enum(["self-drive", "chauffeured"]),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  pickupLocation: z.string().min(2, "Please enter pickup location"),
  dropoffLocation: z.string().min(2, "Please enter drop-off location"),
  pickupDate: z.string().min(1, "Please select pickup date"),
  pickupTime: z.string().min(1, "Please select pickup time"),
  returnDate: z.string().min(1, "Please select return date"),
  returnTime: z.string().min(1, "Please select return time"),
  vehicleType: z.string().min(1, "Please select vehicle type"),
  specialRequests: z.string().optional(),
});

type CarRentalFormData = z.infer<typeof carRentalSchema>;

const vehicleTypes = [
  { id: "economy", name: "Economy", rate: 3500 },
  { id: "compact", name: "Compact", rate: 4500 },
  { id: "suv", name: "SUV", rate: 7500 },
  { id: "4x4", name: "4x4 Land Cruiser", rate: 15000 },
  { id: "van", name: "Safari Van", rate: 12000 },
  { id: "luxury", name: "Luxury Sedan", rate: 20000 },
];

export default function CarRentalPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<CarRentalBooking | null>(null);

  const form = useForm<CarRentalFormData>({
    resolver: zodResolver(carRentalSchema),
    defaultValues: {
      rentalType: "self-drive",
      fullName: "",
      email: "",
      phone: "",
      pickupLocation: "",
      dropoffLocation: "",
      pickupDate: "",
      pickupTime: "",
      returnDate: "",
      returnTime: "",
      vehicleType: "",
      specialRequests: "",
    },
  });

  const watchVehicleType = form.watch("vehicleType");
  const watchPickupDate = form.watch("pickupDate");
  const watchReturnDate = form.watch("returnDate");
  const watchRentalType = form.watch("rentalType");

  // Calculate number of days and total
  const calculateDays = () => {
    if (!watchPickupDate || !watchReturnDate) return 0;
    const pickup = new Date(watchPickupDate);
    const returnD = new Date(watchReturnDate);
    const diff = Math.ceil((returnD.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  };

  const calculateTotal = () => {
    const days = calculateDays();
    const vehicle = vehicleTypes.find((v) => v.id === watchVehicleType);
    if (!vehicle) return 0;
    let total = days * vehicle.rate;
    // Add 2000 KES/day for chauffeur
    if (watchRentalType === "chauffeured") {
      total += days * 2000;
    }
    return total;
  };

  const onSubmit = async (data: CarRentalFormData) => {
    setIsSubmitting(true);

    try {
      const days = calculateDays();
      const total = calculateTotal();
      const vehicle = vehicleTypes.find((v) => v.id === data.vehicleType);

      const booking: CarRentalBooking = {
        id: generateId(),
        serviceType: "car-rental",
        customerName: data.fullName,
        customerPhone: data.phone,
        customerEmail: data.email,
        status: "pending",
        paymentStatus: "pending",
        totalAmount: total,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rentalType: data.rentalType,
        personalDetails: {
          fullName: data.fullName,
          idNumber: "",
          drivingLicenseNumber: "",
          placeOfWork: "",
          kraPin: "",
          residence: "",
          phone: data.phone,
          nextOfKin: {
            name: "",
            phone: "",
            relationship: "",
          },
        },
        carDetails: {
          make: vehicle?.name || "",
          model: data.vehicleType,
          numberPlate: "To be assigned",
          currentMileage: 0,
          fuelLevel: "Full",
          etcAmount: 0,
          destination: data.dropoffLocation,
        },
        rentalPeriod: {
          numberOfDays: days,
          dailyRate: vehicle?.rate || 0,
          startDate: data.pickupDate,
          startTime: data.pickupTime,
          endDate: data.returnDate,
          endTime: data.returnTime,
        },
      };

      saveBooking(booking);
      setCurrentBooking(booking);
      setBookingComplete(true);
      toast.success("Booking created successfully!");
    } catch (error) {
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success("Payment received! Your booking is confirmed.");
    setTimeout(() => {
      router.push("/services");
    }, 2000);
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
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
                <CardDescription>
                  Your car rental booking has been created. Complete payment to confirm.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-muted/50 p-4">
                  <h3 className="mb-3 font-semibold">Booking Summary</h3>
                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Booking ID</dt>
                      <dd className="font-mono">{currentBooking.id.substring(0, 12)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Rental Type</dt>
                      <dd className="capitalize">{currentBooking.rentalType}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Vehicle</dt>
                      <dd>{currentBooking.carDetails.make}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Duration</dt>
                      <dd>{currentBooking.rentalPeriod.numberOfDays} day(s)</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Pickup</dt>
                      <dd>{currentBooking.rentalPeriod.startDate} at {currentBooking.rentalPeriod.startTime}</dd>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <dt className="font-semibold">Total Amount</dt>
                      <dd className="font-semibold text-primary">
                        KES {currentBooking.totalAmount.toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex flex-col gap-3">
                  <MpesaPayment
                    bookingId={currentBooking.id}
                    amount={currentBooking.totalAmount}
                    defaultPhone={currentBooking.customerPhone}
                    onSuccess={handlePaymentSuccess}
                  />
                  <Button variant="outline" asChild>
                    <Link href="/services">Back to Services</Link>
                  </Button>
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
          {/* Back Link */}
          <Link
            href="/services"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Car className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Car Rental</h1>
            <p className="mt-2 text-muted-foreground">
              Book a vehicle for self-drive or with a professional chauffeur. 
              Wide selection from economy cars to luxury SUVs.
            </p>
          </div>

          {/* Booking Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Rental Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
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
                              <RadioGroupItem value="self-drive" id="self-drive" className="mt-1" />
                              <div className="flex-1">
                                <label htmlFor="self-drive" className="block cursor-pointer font-medium">
                                  Self-Drive
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  Drive yourself. Valid license required.
                                </p>
                              </div>
                            </div>
                            <div className="relative flex cursor-pointer items-start gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                              <RadioGroupItem value="chauffeured" id="chauffeured" className="mt-1" />
                              <div className="flex-1">
                                <label htmlFor="chauffeured" className="block cursor-pointer font-medium">
                                  Chauffeured
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  Professional driver included (+KES 2,000/day)
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

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Kamau" {...field} />
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="0712345678" {...field} />
                        </FormControl>
                        <FormDescription>M-Pesa registered number</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Rental Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    Rental Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a vehicle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicleTypes.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.name} - KES {vehicle.rate.toLocaleString()}/day
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="pickupLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., JKIA Airport" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dropoffLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Drop-off Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Westlands" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="pickupDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")}
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
                          <FormLabel>Pickup Time</FormLabel>
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
                      name="returnDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Return Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")}
                              placeholder="Select return date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="returnTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Return Time</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special requirements or requests..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Price Summary */}
              {watchVehicleType && watchPickupDate && watchReturnDate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Price Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <dt className="text-muted-foreground">
                          {vehicleTypes.find((v) => v.id === watchVehicleType)?.name} x {calculateDays()} day(s)
                        </dt>
                        <dd>
                          KES {((vehicleTypes.find((v) => v.id === watchVehicleType)?.rate || 0) * calculateDays()).toLocaleString()}
                        </dd>
                      </div>
                      {watchRentalType === "chauffeured" && (
                        <div className="flex justify-between text-sm">
                          <dt className="text-muted-foreground">Chauffeur x {calculateDays()} day(s)</dt>
                          <dd>KES {(2000 * calculateDays()).toLocaleString()}</dd>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold">
                        <dt>Total</dt>
                        <dd className="text-primary">KES {calculateTotal().toLocaleString()}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
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
