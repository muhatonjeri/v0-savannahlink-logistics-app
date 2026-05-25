"use client";
import { useState } from "react";
import Image from "next/image";
import { Search, Phone, CheckCircle2, Clock, XCircle, FileText, Receipt, Loader2 } from "lucide-react";

const fmt = (n: number) => "KES " + Number(n||0).toLocaleString();
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-KE",{day:"numeric",month:"short",year:"numeric"}) : "-";

const statusCfg: Record<string,{label:string;color:string;icon:React.ElementType}> = {
  pending:    {label:"Pending",    color:"text-yellow-400 bg-yellow-500/20", icon:Clock},
  confirmed:  {label:"Confirmed",  color:"text-blue-400 bg-blue-500/20",    icon:CheckCircle2},
  "in-progress":{label:"In Progress",color:"text-purple-400 bg-purple-500/20",icon:Clock},
  completed:  {label:"Completed",  color:"text-emerald-400 bg-emerald-500/20",icon:CheckCircle2},
  cancelled:  {label:"Cancelled",  color:"text-red-400 bg-red-500/20",      icon:XCircle},
};

export default function ClientPortal() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const lookup = async () => {
    if (!phone.trim()) { setError("Enter your phone number"); return; }
    setLoading(true); setError(""); setData(null);
    try {
      const res = await fetch(`/api/client-profile?phone=${encodeURIComponent(phone.trim())}`);
      const json = await res.json();
      if (json.client || (json.bookings?.length > 0)) setData(json);
      else setError("No records found for this number. Contact us at +254 727 247 032.");
    } catch { setError("Something went wrong. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0a1628,#1a3a5c)",borderBottom:"2px solid #e67e22"}} className="px-4 py-5">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <Image src="/images/logo.png" alt="Moventra" width={48} height={48} className="rounded-full" />
          <div>
            <h1 className="text-white font-bold text-lg">Moventra Client Portal</h1>
            <p className="text-gray-300 text-xs">Track your bookings & receipts</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-5">
        {/* Search */}
        <div className="rounded-2xl border border-[#e67e22]/30 bg-[#e67e22]/5 p-5">
          <p className="text-[#e67e22] font-semibold text-sm mb-3 flex items-center gap-2">
            <Phone className="h-4 w-4" />Enter your phone number to view your bookings
          </p>
          <div className="flex gap-2">
            <input type="tel" placeholder="+254 7XX XXX XXX or 07XX XXX XXX"
              className="flex-1 bg-[#0a1628] border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#e67e22]/50"
              value={phone} onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key==="Enter" && lookup()} />
            <button onClick={lookup} disabled={loading}
              className="bg-[#e67e22] hover:bg-[#d35400] text-white px-5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 disabled:opacity-70">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "" : "Search"}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        {/* Results */}
        {data && (
          <>
            {/* Client info */}
            {data.client && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-white font-bold text-lg">{data.client.full_name}</p>
                <p className="text-gray-400 text-sm">{data.client.phone} {data.client.email ? `· ${data.client.email}` : ""}</p>
                <div className="flex gap-4 mt-3 text-sm">
                  <div><p className="text-gray-500 text-xs">Total Bookings</p><p className="text-white font-bold">{data.summary?.totalBookings||0}</p></div>
                  <div><p className="text-gray-500 text-xs">Total Spent</p><p className="text-emerald-400 font-bold">{fmt(data.summary?.totalSpent||0)}</p></div>
                  {data.summary?.totalDebt > 0 && <div><p className="text-gray-500 text-xs">Outstanding</p><p className="text-red-400 font-bold">{fmt(data.summary.totalDebt)}</p></div>}
                </div>
              </div>
            )}

            {/* Bookings */}
            {data.bookings?.length > 0 && (
              <div className="space-y-2">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Your Bookings ({data.bookings.length})</p>
                {data.bookings.map((b: any, i: number) => {
                  const cfg = statusCfg[b.status] || statusCfg.pending;
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-white font-medium text-sm capitalize">{String(b.service_type||"").replace(/-/g," ")}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{fmtDate(b.booking_date||b.created_at)}</p>
                          {b.booking_ref && <p className="text-[#e67e22] text-xs font-mono mt-1">{b.booking_ref}</p>}
                        </div>
                        <div className="text-right">
                          <span className={"text-xs font-semibold px-2 py-1 rounded-full " + cfg.color}>{cfg.label}</span>
                          <p className="text-white font-bold text-sm mt-1">{fmt(Number(b.total_amount||0))}</p>
                        </div>
                      </div>
                      {Number(b.total_amount||0) - Number(b.amount_paid||0) > 0 && (
                        <p className="text-amber-400 text-xs mt-2">Balance: {fmt(Number(b.total_amount||0)-Number(b.amount_paid||0))}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Receipts */}
            {data.receipts?.length > 0 && (
              <div className="space-y-2">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Receipts ({data.receipts.length})</p>
                {data.receipts.map((r: any, i: number) => (
                  <div key={i} className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium font-mono">{r.receipt_number}</p>
                      <p className="text-gray-400 text-xs">{String(r.service_type||"")} · {fmtDate(r.issued_at||r.created_at)}</p>
                    </div>
                    <p className="text-emerald-400 font-bold">{fmt(Number(r.total_amount||0))}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center text-gray-600 text-xs pt-4 border-t border-white/10">
          <p>Need help? Call <a href="tel:+254727247032" className="text-[#e67e22]">+254 727 247 032</a></p>
          <p className="mt-1">Moventra Safaris & Logistics Ltd · Muthaiga Square, Nairobi</p>
        </div>
      </div>
    </div>
  );
}
