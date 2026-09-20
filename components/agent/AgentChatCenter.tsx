"use client";

import { useEffect } from "react";
import clsx from "clsx";
import ChatPanel from "@/components/chat/ChatPanel";
import AgentLinksPane from "@/components/agent/AgentLinksPane";
import AgentImagesPane from "@/components/agent/AgentImagesPane";
import AgentSourcePanel from "@/components/agent/AgentSourcePanel";
import { useAgentChatContext } from "@/lib/hooks/useAgentChatContext";
import { hydrateSourcesPanelSize, useAgentCenter } from "@/lib/stores/agentCenter";
import { useSessionSourceRounds } from "@/lib/hooks/useSessionSources";
import { useSessionImages } from "@/lib/hooks/useSessionImages";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useStore } from "@/lib/stores/ui";

/**
 * Agent 中央对话（`/agent` 的内容）。左栏与右侧工作区分别由 AgentShell / AppShell 承载。
 *
 * 版面与 Perplexity / Codex 一致：正文占满中央，**来源是一块浮在右上角的悬浮窗**
 * （不是侧栏 —— 侧栏那种东西才该进右侧统一面板）。它可拖动改大小，右栏一展开就整条让位，
 * 顶栏还有一个开关按钮控制它显示与否（默认显示）。
 *
 * **回答页签只隐藏、不卸载** ChatPanel：ChatThread 的划词容器 ref 是它挂载时绑定的，
 * 卸载再挂载会让 SelectionPopover 错过新节点，Agent 里就再也选不中文字（见 ChatPanel 注释）。
 */
export default function AgentChatCenter() {
  const chatContext = useAgentChatContext();
  const centerTab = useAgentCenter((state) => state.centerTab);
  const sourcesPanelOpen = useAgentCenter((state) => state.sourcesPanelOpen);
  const { rounds, sources } = useSessionSourceRounds();
  const images = useSessionImages();
  const dockCollapsed = useStore((state) => state.agentDockCollapsed);
  const isMobile = useIsMobile();

  // 悬浮窗尺寸存在 localStorage：首帧之后读回来，避免 SSR/水合不一致。
  useEffect(() => {
    hydrateSourcesPanelSize();
  }, []);

  const showSourcesPanel =
    !isMobile && dockCollapsed && sourcesPanelOpen && centerTab === "answer" && sources.length > 0;

  return (
    <div className="relative h-full min-h-0" data-testid="agent-chat-center">
      <div className={clsx("h-full min-h-0", centerTab !== "answer" && "hidden")} data-testid="agent-center-answer">
        <ChatPanel chatContext={chatContext} hideHeader emptyLayout="agent" />
      </div>
      {centerTab === "links" ? <AgentLinksPane rounds={rounds} sources={sources} /> : null}
      {centerTab === "images" ? <AgentImagesPane images={images} /> : null}
      {showSourcesPanel ? <AgentSourcePanel rounds={rounds} sources={sources} /> : null}
    </div>
  );
}
