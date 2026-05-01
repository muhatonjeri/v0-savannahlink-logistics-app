"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plane, Calendar, User, CreditCard, ArrowLeft } from "lucide-react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MpesaPayment } from "@/components/payment/mpesa-payment";
import { saveBooking, generateId } from "@/lib/store";
import { toast } from "sonner";
import type { TransferBooking } from "@/types";

const transferSchema = z.object({
  transferType: z.enum(["airport-pickup", "airport-dropoff", "hotel-transfer"]),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  pickupLocation: z.string().min(2, "Please enter pickup location"),
  dropoffLocation: z.string().min(2, "Please enter drop-off location"),
  pickupDate: z.string().min(1, "Please select pickup date"),
  pickupTime: z.string().min(1, "Please select pickup time"),
  flightNumber: z.string().optional(),
  numberOfPassengers: z.string().min(1, "Please enter number of passengers"),
  luggageCount: z.string().min(1, "Please enter luggage count"),
  specialRequests: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

const transferRates = {
  "airport-pickup": 3500,
  "airport-dropoff": 3500,
  "hotel-transfer": 2500,
};

export default function TransfersPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<TransferBooking | null>(null);

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      transferType: "airport-pickup",
      fullName: "",
      email: "",
      phone: "",
      pickupLocation: "",
      dropoffLocation: "",
      pickupDate: "",
      pickupTime: "",
      flightNumber: "",
      numberOfPassengers: "",
      luggageCount: "",
      specialRequests: "",
    },
  });

  const watchTransferType = form.watch("transferType");

  const calculateTotal = () => {
    return transferRates[watchTransferType] || 0;
  };

  const onSubmit = async (data: TransferFormData) => {
    setIsSubmitting(true);

    try {
      const booking: TransferBooking = {
        id: generateId(),
        serviceType: "hotel-airport-transfers",
        customerName: data.fullName,
        customerPhone: data.phone,
        customerEmail: data.email,
        status: "pending",
        paymentStatus: "pending",
        totalAmount: calculateTotal(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        transferType: data.transferType,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        flightNumber: data.flightNumber,
        numberOfPassengers: parseInt(data.numberOfPassengers),
        luggageCount: parseInt(data.luggageCount),
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime,
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
    toast.success("Payment received! Your transfer is confirmed.");
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
                  <Plane className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Transfer Booking Confirmed!</CardTitle>
                <CardDescription>Complete payment to confirm your transfer.</CardDescription>
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
                      <dt className="text-muted-foreground">Type</dt>
                      <dd className="capitalize">{currentBooking.transferType.replace("-", " ")}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">From</dt>
                      <dd>{currentBooking.pickupLocation}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">To</dt>
                      <dd>{currentBooking.dropoffLocation}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Date & Time</dt>
                      <dd>{currentBooking.pickupDate} at {currentBooking.pickupTime}</dd>
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
          <Link href="/services" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>

          <div className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Plane className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Hotel & Airport Transfers</h1>
            <p className="mt-2 text-muted-foreground">
              Reliable pickup and drop-off services. On-time arrivals, professional drivers, 
              and comfortable vehicles.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Transfer Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Plane className="h-5 w-5 text-primary" />
                    Transfer Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="transferType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid gap-4 sm:grid-cols-3"
                          >
                            {[
                              { value: "airport-pickup", label: "Airport Pickup", price: "KES 3,500" },
                              { value: "airport-dropoff", label: "Airport Drop-off", price: "KES 3,500" },
                              { value: "hotel-transfer", label: "Hotel Transfer", price: "KES 2,500" },
                            ].map((option) => (
                              <div key={option.value} className="relative flex cursor-pointer items-start gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                                <div className="flex-1">
                                  <label htmlFor={option.value} className="block cursor-pointer font-medium">
                                    {option.label}
                                  </label>
                                  <p className="text-sm text-primary">{option.price}</p>
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

              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Kamau" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input type="tel" placeholder="0712345678" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              {/* Transfer Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    Transfer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField control={form.control} name="pickupLocation" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Location</FormLabel>
                        <FormControl><Input placeholder="e.g., JKIA Terminal 1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="dropoffLocation" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Drop-off Location</FormLabel>
                        <FormControl><Input placeholder="e.g., Sarova Stanley Hotel" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-3">
                    <FormField control={form.control} name="pickupDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Date</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="pickupTime" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Time</FormLabel>
                        <FormControl><Input type="time" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="flightNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flight Number (Optional)</FormLabel>
                        <FormControl><Input placeholder="KQ100" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField control={form.control} name="numberOfPassengers" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Passengers</FormLabel>
                        <FormControl><Input type="number" min="1" max="10" placeholder="2" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="luggageCount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Luggage</FormLabel>
                        <FormControl><Input type="number" min="0" max="20" placeholder="2" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="specialRequests" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Child seat, wheelchair access, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              {/* Price */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Price Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">KES {calculateTotal().toLocaleString()}</span>
                  </div>
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
