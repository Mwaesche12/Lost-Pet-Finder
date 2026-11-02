import { createClient } from "@supabase/supabase-js";

// Server-side only. Uses the service-role key, which bypasses RLS.
// All tables have RLS enabled with no policies, so every access goes through our own API routes.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key, { auth: { persistSession: false } });
}
