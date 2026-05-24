"use client";

import { useState } from "react";
import { Plus, Car, Building2, TrendingUp, DollarSign, ArrowRight, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

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
  clientName: string;
  clientPhone: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  supplierDailyRate: number;
  ourDailyRate: number;
  totalSupplierCost: number;
  totalClientCharge: number;
  totalProfit: number;
  status: "active" | "completed" | "cancelled";
  paymentMethod: "mpesa" | "bank" | "cash" | "cheque";
  paymentReference: string;
  notes: string;
  createdAt: string;
}

const INITIAL_VEHICLES: SubletVehicle[] = [
  {
    id: "sv-001", supplierName: "Quickride Rentals Ltd", supplierPhone: "+254 722 100 200",
    supplierEmail: "fleet@quickride.co.ke", supplierType: "company",
    serviceType: "Car Rental",
    make: "Nissan", model: "X-Trail", registration: "KDD 123A", color: "Black", year: "2021",
    supplierDailyRate: 5000, ourDailyRate: 6500, status: "available", createdAt: "2024-03-01",
  },
  {
    id: "sv-002", supplierName: "James Mwangi", supplierPhone: "+254 733 300 400",
    supplierEmail: "", supplierType: "individual",
    serviceType: "Car Rental",
    make: "Toyota", model: "Prado", registration: "KCX 456B", color: "White", year: "2020",
    supplierDailyRate: 8000, ourDailyRate: 10000, status: "active", createdAt: "2024-03-05",
  },
];

const INITIAL_BOOKINGS: SubletBooking[] = [
  {
    id: "sb-001", vehicleId: "sv-002", clientName: "Safari Group Kenya", clientPhone: "+254 700 111 222",
    startDate: "2024-03-10", endDate: "2024-03-14", numberOfDays: 4,
    supplierDailyRate: 8000, ourDailyRate: 10000,
    totalSupplierCost: 32000, totalClientCharge: 40000, totalProfit: 8000,
    serviceType: "Car Rental",
    status: "active", paymentMethod: "bank", paymentReference: "EQB-TXN-00123", notes: "", createdAt: "2024-03-10",
  },
];

const SERVICES = ["Car Rental", "Safari Tours", "Transfers", "Movers", "Corporate Rental", "Road Recovery", "Cargo Handling", "Shipment Imports", "Construction Equipment"];

const emptyVForm = { serviceType: "Car Rental", supplierName: "", supplierPhone: "", supplierEmail: "", supplierType: "company" as "company" | "individual", make: "", model: "", registration: "", color: "", year: "", supplierDailyRate: "", ourDailyRate: "" };
const emptyBForm = { serviceType: "Car Rental", vehicleId: "", clientName: "", clientPhone: "", startDate: "", endDate: "", numberOfDays: "", paymentMethod: "mpesa" as "mpesa" | "bank" | "cash" | "cheque", paymentReference: "", notes: "" };

export default function SubletsPage() {
  const [vehicles, setVehicles] = useState<SubletVehicle[]>(INITIAL_VEHICLES);
  const [bookings, setBookings] = useState<SubletBooking[]>(INITIAL_BOOKINGS);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [viewVehicle, setViewVehicle] = useState<SubletVehicle | null>(null);
  const [vForm, setVForm] = useState(emptyVForm);
  const [bForm, setBForm] = useState(emptyBForm);

  const profitDay = (v: SubletVehicle) => v.ourDailyRate - v.supplierDailyRate;
  const margin = (v: SubletVehicle) => v.supplierDailyRate > 0 ? Math.round((profitDay(v) / v.supplierDailyRate) * 100) : 0;

  const totalRevenue = bookings.reduce((s, b) => s + b.totalClientCharge, 0);
  const totalCost = bookings.reduce((s, b) => s + b.totalSupplierCost, 0);
  const totalProfit = bookings.reduce((s, b) => s + b.totalProfit, 0);

  const addVehicle = () => {
    if (!vForm.supplierName || !vForm.make || !vForm.registration || !vForm.supplierDailyRate || !vForm.ourDailyRate) {
      toast.error("Fill all required fields"); return;
    }
    const v: SubletVehicle = {
      id: "sv-" + Date.now(), serviceType: vForm.serviceType, supplierName: vForm.supplierName, supplierPhone: vForm.supplierPhone,
      supplierEmail: vForm.supplierEmail, supplierType: vForm.supplierType,
      make: vForm.make, model: vForm.model, registration: vForm.registration.toUpperCase(),
      color: vForm.color, year: vForm.year,
      supplierDailyRate: parseFloat(vForm.supplierDailyRate), ourDailyRate: parseFloat(vForm.ourDailyRate),
      status: "available", createdAt: new Date().toISOString().split("T")[0],
    };
    setVehicles([v, ...vehicles]);
    setShowVehicleDialog(false);
    setVForm(emptyVForm);
    toast.success("Sublet vehicle added");
  };

  const addBooking = () => {
    const v = vehicles.find(x => x.id === bForm.vehicleId);
    if (!v) { toast.error("Select a vehicle"); return; }
    if (!bForm.clientName || !bForm.startDate || !bForm.endDate) { toast.error("Fill all required fields"); return; }
    const days = parseInt(bForm.numberOfDays) || Math.round((new Date(bForm.endDate).getTime() - new Date(bForm.startDate).getTime()) / 86400000);
    const b: SubletBooking = {
      id: "sb-" + Date.now(), vehicleId: v.id, serviceType: bForm.serviceType, clientName: bForm.clientName, clientPhone: bForm.clientPhone,
      startDate: bForm.startDate, endDate: bForm.endDate, numberOfDays: days,
      supplierDailyRate: v.supplierDailyRate, ourDailyRate: v.ourDailyRate,
      totalSupplierCost: v.supplierDailyRate * days, totalClientCharge: v.ourDailyRate * days,
      totalProfit: (v.ourDailyRate - v.supplierDailyRate) * days,
      status: "active", paymentMethod: bForm.paymentMethod, paymentReference: bForm.paymentReference, notes: bForm.notes, createdAt: new Date().toISOString().split("T")[0],
    };
    setBookings([b, ...bookings]);
    setVehicles(vehicles.map(x => x.id === v.id ? { ...x, status: "active" as const } : x));
    setShowBookingDialog(false);
    setBForm(emptyBForm);
    toast.success("Sublet booking recorded");
  };

  const selectedVehicle = vehicles.find(v => v.id === bForm.vehicleId);
  const bDays = parseInt(bForm.numberOfDays) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Building2 className="h-7 w-7 text-cyan-400" />
            Sublet Assets
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Track assets subleted from other companies across all services — cars, buses, equipment and more</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 gap-2" onClick={() => setShowBookingDialog(true)}>
            <Plus className="h-4 w-4" />New Booking
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700 gap-2" onClick={() => setShowVehicleDialog(true)}>
            <Plus className="h-4 w-4" />Add Vehicle
          </Button>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Sublet Vehicles", value: vehicles.length, sub: vehicles.filter(v => v.status === "available").length + " available", icon: Car, border: "border-cyan-500/30", bg: "from-cyan-500/10 to-cyan-600/5", ic: "text-cyan-400" },
          { label: "Total Charged", value: "KES " + (totalRevenue / 1000).toFixed(0) + "K", sub: "from clients", icon: DollarSign, border: "border-emerald-500/30", bg: "from-emerald-500/10 to-emerald-600/5", ic: "text-emerald-400" },
          { label: "Total Cost", value: "KES " + (totalCost / 1000).toFixed(0) + "K", sub: "paid to suppliers", icon: Building2, border: "border-red-500/30", bg: "from-red-500/10 to-red-600/5", ic: "text-red-400" },
          { label: "Net Profit", value: "KES " + (totalProfit / 1000).toFixed(0) + "K", sub: (totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0) + "% margin", icon: TrendingUp, border: "border-amber-500/30", bg: "from-amber-500/10 to-amber-600/5", ic: "text-amber-400" },
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

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">Sublet Assets</CardTitle>
          <CardDescription className="text-gray-500 text-xs">Assets sourced from external suppliers across all services</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Reg</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Their Rate</TableHead>
                <TableHead>Our Rate</TableHead>
                <TableHead>Profit/Day</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map(v => (
                <TableRow key={v.id}>
                  <TableCell className="text-white font-medium">{v.make} {v.model}<br /><span className="text-xs text-gray-400">{v.color}, {v.year}</span></TableCell>
                  <TableCell className="font-mono text-cyan-400">{v.registration}</TableCell>
                  <TableCell><p className="text-white text-sm">{v.supplierName}</p><p className="text-gray-400 text-xs">{v.supplierPhone}</p></TableCell>
                  <TableCell className="text-red-400 font-semibold">KES {v.supplierDailyRate.toLocaleString()}</TableCell>
                  <TableCell className="text-emerald-400 font-semibold">KES {v.ourDailyRate.toLocaleString()}</TableCell>
                  <TableCell className={profitDay(v) >= 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>KES {profitDay(v).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={margin(v) >= 20 ? "bg-emerald-600 text-white" : margin(v) >= 10 ? "bg-amber-500 text-white" : "bg-red-600 text-white"}>{margin(v)}%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={v.status === "available" ? "bg-green-600 text-white" : v.status === "active" ? "bg-blue-600 text-white" : "bg-gray-600 text-white"}>
                      {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell><Button variant="ghost" size="sm" onClick={() => setViewVehicle(v)}><Eye className="h-4 w-4 text-gray-400" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
            </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">Sublet Bookings</CardTitle>
          <CardDescription className="text-gray-500 text-xs">All client bookings using subleted vehicles</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Supplier Cost</TableHead>
                <TableHead>Client Charge</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-gray-500 py-8">No sublet bookings yet</TableCell></TableRow>
              )}
              {bookings.map(b => {
                const v = vehicles.find(x => x.id === b.vehicleId);
                return (
                  <TableRow key={b.id}>
                    <TableCell><Badge className="bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs">{b.serviceType}</Badge></TableCell>
                    <TableCell className="text-white font-medium">{v ? v.make + " " + v.model : "Unknown"}<br /><span className="text-xs font-mono text-cyan-400">{v?.registration}</span></TableCell>
                    <TableCell><p className="text-white text-sm">{b.clientName}</p><p className="text-gray-400 text-xs">{b.clientPhone}</p></TableCell>
                    <TableCell className="text-gray-300 text-sm">{b.startDate}<br />to {b.endDate}</TableCell>
                    <TableCell className="text-white font-semibold">{b.numberOfDays}</TableCell>
                    <TableCell className="text-red-400 font-semibold">KES {b.totalSupplierCost.toLocaleString()}</TableCell>
                    <TableCell className="text-emerald-400 font-semibold">KES {b.totalClientCharge.toLocaleString()}</TableCell>
                    <TableCell><span className="text-amber-400 font-bold">KES {b.totalProfit.toLocaleString()}</span><br /><span className="text-xs text-gray-500">{Math.round((b.totalProfit / b.totalClientCharge) * 100)}% margin</span></TableCell>
                    <TableCell>
                      <p className="text-white text-sm capitalize">{b.paymentMethod === "mpesa" ? "M-Pesa" : b.paymentMethod.charAt(0).toUpperCase() + b.paymentMethod.slice(1)}</p>
                      <p className="text-gray-400 text-xs font-mono">{b.paymentReference || "-"}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={b.status === "active" ? "bg-blue-600 text-white" : b.status === "completed" ? "bg-green-600 text-white" : "bg-gray-600 text-white"}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
            </div>
            </CardContent>
      </Card>

      {/* Add Vehicle Dialog */}
      <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 flex items-center gap-2"><Car className="h-5 w-5" />Add Sublet Vehicle</DialogTitle>
            <DialogDescription>Record a vehicle subleted from another company or individual</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-3">
              <h4 className="text-cyan-400 font-semibold text-xs uppercase tracking-wide flex items-center gap-2"><Building2 className="h-4 w-4" />Supplier Details</h4>
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
              <div className="grid grid-cols-2 gap-3">
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

            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
              <h4 className="text-blue-400 font-semibold text-xs uppercase tracking-wide flex items-center gap-2"><Car className="h-4 w-4" />Asset / Vehicle Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-gray-200">Make / Type *</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="e.g. Nissan, Bus, Crane" value={vForm.make} onChange={e => setVForm({ ...vForm, make: e.target.value })} /></div>
                <div><Label className="text-gray-200">Model / Description *</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="e.g. X-Trail, 32-Seater, 50T Crane" value={vForm.model} onChange={e => setVForm({ ...vForm, model: e.target.value })} /></div>
                <div><Label className="text-gray-200">Registration *</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white font-mono uppercase" placeholder="KDD 123A" value={vForm.registration} onChange={e => setVForm({ ...vForm, registration: e.target.value.toUpperCase() })} /></div>
                <div><Label className="text-gray-200">Color</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="Black" value={vForm.color} onChange={e => setVForm({ ...vForm, color: e.target.value })} /></div>
                <div><Label className="text-gray-200">Year</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="2022" value={vForm.year} onChange={e => setVForm({ ...vForm, year: e.target.value })} /></div>
              </div>
            </div>

            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <h4 className="text-emerald-400 font-semibold text-xs uppercase tracking-wide flex items-center gap-2"><DollarSign className="h-4 w-4" />Daily Rates (KES)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-red-300">Supplier Rate (we pay) *</Label><Input type="number" className="mt-1 bg-[#0a1628] border-red-500/30 text-white" placeholder="5000" value={vForm.supplierDailyRate} onChange={e => setVForm({ ...vForm, supplierDailyRate: e.target.value })} /></div>
                <div><Label className="text-emerald-300">Our Rate (we charge) *</Label><Input type="number" className="mt-1 bg-[#0a1628] border-emerald-500/30 text-white" placeholder="6500" value={vForm.ourDailyRate} onChange={e => setVForm({ ...vForm, ourDailyRate: e.target.value })} /></div>
              </div>
              {vForm.supplierDailyRate && vForm.ourDailyRate && (
                <div className="rounded-lg bg-[#0a1628] border border-amber-500/30 p-3 flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Profit per day:</span>
                  <div className="text-right">
                    <span className={(parseFloat(vForm.ourDailyRate) > parseFloat(vForm.supplierDailyRate)) ? "text-emerald-400 font-bold text-lg" : "text-red-400 font-bold text-lg"}>
                      KES {(parseFloat(vForm.ourDailyRate) - parseFloat(vForm.supplierDailyRate)).toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-sm ml-2">
                      ({Math.round(((parseFloat(vForm.ourDailyRate) - parseFloat(vForm.supplierDailyRate)) / parseFloat(vForm.supplierDailyRate)) * 100)}% margin)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVehicleDialog(false)}>Cancel</Button>
            <Button onClick={addVehicle} className="bg-cyan-600 hover:bg-cyan-700"><Plus className="h-4 w-4 mr-2" />Add Vehicle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 flex items-center gap-2"><ArrowRight className="h-5 w-5" />New Sublet Booking</DialogTitle>
            <DialogDescription>Assign a subleted vehicle to a client and auto-calculate profit</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-gray-200">Service Type *</Label>
              <select className="w-full mt-1 rounded-lg bg-[#0a1628] border border-violet-500/30 text-white p-2 text-sm"
                value={bForm.serviceType} onChange={e => setBForm({ ...bForm, serviceType: e.target.value })}>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-gray-200">Select Vehicle *</Label>
              <select className="w-full mt-1 rounded-lg bg-[#0a1628] border border-white/20 text-white p-2 text-sm"
                value={bForm.vehicleId} onChange={e => setBForm({ ...bForm, vehicleId: e.target.value })}>
                <option value="">Choose available vehicle...</option>
                {vehicles.filter(v => v.status === "available").map(v => (
                  <option key={v.id} value={v.id}>{v.make} {v.model} - {v.registration} - KES {v.ourDailyRate.toLocaleString()}/day</option>
                ))}
              </select>
            </div>

            {selectedVehicle && (
              <div className="rounded-lg bg-[#0a1628] border border-cyan-500/20 p-3 text-sm">
                <p className="text-cyan-400 font-semibold">{selectedVehicle.make} {selectedVehicle.model} - {selectedVehicle.registration} ({selectedVehicle.color})</p>
                <p className="text-gray-400 mt-1">From: <span className="text-white">{selectedVehicle.supplierName}</span> ({selectedVehicle.supplierPhone})</p>
                <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
                  <span className="text-red-400">Cost: KES {selectedVehicle.supplierDailyRate.toLocaleString()}/day</span>
                  <span className="text-emerald-400">Charge: KES {selectedVehicle.ourDailyRate.toLocaleString()}/day</span>
                  <span className="text-amber-400 font-bold">Profit: KES {profitDay(selectedVehicle).toLocaleString()}/day</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-gray-200">Client Name *</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="Client name" value={bForm.clientName} onChange={e => setBForm({ ...bForm, clientName: e.target.value })} /></div>
              <div><Label className="text-gray-200">Client Phone</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="+254 7XX XXX XXX" value={bForm.clientPhone} onChange={e => setBForm({ ...bForm, clientPhone: e.target.value })} /></div>
              <div>
                <Label className="text-gray-200">Start Date *</Label>
                <Input type="date" className="mt-1 bg-[#0a1628] border-white/20 text-white" value={bForm.startDate}
                  onChange={e => {
                    const start = e.target.value;
                    const days = parseInt(bForm.numberOfDays) || 1;
                    const end = new Date(new Date(start).getTime() + days * 86400000).toISOString().split("T")[0];
                    setBForm(prev => ({ ...prev, startDate: start, endDate: end }));
                  }} />
              </div>
              <div>
                <Label className="text-gray-200">Number of Days *</Label>
                <Input type="number" min="1" className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="1" value={bForm.numberOfDays}
                  onChange={e => {
                    const days = parseInt(e.target.value) || 0;
                    const end = bForm.startDate && days > 0 ? new Date(new Date(bForm.startDate).getTime() + days * 86400000).toISOString().split("T")[0] : bForm.endDate;
                    setBForm({ ...bForm, numberOfDays: e.target.value, endDate: end });
                  }} />
              </div>
              <div className="col-span-2">
                <Label className="text-gray-400 text-xs">End Date (auto-calculated)</Label>
                <div className="mt-1 rounded-lg bg-[#0a1628] border border-white/10 px-3 py-2 text-gray-300 text-sm">{bForm.endDate || "Set start date and days"}</div>
              </div>
            </div>

            {selectedVehicle && bDays > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2 text-sm">
                <p className="text-amber-400 font-semibold">Booking Summary - {bDays} day{bDays > 1 ? "s" : ""}</p>
                <div className="flex justify-between"><span className="text-gray-400">We pay supplier:</span><span className="text-red-400 font-semibold">KES {(selectedVehicle.supplierDailyRate * bDays).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">We charge client:</span><span className="text-emerald-400 font-semibold">KES {(selectedVehicle.ourDailyRate * bDays).toLocaleString()}</span></div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between">
                  <span className="text-white font-bold">Net Profit:</span>
                  <span className="text-amber-400 font-bold text-base">
                    KES {((selectedVehicle.ourDailyRate - selectedVehicle.supplierDailyRate) * bDays).toLocaleString()}
                    <span className="text-sm font-normal text-gray-400 ml-1">({Math.round(((selectedVehicle.ourDailyRate - selectedVehicle.supplierDailyRate) / selectedVehicle.ourDailyRate) * 100)}% margin)</span>
                  </span>
                </div>
              </div>
            )}

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
                <Label className="text-gray-200">Payment Reference</Label>
                <Input className="mt-1 bg-[#0a1628] border-white/20 text-white font-mono"
                  placeholder={bForm.paymentMethod === "mpesa" ? "e.g. QGH7Y3K2P1" : "e.g. TXN-00123"}
                  value={bForm.paymentReference} onChange={e => setBForm({ ...bForm, paymentReference: e.target.value })} />
              </div>
            </div>
            <div><Label className="text-gray-200">Notes</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="Any notes..." value={bForm.notes} onChange={e => setBForm({ ...bForm, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>Cancel</Button>
            <Button onClick={addBooking} className="bg-cyan-600 hover:bg-cyan-700"><Plus className="h-4 w-4 mr-2" />Record Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Vehicle Dialog */}
      <Dialog open={!!viewVehicle} onOpenChange={() => setViewVehicle(null)}>
        <DialogContent className="max-w-md">
          {viewVehicle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">{viewVehicle.make} {viewVehicle.model}</DialogTitle>
                <DialogDescription className="font-mono text-cyan-400">{viewVehicle.registration} - {viewVehicle.color}, {viewVehicle.year}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="rounded-lg bg-[#0a1628] border border-cyan-500/20 p-3 space-y-1.5 text-sm">
                  <p className="text-cyan-400 font-semibold text-xs uppercase tracking-wide">Supplier</p>
                  <p className="text-white font-medium">{viewVehicle.supplierName} <span className="text-gray-500 text-xs">({viewVehicle.supplierType})</span></p>
                  <p className="text-gray-400">{viewVehicle.supplierPhone}</p>
                  {viewVehicle.supplierEmail && <p className="text-gray-400">{viewVehicle.supplierEmail}</p>}
                </div>
                <div className="rounded-lg bg-[#0a1628] border border-emerald-500/20 p-3 space-y-2 text-sm">
                  <p className="text-emerald-400 font-semibold text-xs uppercase tracking-wide">Rate Breakdown</p>
                  <div className="flex justify-between"><span className="text-gray-400">We pay supplier:</span><span className="text-red-400 font-bold">KES {viewVehicle.supplierDailyRate.toLocaleString()}/day</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">We charge client:</span><span className="text-emerald-400 font-bold">KES {viewVehicle.ourDailyRate.toLocaleString()}/day</span></div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-white font-semibold">Profit per day:</span>
                    <span className="text-amber-400 font-bold">KES {profitDay(viewVehicle).toLocaleString()} ({margin(viewVehicle)}% margin)</span>
                  </div>
                </div>
                <div className="rounded-lg bg-[#0a1628] border border-white/10 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Current Status:</span>
                    <Badge className={viewVehicle.status === "available" ? "bg-green-600 text-white" : viewVehicle.status === "active" ? "bg-blue-600 text-white" : "bg-gray-600 text-white"}>
                      {viewVehicle.status.charAt(0).toUpperCase() + viewVehicle.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
