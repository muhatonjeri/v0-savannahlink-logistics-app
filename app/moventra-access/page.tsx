'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Lock, Mail, Shield, ArrowRight, Loader2 } from 'lucide-react'

const MOCK_ADMIN = { email: 'admin@moventrasafarislogisticsltd.com', password: 'admin123', role: 'admin', name: 'System Administrator' }
const MOCK_STAFF = { email: 'staff@moventrasafarislogisticsltd.com', password: 'staff123', role: 'staff', name: 'Staff User' }

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

function LoginForm() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirect') || '/admin'

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const match = [MOCK_ADMIN, MOCK_STAFF].find(u => u.email === email && u.password === password)
    if (match) {
      const authData = JSON.stringify({ user: { email: match.email, role: match.role, name: match.name }, isAuthenticated: true })
      setCookie('mock_auth', authData, 7)
      try { localStorage.setItem('mockAuth', authData) } catch {}
      setTimeout(() => { router.push(redirectTo); router.refresh() }, 100)
    } else {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #030a15 0%, #0a1628 40%, #0f2040 70%, #030a15 100%)' }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #e67e22, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #1a5c3a, transparent)' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/10 overflow-hidden"
          style={{ background: 'rgba(10,22,40,0.90)', backdropFilter: 'blur(20px)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>

          <div style={{ height: '4px', background: 'linear-gradient(to right, #1a5c3a, #e67e22, #1a5c3a)' }} />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <Image src="/images/logo.png" alt="Moventra" width={100} height={100} className="rounded-full object-contain mb-4" unoptimized />
              <h1 className="text-lg font-extrabold text-white tracking-tight text-center">Moventra Safaris & Logistics</h1>
              <p className="text-xs text-gray-500 mt-1 tracking-[0.2em] uppercase">Admin Portal</p>
              <div style={{ height: '1px', width: '60px', background: 'linear-gradient(to right, transparent, #e67e22, transparent)', marginTop: '12px' }} />
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-gray-400 text-sm mt-1">Sign in to access the admin dashboard</p>
            </div>

            <form onSubmit={doLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input type="email" required autoComplete="email"
                    className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#e67e22')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                    placeholder="your@email.com"
                    value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                    className="w-full rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#e67e22')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                    placeholder="Enter your password"
                    value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-400"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <Shield className="h-4 w-4 shrink-0" />{error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-all mt-2 disabled:opacity-60"
                style={{ background: loading ? 'rgba(230,126,34,0.5)' : 'linear-gradient(135deg, #e67e22, #d35400)', boxShadow: loading ? 'none' : '0 4px 20px rgba(230,126,34,0.3)' }}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in...</> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs text-gray-600 text-center mb-3">Quick access — click to fill credentials</p>
              <div className="grid grid-cols-2 gap-2">
                {[MOCK_ADMIN, MOCK_STAFF].map(u => (
                  <button key={u.role} type="button"
                    onClick={() => { setEmail(u.email); setPassword(u.password); }}
                    className="rounded-xl px-3 py-2.5 text-left transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(230,126,34,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>
                    <p className="text-xs font-semibold text-white capitalize">{u.role}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{u.email}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ height: '4px', background: 'linear-gradient(to right, #1a5c3a, #e67e22, #1a5c3a)' }} />
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          &copy; {new Date().getFullYear()} Moventra Safaris &amp; Logistics Ltd &mdash; Confidential Admin Access
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030a15' }}>
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
