import { NextResponse } from "next/server";

export async function GET() {
  const uri = process.env.MONGODB_URI;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  return NextResponse.json({
    mongodb_uri_set: !!uri,
    mongodb_uri_prefix: uri ? uri.substring(0, 30) + "..." : "NOT SET",
    supabase_url_set: !!url,
    node_env: process.env.NODE_ENV,
  });
}
