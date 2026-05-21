import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    // Check mock auth cookie
    const mockAuth = request.cookies.get('mock_auth')?.value
    if (mockAuth) {
      try {
        const parsed = JSON.parse(decodeURIComponent(mockAuth))
        if (parsed.isAuthenticated) {
          return NextResponse.next()
        }
      } catch {}
    }

    // Check Supabase session cookie
    const supabaseSession = request.cookies.get('sb-access-token')?.value
      || request.cookies.get('supabase-auth-token')?.value

    if (!supabaseSession && !mockAuth) {
      const loginUrl = new URL('/moventra-access', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
