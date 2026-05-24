"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HardHat, User, CreditCard, ArrowLeft, Calendar, MapPin } from "lucide-react";
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
import type { ConstructionEquipmentBooking } from "@/types";

const equipmentSchema = z.object({
  fullName: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone required"),
  equipmentType: z.string().min(1, "Select equipment"),
  quantity: z.string().min(1, "Enter quantity"),
  deliverySite: z.string().min(5, "Enter site address"),
  rentalStartDate: z.string().min(1, "Select start date"),
  rentalEndDate: z.string().min(1, "Select end date"),
  operatorRequired: z.boolean(),
  projectDescription: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

const equipmentTypes = [
  { id: "excavator-mini", name: "Mini Excavator", rate: 25000 },
  { id: "excavator-standard", name: "Standard Excavator", rate: 45000 },
  { id: "excavator-large", name: "Large Excavator", rate: 75000 },
  { id: "bulldozer", name: "Bulldozer", rate: 60000 },
  { id: "crane-mobile", name: "Mobile Crane", rate: 80000 },
  { id: "crane-tower", name: "Tower Crane", rate: 150000 },
  { id: "loader", name: "Wheel Loader", rate: 35000 },
  { id: "roller", name: "Road Roller", rate: 20000 },
  { id: "concrete-mixer", name: "Concrete Mixer Truck", rate: 30000 },
  { id: "dump-truck", name: "Dump Truck", rate: 25000 },
  { id: "backhoe", name: "Backhoe Loader", rate: 28000 },
  { id: "generator", name: "Generator (Large)", rate: 15000 },
];

export default function ConstructionEquipmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<ConstructionEquipmentBooking | null>(null);

  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      fullName: "", email: "", phone: "", equipmentType: "", quantity: "1", deliverySite: "",
      rentalStartDate: "", rentalEndDate: "", operatorRequired: false, projectDescription: "",
    },
  });

  const watchEquipmentType = form.watch("equipmentType");
  const watchQuantity = form.watch("quantity");
  const watchStartDate = form.watch("rentalStartDate");
  const watchEndDate = form.watch("rentalEndDate");
  const watchOperator = form.watch("operatorRequired");

  const calculateDays = () => {
    if (!watchStartDate || !watchEndDate) return 0;
    const start = new Date(watchStartDate);
    const end = new Date(watchEndDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const calculateTotal = () => {
    const equipment = equipmentTypes.find((e) => e.id === watchEquipmentType);
    if (!equipment) return 0;
    const days = calculateDays();
    const qty = parseInt(watchQuantity) || 1;
    let total = equipment.rate * days * qty;
    if (watchOperator) total += 5000 * days * qty; // Operator fee per day per equipment
    return total;
  };

  const onSubmit = async (data: EquipmentFormData) => {
    setIsSubmitting(true);
    try {
      const equipment = equipmentTypes.find((e) => e.id === data.equipmentType);
      const booking: ConstructionEquipmentBooking = {
        id: crypto.randomUUID(),
        serviceType: "construction-equipment",
        customerName: data.fullName,
        customerPhone: data.phone,
        customerEmail: data.email,
        status: "pending",
        paymentStatus: "pending",
        totalAmount: calculateTotal(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        equipmentType: equipment?.name || data.equipmentType,
        quantity: parseInt(data.quantity),
        deliverySite: data.deliverySite,
        rentalStartDate: data.rentalStartDate,
        rentalEndDate: data.rentalEndDate,
        operatorRequired: data.operatorRequired,
        projectDescription: data.projectDescription,
      };
      saveBooking(booking);
      setCurrentBooking(booking);
      setBookingComplete(true);
      toast.success("Equipment booking created!");
    } catch (error) {
      toast.error("Failed to create booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success("Deposit received! We'll confirm equipment availability.");
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
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><HardHat className="h-8 w-8 text-primary" /></div>
                <CardTitle className="text-2xl">Equipment Booking Submitted!</CardTitle>
                <CardDescription>Pay deposit to confirm reservation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-muted/50 p-4">
                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Booking ID</dt><dd className="font-mono">{currentBooking.id.substring(0, 12)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Equipment</dt><dd>{currentBooking.equipmentType} x{currentBooking.quantity}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Duration</dt><dd>{calculateDays()} day(s)</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Site</dt><dd className="truncate max-w-[200px]">{currentBooking.deliverySite}</dd></div>
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
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10"><HardHat className="h-7 w-7 text-primary" /></div>
            <h1 className="text-3xl font-bold text-foreground">Construction Equipment</h1>
            <p className="mt-2 text-muted-foreground">Heavy machinery rentals for your construction projects. Excavators, cranes, loaders, and more.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5 text-primary" />Contact Information</CardTitle></CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Full Name / Company</FormLabel><FormControl><Input placeholder="ABC Construction Ltd" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="0712345678" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="email" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="contact@company.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><HardHat className="h-5 w-5 text-primary" />Equipment Selection</CardTitle></CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField control={form.control} name="equipmentType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipment Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select equipment" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {equipmentTypes.map((eq) => (<SelectItem key={eq.id} value={eq.id}>{eq.name} - KES {eq.rate.toLocaleString()}/day</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" min="1" max="10" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>

                  <FormField control={form.control} name="operatorRequired" render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 rounded-md border border-border p-4">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Include Operator (+KES 5,000/day per unit)</FormLabel>
                        <FormDescription>Professional certified operator for each equipment</FormDescription>
                      </div>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Calendar className="h-5 w-5 text-primary" />Rental Period & Site</CardTitle></CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField control={form.control} name="rentalStartDate" render={({ field }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><DatePicker value={field.value} onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")} placeholder="Select start date" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="rentalEndDate" render={({ field }) => (<FormItem><FormLabel>End Date</FormLabel><FormControl><DatePicker value={field.value} onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")} placeholder="Select end date" /></FormControl><FormMessage /></FormItem>)} />
                  </div>

                  <FormField control={form.control} name="deliverySite" render={({ field }) => (<FormItem><FormLabel>Delivery Site Address</FormLabel><FormControl><Input placeholder="Site address with landmarks" {...field} /></FormControl><FormDescription>Where should we deliver the equipment?</FormDescription><FormMessage /></FormItem>)} />

                  <FormField control={form.control} name="projectDescription" render={({ field }) => (<FormItem><FormLabel>Project Description (Optional)</FormLabel><FormControl><Textarea placeholder="Briefly describe your project and how the equipment will be used" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="h-5 w-5 text-primary" />Price Summary</CardTitle></CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {watchEquipmentType && watchStartDate && watchEndDate && (
                      <>
                        <div className="flex justify-between text-sm">
                          <dt className="text-muted-foreground">{equipmentTypes.find((e) => e.id === watchEquipmentType)?.name} x {watchQuantity} x {calculateDays()} day(s)</dt>
                          <dd>KES {((equipmentTypes.find((e) => e.id === watchEquipmentType)?.rate || 0) * calculateDays() * (parseInt(watchQuantity) || 1)).toLocaleString()}</dd>
                        </div>
                        {watchOperator && (
                          <div className="flex justify-between text-sm">
                            <dt className="text-muted-foreground">Operator(s) x {calculateDays()} day(s)</dt>
                            <dd>KES {(5000 * calculateDays() * (parseInt(watchQuantity) || 1)).toLocaleString()}</dd>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold"><dt>Total</dt><dd className="text-primary">KES {calculateTotal().toLocaleString()}</dd></div>
                  </dl>
                  <p className="mt-2 text-xs text-muted-foreground">Delivery charges may apply based on site location.</p>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Processing..." : "Reserve Equipment"}</Button>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
