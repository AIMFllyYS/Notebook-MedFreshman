"use client";

import { useCallback } from "react";
import { createPortal } from "react-dom";
import AgentConversationSidebar from "./AgentConversationSidebar";
import { useStore } from "@/lib/stores/ui";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";
import type { ChatContext } from "@/lib/types/chat";

/**
 * Agent 左侧工作区面板：不常驻，从左侧覆盖弹出，顶部与顶栏平齐。
 * 内容直接复用 AgentConversationSidebar，不复制第二份。
 */
export default function AgentLeftPanel({ chatContext }: { chatContext: ChatContext }) {
  const open = useStore((s) => s.agentPanelOpen);
  const setAgentPanelOpen = useStore((s) => s.setAgentPanelOpen);
  const close = useCallback(() => setAgentPanelOpen(false), [setAgentPanelOpen]);

  useOverlayRegistration({ id: "agent-left-panel", open, onClose: close, priority: 60 });

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div data-testid="agent-left-panel-root">
      <button
        type="button"
        aria-label="关闭左侧面板"
        tabIndex={-1}
        className="agent-left-panel-scrim"
        onClick={close}
      />
      <div className="agent-left-panel" role="dialog" aria-label="工作区面板" data-testid="agent-left-panel">
        <AgentConversationSidebar chatContext={chatContext} />
      </div>
    </div>,
    document.body,
  );
}
