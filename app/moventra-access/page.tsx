'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const ADMIN = { email: 'admin@moventrasafarislogisticsltd.com', password: 'admin123' }
  const STAFF = { email: 'staff@moventrasafarislogisticsltd.com', password: 'staff123' }

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    if ((email === ADMIN.email && password === ADMIN.password) || (email === STAFF.email && password === STAFF.password)) {
      document.cookie = 'mock_auth=1; path=/; max-age=604800'
      window.location.href = '/admin'
    } else {
      setError('Invalid credentials')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#111d2e', borderRadius: '16px', padding: '40px', border: '1px solid rgba(255,255,255,0.1)' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/images/logo.png" alt="Moventra" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'contain', margin: '0 auto 12px', display: 'block' }} />
          <h1 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: 0 }}>Moventra Admin</h1>
          <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 0' }}>Sign in to continue</p>
        </div>

        <form onSubmit={login}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#ccc', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '13px', outline: 'none' }}
              placeholder="Enter email" />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#ccc', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '13px', outline: 'none' }}
              placeholder="Enter password" />
          </div>

          {error && <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '11px', borderRadius: '10px', background: '#e67e22', border: 'none', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
          <p style={{ color: '#555', fontSize: '11px', textAlign: 'center', marginBottom: '10px' }}>Quick access</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button onClick={() => { setEmail(ADMIN.email); setPassword(ADMIN.password) }}
              style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc', fontSize: '12px', cursor: 'pointer' }}>
              Admin
            </button>
            <button onClick={() => { setEmail(STAFF.email); setPassword(STAFF.password) }}
              style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc', fontSize: '12px', cursor: 'pointer' }}>
              Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
