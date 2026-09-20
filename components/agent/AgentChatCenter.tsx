"use client";

import clsx from "clsx";
import ChatPanel from "@/components/chat/ChatPanel";
import AgentLinksPane from "@/components/agent/AgentLinksPane";
import AgentImagesPane from "@/components/agent/AgentImagesPane";
import AgentSourceRail from "@/components/agent/AgentSourceRail";
import { useAgentChatContext } from "@/lib/hooks/useAgentChatContext";
import { useAgentCenter } from "@/lib/stores/agentCenter";
import { useSessionSourceRounds } from "@/lib/hooks/useSessionSources";
import { useSessionImages } from "@/lib/hooks/useSessionImages";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useStore } from "@/lib/stores/ui";

/**
 * Agent 中央对话（`/agent` 的内容）。左栏与右侧工作区分别由 AgentShell / AppShell 承载。
 *
 * 版面（Perplexity 口径）：**对话列 + 右侧固定来源栏**并排。
 * 来源栏是一条真实列而不是浮层 —— 浮层会压住正文（宽一点的卡片会钻到它底下），
 * 真实列则让对话列自己收窄，两者永不重叠，这也正是"页面过宽"的解药。
 *
 * 右栏一展开来源栏就整条收起（那时用户已经在看完整的来源面板），移动端不出现。
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

  const showRail = !isMobile && dockCollapsed && centerTab === "answer" && sources.length > 0;

  return (
    <div className="flex h-full min-h-0" data-testid="agent-chat-center">
      <div className="relative min-h-0 min-w-0 flex-1">
        <div className={clsx("h-full min-h-0", centerTab !== "answer" && "hidden")} data-testid="agent-center-answer">
          <ChatPanel chatContext={chatContext} hideHeader emptyLayout="agent" />
        </div>
        {centerTab === "links" ? <AgentLinksPane rounds={rounds} sources={sources} /> : null}
        {centerTab === "images" ? <AgentImagesPane images={images} /> : null}
      </div>
      {showRail ? <AgentSourceRail rounds={rounds} sources={sources} /> : null}
    </div>
  );
}
