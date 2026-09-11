/**
 * Session helpers on top of the browser auth client.
 * Persistence itself is Supabase persistSession (see BROWSER_AUTH_OPTIONS).
 */

import { applySessionCookie } from "./sessionCookie.ts";

export const LOGIN_PATH = "/login";

export interface AuthSessionUser {
  id: string;
  email: string | null;
}

export interface AuthSession {
  user: AuthSessionUser;
}

export interface AuthSessionPayload {
  user?: { id?: string; email?: string | null } | null;
  access_token?: string;
}

export interface AuthSessionClient {
  auth: {
    getSession: () => Promise<{
      data: {
        session: AuthSessionPayload | null;
      };
      error: { message: string } | null;
    }>;
    onAuthStateChange: (
      callback: (event: string, session: AuthSessionPayload | null) => void,
    ) => { data: { subscription: { unsubscribe: () => void } } };
    signOut: () => Promise<{ error: { message: string } | null }>;
  };
}

function asUser(value: unknown): AuthSessionUser | null {
  if (!value || typeof value !== "object" || !("id" in value)) return null;
  const id = (value as { id: unknown }).id;
  if (typeof id !== "string" || !id) return null;
  const emailRaw = "email" in value ? (value as { email?: unknown }).email : null;
  return { id, email: typeof emailRaw === "string" && emailRaw ? emailRaw : null };
}

export function snapshotAuthSession(user: unknown, session: unknown): AuthSession | null {
  const fromUser = asUser(user);
  if (fromUser) return { user: fromUser };
  if (session && typeof session === "object" && "user" in session) {
    const fromSession = asUser((session as { user: unknown }).user);
    if (fromSession) return { user: fromSession };
  }
  return null;
}

/** Reads the persisted browser session (refresh / remount). */
export async function readPersistedSession(
  client: AuthSessionClient,
): Promise<AuthSession | null> {
  const { data } = await client.auth.getSession();
  applySessionCookie(data.session);
  return snapshotAuthSession(data.session?.user ?? null, data.session);
}

export function subscribeAuthSession(
  client: AuthSessionClient,
  onChange: (session: AuthSession | null) => void,
): () => void {
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    applySessionCookie(session);
    onChange(snapshotAuthSession(session?.user ?? null, session));
  });
  return () => data.subscription.unsubscribe();
}

export async function signOutSession(
  client: AuthSessionClient,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await client.auth.signOut();
  if (error) return { ok: false, message: error.message };
  applySessionCookie(null);
  return { ok: true };
}
