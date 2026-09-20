"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import ChatPanel from "@/components/chat/ChatPanel";
import AgentCenterTabs from "@/components/agent/AgentCenterTabs";
import AgentLinksPane from "@/components/agent/AgentLinksPane";
import AgentImagesPane from "@/components/agent/AgentImagesPane";
import AgentSourceDock from "@/components/agent/AgentSourceDock";
import { useAgentChatContext } from "@/lib/hooks/useAgentChatContext";
import { useAgentCenter } from "@/lib/stores/agentCenter";
import { useSessionSourceRounds } from "@/lib/hooks/useSessionSources";
import { useSessionImages } from "@/lib/hooks/useSessionImages";
import { useActiveChatSessionId } from "@/lib/window/sessionScope";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useStore } from "@/lib/stores/ui";

/**
 * Agent 中央对话（`/agent` 的内容）。左栏与右侧工作区分别由 AgentShell / AppShell 承载。
 *
 * 这里在原来的 ChatPanel 外面套了两层（用户口径的 Perplexity 式收尾）：
 * - 顶部一条「回答 / 来源 / 图片」分段开关；
 * - 右上角一个常驻的「来源」框，点它从右侧拉出来源面板。
 *
 * **回答页签只隐藏、不卸载** ChatPanel：ChatThread 的划词容器 ref 是它挂载时绑定的，
 * 卸载再挂载会让 SelectionPopover 错过新节点，Agent 里就再也选不中文字（见 ChatPanel 注释）。
 */
export default function AgentChatCenter() {
  const chatContext = useAgentChatContext();
  const centerTab = useAgentCenter((state) => state.centerTab);
  const setCenterTab = useAgentCenter((state) => state.setCenterTab);
  const activeSessionId = useActiveChatSessionId();
  const { rounds, sources } = useSessionSourceRounds();
  const images = useSessionImages();
  const dockCollapsed = useStore((state) => state.agentDockCollapsed);
  const isMobile = useIsMobile();

  // 来源与图片是「这条对话」的附属视图：换对话就回回答页，否则会看到一条不属于它的清单。
  const lastSessionRef = useRef(activeSessionId);
  useEffect(() => {
    if (lastSessionRef.current === activeSessionId) return;
    lastSessionRef.current = activeSessionId;
    setCenterTab("answer");
  }, [activeSessionId, setCenterTab]);

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="agent-chat-center">
      <AgentCenterTabs linksCount={sources.length} imagesCount={images.length} />
      <div className="relative min-h-0 flex-1">
        <div className={clsx("h-full min-h-0", centerTab !== "answer" && "hidden")} data-testid="agent-center-answer">
          <ChatPanel chatContext={chatContext} hideHeader emptyLayout="agent" />
        </div>
        {centerTab === "links" ? <AgentLinksPane rounds={rounds} sources={sources} /> : null}
        {centerTab === "images" ? <AgentImagesPane images={images} /> : null}
        <AgentSourceDock
          rounds={rounds}
          sources={sources}
          hidden={isMobile || !dockCollapsed || centerTab !== "answer"}
        />
      </div>
    </div>
  );
}
