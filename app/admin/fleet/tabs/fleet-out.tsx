"use client";

import { useState, useEffect } from "react";
import {
  Plus, Pencil, Eye, ArrowUpRight, Bell, AlertTriangle, Clock,
  CreditCard, CalendarClock, CheckCircle2, XCircle, Car,
  Phone, Mail, DollarSign, TrendingUp, Users, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface FleetOutRecord {
  id: string;
  vehicleMake: string; vehicleModel: string; vehicleReg: string; vehicleColor: string;
  receiverName: string; receiverPhone: string; receiverEmail: string;
  receiverType: "company" | "individual";
  ourDailyRate: number;
  startDate: string; endDate: string; numberOfDays: number;
  paymentMethod: "mpesa" | "bank" | "cash" | "cheque";
  paymentReference: string; amountPaid: number;
  status: "active" | "completed" | "cancelled";
  returnCondition: string; followUpNotes: string; notes: string;
  createdAt?: string;
}

const emptyForm = {
  vehicleReg: "", vehicleMake: "", vehicleModel: "", vehicleColor: "",
  receiverName: "", receiverPhone: "", receiverEmail: "",
  receiverType: "company" as const,
  ourDailyRate: "", startDate: "", endDate: "", numberOfDays: "",
  paymentMethod: "mpesa" as const, paymentReference: "", amountPaid: "",
  status: "active" as const, returnCondition: "", followUpNotes: "", notes: "",
};

const statusCfg = {
  active:    { label: "Active",    color: "bg-blue-500/20 text-blue-300 border-blue-500/30",     dot: "bg-blue-400"    },
  completed: { label: "Completed", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-300 border-red-500/30",       dot: "bg-red-400"     },
};

const paymentLabels: Record<string, string> = { mpesa: "M-Pesa", bank: "Bank", cash: "Cash", cheque: "Cheque" };

const fmt = (n: number) => "KES " + n.toLocaleString();
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "-";
const diffDays = (end: string) => Math.ceil((new Date(end).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);

export default function FleetOutTab() {
  const [records, setRecords] = useState<FleetOutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [viewRecord, setViewRecord] = useState<FleetOutRecord | null>(null);
  const [editRecord, setEditRecord] = useState<FleetOutRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadRecords = async () => {
    try {
      const res = await fetch("/api/fleet-out");
      const _raw = await res.json();
      const data = Array.isArray(_raw) ? _raw : (_raw.data || []);
      if (Array.isArray(data)) setRecords(data.map((r: Record<string, unknown>) => ({
        id: String(r.id || ""), vehicleMake: String(r.vehicle_make || ""),
        vehicleModel: String(r.vehicle_model || ""), vehicleReg: String(r.vehicle_reg || ""),
        vehicleColor: String(r.vehicle_color || ""), receiverName: String(r.receiver_name || ""),
        receiverPhone: String(r.receiver_phone || ""), receiverEmail: String(r.receiver_email || ""),
        receiverType: String(r.receiver_type || "company") as "company" | "individual",
        ourDailyRate: Number(r.our_daily_rate || 0), startDate: String(r.start_date || ""),
        endDate: String(r.end_date || ""), numberOfDays: Number(r.number_of_days || 0),
        paymentMethod: String(r.payment_method || "mpesa") as "mpesa" | "bank" | "cash" | "cheque",
        paymentReference: String(r.payment_reference || ""), amountPaid: Number(r.amount_paid || 0),
        status: String(r.status || "active") as "active" | "completed" | "cancelled",
        returnCondition: String(r.return_condition || ""), followUpNotes: String(r.follow_up_notes || ""),
        notes: String(r.notes || ""), createdAt: String(r.created_at || ""),
      })));
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { loadRecords(); }, []);

  const handleSave = async () => {
    if (!form.vehicleReg || !form.receiverName || !form.startDate || !form.endDate) {
      toast.error("Fill in vehicle reg, receiver, start and end dates"); return;
    }
    setSaving(true);
    const days = Number(form.numberOfDays) || Math.max(1, diffDays(form.endDate) + Math.ceil((new Date(form.endDate).setHours(0,0,0,0) - new Date(form.startDate).setHours(0,0,0,0)) / 86400000));
    try {
      const res = await fetch("/api/fleet-out", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleMake: form.vehicleMake, vehicleModel: form.vehicleModel, vehicleReg: form.vehicleReg, vehicleColor: form.vehicleColor, receiverName: form.receiverName, receiverPhone: form.receiverPhone, receiverEmail: form.receiverEmail, receiverType: form.receiverType, ourDailyRate: Number(form.ourDailyRate), startDate: form.startDate, endDate: form.endDate, numberOfDays: days, paymentMethod: form.paymentMethod, paymentReference: form.paymentReference, amountPaid: Number(form.amountPaid || 0), returnCondition: form.returnCondition, followUpNotes: form.followUpNotes, notes: form.notes }),
      });
      if (res.ok) { toast.success("Fleet out record saved"); setShowAdd(false); setForm(emptyForm); loadRecords(); }
      else { const d = await res.json(); toast.error(d.error || "Save failed"); }
    } catch(e) { toast.error(String(e)); } finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!editRecord) return;
    setSaving(true);
    try {
      const res = await fetch("/api/fleet-out", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editRecord.id, vehicle_make: editRecord.vehicleMake, vehicle_model: editRecord.vehicleModel, vehicle_reg: editRecord.vehicleReg, receiver_name: editRecord.receiverName, receiver_phone: editRecord.receiverPhone, our_daily_rate: editRecord.ourDailyRate, amount_paid: editRecord.amountPaid, status: editRecord.status, return_condition: editRecord.returnCondition, follow_up_notes: editRecord.followUpNotes }),
      });
      if (res.ok) { toast.success("Record updated"); setEditRecord(null); loadRecords(); }
    } catch(e) { toast.error(String(e)); } finally { setSaving(false); }
  };

  // Notifications
  const today = new Date(); today.setHours(0,0,0,0);
  const alerts = records.filter(r => r.status === "active").flatMap(r => {
    const end = new Date(r.endDate); end.setHours(0,0,0,0);
    const diff = Math.ceil((end.getTime() - today.getTime()) / 86400000);
    const due = r.ourDailyRate * r.numberOfDays;
    const balance = due - r.amountPaid;
    const items = [];
    if (diff < 0) items.push({ type: "overdue", severity: "critical", msg: `${r.vehicleReg} (${r.receiverName}) overdue by ${Math.abs(diff)} day(s)` });
    else if (diff === 0) items.push({ type: "due", severity: "critical", msg: `${r.vehicleReg} due back today from ${r.receiverName}` });
    else if (diff <= 2) items.push({ type: "soon", severity: "warning", msg: `${r.vehicleReg} due back in ${diff} day(s) from ${r.receiverName}` });
    if (balance > 0 && diff <= 0) items.push({ type: "payment", severity: "critical", msg: `${r.receiverName} owes KES ${balance.toLocaleString()} for ${r.vehicleReg}` });
    else if (balance > 0 && diff <= 2) items.push({ type: "payment", severity: "warning", msg: `${r.receiverName} has KES ${balance.toLocaleString()} balance due in ${diff}d` });
    return items;
  });

  const active    = records.filter(r => r.status === "active");
  const totalOut  = active.reduce((s, r) => s + r.ourDailyRate * r.numberOfDays, 0);
  const totalPaid = records.reduce((s, r) => s + r.amountPaid, 0);

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><Label className="text-gray-300 text-xs mb-1 block">{label}</Label>{children}</div>
  );

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-purple-400" />Fleet Out
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">Vehicles lent to external parties</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-purple-600 hover:bg-purple-700 gap-2">
          <Plus className="h-4 w-4" />Add Record
        </Button>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Loans",    value: active.length,              icon: Car,         color: "text-purple-400", border: "border-purple-500/30", bg: "from-purple-500/10" },
          { label: "Expected Income", value: fmt(totalOut),              icon: TrendingUp,  color: "text-emerald-400", border: "border-emerald-500/30", bg: "from-emerald-500/10" },
          { label: "Collected",       value: fmt(totalPaid),             icon: DollarSign,  color: "text-amber-400",   border: "border-amber-500/30",   bg: "from-amber-500/10" },
          { label: "Total Records",   value: records.length,             icon: Users,       color: "text-sky-400",     border: "border-sky-500/30",     bg: "from-sky-500/10" },
        ].map(({ label, value, icon: Icon, color, border, bg }) => (
          <Card key={label} className={"border bg-gradient-to-br to-transparent " + border + " " + bg}>
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                <Icon className={"h-4 w-4 " + color} />
              </div>
              <p className={"text-xl font-bold " + color}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Alerts ── */}
      {alerts.length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-2">
          <p className="text-red-400 font-semibold text-sm flex items-center gap-2">
            <Bell className="h-4 w-4" />{alerts.length} Alert{alerts.length !== 1 ? "s" : ""}
          </p>
          {alerts.map((a, i) => (
            <div key={i} className={"flex items-center gap-2 text-sm rounded-lg px-3 py-2 " + (a.severity === "critical" ? "bg-red-500/15 text-red-300" : "bg-amber-500/15 text-amber-300")}>
              {a.severity === "critical" ? <XCircle className="h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
              {a.msg}
            </div>
          ))}
        </div>
      )}
      {alerts.length === 0 && records.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-emerald-400 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5">
          <CheckCircle2 className="h-4 w-4" />All clear — no overdue vehicles or outstanding balances
        </div>
      )}

      {/* ── Table ── */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Fleet Out Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <ArrowUpRight className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No fleet-out records yet</p>
              <Button className="mt-4 bg-purple-600 hover:bg-purple-700" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add First Record</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Rate/Day</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map(r => {
                  const total   = r.ourDailyRate * r.numberOfDays;
                  const balance = total - r.amountPaid;
                  const cfg     = statusCfg[r.status];
                  const diff    = diffDays(r.endDate);
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <p className="text-white font-semibold">{r.vehicleReg}</p>
                        <p className="text-gray-400 text-xs">{r.vehicleMake} {r.vehicleModel}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-white text-sm">{r.receiverName}</p>
                        <p className="text-gray-400 text-xs">{r.receiverPhone}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-white text-sm">{fmtDate(r.startDate)}</p>
                        <p className={"text-xs " + (r.status === "active" && diff < 0 ? "text-red-400 font-semibold" : diff === 0 ? "text-amber-400 font-semibold" : "text-gray-400")}>
                          → {fmtDate(r.endDate)} {r.status === "active" && diff <= 2 && diff >= 0 ? `(${diff}d left)` : r.status === "active" && diff < 0 ? `(${Math.abs(diff)}d overdue)` : `(${r.numberOfDays}d)`}
                        </p>
                      </TableCell>
                      <TableCell className="text-white font-mono text-sm">{fmt(r.ourDailyRate)}</TableCell>
                      <TableCell className="text-emerald-400 font-semibold text-sm">{fmt(r.amountPaid)}</TableCell>
                      <TableCell className={balance > 0 ? "text-red-400 font-semibold text-sm" : "text-emerald-400 text-sm"}>{fmt(balance)}</TableCell>
                      <TableCell>
                        <Badge className={"border text-xs gap-1 " + cfg.color}>
                          <span className={"w-1.5 h-1.5 rounded-full " + cfg.dot} />{cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setViewRecord(r)} title="View"><Eye className="h-4 w-4 text-gray-400" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditRecord({ ...r })} title="Edit"><Pencil className="h-4 w-4 text-amber-400" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Add Dialog ── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-purple-400 flex items-center gap-2"><ArrowUpRight className="h-5 w-5" />New Fleet Out Record</DialogTitle>
            <DialogDescription>Record a vehicle being lent to an external party</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-3">
              <p className="text-purple-400 text-xs font-bold uppercase tracking-wide">Vehicle Details</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Registration *"><Input className="bg-[#0a1628] border-white/20 text-white font-mono" placeholder="KDA 123B" value={form.vehicleReg} onChange={e => setForm({...form, vehicleReg: e.target.value})} /></Field>
                <Field label="Make"><Input className="bg-[#0a1628] border-white/20 text-white" placeholder="Toyota" value={form.vehicleMake} onChange={e => setForm({...form, vehicleMake: e.target.value})} /></Field>
                <Field label="Model"><Input className="bg-[#0a1628] border-white/20 text-white" placeholder="Land Cruiser" value={form.vehicleModel} onChange={e => setForm({...form, vehicleModel: e.target.value})} /></Field>
                <Field label="Color"><Input className="bg-[#0a1628] border-white/20 text-white" placeholder="Pearl White" value={form.vehicleColor} onChange={e => setForm({...form, vehicleColor: e.target.value})} /></Field>
              </div>
            </div>
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 space-y-3">
              <p className="text-sky-400 text-xs font-bold uppercase tracking-wide">Receiver</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Field label="Receiver Name *"><Input className="bg-[#0a1628] border-white/20 text-white" placeholder="Company or individual name" value={form.receiverName} onChange={e => setForm({...form, receiverName: e.target.value})} /></Field>
                </div>
                <Field label="Phone"><Input className="bg-[#0a1628] border-white/20 text-white" placeholder="+254 7XX XXX XXX" value={form.receiverPhone} onChange={e => setForm({...form, receiverPhone: e.target.value})} /></Field>
                <Field label="Email"><Input className="bg-[#0a1628] border-white/20 text-white" placeholder="email@example.com" value={form.receiverEmail} onChange={e => setForm({...form, receiverEmail: e.target.value})} /></Field>
                <Field label="Type">
                  <select className="w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm" value={form.receiverType} onChange={e => setForm({...form, receiverType: e.target.value as "company"|"individual"})}>
                    <option value="company">Company</option><option value="individual">Individual</option>
                  </select>
                </Field>
              </div>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
              <p className="text-amber-400 text-xs font-bold uppercase tracking-wide">Agreement & Payment</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date *"><Input type="date" className="bg-[#0a1628] border-white/20 text-white" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></Field>
                <Field label="End Date *"><Input type="date" className="bg-[#0a1628] border-white/20 text-white" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></Field>
                <Field label="Daily Rate (KES)"><Input type="number" className="bg-[#0a1628] border-white/20 text-white" placeholder="5000" value={form.ourDailyRate} onChange={e => setForm({...form, ourDailyRate: e.target.value})} /></Field>
                <Field label="Amount Paid (KES)"><Input type="number" className="bg-[#0a1628] border-white/20 text-white" placeholder="0" value={form.amountPaid} onChange={e => setForm({...form, amountPaid: e.target.value})} /></Field>
                <Field label="Payment Method">
                  <select className="w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm" value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value as any})}>
                    {Object.entries(paymentLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Payment Reference"><Input className="bg-[#0a1628] border-white/20 text-white font-mono" placeholder="Ref / M-Pesa code" value={form.paymentReference} onChange={e => setForm({...form, paymentReference: e.target.value})} /></Field>
                <div className="col-span-2"><Field label="Notes"><Input className="bg-[#0a1628] border-white/20 text-white" placeholder="Any additional notes..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></Field></div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Record"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── View Dialog ── */}
      <Dialog open={!!viewRecord} onOpenChange={() => setViewRecord(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {viewRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white text-lg">{viewRecord.vehicleReg} — {viewRecord.vehicleMake} {viewRecord.vehicleModel}</DialogTitle>
                <DialogDescription>
                  <Badge className={"border gap-1 " + statusCfg[viewRecord.status].color}>{statusCfg[viewRecord.status].label}</Badge>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2 text-sm">
                {[
                  { title: "Receiver", color: "border-sky-500/20 bg-sky-500/5", items: [["Name", viewRecord.receiverName], ["Phone", viewRecord.receiverPhone], ["Email", viewRecord.receiverEmail || "-"], ["Type", viewRecord.receiverType]] },
                  { title: "Agreement", color: "border-purple-500/20 bg-purple-500/5", items: [["Start", fmtDate(viewRecord.startDate)], ["End", fmtDate(viewRecord.endDate)], ["Days", String(viewRecord.numberOfDays)], ["Daily Rate", fmt(viewRecord.ourDailyRate)], ["Total Value", fmt(viewRecord.ourDailyRate * viewRecord.numberOfDays)]] },
                  { title: "Payment", color: "border-amber-500/20 bg-amber-500/5", items: [["Method", paymentLabels[viewRecord.paymentMethod] || viewRecord.paymentMethod], ["Reference", viewRecord.paymentReference || "-"], ["Paid", fmt(viewRecord.amountPaid)], ["Balance", fmt(viewRecord.ourDailyRate * viewRecord.numberOfDays - viewRecord.amountPaid)]] },
                ].map(({ title, color, items }) => (
                  <div key={title} className={"rounded-xl border p-3 " + color}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{title}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {items.map(([k, v]) => (
                        <><span className="text-gray-400 text-xs">{k}</span><span className="text-white text-xs font-medium">{v}</span></>
                      ))}
                    </div>
                  </div>
                ))}
                {viewRecord.returnCondition && <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-gray-400 text-xs mb-1">Return Condition</p><p className="text-white text-xs">{viewRecord.returnCondition}</p></div>}
                {viewRecord.followUpNotes && <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"><p className="text-amber-400 text-xs mb-1">Follow-up Notes</p><p className="text-white text-xs">{viewRecord.followUpNotes}</p></div>}
              </div>
              <Button className="w-full bg-amber-600 hover:bg-amber-700 gap-2" onClick={() => { setEditRecord({...viewRecord}); setViewRecord(null); }}>
                <Pencil className="h-4 w-4" />Edit Record
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editRecord} onOpenChange={() => setEditRecord(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {editRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="text-amber-400 flex items-center gap-2"><Pencil className="h-5 w-5" />Edit — {editRecord.vehicleReg}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-2">
                <Field label="Vehicle Reg"><Input className="bg-[#0a1628] border-white/20 text-white font-mono" value={editRecord.vehicleReg} onChange={e => setEditRecord({...editRecord, vehicleReg: e.target.value})} /></Field>
                <Field label="Receiver Name"><Input className="bg-[#0a1628] border-white/20 text-white" value={editRecord.receiverName} onChange={e => setEditRecord({...editRecord, receiverName: e.target.value})} /></Field>
                <Field label="Receiver Phone"><Input className="bg-[#0a1628] border-white/20 text-white" value={editRecord.receiverPhone} onChange={e => setEditRecord({...editRecord, receiverPhone: e.target.value})} /></Field>
                <Field label="Daily Rate"><Input type="number" className="bg-[#0a1628] border-white/20 text-white" value={editRecord.ourDailyRate} onChange={e => setEditRecord({...editRecord, ourDailyRate: Number(e.target.value)})} /></Field>
                <Field label="Amount Paid"><Input type="number" className="bg-[#0a1628] border-white/20 text-white" value={editRecord.amountPaid} onChange={e => setEditRecord({...editRecord, amountPaid: Number(e.target.value)})} /></Field>
                <Field label="Status">
                  <select className="w-full rounded-lg bg-[#0a1628] border border-white/20 text-white px-3 py-2 text-sm" value={editRecord.status} onChange={e => setEditRecord({...editRecord, status: e.target.value as any})}>
                    <option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                  </select>
                </Field>
                <div className="col-span-2"><Field label="Return Condition"><Input className="bg-[#0a1628] border-white/20 text-white" value={editRecord.returnCondition} onChange={e => setEditRecord({...editRecord, returnCondition: e.target.value})} /></Field></div>
                <div className="col-span-2"><Field label="Follow-up Notes"><Input className="bg-[#0a1628] border-white/20 text-white" value={editRecord.followUpNotes} onChange={e => setEditRecord({...editRecord, followUpNotes: e.target.value})} /></Field></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditRecord(null)}>Cancel</Button>
                <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleUpdate} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
