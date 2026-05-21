import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    const mockAuth = request.cookies.get('mock_auth')?.value
    if (mockAuth) {
      try {
        const parsed = JSON.parse(decodeURIComponent(mockAuth))
        if (parsed.isAuthenticated) {
          return NextResponse.next()
        }
      } catch {}
    }

    // Not authenticated - redirect to login
    const loginUrl = new URL('/moventra-access', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
