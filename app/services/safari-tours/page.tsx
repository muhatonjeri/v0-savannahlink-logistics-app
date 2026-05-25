"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Compass, Calendar, User, CreditCard, ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import type { SafariTourBooking } from "@/types";

const safariSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  destination: z.string().min(1, "Please select a destination"),
  packageType: z.string().min(1, "Please select a package"),
  numberOfGuests: z.string().min(1, "Please enter number of guests"),
  startDate: z.string().min(1, "Please select start date"),
  endDate: z.string().min(1, "Please select end date"),
  specialRequests: z.string().optional(),
});

type SafariFormData = z.infer<typeof safariSchema>;

const destinations = [
  { id: "maasai-mara", name: "Maasai Mara", pricePerPerson: 25000 },
  { id: "amboseli", name: "Amboseli National Park", pricePerPerson: 22000 },
  { id: "tsavo", name: "Tsavo East & West", pricePerPerson: 20000 },
  { id: "samburu", name: "Samburu National Reserve", pricePerPerson: 28000 },
  { id: "lake-nakuru", name: "Lake Nakuru", pricePerPerson: 15000 },
  { id: "lake-naivasha", name: "Lake Naivasha", pricePerPerson: 12000 },
];

const packages = [
  { id: "budget", name: "Budget Safari", multiplier: 1 },
  { id: "standard", name: "Standard Safari", multiplier: 1.5 },
  { id: "luxury", name: "Luxury Safari", multiplier: 2.5 },
];

export default function SafariToursPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<SafariTourBooking | null>(null);

  const form = useForm<SafariFormData>({
    resolver: zodResolver(safariSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      destination: "",
      packageType: "",
      numberOfGuests: "",
      startDate: "",
      endDate: "",
      specialRequests: "",
    },
  });

  const watchDestination = form.watch("destination");
  const watchPackage = form.watch("packageType");
  const watchGuests = form.watch("numberOfGuests");
  const watchStartDate = form.watch("startDate");
  const watchEndDate = form.watch("endDate");

  const calculateDays = () => {
    if (!watchStartDate || !watchEndDate) return 0;
    const start = new Date(watchStartDate);
    const end = new Date(watchEndDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  };

  const calculateTotal = () => {
    const dest = destinations.find((d) => d.id === watchDestination);
    const pkg = packages.find((p) => p.id === watchPackage);
    const guests = parseInt(watchGuests) || 0;
    const days = calculateDays();
    
    if (!dest || !pkg || guests === 0) return 0;
    return Math.round(dest.pricePerPerson * pkg.multiplier * guests * days);
  };

  const onSubmit = async (data: SafariFormData) => {
    setIsSubmitting(true);

    try {
      const dest = destinations.find((d) => d.id === data.destination);
      const pkg = packages.find((p) => p.id === data.packageType);
      const total = calculateTotal();

      const booking: SafariTourBooking = {
        id: crypto.randomUUID(),
        serviceType: "safari-tours",
        customerName: data.fullName,
        customerPhone: data.phone,
        customerEmail: data.email,
        status: "pending",
        paymentStatus: "pending",
        totalAmount: total,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        packageName: pkg?.name || "",
        destination: dest?.name || "",
        numberOfGuests: parseInt(data.numberOfGuests),
        startDate: data.startDate,
        endDate: data.endDate,
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
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success("Payment received! Your safari is confirmed.");
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
                  <Compass className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Safari Booking Confirmed!</CardTitle>
                <CardDescription>
                  Complete payment to secure your adventure.
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
                      <dt className="text-muted-foreground">Destination</dt>
                      <dd>{currentBooking.destination}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Package</dt>
                      <dd>{currentBooking.packageName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Guests</dt>
                      <dd>{currentBooking.numberOfGuests}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Dates</dt>
                      <dd>{currentBooking.startDate} to {currentBooking.endDate}</dd>
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
          <Link
            href="/services"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>

          <div className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Compass className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Safari Tours</h1>
            <p className="mt-2 text-muted-foreground">
              Experience the magic of Kenya&apos;s wildlife. Expert guides, comfortable lodges, 
              and unforgettable adventures await.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

              {/* Safari Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    Safari Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select destination" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {destinations.map((dest) => (
                                <SelectItem key={dest.id} value={dest.id}>
                                  {dest.name}
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
                      name="packageType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select package" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {packages.map((pkg) => (
                                <SelectItem key={pkg.id} value={pkg.id}>
                                  {pkg.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="numberOfGuests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Guests</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="20" placeholder="2" {...field} />
                        </FormControl>
                        <FormDescription>Maximum 20 guests per booking</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")}
                              placeholder="Select start date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")}
                              placeholder="Select end date"
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
                            placeholder="Any dietary requirements, accessibility needs, or special requests..."
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
              {calculateTotal() > 0 && (
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
                          {destinations.find((d) => d.id === watchDestination)?.name} - {packages.find((p) => p.id === watchPackage)?.name}
                        </dt>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-muted-foreground">
                          {watchGuests} guest(s) x {calculateDays()} day(s)
                        </dt>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold">
                        <dt>Total</dt>
                        <dd className="text-primary">KES {calculateTotal().toLocaleString()}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              )}

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
