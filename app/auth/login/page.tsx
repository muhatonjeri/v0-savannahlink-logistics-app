'use client'

import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { ArrowLeft, TestTube } from 'lucide-react'

// Mock credentials for testing
const MOCK_ADMIN = {
  email: 'admin@Moventra Safaris & Logistics Ltd.co.ke',
  password: 'admin123',
  role: 'admin',
  name: 'Admin User'
}

const MOCK_STAFF = {
  email: 'staff@Moventra Safaris & Logistics Ltd.co.ke', 
  password: 'staff123',
  role: 'staff',
  name: 'Staff User'
}

// Helper to set cookie
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [useMockLogin, setUseMockLogin] = useState(true) // Default to mock for testing
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/admin'

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Check mock credentials
    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
      // Set mock auth cookie (accessible by middleware)
      const authData = JSON.stringify({
        user: { email: MOCK_ADMIN.email, role: MOCK_ADMIN.role, name: MOCK_ADMIN.name },
        isAuthenticated: true
      })
      setCookie('mock_auth', authData, 7)
      // Also keep localStorage for client-side checks
      localStorage.setItem('mockAuth', authData)
      
      // Small delay to ensure cookie is set
      setTimeout(() => {
        router.push(redirectTo)
        router.refresh()
      }, 100)
    } else if (email === MOCK_STAFF.email && password === MOCK_STAFF.password) {
      const authData = JSON.stringify({
        user: { email: MOCK_STAFF.email, role: MOCK_STAFF.role, name: MOCK_STAFF.name },
        isAuthenticated: true
      })
      setCookie('mock_auth', authData, 7)
      localStorage.setItem('mockAuth', authData)
      
      setTimeout(() => {
        router.push(redirectTo)
        router.refresh()
      }, 100)
    } else {
      setError('Invalid email or password')
      setIsLoading(false)
    }
  }

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push(redirectTo)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = useMockLogin ? handleMockLogin : handleSupabaseLogin

  const fillMockCredentials = (type: 'admin' | 'staff') => {
    if (type === 'admin') {
      setEmail(MOCK_ADMIN.email)
      setPassword(MOCK_ADMIN.password)
    } else {
      setEmail(MOCK_STAFF.email)
      setPassword(MOCK_STAFF.password)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Back to home */}
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Image
                  src="/images/logo.png"
                  alt="Moventra Safaris & Logistics Ltd"
                  width={160}
                  height={54}
                  className="h-16 w-auto"
                  unoptimized
                />
              </div>
              <CardTitle className="text-2xl">Staff Portal</CardTitle>
              <CardDescription>
                Enter your credentials to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="staff@Moventra Safaris & Logistics Ltd.co.ke"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  {error && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>
              </form>

              {/* Mock Login Helper - For Testing */}
              {useMockLogin && (
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <TestTube className="h-3 w-3" />
                    <span>Quick Login (Testing Mode)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => fillMockCredentials('admin')}
                      className="text-xs"
                    >
                      Fill Admin
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => fillMockCredentials('staff')}
                      className="text-xs"
                    >
                      Fill Staff
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    Admin: admin@Moventra Safaris & Logistics Ltd.co.ke / admin123<br/>
                    Staff: staff@Moventra Safaris & Logistics Ltd.co.ke / staff123
                  </p>
                </div>
              )}

              {/* Toggle between mock and real auth */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setUseMockLogin(!useMockLogin)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {useMockLogin ? 'Switch to Supabase Auth' : 'Switch to Test Mode'}
                </button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            This portal is for authorized Moventra Safaris & Logistics Ltd staff only.
            <br />
            Contact your administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
