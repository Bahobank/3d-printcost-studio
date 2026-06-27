import { createClient } from "@supabase/supabase-js";
import { requireSupabaseConfig } from "@/lib/auth-config";

export function createAdminClient() {
  const { url } = requireSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for server-side Supabase admin client");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}