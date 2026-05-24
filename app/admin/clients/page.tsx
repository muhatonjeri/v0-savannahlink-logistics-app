"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Search, Plus, Eye, Phone, Mail, MapPin, ShieldCheck, ShieldAlert, ShieldX, Download, DollarSign, Fingerprint, Car, Package, Receipt, FileText, TrendingUp, AlertOctagon, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileUpload } from "@/components/forms/file-upload";
import type { Client } from "@/types";

const getRisk = (level?: string) => {
  if (level === "high" || level === "blocked") return { label: "High Risk", color: "bg-red-600 text-white", icon: ShieldX };
  if (level === "medium") return { label: "Medium Risk", color: "bg-amber-500 text-white", icon: ShieldAlert };
  return { label: "Low Risk", color: "bg-emerald-600 text-white", icon: ShieldCheck };
};

const emptyForm = {
  fullName: "", phone: "", alternativePhone: "", email: "",
  idNumber: "", idPhotoUrl: "", idPhotoBackUrl: "",
  drivingLicenseNumber: "", drivingLicenseUrl: "", drivingLicenseBackUrl: "",
  kraPin: "", residence: "", placeOfWork: "",
  passportPhotoUrl: "", riskLevel: "low", notes: "",
  clientType: "citizen", countryOfOrigin: "Kenya",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [clientBookings, setClientBookings] = useState<Record<string,unknown>[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const loadClientBookings = async (clientId: string) => {
    setLoadingBookings(true);
    try {
      // Search bookings by client name since some bookings use name not ID
      const res = await fetch("/api/bookings");
      const all = await res.json();
      if (Array.isArray(all)) {
        // Match by client_id or customer name
        const client = clients.find(c => c.id === clientId);
        const matches = all.filter((b: Record<string,unknown>) =>
          b.client_id === clientId ||
          (client && String(b.customer_name || "").toLowerCase() === client.fullName.toLowerCase())
        );
        setClientBookings(matches);
      }
    } catch { setClientBookings([]); }
    finally { setLoadingBookings(false); }
  };
  const [showRegister, setShowRegister] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Record<string,unknown> | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = async (client: Client) => {
    setProfile(null);
    setProfileLoading(true);
    try {
      const res = await fetch("/api/client-profile?id=" + client.id + "&name=" + encodeURIComponent(client.fullName));
      const data = await res.json();
      setProfile(data);
    } catch (e) { console.error(e); }
    finally { setProfileLoading(false); }
  };

  const loadClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (Array.isArray(data)) {
        setClients(data.map((c: Record<string, unknown>) => ({
          id: String(c.id || ""),
          fullName: String(c.full_name || c.fullName || ""),
          idNumber: String(c.id_number || c.idNumber || ""),
          phone: String(c.phone || ""),
          alternativePhone: String(c.alternative_phone || c.alternativePhone || ""),
          email: String(c.email || ""),
          residence: String(c.residence || ""),
          placeOfWork: String(c.place_of_work || c.placeOfWork || ""),
          kraPin: String(c.kra_pin || c.kraPin || ""),
          drivingLicenseNumber: String(c.driving_license_number || c.drivingLicenseNumber || ""),
          riskLevel: String(c.risk_level || c.riskLevel || "low") as Client["riskLevel"],
          totalBookings: Number(c.total_bookings || c.totalBookings || 0),
          totalSpent: Number(c.total_spent || c.totalSpent || 0),
          totalDebt: Number(c.total_debt || c.totalDebt || 0),
          notes: String(c.notes || ""),
          createdAt: String(c.created_at || c.createdAt || ""),
          updatedAt: String(c.updated_at || c.updatedAt || ""),
        })));
      }
    } catch (e) { console.error("Failed to load clients:", e); }
  };

  useEffect(() => { loadClients(); }, []);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.fullName.toLowerCase().includes(q) || c.phone.includes(q) || (c.idNumber || "").includes(q) || (c.email || "").toLowerCase().includes(q);
    const matchFilter = filter === "all" || (c.riskLevel || "low") === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: clients.length,
    low: clients.filter(c => !c.riskLevel || c.riskLevel === "low").length,
    medium: clients.filter(c => c.riskLevel === "medium").length,
    high: clients.filter(c => c.riskLevel === "high" || c.riskLevel === "blocked").length,
  };

  const handleRegister = async () => {
    if (!form.fullName || !form.phone) return;
    setSaving(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName, phone: form.phone,
          alternativePhone: form.alternativePhone, email: form.email,
          idNumber: form.idNumber, residence: form.residence,
          placeOfWork: form.placeOfWork, kraPin: form.kraPin,
          drivingLicenseNumber: form.drivingLicenseNumber,
          riskLevel: form.riskLevel, notes: form.notes,
          clientType: form.clientType, countryOfOrigin: form.countryOfOrigin,
        }),
      });
      if (res.ok) {
        setShowRegister(false);
        setForm(emptyForm);
        loadClients();
      }
    } finally { setSaving(false); }
  };

  const printClient = (c: Client) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Client - ${c.fullName}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;color:#111;max-width:600px;margin:0 auto}
        h1{color:#0a1628;font-size:20px;margin:0} h2{color:#e67e22;font-size:14px;margin:4px 0 20px}
        .grid{display:grid;grid-template-columns:160px 1fr;gap:8px 16px;margin-bottom:20px}
        .label{color:#888;font-size:12px;font-weight:600;text-transform:uppercase;padding-top:2px}
        .value{color:#111;font-size:13px}
        .section{background:#f8f9ff;border-left:3px solid #0a1628;padding:10px 14px;margin-bottom:16px;border-radius:0 6px 6px 0}
        .section-title{font-size:11px;font-weight:700;color:#0a1628;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px}
        .badge{display:inline-block;padding:2px 10px;border-radius:99px;font-size:11px;font-weight:600}
        .footer{color:#aaa;font-size:11px;border-top:1px solid #eee;padding-top:12px;margin-top:24px}
        @media print{body{padding:0}}
      </style></head><body>
      <img src="/images/logo.png" style="width:60px;height:60px;border-radius:50%;object-fit:contain;float:right" />
      <h1>Moventra Safaris & Logistics Ltd</h1>
      <h2>Client Record — ${c.fullName}</h2>
      <div class="section">
        <div class="section-title">Contact Information</div>
        <div class="grid">
          <span class="label">Full Name</span><span class="value">${c.fullName}</span>
          <span class="label">Phone</span><span class="value">${c.phone || '-'}</span>
          ${c.alternativePhone ? `<span class="label">Alt Phone</span><span class="value">${c.alternativePhone}</span>` : ''}
          ${c.email ? `<span class="label">Email</span><span class="value">${c.email}</span>` : ''}
          ${c.residence ? `<span class="label">Residence</span><span class="value">${c.residence}</span>` : ''}
          ${c.placeOfWork ? `<span class="label">Place of Work</span><span class="value">${c.placeOfWork}</span>` : ''}
        </div>
      </div>
      <div class="section">
        <div class="section-title">Identity</div>
        <div class="grid">
          ${c.idNumber ? `<span class="label">ID / Passport</span><span class="value">${c.idNumber}</span>` : ''}
          ${c.kraPin ? `<span class="label">KRA PIN</span><span class="value">${c.kraPin}</span>` : ''}
          ${c.drivingLicenseNumber ? `<span class="label">Driving License</span><span class="value">${c.drivingLicenseNumber}</span>` : ''}
        </div>
      </div>
      <div class="section">
        <div class="section-title">Account Summary</div>
        <div class="grid">
          <span class="label">Total Bookings</span><span class="value">${c.totalBookings || 0}</span>
          <span class="label">Total Spent</span><span class="value">KES ${Number(c.totalSpent || 0).toLocaleString()}</span>
          <span class="label">Outstanding</span><span class="value">KES ${Number(c.totalDebt || 0).toLocaleString()}</span>
          <span class="label">Risk Level</span><span class="value">${(c.riskLevel || 'low').toUpperCase()}</span>
        </div>
      </div>
      ${c.notes ? `<div class="section"><div class="section-title">Notes</div><p style="font-size:13px;margin:0">${c.notes}</p></div>` : ''}
      <div class="footer">Printed: ${new Date().toLocaleString()} &nbsp;|&nbsp; Moventra Safaris & Logistics Ltd &nbsp;|&nbsp; Confidential</div>
      <script>window.onload=function(){window.print()}<\/script>
      </body></html>`);
    win.document.close();
  };

  const openEdit = (c: Client) => {
    setEditClient(c);
    setEditForm({
      fullName: c.fullName || "", phone: c.phone || "",
      alternativePhone: (c as any).alternativePhone || "",
      email: c.email || "", idNumber: c.idNumber || "",
      idPhotoUrl: "", idPhotoBackUrl: "",
      drivingLicenseNumber: c.drivingLicenseNumber || "",
      drivingLicenseUrl: "", drivingLicenseBackUrl: "",
      kraPin: c.kraPin || "", residence: c.residence || "",
      placeOfWork: (c as any).placeOfWork || "",
      passportPhotoUrl: "", riskLevel: c.riskLevel || "low",
      notes: c.notes || "", clientType: (c as any).clientType || "citizen",
      countryOfOrigin: (c as any).countryOfOrigin || "Kenya",
    });
  };

  const handleUpdate = async () => {
    if (!editClient || !editForm.fullName || !editForm.phone) return;
    try {
      const res = await fetch("/api/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editClient.id, full_name: editForm.fullName, phone: editForm.phone, alternative_phone: editForm.alternativePhone, email: editForm.email, id_number: editForm.idNumber, residence: editForm.residence, place_of_work: editForm.placeOfWork, kra_pin: editForm.kraPin, driving_license_number: editForm.drivingLicenseNumber, risk_level: editForm.riskLevel, notes: editForm.notes }),
      });
      if (res.ok) { setEditClient(null); loadClients(); }
    } catch(e) { console.error(e); }
  };

  const exportCSV = () => {
    const rows = [["Name","Phone","ID Number","Email","Residence","KRA PIN","Risk","Bookings","Spent","Registered"]];
    filtered.forEach(c => rows.push([c.fullName, c.phone, c.idNumber||"", c.email||"", c.residence||"", c.kraPin||"", c.riskLevel||"low", String(c.totalBookings||0), String(c.totalSpent||0), c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""]));
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "clients.csv"; a.click();
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="h-7 w-7 text-lime-400" />
            Clients
          </h1>
          <p className="text-gray-400 mt-1 text-sm">All registered clients across all services</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-white/10 text-gray-400 gap-2" onClick={exportCSV}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button className="bg-lime-600 hover:bg-lime-700 gap-2" onClick={() => setShowRegister(true)}>
            <Plus className="h-4 w-4" /> New Client
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Clients", value: stats.total, border: "border-lime-500/30", bg: "from-lime-500/10", ic: "text-lime-400", icon: Users },
          { label: "Low Risk",      value: stats.low,   border: "border-emerald-500/30", bg: "from-emerald-500/10", ic: "text-emerald-400", icon: ShieldCheck },
          { label: "Medium Risk",   value: stats.medium,border: "border-amber-500/30",   bg: "from-amber-500/10",   ic: "text-amber-400",  icon: ShieldAlert },
          { label: "High Risk",     value: stats.high,  border: "border-red-500/30",     bg: "from-red-500/10",     ic: "text-red-400",    icon: ShieldX },
        ].map(({ label, value, border, bg, ic, icon: Icon }) => (
          <Card key={label} className={"overflow-hidden border bg-gradient-to-br to-transparent " + border + " " + bg}>
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</CardTitle>
              <Icon className={"h-4 w-4 " + ic} />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-white">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500" placeholder="Search by name, phone or ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {["all","low","medium","high"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={filter === f ? "px-3 py-1.5 rounded-lg text-xs font-semibold bg-lime-600 text-white" : "px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 bg-white/5 text-gray-400 hover:border-lime-500/40"}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-white">Client Registry</CardTitle>
            <CardDescription className="text-gray-500 text-xs">{filtered.length} of {clients.length} clients</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No clients found</p>
              <p className="text-gray-500 text-sm mt-1">{search ? "Try a different search term" : "Register your first client"}</p>
              <Button className="mt-4 bg-lime-600 hover:bg-lime-700" onClick={() => setShowRegister(true)}>
                <Plus className="h-4 w-4 mr-2" />Register First Client
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => {
                  const risk = getRisk(c.riskLevel);
                  const RiskIcon = risk.icon;
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <p className="text-white font-medium">{c.fullName}</p>
                        {c.residence && <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{c.residence}</p>}
                      </TableCell>
                      <TableCell>
                        <p className="text-gray-300 text-sm">{c.phone}</p>
                        {c.email && <p className="text-gray-400 text-xs">{c.email}</p>}
                      </TableCell>
                      <TableCell className="font-mono text-gray-300 text-sm">{c.idNumber || "-"}</TableCell>
                      <TableCell>
                        <Badge className={"gap-1 text-xs " + risk.color}>
                          <RiskIcon className="h-3 w-3" />{risk.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white font-semibold">{c.totalBookings || 0}</TableCell>
                      <TableCell className="text-emerald-400 font-semibold">{c.totalSpent ? "KES " + Number(c.totalSpent).toLocaleString() : "-"}</TableCell>
                      <TableCell className="text-gray-400 text-sm">{c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "-"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => { setViewClient(c); loadClientBookings(c.id); }}>
                          <Eye className="h-4 w-4 text-gray-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Client Dialog */}
      <Dialog open={!!editClient} onOpenChange={() => setEditClient(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-amber-400 flex items-center gap-2"><Pencil className="h-5 w-5" />Edit Client</DialogTitle>
            <DialogDescription>{editClient?.fullName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label className="text-gray-200">Full Name *</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} /></div>
              <div><Label className="text-gray-200">Phone *</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></div>
              <div><Label className="text-gray-200">Alt Phone</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" value={editForm.alternativePhone} onChange={e => setEditForm({...editForm, alternativePhone: e.target.value})} /></div>
              <div><Label className="text-gray-200">Email</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} /></div>
              <div><Label className="text-gray-200">ID / Passport No.</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white font-mono" value={editForm.idNumber} onChange={e => setEditForm({...editForm, idNumber: e.target.value})} /></div>
              <div><Label className="text-gray-200">KRA PIN</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white font-mono" value={editForm.kraPin} onChange={e => setEditForm({...editForm, kraPin: e.target.value})} /></div>
              <div><Label className="text-gray-200">Driving License No.</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white font-mono" value={editForm.drivingLicenseNumber} onChange={e => setEditForm({...editForm, drivingLicenseNumber: e.target.value})} /></div>
              <div><Label className="text-gray-200">Residence</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" value={editForm.residence} onChange={e => setEditForm({...editForm, residence: e.target.value})} /></div>
              <div><Label className="text-gray-200">Place of Work</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" value={editForm.placeOfWork} onChange={e => setEditForm({...editForm, placeOfWork: e.target.value})} /></div>
              <div>
                <Label className="text-gray-200">Risk Level</Label>
                <select className="mt-1 w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm" value={editForm.riskLevel} onChange={e => setEditForm({...editForm, riskLevel: e.target.value})}>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>
              <div className="col-span-2"><Label className="text-gray-200">Notes</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} /></div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setEditClient(null)}>Cancel</Button>
            <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleUpdate}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lime-400 flex items-center gap-2"><Plus className="h-5 w-5" />Register New Client</DialogTitle>
            <DialogDescription>Fill in client details and upload documents</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Client Type */}
            <div className="flex gap-2">
              {[["citizen","Kenyan Resident"],["foreigner","Foreign National"]].map(([val, label]) => (
                <button key={val} type="button" onClick={() => setForm({ ...form, clientType: val })}
                  className={form.clientType === val ? "flex-1 py-2 rounded-lg border-2 border-lime-500 bg-lime-500/20 text-lime-300 text-sm font-semibold" : "flex-1 py-2 rounded-lg border-2 border-white/10 bg-white/5 text-gray-400 text-sm"}>
                  {label}
                </button>
              ))}
            </div>

            {/* Personal Info */}
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
              <h4 className="text-blue-400 font-semibold text-xs uppercase tracking-wide">Personal Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label className="text-gray-200">Full Name *</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="Full legal name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
                <div><Label className="text-gray-200">Phone *</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label className="text-gray-200">Alt Phone</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="+254 7XX XXX XXX" value={form.alternativePhone} onChange={e => setForm({ ...form, alternativePhone: e.target.value })} /></div>
                <div><Label className="text-gray-200">Email</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label className="text-gray-200">KRA PIN</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white font-mono" placeholder="A012345678A" value={form.kraPin} onChange={e => setForm({ ...form, kraPin: e.target.value })} /></div>
                <div><Label className="text-gray-200">Residence</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="Westlands, Nairobi" value={form.residence} onChange={e => setForm({ ...form, residence: e.target.value })} /></div>
                <div><Label className="text-gray-200">Place of Work</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="Company or employer" value={form.placeOfWork} onChange={e => setForm({ ...form, placeOfWork: e.target.value })} /></div>
              </div>
            </div>

            {/* ID Document */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <h4 className="text-emerald-400 font-semibold text-xs uppercase tracking-wide">ID / Passport</h4>
              <div><Label className="text-gray-200">ID / Passport Number</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white font-mono" placeholder="e.g. 12345678" value={form.idNumber} onChange={e => setForm({ ...form, idNumber: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <FileUpload id="id-front" label="ID / Passport — Front" accept="image/*" maxSize={5} value={form.idPhotoUrl} onChange={url => setForm({ ...form, idPhotoUrl: url || "" })} showCamera />
                <FileUpload id="id-back" label="ID — Back Side" accept="image/*" maxSize={5} value={form.idPhotoBackUrl} onChange={url => setForm({ ...form, idPhotoBackUrl: url || "" })} showCamera />
              </div>
              {form.clientType === "foreigner" && (
                <FileUpload id="passport-photo" label="Passport Photo (Face)" accept="image/*" maxSize={5} value={form.passportPhotoUrl} onChange={url => setForm({ ...form, passportPhotoUrl: url || "" })} showCamera />
              )}
            </div>

            {/* Driving License */}
            <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4 space-y-3">
              <h4 className="text-violet-400 font-semibold text-xs uppercase tracking-wide">Driving License</h4>
              <div><Label className="text-gray-200">License Number</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white font-mono" placeholder="e.g. DL123456" value={form.drivingLicenseNumber} onChange={e => setForm({ ...form, drivingLicenseNumber: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <FileUpload id="dl-front" label="License — Front" accept="image/*" maxSize={5} value={form.drivingLicenseUrl} onChange={url => setForm({ ...form, drivingLicenseUrl: url || "" })} showCamera />
                <FileUpload id="dl-back" label="License — Back" accept="image/*" maxSize={5} value={form.drivingLicenseBackUrl} onChange={url => setForm({ ...form, drivingLicenseBackUrl: url || "" })} showCamera />
              </div>
            </div>

            {/* Risk & Notes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-200">Risk Level</Label>
                <select className="mt-1 w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm" value={form.riskLevel} onChange={e => setForm({ ...form, riskLevel: e.target.value })}>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>
              <div><Label className="text-gray-200">Notes</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="Any notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowRegister(false)}>Cancel</Button>
            <Button className="flex-1 bg-lime-600 hover:bg-lime-700" onClick={handleRegister} disabled={saving || !form.fullName || !form.phone}>
              {saving ? "Saving..." : "Register Client"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Client Dialog */}
      <Dialog open={!!viewClient} onOpenChange={() => setViewClient(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {viewClient && (() => {
            const risk = getRisk(viewClient.riskLevel);
            const RiskIcon = risk.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-white text-xl">{viewClient.fullName}</DialogTitle>
                  <DialogDescription>
                    <Badge className={risk.color + " gap-1"}><RiskIcon className="h-3 w-3" />{risk.label}</Badge>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2 text-sm">
                  <div className="rounded-lg bg-[#0a1628] border border-blue-500/20 p-3 space-y-1.5">
                    <p className="text-blue-400 font-semibold text-xs uppercase tracking-wide">Contact</p>
                    <p className="text-white">{viewClient.phone}</p>
                    {viewClient.alternativePhone && <p className="text-gray-400">Alt: {viewClient.alternativePhone}</p>}
                    {viewClient.email && <p className="text-gray-400">{viewClient.email}</p>}
                    {viewClient.residence && <p className="text-gray-400">{viewClient.residence}</p>}
                    {viewClient.placeOfWork && <p className="text-gray-400">Works at: {viewClient.placeOfWork}</p>}
                  </div>
                  <div className="rounded-lg bg-[#0a1628] border border-violet-500/20 p-3 space-y-1.5">
                    <p className="text-violet-400 font-semibold text-xs uppercase tracking-wide">Identity</p>
                    {viewClient.idNumber && <p className="text-white font-mono">ID: {viewClient.idNumber}</p>}
                    {viewClient.kraPin && <p className="text-gray-300 font-mono">KRA: {viewClient.kraPin}</p>}
                    {viewClient.drivingLicenseNumber && <p className="text-gray-300 font-mono">DL: {viewClient.drivingLicenseNumber}</p>}
                  </div>
                  <div className="rounded-lg bg-[#0a1628] border border-emerald-500/20 p-3">
                    <p className="text-emerald-400 font-semibold text-xs uppercase tracking-wide mb-2">History</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div><p className="text-2xl font-bold text-white">{viewClient.totalBookings || 0}</p><p className="text-xs text-gray-400">Bookings</p></div>
                      <div><p className="text-lg font-bold text-emerald-400">KES {Number(viewClient.totalSpent || 0).toLocaleString()}</p><p className="text-xs text-gray-400">Spent</p></div>
                      <div><p className="text-lg font-bold text-red-400">KES {Number(viewClient.totalDebt || 0).toLocaleString()}</p><p className="text-xs text-gray-400">Owed</p></div>
                    </div>
                  </div>
                  {viewClient.notes && <div className="rounded-lg bg-[#0a1628] border border-white/10 p-3"><p className="text-gray-400 text-xs">Notes: <span className="text-gray-300">{viewClient.notes}</span></p></div>}

                  {/* Booking History */}
                  <div className="rounded-lg bg-[#0a1628] border border-orange-500/20 p-3">
                    <p className="text-orange-400 font-semibold text-xs uppercase tracking-wide mb-2">
                      Booking History {loadingBookings ? "(loading...)" : "(" + clientBookings.length + " bookings)"}
                    </p>
                    {clientBookings.length === 0 && !loadingBookings && (
                      <p className="text-gray-500 text-xs">No bookings found for this client</p>
                    )}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {clientBookings.map((b: Record<string,unknown>, i: number) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                          <div>
                            <p className="text-white text-xs font-medium">{String(b.service_type || b.serviceType || "Service")}</p>
                            <p className="text-gray-500 text-xs">{String(b.created_at || b.createdAt || "").slice(0,10)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-400 text-xs font-semibold">KES {Number(b.total_amount || b.totalAmount || 0).toLocaleString()}</p>
                            <span className={"text-xs px-1.5 py-0.5 rounded " + (String(b.status) === "completed" ? "bg-emerald-500/20 text-emerald-400" : String(b.status) === "cancelled" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400")}>
                              {String(b.status || "pending")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button className="flex-1 bg-violet-600 hover:bg-violet-700 gap-2" asChild>
                      <Link href={"/admin/client-lookup?prefill=" + encodeURIComponent(viewClient.fullName)}><Fingerprint className="h-4 w-4" />Verify & Book</Link>
                    </Button>
                    <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2" asChild>
                      <Link href="/admin/blacklist"><ShieldX className="h-4 w-4" />Blacklist</Link>
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
