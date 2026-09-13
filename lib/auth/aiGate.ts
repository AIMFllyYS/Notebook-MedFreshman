import { createClient } from "@supabase/supabase-js";
import { resolvePublicAuthEnv } from "./env.ts";
import { isPaidAiApiPath } from "./paidAiRoutes.ts";
import { consumeRateLimit, type RateLimitConsumeOptions } from "./rateLimit.ts";
import { extractAccessToken } from "./sessionCookie.ts";

export { extractAccessToken } from "./sessionCookie.ts";
export {
  isPaidAiApiPath,
  isPaidAiApiUrl,
  PAID_AI_API_PATHS,
} from "./paidAiRoutes.ts";

export const AI_GATE_UNAUTHORIZED = { error: "Unauthorized" } as const;
export const AI_GATE_RATE_LIMITED = { error: "Too many requests" } as const;

export interface GateUser {
  id: string;
}

export type VerifyAccessToken = (token: string) => Promise<GateUser | null>;

export interface AiGateRequest {
  pathname: string;
  method: string;
  headers: { get(name: string): string | null };
}

export interface AiGateDeps extends RateLimitConsumeOptions {
  verifyAccessToken?: VerifyAccessToken;
  consume?: typeof consumeRateLimit;
}

export type AiGateDecision =
  | { action: "next" }
  | {
      action: "reject";
      status: 401 | 429;
      body: { error: string };
      headers?: Record<string, string>;
    };

export async function verifySupabaseAccessToken(token: string): Promise<GateUser | null> {
  if (!token) return null;
  try {
    const env = resolvePublicAuthEnv();
    const client = createClient(env.supabaseUrl, env.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await client.auth.getUser(token);
    const id = data.user?.id;
    if (error || typeof id !== "string" || !id) return null;
    return { id };
  } catch {
    return null;
  }
}

/**
 * Login gate for paid AI routes. No Electron / BYOK bypass — desktop and
 * bring-your-own-key users still need a Supabase session.
 */
export async function decideAiGate(
  request: AiGateRequest,
  deps: AiGateDeps = {},
): Promise<AiGateDecision> {
  if (!isPaidAiApiPath(request.pathname)) return { action: "next" };
  if (request.method.toUpperCase() === "OPTIONS") return { action: "next" };

  const token = extractAccessToken(request.headers);
  if (!token) {
    return { action: "reject", status: 401, body: { ...AI_GATE_UNAUTHORIZED } };
  }

  const verify = deps.verifyAccessToken ?? verifySupabaseAccessToken;
  let user: GateUser | null = null;
  try {
    user = await verify(token);
  } catch {
    user = null;
  }
  if (!user) {
    return { action: "reject", status: 401, body: { ...AI_GATE_UNAUTHORIZED } };
  }

  const consume = deps.consume ?? consumeRateLimit;
  const hit = consume(`user:${user.id}`, {
    now: deps.now,
    max: deps.max,
    windowMs: deps.windowMs,
  });
  if (!hit.ok) {
    return {
      action: "reject",
      status: 429,
      body: { ...AI_GATE_RATE_LIMITED },
      headers: { "Retry-After": String(hit.retryAfterSec) },
    };
  }
  return { action: "next" };
}
