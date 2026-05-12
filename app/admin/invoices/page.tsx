"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import { toast } from "sonner";
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
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
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
  sent: { label: "Sent", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Send },
  paid: { label: "Paid", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2 },
  overdue: { label: "Overdue", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertCircle },
  cancelled: { label: "Cancelled", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: XCircle },
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
    status: "sent",
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
  email: "info@Moventra Safaris & Logistics Ltd.com",
  website: "www.Moventra Safaris & Logistics Ltd.com",
  kraPin: "P012345678Z",
  bankName: "Equity Bank Kenya",
  bankAccount: "0123456789012",
  bankBranch: "Nairobi Main Branch",
  mpesaPaybill: "123456",
  mpesaAccountNo: "Invoice Number",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const printRef = useRef<HTMLDivElement>(null);

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
      status: "draft",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: newInvoice.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
    };

    setInvoices([invoice, ...invoices]);
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success(`Invoice ${invoiceNumber} created successfully`);
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

  // Update invoice status
  const updateInvoiceStatus = (id: string, status: Invoice["status"]) => {
    setInvoices(invoices.map((inv) => (inv.id === id ? { ...inv, status } : inv)));
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
    overdue: invoices.filter((i) => i.status === "overdue").length,
    totalRevenue: invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.total, 0),
    pendingRevenue: invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((sum, i) => sum + i.total, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-cyan-500" />
            Invoice Management
          </h1>
          <p className="text-muted-foreground">Create and manage invoices for all services</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-cyan-500/20 bg-cyan-500/5">
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
        <Card className="border-green-500/20 bg-green-500/5">
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
        <Card className="border-amber-500/20 bg-amber-500/5">
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
        <Card className="border-red-500/20 bg-red-500/5">
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
                <TableHead>Amount</TableHead>
                <TableHead>Issue Date</TableHead>
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
                    <TableCell>{format(new Date(invoice.issueDate), "MMM dd, yyyy")}</TableCell>
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
                          className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-500/10"
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
            <div ref={printRef} className="print-receipt bg-white rounded-lg border border-gray-200" data-print-area="true">
              {/* Professional Invoice Template - Savanna Brand Colors */}
              <div className="p-8 text-[#0a1628]">
                {/* Header with Logo and Invoice Info */}
                <div className="border-b-4 border-[#0a1628] pb-6 mb-6">
                  <div className="flex justify-between items-start">
                    {/* Company Logo & Info */}
                    <div className="flex items-start gap-5">
                      <Image
                        src="/images/logo.png"
                        alt={companyInfo.name}
                        width={100}
                        height={50}
                        className="h-auto w-[90px] object-contain"
                        unoptimized
                      />
                      <div>
                        <h1 className="text-2xl font-bold text-[#0a1628]">{companyInfo.name}</h1>
                        <p className="text-sm text-gray-500 italic">{companyInfo.tagline}</p>
                        <div className="mt-3 text-sm text-gray-600 space-y-1">
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#e67e22]" />
                            {companyInfo.address}, {companyInfo.city}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-[#e67e22]" />
                            {companyInfo.phone}
                          </p>
                          <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-[#e67e22]" />
                            {companyInfo.email}
                          </p>
                          <p className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-[#e67e22]" />
                            {companyInfo.website}
                          </p>
                        </div>
                        <p className="mt-2 text-sm font-bold text-[#0a1628]">KRA PIN: {companyInfo.kraPin}</p>
                      </div>
                    </div>
                    
                    {/* Invoice Number Box */}
                    <div className="text-right">
                      <div className="inline-block bg-[#0a1628] text-white px-6 py-3 rounded-lg mb-4">
                        <p className="text-sm uppercase tracking-wider opacity-90">Invoice</p>
                        <p className="text-2xl font-bold font-mono">{selectedInvoice.invoiceNumber}</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center justify-end gap-2">
                          <Calendar className="h-4 w-4 text-[#e67e22]" />
                          <span className="text-gray-600">Issue Date:</span>
                          <span className="font-semibold text-[#0a1628]">{format(new Date(selectedInvoice.issueDate), "MMMM dd, yyyy")}</span>
                        </p>
                        <p className="flex items-center justify-end gap-2">
                          <Calendar className="h-4 w-4 text-[#e67e22]" />
                          <span className="text-gray-600">Due Date:</span>
                          <span className="font-semibold text-red-600">{format(new Date(selectedInvoice.dueDate), "MMMM dd, yyyy")}</span>
                        </p>
                      </div>
                      <Badge 
                        className={`mt-3 ${statusConfig[selectedInvoice.status].color}`}
                      >
                        {statusConfig[selectedInvoice.status].label}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Bill To & Service Info */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h3 className="text-sm font-bold text-[#0a1628] uppercase mb-3 pb-2 border-b border-gray-300 flex items-center gap-2 tracking-wide">
                      <User className="h-4 w-4 text-[#e67e22]" />
                      Bill To
                    </h3>
                    <div className="space-y-2">
                      <p className="font-bold text-xl text-[#0a1628]">{selectedInvoice.customerName}</p>
                      {selectedInvoice.customerAddress && (
                        <p className="text-sm text-gray-600">{selectedInvoice.customerAddress}</p>
                      )}
                      {selectedInvoice.customerPhone && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-[#e67e22]" />
                          {selectedInvoice.customerPhone}
                        </p>
                      )}
                      {selectedInvoice.customerEmail && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-[#e67e22]" />
                          {selectedInvoice.customerEmail}
                        </p>
                      )}
                      {selectedInvoice.customerKraPin && (
                        <p className="text-sm font-semibold text-[#0a1628] mt-2">KRA PIN: {selectedInvoice.customerKraPin}</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h3 className="text-sm font-bold text-[#0a1628] uppercase mb-3 pb-2 border-b border-gray-300 tracking-wide">
                      Invoice Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const ServiceIcon = getServiceIcon(selectedInvoice.serviceType);
                          return <ServiceIcon className="h-5 w-5 text-[#e67e22]" />;
                        })()}
                        <span className="font-semibold text-[#0a1628]">{getServiceLabel(selectedInvoice.serviceType)}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-[#0a1628]">Payment Terms:</span> {selectedInvoice.paymentTerms}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-[#0a1628]">Currency:</span> KES (Kenya Shillings)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-6">
                  <h3 className="font-bold text-[#0a1628] mb-3 uppercase text-sm tracking-wide">Description of Services</h3>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#0a1628] text-white">
                          <th className="text-left py-4 px-5 font-semibold">Description</th>
                          <th className="text-center py-4 px-5 font-semibold w-24">Qty</th>
                          <th className="text-right py-4 px-5 font-semibold w-36">Unit Price (KES)</th>
                          <th className="text-right py-4 px-5 font-semibold w-36">Amount (KES)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items.map((item, index) => (
                          <tr key={item.id} className={index % 2 === 0 ? "bg-white text-[#0a1628]" : "bg-gray-50 text-[#0a1628]"}>
                            <td className="py-4 px-5">{item.description}</td>
                            <td className="py-4 px-5 text-center">{item.quantity}</td>
                            <td className="py-4 px-5 text-right">{item.unitPrice.toLocaleString()}</td>
                            <td className="py-4 px-5 text-right font-semibold">{item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-96 bg-gray-50 rounded-lg border-2 border-[#e67e22] p-5">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium text-[#0a1628]">KES {selectedInvoice.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">VAT ({selectedInvoice.vatRate}%):</span>
                        <span className="font-medium text-[#0a1628]">KES {selectedInvoice.vatAmount.toLocaleString()}</span>
                      </div>
                      <div className="border-t-2 border-[#0a1628] pt-4 mt-4">
                        <div className="flex justify-between text-xl font-bold">
                          <span className="text-[#0a1628]">TOTAL DUE:</span>
                          <span className="text-[#e67e22]">KES {selectedInvoice.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-5 border border-[#0a1628]">
                    <h3 className="text-sm font-bold text-[#0a1628] uppercase mb-3 flex items-center gap-2 tracking-wide">
                      <Building2 className="h-4 w-4 text-[#e67e22]" />
                      Bank Transfer
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-semibold text-[#0a1628]">{companyInfo.bankName}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Account:</span>
                        <span className="font-mono font-semibold text-[#0a1628]">{companyInfo.bankAccount}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Branch:</span>
                        <span className="font-semibold text-[#0a1628]">{companyInfo.bankBranch}</span>
                      </p>
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-5 border border-[#e67e22]">
                    <h3 className="text-sm font-bold text-[#0a1628] uppercase mb-3 flex items-center gap-2 tracking-wide">
                      <Smartphone className="h-4 w-4 text-[#e67e22]" />
                      M-Pesa Payment
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Paybill:</span>
                        <span className="font-mono font-bold text-xl text-[#e67e22]">{companyInfo.mpesaPaybill}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Account No:</span>
                        <span className="font-mono font-semibold text-[#0a1628]">{companyInfo.mpesaAccountNo}</span>
                      </p>
                      <p className="text-xs text-[#e67e22] mt-2 font-medium">
                        Use invoice number as account reference
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedInvoice.notes && (
                  <div className="p-5 bg-orange-50 rounded-lg border border-[#e67e22] mb-6">
                    <h3 className="text-sm font-bold text-[#0a1628] mb-2 uppercase tracking-wide">Notes</h3>
                    <p className="text-sm text-[#0a1628]">{selectedInvoice.notes}</p>
                  </div>
                )}

                {/* Terms */}
                <div className="p-5 bg-gray-100 rounded-lg border border-gray-200 mb-6">
                  <h3 className="text-sm font-bold text-[#0a1628] mb-2 uppercase tracking-wide">Terms & Conditions</h3>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li>Payment is due by the date indicated above</li>
                    <li>Late payments may incur additional charges</li>
                    <li>Please include invoice number in all payment references</li>
                    <li>This invoice is valid for 30 days from issue date</li>
                  </ul>
                </div>

                {/* Footer */}
                <div className="print-footer text-center pt-6 border-t-2 border-[#0a1628]">
                  <p className="text-lg font-bold text-[#e67e22]">Thank You For Your Business!</p>
                  <p className="text-sm text-[#0a1628] mt-2">
                    For inquiries, contact us at {companyInfo.email} or {companyInfo.phone}
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
    </div>
  );
}
