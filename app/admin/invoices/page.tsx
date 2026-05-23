"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import { toast } from "sonner";
import { invoicesApi } from "@/lib/api";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Printer,
  Download,
  Eye,
  Send,
  MoreHorizontal,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Hash,
  User,
  Car,
  Compass,
  Plane,
  Truck,
  Bus,
  Wrench,
  Package,
  Ship,
  HardHat,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";

// Types
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: "mpesa" | "bank" | "cash" | "cheque";
  reference: string;
  note?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerKraPin?: string;
  serviceType: string;
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  amountPaid: number;
  payments: PaymentRecord[];
  status: "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  notes?: string;
  createdAt: string;
}

// Service types with icons
const serviceTypes = [
  { value: "car-rental", label: "Car Rental", icon: Car, color: "text-emerald-500" },
  { value: "safari-tours", label: "Safari Tours", icon: Compass, color: "text-amber-500" },
  { value: "airport-transfers", label: "Airport Transfers", icon: Plane, color: "text-sky-500" },
  { value: "cargo-transport", label: "Cargo Transport", icon: Truck, color: "text-violet-500" },
  { value: "tour-bus", label: "Tour Bus Services", icon: Bus, color: "text-indigo-500" },
  { value: "road-recovery", label: "Road Recovery", icon: Wrench, color: "text-rose-500" },
  { value: "cargo-handling", label: "Cargo Handling", icon: Package, color: "text-orange-500" },
  { value: "shipment-imports", label: "Shipment & Imports", icon: Ship, color: "text-cyan-500" },
  { value: "equipment-hire", label: "Equipment Hire", icon: HardHat, color: "text-yellow-500" },
];

// Status configuration
const statusConfig: Record<Invoice["status"], { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: Clock },
  sent: { label: "Sent", color: "bg-blue-900/300/20 text-blue-400 border-blue-500/30", icon: Send },
  paid: { label: "Paid", color: "bg-green-900/300/20 text-green-400 border-green-500/30", icon: CheckCircle2 },
  partial: { label: "Partial", color: "bg-amber-900/300/20 text-amber-400 border-amber-500/30", icon: AlertCircle },
  overdue: { label: "Overdue", color: "bg-red-900/300/20 text-red-400 border-red-500/30", icon: AlertCircle },
  cancelled: { label: "Cancelled", color: "bg-orange-900/300/20 text-orange-400 border-orange-500/30", icon: XCircle },
};

// Sample data
const initialInvoices: Invoice[] = [
  {
    id: "INV-001",
    invoiceNumber: "INV-2024-001",
    customerName: "Safari Adventures Ltd",
    customerEmail: "bookings@safariadventures.co.ke",
    customerPhone: "+254 722 123 456",
    customerAddress: "Westlands, Nairobi, Kenya",
    customerKraPin: "P051234567X",
    serviceType: "safari-tours",
    items: [
      { id: "1", description: "3-Day Masai Mara Safari Package", quantity: 4, unitPrice: 45000, amount: 180000 },
      { id: "2", description: "Airport Pickup & Drop-off", quantity: 2, unitPrice: 5000, amount: 10000 },
      { id: "3", description: "Park Entry Fees", quantity: 4, unitPrice: 6000, amount: 24000 },
    ],
    subtotal: 214000,
    vatRate: 16,
    vatAmount: 34240,
    total: 248240,
    amountPaid: 248240,
    payments: [
      { id: "p1", date: "2024-03-05", amount: 124120, method: "mpesa", reference: "QGH7Y3K2P1", note: "Deposit" },
      { id: "p2", date: "2024-03-14", amount: 124120, method: "bank", reference: "EQB-TXN-00123", note: "Balance" },
    ],
    status: "paid",
    issueDate: "2024-03-01",
    dueDate: "2024-03-15",
    paymentTerms: "Net 14",
    notes: "Thank you for choosing Moventra Safaris & Logistics Ltd Logistics for your safari experience!",
    createdAt: "2024-03-01",
  },
  {
    id: "INV-002",
    invoiceNumber: "INV-2024-002",
    customerName: "Global Exports Kenya",
    customerEmail: "logistics@globalexports.co.ke",
    customerPhone: "+254 733 456 789",
    customerAddress: "Industrial Area, Mombasa, Kenya",
    customerKraPin: "P098765432Y",
    serviceType: "cargo-transport",
    items: [
      { id: "1", description: "Container Transport - Mombasa to Nairobi", quantity: 3, unitPrice: 85000, amount: 255000 },
      { id: "2", description: "Warehousing Services (7 days)", quantity: 7, unitPrice: 3000, amount: 21000 },
      { id: "3", description: "Customs Clearance Assistance", quantity: 1, unitPrice: 15000, amount: 15000 },
    ],
    subtotal: 291000,
    vatRate: 16,
    vatAmount: 46560,
    total: 337560,
    amountPaid: 150000,
    payments: [
      { id: "p1", date: "2024-03-12", amount: 150000, method: "bank", reference: "EQB-TXN-00456", note: "Deposit 50%" },
    ],
    status: "partial",
    issueDate: "2024-03-10",
    dueDate: "2024-03-24",
    paymentTerms: "Net 14",
    createdAt: "2024-03-10",
  },
  {
    id: "INV-003",
    invoiceNumber: "INV-2024-003",
    customerName: "Executive Tours & Travel",
    customerEmail: "reservations@executivetours.ke",
    customerPhone: "+254 700 111 222",
    customerAddress: "CBD, Nairobi, Kenya",
    serviceType: "car-rental",
    items: [
      { id: "1", description: "Toyota Land Cruiser V8 (30 days)", quantity: 30, unitPrice: 15000, amount: 450000 },
      { id: "2", description: "Professional Driver Services", quantity: 30, unitPrice: 3500, amount: 105000 },
      { id: "3", description: "Fuel Card Top-up", quantity: 1, unitPrice: 50000, amount: 50000 },
    ],
    subtotal: 605000,
    vatRate: 16,
    vatAmount: 96800,
    total: 701800,
    amountPaid: 0,
    payments: [],
    status: "overdue",
    issueDate: "2024-02-15",
    dueDate: "2024-03-01",
    paymentTerms: "Net 14",
    createdAt: "2024-02-15",
  },
];

// Company info for invoice header
const companyInfo = {
  name: "Moventra Safaris & Logistics Ltd Logistics & Tours",
  tagline: "Journeys That Connect",
  address: "Muthaiga Square, off Thika Rd",
  city: "Nairobi, Kenya",
  phone: "+254 727 247 032",
  email: "info@moventrasafarislogisticsltd.com",
  website: "www.Moventra Safaris & Logistics Ltd.com",
  kraPin: "P012345678Z",
  bankName: "Equity Bank Kenya",
  bankAccount: "0123456789012",
  bankBranch: "Nairobi Main Branch",
  mpesaPaybill: "123456",
  mpesaAccountNo: "Invoice Number",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  // Load invoices from Supabase on mount
  useEffect(() => {
    invoicesApi.getAll()
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((inv: Record<string, unknown>) => ({
            id: inv.id as string,
            invoiceNumber: (inv.invoice_number || inv.invoiceNumber) as string,
            customerName: (inv.customer_name || inv.customerName) as string,
            customerEmail: (inv.customer_email || inv.customerEmail) as string,
            customerPhone: (inv.customer_phone || inv.customerPhone) as string,
            customerAddress: (inv.customer_address || inv.customerAddress) as string,
            customerKraPin: (inv.customer_kra_pin || inv.customerKraPin) as string,
            serviceType: (inv.service_type || inv.serviceType) as string,
            items: (inv.items || []) as InvoiceItem[],
            subtotal: Number(inv.subtotal) || 0,
            vatRate: Number(inv.vat_rate || inv.vatRate) || 16,
            vatAmount: Number(inv.vat_amount || inv.vatAmount) || 0,
            total: Number(inv.total) || 0,
            amountPaid: Number(inv.amount_paid || inv.amountPaid) || 0,
            payments: (inv.payments || []) as Payment[],
            status: (inv.status || "draft") as Invoice["status"],
            issueDate: (inv.issue_date || inv.issueDate) as string,
            dueDate: (inv.due_date || inv.dueDate) as string,
            paymentTerms: (inv.payment_terms || inv.paymentTerms) as string,
            notes: inv.notes as string,
            createdAt: (inv.created_at || inv.createdAt) as string,
          }));
          setInvoices(mapped);
        } else {
          setInvoices(initialInvoices);
        }
      })
      .catch(() => setInvoices(initialInvoices))
      .finally(() => setDbLoading(false));
  }, []);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const printRef = useRef<HTMLDivElement>(null);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "mpesa" as PaymentRecord["method"],
    reference: "",
    note: "",
  });

  // New invoice form state
  const [newInvoice, setNewInvoice] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    customerKraPin: "",
    serviceType: "",
    dueDate: "",
    paymentTerms: "Net 14",
    notes: "",
  });
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, amount: 0 },
  ]);
  const [vatRate, setVatRate] = useState(16);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedInvoice ? `Invoice-${selectedInvoice.invoiceNumber}` : "Invoice",
  });

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesService = serviceFilter === "all" || invoice.serviceType === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  // Calculate totals
  const calculateItemAmount = (quantity: number, unitPrice: number) => quantity * unitPrice;
  const calculateSubtotal = () => invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  const calculateVat = () => (calculateSubtotal() * vatRate) / 100;
  const calculateTotal = () => calculateSubtotal() + calculateVat();

  // Update item
  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...invoiceItems];
    if (field === "quantity" || field === "unitPrice") {
      const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: numValue,
        amount: field === "quantity" 
          ? calculateItemAmount(numValue, updatedItems[index].unitPrice)
          : calculateItemAmount(updatedItems[index].quantity, numValue),
      };
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }
    setInvoiceItems(updatedItems);
  };

  // Add new item
  const addItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0, amount: 0 },
    ]);
  };

  // Remove item
  const removeItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  // Create invoice
  const handleCreateInvoice = () => {
    if (!newInvoice.customerName || !newInvoice.serviceType || invoiceItems.some(item => !item.description)) {
      toast.error("Please fill in all required fields");
      return;
    }

    const subtotal = calculateSubtotal();
    const vatAmount = calculateVat();
    const total = calculateTotal();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`;

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber,
      ...newInvoice,
      items: invoiceItems,
      subtotal,
      vatRate,
      vatAmount,
      total,
      amountPaid: 0,
      payments: [],
      status: "draft",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: newInvoice.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
    };

    // Save to Supabase first, then update UI
    invoicesApi.create({
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerPhone: invoice.customerPhone,
      customerAddress: invoice.customerAddress,
      customerKraPin: invoice.customerKraPin,
      serviceType: invoice.serviceType,
      items: invoice.items,
      subtotal: invoice.subtotal,
      vatRate: invoice.vatRate,
      vatAmount: invoice.vatAmount,
      total: invoice.total,
      amountPaid: 0,
      payments: [],
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      paymentTerms: invoice.paymentTerms,
      notes: invoice.notes,
    }).then(saved => {
      setInvoices(prev => [{ ...invoice, id: saved.id }, ...prev]);
      toast.success("Invoice " + invoiceNumber + " created and saved");
    }).catch(err => {
      setInvoices(prev => [invoice, ...prev]);
      toast.warning("Invoice created locally. Sync failed: " + err.message);
    });
    setIsCreateDialogOpen(false);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setNewInvoice({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      customerKraPin: "",
      serviceType: "",
      dueDate: "",
      paymentTerms: "Net 14",
      notes: "",
    });
    setInvoiceItems([{ id: "1", description: "", quantity: 1, unitPrice: 0, amount: 0 }]);
    setVatRate(16);
  };

  // Record a payment (partial or full)
  const handleRecordPayment = () => {
    if (!selectedInvoice) return;
    const amount = parseFloat(paymentForm.amount);
    if (!amount || amount <= 0) { toast.error("Enter a valid payment amount"); return; }
    const balance = selectedInvoice.total - selectedInvoice.amountPaid;
    if (amount > balance) { toast.error(`Amount exceeds balance of KES ${balance.toLocaleString()}`); return; }
    if (!paymentForm.reference) { toast.error("Enter a payment reference"); return; }

    const newPayment: PaymentRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      amount,
      method: paymentForm.method,
      reference: paymentForm.reference,
      note: paymentForm.note,
    };

    const newAmountPaid = selectedInvoice.amountPaid + amount;
    const newStatus: Invoice["status"] = newAmountPaid >= selectedInvoice.total ? "paid" : "partial";

    const updatedInvoice = {
      ...selectedInvoice,
      amountPaid: newAmountPaid,
      payments: [...selectedInvoice.payments, newPayment],
      status: newStatus,
    };

    setInvoices(invoices.map((inv) => inv.id === selectedInvoice.id ? updatedInvoice : inv));
    setSelectedInvoice(updatedInvoice);
    invoicesApi.update(selectedInvoice.id, {
      amount_paid: updatedInvoice.amountPaid,
      payments: updatedInvoice.payments,
      status: updatedInvoice.status,
    }).catch(err => toast.error("Payment sync failed: " + err.message));
    setIsPaymentDialogOpen(false);
    setPaymentForm({ amount: "", method: "mpesa", reference: "", note: "" });
    toast.success(`Payment of KES ${amount.toLocaleString()} recorded successfully`);
  };

  // Update invoice status
  const updateInvoiceStatus = (id: string, status: Invoice["status"]) => {
    setInvoices(invoices.map((inv) => (inv.id === id ? { ...inv, status } : inv)));
    invoicesApi.update(id, { status }).catch(err => toast.error("Sync failed: " + err.message));
    toast.success(`Invoice status updated to ${statusConfig[status].label}`);
  };

  // Get service icon
  const getServiceIcon = (serviceType: string) => {
    const service = serviceTypes.find((s) => s.value === serviceType);
    return service ? service.icon : FileText;
  };

  const getServiceLabel = (serviceType: string) => {
    const service = serviceTypes.find((s) => s.value === serviceType);
    return service ? service.label : serviceType;
  };

  // Stats
  const stats = {
    total: invoices.length,
    draft: invoices.filter((i) => i.status === "draft").length,
    sent: invoices.filter((i) => i.status === "sent").length,
    paid: invoices.filter((i) => i.status === "paid").length,
    partial: invoices.filter((i) => i.status === "partial").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
    totalRevenue: invoices.reduce((sum, i) => sum + i.amountPaid, 0),
    pendingRevenue: invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled").reduce((sum, i) => sum + (i.total - i.amountPaid), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <FileText className="h-7 w-7 text-orange-400" />
            Invoice Management
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Create and manage invoices for all services</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-cyan-500/20 bg-cyan-900/300/5">
          <CardHeader className="pb-2">
            <CardDescription>Total Invoices</CardDescription>
            <CardTitle className="text-3xl text-cyan-600">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.draft} draft, {stats.sent} sent, {stats.paid} paid
            </p>
          </CardContent>
        </Card>
        <Card className="border-green-500/20 bg-green-900/300/5">
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue (Paid)</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              KES {stats.totalRevenue.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{stats.paid} paid invoices</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-amber-900/300/5">
          <CardHeader className="pb-2">
            <CardDescription>Pending Revenue</CardDescription>
            <CardTitle className="text-3xl text-amber-600">
              KES {stats.pendingRevenue.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{stats.sent + stats.overdue} pending invoices</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-red-900/300/5">
          <CardHeader className="pb-2">
            <CardDescription>Overdue</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.overdue}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Require follow-up</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service.value} value={service.value}>
                      {service.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const ServiceIcon = getServiceIcon(invoice.serviceType);
                const statusInfo = statusConfig[invoice.status];
                const StatusIcon = statusInfo.icon;
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.customerName}</p>
                        <p className="text-xs text-muted-foreground">{invoice.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ServiceIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getServiceLabel(invoice.serviceType)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      KES {invoice.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      KES {invoice.amountPaid.toLocaleString()}
                    </TableCell>
                    <TableCell className={`font-semibold ${(invoice.total - invoice.amountPaid) > 0 ? "text-red-500" : "text-green-600"}`}>
                      KES {(invoice.total - invoice.amountPaid).toLocaleString()}
                    </TableCell>
                    <TableCell>{format(new Date(invoice.dueDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Invoice
                          </DropdownMenuItem>
                          {(invoice.status === "sent" || invoice.status === "partial" || invoice.status === "overdue") && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsPaymentDialogOpen(true);
                              }}
                              className="text-green-600"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Record Payment
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsViewDialogOpen(true);
                            setTimeout(() => handlePrint(), 500);
                          }}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {invoice.status === "draft" && (
                            <DropdownMenuItem onClick={() => updateInvoiceStatus(invoice.id, "sent")}>
                              <Send className="h-4 w-4 mr-2" />
                              Mark as Sent
                            </DropdownMenuItem>
                          )}
                          {(invoice.status === "sent" || invoice.status === "overdue") && (
                            <DropdownMenuItem onClick={() => updateInvoiceStatus(invoice.id, "paid")}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => updateInvoiceStatus(invoice.id, "cancelled")}
                            className="text-red-500"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-500" />
              Create New Invoice
            </DialogTitle>
            <DialogDescription>
              Fill in the details to create a new invoice
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="customer" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Customer Name *</Label>
                  <Input
                    placeholder="Company or individual name"
                    value={newInvoice.customerName}
                    onChange={(e) => setNewInvoice({ ...newInvoice, customerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="customer@example.com"
                    value={newInvoice.customerEmail}
                    onChange={(e) => setNewInvoice({ ...newInvoice, customerEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    placeholder="+254 7XX XXX XXX"
                    value={newInvoice.customerPhone}
                    onChange={(e) => setNewInvoice({ ...newInvoice, customerPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>KRA PIN (Optional)</Label>
                  <Input
                    placeholder="P0XXXXXXXXX"
                    value={newInvoice.customerKraPin}
                    onChange={(e) => setNewInvoice({ ...newInvoice, customerKraPin: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address</Label>
                  <Textarea
                    placeholder="Customer address"
                    value={newInvoice.customerAddress}
                    onChange={(e) => setNewInvoice({ ...newInvoice, customerAddress: e.target.value })}
                  />
                </div>

                {/* Bottom accent bar */}
                <div style={{background:"linear-gradient(135deg,#e67e22,#0a1628,#e67e22)",height:"6px"}} />
              </div>
            </TabsContent>

            <TabsContent value="items" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Service Type *</Label>
                <Select
                  value={newInvoice.serviceType}
                  onValueChange={(value) => setNewInvoice({ ...newInvoice, serviceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => {
                      const Icon = service.icon;
                      return (
                        <SelectItem key={service.value} value={service.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${service.color}`} />
                            {service.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Invoice Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {invoiceItems.map((item, index) => (
                    <div key={item.id} className="grid gap-3 sm:grid-cols-12 items-end p-3 rounded-lg border bg-muted/30">
                      <div className="sm:col-span-5 space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateItem(index, "description", e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs">Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs">Unit Price</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs">Amount</Label>
                        <Input
                          value={`KES ${item.amount.toLocaleString()}`}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-900/300/10"
                          onClick={() => removeItem(index)}
                          disabled={invoiceItems.length === 1}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">KES {calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span>VAT Rate:</span>
                    <Select value={vatRate.toString()} onValueChange={(v) => setVatRate(parseInt(v))}>
                      <SelectTrigger className="w-20 h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="8">8%</SelectItem>
                        <SelectItem value="16">16%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="font-medium">KES {calculateVat().toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-cyan-600">KES {calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <DatePicker
                    value={newInvoice.dueDate}
                    onChange={(date) => setNewInvoice({ ...newInvoice, dueDate: date ? date.toISOString().split("T")[0] : "" })}
                    placeholder="Select due date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Select
                    value={newInvoice.paymentTerms}
                    onValueChange={(value) => setNewInvoice({ ...newInvoice, paymentTerms: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                      <SelectItem value="Net 7">Net 7 (7 days)</SelectItem>
                      <SelectItem value="Net 14">Net 14 (14 days)</SelectItem>
                      <SelectItem value="Net 30">Net 30 (30 days)</SelectItem>
                      <SelectItem value="Net 60">Net 60 (60 days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes or terms..."
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice} className="bg-cyan-600 hover:bg-cyan-700">
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Print Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-500" />
              Invoice Preview
            </DialogTitle>
            <div className="flex items-center gap-2">
              {selectedInvoice && (selectedInvoice.status === "sent" || selectedInvoice.status === "partial" || selectedInvoice.status === "overdue") && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setIsPaymentDialogOpen(true)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {selectedInvoice && (
            <div ref={printRef} className="print-receipt" data-print-area="true" style={{backgroundColor:"#ffffff",color:"#1a1a2e",borderRadius:"12px",overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.08)"}}>
              {/* Polished Invoice Template */}

              {/* Top accent bar */}
              <div style={{background:"linear-gradient(135deg,#0a1628 0%,#1a3a5c 50%,#0a1628 100%)",height:"6px"}} />

              <div style={{padding:"32px"}}>
                {/* ── HEADER ── */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:"16px"}}>
                    <Image src="/images/logo.png" alt={companyInfo.name} width={90} height={90}
                      style={{width:"80px",height:"80px",objectFit:"contain",borderRadius:"8px"}} unoptimized />
                    <div>
                      <h1 style={{color:"#0a1628",fontWeight:800,fontSize:"20px",lineHeight:1.2}}>{companyInfo.name}</h1>
                      <p style={{color:"#e67e22",fontSize:"11px",fontWeight:600,marginTop:"2px",letterSpacing:"0.03em"}}>Experience. Move. Deliver. Beyond Borders.</p>
                      <div style={{marginTop:"10px",fontSize:"12px",color:"#555",lineHeight:1.8}}>
                        <p>{companyInfo.address}, {companyInfo.city}</p>
                        <p>{companyInfo.phone} &nbsp;|&nbsp; <span style={{wordBreak:"break-all"}}>{companyInfo.email}</span></p>
                        <p>{companyInfo.website}</p>
                        <p style={{fontWeight:700,color:"#0a1628",marginTop:"4px"}}>KRA PIN: {companyInfo.kraPin}</p>
                      </div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{backgroundColor:"#0a1628",color:"white",borderRadius:"10px",padding:"14px 22px",minWidth:"180px",display:"inline-block"}}>
                      <p style={{fontSize:"10px",letterSpacing:"0.12em",textTransform:"uppercase",opacity:0.8}}>Tax Invoice</p>
                      <p style={{fontSize:"22px",fontWeight:800,fontFamily:"monospace",marginTop:"4px"}}>{selectedInvoice.invoiceNumber}</p>
                      <div style={{height:"1px",backgroundColor:"rgba(230,126,34,0.5)",margin:"10px 0"}} />
                      <div style={{fontSize:"11px",opacity:0.9}}>
                        <p>Issue: {format(new Date(selectedInvoice.issueDate), "dd MMM yyyy")}</p>
                        <p style={{color:"#fca5a5",marginTop:"2px"}}>Due: {format(new Date(selectedInvoice.dueDate), "dd MMM yyyy")}</p>
                      </div>
                    </div>
                    <div style={{marginTop:"10px"}}>
                      <Badge className={statusConfig[selectedInvoice.status].color}>{statusConfig[selectedInvoice.status].label}</Badge>
                    </div>
                  </div>
                </div>
                {/* Divider */}
                <div style={{height:"2px",background:"linear-gradient(to right,#e67e22,#0a1628,#e67e22)",borderRadius:"2px",marginBottom:"24px"}} />

                {/* ── BILL TO & DETAILS ── */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"24px"}}>
                  <div style={{backgroundColor:"#f8f9ff",border:"1px solid #e8eaf0",borderRadius:"10px",padding:"16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}>
                      <User style={{width:14,height:14,color:"#e67e22"}} />
                      <span style={{color:"#0a1628",fontWeight:700,fontSize:"11px",letterSpacing:"0.06em",textTransform:"uppercase"}}>Bill To</span>
                    </div>
                    <p style={{color:"#0a1628",fontWeight:700,fontSize:"17px",marginBottom:"6px"}}>{selectedInvoice.customerName}</p>
                    {selectedInvoice.customerAddress && <p style={{color:"#555",fontSize:"12px",marginBottom:"3px"}}>{selectedInvoice.customerAddress}</p>}
                    {selectedInvoice.customerPhone && <p style={{color:"#555",fontSize:"12px",marginBottom:"3px"}}>{selectedInvoice.customerPhone}</p>}
                    {selectedInvoice.customerEmail && <p style={{color:"#555",fontSize:"12px",wordBreak:"break-all",marginBottom:"3px"}}>{selectedInvoice.customerEmail}</p>}
                    {selectedInvoice.customerKraPin && <p style={{color:"#0a1628",fontSize:"12px",fontWeight:600,marginTop:"6px"}}>KRA PIN: {selectedInvoice.customerKraPin}</p>}
                  </div>
                  <div style={{backgroundColor:"#f8f9ff",border:"1px solid #e8eaf0",borderRadius:"10px",padding:"16px"}}>
                    <div style={{marginBottom:"12px"}}>
                      <span style={{color:"#0a1628",fontWeight:700,fontSize:"11px",letterSpacing:"0.06em",textTransform:"uppercase"}}>Invoice Details</span>
                    </div>
                    <div style={{fontSize:"12px",color:"#555",lineHeight:2}}>
                      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
                        {(() => { const SI = getServiceIcon(selectedInvoice.serviceType); return <SI style={{width:16,height:16,color:"#e67e22"}} />; })()}
                        <span style={{fontWeight:600,color:"#0a1628"}}>{getServiceLabel(selectedInvoice.serviceType)}</span>
                      </div>
                      <p><span style={{fontWeight:600,color:"#0a1628"}}>Terms:</span> {selectedInvoice.paymentTerms}</p>
                      <p><span style={{fontWeight:600,color:"#0a1628"}}>Currency:</span> KES (Kenya Shillings)</p>
                    </div>
                  </div>
                </div>

                {/* ── ITEMS TABLE ── */}
                <div style={{marginBottom:"24px"}}>
                  <p style={{color:"#0a1628",fontWeight:700,fontSize:"11px",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"10px"}}>Description of Services</p>
                  <div style={{border:"1px solid #dde0e8",borderRadius:"10px",overflow:"hidden"}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead>
                        <tr style={{backgroundColor:"#0a1628",color:"white"}}>
                          <th style={{textAlign:"left",padding:"12px 16px",fontSize:"11px",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase"}}>Description</th>
                          <th style={{textAlign:"center",padding:"12px 16px",fontSize:"11px",fontWeight:700,width:"60px",letterSpacing:"0.05em",textTransform:"uppercase"}}>Qty</th>
                          <th style={{textAlign:"right",padding:"12px 16px",fontSize:"11px",fontWeight:700,width:"130px",letterSpacing:"0.05em",textTransform:"uppercase"}}>Unit Price</th>
                          <th style={{textAlign:"right",padding:"12px 16px",fontSize:"11px",fontWeight:700,width:"130px",letterSpacing:"0.05em",textTransform:"uppercase",color:"#e67e22"}}>Amount (KES)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items.map((item, i) => (
                          <tr key={item.id} style={{backgroundColor:i%2===0?"#ffffff":"#f8f9ff",color:"#1a1a2e",borderBottom:"1px solid #eee"}}>
                            <td style={{padding:"12px 16px",fontSize:"13px"}}>{item.description}</td>
                            <td style={{padding:"12px 16px",textAlign:"center",fontSize:"13px"}}>{item.quantity}</td>
                            <td style={{padding:"12px 16px",textAlign:"right",fontSize:"13px"}}>{item.unitPrice.toLocaleString()}</td>
                            <td style={{padding:"12px 16px",textAlign:"right",fontWeight:700,fontSize:"13px"}}>{item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── TOTALS ── */}
                <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"24px"}}>
                  <div style={{width:"300px",backgroundColor:"#0a1628",borderRadius:"12px",padding:"18px",border:"2px solid #e67e22"}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",color:"rgba(255,255,255,0.65)",marginBottom:"8px"}}>
                      <span>Subtotal:</span><span>KES {selectedInvoice.subtotal.toLocaleString()}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",color:"rgba(255,255,255,0.65)",marginBottom:"12px"}}>
                      <span>VAT ({selectedInvoice.vatRate}%):</span><span>KES {selectedInvoice.vatAmount.toLocaleString()}</span>
                    </div>
                    <div style={{borderTop:"1px solid rgba(230,126,34,0.5)",paddingTop:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{color:"white",fontWeight:700,fontSize:"14px"}}>TOTAL DUE:</span>
                      <span style={{color:"#e67e22",fontWeight:800,fontSize:"22px"}}>KES {selectedInvoice.total.toLocaleString()}</span>
                    </div>
                    {selectedInvoice.amountPaid > 0 && (
                      <>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",color:"#86efac",marginTop:"10px"}}>
                          <span>Amount Paid:</span><span>KES {selectedInvoice.amountPaid.toLocaleString()}</span>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:"14px",fontWeight:700,marginTop:"6px",color:(selectedInvoice.total-selectedInvoice.amountPaid)>0?"#fca5a5":"#86efac"}}>
                          <span>Balance Due:</span><span>KES {(selectedInvoice.total-selectedInvoice.amountPaid).toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* ── PAYMENT HISTORY ── */}
                {selectedInvoice.payments.length > 0 && (
                  <div style={{marginBottom:"24px"}}>
                    <p style={{color:"#0a1628",fontWeight:700,fontSize:"11px",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"10px"}}>Payment History</p>
                    <div style={{border:"1px solid #dde0e8",borderRadius:"10px",overflow:"hidden"}}>
                      <table style={{width:"100%",borderCollapse:"collapse"}}>
                        <thead>
                          <tr style={{backgroundColor:"#f0f2f8",color:"#0a1628"}}>
                            {["Date","Method","Reference","Note","Amount (KES)"].map((h,i) => (
                              <th key={h} style={{padding:"10px 14px",fontSize:"11px",fontWeight:700,textAlign:i===4?"right":"left",letterSpacing:"0.04em",textTransform:"uppercase"}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedInvoice.payments.map((p, i) => (
                            <tr key={p.id} style={{borderTop:"1px solid #eee",backgroundColor:i%2===0?"white":"#f8f9ff",color:"#1a1a2e"}}>
                              <td style={{padding:"10px 14px",fontSize:"12px"}}>{format(new Date(p.date), "MMM dd, yyyy")}</td>
                              <td style={{padding:"10px 14px",fontSize:"12px",textTransform:"capitalize"}}>{p.method === "mpesa" ? "M-Pesa" : p.method}</td>
                              <td style={{padding:"10px 14px",fontSize:"11px",fontFamily:"monospace"}}>{p.reference}</td>
                              <td style={{padding:"10px 14px",fontSize:"12px",color:"#888"}}>{p.note || "—"}</td>
                              <td style={{padding:"10px 14px",textAlign:"right",fontWeight:700,fontSize:"13px",color:"#16a34a"}}>{p.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── PAYMENT OPTIONS ── */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"24px"}}>
                  <div style={{backgroundColor:"#f8f9ff",border:"1px solid #dde0e8",borderRadius:"10px",padding:"16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}>
                      <Building2 style={{width:14,height:14,color:"#e67e22"}} />
                      <span style={{color:"#0a1628",fontWeight:700,fontSize:"11px",letterSpacing:"0.06em",textTransform:"uppercase"}}>Bank Transfer</span>
                    </div>
                    <div style={{fontSize:"12px",color:"#555",lineHeight:2}}>
                      <div style={{display:"flex",justifyContent:"space-between"}}><span>Bank:</span><span style={{fontWeight:700,color:"#0a1628"}}>{companyInfo.bankName}</span></div>
                      <div style={{display:"flex",justifyContent:"space-between"}}><span>Account:</span><span style={{fontWeight:700,fontFamily:"monospace",color:"#0a1628"}}>{companyInfo.bankAccount}</span></div>
                      <div style={{display:"flex",justifyContent:"space-between"}}><span>Branch:</span><span style={{fontWeight:700,color:"#0a1628"}}>{companyInfo.bankBranch}</span></div>
                    </div>
                  </div>
                  <div style={{backgroundColor:"#fff8ee",border:"1px solid #e67e22",borderRadius:"10px",padding:"16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}>
                      <Smartphone style={{width:14,height:14,color:"#e67e22"}} />
                      <span style={{color:"#0a1628",fontWeight:700,fontSize:"11px",letterSpacing:"0.06em",textTransform:"uppercase"}}>M-Pesa Paybill</span>
                    </div>
                    <div style={{fontSize:"12px",color:"#555",lineHeight:2}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span>Paybill:</span>
                        <span style={{fontWeight:800,fontFamily:"monospace",fontSize:"22px",color:"#e67e22"}}>{companyInfo.mpesaPaybill}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between"}}><span>Account:</span><span style={{fontWeight:700,fontFamily:"monospace",color:"#0a1628"}}>{companyInfo.mpesaAccountNo}</span></div>
                      <p style={{fontSize:"11px",color:"#e67e22",fontWeight:600,marginTop:"4px"}}>Use invoice number as account reference</p>
                    </div>
                  </div>
                </div>

                {/* ── NOTES & TERMS ── */}
                {selectedInvoice.notes && (
                  <div style={{backgroundColor:"#fff8ee",border:"1px solid #e67e22",borderRadius:"8px",padding:"12px 16px",marginBottom:"16px"}}>
                    <p style={{color:"#0a1628",fontWeight:700,fontSize:"11px",textTransform:"uppercase",marginBottom:"6px"}}>Notes</p>
                    <p style={{fontSize:"12px",color:"#333"}}>{selectedInvoice.notes}</p>
                  </div>
                )}
                <div style={{backgroundColor:"#f8f9ff",border:"1px solid #dde0e8",borderRadius:"8px",padding:"12px 16px",marginBottom:"24px"}}>
                  <p style={{color:"#0a1628",fontWeight:700,fontSize:"11px",textTransform:"uppercase",marginBottom:"8px"}}>Terms & Conditions</p>
                  <ul style={{fontSize:"11px",color:"#666",paddingLeft:"16px",lineHeight:2}}>
                    <li>Payment is due by the date indicated above</li>
                    <li>Late payments may incur additional charges of 2% per month</li>
                    <li>Please include invoice number in all payment references</li>
                    <li>This invoice is valid for 30 days from issue date</li>
                  </ul>
                </div>

                {/* ── FOOTER ── */}
                <div style={{textAlign:"center",paddingTop:"16px",borderTop:"2px solid #e67e22"}}>
                  <p style={{color:"#e67e22",fontWeight:700,fontSize:"15px"}}>Thank You For Your Business!</p>
                  <p style={{fontSize:"12px",color:"#555",marginTop:"6px"}}>
                    For inquiries: <span style={{wordBreak:"break-all"}}>{companyInfo.email}</span> &nbsp;|&nbsp; {companyInfo.phone}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {companyInfo.website} | KRA PIN: {companyInfo.kraPin}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Record Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Record Payment
            </DialogTitle>
            <DialogDescription>
              {selectedInvoice && (
                <span>Invoice {selectedInvoice.invoiceNumber} — Balance: <strong className="text-red-500">KES {(selectedInvoice.total - selectedInvoice.amountPaid).toLocaleString()}</strong></span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4 py-2">
              {/* Balance Summary */}
              <div className="rounded-lg border bg-muted/40 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Total:</span>
                  <span className="font-semibold">KES {selectedInvoice.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Amount Paid:</span>
                  <span className="font-semibold">KES {selectedInvoice.amountPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-500 font-bold border-t pt-2">
                  <span>Outstanding Balance:</span>
                  <span>KES {(selectedInvoice.total - selectedInvoice.amountPaid).toLocaleString()}</span>
                </div>
              </div>

              {/* Quick amount buttons */}
              <div className="space-y-2">
                <Label>Quick Select Amount</Label>
                <div className="flex gap-2 flex-wrap">
                  {[25, 50, 75, 100].map((pct) => {
                    const amt = Math.round((selectedInvoice.total - selectedInvoice.amountPaid) * pct / 100);
                    return (
                      <Button
                        key={pct}
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentForm({ ...paymentForm, amount: amt.toString() })}
                        className={pct === 100 ? "border-green-500 text-green-600" : ""}
                      >
                        {pct === 100 ? "Full" : `${pct}%`} — KES {amt.toLocaleString()}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Amount (KES) *</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
                {paymentForm.amount && parseFloat(paymentForm.amount) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Remaining balance after payment:{" "}
                    <span className="font-semibold text-amber-500">
                      KES {Math.max(0, (selectedInvoice.total - selectedInvoice.amountPaid) - parseFloat(paymentForm.amount)).toLocaleString()}
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <Select value={paymentForm.method} onValueChange={(v) => setPaymentForm({ ...paymentForm, method: v as PaymentRecord["method"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reference / Transaction ID *</Label>
                <Input
                  placeholder={paymentForm.method === "mpesa" ? "e.g. QGH7Y3K2P1" : "e.g. TXN-00123"}
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Note (Optional)</Label>
                <Input
                  placeholder="e.g. Deposit, Partial payment, Final balance..."
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsPaymentDialogOpen(false); setPaymentForm({ amount: "", method: "mpesa", reference: "", note: "" }); }}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
