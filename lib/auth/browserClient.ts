import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { resolvePublicAuthEnv, type PublicAuthEnv } from "./env.ts";

/** Browser / anon client. Do not pass the service role key here. */
export function createBrowserAuthClient(
  env: NodeJS.ProcessEnv | PublicAuthEnv = process.env,
): SupabaseClient {
  const resolved =
    "anonKey" in env && "supabaseUrl" in env
      ? env
      : resolvePublicAuthEnv(env as NodeJS.ProcessEnv);
  return createClient(resolved.supabaseUrl, resolved.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
