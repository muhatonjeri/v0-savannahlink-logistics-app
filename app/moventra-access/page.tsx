'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Eye, EyeOff, Lock, Mail, Shield, ArrowRight, Loader2 } from 'lucide-react'

const CREDENTIALS = [
  { email: 'admin@moventrasafarislogisticsltd.com', password: 'admin123', role: 'admin', name: 'Administrator' },
  { email: 'staff@moventrasafarislogisticsltd.com', password: 'staff123', role: 'staff', name: 'Staff User' },
]

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const match = CREDENTIALS.find(c => c.email === email && c.password === password)
    if (match) {
      const auth = JSON.stringify({ user: { email: match.email, role: match.role, name: match.name }, isAuthenticated: true })
      setCookie('mock_auth', auth, 7)
      try { localStorage.setItem('mockAuth', auth) } catch {}
      setTimeout(() => { window.location.href = '/admin'; }, 200)
    } else {
      setError('Invalid email or password')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'linear-gradient(135deg, #030a15 0%, #0a1628 50%, #030a15 100%)' }}>

      {/* Glow effects */}
      <div style={{ position: 'fixed', top: '-10rem', right: '-10rem', width: '24rem', height: '24rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,126,34,0.15), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10rem', left: '-10rem', width: '24rem', height: '24rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,92,58,0.15), transparent)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>

        {/* Card */}
        <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10,22,40,0.95)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>

          {/* Top bar */}
          <div style={{ height: '4px', background: 'linear-gradient(to right, #1a5c3a, #e67e22, #1a5c3a)' }} />

          <div style={{ padding: '40px 32px' }}>

            {/* Logo + Company */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Image src="/images/logo.png" alt="Moventra" width={90} height={90}
                style={{ borderRadius: '50%', objectFit: 'contain', margin: '0 auto 12px' }} unoptimized />
              <div style={{ color: 'white', fontWeight: 800, fontSize: '16px' }}>Moventra Safaris & Logistics</div>
              <div style={{ color: '#888', fontSize: '11px', letterSpacing: '0.2em', marginTop: '4px' }}>ADMIN PORTAL</div>
              <div style={{ height: '1px', width: '50px', background: 'linear-gradient(to right, transparent, #e67e22, transparent)', margin: '12px auto 0' }} />
            </div>

            {/* Heading */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '22px' }}>Welcome back</div>
              <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>Sign in to access the dashboard</div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#ccc', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#666' }} />
                  <input type="email" required
                    style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '40px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none' }}
                    placeholder="your@email.com"
                    value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#ccc', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#666' }} />
                  <input type={showPass ? 'text' : 'password'} required
                    style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '40px', paddingRight: '40px', paddingTop: '12px', paddingBottom: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none' }}
                    placeholder="Enter your password"
                    value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0 }}>
                    {showPass ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>
                  <Shield style={{ width: '14px', height: '14px', flexShrink: 0 }} />{error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '14px', color: 'white', background: loading ? 'rgba(230,126,34,0.5)' : 'linear-gradient(135deg, #e67e22, #d35400)', boxShadow: loading ? 'none' : '0 4px 20px rgba(230,126,34,0.25)', marginBottom: '24px', opacity: loading ? 0.7 : 1 }}>
                {loading ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />Signing in...</> : <>Sign In <ArrowRight style={{ width: '16px', height: '16px' }} /></>}
              </button>
            </form>

            {/* Quick access */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
              <div style={{ color: '#555', fontSize: '11px', textAlign: 'center', marginBottom: '12px' }}>Quick access — click to fill credentials</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {CREDENTIALS.map(c => (
                  <button key={c.role} type="button"
                    onClick={() => { setEmail(c.email); setPassword(c.password); }}
                    style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ color: 'white', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>{c.role}</div>
                    <div style={{ color: '#555', fontSize: '11px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ height: '4px', background: 'linear-gradient(to right, #1a5c3a, #e67e22, #1a5c3a)' }} />
        </div>

        <div style={{ textAlign: 'center', color: '#444', fontSize: '11px', marginTop: '20px' }}>
          &copy; {new Date().getFullYear()} Moventra Safaris &amp; Logistics Ltd &mdash; Confidential
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
