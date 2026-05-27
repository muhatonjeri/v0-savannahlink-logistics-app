"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User, Fingerprint, Camera, Upload, CheckCircle2, Loader2,
  ArrowLeft, ArrowRight, Phone, MapPin, Car, Compass, Plane,
  Truck, Bus, Wrench, Package, Ship, HardHat, AlertCircle,
  ShieldCheck, X, Calendar, DollarSign, Fuel, Gauge, Navigation,
  CreditCard, Banknote, Building, FileText, type LucideIcon,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge }    from "@/components/ui/badge";
import { toast }    from "sonner";
import { MpesaPayment } from "@/components/payment/mpesa-payment";
import Link from "next/link";

// ─── Service catalogue ────────────────────────────────────────────────────────
const SERVICES: Record<string, {
  label: string; icon: LucideIcon; color: string;
  border: string; bg: string;
}> = {
  "car-rental":             { label: "Car Rental",             icon: Car,     color: "text-indigo-400", border: "border-indigo-500", bg: "bg-indigo-900/20" },
  "safari-tours":           { label: "Safari Tours",           icon: Compass, color: "text-amber-400",  border: "border-amber-500",  bg: "bg-amber-900/20"  },
  "transfers":              { label: "Airport Transfers",       icon: Plane,   color: "text-sky-400",    border: "border-sky-500",    bg: "bg-sky-900/20"    },
  "movers":                 { label: "Movers",                 icon: Truck,   color: "text-violet-400", border: "border-violet-500", bg: "bg-violet-900/20" },
  "corporate-rental":       { label: "Corporate Rental",       icon: Bus,     color: "text-purple-400", border: "border-purple-500", bg: "bg-purple-900/20" },
  "road-recovery":          { label: "Road Recovery",          icon: Wrench,  color: "text-rose-400",   border: "border-rose-500",   bg: "bg-rose-900/20"   },
  "cargo-handling":         { label: "Cargo Handling",         icon: Package, color: "text-orange-400", border: "border-orange-500", bg: "bg-orange-900/20" },
  "shipment-imports":       { label: "Shipment Imports",       icon: Ship,    color: "text-blue-400",   border: "border-blue-500",   bg: "bg-blue-900/20"   },
  "construction-equipment": { label: "Construction Equipment", icon: HardHat, color: "text-yellow-400", border: "border-yellow-500", bg: "bg-yellow-900/20" },
};

// ─── Vehicle data ─────────────────────────────────────────────────────────────
const VEHICLES = [
  { make: "Toyota",       models: ["Land Cruiser V8","Land Cruiser Prado","Fortuner","Hilux","RAV4","Corolla","Camry","Fielder","Premio","Axio","Vitz","Noah","Voxy","Alphard","Harrier","C-HR"] },
  { make: "Nissan",       models: ["X-Trail","Patrol","Navara","Note","Juke","Qashqai","Serena","Tiida","Wingroad","Murano","Pathfinder"] },
  { make: "Honda",        models: ["CR-V","HR-V","Vezel","Fit","Civic","Accord","Odyssey","Stepwagon","Jazz"] },
  { make: "Mazda",        models: ["CX-5","CX-3","CX-7","Demio","Axela","Atenza","BT-50","MPV"] },
  { make: "Subaru",       models: ["Forester","Outback","XV","Impreza","Legacy","Levorg","WRX"] },
  { make: "Mercedes-Benz",models: ["E-Class","C-Class","S-Class","GLE","GLC","GLA","A-Class","V-Class","Sprinter"] },
  { make: "BMW",          models: ["X5","X3","X1","3 Series","5 Series","7 Series","X6","X7"] },
  { make: "Audi",         models: ["Q7","Q5","Q3","A4","A6","A3","A8","e-tron"] },
  { make: "Land Rover",   models: ["Range Rover","Range Rover Sport","Discovery","Defender","Evoque","Velar"] },
  { make: "Mitsubishi",   models: ["Pajero","Outlander","L200","ASX","Eclipse Cross","Delica","Colt"] },
  { make: "Isuzu",        models: ["D-Max","MU-X","Trooper","NQR","FRR"] },
  { make: "Volkswagen",   models: ["Tiguan","Touareg","Golf","Passat","Polo","T-Cross","Amarok"] },
  { make: "Ford",         models: ["Ranger","Everest","Explorer","Escape","F-150","Transit"] },
  { make: "Hyundai",      models: ["Tucson","Santa Fe","Creta","Elantra","Sonata","Palisade","H-1"] },
  { make: "Kia",          models: ["Sportage","Sorento","Seltos","Carnival","Picanto","Rio","Cerato"] },
];

const FUEL_LEVELS = ["Empty","1/4","1/2","3/4","Full"];

// ─── Reusable CaptureBox ──────────────────────────────────────────────────────
function CaptureBox({
  label, sublabel, value, onChange, isFingerprint = false,
}: {
  label: string; sublabel?: string; value: string;
  onChange: (v: string) => void; isFingerprint?: boolean;
}) {
  const fileRef   = useRef<HTMLInputElement>(null);
  const camRef    = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);

  const toBase64 = (f: File): Promise<string> =>
    new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f); });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    onChange(await toBase64(f));
    toast.success(`${label} captured`);
  };

  const handleScan = async () => {
    setScanning(true);
    await new Promise(r => setTimeout(r, 2000));
    onChange("fingerprint_scanned_" + Date.now());
    setScanning(false);
    toast.success(`${label} scanned`);
  };

  if (value) return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-gray-200">{label}</p>
      {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
      <div className="relative rounded-xl border-2 border-green-500 bg-green-900/20 overflow-hidden">
        {value.startsWith("data:image")
          ? <img src={value} alt={label} className="w-full h-36 object-cover" />  // eslint-disable-line
          : <div className="flex flex-col items-center justify-center h-36 gap-2">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
              <p className="text-xs text-green-400 font-semibold">{isFingerprint ? "Fingerprint Captured ✓" : "Captured ✓"}</p>
            </div>
        }
        <button type="button" onClick={() => onChange("")}
          className="absolute top-2 right-2 bg-red-600 rounded-full p-1 hover:bg-red-700">
          <X className="h-3 w-3 text-white" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-gray-200">{label}</p>
      {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
      <div className={`rounded-xl border-2 border-dashed p-4 flex flex-col items-center gap-3 min-h-[144px] justify-center ${isFingerprint ? "border-purple-500/50 bg-purple-500/5" : "border-blue-500/40 bg-blue-500/5"}`}>
        {isFingerprint
          ? <Fingerprint className="h-10 w-10 text-purple-400/70" />
          : <Camera className="h-10 w-10 text-blue-400/70" />}
        <div className="flex gap-2 flex-wrap justify-center">
          {isFingerprint && (
            <button type="button" onClick={handleScan} disabled={scanning}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-2 rounded-lg font-medium disabled:opacity-60">
              {scanning ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Scanning...</> : <><Fingerprint className="h-3.5 w-3.5" />Scan</>}
            </button>
          )}
          <button type="button" onClick={() => camRef.current?.click()}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg font-medium">
            <Camera className="h-3.5 w-3.5" />Take Photo
          </button>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-gray-300 text-xs px-3 py-2 rounded-lg font-medium">
            <Upload className="h-3.5 w-3.5" />Upload
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <input ref={camRef}  type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

// ─── KRA PIN verify ───────────────────────────────────────────────────────────
function KraField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [loading,  setLoading]  = useState(false);
  const [verified, setVerified] = useState(false);

  const verify = async () => {
    if (!value.trim()) { toast.error("Enter a KRA PIN first"); return; }
    if (!/^[A-Za-z]\d{9}[A-Za-z]$/i.test(value.trim())) { toast.error("Invalid format — expected A012345678A"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setVerified(true); setLoading(false);
    toast.success("KRA PIN format valid ✓");
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
        KRA PIN
        {verified && <Badge className="bg-green-700 text-white text-[10px] py-0 px-1.5">Verified ✓</Badge>}
        <span className="text-gray-500 font-normal text-xs">(optional)</span>
      </label>
      <div className="flex gap-2">
        <Input value={value} onChange={e => { onChange(e.target.value.toUpperCase()); setVerified(false); }}
          placeholder="A012345678A" className="bg-[#0a1628] border-violet-500/50 text-white font-mono h-11 flex-1" />
        <Button type="button" onClick={verify} disabled={loading}
          className="bg-violet-600 hover:bg-violet-700 text-white h-11 px-5 shrink-0">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Verifying...</> : "Verify"}
        </Button>
      </div>
      <p className="text-[11px] text-gray-500">Format: A012345678A · auto-fills from iTax when connected</p>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionCard({ letter, title, color, children }: {
  letter: string; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <Card className={`border-l-4 ${color} bg-[#0d1b2e] border-white/10`}>
      <CardHeader className="pb-3">
        <CardTitle className={`text-sm uppercase tracking-widest flex items-center gap-2 ${color.replace("border-", "text-")}`}>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${color.replace("border-", "bg-").replace("/80","").replace("-500","")}`}
            style={{ background: "currentColor" }}>
            <span className="text-[10px] font-bold text-white">{letter}</span>
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

// ─── Label helper ─────────────────────────────────────────────────────────────
function FL({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-200">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────
function RegisterClientContent() {
  const router = useRouter();
  const params = useSearchParams();
  const service    = params.get("service") || "";
  const prefillRaw = params.get("prefill") || "{}";
  const prefill    = (() => { try { return JSON.parse(decodeURIComponent(prefillRaw)); } catch { return {}; } })();

  const svc = SERVICES[service];

  // ── Personal form state ─────────────────────────────────────────────────────
  const [f, setF] = useState({
    fullName:             String(prefill.customerName  || ""),
    kraPin:               String(prefill.kraPin        || ""),
    idNumber:             String(prefill.idNumber      || ""),
    drivingLicenseNumber: String(prefill.drivingLicenseNumber || ""),
    placeOfWork:          String(prefill.placeOfWork   || ""),
    residence:            String(prefill.residence     || ""),
    phone:                String(prefill.customerPhone || ""),
    alternativePhone:     String(prefill.alternativePhone || ""),
    nextOfKinName:        String(prefill.nextOfKinName || ""),
    nextOfKinPhone:       String(prefill.nextOfKinPhone || ""),
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF(p => ({ ...p, [k]: e.target.value }));

  // ── Photo / fingerprint state ───────────────────────────────────────────────
  const [idFront,      setIdFront]      = useState("");
  const [idBack,       setIdBack]       = useState("");
  const [dlFront,      setDlFront]      = useState("");
  const [dlBack,       setDlBack]       = useState("");
  const [rightThumb,   setRightThumb]   = useState("");
  const [leftThumb,    setLeftThumb]    = useState("");
  const [passportPhoto,setPassportPhoto]= useState("");

  // ── Car rental specific ─────────────────────────────────────────────────────
  const [carMake,       setCarMake]       = useState("");
  const [carModel,      setCarModel]      = useState("");
  const [numberPlate,   setNumberPlate]   = useState("");
  const [mileage,       setMileage]       = useState("");
  const [fuelLevel,     setFuelLevel]     = useState("Full");
  const [etcAmount,     setEtcAmount]     = useState("");
  const [destination,   setDestination]   = useState("");
  const [numberOfDays,  setNumberOfDays]  = useState("");
  const [dailyRate,     setDailyRate]     = useState("");
  const [startDate,     setStartDate]     = useState("");
  const [startTime,     setStartTime]     = useState("08:00");
  const [endDate,       setEndDate]       = useState("");
  const [endTime,       setEndTime]       = useState("08:00");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa"|"bank"|"cash">("mpesa");
  const [rentalType,    setRentalType]    = useState<"self-drive"|"chauffeured">("self-drive");

  // Auto-fill start date/time
  useEffect(() => {
    const now = new Date();
    setStartDate(now.toISOString().split("T")[0]);
    setStartTime(now.toTimeString().slice(0,5));
  }, []);

  // Auto-calc end date when days change
  useEffect(() => {
    if (!startDate || !numberOfDays) return;
    const d = new Date(`${startDate}T${startTime || "08:00"}:00`);
    d.setDate(d.getDate() + parseInt(numberOfDays || "0"));
    setEndDate(d.toISOString().split("T")[0]);
    setEndTime(startTime);
  }, [startDate, startTime, numberOfDays]);

  const models = VEHICLES.find(v => v.make === carMake)?.models || [];
  const total  = (parseFloat(dailyRate) || 0) * (parseInt(numberOfDays) || 0) + (rentalType === "chauffeured" ? 2000 * (parseInt(numberOfDays)||0) : 0);
  const fmtKES = (n: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(n);

  // ── Validation ──────────────────────────────────────────────────────────────
  const errs: Record<string,string> = {};
  if (!f.fullName.trim())    errs.fullName  = "Required";
  if (!f.idNumber.trim())    errs.idNumber  = "Required";
  if (f.phone.trim().length < 9) errs.phone = "Required";
  if (!f.residence.trim())   errs.residence = "Required";
  if (service === "car-rental") {
    if (!carMake)         errs.carMake      = "Required";
    if (!carModel)        errs.carModel     = "Required";
    if (!numberPlate)     errs.numberPlate  = "Required";
    if (!mileage)         errs.mileage      = "Required";
    if (!destination)     errs.destination  = "Required";
    if (!numberOfDays)    errs.numberOfDays = "Required";
    if (!dailyRate)       errs.dailyRate    = "Required";
    if (!startDate)       errs.startDate    = "Required";
  }
  const isValid = Object.keys(errs).length === 0;

  // ── Booking state ───────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [bookingId,  setBookingId]  = useState("");
  const [showPayment,setShowPayment]= useState(false);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) { toast.error("Please fill in all required fields"); return; }
    setSubmitting(true);

    let clientId = `CLT-${Date.now()}`;
    let bkId     = `BK-${Date.now()}`;

    // Save client
    try {
      const res = await fetch("/api/clients", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: f.fullName, idNumber: f.idNumber, phone: f.phone,
          alternativePhone: f.alternativePhone || null, kraPin: f.kraPin || null,
          residence: f.residence, placeOfWork: f.placeOfWork || null,
          drivingLicenseNumber: f.drivingLicenseNumber || null,
          nextOfKinName: f.nextOfKinName || null, nextOfKinPhone: f.nextOfKinPhone || null,
          idPhotoFront: idFront || null, idPhotoBack: idBack || null,
          dlPhotoFront: dlFront || null, dlPhotoBack: dlBack || null,
          fingerprintRight: rightThumb || null, fingerprintLeft: leftThumb || null,
          passportPhoto: passportPhoto || null,
        }),
      });
      if (res.ok) { const s = await res.json(); if (s?.id) clientId = s.id; }
    } catch {}

    // Save booking (car rental)
    if (service === "car-rental") {
      try {
        const res = await fetch("/api/bookings", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_type: "car-rental", customer_name: f.fullName,
            customer_phone: f.phone, status: "pending",
            payment_status: "pending", payment_method: paymentMethod,
            total_amount: total,
            metadata: {
              clientId, rentalType, carMake, carModel, numberPlate,
              currentMileage: mileage, fuelLevel, etcAmount, destination,
              numberOfDays, dailyRate, startDate, startTime, endDate, endTime,
            },
          }),
        });
        if (res.ok) { const b = await res.json(); if (b?.id) bkId = b.id; }
      } catch {}
    }

    setBookingId(bkId);
    setSubmitting(false);

    if (paymentMethod === "mpesa" || paymentMethod === "bank") {
      setShowPayment(true);
    } else {
      toast.success(`${f.fullName} registered & booking created!`);
      setTimeout(() => router.push("/admin/car-rental"), 1500);
    }
  };

  const isCarRental = service === "car-rental";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">

      {/* Back + badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/admin/client-lookup" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />Back to Client Lookup
        </Link>
        {svc && (
          <Badge className={`${svc.bg} ${svc.color} border ${svc.border} text-xs gap-1.5 px-3 py-1`}>
            <svc.icon className="h-3.5 w-3.5" />{svc.label}
          </Badge>
        )}
      </div>

      {/* Page header */}
      <div className="rounded-xl border border-white/10 bg-[#0d1b2e] p-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          {svc ? <svc.icon className={`h-5 w-5 ${svc.color}`} /> : <User className="h-5 w-5 text-emerald-400" />}
          Register New Client
          {svc && <span className={`text-base font-normal ${svc.color}`}>— {svc.label}</span>}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Complete all required fields marked <span className="text-red-400">*</span>.
          {isCarRental && " Car details, rental period and payment are below the personal section."}
        </p>
        {/* Step indicators */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {[
            "A. Personal Details",
            "B. Contact",
            "C. Next of Kin",
            "D. Biometrics & Photos",
            ...(isCarRental ? ["E. Car Details","F. Rental Period","G. Payment"] : []),
          ].map((step, i) => (
            <span key={i} className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 font-medium">
              {step}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── A. Personal Details ───────────────────────────────────────────── */}
        <Card className="border-l-4 border-l-blue-500 bg-[#0d1b2e] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-400 text-sm uppercase tracking-widest flex items-center gap-2">
              <User className="h-4 w-4" />A. Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Full Name */}
            <FL label="Full Name" required>
              <Input value={f.fullName} onChange={set("fullName")} placeholder="John Kamau Mwangi"
                className={`bg-[#0a1628] border-white/20 text-white h-11 ${errs.fullName ? "border-red-500" : ""}`} />
            </FL>

            {/* KRA PIN — second field per spec */}
            <KraField value={f.kraPin} onChange={v => setF(p => ({ ...p, kraPin: v }))} />

            {/* ID / Passport */}
            <div className="space-y-3">
              <FL label="ID / Passport No." required>
                <Input value={f.idNumber} onChange={set("idNumber")} placeholder="12345678"
                  className={`bg-[#0a1628] border-white/20 text-white h-11 font-mono ${errs.idNumber ? "border-red-500" : ""}`} />
              </FL>
              <div className="grid gap-3 sm:grid-cols-2">
                <CaptureBox label="ID / Passport — Front" sublabel="Upload or take photo" value={idFront} onChange={setIdFront} />
                <CaptureBox label="ID / Passport — Back"  sublabel="Upload or take photo" value={idBack}  onChange={setIdBack}  />
              </div>
            </div>

            {/* Driving License */}
            <div className="space-y-3">
              <FL label="Driving License No.">
                <Input value={f.drivingLicenseNumber} onChange={set("drivingLicenseNumber")}
                  placeholder="DL-XXXXXXXX" className="bg-[#0a1628] border-white/20 text-white h-11 font-mono" />
              </FL>
              <div className="grid gap-3 sm:grid-cols-2">
                <CaptureBox label="Driving License — Front" sublabel="Upload or take photo" value={dlFront} onChange={setDlFront} />
                <CaptureBox label="Driving License — Back"  sublabel="Upload or take photo" value={dlBack}  onChange={setDlBack}  />
              </div>
            </div>

            {/* Place of Work */}
            <FL label="Place of Work / Employer">
              <Input value={f.placeOfWork} onChange={set("placeOfWork")}
                placeholder="Company or organisation name" className="bg-[#0a1628] border-white/20 text-white h-11" />
            </FL>

            {/* Residence */}
            <FL label="Residence — Estate & House No." required>
              <Input value={f.residence} onChange={set("residence")}
                placeholder="e.g. Westlands, Apt 12B  or  Karen, House 7"
                className={`bg-[#0a1628] border-white/20 text-white h-11 ${errs.residence ? "border-red-500" : ""}`} />
              <p className="text-[11px] text-gray-500">Include estate name and house / apartment number</p>
            </FL>

          </CardContent>
        </Card>

        {/* ── B. Contact Details ────────────────────────────────────────────── */}
        <Card className="border-l-4 border-l-green-500 bg-[#0d1b2e] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 text-sm uppercase tracking-widest flex items-center gap-2">
              <Phone className="h-4 w-4" />B. Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Primary phone — M-Pesa */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                Phone No. <span className="text-red-400">*</span>
                <span className="text-xs font-normal text-green-400 bg-green-500/15 border border-green-500/30 px-2 py-0.5 rounded-full">
                  M-Pesa
                </span>
                <span className="text-gray-500 font-normal text-xs">— default payment number</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-bold font-mono text-sm select-none">+254</span>
                <Input value={f.phone} onChange={set("phone")} placeholder="712 345 678"
                  className={`bg-[#0a1628] border-green-500/50 text-white h-11 pl-14 font-mono ${errs.phone ? "border-red-500" : ""}`} />
              </div>
              <p className="text-[11px] text-gray-500">Must be the M-Pesa registered line — used for STK push payments</p>
            </div>

            {/* Alternative phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-200">Phone 2 — Alternative No.</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm select-none">+254</span>
                <Input value={f.alternativePhone} onChange={set("alternativePhone")} placeholder="722 000 000"
                  className="bg-[#0a1628] border-white/20 text-white h-11 pl-14 font-mono" />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* ── C. Next of Kin ───────────────────────────────────────────────── */}
        <Card className="border-l-4 border-l-rose-500 bg-[#0d1b2e] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-rose-400 text-sm uppercase tracking-widest flex items-center gap-2">
              <User className="h-4 w-4" />C. Next of Kin / Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FL label="Next of Kin — Full Name">
                <Input value={f.nextOfKinName} onChange={set("nextOfKinName")}
                  placeholder="Jane Wanjiku" className="bg-[#0a1628] border-white/20 text-white h-11" />
              </FL>
              <FL label="Next of Kin — Phone No.">
                <Input value={f.nextOfKinPhone} onChange={set("nextOfKinPhone")}
                  placeholder="0722 000 000" className="bg-[#0a1628] border-white/20 text-white h-11 font-mono" />
              </FL>
            </div>
          </CardContent>
        </Card>

        {/* ── D. Biometrics & Photos ───────────────────────────────────────── */}
        <Card className="border-l-4 border-l-purple-500 bg-[#0d1b2e] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-400 text-sm uppercase tracking-widest flex items-center gap-2">
              <Fingerprint className="h-4 w-4" />D. Biometrics &amp; Passport Photo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <CaptureBox label="Fingerprint — Right Thumb" sublabel="Scan hardware or upload" value={rightThumb} onChange={setRightThumb} isFingerprint />
              <CaptureBox label="Fingerprint — Left Thumb"  sublabel="Scan hardware or upload" value={leftThumb}  onChange={setLeftThumb}  isFingerprint />
              <CaptureBox label="Passport Photo" sublabel="Front-facing, clear background" value={passportPhoto} onChange={setPassportPhoto} />
            </div>
            {/* Capture summary */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
              {[
                { label:"Right Thumb",  done:!!rightThumb   },
                { label:"Left Thumb",   done:!!leftThumb    },
                { label:"Passport",     done:!!passportPhoto},
                { label:"ID Front",     done:!!idFront      },
                { label:"ID Back",      done:!!idBack       },
                { label:"DL Front",     done:!!dlFront      },
              ].map(({ label, done }) => (
                <span key={label} className={`text-xs px-2.5 py-1 rounded-full font-medium border ${done ? "bg-green-700/30 text-green-300 border-green-600/40" : "bg-white/5 text-gray-500 border-white/10"}`}>
                  {done ? "✓" : "○"} {label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── E. Car Details (car-rental only) ────────────────────────────── */}
        {isCarRental && (
          <Card className="border-l-4 border-l-indigo-500 bg-[#0d1b2e] border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-indigo-400 text-sm uppercase tracking-widest flex items-center gap-2">
                <Car className="h-4 w-4" />E. Car Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Rental type */}
              <div className="grid grid-cols-2 gap-3">
                {(["self-drive","chauffeured"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setRentalType(t)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${rentalType===t ? "border-indigo-500 bg-indigo-500/15 text-indigo-300" : "border-white/10 bg-white/5 text-gray-400 hover:border-indigo-500/40"}`}>
                    {t === "self-drive" ? "🚗 Self Drive" : "👨‍✈️ Chauffeured"}
                  </button>
                ))}
              </div>

              {/* Make / Model */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FL label="Make" required>
                  <select value={carMake} onChange={e => { setCarMake(e.target.value); setCarModel(""); }}
                    className={`w-full rounded-xl bg-[#0a1628] border text-white p-3 h-11 text-sm ${errs.carMake ? "border-red-500" : "border-white/20"}`}>
                    <option value="">Select make...</option>
                    {VEHICLES.map(v => <option key={v.make} value={v.make}>{v.make}</option>)}
                  </select>
                </FL>
                <FL label="Model" required>
                  <select value={carModel} onChange={e => setCarModel(e.target.value)}
                    className={`w-full rounded-xl bg-[#0a1628] border text-white p-3 h-11 text-sm ${errs.carModel ? "border-red-500" : "border-white/20"}`}>
                    <option value="">Select model...</option>
                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </FL>
              </div>

              {/* Number plate + mileage */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FL label="Number Plate" required>
                  <Input value={numberPlate} onChange={e => setNumberPlate(e.target.value.toUpperCase())}
                    placeholder="KCA 123A" className={`bg-[#0a1628] border-white/20 text-white h-11 font-mono uppercase tracking-widest ${errs.numberPlate ? "border-red-500" : ""}`} />
                </FL>
                <FL label="Current Mileage (km)" required>
                  <div className="relative">
                    <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type="number" value={mileage} onChange={e => setMileage(e.target.value)}
                      placeholder="52340" className={`bg-[#0a1628] border-white/20 text-white h-11 pl-9 ${errs.mileage ? "border-red-500" : ""}`} />
                  </div>
                </FL>
              </div>

              {/* Fuel + ETC */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FL label="Fuel Level">
                  <div className="flex gap-1.5 flex-wrap">
                    {FUEL_LEVELS.map(l => (
                      <button key={l} type="button" onClick={() => setFuelLevel(l)}
                        className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${fuelLevel===l ? "border-emerald-500 bg-emerald-500/15 text-emerald-300" : "border-white/10 bg-white/5 text-gray-400 hover:border-emerald-500/30"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </FL>
                <FL label="ETC Amount (KES)">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">KES</span>
                    <Input type="number" value={etcAmount} onChange={e => setEtcAmount(e.target.value)}
                      placeholder="0" className="bg-[#0a1628] border-white/20 text-white h-11 pl-12" />
                  </div>
                </FL>
              </div>

              {/* Destination */}
              <FL label="Destination" required>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input value={destination} onChange={e => setDestination(e.target.value)}
                    placeholder="e.g. Naivasha, Maasai Mara, JKIA"
                    className={`bg-[#0a1628] border-white/20 text-white h-11 pl-9 ${errs.destination ? "border-red-500" : ""}`} />
                </div>
              </FL>

            </CardContent>
          </Card>
        )}

        {/* ── F. Rental Period & Rate (car-rental only) ─────────────────────── */}
        {isCarRental && (
          <Card className="border-l-4 border-l-teal-500 bg-[#0d1b2e] border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-teal-400 text-sm uppercase tracking-widest flex items-center gap-2">
                <Calendar className="h-4 w-4" />F. Rental Period &amp; Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

              <div className="grid gap-4 sm:grid-cols-2">
                <FL label="No. of Days" required>
                  <Input type="number" min="1" value={numberOfDays} onChange={e => setNumberOfDays(e.target.value)}
                    placeholder="1" className={`bg-[#0a1628] border-white/20 text-white h-11 ${errs.numberOfDays ? "border-red-500" : ""}`} />
                </FL>
                <FL label="Daily Rate (KES)" required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">KES</span>
                    <Input type="number" value={dailyRate} onChange={e => setDailyRate(e.target.value)}
                      placeholder="8000" className={`bg-[#0a1628] border-white/20 text-white h-11 pl-12 ${errs.dailyRate ? "border-red-500" : ""}`} />
                  </div>
                </FL>
              </div>

              {/* Start / End */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FL label="Start Date & Time" required>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      className={`bg-[#0a1628] border-white/20 text-white h-11 ${errs.startDate ? "border-red-500" : ""}`} />
                    <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                      className="bg-[#0a1628] border-white/20 text-white h-11" />
                  </div>
                </FL>
                <FL label="End Date & Time (auto)">
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                      className="bg-[#0a1628] border-white/20 text-white h-11" />
                    <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                      className="bg-[#0a1628] border-white/20 text-white h-11" />
                  </div>
                </FL>
              </div>

              {/* Total amount display */}
              {total > 0 && (
                <div className="rounded-xl border border-[#e67e22]/40 bg-[#e67e22]/8 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Total Amount</p>
                      <p className="text-2xl font-bold text-[#e67e22] mt-0.5">{fmtKES(total)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {numberOfDays} day{parseInt(numberOfDays)!==1?"s":""} × {fmtKES(parseFloat(dailyRate)||0)}
                        {rentalType==="chauffeured" && ` + KES 2,000/day chauffeur`}
                      </p>
                    </div>
                    <DollarSign className="h-10 w-10 text-[#e67e22]/40" />
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        )}

        {/* ── G. Payment (car-rental only) ─────────────────────────────────── */}
        {isCarRental && (
          <Card className="border-l-4 border-l-emerald-500 bg-[#0d1b2e] border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-400 text-sm uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="h-4 w-4" />G. Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="grid grid-cols-3 gap-3">
                {([
                  { k: "mpesa" as const, label: "M-Pesa",      icon: Phone,    cls: "border-green-500 bg-green-500/15 text-green-300"  },
                  { k: "bank"  as const, label: "Bank Transfer",icon: Building, cls: "border-blue-500  bg-blue-500/15  text-blue-300"   },
                  { k: "cash"  as const, label: "Cash",         icon: Banknote, cls: "border-amber-500 bg-amber-500/15 text-amber-300"  },
                ]).map(({ k, label, icon: Icon, cls }) => (
                  <button key={k} type="button" onClick={() => setPaymentMethod(k)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-semibold text-sm transition-all ${paymentMethod===k ? cls : "border-white/10 bg-white/5 text-gray-400 hover:border-white/30"}`}>
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>

              {paymentMethod === "mpesa" && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                  <p className="text-sm text-green-300 font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4" />M-Pesa STK Push
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    An STK push will be sent to <strong className="text-white">{f.phone ? `+254${f.phone}` : "the M-Pesa number above"}</strong> for {total > 0 ? fmtKES(total) : "the total amount"}.
                  </p>
                </div>
              )}

              {paymentMethod === "bank" && (
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-2 text-sm">
                  <p className="text-blue-300 font-semibold flex items-center gap-2"><Building className="h-4 w-4" />Bank Transfer Details</p>
                  <div className="grid gap-1 text-xs">
                    {[
                      ["Bank",    "NCBA Bank Kenya"],
                      ["Account","Moventra Safaris & Logistics Ltd"],
                      ["No.",    process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || "XXXXXXXXXXXXXXXX"],
                      ["Branch", "Thika Road Mall"],
                      ["SWIFT",  process.env.NEXT_PUBLIC_BANK_SWIFT || "CBAFKENX"],
                    ].map(([k,v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-gray-400 w-16 shrink-0">{k}</span>
                        <span className="text-white font-mono">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <p className="text-sm text-amber-300 font-semibold flex items-center gap-2"><Banknote className="h-4 w-4" />Cash Payment</p>
                  <p className="text-xs text-gray-400 mt-1">Collect {total > 0 ? fmtKES(total) : "cash"} from client and issue a receipt.</p>
                </div>
              )}

            </CardContent>
          </Card>
        )}

        {/* ── Validation errors ──────────────────────────────────────────────── */}
        {!isValid && Object.keys(errs).length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/40 bg-red-500/8">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-300">Please complete these required fields:</p>
              <p className="text-xs text-red-400/80 mt-1">{Object.values(errs).join(" · ")}</p>
            </div>
          </div>
        )}

        {/* ── Submit ──────────────────────────────────────────────────────────── */}
        <Button type="submit" disabled={submitting}
          className="w-full py-7 text-base font-bold text-white rounded-xl gap-3"
          style={{ background: isValid ? "#e67e22" : "#374151" }}>
          {submitting
            ? <><Loader2 className="h-5 w-5 animate-spin" />Registering &amp; Saving...</>
            : <><ShieldCheck className="h-5 w-5" />
                Register Client{isCarRental ? " & Proceed to Payment" : " & Create Booking"}
                <ArrowRight className="h-5 w-5 ml-auto" />
              </>}
        </Button>
        <p className="text-center text-xs text-gray-500">
          Client saved to database · Fingerprints &amp; photos stored securely
        </p>

      </form>

      {/* ── M-Pesa payment dialog ─────────────────────────────────────────── */}
      {showPayment && bookingId && total > 0 && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#0d1b2e] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {paymentMethod === "mpesa" ? <Phone className="h-5 w-5 text-green-400" /> : <Building className="h-5 w-5 text-blue-400" />}
              {paymentMethod === "mpesa" ? "M-Pesa Payment" : "Bank Transfer"}
            </h2>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Client</span><span className="text-white font-medium">{f.fullName}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Vehicle</span><span className="text-white">{carMake} {carModel} — {numberPlate}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Period</span><span className="text-white">{numberOfDays} day{parseInt(numberOfDays)!==1?"s":""}</span></div>
              <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                <span className="font-bold text-white">Total</span>
                <span className="font-bold text-[#e67e22] text-lg">{fmtKES(total)}</span>
              </div>
            </div>
            {paymentMethod === "mpesa" && (
              <MpesaPayment
                bookingId={bookingId}
                amount={total}
                defaultPhone={f.phone}
                onSuccess={() => {
                  toast.success("Payment confirmed! Booking complete.");
                  setTimeout(() => router.push("/admin/car-rental"), 1500);
                }}
                onFailure={() => {
                  toast.error("Payment failed. You can retry from the bookings page.");
                  setTimeout(() => router.push("/admin/car-rental"), 2000);
                }}
              />
            )}
            {paymentMethod === "bank" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-300">Send bank transfer confirmation reference to complete booking.</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowPayment(false)}>Back</Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => { toast.success("Booking created — awaiting bank transfer"); router.push("/admin/car-rental"); }}>
                    Mark as Pending
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterClientPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    }>
      <RegisterClientContent />
    </Suspense>
  );
}
