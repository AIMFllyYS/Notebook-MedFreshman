import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { defaultAuthProcessEnv, resolvePublicAuthEnv, type PublicAuthEnv } from "./env.ts";

/** Browser / anon client. Do not pass the service role key here. */
export const BROWSER_AUTH_OPTIONS = {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
} as const;

let browserClientSingleton: SupabaseClient | undefined;

function resolveBrowserEnv(env?: NodeJS.ProcessEnv | PublicAuthEnv): PublicAuthEnv {
  if (env && "anonKey" in env && "supabaseUrl" in env) return env;
  return resolvePublicAuthEnv(env ?? defaultAuthProcessEnv());
}

/** Browser / anon client. Do not pass the service role key here. */
export function createBrowserAuthClient(
  env?: NodeJS.ProcessEnv | PublicAuthEnv,
): SupabaseClient {
  const resolved = resolveBrowserEnv(env);
  return createClient(resolved.supabaseUrl, resolved.anonKey, {
    auth: { ...BROWSER_AUTH_OPTIONS },
  });
}

/** Shared browser client so persistSession / onAuthStateChange stay on one instance. */
export function getBrowserAuthClient(
  env?: NodeJS.ProcessEnv | PublicAuthEnv,
): SupabaseClient {
  if (!browserClientSingleton) {
    browserClientSingleton = createBrowserAuthClient(env);
  }
  return browserClientSingleton;
}

export function tryGetBrowserAuthClient(
  env?: NodeJS.ProcessEnv | PublicAuthEnv,
): SupabaseClient | null {
  try {
    return getBrowserAuthClient(env);
  } catch {
    return null;
  }
}

export function resetBrowserAuthClient(): void {
  browserClientSingleton = undefined;
}
