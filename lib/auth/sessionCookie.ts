/** First-party cookie that mirrors the Supabase access token for the AI gate. */

export const AUTH_ACCESS_COOKIE = "srp-access-token";

const BEARER_RE = /^Bearer\s+(\S+)/i;

export function sessionAccessToken(session: unknown): string | null {
  if (!session || typeof session !== "object") return null;
  const token = (session as { access_token?: unknown }).access_token;
  return typeof token === "string" && token ? token : null;
}

export function serializeAccessTokenCookie(
  token: string,
  opts?: { maxAgeSec?: number; secure?: boolean },
): string {
  const maxAge = opts?.maxAgeSec ?? 3600;
  const parts = [
    `${AUTH_ACCESS_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (opts?.secure) parts.push("Secure");
  return parts.join("; ");
}

export function serializeClearedAccessTokenCookie(opts?: { secure?: boolean }): string {
  const parts = [
    `${AUTH_ACCESS_COOKIE}=`,
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (opts?.secure) parts.push("Secure");
  return parts.join("; ");
}

export function readAccessTokenFromCookieHeader(
  cookieHeader: string | null | undefined,
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const name = part.slice(0, idx).trim();
    if (name !== AUTH_ACCESS_COOKIE) continue;
    const raw = part.slice(idx + 1).trim();
    if (!raw) return null;
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

export function extractAccessToken(headers: { get(name: string): string | null }): string | null {
  const bearer = headers.get("authorization")?.match(BEARER_RE)?.[1];
  if (bearer) return bearer;
  return readAccessTokenFromCookieHeader(headers.get("cookie"));
}

export function applySessionCookie(session: unknown): void {
  if (typeof document === "undefined") return;
  const secure = typeof location !== "undefined" && location.protocol === "https:";
  const token = sessionAccessToken(session);
  document.cookie = token
    ? serializeAccessTokenCookie(token, { secure })
    : serializeClearedAccessTokenCookie({ secure });
}
