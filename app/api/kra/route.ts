// ── KRA iTax PIN Checker ───────────────────────────────────────────
// Auto-fills KRA PIN details when client enters their PIN
// Used in client registration and invoicing

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Mock response when KRA eTIMS not configured
  if (!process.env.ETIMS_API_KEY) {
    const pin = new URL(req.url).searchParams.get("pin") || "";
    return NextResponse.json({
      valid: /^[A-Za-z]\d{9}[A-Za-z]$/.test(pin),
      pin,
      name: pin ? "KRA PIN valid (mock — add ETIMS_API_KEY to verify live)" : "",
      mock: true,
    });
  }
  try {
    const pin = new URL(req.url).searchParams.get("pin");
    if (!pin) return NextResponse.json({ error: "pin required" }, { status: 400 });

    // Validate PIN format: A012345678A
    const pinRegex = /^[A-Z]\d{9}[A-Z]$/;
    if (!pinRegex.test(pin.toUpperCase())) {
      return NextResponse.json({ error: "Invalid KRA PIN format. Expected format: A012345678A" }, { status: 400 });
    }

    // Try KRA public portal (no auth required, HTML scraping)
    try {
      const res = await fetch(
        `https://itax.kra.go.ke/KRA-Portal/pinChecker.htm?PIN=${pin.toUpperCase()}`,
        { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(5000) }
      );
      const html = await res.text();

      // Extract name from HTML response
      const nameMatch = html.match(/Taxpayer Name[^:]*:\s*<[^>]+>([^<]+)/i)
        || html.match(/name['"]\s*[^>]*>([A-Z\s]+)</i);

      if (nameMatch?.[1]) {
        return NextResponse.json({
          success: true,
          pin: pin.toUpperCase(),
          name: nameMatch[1].trim(),
          source: "kra_portal",
        });
      }
    } catch { /* KRA portal unreachable, return validation only */ }

    // Return just validation if portal is unreachable
    return NextResponse.json({
      success: true,
      pin: pin.toUpperCase(),
      name: null,
      valid: true,
      message: "PIN format valid. KRA portal lookup unavailable — enter name manually.",
      source: "local_validation",
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
