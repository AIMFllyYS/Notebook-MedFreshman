import { isPaidAiApiPath, normalizeApiPathname } from "./paidAiRoutes.ts";

const ACCOUNT_PATHS = new Set(['/api/quota', '/api/usage', '/api/redeem', '/api/profile', '/api/pay/checkout', '/api/pay/status']);

/** Never attach our session token to third-party APIs, even when their path matches ours. */
export function isAuthenticatedAppUrl(input: RequestInfo | URL, origin: string): boolean {
  const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  try {
    const url = new URL(raw, origin);
    return url.origin === new URL(origin).origin
      && (isPaidAiApiPath(url.pathname) || ACCOUNT_PATHS.has(normalizeApiPathname(url.pathname)));
  } catch { return false; }
}

/**
 * Attach the current Supabase access token to first-party AI and account fetches.
 * Works for the web app and the exe (same-origin Next server).
 */
export function installAiAuthFetch(
  getAccessToken: () => Promise<string | null>,
  fetchImpl: typeof fetch = globalThis.fetch.bind(globalThis),
  origin = typeof location === 'undefined' ? 'http://local.invalid' : location.origin,
): () => void {
  const wrapped: typeof fetch = async (input, init) => {
    if (!isAuthenticatedAppUrl(input, origin)) return fetchImpl(input, init);
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(init?.headers).forEach((value, name) => headers.set(name, value));
    if (!headers.has("Authorization")) {
      const token = await getAccessToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }
    return fetchImpl(input, { ...init, headers });
  };
  globalThis.fetch = wrapped;
  return () => {
    if (globalThis.fetch === wrapped) globalThis.fetch = fetchImpl;
  };
}
