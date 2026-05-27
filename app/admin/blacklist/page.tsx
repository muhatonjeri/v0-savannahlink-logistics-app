"use client";

import { useState } from "react";
import {
  ShieldAlert, Search, Plus, Eye, Trash2, User, Phone, IdCard,
  Calendar, AlertTriangle, Skull, Banknote, Hammer, CreditCard, Car,
  Syringe, Sword, CircleAlert, HelpCircle, Edit, type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
type RecordType = "theft"|"fraud"|"damage"|"non-payment"|"accident"|"drug-related"|"violent-dangerous"|"suspicious"|"other";
type Severity   = "low"|"medium"|"high"|"critical";
type Status     = "active"|"under-review"|"resolved";

interface BlacklistEntry {
  id: string;
  fullName: string;
  idNumber: string;
  phoneNumber: string;
  residence?: string;
  recordType: RecordType;
  severity: Severity;
  description: string;
  incidentDate: string;
  reportedBy: string;
  vehicleInvolved?: string;
  amountOwed?: number;
  policeReportNumber?: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

// ── Config — ALL 9 types defined ──────────────────────────────────────────────
const TYPE_CONFIG: Record<RecordType, { label: string; icon: LucideIcon; color: string; bg: string }> = {
  theft:              { label: "Theft",               icon: Skull,       color: "text-red-300",     bg: "bg-red-900/50 border-red-700"        },
  fraud:              { label: "Fraud",               icon: Banknote,    color: "text-orange-300",  bg: "bg-orange-900/50 border-orange-700"   },
  damage:             { label: "Vehicle Damage",      icon: Hammer,      color: "text-yellow-300",  bg: "bg-yellow-900/50 border-yellow-700"   },
  "non-payment":      { label: "Non-Payment",         icon: CreditCard,  color: "text-purple-300",  bg: "bg-purple-900/50 border-purple-700"   },
  accident:           { label: "Accident",            icon: Car,         color: "text-blue-300",    bg: "bg-blue-900/50 border-blue-700"       },
  "drug-related":     { label: "Drug Related",        icon: Syringe,     color: "text-emerald-300", bg: "bg-emerald-900/50 border-emerald-700" },
  "violent-dangerous":{ label: "Violent/Dangerous",   icon: Sword,       color: "text-rose-300",    bg: "bg-rose-900/50 border-rose-700"       },
  suspicious:         { label: "Suspicious Activity", icon: CircleAlert, color: "text-amber-300",   bg: "bg-amber-900/50 border-amber-700"     },
  other:              { label: "Other",               icon: HelpCircle,  color: "text-gray-300",    bg: "bg-gray-800/50 border-gray-600"       },
};

const SEV_CONFIG: Record<Severity, { label: string; cls: string }> = {
  low:      { label: "Low",      cls: "bg-green-700 text-white"  },
  medium:   { label: "Medium",   cls: "bg-yellow-600 text-white" },
  high:     { label: "High",     cls: "bg-orange-600 text-white" },
  critical: { label: "Critical", cls: "bg-red-600 text-white"    },
};

const STATUS_CONFIG: Record<Status, { label: string; cls: string }> = {
  active:          { label: "Active",       cls: "bg-red-600 text-white"    },
  "under-review":  { label: "Under Review", cls: "bg-yellow-600 text-white" },
  resolved:        { label: "Resolved",     cls: "bg-green-700 text-white"  },
};

const fmtKES = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(n);

// ── Data from Full_Cleaned_Incident_Log.xlsx ──────────────────────────────────
const BLACKLIST_DATA: BlacklistEntry[] = [
  { id:"INC-001", fullName:"Charles Ikiro Kahuthu",        idNumber:"14518266", phoneNumber:"0743143539 / 0702301197", residence:"",                            recordType:"theft",           severity:"critical", description:"Car Theft - Jommu Safaris",                   status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-002", fullName:"Christine Wambui Muthoni",     idNumber:"37445643", phoneNumber:"",                        residence:"",                            recordType:"theft",           severity:"critical", description:"Car Theft - Accomplice",                      status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-003", fullName:"Kelvin Sibuor",                idNumber:"",         phoneNumber:"0717889934",              residence:"",                            recordType:"fraud",           severity:"high",     description:"Broker Obtaining",                            status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-004", fullName:"Ezra Kingori",                 idNumber:"",         phoneNumber:"0729222825 / 0707021111", residence:"",                            recordType:"fraud",           severity:"high",     description:"Broker Obtaining",                            status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-005", fullName:"Bonface Osieyo",               idNumber:"",         phoneNumber:"0718330310",              residence:"Kitengela/Riverside/Kilimani", recordType:"fraud",           severity:"high",     description:"Broker Obtaining - Multiple victims",         status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-006", fullName:"Samuel Omondi Audi",           idNumber:"28392618", phoneNumber:"",                        residence:"",                            recordType:"drug-related",    severity:"critical", description:"Drug Transport",                              status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-007", fullName:"Cyrus Musroka",                idNumber:"",         phoneNumber:"0722288081 / 0722662244 / 0720500992", residence:"",              recordType:"theft",           severity:"critical", description:"Car Theft",                                   status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-008", fullName:"Jacklyn Wanjiku",              idNumber:"",         phoneNumber:"0711521026",              residence:"",                            recordType:"fraud",           severity:"high",     description:"Broker Obtaining",                            status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-009", fullName:"Allidan Munyao",               idNumber:"",         phoneNumber:"0715253242",              residence:"",                            recordType:"fraud",           severity:"high",     description:"Broker Obtaining",                            status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-010", fullName:"Oscar Tumuti Njoki",           idNumber:"",         phoneNumber:"0705061000",              residence:"Karen/Ngong Rd/Ruaka",         recordType:"violent-dangerous",severity:"critical",description:"Dangerous",                                   status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-011", fullName:"Kelvin Odhiambo Omondi",      idNumber:"32214919", phoneNumber:"0706072557",              residence:"",                            recordType:"drug-related",    severity:"critical", description:"Changaa Distribution",                        status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-012", fullName:"Martin Njenga",                idNumber:"",         phoneNumber:"0715867722",              residence:"",                            recordType:"theft",           severity:"critical", description:"Car Theft",                                   status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-013", fullName:"Gabriel Muiruri",              idNumber:"",         phoneNumber:"0706661422",              residence:"",                            recordType:"theft",           severity:"critical", description:"Car Theft",                                   status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-014", fullName:"Oliver Musyoki Mutisya",       idNumber:"",         phoneNumber:"0732237545 / 0712541354", residence:"",                            recordType:"theft",           severity:"critical", description:"Car Theft",                                   status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-015", fullName:"Humfrey Karimi Wachira",       idNumber:"27303133", phoneNumber:"0722960207",              residence:"",                            recordType:"theft",           severity:"critical", description:"Car Theft",                                   status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-016", fullName:"Ogeto Car Hire",               idNumber:"",         phoneNumber:"0733757671",              residence:"",                            recordType:"fraud",           severity:"high",     description:"Broker Obtaining - Fraudulent car hire business",status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-017", fullName:"Jackline Wanjiku Kungu",       idNumber:"",         phoneNumber:"0711521026",              residence:"",                            recordType:"fraud",           severity:"high",     description:"Broker Obtaining",                            status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-018", fullName:"Allidan Munyao",               idNumber:"",         phoneNumber:"0715253242",              residence:"",                            recordType:"fraud",           severity:"high",     description:"Broker Obtaining - Duplicate entry",          status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-019", fullName:"Oscar Tumuti Njoki",           idNumber:"",         phoneNumber:"0705061000",              residence:"",                            recordType:"fraud",           severity:"high",     description:"Broker Obtaining - Duplicate entry",          status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-020", fullName:"Eliya Waningilo",              idNumber:"",         phoneNumber:"0722873856",              residence:"",                            recordType:"fraud",           severity:"high",     description:"Broker Obtaining - Savenger Hire",            status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-021", fullName:"Benedict Chacha",              idNumber:"",         phoneNumber:"0783804680 / 0717509344", residence:"",                            recordType:"fraud",           severity:"high",     description:"Broker Obtaining",                            status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-022", fullName:"Joseph Wandera",               idNumber:"",         phoneNumber:"0722690518 / 0111050962", residence:"",                            recordType:"fraud",           severity:"high",     description:"Broker Obtaining",                            status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-023", fullName:"Frank Nganga",                 idNumber:"",         phoneNumber:"0739538712 / 0796440037", residence:"",                            recordType:"fraud",           severity:"high",     description:"Broker Obtaining",                            status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-024", fullName:"Israeli 1",                   idNumber:"",         phoneNumber:"+254720245288",           residence:"",                            recordType:"theft",           severity:"critical", description:"Car Theft - Alias",                           status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-025", fullName:"Dan",                          idNumber:"",         phoneNumber:"0724559878",              residence:"",                            recordType:"theft",           severity:"critical", description:"Car Theft - Senior member",                   status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-026", fullName:"Peter Munyao",                 idNumber:"",         phoneNumber:"0757354282 / 0782668144", residence:"",                            recordType:"fraud",           severity:"high",     description:"Broker Obtaining - Bonnke Logistics",         status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-027", fullName:"Godfrey Mwangi",               idNumber:"",         phoneNumber:"0721372494",              residence:"",                            recordType:"fraud",           severity:"high",     description:"Broker Obtaining",                            status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-028", fullName:"Erick Ngarama",                idNumber:"",         phoneNumber:"0732300444",              residence:"",                            recordType:"fraud",           severity:"high",     description:"Malice Broker",                               status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-029", fullName:"Chris Isura",                  idNumber:"",         phoneNumber:"0713985762",              residence:"",                            recordType:"fraud",           severity:"high",     description:"Con Car Owner - Undercutting",                status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-030", fullName:"Simon Nyambura",               idNumber:"",         phoneNumber:"0790024972",              residence:"",                            recordType:"violent-dangerous",severity:"critical","description":"Criminal - Armed",                           status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-031", fullName:"Kelvin Kyalo",                 idNumber:"32249208", phoneNumber:"0729234822",              residence:"",                            recordType:"violent-dangerous",severity:"critical","description":"Criminal - Housebreaking",                   status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-032", fullName:"George Mutinda",               idNumber:"",         phoneNumber:"0726599168",              residence:"",                            recordType:"fraud",           severity:"high",     description:"Fraudster",                                   status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-033", fullName:"Victor Kipngeno Langat",       idNumber:"",         phoneNumber:"+254792608358 / +254791776034", residence:"",                     recordType:"theft",           severity:"critical", description:"Car Theft - Multiple numbers",                status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-034", fullName:"Benson Kimeu",                 idNumber:"",         phoneNumber:"+254723234943",           residence:"",                            recordType:"suspicious",      severity:"medium",   description:"Suspicious Activity",                         status:"under-review", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-035", fullName:"Sammy Odongo",                 idNumber:"",         phoneNumber:"+254742895551 / 0786565706", residence:"",                         recordType:"fraud",           severity:"high",     description:"Broker Obtaining",                            status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-036", fullName:"Dominic Muendo",               idNumber:"",         phoneNumber:"0742861626 / 0706142295", residence:"",                            recordType:"fraud",           severity:"high",     description:"Obtaining - Turbo Miles",                     status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-037", fullName:"Margaret Wangari",             idNumber:"28445340", phoneNumber:"0722466830",              residence:"",                            recordType:"fraud",           severity:"high",     description:"Broker Obtaining",                            status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-038", fullName:"Antony Mahua",                 idNumber:"",         phoneNumber:"0722026950 / +254723026950", residence:"",                         recordType:"fraud",           severity:"high",     description:"Broker Obtaining",                            status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-039", fullName:"Chacha Maroa",                 idNumber:"",         phoneNumber:"+254706821486",           residence:"",                            recordType:"fraud",           severity:"high",     description:"Broker Obtaining",                            status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-040", fullName:"David Kimanzi Mutua",          idNumber:"",         phoneNumber:"+254712852455",           residence:"",                            recordType:"theft",           severity:"critical", description:"Owner Obtainer",                              status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-041", fullName:"Churchill Adipo",              idNumber:"",         phoneNumber:"0737050363 / 0724815420", residence:"",                            recordType:"fraud",           severity:"high",     description:"Obtaining",                                   status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
  { id:"INC-042", fullName:"Daniel Nyabuti",               idNumber:"",         phoneNumber:"+254100411895 / 0759298442", residence:"",                         recordType:"fraud",           severity:"critical", description:"Conman",                                      status:"active", reportedBy:"Admin", incidentDate:"2024-01-01", createdAt:"2024-01-01", updatedAt:"2024-01-01" },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BlacklistPage() {
  const [entries, setEntries] = useState<BlacklistEntry[]>(BLACKLIST_DATA);
  const [search, setSearch]   = useState("");
  const [typeFilter, setTypeFilter]     = useState<string>("all");
  const [sevFilter,  setSevFilter]      = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewing,  setViewing]  = useState<BlacklistEntry | null>(null);
  const [adding,   setAdding]   = useState(false);
  const [editing,  setEditing]  = useState<BlacklistEntry | null>(null);

  // Add/Edit form state
  const blank: Omit<BlacklistEntry,"id"|"createdAt"|"updatedAt"> = {
    fullName:"", idNumber:"", phoneNumber:"", residence:"",
    recordType:"fraud", severity:"high", description:"",
    incidentDate: new Date().toISOString().split("T")[0],
    reportedBy:"Admin", status:"active",
  };
  const [form, setForm] = useState(blank);

  const filtered = entries.filter(e => {
    const q = search.toLowerCase();
    const match = !q ||
      e.fullName.toLowerCase().includes(q) ||
      e.idNumber.includes(q) ||
      e.phoneNumber.includes(q) ||
      e.description.toLowerCase().includes(q);
    return match &&
      (typeFilter   === "all" || e.recordType === typeFilter) &&
      (sevFilter    === "all" || e.severity   === sevFilter)  &&
      (statusFilter === "all" || e.status     === statusFilter);
  });

  const stats = {
    total:    entries.length,
    active:   entries.filter(e => e.status === "active").length,
    critical: entries.filter(e => e.severity === "critical").length,
    owed:     entries.reduce((s, e) => s + (e.amountOwed || 0), 0),
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this record? Cannot be undone.")) return;
    setEntries(p => p.filter(e => e.id !== id));
    toast.success("Record removed");
  };

  const handleStatus = (id: string, status: Status) => {
    setEntries(p => p.map(e => e.id === id ? { ...e, status, updatedAt: new Date().toISOString().split("T")[0] } : e));
    toast.success("Status updated");
  };

  const openEdit = (entry: BlacklistEntry) => {
    setForm({ ...entry });
    setEditing(entry);
  };

  const handleSave = () => {
    if (!form.fullName.trim()) { toast.error("Full name is required"); return; }
    if (!form.description.trim()) { toast.error("Description is required"); return; }
    const now = new Date().toISOString().split("T")[0];
    if (editing) {
      setEntries(p => p.map(e => e.id === editing.id ? { ...e, ...form, updatedAt: now } : e));
      setEditing(null);
      toast.success("Record updated");
    } else {
      const newEntry: BlacklistEntry = {
        ...form,
        id: "INC-" + String(entries.length + 1).padStart(3,"0"),
        createdAt: now, updatedAt: now,
      };
      setEntries(p => [newEntry, ...p]);
      setAdding(false);
      toast.success("Record added");
    }
    setForm(blank);
  };

  const FormDialog = ({ open, onClose, title }: { open: boolean; onClose: () => void; title: string }) => (
    <Dialog open={open} onOpenChange={o => { if (!o) { onClose(); setForm(blank); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <ShieldAlert className="h-5 w-5" />{title}
          </DialogTitle>
          <DialogDescription>Fill in all available details for accurate identification.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2 py-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Full Name *</Label>
            <Input value={form.fullName} onChange={e => setForm(p=>({...p,fullName:e.target.value}))} placeholder="Full legal name" className="bg-[#0a1628] border-white/20 text-white" />
          </div>
          <div className="space-y-1.5">
            <Label>ID / Passport Number</Label>
            <Input value={form.idNumber} onChange={e => setForm(p=>({...p,idNumber:e.target.value}))} placeholder="National ID or Passport" className="bg-[#0a1628] border-white/20 text-white" />
          </div>
          <div className="space-y-1.5">
            <Label>Phone Number(s)</Label>
            <Input value={form.phoneNumber} onChange={e => setForm(p=>({...p,phoneNumber:e.target.value}))} placeholder="0712 345 678 / 0722 000 000" className="bg-[#0a1628] border-white/20 text-white" />
          </div>
          <div className="space-y-1.5">
            <Label>Record Type *</Label>
            <Select value={form.recordType} onValueChange={v => setForm(p=>({...p,recordType:v as RecordType}))}>
              <SelectTrigger className="bg-[#0a1628] border-white/20 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_CONFIG).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Severity *</Label>
            <Select value={form.severity} onValueChange={v => setForm(p=>({...p,severity:v as Severity}))}>
              <SelectTrigger className="bg-[#0a1628] border-white/20 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(SEV_CONFIG).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Incident Date</Label>
            <Input type="date" value={form.incidentDate} onChange={e => setForm(p=>({...p,incidentDate:e.target.value}))} className="bg-[#0a1628] border-white/20 text-white" />
          </div>
          <div className="space-y-1.5">
            <Label>Known Locations / Residence</Label>
            <Input value={form.residence||""} onChange={e => setForm(p=>({...p,residence:e.target.value}))} placeholder="Estate / Area" className="bg-[#0a1628] border-white/20 text-white" />
          </div>
          <div className="space-y-1.5">
            <Label>Vehicle Involved</Label>
            <Input value={form.vehicleInvolved||""} onChange={e => setForm(p=>({...p,vehicleInvolved:e.target.value}))} placeholder="e.g. Toyota Prado KCX 123A" className="bg-[#0a1628] border-white/20 text-white" />
          </div>
          <div className="space-y-1.5">
            <Label>Police Report / OB No.</Label>
            <Input value={form.policeReportNumber||""} onChange={e => setForm(p=>({...p,policeReportNumber:e.target.value}))} placeholder="OB/123/2024" className="bg-[#0a1628] border-white/20 text-white" />
          </div>
          <div className="space-y-1.5">
            <Label>Amount Owed (KES)</Label>
            <Input type="number" value={form.amountOwed||""} onChange={e => setForm(p=>({...p,amountOwed:e.target.value?Number(e.target.value):undefined}))} placeholder="0" className="bg-[#0a1628] border-white/20 text-white" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description *</Label>
            <Textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} placeholder="Detailed incident description..." className="bg-[#0a1628] border-white/20 text-white min-h-[80px]" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { onClose(); setForm(blank); }}>Cancel</Button>
          <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">Save Record</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-rose-500" />Client Blacklist
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{stats.total} flagged individuals · {stats.active} active cases</p>
        </div>
        <Button onClick={() => { setForm(blank); setAdding(true); }} className="bg-red-600 hover:bg-red-700 gap-2">
          <Plus className="h-4 w-4" />Add to Blacklist
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:"Total Records",     value:stats.total,         color:"text-white"      },
          { label:"Active Cases",      value:stats.active,        color:"text-red-400"    },
          { label:"Critical Severity", value:stats.critical,      color:"text-orange-400" },
          { label:"Amount Owed",       value:fmtKES(stats.owed),  color:"text-purple-400", sm:true },
        ].map(({ label, value, color, sm }) => (
          <Card key={label} className="border-white/10 bg-white/5">
            <CardContent className="pt-4 pb-3">
              <p className={`font-bold ${sm?"text-lg":"text-3xl"} ${color}`}>{value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-white/10 bg-white/5">
        <CardContent className="pt-4 pb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search by name, ID, phone, description..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-[#0a1628] border-white/20 text-white" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44 bg-[#0a1628] border-white/20 text-white"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(TYPE_CONFIG).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sevFilter} onValueChange={setSevFilter}>
            <SelectTrigger className="w-36 bg-[#0a1628] border-white/20 text-white"><SelectValue placeholder="All Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              {Object.entries(SEV_CONFIG).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-[#0a1628] border-white/20 text-white"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="under-review">Under Review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm">Blacklist Records</CardTitle>
          <CardDescription>{filtered.length} record{filtered.length !== 1 ? "s" : ""} found</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-gray-400">Client</TableHead>
                  <TableHead className="text-gray-400">ID Number</TableHead>
                  <TableHead className="text-gray-400">Record Type</TableHead>
                  <TableHead className="text-gray-400">Severity</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      {search || typeFilter !== "all" || sevFilter !== "all" || statusFilter !== "all"
                        ? "No records match your filters — try clearing them"
                        : "No blacklist records yet"}
                    </TableCell>
                  </TableRow>
                ) : filtered.map(entry => {
                  const tc = TYPE_CONFIG[entry.recordType];
                  const Icon = tc.icon;
                  return (
                    <TableRow key={entry.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-red-900/30 border border-red-700/40 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-red-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{entry.fullName}</p>
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                              <Phone className="h-3 w-3" />{entry.phoneNumber || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-gray-300 flex items-center gap-1">
                          <IdCard className="h-3 w-3 text-gray-500" />{entry.idNumber || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${tc.color} ${tc.bg} gap-1.5 text-xs border`}>
                          <Icon className="h-3 w-3" />{tc.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${SEV_CONFIG[entry.severity].cls} text-xs`}>
                          {SEV_CONFIG[entry.severity].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select value={entry.status} onValueChange={v => handleStatus(entry.id, v as Status)}>
                          <SelectTrigger className="w-32 h-7 bg-transparent border-white/10 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="under-review">Under Review</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{entry.incidentDate}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white"
                            onClick={() => setViewing(entry)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-400 hover:text-blue-300"
                            onClick={() => openEdit(entry)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300"
                            onClick={() => handleDelete(entry.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />Blacklist Record
            </DialogTitle>
          </DialogHeader>
          {viewing && (() => {
            const tc = TYPE_CONFIG[viewing.recordType];
            const Icon = tc.icon;
            return (
              <div className="space-y-4 text-sm">
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-2">
                  <h3 className="font-bold text-white text-base">{viewing.fullName}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={`${tc.color} ${tc.bg} gap-1.5 border`}>
                      <Icon className="h-3.5 w-3.5" />{tc.label}
                    </Badge>
                    <Badge className={SEV_CONFIG[viewing.severity].cls}>{SEV_CONFIG[viewing.severity].label}</Badge>
                    <Badge className={STATUS_CONFIG[viewing.status].cls}>{STATUS_CONFIG[viewing.status].label}</Badge>
                  </div>
                </div>
                <div className="grid gap-2">
                  {[
                    { icon: IdCard,        label: "ID Number",       val: viewing.idNumber       },
                    { icon: Phone,         label: "Phone",           val: viewing.phoneNumber    },
                    { icon: AlertTriangle, label: "Known Locations", val: viewing.residence      },
                    { icon: Calendar,      label: "Incident Date",   val: viewing.incidentDate   },
                    { icon: Car,           label: "Vehicle",         val: viewing.vehicleInvolved},
                    { icon: User,          label: "Reported By",     val: viewing.reportedBy     },
                  ].filter(r => r.val).map(({ icon: RI, label, val }) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      <RI className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                      <span className="text-gray-400 shrink-0">{label}:</span>
                      <span className="text-white">{val}</span>
                    </div>
                  ))}
                  {viewing.amountOwed ? (
                    <div className="flex items-center gap-2 text-xs">
                      <CreditCard className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                      <span className="text-gray-400 shrink-0">Amount Owed:</span>
                      <span className="text-red-400 font-bold">{fmtKES(viewing.amountOwed)}</span>
                    </div>
                  ) : null}
                  {viewing.policeReportNumber ? (
                    <div className="flex items-center gap-2 text-xs">
                      <AlertTriangle className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                      <span className="text-gray-400 shrink-0">Police Report:</span>
                      <span className="text-white">{viewing.policeReportNumber}</span>
                    </div>
                  ) : null}
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">Description</p>
                  <p className="text-sm text-gray-200">{viewing.description}</p>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-1.5" onClick={() => { openEdit(viewing!); setViewing(null); }}>
              <Edit className="h-3.5 w-3.5" />Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <FormDialog open={adding} onClose={() => setAdding(false)} title="Add to Blacklist" />

      {/* Edit Dialog */}
      <FormDialog open={!!editing} onClose={() => setEditing(null)} title="Edit Blacklist Record" />

    </div>
  );
}
