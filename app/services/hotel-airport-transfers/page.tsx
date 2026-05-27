"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plane, Calendar, User, CreditCard, ArrowLeft, Building2, MapPin, List, PenLine } from "lucide-react";
import Link from "next/link";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MpesaPayment } from "@/components/payment/mpesa-payment";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
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

// Kenya Airports
const kenyaAirports = [
  // International Airports
  { code: "NBO", name: "Jomo Kenyatta International Airport (JKIA)", city: "Nairobi", type: "International" },
  { code: "MBA", name: "Moi International Airport", city: "Mombasa", type: "International" },
  // Domestic/Regional Airports
  { code: "WIL", name: "Wilson Airport", city: "Nairobi", type: "Domestic" },
  { code: "KIS", name: "Kisumu International Airport", city: "Kisumu", type: "Regional" },
  { code: "EDL", name: "Eldoret International Airport", city: "Eldoret", type: "Regional" },
  { code: "MYD", name: "Malindi Airport", city: "Malindi", type: "Domestic" },
  { code: "UKA", name: "Ukunda Airstrip (Diani)", city: "Ukunda", type: "Domestic" },
  { code: "LAU", name: "Manda Airport (Lamu)", city: "Lamu", type: "Domestic" },
  { code: "NDE", name: "Nanyuki Airfield", city: "Nanyuki", type: "Domestic" },
  { code: "NYK", name: "Nanyuki Civil Airport", city: "Nanyuki", type: "Domestic" },
  { code: "LOK", name: "Lokichogio Airport", city: "Lokichogio", type: "Domestic" },
  { code: "LKG", name: "Lokichoggio Airport", city: "Turkana", type: "Domestic" },
  { code: "OYL", name: "Moyale Airport", city: "Moyale", type: "Domestic" },
  { code: "WJR", name: "Wajir Airport", city: "Wajir", type: "Domestic" },
  { code: "GAS", name: "Garissa Airport", city: "Garissa", type: "Domestic" },
  { code: "HOA", name: "Homa Bay Airport", city: "Homa Bay", type: "Domestic" },
  { code: "KTL", name: "Kitale Airport", city: "Kitale", type: "Domestic" },
  { code: "NUU", name: "Nakuru Airport", city: "Nakuru", type: "Domestic" },
  { code: "NYE", name: "Nyeri Airport", city: "Nyeri", type: "Domestic" },
  { code: "KEU", name: "Keekorok Airstrip", city: "Masai Mara", type: "Airstrip" },
  { code: "MRE", name: "Mara Serena Airstrip", city: "Masai Mara", type: "Airstrip" },
  { code: "OLX", name: "Ol Kiombo Airstrip", city: "Masai Mara", type: "Airstrip" },
  { code: "ASV", name: "Amboseli Airport", city: "Amboseli", type: "Airstrip" },
  { code: "SRX", name: "Samburu Airstrip", city: "Samburu", type: "Airstrip" },
];

// Kenya Hotels by Star Rating
const kenyaHotels = {
  fiveStar: [
    // Nairobi 5-Star
    { name: "Villa Rosa Kempinski", location: "Nairobi", area: "Westlands" },
    { name: "Hemingways Nairobi", location: "Nairobi", area: "Karen" },
    { name: "Fairmont The Norfolk", location: "Nairobi", area: "CBD" },
    { name: "The Sarova Stanley", location: "Nairobi", area: "CBD" },
    { name: "Tribe Hotel", location: "Nairobi", area: "Gigiri" },
    { name: "Radisson Blu Hotel & Residence", location: "Nairobi", area: "Upperhill" },
    { name: "Sankara Nairobi", location: "Nairobi", area: "Westlands" },
    { name: "Dusit D2 Nairobi", location: "Nairobi", area: "Riverside" },
    { name: "JW Marriott Hotel Nairobi", location: "Nairobi", area: "Westlands" },
    { name: "Movenpick Hotel & Residences Nairobi", location: "Nairobi", area: "Westlands" },
    { name: "Nairobi Serena Hotel", location: "Nairobi", area: "CBD" },
    { name: "The Boma Nairobi", location: "Nairobi", area: "Upperhill" },
    // Mombasa 5-Star
    { name: "Serena Beach Resort & Spa", location: "Mombasa", area: "Shanzu" },
    { name: "Sarova Whitesands Beach Resort", location: "Mombasa", area: "Bamburi" },
    { name: "Hemingways Watamu", location: "Watamu", area: "Watamu Beach" },
    { name: "Medina Palms", location: "Watamu", area: "Watamu Beach" },
    // Diani 5-Star
    { name: "Almanara Luxury Boutique Hotel", location: "Diani", area: "Diani Beach" },
    { name: "Swahili Beach Resort", location: "Diani", area: "Diani Beach" },
    { name: "The Sands at Nomad", location: "Diani", area: "Diani Beach" },
    { name: "Leopard Beach Resort & Spa", location: "Diani", area: "Diani Beach" },
    // Safari Lodges 5-Star
    { name: "Angama Mara", location: "Masai Mara", area: "Mara Triangle" },
    { name: "Mahali Mzuri", location: "Masai Mara", area: "Olare Motorogi" },
    { name: "&Beyond Bateleur Camp", location: "Masai Mara", area: "Masai Mara" },
    { name: "Mara Bushtops", location: "Masai Mara", area: "Siana Conservancy" },
    { name: "Ol Donyo Lodge", location: "Amboseli", area: "Chyulu Hills" },
    { name: "Tortilis Camp", location: "Amboseli", area: "Amboseli" },
    { name: "Giraffe Manor", location: "Nairobi", area: "Langata" },
    { name: "Segera Retreat", location: "Laikipia", area: "Laikipia Plateau" },
    { name: "Lewa Safari Camp", location: "Lewa", area: "Lewa Conservancy" },
    { name: "Sirikoi Lodge", location: "Lewa", area: "Lewa Conservancy" },
  ],
  fourStar: [
    // Nairobi 4-Star
    { name: "Crowne Plaza Nairobi", location: "Nairobi", area: "Upperhill" },
    { name: "Hilton Nairobi", location: "Nairobi", area: "CBD" },
    { name: "InterContinental Nairobi", location: "Nairobi", area: "CBD" },
    { name: "Sarova Panafric Hotel", location: "Nairobi", area: "Kenyatta Avenue" },
    { name: "Ole Sereni Hotel", location: "Nairobi", area: "Nairobi National Park" },
    { name: "Eka Hotel", location: "Nairobi", area: "Mombasa Road" },
    { name: "Southern Sun Mayfair Nairobi", location: "Nairobi", area: "Westlands" },
    { name: "PrideInn Azure Hotel", location: "Nairobi", area: "Westlands" },
    { name: "Trademark Hotel", location: "Nairobi", area: "Village Market" },
    { name: "Best Western Plus Meridian Hotel", location: "Nairobi", area: "CBD" },
    { name: "Fairview Hotel", location: "Nairobi", area: "Upperhill" },
    { name: "Tamarind Tree Hotel", location: "Nairobi", area: "Langata" },
    // Mombasa 4-Star
    { name: "Voyager Beach Resort", location: "Mombasa", area: "Nyali" },
    { name: "Sarova Taita Hills Game Lodge", location: "Taita", area: "Taita Hills" },
    { name: "PrideInn Paradise Beach Resort", location: "Mombasa", area: "Shanzu" },
    { name: "Baobab Beach Resort & Spa", location: "Diani", area: "Diani Beach" },
    { name: "Neptune Beach Resort", location: "Diani", area: "Diani Beach" },
    { name: "Neptune Village Beach Resort", location: "Diani", area: "Diani Beach" },
    { name: "Pinewood Beach Resort & Spa", location: "Diani", area: "Galu Beach" },
    { name: "Diani Reef Beach Resort & Spa", location: "Diani", area: "Diani Beach" },
    // Safari Lodges 4-Star
    { name: "Mara Serena Safari Lodge", location: "Masai Mara", area: "Masai Mara" },
    { name: "Sarova Mara Game Camp", location: "Masai Mara", area: "Masai Mara" },
    { name: "Mara Sopa Lodge", location: "Masai Mara", area: "Masai Mara" },
    { name: "Keekorok Lodge", location: "Masai Mara", area: "Masai Mara" },
    { name: "Amboseli Serena Safari Lodge", location: "Amboseli", area: "Amboseli" },
    { name: "Amboseli Sopa Lodge", location: "Amboseli", area: "Amboseli" },
    { name: "Ol Tukai Lodge", location: "Amboseli", area: "Amboseli" },
    { name: "Lake Nakuru Sopa Lodge", location: "Nakuru", area: "Lake Nakuru" },
    { name: "Sarova Lion Hill Game Lodge", location: "Nakuru", area: "Lake Nakuru" },
    { name: "Lake Naivasha Sopa Resort", location: "Naivasha", area: "Lake Naivasha" },
    { name: "Great Rift Valley Lodge", location: "Naivasha", area: "Lake Naivasha" },
    { name: "Samburu Sopa Lodge", location: "Samburu", area: "Samburu" },
    { name: "Samburu Serena Safari Lodge", location: "Samburu", area: "Samburu" },
    { name: "Ashnil Samburu Camp", location: "Samburu", area: "Samburu" },
    // Other 4-Star
    { name: "Lake Elementaita Serena Camp", location: "Elementaita", area: "Lake Elementaita" },
    { name: "Lake Bogoria Spa Resort", location: "Bogoria", area: "Lake Bogoria" },
    { name: "Maasai Lodge", location: "Nairobi", area: "Athi River" },
  ],
  threeStar: [
    // Nairobi 3-Star
    { name: "Silver Springs Hotel", location: "Nairobi", area: "Hurlingham" },
    { name: "The Heron Portico", location: "Nairobi", area: "Milimani" },
    { name: "Sentrim 680 Hotel", location: "Nairobi", area: "CBD" },
    { name: "Kenya Comfort Hotel Suites", location: "Nairobi", area: "Milimani" },
    { name: "Jacaranda Hotel", location: "Nairobi", area: "Westlands" },
    { name: "Laico Regency Hotel", location: "Nairobi", area: "Uhuru Highway" },
    { name: "Marble Arch Hotel", location: "Nairobi", area: "CBD" },
    { name: "The Clarion Hotel", location: "Nairobi", area: "CBD" },
    { name: "Hotel Emerald", location: "Nairobi", area: "CBD" },
    { name: "Windsor Golf Hotel", location: "Nairobi", area: "Ridgeways" },
    { name: "PrideInn Hotel Westlands", location: "Nairobi", area: "Westlands" },
    { name: "67 Airport Hotel", location: "Nairobi", area: "Embakasi" },
    { name: "Mountain View Hotel", location: "Nairobi", area: "Juja Road" },
    { name: "Panari Hotel", location: "Nairobi", area: "Mombasa Road" },
    // Mombasa 3-Star
    { name: "Sentrim Castle Royal Hotel", location: "Mombasa", area: "Mombasa Island" },
    { name: "PrideInn Mombasa", location: "Mombasa", area: "CBD" },
    { name: "Reef Hotel", location: "Mombasa", area: "Nyali" },
    { name: "Kenya Bay Beach Hotel", location: "Mombasa", area: "Bamburi" },
    { name: "Severin Sea Lodge", location: "Mombasa", area: "Bamburi" },
    { name: "Indiana Beach Apartments", location: "Diani", area: "Diani Beach" },
    { name: "Papillon Lagoon Reef", location: "Diani", area: "Diani Beach" },
    { name: "Leisure Lodge Beach & Golf Resort", location: "Diani", area: "Diani Beach" },
    // Safari Lodges 3-Star
    { name: "Sentrim Mara Camp", location: "Masai Mara", area: "Masai Mara" },
    { name: "Mara Leisure Camp", location: "Masai Mara", area: "Masai Mara" },
    { name: "Fig Tree Camp", location: "Masai Mara", area: "Masai Mara" },
    { name: "Crocodile Camp", location: "Masai Mara", area: "Masai Mara" },
    { name: "Sentrim Amboseli", location: "Amboseli", area: "Amboseli" },
    { name: "AA Lodge Amboseli", location: "Amboseli", area: "Amboseli" },
    { name: "Sentrim Elementaita Lodge", location: "Elementaita", area: "Lake Elementaita" },
    { name: "Lake Nakuru Lodge", location: "Nakuru", area: "Lake Nakuru" },
    { name: "Flamingo Hill Tented Camp", location: "Nakuru", area: "Lake Nakuru" },
    { name: "Naivasha Kongoni Lodge", location: "Naivasha", area: "Lake Naivasha" },
    { name: "Enashipai Resort & Spa", location: "Naivasha", area: "Lake Naivasha" },
    { name: "Crayfish Camp", location: "Naivasha", area: "Lake Naivasha" },
    // Other 3-Star
    { name: "Kisumu Hotel", location: "Kisumu", area: "CBD" },
    { name: "Imperial Hotel Kisumu", location: "Kisumu", area: "CBD" },
    { name: "Bontana Hotel", location: "Eldoret", area: "CBD" },
    { name: "Stag's Head Hotel", location: "Nakuru", area: "CBD" },
    { name: "Merica Hotel", location: "Nakuru", area: "CBD" },
    { name: "Sportsman's Arms Hotel", location: "Nanyuki", area: "CBD" },
    { name: "Mount Kenya Safari Club", location: "Nanyuki", area: "Mount Kenya" },
    { name: "Serena Mountain Lodge", location: "Mount Kenya", area: "Mount Kenya" },
    { name: "Treetops Lodge", location: "Aberdares", area: "Aberdare National Park" },
    { name: "The Ark Lodge", location: "Aberdares", area: "Aberdare National Park" },
  ],
};

export default function TransfersPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<TransferBooking | null>(null);
  const [useCustomPickup, setUseCustomPickup] = useState(false);
  const [useCustomDropoff, setUseCustomDropoff] = useState(false);

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
        id: crypto.randomUUID(),
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
                  {/* Pickup Location */}
                  <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        Pickup Location
                      </h4>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={!useCustomPickup ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setUseCustomPickup(false);
                            form.setValue("pickupLocation", "");
                          }}
                          className="h-8 text-xs"
                        >
                          <List className="h-3 w-3 mr-1" />
                          Select from List
                        </Button>
                        <Button
                          type="button"
                          variant={useCustomPickup ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setUseCustomPickup(true);
                            form.setValue("pickupLocation", "");
                          }}
                          className="h-8 text-xs"
                        >
                          <PenLine className="h-3 w-3 mr-1" />
                          Custom Location
                        </Button>
                      </div>
                    </div>
                    
                    <FormField control={form.control} name="pickupLocation" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{useCustomPickup ? "Enter Pickup Address" : "Select Pickup Point"}</FormLabel>
                        {useCustomPickup ? (
                          <FormControl>
                            <Input 
                              placeholder="Enter full address, e.g., 123 Moi Avenue, Nairobi" 
                              className="bg-white dark:bg-gray-800"
                              {...field} 
                            />
                          </FormControl>
                        ) : (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-gray-800">
                                <SelectValue placeholder="Select airport or hotel..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[400px]">
                              {/* Airports */}
                              <SelectGroup>
                                <SelectLabel className="flex items-center gap-2 text-blue-600">
                                  <Plane className="h-4 w-4" />
                                  International Airports
                                </SelectLabel>
                                {kenyaAirports.filter(a => a.type === "International").map((airport) => (
                                  <SelectItem key={airport.code} value={`${airport.name} (${airport.code})`}>
                                    {airport.name} ({airport.code}) - {airport.city}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel className="flex items-center gap-2 text-blue-600">
                                  <Plane className="h-4 w-4" />
                                  Regional Airports
                                </SelectLabel>
                                {kenyaAirports.filter(a => a.type === "Regional").map((airport) => (
                                  <SelectItem key={airport.code} value={`${airport.name} (${airport.code})`}>
                                    {airport.name} ({airport.code}) - {airport.city}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel className="flex items-center gap-2 text-blue-600">
                                  <Plane className="h-4 w-4" />
                                  Domestic Airports
                                </SelectLabel>
                                {kenyaAirports.filter(a => a.type === "Domestic").map((airport) => (
                                  <SelectItem key={airport.code} value={`${airport.name} (${airport.code})`}>
                                    {airport.name} ({airport.code}) - {airport.city}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel className="flex items-center gap-2 text-blue-600">
                                  <Plane className="h-4 w-4" />
                                  Safari Airstrips
                                </SelectLabel>
                                {kenyaAirports.filter(a => a.type === "Airstrip").map((airport) => (
                                  <SelectItem key={airport.code} value={`${airport.name} (${airport.code})`}>
                                    {airport.name} ({airport.code}) - {airport.city}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              {/* Hotels */}
                              <SelectGroup>
                                <SelectLabel className="flex items-center gap-2 text-amber-600">
                                  <Building2 className="h-4 w-4" />
                                  5-Star Hotels & Lodges
                                </SelectLabel>
                                {kenyaHotels.fiveStar.map((hotel, idx) => (
                                  <SelectItem key={`5star-${idx}`} value={`${hotel.name}, ${hotel.area}`}>
                                    {hotel.name} - {hotel.location}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel className="flex items-center gap-2 text-purple-600">
                                  <Building2 className="h-4 w-4" />
                                  4-Star Hotels & Lodges
                                </SelectLabel>
                                {kenyaHotels.fourStar.map((hotel, idx) => (
                                  <SelectItem key={`4star-${idx}`} value={`${hotel.name}, ${hotel.area}`}>
                                    {hotel.name} - {hotel.location}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel className="flex items-center gap-2 text-teal-600">
                                  <Building2 className="h-4 w-4" />
                                  3-Star Hotels & Lodges
                                </SelectLabel>
                                {kenyaHotels.threeStar.map((hotel, idx) => (
                                  <SelectItem key={`3star-${idx}`} value={`${hotel.name}, ${hotel.area}`}>
                                    {hotel.name} - {hotel.location}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                        <FormDescription className="text-xs text-blue-600">
                          {useCustomPickup 
                            ? "Enter your exact pickup address including street, building name, and city" 
                            : "Select from our list of airports and hotels, or switch to custom location"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Dropoff Location */}
                  <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        Drop-off Location
                      </h4>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={!useCustomDropoff ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setUseCustomDropoff(false);
                            form.setValue("dropoffLocation", "");
                          }}
                          className="h-8 text-xs"
                        >
                          <List className="h-3 w-3 mr-1" />
                          Select from List
                        </Button>
                        <Button
                          type="button"
                          variant={useCustomDropoff ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setUseCustomDropoff(true);
                            form.setValue("dropoffLocation", "");
                          }}
                          className="h-8 text-xs"
                        >
                          <PenLine className="h-3 w-3 mr-1" />
                          Custom Location
                        </Button>
                      </div>
                    </div>

                    <FormField control={form.control} name="dropoffLocation" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{useCustomDropoff ? "Enter Drop-off Address" : "Select Drop-off Point"}</FormLabel>
                        {useCustomDropoff ? (
                          <FormControl>
                            <Input 
                              placeholder="Enter full address, e.g., 456 Kenyatta Avenue, Nairobi" 
                              className="bg-white dark:bg-gray-800"
                              {...field} 
                            />
                          </FormControl>
                        ) : (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-gray-800">
                                <SelectValue placeholder="Select airport or hotel..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[400px]">
                              {/* Airports */}
                              <SelectGroup>
                                <SelectLabel className="flex items-center gap-2 text-blue-600">
                                  <Plane className="h-4 w-4" />
                                  International Airports
                                </SelectLabel>
                                {kenyaAirports.filter(a => a.type === "International").map((airport) => (
                                  <SelectItem key={airport.code} value={`${airport.name} (${airport.code})`}>
                                    {airport.name} ({airport.code}) - {airport.city}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel className="flex items-center gap-2 text-blue-600">
                                  <Plane className="h-4 w-4" />
                                  Regional Airports
                                </SelectLabel>
                                {kenyaAirports.filter(a => a.type === "Regional").map((airport) => (
                                  <SelectItem key={airport.code} value={`${airport.name} (${airport.code})`}>
                                    {airport.name} ({airport.code}) - {airport.city}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel className="flex items-center gap-2 text-blue-600">
                                  <Plane className="h-4 w-4" />
                                  Domestic Airports
                                </SelectLabel>
                                {kenyaAirports.filter(a => a.type === "Domestic").map((airport) => (
                                  <SelectItem key={airport.code} value={`${airport.name} (${airport.code})`}>
                                    {airport.name} ({airport.code}) - {airport.city}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel className="flex items-center gap-2 text-blue-600">
                                  <Plane className="h-4 w-4" />
                                  Safari Airstrips
                                </SelectLabel>
                                {kenyaAirports.filter(a => a.type === "Airstrip").map((airport) => (
                                  <SelectItem key={airport.code} value={`${airport.name} (${airport.code})`}>
                                    {airport.name} ({airport.code}) - {airport.city}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              {/* Hotels */}
                              <SelectGroup>
                                <SelectLabel className="flex items-center gap-2 text-amber-600">
                                  <Building2 className="h-4 w-4" />
                                  5-Star Hotels & Lodges
                                </SelectLabel>
                                {kenyaHotels.fiveStar.map((hotel, idx) => (
                                  <SelectItem key={`5star-drop-${idx}`} value={`${hotel.name}, ${hotel.area}`}>
                                    {hotel.name} - {hotel.location}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel className="flex items-center gap-2 text-purple-600">
                                  <Building2 className="h-4 w-4" />
                                  4-Star Hotels & Lodges
                                </SelectLabel>
                                {kenyaHotels.fourStar.map((hotel, idx) => (
                                  <SelectItem key={`4star-drop-${idx}`} value={`${hotel.name}, ${hotel.area}`}>
                                    {hotel.name} - {hotel.location}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel className="flex items-center gap-2 text-teal-600">
                                  <Building2 className="h-4 w-4" />
                                  3-Star Hotels & Lodges
                                </SelectLabel>
                                {kenyaHotels.threeStar.map((hotel, idx) => (
                                  <SelectItem key={`3star-drop-${idx}`} value={`${hotel.name}, ${hotel.area}`}>
                                    {hotel.name} - {hotel.location}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                        <FormDescription className="text-xs text-green-600">
                          {useCustomDropoff 
                            ? "Enter your exact drop-off address including street, building name, and city" 
                            : "Select from our list of airports and hotels, or switch to custom location"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-3">
                    <FormField control={form.control} name="pickupDate" render={({ field }) => (
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
                    )} />
                    <FormField control={form.control} name="pickupTime" render={({ field }) => (
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
