"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { tryGetBrowserAuthClient } from "@/lib/auth/browserClient";
import {
  requestEmailOtp,
  verifyEmailOtp,
  type AuthOtpClient,
  type OtpRequestResult,
  type OtpVerifyResult,
} from "@/lib/auth/otp";
import {
  readPersistedSession,
  signOutSession,
  snapshotAuthSession,
  subscribeAuthSession,
  type AuthSession,
  type AuthSessionClient,
} from "@/lib/auth/session";

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

const UNAVAILABLE: OtpRequestResult = {
  ok: false,
  code: "auth_error",
  message: "Auth is not configured",
};

export function useAuthSessionController(injected?: AuthRuntimeClient | null): AuthSessionApi {
  const [client] = useState<AuthRuntimeClient | null>(
    () => (injected !== undefined ? injected : tryGetBrowserAuthClient()),
  );

  const [status, setStatus] = useState<AuthStatus>(client ? "loading" : "signedOut");
  const [session, setSession] = useState<AuthSession | null>(null);

  const apply = useCallback((next: AuthSession | null) => {
    setSession(next);
    setStatus(next ? "signedIn" : "signedOut");
  }, []);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    void readPersistedSession(client).then((next) => {
      if (!cancelled) apply(next);
    });
    const unsub = subscribeAuthSession(client, (next) => {
      if (!cancelled) apply(next);
    });
    return () => {
      cancelled = true;
      unsub();
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
      const result = await verifyEmailOtp(client, email, token);
      if (result.ok) apply(snapshotAuthSession(result.user, result.session));
      return result;
    },
    [apply, client],
  );

  const signOut = useCallback(async () => {
    if (client) await signOutSession(client);
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

export function AuthProvider({
  children,
  client,
}: {
  children: ReactNode;
  client?: AuthRuntimeClient | null;
}) {
  const value = useAuthSessionController(client);
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
