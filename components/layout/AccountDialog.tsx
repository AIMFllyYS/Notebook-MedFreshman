"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { tryGetBrowserAuthClient } from "@/lib/auth/browserClient";
import { saveAccountNickname } from "@/lib/profile/client";
import { fileToLocalAvatar } from "@/lib/profile/localAvatar";
import {
  changeAccountPassword,
  readPasswordFlag,
  setAccountPassword,
  type PasswordAuthClient,
} from "@/lib/profile/password";
import { useAccountProfile } from "@/lib/hooks/useAccountProfile";
import { useUserProfile } from "@/lib/stores/userProfile";
import { useToast } from "@/lib/stores/toast";
import UserAvatar from "./UserAvatar";

export default function AccountDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const { nickname, email, userId, avatarSrc, signedIn, membership } = useAccountProfile();
  const setLocalAvatar = useUserProfile((s) => s.setLocalAvatar);
  const cacheNickname = useUserProfile((s) => s.cacheNickname);
  const titleId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [draftName, setDraftName] = useState(nickname);
  const [syncedName, setSyncedName] = useState(nickname);
  const [hasPassword, setHasPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState<"name" | "avatar" | "password" | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (nickname !== syncedName) {
    setSyncedName(nickname);
    setDraftName(nickname);
  }

  useEffect(() => {
    const client = tryGetBrowserAuthClient() as PasswordAuthClient | null;
    if (!client || !signedIn) return;
    let cancelled = false;
    void readPasswordFlag(client).then((result) => {
      if (!cancelled && result.ok) setHasPassword(result.hasPassword);
    });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const showSaved = () => useToast.getState().showSaved();

  const saveName = async () => {
    if (!userId) return;
    setBusy("name");
    setError(null);
    try {
      const saved = await saveAccountNickname(draftName);
      cacheNickname(userId, saved.nickname);
      showSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "昵称未能保存");
    } finally {
      setBusy(null);
    }
  };

  const pickAvatar = async (file: File | null) => {
    if (!userId || !file) return;
    setBusy("avatar");
    setError(null);
    try {
      const dataUrl = await fileToLocalAvatar(file);
      setLocalAvatar(userId, dataUrl);
      showSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "头像未能保存");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const savePassword = async () => {
    const client = tryGetBrowserAuthClient() as PasswordAuthClient | null;
    if (!client) {
      setError("登录未配置");
      return;
    }
    setBusy("password");
    setError(null);
    const result = hasPassword
      ? await changeAccountPassword(client, email ?? "", oldPassword, password, confirm)
      : await setAccountPassword(client, password, confirm);
    setBusy(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setHasPassword(true);
    setOldPassword("");
    setPassword("");
    setConfirm("");
    showSaved();
  };

  const node = (
    <div
      id="studysolo-account-dialog"
      className="fixed inset-0 z-[10000] flex items-end justify-center p-4 sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-[320px] overflow-hidden rounded-2xl"
        style={{
          background: "var(--md-sys-color-surface-container-low)",
          border: "1px solid var(--md-sys-color-outline-variant)",
          boxShadow: "var(--md-sys-elevation-level3, 0 8px 24px rgba(0,0,0,0.32))",
        }}
      >
        <div
          className="flex items-center justify-between px-3.5 py-2.5"
          style={{ borderBottom: "1px solid var(--md-sys-color-outline-variant)" }}
        >
          <div>
            <div id={titleId} className="text-[13px] font-bold text-[var(--md-sys-color-on-surface)]">
              账户信息
            </div>
            <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">{membership}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
            aria-label="关闭账户信息"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-3.5">
          <div className="flex items-center gap-3">
            <UserAvatar name={draftName} email={email} imageSrc={avatarSrc} signedIn={signedIn} size={44} />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-medium text-[var(--md-sys-color-on-surface)]">头像</div>
              <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">只保存在这台设备</div>
              <div className="mt-1.5 flex gap-1.5">
                <button
                  type="button"
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    background: "var(--md-sys-color-surface-container-highest)",
                    color: "var(--md-sys-color-on-surface)",
                    border: "none",
                  }}
                  onClick={() => fileRef.current?.click()}
                  disabled={!userId || busy === "avatar"}
                >
                  更换
                </button>
                {avatarSrc ? (
                  <button
                    type="button"
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)]"
                    style={{ background: "transparent", border: "none" }}
                    onClick={() => userId && setLocalAvatar(userId, null)}
                  >
                    恢复字标
                  </button>
                ) : null}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => void pickAvatar(event.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">名称</span>
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              className="rounded-lg px-2.5 py-1.5 text-[13px]"
              style={{
                background: "var(--md-sys-color-surface-container)",
                border: "1px solid var(--md-sys-color-outline-variant)",
                color: "var(--md-sys-color-on-surface)",
              }}
            />
          </label>
          <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
            未改时默认 {email?.split("@")[0] || "邮箱前缀"}
          </div>
          <button
            type="button"
            onClick={() => void saveName()}
            disabled={!userId || busy === "name"}
            className="self-start rounded-full px-3 py-1 text-[12px] font-semibold"
            style={{
              background: "var(--md-sys-color-primary)",
              color: "var(--md-sys-color-on-primary)",
              border: "none",
            }}
          >
            保存名称
          </button>

          <div
            className="rounded-xl px-3 py-2 text-[11px] text-[var(--md-sys-color-on-surface-variant)]"
            style={{ background: "var(--md-sys-color-surface-container)" }}
          >
            {email || "未绑定邮箱"}
          </div>

          {signedIn ? (
            <div className="flex flex-col gap-2">
              <div className="text-[12px] font-medium text-[var(--md-sys-color-on-surface)]">
                {hasPassword ? "修改密码" : "设置密码"}
              </div>
              {hasPassword ? (
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="当前密码"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                  className="rounded-lg px-2.5 py-1.5 text-[13px]"
                  style={{
                    background: "var(--md-sys-color-surface-container)",
                    border: "1px solid var(--md-sys-color-outline-variant)",
                    color: "var(--md-sys-color-on-surface)",
                  }}
                />
              ) : null}
              <input
                type="password"
                autoComplete="new-password"
                placeholder="新密码"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-lg px-2.5 py-1.5 text-[13px]"
                style={{
                  background: "var(--md-sys-color-surface-container)",
                  border: "1px solid var(--md-sys-color-outline-variant)",
                  color: "var(--md-sys-color-on-surface)",
                }}
              />
              <input
                type="password"
                autoComplete="new-password"
                placeholder="确认新密码"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="rounded-lg px-2.5 py-1.5 text-[13px]"
                style={{
                  background: "var(--md-sys-color-surface-container)",
                  border: "1px solid var(--md-sys-color-outline-variant)",
                  color: "var(--md-sys-color-on-surface)",
                }}
              />
              <button
                type="button"
                onClick={() => void savePassword()}
                disabled={busy === "password"}
                className="self-start rounded-full px-3 py-1 text-[12px] font-semibold"
                style={{
                  background: "var(--md-sys-color-surface-container-highest)",
                  color: "var(--md-sys-color-on-surface)",
                  border: "none",
                }}
              >
                {hasPassword ? "更新密码" : "设置密码"}
              </button>
            </div>
          ) : null}

          {error ? (
            <div className="text-[11px] text-[var(--md-sys-color-error)]">{error}</div>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}
