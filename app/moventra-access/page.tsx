'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Lock, Mail, Shield, ArrowRight, Loader2 } from 'lucide-react'

const USERS = [
  { email: 'admin@moventrasafarislogisticsltd.com', password: 'admin123', role: 'admin', name: 'System Administrator' },
  { email: 'staff@moventrasafarislogisticsltd.com', password: 'staff123', role: 'staff', name: 'Staff User' },
]

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

function LoginForm() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirect') || '/admin'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const match = USERS.find(u => u.email === email && u.password === password)
    if (match) {
      const auth = JSON.stringify({ user: { email: match.email, role: match.role, name: match.name }, isAuthenticated: true })
      setCookie('mock_auth', auth, 7)
      try { localStorage.setItem('mockAuth', auth) } catch {}
      setTimeout(() => { router.push(redirectTo); router.refresh() }, 150)
    } else {
      setError('Invalid email or password')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'linear-gradient(135deg, #030a15 0%, #0a1628 50%, #030a15 100%)' }}>

      {/* Glow blobs */}
      <div style={{ position: 'fixed', top: '-160px', right: '-160px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,126,34,0.15), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-160px', left: '-160px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,92,58,0.15), transparent)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>

        {/* Card */}
        <div style={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>

          {/* Top bar */}
          <div style={{ height: '4px', background: 'linear-gradient(to right, #1a5c3a, #e67e22, #1a5c3a)' }} />

          <div style={{ padding: '36px 32px' }}>

            {/* Logo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
              <Image src="/images/logo.png" alt="Moventra" width={90} height={90} style={{ borderRadius: '50%', objectFit: 'contain', marginBottom: '14px' }} unoptimized />
              <div style={{ color: 'white', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em', textAlign: 'center' }}>
                Moventra Safaris &amp; Logistics
              </div>
              <div style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '4px' }}>Admin Portal</div>
              <div style={{ height: '1px', width: '50px', background: 'linear-gradient(to right, transparent, #e67e22, transparent)', marginTop: '14px' }} />
            </div>

            {/* Heading */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '22px' }}>Welcome back</div>
              <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>Sign in to access the admin dashboard</div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', color: '#d1d5db', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#6b7280' }} />
                  <input
                    type="email" required autoComplete="email"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 14px 12px 38px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="your@email.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={e => (e.currentTarget.style.borderColor = '#e67e22')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', color: '#d1d5db', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#6b7280' }} />
                  <input
                    type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 40px 12px 38px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="Enter your password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={e => (e.currentTarget.style.borderColor = '#e67e22')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0, display: 'flex' }}>
                    {showPass ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '13px', marginBottom: '14px' }}>
                  <Shield style={{ width: '14px', height: '14px', flexShrink: 0 }} />{error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: loading ? 'rgba(230,126,34,0.4)' : 'linear-gradient(135deg, #e67e22, #d35400)', border: 'none', borderRadius: '12px', padding: '13px', color: 'white', fontWeight: 600, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(230,126,34,0.3)', marginTop: '4px' }}>
                {loading ? <><Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} />Signing in...</> : <>Sign In <ArrowRight style={{ width: '15px', height: '15px' }} /></>}
              </button>
            </form>

            {/* Quick fill */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#6b7280', fontSize: '11px', textAlign: 'center', marginBottom: '10px' }}>Click to fill credentials</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {USERS.map(u => (
                  <button key={u.role} type="button"
                    onClick={() => { setEmail(u.email); setPassword(u.password) }}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px', textAlign: 'left', cursor: 'pointer' }}>
                    <div style={{ color: 'white', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>{u.role}</div>
                    <div style={{ color: '#6b7280', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>{u.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ height: '4px', background: 'linear-gradient(to right, #1a5c3a, #e67e22, #1a5c3a)' }} />
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', color: '#374151', fontSize: '11px' }}>
          &copy; {new Date().getFullYear()} Moventra Safaris &amp; Logistics Ltd &mdash; Confidential
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030a15' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: '#e67e22', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
