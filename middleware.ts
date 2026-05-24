import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const auth = req.cookies.get("mock_auth")?.value;

  if (!auth) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/moventra-access";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
