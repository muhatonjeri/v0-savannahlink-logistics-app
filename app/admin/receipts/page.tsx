"use client";
import { generateQRDataURL, generateEtimsVerifyUrl } from "@/lib/qr";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Eye,
  Printer,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Banknote,
  Smartphone,
  FileText,
  Calendar,
  User,
  Hash,
  AlertTriangle,
  BadgeCheck,
  QrCode,
  Send,
  MessageSquare,
  Pencil,
  Lock,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { receiptsApi, invoicesApi } from "@/lib/api";
import { COMPANY } from "@/lib/company";
import { createPortal } from "react-dom";
import { format } from "date-fns";

// Receipt interface
interface ReceiptItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  amount: number;
}

interface ReceiptData {
  id: string;
  receiptNumber: string;
  // eTIMS fields
  etimsDeviceNumber: string;
  etimsReceiptNumber: string;
  etimsQrCode: string;
  etimsVerificationUrl: string;
  // Customer details
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  customerKraPin?: string;
  // Payment details
  paymentMethod: "mpesa" | "bank" | "cash" | "card";
  transactionCode: string;
  bankName?: string;
  // Receipt details
  items: ReceiptItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  // Metadata
  serviceType: string;
  bookingReference?: string;
  invoiceId?: string;   // invoice this receipt pays (if any)
  invoiceRef?: string;  // its invoice number, shown on the receipt
  serviceStart?: string; // yyyy-MM-dd — period the paid-for service ran
  serviceEnd?: string;
  issuedBy: string;
  issuedAt: string;
  status: "draft" | "issued" | "voided";
  notes?: string;
}

// Company details (would come from settings in production)
// Company details come from lib/company.ts (shared with invoices, SMS and email)
const companyDetails = {
  name: COMPANY.name,
  kraPin: COMPANY.kraPin,
  address: `${COMPANY.address}, ${COMPANY.city}`,
  phone: COMPANY.phone,
  email: COMPANY.email,
  website: COMPANY.website,
  // Empty until KRA eTIMS is connected — receipts then show no eTIMS block
  etimsDeviceNumber: process.env.NEXT_PUBLIC_ETIMS_DEVICE_NUMBER || "",
  mpesaPaybill: COMPANY.mpesaPaybill,
  mpesaAccount: COMPANY.mpesaAccountNo,
};

// Invoice service slugs → receipt service labels
const SERVICE_LABEL_FROM_INVOICE: Record<string, string> = {
  "car-rental": "Car Rental", "safari-tours": "Safari Tours", "airport-transfers": "Hotel/Airport Transfer",
  "cargo-transport": "Cargo Handling", "tour-bus": "Corporate Rental", "road-recovery": "Road Recovery",
  "cargo-handling": "Cargo Handling", "shipment-imports": "Shipment & Imports", "equipment-hire": "Construction Equipment",
  "movers": "Moving Services",
};
const round2 = (n: number) => Math.round(n * 100) / 100;

// "2026-10-12" → "12 Oct 2026" (read as a local date, not UTC)
const fmtDay = (d: string) => {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
// Service period text, e.g. "12 Oct 2026 – 15 Oct 2026 (4 days)"
const formatServicePeriod = (start?: string, end?: string) => {
  if (!start && !end) return "";
  if (!start || !end || start === end) return fmtDay((start || end) as string) + " (1 day)";
  const days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
  return `${fmtDay(start)} – ${fmtDay(end)} (${days} days)`;
};
const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// An unpaid / part-paid invoice a receipt can be issued against
interface InvoiceOption {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerKraPin: string;
  serviceType: string;
  firstItem: string;
  serviceStart: string;
  serviceEnd: string;
  vatRate: number;
  total: number;
  amountPaid: number;
  payments: Record<string, unknown>[];
  status: string;
}

// Form schema
const receiptFormSchema = z.object({
  // Customer details
  customerName: z.string().min(2, "Customer name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerAddress: z.string().optional(),
  customerKraPin: z.string().optional(),
  // Payment details
  paymentMethod: z.enum(["mpesa", "bank", "cash", "card"]),
  transactionCode: z.string().min(1, "Transaction code is required"),
  bankName: z.string().optional(),
  // Service details
  serviceType: z.string().min(1, "Service type is required"),
  bookingReference: z.string().optional(),
  serviceStart: z.string().optional(),   // yyyy-MM-dd
  serviceEnd: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unitPrice: z.string().min(1, "Unit price is required"),
  taxRate: z.string().default("16"),
  notes: z.string().optional(),
});

type ReceiptFormData = z.infer<typeof receiptFormSchema>;

// Status configuration
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "bg-yellow-900/300/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  issued: { label: "Issued", color: "bg-green-900/300/20 text-green-400 border-green-500/30", icon: CheckCircle },
  voided: { label: "Voided", color: "bg-red-900/300/20 text-red-400 border-red-500/30", icon: XCircle },
};

// Payment method config
const paymentMethodConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  mpesa: { label: "M-Pesa", icon: Smartphone, color: "text-green-500" },
  bank: { label: "Bank Transfer", icon: Building2, color: "text-blue-500" },
  cash: { label: "Cash", icon: Banknote, color: "text-amber-500" },
  card: { label: "Card", icon: CreditCard, color: "text-purple-500" },
};

// Service types
const serviceTypes = [
  "Car Rental",
  "Safari Tours",
  "Hotel/Airport Transfer",
  "Moving Services",
  "Corporate Rental",
  "Road Recovery",
  "Cargo Handling",
  "Shipment & Imports",
  "Construction Equipment",
  "Other",
];

// Generate receipt number
function generateReceiptNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SL-${year}${month}-${random}`;
}

// Generate eTIMS receipt number
function generateEtimsReceiptNumber(): string {
  const random = Math.random().toString().substring(2, 12);
  return `ETIMS-${random}`;
}

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(amount);
}

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Initial mock data
const initialReceiptsData: ReceiptData[] = [
  {
    id: "RCP-001",
    receiptNumber: "SL-202501-ABC123",
    etimsDeviceNumber: "ETIMS-2024-00123",
    etimsReceiptNumber: "ETIMS-1234567890",
    etimsQrCode: "https://etims.kra.go.ke/verify/1234567890",
    etimsVerificationUrl: "https://etims.kra.go.ke/verify/1234567890",
    customerName: "John Mwangi",
    customerPhone: "0712345678",
    customerEmail: "john.mwangi@email.com",
    customerKraPin: "A012345678B",
    paymentMethod: "mpesa",
    transactionCode: "SGH7K8L9M0",
    items: [
      { description: "Toyota Prado Rental - 3 Days", quantity: 3, unitPrice: 8000, taxRate: 16, amount: 24000 },
    ],
    subtotal: 24000,
    taxAmount: 3840,
    totalAmount: 27840,
    currency: "KES",
    serviceType: "Car Rental",
    bookingReference: "BK-2025-001",
    issuedBy: "Admin",
    issuedAt: "2025-01-15T10:30:00",
    status: "issued",
  },
  {
    id: "RCP-002",
    receiptNumber: "SL-202501-DEF456",
    etimsDeviceNumber: "ETIMS-2024-00123",
    etimsReceiptNumber: "ETIMS-1234567891",
    etimsQrCode: "https://etims.kra.go.ke/verify/1234567891",
    etimsVerificationUrl: "https://etims.kra.go.ke/verify/1234567891",
    customerName: "Safari Adventures Ltd",
    customerPhone: "0723456789",
    customerEmail: "bookings@safariadventures.co.ke",
    customerAddress: "Kenyatta Avenue, Nairobi",
    customerKraPin: "P051234567Y",
    paymentMethod: "bank",
    transactionCode: "NCBA-TRX-20250115-001",
    bankName: "NCBA Bank",
    items: [
      { description: "Masai Mara Safari Package - 2 Pax", quantity: 2, unitPrice: 45000, taxRate: 16, amount: 90000 },
      { description: "Airport Transfer", quantity: 2, unitPrice: 3500, taxRate: 16, amount: 7000 },
    ],
    subtotal: 97000,
    taxAmount: 15520,
    totalAmount: 112520,
    currency: "KES",
    serviceType: "Safari Tours",
    bookingReference: "SF-2025-042",
    issuedBy: "Admin",
    issuedAt: "2025-01-14T14:15:00",
    status: "issued",
  },
];

// Convert number to words for receipts
// Amount in words, e.g. 49000 → "Forty nine thousand Kenyan shillings",
// 34800.5 → "Thirty four thousand eight hundred Kenyan shillings and fifty cents"
function amountInWords(num: number): string {
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const scales = ["", "thousand", "million", "billion"];

  const below1000 = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " hundred" + (n % 100 ? " and " + below1000(n % 100) : "");
  };
  const toWords = (n: number): string => {
    if (n === 0) return "zero";
    const parts: string[] = [];
    for (let i = 0; n > 0; i++, n = Math.floor(n / 1000)) {
      const chunk = n % 1000;
      if (chunk) parts.unshift(below1000(chunk) + (scales[i] ? " " + scales[i] : ""));
    }
    return parts.join(" ");
  };

  const totalCents = Math.round(Math.abs(num) * 100); // avoids 99.995 → "100 cents"
  const shillings = Math.floor(totalCents / 100);
  const cents = totalCents % 100;
  const text = `${toWords(shillings)} Kenyan ${shillings === 1 ? "shilling" : "shillings"}` +
    (cents ? ` and ${toWords(cents)} ${cents === 1 ? "cent" : "cents"}` : "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}


// Demo receipts — visible immediately, replaced when Supabase connects
const DEMO_RECEIPTS: ReceiptData[] = [
  {
    id: "rcp-demo-001",
    receiptNumber: "RCP-2024-0001",
    etimsDeviceNumber: "VSC-001",
    etimsReceiptNumber: "ETM-2024-0001",
    etimsQrCode: "",
    etimsVerificationUrl: "https://etims.kra.go.ke/verify/ETM-2024-0001",
    customerName: "Peter Mwangi Kariuki",
    customerPhone: "+254712345678",
    customerEmail: "peter.kariuki@gmail.com",
    customerAddress: "Kilimani, Nairobi",
    customerKraPin: "A012345678B",
    paymentMethod: "mpesa",
    transactionCode: "QK7X2ABZ1P",
    items: [{ id: "1", description: "Toyota Prado — 3 Days Self-Drive", quantity: 3, unitPrice: 12000, amount: 36000 }],
    subtotal: 36000, taxAmount: 5760, totalAmount: 41760,
    currency: "KES",
    serviceType: "Car Rental",
    bookingReference: "BK-2024-001",
    issuedBy: "Admin",
    issuedAt: "2024-05-03T09:30:00Z",
    status: "issued",
    notes: "Payment received in full via M-Pesa",
  },
  {
    id: "rcp-demo-002",
    receiptNumber: "RCP-2024-0002",
    etimsDeviceNumber: "VSC-001",
    etimsReceiptNumber: "ETM-2024-0002",
    etimsQrCode: "",
    etimsVerificationUrl: "https://etims.kra.go.ke/verify/ETM-2024-0002",
    customerName: "Equity Bank Kenya Ltd",
    customerPhone: "+254763000000",
    customerEmail: "procurement@equitybank.co.ke",
    customerAddress: "Equity Centre, Upper Hill, Nairobi",
    customerKraPin: "P051234567A",
    paymentMethod: "bank",
    transactionCode: "EQB-REF-7741",
    bankName: "Equity Bank",
    items: [{ id: "1", description: "Corporate Staff Transport — Monthly", quantity: 1, unitPrice: 180000, amount: 180000 }],
    subtotal: 180000, taxAmount: 28800, totalAmount: 208800,
    currency: "KES",
    serviceType: "Corporate Rental",
    bookingReference: "BK-2024-002",
    issuedBy: "Admin",
    issuedAt: "2024-05-01T08:00:00Z",
    status: "issued",
  },
];

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptData[]>(DEMO_RECEIPTS);
  const [loading, setLoading] = useState(false);

  const loadReceipts = async () => {
    try {
      const res = await fetch("/api/receipts");
      const json = await res.json();
      const data = Array.isArray(json) ? json : (json.data || []);
      if (Array.isArray(data)) {
        setReceipts(data.map((r: Record<string,unknown>) => ({
          id: String(r.id || ""),
          receiptNumber: String(r.receipt_number || ""),
          customerName: String(r.customer_name || ""),
          customerPhone: String(r.customer_phone || ""),
          customerEmail: String(r.customer_email || ""),
          serviceType: String(r.service_type || ""),
          items: Array.isArray(r.items) ? r.items : [],
          subtotal: Number(r.subtotal || 0),
          taxAmount: Number(r.tax_amount || 0),
          totalAmount: Number(r.total_amount || 0),
          paymentMethod: String(r.payment_method || "cash") as ReceiptData["paymentMethod"],
          transactionCode: String(r.transaction_code || ""),
          customerKraPin: String(r.customer_kra_pin || ""),
          issuedAt: String(r.issued_at || r.created_at || ""),
          etimsReceiptNumber: String(r.etims_receipt_number || ""),
          etimsDeviceNumber: String(r.etims_device_number || ""),
          etimsVerificationUrl: String(r.etims_verification_url || ""),
          etimsQrCode: String(r.etims_qr_code || ""),
          currency: String(r.currency || "KES"),
          issuedBy: String(r.issued_by || "Admin"),
          status: (r.status === "cancelled" ? "voided" : String(r.status || "issued")) as ReceiptData["status"],
          invoiceId: r.invoice_id ? String(r.invoice_id) : undefined,
          invoiceRef: r.invoice_ref ? String(r.invoice_ref) : undefined,
          bookingReference: r.booking_ref ? String(r.booking_ref) : undefined,
          bankName: r.bank_name ? String(r.bank_name) : undefined,
          serviceStart: r.service_start ? String(r.service_start) : undefined,
          serviceEnd: r.service_end ? String(r.service_end) : undefined,
          notes: String(r.notes || ""),
          sendEmail: false,
          sendSms: false,
        })));
      }
    } catch(e) { console.error("Load receipts:", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadReceipts(); }, []);
  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState<{id:string;fullName:string;phone:string;email:string;kraPin:string;source?:string}[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // ── "Create from invoice" ──
  const [invoiceOptions, setInvoiceOptions] = useState<InvoiceOption[]>([]);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);
  const [linkedInvoice, setLinkedInvoice] = useState<InvoiceOption | null>(null);
  const [amountReceived, setAmountReceived] = useState(""); // KES, VAT inclusive

  const loadInvoiceOptions = async () => {
    try {
      const res = await fetch("/api/invoices");
      if (!res.ok) return;
      const rows = await res.json();
      if (!Array.isArray(rows)) return;
      setInvoiceOptions(
        rows
          .map((inv: Record<string, unknown>): InvoiceOption => ({
            id: String(inv.id || ""),
            invoiceNumber: String(inv.invoice_number || ""),
            customerName: String(inv.customer_name || ""),
            customerPhone: String(inv.customer_phone || ""),
            customerEmail: String(inv.customer_email || ""),
            customerAddress: String(inv.customer_address || ""),
            customerKraPin: String(inv.customer_kra_pin || ""),
            serviceType: String(inv.service_type || ""),
            firstItem: Array.isArray(inv.items) && inv.items[0] ? String((inv.items[0] as Record<string, unknown>).description || "") : "",
            serviceStart: inv.service_start ? String(inv.service_start) : "",
            serviceEnd: inv.service_end ? String(inv.service_end) : "",
            vatRate: Number(inv.vat_rate ?? 16),
            total: Number(inv.total) || 0,
            amountPaid: Number(inv.amount_paid) || 0,
            payments: Array.isArray(inv.payments) ? (inv.payments as Record<string, unknown>[]) : [],
            status: String(inv.status || "draft"),
          }))
          // only invoices that still have money owing
          .filter((inv) => inv.status !== "cancelled" && inv.total - inv.amountPaid > 0.005)
      );
    } catch (e) { console.error("Load invoices for receipts:", e); }
  };

  const invoiceBalance = (inv: InvoiceOption) => round2(inv.total - inv.amountPaid);

  // Amount received is VAT-inclusive; the form's unit price is stored net of VAT
  const applyAmountReceived = (value: string, inv: InvoiceOption | null = linkedInvoice) => {
    setAmountReceived(value);
    const gross = parseFloat(value);
    if (!inv || !(gross > 0)) return;
    form.setValue("unitPrice", round2(gross / (1 + inv.vatRate / 100)).toFixed(2));
  };

  const selectInvoice = (inv: InvoiceOption) => {
    setLinkedInvoice(inv);
    setInvoiceSearch(inv.invoiceNumber);
    setShowInvoiceDropdown(false);
    form.setValue("customerName", inv.customerName);
    form.setValue("customerPhone", inv.customerPhone);
    form.setValue("customerEmail", inv.customerEmail);
    form.setValue("customerAddress", inv.customerAddress);
    form.setValue("customerKraPin", inv.customerKraPin);
    form.setValue("serviceType", SERVICE_LABEL_FROM_INVOICE[inv.serviceType] || "Other");
    form.setValue("description", `Payment for invoice ${inv.invoiceNumber}${inv.firstItem ? ` — ${inv.firstItem}` : ""}`);
    form.setValue("quantity", "1");
    form.setValue("taxRate", String(inv.vatRate));
    form.setValue("serviceStart", inv.serviceStart);
    form.setValue("serviceEnd", inv.serviceEnd);
    applyAmountReceived(invoiceBalance(inv).toFixed(2), inv);
    setClientSearch(inv.customerName);
  };

  const clearInvoiceLink = () => {
    setLinkedInvoice(null);
    setAmountReceived("");
    setInvoiceSearch("");
  };

  const filteredInvoiceOptions = invoiceOptions.filter((inv) => {
    const q = invoiceSearch.trim().toLowerCase();
    return !q || inv.invoiceNumber.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q);
  }).slice(0, 8);

  const searchClients = async (q: string) => {
    setClientSearch(q);
    if (q.length < 2) { setClientResults([]); setShowClientDropdown(false); return; }
    try {
      // Search registered clients AND sublet bookings AND bookings
      const [clientRes, subletRes] = await Promise.all([
        fetch("/api/clients?q=" + encodeURIComponent(q)),
        fetch("/api/sublet-bookings"),
      ]);
      const [clientData, subletData] = await Promise.all([clientRes.json(), subletRes.json()]);

      const results: {id:string;fullName:string;phone:string;email:string;kraPin:string;source:string}[] = [];
      const seen = new Set<string>();

      // From client registry
      if (Array.isArray(clientData)) {
        clientData.forEach((c: Record<string,unknown>) => {
          const name = String(c.full_name || c.fullName || "");
          if (!seen.has(name.toLowerCase())) {
            seen.add(name.toLowerCase());
            results.push({ id: String(c.id || ""), fullName: name, phone: String(c.phone || ""), email: String(c.email || ""), kraPin: String(c.kra_pin || c.kraPin || ""), source: "client" });
          }
        });
      }

      // From sublet bookings
      if (Array.isArray(subletData)) {
        subletData.forEach((b: Record<string,unknown>) => {
          const name = String(b.client_name || b.clientName || "");
          const phone = String(b.client_phone || b.clientPhone || "");
          if (name.toLowerCase().includes(q.toLowerCase()) && !seen.has(name.toLowerCase())) {
            seen.add(name.toLowerCase());
            results.push({ id: "sublet-" + b.id, fullName: name, phone, email: "", kraPin: "", source: "sublet" });
          }
        });
      }

      setClientResults(results);
      setShowClientDropdown(results.length > 0);
    } catch(e) { console.error("Search clients:", e); }
  };

  const selectClient = (c: {id:string;fullName:string;phone:string;email:string;kraPin:string;source?:string}) => {
    form.setValue("customerName", c.fullName);
    form.setValue("customerPhone", c.phone);
    if (c.email) form.setValue("customerEmail", c.email);
    if (c.kraPin) form.setValue("customerKraPin", c.kraPin);
    setClientSearch(c.fullName);
    setShowClientDropdown(false);
    setClientResults([]);
  };
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Fresh list of unpaid invoices each time the Issue Receipt dialog opens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (isDialogOpen) loadInvoiceOptions(); }, [isDialogOpen]);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  const form = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: "",
      customerKraPin: "",
      paymentMethod: "mpesa",
      transactionCode: "",
      bankName: "",
      serviceType: "",
      bookingReference: "",
      serviceStart: "",
      serviceEnd: "",
      description: "",
      quantity: "1",
      unitPrice: "",
      taxRate: "16",
      notes: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  // Filter receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      const matchesSearch =
        receipt.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.transactionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (receipt.customerKraPin?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesStatus = statusFilter === "all" || receipt.status === statusFilter;
      const matchesPayment = paymentFilter === "all" || receipt.paymentMethod === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [receipts, searchQuery, statusFilter, paymentFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = receipts.length;
    const issued = receipts.filter((r) => r.status === "issued").length;
    const totalRevenue = receipts.filter((r) => r.status === "issued").reduce((sum, r) => sum + r.totalAmount, 0);
    const totalTax = receipts.filter((r) => r.status === "issued").reduce((sum, r) => sum + r.taxAmount, 0);
    return { total, issued, totalRevenue, totalTax };
  }, [receipts]);

  // Handle form submit
  const onSubmit = async (data: ReceiptFormData) => {
    const invoice = linkedInvoice; // capture before the form is reset
    if (data.serviceStart && data.serviceEnd && data.serviceEnd < data.serviceStart) {
      toast.error("Service end date can't be before the start date");
      return;
    }
    const quantity = parseFloat(data.quantity);
    const unitPrice = parseFloat(data.unitPrice);
    const taxRate = parseFloat(data.taxRate);
    let subtotal = quantity * unitPrice;
    let taxAmount = subtotal * (taxRate / 100);
    let totalAmount = subtotal + taxAmount;

    // Paying an invoice: the amount received (VAT inclusive) is the truth —
    // derive net and VAT from it so the receipt total matches the money exactly.
    if (invoice) {
      const gross = round2(parseFloat(amountReceived));
      const balance = invoiceBalance(invoice);
      if (!(gross > 0)) { toast.error("Enter the amount received"); return; }
      if (gross > balance + 0.01) {
        toast.error(`Amount is more than the invoice balance of KES ${balance.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`);
        return;
      }
      totalAmount = gross;
      subtotal = round2(gross / (1 + taxRate / 100));
      taxAmount = round2(gross - subtotal);
    }

    const newReceipt: ReceiptData = {
      id: `RCP-${Date.now()}`,
      receiptNumber: generateReceiptNumber(),
      etimsDeviceNumber: companyDetails.etimsDeviceNumber,
      etimsReceiptNumber: "",   // filled only by a real KRA eTIMS response below
      etimsQrCode: "",
      etimsVerificationUrl: "",
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || undefined,
      customerAddress: data.customerAddress || undefined,
      customerKraPin: data.customerKraPin || undefined,
      paymentMethod: data.paymentMethod,
      transactionCode: data.transactionCode,
      bankName: data.bankName || undefined,
      items: [
        {
          description: data.description,
          quantity,
          unitPrice,
          taxRate,
          amount: subtotal,
        },
      ],
      subtotal,
      taxAmount,
      totalAmount,
      currency: "KES",
      serviceType: data.serviceType,
      bookingReference: data.bookingReference || undefined,
      invoiceId: invoice?.id,
      invoiceRef: invoice?.invoiceNumber,
      serviceStart: data.serviceStart || undefined,
      serviceEnd: data.serviceEnd || undefined,
      issuedBy: "Admin",
      issuedAt: new Date().toISOString(),
      status: "issued",
      notes: data.notes || undefined,
    };

    // Sign with eTIMS before saving
    try {
      const etims = await fetch("/api/etims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiptNumber: newReceipt.receiptNumber,
          customerName: newReceipt.customerName,
          customerPin: newReceipt.customerKraPin,
          items: newReceipt.items,
          totalAmount: newReceipt.totalAmount,
          taxAmount: newReceipt.taxAmount,
          paymentMethod: newReceipt.paymentMethod,
        }),
      });
      const etimsData = await etims.json();
      if (etimsData.etimsReceiptNumber && !etimsData.mock) {
        newReceipt.etimsReceiptNumber = etimsData.etimsReceiptNumber;
        newReceipt.etimsDeviceNumber = etimsData.etimsDeviceNumber;
        newReceipt.etimsVerificationUrl = etimsData.etimsVerificationUrl;
      }
    } catch(e) { console.error("eTIMS error:", e); }

    // Save to Supabase, then record the payment on the linked invoice
    receiptsApi.create({
      receiptNumber: newReceipt.receiptNumber,
      invoiceId: invoice && isUuid(invoice.id) ? invoice.id : undefined,
      invoiceRef: invoice?.invoiceNumber,
      bookingRef: newReceipt.bookingReference,
      serviceStart: newReceipt.serviceStart,
      serviceEnd: newReceipt.serviceEnd,
      customerName: newReceipt.customerName,
      customerPhone: newReceipt.customerPhone,
      customerEmail: newReceipt.customerEmail,
      customerKraPin: newReceipt.customerKraPin,
      serviceType: newReceipt.serviceType,
      items: newReceipt.items,
      subtotal: newReceipt.subtotal,
      taxAmount: newReceipt.taxAmount,
      totalAmount: newReceipt.totalAmount,
      paymentMethod: newReceipt.paymentMethod,
      transactionCode: newReceipt.transactionCode,
      bankName: newReceipt.bankName,
      status: newReceipt.status,
      etimsReceiptNumber: newReceipt.etimsReceiptNumber,
      etimsDeviceNumber: newReceipt.etimsDeviceNumber,
      etimsVerificationUrl: newReceipt.etimsVerificationUrl,
      issuedBy: newReceipt.issuedBy,
    }).then(async (saved) => {
      toast.success(`Receipt ${newReceipt.receiptNumber} issued`);
      // Use the database id from now on, so editing/voiding this receipt right away is saved
      const savedId = (saved as { id?: string } | null)?.id;
      if (savedId) {
        newReceipt.id = savedId;
        setSelectedReceipt((prev) => (prev && prev.receiptNumber === newReceipt.receiptNumber ? { ...prev, id: savedId } : prev));
      }
      if (invoice && isUuid(invoice.id)) {
        const newPaid = round2(invoice.amountPaid + newReceipt.totalAmount);
        try {
          await invoicesApi.update(invoice.id, {
            amount_paid: newPaid,
            payments: [
              ...invoice.payments,
              {
                id: `p-${Date.now()}`,
                date: format(new Date(), "yyyy-MM-dd"),
                amount: newReceipt.totalAmount,
                method: newReceipt.paymentMethod === "card" ? "bank" : newReceipt.paymentMethod,
                reference: newReceipt.transactionCode,
                note: `Receipt ${newReceipt.receiptNumber}`,
              },
            ],
            status: newPaid >= invoice.total - 0.01 ? "paid" : "partial",
          });
          toast.success(`Invoice ${invoice.invoiceNumber} updated`, {
            description: newPaid >= invoice.total - 0.01 ? "Marked as paid." : `Balance now KES ${round2(invoice.total - newPaid).toLocaleString("en-KE")}.`,
          });
        } catch (err) {
          toast.error(`Receipt saved, but invoice ${invoice.invoiceNumber} was not updated`, {
            description: "Record the payment on the invoice manually. " + (err instanceof Error ? err.message : ""),
          });
        }
      }
      loadReceipts();
    }).catch(err => {
      console.error("Receipt save error:", err);
      toast.error("Save failed: " + err.message);
    });

    setIsDialogOpen(false);
    form.reset();
    clearInvoiceLink();
    // Open the new receipt so it can be printed or sent straight away
    setSelectedReceipt(newReceipt);
    setViewDialogOpen(true);
  };

  // Remove (or re-point) this receipt's payment on its invoice, then recompute the balance
  const syncInvoicePayment = async (receipt: ReceiptData, change: { remove?: boolean; reference?: string }) => {
    if (!receipt.invoiceId || !isUuid(receipt.invoiceId)) return;
    const inv = await invoicesApi.getById(receipt.invoiceId) as Record<string, unknown>;
    const total = Number(inv.total) || 0;
    const marker = `Receipt ${receipt.receiptNumber}`;
    let payments = (Array.isArray(inv.payments) ? inv.payments : []) as Record<string, unknown>[];
    if (change.remove) payments = payments.filter((pm) => pm.note !== marker);
    if (change.reference !== undefined) payments = payments.map((pm) => (pm.note === marker ? { ...pm, reference: change.reference } : pm));
    const paid = round2(payments.reduce((sum, pm) => sum + (Number(pm.amount) || 0), 0));
    const status = paid <= 0 ? "sent" : paid >= total - 0.01 ? "paid" : "partial";
    await invoicesApi.update(receipt.invoiceId, change.remove ? { payments, amount_paid: paid, status } : { payments });
  };

  // Void: saved to the database, and any invoice payment from this receipt is taken off
  const handleVoidReceipt = async (receiptId: string) => {
    const receipt = receipts.find((r) => r.id === receiptId);
    if (!receipt) return;
    setReceipts((prev) => prev.map((r) => (r.id === receiptId ? { ...r, status: "voided" as const } : r)));
    if (selectedReceipt?.id === receiptId) setSelectedReceipt({ ...receipt, status: "voided" });
    if (!isUuid(receipt.id)) { toast.success("Demo receipt voided (not saved — demo data)"); return; }
    try {
      await receiptsApi.update(receipt.id, { status: "voided" });
      toast.success(`Receipt ${receipt.receiptNumber} voided`);
    } catch (err) {
      toast.error("Void failed — receipt is still valid", { description: err instanceof Error ? err.message : String(err) });
      loadReceipts();
      return;
    }
    if (receipt.invoiceId) {
      try {
        await syncInvoicePayment(receipt, { remove: true });
        toast.success(`Payment removed from invoice ${receipt.invoiceRef || ""}`.trim());
      } catch (err) {
        toast.error(`Receipt voided, but invoice ${receipt.invoiceRef || ""} still shows the payment`, {
          description: "Correct the invoice manually. " + (err instanceof Error ? err.message : ""),
        });
      }
    }
  };

  // ── Edit receipt (wording and contact details only — never amounts) ──
  const [editingReceipt, setEditingReceipt] = useState<ReceiptData | null>(null);
  const [editForm, setEditForm] = useState({
    customerName: "", customerPhone: "", customerEmail: "", customerKraPin: "",
    serviceType: "", description: "", transactionCode: "", bankName: "",
    serviceStart: "", serviceEnd: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const openEditReceipt = (receipt: ReceiptData) => {
    if (receipt.status === "voided") { toast.error("Voided receipts can't be edited"); return; }
    setEditForm({
      customerName: receipt.customerName || "",
      customerPhone: receipt.customerPhone || "",
      customerEmail: receipt.customerEmail || "",
      customerKraPin: receipt.customerKraPin || "",
      serviceType: receipt.serviceType || "",
      description: receipt.items[0]?.description || "",
      transactionCode: receipt.transactionCode || "",
      bankName: receipt.bankName || "",
      serviceStart: receipt.serviceStart || "",
      serviceEnd: receipt.serviceEnd || "",
    });
    setViewDialogOpen(false);
    setEditingReceipt(receipt);
  };

  const saveEditReceipt = async () => {
    const r = editingReceipt;
    if (!r) return;
    if (editForm.customerName.trim().length < 2) { toast.error("Customer name is required"); return; }
    if (editForm.customerPhone.replace(/\D/g, "").length < 9) { toast.error("Enter a valid phone number"); return; }
    if (!editForm.transactionCode.trim()) { toast.error("Transaction code is required"); return; }
    if (editForm.serviceStart && editForm.serviceEnd && editForm.serviceEnd < editForm.serviceStart) {
      toast.error("Service end date can't be before the start date"); return;
    }

    const items = r.items.map((item, i) => (i === 0 ? { ...item, description: editForm.description.trim() } : item));
    const updated: ReceiptData = {
      ...r,
      customerName: editForm.customerName.trim(),
      customerPhone: editForm.customerPhone.trim(),
      customerEmail: editForm.customerEmail.trim() || undefined,
      customerKraPin: editForm.customerKraPin.trim() || undefined,
      serviceType: editForm.serviceType,
      transactionCode: editForm.transactionCode.trim(),
      bankName: editForm.bankName.trim() || undefined,
      serviceStart: editForm.serviceStart || undefined,
      serviceEnd: editForm.serviceEnd || undefined,
      items,
    };
    const codeChanged = updated.transactionCode !== r.transactionCode;

    setIsSavingEdit(true);
    try {
      if (isUuid(r.id)) {
        await receiptsApi.update(r.id, {
          customer_name: updated.customerName,
          customer_phone: updated.customerPhone,
          customer_email: updated.customerEmail || "",
          customer_kra_pin: updated.customerKraPin || "",
          service_type: updated.serviceType,
          items,
          transaction_code: updated.transactionCode,
          payment_reference: updated.transactionCode,
          bank_name: updated.bankName || "",
          service_start: updated.serviceStart || "",
          service_end: updated.serviceEnd || "",
        });
      }
      setReceipts((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
      setSelectedReceipt(updated);
      setEditingReceipt(null);
      toast.success(`Receipt ${r.receiptNumber} updated${isUuid(r.id) ? "" : " (demo — not saved)"}`);
      if (codeChanged && r.invoiceId) {
        try { await syncInvoicePayment(updated, { reference: updated.transactionCode }); }
        catch { toast.error(`Invoice ${r.invoiceRef || ""} still shows the old transaction code — update it there.`); }
      }
      setViewDialogOpen(true); // show the corrected receipt
    } catch (err) {
      toast.error("Update failed", { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Print / Save as PDF. A copy of the receipt is rendered directly under <body>
  // (portal at the bottom of this file); while printing, everything else is
  // display:none — same reliable approach as invoices. No pop-up windows.
  const handlePrint = (receipt: ReceiptData | null = selectedReceipt) => {
    const originalTitle = document.title;
    if (receipt) document.title = `Receipt-${receipt.receiptNumber}`; // saved PDF's file name
    document.body.classList.add("printing-receipt");
    window.addEventListener("afterprint", () => {
      document.title = originalTitle;
      document.body.classList.remove("printing-receipt");
    }, { once: true });
    window.print();
  };

  // createPortal needs `document` (browser only)
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // State for sending receipts
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);

  // ── Sending ──────────────────────────────────────────────────
  // The /api/email and /api/sms routes reply { mock: true } when their API keys
  // aren't configured. Treat that as "not sent" and say so — never fake success.
  const readDelivery = async (res: Response) => {
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok && !body.mock && !body.error, mock: !!body.mock, error: String(body.error || body.message || res.statusText) };
  };

  const toWhatsAppNumber = (phone?: string) => {
    const digits = (phone || "").replace(/\D/g, "");
    if (digits.startsWith("0")) return "254" + digits.slice(1);
    if (digits.length === 9) return "254" + digits; // 712345678
    return digits;
  };

  const kes = (n: number) => `KES ${Number(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const sendReceiptEmail = async (receipt: ReceiptData) => {
    if (!receipt.customerEmail) {
      toast.error("No email address", { description: "Add the customer's email to send the receipt." });
      return;
    }
    setIsSendingEmail(true);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: receipt.customerEmail,
          subject: `Receipt ${receipt.receiptNumber} — ${COMPANY.name}`,
          type: "receipt",
          data: {
            receiptNumber: receipt.receiptNumber,
            customerName: receipt.customerName,
            serviceType: receipt.serviceType,
            totalAmount: receipt.totalAmount,
            paymentMethod: paymentMethodConfig[receipt.paymentMethod]?.label || receipt.paymentMethod,
            etimsReceiptNumber: receipt.etimsReceiptNumber,
          },
        }),
      });
      const r = await readDelivery(res);
      if (r.mock) toast.warning("Email NOT sent — email service isn't set up yet", { description: "Add RESEND_API_KEY in Vercel to send real emails." });
      else if (r.ok) toast.success(`Receipt emailed to ${receipt.customerEmail}`);
      else toast.error("Email failed", { description: r.error });
    } catch (e) {
      toast.error("Email failed", { description: String(e) });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const sendReceiptSms = async (receipt: ReceiptData) => {
    if (!receipt.customerPhone) {
      toast.error("No phone number", { description: "Add the customer's phone number to send an SMS." });
      return;
    }
    setIsSendingSms(true);
    try {
      const message =
        `${COMPANY.name}: Payment of ${kes(receipt.totalAmount)} received` +
        (receipt.transactionCode ? ` (ref ${receipt.transactionCode})` : "") +
        `. Receipt ${receipt.receiptNumber}${receipt.invoiceRef ? ` for invoice ${receipt.invoiceRef}` : ""}. Thank you!`;
      const res = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: receipt.customerPhone, message }),
      });
      const r = await readDelivery(res);
      if (r.mock) toast.warning("SMS NOT sent — SMS service isn't set up yet", { description: "Add AT_API_KEY and AT_USERNAME (Africa's Talking) in Vercel." });
      else if (r.ok) toast.success(`SMS sent to ${receipt.customerPhone}`);
      else toast.error("SMS failed", { description: r.error });
    } catch (e) {
      toast.error("SMS failed", { description: String(e) });
    } finally {
      setIsSendingSms(false);
    }
  };

  // WhatsApp: opens WhatsApp with a ready message — free, no setup needed
  const sendReceiptWhatsApp = (receipt: ReceiptData) => {
    const number = toWhatsAppNumber(receipt.customerPhone);
    if (!number) {
      toast.error("No phone number", { description: "Add the customer's phone number to use WhatsApp." });
      return;
    }
    const msg = encodeURIComponent(
      `*${COMPANY.name}*\n` +
      `Receipt No: *${receipt.receiptNumber}*\n` +
      (receipt.invoiceRef ? `Invoice: ${receipt.invoiceRef}\n` : "") +
      `Service: ${receipt.serviceType}\n` +
      `Amount received: *${kes(receipt.totalAmount)}*\n` +
      `Payment: ${paymentMethodConfig[receipt.paymentMethod]?.label || receipt.paymentMethod}` +
      (receipt.transactionCode ? ` (ref ${receipt.transactionCode})` : "") + `\n` +
      (receipt.etimsReceiptNumber ? `KRA eTIMS no: ${receipt.etimsReceiptNumber}\n` : "") +
      `\nThank you for choosing Moventra!\n${COMPANY.phone}`
    );
    window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
  };

  const sendReceiptBoth = async (receipt: ReceiptData) => {
    const promises: Promise<void>[] = [];
    
    if (receipt.customerEmail) {
      promises.push(sendReceiptEmail(receipt));
    }
    if (receipt.customerPhone) {
      promises.push(sendReceiptSms(receipt));
    }
    
    if (promises.length === 0) {
      toast.error("No contact details", {
        description: "Customer email and phone number are not available.",
      });
      return;
    }
    
    await Promise.all(promises);
  };

  // The receipt document. Rendered in the view dialog and, for printing, in a portal under <body>.
  const receiptDocument = selectedReceipt ? (
        <div style={{backgroundColor:"#ffffff",color:"#1a1a2e"}} className="rounded-xl shadow-sm overflow-hidden border border-gray-200">

          {/* Top accent bar */}
          <div style={{background:"linear-gradient(135deg,#0a1628 0%,#1a3a5c 50%,#0a1628 100%)",padding:"3px"}} />

          <div className="p-7">
            {/* ── HEADER ── */}
            <div className="flex items-start justify-between mb-6">
              {/* Logo + Company */}
              <div className="flex items-start gap-4">
                <Image src="/images/logo.png" alt={companyDetails.name} width={90} height={90} loading="eager"
                  className="h-[80px] w-[80px] object-contain rounded-lg" unoptimized />
                <div>
                  <h1 style={{color:"#0a1628"}} className="text-xl font-extrabold leading-tight">{companyDetails.name}</h1>
                  <p style={{color:"#e67e22"}} className="text-xs font-semibold mt-0.5 tracking-wide">Experience. Move. Deliver. Beyond Borders.</p>
                  <div className="mt-2 space-y-1 text-xs" style={{color:"#555"}}>
                    <p>{companyDetails.address}</p>
                    <p>{companyDetails.phone} &nbsp;|&nbsp; {companyDetails.email}</p>
                    <p className="font-semibold" style={{color:"#0a1628"}}>KRA PIN: {companyDetails.kraPin}</p>
                  </div>
                </div>
              </div>
              {/* Receipt badge */}
              <div className="text-right">
                <div style={{backgroundColor:"#0a1628",color:"white",borderRadius:"10px",padding:"12px 20px",minWidth:"160px"}}>
                  <p style={{fontSize:"10px",letterSpacing:"0.1em",opacity:0.8,textTransform:"uppercase"}}>Official Receipt</p>
                  <p style={{fontSize:"20px",fontWeight:800,fontFamily:"monospace",marginTop:"2px"}}>{selectedReceipt.receiptNumber}</p>
                  <div style={{height:"1px",backgroundColor:"rgba(230,126,34,0.5)",margin:"8px 0"}} />
                  <p style={{fontSize:"11px",opacity:0.85}}>{formatDate(selectedReceipt.issuedAt)}</p>
                  {selectedReceipt.invoiceRef && <p style={{fontSize:"11px",marginTop:"4px",color:"#fdba74"}}>For invoice {selectedReceipt.invoiceRef}</p>}
                </div>
                {selectedReceipt.etimsReceiptNumber && (
                  <div className="mt-2 text-xs text-right" style={{color:"#374151"}}>
                    <span style={{color:"#e67e22",fontWeight:600}}>eTIMS: </span>
                    <span style={{fontFamily:"monospace"}}>{selectedReceipt.etimsReceiptNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── DIVIDER ── */}
            <div style={{height:"2px",background:"linear-gradient(to right,#e67e22,#0a1628,#e67e22)",borderRadius:"2px",marginBottom:"20px"}} />

            {/* ── CUSTOMER + PAYMENT ── */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div style={{backgroundColor:"#f8f9ff",border:"1px solid #e8eaf0",borderRadius:"10px",padding:"14px"}}>
                <div className="flex items-center gap-2 mb-3">
                  <User style={{color:"#e67e22",width:14,height:14}} />
                  <span style={{color:"#0a1628",fontWeight:700,fontSize:"11px",letterSpacing:"0.05em",textTransform:"uppercase"}}>Received From</span>
                </div>
                <p style={{color:"#0a1628",fontWeight:700,fontSize:"16px"}}>{selectedReceipt.customerName}</p>
                {selectedReceipt.customerPhone && <p style={{color:"#555",fontSize:"13px",marginTop:"4px"}}>{selectedReceipt.customerPhone}</p>}
                {selectedReceipt.customerEmail && <p style={{color:"#555",fontSize:"12px",wordBreak:"break-all"}}>{selectedReceipt.customerEmail}</p>}
                {selectedReceipt.customerKraPin && <p style={{color:"#0a1628",fontSize:"12px",fontWeight:600,marginTop:"4px"}}>KRA PIN: {selectedReceipt.customerKraPin}</p>}
              </div>
              <div style={{backgroundColor:"#f8f9ff",border:"1px solid #e8eaf0",borderRadius:"10px",padding:"14px"}}>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard style={{color:"#e67e22",width:14,height:14}} />
                  <span style={{color:"#0a1628",fontWeight:700,fontSize:"11px",letterSpacing:"0.05em",textTransform:"uppercase"}}>Payment Info</span>
                </div>
                {(() => {
                  const cfg = paymentMethodConfig[selectedReceipt.paymentMethod];
                  const Ic = cfg.icon;
                  return (
                    <div className="flex items-center gap-2 mb-2">
                      <Ic style={{color:"#e67e22",width:18,height:18}} />
                      <span style={{color:"#0a1628",fontWeight:700,fontSize:"14px"}}>{cfg.label}</span>
                    </div>
                  );
                })()}
                <p style={{fontSize:"12px",color:"#555"}}>Ref: <span style={{fontFamily:"monospace",backgroundColor:"#fff3e0",color:"#0a1628",padding:"1px 6px",borderRadius:"4px",fontWeight:600}}>{selectedReceipt.transactionCode}</span></p>
                {selectedReceipt.bankName && <p style={{fontSize:"12px",color:"#555",marginTop:"4px"}}>Bank: {selectedReceipt.bankName}</p>}
                <p style={{fontSize:"12px",color:"#555",marginTop:"4px"}}>Service: {selectedReceipt.serviceType}</p>
              </div>
            </div>

            {/* ── SERVICE PERIOD ── */}
            {(selectedReceipt.serviceStart || selectedReceipt.serviceEnd) && (
              <div style={{display:"flex",alignItems:"center",gap:"12px",backgroundColor:"#f8f9ff",border:"1px solid #dde0e8",borderLeft:"4px solid #e67e22",borderRadius:"8px",padding:"10px 14px",marginBottom:"16px"}}>
                <span style={{color:"#0a1628",fontWeight:800,fontSize:"11px",letterSpacing:"0.07em",textTransform:"uppercase",whiteSpace:"nowrap"}}>Service Period</span>
                <span style={{color:"#0a1628",fontWeight:600,fontSize:"13px"}}>{formatServicePeriod(selectedReceipt.serviceStart, selectedReceipt.serviceEnd)}</span>
              </div>
            )}

            {/* ── ITEMS TABLE ── */}
            <div className="mb-6">
              <p style={{color:"#0a1628",fontWeight:700,fontSize:"11px",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"8px"}}>Description of Services / Items</p>
              <div style={{border:"1px solid #dde0e8",borderRadius:"10px",overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{backgroundColor:"#0a1628",color:"white"}}>
                      <th style={{textAlign:"left",padding:"10px 14px",fontSize:"11px",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase"}}>Description</th>
                      <th style={{textAlign:"center",padding:"10px 14px",fontSize:"11px",fontWeight:700,width:"60px",letterSpacing:"0.05em",textTransform:"uppercase"}}>Qty</th>
                      <th style={{textAlign:"right",padding:"10px 14px",fontSize:"11px",fontWeight:700,width:"120px",letterSpacing:"0.05em",textTransform:"uppercase"}}>Unit Price</th>
                      <th style={{textAlign:"right",padding:"10px 14px",fontSize:"11px",fontWeight:700,width:"130px",letterSpacing:"0.05em",textTransform:"uppercase",color:"#e67e22"}}>Amount (KES)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReceipt.items.map((item, i) => (
                      <tr key={i} style={{backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8f9ff",color:"#1a1a2e",borderBottom:"1px solid #eee"}}>
                        <td style={{padding:"10px 14px",fontSize:"13px"}}>{item.description}</td>
                        <td style={{padding:"10px 14px",textAlign:"center",fontSize:"13px"}}>{item.quantity}</td>
                        <td style={{padding:"10px 14px",textAlign:"right",fontSize:"13px"}}>{formatCurrency(item.unitPrice)}</td>
                        <td style={{padding:"10px 14px",textAlign:"right",fontWeight:700,fontSize:"13px"}}>{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── TOTALS ── */}
            <div className="flex justify-end mb-6">
              <div style={{width:"280px",backgroundColor:"#0a1628",borderRadius:"12px",padding:"16px",border:"2px solid #e67e22"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px",color:"rgba(255,255,255,0.7)",marginBottom:"8px"}}>
                  <span>Subtotal:</span><span>{formatCurrency(selectedReceipt.subtotal)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px",color:"rgba(255,255,255,0.7)",marginBottom:"10px"}}>
                  <span>VAT (16%):</span><span>{formatCurrency(selectedReceipt.taxAmount)}</span>
                </div>
                <div style={{borderTop:"1px solid rgba(230,126,34,0.5)",paddingTop:"10px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px"}}>
                  <span style={{color:"white",fontWeight:700,fontSize:"14px",whiteSpace:"nowrap"}}>TOTAL PAID:</span>
                  <span style={{color:"#e67e22",fontWeight:800,fontSize:"20px",whiteSpace:"nowrap"}}>{formatCurrency(selectedReceipt.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* ── AMOUNT IN WORDS ── */}
            <div style={{backgroundColor:"#fff8ee",border:"1px solid #e67e22",borderRadius:"8px",padding:"10px 14px",marginBottom:"16px"}}>
              <p style={{fontSize:"12px",color:"#0a1628"}}>
                <span style={{fontWeight:700,color:"#e67e22"}}>Amount in Words: </span>
                <span style={{fontStyle:"italic"}}>{amountInWords(selectedReceipt.totalAmount)}</span>
              </p>
            </div>

            {selectedReceipt.etimsReceiptNumber && (<>
            {/* ── eTIMS ── */}
            <div style={{border:"2px solid #e67e22",borderRadius:"10px",padding:"14px",display:"flex",alignItems:"center",gap:"16px",marginBottom:"20px",backgroundColor:"#fffaf5"}}>
              <div style={{backgroundColor:"white",border:"1px solid #e67e22",borderRadius:"8px",padding:"8px",flexShrink:0}}>
                <QrCode style={{width:36,height:36,color:"#e67e22"}} />
              </div>
              <div style={{flex:1}}>
                <p style={{color:"#0a1628",fontWeight:700,fontSize:"14px"}}>eTIMS Verified Receipt</p>
                <p style={{color:"#888",fontSize:"11px",marginTop:"2px"}}>Device: {selectedReceipt.etimsDeviceNumber}</p>
                <p style={{fontSize:"11px",marginTop:"4px",color:"#555"}}>
                  Verify at: <span style={{color:"#e67e22",textDecoration:"underline"}}>{selectedReceipt.etimsVerificationUrl}</span>
                </p>
              </div>
            </div>
            </>)}

            {/* ── SIGNATURES ── */}
            <div className="grid grid-cols-2 gap-8" style={{marginTop:"24px",paddingTop:"16px",borderTop:"1px solid #dde0e8"}}>
              <div style={{textAlign:"center"}}>
                <div style={{height:"56px",borderBottom:"1px solid #0a1628",marginBottom:"8px"}} />
                <p style={{fontSize:"12px",color:"#0a1628",fontWeight:600}}>Received By (Signature)</p>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{height:"56px",borderBottom:"1px solid #0a1628",marginBottom:"8px"}} />
                <p style={{fontSize:"12px",color:"#0a1628",fontWeight:600}}>Issued By: {selectedReceipt.issuedBy}</p>
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div style={{textAlign:"center",marginTop:"20px",paddingTop:"14px",borderTop:"2px solid #e67e22"}}>
              <p style={{color:"#e67e22",fontWeight:700,fontSize:"14px"}}>Thank You For Your Business!</p>
              <p style={{color:"#666",fontSize:"11px",marginTop:"4px"}}>This is an official receipt. Please retain for your records.</p>
              <p style={{color:"#999",fontSize:"10px",marginTop:"4px"}}>{companyDetails.website} &nbsp;|&nbsp; {companyDetails.email}</p>
            </div>
          </div>

          {/* Bottom accent bar */}
          <div style={{background:"linear-gradient(135deg,#e67e22,#0a1628,#e67e22)",padding:"3px"}} />
        </div>
  ) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Receipt className="h-7 w-7 text-teal-400" />
            Receipt Management
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Issue official receipts with M-Pesa and bank references</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) clearInvoiceLink(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Issue Receipt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-emerald-500" />
                Issue Receipt
              </DialogTitle>
              <DialogDescription>
                Record a payment and issue an official receipt with its M-Pesa or bank reference
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* ── Create from invoice (optional) ── */}
                <div className="rounded-lg border border-cyan-500/40 bg-cyan-950/20 p-4">
                  <h4 className="font-semibold text-cyan-300 mb-1 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <FileText className="h-4 w-4" />
                    Pay an Invoice (optional)
                  </h4>
                  <p className="text-xs text-gray-400 mb-3">Pick the invoice being paid to fill in the client, service and balance automatically. The payment is also recorded on the invoice.</p>
                  {linkedInvoice ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-500/40 bg-cyan-900/20 px-3 py-2">
                      <div className="text-sm text-white">
                        <span className="font-mono font-bold">{linkedInvoice.invoiceNumber}</span>
                        <span className="text-gray-300"> · {linkedInvoice.customerName}</span>
                        <span className="text-gray-400"> · Balance KES {invoiceBalance(linkedInvoice).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={clearInvoiceLink} className="text-gray-300 hover:text-white">
                        <XCircle className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50"
                        placeholder={invoiceOptions.length ? "Search unpaid invoices by number or client…" : "No unpaid invoices found"}
                        value={invoiceSearch}
                        onChange={(e) => { setInvoiceSearch(e.target.value); setShowInvoiceDropdown(true); }}
                        onFocus={() => setShowInvoiceDropdown(true)}
                        onBlur={() => setTimeout(() => setShowInvoiceDropdown(false), 150)}
                      />
                      {showInvoiceDropdown && filteredInvoiceOptions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 rounded-lg border border-white/10 bg-[#0a1628] shadow-xl max-h-64 overflow-y-auto">
                          {filteredInvoiceOptions.map((inv) => (
                            <button key={inv.id} type="button"
                              className="w-full text-left px-3 py-2 hover:bg-white/5 border-b border-white/5 last:border-0"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => selectInvoice(inv)}>
                              <div className="flex justify-between gap-3 text-sm">
                                <span className="font-mono font-semibold text-white">{inv.invoiceNumber}</span>
                                <span className="text-cyan-300">KES {invoiceBalance(inv).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="text-xs text-gray-400">{inv.customerName}{inv.amountPaid > 0 ? " · part paid" : ""}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Customer Details */}
                <div className="rounded-lg border border-blue-500/50 dark:border-blue-800 bg-blue-900/30/50 dark:bg-blue-950/20 p-4">
                  <h4 className="font-semibold text-blue-300 dark:text-blue-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <User className="h-4 w-4" />
                    Customer Details
                  </h4>
                  {/* Client Search */}
                  <div className="mb-4 relative">
                    <label className="text-sm font-medium text-gray-300 block mb-1.5">Search Existing Client</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
                        placeholder="Type name, phone or ID to search clients..."
                        value={clientSearch}
                        onChange={e => searchClients(e.target.value)}
                        onFocus={() => clientSearch.length >= 2 && setShowClientDropdown(true)}
                      />
                    </div>
                    {showClientDropdown && clientResults.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 rounded-lg border border-white/10 bg-[#0a1628] shadow-xl">
                        {clientResults.map(c => (
                          <button key={c.id} type="button"
                            className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                            onClick={() => selectClient(c)}>
                            <div className="flex items-center justify-between">
                              <p className="text-white text-sm font-medium">{c.fullName}</p>
                              <span className={"text-xs px-1.5 py-0.5 rounded " + (c.source === "sublet" ? "bg-cyan-500/20 text-cyan-300" : "bg-emerald-500/20 text-emerald-300")}>{c.source === "sublet" ? "Sublet" : "Client"}</span>
                            </div>
                            <p className="text-gray-400 text-xs">{c.phone}{c.email ? " · " + c.email : ""}</p>
                          </button>
                        ))}
                      </div>
                    )}
                    {clientSearch.length >= 2 && clientResults.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">No existing client found — fill in details below</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name or company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="0712345678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="email@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerKraPin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>KRA PIN</FormLabel>
                          <FormControl>
                            <Input placeholder="A012345678B" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Required for B2B transactions and tax claims
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerAddress"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Customer address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Payment Details */}
                <div className="rounded-lg border border-green-500/50 dark:border-green-800 bg-green-900/30/50 dark:bg-green-950/20 p-4">
                  <h4 className="font-semibold text-green-300 dark:text-green-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <CreditCard className="h-4 w-4" />
                    Payment Details
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mpesa">
                                <div className="flex items-center gap-2">
                                  <Smartphone className="h-4 w-4 text-green-500" />
                                  M-Pesa
                                </div>
                              </SelectItem>
                              <SelectItem value="bank">
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-blue-500" />
                                  Bank Transfer
                                </div>
                              </SelectItem>
                              <SelectItem value="cash">
                                <div className="flex items-center gap-2">
                                  <Banknote className="h-4 w-4 text-amber-500" />
                                  Cash
                                </div>
                              </SelectItem>
                              <SelectItem value="card">
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-purple-500" />
                                  Card Payment
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transactionCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {paymentMethod === "mpesa"
                              ? "M-Pesa Transaction Code *"
                              : paymentMethod === "bank"
                              ? "Bank Reference Number *"
                              : "Transaction Reference *"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                paymentMethod === "mpesa"
                                  ? "e.g., SGH7K8L9M0"
                                  : paymentMethod === "bank"
                                  ? "e.g., NCBA-TRX-20250115-001"
                                  : "Transaction reference"
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            {paymentMethod === "mpesa"
                              ? "10-character M-Pesa confirmation code"
                              : "Bank or payment reference number"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {paymentMethod === "bank" && (
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select bank" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="KCB Bank">KCB Bank</SelectItem>
                                <SelectItem value="Equity Bank">Equity Bank</SelectItem>
                                <SelectItem value="NCBA Bank">NCBA Bank</SelectItem>
                                <SelectItem value="Cooperative Bank">Co-operative Bank</SelectItem>
                                <SelectItem value="Stanbic Bank">Stanbic Bank</SelectItem>
                                <SelectItem value="Standard Chartered">Standard Chartered</SelectItem>
                                <SelectItem value="Absa Bank">Absa Bank</SelectItem>
                                <SelectItem value="DTB Bank">DTB Bank</SelectItem>
                                <SelectItem value="I&M Bank">I&M Bank</SelectItem>
                                <SelectItem value="Family Bank">Family Bank</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* Service Details */}
                <div className="rounded-lg border border-amber-500/50 dark:border-amber-800 bg-amber-900/30/50 dark:bg-amber-950/20 p-4">
                  <h4 className="font-semibold text-amber-300 dark:text-amber-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <FileText className="h-4 w-4" />
                    Service Details
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select service type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {serviceTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bookingReference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Booking Reference</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., BK-2025-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Service period (copied from the invoice when paying one) */}
                    <FormField
                      control={form.control}
                      name="serviceStart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Start</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="serviceEnd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service End</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Toyota Prado Rental - 3 Days"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {linkedInvoice ? (
                      <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Amount Received (KES, incl. VAT) *</label>
                          <Input type="number" min="0" step="0.01" value={amountReceived}
                            onChange={(e) => applyAmountReceived(e.target.value)} />
                          <p className="text-xs text-gray-400">
                            Invoice balance: KES {invoiceBalance(linkedInvoice).toLocaleString("en-KE", { minimumFractionDigits: 2 })}. Enter less for a part payment.
                          </p>
                        </div>
                        <div className="space-y-1 text-sm text-gray-300 rounded-lg border border-white/10 p-3">
                          {(() => {
                            const gross = parseFloat(amountReceived) || 0;
                            const net = round2(gross / (1 + linkedInvoice.vatRate / 100));
                            return (<>
                              <div className="flex justify-between"><span>Net</span><span>KES {net.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span></div>
                              <div className="flex justify-between"><span>VAT ({linkedInvoice.vatRate}%)</span><span>KES {round2(gross - net).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span></div>
                              <div className="flex justify-between font-semibold text-white"><span>Total</span><span>KES {gross.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span></div>
                            </>);
                          })()}
                        </div>
                      </div>
                    ) : (<>
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity *</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" step="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unitPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price (KES) *</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VAT Rate (%)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">0% (Exempt)</SelectItem>
                              <SelectItem value="8">8% (Reduced)</SelectItem>
                              <SelectItem value="16">16% (Standard)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">
                            Standard VAT rate in Kenya is 16%
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </>)}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Input placeholder="Any additional notes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gap-2">
                    <Receipt className="h-4 w-4" />
                    Issue Receipt
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time receipts issued</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issued</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{stats.issued}</div>
            <p className="text-xs text-muted-foreground">Active receipts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Banknote className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From issued receipts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total VAT</CardTitle>
            <BadgeCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalTax)}</div>
            <p className="text-xs text-muted-foreground">Tax collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by receipt number, customer, transaction code, KRA PIN..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="voided">Voided</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Receipts</CardTitle>
          <CardDescription>
            {filteredReceipts.length} receipt(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Transaction Code</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No receipts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReceipts.map((receipt) => {
                    const paymentConfig = paymentMethodConfig[receipt.paymentMethod];
                    const statusConf = statusConfig[receipt.status];
                    const PaymentIcon = paymentConfig.icon;
                    const StatusIcon = statusConf.icon;

                    return (
                      <TableRow key={receipt.id}>
                        <TableCell>
                          <div className="font-mono text-sm">{receipt.receiptNumber}</div>
                          {receipt.invoiceRef && (
                            <div className="text-xs text-muted-foreground">For {receipt.invoiceRef}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{receipt.customerName}</div>
                          {receipt.customerKraPin && (
                            <div className="text-xs text-muted-foreground">
                              KRA: {receipt.customerKraPin}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <PaymentIcon className={`h-4 w-4 ${paymentConfig.color}`} />
                            <span className="text-sm">{paymentConfig.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {receipt.transactionCode}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{formatCurrency(receipt.totalAmount)}</div>
                          <div className="text-xs text-muted-foreground">
                            VAT: {formatCurrency(receipt.taxAmount)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(receipt.issuedAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusConf.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConf.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedReceipt(receipt);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-blue-500 hover:text-blue-600 hover:bg-blue-900/30 dark:hover:bg-blue-950"
                              onClick={() => sendReceiptEmail(receipt)}
                              disabled={!receipt.customerEmail || isSendingEmail}
                              title={receipt.customerEmail ? `Send to ${receipt.customerEmail}` : "No email address"}
                            >
                              {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-green-500 hover:text-green-600 hover:bg-green-900/30 dark:hover:bg-green-950"
                              onClick={() => sendReceiptSms(receipt)}
                              disabled={!receipt.customerPhone || isSendingSms}
                              title={receipt.customerPhone ? `Send to ${receipt.customerPhone}` : "No phone number"}
                            >
                              {isSendingSms ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                            </Button>
                            {receipt.status === "issued" && (
                              <Button variant="ghost" size="icon" title="Edit receipt" onClick={() => openEditReceipt(receipt)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" title="Print receipt" onClick={() => { setSelectedReceipt(receipt); setTimeout(() => handlePrint(receipt), 300); }}>
                              <Printer className="h-4 w-4" />
                            </Button>
                            {receipt.status === "issued" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive">
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Void Receipt?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This marks the receipt as void and can&apos;t be undone.
                                      {receipt.invoiceRef ? ` The payment will also be removed from invoice ${receipt.invoiceRef}.` : ""}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleVoidReceipt(receipt.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Void Receipt
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Receipt Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-[900px] sm:max-w-[900px] max-h-[94vh] overflow-y-auto" style={{backgroundColor:"#ffffff",color:"#1a1a2e"}}>
          {selectedReceipt && (
        
            <div style={{backgroundColor:"#ffffff",color:"#1a1a2e"}}>
              {/* Screen-only header */}
              <DialogHeader className="print:hidden mb-4">
                <DialogTitle className="flex items-center justify-between text-white">
                  <span className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-emerald-500" />
                    Receipt Details
                  </span>
                  <Badge
                    variant="outline"
                    className={statusConfig[selectedReceipt.status].color}
                  >
                    {statusConfig[selectedReceipt.status].label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              {/* A4 preview: same page size and margins as the printout (210 × 297 mm, 7/12/6 mm margins) */}
              <div className="rounded-lg" style={{backgroundColor:"#cbd5e1",padding:"20px"}}>
                <div
                  className="receipt-a4-sheet"
                  style={{
                    width:"min(210mm, 100%)", minHeight:"297mm", margin:"0 auto",
                    backgroundColor:"#ffffff", boxShadow:"0 6px 24px rgba(15,23,42,0.25)",
                    padding:"7mm 12mm 6mm", boxSizing:"border-box",
                  }}
                >
                  {receiptDocument}
                </div>
                <p className="text-center text-xs mt-2" style={{color:"#334155"}}>A4 preview — prints exactly like this</p>
              </div>

              {/* ── Send & print (screen only) — styled for the white receipt window ── */}
              <div className="print:hidden mt-5 rounded-xl border p-4" style={{backgroundColor:"#f8fafc",borderColor:"#e2e8f0"}}>
                <div className="flex items-center gap-2 mb-1">
                  <Send className="h-4 w-4" style={{color:"#e67e22"}} />
                  <h4 className="font-bold text-sm" style={{color:"#0a1628"}}>Send Receipt to Customer</h4>
                </div>
                <p className="text-xs mb-3" style={{color:"#475569"}}>Choose how the customer should receive this receipt.</p>

                <div className="grid gap-2 sm:grid-cols-3">
                  {([
                    {
                      key: "email", label: "Email", icon: Mail,
                      detail: selectedReceipt?.customerEmail || "No email on file",
                      enabled: !!selectedReceipt?.customerEmail && !isSendingEmail, busy: isSendingEmail,
                      onClick: () => selectedReceipt && sendReceiptEmail(selectedReceipt),
                      accent: "#0a1628",
                    },
                    {
                      key: "sms", label: "SMS", icon: MessageSquare,
                      detail: selectedReceipt?.customerPhone || "No phone on file",
                      enabled: !!selectedReceipt?.customerPhone && !isSendingSms, busy: isSendingSms,
                      onClick: () => selectedReceipt && sendReceiptSms(selectedReceipt),
                      accent: "#0a1628",
                    },
                    {
                      key: "whatsapp", label: "WhatsApp", icon: MessageSquare,
                      detail: selectedReceipt?.customerPhone || "No phone on file",
                      enabled: !!selectedReceipt?.customerPhone, busy: false,
                      onClick: () => selectedReceipt && sendReceiptWhatsApp(selectedReceipt),
                      accent: "#128C7E", // WhatsApp green (readable on white)
                    },
                  ] as const).map((ch) => {
                    const Icon = ch.icon;
                    return (
                      <button
                        key={ch.key}
                        type="button"
                        onClick={ch.onClick}
                        disabled={!ch.enabled}
                        title={`${ch.label}: ${ch.detail}`}
                        className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors bg-[#ffffff] hover:bg-[#f1f5f9] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                        style={{borderColor:"#cbd5e1"}}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{backgroundColor: ch.accent}}>
                          {ch.busy ? <Loader2 className="h-4 w-4 animate-spin" style={{color:"#ffffff"}} /> : <Icon className="h-4 w-4" style={{color:"#ffffff"}} />}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold" style={{color:"#0a1628"}}>{ch.label}</span>
                          <span className="block truncate text-xs" style={{color:"#475569"}}>{ch.detail}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedReceipt?.customerEmail && selectedReceipt?.customerPhone && (
                  <button
                    type="button"
                    onClick={() => selectedReceipt && sendReceiptBoth(selectedReceipt)}
                    disabled={isSendingEmail || isSendingSms}
                    className="mt-2 w-full rounded-lg px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                    style={{backgroundColor:"#e67e22",color:"#ffffff"}}
                  >
                    <span className="inline-flex items-center gap-2" style={{color:"#ffffff"}}><Send className="h-4 w-4" style={{color:"#ffffff"}} /> Send by Email and SMS</span>
                  </button>
                )}
              </div>

              <div className="print:hidden mt-4 flex justify-end gap-2">
                {selectedReceipt?.status === "issued" && (
                  <button
                    type="button"
                    onClick={() => selectedReceipt && openEditReceipt(selectedReceipt)}
                    className="inline-flex items-center gap-2 rounded-lg border bg-[#ffffff] hover:bg-[#f1f5f9] px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                    style={{borderColor:"#cbd5e1",color:"#0a1628"}}
                  >
                    <Pencil className="h-4 w-4" style={{color:"#0a1628"}} />
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewDialogOpen(false)}
                  className="rounded-lg border bg-[#ffffff] hover:bg-[#f1f5f9] px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                  style={{borderColor:"#cbd5e1",color:"#0a1628"}}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handlePrint()}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                  style={{backgroundColor:"#0a1628",color:"#ffffff"}}
                >
                  <Printer className="h-4 w-4" style={{color:"#ffffff"}} />
                  Print Receipt
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Receipt Dialog */}
      <Dialog open={!!editingReceipt} onOpenChange={(open) => { if (!open) setEditingReceipt(null); }}>
        <DialogContent className="max-w-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-emerald-500" />
              Edit Receipt {editingReceipt?.receiptNumber}
            </DialogTitle>
            <DialogDescription>
              Correct contact details, wording or the transaction code. The receipt number and date stay the same.
            </DialogDescription>
          </DialogHeader>

          {editingReceipt && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  ["customerName", "Customer Name *", "text"],
                  ["customerPhone", "Phone Number *", "tel"],
                  ["customerEmail", "Email", "email"],
                  ["customerKraPin", "KRA PIN", "text"],
                  ["transactionCode", editingReceipt.paymentMethod === "mpesa" ? "M-Pesa Transaction Code *" : "Transaction / Reference *", "text"],
                  ...(editingReceipt.paymentMethod === "bank" ? [["bankName", "Bank Name", "text"]] : []),
                  ["serviceStart", "Service Start", "date"],
                  ["serviceEnd", "Service End", "date"],
                ] as [keyof typeof editForm, string, string][]).map(([key, label, type]) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-sm font-medium">{label}</label>
                    <Input type={type} value={editForm[key]}
                      onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Service Type</label>
                  <Select value={editForm.serviceType} onValueChange={(v) => setEditForm((f) => ({ ...f, serviceType: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select service type" /></SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
              </div>

              {/* Money is locked */}
              <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                <Lock className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold">
                    {formatCurrency(editingReceipt.totalAmount)} · {paymentMethodConfig[editingReceipt.paymentMethod]?.label || editingReceipt.paymentMethod}
                    {editingReceipt.invoiceRef ? ` · for ${editingReceipt.invoiceRef}` : ""}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    The amount and payment method can&apos;t be edited. If they&apos;re wrong, void this receipt and issue a new one.
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 mt-2">
            <Button type="button" variant="outline" onClick={() => setEditingReceipt(null)}>Cancel</Button>
            <Button type="button" onClick={saveEditReceipt} disabled={isSavingEdit} className="gap-2">
              {isSavingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print-only copy of the receipt, directly under <body> — hidden on screen */}
      {mounted && receiptDocument && createPortal(
        <div className="receipt-print-root" data-print-area="true">{receiptDocument}</div>,
        document.body
      )}
    </div>
  );
}
