"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, Phone, Mail, MapPin, Briefcase, CreditCard,
  FileText, Receipt, DollarSign, Car, Compass, Plane, Truck,
  Bus, Wrench, Package, Ship, HardHat, ShieldCheck, ShieldAlert,
  ShieldX, Calendar, TrendingUp, Clock, AlertCircle, Building2,
  Loader2, Activity, Edit, Printer, Fingerprint, Camera, Globe,
  Users, ChevronRight, Hash, Star, MoreHorizontal, Download,
  CheckCircle2, XCircle, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtKES = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtDateTime = (d: string) =>
  d ? new Date(d).toLocaleString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

// ─── Service icons ─────────────────────────────────────────────────────────────
const SVC_ICON: Record<string, LucideIcon> = {
  "car-rental": Car, "safari-tours": Compass, "transfers": Plane,
  "hotel-airport-transfers": Plane, "movers": Truck, "corporate-rental": Bus,
  "road-recovery": Wrench, "cargo-handling": Package, "shipment-imports": Ship,
  "construction-equipment": HardHat, "sublet": Building2,
};
const SVC_COLOR: Record<string, string> = {
  "car-rental": "#818CF8", "safari-tours": "#FBBF24", "transfers": "#38BDF8",
  "hotel-airport-transfers": "#38BDF8", "movers": "#A78BFA", "corporate-rental": "#C084FC",
  "road-recovery": "#FB7185", "cargo-handling": "#FB923C", "shipment-imports": "#60A5FA",
  "construction-equipment": "#FACC15",
};
const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  pending:      { bg: "rgba(234,179,8,.12)",   text: "#EAB308"  },
  confirmed:    { bg: "rgba(59,130,246,.12)",   text: "#60A5FA"  },
  "in-progress":{ bg: "rgba(168,85,247,.12)",   text: "#C084FC"  },
  completed:    { bg: "rgba(52,211,153,.12)",   text: "#34D399"  },
  cancelled:    { bg: "rgba(248,113,113,.12)",  text: "#F87171"  },
  paid:         { bg: "rgba(52,211,153,.12)",   text: "#34D399"  },
  draft:        { bg: "rgba(100,116,139,.12)",  text: "#94A3B8"  },
  sent:         { bg: "rgba(59,130,246,.12)",   text: "#60A5FA"  },
  partial:      { bg: "rgba(251,191,36,.12)",   text: "#FBBF24"  },
  overdue:      { bg: "rgba(248,113,113,.12)",  text: "#F87171"  },
  issued:       { bg: "rgba(45,212,191,.12)",   text: "#2DD4BF"  },
  active:       { bg: "rgba(52,211,153,.12)",   text: "#34D399"  },
};
const RISK = {
  high:    { label: "High Risk",    color: "#F87171", icon: ShieldX     },
  medium:  { label: "Medium Risk",  color: "#FBBF24", icon: ShieldAlert },
  low:     { label: "Verified",     color: "#34D399", icon: ShieldCheck },
};

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || { bg: "rgba(100,116,139,.12)", text: "#94A3B8" };
  return (
    <span style={{ background: s.bg, color: s.text, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, textTransform: "uppercase", letterSpacing: ".05em" }}>
      {status}
    </span>
  );
}

// ─── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, mono, color }: {
  icon: LucideIcon; label: string; value: string; mono?: boolean; color?: string;
}) {
  if (!value || value === "—" || value === "undefined") return null;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
      <Icon style={{ width: 15, height: 15, color: "#64748B", marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 1 }}>{label}</p>
        <p style={{ fontSize: 13, color: color || "white", fontFamily: mono ? "'JetBrains Mono', monospace" : undefined, wordBreak: "break-all" }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Section card ──────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, color, children, action }: {
  title: string; icon: LucideIcon; color: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div style={{
      background: "#0B1220", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16,
      overflow: "hidden", boxShadow: `0 0 0 1px ${color}15, 0 4px 16px rgba(0,0,0,.3)`,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.06)",
        background: `linear-gradient(90deg, ${color}10 0%, transparent 60%)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon style={{ width: 14, height: 14, color }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: ".06em" }}>{title}</span>
        </div>
        {action}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

// ─── Photo box ────────────────────────────────────────────────────────────────
function PhotoBox({ src, label }: { src?: string; label: string }) {
  if (!src) return null;
  const isFingerprint = src.startsWith("bio_") || src.startsWith("fingerprint_");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <p style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</p>
      {isFingerprint ? (
        <div style={{ height: 72, borderRadius: 10, background: "rgba(168,85,247,.1)", border: "1px solid rgba(168,85,247,.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <Fingerprint style={{ width: 24, height: 24, color: "#A855F7" }} />
          <span style={{ fontSize: 9, color: "#A855F7", fontWeight: 600 }}>CAPTURED</span>
        </div>
      ) : (
        <img src={src} alt={label} style={{ width: "100%", height: 72, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)" }} />
      )}
    </div>
  );
}

// ─── Print function ───────────────────────────────────────────────────────────
function buildPrintHTML(client: Record<string,unknown>, summary: Record<string,unknown>, bookings: Record<string,unknown>[], invoices: Record<string,unknown>[]) {
  const name      = String(client.full_name   || "Unknown");
  const id        = String(client.id_number   || "—");
  const phone     = String(client.phone       || "—");
  const email     = String(client.email       || "—");
  const residence = String(client.residence   || "—");
  const work      = String(client.place_of_work || "—");
  const kra       = String(client.kra_pin     || "—");
  const dl        = String(client.driving_license_number || "—");
  const risk      = String(client.risk_level  || "low");
  const nationality = String(client.nationality || "—");
  const totalBookings = Number(summary.totalBookings || 0);
  const totalSpent    = Number(summary.totalSpent    || 0);
  const totalDebt     = Number(summary.totalDebt     || 0);

  const bookingRows = bookings.map(b => `
    <tr>
      <td>${String(b.booking_ref || b.id || "").slice(0,12)}</td>
      <td>${String(b.service_type || "").replace(/-/g," ")}</td>
      <td style="color:${(STATUS_STYLE[String(b.status||"")]||{text:"#888"}).text}">${String(b.status || "")}</td>
      <td style="text-align:right">${fmtKES(Number(b.total_amount || 0))}</td>
      <td>${fmtDate(String(b.created_at || ""))}</td>
    </tr>`).join("");

  const invoiceRows = invoices.map(i => `
    <tr>
      <td>${String(i.invoice_number || "")}</td>
      <td style="color:${(STATUS_STYLE[String(i.status||"")]||{text:"#888"}).text}">${String(i.status || "")}</td>
      <td style="text-align:right">${fmtKES(Number(i.total || 0))}</td>
      <td style="text-align:right;color:#34D399">${fmtKES(Number(i.amount_paid || 0))}</td>
      <td style="text-align:right;color:${Number(i.total||0)-Number(i.amount_paid||0) > 0 ? "#F87171" : "#34D399"}">${fmtKES(Number(i.total||0)-Number(i.amount_paid||0))}</td>
      <td>${fmtDate(String(i.due_date || ""))}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html><head>
<title>Client Profile — ${name}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',Arial,sans-serif; background:#fff; color:#1a1a1a; }
  .header { background:#050A14; color:white; padding:24px 32px; display:flex; align-items:center; justify-content:space-between; }
  .header-brand { display:flex; align-items:center; gap:12px; }
  .brand-name { font-size:20px; font-weight:700; color:white; letter-spacing:-.01em; }
  .brand-sub  { font-size:10px; color:#F97316; text-transform:uppercase; letter-spacing:.15em; }
  .header-meta { text-align:right; font-size:11px; color:#94A3B8; }
  .accent-bar { height:3px; background:linear-gradient(90deg,#F97316,#FB923C); }
  .body { padding:24px 32px; }
  .profile-hero { display:flex; align-items:center; gap:20px; padding:20px; background:#F8FAFC; border-radius:12px; margin-bottom:24px; border:1px solid #E2E8F0; }
  .avatar { width:64px; height:64px; border-radius:16px; background:#F97316; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:700; color:white; flex-shrink:0; }
  .hero-name { font-size:22px; font-weight:700; color:#0F172A; }
  .hero-meta { font-size:12px; color:#64748B; margin-top:4px; display:flex; gap:12px; flex-wrap:wrap; }
  .risk-badge { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:600; padding:3px 10px; border-radius:99px; }
  .risk-low  { background:#D1FAE5; color:#065F46; }
  .risk-mid  { background:#FEF3C7; color:#92400E; }
  .risk-high { background:#FEE2E2; color:#991B1B; }
  .kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:24px; }
  .kpi { padding:14px; background:#F8FAFC; border-radius:10px; border:1px solid #E2E8F0; text-align:center; }
  .kpi-val { font-size:20px; font-weight:700; color:#0F172A; }
  .kpi-val-green { font-size:20px; font-weight:700; color:#065F46; }
  .kpi-val-red   { font-size:20px; font-weight:700; color:#991B1B; }
  .kpi-label { font-size:10px; color:#94A3B8; text-transform:uppercase; letter-spacing:.08em; margin-top:2px; }
  .section { margin-bottom:24px; }
  .section-title { font-size:11px; font-weight:700; color:#F97316; text-transform:uppercase; letter-spacing:.1em; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid #FED7AA; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; }
  .info-row { display:flex; gap:8px; padding:7px 0; border-bottom:1px solid #F1F5F9; }
  .info-label { font-size:10px; color:#94A3B8; text-transform:uppercase; letter-spacing:.06em; width:120px; flex-shrink:0; padding-top:1px; }
  .info-val { font-size:12px; color:#1E293B; font-weight:500; word-break:break-all; }
  .info-mono { font-family:monospace; font-size:11px; }
  table { width:100%; border-collapse:collapse; font-size:12px; }
  th { background:#F8FAFC; color:#64748B; text-transform:uppercase; font-size:9px; letter-spacing:.08em; padding:8px 10px; text-align:left; border-bottom:2px solid #E2E8F0; }
  td { padding:8px 10px; border-bottom:1px solid #F1F5F9; color:#1E293B; }
  tr:last-child td { border-bottom:none; }
  .footer { background:#F8FAFC; border-top:1px solid #E2E8F0; padding:12px 32px; display:flex; justify-content:space-between; font-size:10px; color:#94A3B8; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head><body>
<div class="header">
  <div class="header-brand">
    <div>
      <div class="brand-name">MOVENTRA</div>
      <div class="brand-sub">Safaris & Logistics Ltd</div>
    </div>
  </div>
  <div class="header-meta">
    <div>Client Profile Report</div>
    <div>Printed: ${new Date().toLocaleString("en-KE")}</div>
    <div>Muthaiga Square, Nairobi · +254 727 247 032</div>
  </div>
</div>
<div class="accent-bar"></div>
<div class="body">

  <div class="profile-hero">
    <div class="avatar">${name.slice(0,2).toUpperCase()}</div>
    <div style="flex:1">
      <div class="hero-name">${name}</div>
      <div class="hero-meta">
        <span>${phone}</span>
        ${email !== "—" ? `<span>${email}</span>` : ""}
        <span class="risk-badge ${risk==="high"?"risk-high":risk==="medium"?"risk-mid":"risk-low"}">${risk==="high"?"⚠ High Risk":risk==="medium"?"~ Medium Risk":"✓ Verified"}</span>
      </div>
    </div>
    <div style="text-align:right;font-size:11px;color:#94A3B8">
      <div>Since ${fmtDate(String(client.created_at||""))}</div>
      ${nationality !== "—" ? `<div>${nationality}</div>` : ""}
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-val">${totalBookings}</div><div class="kpi-label">Total Bookings</div></div>
    <div class="kpi"><div class="kpi-val-green">${fmtKES(totalSpent)}</div><div class="kpi-label">Total Spent</div></div>
    <div class="kpi"><div class="${totalDebt>0?"kpi-val-red":"kpi-val-green"}">${fmtKES(totalDebt)}</div><div class="kpi-label">Outstanding Balance</div></div>
  </div>

  <div class="section">
    <div class="section-title">Personal Information</div>
    <div class="info-grid">
      <div>
        ${[["Phone",phone],["Alt Phone",String(client.alternative_phone||"—")],["Email",email],["Nationality",nationality]].map(([l,v])=>v&&v!=="—"?`<div class="info-row"><div class="info-label">${l}</div><div class="info-val">${v}</div></div>`:``).join("")}
      </div>
      <div>
        ${[["Residence",residence],["Place of Work",work],["ID Number",id],["KRA PIN",kra],["Driving License",dl]].map(([l,v])=>v&&v!=="—"?`<div class="info-row"><div class="info-label">${l}</div><div class="info-val info-mono">${v}</div></div>`:``).join("")}
      </div>
    </div>
  </div>

  ${bookings.length > 0 ? `
  <div class="section">
    <div class="section-title">Booking History (${bookings.length})</div>
    <table>
      <thead><tr><th>Ref</th><th>Service</th><th>Status</th><th style="text-align:right">Amount</th><th>Date</th></tr></thead>
      <tbody>${bookingRows}</tbody>
    </table>
  </div>` : ""}

  ${invoices.length > 0 ? `
  <div class="section">
    <div class="section-title">Invoices (${invoices.length})</div>
    <table>
      <thead><tr><th>Invoice No.</th><th>Status</th><th style="text-align:right">Total</th><th style="text-align:right">Paid</th><th style="text-align:right">Balance</th><th>Due Date</th></tr></thead>
      <tbody>${invoiceRows}</tbody>
    </table>
  </div>` : ""}

</div>
<div class="footer">
  <span>Moventra Safaris & Logistics Ltd · Muthaiga Square, off Thika Road, Nairobi</span>
  <span>info@moventrasafarislogisticsltd.com · +254 727 247 032</span>
</div>
</body></html>`;
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ClientProfilePage() {
  const params = useParams();
  const id     = params.id as string;
  const [data,    setData]    = useState<Record<string,unknown>|null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [tab, setTab] = useState<"overview"|"timeline"|"bookings"|"invoices"|"receipts"|"transactions">("overview");

  useEffect(() => {
    fetch(`/api/client-profile?id=${id}`)
      .then(r => r.json())
      .then(d  => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load client profile"); setLoading(false); });
  }, [id]);

  const handlePrint = () => {
    if (!data) return;
    const html = buildPrintHTML(
      data.client as Record<string,unknown> || {},
      data.summary as Record<string,unknown> || {},
      (data.bookings as Record<string,unknown>[]) || [],
      (data.invoices as Record<string,unknown>[]) || [],
    );
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) { toast.error("Please allow popups for printing"); return; }
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 500);
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display:"flex", height:"60vh", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
      <Loader2 style={{ width:32, height:32, color:"#F97316", animation:"spin 1s linear infinite" }} />
      <p style={{ color:"#64748B", fontSize:14 }}>Loading client profile...</p>
    </div>
  );

  if (error || !data?.client) return (
    <div style={{ display:"flex", height:"60vh", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <AlertCircle style={{ width:40, height:40, color:"#F87171" }} />
      <p style={{ color:"#94A3B8" }}>{error || "Client not found"}</p>
      <Link href="/admin/clients" style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, color:"#94A3B8", textDecoration:"none" }}>
        <ArrowLeft style={{ width:14, height:14 }} />Back to Clients
      </Link>
    </div>
  );

  const client  = data.client as Record<string,unknown>;
  const summary = (data.summary as Record<string,unknown>) || {};
  const bookings     = (data.bookings     as Record<string,unknown>[]) || [];
  const invoices     = (data.invoices     as Record<string,unknown>[]) || [];
  const receipts     = (data.receipts     as Record<string,unknown>[]) || [];
  const transactions = (data.transactions as Record<string,unknown>[]) || [];
  const svcBreakdown = (summary.serviceBreakdown as Record<string,number>) || {};

  const riskKey = (String(client.risk_level || "low") as keyof typeof RISK);
  const risk    = RISK[riskKey] || RISK.low;
  const RiskIcon = risk.icon;

  const totalBookings = Number(summary.totalBookings || 0);
  const totalSpent    = Number(summary.totalSpent    || 0);
  const totalDebt     = Number(summary.totalDebt     || 0);
  const name          = String(client.full_name || "Unknown Client");
  const initials      = name.split(" ").slice(0,2).map((w: string) => w[0]).join("").toUpperCase();

  const timeline = [
    ...bookings.map(b => ({ type:"booking", date:String(b.created_at||""), d:b, icon:SVC_ICON[String(b.service_type||"")]||Package, color:SVC_COLOR[String(b.service_type||"")] || "#94A3B8" })),
    ...invoices.map(i => ({ type:"invoice", date:String(i.created_at||""), d:i, icon:FileText, color:"#FB923C" })),
    ...receipts.map(r => ({ type:"receipt", date:String(r.created_at||r.issued_at||""), d:r, icon:Receipt, color:"#2DD4BF" })),
    ...transactions.map(t => ({ type:"transaction", date:String(t.date||t.created_at||""), d:t, icon:DollarSign, color: String(t.type)==="income"?"#34D399":"#F87171" })),
  ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const TABS = [
    { key:"overview",     label:"Overview",     count: null          },
    { key:"timeline",     label:"Timeline",     count: timeline.length },
    { key:"bookings",     label:"Bookings",     count: bookings.length },
    { key:"invoices",     label:"Invoices",     count: invoices.length },
    { key:"receipts",     label:"Receipts",     count: receipts.length },
    { key:"transactions", label:"Ledger",       count: transactions.length },
  ];

  const S: React.CSSProperties = { fontFamily:"'Outfit', system-ui, sans-serif" };

  return (
    <div style={{ ...S, maxWidth:1100, margin:"0 auto", paddingBottom:40 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp .3s ease both; }
        .profile-tab-btn:hover { background:rgba(255,255,255,.05)!important; color:white!important; }
        .list-row:hover { background:rgba(255,255,255,.04)!important; }
      `}</style>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <Link href="/admin/clients" style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:"#64748B", textDecoration:"none" }}
          onMouseEnter={e=>(e.currentTarget.style.color="white")} onMouseLeave={e=>(e.currentTarget.style.color="#64748B")}>
          <ArrowLeft style={{ width:14, height:14 }} />Clients
        </Link>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={handlePrint}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", color:"#94A3B8", fontSize:13, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color="white";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color="#94A3B8";}}>
            <Printer style={{ width:14, height:14 }} />Print Profile
          </button>
          <Link href={`/admin/client-lookup?prefill=${encodeURIComponent(name)}`}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 16px", borderRadius:10, background:"#F97316", color:"white", fontSize:13, fontWeight:600, textDecoration:"none" }}>
            <Car style={{ width:14, height:14 }} />New Booking
          </Link>
        </div>
      </div>

      {/* ── Hero card ────────────────────────────────────────────────────── */}
      <div className="fade-up" style={{
        background:"#0B1220", border:"1px solid rgba(255,255,255,.07)", borderRadius:20, overflow:"hidden",
        marginBottom:16, boxShadow:`0 0 0 1px ${risk.color}20, 0 8px 32px rgba(0,0,0,.4)`,
      }}>
        {/* Orange top accent */}
        <div style={{ height:3, background:`linear-gradient(90deg, #F97316, ${risk.color})` }} />

        <div style={{ padding:"20px 24px", display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
          {/* Avatar */}
          <div style={{ position:"relative", flexShrink:0 }}>
            <div style={{ width:72, height:72, borderRadius:18, background:`linear-gradient(135deg, #F97316, #FB923C)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:700, color:"white" }}>
              {initials}
            </div>
            <div style={{ position:"absolute", bottom:-2, right:-2, width:22, height:22, borderRadius:"50%", background:risk.color, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #0B1220" }}>
              <RiskIcon style={{ width:11, height:11, color:"white" }} />
            </div>
          </div>

          {/* Name + badges */}
          <div style={{ flex:1, minWidth:200 }}>
            <h1 style={{ fontSize:22, fontWeight:700, color:"white", margin:0, letterSpacing:"-.01em" }}>{name}</h1>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:6, alignItems:"center" }}>
              <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, fontWeight:600, color:risk.color, background:`${risk.color}15`, padding:"2px 10px", borderRadius:99, border:`1px solid ${risk.color}30` }}>
                <RiskIcon style={{ width:10, height:10 }} />{risk.label}
              </span>
              {!!client.nationality && (
                <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#94A3B8", background:"rgba(255,255,255,.05)", padding:"2px 10px", borderRadius:99, border:"1px solid rgba(255,255,255,.1)" }}>
                  <Globe style={{ width:10, height:10 }} />{String(client.nationality||"")}
                </span>
              )}
              {!!client.id_type && (
                <span style={{ fontSize:11, color:"#64748B", background:"rgba(255,255,255,.04)", padding:"2px 10px", borderRadius:99, border:"1px solid rgba(255,255,255,.08)", textTransform:"uppercase", letterSpacing:".04em" }}>
                  {String(client.id_type||"").replace(/_/g," ")}
                </span>
              )}
              <span style={{ fontSize:11, color:"#64748B" }}>
                Client since {fmtDate(String(client.created_at||""))}
              </span>
            </div>
            {!!client.phone && (
              <div style={{ display:"flex", gap:16, marginTop:6, flexWrap:"wrap" }}>
                <a href={`tel:${String(client.phone||"")}`} style={{ display:"flex", alignItems:"center", gap:5, fontSize:13, color:"#94A3B8", textDecoration:"none" }}>
                  <Phone style={{ width:12, height:12 }} />{String(client.phone||"")}
                </a>
                {!!client.email && (
                  <a href={`mailto:${String(client.email||"")}`} style={{ display:"flex", alignItems:"center", gap:5, fontSize:13, color:"#94A3B8", textDecoration:"none" }}>
                    <Mail style={{ width:12, height:12 }} />{String(client.email||"")}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* KPI mini strip */}
          <div style={{ display:"flex", gap:2, flexShrink:0 }}>
            {[
              { label:"Bookings",  value:totalBookings,         color:"#38BDF8", fmt: (v:number)=>String(v) },
              { label:"Spent",     value:totalSpent,            color:"#34D399", fmt: fmtKES },
              { label:"Balance",   value:totalDebt,             color:totalDebt>0?"#F87171":"#34D399", fmt: fmtKES },
            ].map(({ label, value, color, fmt }) => (
              <div key={label} style={{ padding:"10px 16px", background:"rgba(255,255,255,.04)", borderRadius:12, textAlign:"center", minWidth:90, border:"1px solid rgba(255,255,255,.06)" }}>
                <p style={{ fontSize:17, fontWeight:700, color, margin:0 }}>{fmt(value)}</p>
                <p style={{ fontSize:9, color:"#64748B", textTransform:"uppercase", letterSpacing:".08em", margin:"2px 0 0" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", gap:2, marginBottom:16, overflowX:"auto", padding:"0 0 4px" }}>
        {TABS.map(t => (
          <button key={t.key} className="profile-tab-btn" onClick={() => setTab(t.key as typeof tab)}
            style={{
              padding:"8px 14px", borderRadius:10, border:"none", cursor:"pointer",
              background: tab===t.key ? "rgba(249,115,22,.15)" : "transparent",
              color: tab===t.key ? "#F97316" : "#64748B",
              fontSize:13, fontWeight:500, display:"flex", alignItems:"center", gap:6,
              outline: tab===t.key ? "1px solid rgba(249,115,22,.3)" : "none",
              fontFamily:"'Outfit',sans-serif", whiteSpace:"nowrap", transition:"all .15s",
            }}>
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span style={{ fontSize:10, background:"rgba(255,255,255,.1)", color:"#94A3B8", padding:"1px 6px", borderRadius:99 }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="fade-up" style={{ display:"grid", gap:14, gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))" }}>

          <Section title="Personal Details" icon={User} color="#38BDF8">
            <InfoRow icon={Phone}    label="Primary Phone"  value={String(client.phone||"—")} />
            <InfoRow icon={Phone}    label="Alternative"    value={String(client.alternative_phone||"—")} />
            <InfoRow icon={Mail}     label="Email"          value={String(client.email||"—")} />
            <InfoRow icon={MapPin}   label="Residence"      value={String(client.residence||"—")} />
            <InfoRow icon={Briefcase}label="Place of Work"  value={String(client.place_of_work||"—")} />
            <InfoRow icon={Globe}    label="Nationality"    value={String(client.nationality||"—")} />
          </Section>

          <Section title="Identity Documents" icon={CreditCard} color="#A78BFA">
            <InfoRow icon={Hash}        label="ID / Passport No." value={String(client.id_number||"—")} mono />
            <InfoRow icon={CreditCard}  label="KRA PIN"           value={String(client.kra_pin||"—")} mono color="#F97316" />
            <InfoRow icon={Car}         label="Driving License"   value={String(client.driving_license_number||"—")} mono />
            {!!client.next_of_kin_name && (
              <div style={{ marginTop:10, padding:10, background:"rgba(168,85,247,.08)", borderRadius:10, border:"1px solid rgba(168,85,247,.15)" }}>
                <p style={{ fontSize:10, color:"#A78BFA", textTransform:"uppercase", letterSpacing:".06em", marginBottom:6, fontWeight:600 }}>Next of Kin</p>
                <p style={{ fontSize:13, color:"white", marginBottom:2 }}>{String(client.next_of_kin_name||"")}</p>
                {!!client.next_of_kin_phone && <p style={{ fontSize:12, color:"#94A3B8" }}>{String(client.next_of_kin_phone||"")}{client.next_of_kin_relationship ? ` · ${String(client.next_of_kin_relationship||"")}` : ""}</p>}
              </div>
            )}
          </Section>

          {/* Biometrics & Photos */}
          {(!!client.fingerprint_right_url || !!client.fingerprint_left_url || !!client.passport_photo_url || !!client.id_photo_url) && (
            <Section title="Biometrics & Photos" icon={Fingerprint} color="#C084FC">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))", gap:10 }}>
                <PhotoBox src={String(client.fingerprint_right_url||"")} label="Right Thumb" />
                <PhotoBox src={String(client.fingerprint_left_url||"")}  label="Left Thumb"  />
                <PhotoBox src={String(client.passport_photo_url||"")}    label="Passport Photo" />
                <PhotoBox src={String(client.id_photo_url||"")}          label="ID Front" />
                <PhotoBox src={String(client.id_photo_back_url||"")}     label="ID Back"  />
                <PhotoBox src={String(client.driving_license_url||"")}   label="DL Front" />
              </div>
            </Section>
          )}

          {/* Services used */}
          {Object.keys(svcBreakdown).length > 0 && (
            <Section title="Services Used" icon={Star} color="#FBBF24">
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {Object.entries(svcBreakdown).map(([svc, count]) => {
                  const Icon = SVC_ICON[svc] || Package;
                  const color = SVC_COLOR[svc] || "#94A3B8";
                  return (
                    <div key={svc} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:`${color}10`, borderRadius:10, border:`1px solid ${color}20` }}>
                      <Icon style={{ width:16, height:16, color, flexShrink:0 }} />
                      <div>
                        <p style={{ fontSize:15, fontWeight:700, color, margin:0, lineHeight:1 }}>{count}×</p>
                        <p style={{ fontSize:10, color:"#64748B", margin:0, textTransform:"capitalize" }}>{svc.replace(/-/g," ")}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Notes */}
          {!!client.notes && (
            <Section title="Notes" icon={FileText} color="#FB923C">
              <p style={{ fontSize:13, color:"#CBD5E1", lineHeight:1.6 }}>{String(client.notes||"")}</p>
            </Section>
          )}
        </div>
      )}

      {/* ── TIMELINE ─────────────────────────────────────────────────────── */}
      {tab === "timeline" && (
        <div className="fade-up" style={{ background:"#0B1220", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, padding:"16px 20px" }}>
          {timeline.length === 0 ? (
            <p style={{ color:"#64748B", textAlign:"center", padding:"48px 0", fontSize:14 }}>No activity recorded yet</p>
          ) : (
            <div style={{ position:"relative" }}>
              <div style={{ position:"absolute", left:16, top:8, bottom:8, width:1, background:"rgba(255,255,255,.06)" }} />
              {timeline.map((item, i) => {
                const Icon = item.icon;
                let title = "", subtitle = "", amount = "", status = "";
                if (item.type==="booking")     { title=`${String(item.d.service_type||"").replace(/-/g," ")} Booking`; amount=fmtKES(Number(item.d.total_amount||0)); status=String(item.d.status||""); subtitle=String(item.d.booking_ref||""); }
                if (item.type==="invoice")     { title=`Invoice ${String(item.d.invoice_number||"")}`;  amount=fmtKES(Number(item.d.total||0)); status=String(item.d.status||""); }
                if (item.type==="receipt")     { title=`Receipt ${String(item.d.receipt_number||"")}`;  amount=fmtKES(Number(item.d.total_amount||0)); status="issued"; }
                if (item.type==="transaction") { title=String(item.d.description||"Transaction"); subtitle=String(item.d.category||""); amount=(String(item.d.type)==="income"?"+":"-")+fmtKES(Number(item.d.amount||0)); status=String(item.d.status||""); }
                return (
                  <div key={i} style={{ display:"flex", gap:16, paddingBottom:20, position:"relative" }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:"#060D1A", border:`1px solid ${item.color}30`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, position:"relative", zIndex:1 }}>
                      <Icon style={{ width:14, height:14, color:item.color }} />
                    </div>
                    <div style={{ flex:1, paddingTop:4 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, flexWrap:"wrap" }}>
                        <div>
                          <p style={{ fontSize:13, color:"white", fontWeight:500, margin:0, textTransform:"capitalize" }}>{title}</p>
                          {subtitle && <p style={{ fontSize:11, color:"#64748B", margin:"2px 0 0" }}>{subtitle}</p>}
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0 }}>
                          {amount && <p style={{ fontSize:13, fontWeight:600, color:item.type==="transaction"&&String(item.d.type)==="expense"?"#F87171":"#34D399", margin:0 }}>{amount}</p>}
                          {status && <StatusPill status={status} />}
                        </div>
                      </div>
                      <p style={{ fontSize:11, color:"#475569", marginTop:4 }}>{fmtDateTime(item.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── BOOKINGS ─────────────────────────────────────────────────────── */}
      {tab === "bookings" && (
        <div className="fade-up" style={{ background:"#0B1220", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
            <span style={{ fontSize:13, fontWeight:600, color:"white" }}>All Bookings ({bookings.length})</span>
          </div>
          {bookings.length === 0 ? <p style={{ color:"#64748B", textAlign:"center", padding:"48px 0", fontSize:14 }}>No bookings found</p> : (
            <div>
              {bookings.map((b, i) => {
                const Icon = SVC_ICON[String(b.service_type||"")] || Package;
                const color = SVC_COLOR[String(b.service_type||"")] || "#94A3B8";
                return (
                  <div key={i} className="list-row" style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,.04)", transition:"background .15s", cursor:"default" }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:`${color}15`, border:`1px solid ${color}20`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Icon style={{ width:16, height:16, color }} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <span style={{ fontSize:13, fontWeight:500, color, textTransform:"capitalize" }}>{String(b.service_type||"").replace(/-/g," ")}</span>
                        <StatusPill status={String(b.status||"")} />
                        {!!b.booking_ref && <span style={{ fontSize:10, color:"#F97316", fontFamily:"'JetBrains Mono',monospace" }}>{String(b.booking_ref)}</span>}
                      </div>
                      <p style={{ fontSize:11, color:"#64748B", margin:"3px 0 0" }}>{fmtDate(String(b.created_at||""))}</p>
                    </div>
                    <p style={{ fontSize:14, fontWeight:600, color:"#34D399", flexShrink:0 }}>{fmtKES(Number(b.total_amount||0))}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── INVOICES ─────────────────────────────────────────────────────── */}
      {tab === "invoices" && (
        <div className="fade-up" style={{ background:"#0B1220", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
            <span style={{ fontSize:13, fontWeight:600, color:"white" }}>Invoices ({invoices.length})</span>
          </div>
          {invoices.length === 0 ? <p style={{ color:"#64748B", textAlign:"center", padding:"48px 0", fontSize:14 }}>No invoices found</p> : (
            invoices.map((inv, i) => (
              <div key={i} className="list-row" style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,.04)", transition:"background .15s" }}>
                <FileText style={{ width:20, height:20, color:"#FB923C", flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                    <span style={{ fontSize:13, color:"white", fontFamily:"'JetBrains Mono',monospace" }}>{String(inv.invoice_number||"")}</span>
                    <StatusPill status={String(inv.status||"")} />
                  </div>
                  <p style={{ fontSize:11, color:"#64748B", margin:"3px 0 0" }}>Due: {fmtDate(String(inv.due_date||""))}</p>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:"white", margin:0 }}>{fmtKES(Number(inv.total||0))}</p>
                  {Number(inv.amount_paid) > 0 && <p style={{ fontSize:11, color:"#34D399" }}>Paid: {fmtKES(Number(inv.amount_paid))}</p>}
                  {Number(inv.total||0)-Number(inv.amount_paid||0) > 0 && (
                    <p style={{ fontSize:11, color:"#F87171" }}>Bal: {fmtKES(Number(inv.total||0)-Number(inv.amount_paid||0))}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── RECEIPTS ─────────────────────────────────────────────────────── */}
      {tab === "receipts" && (
        <div className="fade-up" style={{ background:"#0B1220", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
            <span style={{ fontSize:13, fontWeight:600, color:"white" }}>Receipts ({receipts.length})</span>
          </div>
          {receipts.length === 0 ? <p style={{ color:"#64748B", textAlign:"center", padding:"48px 0", fontSize:14 }}>No receipts found</p> : (
            receipts.map((r, i) => (
              <div key={i} className="list-row" style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,.04)", transition:"background .15s" }}>
                <Receipt style={{ width:20, height:20, color:"#2DD4BF", flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, color:"white", fontFamily:"'JetBrains Mono',monospace", margin:0 }}>{String(r.receipt_number||"")}</p>
                  <p style={{ fontSize:11, color:"#64748B", margin:"3px 0 0", textTransform:"capitalize" }}>{String(r.service_type||"")} · {fmtDate(String(r.issued_at||r.created_at||""))}</p>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:"#34D399", margin:0 }}>{fmtKES(Number(r.total_amount||0))}</p>
                  <p style={{ fontSize:11, color:"#64748B", textTransform:"capitalize" }}>{String(r.payment_method||"")}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TRANSACTIONS ─────────────────────────────────────────────────── */}
      {tab === "transactions" && (
        <div className="fade-up" style={{ background:"#0B1220", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:13, fontWeight:600, color:"white" }}>Transaction Ledger ({transactions.length})</span>
            <span style={{ fontSize:12, color:"#64748B" }}>
              Net: <span style={{ color: transactions.reduce((s,t)=>s+(String(t.type)==="income"?Number(t.amount||0):-Number(t.amount||0)), 0) >= 0 ? "#34D399" : "#F87171", fontWeight:600 }}>
                {fmtKES(transactions.reduce((s,t)=>s+(String(t.type)==="income"?Number(t.amount||0):-Number(t.amount||0)), 0))}
              </span>
            </span>
          </div>
          {transactions.length === 0 ? <p style={{ color:"#64748B", textAlign:"center", padding:"48px 0", fontSize:14 }}>No transactions found</p> : (
            transactions.map((t, i) => {
              const isIncome = String(t.type) === "income";
              return (
                <div key={i} className="list-row" style={{ display:"flex", alignItems:"center", gap:14, padding:"11px 20px", borderBottom:"1px solid rgba(255,255,255,.04)", transition:"background .15s" }}>
                  <div style={{ width:32, height:32, borderRadius:10, background:isIncome?"rgba(52,211,153,.1)":"rgba(248,113,113,.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <DollarSign style={{ width:14, height:14, color:isIncome?"#34D399":"#F87171" }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, color:"white", margin:0 }}>{String(t.description||"")}</p>
                    <p style={{ fontSize:11, color:"#64748B", margin:"2px 0 0" }}>{String(t.category||"")} · {String(t.date||"")}</p>
                  </div>
                  <p style={{ fontSize:14, fontWeight:600, color:isIncome?"#34D399":"#F87171", flexShrink:0, fontFamily:"'JetBrains Mono',monospace" }}>
                    {isIncome?"+":"-"}{fmtKES(Number(t.amount||0))}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
