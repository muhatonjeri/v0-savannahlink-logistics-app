"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ship, User, CreditCard, ArrowLeft, Globe, FileText } from "lucide-react";
import Link from "next/link";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MpesaPayment } from "@/components/payment/mpesa-payment";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import type { ShipmentBooking } from "@/types";

const shipmentSchema = z.object({
  fullName: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone required"),
  originCountry: z.string().min(1, "Select origin country"),
  shipmentType: z.enum(["air", "sea", "road"]),
  cargoDescription: z.string().min(10, "Describe your cargo"),
  estimatedWeight: z.string().min(1, "Enter weight"),
  declaredValue: z.string().min(1, "Enter declared value"),
  currency: z.string().min(1, "Select currency"),
  hsCode: z.string().optional(),
  deliveryAddress: z.string().min(10, "Enter delivery address"),
  expectedArrival: z.string().min(1, "Enter expected arrival"),
});

type ShipmentFormData = z.infer<typeof shipmentSchema>;

const shipmentTypeRates: Record<string, number> = { "air": 50, "sea": 15, "road": 25 };

const countries = ["China", "India", "USA", "UK", "Germany", "Japan", "UAE", "Turkey", "South Africa", "Tanzania", "Uganda", "Other"];

export default function ShipmentImportsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<ShipmentBooking | null>(null);

  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      fullName: "", email: "", phone: "", originCountry: "", shipmentType: "sea", cargoDescription: "",
      estimatedWeight: "", declaredValue: "", currency: "USD", hsCode: "", deliveryAddress: "", expectedArrival: "",
    },
  });

  const watchShipmentType = form.watch("shipmentType");
  const watchWeight = form.watch("estimatedWeight");
  const watchValue = form.watch("declaredValue");

  const calculateTotal = () => {
    const rate = shipmentTypeRates[watchShipmentType] || 0;
    const weight = parseFloat(watchWeight) || 0;
    const value = parseFloat(watchValue) || 0;
    // Base rate per kg + 2% of declared value for customs handling
    return Math.round(rate * weight + value * 0.02 * 150); // Convert to KES (rough estimate)
  };

  const onSubmit = async (data: ShipmentFormData) => {
    setIsSubmitting(true);
    try {
      const booking: ShipmentBooking = {
        id: crypto.randomUUID(),
        serviceType: "shipment-imports",
        customerName: data.fullName,
        customerPhone: data.phone,
        customerEmail: data.email,
        status: "pending",
        paymentStatus: "pending",
        totalAmount: calculateTotal(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        originCountry: data.originCountry,
        shipmentType: data.shipmentType,
        cargoDescription: data.cargoDescription,
        estimatedWeight: parseFloat(data.estimatedWeight),
        customsInfo: {
          hsCode: data.hsCode,
          declaredValue: parseFloat(data.declaredValue),
          currency: data.currency,
        },
        deliveryAddress: data.deliveryAddress,
        expectedArrival: data.expectedArrival,
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
      toast.success("Import request submitted!");
    } catch (error) {
      toast.error("Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success("Deposit received! We'll process your import.");
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
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><Ship className="h-8 w-8 text-primary" /></div>
                <CardTitle className="text-2xl">Import Request Submitted!</CardTitle>
                <CardDescription>Pay deposit to start processing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-muted/50 p-4">
                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Request ID</dt><dd className="font-mono">{currentBooking.id.substring(0, 12)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Origin</dt><dd>{currentBooking.originCountry}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Shipment Type</dt><dd className="capitalize">{currentBooking.shipmentType}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Weight</dt><dd>{currentBooking.estimatedWeight} kg</dd></div>
                    <div className="flex justify-between border-t border-border pt-2"><dt className="font-semibold">Deposit (Estimate)</dt><dd className="font-semibold text-primary">KES {currentBooking.totalAmount.toLocaleString()}</dd></div>
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
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10"><Ship className="h-7 w-7 text-primary" /></div>
            <h1 className="text-3xl font-bold text-foreground">Shipment (Imports)</h1>
            <p className="mt-2 text-muted-foreground">Complete import facilitation: customs clearance, documentation, and door-to-door delivery.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5 text-primary" />Contact Information</CardTitle></CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Full Name / Company</FormLabel><FormControl><Input placeholder="John Kamau / ABC Ltd" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="0712345678" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="email" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Globe className="h-5 w-5 text-primary" />Shipment Details</CardTitle></CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField control={form.control} name="originCountry" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin Country</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger></FormControl>
                          <SelectContent>{countries.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="shipmentType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipment Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="air">Air Freight - KES 50/kg</SelectItem>
                            <SelectItem value="sea">Sea Freight - KES 15/kg</SelectItem>
                            <SelectItem value="road">Road Freight - KES 25/kg</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="cargoDescription" render={({ field }) => (<FormItem><FormLabel>Cargo Description</FormLabel><FormControl><Textarea placeholder="Describe your goods (type, quantity, purpose)" className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)} />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField control={form.control} name="estimatedWeight" render={({ field }) => (<FormItem><FormLabel>Estimated Weight (kg)</FormLabel><FormControl><Input type="number" min="1" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="expectedArrival" render={({ field }) => (<FormItem><FormLabel>Expected Arrival Date</FormLabel><FormControl><DatePicker value={field.value} onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")} placeholder="Select arrival date" /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5 text-primary" />Customs Information</CardTitle></CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-6 sm:grid-cols-3">
                    <FormField control={form.control} name="declaredValue" render={({ field }) => (<FormItem><FormLabel>Declared Value</FormLabel><FormControl><Input type="number" min="1" placeholder="1000" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="currency" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="CNY">CNY</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="hsCode" render={({ field }) => (<FormItem><FormLabel>HS Code (Optional)</FormLabel><FormControl><Input placeholder="8471.30.00" {...field} /></FormControl><FormDescription>Harmonized System code</FormDescription><FormMessage /></FormItem>)} />
                  </div>

                  <FormField control={form.control} name="deliveryAddress" render={({ field }) => (<FormItem><FormLabel>Delivery Address</FormLabel><FormControl><Textarea placeholder="Full delivery address in Kenya" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="h-5 w-5 text-primary" />Cost Estimate</CardTitle></CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {watchShipmentType && watchWeight && (<div className="flex justify-between text-sm"><dt className="text-muted-foreground capitalize">{watchShipmentType} Freight @ {watchWeight}kg</dt><dd>KES {(shipmentTypeRates[watchShipmentType] * parseFloat(watchWeight || "0")).toLocaleString()}</dd></div>)}
                    {watchValue && (<div className="flex justify-between text-sm"><dt className="text-muted-foreground">Customs Handling (est.)</dt><dd>KES {Math.round(parseFloat(watchValue) * 0.02 * 150).toLocaleString()}</dd></div>)}
                    <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold"><dt>Deposit Estimate</dt><dd className="text-primary">KES {calculateTotal().toLocaleString()}</dd></div>
                  </dl>
                  <p className="mt-2 text-xs text-muted-foreground">Final costs depend on actual weight, duties, and taxes. We&apos;ll provide detailed quote after review.</p>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Import Request"}</Button>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
