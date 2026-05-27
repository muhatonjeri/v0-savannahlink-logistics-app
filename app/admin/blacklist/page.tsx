"use client";

import { useState, useMemo } from "react";
import {
  ShieldAlert, Search, Plus, Eye, Edit, Trash2, User, Phone, IdCard,
  Calendar, AlertTriangle, Skull, Banknote, Hammer, CreditCard, Car,
  Syringe, Sword, CircleAlert, HelpCircle, type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
interface BlacklistEntry {
  id: string;
  fullName: string;
  idNumber: string;
  phoneNumber: string;
  residence?: string;
  email?: string;
  drivingLicenseNumber?: string;
  kraPin?: string;
  recordType: "theft"|"fraud"|"damage"|"non-payment"|"accident"|"drug-related"|"violent-dangerous"|"suspicious"|"other";
  severity: "low"|"medium"|"high"|"critical";
  description: string;
  incidentDate: string;
  reportedBy: string;
  vehicleInvolved?: string;
  amountOwed?: number;
  policeReportNumber?: string;
  status: "active"|"resolved"|"under-review";
  createdAt: string;
  updatedAt: string;
}

// ── Config maps ───────────────────────────────────────────────────────────────
const TYPE_CFG: Record<string, { label: string; icon: LucideIcon; badge: string }> = {
  "theft":              { label: "Theft",               icon: Skull,       badge: "bg-red-600 text-white"     },
  "fraud":              { label: "Fraud",               icon: Banknote,    badge: "bg-orange-600 text-white"  },
  "damage":             { label: "Vehicle Damage",      icon: Hammer,      badge: "bg-yellow-600 text-white"  },
  "non-payment":        { label: "Non-Payment",         icon: CreditCard,  badge: "bg-purple-600 text-white"  },
  "accident":           { label: "Accident",            icon: Car,         badge: "bg-blue-600 text-white"    },
  "drug-related":       { label: "Drug Related",        icon: Syringe,     badge: "bg-emerald-600 text-white" },
  "violent-dangerous":  { label: "Violent/Dangerous",   icon: Sword,       badge: "bg-rose-600 text-white"    },
  "suspicious":         { label: "Suspicious Activity", icon: CircleAlert, badge: "bg-amber-600 text-white"   },
  "other":              { label: "Other",               icon: HelpCircle,  badge: "bg-gray-600 text-white"    },
};

const SEV_CFG: Record<string, { label: string; badge: string }> = {
  "low":      { label: "Low",      badge: "bg-green-700 text-white"  },
  "medium":   { label: "Medium",   badge: "bg-yellow-600 text-white" },
  "high":     { label: "High",     badge: "bg-orange-600 text-white" },
  "critical": { label: "Critical", badge: "bg-red-600 text-white"    },
};

const STATUS_CFG: Record<string, { label: string; badge: string }> = {
  "active":       { label: "Active",       badge: "bg-red-600 text-white"    },
  "under-review": { label: "Under Review", badge: "bg-yellow-600 text-white" },
  "resolved":     { label: "Resolved",     badge: "bg-green-700 text-white"  },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(n);

// ── Data (42 real entries from Full_Cleaned_Incident_Log.xlsx) ────────────────
const BLACKLIST_DATA: BlacklistEntry[] = [
  { id: "INC-001", fullName: "Charles Ikiro Kahuthu",          idNumber: "14518266",  phoneNumber: "0743143539 / 0702301197",          residence: "",                         recordType: "theft",             severity: "critical", description: "Car Theft - Jommu Safaris",                 status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-002", fullName: "Christine Wambui Muthoni",        idNumber: "37445643",  phoneNumber: "",                                  residence: "",                         recordType: "theft",             severity: "critical", description: "Car Theft - Accomplice",                    status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-003", fullName: "Kelvin Sibuor",                   idNumber: "",          phoneNumber: "0717889934",                        residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining",                          status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-004", fullName: "Ezra Kingori",                    idNumber: "",          phoneNumber: "0729222825 / 0707021111",           residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining",                          status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-005", fullName: "Bonface Osieyo",                  idNumber: "",          phoneNumber: "0718330310",                        residence: "Kitengela/Riverside/Kilimani", recordType: "fraud",         severity: "high",     description: "Broker Obtaining - Multiple victims",       status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-006", fullName: "Samuel Omondi Audi",              idNumber: "28392618",  phoneNumber: "",                                  residence: "",                         recordType: "drug-related",      severity: "critical", description: "Drug Transport",                            status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-007", fullName: "Cyrus Musroka",                   idNumber: "",          phoneNumber: "0722288081 / 0722662244 / 0720500992", residence: "",                      recordType: "theft",             severity: "critical", description: "Car Theft",                                 status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-008", fullName: "Jacklyn Wanjiku",                 idNumber: "",          phoneNumber: "0711521026",                        residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining",                          status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-009", fullName: "Allidan Munyao",                  idNumber: "",          phoneNumber: "0715253242",                        residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining",                          status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-010", fullName: "Oscar Tumuti Njoki",              idNumber: "",          phoneNumber: "0705061000",                        residence: "Karen/Ngong Rd/Ruaka",     recordType: "violent-dangerous", severity: "critical", description: "Dangerous",                                 status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-011", fullName: "Kelvin Odhiambo Omondi",         idNumber: "32214919",  phoneNumber: "0706072557",                        residence: "",                         recordType: "drug-related",      severity: "critical", description: "Changaa Distribution",                      status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-012", fullName: "Martin Njenga",                   idNumber: "",          phoneNumber: "0715867722",                        residence: "",                         recordType: "theft",             severity: "critical", description: "Car Theft",                                 status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-013", fullName: "Gabriel Muiruri",                 idNumber: "",          phoneNumber: "0706661422",                        residence: "",                         recordType: "theft",             severity: "critical", description: "Car Theft",                                 status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-014", fullName: "Oliver Musyoki Mutisya",          idNumber: "",          phoneNumber: "0732237545 / 0712541354",           residence: "",                         recordType: "theft",             severity: "critical", description: "Car Theft",                                 status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-015", fullName: "Humfrey Karimi Wachira",          idNumber: "27303133",  phoneNumber: "0722960207",                        residence: "",                         recordType: "theft",             severity: "critical", description: "Car Theft",                                 status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-016", fullName: "Ogeto Car Hire",                  idNumber: "",          phoneNumber: "0733757671",                        residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining",                          status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-017", fullName: "Jackline Wanjiku Kungu",          idNumber: "",          phoneNumber: "0711521026",                        residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining",                          status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-018", fullName: "Allidan Munyao",                  idNumber: "",          phoneNumber: "0715253242",                        residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining - Duplicate entry",        status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-019", fullName: "Oscar Tumuti Njoki",              idNumber: "",          phoneNumber: "0705061000",                        residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining - Duplicate entry",        status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-020", fullName: "Eliya Waningilo",                 idNumber: "",          phoneNumber: "0722873856",                        residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining - Savenger Hire",          status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-021", fullName: "Benedict Chacha",                 idNumber: "",          phoneNumber: "0783804680 / 0717509344",           residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining",                          status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-022", fullName: "Joseph Wandera",                  idNumber: "",          phoneNumber: "0722690518 / 0111050962",           residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining",                          status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-023", fullName: "Frank Nganga",                    idNumber: "",          phoneNumber: "0739538712 / 0796440037",           residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining",                          status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-024", fullName: "Israeli 1",                       idNumber: "",          phoneNumber: "+254720245288",                     residence: "",                         recordType: "theft",             severity: "critical", description: "Car Theft - Alias",                         status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-025", fullName: "Dan",                             idNumber: "",          phoneNumber: "0724559878",                        residence: "",                         recordType: "theft",             severity: "critical", description: "Car Theft - Senior",                        status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-026", fullName: "Peter Munyao",                    idNumber: "",          phoneNumber: "0757354282 / 0782668144",           residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining - Bonnke Logistics",       status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-027", fullName: "Godfrey Mwangi",                  idNumber: "",          phoneNumber: "0721372494",                        residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining",                          status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-028", fullName: "Erick Ngarama",                   idNumber: "",          phoneNumber: "0732300444",                        residence: "",                         recordType: "fraud",             severity: "high",     description: "Malice Broker",                             status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-029", fullName: "Chris Isura",                     idNumber: "",          phoneNumber: "0713985762",                        residence: "",                         recordType: "fraud",             severity: "high",     description: "Con Car Owner - Undercutting",              status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-030", fullName: "Simon Nyambura",                  idNumber: "",          phoneNumber: "0790024972",                        residence: "",                         recordType: "violent-dangerous", severity: "critical", description: "Criminal - Armed",                          status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-031", fullName: "Kelvin Kyalo",                    idNumber: "32249208",  phoneNumber: "0729234822",                        residence: "",                         recordType: "violent-dangerous", severity: "critical", description: "Criminal - Housebreaking",                  status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-032", fullName: "George Mutinda",                  idNumber: "",          phoneNumber: "0726599168",                        residence: "",                         recordType: "fraud",             severity: "high",     description: "Fraudster",                                 status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-033", fullName: "Victor Kipng'eno Langat",         idNumber: "",          phoneNumber: "+254792608358 / +254791776034",     residence: "",                         recordType: "theft",             severity: "critical", description: "Car Theft - Multiple numbers",               status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-034", fullName: "Benson Kimeu",                    idNumber: "",          phoneNumber: "+254723234943",                     residence: "",                         recordType: "suspicious",        severity: "medium",   description: "Suspicious Activity",                       status: "under-review", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-035", fullName: "Sammy Odongo",                    idNumber: "",          phoneNumber: "+254742895551 / 0786565706",        residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining",                          status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-036", fullName: "Dominic Muendo",                  idNumber: "",          phoneNumber: "0742861626 / 0706142295",           residence: "",                         recordType: "fraud",             severity: "high",     description: "Obtaining - Turbo Miles",                   status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-037", fullName: "Margaret Wangari",                idNumber: "28445340",  phoneNumber: "0722466830",                        residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining",                          status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-038", fullName: "Antony Mahua",                    idNumber: "",          phoneNumber: "0722026950 / +254723026950",        residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining",                          status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-039", fullName: "Chacha Maroa",                    idNumber: "",          phoneNumber: "+254706821486",                     residence: "",                         recordType: "fraud",             severity: "high",     description: "Broker Obtaining",                          status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-040", fullName: "David Kimanzi Mutua",             idNumber: "",          phoneNumber: "+254712852455",                     residence: "",                         recordType: "theft",             severity: "critical", description: "Owner Obtainer",                            status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-041", fullName: "Churchill Adipo",                  idNumber: "",          phoneNumber: "0737050363 / 0724815420",           residence: "",                         recordType: "fraud",             severity: "high",     description: "Obtaining",                                 status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "INC-042", fullName: "Daniel Nyabuti",                  idNumber: "",          phoneNumber: "+254100411895 / 0759298442",        residence: "",                         recordType: "fraud",             severity: "high",     description: "Conman",                                    status: "active", reportedBy: "Admin", incidentDate: "2024-01-01", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
];

// ── Add/Edit form state type ───────────────────────────────────────────────────
interface EntryForm {
  fullName: string; idNumber: string; phoneNumber: string; email: string;
  residence: string; drivingLicenseNumber: string; kraPin: string;
  recordType: BlacklistEntry["recordType"]; severity: BlacklistEntry["severity"];
  description: string; incidentDate: string; vehicleInvolved: string;
  amountOwed: string; policeReportNumber: string;
}

const EMPTY_FORM: EntryForm = {
  fullName: "", idNumber: "", phoneNumber: "", email: "",
  residence: "", drivingLicenseNumber: "", kraPin: "",
  recordType: "other", severity: "medium",
  description: "", incidentDate: "", vehicleInvolved: "",
  amountOwed: "", policeReportNumber: "",
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BlacklistPage() {
  const [entries, setEntries] = useState<BlacklistEntry[]>(BLACKLIST_DATA);
  const [search, setSearch]   = useState("");
  const [typeFilter, setTypeFilter]     = useState("all");
  const [sevFilter,  setSevFilter]      = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialogs
  const [viewing,  setViewing]  = useState<BlacklistEntry | null>(null);
  const [addOpen,  setAddOpen]  = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<BlacklistEntry | null>(null);
  const [form, setForm] = useState<EntryForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => entries.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      e.fullName.toLowerCase().includes(q) ||
      e.idNumber.toLowerCase().includes(q) ||
      e.phoneNumber.includes(q) ||
      e.description.toLowerCase().includes(q);
    return (
      matchSearch &&
      (typeFilter   === "all" || e.recordType === typeFilter) &&
      (sevFilter    === "all" || e.severity   === sevFilter)  &&
      (statusFilter === "all" || e.status     === statusFilter)
    );
  }), [entries, search, typeFilter, sevFilter, statusFilter]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    entries.length,
    active:   entries.filter(e => e.status === "active").length,
    critical: entries.filter(e => e.severity === "critical").length,
    owed:     entries.reduce((s, e) => s + (e.amountOwed || 0), 0),
  }), [entries]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleStatusChange = (id: string, status: BlacklistEntry["status"]) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status, updatedAt: new Date().toISOString().split("T")[0] } : e));
    toast.success(`Status updated to ${STATUS_CFG[status]?.label ?? status}`);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this record? This cannot be undone.")) return;
    setEntries(prev => prev.filter(e => e.id !== id));
    toast.success("Record removed");
  };

  const openEdit = (entry: BlacklistEntry) => {
    setEditEntry(entry);
    setForm({
      fullName: entry.fullName, idNumber: entry.idNumber,
      phoneNumber: entry.phoneNumber, email: entry.email || "",
      residence: entry.residence || "", drivingLicenseNumber: entry.drivingLicenseNumber || "",
      kraPin: entry.kraPin || "", recordType: entry.recordType, severity: entry.severity,
      description: entry.description, incidentDate: entry.incidentDate,
      vehicleInvolved: entry.vehicleInvolved || "",
      amountOwed: entry.amountOwed?.toString() || "",
      policeReportNumber: entry.policeReportNumber || "",
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.description.trim()) {
      toast.error("Full name and description are required"); return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));

    if (editEntry) {
      setEntries(prev => prev.map(e => e.id === editEntry.id ? {
        ...e, ...form,
        amountOwed: form.amountOwed ? parseFloat(form.amountOwed) : undefined,
        updatedAt: new Date().toISOString().split("T")[0],
      } : e));
      toast.success("Record updated");
      setEditOpen(false); setEditEntry(null);
    } else {
      const newEntry: BlacklistEntry = {
        id: `BL${String(entries.length + 1).padStart(3, "0")}`,
        ...form,
        amountOwed: form.amountOwed ? parseFloat(form.amountOwed) : undefined,
        reportedBy: "Admin", status: "active",
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setEntries(prev => [newEntry, ...prev]);
      toast.success("Added to blacklist");
      setAddOpen(false);
    }
    setForm(EMPTY_FORM); setSaving(false);
  };

  // ── Form UI (shared for add and edit) ────────────────────────────────────────
  const EntryFormUI = () => (
    <div className="space-y-4 py-2">
      {/* Personal */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-gray-300 block mb-1">Full Name *</label>
          <Input value={form.fullName} onChange={e => setForm(f => ({...f, fullName: e.target.value}))} placeholder="Full legal name" className="bg-[#0a1628] border-white/20 text-white" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-300 block mb-1">ID / Passport Number</label>
          <Input value={form.idNumber} onChange={e => setForm(f => ({...f, idNumber: e.target.value}))} placeholder="National ID or Passport" className="bg-[#0a1628] border-white/20 text-white" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-gray-300 block mb-1">Phone Number(s)</label>
          <Input value={form.phoneNumber} onChange={e => setForm(f => ({...f, phoneNumber: e.target.value}))} placeholder="0712 345 678 / 0722 000 000" className="bg-[#0a1628] border-white/20 text-white" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-300 block mb-1">Driving License</label>
          <Input value={form.drivingLicenseNumber} onChange={e => setForm(f => ({...f, drivingLicenseNumber: e.target.value}))} placeholder="License number" className="bg-[#0a1628] border-white/20 text-white" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-300 block mb-1">Residence / Known Area</label>
          <Input value={form.residence} onChange={e => setForm(f => ({...f, residence: e.target.value}))} placeholder="Westlands / Karen" className="bg-[#0a1628] border-white/20 text-white" />
        </div>
      </div>
      {/* Incident */}
      <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-white/10">
        <div>
          <label className="text-xs font-medium text-gray-300 block mb-1">Record Type *</label>
          <Select value={form.recordType} onValueChange={v => setForm(f => ({...f, recordType: v as BlacklistEntry["recordType"]}))}>
            <SelectTrigger className="bg-[#0a1628] border-white/20 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(TYPE_CFG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-300 block mb-1">Severity *</label>
          <Select value={form.severity} onValueChange={v => setForm(f => ({...f, severity: v as BlacklistEntry["severity"]}))}>
            <SelectTrigger className="bg-[#0a1628] border-white/20 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(SEV_CFG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-300 block mb-1">Incident Date</label>
          <Input type="date" value={form.incidentDate} onChange={e => setForm(f => ({...f, incidentDate: e.target.value}))} className="bg-[#0a1628] border-white/20 text-white" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-300 block mb-1">Vehicle Involved</label>
          <Input value={form.vehicleInvolved} onChange={e => setForm(f => ({...f, vehicleInvolved: e.target.value}))} placeholder="Toyota Prado KCX 123A" className="bg-[#0a1628] border-white/20 text-white" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-300 block mb-1">Amount Owed (KES)</label>
          <Input type="number" value={form.amountOwed} onChange={e => setForm(f => ({...f, amountOwed: e.target.value}))} placeholder="0" className="bg-[#0a1628] border-white/20 text-white" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-300 block mb-1">Police Report / OB No.</label>
          <Input value={form.policeReportNumber} onChange={e => setForm(f => ({...f, policeReportNumber: e.target.value}))} placeholder="OB/123/2024" className="bg-[#0a1628] border-white/20 text-white" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-gray-300 block mb-1">Description *</label>
          <Textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Detailed incident description..." className="bg-[#0a1628] border-white/20 text-white min-h-[80px]" />
        </div>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-rose-500" />
            Client Blacklist
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {stats.total} flagged individuals · {stats.active} active cases
          </p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 gap-2" onClick={() => { setForm(EMPTY_FORM); setAddOpen(true); }}>
          <Plus className="h-4 w-4" /> Add to Blacklist
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Records",     value: stats.total,    color: "text-white"       },
          { label: "Active Cases",      value: stats.active,   color: "text-red-400"     },
          { label: "Critical Severity", value: stats.critical, color: "text-orange-400"  },
          { label: "Total Owed",        value: fmt(stats.owed), color: "text-purple-400", small: true },
        ].map(({ label, value, color, small }) => (
          <Card key={label} className="border-white/10 bg-white/5">
            <CardContent className="pt-4 pb-3">
              <p className={`font-bold ${small ? "text-lg" : "text-3xl"} ${color}`}>{value}</p>
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
            <Input placeholder="Search by name, ID, phone, description..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-[#0a1628] border-white/20 text-white" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44 bg-[#0a1628] border-white/20 text-white"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(TYPE_CFG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sevFilter} onValueChange={setSevFilter}>
            <SelectTrigger className="w-36 bg-[#0a1628] border-white/20 text-white"><SelectValue placeholder="All Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              {Object.entries(SEV_CFG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
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
          <CardTitle className="text-white text-sm font-medium">Blacklist Records</CardTitle>
          <CardDescription>{filtered.length} record{filtered.length !== 1 ? "s" : ""} found</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
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
                        ? "No records match your filters"
                        : "No blacklist records"}
                    </TableCell>
                  </TableRow>
                ) : filtered.map(entry => {
                  const tc = TYPE_CFG[entry.recordType] ?? TYPE_CFG["other"];
                  const Icon = tc.icon;
                  return (
                    <TableRow key={entry.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-red-900/40 border border-red-700/50 flex items-center justify-center shrink-0">
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
                          <IdCard className="h-3 w-3 text-gray-500" />
                          {entry.idNumber || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${tc.badge} gap-1.5 text-xs`}>
                          <Icon className="h-3 w-3" />{tc.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${SEV_CFG[entry.severity]?.badge ?? "bg-gray-600 text-white"} text-xs`}>
                          {SEV_CFG[entry.severity]?.label ?? entry.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select value={entry.status} onValueChange={v => handleStatusChange(entry.id, v as BlacklistEntry["status"])}>
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
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => setViewing(entry)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-400 hover:text-blue-300" onClick={() => openEdit(entry)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => handleDelete(entry.id)}>
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
            <DialogDescription>Full details for this flagged individual</DialogDescription>
          </DialogHeader>
          {viewing && (() => {
            const tc = TYPE_CFG[viewing.recordType] ?? TYPE_CFG["other"];
            const Icon = tc.icon;
            return (
              <div className="space-y-4 text-sm">
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-2">
                  <h3 className="font-bold text-white text-base">{viewing.fullName}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${tc.badge} gap-1.5 text-xs`}><Icon className="h-3.5 w-3.5" />{tc.label}</Badge>
                    <Badge className={`${SEV_CFG[viewing.severity]?.badge} text-xs`}>{SEV_CFG[viewing.severity]?.label}</Badge>
                    <Badge className={`${STATUS_CFG[viewing.status]?.badge} text-xs`}>{STATUS_CFG[viewing.status]?.label}</Badge>
                  </div>
                </div>
                <div className="grid gap-2 text-xs">
                  {[
                    { icon: IdCard,        label: "ID Number",  val: viewing.idNumber     },
                    { icon: Phone,         label: "Phone",      val: viewing.phoneNumber  },
                    { icon: Calendar,      label: "Incident",   val: viewing.incidentDate },
                    { icon: AlertTriangle, label: "Area",       val: viewing.residence    },
                    { icon: User,          label: "Reported By",val: viewing.reportedBy   },
                  ].filter(r => r.val).map(({ icon: RI, label, val }) => (
                    <div key={label} className="flex items-center gap-2">
                      <RI className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                      <span className="text-gray-400 shrink-0">{label}:</span>
                      <span className="text-white">{val}</span>
                    </div>
                  ))}
                  {viewing.amountOwed ? (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                      <span className="text-gray-400 shrink-0">Amount Owed:</span>
                      <span className="text-red-400 font-bold">{fmt(viewing.amountOwed)}</span>
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
            <Button className="bg-blue-600 hover:bg-blue-700 gap-1.5" onClick={() => { if (viewing) { setViewing(null); openEdit(viewing); } }}>
              <Edit className="h-3.5 w-3.5" />Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) setForm(EMPTY_FORM); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <Plus className="h-5 w-5" />Add to Blacklist
            </DialogTitle>
            <DialogDescription>Enter the client details and incident information.</DialogDescription>
          </DialogHeader>
          <EntryFormUI />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Add to Blacklist"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={o => { setEditOpen(o); if (!o) { setEditEntry(null); setForm(EMPTY_FORM); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-400 flex items-center gap-2">
              <Edit className="h-5 w-5" />Edit Record — {editEntry?.fullName}
            </DialogTitle>
            <DialogDescription>Update the blacklist record. Changes apply immediately.</DialogDescription>
          </DialogHeader>
          <EntryFormUI />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
