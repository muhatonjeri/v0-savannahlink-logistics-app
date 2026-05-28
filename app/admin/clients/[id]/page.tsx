"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, Phone, Mail, MapPin, Briefcase, CreditCard,
  FileText, Receipt, DollarSign, Car, Compass, Plane, Truck,
  Bus, Wrench, Package, Ship, HardHat, ShieldCheck, ShieldAlert,
  ShieldX, Calendar, TrendingUp, Clock, AlertCircle, Building2,
  Loader2, Activity, Printer, Fingerprint, Globe, Hash, Star,
  CheckCircle2, QrCode, ExternalLink, ChevronRight, Banknote,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:       "#050A14",
  surface:  "#0B1220",
  elevated: "#0F1929",
  subtle:   "#162032",
  border:   "rgba(255,255,255,.06)",
  text:     "#F1F5F9",
  muted:    "#64748B",
  accent:   "#F97316",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtKES = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtDT = (d: string) =>
  d ? new Date(d).toLocaleString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

// ─── Service catalogue ────────────────────────────────────────────────────────
const SVC: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  "car-rental":             { icon: Car,      color: "#818CF8", label: "Car Rental"            },
  "safari-tours":           { icon: Compass,  color: "#FBBF24", label: "Safari Tours"          },
  "transfers":              { icon: Plane,    color: "#38BDF8", label: "Transfers"             },
  "hotel-airport-transfers":{ icon: Plane,    color: "#38BDF8", label: "Airport Transfers"     },
  "movers":                 { icon: Truck,    color: "#A78BFA", label: "Movers"                },
  "corporate-rental":       { icon: Bus,      color: "#C084FC", label: "Corporate Rental"      },
  "road-recovery":          { icon: Wrench,   color: "#FB7185", label: "Road Recovery"         },
  "cargo-handling":         { icon: Package,  color: "#FB923C", label: "Cargo Handling"        },
  "shipment-imports":       { icon: Ship,     color: "#60A5FA", label: "Shipment Imports"      },
  "construction-equipment": { icon: HardHat,  color: "#FACC15", label: "Construction Equipment"},
  "sublet":                 { icon: Building2,color: "#94A3B8", label: "Sublet"                },
};

// ─── Status pills ─────────────────────────────────────────────────────────────
const ST: Record<string, { bg: string; text: string }> = {
  pending:      { bg: "rgba(234,179,8,.15)",  text: "#EAB308" },
  confirmed:    { bg: "rgba(59,130,246,.15)",  text: "#60A5FA" },
  "in-progress":{ bg: "rgba(168,85,247,.15)",  text: "#C084FC" },
  completed:    { bg: "rgba(52,211,153,.15)",  text: "#34D399" },
  cancelled:    { bg: "rgba(248,113,113,.15)", text: "#F87171" },
  paid:         { bg: "rgba(52,211,153,.15)",  text: "#34D399" },
  partial:      { bg: "rgba(251,191,36,.15)",  text: "#FBBF24" },
  overdue:      { bg: "rgba(248,113,113,.15)", text: "#F87171" },
  issued:       { bg: "rgba(45,212,191,.15)",  text: "#2DD4BF" },
  sent:         { bg: "rgba(59,130,246,.15)",  text: "#60A5FA" },
  draft:        { bg: "rgba(100,116,139,.15)", text: "#94A3B8" },
  active:       { bg: "rgba(52,211,153,.15)",  text: "#34D399" },
};

function Pill({ status }: { status: string }) {
  const s = ST[status] || { bg: "rgba(100,116,139,.12)", text: "#94A3B8" };
  return (
    <span style={{ background: s.bg, color: s.text, fontSize: 10, fontWeight: 700,
      padding: "2px 8px", borderRadius: 99, textTransform: "uppercase" as const, letterSpacing: ".06em" }}>
      {status}
    </span>
  );
}

// ─── Risk config ──────────────────────────────────────────────────────────────
const RISK = {
  high:   { label: "High Risk",   color: "#F87171", bg: "rgba(248,113,113,.12)", Icon: ShieldX    },
  medium: { label: "Medium Risk", color: "#FBBF24", bg: "rgba(251,191,36,.12)",  Icon: ShieldAlert },
  low:    { label: "Verified",    color: "#34D399", bg: "rgba(52,211,153,.12)",  Icon: ShieldCheck },
};

// ─── QR hook ─────────────────────────────────────────────────────────────────
function useQR(url: string) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, { width: 160, margin: 1, color: { dark: "#050A14", light: "#FFFFFF" } })
      .then(setSrc).catch(() => {});
  }, [url]);
  return src;
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string; sub?: string; color: string; icon: LucideIcon;
}) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: "14px 16px", boxShadow: `0 0 0 1px ${color}12` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: T.muted, textTransform: "uppercase" as const, letterSpacing: ".07em", fontWeight: 600 }}>{label}</span>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon style={{ width: 14, height: 14, color }} />
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── Field row ────────────────────────────────────────────────────────────────
function FR({ icon: Icon, label, value, mono, accent }: {
  icon: LucideIcon; label: string; value?: string; mono?: boolean; accent?: string;
}) {
  if (!value || value === "—" || value === "null" || value === "undefined") return null;
  return (
    <div style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: `1px solid ${T.border}`, alignItems: "flex-start" }}>
      <Icon style={{ width: 14, height: 14, color: T.muted, marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase" as const, letterSpacing: ".07em", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: accent || T.text, fontFamily: mono ? "'JetBrains Mono', monospace" : undefined, wordBreak: "break-all" as const }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Sec({ title, icon: Icon, accent, children, aside }: {
  title: string; icon: LucideIcon; accent: string; children: React.ReactNode; aside?: React.ReactNode;
}) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16,
      overflow: "hidden", boxShadow: `0 0 0 1px ${accent}12` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: `1px solid ${T.border}`,
        background: `linear-gradient(90deg, ${accent}0e 0%, transparent 70%)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon style={{ width: 14, height: 14, color: accent }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase" as const, letterSpacing: ".07em" }}>{title}</span>
        </div>
        {aside}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

// ─── List row ─────────────────────────────────────────────────────────────────
function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 16px",
      borderBottom: `1px solid ${T.border}`, transition: "background .12s",
      cursor: "default" }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.025)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
      {children}
    </div>
  );
}

// ─── Print HTML ───────────────────────────────────────────────────────────────
function buildPrint(
  client: Record<string, unknown>,
  summary: Record<string, unknown>,
  bookings: Record<string, unknown>[],
  invoices: Record<string, unknown>[],
  receipts: Record<string, unknown>[],
  qrDataUrl: string,
) {
  const fk = fmtKES;
  const fd = fmtDate;
  const n      = String(client.full_name   || "Unknown Client");
  const phone  = String(client.phone       || "—");
  const phone2 = String(client.alternative_phone || "");
  const email  = String(client.email       || "");
  const id     = String(client.id_number   || "");
  const kra    = String(client.kra_pin     || "");
  const dl     = String(client.driving_license_number || "");
  const nat    = String(client.nationality || "Kenyan");
  const res    = String(client.residence   || "");
  const work   = String(client.place_of_work || "");
  const nok    = String(client.next_of_kin_name  || "");
  const nokph  = String(client.next_of_kin_phone || "");
  const nokrel = String(client.next_of_kin_relationship || "");
  const risk   = String(client.risk_level  || "low");
  const since  = fd(String(client.created_at || ""));
  const tb     = Number(summary.totalBookings || 0);
  const ts     = Number(summary.totalSpent    || 0);
  const td     = Number(summary.totalDebt     || 0);
  const idType = String(client.id_type || "national_id").replace(/_/g, " ");
  const initials = n.split(" ").slice(0,2).map((w: string) => w[0]).join("").toUpperCase();
  const riskColor = risk === "high" ? "#DC2626" : risk === "medium" ? "#D97706" : "#059669";
  const riskLabel = risk === "high" ? "High Risk" : risk === "medium" ? "Medium Risk" : "Verified Client";

  const svcBreak = (summary.serviceBreakdown as Record<string,number>) || {};

  return `<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>Client Profile — ${n}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#0F172A;font-size:12px;line-height:1.5}
@page{margin:12mm;size:A4}
@media print{.no-print{display:none}.page-break{page-break-before:always}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.page{max-width:780px;margin:0 auto}
/* Header */
.hdr{background:#050A14;padding:18px 24px;display:flex;align-items:center;justify-content:space-between}
.hdr-logo{width:48px;height:48px;border-radius:10px;object-fit:cover}
.hdr-brand{color:#fff;margin-left:12px}
.hdr-brand h1{font-size:18px;font-weight:800;letter-spacing:-.01em}
.hdr-brand p{font-size:8px;color:#F97316;text-transform:uppercase;letter-spacing:.15em}
.hdr-brand small{font-size:9px;color:#64748B}
.hdr-right{text-align:right;font-size:9px;color:#94A3B8}
.orange-bar{height:3px;background:linear-gradient(90deg,#F97316,#FB923C)}
/* Hero */
.hero{padding:20px 24px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;display:flex;gap:18px;align-items:center}
.avatar{width:64px;height:64px;border-radius:16px;background:#F97316;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:white;flex-shrink:0;font-family:'Segoe UI',sans-serif}
.hero-info{flex:1}
.hero-name{font-size:20px;font-weight:700;color:#0F172A}
.hero-meta{display:flex;gap:10px;flex-wrap:wrap;margin-top:5px;font-size:11px;color:#64748B}
.risk-pill{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:3px 10px;border-radius:99px;color:${riskColor};background:${riskColor}18;border:1px solid ${riskColor}30}
.hero-right{text-align:center}
.hero-right img{width:72px;height:72px;border:1px solid #E2E8F0;border-radius:8px}
.hero-right small{display:block;font-size:8px;color:#94A3B8;margin-top:3px}
/* KPIs */
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:16px 24px;background:#fff;border-bottom:1px solid #E2E8F0}
.kpi{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px;text-align:center}
.kpi-val{font-size:18px;font-weight:800;color:#0F172A}
.kpi-val-g{font-size:18px;font-weight:800;color:#059669}
.kpi-val-r{font-size:18px;font-weight:800;color:#DC2626}
.kpi-lbl{font-size:9px;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;margin-top:2px}
/* Body */
.body{padding:20px 24px}
.section{margin-bottom:20px}
.sec-title{font-size:10px;font-weight:700;color:#F97316;text-transform:uppercase;letter-spacing:.09em;padding-bottom:6px;border-bottom:2px solid #FED7AA;margin-bottom:10px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:0 24px}
.field{display:flex;gap:6px;padding:6px 0;border-bottom:1px solid #F1F5F9}
.fl{font-size:9.5px;color:#94A3B8;text-transform:uppercase;letter-spacing:.05em;width:110px;flex-shrink:0;padding-top:1px}
.fv{font-size:11px;color:#1E293B;font-weight:500;word-break:break-all}
.fv-mono{font-family:'Courier New',monospace;font-size:10px}
/* Tables */
table{width:100%;border-collapse:collapse;font-size:11px;margin-top:6px}
th{background:#F8FAFC;color:#64748B;font-size:9px;text-transform:uppercase;letter-spacing:.06em;padding:7px 8px;text-align:left;border-bottom:2px solid #E2E8F0}
td{padding:7px 8px;border-bottom:1px solid #F1F5F9;color:#1E293B;vertical-align:top}
tr:last-child td{border-bottom:none}
.td-r{text-align:right}
/* Services grid */
.svc-grid{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.svc-pill{font-size:10px;padding:4px 10px;border-radius:6px;background:#F1F5F9;color:#475569;font-weight:600}
/* Footer */
.ftr{background:#F8FAFC;border-top:2px solid #F97316;padding:12px 24px;display:flex;justify-content:space-between;align-items:center}
.ftr-brand{font-size:9px;color:#64748B}
.ftr-brand strong{color:#0F172A}
/* Notes */
.note{background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:8px 12px;font-size:11px;color:#92400E}
</style>
</head><body>
<div class="page">

<!-- HEADER -->
<div class="hdr">
  <div style="display:flex;align-items:center">
    <img src="/images/logo.png" alt="Moventra" class="hdr-logo">
    <div class="hdr-brand">
      <h1>MOVENTRA</h1>
      <p>Safaris &amp; Logistics Ltd</p>
      <small>Muthaiga Square, off Thika Rd · www.savannalink.com · 0727 247 032</small>
    </div>
  </div>
  <div class="hdr-right">
    <div style="font-weight:700;color:#fff;font-size:11px">Client Profile</div>
    <div>Printed: ${new Date().toLocaleString("en-KE")}</div>
    <div>info@savannalink.com</div>
  </div>
</div>
<div class="orange-bar"></div>

<!-- HERO -->
<div class="hero">
  <div class="avatar">${initials}</div>
  <div class="hero-info">
    <div class="hero-name">${n}</div>
    <div class="hero-meta">
      <span>📞 ${phone}</span>
      ${email ? `<span>✉ ${email}</span>` : ""}
      <span>${nat}</span>
      <span class="risk-pill">${riskLabel}</span>
      <span style="color:#94A3B8">Client since ${since}</span>
    </div>
    ${nok ? `<div style="margin-top:6px;font-size:10px;color:#64748B">Next of Kin: <strong style="color:#1E293B">${nok}</strong>${nokph ? ` · ${nokph}` : ""}${nokrel ? ` (${nokrel})` : ""}</div>` : ""}
  </div>
  ${qrDataUrl ? `<div class="hero-right">
    <img src="${qrDataUrl}" alt="QR">
    <small>Scan for Car Rental T&amp;Cs</small>
  </div>` : ""}
</div>

<!-- KPIs -->
<div class="kpis">
  <div class="kpi"><div class="kpi-val">${tb}</div><div class="kpi-lbl">Bookings</div></div>
  <div class="kpi"><div class="kpi-val-g">${fk(ts)}</div><div class="kpi-lbl">Total Spent</div></div>
  <div class="kpi"><div class="${td > 0 ? "kpi-val-r" : "kpi-val-g"}">${fk(td)}</div><div class="kpi-lbl">Outstanding</div></div>
  <div class="kpi"><div class="kpi-val" style="font-size:14px">${Object.keys(svcBreak).length}</div><div class="kpi-lbl">Services Used</div></div>
</div>

<div class="body">

<!-- PERSONAL INFO -->
<div class="section">
  <div class="sec-title">Personal Information</div>
  <div class="grid2">
    <div>
      ${[["Primary Phone", phone],["Alternative Phone", phone2],["Email", email],["Nationality", nat],["Residence", res]].filter(([,v])=>v).map(([l,v])=>`<div class="field"><div class="fl">${l}</div><div class="fv">${v}</div></div>`).join("")}
    </div>
    <div>
      ${[["Place of Work", work],["ID Type", idType],["ID / Passport No.", id],["KRA PIN", kra],["Driving License", dl]].filter(([,v])=>v).map(([l,v])=>`<div class="field"><div class="fl">${l}</div><div class="fv fv-mono">${v}</div></div>`).join("")}
    </div>
  </div>
</div>

<!-- SERVICES USED -->
${Object.keys(svcBreak).length > 0 ? `
<div class="section">
  <div class="sec-title">Services Used</div>
  <div class="svc-grid">
    ${Object.entries(svcBreak).map(([k,c]) => `<span class="svc-pill">${(SVC[k]?.label || k.replace(/-/g," "))} × ${c}</span>`).join("")}
  </div>
</div>` : ""}

<!-- BOOKINGS -->
${bookings.length > 0 ? `
<div class="section">
  <div class="sec-title">Booking History (${bookings.length})</div>
  <table>
    <thead><tr><th>Ref</th><th>Service</th><th>Status</th><th class="td-r">Amount</th><th>Date</th></tr></thead>
    <tbody>
      ${bookings.map(b => `<tr>
        <td style="font-family:'Courier New',monospace;font-size:10px;color:#F97316">${String(b.booking_ref || "").slice(0,14) || "—"}</td>
        <td style="text-transform:capitalize">${String(b.service_type || "").replace(/-/g," ")}</td>
        <td>${String(b.status || "")}</td>
        <td class="td-r;font-weight:600">${fk(Number(b.total_amount || 0))}</td>
        <td>${fd(String(b.created_at || ""))}</td>
      </tr>`).join("")}
    </tbody>
  </table>
</div>` : ""}

<!-- INVOICES -->
${invoices.length > 0 ? `
<div class="section page-break">
  <div class="sec-title">Invoices (${invoices.length})</div>
  <table>
    <thead><tr><th>Invoice No.</th><th>Service</th><th>Status</th><th class="td-r">Total</th><th class="td-r">Paid</th><th class="td-r">Balance</th><th>Due</th></tr></thead>
    <tbody>
      ${invoices.map(i => {
        const bal = Number(i.total||0) - Number(i.amount_paid||0);
        return `<tr>
          <td style="font-family:'Courier New',monospace;font-size:10px">${String(i.invoice_number || "")}</td>
          <td style="text-transform:capitalize;font-size:10px">${String(i.service_type || "").replace(/-/g," ")}</td>
          <td>${String(i.status || "")}</td>
          <td class="td-r">${fk(Number(i.total||0))}</td>
          <td class="td-r" style="color:#059669">${fk(Number(i.amount_paid||0))}</td>
          <td class="td-r" style="color:${bal > 0 ? "#DC2626" : "#059669"}">${fk(bal)}</td>
          <td>${fd(String(i.due_date || ""))}</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>
</div>` : ""}

<!-- RECEIPTS -->
${receipts.length > 0 ? `
<div class="section">
  <div class="sec-title">Payment Receipts (${receipts.length})</div>
  <table>
    <thead><tr><th>Receipt No.</th><th>Service</th><th>Method</th><th class="td-r">Amount</th><th>Date</th></tr></thead>
    <tbody>
      ${receipts.map(r => `<tr>
        <td style="font-family:'Courier New',monospace;font-size:10px">${String(r.receipt_number || "")}</td>
        <td style="text-transform:capitalize;font-size:10px">${String(r.service_type || "").replace(/-/g," ")}</td>
        <td style="text-transform:capitalize">${String(r.payment_method || "")}</td>
        <td class="td-r" style="color:#059669;font-weight:600">${fk(Number(r.total_amount||0))}</td>
        <td>${fd(String(r.issued_at || r.created_at || ""))}</td>
      </tr>`).join("")}
    </tbody>
  </table>
</div>` : ""}

</div>

<!-- FOOTER -->
<div class="ftr">
  <div class="ftr-brand">
    <strong>Moventra Safaris &amp; Logistics Ltd</strong><br>
    Muthaiga Square, off Thika Road, Nairobi &nbsp;|&nbsp;
    www.savannalink.com &nbsp;|&nbsp; info@savannalink.com &nbsp;|&nbsp; 0727 247 032
  </div>
  <div style="font-size:9px;color:#94A3B8">Confidential · Client Record</div>
</div>

</div>
</body></html>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function ClientProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [data,    setData]    = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [tab, setTab] = useState<"overview"|"timeline"|"bookings"|"invoices"|"receipts"|"ledger">("overview");
  const [printing, setPrinting] = useState(false);

  const termsUrl = typeof window !== "undefined"
    ? `${window.location.origin}/car-rental-terms`
    : "https://www.savannalink.com/car-rental-terms";
  const qrSrc = useQR(termsUrl);

  useEffect(() => {
    fetch(`/api/client-profile?id=${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load client profile"); setLoading(false); });
  }, [id]);

  const handlePrint = useCallback(async () => {
    if (!data) return;
    setPrinting(true);
    // Generate a larger QR for print
    let printQR = "";
    try {
      printQR = await QRCode.toDataURL(termsUrl, { width: 100, margin: 1, color: { dark: "#050A14", light: "#FFFFFF" } });
    } catch {}
    const html = buildPrint(
      (data.client as Record<string,unknown>) || {},
      (data.summary as Record<string,unknown>) || {},
      (data.bookings     as Record<string,unknown>[]) || [],
      (data.invoices     as Record<string,unknown>[]) || [],
      (data.receipts     as Record<string,unknown>[]) || [],
      printQR,
    );
    const win = window.open("", "_blank", "width=960,height=800");
    if (!win) { toast.error("Allow popups to print"); setPrinting(false); return; }
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); setPrinting(false); }, 600);
  }, [data, termsUrl]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display:"flex", height:"60vh", alignItems:"center", justifyContent:"center",
      flexDirection:"column", gap:12, fontFamily:"'Outfit',sans-serif" }}>
      <Loader2 style={{ width:30, height:30, color:"#F97316", animation:"spin 1s linear infinite" }} />
      <p style={{ color:"#64748B", fontSize:13 }}>Loading client profile…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (error || !data?.client) return (
    <div style={{ display:"flex", height:"60vh", alignItems:"center", justifyContent:"center",
      flexDirection:"column", gap:16, fontFamily:"'Outfit',sans-serif" }}>
      <AlertCircle style={{ width:40, height:40, color:"#F87171" }} />
      <p style={{ color:"#94A3B8" }}>{error || "Client not found"}</p>
      <Link href="/admin/clients" style={{ color:"#F97316", fontSize:13, textDecoration:"none" }}>
        ← Back to Clients
      </Link>
    </div>
  );

  const client       = (data.client as Record<string,unknown>);
  const summary      = (data.summary as Record<string,unknown>) || {};
  const bookings     = (data.bookings     as Record<string,unknown>[]) || [];
  const invoices     = (data.invoices     as Record<string,unknown>[]) || [];
  const receipts     = (data.receipts     as Record<string,unknown>[]) || [];
  const transactions = (data.transactions as Record<string,unknown>[]) || [];
  const svcBreak     = (summary.serviceBreakdown as Record<string,number>) || {};

  const totalBookings = Number(summary.totalBookings || 0);
  const totalSpent    = Number(summary.totalSpent    || 0);
  const totalDebt     = Number(summary.totalDebt     || 0);

  const name = String(client.full_name || "Unknown Client");
  const initials = name.split(" ").slice(0,2).map((w: string) => w[0]).join("").toUpperCase();
  const riskKey = (String(client.risk_level || "low") as keyof typeof RISK);
  const risk = RISK[riskKey] || RISK.low;
  const RiskIcon = risk.Icon;

  const timeline = [
    ...bookings.map(b => ({ type:"booking", date:String(b.created_at||""), d:b,
      icon: SVC[String(b.service_type||"")]?.icon || Car,
      color: SVC[String(b.service_type||"")]?.color || "#94A3B8" })),
    ...invoices.map(i => ({ type:"invoice",     date:String(i.created_at||""), d:i, icon:FileText,  color:"#FB923C" })),
    ...receipts.map(r => ({ type:"receipt",     date:String(r.issued_at||r.created_at||""), d:r, icon:Receipt, color:"#2DD4BF" })),
    ...transactions.map(t => ({ type:"transaction", date:String(t.date||t.created_at||""), d:t,
      icon:DollarSign, color:String(t.type)==="income"?"#34D399":"#F87171" })),
  ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const TABS = [
    { k:"overview",   label:"Overview",   n: null              },
    { k:"timeline",   label:"Timeline",   n: timeline.length   },
    { k:"bookings",   label:"Bookings",   n: bookings.length   },
    { k:"invoices",   label:"Invoices",   n: invoices.length   },
    { k:"receipts",   label:"Receipts",   n: receipts.length   },
    { k:"ledger",     label:"Ledger",     n: transactions.length },
  ];

  const SS: React.CSSProperties = { fontFamily:"'Outfit', system-ui, sans-serif", color: T.text };

  return (
    <div style={{ ...SS, maxWidth: 1060, margin:"0 auto", paddingBottom: 48 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes spin  { to { transform:rotate(360deg); } }
        @keyframes fadeUp{ from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,.4)} 70%{box-shadow:0 0 0 10px rgba(249,115,22,0)} }
        .fade-up   { animation: fadeUp .3s ease both; }
        .tab-btn:hover { background: rgba(255,255,255,.04) !important; color: white !important; }
        .row-hover:hover { background: rgba(255,255,255,.025) !important; }
      `}</style>

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <Link href="/admin/clients" style={{ display:"flex", alignItems:"center", gap:6,
          fontSize:13, color:T.muted, textDecoration:"none", transition:"color .15s" }}
          onMouseEnter={e=>(e.currentTarget.style.color="white")}
          onMouseLeave={e=>(e.currentTarget.style.color=T.muted)}>
          <ArrowLeft style={{ width:15, height:15 }} />All Clients
        </Link>
        <div style={{ display:"flex", gap:8 }}>
          {/* QR code button */}
          <a href="/car-rental-terms" target="_blank"
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px",
              borderRadius:10, background:T.surface, border:`1px solid ${T.border}`,
              color:T.muted, fontSize:12, textDecoration:"none", transition:"all .15s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.color="#A78BFA";(e.currentTarget as HTMLAnchorElement).style.borderColor="rgba(167,139,250,.3)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.color=T.muted;(e.currentTarget as HTMLAnchorElement).style.borderColor=T.border;}}>
            <ExternalLink style={{ width:13, height:13 }} />T&Cs
          </a>
          {/* New Booking */}
          <Link href={`/admin/client-lookup?prefill=${encodeURIComponent(name)}`}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px",
              borderRadius:10, background:T.subtle, border:`1px solid ${T.border}`,
              color:T.muted, fontSize:12, textDecoration:"none" }}>
            <Car style={{ width:13, height:13 }} />New Booking
          </Link>
          {/* Print */}
          <button onClick={handlePrint} disabled={printing}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 18px",
              borderRadius:10, background:T.accent, border:"none", color:"white",
              fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif",
              opacity: printing ? .7 : 1 }}>
            {printing
              ? <><Loader2 style={{ width:13, height:13, animation:"spin 1s linear infinite" }} />Printing…</>
              : <><Printer style={{ width:13, height:13 }} />Print Profile</>}
          </button>
        </div>
      </div>

      {/* ── HERO CARD ─────────────────────────────────────────────────────── */}
      <div className="fade-up" style={{ background: T.surface, border:`1px solid ${T.border}`,
        borderRadius:20, overflow:"hidden", marginBottom:16,
        boxShadow:`0 0 0 1px ${risk.color}18, 0 12px 40px rgba(0,0,0,.5)` }}>

        {/* Accent top bar */}
        <div style={{ height:3, background:`linear-gradient(90deg, ${risk.color}, ${T.accent})` }} />

        <div style={{ padding:"20px 24px", display:"flex", gap:20, alignItems:"flex-start", flexWrap:"wrap" }}>

          {/* Avatar */}
          <div style={{ position:"relative", flexShrink:0 }}>
            <div style={{ width:80, height:80, borderRadius:20,
              background:`linear-gradient(135deg, ${T.accent}, #FB923C)`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:26, fontWeight:800, color:"white", boxShadow:`0 8px 24px rgba(249,115,22,.3)` }}>
              {initials}
            </div>
            <div style={{ position:"absolute", bottom:-2, right:-2, width:24, height:24,
              borderRadius:"50%", background:risk.color, display:"flex", alignItems:"center",
              justifyContent:"center", border:`2px solid ${T.surface}`,
              boxShadow:`0 0 8px ${risk.color}60`, animation:"pulse 2.5s ease infinite" }}>
              <RiskIcon style={{ width:12, height:12, color:"white" }} />
            </div>
          </div>

          {/* Name + meta */}
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <h1 style={{ fontSize:22, fontWeight:800, color:"white", margin:0, letterSpacing:"-.02em" }}>
                {name}
              </h1>
              <span style={{ fontSize:11, fontWeight:700, color:risk.color,
                background:risk.bg, padding:"3px 10px", borderRadius:99,
                border:`1px solid ${risk.color}30`, display:"flex", alignItems:"center", gap:4 }}>
                <RiskIcon style={{ width:10, height:10 }} />{risk.label}
              </span>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:8, alignItems:"center" }}>
              {!!client.phone && (
                <a href={`tel:${client.phone}`} style={{ display:"flex", alignItems:"center",
                  gap:5, fontSize:13, color:T.muted, textDecoration:"none" }}>
                  <Phone style={{ width:12, height:12 }} />{String(client.phone)}
                </a>
              )}
              {!!client.email && (
                <a href={`mailto:${client.email}`} style={{ display:"flex", alignItems:"center",
                  gap:5, fontSize:13, color:T.muted, textDecoration:"none" }}>
                  <Mail style={{ width:12, height:12 }} />{String(client.email)}
                </a>
              )}
              {!!client.nationality && (
                <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:T.muted,
                  background:"rgba(255,255,255,.05)", padding:"2px 10px", borderRadius:99,
                  border:`1px solid ${T.border}` }}>
                  <Globe style={{ width:10, height:10 }} />{String(client.nationality)}
                </span>
              )}
              {!!client.id_type && (
                <span style={{ fontSize:11, color:T.muted, background:"rgba(255,255,255,.04)",
                  padding:"2px 10px", borderRadius:99, border:`1px solid ${T.border}`,
                  textTransform:"uppercase", letterSpacing:".04em" }}>
                  {String(client.id_type).replace(/_/g," ")}
                </span>
              )}
              <span style={{ fontSize:11, color:T.muted }}>
                Member since {fmtDate(String(client.created_at||""))}
              </span>
            </div>
          </div>

          {/* KPI strip */}
          <div style={{ display:"flex", gap:8, flexShrink:0 }}>
            {[
              { label:"Bookings",    v: String(totalBookings),      c:"#38BDF8" },
              { label:"Spent",       v: fmtKES(totalSpent),         c:"#34D399" },
              { label:"Outstanding", v: fmtKES(totalDebt),          c: totalDebt > 0 ? "#F87171" : "#34D399" },
            ].map(({ label, v, c }) => (
              <div key={label} style={{ padding:"10px 14px", background:"rgba(255,255,255,.04)",
                borderRadius:12, textAlign:"center", minWidth:88, border:`1px solid ${T.border}` }}>
                <div style={{ fontSize:16, fontWeight:800, color:c, fontFamily:"'JetBrains Mono',monospace", margin:0 }}>{v}</div>
                <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:".07em", marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* QR code */}
          {qrSrc && (
            <div style={{ flexShrink:0, textAlign:"center" }}>
              <a href="/car-rental-terms" target="_blank" style={{ textDecoration:"none", display:"block" }}>
                <div style={{ background:"white", padding:6, borderRadius:10, display:"inline-block",
                  border:`1px solid rgba(255,255,255,.1)`, boxShadow:"0 4px 16px rgba(0,0,0,.4)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrSrc} alt="QR — Car Rental T&Cs" style={{ width:72, height:72, display:"block", borderRadius:4 }} />
                </div>
              </a>
              <div style={{ fontSize:9, color:T.muted, marginTop:4, lineHeight:1.3 }}>
                Scan · Car Rental<br/>T&Cs
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── TABS ──────────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", gap:3, marginBottom:16, overflowX:"auto", padding:"0 0 2px" }}>
        {TABS.map(t => (
          <button key={t.k} className="tab-btn" onClick={() => setTab(t.k as typeof tab)}
            style={{ padding:"8px 16px", borderRadius:10, border:"none", cursor:"pointer",
              background: tab===t.k ? "rgba(249,115,22,.15)" : "transparent",
              color: tab===t.k ? T.accent : T.muted,
              fontSize:13, fontWeight:tab===t.k ? 700 : 500,
              outline: tab===t.k ? `1px solid rgba(249,115,22,.3)` : "none",
              fontFamily:"'Outfit',sans-serif", whiteSpace:"nowrap", transition:"all .15s",
              display:"flex", alignItems:"center", gap:6 }}>
            {t.label}
            {t.n !== null && t.n > 0 && (
              <span style={{ fontSize:10, background:"rgba(255,255,255,.1)", color:T.muted,
                padding:"1px 6px", borderRadius:99 }}>{t.n}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="fade-up" style={{ display:"grid", gap:14, gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))" }}>

          {/* Personal */}
          <Sec title="Personal Details" icon={User} accent="#38BDF8">
            <FR icon={Phone}     label="Primary Phone"   value={String(client.phone||"")} />
            <FR icon={Phone}     label="Alternative"     value={String(client.alternative_phone||"")} />
            <FR icon={Mail}      label="Email"           value={String(client.email||"")} />
            <FR icon={MapPin}    label="Residence"       value={String(client.residence||"")} />
            <FR icon={Briefcase} label="Place of Work"   value={String(client.place_of_work||"")} />
            <FR icon={Globe}     label="Nationality"     value={String(client.nationality||"")} />
          </Sec>

          {/* Identity */}
          <Sec title="Identity & Documents" icon={CreditCard} accent="#A78BFA">
            <FR icon={Hash}     label="ID / Passport No." value={String(client.id_number||"")}                 mono />
            <FR icon={CreditCard} label="KRA PIN"         value={String(client.kra_pin||"")}  accent="#F97316" mono />
            <FR icon={Car}      label="Driving License"   value={String(client.driving_license_number||"")}    mono />
            {!!client.next_of_kin_name && (
              <div style={{ marginTop:10, padding:"10px 12px", background:"rgba(167,139,250,.08)",
                borderRadius:10, border:"1px solid rgba(167,139,250,.15)" }}>
                <div style={{ fontSize:10, color:"#A78BFA", textTransform:"uppercase", letterSpacing:".07em", fontWeight:700, marginBottom:6 }}>
                  Next of Kin
                </div>
                <div style={{ fontSize:13, color:"white" }}>{String(client.next_of_kin_name)}</div>
                {!!client.next_of_kin_phone && (
                  <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>
                    {String(client.next_of_kin_phone)}
                    {!!client.next_of_kin_relationship && ` · ${String(client.next_of_kin_relationship)}`}
                  </div>
                )}
              </div>
            )}
          </Sec>

          {/* Car Rental T&C QR */}
          <Sec title="Car Rental — Scan for T&Cs" icon={QrCode} accent="#C084FC">
            <div style={{ display:"flex", gap:16, alignItems:"center" }}>
              {qrSrc ? (
                <a href="/car-rental-terms" target="_blank" style={{ textDecoration:"none", flexShrink:0 }}>
                  <div style={{ background:"white", padding:8, borderRadius:12, border:`1px solid ${T.border}`,
                    boxShadow:"0 4px 24px rgba(0,0,0,.4)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrSrc} alt="QR" style={{ width:110, height:110, display:"block", borderRadius:4 }} />
                  </div>
                </a>
              ) : (
                <div style={{ width:126, height:126, background:T.elevated, borderRadius:12, display:"flex",
                  alignItems:"center", justifyContent:"center" }}>
                  <Loader2 style={{ width:24, height:24, color:T.muted, animation:"spin 1s linear infinite" }} />
                </div>
              )}
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:"white", fontWeight:600, marginBottom:8 }}>
                  Car Rental Terms & Conditions
                </div>
                <div style={{ fontSize:11, color:T.muted, lineHeight:1.7 }}>
                  Ask the client to scan this QR code to read the full hire agreement terms and conditions before signing.
                </div>
                <a href="/car-rental-terms" target="_blank"
                  style={{ display:"inline-flex", alignItems:"center", gap:5, marginTop:10,
                    fontSize:12, color:"#C084FC", textDecoration:"none", fontWeight:600 }}>
                  <ExternalLink style={{ width:12, height:12 }} />View Terms Page
                </a>
              </div>
            </div>
          </Sec>

          {/* Biometrics if any */}
          {(!!client.fingerprint_right_url || !!client.fingerprint_left_url || !!client.passport_photo_url) && (
            <Sec title="Biometrics & Photos" icon={Fingerprint} accent="#C084FC">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(90px, 1fr))", gap:10 }}>
                {[
                  { src: String(client.fingerprint_right_url||""), label:"Right Thumb",  fp:true  },
                  { src: String(client.fingerprint_left_url||""),  label:"Left Thumb",   fp:true  },
                  { src: String(client.passport_photo_url||""),    label:"Passport",     fp:false },
                  { src: String(client.id_photo_url||""),          label:"ID Front",     fp:false },
                  { src: String(client.id_photo_back_url||""),     label:"ID Back",      fp:false },
                  { src: String(client.driving_license_url||""),   label:"DL Front",     fp:false },
                ].filter(x => x.src).map(({ src, label, fp }) => (
                  <div key={label} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:".07em" }}>{label}</div>
                    {fp || src.startsWith("bio_") ? (
                      <div style={{ height:70, borderRadius:8, background:"rgba(168,85,247,.1)",
                        border:"1px solid rgba(168,85,247,.2)", display:"flex", flexDirection:"column",
                        alignItems:"center", justifyContent:"center", gap:3 }}>
                        <Fingerprint style={{ width:20, height:20, color:"#A855F7" }} />
                        <span style={{ fontSize:8, color:"#A855F7", fontWeight:700 }}>CAPTURED</span>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt={label} style={{ width:"100%", height:70, objectFit:"cover",
                        borderRadius:8, border:`1px solid ${T.border}` }} />
                    )}
                  </div>
                ))}
              </div>
            </Sec>
          )}

          {/* Services used */}
          {Object.keys(svcBreak).length > 0 && (
            <Sec title="Services Used" icon={Star} accent="#FBBF24">
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {Object.entries(svcBreak).map(([k, count]) => {
                  const s = SVC[k];
                  const Icon = s?.icon || Package;
                  const color = s?.color || "#94A3B8";
                  return (
                    <div key={k} style={{ display:"flex", alignItems:"center", gap:8,
                      padding:"8px 12px", background:`${color}10`, borderRadius:10,
                      border:`1px solid ${color}20` }}>
                      <Icon style={{ width:15, height:15, color, flexShrink:0 }} />
                      <div>
                        <div style={{ fontSize:14, fontWeight:800, color, lineHeight:1, fontFamily:"'JetBrains Mono',monospace" }}>{count}×</div>
                        <div style={{ fontSize:10, color:T.muted, textTransform:"capitalize" }}>{k.replace(/-/g," ")}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Sec>
          )}

          {/* Notes */}
          {!!client.notes && (
            <Sec title="Notes" icon={FileText} accent="#FB923C">
              <p style={{ fontSize:13, color:"#CBD5E1", lineHeight:1.7, margin:0 }}>
                {String(client.notes)}
              </p>
            </Sec>
          )}
        </div>
      )}

      {/* ── TIMELINE ──────────────────────────────────────────────────────── */}
      {tab === "timeline" && (
        <div className="fade-up" style={{ background:T.surface, border:`1px solid ${T.border}`,
          borderRadius:16, padding:"16px 20px" }}>
          {timeline.length === 0 ? (
            <p style={{ color:T.muted, textAlign:"center", padding:"48px 0", fontSize:14 }}>No activity recorded yet</p>
          ) : (
            <div style={{ position:"relative" }}>
              <div style={{ position:"absolute", left:15, top:4, bottom:4, width:1, background:T.border }} />
              {timeline.map((item, i) => {
                const Icon = item.icon;
                let title = "", sub = "", amt = "", status = "";
                if (item.type==="booking")     { title=`${String(item.d.service_type||"").replace(/-/g," ")} Booking`; amt=fmtKES(Number(item.d.total_amount||0)); status=String(item.d.status||""); sub=String(item.d.booking_ref||""); }
                if (item.type==="invoice")     { title=`Invoice ${String(item.d.invoice_number||"")}`;  amt=fmtKES(Number(item.d.total||0)); status=String(item.d.status||""); }
                if (item.type==="receipt")     { title=`Receipt ${String(item.d.receipt_number||"")}`;  amt=fmtKES(Number(item.d.total_amount||0)); status="issued"; }
                if (item.type==="transaction") { title=String(item.d.description||"Transaction"); sub=String(item.d.category||""); amt=(String(item.d.type)==="income"?"+":"-")+fmtKES(Number(item.d.amount||0)); status=String(item.d.status||""); }
                return (
                  <div key={i} style={{ display:"flex", gap:14, paddingBottom:18 }}>
                    <div style={{ width:30, height:30, borderRadius:"50%", background:T.elevated,
                      border:`1px solid ${item.color}30`, display:"flex", alignItems:"center",
                      justifyContent:"center", flexShrink:0, zIndex:1 }}>
                      <Icon style={{ width:13, height:13, color:item.color }} />
                    </div>
                    <div style={{ flex:1, paddingTop:4 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
                        <div>
                          <div style={{ fontSize:13, color:"white", fontWeight:600, textTransform:"capitalize" }}>{title}</div>
                          {sub && <div style={{ fontSize:10, color:T.muted, marginTop:1, fontFamily:"'JetBrains Mono',monospace" }}>{sub}</div>}
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0 }}>
                          {amt && <div style={{ fontSize:13, fontWeight:700, color:item.type==="transaction"&&String(item.d.type)==="expense"?"#F87171":"#34D399" }}>{amt}</div>}
                          {status && <Pill status={status} />}
                        </div>
                      </div>
                      <div style={{ fontSize:10, color:"#475569", marginTop:4 }}>{fmtDT(item.date)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── BOOKINGS ──────────────────────────────────────────────────────── */}
      {tab === "bookings" && (
        <div className="fade-up" style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:14, fontWeight:700, color:"white" }}>All Bookings ({bookings.length})</span>
            <span style={{ fontSize:12, color:T.muted }}>Total spent: <span style={{ color:"#34D399", fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{fmtKES(totalSpent)}</span></span>
          </div>
          {bookings.length === 0
            ? <p style={{ color:T.muted, textAlign:"center", padding:"48px 0", fontSize:14 }}>No bookings found</p>
            : bookings.map((b, i) => {
              const s = SVC[String(b.service_type||"")] || { icon:Car, color:"#94A3B8" };
              const Icon = s.icon;
              return (
                <Row key={i}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`${s.color}15`,
                    border:`1px solid ${s.color}22`, display:"flex", alignItems:"center",
                    justifyContent:"center", flexShrink:0 }}>
                    <Icon style={{ width:16, height:16, color:s.color }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <span style={{ fontSize:13, fontWeight:600, color:s.color, textTransform:"capitalize" }}>
                        {String(b.service_type||"").replace(/-/g," ")}
                      </span>
                      <Pill status={String(b.status||"")} />
                      {!!b.booking_ref && (
                        <span style={{ fontSize:10, color:T.accent, fontFamily:"'JetBrains Mono',monospace" }}>
                          {String(b.booking_ref)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize:11, color:T.muted, marginTop:3 }}>{fmtDate(String(b.created_at||""))}</div>
                  </div>
                  <div style={{ fontSize:15, fontWeight:800, color:"#34D399", flexShrink:0, fontFamily:"'JetBrains Mono',monospace" }}>
                    {fmtKES(Number(b.total_amount||0))}
                  </div>
                </Row>
              );
            })}
        </div>
      )}

      {/* ── INVOICES ──────────────────────────────────────────────────────── */}
      {tab === "invoices" && (
        <div className="fade-up" style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:14, fontWeight:700, color:"white" }}>Invoices ({invoices.length})</span>
            {totalDebt > 0 && <span style={{ fontSize:12, color:"#F87171" }}>Outstanding: <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{fmtKES(totalDebt)}</span></span>}
          </div>
          {invoices.length === 0
            ? <p style={{ color:T.muted, textAlign:"center", padding:"48px 0", fontSize:14 }}>No invoices found</p>
            : invoices.map((inv, i) => {
              const bal = Number(inv.total||0) - Number(inv.amount_paid||0);
              return (
                <Row key={i}>
                  <FileText style={{ width:20, height:20, color:"#FB923C", flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                      <span style={{ fontSize:13, color:"white", fontFamily:"'JetBrains Mono',monospace" }}>{String(inv.invoice_number||"")}</span>
                      <Pill status={String(inv.status||"")} />
                    </div>
                    <div style={{ fontSize:11, color:T.muted, marginTop:3 }}>Due: {fmtDate(String(inv.due_date||""))}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:"white", fontFamily:"'JetBrains Mono',monospace" }}>{fmtKES(Number(inv.total||0))}</div>
                    {Number(inv.amount_paid) > 0 && <div style={{ fontSize:11, color:"#34D399" }}>Paid {fmtKES(Number(inv.amount_paid))}</div>}
                    {bal > 0 && <div style={{ fontSize:11, color:"#F87171" }}>Bal {fmtKES(bal)}</div>}
                  </div>
                </Row>
              );
            })}
        </div>
      )}

      {/* ── RECEIPTS ──────────────────────────────────────────────────────── */}
      {tab === "receipts" && (
        <div className="fade-up" style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontSize:14, fontWeight:700, color:"white" }}>Receipts ({receipts.length})</span>
          </div>
          {receipts.length === 0
            ? <p style={{ color:T.muted, textAlign:"center", padding:"48px 0", fontSize:14 }}>No receipts found</p>
            : receipts.map((r, i) => (
              <Row key={i}>
                <Receipt style={{ width:20, height:20, color:"#2DD4BF", flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, color:"white", fontFamily:"'JetBrains Mono',monospace" }}>{String(r.receipt_number||"")}</div>
                  <div style={{ fontSize:11, color:T.muted, marginTop:3, textTransform:"capitalize" }}>
                    {String(r.service_type||"")} · {fmtDate(String(r.issued_at||r.created_at||""))}
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:15, fontWeight:800, color:"#34D399", fontFamily:"'JetBrains Mono',monospace" }}>{fmtKES(Number(r.total_amount||0))}</div>
                  <div style={{ fontSize:11, color:T.muted, textTransform:"capitalize" }}>{String(r.payment_method||"")}</div>
                </div>
              </Row>
            ))}
        </div>
      )}

      {/* ── LEDGER ────────────────────────────────────────────────────────── */}
      {tab === "ledger" && (
        <div className="fade-up" style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:14, fontWeight:700, color:"white" }}>Transaction Ledger ({transactions.length})</span>
            <span style={{ fontSize:12, color:T.muted }}>
              Net: <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
                color: transactions.reduce((s,t)=>s+(String(t.type)==="income"?Number(t.amount||0):-Number(t.amount||0)),0) >= 0 ? "#34D399" : "#F87171" }}>
                {fmtKES(transactions.reduce((s,t)=>s+(String(t.type)==="income"?Number(t.amount||0):-Number(t.amount||0)),0))}
              </span>
            </span>
          </div>
          {transactions.length === 0
            ? <p style={{ color:T.muted, textAlign:"center", padding:"48px 0", fontSize:14 }}>No transactions found</p>
            : transactions.map((t, i) => {
              const income = String(t.type) === "income";
              return (
                <Row key={i}>
                  <div style={{ width:34, height:34, borderRadius:10, background:income?"rgba(52,211,153,.1)":"rgba(248,113,113,.1)",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <DollarSign style={{ width:14, height:14, color:income?"#34D399":"#F87171" }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, color:"white" }}>{String(t.description||"")}</div>
                    <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{String(t.category||"")} · {String(t.date||"")}</div>
                  </div>
                  <div style={{ fontSize:15, fontWeight:800, color:income?"#34D399":"#F87171",
                    fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>
                    {income?"+":"-"}{fmtKES(Number(t.amount||0))}
                  </div>
                </Row>
              );
            })}
        </div>
      )}

    </div>
  );
}
