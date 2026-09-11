import { isPaidAiApiUrl } from "./paidAiRoutes.ts";

/**
 * Attach the persisted Supabase access token to paid AI fetches.
 * Works for the web app and the exe (same-origin Next server).
 */
export function installAiAuthFetch(
  getAccessToken: () => Promise<string | null>,
  fetchImpl: typeof fetch = globalThis.fetch.bind(globalThis),
): () => void {
  const wrapped: typeof fetch = async (input, init) => {
    if (!isPaidAiApiUrl(input)) return fetchImpl(input, init);
    const headers = new Headers(init?.headers);
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
