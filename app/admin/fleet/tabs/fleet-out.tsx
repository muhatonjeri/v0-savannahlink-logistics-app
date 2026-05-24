"use client";

import { useState } from "react";
import { Plus, Pencil, Car, Building2, TrendingUp, DollarSign, Eye, ArrowUpRight, Bell, AlertTriangle, Clock, CreditCard, CalendarClock, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface FleetOutRecord {
  id: string;
  // Vehicle
  vehicleMake: string;
  vehicleModel: string;
  vehicleReg: string;
  vehicleColor: string;
  // Receiver
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  receiverType: "company" | "individual";
  // Agreement
  ourDailyRate: number;        // what we charge the receiver (our income)
  startDate: string;
  endDate: string;
  numberOfDays: number;
  // Payment
  paymentMethod: "mpesa" | "bank" | "cash" | "cheque";
  paymentReference: string;
  amountPaid: number;
  // Status
  status: "active" | "completed" | "cancelled";
  returnCondition: string;
  followUpNotes: string;
  notes: string;
  createdAt: string;
}

const FLEET: { reg: string; make: string; model: string; color: string }[] = [
  { reg: "KDA 789M", make: "Toyota", model: "Land Cruiser Prado", color: "Pearl White" },
  { reg: "KCB 001A", make: "Toyota", model: "Fortuner", color: "Black" },
  { reg: "KDD 456B", make: "Nissan", model: "Patrol", color: "Silver" },
  { reg: "KCX 234C", make: "Toyota", model: "Hilux", color: "White" },
];

const INITIAL: FleetOutRecord[] = [
  {
    id: "fo-001", vehicleMake: "Toyota", vehicleModel: "Fortuner", vehicleReg: "KCB 001A", vehicleColor: "Black",
    receiverName: "Savannah Rentals Ltd", receiverPhone: "+254 722 500 600", receiverEmail: "ops@savannah.co.ke", receiverType: "company",
    ourDailyRate: 7000,
    startDate: "2024-03-08", endDate: "2024-03-12", numberOfDays: 4,
    paymentMethod: "bank", paymentReference: "EQB-TXN-00789", amountPaid: 28000,
    status: "completed", returnCondition: "Good", followUpNotes: "", notes: "Picked up on time, returned in good condition", createdAt: "2024-03-08",
  },
];

const emptyForm = {
  vehicleReg: "", vehicleMake: "", vehicleModel: "", vehicleColor: "",
  receiverName: "", receiverPhone: "", receiverEmail: "", receiverType: "company" as "company" | "individual",
  ourDailyRate: "",
  startDate: "", endDate: "", numberOfDays: "",
  paymentMethod: "mpesa" as "mpesa" | "bank" | "cash" | "cheque",
  paymentReference: "", amountPaid: "",
  status: "active" as "active" | "completed" | "cancelled",
  notes: "",
};

export default function FleetOutTab() {
  const [records, setRecords] = useState<FleetOutRecord[]>([]);
  const [editRecord, setEditRecord] = useState<FleetOutRecord | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [viewRecord, setViewRecord] = useState<FleetOutRecord | null>(null);
  const [form, setForm] = useState(emptyForm);

  const totalEarned = records.filter(r => r.status !== "cancelled").reduce((s, r) => s + r.amountPaid, 0);
  const totalExpected = records.filter(r => r.status !== "cancelled").reduce((s, r) => s + (r.ourDailyRate * r.numberOfDays), 0);
  const outstanding = totalExpected - totalEarned;

  const handleSelectVehicle = (reg: string) => {
    const v = FLEET.find(f => f.reg === reg);
    if (v) setForm(prev => ({ ...prev, vehicleReg: v.reg, vehicleMake: v.make, vehicleModel: v.model, vehicleColor: v.color }));
    else setForm(prev => ({ ...prev, vehicleReg: reg }));
  };

  const handleDays = (val: string) => {
    const days = parseInt(val) || 0;
    const end = form.startDate && days > 0
      ? new Date(new Date(form.startDate).getTime() + days * 86400000).toISOString().split("T")[0]
      : form.endDate;
    setForm(prev => ({ ...prev, numberOfDays: val, endDate: end }));
  };

  const handleStartDate = (val: string) => {
    const days = parseInt(form.numberOfDays) || 1;
    const end = new Date(new Date(val).getTime() + days * 86400000).toISOString().split("T")[0];
    setForm(prev => ({ ...prev, startDate: val, endDate: end }));
  };

  const totalDue = parseFloat(form.ourDailyRate) * parseInt(form.numberOfDays) || 0;
  const balance = totalDue - (parseFloat(form.amountPaid) || 0);

  const addRecord = () => {
    if (!form.receiverName || !form.vehicleReg || !form.ourDailyRate || !form.startDate || !form.numberOfDays) {
      toast.error("Fill in all required fields"); return;
    }
    const days = parseInt(form.numberOfDays);
    const r: FleetOutRecord = {
      id: "fo-" + Date.now(),
      vehicleMake: form.vehicleMake, vehicleModel: form.vehicleModel,
      vehicleReg: form.vehicleReg.toUpperCase(), vehicleColor: form.vehicleColor,
      receiverName: form.receiverName, receiverPhone: form.receiverPhone,
      receiverEmail: form.receiverEmail, receiverType: form.receiverType,
      ourDailyRate: parseFloat(form.ourDailyRate),
      startDate: form.startDate, endDate: form.endDate, numberOfDays: days,
      paymentMethod: form.paymentMethod, paymentReference: form.paymentReference,
      amountPaid: parseFloat(form.amountPaid) || 0,
      status: form.status, returnCondition: form.returnCondition, followUpNotes: form.followUpNotes, notes: form.notes,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setRecords([r, ...records]);
    setShowDialog(false);
    setForm(emptyForm);
    toast.success("Fleet-out record added");
  };

  // ── NOTIFICATION ENGINE ──────────────────────────────
  const today = new Date();
  today.setHours(0,0,0,0);

  interface FleetNotification {
    id: string;
    type: string;
    title: string;
    message: string;
    severity: "critical" | "warning" | "info";
  }

  const notifications: FleetNotification[] = [];

  records.forEach(r => {
    if (r.status === "cancelled" || r.status === "completed") return;
    const end = new Date(r.endDate);
    end.setHours(0,0,0,0);
    const diffDays = Math.ceil((end.getTime() - today.getTime()) / 86400000);
    const due = r.ourDailyRate * r.numberOfDays;
    const balance = due - r.amountPaid;

    if (diffDays < 0) {
      notifications.push({ id: r.id + "-late", type: "returned_late", severity: "critical",
        title: "Overdue Return",
        message: r.vehicleMake + " " + r.vehicleModel + " (" + r.vehicleReg + ") given to " + r.receiverName + " was due back " + Math.abs(diffDays) + " day(s) ago (" + r.endDate + ")" });
    } else if (diffDays === 0) {
      notifications.push({ id: r.id + "-today", type: "return_today", severity: "critical",
        title: "Return Due Today",
        message: r.vehicleMake + " " + r.vehicleModel + " (" + r.vehicleReg + ") must be returned by " + r.receiverName + " today" });
    } else if (diffDays <= 2) {
      notifications.push({ id: r.id + "-soon", type: "return_soon", severity: "warning",
        title: "Return Due in " + diffDays + " Day(s)",
        message: r.vehicleMake + " " + r.vehicleModel + " (" + r.vehicleReg + ") due back from " + r.receiverName + " on " + r.endDate });
    }

    if (balance > 0) {
      if (diffDays < 0) {
        notifications.push({ id: r.id + "-bal", type: "overdue", severity: "critical",
          title: "Overdue Payment",
          message: r.receiverName + " owes KES " + balance.toLocaleString() + " — period ended " + Math.abs(diffDays) + " day(s) ago. " + (r.followUpNotes || "") });
      } else if (diffDays <= 2) {
        notifications.push({ id: r.id + "-bal-soon", type: "due_soon", severity: "warning",
          title: "Payment Due Soon",
          message: r.receiverName + " — KES " + balance.toLocaleString() + " balance due in " + diffDays + " day(s)" });
      }
    }

    if (r.followUpNotes) {
      notifications.push({ id: r.id + "-followup", type: "followup", severity: "info",
        title: "Follow-up Note",
        message: r.receiverName + " | " + r.vehicleReg + " — " + r.followUpNotes });
    }
  });

  const criticalCount = notifications.filter(n => n.severity === "critical").length;
  const warningCount  = notifications.filter(n => n.severity === "warning").length;

  const severityStyles = {
    critical: { border: "border-red-500/40",   bg: "bg-red-500/10",   icon: "text-red-400",   badge: "bg-red-600 text-white"   },
    warning:  { border: "border-amber-500/40", bg: "bg-amber-500/10", icon: "text-amber-400", badge: "bg-amber-500 text-white" },
    info:     { border: "border-blue-500/40",  bg: "bg-blue-500/10",  icon: "text-blue-400",  badge: "bg-blue-600 text-white"  },
  };
  // ─────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ArrowUpRight className="h-7 w-7 text-violet-400" />
            Fleet Out
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Track vehicles lent to other companies or individuals for sub-renting — monitor income and payment
          </p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700 gap-2" onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4" />Add Record
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Records", value: records.length, sub: records.filter(r => r.status === "active").length + " active", icon: Car, border: "border-violet-500/30", bg: "from-violet-500/10 to-violet-600/5", ic: "text-violet-400" },
          { label: "Total Expected", value: "KES " + (totalExpected / 1000).toFixed(0) + "K", sub: "agreed charges", icon: TrendingUp, border: "border-blue-500/30", bg: "from-blue-500/10 to-blue-600/5", ic: "text-blue-400" },
          { label: "Collected", value: "KES " + (totalEarned / 1000).toFixed(0) + "K", sub: "payments received", icon: DollarSign, border: "border-emerald-500/30", bg: "from-emerald-500/10 to-emerald-600/5", ic: "text-emerald-400" },
          { label: "Outstanding", value: "KES " + (outstanding / 1000).toFixed(0) + "K", sub: "balance due", icon: Building2, border: "border-amber-500/30", bg: "from-amber-500/10 to-amber-600/5", ic: "text-amber-400" },
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

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-400" />
                Fleet Out Alerts
                {criticalCount > 0 && <Badge className="bg-red-600 text-white ml-1">{criticalCount} Critical</Badge>}
                {warningCount > 0 && <Badge className="bg-amber-500 text-white ml-1">{warningCount} Warning</Badge>}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications
                .sort((a, b) => (a.severity === "critical" ? -1 : b.severity === "critical" ? 1 : 0))
                .map(n => {
                  const icons: Record<string, React.ElementType> = {
                    returned_late: XCircle, return_today: CalendarClock, return_soon: Clock,
                    overdue: AlertTriangle, due_soon: CreditCard, followup: Bell,
                  };
                  const Icon = icons[n.type] || Bell;
                  const s = severityStyles[n.severity];
                  return (
                    <div key={n.id} className={"flex items-start gap-3 rounded-lg border p-3 " + s.border + " " + s.bg}>
                      <Icon className={"h-4 w-4 mt-0.5 shrink-0 " + s.icon} />
                      <div>
                        <Badge className={"text-xs px-1.5 py-0 mb-1 " + s.badge}>{n.title}</Badge>
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
          <p className="text-sm text-emerald-300 font-medium">All clear — no overdue vehicles or outstanding payments</p>
        </div>
      )}

      {/* Records Table */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">Fleet Out Records</CardTitle>
          <CardDescription className="text-gray-500 text-xs">Vehicles given to other companies/individuals for sub-renting</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Our Rate</TableHead>
                <TableHead>Total Due</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Follow-up</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 && (
                <TableRow><TableCell colSpan={11} className="text-center text-gray-500 py-8">No fleet-out records yet</TableCell></TableRow>
              )}
              {records.map(r => {
                const due = r.ourDailyRate * r.numberOfDays;
                const bal = due - r.amountPaid;
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <p className="text-white font-medium">{r.vehicleMake} {r.vehicleModel}</p>
                      <p className="text-cyan-400 text-xs font-mono">{r.vehicleReg}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-white text-sm">{r.receiverName}</p>
                      <p className="text-gray-400 text-xs">{r.receiverPhone}</p>
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm">{r.startDate}<br />to {r.endDate}</TableCell>
                    <TableCell className="text-white font-semibold">{r.numberOfDays}</TableCell>
                    <TableCell className="text-violet-400 font-semibold">KES {r.ourDailyRate.toLocaleString()}</TableCell>
                    <TableCell className="text-white font-semibold">KES {due.toLocaleString()}</TableCell>
                    <TableCell className="text-emerald-400 font-semibold">KES {r.amountPaid.toLocaleString()}</TableCell>
                    <TableCell className={bal > 0 ? "text-red-400 font-semibold" : "text-emerald-400 font-semibold"}>
                      KES {bal.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <p className="text-white text-sm capitalize">{r.paymentMethod === "mpesa" ? "M-Pesa" : r.paymentMethod.charAt(0).toUpperCase() + r.paymentMethod.slice(1)}</p>
                      <p className="text-gray-400 text-xs font-mono">{r.paymentReference || "-"}</p>
                    </TableCell>
                    <TableCell>
                      {r.followUpNotes
                        ? <p className="text-amber-300 text-xs max-w-[140px] truncate">{r.followUpNotes}</p>
                        : <span className="text-gray-500 text-xs">-</span>
                      }
                      {r.returnCondition && <p className="text-xs text-gray-400 mt-0.5">{r.returnCondition}</p>}
                    </TableCell>
                    <TableCell>
                      <Badge className={r.status === "active" ? "bg-blue-600 text-white" : r.status === "completed" ? "bg-green-600 text-white" : "bg-gray-600 text-white"}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setViewRecord(r)}>
                        <Eye className="h-4 w-4 text-gray-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Record Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-violet-400 flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />Fleet Out Record
            </DialogTitle>
            <DialogDescription>Record a vehicle given to another company or individual for sub-renting</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">

            {/* Vehicle */}
            <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4 space-y-3">
              <h4 className="text-violet-400 font-semibold text-xs uppercase tracking-wide flex items-center gap-2">
                <Car className="h-4 w-4" />Vehicle
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-gray-200">Select from Fleet</Label>
                  <select className="w-full mt-1 rounded-lg bg-[#0a1628] border border-white/20 text-white p-2 text-sm"
                    value={form.vehicleReg}
                    onChange={e => handleSelectVehicle(e.target.value)}>
                    <option value="">Choose vehicle or type manually below...</option>
                    {FLEET.map(v => (
                      <option key={v.reg} value={v.reg}>{v.make} {v.model} - {v.reg} ({v.color})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-200">Registration *</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white font-mono uppercase"
                    placeholder="KDA 789M" value={form.vehicleReg}
                    onChange={e => setForm({ ...form, vehicleReg: e.target.value.toUpperCase() })} />
                </div>
                <div>
                  <Label className="text-gray-200">Color</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white"
                    placeholder="White" value={form.vehicleColor}
                    onChange={e => setForm({ ...form, vehicleColor: e.target.value })} />
                </div>
                <div>
                  <Label className="text-gray-200">Make</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white"
                    placeholder="Toyota" value={form.vehicleMake}
                    onChange={e => setForm({ ...form, vehicleMake: e.target.value })} />
                </div>
                <div>
                  <Label className="text-gray-200">Model</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white"
                    placeholder="Prado" value={form.vehicleModel}
                    onChange={e => setForm({ ...form, vehicleModel: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Receiver */}
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
              <h4 className="text-blue-400 font-semibold text-xs uppercase tracking-wide flex items-center gap-2">
                <Building2 className="h-4 w-4" />Receiver Details
              </h4>
              <div>
                <Label className="text-gray-200">Receiver Type</Label>
                <div className="flex gap-2 mt-1">
                  {(["company", "individual"] as const).map(t => (
                    <button key={t} type="button"
                      onClick={() => setForm({ ...form, receiverType: t })}
                      className={form.receiverType === t
                        ? "flex-1 py-2 rounded-lg border-2 border-blue-500 bg-blue-500/20 text-blue-300 text-sm font-semibold"
                        : "flex-1 py-2 rounded-lg border-2 border-white/10 bg-white/5 text-gray-400 text-sm"}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-200">{form.receiverType === "company" ? "Company Name" : "Full Name"} *</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white"
                    placeholder={form.receiverType === "company" ? "Savannah Rentals Ltd" : "John Kamau"}
                    value={form.receiverName} onChange={e => setForm({ ...form, receiverName: e.target.value })} />
                </div>
                <div>
                  <Label className="text-gray-200">Phone *</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white"
                    placeholder="+254 7XX XXX XXX"
                    value={form.receiverPhone} onChange={e => setForm({ ...form, receiverPhone: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-200">Email</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white"
                    placeholder="receiver@company.com"
                    value={form.receiverEmail} onChange={e => setForm({ ...form, receiverEmail: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Rates & Period */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <h4 className="text-emerald-400 font-semibold text-xs uppercase tracking-wide flex items-center gap-2">
                <DollarSign className="h-4 w-4" />Rates & Period
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-emerald-300">Our Daily Rate (KES) — what we charge *</Label>
                  <Input type="number" className="mt-1 bg-[#0a1628] border-emerald-500/30 text-white"
                    placeholder="7000" value={form.ourDailyRate}
                    onChange={e => setForm({ ...form, ourDailyRate: e.target.value })} />
                </div>
                <div>
                  <Label className="text-gray-200">Start Date *</Label>
                  <Input type="date" className="mt-1 bg-[#0a1628] border-white/20 text-white"
                    value={form.startDate} onChange={e => handleStartDate(e.target.value)} />
                </div>
                <div>
                  <Label className="text-gray-200">Number of Days *</Label>
                  <Input type="number" min="1" className="mt-1 bg-[#0a1628] border-white/20 text-white"
                    placeholder="e.g. 5" value={form.numberOfDays} onChange={e => handleDays(e.target.value)} />
                </div>
                <div>
                  <Label className="text-gray-200">End Date (auto-calculated)</Label>
                  <div className="mt-1 rounded-lg bg-[#0a1628] border border-white/10 px-3 py-2 text-gray-300 text-sm h-[38px] flex items-center">
                    {form.endDate || "Set start date and days"}
                  </div>
                </div>

              </div>

              {/* Financial summary */}
              {form.ourDailyRate && form.numberOfDays && (
                <div className="rounded-lg bg-[#0a1628] border border-violet-500/30 p-3 space-y-2 text-sm">
                  <p className="text-violet-400 font-semibold">Financial Summary</p>
                  <div className="flex justify-between">
                    <span className="text-gray-400">We charge receiver:</span>
                    <span className="text-emerald-400 font-bold">KES {(parseFloat(form.ourDailyRate) * parseInt(form.numberOfDays)).toLocaleString()}</span>
                  </div>

                </div>
              )}
            </div>

            {/* Payment */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
              <h4 className="text-amber-400 font-semibold text-xs uppercase tracking-wide">Payment</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-200">Payment Method</Label>
                  <select className="w-full mt-1 rounded-lg bg-[#0a1628] border border-white/20 text-white p-2 text-sm"
                    value={form.paymentMethod}
                    onChange={e => setForm({ ...form, paymentMethod: e.target.value as "mpesa" | "bank" | "cash" | "cheque" })}>
                    <option value="mpesa">M-Pesa</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <Label className="text-gray-200">Payment Reference</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white font-mono"
                    placeholder={form.paymentMethod === "mpesa" ? "e.g. QGH7Y3K2P1" : "e.g. TXN-00123"}
                    value={form.paymentReference}
                    onChange={e => setForm({ ...form, paymentReference: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-200">Amount Paid (KES)</Label>
                  <Input type="number" className="mt-1 bg-[#0a1628] border-white/20 text-white"
                    placeholder="0 if not yet paid"
                    value={form.amountPaid}
                    onChange={e => setForm({ ...form, amountPaid: e.target.value })} />
                </div>
              </div>
              {form.ourDailyRate && form.numberOfDays && (
                <div className="rounded-lg bg-[#0a1628] border border-amber-500/20 p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Total due:</span><span className="text-white font-bold">KES {totalDue.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Amount paid:</span><span className="text-emerald-400 font-semibold">KES {(parseFloat(form.amountPaid) || 0).toLocaleString()}</span></div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between">
                    <span className="text-gray-400">Balance remaining:</span>
                    <span className={balance > 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>KES {balance.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Follow-up / Return Info */}
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 space-y-3">
              <h4 className="text-rose-400 font-semibold text-xs uppercase tracking-wide">Follow-up / Return Info</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-200">Return Condition</Label>
                  <select className="w-full mt-1 rounded-lg bg-[#0a1628] border border-white/20 text-white p-2 text-sm"
                    value={form.returnCondition} onChange={e => setForm({ ...form, returnCondition: e.target.value })}>
                    <option value="">Not yet returned</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair - minor issues</option>
                    <option value="Damaged">Damaged - needs repair</option>
                  </select>
                </div>
                <div>
                  <Label className="text-gray-200">Follow-up Notes</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white"
                    placeholder="e.g. Called 3 times, awaiting payment..."
                    value={form.followUpNotes} onChange={e => setForm({ ...form, followUpNotes: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Status & Notes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-200">Status</Label>
                <select className="w-full mt-1 rounded-lg bg-[#0a1628] border border-white/20 text-white p-2 text-sm"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as "active" | "completed" | "cancelled" })}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <Label className="text-gray-200">Notes</Label>
                <Input className="mt-1 bg-[#0a1628] border-white/20 text-white"
                  placeholder="Any notes..."
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={addRecord} className="bg-violet-600 hover:bg-violet-700">
              <Plus className="h-4 w-4 mr-2" />Add Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Record Dialog */}
      <Dialog open={!!viewRecord} onOpenChange={() => setViewRecord(null)}>
        <DialogContent className="max-w-md">
          {viewRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">{viewRecord.vehicleMake} {viewRecord.vehicleModel}</DialogTitle>
                <DialogDescription className="text-cyan-400 font-mono">{viewRecord.vehicleReg} - {viewRecord.vehicleColor}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2 text-sm">
                <div className="rounded-lg bg-[#0a1628] border border-blue-500/20 p-3 space-y-1">
                  <p className="text-blue-400 font-semibold text-xs uppercase tracking-wide mb-1">Receiver</p>
                  <p className="text-white font-medium">{viewRecord.receiverName} <span className="text-gray-500 text-xs">({viewRecord.receiverType})</span></p>
                  <p className="text-gray-400">{viewRecord.receiverPhone}</p>
                  {viewRecord.receiverEmail && <p className="text-gray-400">{viewRecord.receiverEmail}</p>}
                </div>
                <div className="rounded-lg bg-[#0a1628] border border-violet-500/20 p-3 space-y-1.5">
                  <p className="text-violet-400 font-semibold text-xs uppercase tracking-wide mb-1">Agreement</p>
                  <div className="flex justify-between"><span className="text-gray-400">Period:</span><span className="text-white">{viewRecord.startDate} to {viewRecord.endDate} ({viewRecord.numberOfDays} days)</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Our daily rate:</span><span className="text-emerald-400 font-bold">KES {viewRecord.ourDailyRate.toLocaleString()}/day</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Total due:</span><span className="text-white font-bold">KES {(viewRecord.ourDailyRate * viewRecord.numberOfDays).toLocaleString()}</span></div>

                </div>
                <div className="rounded-lg bg-[#0a1628] border border-amber-500/20 p-3 space-y-1.5">
                  <p className="text-amber-400 font-semibold text-xs uppercase tracking-wide mb-1">Payment</p>
                  <div className="flex justify-between"><span className="text-gray-400">Method:</span><span className="text-white capitalize">{viewRecord.paymentMethod === "mpesa" ? "M-Pesa" : viewRecord.paymentMethod}</span></div>
                  {viewRecord.paymentReference && <div className="flex justify-between"><span className="text-gray-400">Reference:</span><span className="text-white font-mono">{viewRecord.paymentReference}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-400">Paid:</span><span className="text-emerald-400 font-bold">KES {viewRecord.amountPaid.toLocaleString()}</span></div>
                  <div className="flex justify-between border-t border-white/10 pt-1.5">
                    <span className="text-gray-400">Balance:</span>
                    <span className={(viewRecord.ourDailyRate * viewRecord.numberOfDays - viewRecord.amountPaid) > 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                      KES {(viewRecord.ourDailyRate * viewRecord.numberOfDays - viewRecord.amountPaid).toLocaleString()}
                    </span>
                  </div>
                </div>
                {(viewRecord.returnCondition || viewRecord.followUpNotes || viewRecord.notes) && (
                  <div className="rounded-lg bg-[#0a1628] border border-rose-500/20 p-3 space-y-1.5">
                    <p className="text-rose-400 font-semibold text-xs uppercase tracking-wide mb-1">Follow-up / Return</p>
                    {viewRecord.returnCondition && <div className="flex justify-between text-sm"><span className="text-gray-400">Return condition:</span><span className="text-white">{viewRecord.returnCondition}</span></div>}
                    {viewRecord.followUpNotes && <p className="text-amber-300 text-xs">{viewRecord.followUpNotes}</p>}
                    {viewRecord.notes && <p className="text-gray-400 text-xs">Notes: <span className="text-gray-300">{viewRecord.notes}</span></p>}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      {editRecord && (
        <Dialog open={!!editRecord} onOpenChange={() => setEditRecord(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="text-amber-400">Edit Fleet Out Record</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              {[
                ["Receiver Name", "receiverName"], ["Receiver Phone", "receiverPhone"],
                ["Follow Up Notes", "followUpNotes"], ["Return Condition", "returnCondition"],
              ].map(([label, key]) => (
                <div key={key}>
                  <Label className="text-gray-200 text-xs">{label}</Label>
                  <Input className="mt-1 bg-[#0a1628] border-white/20 text-white"
                    value={String((editForm as any)[key] || "")}
                    onChange={e => setEditForm({...editForm, [key]: e.target.value})} />
                </div>
              ))}
              <div>
                <Label className="text-gray-200 text-xs">Status</Label>
                <select className="mt-1 w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm"
                  value={String(editForm.status || "active")} onChange={e => setEditForm({...editForm, status: e.target.value as any})}>
                  <option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditRecord(null)}>Cancel</Button>
              <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleUpdate}>Update</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>

      {/* Edit Fleet Out Dialog */}
      {editRecord && (
        <Dialog open={!!editRecord} onOpenChange={() => setEditRecord(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-amber-400 flex items-center gap-2">
                <Pencil className="h-5 w-5" />Edit Fleet Out Record
              </DialogTitle>
              <DialogDescription>{editRecord.vehicleMake} {editRecord.vehicleModel} — {editRecord.receiverName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-gray-200">Vehicle Make</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" defaultValue={editRecord.vehicleMake} id="fo-make" /></div>
                <div><Label className="text-gray-200">Vehicle Model</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" defaultValue={editRecord.vehicleModel} id="fo-model" /></div>
                <div><Label className="text-gray-200">Registration</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white font-mono" defaultValue={editRecord.vehicleReg} id="fo-reg" /></div>
                <div><Label className="text-gray-200">Receiver Name</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" defaultValue={editRecord.receiverName} id="fo-receiver" /></div>
                <div><Label className="text-gray-200">Phone</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" defaultValue={editRecord.receiverPhone} id="fo-phone" /></div>
                <div><Label className="text-gray-200">Daily Rate (KES)</Label><Input type="number" className="mt-1 bg-[#0a1628] border-white/20 text-white" defaultValue={editRecord.ourDailyRate} id="fo-rate" /></div>
                <div><Label className="text-gray-200">Start Date</Label><Input type="date" className="mt-1 bg-[#0a1628] border-white/20 text-white" defaultValue={editRecord.startDate} id="fo-start" /></div>
                <div><Label className="text-gray-200">End Date</Label><Input type="date" className="mt-1 bg-[#0a1628] border-white/20 text-white" defaultValue={editRecord.endDate} id="fo-end" /></div>
                <div><Label className="text-gray-200">Amount Paid (KES)</Label><Input type="number" className="mt-1 bg-[#0a1628] border-white/20 text-white" defaultValue={editRecord.amountPaid} id="fo-paid" /></div>
                <div>
                  <Label className="text-gray-200">Status</Label>
                  <select className="mt-1 w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm" defaultValue={editRecord.status} id="fo-status">
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="col-span-2"><Label className="text-gray-200">Return Condition</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" defaultValue={editRecord.returnCondition} id="fo-condition" /></div>
                <div className="col-span-2"><Label className="text-gray-200">Follow-up Notes</Label><Input className="mt-1 bg-[#0a1628] border-white/20 text-white" defaultValue={editRecord.followUpNotes} id="fo-notes" /></div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditRecord(null)}>Cancel</Button>
              <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={() => {
                const get = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || "";
                const updated = { ...editRecord, vehicleMake: get("fo-make"), vehicleModel: get("fo-model"), vehicleReg: get("fo-reg"), receiverName: get("fo-receiver"), receiverPhone: get("fo-phone"), ourDailyRate: Number(get("fo-rate")), startDate: get("fo-start"), endDate: get("fo-end"), amountPaid: Number(get("fo-paid")), status: get("fo-status") as FleetOutRecord["status"], returnCondition: get("fo-condition"), followUpNotes: get("fo-notes") };
                setRecords(records.map(r => r.id === editRecord.id ? updated : r));
                setEditRecord(null);
              }}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
  );
}
