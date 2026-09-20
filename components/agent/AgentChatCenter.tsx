"use client";

import clsx from "clsx";
import ChatPanel from "@/components/chat/ChatPanel";
import AgentLinksPane from "@/components/agent/AgentLinksPane";
import AgentImagesPane from "@/components/agent/AgentImagesPane";
import AgentSourceDock from "@/components/agent/AgentSourceDock";
import { useAgentChatContext } from "@/lib/hooks/useAgentChatContext";
import { useAgentCenter } from "@/lib/stores/agentCenter";
import { useSessionSourceRounds } from "@/lib/hooks/useSessionSources";
import { useSessionImages } from "@/lib/hooks/useSessionImages";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useStore } from "@/lib/stores/ui";

/**
 * Agent 中央对话（`/agent` 的内容）。左栏与右侧工作区分别由 AgentShell / AppShell 承载。
 *
 * 两块 Perplexity 式收尾：
 * - 「回答 / 来源 / 图片」分段开关 —— 挂在**顶栏**里（见 `AgentCenterTabsLive` 与 AppShell 的 TopBar），
 *   这里只负责按当前页签切换正文；
 * - 右上角一个常驻的「来源」框，点它从右侧拉出来源面板。
 *
 * **回答页签只隐藏、不卸载** ChatPanel：ChatThread 的划词容器 ref 是它挂载时绑定的，
 * 卸载再挂载会让 SelectionPopover 错过新节点，Agent 里就再也选不中文字（见 ChatPanel 注释）。
 */
export default function AgentChatCenter() {
  const chatContext = useAgentChatContext();
  const centerTab = useAgentCenter((state) => state.centerTab);
  const { rounds, sources } = useSessionSourceRounds();
  const images = useSessionImages();
  const dockCollapsed = useStore((state) => state.agentDockCollapsed);
  const isMobile = useIsMobile();

  return (
    <div className="relative h-full min-h-0" data-testid="agent-chat-center">
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
  );
}
