"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { LogOut } from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import type { OtpFailureCode } from "@/lib/auth/otp";

const inputCls =
  "w-full rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] px-2.5 py-2 text-[13px] text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]";
const labelCls = "block text-[12px] font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1";

function primaryBtnStyle(disabled: boolean): CSSProperties {
  return {
    background: "var(--md-sys-color-primary)",
    color: "var(--md-sys-color-on-primary)",
    border: "none",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.4 : 1,
  };
}

function otpErrorMessage(code: OtpFailureCode, message: string): string {
  if (code === "invalid_email") return "请输入有效邮箱";
  if (code === "invalid_token") return "验证码无效或已过期";
  return message || "请求失败";
}

export default function LoginForm() {
  const { status, email: sessionEmail, requestOtp, verifyOtp, signOut } = useAuthSession();
  const [phase, setPhase] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signedIn = status === "signedIn";
  const displayEmail = sessionEmail ?? email;

  async function handleSendCode(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await requestOtp(email);
    setPending(false);
    if (!result.ok) {
      setError(otpErrorMessage(result.code, result.message));
      return;
    }
    setEmail(result.email);
    setPhase("code");
  }

  async function handleVerify(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await verifyOtp(email, token);
    setPending(false);
    if (!result.ok) {
      setError(otpErrorMessage(result.code, result.message));
    }
  }

  async function handleSignOut() {
    setError(null);
    setPending(true);
    await signOut();
    setPending(false);
    setToken("");
    setPhase("email");
  }

  return (
    <div className="flex h-full min-h-[360px] items-center justify-center bg-[var(--bg-app)] p-6">
      <div
        className="w-full max-w-[400px] overflow-hidden rounded-[var(--md-sys-shape-corner-extra-large,28px)]"
        style={{
          background: "var(--md-sys-color-surface-container-low)",
          border: "1px solid var(--md-sys-color-outline-variant)",
          boxShadow: "var(--md-sys-elevation-level3, 0 8px 24px rgba(0,0,0,0.32))",
        }}
      >
        <div
          className="flex items-center gap-2 px-5 py-3.5"
          style={{
            borderBottom: "1px solid var(--md-sys-color-outline-variant)",
            background: "var(--md-sys-color-surface-container)",
          }}
        >
          <BrandLogo size={22} />
          <h1 className="text-[14px] font-bold text-[var(--md-sys-color-on-surface)]">登录</h1>
        </div>

        <div className="flex flex-col gap-3 p-4">
          {status === "loading" && (
            <p className="text-[12.5px] text-[var(--md-sys-color-on-surface-variant)]">正在恢复会话…</p>
          )}

          {signedIn && (
            <>
              <p className="text-[13px] text-[var(--md-sys-color-on-surface)]">
                已登录 <span className="font-semibold">{displayEmail || "当前账号"}</span>
              </p>
              <button
                type="button"
                aria-label="退出"
                disabled={pending}
                onClick={() => void handleSignOut()}
                className="press flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
                style={primaryBtnStyle(pending)}
              >
                <LogOut size={14} />
                退出
              </button>
            </>
          )}

          {!signedIn && status !== "loading" && phase === "email" && (
            <form onSubmit={(e) => void handleSendCode(e)} className="flex flex-col gap-3">
              <label>
                <span className={labelCls}>邮箱</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="you@example.com"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={pending}
                className="press rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
                style={primaryBtnStyle(pending)}
              >
                {pending ? "发送中…" : "发送验证码"}
              </button>
            </form>
          )}

          {!signedIn && status !== "loading" && phase === "code" && (
            <form onSubmit={(e) => void handleVerify(e)} className="flex flex-col gap-3">
              <p className="text-[12.5px] text-[var(--md-sys-color-on-surface-variant)]">
                验证码已发送到 {email}
              </p>
              <label>
                <span className={labelCls}>验证码</span>
                <input
                  type="text"
                  name="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className={inputCls}
                  placeholder="6 位验证码"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={pending}
                className="press rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
                style={primaryBtnStyle(pending)}
              >
                {pending ? "登录中…" : "登录"}
              </button>
              <button
                type="button"
                className="text-left text-[12px] font-medium text-[var(--md-sys-color-primary)]"
                onClick={() => {
                  setPhase("email");
                  setToken("");
                  setError(null);
                }}
              >
                返回修改邮箱
              </button>
            </form>
          )}

          {error && (
            <p role="alert" className="text-[12px] font-medium text-[var(--md-sys-color-error)]">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
