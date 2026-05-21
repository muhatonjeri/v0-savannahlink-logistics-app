"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Car, Calendar, DollarSign, Shield, FileText, Receipt, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock, 
  Fuel, Gauge, MapPin, User, Phone, Mail, Building2, 
  Bell, AlertCircle, CreditCard, Banknote, CalendarDays,
  Printer, Download, Plus, Edit, Trash2, Eye, Search,
  ChevronRight, BarChart3, PieChart, Activity, Wrench, CarFront,
  XCircle, CheckCircle, Timer, FileWarning, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format, differenceInDays, addDays, parseISO, isAfter, isBefore } from "date-fns";

// Types for Vehicle Profile
interface VehicleProfile {
  id: string;
  vehicleName: string;
  vehicleMake: string;
  vehicleModel: string;
  registrationNo: string;
  vehicleType: string;
  fuelType: string;
  year: number;
  color: string;
  status: "available" | "assigned" | "maintenance" | "out-of-service";
  currentMileage: number;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  chassisNumber: string;
  engineNumber: string;
  // Assignment tracking
  totalAssignmentDays: number;
  totalIdleDays: number;
  totalRevenue: number;
  totalExpenses: number;
  // Loan details
  loan?: LoanDetails;
  // Insurance details
  insurance?: InsuranceDetails;
  // Images
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface LoanDetails {
  id: string;
  lender: string;
  loanAmount: number;
  interestRate: number;
  monthlyPayment: number;
  startDate: string;
  endDate: string;
  totalPaid: number;
  balance: number;
  arrears: number;
  daysInArrears: number;
  nextPaymentDate: string;
  paymentHistory: PaymentRecord[];
  status: "active" | "completed" | "defaulted";
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: "mpesa" | "bank" | "cash" | "cheque";
  reference: string;
  status: "paid" | "pending" | "failed";
  type: "loan" | "insurance" | "expense" | "rental";
}

interface InsuranceDetails {
  id: string;
  provider: string;
  policyNumber: string;
  type: "comprehensive" | "third-party" | "third-party-fire-theft";
  startDate: string;
  endDate: string;
  premium: number;
  paymentPlan: "annual" | "semi-annual" | "quarterly" | "monthly";
  totalPaid: number;
  balance: number;
  nextPaymentDate: string;
  nextPaymentAmount: number;
  status: "active" | "expired" | "pending-renewal";
  coverageDetails: string;
}

interface Assignment {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  clientName: string;
  clientPhone: string;
  purpose: string;
  revenue: number;
  mileageOut: number;
  mileageIn?: number;
  status: "completed" | "in-progress" | "cancelled";
  receiptNumber?: string;
}

interface IdlePeriod {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: "no-bookings" | "maintenance" | "repairs" | "inspection" | "documentation" | "other";
  notes?: string;
}

interface Expense {
  id: string;
  date: string;
  category: "fuel" | "maintenance" | "repairs" | "parking" | "toll" | "cleaning" | "accessories" | "other";
  description: string;
  amount: number;
  vendor?: string;
  receiptNumber?: string;
  paidBy: string;
  status: "paid" | "pending" | "reimbursed";
}

interface Fine {
  id: string;
  date: string;
  type: "speeding" | "parking" | "traffic-light" | "documentation" | "other";
  location: string;
  amount: number;
  dueDate: string;
  reference: string;
  status: "paid" | "unpaid" | "disputed" | "overdue";
  paidDate?: string;
  paidBy?: string;
}

interface VehicleReceipt {
  id: string;
  receiptNumber: string;
  date: string;
  type: "rental" | "payment" | "expense" | "refund";
  clientName?: string;
  description: string;
  amount: number;
  paymentMethod: "mpesa" | "bank" | "cash" | "cheque" | "card";
  reference: string;
  createdBy: string;
}

interface Alert {
  id: string;
  type: "loan-arrears" | "insurance-expiry" | "fine-overdue" | "service-due" | "payment-due";
  severity: "warning" | "high" | "critical";
  title: string;
  message: string;
  dueDate?: string;
  amount?: number;
  isRead: boolean;
  createdAt: string;
}

// Demo data generator
const generateDemoVehicle = (vehicleId: string): VehicleProfile => ({
  id: vehicleId,
  vehicleName: "Safari Explorer",
  vehicleMake: "Toyota",
  vehicleModel: "Land Cruiser Prado",
  registrationNo: "KDA 789M",
  vehicleType: "suv",
  fuelType: "diesel",
  year: 2022,
  color: "Pearl White",
  status: "available",
  currentMileage: 45680,
  purchaseDate: "2022-03-15",
  purchasePrice: 8500000,
  currentValue: 7200000,
  chassisNumber: "JTEBH9FJ50K123456",
  engineNumber: "2GD-FTV-7890123",
  totalAssignmentDays: 245,
  totalIdleDays: 85,
  totalRevenue: 2450000,
  totalExpenses: 485000,
  loan: {
    id: "loan-1",
    lender: "Equity Bank",
    loanAmount: 6000000,
    interestRate: 14.5,
    monthlyPayment: 145000,
    startDate: "2022-03-15",
    endDate: "2027-03-15",
    totalPaid: 4350000,
    balance: 1650000,
    arrears: 290000,
    daysInArrears: 45,
    nextPaymentDate: "2026-05-15",
    status: "active",
    paymentHistory: [
      { id: "pay-1", date: "2026-04-15", amount: 145000, method: "bank", reference: "EQ-2026-04-789", status: "paid", type: "loan" },
      { id: "pay-2", date: "2026-03-15", amount: 145000, method: "bank", reference: "EQ-2026-03-456", status: "paid", type: "loan" },
      { id: "pay-3", date: "2026-02-15", amount: 145000, method: "bank", reference: "EQ-2026-02-123", status: "paid", type: "loan" },
      { id: "pay-4", date: "2026-01-15", amount: 145000, method: "mpesa", reference: "RKL9X2M4P7", status: "paid", type: "loan" },
      { id: "pay-5", date: "2025-12-15", amount: 145000, method: "bank", reference: "EQ-2025-12-890", status: "paid", type: "loan" },
    ],
  },
  insurance: {
    id: "ins-1",
    provider: "Jubilee Insurance",
    policyNumber: "JIC/MOT/2026/123456",
    type: "comprehensive",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    premium: 180000,
    paymentPlan: "quarterly",
    totalPaid: 90000,
    balance: 90000,
    nextPaymentDate: "2026-07-01",
    nextPaymentAmount: 45000,
    status: "active",
    coverageDetails: "Comprehensive cover including third party liability, theft, fire, and own damage. Excess: KES 25,000",
  },
  createdAt: "2022-03-15T10:00:00.000Z",
  updatedAt: "2026-05-01T14:30:00.000Z",
});

const generateDemoAssignments = (): Assignment[] => [
  { id: "assign-1", startDate: "2026-04-25", endDate: "2026-04-30", days: 5, clientName: "John Kamau", clientPhone: "+254722123456", purpose: "Safari Trip - Maasai Mara", revenue: 75000, mileageOut: 44500, mileageIn: 45200, status: "completed", receiptNumber: "REC-2026-0425" },
  { id: "assign-2", startDate: "2026-04-18", endDate: "2026-04-22", days: 4, clientName: "Grace Wanjiku", clientPhone: "+254733456789", purpose: "Business Trip - Mombasa", revenue: 56000, mileageOut: 43800, mileageIn: 44500, status: "completed", receiptNumber: "REC-2026-0418" },
  { id: "assign-3", startDate: "2026-04-10", endDate: "2026-04-15", days: 5, clientName: "Peter Ochieng", clientPhone: "+254711789012", purpose: "Wedding Event", revenue: 70000, mileageOut: 43200, mileageIn: 43800, status: "completed", receiptNumber: "REC-2026-0410" },
  { id: "assign-4", startDate: "2026-04-01", endDate: "2026-04-05", days: 4, clientName: "Fatuma Hassan", clientPhone: "+254755234567", purpose: "Corporate Retreat", revenue: 60000, mileageOut: 42500, mileageIn: 43200, status: "completed", receiptNumber: "REC-2026-0401" },
  { id: "assign-5", startDate: "2026-03-20", endDate: "2026-03-28", days: 8, clientName: "David Mutua", clientPhone: "+254788345678", purpose: "Safari - Amboseli", revenue: 112000, mileageOut: 41500, mileageIn: 42500, status: "completed", receiptNumber: "REC-2026-0320" },
  { id: "assign-6", startDate: "2026-05-05", endDate: "2026-05-10", days: 5, clientName: "Mary Akinyi", clientPhone: "+254799456789", purpose: "Self-drive - Nakuru", revenue: 65000, mileageOut: 45680, status: "in-progress" },
];

const generateDemoIdlePeriods = (): IdlePeriod[] => [
  { id: "idle-1", startDate: "2026-04-05", endDate: "2026-04-09", days: 4, reason: "no-bookings", notes: "Low season - Easter holiday period" },
  { id: "idle-2", startDate: "2026-03-28", endDate: "2026-03-31", days: 3, reason: "maintenance", notes: "Routine service at 42,000km" },
  { id: "idle-3", startDate: "2026-03-15", endDate: "2026-03-19", days: 4, reason: "repairs", notes: "Brake pad replacement and alignment" },
  { id: "idle-4", startDate: "2026-03-01", endDate: "2026-03-05", days: 4, reason: "no-bookings" },
  { id: "idle-5", startDate: "2026-02-20", endDate: "2026-02-25", days: 5, reason: "inspection", notes: "Annual NTSA inspection" },
];

const generateDemoExpenses = (): Expense[] => [
  { id: "exp-1", date: "2026-04-28", category: "fuel", description: "Full tank - Shell Westlands", amount: 12500, vendor: "Shell", receiptNumber: "SH-28456", paidBy: "Company Card", status: "paid" },
  { id: "exp-2", date: "2026-04-20", category: "fuel", description: "Full tank - Total Karen", amount: 11800, vendor: "Total", receiptNumber: "TT-19234", paidBy: "Company Card", status: "paid" },
  { id: "exp-3", date: "2026-04-15", category: "cleaning", description: "Full detailing and interior cleaning", amount: 3500, vendor: "AutoSpa Kilimani", receiptNumber: "AS-0415", paidBy: "Cash", status: "paid" },
  { id: "exp-4", date: "2026-04-10", category: "parking", description: "Parking - JKIA (5 days)", amount: 2500, vendor: "KAA", paidBy: "M-Pesa", status: "paid" },
  { id: "exp-5", date: "2026-03-30", category: "maintenance", description: "Oil change and filter replacement", amount: 15000, vendor: "Toyota Kenya", receiptNumber: "TK-2026-890", paidBy: "Bank Transfer", status: "paid" },
  { id: "exp-6", date: "2026-03-18", category: "repairs", description: "Brake pads and discs replacement", amount: 45000, vendor: "Toyota Kenya", receiptNumber: "TK-2026-567", paidBy: "Bank Transfer", status: "paid" },
  { id: "exp-7", date: "2026-03-10", category: "toll", description: "Thika Road toll (monthly)", amount: 3000, paidBy: "Cash", status: "paid" },
  { id: "exp-8", date: "2026-02-28", category: "accessories", description: "New floor mats and seat covers", amount: 18000, vendor: "Auto Accessories Ltd", receiptNumber: "AAL-456", paidBy: "M-Pesa", status: "paid" },
];

const generateDemoFines = (): Fine[] => [
  { id: "fine-1", date: "2026-04-15", type: "parking", location: "CBD - Kenyatta Avenue", amount: 2000, dueDate: "2026-05-15", reference: "NCC/PKG/2026/4567", status: "unpaid" },
  { id: "fine-2", date: "2026-03-22", type: "speeding", location: "Mombasa Road - SGR Overpass", amount: 10000, dueDate: "2026-04-22", reference: "NTSA/SPD/2026/1234", status: "overdue" },
  { id: "fine-3", date: "2026-02-10", type: "traffic-light", location: "Uhuru Highway - Nyayo Stadium", amount: 5000, dueDate: "2026-03-10", reference: "NTSA/TL/2026/789", status: "paid", paidDate: "2026-03-08", paidBy: "M-Pesa" },
  { id: "fine-4", date: "2026-01-05", type: "parking", location: "Westlands - Sarit Centre", amount: 1500, dueDate: "2026-02-05", reference: "NCC/PKG/2026/123", status: "paid", paidDate: "2026-01-20", paidBy: "Cash" },
];

const generateDemoReceipts = (): VehicleReceipt[] => [
  { id: "rcpt-1", receiptNumber: "REC-2026-0430", date: "2026-04-30", type: "rental", clientName: "John Kamau", description: "Safari Trip - Maasai Mara (5 days)", amount: 75000, paymentMethod: "mpesa", reference: "RKH8M2N5P3", createdBy: "Admin" },
  { id: "rcpt-2", receiptNumber: "REC-2026-0422", date: "2026-04-22", type: "rental", clientName: "Grace Wanjiku", description: "Business Trip - Mombasa (4 days)", amount: 56000, paymentMethod: "bank", reference: "KCB-2026-04-567", createdBy: "Admin" },
  { id: "rcpt-3", receiptNumber: "REC-2026-0415-PAY", date: "2026-04-15", type: "payment", description: "Loan Payment - April 2026", amount: 145000, paymentMethod: "bank", reference: "EQ-2026-04-789", createdBy: "Finance" },
  { id: "rcpt-4", receiptNumber: "REC-2026-0410", date: "2026-04-15", type: "rental", clientName: "Peter Ochieng", description: "Wedding Event (5 days)", amount: 70000, paymentMethod: "card", reference: "VISA-****-8901", createdBy: "Admin" },
  { id: "rcpt-5", receiptNumber: "EXP-2026-0330", date: "2026-03-30", type: "expense", description: "Vehicle Service - Oil change", amount: 15000, paymentMethod: "bank", reference: "TK-2026-890", createdBy: "Operations" },
];

const generateDemoAlerts = (): Alert[] => [
  { id: "alert-1", type: "loan-arrears", severity: "critical", title: "Loan Arrears - 45 Days", message: "Outstanding arrears of KES 290,000. Immediate payment required to avoid penalties.", amount: 290000, isRead: false, createdAt: "2026-05-01T08:00:00.000Z" },
  { id: "alert-2", type: "fine-overdue", severity: "high", title: "Overdue Traffic Fine", message: "Speeding fine on Mombasa Road is overdue. Pay KES 10,000 to avoid legal action.", dueDate: "2026-04-22", amount: 10000, isRead: false, createdAt: "2026-04-23T10:00:00.000Z" },
  { id: "alert-3", type: "insurance-expiry", severity: "warning", title: "Insurance Payment Due", message: "Next quarterly insurance payment of KES 45,000 due on July 1, 2026.", dueDate: "2026-07-01", amount: 45000, isRead: true, createdAt: "2026-04-15T09:00:00.000Z" },
  { id: "alert-4", type: "service-due", severity: "warning", title: "Service Due Soon", message: "Vehicle service due at 50,000km. Current mileage: 45,680km.", isRead: true, createdAt: "2026-04-10T14:00:00.000Z" },
];

// Reason labels
const idleReasonLabels: Record<string, { label: string; color: string }> = {
  "no-bookings": { label: "No Bookings", color: "bg-slate-600 text-white" },
  "maintenance": { label: "Maintenance", color: "bg-blue-600 text-white" },
  "repairs": { label: "Repairs", color: "bg-orange-500 text-white" },
  "inspection": { label: "Inspection", color: "bg-purple-600 text-white" },
  "documentation": { label: "Documentation", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" },
  "other": { label: "Other", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
};

const expenseCategoryLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  "fuel": { label: "Fuel", icon: <Fuel className="h-4 w-4" />, color: "bg-amber-500 text-white" },
  "maintenance": { label: "Maintenance", icon: <Wrench className="h-4 w-4" />, color: "bg-blue-600 text-white" },
  "repairs": { label: "Repairs", icon: <Wrench className="h-4 w-4" />, color: "bg-orange-500 text-white" },
  "parking": { label: "Parking", icon: <MapPin className="h-4 w-4" />, color: "bg-purple-600 text-white" },
  "toll": { label: "Toll", icon: <CreditCard className="h-4 w-4" />, color: "bg-slate-500 text-white" },
  "cleaning": { label: "Cleaning", icon: <RefreshCw className="h-4 w-4" />, color: "bg-cyan-600 text-white" },
  "accessories": { label: "Accessories", icon: <CarFront className="h-4 w-4" />, color: "bg-pink-600 text-white" },
  "other": { label: "Other", icon: <FileText className="h-4 w-4" />, color: "bg-gray-500 text-white" },
};

const fineTypeLabels: Record<string, { label: string; color: string }> = {
  "speeding": { label: "Speeding", color: "bg-red-600 text-white" },
  "parking": { label: "Parking", color: "bg-yellow-500 text-white" },
  "traffic-light": { label: "Traffic Light", color: "bg-orange-500 text-white" },
  "documentation": { label: "Documentation", color: "bg-blue-600 text-white" },
  "other": { label: "Other", color: "bg-gray-500 text-white" },
};

export default function VehicleProfilePage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.vehicleId as string;
  const printRef = useRef<HTMLDivElement>(null);
  
  const [vehicle, setVehicle] = useState<VehicleProfile | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [idlePeriods, setIdlePeriods] = useState<IdlePeriod[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [receipts, setReceipts] = useState<VehicleReceipt[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedReceipt, setSelectedReceipt] = useState<VehicleReceipt | null>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load demo data
    setVehicle(generateDemoVehicle(vehicleId));
    setAssignments(generateDemoAssignments());
    setIdlePeriods(generateDemoIdlePeriods());
    setExpenses(generateDemoExpenses());
    setFines(generateDemoFines());
    setReceipts(generateDemoReceipts());
    setAlerts(generateDemoAlerts());
    setIsLoading(false);
  }, [vehicleId]);

  const handlePrintReceipt = () => {
    const printContent = document.getElementById("receipt-print-content");
    if (printContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Receipt - ${selectedReceipt?.receiptNumber}</title>
            <style>
              @page { size: A5; margin: 10mm; }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                font-size: 11pt; 
                line-height: 1.5;
                color: #1a1a1a;
                background: white;
              }
              .receipt-container {
                max-width: 148mm;
                margin: 0 auto;
                padding: 15mm;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
              }
              .header {
                text-align: center;
                padding-bottom: 12pt;
                border-bottom: 2px solid #10b981;
                margin-bottom: 15pt;
              }
              .company-name {
                font-size: 18pt;
                font-weight: 700;
                color: #10b981;
                letter-spacing: 1px;
                margin-bottom: 4pt;
              }
              .company-tagline {
                font-size: 9pt;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 2px;
              }
              .receipt-title {
                font-size: 14pt;
                font-weight: 600;
                text-align: center;
                margin: 15pt 0;
                padding: 8pt;
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-radius: 6px;
                color: #166534;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .receipt-meta {
                display: flex;
                justify-content: space-between;
                margin-bottom: 15pt;
                padding: 10pt;
                background: #f9fafb;
                border-radius: 6px;
              }
              .meta-item { text-align: center; }
              .meta-label { font-size: 8pt; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
              .meta-value { font-size: 11pt; font-weight: 600; color: #111827; margin-top: 2pt; }
              .details-section {
                margin-bottom: 15pt;
              }
              .section-title {
                font-size: 9pt;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 8pt;
                padding-bottom: 4pt;
                border-bottom: 1px solid #e5e7eb;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 6pt 0;
                border-bottom: 1px dashed #e5e7eb;
              }
              .detail-row:last-child { border-bottom: none; }
              .detail-label { color: #6b7280; }
              .detail-value { font-weight: 500; color: #111827; text-align: right; }
              .amount-section {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 15pt;
                border-radius: 8px;
                margin: 15pt 0;
                text-align: center;
              }
              .amount-label { font-size: 9pt; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; }
              .amount-value { font-size: 24pt; font-weight: 700; margin-top: 4pt; }
              .amount-words { font-size: 9pt; font-style: italic; opacity: 0.9; margin-top: 4pt; }
              .footer {
                text-align: center;
                margin-top: 20pt;
                padding-top: 12pt;
                border-top: 1px solid #e5e7eb;
              }
              .footer-text { font-size: 9pt; color: #6b7280; margin-bottom: 4pt; }
              .contact-info { font-size: 8pt; color: #9ca3af; }
              .qr-placeholder {
                width: 60pt;
                height: 60pt;
                margin: 10pt auto;
                border: 2px dashed #d1d5db;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8pt;
                color: #9ca3af;
              }
              .stamp {
                position: relative;
                margin-top: 15pt;
              }
              .paid-stamp {
                display: inline-block;
                padding: 6pt 20pt;
                border: 3px solid #10b981;
                border-radius: 4px;
                color: #10b981;
                font-size: 14pt;
                font-weight: 700;
                text-transform: uppercase;
                transform: rotate(-5deg);
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header">
                <div class="company-name">Moventra Safaris & Logistics Ltd</div>
                <div class="company-tagline">Premium Vehicle Rental Services</div>
              </div>
              
              <div class="receipt-title">Official Receipt</div>
              
              <div class="receipt-meta">
                <div class="meta-item">
                  <div class="meta-label">Receipt No.</div>
                  <div class="meta-value">${selectedReceipt?.receiptNumber}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Date</div>
                  <div class="meta-value">${selectedReceipt ? format(parseISO(selectedReceipt.date), "dd MMM yyyy") : ""}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Time</div>
                  <div class="meta-value">${format(new Date(), "HH:mm")}</div>
                </div>
              </div>

              <div class="details-section">
                <div class="section-title">Transaction Details</div>
                ${selectedReceipt?.clientName ? `
                <div class="detail-row">
                  <span class="detail-label">Customer</span>
                  <span class="detail-value">${selectedReceipt.clientName}</span>
                </div>
                ` : ""}
                <div class="detail-row">
                  <span class="detail-label">Description</span>
                  <span class="detail-value">${selectedReceipt?.description}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Vehicle</span>
                  <span class="detail-value">${vehicle?.vehicleName} (${vehicle?.registrationNo})</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Payment Method</span>
                  <span class="detail-value">${selectedReceipt?.paymentMethod.toUpperCase()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Reference</span>
                  <span class="detail-value">${selectedReceipt?.reference}</span>
                </div>
              </div>

              <div class="amount-section">
                <div class="amount-label">Amount Paid</div>
                <div class="amount-value">KES ${selectedReceipt?.amount.toLocaleString()}</div>
                <div class="amount-words">${numberToWords(selectedReceipt?.amount || 0)} Kenya Shillings Only</div>
              </div>

              <div class="stamp" style="text-align: center;">
                <span class="paid-stamp">PAID</span>
              </div>

              <div class="footer">
                <div class="footer-text">Thank you for your business!</div>
                <div class="contact-info">
                  Tel: +254 700 123 456 | Email: info@moventrasafarislogisticsltd.com<br>
                  Nairobi, Kenya | www.Moventra Safaris & Logistics Ltd.co.ke
                </div>
                <div class="qr-placeholder">QR Code</div>
              </div>
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // Helper function to convert number to words
  function numberToWords(num: number): string {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    if (num === 0) return "Zero";
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + ones[num % 10] : "");
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " and " + numberToWords(num % 100) : "");
    if (num < 1000000) return numberToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 !== 0 ? " " + numberToWords(num % 1000) : "");
    return numberToWords(Math.floor(num / 1000000)) + " Million" + (num % 1000000 !== 0 ? " " + numberToWords(num % 1000000) : "");
  }

  if (isLoading || !vehicle) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading vehicle profile...</p>
        </div>
      </div>
    );
  }

  const netProfit = vehicle.totalRevenue - vehicle.totalExpenses;
  const utilizationRate = Math.round((vehicle.totalAssignmentDays / (vehicle.totalAssignmentDays + vehicle.totalIdleDays)) * 100);
  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push("/admin/fleet")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {vehicle.vehicleName}
              </h1>
              <Badge className={
                vehicle.status === "available" ? "bg-emerald-600 text-white" :
                vehicle.status === "assigned" ? "bg-blue-600 text-white" :
                vehicle.status === "maintenance" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" :
                "bg-red-600 text-white"
              }>
                {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1).replace("-", " ")}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {vehicle.vehicleMake} {vehicle.vehicleModel} • {vehicle.registrationNo} • {vehicle.year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadAlerts > 0 && (
            <Button variant="outline" className="relative">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadAlerts}
              </span>
            </Button>
          )}
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {alerts.filter(a => !a.isRead && a.severity === "critical").length > 0 && (
        <Card className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 dark:text-red-200">Critical Alert</h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {alerts.find(a => !a.isRead && a.severity === "critical")?.message}
                </p>
              </div>
              <Button size="sm" variant="destructive">
                Take Action
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2 py-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2 py-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Assignments</span>
          </TabsTrigger>
          <TabsTrigger value="financials" className="flex items-center gap-2 py-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Financials</span>
          </TabsTrigger>
          <TabsTrigger value="insurance" className="flex items-center gap-2 py-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Insurance</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2 py-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Expenses</span>
          </TabsTrigger>
          <TabsTrigger value="receipts" className="flex items-center gap-2 py-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Receipts</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <TrendingUp className="h-4 w-4" />
                  Total Revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  KES {vehicle.totalRevenue.toLocaleString()}
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <TrendingDown className="h-4 w-4" />
                  Total Expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  KES {vehicle.totalExpenses.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500">This year</p>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${netProfit >= 0 ? "border-l-emerald-500" : "border-l-red-500"}`}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Banknote className="h-4 w-4" />
                  Net Profit/Loss
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  KES {netProfit.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500">
                  {netProfit >= 0 ? "Profit" : "Loss"} margin: {Math.abs(Math.round((netProfit / vehicle.totalRevenue) * 100))}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Activity className="h-4 w-4" />
                  Utilization Rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {utilizationRate}%
                </div>
                <Progress value={utilizationRate} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Vehicle Details & Assignment Summary */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#e67e22]">
                  <Car className="h-5 w-5 text-[#e67e22]" />
                  Vehicle Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { label: "Make & Model", value: `${vehicle.vehicleMake} ${vehicle.vehicleModel}` },
                    { label: "Year", value: vehicle.year },
                    { label: "Registration", value: vehicle.registrationNo, mono: true },
                    { label: "Color", value: vehicle.color },
                    { label: "Current Mileage", value: `${vehicle.currentMileage.toLocaleString()} km` },
                    { label: "Fuel Type", value: vehicle.fuelType, capitalize: true },
                    { label: "Chassis Number", value: vehicle.chassisNumber, mono: true },
                    { label: "Engine Number", value: vehicle.engineNumber, mono: true },
                    { label: "Purchase Price", value: `KES ${vehicle.purchasePrice.toLocaleString()}` },
                    { label: "Current Value", value: `KES ${vehicle.currentValue.toLocaleString()}` },
                  ].map(({ label, value, mono, capitalize }) => (
                    <div key={label} className="rounded-lg bg-[#0a1628] border border-[#e67e22]/20 p-3">
                      <span className="block text-[#e67e22] font-bold text-xs uppercase tracking-wider mb-1">{label}</span>
                      <span className={`block text-gray-300 font-medium text-sm ${mono ? "font-mono" : ""} ${capitalize ? "capitalize" : ""}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#e67e22]">
                  <PieChart className="h-5 w-5 text-[#e67e22]" />
                  Assignment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                  <div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">Days on Assignment</p>
                    <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{vehicle.totalAssignmentDays}</p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Idle Days</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{vehicle.totalIdleDays}</p>
                  </div>
                  <Clock className="h-10 w-10 text-gray-400" />
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Idle Reasons Breakdown</p>
                  <div className="space-y-2">
                    {Object.entries(
                      idlePeriods.reduce((acc, period) => {
                        acc[period.reason] = (acc[period.reason] || 0) + period.days;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([reason, days]) => (
                      <div key={reason} className="flex items-center justify-between">
                        <Badge className={idleReasonLabels[reason].color}>
                          {idleReasonLabels[reason].label}
                        </Badge>
                        <span className="font-medium text-gray-900 dark:text-white">{days} days</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Bell className="h-5 w-5 text-emerald-600" />
                Active Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === "critical" 
                        ? "bg-red-50 dark:bg-red-950/30 border-red-500" 
                        : alert.severity === "high"
                        ? "bg-orange-50 dark:bg-orange-950/30 border-orange-500"
                        : "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {alert.severity === "critical" ? (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        ) : alert.severity === "high" ? (
                          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        )}
                        <div>
                          <p className={`font-semibold ${
                            alert.severity === "critical" 
                              ? "text-red-800 dark:text-red-200" 
                              : alert.severity === "high"
                              ? "text-orange-800 dark:text-orange-200"
                              : "text-yellow-800 dark:text-yellow-200"
                          }`}>
                            {alert.title}
                          </p>
                          <p className={`text-sm ${
                            alert.severity === "critical" 
                              ? "text-red-700 dark:text-red-300" 
                              : alert.severity === "high"
                              ? "text-orange-700 dark:text-orange-300"
                              : "text-yellow-700 dark:text-yellow-300"
                          }`}>
                            {alert.message}
                          </p>
                          {alert.amount && (
                            <p className="text-sm font-semibold mt-1">
                              Amount: KES {alert.amount.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {!alert.isRead && (
                        <Badge className="bg-red-500 text-white">New</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Assignment History</CardTitle>
                <CardDescription>Track all vehicle assignments and rental periods</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-white">
                            {format(parseISO(assignment.startDate), "dd MMM")} - {format(parseISO(assignment.endDate), "dd MMM yyyy")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{assignment.days} days</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-white">{assignment.clientName}</p>
                          <p className="text-xs text-gray-300">{assignment.clientPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-white">
                        {assignment.purpose}
                      </TableCell>
                      <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                        KES {assignment.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          assignment.status === "completed" 
                            ? "bg-emerald-600 text-white"
                            : assignment.status === "in-progress"
                            ? "bg-blue-600 text-white"
                            : "bg-red-600 text-white"
                        }>
                          {assignment.status === "in-progress" ? "In Progress" : assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Idle Periods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Idle Periods</CardTitle>
              <CardDescription>Periods when the vehicle was not on assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {idlePeriods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell>
                        <p className="font-medium text-white">
                          {format(parseISO(period.startDate), "dd MMM")} - {format(parseISO(period.endDate), "dd MMM yyyy")}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{period.days} days</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={idleReasonLabels[period.reason].color}>
                          {idleReasonLabels[period.reason].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300 max-w-[300px] truncate">
                        {period.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financials Tab - Loan Management */}
        <TabsContent value="financials" className="space-y-6">
          {vehicle.loan && (
            <>
              {/* Loan Overview Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Loan Amount</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-white">
                      KES {vehicle.loan.loanAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-300">{vehicle.loan.interestRate}% interest</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Paid</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      KES {vehicle.loan.totalPaid.toLocaleString()}
                    </p>
                    <Progress 
                      value={(vehicle.loan.totalPaid / vehicle.loan.loanAmount) * 100} 
                      className="mt-2 h-2" 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Balance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-white">
                      KES {vehicle.loan.balance.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-300">
                      {Math.round((vehicle.loan.balance / vehicle.loan.loanAmount) * 100)}% remaining
                    </p>
                  </CardContent>
                </Card>

                <Card className={vehicle.loan.arrears > 0 ? "border-red-300 dark:border-red-700" : ""}>
                  <CardHeader className="pb-2">
                    <CardDescription className={vehicle.loan.arrears > 0 ? "text-red-600 dark:text-red-400" : ""}>
                      Arrears
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${vehicle.loan.arrears > 0 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                      KES {vehicle.loan.arrears.toLocaleString()}
                    </p>
                    {vehicle.loan.daysInArrears > 0 && (
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                        {vehicle.loan.daysInArrears} days overdue
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Loan Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                    Loan Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-300">Lender</span>
                          <p className="font-semibold text-white">{vehicle.loan.lender}</p>
                        </div>
                        <div>
                          <span className="text-gray-300">Monthly Payment</span>
                          <p className="font-semibold text-white">KES {vehicle.loan.monthlyPayment.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-300">Start Date</span>
                          <p className="font-medium text-white">{format(parseISO(vehicle.loan.startDate), "dd MMM yyyy")}</p>
                        </div>
                        <div>
                          <span className="text-gray-300">End Date</span>
                          <p className="font-medium text-white">{format(parseISO(vehicle.loan.endDate), "dd MMM yyyy")}</p>
                        </div>
                        <div>
                          <span className="text-gray-300">Next Payment</span>
                          <p className="font-medium text-white">{format(parseISO(vehicle.loan.nextPaymentDate), "dd MMM yyyy")}</p>
                        </div>
                        <div>
                          <span className="text-gray-300">Status</span>
                          <Badge className={
                            vehicle.loan.status === "active" 
                              ? "bg-emerald-600 text-white" 
                              : vehicle.loan.status === "completed"
                              ? "bg-blue-600 text-white"
                              : "bg-red-600 text-white"
                          }>
                            {vehicle.loan.status.charAt(0).toUpperCase() + vehicle.loan.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-3">Recent Payments</h4>
                      <div className="space-y-2">
                        {vehicle.loan.paymentHistory.slice(0, 5).map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-2 bg-[#0a1628] rounded border border-[#e67e22]/20">
                            <div>
                              <p className="text-sm font-medium text-white">
                                {format(parseISO(payment.date), "dd MMM yyyy")}
                              </p>
                              <p className="text-xs text-gray-300">{payment.reference}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                                KES {payment.amount.toLocaleString()}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {payment.method.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end gap-2 border-t pt-4">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Payment History
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Insurance Tab */}
        <TabsContent value="insurance" className="space-y-6">
          {vehicle.insurance && (
            <>
              {/* Insurance Status Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className={
                  vehicle.insurance.status === "active" 
                    ? "border-emerald-300 dark:border-emerald-700" 
                    : "border-red-300 dark:border-red-700"
                }>
                  <CardHeader className="pb-2">
                    <CardDescription>Insurance Status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge className={
                      vehicle.insurance.status === "active"
                        ? "bg-emerald-600 text-white text-lg px-4 py-1"
                        : "bg-red-600 text-white text-lg px-4 py-1"
                    }>
                      {vehicle.insurance.status === "active" ? "ACTIVE" : vehicle.insurance.status.toUpperCase()}
                    </Badge>
                    <p className="text-sm text-gray-300 mt-2">
                      Valid until {format(parseISO(vehicle.insurance.endDate), "dd MMM yyyy")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Annual Premium</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-white">
                      KES {vehicle.insurance.premium.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-300 capitalize">{vehicle.insurance.paymentPlan} payments</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Paid So Far</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      KES {vehicle.insurance.totalPaid.toLocaleString()}
                    </p>
                    <Progress 
                      value={(vehicle.insurance.totalPaid / vehicle.insurance.premium) * 100} 
                      className="mt-2 h-2" 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Balance Due</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-white">
                      KES {vehicle.insurance.balance.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-300">
                      Next: {format(parseISO(vehicle.insurance.nextPaymentDate), "dd MMM yyyy")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Insurance Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Shield className="h-5 w-5 text-emerald-400" />
                    Insurance Policy Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-300">Provider</span>
                          <p className="font-semibold text-white">{vehicle.insurance.provider}</p>
                        </div>
                        <div>
                          <span className="text-gray-300">Policy Number</span>
                          <p className="font-mono text-white">{vehicle.insurance.policyNumber}</p>
                        </div>
                        <div>
                          <span className="text-gray-300">Coverage Type</span>
                          <Badge className="bg-blue-600 text-white capitalize">
                            {vehicle.insurance.type.replace("-", " ")}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-300">Payment Plan</span>
                          <p className="font-medium text-white capitalize">{vehicle.insurance.paymentPlan}</p>
                        </div>
                        <div>
                          <span className="text-gray-300">Start Date</span>
                          <p className="font-medium text-white">{format(parseISO(vehicle.insurance.startDate), "dd MMM yyyy")}</p>
                        </div>
                        <div>
                          <span className="text-gray-300">End Date</span>
                          <p className="font-medium text-white">{format(parseISO(vehicle.insurance.endDate), "dd MMM yyyy")}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Coverage Details</h4>
                      <p className="text-sm text-gray-200 p-3 bg-[#0a1628] rounded-lg border border-[#e67e22]/20">
                        {vehicle.insurance.coverageDetails}
                      </p>
                      <div className="mt-4 p-4 bg-amber-500/20 rounded-lg border border-amber-500/50">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarDays className="h-4 w-4 text-yellow-600" />
                          <span className="font-semibold text-amber-300">Next Payment Due</span>
                        </div>
                        <p className="text-lg font-bold text-white">
                          KES {vehicle.insurance.nextPaymentAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-amber-300">
                          Due on {format(parseISO(vehicle.insurance.nextPaymentDate), "dd MMMM yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end gap-2 border-t pt-4">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Policy
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Expenses & Fines Tab */}
        <TabsContent value="expenses" className="space-y-6">
          {/* Expense Summary */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Expenses (YTD)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">
                  KES {expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Fuel Costs</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  KES {expenses.filter(e => e.category === "fuel").reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Maintenance & Repairs</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  KES {expenses.filter(e => ["maintenance", "repairs"].includes(e.category)).reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className={fines.filter(f => f.status === "unpaid" || f.status === "overdue").length > 0 ? "border-red-300 dark:border-red-700" : ""}>
              <CardHeader className="pb-2">
                <CardDescription>Unpaid Fines</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  KES {fines.filter(f => f.status === "unpaid" || f.status === "overdue").reduce((sum, f) => sum + f.amount, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Expenses Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Expenses</CardTitle>
                <CardDescription>Track all vehicle-related expenses</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium text-white">
                        {format(parseISO(expense.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge className={expenseCategoryLabels[expense.category].color}>
                          {expenseCategoryLabels[expense.category].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300 max-w-[200px] truncate">
                        {expense.description}
                      </TableCell>
                      <TableCell className="font-semibold text-white">
                        KES {expense.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-gray-300">{expense.paidBy}</TableCell>
                      <TableCell>
                        <Badge className={
                          expense.status === "paid" 
                            ? "bg-emerald-600 text-white" 
                            : "bg-yellow-500 text-white"
                        }>
                          {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Fines Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Traffic Fines</CardTitle>
                <CardDescription>Track all traffic violations and fines</CardDescription>
              </div>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Fine
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fines.map((fine) => (
                    <TableRow key={fine.id} className={fine.status === "overdue" ? "bg-red-900/20" : ""}>
                      <TableCell className="font-medium text-white">
                        {format(parseISO(fine.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge className={fineTypeLabels[fine.type].color}>
                          {fineTypeLabels[fine.type].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300 max-w-[150px] truncate">
                        {fine.location}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-300">
                        {fine.reference}
                      </TableCell>
                      <TableCell className="font-semibold text-white">
                        KES {fine.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {format(parseISO(fine.dueDate), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          fine.status === "paid" 
                            ? "bg-emerald-600 text-white" 
                            : fine.status === "overdue"
                            ? "bg-red-600 text-white"
                            : "bg-yellow-100 text-yellow-700"
                        }>
                          {fine.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipts Tab */}
        <TabsContent value="receipts" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 dark:text-white">Receipts</CardTitle>
                <CardDescription>All payment receipts for this vehicle</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search receipts..." className="pl-9 w-[200px]" />
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Receipt
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-mono font-medium text-gray-900 dark:text-white">
                        {receipt.receiptNumber}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {format(parseISO(receipt.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          receipt.type === "rental" 
                            ? "bg-emerald-600 text-white"
                            : receipt.type === "payment"
                            ? "bg-blue-600 text-white"
                            : receipt.type === "expense"
                            ? "bg-orange-500 text-white"
                            : "bg-purple-600 text-white"
                        }>
                          {receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-white">
                        {receipt.description}
                      </TableCell>
                      <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                        KES {receipt.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase text-xs">
                          {receipt.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedReceipt(receipt);
                              setIsReceiptDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedReceipt(receipt);
                              setTimeout(handlePrintReceipt, 100);
                            }}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Receipt Preview Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Receipt Preview</DialogTitle>
            <DialogDescription>
              {selectedReceipt?.receiptNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedReceipt && (
            <div id="receipt-print-content" className="space-y-4">
              {/* Receipt Preview Content */}
              <div className="border-2 border-emerald-200 dark:border-emerald-800 rounded-lg p-6 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/30 dark:to-gray-900">
                <div className="text-center border-b-2 border-emerald-500 pb-4 mb-4">
                  <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">Moventra Safaris & Logistics Ltd</h2>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Premium Vehicle Rental Services</p>
                </div>
                
                <div className="text-center mb-4">
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-lg px-4 py-1">
                    OFFICIAL RECEIPT
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 dark:bg-gray-800/50 rounded p-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Receipt No.</p>
                    <p className="font-mono font-bold text-gray-900 dark:text-white text-sm">{selectedReceipt.receiptNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{format(parseISO(selectedReceipt.date), "dd MMM yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{format(new Date(), "HH:mm")}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  {selectedReceipt.clientName && (
                    <div className="flex justify-between py-1 border-b border-dashed border-gray-200 dark:border-gray-700">
                      <span className="text-gray-300">Customer</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedReceipt.clientName}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-dashed border-gray-200 dark:border-gray-700">
                    <span className="text-gray-300">Description</span>
                    <span className="font-medium text-gray-900 dark:text-white text-right max-w-[60%]">{selectedReceipt.description}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-gray-200 dark:border-gray-700">
                    <span className="text-gray-300">Vehicle</span>
                    <span className="font-medium text-gray-900 dark:text-white">{vehicle.registrationNo}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-gray-200 dark:border-gray-700">
                    <span className="text-gray-300">Payment</span>
                    <span className="font-medium text-gray-900 dark:text-white uppercase">{selectedReceipt.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-300">Reference</span>
                    <span className="font-mono text-gray-900 dark:text-white">{selectedReceipt.reference}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg p-4 text-center">
                  <p className="text-xs uppercase tracking-wider opacity-90">Amount Paid</p>
                  <p className="text-2xl font-bold">KES {selectedReceipt.amount.toLocaleString()}</p>
                  <p className="text-xs italic opacity-90">{numberToWords(selectedReceipt.amount)} Kenya Shillings Only</p>
                </div>

                <div className="text-center mt-4">
                  <Badge className="border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent rotate-[-3deg] text-lg px-6 py-1">
                    PAID
                  </Badge>
                </div>

                <div className="text-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Thank you for your business!</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Tel: +254 700 123 456 | info@moventrasafarislogisticsltd.com
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handlePrintReceipt}>
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
