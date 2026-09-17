"use client";

import { User } from "lucide-react";

export function initialsFromEmail(email: string | null | undefined): string {
  const local = (email ?? "").split("@")[0]?.trim() ?? "";
  if (!local) return "我";
  const parts = local.split(/[._\-+]+/).filter(Boolean);
  if (parts.length >= 2) {
    return ((parts[0][0] ?? "") + (parts[1][0] ?? "")).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export default function UserAvatar({
  email,
  signedIn,
  size = 32,
}: {
  email: string | null;
  signedIn: boolean;
  size?: number;
}) {
  const initials = signedIn ? initialsFromEmail(email) : "";
  return (
    <span
      aria-hidden
      data-testid="user-avatar"
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold select-none"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.36)),
        letterSpacing: 0,
        background: signedIn
          ? "var(--md-sys-color-primary-container)"
          : "var(--md-sys-color-surface-container-highest)",
        color: signedIn
          ? "var(--md-sys-color-on-primary-container)"
          : "var(--md-sys-color-on-surface-variant)",
        boxShadow: "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
      }}
    >
      {signedIn ? initials : <User size={Math.round(size * 0.5)} strokeWidth={2.2} />}
    </span>
  );
}
