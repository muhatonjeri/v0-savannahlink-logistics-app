"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Eye, EyeOff, Loader2, ShieldCheck, Car, Compass, Plane,
  Truck, Bus, Wrench, Package, Ship, HardHat, Fingerprint,
  ArrowRight, Lock, Mail,
} from "lucide-react";

// ── Credentials (dev only — replaced by Supabase in prod) ────────────────────
const CREDS = {
  admin: { email:"admin@moventrasafarislogisticsltd.com", password:"admin123", role:"admin" },
  staff: { email:"staff@moventrasafarislogisticsltd.com", password:"staff123", role:"staff" },
};

// ── Service cards floating in background ────────────────────────────────────
const CARDS = [
  { icon:Car,     label:"Car Rental",    color:"#818CF8", rot:"-8deg",  x:"5%",  y:"15%", size:140, delay:0    },
  { icon:Compass, label:"Safari Tours",  color:"#FBBF24", rot:"6deg",   x:"72%", y:"8%",  size:120, delay:0.3  },
  { icon:Plane,   label:"Transfers",     color:"#38BDF8", rot:"-5deg",  x:"82%", y:"55%", size:130, delay:0.6  },
  { icon:Truck,   label:"Movers",        color:"#A78BFA", rot:"10deg",  x:"60%", y:"78%", size:110, delay:0.9  },
  { icon:Bus,     label:"Corporate",     color:"#C084FC", rot:"-12deg", x:"3%",  y:"70%", size:125, delay:1.2  },
  { icon:Wrench,  label:"Recovery",      color:"#FB7185", rot:"7deg",   x:"18%", y:"88%", size:105, delay:1.5  },
  { icon:Package, label:"Cargo",         color:"#FB923C", rot:"-4deg",  x:"88%", y:"25%", size:115, delay:1.8  },
  { icon:Ship,    label:"Shipment",      color:"#60A5FA", rot:"9deg",   x:"45%", y:"90%", size:108, delay:2.1  },
  { icon:HardHat, label:"Construction",  color:"#FACC15", rot:"-7deg",  x:"25%", y:"5%",  size:118, delay:2.4  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [mounted,  setMounted]  = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [focused,  setFocused]  = useState<"email"|"password"|null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);

    // Try Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const useSupabase = supabaseUrl && !supabaseUrl.includes("placeholder") && supabaseKey;

    if (useSupabase) {
      try {
        const { createBrowserClient } = await import("@supabase/ssr");
        const sb = createBrowserClient(supabaseUrl!, supabaseKey!);
        const { error: authErr } = await sb.auth.signInWithPassword({ email: email.trim(), password });
        if (authErr) { setError("Invalid credentials. Please try again."); setLoading(false); return; }
        const redirect = new URLSearchParams(window.location.search).get("redirect") || "/admin";
        router.push(redirect);
        return;
      } catch {}
    }

    // Fallback: mock auth
    await new Promise(r => setTimeout(r, 800));
    const matched = Object.values(CREDS).find(c => c.email === email.trim() && c.password === password);
    if (matched) {
      const exp = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `mock_auth=${matched.role}; path=/; expires=${exp}; SameSite=Strict`;
      const redirect = new URLSearchParams(window.location.search).get("redirect") || "/admin";
      router.push(redirect);
    } else {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  const tiltX = (mousePos.y - 0.5) * 8;
  const tiltY = (mousePos.x - 0.5) * -8;

  return (
    <div ref={containerRef} style={{
      minHeight:"100vh", overflow:"hidden", position:"relative",
      background:"#050A14", display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Outfit', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes floatCard {
          0%,100% { transform: var(--base-transform) translateY(0px); }
          50%      { transform: var(--base-transform) translateY(-18px); }
        }
        @keyframes cardEntrance {
          from { opacity:0; transform: var(--base-transform) scale(.7) translateY(30px); }
          to   { opacity:1; transform: var(--base-transform) translateY(0); }
        }
        @keyframes panelEntrance {
          from { opacity:0; transform: translateY(24px) scale(.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        @keyframes logoSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(249,115,22,.4); }
          70%  { box-shadow: 0 0 0 16px rgba(249,115,22,.0); }
          100% { box-shadow: 0 0 0 0 rgba(249,115,22,.0); }
        }
        @keyframes gridPan {
          from { background-position: 0 0; }
          to   { background-position: 40px 40px; }
        }
        @keyframes shimmer {
          0%   { left: -100%; }
          100% { left: 200%; }
        }
        .card-float { animation: floatCard var(--duration, 5s) ease-in-out infinite; }
        .card-entrance { animation: cardEntrance .8s cubic-bezier(.16,1,.3,1) both; }
        .panel-entrance { animation: panelEntrance .7s cubic-bezier(.16,1,.3,1) both; }
        .pulse-logo { animation: pulse-ring 2.5s ease infinite; }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(255,255,255,.06) inset !important;
          -webkit-text-fill-color: white !important;
        }
      `}</style>

      {/* ── Animated grid bg ──────────────────────────────────────────────── */}
      <div style={{
        position:"fixed", inset:0, zIndex:0, opacity:.3,
        backgroundImage:`linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)`,
        backgroundSize:"40px 40px",
        animation:"gridPan 8s linear infinite",
      }} />

      {/* ── Radial glows ──────────────────────────────────────────────────── */}
      <div style={{
        position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        background:`radial-gradient(ellipse 60% 50% at ${mousePos.x*100}% ${mousePos.y*100}%, rgba(249,115,22,.06) 0%, transparent 70%),
                    radial-gradient(ellipse 40% 40% at 20% 80%, rgba(56,189,248,.04) 0%, transparent 60%),
                    radial-gradient(ellipse 50% 60% at 80% 10%, rgba(167,139,250,.04) 0%, transparent 60%)`,
        transition:"background 0.3s ease",
      }} />

      {/* ── Floating service cards ──────────────────────────────────────── */}
      {mounted && CARDS.map((card, i) => {
        const Icon = card.icon;
        const parallaxX = (mousePos.x - .5) * (i % 2 === 0 ? 20 : -15);
        const parallaxY = (mousePos.y - .5) * (i % 3 === 0 ? 15 : -20);
        return (
          <div key={i} className="card-entrance card-float" style={{
            position:"fixed",
            left:`calc(${card.x} + ${parallaxX}px)`,
            top:`calc(${card.y} + ${parallaxY}px)`,
            width:card.size,
            zIndex:1,
            animationDelay:`${card.delay}s`,
            "--base-transform":`rotate(${card.rot})`,
            "--duration":`${4.5 + i * 0.3}s`,
            transition:"left .3s ease, top .3s ease",
          } as React.CSSProperties}>
            <div style={{
              background:`linear-gradient(135deg, rgba(255,255,255,.05) 0%, rgba(255,255,255,.02) 100%)`,
              border:`1px solid ${card.color}25`,
              borderRadius:20,
              padding:"20px 18px",
              backdropFilter:"blur(12px)",
              boxShadow:`0 8px 32px rgba(0,0,0,.3), 0 0 0 1px ${card.color}15, inset 0 1px 0 rgba(255,255,255,.06)`,
              transform:`perspective(400px) rotateX(${tiltX*.3}deg) rotateY(${tiltY*.3}deg)`,
              transition:"transform .1s ease",
              overflow:"hidden",
              position:"relative",
            }}>
              {/* Shimmer */}
              <div style={{
                position:"absolute", inset:0, overflow:"hidden", borderRadius:20, pointerEvents:"none",
              }}>
                <div style={{
                  position:"absolute", top:0, width:"60%", height:"100%",
                  background:"linear-gradient(90deg, transparent, rgba(255,255,255,.04), transparent)",
                  animation:"shimmer 3s ease infinite",
                  animationDelay:`${card.delay * 1.5}s`,
                }} />
              </div>
              {/* Glow dot top-right */}
              <div style={{
                position:"absolute", top:8, right:8, width:6, height:6,
                borderRadius:"50%", background:card.color, opacity:.6,
                boxShadow:`0 0 8px ${card.color}`,
              }} />
              <Icon size={28} style={{ color:card.color, marginBottom:10, display:"block", filter:`drop-shadow(0 0 6px ${card.color}60)` }} />
              <p style={{ color:"white", fontWeight:600, fontSize:11, margin:0, letterSpacing:".04em", textTransform:"uppercase", fontFamily:"'Syne', sans-serif" }}>
                {card.label}
              </p>
            </div>
          </div>
        );
      })}

      {/* ── Login panel ─────────────────────────────────────────────────── */}
      <div className="panel-entrance" style={{
        position:"relative", zIndex:10, width:"100%", maxWidth:420, padding:"0 16px",
      }}>
        {/* Brand mark */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ position:"relative", display:"inline-block", marginBottom:16 }}>
            <div className="pulse-logo" style={{
              width:80, height:80, borderRadius:"50%",
              border:"1.5px solid rgba(249,115,22,.4)",
              display:"flex", alignItems:"center", justifyContent:"center",
              background:"rgba(249,115,22,.08)",
              margin:"0 auto",
            }}>
              <Image src="/images/logo.png" alt="Moventra" width={60} height={60}
                style={{ borderRadius:"50%", objectFit:"contain" }} />
            </div>
            {/* Orbit ring */}
            <div style={{
              position:"absolute", inset:-10,
              border:"1px dashed rgba(249,115,22,.2)",
              borderRadius:"50%",
              animation:"logoSpin 20s linear infinite",
              pointerEvents:"none",
            }}>
              <div style={{
                position:"absolute", top:-4, left:"50%", transform:"translateX(-50%)",
                width:8, height:8, borderRadius:"50%",
                background:"#F97316", boxShadow:"0 0 10px #F97316",
              }} />
            </div>
          </div>
          <h1 style={{
            color:"white", margin:"0 0 4px",
            fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:28, letterSpacing:"-.01em",
          }}>MOVENTRA</h1>
          <p style={{ color:"#F97316", fontSize:10, margin:"0 0 2px", letterSpacing:".2em", textTransform:"uppercase", fontFamily:"'Outfit', sans-serif", fontWeight:500 }}>
            Safaris & Logistics Ltd
          </p>
          <p style={{ color:"rgba(255,255,255,.25)", fontSize:11, margin:0, fontFamily:"'Outfit', sans-serif" }}>
            Admin Management System
          </p>
        </div>

        {/* Glass card */}
        <div style={{
          background:"rgba(255,255,255,.03)",
          border:"1px solid rgba(255,255,255,.08)",
          borderRadius:24,
          padding:32,
          backdropFilter:"blur(24px)",
          boxShadow:"0 32px 64px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04), inset 0 1px 0 rgba(255,255,255,.06)",
          position:"relative",
          overflow:"hidden",
        }}>
          {/* Card inner shimmer */}
          <div style={{
            position:"absolute", top:0, left:"-100%", width:"200%", height:"1px",
            background:"linear-gradient(90deg, transparent, rgba(249,115,22,.4), transparent)",
          }} />

          <p style={{ color:"rgba(255,255,255,.5)", fontSize:12, textAlign:"center", margin:"0 0 24px", letterSpacing:".05em", textTransform:"uppercase", fontFamily:"'Outfit', sans-serif" }}>
            Secure Access Portal
          </p>

          <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Email */}
            <div>
              <label style={{ color:"rgba(255,255,255,.5)", fontSize:11, fontWeight:600, display:"block", marginBottom:8, textTransform:"uppercase", letterSpacing:".08em" }}>
                Email Address
              </label>
              <div style={{ position:"relative" }}>
                <Mail size={15} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color: focused==="email"?"#F97316":"rgba(255,255,255,.2)", transition:"color .2s" }} />
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  onFocus={()=>setFocused("email")} onBlur={()=>setFocused(null)}
                  placeholder="admin@moventrasafarislogisticsltd.com"
                  required autoComplete="email"
                  style={{
                    width:"100%", boxSizing:"border-box",
                    background:"rgba(255,255,255,.05)",
                    border:`1px solid ${focused==="email"?"rgba(249,115,22,.5)":"rgba(255,255,255,.08)"}`,
                    borderRadius:12, padding:"12px 16px 12px 40px",
                    color:"white", fontSize:13, outline:"none",
                    fontFamily:"'Outfit', sans-serif",
                    transition:"border-color .2s, background .2s",
                    boxShadow: focused==="email"?"0 0 0 3px rgba(249,115,22,.12)":"none",
                  }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ color:"rgba(255,255,255,.5)", fontSize:11, fontWeight:600, display:"block", marginBottom:8, textTransform:"uppercase", letterSpacing:".08em" }}>
                Password
              </label>
              <div style={{ position:"relative" }}>
                <Lock size={15} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color: focused==="password"?"#F97316":"rgba(255,255,255,.2)", transition:"color .2s" }} />
                <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                  onFocus={()=>setFocused("password")} onBlur={()=>setFocused(null)}
                  placeholder="••••••••" required autoComplete="current-password"
                  style={{
                    width:"100%", boxSizing:"border-box",
                    background:"rgba(255,255,255,.05)",
                    border:`1px solid ${focused==="password"?"rgba(249,115,22,.5)":"rgba(255,255,255,.08)"}`,
                    borderRadius:12, padding:"12px 48px 12px 40px",
                    color:"white", fontSize:13, outline:"none",
                    fontFamily:"'Outfit', sans-serif",
                    transition:"border-color .2s, background .2s",
                    boxShadow: focused==="password"?"0 0 0 3px rgba(249,115,22,.12)":"none",
                  }} />
                <button type="button" onClick={()=>setShowPw(v=>!v)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.3)", padding:0, display:"flex" }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.25)", borderRadius:10, padding:"10px 14px", color:"#FCA5A5", fontSize:13, fontFamily:"'Outfit', sans-serif" }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width:"100%", background: loading?"rgba(249,115,22,.6)":"#F97316",
              border:"none", borderRadius:12, padding:"14px",
              color:"white", fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              fontFamily:"'Syne', sans-serif", letterSpacing:".04em",
              transition:"all .2s",
              boxShadow: loading?"none":"0 4px 24px rgba(249,115,22,.35)",
              position:"relative", overflow:"hidden",
            }}>
              {!loading && (
                <div style={{
                  position:"absolute", inset:0, background:"linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent)",
                  borderRadius:12,
                }} />
              )}
              {loading
                ? <><Loader2 size={16} className="animate-spin" />Authenticating...</>
                : <><ShieldCheck size={16} />Access Admin Portal<ArrowRight size={14} style={{marginLeft:4}} /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0 16px" }}>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,.06)" }} />
            <span style={{ color:"rgba(255,255,255,.2)", fontSize:10, letterSpacing:".1em", fontFamily:"'Outfit', sans-serif" }}>DEV ACCESS</span>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,.06)" }} />
          </div>

          {/* Quick login */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {(["admin","staff"] as const).map(type => (
              <button key={type} type="button" onClick={() => { setEmail(CREDS[type].email); setPassword(CREDS[type].password); setError(""); }}
                style={{
                  background: type==="admin"?"rgba(249,115,22,.08)":"rgba(56,189,248,.08)",
                  border:`1px solid ${type==="admin"?"rgba(249,115,22,.2)":"rgba(56,189,248,.15)"}`,
                  borderRadius:10, padding:"10px 12px", cursor:"pointer", textAlign:"center",
                  transition:"all .15s",
                }}>
                <p style={{ color:type==="admin"?"#F97316":"#38BDF8", fontWeight:700, fontSize:11, margin:"0 0 2px", textTransform:"capitalize", fontFamily:"'Syne', sans-serif" }}>
                  {type}
                </p>
                <p style={{ color:"rgba(255,255,255,.3)", fontSize:10, margin:0, fontFamily:"'JetBrains Mono', monospace" }}>
                  {type}123
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:24, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <Fingerprint size={12} style={{ color:"rgba(255,255,255,.15)" }} />
          <p style={{ color:"rgba(255,255,255,.15)", fontSize:10, margin:0, fontFamily:"'Outfit', sans-serif", letterSpacing:".06em" }}>
            © 2025 Moventra Safaris & Logistics Ltd
          </p>
          <Fingerprint size={12} style={{ color:"rgba(255,255,255,.15)" }} />
        </div>
      </div>
    </div>
  );
}
