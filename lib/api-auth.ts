// API route authentication helper
// Validates the mock_auth cookie on every sensitive request

import { NextRequest, NextResponse } from "next/server";

export function requireAuth(req: NextRequest): NextResponse | null {
  const cookie = req.headers.get("cookie") || "";
  const hasAuth = cookie.includes("mock_auth=");

  if (!hasAuth) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in." },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Bearer realm="Moventra Admin"',
        },
      }
    );
  }

  return null; // null = authenticated, proceed
}

// Wrap a route handler with auth check
export function withAuth(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const authError = requireAuth(req);
    if (authError) return authError;
    return handler(req);
  };
}
