"use client";

import UserAvatar from "./UserAvatar";
import UserDockMenu from "./UserDockMenu";
import { resolveNickname } from "@/lib/profile/displayName";
import { useAccountProfile } from "@/lib/hooks/useAccountProfile";

export function LeftDockFace({
  email,
  signedIn,
}: {
  email?: string | null;
  signedIn?: boolean;
}) {
  const account = useAccountProfile();
  const isSignedIn = account.signedIn || Boolean(signedIn);
  const nickname = isSignedIn
    ? resolveNickname(account.signedIn ? account.nickname : null, account.email ?? email)
    : "访客";

  return (
    <>
      <UserAvatar
        name={nickname}
        email={account.email ?? email ?? null}
        imageSrc={account.avatarSrc}
        signedIn={isSignedIn}
        size={22}
      />
      <span className="truncate text-[12.5px] font-medium">{nickname}</span>
    </>
  );
}

export default function LeftDock({
  buttonRef,
  onToggle,
  onOpenQuota,
}: {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
  onOpenQuota?: () => void;
}) {
  const account = useAccountProfile();
  return (
    <UserDockMenu
      triggerRef={buttonRef}
      testId="left-dock"
      label={`账户 ${account.nickname}`}
      onOpenQuota={onOpenQuota ?? (() => {})}
      onOpenSettings={onToggle}
      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[var(--md-sys-color-surface-container-high)]"
      style={{
        color: "var(--md-sys-color-on-surface-variant)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
      }}
      trigger={<LeftDockFace />}
    />
  );
}
