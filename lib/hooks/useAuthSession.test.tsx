import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useAuthSessionController, type AuthRuntimeClient } from "./useAuthSession";

function mockClient(initial?: { id: string; email: string } | null): AuthRuntimeClient & {
  getSessionCalls: number;
} {
  let session = initial ? { user: initial } : null;
  const listeners = new Set<(event: string, session: typeof session) => void>();
  const client: AuthRuntimeClient & { getSessionCalls: number } = {
    getSessionCalls: 0,
    auth: {
      signInWithOtp: async () => ({ error: null }),
      verifyOtp: async () => ({
        data: { user: session?.user ?? null, session },
        error: null,
      }),
      getSession: async () => {
        client.getSessionCalls += 1;
        return { data: { session }, error: null };
      },
      onAuthStateChange: (cb) => {
        listeners.add(cb);
        return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
      },
      signOut: async () => {
        session = null;
        listeners.forEach((cb) => cb("SIGNED_OUT", null));
        return { error: null };
      },
    },
  };
  return client;
}

describe("useAuthSessionController", () => {
  it("restores a persisted session on mount and after remount", async () => {
    const client = mockClient({ id: "u1", email: "ada@example.com" });
    const first = renderHook(() => useAuthSessionController(client));

    await waitFor(() => {
      expect(first.result.current.status).toBe("signedIn");
    });
    expect(first.result.current.email).toBe("ada@example.com");
    expect(client.getSessionCalls).toBe(1);

    first.unmount();
    const second = renderHook(() => useAuthSessionController(client));
    await waitFor(() => {
      expect(second.result.current.status).toBe("signedIn");
    });
    expect(second.result.current.email).toBe("ada@example.com");
    expect(client.getSessionCalls).toBe(2);
  });

  it("clears session on signOut", async () => {
    const client = mockClient({ id: "u1", email: "ada@example.com" });
    const { result } = renderHook(() => useAuthSessionController(client));
    await waitFor(() => {
      expect(result.current.status).toBe("signedIn");
    });

    await act(async () => {
      await result.current.signOut();
    });
    expect(result.current.status).toBe("signedOut");
    expect(result.current.email).toBeNull();
  });
});
