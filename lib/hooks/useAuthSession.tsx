"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { tryGetBrowserAuthClient } from "@/lib/auth/browserClient";
import {
  requestEmailOtp,
  verifyEmailOtp,
  type AuthOtpClient,
  type OtpRequestResult,
  type OtpVerifyResult,
} from "@/lib/auth/otp";
import { installAiAuthFetch } from "@/lib/auth/installAiAuthFetch";
import { applySessionCookie, sessionAccessToken } from "@/lib/auth/sessionCookie";
import {
  readPersistedSession,
  signOutSession,
  snapshotAuthSession,
  subscribeAuthSession,
  type AuthSession,
  type AuthSessionClient,
} from "@/lib/auth/session";
import { scheduleCloudPull, setCloudSyncEnabled } from "@/lib/sync/schedule";

export type AuthRuntimeClient = AuthOtpClient & AuthSessionClient;

export type AuthStatus = "loading" | "signedOut" | "signedIn";

export interface AuthSessionApi {
  status: AuthStatus;
  session: AuthSession | null;
  email: string | null;
  userId: string | null;
  requestOtp: (email: string) => Promise<OtpRequestResult>;
  verifyOtp: (email: string, token: string) => Promise<OtpVerifyResult>;
  signOut: () => Promise<void>;
}

const AuthSessionContext = createContext<AuthSessionApi | null>(null);

const UNAVAILABLE: Extract<OtpRequestResult, { ok: false }> = {
  ok: false,
  code: "auth_error",
  message: "登录未配置：浏览器读不到 Supabase 公钥。确认 .env.local 有 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 后重启 dev。",
};

export function useAuthSessionController(injected?: AuthRuntimeClient | null): AuthSessionApi {
  const [client] = useState<AuthRuntimeClient | null>(
    () => (injected !== undefined ? injected : tryGetBrowserAuthClient()),
  );

  const [status, setStatus] = useState<AuthStatus>(client ? "loading" : "signedOut");
  const [session, setSession] = useState<AuthSession | null>(null);
  const authRevision = useRef(0);

  const apply = useCallback((next: AuthSession | null) => {
    setSession(next);
    setStatus(next ? "signedIn" : "signedOut");
  }, []);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    let readSequence = 0;
    const restore = async () => {
      const revision = authRevision.current;
      const sequence = ++readSequence;
      const accept = () => !cancelled && authRevision.current === revision && readSequence === sequence;
      try {
        const next = await readPersistedSession(client, accept);
        if (accept()) { authRevision.current += 1; apply(next); }
      } catch {
        // A transient read error must not erase an already authenticated session or its cookie.
        if (accept()) setStatus((current) => current === 'loading' ? 'signedOut' : current);
      }
    };
    const unsub = subscribeAuthSession(client, (next) => {
      if (!cancelled) { authRevision.current += 1; apply(next); }
    }, (event) => event !== 'INITIAL_SESSION' || authRevision.current === 0);
    void restore();
    const onFocus = () => { if (document.visibilityState !== 'hidden') void restore(); };
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || /^sb-.*-auth-token$/.test(event.key)) void restore();
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      cancelled = true;
      unsub();
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [apply, client]);

  const requestOtp = useCallback(
    async (email: string): Promise<OtpRequestResult> => {
      if (!client) return UNAVAILABLE;
      return requestEmailOtp(client, email);
    },
    [client],
  );

  const verifyOtp = useCallback(
    async (email: string, token: string): Promise<OtpVerifyResult> => {
      if (!client) return { ...UNAVAILABLE };
      authRevision.current += 1;
      const result = await verifyEmailOtp(client, email, token);
      if (result.ok) {
        authRevision.current += 1;
        applySessionCookie(result.session);
        apply(snapshotAuthSession(result.user, result.session));
      }
      return result;
    },
    [apply, client],
  );

  const signOut = useCallback(async () => {
    authRevision.current += 1;
    if (client) {
      const result = await signOutSession(client);
      if (!result.ok) return;
    }
    apply(null);
  }, [apply, client]);

  return {
    status,
    session,
    email: session?.user.email ?? null,
    userId: session?.user.id ?? null,
    requestOtp,
    verifyOtp,
    signOut,
  };
}

function useInstallAiAuthFetch(authClient: AuthSessionClient | null) {
  useLayoutEffect(() => {
    if (!authClient) return;
    return installAiAuthFetch(async () => {
      const { data } = await authClient.auth.getSession();
      return sessionAccessToken(data.session);
    });
  }, [authClient]);
}

function useCloudSyncOnAuth(status: AuthStatus, userId: string | null) {
  useEffect(() => {
    if (status === "signedIn" && userId) {
      setCloudSyncEnabled(true);
      scheduleCloudPull();
      return;
    }
    setCloudSyncEnabled(false);
  }, [status, userId]);
}

export function AuthProvider({
  children,
  client,
}: {
  children: ReactNode;
  client?: AuthRuntimeClient | null;
}) {
  const value = useAuthSessionController(client);
  const fetchClient = client !== undefined ? client : tryGetBrowserAuthClient();
  useInstallAiAuthFetch(fetchClient);
  useCloudSyncOnAuth(value.status, value.userId);
  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

const FALLBACK: AuthSessionApi = {
  status: "signedOut",
  session: null,
  email: null,
  userId: null,
  requestOtp: async () => UNAVAILABLE,
  verifyOtp: async () => ({ ...UNAVAILABLE }),
  signOut: async () => {},
};

export function useAuthSession(): AuthSessionApi {
  return useContext(AuthSessionContext) ?? FALLBACK;
}
