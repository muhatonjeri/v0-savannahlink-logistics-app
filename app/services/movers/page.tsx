"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Truck, Calendar, User, CreditCard, ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MpesaPayment } from "@/components/payment/mpesa-payment";
import { saveBooking, generateId } from "@/lib/store";
import { toast } from "sonner";
import type { MoversBooking } from "@/types";

const moversSchema = z.object({
  moveType: z.enum(["residential", "commercial", "office"]),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  originAddress: z.string().min(5, "Please enter origin address"),
  destinationAddress: z.string().min(5, "Please enter destination address"),
  moveDate: z.string().min(1, "Please select move date"),
  inventoryList: z.string().min(10, "Please describe items to be moved"),
  requiresPacking: z.boolean(),
  originFloorAccess: z.string().min(1, "Please select floor access"),
  destinationFloorAccess: z.string().min(1, "Please select floor access"),
});

type MoversFormData = z.infer<typeof moversSchema>;

const moveTypeRates = {
  residential: 15000,
  commercial: 35000,
  office: 25000,
};

export default function MoversPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<MoversBooking | null>(null);

  const form = useForm<MoversFormData>({
    resolver: zodResolver(moversSchema),
    defaultValues: {
      moveType: "residential",
      fullName: "",
      email: "",
      phone: "",
      originAddress: "",
      destinationAddress: "",
      moveDate: "",
      inventoryList: "",
      requiresPacking: false,
      originFloorAccess: "",
      destinationFloorAccess: "",
    },
  });

  const watchMoveType = form.watch("moveType");
  const watchPacking = form.watch("requiresPacking");

  const calculateTotal = () => {
    let base = moveTypeRates[watchMoveType] || 0;
    if (watchPacking) base += 5000;
    return base;
  };

  const onSubmit = async (data: MoversFormData) => {
    setIsSubmitting(true);
    try {
      const booking: MoversBooking = {
        id: generateId(),
        serviceType: "movers",
        customerName: data.fullName,
        customerPhone: data.phone,
        customerEmail: data.email,
        status: "pending",
        paymentStatus: "pending",
        totalAmount: calculateTotal(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        moveType: data.moveType,
        originAddress: data.originAddress,
        destinationAddress: data.destinationAddress,
        moveDate: data.moveDate,
        inventoryList: data.inventoryList,
        requiresPacking: data.requiresPacking,
        floorAccess: {
          origin: data.originFloorAccess as "ground" | "stairs" | "elevator",
          destination: data.destinationFloorAccess as "ground" | "stairs" | "elevator",
        },
      };
      saveBooking(booking);
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
    toast.success("Payment received! Your move is confirmed.");
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
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Moving Booking Confirmed!</CardTitle>
                <CardDescription>Complete payment to confirm your move.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-muted/50 p-4">
                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Booking ID</dt>
                      <dd className="font-mono">{currentBooking.id.substring(0, 12)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Move Type</dt>
                      <dd className="capitalize">{currentBooking.moveType}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Date</dt>
                      <dd>{currentBooking.moveDate}</dd>
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
              <Truck className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Movers</h1>
            <p className="mt-2 text-muted-foreground">Professional moving services for homes, offices, and commercial spaces.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Truck className="h-5 w-5 text-primary" />Move Type</CardTitle></CardHeader>
                <CardContent>
                  <FormField control={form.control} name="moveType" render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select move type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="residential">Residential - KES 15,000 base</SelectItem>
                          <SelectItem value="office">Office - KES 25,000 base</SelectItem>
                          <SelectItem value="commercial">Commercial - KES 35,000 base</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5 text-primary" />Personal Information</CardTitle></CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Kamau" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="0712345678" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem className="sm:col-span-2"><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><MapPin className="h-5 w-5 text-primary" />Move Details</CardTitle></CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField control={form.control} name="originAddress" render={({ field }) => (
                      <FormItem><FormLabel>Origin Address</FormLabel><FormControl><Input placeholder="Current location address" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="destinationAddress" render={({ field }) => (
                      <FormItem><FormLabel>Destination Address</FormLabel><FormControl><Input placeholder="New location address" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="originFloorAccess" render={({ field }) => (
                      <FormItem><FormLabel>Origin Floor Access</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="ground">Ground Floor</SelectItem>
                            <SelectItem value="stairs">Stairs</SelectItem>
                            <SelectItem value="elevator">Elevator</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="destinationFloorAccess" render={({ field }) => (
                      <FormItem><FormLabel>Destination Floor Access</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="ground">Ground Floor</SelectItem>
                            <SelectItem value="stairs">Stairs</SelectItem>
                            <SelectItem value="elevator">Elevator</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="moveDate" render={({ field }) => (
                    <FormItem><FormLabel>Move Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="inventoryList" render={({ field }) => (
                    <FormItem><FormLabel>Inventory List</FormLabel><FormControl><Textarea placeholder="List items to be moved (beds, sofas, appliances, boxes, etc.)" className="min-h-[100px]" {...field} /></FormControl><FormDescription>Provide details about items to help us prepare</FormDescription><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="requiresPacking" render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 rounded-md border border-border p-4">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Professional Packing Service (+KES 5,000)</FormLabel>
                        <FormDescription>We&apos;ll pack all your items securely</FormDescription>
                      </div>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="h-5 w-5 text-primary" />Price Summary</CardTitle></CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between text-sm"><dt className="text-muted-foreground capitalize">{watchMoveType} Move (Base)</dt><dd>KES {moveTypeRates[watchMoveType].toLocaleString()}</dd></div>
                    {watchPacking && <div className="flex justify-between text-sm"><dt className="text-muted-foreground">Packing Service</dt><dd>KES 5,000</dd></div>}
                    <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold"><dt>Total</dt><dd className="text-primary">KES {calculateTotal().toLocaleString()}</dd></div>
                  </dl>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Processing..." : "Continue to Payment"}</Button>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
