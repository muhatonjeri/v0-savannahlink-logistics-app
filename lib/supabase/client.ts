// Supabase client — kept for compatibility but MongoDB is primary DB
// Safe to call even without valid env vars
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
  const { createBrowserClient } = require("@supabase/ssr");
  return createBrowserClient(url, key);
}
