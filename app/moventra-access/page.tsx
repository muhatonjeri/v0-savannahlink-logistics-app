"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

const CREDENTIALS = {
  admin: { email: "admin@moventrasafarislogisticsltd.com", password: "admin123", role: "admin" },
  staff: { email: "staff@moventrasafarislogisticsltd.com", password: "staff123", role: "staff" },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const matched = Object.values(CREDENTIALS).find(
      c => c.email === email.trim() && c.password === password
    );

    if (matched) {
      const exp = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `mock_auth=${matched.role}; path=/; expires=${exp}; SameSite=Strict`;
      router.push("/admin");
    } else {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  const quickLogin = (type: "admin" | "staff") => {
    const c = CREDENTIALS[type];
    setEmail(c.email);
    setPassword(c.password);
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a1628 0%, #1a3a5c 50%, #0a1628 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      {/* Background pattern */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(230,126,34,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(56,189,248,0.05) 0%, transparent 50%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
        {/* Logo + Brand */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", border: "2px solid rgba(230,126,34,0.5)", padding: "3px", background: "rgba(230,126,34,0.1)" }}>
              <Image src="/images/logo.png" alt="Moventra" width={74} height={74} style={{ borderRadius: "50%", objectFit: "contain" }} />
            </div>
          </div>
          <h1 style={{ color: "white", fontSize: "24px", fontWeight: 700, margin: "0 0 4px", fontFamily: "Arial, sans-serif" }}>Moventra</h1>
          <p style={{ color: "#e67e22", fontSize: "12px", margin: 0, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "Arial, sans-serif" }}>Safaris & Logistics Ltd</p>
          <p style={{ color: "#6b7280", fontSize: "11px", marginTop: "4px", fontFamily: "Arial, sans-serif" }}>Admin Management System</p>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "32px", backdropFilter: "blur(10px)" }}>
          <h2 style={{ color: "white", fontSize: "18px", fontWeight: 600, margin: "0 0 24px", fontFamily: "Arial, sans-serif", textAlign: "center" }}>Sign In to Admin</h2>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "#d1d5db", fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Arial, sans-serif" }}>Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@moventrasafarislogisticsltd.com"
                required autoComplete="email"
                style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "12px 16px", color: "white", fontSize: "13px", outline: "none", fontFamily: "Arial, sans-serif", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "rgba(230,126,34,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ color: "#d1d5db", fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Arial, sans-serif" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "12px 48px 12px 16px", color: "white", fontSize: "13px", outline: "none", fontFamily: "Arial, sans-serif" }}
                  onFocus={e => e.target.style.borderColor = "rgba(230,126,34,0.6)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex" }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", color: "#fca5a5", fontSize: "13px", fontFamily: "Arial, sans-serif" }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ width: "100%", background: loading ? "rgba(230,126,34,0.6)" : "#e67e22", border: "none", borderRadius: "12px", padding: "14px", color: "white", fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "Arial, sans-serif", transition: "background 0.2s" }}>
              {loading ? <><Loader2 size={18} className="animate-spin" />Signing in...</> : <><ShieldCheck size={18} />Sign In</>}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
            <span style={{ color: "#6b7280", fontSize: "11px", fontFamily: "Arial, sans-serif" }}>QUICK ACCESS</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
          </div>

          {/* Quick login buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {(["admin", "staff"] as const).map(type => (
              <button key={type} type="button" onClick={() => quickLogin(type)}
                style={{ background: type === "admin" ? "rgba(230,126,34,0.15)" : "rgba(56,189,248,0.1)", border: type === "admin" ? "1px solid rgba(230,126,34,0.3)" : "1px solid rgba(56,189,248,0.25)", borderRadius: "10px", padding: "10px", cursor: "pointer", textAlign: "center" }}>
                <p style={{ color: type === "admin" ? "#e67e22" : "#38bdf8", fontWeight: 700, fontSize: "12px", margin: "0 0 2px", textTransform: "capitalize", fontFamily: "Arial, sans-serif" }}>{type}</p>
                <p style={{ color: "#9ca3af", fontSize: "10px", margin: 0, fontFamily: "Arial, sans-serif" }}>{type}123</p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", color: "#4b5563", fontSize: "11px", marginTop: "20px", fontFamily: "Arial, sans-serif" }}>
          © 2025 Moventra Safaris & Logistics Ltd · All rights reserved
        </p>
      </div>
    </div>
  );
}
