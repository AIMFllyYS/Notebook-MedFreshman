import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { defaultAuthProcessEnv, resolveServiceAuthEnv, type ServiceAuthEnv } from "./env.ts";

/**
 * Service-role client (Auth Admin + RLS bypass). Server / scripts only.
 * Never import this from a Client Component.
 */
export function createServiceAuthClient(
  env?: NodeJS.ProcessEnv | ServiceAuthEnv,
): SupabaseClient {
  const resolved =
    env && "serviceRoleKey" in env && "supabaseUrl" in env
      ? env
      : resolveServiceAuthEnv(env ?? defaultAuthProcessEnv());
  return createClient(resolved.supabaseUrl, resolved.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
