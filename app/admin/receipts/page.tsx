"use client";

import { useState, useMemo, useRef } from "react";
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

// Receipt interface
interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
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
  issuedBy: string;
  issuedAt: string;
  status: "draft" | "issued" | "voided";
  notes?: string;
}

// Company details (would come from settings in production)
const companyDetails = {
  name: "Moventra Safaris & Logistics Ltd Logistics & Tours",
  kraPin: "P051234567X",
  address: "Muthaiga Square, off Thika Rd, Nairobi, Kenya",
  phone: "+254 727 247 032",
  email: "info@moventrasafarislogisticsltd.com",
  website: "www.Moventra Safaris & Logistics Ltd.com",
  etimsDeviceNumber: "ETIMS-2024-00123",
};

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
  description: z.string().min(1, "Description is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unitPrice: z.string().min(1, "Unit price is required"),
  taxRate: z.string().default("16"),
  notes: z.string().optional(),
});

type ReceiptFormData = z.infer<typeof receiptFormSchema>;

// Status configuration
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  issued: { label: "Issued", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
  voided: { label: "Voided", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
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
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 
                'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Million', 'Billion'];
  
  if (num === 0) return 'Zero';
  
  const wholeNum = Math.floor(num);
  const cents = Math.round((num - wholeNum) * 100);
  
  const numToStr = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + numToStr(n % 100) : '');
    return '';
  };
  
  let result = '';
  let scaleIdx = 0;
  let remaining = wholeNum;
  
  while (remaining > 0) {
    const chunk = remaining % 1000;
    if (chunk !== 0) {
      const chunkStr = numToStr(chunk);
      result = chunkStr + (scales[scaleIdx] ? ' ' + scales[scaleIdx] : '') + (result ? ', ' + result : '');
    }
    remaining = Math.floor(remaining / 1000);
    scaleIdx++;
  }
  
  if (cents > 0) {
    result += ` and ${cents}/100`;
  }
  
  return result;
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptData[]>(initialReceiptsData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const printRef = useRef<HTMLDivElement>(null);

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
  const onSubmit = (data: ReceiptFormData) => {
    const quantity = parseFloat(data.quantity);
    const unitPrice = parseFloat(data.unitPrice);
    const taxRate = parseFloat(data.taxRate);
    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    const newReceipt: ReceiptData = {
      id: `RCP-${Date.now()}`,
      receiptNumber: generateReceiptNumber(),
      etimsDeviceNumber: companyDetails.etimsDeviceNumber,
      etimsReceiptNumber: generateEtimsReceiptNumber(),
      etimsQrCode: `https://etims.kra.go.ke/verify/${Date.now()}`,
      etimsVerificationUrl: `https://etims.kra.go.ke/verify/${Date.now()}`,
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
      issuedBy: "Admin",
      issuedAt: new Date().toISOString(),
      status: "issued",
      notes: data.notes || undefined,
    };

    setReceipts((prev) => [newReceipt, ...prev]);
    setIsDialogOpen(false);
    form.reset();
    toast.success("Receipt issued successfully", {
      description: `Receipt ${newReceipt.receiptNumber} has been created and is eTIMS compliant.`,
    });

    // Automatically send receipt to customer via email and SMS
    setTimeout(() => {
      sendReceiptBoth(newReceipt);
    }, 500);
  };

  // Handle void receipt
  const handleVoidReceipt = (receiptId: string) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, status: "voided" as const } : r))
    );
    toast.success("Receipt voided", {
      description: "The receipt has been marked as voided.",
    });
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // State for sending receipts
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);

  // Send receipt via Email
  const sendReceiptEmail = async (receipt: ReceiptData) => {
    if (!receipt.customerEmail) {
      toast.error("No email address", {
        description: "Customer email address is not available for this receipt.",
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      // Simulate API call to send email
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // In production, this would call an API endpoint like:
      // await fetch('/api/send-receipt-email', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     to: receipt.customerEmail,
      //     receiptNumber: receipt.receiptNumber,
      //     customerName: receipt.customerName,
      //     amount: receipt.totalAmount,
      //     transactionCode: receipt.transactionCode,
      //     etimsReceiptNumber: receipt.etimsReceiptNumber,
      //   })
      // });

      toast.success("Email sent successfully", {
        description: `Receipt ${receipt.receiptNumber} sent to ${receipt.customerEmail}`,
      });
    } catch {
      toast.error("Failed to send email", {
        description: "Please try again or contact support.",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Send receipt via SMS
  const sendReceiptSms = async (receipt: ReceiptData) => {
    if (!receipt.customerPhone) {
      toast.error("No phone number", {
        description: "Customer phone number is not available for this receipt.",
      });
      return;
    }

    setIsSendingSms(true);
    try {
      // Simulate API call to send SMS
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // In production, this would call an SMS API like Africa's Talking:
      // await fetch('/api/send-receipt-sms', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     to: receipt.customerPhone,
      //     message: `Moventra Safaris & Logistics Ltd Receipt ${receipt.receiptNumber}. Amount: KES ${receipt.totalAmount.toLocaleString()}. Ref: ${receipt.transactionCode}. Thank you for your business!`
      //   })
      // });

      toast.success("SMS sent successfully", {
        description: `Receipt ${receipt.receiptNumber} sent to ${receipt.customerPhone}`,
      });
    } catch {
      toast.error("Failed to send SMS", {
        description: "Please try again or contact support.",
      });
    } finally {
      setIsSendingSms(false);
    }
  };

  // Send receipt via both Email and SMS
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Receipt className="h-6 w-6 text-emerald-500" />
            Receipt Management
          </h1>
          <p className="text-muted-foreground">
            Issue eTIMS compliant receipts with M-Pesa and bank transaction references
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                Issue eTIMS Compliant Receipt
              </DialogTitle>
              <DialogDescription>
                Create a KRA eTIMS compliant receipt with payment transaction reference
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Customer Details */}
                <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <User className="h-4 w-4" />
                    Customer Details
                  </h4>
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
                <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 p-4">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4">
                  <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                {/* eTIMS Compliance Notice */}
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
                  <div className="flex items-start gap-3">
                    <BadgeCheck className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">
                        eTIMS Compliance
                      </h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-1">
                        This receipt will be automatically registered with KRA&apos;s eTIMS system.
                        Device Number: {companyDetails.etimsDeviceNumber}
                      </p>
                    </div>
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
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time receipts issued</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issued</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.issued}</div>
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
                          <div className="text-xs text-muted-foreground">
                            {receipt.etimsReceiptNumber}
                          </div>
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
                              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                              onClick={() => sendReceiptEmail(receipt)}
                              disabled={!receipt.customerEmail || isSendingEmail}
                              title={receipt.customerEmail ? `Send to ${receipt.customerEmail}` : "No email address"}
                            >
                              {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                              onClick={() => sendReceiptSms(receipt)}
                              disabled={!receipt.customerPhone || isSendingSms}
                              title={receipt.customerPhone ? `Send to ${receipt.customerPhone}` : "No phone number"}
                            >
                              {isSendingSms ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handlePrint}>
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
                                      This will mark the receipt as voided. This action cannot be undone
                                      and will be reported to KRA eTIMS.
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
          {selectedReceipt && (
            <div ref={printRef} className="print-receipt" data-print-area="true">
              {/* Screen-only header */}
              <DialogHeader className="print:hidden mb-4">
                <DialogTitle className="flex items-center justify-between text-gray-900 dark:text-white">
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

              {/* Professional Print Template - Savanna Brand Colors */}
              <div className="bg-white text-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                {/* Company Header */}
                <div className="print-header border-b-4 border-[#0a1628] pb-5 mb-5">
                  <div className="flex items-start justify-between gap-6">
                    {/* Logo & Company Info */}
                    <div className="flex items-start gap-4">
                      <Image
                        src="/images/logo.png"
                        alt={companyDetails.name}
                        width={100}
                        height={50}
                        className="h-auto w-[80px] object-contain"
                        unoptimized
                      />
                      <div>
                        <h1 className="text-2xl font-bold text-[#0a1628]">{companyDetails.name}</h1>
                        <div className="mt-2 text-sm text-gray-600 space-y-0.5">
                          <p className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-[#e67e22]" />
                            {companyDetails.address}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-[#e67e22]" />
                            {companyDetails.phone}
                          </p>
                          <p className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-[#e67e22]" />
                            {companyDetails.email}
                          </p>
                        </div>
                        <p className="mt-2 text-sm font-bold text-gray-800">KRA PIN: {companyDetails.kraPin}</p>
                      </div>
                    </div>
                    {/* Receipt Number Box */}
                    <div className="text-right">
                      <div className="inline-block bg-[#0a1628] text-white px-5 py-2 rounded-lg">
                        <p className="text-xs uppercase tracking-wider opacity-90">Receipt No.</p>
                        <p className="text-xl font-bold font-mono">{selectedReceipt.receiptNumber}</p>
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        <p><span className="font-medium">Date:</span> {formatDate(selectedReceipt.issuedAt)}</p>
                        <p><span className="font-medium">eTIMS:</span> <span className="text-[#e67e22] font-mono">{selectedReceipt.etimsReceiptNumber}</span></p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Receipt Title Banner */}
                  <div className="mt-5 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-[#e67e22] py-3 rounded-lg text-center">
                    <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-[#0a1628]">
                      Official Receipt
                    </h2>
                  </div>
                </div>

                {/* Two Column Layout - Customer & Payment Info */}
                <div className="grid grid-cols-2 gap-6 mb-5">
                  {/* Customer Details */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-bold text-[#0a1628] mb-3 pb-2 border-b border-gray-300 flex items-center gap-2 uppercase text-sm tracking-wide">
                      <User className="h-4 w-4 text-[#e67e22]" />
                      Received From
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold text-lg text-[#0a1628]">{selectedReceipt.customerName}</p>
                      <p className="text-gray-600">{selectedReceipt.customerPhone}</p>
                      {selectedReceipt.customerEmail && (
                        <p className="text-gray-600 break-all">{selectedReceipt.customerEmail}</p>
                      )}
                      {selectedReceipt.customerKraPin && (
                        <p className="text-[#0a1628] font-medium">KRA PIN: {selectedReceipt.customerKraPin}</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-bold text-[#0a1628] mb-3 pb-2 border-b border-gray-300 flex items-center gap-2 uppercase text-sm tracking-wide">
                      <CreditCard className="h-4 w-4 text-[#e67e22]" />
                      Payment Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const config = paymentMethodConfig[selectedReceipt.paymentMethod];
                          const Icon = config.icon;
                          return (
                            <>
                              <Icon className="h-5 w-5 text-[#e67e22]" />
                              <span className="font-semibold text-[#0a1628]">{config.label}</span>
                            </>
                          );
                        })()}
                      </div>
                      <p className="text-gray-700">
                        <span className="text-gray-500">Transaction:</span>{" "}
                        <code className="bg-orange-100 text-[#0a1628] px-2 py-0.5 rounded font-mono text-xs">
                          {selectedReceipt.transactionCode}
                        </code>
                      </p>
                      {selectedReceipt.bankName && (
                        <p className="text-gray-600">Bank: {selectedReceipt.bankName}</p>
                      )}
                      <p className="text-gray-600">Service: {selectedReceipt.serviceType}</p>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-5">
                  <h3 className="font-bold text-[#0a1628] mb-3 uppercase text-sm tracking-wide">Description of Services/Items</h3>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#0a1628] text-white">
                          <th className="text-left py-3 px-4 font-semibold">Description</th>
                          <th className="text-center py-3 px-4 font-semibold w-20">Qty</th>
                          <th className="text-right py-3 px-4 font-semibold w-32">Unit Price</th>
                          <th className="text-right py-3 px-4 font-semibold w-32">Amount (KES)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReceipt.items.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white text-[#0a1628]" : "bg-gray-50 text-[#0a1628]"}>
                            <td className="py-3 px-4">{item.description}</td>
                            <td className="py-3 px-4 text-center">{item.quantity}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-3 px-4 text-right font-semibold">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-5">
                  <div className="w-80 bg-gray-50 rounded-lg border-2 border-[#e67e22] p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-[#0a1628]">
                        <span>Subtotal:</span>
                        <span className="font-medium">{formatCurrency(selectedReceipt.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-[#0a1628]">
                        <span>VAT (16%):</span>
                        <span className="font-medium">{formatCurrency(selectedReceipt.taxAmount)}</span>
                      </div>
                      <div className="border-t-2 border-[#0a1628] pt-3 mt-3">
                        <div className="flex justify-between text-xl font-bold">
                          <span className="text-[#0a1628]">TOTAL:</span>
                          <span className="text-[#e67e22]">{formatCurrency(selectedReceipt.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount in Words */}
                <div className="bg-orange-50 border border-[#e67e22] rounded-lg p-3 mb-5">
                  <p className="text-sm text-[#0a1628]">
                    <span className="font-semibold text-[#e67e22]">Amount in Words:</span>{" "}
                    <span className="italic">Kenya Shillings {numberToWords(selectedReceipt.totalAmount)} Only</span>
                  </p>
                </div>

                {/* eTIMS Verification */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-[#e67e22] rounded-lg p-4 text-center mb-5">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="bg-white p-2 rounded-lg border border-[#e67e22]">
                      <QrCode className="h-8 w-8 text-[#e67e22]" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#0a1628] text-lg">eTIMS Verified Receipt</p>
                      <p className="text-xs text-[#e67e22]">Device: {selectedReceipt.etimsDeviceNumber}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#0a1628] font-medium">
                    Verify at: <span className="underline text-[#e67e22]">{selectedReceipt.etimsVerificationUrl}</span>
                  </p>
                </div>

                {/* Signature Section */}
                <div className="grid grid-cols-2 gap-8 mt-8 pt-4 border-t border-gray-300">
                  <div className="text-center">
                    <div className="h-16 border-b border-[#0a1628] mb-2"></div>
                    <p className="text-sm text-[#0a1628] font-medium">Received By (Signature)</p>
                  </div>
                  <div className="text-center">
                    <div className="h-16 border-b border-[#0a1628] mb-2"></div>
                    <p className="text-sm text-[#0a1628] font-medium">Issued By: {selectedReceipt.issuedBy}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="print-footer text-center mt-6 pt-4 border-t-2 border-[#0a1628]">
                  <p className="text-sm font-semibold text-[#e67e22]">Thank You For Your Business!</p>
                  <p className="text-xs text-[#0a1628] mt-1">
                    This is an official receipt. Please retain for your records.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {companyDetails.website} | {companyDetails.email}
                  </p>
                </div>
              </div>

              {/* Send Options - Screen Only */}
              <div className="print:hidden bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Receipt to Customer
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900"
                    onClick={() => selectedReceipt && sendReceiptEmail(selectedReceipt)}
                    disabled={!selectedReceipt?.customerEmail || isSendingEmail}
                  >
                    {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    Send Email
                    {selectedReceipt?.customerEmail && (
                      <span className="text-xs opacity-70 break-all">({selectedReceipt.customerEmail})</span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900"
                    onClick={() => selectedReceipt && sendReceiptSms(selectedReceipt)}
                    disabled={!selectedReceipt?.customerPhone || isSendingSms}
                  >
                    {isSendingSms ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                    Send SMS
                    {selectedReceipt?.customerPhone && (
                      <span className="text-xs opacity-70">({selectedReceipt.customerPhone})</span>
                    )}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    onClick={() => selectedReceipt && sendReceiptBoth(selectedReceipt)}
                    disabled={(!selectedReceipt?.customerEmail && !selectedReceipt?.customerPhone) || isSendingEmail || isSendingSms}
                  >
                    <Send className="h-4 w-4" />
                    Send Both
                  </Button>
                </div>
              </div>

              <DialogFooter className="print:hidden gap-2 mt-4">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={handlePrint} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
