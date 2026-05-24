"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Package, User, CreditCard, ArrowLeft, Scale, AlertTriangle } from "lucide-react";
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
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import type { CargoBooking } from "@/types";

const cargoSchema = z.object({
  fullName: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone required"),
  cargoType: z.string().min(1, "Select cargo type"),
  weight: z.string().min(1, "Enter weight"),
  length: z.string().min(1, "Enter length"),
  width: z.string().min(1, "Enter width"),
  height: z.string().min(1, "Enter height"),
  originPort: z.string().min(2, "Enter origin"),
  destinationPort: z.string().min(2, "Enter destination"),
  pickupDate: z.string().min(1, "Select date"),
  requiresRefrigeration: z.boolean(),
  hazardous: z.boolean(),
  cargoDescription: z.string().optional(),
});

type CargoFormData = z.infer<typeof cargoSchema>;

const cargoTypeRates: Record<string, number> = {
  "general": 15,
  "perishable": 25,
  "fragile": 30,
  "heavy-machinery": 50,
  "vehicles": 100,
  "chemicals": 45,
};

export default function CargoHandlingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<CargoBooking | null>(null);

  const form = useForm<CargoFormData>({
    resolver: zodResolver(cargoSchema),
    defaultValues: {
      fullName: "", email: "", phone: "", cargoType: "", weight: "", length: "", width: "", height: "",
      originPort: "", destinationPort: "", pickupDate: "", requiresRefrigeration: false, hazardous: false, cargoDescription: "",
    },
  });

  const watchCargoType = form.watch("cargoType");
  const watchWeight = form.watch("weight");
  const watchRefrigeration = form.watch("requiresRefrigeration");
  const watchHazardous = form.watch("hazardous");

  const calculateTotal = () => {
    const rate = cargoTypeRates[watchCargoType] || 0;
    const weight = parseFloat(watchWeight) || 0;
    let total = rate * weight;
    if (watchRefrigeration) total *= 1.3;
    if (watchHazardous) total *= 1.5;
    return Math.round(total);
  };

  const onSubmit = async (data: CargoFormData) => {
    setIsSubmitting(true);
    try {
      const booking: CargoBooking = {
        id: crypto.randomUUID(),
        serviceType: "cargo-handling",
        customerName: data.fullName,
        customerPhone: data.phone,
        customerEmail: data.email,
        status: "pending",
        paymentStatus: "pending",
        totalAmount: calculateTotal(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cargoType: data.cargoType,
        weight: parseFloat(data.weight),
        dimensions: { length: parseFloat(data.length), width: parseFloat(data.width), height: parseFloat(data.height) },
        originPort: data.originPort,
        destinationPort: data.destinationPort,
        requiresRefrigeration: data.requiresRefrigeration,
        hazardous: data.hazardous,
        pickupDate: data.pickupDate,
      };
      saveBooking(booking);
      setCurrentBooking(booking);
      setBookingComplete(true);
      toast.success("Cargo booking created!");
    } catch (error) {
      toast.error("Failed to create booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success("Payment received! We'll contact you with details.");
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
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><Package className="h-8 w-8 text-primary" /></div>
                <CardTitle className="text-2xl">Cargo Booking Confirmed!</CardTitle>
                <CardDescription>Complete payment to process your cargo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-muted/50 p-4">
                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Booking ID</dt><dd className="font-mono">{currentBooking.id.substring(0, 12)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Cargo Type</dt><dd className="capitalize">{currentBooking.cargoType}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Weight</dt><dd>{currentBooking.weight} kg</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Route</dt><dd>{currentBooking.originPort} to {currentBooking.destinationPort}</dd></div>
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
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10"><Package className="h-7 w-7 text-primary" /></div>
            <h1 className="text-3xl font-bold text-foreground">Cargo Handling</h1>
            <p className="mt-2 text-muted-foreground">Professional cargo handling, port clearance, warehousing, and distribution services.</p>
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
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Package className="h-5 w-5 text-primary" />Cargo Details</CardTitle></CardHeader>
                <CardContent className="grid gap-6">
                  <FormField control={form.control} name="cargoType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="general">General Cargo - KES 15/kg</SelectItem>
                          <SelectItem value="perishable">Perishable Goods - KES 25/kg</SelectItem>
                          <SelectItem value="fragile">Fragile Items - KES 30/kg</SelectItem>
                          <SelectItem value="heavy-machinery">Heavy Machinery - KES 50/kg</SelectItem>
                          <SelectItem value="vehicles">Vehicles - KES 100/kg</SelectItem>
                          <SelectItem value="chemicals">Chemicals - KES 45/kg</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <div className="grid gap-6 sm:grid-cols-4">
                    <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" min="1" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="length" render={({ field }) => (<FormItem><FormLabel>Length (cm)</FormLabel><FormControl><Input type="number" min="1" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="width" render={({ field }) => (<FormItem><FormLabel>Width (cm)</FormLabel><FormControl><Input type="number" min="1" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" min="1" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField control={form.control} name="originPort" render={({ field }) => (<FormItem><FormLabel>Origin Port/Location</FormLabel><FormControl><Input placeholder="Mombasa Port" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="destinationPort" render={({ field }) => (<FormItem><FormLabel>Destination</FormLabel><FormControl><Input placeholder="Nairobi ICD" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>

                  <FormField control={form.control} name="pickupDate" render={({ field }) => (<FormItem><FormLabel>Pickup/Collection Date</FormLabel><FormControl><DatePicker value={field.value} onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")} placeholder="Select pickup date" /></FormControl><FormMessage /></FormItem>)} />

                  <FormField control={form.control} name="cargoDescription" render={({ field }) => (<FormItem><FormLabel>Cargo Description (Optional)</FormLabel><FormControl><Textarea placeholder="Additional details about your cargo" {...field} /></FormControl><FormMessage /></FormItem>)} />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={form.control} name="requiresRefrigeration" render={({ field }) => (
                      <FormItem className="flex flex-row items-start gap-3 rounded-md border border-border p-4">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Requires Refrigeration (+30%)</FormLabel>
                          <FormDescription>Cold chain transportation needed</FormDescription>
                        </div>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="hazardous" render={({ field }) => (
                      <FormItem className="flex flex-row items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Hazardous Materials (+50%)</FormLabel>
                          <FormDescription>Special handling required</FormDescription>
                        </div>
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="h-5 w-5 text-primary" />Price Estimate</CardTitle></CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {watchCargoType && watchWeight && (
                      <div className="flex justify-between text-sm"><dt className="text-muted-foreground">{watchCargoType} @ {watchWeight}kg</dt><dd>KES {(cargoTypeRates[watchCargoType] * parseFloat(watchWeight || "0")).toLocaleString()}</dd></div>
                    )}
                    {watchRefrigeration && <div className="flex justify-between text-sm"><dt className="text-muted-foreground">Refrigeration (+30%)</dt><dd>Included</dd></div>}
                    {watchHazardous && <div className="flex justify-between text-sm"><dt className="text-muted-foreground">Hazardous Handling (+50%)</dt><dd>Included</dd></div>}
                    <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold"><dt>Total Estimate</dt><dd className="text-primary">KES {calculateTotal().toLocaleString()}</dd></div>
                  </dl>
                  <p className="mt-2 text-xs text-muted-foreground">Final price may vary based on actual measurements and route.</p>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Processing..." : "Request Quote & Book"}</Button>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
