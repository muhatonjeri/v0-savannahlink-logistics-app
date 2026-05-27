"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wrench, User, CreditCard, ArrowLeft, MapPin, AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MpesaPayment } from "@/components/payment/mpesa-payment";
import { toast } from "sonner";
import type { RoadRecoveryBooking } from "@/types";

const recoverySchema = z.object({
  fullName: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone required"),
  vehicleType: z.string().min(1, "Select vehicle type"),
  vehicleMake: z.string().min(1, "Enter vehicle make"),
  vehicleModel: z.string().min(1, "Enter vehicle model"),
  vehicleColor: z.string().min(1, "Enter vehicle color"),
  numberPlate: z.string().min(4, "Enter number plate"),
  currentLocation: z.string().min(5, "Enter current location"),
  issueDescription: z.string().min(10, "Describe the issue"),
  isBlocking: z.boolean(),
});

type RecoveryFormData = z.infer<typeof recoverySchema>;

const vehicleTypeRates: Record<string, number> = {
  "motorcycle": 3000,
  "sedan": 5000,
  "suv": 7000,
  "pickup": 8000,
  "truck-small": 12000,
  "truck-large": 20000,
  "bus": 25000,
};

export default function RoadRecoveryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<RoadRecoveryBooking | null>(null);

  const form = useForm<RecoveryFormData>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      fullName: "", email: "", phone: "", vehicleType: "", vehicleMake: "", vehicleModel: "",
      vehicleColor: "", numberPlate: "", currentLocation: "", issueDescription: "", isBlocking: false,
    },
  });

  const watchVehicleType = form.watch("vehicleType");
  const watchBlocking = form.watch("isBlocking");

  const calculateTotal = () => {
    let base = vehicleTypeRates[watchVehicleType] || 0;
    if (watchBlocking) base += 2000; // urgent surcharge
    return base;
  };

  const onSubmit = async (data: RecoveryFormData) => {
    setIsSubmitting(true);
    try {
      const booking: RoadRecoveryBooking = {
        id: crypto.randomUUID(),
        serviceType: "road-recovery",
        customerName: data.fullName,
        customerPhone: data.phone,
        customerEmail: data.email,
        status: "pending",
        paymentStatus: "pending",
        totalAmount: calculateTotal(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        vehicleType: data.vehicleType,
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleColor: data.vehicleColor,
        numberPlate: data.numberPlate,
        currentLocation: data.currentLocation,
        issueDescription: data.issueDescription,
        isBlocking: data.isBlocking,
      };
      fetch("/api/bookings", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          service_type: booking.serviceType || "service",
          customer_name: booking.customerName || "",
          customer_phone: booking.customerPhone || "",
          customer_email: booking.customerEmail || "",
          status: "pending", payment_status: "pending",
          total_amount: booking.totalAmount || 0,
          notes: "",
        }),
      }).catch(e => console.error("Save booking:", e));
      setCurrentBooking(booking);
      setBookingComplete(true);
      toast.success("Recovery request submitted!");
    } catch (error) {
      toast.error("Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success("Payment received! Recovery team dispatched.");
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
                  <Wrench className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Recovery Request Submitted!</CardTitle>
                <CardDescription>Complete payment to dispatch our team.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-muted/50 p-4">
                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Request ID</dt><dd className="font-mono">{currentBooking.id.substring(0, 12)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Vehicle</dt><dd>{currentBooking.vehicleMake} {currentBooking.vehicleModel}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Plate</dt><dd>{currentBooking.numberPlate}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Location</dt><dd>{currentBooking.currentLocation}</dd></div>
                    <div className="flex justify-between border-t border-border pt-2"><dt className="font-semibold">Total</dt><dd className="font-semibold text-primary">KES {currentBooking.totalAmount.toLocaleString()}</dd></div>
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
          <Link href="/services" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to Services</Link>

          <div className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10"><Wrench className="h-7 w-7 text-primary" /></div>
            <h1 className="text-3xl font-bold text-foreground">Road Recovery</h1>
            <p className="mt-2 text-muted-foreground">24/7 emergency road recovery and towing services. Fast response, professional service.</p>
          </div>

          <div className="mb-6 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Need Emergency Assistance?</h3>
              <p className="text-sm text-muted-foreground">Call us directly at <a href="tel:+254700000000" className="text-primary hover:underline">+254 700 000 000</a> for immediate response.</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5 text-primary" />Contact Information</CardTitle></CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Kamau" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="0712345678" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="email" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Wrench className="h-5 w-5 text-primary" />Vehicle Details</CardTitle></CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <FormField control={form.control} name="vehicleType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="motorcycle">Motorcycle - KES 3,000</SelectItem>
                          <SelectItem value="sedan">Sedan/Saloon - KES 5,000</SelectItem>
                          <SelectItem value="suv">SUV - KES 7,000</SelectItem>
                          <SelectItem value="pickup">Pickup - KES 8,000</SelectItem>
                          <SelectItem value="truck-small">Small Truck - KES 12,000</SelectItem>
                          <SelectItem value="truck-large">Large Truck - KES 20,000</SelectItem>
                          <SelectItem value="bus">Bus/Coach - KES 25,000</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="vehicleMake" render={({ field }) => (<FormItem><FormLabel>Make</FormLabel><FormControl><Input placeholder="Toyota" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="vehicleModel" render={({ field }) => (<FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="Corolla" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="vehicleColor" render={({ field }) => (<FormItem><FormLabel>Color</FormLabel><FormControl><Input placeholder="White" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="numberPlate" render={({ field }) => (<FormItem><FormLabel>Number Plate</FormLabel><FormControl><Input placeholder="KBX 123A" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><MapPin className="h-5 w-5 text-primary" />Location & Issue</CardTitle></CardHeader>
                <CardContent className="grid gap-6">
                  <FormField control={form.control} name="currentLocation" render={({ field }) => (<FormItem><FormLabel>Current Location</FormLabel><FormControl><Input placeholder="Describe your location (road, landmarks, GPS coordinates)" {...field} /></FormControl><FormDescription>Be as specific as possible</FormDescription><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="issueDescription" render={({ field }) => (<FormItem><FormLabel>Issue Description</FormLabel><FormControl><Textarea placeholder="Describe what happened (breakdown, accident, stuck, etc.)" className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="isBlocking" render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Vehicle is blocking traffic (+KES 2,000 urgent fee)</FormLabel>
                        <FormDescription>Priority dispatch for vehicles causing obstruction</FormDescription>
                      </div>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="h-5 w-5 text-primary" />Price Summary</CardTitle></CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {watchVehicleType && <div className="flex justify-between text-sm"><dt className="text-muted-foreground">Recovery Fee</dt><dd>KES {vehicleTypeRates[watchVehicleType]?.toLocaleString() || 0}</dd></div>}
                    {watchBlocking && <div className="flex justify-between text-sm"><dt className="text-muted-foreground">Urgent Surcharge</dt><dd>KES 2,000</dd></div>}
                    <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold"><dt>Total</dt><dd className="text-primary">KES {calculateTotal().toLocaleString()}</dd></div>
                  </dl>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Request Recovery"}</Button>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
