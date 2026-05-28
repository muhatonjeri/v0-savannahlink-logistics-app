import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ⚠️  SERVICE ROLE KEY — bypasses RLS. Server-side API routes ONLY.

// Null-safe client: returns a no-op proxy when Supabase is not configured.
// Every method resolves to { data: null, error: { message: "Supabase not configured" } }
// so API routes degrade gracefully in dev instead of crashing.
function buildNullClient(): SupabaseClient {
  const noop: Record<string, unknown> = {};
  const handler: ProxyHandler<typeof noop> = {
    get(_t, prop) {
      if (prop === "then") return undefined; // not a Promise itself
      if (prop === "auth") return new Proxy(noop, handler);
      // Every chained call returns a new proxy that eventually resolves
      return (..._args: unknown[]) => {
        const result = new Proxy(noop, handler) as unknown as Promise<{ data: null; error: { message: string } }>;
        // Make the proxy thenable so `await query` works
        (result as unknown as Record<string, unknown>).then = (resolve: (v: { data: null; error: { message: string } }) => void) =>
          Promise.resolve({ data: null, error: { message: "Supabase not configured — add credentials to .env.local" } }).then(resolve);
        (result as unknown as Record<string, unknown>).catch = (reject: (e: unknown) => void) =>
          Promise.resolve({ data: null, error: { message: "Supabase not configured" } }).catch(reject);
        return result;
      };
    },
  };
  return new Proxy(noop, handler) as unknown as SupabaseClient;
}

export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || url.includes("placeholder") || key.includes("placeholder")) {
    return buildNullClient();
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !!(url && key && !url.includes("placeholder") && !key.includes("placeholder"));
}
