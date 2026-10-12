"use client";
import type { Client } from "@/types";


import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil, Car, Building2, TrendingUp, DollarSign, ArrowRight, Eye, Trash2, Bell, AlertTriangle, Clock, CreditCard, CalendarClock, CheckCircle2, XCircle, BarChart3, Calendar, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// ── Vehicle makes / models ──────────────────────────────────────────
const VEHICLE_CATALOG: Record<string, string[]> = {
  Toyota: [
    "Land Cruiser Prado TX", "Land Cruiser Prado TZ", "Land Cruiser Prado VX",
    "Land Cruiser 70 Series", "Land Cruiser 76", "Land Cruiser 79 Double Cab",
    "Land Cruiser 100 GX", "Land Cruiser 200 GX", "Land Cruiser 200 VX",
    "Land Cruiser 300 GR Sport", "Land Cruiser V8 4.5",
    "Fortuner 2.4 GD6", "Fortuner 2.7 VVTi", "Fortuner 2.8 GD6 4x4", "Fortuner Legender",
    "Hilux Single Cab 2.4", "Hilux Extra Cab 2.4", "Hilux Double Cab 2.4", "Hilux Double Cab 2.8 4x4",
    "Hilux Revo Double Cab", "Hilux Champ",
    "Hiace 9-Seater", "Hiace 14-Seater", "Hiace High Roof Van", "Hiace Grand Cabin 10-Seater",
    "Coaster 28-Seater", "Coaster 33-Seater",
    "Alphard 3.5 Executive", "Vellfire 2.5", "Noah 8-Seater", "Voxy 8-Seater",
    "Prius 1.8 Hybrid", "Prius V", "Camry 2.0", "Camry 2.5", "Camry 3.5 V6",
    "Corolla 1.6", "Corolla 2.0", "Fielder 1.5", "Axio 1.5", "Premio 1.8", "Allion 1.8",
    "RAV4 2.0", "RAV4 2.5 4x4", "Kluger 3.5", "Vanguard 2.4",
    "Rush 1.5", "C-HR 1.2T", "Yaris Cross 1.5 Hybrid", "Harrier 2.0",
    "Quantum 10-Seater", "Quantum 14-Seater",
    "Probox 1.3", "Succeed 1.5",
  ],
  Nissan: [
    "X-Trail 2.0 2WD", "X-Trail 2.0 4WD", "X-Trail 2.5 4WD",
    "Patrol Y61 3.0 TD", "Patrol Y61 4.2 TD", "Patrol Y62 5.6 V8",
    "Navara Single Cab 2.5 dCi", "Navara Double Cab 2.5 dCi", "Navara King Cab 2.5",
    "Navara NP300 Double Cab", "Navara Frontier",
    "Urvan 13-Seater", "Urvan 15-Seater", "Urvan Cargo Van",
    "NV350 Caravan 9-Seater", "NV350 Caravan 12-Seater",
    "Hardbody 2.4 4x2", "Hardbody 3.0 4x4", "Hardbody D22",
    "Pathfinder 2.5 dCi", "Murano 3.5", "Juke 1.6", "Qashqai 2.0",
    "Tiida 1.6", "Sylphy 1.6", "Note 1.2", "Wingroad 1.5",
    "Serena 2.0 8-Seater",
  ],
  Mitsubishi: [
    "Pajero 3.2 DID SFX Short", "Pajero 3.2 DID SFX Long", "Pajero 3.8 GLS V6",
    "Pajero Sport 2.5 TD", "Pajero Sport 3.0 V6",
    "L200 Single Cab 2.5 TD", "L200 Double Cab 2.5 TD", "L200 Club Cab 2.5",
    "L200 Triton Double Cab", "L200 Strada",
    "Outlander 2.0 MIVEC", "Outlander 2.4 4WD", "Eclipse Cross 1.5T",
    "ASX 2.0", "Galant Fortis",
    "Canter FE71 2T", "Canter FE84 3.5T", "Canter FE85 4T", "Canter Wide Cab",
    "Rosa 28-Seater", "Rosa 33-Seater",
    "Delica D5 8-Seater", "Grandis 7-Seater",
  ],
  Isuzu: [
    "D-Max Single Cab 2.5 TD", "D-Max Space Cab 2.5", "D-Max Double Cab 2.5 TD",
    "D-Max Double Cab 3.0 TD 4x4", "D-Max LS 4x4", "D-Max V-Cross",
    "MUX 4x2 7-Seater", "MUX 4x4 7-Seater", "MUX 3.0 LS 4WD",
    "NPS 75 4x4 Short", "NPS 75L 4x4 Long",
    "NQR 75 Minibus 33-Seater", "NQR 33-Seater Custom",
    "FRR 90 Minibus", "FRR 33-Seater", "FRR 37-Seater",
    "FVR 34 4x2", "FVZ 34 6x4",
    "ELF NPR 250", "ELF NQR 330", "ELF NRR 275",
    "Trooper 3.1 TD", "Rodeo 2.6",
  ],
  "Mercedes-Benz": [
    "Sprinter 315 CDI 8-Seater", "Sprinter 319 CDI 15-Seater", "Sprinter 519 CDI 18-Seater",
    "Sprinter Cargo Van", "Sprinter 4x4",
    "Vito 111 CDI 9-Seater", "Vito 116 CDI", "Vito Tourer Long",
    "V-Class 220d 8-Seater", "V-Class 250d Marco Polo",
    "GLC 200", "GLC 250 4MATIC", "GLC 300 4MATIC", "GLC 63 AMG",
    "GLE 350d", "GLE 400d 4MATIC", "GLE 63 AMG",
    "GLS 350d", "GLS 400d", "GLS 500 4MATIC",
    "GL 350 CDI", "ML 350",
    "C 180", "C 200", "C 220d", "C 300", "C 43 AMG",
    "E 200", "E 220d", "E 350d", "E 400", "E 63 AMG",
    "S 350d", "S 400d", "S 500", "S 63 AMG",
    "Actros 2645 LS 6x4", "Actros 3348 S 6x4", "Actros 4148 8x4",
    "Atego 1525 L 4x2", "Atego 1828 L 4x2",
    "Axor 2540 S 6x4", "Unimog U530",
  ],
  "Land Rover": [
    "Defender 90 2.2 TD4", "Defender 90 2.4 TDCi", "Defender 90 V8",
    "Defender 110 Station Wagon 5-Seater", "Defender 110 Station Wagon 9-Seater",
    "Defender 110 Pick Up", "Defender 130",
    "Discovery 3 2.7 TDV6", "Discovery 3 4.0 V6",
    "Discovery 4 3.0 TDV6", "Discovery 4 5.0 V8",
    "Discovery 5 3.0 Si6", "Discovery 5 3.0 Td6",
    "Discovery Sport 2.0 TD4",
    "Range Rover Sport 3.0 SDV6", "Range Rover Sport 4.4 SDV8", "Range Rover Sport SVR",
    "Range Rover Vogue 3.0 SDV6", "Range Rover Vogue 4.4 SDV8",
    "Range Rover Long Wheelbase", "Range Rover Autobiography",
    "Range Rover Evoque 2.0 TD4", "Range Rover Velar 2.0d",
    "Freelander 2 2.2 TD4",
  ],
  Volkswagen: [
    "Transporter T5 2.0 TDI 9-Seater", "Transporter T6 2.0 TDI 9-Seater",
    "Caravelle T6 9-Seater", "Caravelle T6 Comfortline",
    "Amarok Single Cab 2.0 BiTDI", "Amarok Double Cab 2.0 BiTDI",
    "Amarok Double Cab 3.0 TDI V6", "Amarok Aventura",
    "Tiguan 1.4 TSI", "Tiguan 2.0 TSI 4MOTION", "Tiguan R-Line",
    "Touareg 3.0 TDI", "Touareg 4.0 V8 TDI", "Touareg R",
    "Touran 7-Seater 1.4 TSI",
    "Polo 1.0 TSI", "Polo 1.6 TDI", "Golf 1.4 TSI", "Golf GTI",
    "Passat 2.0 TDI", "Phaeton 3.0 TDI",
    "Crafter 35 Minibus 17-Seater",
  ],
  Ford: [
    "Ranger XL Single Cab 2.2 TDCI", "Ranger XLT Double Cab 2.2", "Ranger XLT Double Cab 3.2",
    "Ranger Wildtrak 2.0 Bi-Turbo", "Ranger Raptor 2.0 Bi-Turbo",
    "Ranger Wildtrak 3.2 TDCI 4x4",
    "Everest 2.0 4WD", "Everest 3.2 TDCI 4WD", "Everest Titanium",
    "Explorer 3.5 V6", "Explorer Platinum",
    "Transit Connect 1.5 TDCI", "Transit Custom 2.0 TDCI 9-Seater",
    "Transit 350 2.2 TDCI 17-Seater", "Transit Tourneo",
    "F-150 3.5 EcoBoost", "Maverick 2.5 Hybrid",
  ],
  Jeep: [
    "Wrangler 2-Door 3.6 Rubicon", "Wrangler 4-Door Unlimited 3.6",
    "Wrangler 4xe Plug-in Hybrid",
    "Grand Cherokee 3.0 CRD", "Grand Cherokee 5.7 Hemi", "Grand Cherokee L 7-Seater",
    "Grand Cherokee Summit Reserve",
    "Commander 3.0 CRD 7-Seater",
    "Cherokee 2.0 Trailhawk", "Renegade 1.3T",
    "Gladiator 3.0 V6 Pickup",
  ],
  BMW: [
    "X1 18d sDrive", "X1 20d xDrive",
    "X3 20d xDrive", "X3 30d xDrive", "X3 M40d",
    "X5 30d xDrive", "X5 40d xDrive", "X5 M50d", "X5 M Competition",
    "X6 30d xDrive", "X6 40d xDrive", "X6 M",
    "X7 30d xDrive 7-Seater", "X7 40d xDrive", "X7 M60i",
    "3 Series 318i", "3 Series 320d", "3 Series 330d", "M3",
    "5 Series 520d", "5 Series 530d", "5 Series 540i", "M5",
    "7 Series 730d", "7 Series 740Le Hybrid", "7 Series 750i", "M7",
  ],
  Audi: [
    "Q3 35 TDI", "Q3 Sportback",
    "Q5 40 TDI", "Q5 50 TDI", "Q5 Sportback",
    "Q7 45 TDI 7-Seater", "Q7 55 TFSI", "Q8 55 TFSI",
    "A3 35 TFSI", "A4 35 TDI", "A4 40 TDI", "A4 Avant",
    "A6 40 TDI", "A6 50 TDI", "A6 Allroad",
    "A8 50 TDI", "A8 60 TFSI", "e-tron 55 quattro",
  ],
  Hyundai: [
    "H1 2.5 CRDi 9-Seater Wagon", "H1 2.5 VGT 12-Seater",
    "Staria 3.5 MPi 11-Seater",
    "County 4.0 D 26-Seater", "County 5.1 D 33-Seater",
    "Universe Luxury 45-Seater", "Universe Space 56-Seater",
    "Tucson 2.0 CRDi", "Tucson 1.6 T-GDI 4WD",
    "Santa Fe 2.2 CRDi 7-Seater", "Santa Fe 3.5 MPI 4WD",
    "Palisade 3.8 GDI 8-Seater", "Creta 1.6 CRDi",
    "Sonata 2.0 MPI", "Elantra 1.6", "i10 1.0", "i20 1.2",
  ],
  Kia: [
    "Carnival 2.2 CRDi 8-Seater", "Carnival 3.5 MPi 11-Seater",
    "Sportage 2.0 CRDi 4WD", "Sportage 2.4 GDI 4WD",
    "Sorento 2.2 CRDi 7-Seater", "Sorento 2.4 GDI 7-Seater",
    "Sorento 3.5 MPI 7-Seater", "Palisade 3.8 V6 8-Seater",
    "K2700 Single Cab", "K2700 Double Cab",
    "K3000S Single Cab", "Bongo 3 Double Cab",
    "Picanto 1.2", "Rio 1.4 CRDi", "Cerato 1.6", "Seltos 1.4T",
  ],
  Scania: [
    "R 410 LA4x2HNA", "R 450 LA4x2HNA", "R 450 LA6x4MSA", "R 500 LA6x4",
    "R 560 LA6x4", "R 730 V8 LA6x4",
    "P 360 CB4x2", "P 410 CB6x2", "P 410 CB6x4",
    "G 410 LA6x4", "G 450 LA6x4",
    "S 500 LA4x2", "S 730 V8",
    "Touring HD Bus 49-Seater", "Touring HD Bus 55-Seater",
    "Interlink LD Bus 60-Seater", "Interlink HD Bus 65-Seater",
    "Higer Bus K360 33-Seater", "Higer Bus A30 49-Seater",
  ],
  Volvo: [
    "FH 420 4x2 Globe XL", "FH 460 6x2", "FH 460 6x4", "FH 500 6x4", "FH 540 6x4",
    "FH 600 6x4", "FH16 750 6x4",
    "FM 370 4x2", "FM 430 6x2", "FM 430 6x4", "FM 460 6x4",
    "FE 280 4x2", "FL 210 4x2", "FL 240 4x2",
    "9700 HD Bus 49-Seater", "9900 H Bus 49-Seater",
    "B8R 12m Bus 56-Seater", "B11R 13.7m Bus 60-Seater",
    "B9TL Double Decker",
  ],
  Subaru: [
    "Outback 2.5i CVT", "Outback 3.6R AWD", "Outback XT Turbo",
    "Forester 2.0i AWD", "Forester 2.5i Premium", "Forester 2.5XT Turbo",
    "XV 2.0i AWD", "XV e-Boxer Hybrid",
    "Tribeca 3.6 7-Seater",
    "Impreza 2.0i", "Legacy 2.5i", "Levorg 1.6GT",
  ],
  Mazda: [
    "BT-50 Single Cab 2.2 FreeStyle", "BT-50 Double Cab 2.2 4x2",
    "BT-50 Double Cab 3.2 4x4", "BT-50 Pro 4x4",
    "CX-5 2.0 SkyActiv", "CX-5 2.5 AWD", "CX-5 2.2 D AWD",
    "CX-9 2.5T AWD 7-Seater", "CX-8 2.5T 6-Seater",
    "CX-3 2.0", "CX-30 2.0 Hybrid",
    "Mazda 3 2.0 SkyActiv", "Mazda 6 2.5 SkyActiv",
    "Demio 1.3", "Axela 2.0", "Atenza 2.5",
  ],
  Honda: [
    "CR-V 1.5 Turbo AWD", "CR-V 2.0 Hybrid AWD", "CR-V 2.4 4WD",
    "HR-V 1.5 4WD", "Vezel 1.5 Hybrid",
    "Pilot 3.5 AWD 8-Seater", "Passport 3.5 AWD",
    "Accord 1.5T", "Accord 2.0T Sport", "Accord 3.5 V6",
    "Civic 1.5T Hatchback", "Civic 1.5T Sedan",
    "Jazz 1.5 Hybrid", "Fit 1.3", "Odyssey 2.4 7-Seater",
    "Stepwagon 1.5T 8-Seater", "Freed 1.5 6-Seater",
  ],
  "King Long": [
    "King Long 6700 25-Seater", "King Long 6800 29-Seater",
    "King Long 6900 33-Seater", "King Long 6920 37-Seater",
    "King Long 6128 49-Seater", "King Long 6129 55-Seater",
    "King Long 6148 56-Seater", "King Long 6152 65-Seater",
    "King Long 6181 68-Seater",
  ],
  Hino: [
    "300 Series 816 2T", "300 Series 921 3T",
    "500 Series 1527 4x2", "500 Series 1827 4x2", "500 Series 2827 6x4",
    "700 Series 2827 6x4", "700 Series 3028 6x4",
    "Liesse II 28-Seater", "Rainbow 33-Seater",
  ],
  Fuso: [
    "Canter FE71 2T", "Canter FE84 3.5T", "Canter FE85 4T",
    "Canter Wide Cab FE160", "Canter 4x4 FG84",
    "Fighter FK 617 6T 4x2", "Fighter FK 617 6T 4x4",
    "Super Great V FV54JJ 6x4", "Rosa 28-Seater", "Rosa 33-Seater",
  ],
  MAN: [
    "TGX 18.500 4x2 BLS", "TGX 26.500 6x4 BLS", "TGX 33.500 6x4",
    "TGS 26.400 6x4 BB", "TGS 33.400 8x4 BB", "TGS 40.400 8x4",
    "TGM 18.290 4x2", "TGM 26.290 6x4",
    "TGL 12.180 4x2", "TGL 10.180 4x2",
    "Lions Coach R07 49-Seater", "Lions Coach R08 55-Seater",
    "Lions Intercity 60-Seater",
  ],
  Peugeot: [
    "3008 1.6 PureTech", "3008 2.0 BlueHDi",
    "5008 1.6 THP 7-Seater", "5008 2.0 BlueHDi 7-Seater",
    "2008 1.2 PureTech", "508 2.0 BlueHDi",
    "Partner Tepee 1.6 BlueHDi", "Expert 2.0 BlueHDi 9-Seater",
    "Boxer 2.2 HDi Minibus 17-Seater",
  ],
  Tata: [
    "Xenon XT Double Cab 2.2", "Safari Storme 2.2",
    "Ace Mini Truck 0.7T", "Super Ace 1.0T",
    "Ultra 407 3.5T", "Ultra 1014 5T", "LPT 1518 7.5T",
    "Prima 2528 6x4", "Starbus 31-Seater", "Starbus 45-Seater",
  ],
  Suzuki: [
    "Jimny 1.3 4x4", "Jimny 1.5 AllGrip",
    "Vitara 1.4 Boosterjet AWD", "Vitara 2.0 DDiS 4WD",
    "Swift 1.2 DualJet", "Swift Sport 1.4",
    "Alto 800 0.8", "Baleno 1.2",
    "Ignis 1.2 AllGrip", "S-Cross 1.4 Boosterjet", "Escudo 2.4",
  ],
  Other: [
    "Motorcycle 125cc", "Motorcycle 250cc", "Motorcycle 400cc", "Motorcycle 650cc",
    "Tuk Tuk / Bajaj RE", "Electric Tuk Tuk",
    "Pickup 1T", "Pickup 1.5T", "Pickup 2T",
    "Tipper Truck 5T", "Tipper Truck 10T", "Tipper Truck 20T",
    "Flatbed Truck 5T", "Flatbed Truck 10T",
    "Refrigerated Truck", "Box Body Truck",
    "Excavator 20T", "Excavator 30T",
    "Crane 30T", "Crane 50T", "Crane 80T", "Crane 100T",
    "Mobile Crane", "Tower Crane",
    "Forklift 2T", "Forklift 3T", "Forklift 5T",
    "Concrete Mixer 6m3", "Concrete Mixer 9m3",
    "Grader 140H", "Bulldozer D6", "Bulldozer D8",
    "Wheel Loader", "Backhoe Loader",
    "Generator 20KVA", "Generator 50KVA", "Generator 100KVA",
    "Boat 15ft", "Boat 25ft", "Speed Boat",
    "Custom / Unlisted",
  ],
};

const SERVICES = [
  "Car Rental", "Safari Tours", "Transfers", "Movers",
  "Corporate Rental", "Road Recovery", "Cargo Handling",
  "Shipment Imports", "Construction Equipment",
];

const AREAS = [
  // Nairobi
  "Nairobi CBD", "Westlands", "Karen", "Kilimani", "Langata", "Kiambu Road",
  "Thika Road", "Ngong Road", "Mombasa Road", "Eastern Bypass", "Southern Bypass",
  "Lavington", "Runda", "Muthaiga", "Gigiri", "Parklands", "Eastleigh",
  "South B", "South C", "Embakasi", "Utawala", "Ruiru", "Juja", "Thika Town",
  // Coast
  "Mombasa", "Diani Beach", "Malindi", "Watamu", "Kilifi", "Lamu", "Ukunda",
  "Nyali", "Bamburi", "Shanzu", "Voi",
  // Rift Valley
  "Nakuru", "Naivasha", "Narok", "Kericho", "Eldoret", "Kisumu",
  "Kakamega", "Bungoma", "Kitale", "Nanyuki", "Nyahururu", "Maralal",
  "Baringo", "Kabarnet",
  // Central
  "Nyeri", "Muranga", "Kirinyaga", "Embu", "Meru", "Chuka", "Nkubu",
  "Karatina", "Othaya",
  // Eastern
  "Machakos", "Kitui", "Makueni", "Wote", "Garissa", "Wajir", "Moyale",
  "Marsabit", "Isiolo", "Mwingi",
  // Western
  "Kisii", "Migori", "Homabay", "Siaya", "Vihiga", "Busia",
  // Safari / Game Parks
  "Masai Mara", "Amboseli", "Tsavo East", "Tsavo West", "Samburu",
  "Lake Nakuru", "Aberdare", "Mount Kenya", "Ol Pejeta", "Laikipia",
  "Meru National Park", "Shimba Hills", "Hell's Gate",
  // Tanzania
  "Arusha", "Dar es Salaam", "Serengeti", "Ngorongoro", "Zanzibar",
  "Moshi", "Kilimanjaro", "Nairobi-Arusha Route",
  // Uganda
  "Kampala", "Entebbe", "Jinja", "Mbarara", "Nairobi-Kampala Route",
  // Rwanda
  "Kigali", "Nairobi-Kigali Route",
  // Other
  "JKIA Airport", "Wilson Airport", "Mombasa Port", "Kisumu Airport",
  "Cross-border (specify)", "Custom / Other",
];

const EXPENSE_TYPES = ["Delivery Fee", "Fuel", "Carwash", "Driver Allowance", "Toll Fee", "Parking", "Repair / Damage", "Other"];

interface Expense {
  id: string;
  type: string;
  amount: number;
  note: string;
}

interface SubletVehicle {
  id: string;
  serviceType: string;
  supplierName: string;
  supplierPhone: string;
  supplierEmail: string;
  supplierType: "company" | "individual";
  make: string;
  model: string;
  registration: string;
  color: string;
  year: string;
  supplierDailyRate: number;
  ourDailyRate: number;
  status: "available" | "active" | "returned";
  createdAt: string;
}


interface SubletBooking {
  id: string;
  vehicleId: string;
  serviceType: string;
  areaOfUse: string;
  clientName: string;
  clientPhone: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  supplierDailyRate: number;
  ourDailyRate: number;
  totalSupplierCost: number;
  totalClientCharge: number;
  expenses: Expense[];
  totalExpenses: number;
  netProfit: number;
  profitPerDay: number;
  status: "active" | "completed" | "cancelled";
  paymentMethod: "mpesa" | "bank" | "cash" | "cheque";
  paymentReference: string;
  amountPaid: number;
  notes: string;
  createdAt: string;
  make?: string;
  model?: string;
  reg?: string;
}

const INITIAL_VEHICLES: SubletVehicle[] = [
  {
    id: "sv-001", serviceType: "Car Rental",
    supplierName: "Quickride Rentals Ltd", supplierPhone: "+254 722 100 200",
    supplierEmail: "fleet@quickride.co.ke", supplierType: "company",
    make: "Nissan", model: "X-Trail", registration: "KDD 123A", color: "Black", year: "2021",
    supplierDailyRate: 5000, ourDailyRate: 6500, status: "available", createdAt: "2024-03-01",
  },
  {
    id: "sv-002", serviceType: "Car Rental",
    supplierName: "James Mwangi", supplierPhone: "+254 733 300 400",
    supplierEmail: "", supplierType: "individual",
    make: "Toyota", model: "Prado", registration: "KCX 456B", color: "White", year: "2020",
    supplierDailyRate: 8000, ourDailyRate: 10000, status: "active", createdAt: "2024-03-05",
  },
];

const INITIAL_BOOKINGS: SubletBooking[] = [
  {
    id: "sb-001", vehicleId: "sv-002", serviceType: "Car Rental", areaOfUse: "Masai Mara",
    clientName: "Safari Group Kenya", clientPhone: "+254 700 111 222",
    startDate: "2024-03-10", endDate: "2024-03-14", numberOfDays: 4,
    supplierDailyRate: 8000, ourDailyRate: 10000,
    totalSupplierCost: 32000, totalClientCharge: 40000,
    expenses: [
      { id: "e1", type: "Fuel", amount: 3000, note: "Full tank" },
      { id: "e2", type: "Delivery Fee", amount: 1500, note: "Drop at Mara" },
    ],
    totalExpenses: 4500,
    netProfit: 3500,
    profitPerDay: 875,
    status: "active", paymentMethod: "bank", paymentReference: "EQB-TXN-00123",
    amountPaid: 40000, notes: "", createdAt: "2024-03-10",
  },
];

// Load any sublets registered from Fleet Management
function loadPendingSublets(): SubletVehicle[] {
  try {
    const pending = JSON.parse(sessionStorage.getItem("pendingSublets") || "[]");
    sessionStorage.removeItem("pendingSublets");
    return pending;
  } catch { return []; }
}

const emptyVForm = {
  serviceType: "Car Rental", supplierName: "", supplierPhone: "", supplierEmail: "",
  supplierType: "company" as "company" | "individual",
  make: "", model: "", registration: "", color: "", year: "",
  supplierDailyRate: "", ourDailyRate: "",
};

const emptyBForm = {
  serviceType: "Car Rental", areaOfUse: "", vehicleId: "",
  clientName: "", clientPhone: "",
  startDate: "", endDate: "", numberOfDays: "",
  paymentMethod: "mpesa" as "mpesa" | "bank" | "cash" | "cheque",
  paymentReference: "", amountPaid: "",
  ourDailyRateOverride: "",
  notes: "",
};

export default function SubletAssetsTab() {
  const [vehicles, setVehicles] = useState<SubletVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [editAsset, setEditAsset] = useState<SubletVehicle | null>(null);
  const [bookings, setBookings] = useState<SubletBooking[]>([]);

  const loadData = async () => {
    setLoading(true);
    setLoading(true);
    try {
      const [vRes, bRes] = await Promise.all([
        fetch("/api/sublet-vehicles"),
        fetch("/api/sublet-bookings"),
      ]);
      const [vData, bData] = await Promise.all([vRes.json(), bRes.json()]);
      if (Array.isArray(vData)) setVehicles(vData.map((v: Record<string,unknown>) => ({
        id: String(v.id || ""), serviceType: String(v.service_type || ""),
        supplierName: String(v.supplier_name || ""), supplierPhone: String(v.supplier_phone || ""),
        supplierType: String(v.supplier_type || "company") as "company" | "individual",
        make: String(v.make || ""), model: String(v.model || ""),
        registration: String(v.registration || ""), color: String(v.color || ""), year: String(v.year || ""),
        supplierDailyRate: Number(v.supplier_daily_rate || 0),
        ourDailyRate: Number(v.our_daily_rate || 0),
        status: String(v.status || "available") as "available" | "active" | "returned",
        supplierEmail: String(v.supplier_email || ""),
        createdAt: String(v.created_at || ""),
      })));
      if (Array.isArray(bData)) setBookings(bData.map((b: Record<string,unknown>) => ({
        id: String(b.id || ""), vehicleId: String(b.vehicle_id || ""),
        serviceType: String(b.service_type || ""), areaOfUse: String(b.area_of_use || ""),
        clientName: String(b.client_name || ""), clientPhone: String(b.client_phone || ""),
        startDate: String(b.start_date || ""), endDate: String(b.end_date || ""),
        numberOfDays: Number(b.number_of_days || 0),
        createdAt: String(b.created_at || ""),
        supplierDailyRate: Number(b.supplier_daily_rate || 0),
        ourDailyRate: Number(b.our_daily_rate || 0),
        totalSupplierCost: Number(b.total_supplier_cost || 0),
        totalClientCharge: Number(b.total_client_charge || 0),
        expenses: Array.isArray(b.expenses) ? b.expenses : [],
        totalExpenses: Number(b.total_expenses || 0),
        netProfit: Number(b.net_profit || 0),
        profitPerDay: Number(b.profit_per_day || 0),
        status: String(b.status || "active") as "active" | "completed" | "cancelled",
        paymentMethod: String(b.payment_method || "mpesa") as "mpesa" | "bank" | "cash" | "cheque",
        paymentReference: String(b.payment_reference || ""),
        amountPaid: Number(b.amount_paid || 0),
        notes: String(b.notes || ""),
        make: "", model: "", reg: "",
      })));
    } catch(e) { console.error("Load sublet data:", e); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const deleteVehicle = async (id: string) => {
    if (!confirm("Delete this vehicle? This cannot be undone.")) return;
    try {
      await fetch(`/api/sublet-vehicles?id=${id}`, { method: "DELETE" });
      toast.success("Vehicle deleted");
      loadData();
    } catch(e) { toast.error(String(e)); }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Delete this booking? This cannot be undone.")) return;
    try {
      await fetch(`/api/sublet-bookings?id=${id}`, { method: "DELETE" });
      toast.success("Booking deleted");
      loadData();
    } catch(e) { toast.error(String(e)); }
  };

  const deleteAll = async () => {
    setDeletingAll(true);
    try {
      await fetch("/api/sublet-bookings?all=true", { method: "DELETE" });
      await fetch("/api/sublet-vehicles?all=true", { method: "DELETE" });
      toast.success("All sublet data cleared");
      setShowDeleteAllConfirm(false);
      loadData();
    } catch(e) { toast.error(String(e)); } finally { setDeletingAll(false); }
  };

  const updateVehicle = async () => {
    if (!editVehicle) return;
    try {
      await fetch("/api/sublet-vehicles", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editVehicle.id, service_type: editVehicle.serviceType,
          supplier_name: editVehicle.supplierName, supplier_phone: editVehicle.supplierPhone,
          make: editVehicle.make, model: editVehicle.model, registration: editVehicle.registration,
          color: editVehicle.color, year: editVehicle.year,
          supplier_daily_rate: editVehicle.supplierDailyRate, our_daily_rate: editVehicle.ourDailyRate,
          status: editVehicle.status,
        }),
      });
      toast.success("Vehicle updated"); setEditVehicle(null); loadData();
    } catch(e) { toast.error(String(e)); }
  };

  const updateBooking = async () => {
    if (!editBooking) return;
    try {
      await fetch("/api/sublet-bookings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editBooking.id, client_name: editBooking.clientName,
          client_phone: editBooking.clientPhone, start_date: editBooking.startDate,
          end_date: editBooking.endDate, our_daily_rate: editBooking.ourDailyRate,
          amount_paid: editBooking.amountPaid, status: editBooking.status, notes: editBooking.notes,
        }),
      });
      toast.success("Booking updated"); setEditBooking(null); loadData();
    } catch(e) { toast.error(String(e)); }
  };
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [editVehicle, setEditVehicle] = useState<SubletVehicle | null>(null);
  const [editBooking, setEditBooking] = useState<SubletBooking | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [viewRecord, setViewRecord] = useState<SubletBooking | null>(null);
  const [vForm, setVForm] = useState(emptyVForm);
  const [bForm, setBForm] = useState(emptyBForm);
  const [expenses, setExpenses] = useState<Expense[]>([]);




  const [expenseType, setExpenseType] = useState("Fuel");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNote, setExpenseNote] = useState("");

  // URL params — pre-fill from client lookup
  const searchParams = useSearchParams();
  const urlClientId = searchParams.get("clientId");
  const urlClientName = searchParams.get("clientName");
  const urlClientPhone = searchParams.get("clientPhone");
  const urlService = searchParams.get("service");

  // Pre-fill from URL on mount
  useEffect(() => {
    if (urlClientId) {
      (async () => { try {
        const res = await fetch("/api/clients?q=" + encodeURIComponent(clientSearch));
        const all = await res.json();
        const found = (Array.isArray(all) ? all : []).find((c: Record<string,unknown>) => c.id === urlClientId);
        if (found) {
          setBForm(prev => ({ ...prev, clientName: found.fullName, clientPhone: found.phone, serviceType: urlService || prev.serviceType }));
          setClientSearch(found.fullName);
          setPrefilledClient(found);
        }
      } catch {} })();
    } else if (urlClientName) {
      setBForm(prev => ({ ...prev, clientName: decodeURIComponent(urlClientName), clientPhone: decodeURIComponent(urlClientPhone || ""), serviceType: urlService ? decodeURIComponent(urlService) : prev.serviceType }));
      setClientSearch(decodeURIComponent(urlClientName));
    }
  }, [urlClientId, urlClientName, urlClientPhone, urlService]);

  const [prefilledClient, setPrefilledClient] = useState<Client | null>(null);
  const [showRegForm, setShowRegForm] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    fullName: urlClientName ? decodeURIComponent(urlClientName) : "",
    phone: urlClientPhone ? decodeURIComponent(urlClientPhone) : "",
    idNumber: "", email: "", residence: "", placeOfWork: "",
    kraPin: "", drivingLicenseNumber: "",
  });

  const registerNewClient = () => {
    if (!newClientForm.fullName || !newClientForm.phone || !newClientForm.idNumber) {
      toast.error("Full name, phone and ID number are required"); return;
    }
    const newClient: Client = {
      id: "client-" + Date.now(),
      fullName: newClientForm.fullName,
      phone: newClientForm.phone,
      idNumber: newClientForm.idNumber,
      email: newClientForm.email,
      residence: newClientForm.residence,
      placeOfWork: newClientForm.placeOfWork,
      kraPin: newClientForm.kraPin,
      drivingLicenseNumber: newClientForm.drivingLicenseNumber,
      totalBookings: 0, totalSpent: 0, totalDebt: 0, riskLevel: "low",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString(),
    };
    fetch("/api/clients", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ full_name: newClient.fullName, phone: newClient.phone, email: newClient.email }),
    }).catch(e => console.error("Save client:", e));
    setBForm(prev => ({ ...prev, clientName: newClient.fullName, clientPhone: newClient.phone }));
    setClientSearch(newClient.fullName);
    setPrefilledClient(newClient);
    setShowRegForm(false);
    toast.success("Client registered and loaded into booking");
  };

  // Existing data for lookup
  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState<{id: string; fullName: string; phone: string; idNumber: string}[]>([]);
  const [showClientResults, setShowClientResults] = useState(false);
  const [regSearch, setRegSearch] = useState("");
  const [regResults, setRegResults] = useState<SubletVehicle[]>([]);
  const [showRegResults, setShowRegResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search existing clients
  const searchClients = async (q: string) => {
    setClientSearch(q);
    if (q.length < 2) { setClientResults([]); setShowClientResults(false); return; }
    try {
      const res = await fetch("/api/clients?q=" + encodeURIComponent(q));
      const all: Record<string, unknown>[] = await res.json();
      const matches = (Array.isArray(all) ? all : []).slice(0, 6);
      setClientResults(matches.map((c: Record<string, unknown>) => ({
        id: String(c.id || ""), fullName: String(c.full_name || c.fullName || ""),
        phone: String(c.phone || ""), idNumber: String(c.id_number || c.idNumber || ""),
      })));
      setShowClientResults(matches.length > 0);
    } catch { setClientResults([]); }
  };

  // Search vehicles by registration
  const searchByReg = (q: string) => {
    setRegSearch(q);
    if (q.length < 2) { setRegResults([]); setShowRegResults(false); return; }
    const matches = vehicles.filter(v =>
      v.registration.toLowerCase().includes(q.toLowerCase()) ||
      (v.make + " " + v.model).toLowerCase().includes(q.toLowerCase())
    ).slice(0, 6);
    setRegResults(matches);
    setShowRegResults(matches.length > 0);
  };

  const selectClient = (c: {id: string; fullName: string; phone: string; idNumber: string}) => {
    setBForm(prev => ({ ...prev, clientName: c.fullName, clientPhone: c.phone }));
    setClientSearch(c.fullName);
    setShowClientResults(false);
  };

  const selectVehicleByReg = (v: SubletVehicle) => {
    setBForm(prev => ({ ...prev, vehicleId: v.id }));
    setRegSearch(v.registration + " - " + v.make + " " + v.model);
    setShowRegResults(false);
  };

  const profitDay = (v: SubletVehicle) => v.ourDailyRate - v.supplierDailyRate;
  const marginPct = (v: SubletVehicle) => v.supplierDailyRate > 0 ? Math.round((profitDay(v) / v.supplierDailyRate) * 100) : 0;

  const totalRevenue = bookings.reduce((s, b) => s + b.totalClientCharge, 0);
  const totalCost = bookings.reduce((s, b) => s + b.totalSupplierCost, 0);
  const totalNetProfit = bookings.reduce((s, b) => s + b.netProfit, 0);
  const totalExpAll = bookings.reduce((s, b) => s + b.totalExpenses, 0);

  // ── ANALYTICS ────────────────────────────────────────
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"day" | "week" | "month" | "all">("month");

  const filterByPeriod = (b: SubletBooking) => {
    const now = new Date();
    const start = new Date(b.startDate);
    if (analyticsPeriod === "day") {
      return start.toDateString() === now.toDateString();
    }
    if (analyticsPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      return start >= weekAgo;
    }
    if (analyticsPeriod === "month") {
      return start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const periodBookings = bookings.filter(filterByPeriod);
  const periodRevenue  = periodBookings.reduce((s, b) => s + b.totalClientCharge, 0);
  const periodCost     = periodBookings.reduce((s, b) => s + b.totalSupplierCost, 0);
  const periodExpenses = periodBookings.reduce((s, b) => s + b.totalExpenses, 0);
  const periodProfit   = periodBookings.reduce((s, b) => s + b.netProfit, 0);
  const periodMargin   = periodRevenue > 0 ? Math.round((periodProfit / periodRevenue) * 100) : 0;
  const periodLabel    = analyticsPeriod === "day" ? "Today" : analyticsPeriod === "week" ? "This Week" : analyticsPeriod === "month" ? "This Month" : "All Time";

  // Group by service for period
  const byService: Record<string, { revenue: number; cost: number; profit: number; count: number }> = {};
  periodBookings.forEach(b => {
    if (!byService[b.serviceType]) byService[b.serviceType] = { revenue: 0, cost: 0, profit: 0, count: 0 };
    byService[b.serviceType].revenue += b.totalClientCharge;
    byService[b.serviceType].cost    += b.totalSupplierCost + b.totalExpenses;
    byService[b.serviceType].profit  += b.netProfit;
    byService[b.serviceType].count   += 1;
  });
  // ─────────────────────────────────────────────────────

  const selectedVehicle = vehicles.find(v => v.id === bForm.vehicleId);
  const bDays = parseInt(bForm.numberOfDays) || 0;
  const bEffectiveRate = bForm.ourDailyRateOverride ? parseFloat(bForm.ourDailyRateOverride) : (selectedVehicle?.ourDailyRate || 0);
  const bSupplierCost = selectedVehicle ? selectedVehicle.supplierDailyRate * bDays : 0;
  const bClientCharge = bEffectiveRate * bDays;
  const bTotalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const bNetProfit = bClientCharge - bSupplierCost - bTotalExpenses;
  const bProfitPerDay = bDays > 0 ? Math.round(bNetProfit / bDays) : 0;

  const addExpense = () => {
    if (!expenseAmount || parseFloat(expenseAmount) <= 0) { toast.error("Enter a valid amount"); return; }
    setExpenses([...expenses, { id: Date.now().toString(), type: expenseType, amount: parseFloat(expenseAmount), note: expenseNote }]);
    setExpenseAmount(""); setExpenseNote("");
    toast.success("Expense added");
  };

  const removeExpense = (id: string) => setExpenses(expenses.filter(e => e.id !== id));

  const handleStartDate = (val: string) => {
    const days = parseInt(bForm.numberOfDays) || 1;
    const end = new Date(new Date(val).getTime() + days * 86400000).toISOString().split("T")[0];
    setBForm(prev => ({ ...prev, startDate: val, endDate: end }));
  };

  const handleDays = (val: string) => {
    const days = parseInt(val) || 0;
    const end = bForm.startDate && days > 0
      ? new Date(new Date(bForm.startDate).getTime() + days * 86400000).toISOString().split("T")[0]
      : bForm.endDate;
    setBForm({ ...bForm, numberOfDays: val, endDate: end });
  };

  const addVehicle = () => {
    if (!vForm.supplierName || !vForm.make || !vForm.registration || !vForm.supplierDailyRate || !vForm.ourDailyRate) {
      toast.error("Fill all required fields"); return;
    }
    const v: SubletVehicle = {
      id: "sv-" + Date.now(), serviceType: vForm.serviceType,
      supplierName: vForm.supplierName, supplierPhone: vForm.supplierPhone,
      supplierEmail: vForm.supplierEmail, supplierType: vForm.supplierType,
      make: vForm.make, model: vForm.model, registration: vForm.registration.toUpperCase(),
      color: vForm.color, year: vForm.year,
      supplierDailyRate: parseFloat(vForm.supplierDailyRate),
      ourDailyRate: parseFloat(vForm.ourDailyRate),
      status: "available", createdAt: new Date().toISOString().split("T")[0],
    };
    // Save to Supabase
    fetch("/api/sublet-vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceType: v.serviceType, supplierName: v.supplierName,
        supplierPhone: v.supplierPhone, supplierType: v.supplierType,
        make: v.make, model: v.model, registration: v.registration,
        color: v.color, year: v.year ? parseInt(v.year) || null : null,
        supplierDailyRate: v.supplierDailyRate, ourDailyRate: v.ourDailyRate,
        status: "available",
      }),
    }).then(r => r.json()).then(saved => {
      if (saved.error) { toast.error("Save failed: " + saved.error); return; }
      toast.success("Sublet asset saved to database");
      loadData();
    }).catch(e => toast.error("Save failed: " + String(e)));
    setShowVehicleDialog(false);
    setVForm(emptyVForm);
  };

  const addBooking = async () => {
    if (!selectedVehicle) { toast.error("Select a vehicle"); return; }
    if (!bForm.clientName || !bForm.startDate || !bDays) { toast.error("Fill all required fields"); return; }

    const b = {
      vehicleId: selectedVehicle.id, serviceType: bForm.serviceType, areaOfUse: bForm.areaOfUse,
      clientName: bForm.clientName, clientPhone: bForm.clientPhone,
      startDate: bForm.startDate, endDate: bForm.endDate, numberOfDays: bDays,
      supplierDailyRate: selectedVehicle.supplierDailyRate, ourDailyRate: bEffectiveRate,
      totalSupplierCost: bSupplierCost, totalClientCharge: bClientCharge,
      expenses, totalExpenses: bTotalExpenses,
      netProfit: bNetProfit, profitPerDay: bProfitPerDay,
      status: "active",
      paymentMethod: bForm.paymentMethod, paymentReference: bForm.paymentReference,
      amountPaid: parseFloat(bForm.amountPaid) || 0, notes: bForm.notes,
    };

    try {
      // 1. Save booking (single call)
      const res = await fetch("/api/sublet-bookings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(b),
      });
      const saved = await res.json();
      if (saved.error) { toast.error("Booking save failed: " + saved.error); return; }

      // 2. Update vehicle status
      await fetch("/api/sublet-vehicles", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedVehicle.id, status: "active" }),
      });

      // 3. Sync profit to Accounts
      await fetch("/api/transactions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          {
            date: b.startDate, type: "income", category: "Sublet Revenue",
            description: "Sublet: " + b.clientName + " — " + selectedVehicle.make + " " + selectedVehicle.model + " (" + b.startDate + " → " + b.endDate + ")",
            amount: b.totalClientCharge, payment_method: b.paymentMethod || "cash",
            customer_name: b.clientName, status: "completed",
          },
          {
            date: b.startDate, type: "expense", category: "Sublet Supplier Cost",
            description: "Supplier: " + (selectedVehicle.supplierName || selectedVehicle.make + " " + selectedVehicle.model) + " — " + b.startDate + " → " + b.endDate,
            amount: b.totalSupplierCost, payment_method: "cash", status: "completed",
          },
          ...(b.totalExpenses > 0 ? [{
            date: b.startDate, type: "expense", category: "Sublet Expenses",
            description: "Expenses for " + b.clientName + " booking",
            amount: b.totalExpenses, payment_method: "cash", status: "completed",
          }] : []),
        ]),
      });

      toast.success("Booking saved — profit of KES " + bNetProfit.toLocaleString() + " recorded in Accounts");
      setShowBookingDialog(false);
      setBForm(emptyBForm);
      setExpenses([]);
      loadData();
    } catch(e) {
      toast.error("Save failed: " + String(e));
    }
  };


  const today = new Date();
  today.setHours(0,0,0,0);

  interface Notification {
    id: string;
    type: "overdue" | "due_today" | "due_soon" | "balance" | "return_today" | "return_soon" | "returned_late";
    title: string;
    message: string;
    severity: "critical" | "warning" | "info";
    bookingId: string;
    entityType: "sublet";
  }

  const notifications: Notification[] = [];

  bookings.forEach(b => {
    if (b.status === "cancelled" || b.status === "completed") return;
    const end = new Date(b.endDate);
    end.setHours(0,0,0,0);
    const diffDays = Math.ceil((end.getTime() - today.getTime()) / 86400000);
    const balance = b.totalClientCharge - b.amountPaid;

    // Return date notifications
    if (diffDays < 0) {
      notifications.push({ id: b.id + "-late", type: "returned_late", severity: "critical",
        title: "Overdue Return", bookingId: b.id, entityType: "sublet",
        message: b.clientName + " — " + (b.make || "") + " " + (b.model || "") + " was due back " + Math.abs(diffDays) + " day(s) ago (" + b.endDate + ")" });
    } else if (diffDays === 0) {
      notifications.push({ id: b.id + "-today", type: "return_today", severity: "critical",
        title: "Return Due Today", bookingId: b.id, entityType: "sublet",
        message: b.clientName + " — " + (b.make || "") + " " + (b.model || "") + " must be returned today" });
    } else if (diffDays <= 2) {
      notifications.push({ id: b.id + "-soon", type: "return_soon", severity: "warning",
        title: "Return Due Soon", bookingId: b.id, entityType: "sublet",
        message: b.clientName + " — " + (b.make || "") + " " + (b.model || "") + " due in " + diffDays + " day(s) on " + b.endDate });
    }

    // Payment balance notifications
    if (balance > 0) {
      if (diffDays < 0) {
        notifications.push({ id: b.id + "-bal-overdue", type: "overdue", severity: "critical",
          title: "Overdue Payment", bookingId: b.id, entityType: "sublet",
          message: b.clientName + " — KES " + balance.toLocaleString() + " outstanding (booking ended " + Math.abs(diffDays) + " day(s) ago)" });
      } else if (diffDays === 0) {
        notifications.push({ id: b.id + "-bal-today", type: "due_today", severity: "warning",
          title: "Payment Due Today", bookingId: b.id, entityType: "sublet",
          message: b.clientName + " — KES " + balance.toLocaleString() + " balance due today" });
      } else if (diffDays <= 3) {
        notifications.push({ id: b.id + "-bal-soon", type: "due_soon", severity: "info",
          title: "Payment Due Soon", bookingId: b.id, entityType: "sublet",
          message: b.clientName + " — KES " + balance.toLocaleString() + " due in " + diffDays + " day(s)" });
      }
    }
  });

  const criticalCount = notifications.filter(n => n.severity === "critical").length;
  const warningCount  = notifications.filter(n => n.severity === "warning").length;

  const severityStyles = {
    critical: { border: "border-red-500/40",    bg: "bg-red-500/10",    icon: "text-red-400",    badge: "bg-red-600 text-white"    },
    warning:  { border: "border-amber-500/40",  bg: "bg-amber-500/10",  icon: "text-amber-400",  badge: "bg-amber-500 text-white"  },
    info:     { border: "border-blue-500/40",   bg: "bg-blue-500/10",   icon: "text-blue-400",   badge: "bg-blue-600 text-white"   },
  };

  const typeIcons: Record<string, React.ElementType> = {
    overdue: AlertTriangle, due_today: CreditCard, due_soon: Clock,
    return_today: CalendarClock, return_soon: CalendarClock, returned_late: XCircle, balance: CreditCard,
  };
  // ─────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="h-7 w-7 text-cyan-400" />
Sublet Assets
          </h2>
          <p className="text-gray-400 mt-1 text-sm">Track assets subleted from other companies across all services — monitor cost, profit and expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 gap-2" onClick={() => { setBForm(emptyBForm); setExpenses([]); setShowBookingDialog(true); }}>
            <Plus className="h-4 w-4" />New Booking
          </Button>
          <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2" onClick={() => setShowDeleteAllConfirm(true)}>
            <Trash2 className="h-4 w-4" />Delete All
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700 gap-2" onClick={() => { setVForm(emptyVForm); setShowVehicleDialog(true); }}>
            <Plus className="h-4 w-4" />Add Asset
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Sublet Assets", value: vehicles.length, sub: vehicles.filter(v => v.status === "available").length + " available", icon: Car, border: "border-cyan-500/30", bg: "from-cyan-500/10 to-cyan-600/5", ic: "text-cyan-400" },
          { label: "Client Charges", value: "KES " + (totalRevenue / 1000).toFixed(0) + "K", sub: "total billed", icon: DollarSign, border: "border-emerald-500/30", bg: "from-emerald-500/10 to-emerald-600/5", ic: "text-emerald-400" },
          { label: "Total Expenses", value: "KES " + (totalExpAll / 1000).toFixed(0) + "K", sub: "fuel, delivery etc", icon: Building2, border: "border-red-500/30", bg: "from-red-500/10 to-red-600/5", ic: "text-red-400" },
          { label: "Net Profit", value: "KES " + (totalNetProfit / 1000).toFixed(0) + "K", sub: totalRevenue > 0 ? Math.round((totalNetProfit / totalRevenue) * 100) + "% margin" : "0% margin", icon: TrendingUp, border: "border-amber-500/30", bg: "from-amber-500/10 to-amber-600/5", ic: "text-amber-400" },
        ].map(({ label, value, sub, icon: Icon, border, bg, ic }) => (
          <Card key={label} className={"relative overflow-hidden " + border + " bg-gradient-to-br " + bg}>
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</CardTitle>
              <Icon className={"h-4 w-4 " + ic} />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl font-bold text-white">{value}</div>
              <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Panel */}
      <Card className="border-violet-500/30 bg-violet-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-400" />
              Profit & Loss — {periodLabel}
            </CardTitle>
            <div className="flex gap-1.5">
              {(["day","week","month","all"] as const).map(p => (
                <button key={p} type="button"
                  onClick={() => setAnalyticsPeriod(p)}
                  className={analyticsPeriod === p
                    ? "px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 text-white"
                    : "px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 bg-white/5 text-gray-400 hover:border-violet-500/40"}>
                  {p === "day" ? "Today" : p === "week" ? "Week" : p === "month" ? "Month" : "All Time"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Revenue", value: periodRevenue, color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
              { label: "Supplier Cost", value: periodCost, color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" },
              { label: "Expenses", value: periodExpenses, color: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/10" },
              { label: "Net Profit", value: periodProfit, color: periodProfit >= 0 ? "text-amber-400" : "text-red-400", border: periodProfit >= 0 ? "border-amber-500/30" : "border-red-500/30", bg: periodProfit >= 0 ? "bg-amber-500/10" : "bg-red-500/10" },
            ].map(({ label, value, color, border, bg }) => (
              <div key={label} className={"rounded-xl border p-3 " + border + " " + bg}>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                <p className={"text-lg font-bold " + color}>KES {value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Margin bar */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Profit Margin</span>
              <span className={"text-sm font-bold " + (periodMargin >= 20 ? "text-emerald-400" : periodMargin >= 10 ? "text-amber-400" : "text-red-400")}>{periodMargin}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10">
              <div className={"h-2.5 rounded-full transition-all " + (periodMargin >= 20 ? "bg-emerald-500" : periodMargin >= 10 ? "bg-amber-500" : "bg-red-500")}
                style={{ width: Math.min(periodMargin, 100) + "%" }} />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-gray-500">
              <span>{periodBookings.length} booking{periodBookings.length !== 1 ? "s" : ""}</span>
              <span>{periodMargin < 10 ? "Low margin — review pricing" : periodMargin < 20 ? "Fair margin" : "Good margin"}</span>
            </div>
          </div>

          {/* By service breakdown */}
          {Object.keys(byService).length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Breakdown by Service</p>
              <div className="space-y-2">
                {Object.entries(byService).sort((a, b) => b[1].profit - a[1].profit).map(([svc, d]) => {
                  const svcMargin = d.revenue > 0 ? Math.round((d.profit / d.revenue) * 100) : 0;
                  return (
                    <div key={svc} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white font-medium truncate">{svc}</span>
                          <span className="text-xs text-gray-500 ml-2">{d.count} booking{d.count !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex gap-4 text-xs">
                          <span className="text-emerald-400">Rev: KES {d.revenue.toLocaleString()}</span>
                          <span className="text-red-400">Cost: KES {d.cost.toLocaleString()}</span>
                          <span className={"font-bold " + (d.profit >= 0 ? "text-amber-400" : "text-red-400")}>P/L: KES {d.profit.toLocaleString()}</span>
                        </div>
                      </div>
                      <Badge className={"shrink-0 " + (svcMargin >= 20 ? "bg-emerald-600 text-white" : svcMargin >= 10 ? "bg-amber-500 text-white" : "bg-red-600 text-white")}>
                        {svcMargin}%
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {periodBookings.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">No bookings for {periodLabel.toLowerCase()}</p>
          )}
        </CardContent>
      </Card>

      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-400" />
                Alerts & Reminders
                {criticalCount > 0 && <Badge className="bg-red-600 text-white ml-1">{criticalCount} Critical</Badge>}
                {warningCount > 0 && <Badge className="bg-amber-500 text-white ml-1">{warningCount} Warning</Badge>}
              </CardTitle>
              <span className="text-xs text-gray-500">{notifications.length} active alert{notifications.length !== 1 ? "s" : ""}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications
                .sort((a, b) => (a.severity === "critical" ? -1 : b.severity === "critical" ? 1 : 0))
                .map(n => {
                  const s = severityStyles[n.severity];
                  const Icon = typeIcons[n.type] || Bell;
                  return (
                    <div key={n.id} className={"flex items-start gap-3 rounded-lg border p-3 " + s.border + " " + s.bg}>
                      <Icon className={"h-4 w-4 mt-0.5 shrink-0 " + s.icon} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge className={"text-xs px-1.5 py-0 " + s.badge}>{n.title}</Badge>
                        </div>
                        <p className="text-sm text-gray-200">{n.message}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {notifications.length === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-300 font-medium">All clear — no overdue returns or outstanding payments</p>
        </div>
      )}

      {/* Assets Table */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">Sublet Assets</CardTitle>
          <CardDescription className="text-gray-500 text-xs">Assets sourced from external suppliers</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-orange-400 font-bold">Service</TableHead>
                <TableHead className="text-orange-400 font-bold">Asset</TableHead>
                <TableHead className="text-orange-400 font-bold">Reg</TableHead>
                <TableHead className="text-orange-400 font-bold">Supplier</TableHead>
                <TableHead className="text-orange-400 font-bold">Their Rate</TableHead>
                <TableHead className="text-orange-400 font-bold">Our Rate</TableHead>
                <TableHead className="text-orange-400 font-bold">Profit/Day</TableHead>
                <TableHead className="text-orange-400 font-bold">Margin</TableHead>
                <TableHead className="text-orange-400 font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map(v => (
                <TableRow key={v.id}>
                  <TableCell><Badge className="bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs">{v.serviceType}</Badge></TableCell>
                  <TableCell className="text-white font-medium">{v.make} {v.model}<br /><span className="text-xs text-gray-400">{v.color}, {v.year}</span></TableCell>
                  <TableCell className="font-mono text-cyan-400">{v.registration}</TableCell>
                  <TableCell><p className="text-white text-sm">{v.supplierName}</p><p className="text-gray-400 text-xs">{v.supplierPhone}</p></TableCell>
                  <TableCell className="text-red-400 font-semibold">KES {v.supplierDailyRate.toLocaleString()}</TableCell>
                  <TableCell className="text-emerald-400 font-semibold">KES {v.ourDailyRate.toLocaleString()}</TableCell>
                  <TableCell className={profitDay(v) >= 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>KES {profitDay(v).toLocaleString()}</TableCell>
                  <TableCell><Badge className={marginPct(v) >= 20 ? "bg-emerald-600 text-white" : marginPct(v) >= 10 ? "bg-amber-500 text-white" : "bg-red-600 text-white"}>{marginPct(v)}%</Badge></TableCell>
                  <TableCell><Badge className={v.status === "available" ? "bg-orange-500 text-white" : v.status === "active" ? "bg-orange-600 text-white" : "bg-orange-900 text-orange-200"}>{v.status.charAt(0).toUpperCase() + v.status.slice(1)}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditVehicle({...v}); }} title="Edit">
                        <Pencil className="h-4 w-4 text-amber-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteVehicle(v.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
            </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">Sublet Bookings</CardTitle>
          <CardDescription className="text-gray-500 text-xs">All client bookings using subleted assets</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Supplier Cost</TableHead>
                <TableHead>Client Charge</TableHead>
                <TableHead>Expenses</TableHead>
                <TableHead>Net Profit</TableHead>
                <TableHead>Profit/Day</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 && (
                <TableRow><TableCell colSpan={14} className="text-center text-gray-500 py-8">No sublet bookings yet</TableCell></TableRow>
              )}
              {bookings.map(b => {
                const v = vehicles.find(x => x.id === b.vehicleId);
                return (
                  <TableRow key={b.id}>
                    <TableCell><Badge className="bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs">{b.serviceType}</Badge></TableCell>
                    <TableCell className="text-white font-medium text-sm">{v ? v.make + " " + v.model : "Unknown"}<br /><span className="text-xs font-mono text-cyan-400">{v?.registration}</span></TableCell>
                    <TableCell><p className="text-white text-sm">{b.clientName}</p><p className="text-gray-400 text-xs">{b.clientPhone}</p></TableCell>
                    <TableCell className="text-gray-300 text-sm">{b.areaOfUse || "-"}</TableCell>
                    <TableCell className="text-gray-300 text-xs">{b.startDate}<br />to {b.endDate}</TableCell>
                    <TableCell className="text-white font-semibold">{b.numberOfDays}</TableCell>
                    <TableCell className="text-red-400 font-semibold">KES {b.totalSupplierCost.toLocaleString()}</TableCell>
                    <TableCell className="text-emerald-400 font-semibold">KES {b.totalClientCharge.toLocaleString()}</TableCell>
                    <TableCell className="text-orange-400 font-semibold">KES {b.totalExpenses.toLocaleString()}<br /><span className="text-xs text-gray-500">{b.expenses.length} item{b.expenses.length !== 1 ? "s" : ""}</span></TableCell>
                    <TableCell className={b.netProfit >= 0 ? "text-amber-400 font-bold" : "text-red-400 font-bold"}>KES {b.netProfit.toLocaleString()}</TableCell>
                    <TableCell className="text-gray-300 text-sm">KES {b.profitPerDay.toLocaleString()}<span className="text-gray-500">/day</span></TableCell>
                    <TableCell><p className="text-white text-sm capitalize">{b.paymentMethod === "mpesa" ? "M-Pesa" : b.paymentMethod.charAt(0).toUpperCase() + b.paymentMethod.slice(1)}</p><p className="text-gray-400 text-xs font-mono">{b.paymentReference || "-"}</p></TableCell>
                    <TableCell><Badge className={b.status === "active" ? "bg-blue-600 text-white" : b.status === "completed" ? "bg-green-600 text-white" : "bg-gray-600 text-white"}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setViewRecord(b)} title="View">
                          <Eye className="h-4 w-4 text-gray-400" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditBooking({...b})} title="Edit">
                          <Pencil className="h-4 w-4 text-amber-400" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteBooking(b.id)} title="Delete">
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
            </div>
            </CardContent>
      </Card>

      {/* Add Asset Dialog */}
      <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 flex items-center gap-2"><Car className="h-5 w-5" />Add Sublet Asset</DialogTitle>
            <DialogDescription>Record an asset subleted from another company or individual</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">

            {/* Supplier */}
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-3">
              <h4 className="text-cyan-400 font-semibold text-xs uppercase tracking-wide">Supplier Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-200">Service Type *</Label>
                  <select className="w-full mt-1 rounded-lg bg-[#0a1628] border border-cyan-500/30 text-white p-2 text-sm"
                    value={vForm.serviceType} onChange={e => setVForm({ ...vForm, serviceType: e.target.value })}>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-200">Supplier Type</Label>
                  <div className="flex gap-2 mt-1">
                    {(["company", "individual"] as const).map(t => (
                      <button key={t} type="button" onClick={() => setVForm({ ...vForm, supplierType: t })}
                        className={vForm.supplierType === t ? "flex-1 py-2 rounded-lg border-2 border-cyan-500 bg-cyan-500/20 text-cyan-300 text-sm font-semibold" : "flex-1 py-2 rounded-lg border-2 border-white/10 bg-white/5 text-gray-400 text-sm"}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-200">{vForm.supplierType === "company" ? "Company Name" : "Full Name"} *</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder={vForm.supplierType === "company" ? "Quickride Rentals Ltd" : "John Kamau"} value={vForm.supplierName} onChange={e => setVForm({ ...vForm, supplierName: e.target.value })} />
                </div>
                <div>
                  <Label className="text-gray-200">Phone *</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="+254 7XX XXX XXX" value={vForm.supplierPhone} onChange={e => setVForm({ ...vForm, supplierPhone: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-200">Email</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="supplier@email.com" value={vForm.supplierEmail} onChange={e => setVForm({ ...vForm, supplierEmail: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Asset details */}
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
              <h4 className="text-blue-400 font-semibold text-xs uppercase tracking-wide">Asset / Vehicle Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-200">Make / Type *</Label>
                  <select className="w-full mt-1 rounded-lg bg-[#0a1628] border border-white/20 text-white p-2 text-sm"
                    value={vForm.make}
                    onChange={e => { setVForm({ ...vForm, make: e.target.value, model: "" }); }}>
                    <option value="">Select make...</option>
                    {Object.keys(VEHICLE_CATALOG).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-200">Model / Description *</Label>
                  <select className="w-full mt-1 rounded-lg bg-[#0a1628] border border-white/20 text-white p-2 text-sm"
                    value={vForm.model}
                    onChange={e => setVForm({ ...vForm, model: e.target.value })}>
                    <option value="">Select model...</option>
                    {(VEHICLE_CATALOG[vForm.make] || []).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-200">Registration *</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white font-mono uppercase" placeholder="KDD 123A" value={vForm.registration} onChange={e => setVForm({ ...vForm, registration: e.target.value.toUpperCase() })} />
                </div>
                <div>
                  <Label className="text-gray-200">Color</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="Black" value={vForm.color} onChange={e => setVForm({ ...vForm, color: e.target.value })} />
                </div>
                <div>
                  <Label className="text-gray-200">Year</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="2022" value={vForm.year} onChange={e => setVForm({ ...vForm, year: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Rates */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <h4 className="text-emerald-400 font-semibold text-xs uppercase tracking-wide">Daily Rates (KES)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-red-300">We pay supplier (per day) *</Label>
                  <Input type="number" className="mt-1 bg-[#0a1628] border-red-500/30 text-white" placeholder="5000" value={vForm.supplierDailyRate} onChange={e => setVForm({ ...vForm, supplierDailyRate: e.target.value })} />
                </div>
                <div>
                  <Label className="text-emerald-300">We charge client (per day) *</Label>
                  <Input type="number" className="mt-1 bg-[#0a1628] border-emerald-500/30 text-white" placeholder="6500" value={vForm.ourDailyRate} onChange={e => setVForm({ ...vForm, ourDailyRate: e.target.value })} />
                </div>
              </div>
              {vForm.supplierDailyRate && vForm.ourDailyRate && (
                <div className="rounded-lg bg-[#0a1628] border border-amber-500/30 p-3 flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Gross profit per day (before expenses):</span>
                  <span className={(parseFloat(vForm.ourDailyRate) > parseFloat(vForm.supplierDailyRate)) ? "text-emerald-400 font-bold text-lg" : "text-red-400 font-bold text-lg"}>
                    KES {(parseFloat(vForm.ourDailyRate) - parseFloat(vForm.supplierDailyRate)).toLocaleString()}
                    <span className="text-sm font-normal text-gray-400 ml-2">
                      ({Math.round(((parseFloat(vForm.ourDailyRate) - parseFloat(vForm.supplierDailyRate)) / parseFloat(vForm.supplierDailyRate)) * 100)}% margin)
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVehicleDialog(false)}>Cancel</Button>
            <Button onClick={addVehicle} className="bg-cyan-600 hover:bg-cyan-700"><Plus className="h-4 w-4 mr-2" />Add Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 flex items-center gap-2"><ArrowRight className="h-5 w-5" />New Sublet Booking</DialogTitle>
            <DialogDescription>Assign a subleted asset to a client — add expenses and track actual profit</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">

            {/* Service + Vehicle */}
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-3">
              <h4 className="text-cyan-400 font-semibold text-xs uppercase tracking-wide">Service & Asset</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-200">Service Type *</Label>
                  <select className="w-full mt-1 rounded-lg bg-[#0a1628] border border-violet-500/30 text-white p-2 text-sm"
                    value={bForm.serviceType} onChange={e => setBForm({ ...bForm, serviceType: e.target.value })}>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-200">Area of Use *</Label>
                  <select className="w-full mt-1 rounded-lg bg-[#0a1628] border border-white/20 text-white p-2 text-sm"
                    value={bForm.areaOfUse} onChange={e => setBForm({ ...bForm, areaOfUse: e.target.value })}>
                    <option value="">Select area...</option>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="col-span-2 relative">
                  <Label className="text-gray-200">Search Vehicle by Registration or Make/Model *</Label>
                  <Input
                    className="mt-1 bg-[#0a1628] border-cyan-500/30 text-white font-mono"
                    placeholder="e.g. KDD 123A or Toyota Prado..."
                    value={regSearch}
                    onChange={e => searchByReg(e.target.value)}
                    onFocus={() => regSearch.length >= 2 && setShowRegResults(true)}
                  />
                  {showRegResults && regResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 rounded-lg border border-cyan-500/30 bg-[#0a1628] shadow-xl overflow-hidden">
                      {regResults.map(v => (
                        <button key={v.id} type="button"
                          className="w-full text-left px-3 py-2.5 hover:bg-cyan-500/10 border-b border-white/5 last:border-0"
                          onClick={() => selectVehicleByReg(v)}>
                          <p className="text-white text-sm font-medium">{v.make} {v.model} <span className="font-mono text-cyan-400">{v.registration}</span> <span className="text-gray-400">({v.color})</span></p>
                          <p className="text-xs"><span className="text-red-400">Pay: KES {v.supplierDailyRate.toLocaleString()}/day</span> <span className="mx-1 text-gray-500">|</span> <span className="text-emerald-400">Charge: KES {v.ourDailyRate.toLocaleString()}/day</span> <span className="mx-1 text-gray-500">|</span> <Badge className={"text-xs px-1 " + (v.status === "available" ? "bg-green-600 text-white" : "bg-blue-600 text-white")}>{v.status}</Badge></p>
                        </button>
                      ))}
                    </div>
                  )}
                  {!regSearch && (
                    <div className="mt-2">
                      <Label className="text-gray-400 text-xs">Or pick from available list:</Label>
                      <select className="w-full mt-1 rounded-lg bg-[#0a1628] border border-white/20 text-white p-2 text-sm"
                        value={bForm.vehicleId} onChange={e => {
                          setBForm({ ...bForm, vehicleId: e.target.value });
                          const v = vehicles.find(x => x.id === e.target.value);
                          if (v) setRegSearch(v.registration + " - " + v.make + " " + v.model);
                        }}>
                        <option value="">Choose available asset...</option>
                        {vehicles.filter(v => v.status === "available").map(v => (
                          <option key={v.id} value={v.id}>{v.make} {v.model} - {v.registration} ({v.color}) - KES {v.ourDailyRate.toLocaleString()}/day</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              {selectedVehicle && (
                <div className="rounded-lg bg-[#0a1628] border border-cyan-500/20 p-3 text-sm">
                  <p className="text-cyan-400 font-semibold">{selectedVehicle.make} {selectedVehicle.model} - {selectedVehicle.registration}</p>
                  <p className="text-gray-400 mt-1">From: <span className="text-white">{selectedVehicle.supplierName}</span> ({selectedVehicle.supplierPhone})</p>
                  <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
                    <span className="text-red-400">Cost: KES {selectedVehicle.supplierDailyRate.toLocaleString()}/day</span>
                    <span className="text-emerald-400">Charge: KES {selectedVehicle.ourDailyRate.toLocaleString()}/day</span>
                    <span className="text-amber-400 font-bold">Gross: KES {profitDay(selectedVehicle).toLocaleString()}/day</span>
                  </div>
                </div>
              )}
            </div>

            {/* Client & Period */}
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
              <h4 className="text-blue-400 font-semibold text-xs uppercase tracking-wide">Client & Period</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 relative">
                  <Label className="text-gray-200">Search Client (name, phone or ID) *</Label>
                  <Input
                    className="mt-1 bg-[#0a1628] border-blue-500/30 text-white"
                    placeholder="Type name, phone or ID number..."
                    value={clientSearch}
                    onChange={e => searchClients(e.target.value)}
                    onFocus={() => clientSearch.length >= 2 && setShowClientResults(true)}
                  />
                  {showClientResults && clientResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 rounded-lg border border-blue-500/30 bg-[#0a1628] shadow-xl overflow-hidden">
                      {clientResults.map(c => (
                        <button key={c.id} type="button"
                          className="w-full text-left px-3 py-2.5 hover:bg-blue-500/10 border-b border-white/5 last:border-0"
                          onClick={() => selectClient(c)}>
                          <p className="text-white text-sm font-medium">{c.fullName}</p>
                          <p className="text-gray-400 text-xs">{c.phone} {c.idNumber ? "| ID: " + c.idNumber : ""}</p>
                        </button>
                      ))}
                      <button type="button" className="w-full text-left px-3 py-2 text-xs text-blue-400 hover:bg-blue-500/10"
                        onClick={() => { setBForm(prev => ({ ...prev, clientName: clientSearch, clientPhone: "" })); setShowClientResults(false); }}>
                        + Use "{clientSearch}" as new client
                      </button>
                    </div>
                  )}
                  {bForm.clientName && (
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2">
                      <div>
                        <p className="text-xs text-emerald-400 font-semibold">{bForm.clientName}</p>
                        {bForm.clientPhone && <p className="text-xs text-gray-400">{bForm.clientPhone}</p>}
                      </div>
                      <button type="button" className="text-xs text-gray-500 hover:text-red-400" onClick={() => { setBForm(prev => ({ ...prev, clientName: "", clientPhone: "" })); setClientSearch(""); setPrefilledClient(null); }}>Clear</button>
                    </div>
                  )}
                  {!bForm.clientName && clientSearch.length > 1 && !showClientResults && (
                    <div className="mt-2 flex gap-2">
                      <button type="button"
                        className="flex-1 py-2 rounded-lg border border-blue-500/40 bg-blue-500/10 text-blue-300 text-xs font-semibold hover:bg-blue-500/20"
                        onClick={() => { setNewClientForm(prev => ({ ...prev, fullName: clientSearch })); setShowRegForm(true); }}>
                        + Register as New Client
                      </button>
                      <button type="button"
                        className="flex-1 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-400 text-xs hover:border-white/20"
                        onClick={() => { setBForm(prev => ({ ...prev, clientName: clientSearch })); }}>
                        Use name only
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Client Registration Form */}
                {showRegForm && (
                  <div className="col-span-2 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-blue-400 font-semibold text-xs uppercase tracking-wide">Register New Client</h4>
                      <button type="button" className="text-gray-500 hover:text-red-400 text-xs" onClick={() => setShowRegForm(false)}>Cancel</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-gray-200 text-xs">Full Name *</Label>
                        <Input className="mt-1 bg-[#0a1628] border-white/20 text-white text-sm" placeholder="Full legal name"
                          value={newClientForm.fullName} onChange={e => setNewClientForm({ ...newClientForm, fullName: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-gray-200 text-xs">Phone *</Label>
                        <Input className="mt-1 bg-[#0a1628] border-white/20 text-white text-sm" placeholder="+254 7XX XXX XXX"
                          value={newClientForm.phone} onChange={e => setNewClientForm({ ...newClientForm, phone: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-gray-200 text-xs">ID / Passport Number *</Label>
                        <Input className="mt-1 bg-[#0a1628] border-white/20 text-white text-sm font-mono" placeholder="e.g. 12345678"
                          value={newClientForm.idNumber} onChange={e => setNewClientForm({ ...newClientForm, idNumber: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-gray-200 text-xs">Email</Label>
                        <Input className="mt-1 bg-[#0a1628] border-white/20 text-white text-sm" placeholder="email@example.com"
                          value={newClientForm.email} onChange={e => setNewClientForm({ ...newClientForm, email: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-gray-200 text-xs">Residence / Address</Label>
                        <Input className="mt-1 bg-[#0a1628] border-white/20 text-white text-sm" placeholder="Westlands, Nairobi"
                          value={newClientForm.residence} onChange={e => setNewClientForm({ ...newClientForm, residence: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-gray-200 text-xs">Place of Work</Label>
                        <Input className="mt-1 bg-[#0a1628] border-white/20 text-white text-sm" placeholder="Company or employer"
                          value={newClientForm.placeOfWork} onChange={e => setNewClientForm({ ...newClientForm, placeOfWork: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-gray-200 text-xs">KRA PIN</Label>
                        <Input className="mt-1 bg-[#0a1628] border-white/20 text-white text-sm font-mono" placeholder="A012345678A"
                          value={newClientForm.kraPin} onChange={e => setNewClientForm({ ...newClientForm, kraPin: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-gray-200 text-xs">Driving License No.</Label>
                        <Input className="mt-1 bg-[#0a1628] border-white/20 text-white text-sm font-mono" placeholder="DL123456"
                          value={newClientForm.drivingLicenseNumber} onChange={e => setNewClientForm({ ...newClientForm, drivingLicenseNumber: e.target.value })} />
                      </div>
                    </div>
                    <Button type="button" onClick={registerNewClient} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />Register Client and Load into Booking
                    </Button>
                  </div>
                )}
                <div>
                  <Label className="text-gray-200">Start Date *</Label>
                  <Input type="date" className="mt-1 bg-[#0a1628] border-white/20 text-white" value={bForm.startDate} onChange={e => handleStartDate(e.target.value)} />
                </div>
                <div>
                  <Label className="text-gray-200">Number of Days *</Label>
                  <Input type="number" min="1" className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="1" value={bForm.numberOfDays} onChange={e => handleDays(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-400 text-xs">End Date (auto-calculated)</Label>
                  <div className="mt-1 rounded-lg bg-[#0a1628] border border-white/10 px-3 py-2 text-gray-300 text-sm">{bForm.endDate || "Set start date and days"}</div>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4 space-y-3">
              <h4 className="text-orange-400 font-semibold text-xs uppercase tracking-wide">Expenses (deducted from profit)</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-gray-200 text-xs">Type</Label>
                  <select className="w-full mt-1 rounded-lg bg-[#0a1628] border border-white/20 text-white p-2 text-sm"
                    value={expenseType} onChange={e => setExpenseType(e.target.value)}>
                    {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-200 text-xs">Amount (KES)</Label>
                  <Input type="number" className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="0" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} />
                </div>
                <div>
                  <Label className="text-gray-200 text-xs">Note</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="Optional" value={expenseNote} onChange={e => setExpenseNote(e.target.value)} />
                </div>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={addExpense} className="border-orange-500/40 text-orange-400 hover:bg-orange-500/10">
                <Plus className="h-3 w-3 mr-1" />Add Expense
              </Button>
              {expenses.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {expenses.map(e => (
                    <div key={e.id} className="flex items-center justify-between rounded-lg bg-[#0a1628] border border-white/10 px-3 py-2 text-sm">
                      <span className="text-orange-300 font-medium">{e.type}</span>
                      {e.note && <span className="text-gray-400 text-xs flex-1 ml-2">{e.note}</span>}
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">KES {e.amount.toLocaleString()}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-400 hover:text-red-300" onClick={() => removeExpense(e.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm px-1">
                    <span className="text-gray-400">Total expenses:</span>
                    <span className="text-orange-400 font-bold">KES {bTotalExpenses.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Profit Summary */}
            {selectedVehicle && bDays > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-2 text-sm">
                <p className="text-amber-400 font-semibold">Profit Summary — {bDays} day{bDays > 1 ? "s" : ""}</p>
                <div className="flex justify-between"><span className="text-gray-400">Supplier cost:</span><span className="text-red-400 font-semibold">- KES {bSupplierCost.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Client charge:</span><span className="text-emerald-400 font-semibold">+ KES {bClientCharge.toLocaleString()}</span></div>
                {bTotalExpenses > 0 && <div className="flex justify-between"><span className="text-gray-400">Expenses:</span><span className="text-orange-400 font-semibold">- KES {bTotalExpenses.toLocaleString()}</span></div>}
                <Separator className="bg-white/10" />
                <div className="flex justify-between">
                  <span className="text-white font-bold">Net Profit:</span>
                  <span className={bNetProfit >= 0 ? "text-amber-400 font-bold text-base" : "text-red-400 font-bold text-base"}>
                    KES {bNetProfit.toLocaleString()} ({Math.round(bClientCharge > 0 ? (bNetProfit / bClientCharge) * 100 : 0)}% margin)
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Profit per day:</span>
                  <span className={bProfitPerDay >= 0 ? "text-amber-300" : "text-red-300"}>KES {bProfitPerDay.toLocaleString()}/day</span>
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <h4 className="text-emerald-400 font-semibold text-xs uppercase tracking-wide">Payment</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-200">Payment Method *</Label>
                  <select className="w-full mt-1 rounded-lg bg-[#0a1628] border border-white/20 text-white p-2 text-sm"
                    value={bForm.paymentMethod} onChange={e => setBForm({ ...bForm, paymentMethod: e.target.value as "mpesa" | "bank" | "cash" | "cheque" })}>
                    <option value="mpesa">M-Pesa</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <Label className="text-gray-200">Reference / Transaction ID</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white font-mono"
                    placeholder={bForm.paymentMethod === "mpesa" ? "e.g. QGH7Y3K2P1" : "e.g. TXN-00123"}
                    value={bForm.paymentReference} onChange={e => setBForm({ ...bForm, paymentReference: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-200">Amount Paid (KES)</Label>
                  <Input type="number" className="mt-1 bg-[#0a1628] border-white/20 text-white"
                    placeholder="0 if not yet paid"
                    value={bForm.amountPaid} onChange={e => setBForm({ ...bForm, amountPaid: e.target.value })} />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-gray-200">Notes</Label>
              <Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="Any notes..." value={bForm.notes} onChange={e => setBForm({ ...bForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowBookingDialog(false); setExpenses([]); }}>Cancel</Button>
            <Button onClick={addBooking} className="bg-cyan-600 hover:bg-cyan-700"><Plus className="h-4 w-4 mr-2" />Record Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Booking Dialog */}
      <Dialog open={!!viewRecord} onOpenChange={() => setViewRecord(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {viewRecord && (() => {
            const v = vehicles.find(x => x.id === viewRecord.vehicleId);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-white">{v ? v.make + " " + v.model : "Sublet Booking"}</DialogTitle>
                  <DialogDescription className="text-cyan-400 font-mono">{v?.registration} - {viewRecord.serviceType}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-[#0a1628] border border-blue-500/20 p-3">
                      <p className="text-blue-400 text-xs font-semibold uppercase mb-1">Client</p>
                      <p className="text-white font-medium">{viewRecord.clientName}</p>
                      <p className="text-gray-400">{viewRecord.clientPhone}</p>
                    </div>
                    <div className="rounded-lg bg-[#0a1628] border border-violet-500/20 p-3">
                      <p className="text-violet-400 text-xs font-semibold uppercase mb-1">Period & Area</p>
                      <p className="text-white">{viewRecord.startDate} to {viewRecord.endDate}</p>
                      <p className="text-gray-400">{viewRecord.numberOfDays} days - {viewRecord.areaOfUse || "N/A"}</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#0a1628] border border-amber-500/20 p-3 space-y-1.5">
                    <p className="text-amber-400 text-xs font-semibold uppercase mb-1">Financial Breakdown</p>
                    <div className="flex justify-between"><span className="text-gray-400">Supplier cost:</span><span className="text-red-400 font-semibold">KES {viewRecord.totalSupplierCost.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Client charge:</span><span className="text-emerald-400 font-semibold">KES {viewRecord.totalClientCharge.toLocaleString()}</span></div>
                    {viewRecord.totalExpenses > 0 && <div className="flex justify-between"><span className="text-gray-400">Expenses:</span><span className="text-orange-400 font-semibold">KES {viewRecord.totalExpenses.toLocaleString()}</span></div>}
                    <Separator className="bg-white/10" />
                    <div className="flex justify-between"><span className="text-white font-bold">Net Profit:</span><span className="text-amber-400 font-bold">KES {viewRecord.netProfit.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Profit per day:</span><span className="text-amber-300">KES {viewRecord.profitPerDay.toLocaleString()}/day</span></div>
                  </div>
                  {viewRecord.expenses.length > 0 && (
                    <div className="rounded-lg bg-[#0a1628] border border-orange-500/20 p-3">
                      <p className="text-orange-400 text-xs font-semibold uppercase mb-2">Expenses Breakdown</p>
                      {viewRecord.expenses.map(e => (
                        <div key={e.id} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                          <span className="text-gray-300">{e.type}{e.note ? " - " + e.note : ""}</span>
                          <span className="text-orange-300">KES {e.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="rounded-lg bg-[#0a1628] border border-emerald-500/20 p-3 space-y-1.5">
                    <p className="text-emerald-400 text-xs font-semibold uppercase mb-1">Payment</p>
                    <div className="flex justify-between"><span className="text-gray-400">Method:</span><span className="text-white capitalize">{viewRecord.paymentMethod === "mpesa" ? "M-Pesa" : viewRecord.paymentMethod}</span></div>
                    {viewRecord.paymentReference && <div className="flex justify-between"><span className="text-gray-400">Reference:</span><span className="text-white font-mono">{viewRecord.paymentReference}</span></div>}
                    <div className="flex justify-between"><span className="text-gray-400">Amount Paid:</span><span className="text-emerald-400 font-bold">KES {viewRecord.amountPaid.toLocaleString()}</span></div>
                    <div className="flex justify-between border-t border-white/10 pt-1.5">
                      <span className="text-gray-400">Balance:</span>
                      <span className={(viewRecord.totalClientCharge - viewRecord.amountPaid) > 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                        KES {(viewRecord.totalClientCharge - viewRecord.amountPaid).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {viewRecord.notes && <div className="rounded-lg bg-[#0a1628] border border-white/10 p-3"><p className="text-gray-400 text-xs">Notes: <span className="text-gray-300">{viewRecord.notes}</span></p></div>}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
      {/* ── Delete All Confirm ── */}
      {showDeleteAllConfirm && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
          <div style={{background:"#111d2e",border:"1px solid rgba(239,68,68,0.4)",borderRadius:"16px",padding:"28px",maxWidth:"400px",width:"100%"}}>
            <div style={{color:"#f87171",fontSize:"18px",fontWeight:700,marginBottom:"12px",display:"flex",alignItems:"center",gap:"8px"}}>
              <span>⚠</span> Delete All Sublet Data
            </div>
            <p style={{color:"#ccc",fontSize:"14px",marginBottom:"20px"}}>This will permanently delete ALL sublet vehicles and bookings. This cannot be undone.</p>
            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={() => setShowDeleteAllConfirm(false)} style={{flex:1,padding:"10px",borderRadius:"10px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",color:"#ccc",cursor:"pointer"}}>Cancel</button>
              <button onClick={deleteAll} disabled={deletingAll} style={{flex:1,padding:"10px",borderRadius:"10px",background:"#dc2626",border:"none",color:"white",fontWeight:600,cursor:"pointer",opacity:deletingAll?0.7:1}}>
                {deletingAll ? "Deleting..." : "Delete Everything"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Vehicle Dialog ── */}
      {editVehicle && (
        <Dialog open={!!editVehicle} onOpenChange={() => setEditVehicle(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-amber-400 flex items-center gap-2"><Pencil className="h-5 w-5" />Edit Vehicle</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              {([
                ["Service Type","serviceType","text"],["Supplier Name","supplierName","text"],
                ["Supplier Phone","supplierPhone","text"],["Make","make","text"],
                ["Model","model","text"],["Registration","registration","text"],
                ["Color","color","text"],["Year","year","text"],
                ["Supplier Daily Rate","supplierDailyRate","number"],["Our Daily Rate","ourDailyRate","number"],
              ] as [string, keyof SubletVehicle, string][]).map(([label, field, type]) => (
                <div key={field}>
                  <Label className="text-gray-300 text-xs mb-1 block">{label}</Label>
                  <Input type={type} className="bg-[#0a1628] border-white/20 text-white"
                    value={String(editVehicle[field] || "")}
                    onChange={e => setEditVehicle({...editVehicle, [field]: type === "number" ? Number(e.target.value) : e.target.value})} />
                </div>
              ))}
              <div>
                <Label className="text-gray-300 text-xs mb-1 block">Status</Label>
                <select className="w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm"
                  value={editVehicle.status} onChange={e => setEditVehicle({...editVehicle, status: e.target.value as "available"|"active"|"returned"})}>
                  <option value="available">Available</option>
                  <option value="active">Active</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditVehicle(null)}>Cancel</Button>
              <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={updateVehicle}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Edit Booking Dialog ── */}
      {editBooking && (
        <Dialog open={!!editBooking} onOpenChange={() => setEditBooking(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-amber-400 flex items-center gap-2"><Pencil className="h-5 w-5" />Edit Booking — {editBooking.clientName}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label className="text-gray-300 text-xs mb-1 block">Client Name</Label>
                <Input className="bg-[#0a1628] border-white/20 text-white" value={editBooking.clientName} onChange={e => setEditBooking({...editBooking, clientName: e.target.value})} />
              </div>
              <div>
                <Label className="text-gray-300 text-xs mb-1 block">Client Phone</Label>
                <Input className="bg-[#0a1628] border-white/20 text-white" value={editBooking.clientPhone} onChange={e => setEditBooking({...editBooking, clientPhone: e.target.value})} />
              </div>
              <div>
                <Label className="text-gray-300 text-xs mb-1 block">Start Date</Label>
                <Input type="date" className="bg-[#0a1628] border-white/20 text-white" value={editBooking.startDate} onChange={e => setEditBooking({...editBooking, startDate: e.target.value})} />
              </div>
              <div>
                <Label className="text-gray-300 text-xs mb-1 block">End Date</Label>
                <Input type="date" className="bg-[#0a1628] border-white/20 text-white" value={editBooking.endDate} onChange={e => setEditBooking({...editBooking, endDate: e.target.value})} />
              </div>
              <div>
                <Label className="text-gray-300 text-xs mb-1 block">Our Daily Rate</Label>
                <Input type="number" className="bg-[#0a1628] border-white/20 text-white" value={editBooking.ourDailyRate} onChange={e => setEditBooking({...editBooking, ourDailyRate: Number(e.target.value)})} />
              </div>
              <div>
                <Label className="text-gray-300 text-xs mb-1 block">Amount Paid</Label>
                <Input type="number" className="bg-[#0a1628] border-white/20 text-white" value={editBooking.amountPaid} onChange={e => setEditBooking({...editBooking, amountPaid: Number(e.target.value)})} />
              </div>
              <div>
                <Label className="text-gray-300 text-xs mb-1 block">Status</Label>
                <select className="w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm"
                  value={editBooking.status} onChange={e => setEditBooking({...editBooking, status: e.target.value as "active"|"completed"|"cancelled"})}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300 text-xs mb-1 block">Notes</Label>
                <Input className="bg-[#0a1628] border-white/20 text-white" value={editBooking.notes || ""} onChange={e => setEditBooking({...editBooking, notes: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditBooking(null)}>Cancel</Button>
              <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={updateBooking}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
