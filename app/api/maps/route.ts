// ── Google Maps / Geocoding API ────────────────────────────────────
// Location lookup for bookings — used in transfers, movers, cargo
// Docs: https://developers.google.com/maps/documentation/geocoding

import { NextRequest, NextResponse } from "next/server";

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    const lat     = searchParams.get("lat");
    const lng     = searchParams.get("lng");
    const type    = searchParams.get("type") || "geocode"; // geocode | reverse | places

    if (!MAPS_KEY) {
      return NextResponse.json({
        error: "Google Maps not configured",
        message: "Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to .env.local",
        mock: true,
        // Return Nairobi as default
        results: [{ formatted_address: "Nairobi, Kenya", geometry: { location: { lat: -1.2921, lng: 36.8219 } } }],
      }, { status: 503 });
    }

    let url = "";

    if (type === "reverse" && lat && lng) {
      url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAPS_KEY}`;
    } else if (type === "places" && address) {
      url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(address)}&components=country:ke&key=${MAPS_KEY}`;
    } else if (address) {
      url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=ke&key=${MAPS_KEY}`;
    } else {
      return NextResponse.json({ error: "address or lat/lng required" }, { status: 400 });
    }

    const res  = await fetch(url);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
