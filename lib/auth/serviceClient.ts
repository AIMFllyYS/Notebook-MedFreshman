import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { resolveServiceAuthEnv, type ServiceAuthEnv } from "./env.ts";

/**
 * Service-role client (Auth Admin + RLS bypass). Server / scripts only.
 * Never import this from a Client Component.
 */
export function createServiceAuthClient(
  env: NodeJS.ProcessEnv | ServiceAuthEnv = process.env,
): SupabaseClient {
  const resolved =
    "serviceRoleKey" in env && "supabaseUrl" in env
      ? env
      : resolveServiceAuthEnv(env as NodeJS.ProcessEnv);
  return createClient(resolved.supabaseUrl, resolved.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
