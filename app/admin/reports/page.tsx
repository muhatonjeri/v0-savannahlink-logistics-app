"use client";
import { useState, useEffect, useMemo } from "react";
import { TrendingUp, TrendingDown, DollarSign, Users, FileText, Download, Printer, Calendar, BarChart3, PieChart, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fmt = (n: number) => "KES " + Number(n || 0).toLocaleString();
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const SERVICE_COLORS: Record<string,string> = {
  "car-rental":"#34d399","safari-tours":"#fbbf24","transfers":"#38bdf8","movers":"#a78bfa",
  "corporate-rental":"#818cf8","road-recovery":"#fb7185","cargo-handling":"#fb923c",
  "shipment-imports":"#22d3ee","construction-equipment":"#eab308",
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"month"|"quarter"|"year">("month");
  const [transactions, setTransactions] = useState<Record<string,unknown>[]>([]);
  const [bookings, setBookings] = useState<Record<string,unknown>[]>([]);
  const [clients, setClients] = useState<Record<string,unknown>[]>([]);
  const [invoices, setInvoices] = useState<Record<string,unknown>[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/transactions").then(r=>r.json()),
      fetch("/api/bookings").then(r=>r.json()),
      fetch("/api/clients").then(r=>r.json()),
      fetch("/api/invoices").then(r=>r.json()),
    ]).then(([t,b,c,i]) => {

      setTransactions(Array.isArray(t) ? t : (t.data||[]));
      setBookings(Array.isArray(b) ? b : (b.data||[]));
      setClients(Array.isArray(c) ? c : (c.data||[]));
      setInvoices(Array.isArray(i) ? i : (i.data||[]));
      setLoading(false);
    }).catch(() => { setLoading(false); });
  }, []);

  // Period filter
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const now = useMemo(() => new Date(), []);
  const filterDate = period === "month"
    ? new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    : period === "quarter"
    ? new Date(now.getFullYear(), Math.floor(now.getMonth()/3)*3, 1).toISOString()
    : new Date(now.getFullYear(), 0, 1).toISOString();

  const periodTx = transactions.filter(t => String(t.date||"") >= filterDate.split("T")[0]);
  const income   = periodTx.filter(t => t.type==="income").reduce((s,t)=>s+Number(t.amount||0),0);
  const expenses = periodTx.filter(t => t.type==="expense").reduce((s,t)=>s+Number(t.amount||0),0);
  const profit   = income - expenses;
  const margin   = income > 0 ? Math.round(profit/income*100) : 0;

  // Revenue by service
  const byService: Record<string,number> = {};
  bookings.filter(b => String(b.created_at||"") >= filterDate).forEach(b => {
    const svc = String(b.service_type||"other");
    byService[svc] = (byService[svc]||0) + Number(b.total_amount||0);
  });
  const topServices = Object.entries(byService).sort((a,b)=>b[1]-a[1]);
  const totalSvcRevenue = topServices.reduce((s,[,v])=>s+v,0);

  // Monthly trend (last 6 months)
  const monthlyData = Array.from({length:6},(_,i) => {
    const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const txMonth = transactions.filter(t => String(t.date||"").startsWith(key));
    return {
      month: MONTHS[d.getMonth()],
      income: txMonth.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount||0),0),
      expense: txMonth.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount||0),0),
    };
  });

  // Outstanding invoices
  const unpaid = invoices.filter(i => i.status !== "paid");
  const outstandingTotal = unpaid.reduce((s,i)=>s+(Number(i.total||0)-Number(i.amount_paid||0)),0);

  // Category breakdown
  const byCategory: Record<string,{income:number;expense:number}> = {};
  periodTx.forEach(t => {
    const cat = String(t.category||"Other");
    if (!byCategory[cat]) byCategory[cat] = {income:0,expense:0};
    if (t.type==="income") byCategory[cat].income += Number(t.amount||0);
    else byCategory[cat].expense += Number(t.amount||0);
  });

  const printReport = () => {
    window.print();
  };

  const exportCSV = () => {
    const rows = [
      ["Date","Type","Category","Description","Amount","Payment Method","Reference","Customer"],
      ...periodTx.map(t => [
        String(t.date||""), String(t.type||""), String(t.category||""),
        String(t.description||""), String(t.amount||""), String(t.payment_method||""),
        String(t.reference||""), String(t.customer_name||""),
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${v.replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `moventra-report-${period}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const periodLabel = period === "month" ? `${MONTHS[now.getMonth()]} ${now.getFullYear()}` : period === "quarter" ? `Q${Math.floor(now.getMonth()/3)+1} ${now.getFullYear()}` : `Full Year ${now.getFullYear()}`;

  return (
    <div className="space-y-5 print:space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />Financial Reports
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">P&L, revenue breakdown, tax summary</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["month","quarter","year"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={"px-4 py-2 rounded-xl text-sm font-semibold transition-all border " +
                (period===p ? "bg-[#e67e22] border-[#e67e22] text-white" : "border-white/20 text-gray-300 hover:border-white/40")}>
              {p === "month" ? "This Month" : p === "quarter" ? "This Quarter" : "This Year"}
            </button>
          ))}
          <Button variant="outline" className="gap-2 border-white/20 text-gray-300" onClick={exportCSV}>
            <Download className="h-4 w-4" />CSV
          </Button>
          <Button className="gap-2 bg-purple-600 hover:bg-purple-700" onClick={printReport}>
            <Printer className="h-4 w-4" />Print
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block border-b-2 border-[#e67e22] pb-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Moventra Safaris & Logistics Ltd</h1>
        <p className="text-gray-600">Financial Report — {periodLabel}</p>
        <p className="text-gray-400 text-sm">Generated: {typeof window !== "undefined" ? new Date().toLocaleString("en-KE", {timeZone:"Africa/Nairobi"}) : ""}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
      ) : (
        <>
          {/* Period label */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300 text-sm font-medium">{periodLabel}</span>
            <Badge className="bg-purple-500/20 text-purple-300 text-xs">{periodTx.length} transactions</Badge>
          </div>

          {/* P&L Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label:"Total Income",  value:fmt(income),   icon:TrendingUp,   color:"text-emerald-400", border:"border-emerald-500/30", bg:"from-emerald-500/10" },
              { label:"Total Expenses",value:fmt(expenses), icon:TrendingDown,  color:"text-red-400",     border:"border-red-500/30",     bg:"from-red-500/10"     },
              { label:"Net Profit",    value:fmt(profit),   icon:DollarSign,   color:profit>=0?"text-emerald-400":"text-red-400", border:profit>=0?"border-emerald-500/30":"border-red-500/30", bg:profit>=0?"from-emerald-500/10":"from-red-500/10" },
              { label:"Profit Margin", value:margin+"%",    icon:BarChart3,    color:margin>=20?"text-emerald-400":margin>=10?"text-amber-400":"text-red-400", border:"border-purple-500/30", bg:"from-purple-500/10" },
            ].map(({label,value,icon:Icon,color,border,bg}) => (
              <Card key={label} className={"border bg-gradient-to-br to-transparent "+border+" "+bg}>
                <CardContent className="pt-4 pb-4 px-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                    <Icon className={"h-4 w-4 "+color} />
                  </div>
                  <p className={"text-xl font-bold "+color}>{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Monthly trend bars */}
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-300 uppercase tracking-wide">6-Month Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlyData.map(({month,income:inc,expense:exp}) => {
                    const max = Math.max(...monthlyData.map(m=>Math.max(m.income,m.expense)),1);
                    return (
                      <div key={month}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{month}</span>
                          <span className={inc-exp>=0?"text-emerald-400":"text-red-400"}>
                            {fmt(inc-exp)}
                          </span>
                        </div>
                        <div className="flex gap-1 h-2">
                          <div className="bg-emerald-500/60 rounded-full transition-all" style={{width:`${(inc/max*100).toFixed(0)}%`,minWidth:inc>0?"4px":"0"}} />
                          <div className="bg-red-500/60 rounded-full transition-all" style={{width:`${(exp/max*100).toFixed(0)}%`,minWidth:exp>0?"4px":"0"}} />
                        </div>
                        <div className="flex gap-4 text-[10px] text-gray-500 mt-0.5">
                          <span>Inc: {fmt(inc)}</span>
                          <span>Exp: {fmt(exp)}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex gap-4 pt-1 border-t border-white/10">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500/60"/><span className="text-xs text-gray-400">Income</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500/60"/><span className="text-xs text-gray-400">Expense</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue by service */}
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-300 uppercase tracking-wide">Revenue by Service</CardTitle>
              </CardHeader>
              <CardContent>
                {topServices.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">No service bookings yet</p>
                ) : (
                  <div className="space-y-2.5">
                    {topServices.slice(0,7).map(([svc,amount]) => {
                      const pct = totalSvcRevenue > 0 ? Math.round(amount/totalSvcRevenue*100) : 0;
                      const color = SERVICE_COLORS[svc] || "#9ca3af";
                      return (
                        <div key={svc}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300 capitalize">{svc.replace(/-/g," ")}</span>
                            <span style={{color}} className="font-semibold">{pct}% · {fmt(amount)}</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{width:pct+"%",background:color,opacity:0.7}} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Outstanding invoices */}
          {unpaid.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-amber-400 uppercase tracking-wide flex items-center justify-between">
                  <span className="flex items-center gap-2"><FileText className="h-4 w-4" />Outstanding Invoices ({unpaid.length})</span>
                  <span className="text-amber-300 text-base normal-case font-bold">{fmt(outstandingTotal)} owed</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {unpaid.slice(0,5).map((inv,i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm">
                      <div>
                        <span className="text-white font-medium">{String(inv.customer_name||"")}</span>
                        <span className="text-gray-400 text-xs ml-2">{String(inv.invoice_number||"")}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-400 font-semibold">{fmt(Number(inv.total||0)-Number(inv.amount_paid||0))}</p>
                        <p className="text-gray-500 text-xs">Due: {String(inv.due_date||"-")}</p>
                      </div>
                    </div>
                  ))}
                  {unpaid.length > 5 && <p className="text-gray-500 text-xs text-center">+{unpaid.length-5} more unpaid invoices</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category breakdown table */}
          <Card className="border-white/10 bg-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-300 uppercase tracking-wide">Income & Expense by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 text-gray-400 font-semibold text-xs uppercase">Category</th>
                      <th className="text-right py-2 text-gray-400 font-semibold text-xs uppercase">Income</th>
                      <th className="text-right py-2 text-gray-400 font-semibold text-xs uppercase">Expenses</th>
                      <th className="text-right py-2 text-gray-400 font-semibold text-xs uppercase">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(byCategory).length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-6 text-gray-500">No transactions in this period</td></tr>
                    ) : Object.entries(byCategory).sort((a,b)=>b[1].income-a[1].income).map(([cat,{income:inc,expense:exp}]) => (
                      <tr key={cat} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2.5 text-white">{cat}</td>
                        <td className="py-2.5 text-right text-emerald-400 font-mono">{fmt(inc)}</td>
                        <td className="py-2.5 text-right text-red-400 font-mono">{fmt(exp)}</td>
                        <td className={"py-2.5 text-right font-bold font-mono "+(inc-exp>=0?"text-emerald-400":"text-red-400")}>{fmt(inc-exp)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-white/20 font-bold">
                      <td className="py-3 text-white">TOTAL</td>
                      <td className="py-3 text-right text-emerald-400 font-mono">{fmt(income)}</td>
                      <td className="py-3 text-right text-red-400 font-mono">{fmt(expenses)}</td>
                      <td className={"py-3 text-right font-mono "+(profit>=0?"text-emerald-400":"text-red-400")}>{fmt(profit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* KRA VAT Summary */}
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-400 uppercase tracking-wide">KRA Tax Summary (16% VAT)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                {[
                  {label:"Gross Revenue",    value:fmt(income)},
                  {label:"VAT Collected (16%)", value:fmt(Math.round(income*0.16/1.16))},
                  {label:"Net Revenue (ex-VAT)", value:fmt(Math.round(income/1.16))},
                  {label:"Total Expenses",   value:fmt(expenses)},
                  {label:"VAT on Expenses",  value:fmt(Math.round(expenses*0.16/1.16))},
                  {label:"VAT Payable to KRA", value:fmt(Math.round((income-expenses)*0.16/1.16))},
                ].map(({label,value}) => (
                  <div key={label} className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                    <p className="text-blue-300 text-xs mb-1">{label}</p>
                    <p className="text-white font-bold">{value}</p>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-3">* These are indicative figures. Consult your accountant for official KRA filings.</p>
            </CardContent>
          </Card>

          {/* Business KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {label:"Total Clients",   value:clients.length,       icon:Users,        color:"text-sky-400"},
              {label:"Total Bookings",  value:bookings.length,       icon:FileText,     color:"text-purple-400"},
              {label:"Avg Booking Value",value:fmt(bookings.length>0?bookings.reduce((s,b)=>s+Number(b.total_amount||0),0)/bookings.length:0), icon:DollarSign, color:"text-emerald-400"},
              {label:"Unpaid Invoices", value:unpaid.length,         icon:ArrowUpRight, color:unpaid.length>0?"text-amber-400":"text-emerald-400"},
            ].map(({label,value,icon:Icon,color}) => (
              <Card key={label} className="border-white/10 bg-white/5">
                <CardContent className="pt-4 pb-4 px-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                    <Icon className={"h-4 w-4 "+color} />
                  </div>
                  <p className={"text-lg font-bold "+color}>{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
