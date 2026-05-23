"use client";

import { useState, useEffect } from "react";
import { Plus, Car, Building2, TrendingUp, DollarSign, ArrowRight, Eye, Trash2 } from "lucide-react";
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
  Toyota: ["Land Cruiser Prado", "Fortuner", "Hilux", "Hiace", "Coaster", "Land Cruiser 70", "Alphard", "Camry"],
  Nissan: ["X-Trail", "Patrol", "Navara", "Urvan", "Hardbody", "Pathfinder"],
  Mitsubishi: ["Pajero", "L200", "Outlander", "Eclipse Cross"],
  Isuzu: ["D-Max", "MUX", "NPS 75", "FRR 90", "NQR 75"],
  Mercedes: ["Sprinter", "Vito", "GLE", "GLS", "Actros"],
  Volvo: ["FH", "FM", "FE", "B8R Bus"],
  Ford: ["Ranger", "Explorer", "Transit"],
  Scania: ["R-Series", "P-Series", "Bus"],
  Other: ["Custom / Other"],
};

const SERVICES = [
  "Car Rental", "Safari Tours", "Transfers", "Movers",
  "Corporate Rental", "Road Recovery", "Cargo Handling",
  "Shipment Imports", "Construction Equipment",
];

const AREAS = [
  "Nairobi CBD", "Westlands", "Karen", "Kilimani", "Langata",
  "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika",
  "Masai Mara", "Amboseli", "Tsavo", "Samburu",
  "Upcountry", "Cross-border", "Airport Transfers", "Custom",
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
  notes: "",
};

export default function SubletsPage() {
  const [vehicles, setVehicles] = useState<SubletVehicle[]>(INITIAL_VEHICLES);
  const [bookings, setBookings] = useState<SubletBooking[]>(INITIAL_BOOKINGS);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [viewRecord, setViewRecord] = useState<SubletBooking | null>(null);
  const [vForm, setVForm] = useState(emptyVForm);
  const [bForm, setBForm] = useState(emptyBForm);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load vehicles registered from Fleet Management
  useEffect(() => {
    const pending = loadPendingSublets();
    if (pending.length > 0) {
      setVehicles(prev => {
        const existing = prev.map(v => v.registration);
        const newOnes = pending.filter((p: SubletVehicle) => !existing.includes(p.registration));
        return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
      });
      toast.success(pending.length + " sublet vehicle(s) synced from Fleet Management");
    }
  }, []);
  const [expenseType, setExpenseType] = useState("Fuel");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNote, setExpenseNote] = useState("");

  const profitDay = (v: SubletVehicle) => v.ourDailyRate - v.supplierDailyRate;
  const marginPct = (v: SubletVehicle) => v.supplierDailyRate > 0 ? Math.round((profitDay(v) / v.supplierDailyRate) * 100) : 0;

  const totalRevenue = bookings.reduce((s, b) => s + b.totalClientCharge, 0);
  const totalCost = bookings.reduce((s, b) => s + b.totalSupplierCost, 0);
  const totalNetProfit = bookings.reduce((s, b) => s + b.netProfit, 0);
  const totalExpAll = bookings.reduce((s, b) => s + b.totalExpenses, 0);

  const selectedVehicle = vehicles.find(v => v.id === bForm.vehicleId);
  const bDays = parseInt(bForm.numberOfDays) || 0;
  const bSupplierCost = selectedVehicle ? selectedVehicle.supplierDailyRate * bDays : 0;
  const bClientCharge = selectedVehicle ? selectedVehicle.ourDailyRate * bDays : 0;
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
    setVehicles([v, ...vehicles]);
    setShowVehicleDialog(false);
    setVForm(emptyVForm);
    toast.success("Sublet asset added");
  };

  const addBooking = () => {
    if (!selectedVehicle) { toast.error("Select a vehicle"); return; }
    if (!bForm.clientName || !bForm.startDate || !bDays) { toast.error("Fill all required fields"); return; }
    const b: SubletBooking = {
      id: "sb-" + Date.now(), vehicleId: selectedVehicle.id,
      serviceType: bForm.serviceType, areaOfUse: bForm.areaOfUse,
      clientName: bForm.clientName, clientPhone: bForm.clientPhone,
      startDate: bForm.startDate, endDate: bForm.endDate, numberOfDays: bDays,
      supplierDailyRate: selectedVehicle.supplierDailyRate,
      ourDailyRate: selectedVehicle.ourDailyRate,
      totalSupplierCost: bSupplierCost, totalClientCharge: bClientCharge,
      expenses, totalExpenses: bTotalExpenses,
      netProfit: bNetProfit, profitPerDay: bProfitPerDay,
      status: "active",
      paymentMethod: bForm.paymentMethod, paymentReference: bForm.paymentReference,
      amountPaid: parseFloat(bForm.amountPaid) || 0,
      notes: bForm.notes, createdAt: new Date().toISOString().split("T")[0],
    };
    setBookings([b, ...bookings]);
    setVehicles(vehicles.map(v => v.id === selectedVehicle.id ? { ...v, status: "active" as const } : v));
    setShowBookingDialog(false);
    setBForm(emptyBForm);
    setExpenses([]);
    toast.success("Sublet booking recorded");
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Building2 className="h-7 w-7 text-cyan-400" />
            Sublet Assets
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Track assets subleted from other companies across all services — monitor cost, profit and expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 gap-2" onClick={() => { setBForm(emptyBForm); setExpenses([]); setShowBookingDialog(true); }}>
            <Plus className="h-4 w-4" />New Booking
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

      {/* Assets Table */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">Sublet Assets</CardTitle>
          <CardDescription className="text-gray-500 text-xs">Assets sourced from external suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Reg</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Their Rate</TableHead>
                <TableHead>Our Rate</TableHead>
                <TableHead>Profit/Day</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell><Badge className={v.status === "available" ? "bg-green-600 text-white" : v.status === "active" ? "bg-blue-600 text-white" : "bg-gray-600 text-white"}>{v.status.charAt(0).toUpperCase() + v.status.slice(1)}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">Sublet Bookings</CardTitle>
          <CardDescription className="text-gray-500 text-xs">All client bookings using subleted assets</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <TableCell><Button variant="ghost" size="sm" onClick={() => setViewRecord(b)}><Eye className="h-4 w-4 text-gray-400" /></Button></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
                <div className="col-span-2">
                  <Label className="text-gray-200">Select Asset *</Label>
                  <select className="w-full mt-1 rounded-lg bg-[#0a1628] border border-white/20 text-white p-2 text-sm"
                    value={bForm.vehicleId} onChange={e => setBForm({ ...bForm, vehicleId: e.target.value })}>
                    <option value="">Choose available asset...</option>
                    {vehicles.filter(v => v.status === "available").map(v => (
                      <option key={v.id} value={v.id}>{v.make} {v.model} - {v.registration} ({v.color}) - KES {v.ourDailyRate.toLocaleString()}/day</option>
                    ))}
                  </select>
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
                <div>
                  <Label className="text-gray-200">Client Name *</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="Client name" value={bForm.clientName} onChange={e => setBForm({ ...bForm, clientName: e.target.value })} />
                </div>
                <div>
                  <Label className="text-gray-200">Client Phone</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white" placeholder="+254 7XX XXX XXX" value={bForm.clientPhone} onChange={e => setBForm({ ...bForm, clientPhone: e.target.value })} />
                </div>
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
    </div>
  );
}
