"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, Search, Plus, Eye, Phone, Mail, MapPin,
  ShieldCheck, ShieldAlert, ShieldX, Filter, Download,
  Car, Calendar, DollarSign, Fingerprint, Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getClients } from "@/lib/store";
import type { Client } from "@/types";
import { FileUpload } from "@/components/forms/file-upload";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const riskConfig = {
  low:    { label: "Low Risk",    color: "bg-emerald-600 text-white", icon: ShieldCheck },
  medium: { label: "Medium Risk", color: "bg-amber-500 text-white",   icon: ShieldAlert },
  high:   { label: "High Risk",   color: "bg-red-600 text-white",     icon: ShieldX    },
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [regForm, setRegForm] = useState({
    fullName: "", phone: "", alternativePhone: "", email: "",
    idNumber: "", idPhotoUrl: "", idPhotoBackUrl: "",
    drivingLicenseNumber: "", drivingLicenseUrl: "", drivingLicenseBackUrl: "",
    kraPin: "", residence: "", placeOfWork: "",
    passportPhotoUrl: "", riskLevel: "low", notes: "",
    clientType: "citizen", countryOfOrigin: "Kenya",
  });
  const [saving, setSaving] = useState(false);

  const handleRegister = async () => {
    if (!regForm.fullName || !regForm.phone) { return; }
    setSaving(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: regForm.fullName, phone: regForm.phone,
          alternativePhone: regForm.alternativePhone, email: regForm.email,
          idNumber: regForm.idNumber, residence: regForm.residence,
          placeOfWork: regForm.placeOfWork, kraPin: regForm.kraPin,
          drivingLicenseNumber: regForm.drivingLicenseNumber,
          riskLevel: regForm.riskLevel, notes: regForm.notes,
          clientType: regForm.clientType, countryOfOrigin: regForm.countryOfOrigin,
        }),
      });
      if (res.ok) {
        setShowRegisterDialog(false);
        setRegForm({ fullName: "", phone: "", alternativePhone: "", email: "", idNumber: "", idPhotoUrl: "", idPhotoBackUrl: "", drivingLicenseNumber: "", drivingLicenseUrl: "", drivingLicenseBackUrl: "", kraPin: "", residence: "", placeOfWork: "", passportPhotoUrl: "", riskLevel: "low", notes: "", clientType: "citizen", countryOfOrigin: "Kenya" });
        loadClients();
      }
    } finally { setSaving(false); }
  };

  const loadClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setClients(data.map((c: Record<string,unknown>) => ({
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
          clientType: String(c.client_type || c.clientType || "citizen"),
          countryOfOrigin: String(c.country_of_origin || c.countryOfOrigin || "Kenya"),
          totalBookings: Number(c.total_bookings || c.totalBookings || 0),
          totalSpent: Number(c.total_spent || c.totalSpent || 0),
          totalDebt: Number(c.total_debt || c.totalDebt || 0),
          notes: String(c.notes || ""),
          createdAt: String(c.created_at || c.createdAt || ""),
          updatedAt: String(c.updated_at || c.updatedAt || ""),
        })));
      } else {
        // Fall back to local store
        setClients(getClients());
      }
    } catch {
      setClients(getClients());
    }
  };

  useEffect(() => { loadClients(); }, []);

  const filtered = clients.filter(c => {
    const matchSearch = !search || 
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.idNumber.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || c.riskLevel === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: clients.length,
    low: clients.filter(c => c.riskLevel === "low").length,
    medium: clients.filter(c => c.riskLevel === "medium").length,
    high: clients.filter(c => c.riskLevel === "high").length,
  };

  const exportCSV = () => {
    const headers = ["Name","Phone","ID Number","Email","Residence","KRA PIN","Risk Level","Bookings","Spent","Registered"];
    const rows = filtered.map(c => [
      c.fullName, c.phone, c.idNumber, c.email || "",
      c.residence || "", c.kraPin || "", c.riskLevel || "low",
      c.totalBookings || 0, c.totalSpent || 0,
      c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "moventra-clients.csv"; a.click();
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
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button className="bg-lime-600 hover:bg-lime-700 gap-2" onClick={() => setShowRegisterDialog(true)}>
            <Plus className="h-4 w-4" /> New Client
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Clients", value: stats.total, color: "border-lime-500/30 from-lime-500/10", ic: "text-lime-400", icon: Users },
          { label: "Low Risk",      value: stats.low,   color: "border-emerald-500/30 from-emerald-500/10", ic: "text-emerald-400", icon: ShieldCheck },
          { label: "Medium Risk",   value: stats.medium,color: "border-amber-500/30 from-amber-500/10",   ic: "text-amber-400",  icon: ShieldAlert },
          { label: "High Risk",     value: stats.high,  color: "border-red-500/30 from-red-500/10",     ic: "text-red-400",    icon: ShieldX },
        ].map(({ label, value, color, ic, icon: Icon }) => (
          <Card key={label} className={"overflow-hidden border bg-gradient-to-br to-transparent " + color}>
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
          <Input
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            placeholder="Search by name, phone or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {(["all","low","medium","high"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={filter === f
                ? "px-3 py-1.5 rounded-lg text-xs font-semibold bg-lime-600 text-white"
                : "px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 bg-white/5 text-gray-400 hover:border-lime-500/40"}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
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
              <p className="text-gray-500 text-sm mt-1">
                {search ? "Try a different search term" : "Register clients through Client Lookup"}
              </p>
              <Button className="mt-4 bg-lime-600 hover:bg-lime-700" onClick={() => setShowRegisterDialog(true)}>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => {
                  const risk = riskConfig[c.riskLevel as keyof typeof riskConfig] || riskConfig.low;
                  const RiskIcon = risk.icon;
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <p className="text-white font-medium">{c.fullName}</p>
                        {c.residence && <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{c.residence}</p>}
                      </TableCell>
                      <TableCell>
                        <p className="text-gray-300 text-sm flex items-center gap-1"><Phone className="h-3 w-3 text-gray-500" />{c.phone}</p>
                        {c.email && <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3 text-gray-500" />{c.email}</p>}
                      </TableCell>
                      <TableCell className="font-mono text-gray-300 text-sm">{c.idNumber || "-"}</TableCell>
                      <TableCell>
                        <Badge className={c.clientType === "foreigner" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"}>
                          {c.clientType === "foreigner" ? "Foreign" : "Resident"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={"gap-1 text-xs " + risk.color}>
                          <RiskIcon className="h-3 w-3" />
                          {risk.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white font-semibold">{c.totalBookings || 0}</TableCell>
                      <TableCell className="text-emerald-400 font-semibold">
                        {c.totalSpent ? "KES " + Number(c.totalSpent).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-KE", { day:"numeric", month:"short", year:"numeric" }) : "-"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setViewClient(c)}>
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

      {/* Register New Client Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lime-400 flex items-center gap-2">
              <Plus className="h-5 w-5" />Register New Client
            </DialogTitle>
            <DialogDescription>Fill in client details and upload documents</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">

            {/* Client Type */}
            <div>
              <Label className="text-gray-200 mb-2 block">Client Type</Label>
              <div className="flex gap-2">
                {[["citizen","Kenyan Resident"],["foreigner","Foreign National"]].map(([val, label]) => (
                  <button key={val} type="button"
                    onClick={() => setRegForm({ ...regForm, clientType: val })}
                    className={regForm.clientType === val
                      ? "flex-1 py-2 rounded-lg border-2 border-lime-500 bg-lime-500/20 text-lime-300 text-sm font-semibold"
                      : "flex-1 py-2 rounded-lg border-2 border-white/10 bg-white/5 text-gray-400 text-sm"}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Info */}
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
              <h4 className="text-blue-400 font-semibold text-xs uppercase tracking-wide">Personal Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-gray-200">Full Name *</Label>
                  <input className="mt-1 w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm" placeholder="Full legal name"
                    value={regForm.fullName} onChange={e => setRegForm({ ...regForm, fullName: e.target.value })} />
                </div>
                <div>
                  <Label className="text-gray-200">Phone *</Label>
                  <input className="mt-1 w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm" placeholder="+254 7XX XXX XXX"
                    value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })} />
                </div>
                <div>
                  <Label className="text-gray-200">Alternative Phone</Label>
                  <input className="mt-1 w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm" placeholder="+254 7XX XXX XXX"
                    value={regForm.alternativePhone} onChange={e => setRegForm({ ...regForm, alternativePhone: e.target.value })} />
                </div>
                <div>
                  <Label className="text-gray-200">Email</Label>
                  <input className="mt-1 w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm" placeholder="email@example.com"
                    value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} />
                </div>
                <div>
                  <Label className="text-gray-200">KRA PIN</Label>
                  <input className="mt-1 w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm font-mono" placeholder="A012345678A"
                    value={regForm.kraPin} onChange={e => setRegForm({ ...regForm, kraPin: e.target.value })} />
                </div>
                <div>
                  <Label className="text-gray-200">Residence / Address</Label>
                  <input className="mt-1 w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm" placeholder="Westlands, Nairobi"
                    value={regForm.residence} onChange={e => setRegForm({ ...regForm, residence: e.target.value })} />
                </div>
                <div>
                  <Label className="text-gray-200">Place of Work</Label>
                  <input className="mt-1 w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm" placeholder="Company or employer"
                    value={regForm.placeOfWork} onChange={e => setRegForm({ ...regForm, placeOfWork: e.target.value })} />
                </div>
              </div>
            </div>

            {/* ID Document */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <h4 className="text-emerald-400 font-semibold text-xs uppercase tracking-wide">ID / Passport</h4>
              <div>
                <Label className="text-gray-200">ID / Passport Number</Label>
                <input className="mt-1 w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm font-mono" placeholder="e.g. 12345678"
                  value={regForm.idNumber} onChange={e => setRegForm({ ...regForm, idNumber: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FileUpload
                  id="id-front"
                  label="ID / Passport — Front"
                  accept="image/*"
                  maxSize={5}
                  value={regForm.idPhotoUrl}
                  onChange={url => setRegForm({ ...regForm, idPhotoUrl: url || "" })}
                  showCamera
                />
                <FileUpload
                  id="id-back"
                  label="ID — Back Side"
                  accept="image/*"
                  maxSize={5}
                  value={regForm.idPhotoBackUrl}
                  onChange={url => setRegForm({ ...regForm, idPhotoBackUrl: url || "" })}
                  showCamera
                />
              </div>
              {regForm.clientType === "foreigner" && (
                <FileUpload
                  id="passport-photo"
                  label="Passport Photo (Face)"
                  accept="image/*"
                  maxSize={5}
                  value={regForm.passportPhotoUrl}
                  onChange={url => setRegForm({ ...regForm, passportPhotoUrl: url || "" })}
                  showCamera
                />
              )}
            </div>

            {/* Driving License */}
            <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4 space-y-3">
              <h4 className="text-violet-400 font-semibold text-xs uppercase tracking-wide">Driving License</h4>
              <div>
                <Label className="text-gray-200">License Number</Label>
                <input className="mt-1 w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm font-mono" placeholder="e.g. DL123456"
                  value={regForm.drivingLicenseNumber} onChange={e => setRegForm({ ...regForm, drivingLicenseNumber: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FileUpload
                  id="dl-front"
                  label="License — Front"
                  accept="image/*"
                  maxSize={5}
                  value={regForm.drivingLicenseUrl}
                  onChange={url => setRegForm({ ...regForm, drivingLicenseUrl: url || "" })}
                  showCamera
                />
                <FileUpload
                  id="dl-back"
                  label="License — Back"
                  accept="image/*"
                  maxSize={5}
                  value={regForm.drivingLicenseBackUrl}
                  onChange={url => setRegForm({ ...regForm, drivingLicenseBackUrl: url || "" })}
                  showCamera
                />
              </div>
            </div>

            {/* Risk & Notes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-200">Risk Level</Label>
                <select className="mt-1 w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm"
                  value={regForm.riskLevel} onChange={e => setRegForm({ ...regForm, riskLevel: e.target.value })}>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>
              <div>
                <Label className="text-gray-200">Notes</Label>
                <input className="mt-1 w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm" placeholder="Any notes..."
                  value={regForm.notes} onChange={e => setRegForm({ ...regForm, notes: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowRegisterDialog(false)}>Cancel</Button>
            <Button className="flex-1 bg-lime-600 hover:bg-lime-700" onClick={handleRegister} disabled={saving || !regForm.fullName || !regForm.phone}>
              {saving ? "Saving..." : "Register Client"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Client Dialog */}
      <Dialog open={!!viewClient} onOpenChange={() => setViewClient(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {viewClient && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white text-xl">{viewClient.fullName}</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <Badge className={viewClient.clientType === "foreigner" ? "bg-amber-500 text-white" : "bg-blue-600 text-white"}>
                    {viewClient.clientType === "foreigner" ? "Foreign National" : "Kenyan Resident"}
                  </Badge>
                  {viewClient.countryOfOrigin && viewClient.clientType === "foreigner" && (
                    <span className="text-gray-400 text-xs">{viewClient.countryOfOrigin}</span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                {/* Contact */}
                <div className="rounded-lg bg-[#0a1628] border border-blue-500/20 p-3 space-y-2 text-sm">
                  <p className="text-blue-400 font-semibold text-xs uppercase tracking-wide">Contact Details</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-gray-400">Phone:</span> <span className="text-white">{viewClient.phone}</span></div>
                    {viewClient.alternativePhone && <div><span className="text-gray-400">Alt:</span> <span className="text-white">{viewClient.alternativePhone}</span></div>}
                    {viewClient.email && <div className="col-span-2"><span className="text-gray-400">Email:</span> <span className="text-white">{viewClient.email}</span></div>}
                    {viewClient.residence && <div className="col-span-2"><span className="text-gray-400">Residence:</span> <span className="text-white">{viewClient.residence}</span></div>}
                    {viewClient.placeOfWork && <div className="col-span-2"><span className="text-gray-400">Work:</span> <span className="text-white">{viewClient.placeOfWork}</span></div>}
                  </div>
                </div>

                {/* Identity */}
                <div className="rounded-lg bg-[#0a1628] border border-violet-500/20 p-3 space-y-2 text-sm">
                  <p className="text-violet-400 font-semibold text-xs uppercase tracking-wide">Identity</p>
                  <div className="grid grid-cols-2 gap-2">
                    {viewClient.idNumber && <div><span className="text-gray-400">ID/Passport:</span> <span className="text-white font-mono">{viewClient.idNumber}</span></div>}
                    {viewClient.kraPin && <div><span className="text-gray-400">KRA PIN:</span> <span className="text-white font-mono">{viewClient.kraPin}</span></div>}
                    {viewClient.drivingLicenseNumber && <div><span className="text-gray-400">DL No:</span> <span className="text-white font-mono">{viewClient.drivingLicenseNumber}</span></div>}
                  </div>
                </div>

                {/* Stats */}
                <div className="rounded-lg bg-[#0a1628] border border-emerald-500/20 p-3 space-y-2 text-sm">
                  <p className="text-emerald-400 font-semibold text-xs uppercase tracking-wide">Booking History</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-bold text-white">{viewClient.totalBookings || 0}</p>
                      <p className="text-xs text-gray-400">Bookings</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-400">KES {Number(viewClient.totalSpent || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Total Spent</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-400">KES {Number(viewClient.totalDebt || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Outstanding</p>
                    </div>
                  </div>
                </div>

                {/* Risk */}
                <div className={"rounded-lg p-3 text-sm flex items-center gap-3 border " + (
                  viewClient.riskLevel === "high" ? "border-red-500/30 bg-red-500/10" :
                  viewClient.riskLevel === "medium" ? "border-amber-500/30 bg-amber-500/10" :
                  "border-emerald-500/30 bg-emerald-500/10"
                )}>
                  {viewClient.riskLevel === "high" ? <ShieldX className="h-5 w-5 text-red-400" /> :
                   viewClient.riskLevel === "medium" ? <ShieldAlert className="h-5 w-5 text-amber-400" /> :
                   <ShieldCheck className="h-5 w-5 text-emerald-400" />}
                  <div>
                    <p className="text-white font-semibold">{riskConfig[viewClient.riskLevel as keyof typeof riskConfig]?.label || "Low Risk"}</p>
                    {viewClient.notes && <p className="text-gray-400 text-xs mt-0.5">{viewClient.notes}</p>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button className="flex-1 bg-violet-600 hover:bg-violet-700 gap-2" asChild>
                    <Link href={"/admin/client-lookup?prefill=" + encodeURIComponent(viewClient.fullName)}>
                      <Fingerprint className="h-4 w-4" />Verify & Book
                    </Link>
                  </Button>
                  <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2" asChild>
                    <Link href={"/admin/blacklist?add=" + encodeURIComponent(viewClient.fullName)}>
                      <ShieldX className="h-4 w-4" />Blacklist
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
