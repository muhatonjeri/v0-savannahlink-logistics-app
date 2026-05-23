'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Lock, Mail, Shield, ArrowRight, Loader2 } from 'lucide-react'

const CREDENTIALS = [
  { email: 'admin@moventrasafarislogisticsltd.com', password: 'admin123', role: 'admin', name: 'System Administrator' },
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
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const match = CREDENTIALS.find(u => u.email === email && u.password === password)
    if (match) {
      const data = JSON.stringify({ user: { email: match.email, role: match.role, name: match.name }, isAuthenticated: true })
      setCookie('mock_auth', data, 7)
      try { localStorage.setItem('mockAuth', data) } catch {}
      setTimeout(() => router.push('/admin'), 200)
    } else {
      setError('Invalid email or password.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'linear-gradient(135deg, #030a15 0%, #0a1628 50%, #030a15 100%)' }}>

      {/* Glow blobs */}
      <div style={{ position: 'fixed', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,126,34,0.15), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,92,58,0.15), transparent)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10,22,40,0.95)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>

          {/* Top bar */}
          <div style={{ height: '4px', background: 'linear-gradient(to right, #1a5c3a, #e67e22, #1a5c3a)' }} />

          <div style={{ padding: '40px 36px' }}>

            {/* Logo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
              <Image src="/images/logo.png" alt="Moventra" width={96} height={96} style={{ borderRadius: '50%', objectFit: 'contain', marginBottom: '16px' }} unoptimized />
              <h1 style={{ color: 'white', fontWeight: 800, fontSize: '18px', textAlign: 'center', margin: 0 }}>Moventra Safaris & Logistics</h1>
              <p style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '0.2em', marginTop: '4px', textTransform: 'uppercase' }}>Admin Portal</p>
              <div style={{ height: '1px', width: '50px', background: 'linear-gradient(to right, transparent, #e67e22, transparent)', marginTop: '16px' }} />
            </div>

            <h2 style={{ color: 'white', fontWeight: 700, fontSize: '22px', margin: '0 0 4px 0' }}>Welcome back</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 24px 0' }}>Sign in to access your dashboard</p>

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#d1d5db', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6b7280' }} />
                  <input type="email" required autoComplete="email"
                    style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px 12px 40px', color: 'white', fontSize: '14px', outline: 'none' }}
                    placeholder="your@email.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={e => (e.currentTarget.style.borderColor = '#e67e22')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')} />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#d1d5db', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6b7280' }} />
                  <input type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                    style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 44px 12px 40px', color: 'white', fontSize: '14px', outline: 'none' }}
                    placeholder="Enter your password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={e => (e.currentTarget.style.borderColor = '#e67e22')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}>
                    {showPass ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#f87171', fontSize: '14px' }}>
                  <Shield style={{ width: '16px', height: '16px', flexShrink: 0 }} />{error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: loading ? 'rgba(230,126,34,0.5)' : 'linear-gradient(135deg, #e67e22, #d35400)', border: 'none', borderRadius: '12px', padding: '14px', color: 'white', fontWeight: 700, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(230,126,34,0.4)' }}>
                {loading ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />Signing in...</> : <>Sign In <ArrowRight style={{ width: '16px', height: '16px' }} /></>}
              </button>
            </form>

            {/* Quick access */}
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ color: '#4b5563', fontSize: '12px', textAlign: 'center', marginBottom: '12px' }}>Quick access — click to fill</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {CREDENTIALS.map(u => (
                  <button key={u.role} type="button"
                    onClick={() => { setEmail(u.email); setPassword(u.password); }}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 12px', textAlign: 'left', cursor: 'pointer' }}>
                    <p style={{ color: 'white', fontSize: '12px', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{u.role}</p>
                    <p style={{ color: '#6b7280', fontSize: '11px', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ height: '4px', background: 'linear-gradient(to right, #1a5c3a, #e67e22, #1a5c3a)' }} />
        </div>

        <p style={{ textAlign: 'center', color: '#374151', fontSize: '12px', marginTop: '20px' }}>
          &copy; {new Date().getFullYear()} Moventra Safaris &amp; Logistics Ltd
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
