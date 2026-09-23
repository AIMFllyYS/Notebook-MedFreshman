"use client";

import { useEffect } from "react";
import clsx from "clsx";
import ChatPanel from "@/components/chat/ChatPanel";
import AgentLinksPane from "@/components/agent/AgentLinksPane";
import AgentImagesPane from "@/components/agent/AgentImagesPane";
import AgentSourcePanel from "@/components/agent/AgentSourcePanel";
import { useAgentChatContext } from "@/lib/hooks/useAgentChatContext";
import { SOURCES_PANEL_INSET, hydrateSourcesPanelSize, useAgentCenter } from "@/lib/stores/agentCenter";
import { useSessionSourceRounds } from "@/lib/hooks/useSessionSources";
import { useSessionProducts } from "@/lib/hooks/useSessionProducts";
import { useSessionImages } from "@/lib/hooks/useSessionImages";
import { useSessionDerivedTotals } from "@/lib/hooks/useSessionDerivedTotals";
import { useChatHistory } from "@/lib/stores/chatHistory";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useStore } from "@/lib/stores/ui";

/**
 * Agent 中央对话（`/agent` 的内容）。左栏与右侧工作区分别由 AgentShell / AppShell 承载。
 *
 * 版面与 Perplexity / Codex 一致：正文占满中央，**参考列是一块「看起来像悬浮卡片、实际占真实宽度」的列**
 * 钉在右上角（不是右侧那套统一面板 —— 那套要能装多种查看器，是另一回事）。它可拖动改大小，
 * 除了来源，也放出题 / 演示 / 文档入口；右栏一展开就整条让位。
 *
 * **回答页签只隐藏、不卸载** ChatPanel：ChatThread 的划词容器 ref 是它挂载时绑定的，
 * 卸载再挂载会让 SelectionPopover 错过新节点，Agent 里就再也选不中文字（见 ChatPanel 注释）。
 */
export default function AgentChatCenter() {
  const chatContext = useAgentChatContext();
  const centerTab = useAgentCenter((state) => state.centerTab);
  const sourcesPanelOpen = useAgentCenter((state) => state.sourcesPanelOpen);
  const { rounds, sources } = useSessionSourceRounds();
  const products = useSessionProducts();
  const images = useSessionImages();
  const dockCollapsed = useStore((state) => state.agentDockCollapsed);
  const isMobile = useIsMobile();
  const activeSessionId = useChatHistory((state) => state.activeSessionId);
  // 「还有没有在窗口外的来源/产物」看 spine 合计：sources.length 只覆盖已加载窗口。
  const totals = useSessionDerivedTotals();

  // 来源列尺寸存在 localStorage：首帧之后读回来，避免 SSR/水合不一致。
  useEffect(() => {
    hydrateSourcesPanelSize();
  }, []);

  /**
   * 把来源列的宽度写给顶栏：顶栏那三个切面要**只在对话列上居中**。
   * 不然它会居中在「对话列 + 来源列」上，视觉上偏右（用户口径：要偏左一点，跟 Perplexity 一样）。
   */
  const sourcesWidth = useAgentCenter((state) => state.sourcesPanelSize.width);

  const showSourcesPanel =
    !isMobile && dockCollapsed && sourcesPanelOpen && centerTab === "answer" && (totals.sources > 0 || totals.products > 0);

  // 「链接 / 图片 / 来源列」这类全量清单视图需要窗口外的轮次：
  // 用户点开它们才物化整段会话（窗口化的「加载更多」同一套按需语义）。
  useEffect(() => {
    const wantsFull = centerTab === "links" || centerTab === "images" || showSourcesPanel;
    if (wantsFull && activeSessionId) {
      void useChatHistory.getState().ensureSessionFullyLoaded(activeSessionId);
    }
  }, [centerTab, showSourcesPanel, activeSessionId]);

  useEffect(() => {
    const root = document.documentElement;
    // 写 <html> 而不是本节点：消费方是顶栏（祖先）。
    root.style.setProperty("--agent-sources-width", showSourcesPanel ? `${sourcesWidth + SOURCES_PANEL_INSET * 2}px` : "0px");
    return () => {
      root.style.removeProperty("--agent-sources-width");
    };
  }, [showSourcesPanel, sourcesWidth]);

  return (
    /* 对话列与来源列是 flex 兄弟：来源列占真实宽度 → 对话列被压窄，正文不会钻到卡片底下。
       隐藏来源那一列时，对话列拿回整宽，居中自动重新落在「左栏右侧那块区域」的正中间。 */
    <div className="flex h-full min-h-0" data-testid="agent-chat-center">
      <div className="relative min-h-0 min-w-0 flex-1">
        <div className={clsx("h-full min-h-0", centerTab !== "answer" && "hidden")} data-testid="agent-center-answer">
          <ChatPanel chatContext={chatContext} hideHeader emptyLayout="agent" />
        </div>
        {centerTab === "links" ? <AgentLinksPane rounds={rounds} sources={sources} /> : null}
        {centerTab === "images" ? <AgentImagesPane images={images} /> : null}
      </div>
      {/* 常驻（不是条件渲染）：宽度过渡才能跑起来，见 AgentSourcePanel 的 open。 */}
      <AgentSourcePanel rounds={rounds} sources={sources} products={products} open={showSourcesPanel} />
    </div>
  );
}
