"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from "react-resizable-panels";
import { PanelLeftOpen } from "lucide-react";
import AgentConversationSidebar from "./AgentConversationSidebar";
import ChatPanel from "@/components/chat/ChatPanel";
import { NOTES_PANEL_ID } from "@/lib/constants/layout";
import { useAcademicYear } from "@/lib/stores/academicYear";
import { useStore } from "@/lib/stores/ui";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useAgentDockRuntime } from "@/lib/window/agentDockRuntime";
import { PANEL_PRESETS, nestedShares } from "@/lib/constants/panelPresets";
import { ChatSkeleton } from "@/components/shared/ResizeLoader";
import type { ChatContext } from "@/lib/types/chat";

/**
 * Agent 工作区的「左侧对话栏 + 中央对话」。右侧工作区是顶层布局里独立的一列（见 AppShell / AgentDockColumn），
 * 因为它要通到窗口最顶、与顶栏平齐，不能放在顶栏下面。
 */
export default function AgentWorkspace() {
  const isMobile = useIsMobile();
  const activeSubjectId = useStore((s) => s.activeSubjectId);
  const academicYear = useAcademicYear((s) => s.year);
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useStore((s) => s.setSidebarCollapsed);

  // 「全局」模式要把中央对话压到 0、让右侧工作区铺满剩余宽度，这需要左栏当前宽度。
  // 变量挂在 <html> 上：消费方是外层 shell 的分栏面板（AgentWorkspace 的祖先），
  // 挂在本地节点上它读不到。这里只交出宽度数字，不做业务逻辑上的 DOM 测量。
  const conversationsRef = useRef<HTMLElement>(null);
  /** 用户最后一次拖到的「舒适」左栏宽度（像素）；吸附收起再展开时回到它。 */
  const lastWideWidthRef = useRef(0);
  /** 拖拽左栏分隔线期间：盖一层骨架，避免文件夹树被压成竖排单字。 */
  const [leftDragging, setLeftDragging] = useState(false);
  useEffect(() => {
    const left = conversationsRef.current;
    if (!left || typeof document === "undefined" || typeof ResizeObserver === "undefined") return;
    const rootStyle = document.documentElement.style;
    const sync = () => {
      const width = left.getBoundingClientRect().width;
      // 记住用户最后一次「舒适」的左栏宽度：吸附收起后再展开要回到这里，而不是回到吸附点。
      // 拖拽过程中不记录——否则往窄拖时会把好值覆盖成吸附点附近那个宽度。
      if (!leftDragging && width >= 80) lastWideWidthRef.current = width;
      // 全局态下左栏宽度正是由这个变量驱动出来的，再回写会把瞬时值锁死（越收越窄）。
      if (useAgentDockRuntime.getState().dockGlobal) return;
      rootStyle.setProperty("--agent-left-width", `${Math.round(width)}px`);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(left);
    return () => {
      observer.disconnect();
      rootStyle.removeProperty("--agent-left-width");
    };
    // leftDragging 进依赖：拖拽中不记录舒适宽度，所以观测器要跟着这个状态重建。
  }, [sidebarCollapsed, leftDragging]);

  /**
   * 被压到 minSize 以下时，分栏库会吸附到彻底收起。这一段交接要**很快**
   * （用户口径：收起时的软动画要快），所以临时把缓动切到 --duration-normal。
   */
  const [snapping, setSnapping] = useState(false);
  const snapTimerRef = useRef<number | null>(null);
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  /**
   * 左栏开合是否允许回写 store。分栏库挂载时会误报一次面板事件（同右栏那个坑），
   * 用户不可能在 500ms 内拖动，所以先关掉回写窗口。
   */
  const leftPersistReadyRef = useRef(false);
  useEffect(() => {
    const id = window.setTimeout(() => {
      leftPersistReadyRef.current = true;
    }, 500);
    return () => window.clearTimeout(id);
  }, []);
  // 收起**不再卸载面板**：分栏库要留着这个面板，才能在展开时还原用户上次拖到的宽度。
  useEffect(() => {
    const panel = leftPanelRef.current;
    if (!panel) return;
    try {
      if (sidebarCollapsed && !panel.isCollapsed()) panel.collapse();
      if (!sidebarCollapsed && panel.isCollapsed()) panel.expand();
    } catch {
      // 首帧（或 jsdom）还没有布局信息，分栏库会抛「Panel size not found」，忽略即可
    }
  }, [sidebarCollapsed]);
  /** 展开左栏：标记要在展开后把宽度还原到用户上次拖到的位置。 */
  const pendingLeftRestoreRef = useRef(false);
  const expandLeft = useCallback(() => {
    pendingLeftRestoreRef.current = true;
    setSidebarCollapsed(false);
  }, [setSidebarCollapsed]);

  // 展开之后再还原宽度：必须排在上面那个「sync 展开」effect 之后，否则面板还是收起的，resize 会被忽略。
  useEffect(() => {
    if (sidebarCollapsed || !pendingLeftRestoreRef.current) return;
    pendingLeftRestoreRef.current = false;
    const panel = leftPanelRef.current;
    const group = conversationsRef.current?.closest("[data-panel-group]") as HTMLElement | null;
    const groupWidth = group?.getBoundingClientRect().width ?? 0;
    const remembered = lastWideWidthRef.current;
    if (!panel || groupWidth <= 0 || remembered < 80) return;
    const percent = Math.min(40, Math.max(14, (remembered / groupWidth) * 100));
    try {
      panel.resize(Math.round(percent * 10) / 10);
    } catch {
      // 同上：没有布局信息时忽略
    }
  }, [sidebarCollapsed]);

  const handleAutoCollapse = useCallback(() => {
    setSnapping(true);
    if (snapTimerRef.current !== null) window.clearTimeout(snapTimerRef.current);
    snapTimerRef.current = window.setTimeout(() => {
      snapTimerRef.current = null;
      setSnapping(false);
    }, 320);
    if (!leftPersistReadyRef.current) return;
    setSidebarCollapsed(true);
  }, [setSidebarCollapsed]);
  useEffect(() => () => {
    if (snapTimerRef.current !== null) window.clearTimeout(snapTimerRef.current);
  }, []);

  /**
   * 中间对话面板的宽度正在变化（真全屏切换、拖分隔线、改窗口大小）→ 盖一层骨架屏。
   * 宽度一变，正文就会重新折行、文字自动异位，很难看；盖住既避免视觉跳动，
   * 也把这段每帧重排的开销省掉（骨架只跑 transform/opacity）。
   */
  const mainRef = useRef<HTMLDivElement>(null);
  const [centerResizing, setCenterResizing] = useState(false);
  const centerBusyTimerRef = useRef<number | null>(null);
  useEffect(() => {
    const el = mainRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let lastWidth = el.getBoundingClientRect().width;
    const observer = new ResizeObserver(() => {
      const width = el.getBoundingClientRect().width;
      if (Math.abs(width - lastWidth) < 1) return;
      lastWidth = width;
      setCenterResizing(true);
      if (centerBusyTimerRef.current !== null) window.clearTimeout(centerBusyTimerRef.current);
      centerBusyTimerRef.current = window.setTimeout(() => {
        centerBusyTimerRef.current = null;
        setCenterResizing(false);
      }, 260);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (centerBusyTimerRef.current !== null) window.clearTimeout(centerBusyTimerRef.current);
    };
  }, []);

  /**
   * Agent 是通用型助手：上下文靠**注入**（引用笔记 / 附件 / 技能），
   * 不把「当前打开的那一章」默认当成它的上下文——否则每开一个新对话都绑死在同一节，
   * 换科目还会悄悄改写在聊的这个对话。
   * 所以这里只带科目与学年：定位行、当前页正文、页级参考材料都不再注入（见 isPageBoundContext）。
   */
  const chatContext: ChatContext = useMemo(
    () => ({
      subjectId: activeSubjectId,
      categoryId: "",
      itemId: "",
      currentTopic: "",
      academicYear,
    }),
    [activeSubjectId, academicYear],
  );

  const main = (
    <div ref={mainRef} data-agent-slot="main" className="relative h-full min-h-0 overflow-visible">
      <div id={NOTES_PANEL_ID} className="h-full w-full overflow-visible">
        <ChatPanel chatContext={chatContext} hideHeader emptyLayout="agent" />
      </div>
      {centerResizing && <ChatSkeleton />}
      {/* 网页全屏按钮不在这里：它挂在顶栏、紧贴右侧工作区开关左侧（见 AppShell 的 TopBar）。
          悬浮在对话正文上方会压住第一条消息，也让人以为是内容区的控件。 */}
      {sidebarCollapsed && (
        <button
          type="button"
          onClick={expandLeft}
          title="展开对话栏"
          aria-label="展开对话栏"
          className="absolute left-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-1 rounded-r-lg border border-l-0 border-[var(--line)] bg-[var(--bg-panel)] px-1.5 py-3 text-[11px] font-medium text-[var(--ink-soft)] hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]"
        >
          <PanelLeftOpen size={16} />
          <span>对话</span>
        </button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="h-full min-h-0" data-agent-workspace>
        {main}
      </div>
    );
  }

  return (
    <div className="h-full min-h-0" data-agent-workspace>
      <PanelGroup direction="horizontal" autoSaveId="studysolo-agent-layout-v2" data-pane-snap={snapping || undefined}>
        <Panel
          ref={leftPanelRef}
          id="agent-conversations"
          order={1}
          defaultSize={nestedShares(PANEL_PRESETS.agent).left}
          minSize={14}
          collapsible
          collapsedSize={0}
          maxSize={40}
          onCollapse={handleAutoCollapse}
          onExpand={() => {
            if (leftPersistReadyRef.current) setSidebarCollapsed(false);
          }}
        >
          <aside ref={conversationsRef} data-agent-slot="conversations" className="relative h-full min-h-0" data-collapsed={sidebarCollapsed || undefined}>
            <AgentConversationSidebar chatContext={chatContext} />
            {leftDragging && <ChatSkeleton />}
          </aside>
        </Panel>
        <PanelResizeHandle
          onDragging={setLeftDragging}
          className="group relative w-px bg-[var(--line-soft)] outline-none data-[resize-handle-state=drag]:bg-[var(--accent)]"
        >
          <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
        </PanelResizeHandle>
        <Panel id="agent-main" order={2} defaultSize={sidebarCollapsed ? 100 : nestedShares(PANEL_PRESETS.agent).center} minSize={32}>
          {main}
        </Panel>
      </PanelGroup>
    </div>
  );
}
