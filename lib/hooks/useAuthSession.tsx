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
import {
  requestPasswordReset,
  signInWithPasswordEmail,
  signUpWithPasswordEmail,
  updateAccountPassword,
  type AuthPasswordClient,
  type PasswordAuthResult,
  type PasswordMailResult,
} from "@/lib/auth/password";
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

export type AuthRuntimeClient = {
  auth: AuthOtpClient["auth"] & AuthSessionClient["auth"] & Partial<AuthPasswordClient["auth"]>;
};

export type AuthStatus = "loading" | "signedOut" | "signedIn";

export interface AuthSessionApi {
  status: AuthStatus;
  session: AuthSession | null;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  userId: string | null;
  needsNewPassword: boolean;
  requestOtp: (email: string, opts?: { shouldCreateUser?: boolean }) => Promise<OtpRequestResult>;
  verifyOtp: (email: string, token: string) => Promise<OtpVerifyResult>;
  signInWithPassword: (email: string, password: string) => Promise<PasswordAuthResult>;
  signUpWithPassword: (
    email: string,
    password: string,
    confirm: string,
  ) => Promise<PasswordAuthResult | PasswordMailResult>;
  requestPasswordReset: (email: string) => Promise<PasswordMailResult>;
  updatePassword: (password: string, confirm: string) => Promise<PasswordMailResult>;
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
  const [needsNewPassword, setNeedsNewPassword] = useState(false);
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
    const unsub = subscribeAuthSession(client, (next, event) => {
      if (!cancelled) {
        if (event === "PASSWORD_RECOVERY") setNeedsNewPassword(true);
        authRevision.current += 1;
        apply(next);
      }
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
    async (email: string, opts?: { shouldCreateUser?: boolean }): Promise<OtpRequestResult> => {
      if (!client) return UNAVAILABLE;
      return requestEmailOtp(client, email, opts);
    },
    [client],
  );

  const applyAuthOk = useCallback((result: PasswordAuthResult) => {
    if (result.ok && result.session) {
      authRevision.current += 1;
      applySessionCookie(result.session);
      apply(snapshotAuthSession(result.user, result.session));
    }
    return result;
  }, [apply]);

  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<PasswordAuthResult> => {
      if (!client?.auth.signInWithPassword) return { ...UNAVAILABLE };
      authRevision.current += 1;
      return applyAuthOk(await signInWithPasswordEmail(client as AuthPasswordClient, email, password));
    },
    [applyAuthOk, client],
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string, confirm: string): Promise<PasswordAuthResult | PasswordMailResult> => {
      if (!client?.auth.signUp) return { ...UNAVAILABLE };
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
      const result = await signUpWithPasswordEmail(client as AuthPasswordClient, email, password, confirm, redirectTo);
      if (result.ok && "session" in result) applyAuthOk(result);
      return result;
    },
    [applyAuthOk, client],
  );

  const requestReset = useCallback(
    async (email: string): Promise<PasswordMailResult> => {
      if (!client?.auth.resetPasswordForEmail) return { ...UNAVAILABLE };
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
      return requestPasswordReset(client as AuthPasswordClient, email, redirectTo);
    },
    [client],
  );

  const updatePassword = useCallback(
    async (password: string, confirm: string): Promise<PasswordMailResult> => {
      if (!client?.auth.updateUser) return { ...UNAVAILABLE };
      const result = await updateAccountPassword(client as AuthPasswordClient, password, confirm);
      if (result.ok) setNeedsNewPassword(false);
      return result;
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
    displayName: session?.user.displayName ?? null,
    avatarUrl: session?.user.avatarUrl ?? null,
    userId: session?.user.id ?? null,
    needsNewPassword,
    requestOtp,
    verifyOtp,
    signInWithPassword,
    signUpWithPassword,
    requestPasswordReset: requestReset,
    updatePassword,
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
  displayName: null,
  avatarUrl: null,
  userId: null,
  needsNewPassword: false,
  requestOtp: async () => UNAVAILABLE,
  verifyOtp: async () => ({ ...UNAVAILABLE }),
  signInWithPassword: async () => ({ ...UNAVAILABLE }),
  signUpWithPassword: async () => ({ ...UNAVAILABLE }),
  requestPasswordReset: async () => ({ ...UNAVAILABLE }),
  updatePassword: async () => ({ ...UNAVAILABLE }),
  signOut: async () => {},
};

export function useAuthSession(): AuthSessionApi {
  return useContext(AuthSessionContext) ?? FALLBACK;
}
