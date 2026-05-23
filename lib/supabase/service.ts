import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-side client using service role key — bypasses RLS
// Only use in API routes, never expose to browser
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
