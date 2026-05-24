import { createClient } from "@supabase/supabase-js";

// ⚠️ This client uses the SERVICE ROLE KEY — bypasses RLS
// NEVER expose this to the browser or client-side code
// Only use in API routes (server-side only)
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !key) {
    throw new Error("Missing Supabase credentials. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
