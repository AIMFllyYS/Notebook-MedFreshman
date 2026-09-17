"use client";

import { useCallback } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import ChatSettings from "@/components/chat/ChatSettings";
import { useStore } from "@/lib/stores/ui";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

/**
 * 页面正中的 Agent 设置层：复用现有 ChatSettings 工作区，不走 ManagedWindow。
 * 左下角入口与 AI 助教「设置」共用这一层和同一份 settings store。
 * 手机铺满全屏，分类改顶部 Tab；桌面仍是居中对话框 + 左侧导航。
 */
export default function AgentSettingsOverlay() {
  const open = useStore((s) => s.agentSettingsOpen);
  const closeAgentSettings = useStore((s) => s.closeAgentSettings);
  const onClose = useCallback(() => closeAgentSettings(), [closeAgentSettings]);
  const isMobile = useIsMobile();

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={clsx("agent-settings-overlay", isMobile && "agent-settings-overlay--mobile")}
      data-testid="agent-settings-overlay"
      data-layout={isMobile ? "mobile" : "desktop"}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={clsx("agent-settings-dialog", isMobile && "agent-settings-dialog--mobile")}
        role="dialog"
        aria-modal="true"
        aria-label="Agent 设置"
      >
        <ChatSettings onClose={onClose} navPlacement={isMobile ? "top" : "side"} />
      </div>
    </div>,
    document.body,
  );
}
