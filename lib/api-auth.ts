// API route authentication helper
// All internal API routes must call this to verify the request comes from our app

import { NextRequest, NextResponse } from "next/server";

const INTERNAL_SECRET = process.env.API_INTERNAL_SECRET || "moventra-internal-2025";

export function verifyInternalRequest(req: NextRequest): boolean {
  // Check for the internal secret header (set by our frontend)
  const secret = req.headers.get("x-internal-secret");
  if (secret === INTERNAL_SECRET) return true;

  // Check for session cookie (admin logged in)
  const cookie = req.headers.get("cookie") || "";
  if (cookie.includes("mock_auth=")) return true;

  // Check referer is from same origin
  const referer = req.headers.get("referer") || "";
  const host = req.headers.get("host") || "";
  if (referer.includes(host)) return true;

  return false;
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

// Sanitize search strings to prevent injection
export function sanitizeSearch(input: string): string {
  return input
    .replace(/[%_\\]/g, "\\$&")  // escape LIKE special chars
    .replace(/[<>"'`;]/g, "")     // remove dangerous chars
    .trim()
    .slice(0, 100);               // max 100 chars
}
