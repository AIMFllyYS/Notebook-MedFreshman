"use client";

import { useCallback } from "react";
import { createPortal } from "react-dom";
import ChatSettings from "@/components/chat/ChatSettings";
import { useStore } from "@/lib/stores/ui";

/**
 * 页面正中的 Agent 设置层：复用现有 ChatSettings 工作区，不走 ManagedWindow。
 * 左下角入口与 AI 助教「设置」共用这一层和同一份 settings store。
 */
export default function AgentSettingsOverlay() {
  const open = useStore((s) => s.agentSettingsOpen);
  const closeAgentSettings = useStore((s) => s.closeAgentSettings);
  const onClose = useCallback(() => closeAgentSettings(), [closeAgentSettings]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="agent-settings-overlay"
      data-testid="agent-settings-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="agent-settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Agent 设置"
      >
        <ChatSettings onClose={onClose} />
      </div>
    </div>,
    document.body,
  );
}
