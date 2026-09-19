"use client";

import { useMemo } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { PanelLeftOpen } from "lucide-react";
import AgentConversationSidebar from "./AgentConversationSidebar";
import ChatPanel from "@/components/chat/ChatPanel";
import { NOTES_PANEL_ID } from "@/lib/constants/layout";
import { useAcademicYear } from "@/lib/stores/academicYear";
import { useStore } from "@/lib/stores/ui";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import type { ChatContext } from "@/lib/types/chat";

/**
 * Agent 工作区的「左侧对话栏 + 中央对话」。右侧工作区是顶层布局里独立的一列（见 AppShell / AgentDockColumn），
 * 因为它要通到窗口最顶、与顶栏平齐，不能放在顶栏下面。
 */
export default function AgentWorkspace() {
  const isMobile = useIsMobile();
  const activeSubjectId = useStore((s) => s.activeSubjectId);
  const activeCategoryId = useStore((s) => s.activeCategoryId);
  const activeItemId = useStore((s) => s.activeItemId);
  const academicYear = useAcademicYear((s) => s.year);
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useStore((s) => s.setSidebarCollapsed);

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
        {!sidebarCollapsed && (
          <>
            <Panel id="agent-conversations" order={1} defaultSize={24} minSize={14} maxSize={40}>
              <aside data-agent-slot="conversations" className="h-full min-h-0">
                <AgentConversationSidebar chatContext={chatContext} />
              </aside>
            </Panel>
            <PanelResizeHandle className="group relative w-px bg-[var(--line)] outline-none data-[resize-handle-state=drag]:bg-[var(--accent)]">
              <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
            </PanelResizeHandle>
          </>
        )}
        <Panel id="agent-main" order={2} defaultSize={sidebarCollapsed ? 100 : 76} minSize={32}>
          {main}
        </Panel>
      </PanelGroup>
    </div>
  );
}
