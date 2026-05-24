"use client";

import { useState } from "react";
import {
  Search, CheckCircle2, XCircle, AlertTriangle, CreditCard,
  FileText, Receipt, DollarSign, Phone, Calendar, User,
  Loader2, Copy, Check, ArrowRight, Smartphone, Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

const fmt   = (n: number) => "KES " + Number(n || 0).toLocaleString();
const fmtDt = (d: string) => d ? new Date(d).toLocaleString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

interface Results {
  bookings:     Record<string, unknown>[];
  transactions: Record<string, unknown>[];
  receipts:     Record<string, unknown>[];
  invoices:     Record<string, unknown>[];
  total:        number;
}

const paymentMethodIcon = (m: string) => {
  if (m === "mpesa") return <Smartphone className="h-4 w-4 text-emerald-400" />;
  if (m === "bank")  return <Building2  className="h-4 w-4 text-blue-400"    />;
  return <CreditCard className="h-4 w-4 text-gray-400" />;
};

const statusBadge = (status: string) => {
  const cfg: Record<string, string> = {
    completed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    pending:   "bg-yellow-500/20  text-yellow-300  border-yellow-500/30",
    paid:      "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    partial:   "bg-amber-500/20   text-amber-300   border-amber-500/30",
    cancelled: "bg-red-500/20     text-red-300     border-red-500/30",
    issued:    "bg-teal-500/20    text-teal-300    border-teal-500/30",
  };
  return <Badge className={"border text-xs " + (cfg[status] || "bg-gray-500/20 text-gray-300")}>{status}</Badge>;
};

export default function VerifyPaymentPage() {
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [results, setResults]   = useState<Results | null>(null);
  const [copied, setCopied]     = useState("");
  const [history, setHistory]   = useState<string[]>([]);

  const search = async (q?: string) => {
    const ref = (q || query).trim();
    if (!ref || ref.length < 3) { toast.error("Enter at least 3 characters"); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/verify-payment?ref=${encodeURIComponent(ref)}`);
      const data = await res.json();
      setResults(data);
      if (!history.includes(ref)) setHistory(h => [ref, ...h].slice(0, 8));
    } catch (e) { toast.error(String(e)); } finally { setLoading(false); }
  };

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(ref);
    setTimeout(() => setCopied(""), 2000);
    toast.success("Copied: " + ref);
  };

  const RefChip = ({ value }: { value: string }) => value ? (
    <button onClick={() => copyRef(value)}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 transition-colors group">
      <span className="font-mono text-xs text-[#e67e22]">{value}</span>
      {copied === value
        ? <Check className="h-3 w-3 text-emerald-400" />
        : <Copy className="h-3 w-3 text-gray-500 group-hover:text-gray-300" />}
    </button>
  ) : null;

  const verified   = results && results.total > 0;
  const notFound   = results && results.total === 0;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />Payment Verification
        </h2>
        <p className="text-gray-400 text-sm mt-0.5">
          Verify any M-Pesa code, bank reference, booking ref, receipt or invoice number
        </p>
      </div>

      {/* Search bar */}
      <Card className="border-[#e67e22]/30 bg-[#e67e22]/5">
        <CardContent className="pt-5 pb-5">
          <p className="text-[#e67e22] text-xs font-bold uppercase tracking-wide mb-3">Enter Payment Reference</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9 bg-[#0a1628] border-white/20 text-white font-mono text-sm h-11"
                placeholder="e.g. QKA12345  /  BK-250524-A3K9  /  NCBA-TRX-001  /  RCP-2506-0001"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && search()}
              />
            </div>
            <Button className="bg-[#e67e22] hover:bg-[#d35400] h-11 px-6 gap-2" onClick={() => search()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Searching..." : "Verify"}
            </Button>
          </div>

          {/* Quick tips */}
          <div className="mt-3 flex flex-wrap gap-3">
            {[
              { icon: Smartphone, label: "M-Pesa code", eg: "QKA12345", color: "text-emerald-400" },
              { icon: Building2,  label: "Bank ref",    eg: "NCBA-TRX-001", color: "text-blue-400" },
              { icon: CreditCard, label: "Booking ref", eg: "BK-250524-A3K9", color: "text-[#e67e22]" },
              { icon: Receipt,    label: "Receipt No.", eg: "RCP-2506-0001", color: "text-teal-400" },
              { icon: FileText,   label: "Invoice No.", eg: "INV-2506-0001", color: "text-orange-400" },
            ].map(({ icon: Icon, label, eg, color }) => (
              <button key={eg} onClick={() => { setQuery(eg); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs">
                <Icon className={"h-3 w-3 " + color} />
                <span className="text-gray-300">{label}:</span>
                <span className={"font-mono " + color}>{eg}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent searches */}
      {history.length > 0 && !results && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-500 text-xs">Recent:</span>
          {history.map(h => (
            <button key={h} onClick={() => { setQuery(h); search(h); }}
              className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[#e67e22] hover:bg-white/10 transition-colors">
              {h}
            </button>
          ))}
        </div>
      )}

      {/* Result: Not Found */}
      {notFound && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-red-300 font-bold text-lg">No Records Found</p>
                <p className="text-gray-400 text-sm mt-1">
                  No bookings, transactions, receipts or invoices match <span className="font-mono text-white">"{query}"</span>
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Check the reference code and try again. M-Pesa codes are case-insensitive.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result: Found */}
      {verified && (
        <>
          {/* Summary banner */}
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-300 font-bold">Payment Reference Verified</p>
                  <p className="text-gray-300 text-sm">
                    Found <span className="text-white font-semibold">{results!.total} record{results!.total !== 1 ? "s" : ""}</span> matching <span className="font-mono text-[#e67e22]">"{query}"</span>
                  </p>
                </div>
                <div className="ml-auto flex gap-3 text-center">
                  {results!.bookings.length > 0     && <div><p className="text-white font-bold">{results!.bookings.length}</p><p className="text-gray-400 text-xs">Booking{results!.bookings.length !== 1?"s":""}</p></div>}
                  {results!.transactions.length > 0 && <div><p className="text-white font-bold">{results!.transactions.length}</p><p className="text-gray-400 text-xs">Transaction{results!.transactions.length !== 1?"s":""}</p></div>}
                  {results!.receipts.length > 0     && <div><p className="text-white font-bold">{results!.receipts.length}</p><p className="text-gray-400 text-xs">Receipt{results!.receipts.length !== 1?"s":""}</p></div>}
                  {results!.invoices.length > 0     && <div><p className="text-white font-bold">{results!.invoices.length}</p><p className="text-gray-400 text-xs">Invoice{results!.invoices.length !== 1?"s":""}</p></div>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings */}
          {results!.bookings.length > 0 && (
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#e67e22] uppercase tracking-wide flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />Bookings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results!.bookings.map((b, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-white font-semibold">{String(b.customer_name || "")}</p>
                          <p className="text-gray-400 text-xs">{String(b.customer_phone || "")} · {String(b.service_type || "").replace(/-/g, " ")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(String(b.status || ""))}
                        {statusBadge(String(b.payment_status || ""))}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div><p className="text-gray-500 mb-0.5">Booking Ref</p><RefChip value={String(b.booking_ref || "")} /></div>
                      <div><p className="text-gray-500 mb-0.5">Payment Ref</p><RefChip value={String(b.payment_reference || "")} /></div>
                      <div><p className="text-gray-500 mb-0.5">Total</p><p className="text-white font-semibold">{fmt(Number(b.total_amount))}</p></div>
                      <div><p className="text-gray-500 mb-0.5">Paid</p><p className="text-emerald-400 font-semibold">{fmt(Number(b.amount_paid))}</p></div>
                    </div>
                    {Number(b.total_amount) - Number(b.amount_paid) > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 rounded-lg px-3 py-2">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        Balance outstanding: {fmt(Number(b.total_amount) - Number(b.amount_paid))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      {paymentMethodIcon(String(b.payment_method || ""))}
                      <span className="text-gray-400 text-xs capitalize">{String(b.payment_method || "-")}</span>
                      <span className="text-gray-600 text-xs ml-auto">{fmtDt(String(b.created_at || ""))}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Transactions */}
          {results!.transactions.length > 0 && (
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-yellow-400 uppercase tracking-wide flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />Account Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results!.transactions.map((t, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-white font-medium text-sm">{String(t.description || "")}</p>
                        <p className="text-gray-400 text-xs">{String(t.category || "")} · {String(t.date || "")}</p>
                      </div>
                      <p className={"font-bold text-lg " + (String(t.type) === "income" ? "text-emerald-400" : "text-red-400")}>
                        {String(t.type) === "income" ? "+" : "-"}{fmt(Number(t.amount))}
                      </p>
                    </div>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div><p className="text-gray-500 mb-0.5">Reference</p><RefChip value={String(t.reference || "")} /></div>
                      <div><p className="text-gray-500 mb-0.5">Payment Ref</p><RefChip value={String(t.payment_reference || "")} /></div>
                      <div><p className="text-gray-500 mb-0.5">Customer</p><p className="text-white">{String(t.customer_name || "-")}</p></div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {paymentMethodIcon(String(t.payment_method || ""))}
                      <span className="text-gray-400 text-xs capitalize">{String(t.payment_method || "-")}</span>
                      {statusBadge(String(t.status || "completed"))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Receipts */}
          {results!.receipts.length > 0 && (
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-teal-400 uppercase tracking-wide flex items-center gap-2">
                  <Receipt className="h-4 w-4" />Receipts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results!.receipts.map((r, i) => (
                  <div key={i} className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-white font-semibold">{String(r.customer_name || "")}</p>
                        <p className="text-gray-400 text-xs">{String(r.service_type || "")}</p>
                      </div>
                      <p className="text-emerald-400 font-bold text-lg">{fmt(Number(r.total_amount))}</p>
                    </div>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div><p className="text-gray-500 mb-0.5">Receipt No.</p><RefChip value={String(r.receipt_number || "")} /></div>
                      <div><p className="text-gray-500 mb-0.5">Transaction Code</p><RefChip value={String(r.transaction_code || "")} /></div>
                      <div><p className="text-gray-500 mb-0.5">eTIMS No.</p><RefChip value={String(r.etims_receipt_number || "")} /></div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {paymentMethodIcon(String(r.payment_method || ""))}
                      <span className="text-gray-400 text-xs capitalize">{String(r.payment_method || "-")}</span>
                      <span className="text-gray-600 text-xs ml-auto">{fmtDt(String(r.issued_at || r.created_at || ""))}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Invoices */}
          {results!.invoices.length > 0 && (
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-orange-400 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="h-4 w-4" />Invoices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results!.invoices.map((inv, i) => (
                  <div key={i} className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-white font-semibold">{String(inv.customer_name || "")}</p>
                        <p className="text-gray-400 text-xs">{String(inv.service_type || "")} · Due: {String(inv.due_date || "-")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{fmt(Number(inv.total))}</p>
                        <p className="text-emerald-400 text-xs">Paid: {fmt(Number(inv.amount_paid))}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div><p className="text-gray-500 mb-0.5">Invoice No.</p><RefChip value={String(inv.invoice_number || "")} /></div>
                      <div><p className="text-gray-500 mb-0.5">Status</p>{statusBadge(String(inv.status || ""))}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Clear / New search */}
          <Button variant="outline" className="w-full border-white/10 text-gray-400" onClick={() => { setResults(null); setQuery(""); }}>
            Clear — Search Another Reference
          </Button>
        </>
      )}

      {/* Guide when no search yet */}
      {!results && !loading && (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="pt-6 pb-6">
            <p className="text-gray-300 font-semibold mb-4 text-sm">What can you verify?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Smartphone, color: "text-emerald-400 bg-emerald-500/10", title: "M-Pesa Codes", desc: "10-char confirmation code sent after payment e.g. QKA12345AB", eg: "QKA12345AB" },
                { icon: Building2,  color: "text-blue-400 bg-blue-500/10",       title: "Bank References", desc: "Bank transfer reference from your statement e.g. NCBA-TRX-001", eg: "NCBA-TRX-001" },
                { icon: CreditCard, color: "text-[#e67e22] bg-[#e67e22]/10",    title: "Booking References", desc: "Auto-generated booking code e.g. BK-250524-A3K9", eg: "BK-250524-A3K9" },
                { icon: Receipt,    color: "text-teal-400 bg-teal-500/10",      title: "Receipt Numbers", desc: "Receipt number from issued receipt e.g. RCP-2506-0001", eg: "RCP-2506-0001" },
                { icon: FileText,   color: "text-orange-400 bg-orange-500/10",  title: "Invoice Numbers", desc: "Invoice reference number e.g. INV-2025-001", eg: "INV-2025-001" },
                { icon: CheckCircle2, color: "text-purple-400 bg-purple-500/10", title: "eTIMS Numbers", desc: "KRA eTIMS receipt number for tax compliance", eg: "ETM..." },
              ].map(({ icon: Icon, color, title, desc, eg }) => (
                <button key={eg} onClick={() => setQuery(eg)}
                  className="flex items-start gap-3 p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-left">
                  <div className={"p-2 rounded-lg " + color.split(" ")[1]}>
                    <Icon className={"h-4 w-4 " + color.split(" ")[0]} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{title}</p>
                    <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
