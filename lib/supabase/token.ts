import { createClient } from "@/lib/supabase/server";

/**
 * Auth header to forward to vault-core on mutations. Empty when Supabase isn't
 * configured (local dev). vault-core is the source of truth: it verifies the
 * token and 401s if it's missing/invalid when auth is enabled.
 */
export async function authHeader(): Promise<Record<string, string>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return {};
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}
