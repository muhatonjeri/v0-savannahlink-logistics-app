import { NextRequest, NextResponse } from "next/server";

const INTERNAL_SECRET = process.env.API_INTERNAL_SECRET || "moventra-internal-2025";

export function verifyInternalRequest(req: NextRequest): boolean {
  // 1. Internal secret header (set by lib/api.ts)
  const secret = req.headers.get("x-internal-secret");
  if (secret === INTERNAL_SECRET) return true;

  // 2. Session cookie present (logged-in browser request)
  const cookie = req.headers.get("cookie") || "";
  if (cookie.includes("mock_auth=")) return true;

  // 3. Same-origin request (referer matches host)
  const referer = req.headers.get("referer") || "";
  const host = req.headers.get("host") || "";
  if (host && referer.includes(host)) return true;

  // 4. Next.js internal request (server components, RSC)
  const purpose = req.headers.get("rsc") || req.headers.get("next-router-prefetch");
  if (purpose) return true;

  // 5. Development — allow all localhost requests
  if (host.includes("localhost") || host.includes("127.0.0.1")) return true;

  return false;
}

export function requireAuth(req: NextRequest): NextResponse | null {
  if (!verifyInternalRequest(req)) return unauthorized();
  return null;
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function sanitizeSearch(input: string): string {
  return input
    .replace(/[%_\\]/g, "\\$&")
    .replace(/[<>"'`;]/g, "")
    .trim()
    .slice(0, 100);
}

export function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (typeof v === "string") clean[k] = v.replace(/[<>]/g, "").trim().slice(0, 1000);
    else clean[k] = v;
  }
  return clean;
}
