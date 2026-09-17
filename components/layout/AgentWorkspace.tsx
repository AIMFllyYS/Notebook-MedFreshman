"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import AgentConversationSidebar from "./AgentConversationSidebar";
import RightPanel from "./RightPanel";
import { NOTES_PANEL_ID, RIGHT_PANEL_ID } from "@/lib/constants/layout";
import { useAcademicYear } from "@/lib/stores/academicYear";
import { useStore } from "@/lib/stores/ui";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import type { ChatContext } from "@/lib/types/chat";

const ChatPanel = dynamic(() => import("@/components/chat/ChatPanel"), { ssr: false });

/**
 * Agent 工作区。中间复用 ChatPanel；左右槽位接对话栏与右侧窗坞。
 */
export default function AgentWorkspace() {
  const isMobile = useIsMobile();
  const activeSubjectId = useStore((s) => s.activeSubjectId);
  const activeCategoryId = useStore((s) => s.activeCategoryId);
  const activeItemId = useStore((s) => s.activeItemId);
  const academicYear = useAcademicYear((s) => s.year);
  const layoutProfile = useStore((s) => s.layoutProfile);
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useStore((s) => s.setSidebarCollapsed);
  const rightCollapsed = useStore((s) => s.rightCollapsedByProfile[s.layoutProfile] ?? false);
  const setRightCollapsedForProfile = useStore((s) => s.setRightCollapsedForProfile);

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
    <div data-agent-slot="main" className="relative h-full min-h-0">
      <div id={NOTES_PANEL_ID} className="h-full w-full">
        <ChatPanel chatContext={chatContext} />
      </div>
      {sidebarCollapsed && (
        <button
          type="button"
          onClick={() => setSidebarCollapsed(false)}
          title="展开对话栏"
          aria-label="展开对话栏"
          className="absolute left-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-1 rounded-r-lg border border-l-0 border-[var(--line)] bg-[var(--bg-panel)] px-1.5 py-3 text-[11px] font-medium text-[var(--ink-soft)] hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]"
        >
          <PanelLeftOpen size={16} />
          <span>对话</span>
        </button>
      )}
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
      <PanelGroup direction="horizontal" autoSaveId="studysolo-agent-layout-v1">
        {!sidebarCollapsed && (
          <>
            <Panel id="agent-conversations" order={1} defaultSize={22} minSize={14} maxSize={36}>
              <aside data-agent-slot="conversations" className="h-full min-h-0">
                <AgentConversationSidebar chatContext={chatContext} />
              </aside>
            </Panel>
            <PanelResizeHandle className="group relative w-px bg-[var(--line)] outline-none data-[resize-handle-state=drag]:bg-[var(--accent)]">
              <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
            </PanelResizeHandle>
          </>
        )}
        <Panel id="agent-main" order={2} defaultSize={sidebarCollapsed && rightCollapsed ? 100 : 50} minSize={32}>
          {main}
        </Panel>
        {!rightCollapsed && (
          <>
            <PanelResizeHandle className="group relative w-px bg-[var(--line)] outline-none data-[resize-handle-state=drag]:bg-[var(--accent)]">
              <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
            </PanelResizeHandle>
            <Panel id="agent-windows" order={3} defaultSize={28} minSize={16} maxSize={44}>
              <aside data-agent-slot="windows" className="flex h-full min-h-0 flex-col bg-[var(--bg-panel)]">
                <div className="sr-only">窗口</div>
                <div id={RIGHT_PANEL_ID} className="relative min-h-0 flex-1">
                  <RightPanel hideAiTab showWindowDock />
                </div>
              </aside>
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
}
