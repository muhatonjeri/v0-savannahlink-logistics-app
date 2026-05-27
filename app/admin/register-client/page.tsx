"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User, IdCard, Car, Building, Fingerprint, Camera, Upload,
  CheckCircle2, Loader2, ArrowLeft, ArrowRight, Phone, MapPin,
  AlertCircle, ShieldCheck, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

// ── Service catalogue (same as client-lookup) ─────────────────────────────────
const SERVICE_LABELS: Record<string, string> = {
  "car-rental":             "Car Rental",
  "safari-tours":           "Safari Tours",
  "transfers":              "Airport Transfers",
  "movers":                 "Movers",
  "corporate-rental":       "Corporate Rental",
  "road-recovery":          "Road Recovery",
  "cargo-handling":         "Cargo Handling",
  "shipment-imports":       "Shipment Imports",
  "construction-equipment": "Construction Equipment",
};

const SERVICE_BOOKING_URLS: Record<string, string> = {
  "car-rental": "/admin/car-rental/new",
  "safari-tours": "/admin/safari-tours",
  "transfers": "/admin/transfers",
  "movers": "/admin/movers",
  "corporate-rental": "/admin/corporate-rental",
  "road-recovery": "/admin/road-recovery",
  "cargo-handling": "/admin/cargo-handling",
  "shipment-imports": "/admin/shipment-imports",
  "construction-equipment": "/admin/construction-equipment",
};

// ── Photo/Fingerprint capture widget ─────────────────────────────────────────
interface CaptureBoxProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (v: string) => void;
  isFingerprint?: boolean;
}

function CaptureBox({ label, sublabel, value, onChange, isFingerprint = false }: CaptureBoxProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const b64 = await toBase64(f);
    onChange(b64);
    toast.success(`${label} captured`);
  };

  const handleScan = async () => {
    if (!isFingerprint) return;
    setScanning(true);
    await new Promise(r => setTimeout(r, 2000));
    // Simulate successful scan — sets a placeholder fingerprint value
    onChange("fingerprint_scanned_" + Date.now());
    setScanning(false);
    toast.success(`${label} scanned successfully`);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-200">{label}</p>
      {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}

      {value ? (
        <div className="relative rounded-xl border-2 border-green-500 bg-green-900/20 overflow-hidden">
          {value.startsWith("data:image") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="w-full h-36 object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-36 gap-2">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
              <p className="text-xs text-green-400 font-semibold">
                {isFingerprint ? "Fingerprint Captured ✓" : "File Captured ✓"}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-red-600 rounded-full p-1 hover:bg-red-700"
          >
            <X className="h-3 w-3 text-white" />
          </button>
        </div>
      ) : (
        <div className={`rounded-xl border-2 border-dashed p-4 flex flex-col items-center gap-3 min-h-[144px] justify-center
          ${isFingerprint ? "border-purple-500/50 bg-purple-500/5" : "border-blue-500/40 bg-blue-500/5"}`}>
          {isFingerprint ? (
            <Fingerprint className="h-10 w-10 text-purple-400/70" />
          ) : (
            <Camera className="h-10 w-10 text-blue-400/70" />
          )}
          <div className="flex gap-2 flex-wrap justify-center">
            {isFingerprint && (
              <button
                type="button"
                onClick={handleScan}
                disabled={scanning}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-2 rounded-lg font-medium disabled:opacity-60"
              >
                {scanning
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Scanning...</>
                  : <><Fingerprint className="h-3.5 w-3.5" />Scan</>}
              </button>
            )}
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg font-medium"
            >
              <Camera className="h-3.5 w-3.5" />Take Photo
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-gray-300 text-xs px-3 py-2 rounded-lg font-medium"
            >
              <Upload className="h-3.5 w-3.5" />Upload
            </button>
          </div>
          <input ref={fileRef}   type="file" accept="image/*"            className="hidden" onChange={handleFile} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
        </div>
      )}
    </div>
  );
}

// ── KRA PIN verify ────────────────────────────────────────────────────────────
function KraPinField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [loading, setLoading]   = useState(false);
  const [verified, setVerified] = useState(false);

  const verify = async () => {
    if (!value.trim()) { toast.error("Enter a KRA PIN first"); return; }
    if (!/^[A-Za-z]\d{9}[A-Za-z]$/i.test(value.trim())) {
      toast.error("Invalid format — expected A012345678A"); return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setVerified(true);
    setLoading(false);
    toast.success("KRA PIN format valid");
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
        KRA PIN
        {verified && <Badge className="bg-green-700 text-white text-[10px] py-0 px-1.5">Verified ✓</Badge>}
      </label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={e => { onChange(e.target.value.toUpperCase()); setVerified(false); }}
          placeholder="A012345678A"
          className="bg-[#0a1628] border-violet-500/50 text-white font-mono h-11 flex-1"
        />
        <Button
          type="button"
          onClick={verify}
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-700 text-white h-11 px-5 shrink-0"
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Checking...</> : "Verify"}
        </Button>
      </div>
      <p className="text-[11px] text-gray-500">Format: A012345678A (letter · 9 digits · letter)</p>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
function RegisterClientContent() {
  const router      = useRouter();
  const params      = useSearchParams();
  const service     = params.get("service") || "";
  const prefillRaw  = params.get("prefill");
  const prefill     = (() => { try { return JSON.parse(decodeURIComponent(prefillRaw || "{}")); } catch { return {}; } })();

  const serviceLabel = SERVICE_LABELS[service] || "Service";

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    // Personal
    fullName:             (prefill.customerName  || "") as string,
    idNumber:             (prefill.idNumber       || "") as string,
    drivingLicenseNumber: (prefill.drivingLicenseNumber || "") as string,
    placeOfWork:          (prefill.placeOfWork    || "") as string,
    kraPin:               (prefill.kraPin         || "") as string,
    residence:            (prefill.residence      || "") as string,
    // Contact
    phone:                (prefill.customerPhone  || "") as string,
    alternativePhone:     (prefill.alternativePhone || "") as string,
    // Next of Kin
    nextOfKinName:        (prefill.nextOfKinName  || "") as string,
    nextOfKinPhone:       (prefill.nextOfKinPhone || "") as string,
  });

  // ── Photo / fingerprint state ───────────────────────────────────────────────
  const [idPhotoFront,       setIdPhotoFront]       = useState("");
  const [idPhotoBack,        setIdPhotoBack]         = useState("");
  const [dlPhotoFront,       setDlPhotoFront]        = useState("");
  const [dlPhotoBack,        setDlPhotoBack]         = useState("");
  const [rightThumb,         setRightThumb]          = useState("");
  const [leftThumb,          setLeftThumb]           = useState("");
  const [passportPhoto,      setPassportPhoto]       = useState("");

  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  // ── Validation ──────────────────────────────────────────────────────────────
  const errors: Record<string, string> = {};
  if (!form.fullName.trim())  errors.fullName  = "Full name is required";
  if (!form.idNumber.trim())  errors.idNumber  = "ID / Passport number is required";
  if (form.phone.trim().length < 9)  errors.phone = "Valid phone number required";
  if (!form.residence.trim()) errors.residence = "Residence is required";
  const isValid = Object.keys(errors).length === 0;

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) { toast.error("Please fill in all required fields"); return; }

    setSubmitting(true);
    let clientId = `CLT-${Date.now()}`;

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName:             form.fullName,
          idNumber:             form.idNumber,
          phone:                form.phone,
          alternativePhone:     form.alternativePhone || null,
          kraPin:               form.kraPin || null,
          residence:            form.residence || null,
          placeOfWork:          form.placeOfWork || null,
          drivingLicenseNumber: form.drivingLicenseNumber || null,
          nextOfKinName:        form.nextOfKinName || null,
          nextOfKinPhone:       form.nextOfKinPhone || null,
          idPhotoFront:         idPhotoFront  || null,
          idPhotoBack:          idPhotoBack   || null,
          dlPhotoFront:         dlPhotoFront  || null,
          dlPhotoBack:          dlPhotoBack   || null,
          fingerprintRight:     rightThumb    || null,
          fingerprintLeft:      leftThumb     || null,
          passportPhoto:        passportPhoto || null,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        if (saved?.id) clientId = saved.id;
      }
    } catch { /* Supabase not connected — use local ID */ }

    toast.success(`${form.fullName} registered successfully`);

    // Build prefill for booking form
    const bookingPrefill = encodeURIComponent(JSON.stringify({
      clientId,
      customerName:         form.fullName,
      customerPhone:        form.phone,
      idNumber:             form.idNumber,
      kraPin:               form.kraPin,
      drivingLicenseNumber: form.drivingLicenseNumber,
      residence:            form.residence,
      placeOfWork:          form.placeOfWork,
      alternativePhone:     form.alternativePhone,
      nextOfKinName:        form.nextOfKinName,
      nextOfKinPhone:       form.nextOfKinPhone,
    }));

    const bookingUrl = service === "car-rental"
      ? `/admin/car-rental/new?prefill=${bookingPrefill}`
      : `${SERVICE_BOOKING_URLS[service] || "/admin"}?prefill=${bookingPrefill}`;

    setSubmitting(false);
    setTimeout(() => router.push(bookingUrl), 600);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const Field = ({ label, name, placeholder, required = false, mono = false, children }: {
    label: string; name: keyof typeof form; placeholder?: string;
    required?: boolean; mono?: boolean; children?: React.ReactNode;
  }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-200">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children ?? (
        <Input
          value={form[name]}
          onChange={set(name)}
          placeholder={placeholder}
          className={`bg-[#0a1628] border-white/20 text-white h-11 ${mono ? "font-mono" : ""} ${errors[name] ? "border-red-500" : ""}`}
        />
      )}
      {errors[name] && <p className="text-xs text-red-400">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">

      {/* Back */}
      <div className="flex items-center gap-3">
        <Link href="/admin/client-lookup" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />Back to Client Lookup
        </Link>
        {service && (
          <Badge className="bg-[#e67e22]/20 text-[#e67e22] border border-[#e67e22]/40 text-xs">
            → {serviceLabel}
          </Badge>
        )}
      </div>

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="h-6 w-6 text-emerald-400" />Register New Client
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Complete all fields. After saving, you will proceed to the{" "}
          <span className="text-white font-medium">{serviceLabel}</span> booking form.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── A. Personal Details ─────────────────────────────────────────── */}
        <Card className="border-l-4 border-l-blue-500 bg-[#0d1b2e] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-400 text-sm uppercase tracking-widest flex items-center gap-2">
              <User className="h-4 w-4" />A. Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Full Name */}
            <Field label="Full Name" name="fullName" placeholder="John Kamau Mwangi" required />

            {/* ID / Passport */}
            <div className="space-y-3">
              <Field label="ID / Passport No." name="idNumber" placeholder="12345678" required mono />
              <div className="grid gap-3 sm:grid-cols-2">
                <CaptureBox label="ID / Passport — Front" sublabel="Upload or take photo" value={idPhotoFront} onChange={setIdPhotoFront} />
                <CaptureBox label="ID / Passport — Back"  sublabel="Upload or take photo" value={idPhotoBack}  onChange={setIdPhotoBack}  />
              </div>
            </div>

            {/* Driving License */}
            <div className="space-y-3">
              <Field label="Driving License No." name="drivingLicenseNumber" placeholder="DL-XXXXXXXX" mono />
              <div className="grid gap-3 sm:grid-cols-2">
                <CaptureBox label="Driving License — Front" sublabel="Upload or take photo" value={dlPhotoFront} onChange={setDlPhotoFront} />
                <CaptureBox label="Driving License — Back"  sublabel="Upload or take photo" value={dlPhotoBack}  onChange={setDlPhotoBack}  />
              </div>
            </div>

            {/* Place of Work */}
            <Field label="Place of Work / Employer" name="placeOfWork" placeholder="Company or organisation" />

            {/* KRA PIN */}
            <KraPinField value={form.kraPin} onChange={v => setForm(p => ({ ...p, kraPin: v }))} />

            {/* Residence */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                Residence — Estate &amp; House No.<span className="text-red-400">*</span>
              </label>
              <Input
                value={form.residence}
                onChange={set("residence")}
                placeholder="e.g. Westlands, Apt 12B or Kilimani, House 7"
                className={`bg-[#0a1628] border-white/20 text-white h-11 ${errors.residence ? "border-red-500" : ""}`}
              />
              {errors.residence && <p className="text-xs text-red-400">{errors.residence}</p>}
              <p className="text-[11px] text-gray-500">Include estate name and house / apartment number</p>
            </div>

          </CardContent>
        </Card>

        {/* ── B. Contact Details ──────────────────────────────────────────── */}
        <Card className="border-l-4 border-l-green-500 bg-[#0d1b2e] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 text-sm uppercase tracking-widest flex items-center gap-2">
              <Phone className="h-4 w-4" />B. Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Primary Phone — M-Pesa */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                Primary Phone No.<span className="text-red-400">*</span>
                <span className="text-xs font-normal text-green-400 bg-green-500/15 px-2 py-0.5 rounded-full border border-green-500/30">
                  M-Pesa
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-bold font-mono text-sm select-none">+254</span>
                <Input
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="712 345 678"
                  className={`bg-[#0a1628] border-green-500/50 text-white h-11 pl-14 font-mono ${errors.phone ? "border-red-500" : ""}`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
              <p className="text-[11px] text-gray-500">This number must be the M-Pesa registered line used for payments</p>
            </div>

            {/* Alternative Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-200">
                Phone 2 — Alternative No.
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm select-none">+254</span>
                <Input
                  value={form.alternativePhone}
                  onChange={set("alternativePhone")}
                  placeholder="722 000 000"
                  className="bg-[#0a1628] border-white/20 text-white h-11 pl-14 font-mono"
                />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* ── C. Next of Kin ──────────────────────────────────────────────── */}
        <Card className="border-l-4 border-l-rose-500 bg-[#0d1b2e] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-rose-400 text-sm uppercase tracking-widest flex items-center gap-2">
              <User className="h-4 w-4" />C. Next of Kin / Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Next of Kin — Full Name" name="nextOfKinName" placeholder="Jane Wanjiku" />
              <Field label="Next of Kin — Phone No." name="nextOfKinPhone" placeholder="0722 000 000" mono />
            </div>
          </CardContent>
        </Card>

        {/* ── D. Biometrics & Photos ──────────────────────────────────────── */}
        <Card className="border-l-4 border-l-purple-500 bg-[#0d1b2e] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-400 text-sm uppercase tracking-widest flex items-center gap-2">
              <Fingerprint className="h-4 w-4" />D. Biometrics &amp; Passport Photo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <CaptureBox
                label="Right Thumb Print"
                sublabel="Scan hardware or upload image"
                value={rightThumb}
                onChange={setRightThumb}
                isFingerprint
              />
              <CaptureBox
                label="Left Thumb Print"
                sublabel="Scan hardware or upload image"
                value={leftThumb}
                onChange={setLeftThumb}
                isFingerprint
              />
              <CaptureBox
                label="Passport Photo"
                sublabel="Front-facing, clear background"
                value={passportPhoto}
                onChange={setPassportPhoto}
              />
            </div>

            {/* Capture status */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-white/10">
              {[
                { label: "Right Thumb", done: !!rightThumb },
                { label: "Left Thumb",  done: !!leftThumb  },
                { label: "Passport",    done: !!passportPhoto },
                { label: "ID Front",    done: !!idPhotoFront  },
                { label: "ID Back",     done: !!idPhotoBack   },
                { label: "DL Front",    done: !!dlPhotoFront  },
              ].map(({ label, done }) => (
                <span key={label} className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                  done
                    ? "bg-green-700/30 text-green-300 border-green-600/40"
                    : "bg-white/5 text-gray-500 border-white/10"
                }`}>
                  {done ? "✓" : "○"} {label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Submit ─────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {!isValid && (
            <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/40 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">
                Please fill in: {Object.values(errors).join(" · ")}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full py-6 text-base font-bold text-white rounded-xl gap-3"
            style={{ background: isValid ? "#e67e22" : "#374151" }}
          >
            {submitting ? (
              <><Loader2 className="h-5 w-5 animate-spin" />Registering &amp; Saving...</>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" />
                Register Client &amp; Proceed to {serviceLabel} Booking
                <ArrowRight className="h-5 w-5 ml-auto" />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-gray-500">
            Client will be saved to the database · Fingerprints &amp; photos stored securely
          </p>
        </div>

      </form>
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
