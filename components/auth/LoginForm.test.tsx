import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { requestEmailOtp, verifyEmailOtp } from "@/lib/auth/otp";
import { requestPasswordReset, signInWithPasswordEmail } from "@/lib/auth/password";
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

vi.mock("@/lib/auth/password", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/password")>();
  return {
    ...actual,
    requestPasswordReset: vi.fn(),
    signInWithPasswordEmail: vi.fn(),
    signUpWithPasswordEmail: vi.fn(),
    updateAccountPassword: vi.fn(),
  };
});

const requestEmailOtpMock = vi.mocked(requestEmailOtp);
const verifyEmailOtpMock = vi.mocked(verifyEmailOtp);
const requestPasswordResetMock = vi.mocked(requestPasswordReset);
const signInWithPasswordEmailMock = vi.mocked(signInWithPasswordEmail);

function mockClient(initial?: { id: string; email: string } | null): AuthRuntimeClient {
  let session = initial ? { user: initial } : null;
  const listeners = new Set<(event: string, session: import("@/lib/auth/session").AuthSessionPayload | null) => void>();
  return {
    auth: {
      signInWithOtp: async () => ({ error: null }),
      verifyOtp: async () => ({
        data: { user: session?.user ?? null, session },
        error: null,
      }),
      signInWithPassword: async () => ({ data: { user: session?.user ?? null, session }, error: null }),
      signUp: async () => ({ data: { user: null, session: null }, error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({ data: { user: session?.user ?? null }, error: null }),
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

async function passScienceChallenge(user: ReturnType<typeof userEvent.setup>) {
  expect(await screen.findByRole("dialog", { name: "人机验证" })).toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "理科" }));
  await user.click(screen.getByLabelText("y = x² + 1"));
  await user.click(screen.getByRole("button", { name: "提交" }));
}

describe("LoginForm", () => {
  beforeEach(() => {
    requestEmailOtpMock.mockReset();
    verifyEmailOtpMock.mockReset();
    requestPasswordResetMock.mockReset();
    signInWithPasswordEmailMock.mockReset();
  });

  it("shows StudySolo and does not send mail before the challenge", async () => {
    const user = userEvent.setup();
    renderLogin(mockClient(null));
    expect(screen.getByRole("heading", { name: "StudySolo" })).toBeInTheDocument();
    expect(screen.getByText(/一人一室/)).toBeInTheDocument();
    await user.type(await screen.findByLabelText("邮箱"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "发送验证码" }));
    expect(await screen.findByRole("dialog", { name: "人机验证" })).toBeInTheDocument();
    expect(requestEmailOtpMock).not.toHaveBeenCalled();
  });

  it("completes email → captcha → send code → sign in → sign out", async () => {
    const user = userEvent.setup();
    requestEmailOtpMock.mockResolvedValue({ ok: true, email: "ada@example.com" });
    verifyEmailOtpMock.mockResolvedValue({
      ok: true,
      email: "ada@example.com",
      user: { id: "u1", email: "ada@example.com" },
      session: { access_token: "t", user: { id: "u1", email: "ada@example.com" } },
    });

    renderLogin(mockClient(null));

    await user.type(await screen.findByLabelText("邮箱"), "Ada@Example.com");
    await user.click(screen.getByRole("button", { name: "发送验证码" }));
    await passScienceChallenge(user);

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

  it("logs in with password without opening the challenge", async () => {
    const user = userEvent.setup();
    signInWithPasswordEmailMock.mockResolvedValue({
      ok: true,
      email: "ada@example.com",
      user: { id: "u1", email: "ada@example.com" },
      session: { access_token: "t", user: { id: "u1", email: "ada@example.com" } },
    });
    renderLogin(mockClient(null));
    await user.type(await screen.findByLabelText("邮箱"), "ada@example.com");
    await user.type(screen.getByLabelText(/密码/), "secret1");
    await user.click(screen.getByRole("button", { name: "登录" }));
    await waitFor(() => expect(signInWithPasswordEmailMock).toHaveBeenCalled());
    expect(screen.queryByRole("dialog", { name: "人机验证" })).not.toBeInTheDocument();
    expect(requestEmailOtpMock).not.toHaveBeenCalled();
  });

  it("sends a reset mail only after the challenge", async () => {
    const user = userEvent.setup();
    requestPasswordResetMock.mockResolvedValue({ ok: true, email: "ada@example.com" });
    renderLogin(mockClient(null));
    await user.click(await screen.findByRole("button", { name: "忘记密码" }));
    await user.type(await screen.findByLabelText("邮箱"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "发送重置邮件" }));
    expect(requestPasswordResetMock).not.toHaveBeenCalled();
    await passScienceChallenge(user);
    await waitFor(() => expect(requestPasswordResetMock).toHaveBeenCalled());
    expect(await screen.findByText(/重置邮件已发送到 ada@example.com/)).toBeInTheDocument();
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
