"use client";

import { useState, useMemo, useEffect } from "react";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Car,
  Plane,
  Truck,
  Package,
  Wrench,
  Ship,
  Bus,
  Compass,
  DollarSign,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Receipt,
  PieChart,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

// Types
interface Transaction {
  id: string;
  date: string;
  type: "income" | "expense";
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  paymentMethod: "mpesa" | "bank" | "cash" | "card";
  reference: string;
  customerName?: string;
  invoiceNumber?: string;
  status: "completed" | "pending" | "cancelled";
  createdBy: string;
  createdAt: string;
}

// Category configuration
const incomeCategories = [
  { value: "car-rental", label: "Car Rental", icon: Car },
  { value: "safari-tours", label: "Safari Tours", icon: Compass },
  { value: "airport-transfers", label: "Airport Transfers", icon: Plane },
  { value: "cargo-transport", label: "Cargo Transport", icon: Truck },
  { value: "tour-bus", label: "Tour Bus Services", icon: Bus },
  { value: "recovery", label: "Recovery Services", icon: Wrench },
  { value: "imports", label: "Imports & Clearing", icon: Ship },
  { value: "equipment-hire", label: "Equipment Hire", icon: Package },
  { value: "other-income", label: "Other Income", icon: DollarSign },
  { value: "sublet-income", label: "Sublet Income", icon: DollarSign },
];

const expenseCategories = [
  { value: "fuel", label: "Fuel & Diesel", icon: Car },
  { value: "maintenance", label: "Vehicle Maintenance", icon: Wrench },
  { value: "salaries", label: "Salaries & Wages", icon: Building2 },
  { value: "insurance", label: "Insurance", icon: CreditCard },
  { value: "licenses", label: "Licenses & Permits", icon: Receipt },
  { value: "rent", label: "Rent & Utilities", icon: Building2 },
  { value: "marketing", label: "Marketing & Advertising", icon: TrendingUp },
  { value: "spare-parts", label: "Spare Parts", icon: Package },
  { value: "taxes", label: "Taxes & Levies", icon: DollarSign },
  { value: "other-expense", label: "Other Expenses", icon: Banknote },
];

const paymentMethods = [
  { value: "mpesa", label: "M-Pesa", icon: Smartphone },
  { value: "bank", label: "Bank Transfer", icon: Building2 },
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card Payment", icon: CreditCard },
];

// Form schema
const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  amount: z.string().min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z.enum(["mpesa", "bank", "cash", "card"]),
  reference: z.string().min(1, "Reference is required"),
  customerName: z.string().optional(),
  invoiceNumber: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

// Mock data
const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const today = new Date();
  
  // Generate transactions for the last 60 days
  for (let i = 0; i < 60; i++) {
    const date = subDays(today, i);
    const numTransactions = Math.floor(Math.random() * 5) + 1;
    
    for (let j = 0; j < numTransactions; j++) {
      const isIncome = Math.random() > 0.35;
      const categories = isIncome ? incomeCategories : expenseCategories;
      const category = categories[Math.floor(Math.random() * categories.length)];
      const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      transactions.push({
        id: `TXN-${String(i * 10 + j).padStart(5, "0")}`,
        date: format(date, "yyyy-MM-dd"),
        type: isIncome ? "income" : "expense",
        category: category.value,
        description: isIncome 
          ? `${category.label} - ${["Daily rental", "Weekly package", "Corporate booking", "Safari package", "Transfer service"][Math.floor(Math.random() * 5)]}`
          : `${category.label} - ${["Monthly payment", "Service charge", "Purchase", "Repair", "Subscription"][Math.floor(Math.random() * 5)]}`,
        amount: isIncome 
          ? Math.floor(Math.random() * 150000) + 5000
          : Math.floor(Math.random() * 50000) + 1000,
        paymentMethod: method.value as Transaction["paymentMethod"],
        reference: method.value === "mpesa" 
          ? `${["S", "R", "Q", "P"][Math.floor(Math.random() * 4)]}${String(Math.floor(Math.random() * 9999999999)).padStart(10, "0").substring(0, 9)}${["A", "B", "C", "D"][Math.floor(Math.random() * 4)]}`
          : method.value === "bank"
          ? `FT${format(date, "yyyyMMdd")}${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`
          : `CASH-${format(date, "yyyyMMdd")}-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
        customerName: isIncome ? ["John Kamau", "Safari Adventures Ltd", "Kenya Tours Co", "Peter Ochieng", "Mary Wanjiku", "Corporate Client"][Math.floor(Math.random() * 6)] : undefined,
        invoiceNumber: isIncome ? `INV-${format(date, "yyyyMM")}-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}` : undefined,
        status: Math.random() > 0.1 ? "completed" : Math.random() > 0.5 ? "pending" : "cancelled",
        createdBy: "Admin",
        createdAt: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
      });
    }
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default function AccountsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(generateMockTransactions);

  // Load transactions from linked modules (Sublet, Fleet Out etc)
  useEffect(() => {
    try {
      const subletEntries = JSON.parse(localStorage.getItem("sublet_account_entries") || "[]");
      if (subletEntries.length > 0) {
        setTransactions(prev => {
          const existingIds = new Set(prev.map((t: Transaction) => t.id));
          const newEntries = subletEntries.filter((e: Transaction) => !existingIds.has(e.id));
          return newEntries.length > 0
            ? [...newEntries, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            : prev;
        });
      }
    } catch {}
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "all">("month");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "income",
      category: "",
      description: "",
      amount: "",
      date: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: "mpesa",
      reference: "",
      customerName: "",
      invoiceNumber: "",
    },
  });

  const watchType = form.watch("type");

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    const today = new Date();
    let filtered = transactions;

    // Date range filter
    if (dateRange === "today") {
      filtered = filtered.filter(t => t.date === format(today, "yyyy-MM-dd"));
    } else if (dateRange === "week") {
      const weekAgo = subDays(today, 7);
      filtered = filtered.filter(t => new Date(t.date) >= weekAgo);
    } else if (dateRange === "month") {
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      filtered = filtered.filter(t => {
        const date = new Date(t.date);
        return date >= monthStart && date <= monthEnd;
      });
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Payment method filter
    if (methodFilter !== "all") {
      filtered = filtered.filter(t => t.paymentMethod === methodFilter);
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(query) ||
        t.reference.toLowerCase().includes(query) ||
        t.customerName?.toLowerCase().includes(query) ||
        t.invoiceNumber?.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [transactions, dateRange, typeFilter, categoryFilter, methodFilter, searchQuery, selectedMonth]);

  // Calculate totals
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === "income" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter(t => t.type === "expense" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      profit: income - expense,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Daily breakdown for calendar view
  const dailyTotals = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return days.map(day => {
      const dayTransactions = transactions.filter(t => 
        isSameDay(parseISO(t.date), day) && t.status === "completed"
      );
      const income = dayTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        date: day,
        income,
        expense,
        net: income - expense,
        count: dayTransactions.length,
      };
    });
  }, [transactions, selectedMonth]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const incomeByCategory = filteredTransactions
      .filter(t => t.type === "income" && t.status === "completed")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const expenseByCategory = filteredTransactions
      .filter(t => t.type === "expense" && t.status === "completed")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return { incomeByCategory, expenseByCategory };
  }, [filteredTransactions]);

  const onSubmit = async (data: TransactionFormValues) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newTransaction: Transaction = {
        id: `TXN-${String(transactions.length + 1).padStart(5, "0")}`,
        date: data.date,
        type: data.type,
        category: data.category,
        description: data.description,
        amount: parseFloat(data.amount),
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        customerName: data.customerName || undefined,
        invoiceNumber: data.invoiceNumber || undefined,
        status: "completed",
        createdBy: "Admin",
        createdAt: new Date().toISOString(),
      };

      setTransactions([newTransaction, ...transactions]);
      setIsAddDialogOpen(false);
      form.reset();
      toast.success(`${data.type === "income" ? "Income" : "Expense"} recorded successfully`);
    } catch {
      toast.error("Failed to record transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    toast.success("Transaction deleted");
  };

  const getCategoryInfo = (category: string, type: string) => {
    const categories = type === "income" ? incomeCategories : expenseCategories;
    return categories.find(c => c.value === category) || { label: category, icon: DollarSign };
  };

  const getPaymentMethodInfo = (method: string) => {
    return paymentMethods.find(m => m.value === method) || { label: method, icon: DollarSign };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Wallet className="h-7 w-7 text-yellow-400" />
            Accounts
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Track income and expenses across all services</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record New Transaction</DialogTitle>
                <DialogDescription>
                  Add a new income or expense transaction
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Transaction Type */}
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Type</FormLabel>
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant={field.value === "income" ? "default" : "outline"}
                          className={cn(
                            "flex-1",
                            field.value === "income" && "bg-green-600 hover:bg-green-700"
                          )}
                          onClick={() => {
                            field.onChange("income");
                            form.setValue("category", "");
                          }}
                        >
                          <ArrowDownLeft className="h-4 w-4 mr-2" />
                          Income
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === "expense" ? "default" : "outline"}
                          className={cn(
                            "flex-1",
                            field.value === "expense" && "bg-red-600 hover:bg-red-700"
                          )}
                          onClick={() => {
                            field.onChange("expense");
                            form.setValue("category", "");
                          }}
                        >
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          Expense
                        </Button>
                      </div>
                    </FormItem>
                  )} />

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Category */}
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(watchType === "income" ? incomeCategories : expenseCategories).map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                <div className="flex items-center gap-2">
                                  <cat.icon className="h-4 w-4" />
                                  {cat.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Amount */}
                    <FormField control={form.control} name="amount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (KES)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Date */}
                    <FormField control={form.control} name="date" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")}
                            placeholder="Select date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Payment Method */}
                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                <div className="flex items-center gap-2">
                                  <method.icon className="h-4 w-4" />
                                  {method.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Reference */}
                    <FormField control={form.control} name="reference" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference / Transaction Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., SHK1234567AB or FT20240501001" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          M-Pesa code, bank reference, or cash receipt number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Customer Name (for income) */}
                    {watchType === "income" && (
                      <FormField control={form.control} name="customerName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Customer or company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}

                    {/* Invoice Number (for income) */}
                    {watchType === "income" && (
                      <FormField control={form.control} name="invoiceNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., INV-202405-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                  </div>

                  {/* Description */}
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the transaction" 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className={cn(
                        watchType === "income" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                      )}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : `Record ${watchType === "income" ? "Income" : "Expense"}`}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-green-500/50 dark:border-green-800 bg-green-900/30/50 dark:bg-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-300 dark:text-green-400">Total Income</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.income)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredTransactions.filter(t => t.type === "income").length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-500/50 dark:border-red-800 bg-red-900/30/50 dark:bg-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-300 dark:text-red-400">Total Expenses</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{formatCurrency(totals.expense)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredTransactions.filter(t => t.type === "expense").length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          "border-2",
          totals.profit >= 0 
            ? "border-emerald-200 dark:border-emerald-800 bg-emerald-900/30/50 dark:bg-emerald-950/20"
            : "border-orange-500/50 dark:border-orange-800 bg-orange-900/30/50 dark:bg-orange-950/20"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={cn(
              "text-sm font-medium",
              totals.profit >= 0 ? "text-emerald-300 dark:text-emerald-400" : "text-orange-300 dark:text-orange-400"
            )}>Net Profit/Loss</CardTitle>
            {totals.profit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-orange-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              totals.profit >= 0 ? "text-emerald-600" : "text-orange-600"
            )}>
              {formatCurrency(totals.profit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totals.profit >= 0 ? "Profit" : "Loss"} this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.transactionCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In selected period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {/* Date Range Selector */}
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              {/* Month Navigator */}
              {dateRange === "month" && (
                <div className="flex items-center gap-1 border rounded-md px-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[120px] text-center">
                    {format(selectedMonth, "MMMM yyyy")}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                </SelectContent>
              </Select>

              {/* Payment Method Filter */}
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {paymentMethods.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>

              {/* View Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setViewMode("list")}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setViewMode("calendar")}
                >
                  <CalendarDays className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {viewMode === "list" ? (
            /* List View */
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.slice(0, 50).map((transaction) => {
                      const categoryInfo = getCategoryInfo(transaction.category, transaction.type);
                      const CategoryIcon = categoryInfo.icon;
                      const methodInfo = getPaymentMethodInfo(transaction.paymentMethod);
                      const MethodIcon = methodInfo.icon;

                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {format(new Date(transaction.date), "dd MMM yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                transaction.type === "income"
                                  ? "bg-green-600 text-white border-green-700"
                                  : "bg-red-600 text-white border-red-700"
                              )}
                            >
                              {transaction.type === "income" ? (
                                <ArrowDownLeft className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                              )}
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{categoryInfo.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px]">
                              <p className="text-sm truncate">{transaction.description}</p>
                              {transaction.customerName && (
                                <p className="text-xs text-muted-foreground">{transaction.customerName}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MethodIcon className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{methodInfo.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {transaction.reference}
                            </code>
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-medium",
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                          )}>
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDelete(transaction.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No transactions found
                  </div>
                )}
                {filteredTransactions.length > 50 && (
                  <div className="text-center py-4 text-sm text-muted-foreground border-t">
                    Showing 50 of {filteredTransactions.length} transactions
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Calendar View */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Daily Summary - {format(selectedMonth, "MMMM yyyy")}
                </CardTitle>
                <CardDescription>
                  Income and expenses for each day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {/* Day headers */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: startOfMonth(selectedMonth).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  
                  {/* Day cells */}
                  {dailyTotals.map((day, i) => (
                    <div
                      key={i}
                      className={cn(
                        "aspect-square border rounded-lg p-1 text-xs hover:bg-muted/50 cursor-pointer transition-colors",
                        isSameDay(day.date, new Date()) && "border-amber-500 border-2",
                        day.count > 0 && "bg-muted/30"
                      )}
                    >
                      <div className="font-medium text-muted-foreground">
                        {format(day.date, "d")}
                      </div>
                      {day.count > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {day.income > 0 && (
                            <div className="text-green-600 truncate text-[10px]">
                              +{(day.income / 1000).toFixed(0)}K
                            </div>
                          )}
                          {day.expense > 0 && (
                            <div className="text-red-600 truncate text-[10px]">
                              -{(day.expense / 1000).toFixed(0)}K
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Income by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <ArrowDownLeft className="h-5 w-5" />
                  Income by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(categoryBreakdown.incomeByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const info = getCategoryInfo(category, "income");
                    const Icon = info.icon;
                    const percentage = (amount / totals.income) * 100;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">{info.label}</span>
                          </div>
                          <span className="text-sm font-bold text-green-600">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-900/300 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">
                          {percentage.toFixed(1)}% of income
                        </p>
                      </div>
                    );
                  })}
                {Object.keys(categoryBreakdown.incomeByCategory).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No income data</p>
                )}
              </CardContent>
            </Card>

            {/* Expenses by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <ArrowUpRight className="h-5 w-5" />
                  Expenses by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(categoryBreakdown.expenseByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const info = getCategoryInfo(category, "expense");
                    const Icon = info.icon;
                    const percentage = (amount / totals.expense) * 100;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium">{info.label}</span>
                          </div>
                          <span className="text-sm font-bold text-red-600">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-900/300 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">
                          {percentage.toFixed(1)}% of expenses
                        </p>
                      </div>
                    );
                  })}
                {Object.keys(categoryBreakdown.expenseByCategory).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No expense data</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
