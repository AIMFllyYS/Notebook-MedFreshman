"use client";

import { useEffect, useMemo, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from "react-resizable-panels";
import { PanelRightOpen } from "lucide-react";
import AgentLeftPanel from "./AgentLeftPanel";
import RightPanel from "./RightPanel";
import AgentDockHost from "@/components/window/AgentDockHost";
import ChatPanel from "@/components/chat/ChatPanel";
import { NOTES_PANEL_ID, RIGHT_PANEL_ID } from "@/lib/constants/layout";
import { useAcademicYear } from "@/lib/stores/academicYear";
import { useStore } from "@/lib/stores/ui";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import type { ChatContext } from "@/lib/types/chat";
import { useAgentDockRuntime } from "@/lib/window/agentDockRuntime";

/**
 * Agent 工作区。中间复用 ChatPanel；左侧工作区面板按需覆盖弹出（不常驻），右侧是窗口坞。
 */
export default function AgentWorkspace() {
  const isMobile = useIsMobile();
  const activeSubjectId = useStore((s) => s.activeSubjectId);
  const activeCategoryId = useStore((s) => s.activeCategoryId);
  const activeItemId = useStore((s) => s.activeItemId);
  const academicYear = useAcademicYear((s) => s.year);
  const layoutProfile = useStore((s) => s.layoutProfile);
  const rightCollapsed = useStore((s) => s.rightCollapsedByProfile[s.layoutProfile] ?? false);
  const setRightCollapsedForProfile = useStore((s) => s.setRightCollapsedForProfile);
  const rightRef = useRef<ImperativePanelHandle>(null);
  const registerPanelControls = useAgentDockRuntime((s) => s.registerPanelControls);

  useEffect(() => {
    registerPanelControls({
      collapse: () => rightRef.current?.collapse(),
      expand: () => rightRef.current?.expand(),
      toggleExpand: () => {
        const panel = rightRef.current;
        if (!panel) return;
        try {
          if (panel.isCollapsed()) {
            panel.expand();
            return;
          }
          panel.resize(panel.getSize() < 40 ? 42 : 28);
        } catch {
          // react-resizable-panels has no size until the browser has laid out
          // the group; the next user action/effect can retry safely.
        }
      },
    });
    return () => registerPanelControls(null);
  }, [registerPanelControls]);

  useEffect(() => {
    const panel = rightRef.current;
    if (!panel) return;
    try {
      if (rightCollapsed && !panel.isCollapsed()) panel.collapse();
      if (!rightCollapsed && panel.isCollapsed()) panel.expand();
    } catch {
      // jsdom and the first layout pass do not expose panel geometry yet.
    }
  }, [rightCollapsed]);

  const chatContext: ChatContext = useMemo(
    () => ({
      subjectId: activeSubjectId,
      categoryId: activeCategoryId,
      itemId: activeItemId,
      currentTopic: `${activeSubjectId} ${activeCategoryId} ${activeItemId}`,
      academicYear,
    }),
    [activeSubjectId, activeCategoryId, activeItemId, academicYear],
  );

  const main = (
    <div data-agent-slot="main" className="relative h-full min-h-0 overflow-visible">
      <div id={NOTES_PANEL_ID} className="h-full w-full overflow-visible">
        <ChatPanel chatContext={chatContext} />
      </div>
      {rightCollapsed && (
        <button
          type="button"
          data-expand-ai
          onClick={() => setRightCollapsedForProfile(layoutProfile, false)}
          title="展开右侧面板"
          aria-label="展开右侧面板"
          className="absolute right-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-1 rounded-l-lg border border-r-0 border-[var(--line)] bg-[var(--bg-panel)] px-1.5 py-3 text-[11px] font-medium text-[var(--ink-soft)] hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]"
        >
          <PanelRightOpen size={16} />
          <span>面板</span>
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
      <PanelGroup direction="horizontal" autoSaveId="studysolo-agent-layout-v2">
        <Panel id="agent-main" order={1} defaultSize={rightCollapsed ? 100 : 72} minSize={40}>
          {main}
        </Panel>
        <PanelResizeHandle className="group relative w-px bg-[var(--line)] outline-none data-[resize-handle-state=drag]:bg-[var(--accent)]">
          <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
        </PanelResizeHandle>
        <Panel
          ref={rightRef}
          id="agent-windows"
          order={2}
          collapsible
          collapsedSize={0}
          defaultSize={rightCollapsed ? 0 : 28}
          minSize={16}
          maxSize={44}
          onCollapse={() => setRightCollapsedForProfile(layoutProfile, true)}
          onExpand={() => setRightCollapsedForProfile(layoutProfile, false)}
        >
          <aside data-agent-slot="windows" className="flex h-full min-h-0 flex-col bg-[var(--bg-panel)]">
            <div className="sr-only">窗口</div>
            <div id={RIGHT_PANEL_ID} className="relative min-h-0 flex-1">
              <AgentDockHost>
                <RightPanel hideAiTab showWindowDock />
              </AgentDockHost>
            </div>
          </aside>
        </Panel>
      </PanelGroup>
      <AgentLeftPanel chatContext={chatContext} />
    </div>
  );
}
