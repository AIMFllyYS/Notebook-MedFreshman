"use client";

import { User } from "lucide-react";
import { avatarInitial, resolveNickname } from "@/lib/profile/displayName";

export function initialsFromEmail(email: string | null | undefined): string {
  return avatarInitial(resolveNickname(null, email));
}

export default function UserAvatar({
  name,
  email,
  imageSrc,
  signedIn,
  size = 32,
}: {
  name?: string | null;
  email?: string | null;
  imageSrc?: string | null;
  signedIn: boolean;
  size?: number;
}) {
  const label = resolveNickname(name, email);
  const initial = signedIn ? avatarInitial(label) : "";
  return (
    <span
      aria-hidden
      data-testid="user-avatar"
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold select-none"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.42)),
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
      {imageSrc ? (
        // 本机 data URL，不上云，不用 next/image。
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageSrc} alt="" width={size} height={size} className="h-full w-full object-cover" />
      ) : signedIn ? (
        initial
      ) : (
        <User size={Math.round(size * 0.5)} strokeWidth={2.2} />
      )}
    </span>
  );
}
