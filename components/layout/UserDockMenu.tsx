"use client";

import { Settings } from "lucide-react";
import type { CSSProperties, ReactNode, Ref } from "react";
import AnchoredMenu from "@/components/ui/AnchoredMenu";

/** 左下角用户菜单里的「额度」项。账户信息仍由账户坞维护。 */
export function UserQuotaMenuItem({ onSelect }: { onSelect: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      data-testid="user-menu-quota"
      className="app-menu-item"
      onClick={onSelect}
    >
      <span>额度</span>
    </button>
  );
}

export default function UserDockMenu({
  onOpenQuota,
  onOpenSettings,
  trigger,
  triggerRef,
  className,
  style,
  testId = "user-dock-menu",
  label = "用户菜单",
}: {
  onOpenQuota: () => void;
  onOpenSettings: () => void;
  trigger: ReactNode;
  triggerRef?: Ref<HTMLButtonElement>;
  className?: string;
  style?: CSSProperties;
  testId?: string;
  label?: string;
}) {
  return (
    <AnchoredMenu
      label={label}
      placement="top"
      testId={testId}
      width={220}
      className={className}
      style={style}
      triggerRef={triggerRef}
      trigger={trigger}
    >
      {(close) => (
        <>
          <UserQuotaMenuItem onSelect={() => { close(); onOpenQuota(); }} />
          <div className="app-menu-separator" />
          <button
            type="button"
            role="menuitem"
            className="app-menu-item"
            onClick={() => { close(); onOpenSettings(); }}
          >
            <span className="app-menu-check"><Settings size={14} /></span>
            <span>设置</span>
          </button>
        </>
      )}
    </AnchoredMenu>
  );
}
