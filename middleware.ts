export function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!pathname.startsWith("/admin")) {
    return new Response(null, { status: 200 });
  }

  const cookie = request.headers.get("cookie") || "";
  const hasAuth = cookie.includes("mock_auth=");

  if (!hasAuth) {
    const loginUrl = new URL("/moventra-access", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return Response.redirect(loginUrl.toString(), 302);
  }

  return new Response(null, { status: 200 });
}

export const config = {
  matcher: ["/admin/:path*"],
};
