"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { LogOut, X } from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import { isValidEmail } from "@/lib/auth/otp";
import { isValidPassword, type PasswordFailureCode } from "@/lib/auth/password";
import type { OtpFailureCode } from "@/lib/auth/otp";
import HumanChallengeDialog from "./HumanChallengeDialog";

const inputCls =
  "w-full rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] px-2.5 py-2 text-[13px] text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]";
const labelCls = "block text-[12px] font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1";

type AuthMode = "login" | "register" | "forgot";
type MailIntent = "otp-login" | "otp-register" | "reset";

function primaryBtnStyle(disabled: boolean): CSSProperties {
  return {
    background: "var(--md-sys-color-primary)",
    color: "var(--md-sys-color-on-primary)",
    border: "none",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.4 : 1,
  };
}

function authErrorMessage(code: OtpFailureCode | PasswordFailureCode, message: string): string {
  if (code === "invalid_email") return "请输入有效邮箱";
  if (code === "invalid_token") return "验证码无效或已过期";
  if (code === "invalid_password") return message || "密码不正确或太短";
  if (code === "mismatch") return "两次密码不一致";
  return message || "请求失败";
}

export default function LoginForm({ onClose }: { onClose?: () => void }) {
  const {
    status,
    email: sessionEmail,
    displayName,
    requestOtp,
    verifyOtp,
    signInWithPassword,
    signUpWithPassword,
    requestPasswordReset,
    updatePassword,
    signOut,
    needsNewPassword,
  } = useAuthSession();
  const [mode, setMode] = useState<AuthMode>("login");
  const [phase, setPhase] = useState<"form" | "code">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [token, setToken] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [mailIntent, setMailIntent] = useState<MailIntent | null>(null);

  const signedIn = status === "signedIn" && !needsNewPassword;
  const displayEmail = sessionEmail ?? email;
  if (needsNewPassword && (mode !== "login" || phase !== "form")) {
    setMode("login");
    setPhase("form");
  }

  async function sendMail(intent: MailIntent) {
    setError(null);
    setNotice(null);
    setPending(true);
    if (intent === "reset") {
      const result = await requestPasswordReset(email);
      setPending(false);
      if (!result.ok) {
        setError(authErrorMessage(result.code, result.message));
        return;
      }
      setNotice(`重置邮件已发送到 ${result.email}`);
      return;
    }
    const result = await requestOtp(email, { shouldCreateUser: intent === "otp-register" });
    setPending(false);
    if (!result.ok) {
      setError(authErrorMessage(result.code, result.message));
      return;
    }
    setEmail(result.email);
    setPhase("code");
    setNotice(null);
  }

  function askHumanThenMail(intent: MailIntent) {
    setError(null);
    if (!isValidEmail(email)) {
      setError("请输入有效邮箱");
      return;
    }
    if (intent === "otp-register") {
      if (!isValidPassword(password)) {
        setError("密码至少 6 位");
        return;
      }
      if (password !== confirm) {
        setError("两次密码不一致");
        return;
      }
    }
    setMailIntent(intent);
    setChallengeOpen(true);
  }

  async function handlePasswordLogin(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!password) {
      askHumanThenMail("otp-login");
      return;
    }
    setPending(true);
    const result = await signInWithPassword(email, password);
    setPending(false);
    if (!result.ok) setError(authErrorMessage(result.code, result.message));
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    askHumanThenMail("otp-register");
  }

  async function handleForgot(event: FormEvent) {
    event.preventDefault();
    askHumanThenMail("reset");
  }

  async function onChallengePassed() {
    const intent = mailIntent;
    setChallengeOpen(false);
    if (!intent) return;
    if (intent === "otp-register") {
      setPending(true);
      const signed = await signUpWithPassword(email, password, confirm);
      if (!signed.ok) {
        setPending(false);
        setError(authErrorMessage(signed.code, signed.message));
        return;
      }
      setPending(false);
      if ("session" in signed && signed.session) return;
      await sendMail("otp-register");
      return;
    }
    await sendMail(intent);
  }

  async function handleVerify(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await verifyOtp(email, token);
    setPending(false);
    if (!result.ok) setError(authErrorMessage(result.code, result.message));
  }

  async function handleUpdatePassword(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await updatePassword(password, confirm);
    setPending(false);
    if (!result.ok) setError(authErrorMessage(result.code, result.message));
    else setNotice("密码已更新");
  }

  async function handleSignOut() {
    setError(null);
    setPending(true);
    await signOut();
    setPending(false);
    setToken("");
    setPassword("");
    setConfirm("");
    setPhase("form");
    setMode("login");
  }

  return (
    <div className="login-form-body" data-testid="login-form">
      <div className="flex items-start justify-between gap-3 px-6 pt-6">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={28} />
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--md-sys-color-primary)]">STUDYSOLO</p>
            <h1 className="text-[20px] font-bold leading-tight text-[var(--md-sys-color-on-surface)]">StudySolo</h1>
          </div>
        </div>
        {onClose && (
          <button type="button" aria-label="关闭登录" onClick={onClose} className="rounded-lg p-1 text-[var(--md-sys-color-on-surface-variant)]">
            <X size={18} />
          </button>
        )}
      </div>
      <p className="px-6 pt-3 text-[13px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
        一人一室，把课堂变成自己的复习工作站。笔记、对话、动画和测验都在这里。
      </p>

      <div className="flex flex-col gap-3 px-6 py-5">
        {status === "loading" && (
          <p className="text-[12.5px] text-[var(--md-sys-color-on-surface-variant)]">正在恢复会话…</p>
        )}

        {signedIn && (
          <>
            <p className="text-[13px] text-[var(--md-sys-color-on-surface)]">
              已登录 <span className="font-semibold">{displayName || displayEmail || "当前账号"}</span>
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

        {needsNewPassword && (
          <form onSubmit={(event) => void handleUpdatePassword(event)} className="flex flex-col gap-3">
            <p className="text-[13px] font-semibold">设置新密码</p>
            <label>
              <span className={labelCls}>新密码</span>
              <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} required />
            </label>
            <label>
              <span className={labelCls}>确认密码</span>
              <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} required />
            </label>
            <button type="submit" disabled={pending} className="press rounded-full px-3 py-1.5 text-[12.5px] font-semibold" style={primaryBtnStyle(pending)}>
              {pending ? "保存中…" : "保存新密码"}
            </button>
          </form>
        )}

        {!signedIn && status !== "loading" && !needsNewPassword && phase === "form" && (
          <>
            {mode !== "forgot" && (
              <div className="flex gap-1" role="tablist" aria-label="登录或注册">
                {(["login", "register"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={mode === item}
                    className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
                    style={{
                      background: mode === item ? "var(--md-sys-color-primary)" : "var(--md-sys-color-surface-container)",
                      color: mode === item ? "var(--md-sys-color-on-primary)" : "var(--md-sys-color-on-surface-variant)",
                    }}
                    onClick={() => {
                      setMode(item);
                      setError(null);
                      setNotice(null);
                    }}
                  >
                    {item === "login" ? "登录" : "注册"}
                  </button>
                ))}
              </div>
            )}

            {mode === "login" && (
              <form onSubmit={(event) => void handlePasswordLogin(event)} className="flex flex-col gap-3">
                <label>
                  <span className={labelCls}>邮箱</span>
                  <input type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" required />
                </label>
                <label>
                  <span className={labelCls}>密码（可留空，改用验证码）</span>
                  <input type="password" name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
                </label>
                <button type="submit" disabled={pending} className="press rounded-full px-3 py-1.5 text-[12.5px] font-semibold" style={primaryBtnStyle(pending)}>
                  {pending ? "登录中…" : password ? "登录" : "发送验证码"}
                </button>
                <button type="button" className="text-left text-[12px] font-medium text-[var(--md-sys-color-primary)]" onClick={() => { setMode("forgot"); setError(null); setNotice(null); }}>
                  忘记密码
                </button>
              </form>
            )}

            {mode === "register" && (
              <form onSubmit={(event) => void handleRegister(event)} className="flex flex-col gap-3">
                <label>
                  <span className={labelCls}>邮箱</span>
                  <input type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} required />
                </label>
                <label>
                  <span className={labelCls}>密码</span>
                  <input type="password" name="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} required />
                </label>
                <label>
                  <span className={labelCls}>确认密码</span>
                  <input type="password" name="confirm" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} required />
                </label>
                <button type="submit" disabled={pending} className="press rounded-full px-3 py-1.5 text-[12.5px] font-semibold" style={primaryBtnStyle(pending)}>
                  {pending ? "提交中…" : "注册并发送验证码"}
                </button>
              </form>
            )}

            {mode === "forgot" && (
              <form onSubmit={(event) => void handleForgot(event)} className="flex flex-col gap-3">
                <p className="text-[13px] font-semibold">重置密码</p>
                <label>
                  <span className={labelCls}>邮箱</span>
                  <input type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} required />
                </label>
                <button type="submit" disabled={pending} className="press rounded-full px-3 py-1.5 text-[12.5px] font-semibold" style={primaryBtnStyle(pending)}>
                  {pending ? "发送中…" : "发送重置邮件"}
                </button>
                <button type="button" className="text-left text-[12px] font-medium text-[var(--md-sys-color-primary)]" onClick={() => setMode("login")}>
                  返回登录
                </button>
              </form>
            )}
          </>
        )}

        {!signedIn && status !== "loading" && !needsNewPassword && phase === "code" && (
          <form onSubmit={(event) => void handleVerify(event)} className="flex flex-col gap-3">
            <p className="text-[12.5px] text-[var(--md-sys-color-on-surface-variant)]">
              验证码已发送到 {email}
            </p>
            <label>
              <span className={labelCls}>验证码</span>
              <input type="text" name="otp" inputMode="numeric" autoComplete="one-time-code" value={token} onChange={(e) => setToken(e.target.value)} className={inputCls} placeholder="6 位验证码" required />
            </label>
            <button type="submit" disabled={pending} className="press rounded-full px-3 py-1.5 text-[12.5px] font-semibold" style={primaryBtnStyle(pending)}>
              {pending ? "登录中…" : "登录"}
            </button>
            <button
              type="button"
              className="text-left text-[12px] font-medium text-[var(--md-sys-color-primary)]"
              onClick={() => {
                setPhase("form");
                setToken("");
                setError(null);
              }}
            >
              返回修改邮箱
            </button>
          </form>
        )}

        {notice && <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">{notice}</p>}
        {error && (
          <p role="alert" className="text-[12px] font-medium text-[var(--md-sys-color-error)]">
            {error}
          </p>
        )}
      </div>

      <HumanChallengeDialog
        open={challengeOpen}
        onClose={() => setChallengeOpen(false)}
        onPassed={() => void onChallengePassed()}
      />
    </div>
  );
}
