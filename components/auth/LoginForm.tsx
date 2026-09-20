"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, Eye, EyeOff, Info, LogOut } from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import { isValidEmail } from "@/lib/auth/otp";
import { isValidPassword, type PasswordFailureCode } from "@/lib/auth/password";
import type { OtpFailureCode } from "@/lib/auth/otp";
import HumanChallengeDialog from "./HumanChallengeDialog";
import OtpInput from "./OtpInput";

type AuthMode = "login" | "register" | "forgot";
type MailIntent = "otp-login" | "otp-register" | "reset";

function authErrorMessage(code: OtpFailureCode | PasswordFailureCode, message: string): string {
  if (code === "invalid_email") return "请输入有效邮箱";
  if (code === "invalid_token") return "验证码无效或已过期";
  if (code === "invalid_password") return message || "密码不正确或太短";
  if (code === "mismatch") return "两次密码不一致";
  return message || "请求失败";
}

/** macOS 分段控件（滑动 thumb）：登录/注册切换。契约：role=tablist/tab + aria-selected。 */
function ModeSegment({
  mode,
  onSelect,
}: {
  mode: "login" | "register";
  onSelect: (next: "login" | "register") => void;
}) {
  const items = [
    { id: "login" as const, label: "登录" },
    { id: "register" as const, label: "注册" },
  ];
  const activeIndex = items.findIndex((item) => item.id === mode);
  return (
    <div className="auth-seg" role="tablist" aria-label="登录或注册">
      <span
        className="auth-seg-thumb"
        style={{ width: "calc(50% - 3px)", left: `calc(3px + ${activeIndex} * (50% - 3px))` }}
        aria-hidden="true"
      />
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={mode === item.id}
          className="auth-seg-item"
          style={{ width: "calc(50% - 3px)" }}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function PasswordField({
  label,
  autoComplete,
  value,
  onChange,
  required,
}: {
  label: string;
  autoComplete: string;
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="block">
      <span className="auth-label">{label}</span>
      <span className="relative block">
        <input
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="auth-input pr-10"
          required={required}
        />
        <button
          type="button"
          aria-label={visible ? "隐藏" : "显示"}
          onClick={() => setVisible((current) => !current)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </span>
    </label>
  );
}

export default function LoginForm() {
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
      <h1 className="sr-only">StudySolo</h1>
      <p className="px-6 pt-4 text-[12.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
        一人一室，把课堂变成自己的复习工作站。笔记、对话、动画和测验都在这里。
      </p>
      <div className="auth-body auth-stagger">
        {status === "loading" && (
          <p className="px-6 pt-5 text-[12.5px] text-[var(--md-sys-color-on-surface-variant)]">正在恢复会话…</p>
        )}

        {signedIn && (
          <div className="flex flex-col gap-3 px-6 py-5">
            <div className="flex items-center gap-3">
              <BrandLogo size={30} />
              <p className="text-[13px] text-[var(--md-sys-color-on-surface)]">
                已登录 <span className="font-semibold">{displayName || displayEmail || "当前账号"}</span>
              </p>
            </div>
            <button
              type="button"
              aria-label="退出"
              disabled={pending}
              onClick={() => void handleSignOut()}
              className="auth-cta"
            >
              <LogOut size={14} />
              {pending ? "退出中…" : "退出"}
            </button>
          </div>
        )}

        {needsNewPassword && (
          <form onSubmit={(event) => void handleUpdatePassword(event)} className="flex flex-col gap-3 px-6 py-5">
            <h2 className="m-0 text-[16px] font-bold">设置新密码</h2>
            <label className="block">
              <span className="auth-label">新密码</span>
              <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" required />
            </label>
            <PasswordField label="确认密码" autoComplete="new-password" value={confirm} onChange={setConfirm} required />
            <button type="submit" disabled={pending} className="auth-cta">
              {pending ? "保存中…" : "保存新密码"}
            </button>
          </form>
        )}

        {!signedIn && status !== "loading" && !needsNewPassword && phase === "form" && (
          <>
            {mode !== "forgot" && (
              <div className="px-6 pt-5">
                <h2 className="m-0 text-[18px] font-bold text-[var(--md-sys-color-on-surface)]">
                  {mode === "login" ? "欢迎回来" : "创建你的工作室"}
                </h2>
                <p className="m-0 mt-1 text-[11px] font-semibold tracking-[0.18em] text-[var(--md-sys-color-primary)]">STUDYSOLO</p>
              </div>
            )}
            {mode !== "forgot" && (
              <div className="px-6 pt-4">
                <ModeSegment
                  mode={mode}
                  onSelect={(next) => {
                    setMode(next);
                    setError(null);
                    setNotice(null);
                  }}
                />
              </div>
            )}

            {mode === "forgot" && (
              <form onSubmit={(event) => void handleForgot(event)} className="flex flex-col gap-3 px-6 py-5">
                <h2 className="m-0 text-[18px] font-bold">重置密码</h2>
                <label className="block">
                  <span className="auth-label">邮箱</span>
                  <input type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" placeholder="you@example.com" required />
                </label>
                <button type="submit" disabled={pending} className="auth-cta">
                  {pending ? "发送中…" : "发送重置邮件"}
                </button>
                <button type="button" className="auth-link" onClick={() => { setMode("login"); setError(null); setNotice(null); }}>
                  返回登录
                </button>
              </form>
            )}

            {mode === "login" && (
              <form onSubmit={(event) => void handlePasswordLogin(event)} className="flex flex-col gap-3 px-6 py-5">
                <label className="block">
                  <span className="auth-label">邮箱</span>
                  <input type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" placeholder="you@example.com" required />
                </label>
                <PasswordField label="密码（可留空，改用验证码）" autoComplete="current-password" value={password} onChange={setPassword} />
                <button type="submit" disabled={pending} className="auth-cta">
                  {pending ? "登录中…" : password ? "登录" : "发送验证码"}
                </button>
                <button type="button" className="auth-link" onClick={() => { setMode("forgot"); setError(null); setNotice(null); }}>
                  忘记密码
                </button>
              </form>
            )}

            {mode === "register" && (
              <form onSubmit={(event) => void handleRegister(event)} className="flex flex-col gap-3 px-6 py-5">
                <label className="block">
                  <span className="auth-label">邮箱</span>
                  <input type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" placeholder="you@example.com" required />
                </label>
                <PasswordField label="密码" autoComplete="new-password" value={password} onChange={setPassword} required />
                <PasswordField label="确认密码" autoComplete="new-password" value={confirm} onChange={setConfirm} required />
                <button type="submit" disabled={pending} className="auth-cta">
                  {pending ? "提交中…" : "注册并发送验证码"}
                </button>
              </form>
            )}
          </>
        )}

        {!signedIn && status !== "loading" && !needsNewPassword && phase === "code" && (
          <form onSubmit={(event) => void handleVerify(event)} className="flex flex-col gap-3 px-6 py-5">
            <p className="m-0 text-[12.5px] text-[var(--md-sys-color-on-surface-variant)]">
              验证码已发送到 {email}
            </p>
            <OtpInput value={token} onChange={setToken} />
            <button type="submit" disabled={pending || token.length < 6} className="auth-cta">
              {pending ? "登录中…" : "登录"}
            </button>
            <button
              type="button"
              className="auth-link"
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

        {(notice || error) && (
          <div className="flex flex-col gap-2 px-6 pb-5">
            {notice && (
              <p className="auth-callout m-0" data-tone="info" role="status">
                <Info size={14} className="mt-0.5 shrink-0" />
                {notice}
              </p>
            )}
            {error && (
              <p role="alert" className="auth-callout m-0">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}
          </div>
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
