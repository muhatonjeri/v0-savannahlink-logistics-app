import { cookies } from "next/headers";

// Safe stub — MongoDB is primary DB now
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
  const { createServerClient } = require("@supabase/ssr");
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cs: {name:string;value:string;options:object}[]) {
        cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}
