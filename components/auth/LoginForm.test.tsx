import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { requestEmailOtp, verifyEmailOtp } from "@/lib/auth/otp";
import { AuthProvider, type AuthRuntimeClient } from "@/lib/hooks/useAuthSession";
import LoginForm from "./LoginForm";

vi.mock("@/lib/auth/otp", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/otp")>();
  return {
    ...actual,
    requestEmailOtp: vi.fn(),
    verifyEmailOtp: vi.fn(),
  };
});

const requestEmailOtpMock = vi.mocked(requestEmailOtp);
const verifyEmailOtpMock = vi.mocked(verifyEmailOtp);

function mockClient(initial?: { id: string; email: string } | null): AuthRuntimeClient {
  let session = initial ? { user: initial } : null;
  const listeners = new Set<(event: string, session: typeof session) => void>();
  return {
    auth: {
      signInWithOtp: async () => ({ error: null }),
      verifyOtp: async () => ({
        data: { user: session?.user ?? null, session },
        error: null,
      }),
      getSession: async () => ({ data: { session }, error: null }),
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
}

function renderLogin(client: AuthRuntimeClient) {
  return render(
    <AuthProvider client={client}>
      <LoginForm />
    </AuthProvider>,
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    requestEmailOtpMock.mockReset();
    verifyEmailOtpMock.mockReset();
  });

  it("completes email → send code → sign in → sign out", async () => {
    const user = userEvent.setup();
    const client = mockClient(null);
    requestEmailOtpMock.mockResolvedValue({ ok: true, email: "ada@example.com" });
    verifyEmailOtpMock.mockResolvedValue({
      ok: true,
      email: "ada@example.com",
      user: { id: "u1", email: "ada@example.com" },
      session: { access_token: "t", user: { id: "u1", email: "ada@example.com" } },
    });

    renderLogin(client);

    await user.type(await screen.findByLabelText("邮箱"), "Ada@Example.com");
    await user.click(screen.getByRole("button", { name: "发送验证码" }));

    await waitFor(() => {
      expect(requestEmailOtpMock).toHaveBeenCalled();
    });
    expect(await screen.findByText(/验证码已发送到 ada@example.com/)).toBeInTheDocument();

    await user.type(screen.getByLabelText("验证码"), "123456");
    await user.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() => {
      expect(verifyEmailOtpMock).toHaveBeenCalled();
    });
    expect(await screen.findByText(/已登录/)).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "退出" }));
    expect(await screen.findByLabelText("邮箱")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "退出" })).not.toBeInTheDocument();
  });

  it("keeps the session after remount (refresh)", async () => {
    const client = mockClient({ id: "u1", email: "ada@example.com" });
    const first = renderLogin(client);
    expect(await screen.findByText(/已登录/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "退出" })).toBeInTheDocument();

    first.unmount();
    renderLogin(client);

    expect(await screen.findByText(/已登录/)).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "退出" })).toBeInTheDocument();
  });
});
