"use client";

import { useMemo, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useAcademicYear } from "@/lib/stores/academicYear";
import { useStore } from "@/lib/stores/ui";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import type { ChatContext } from "@/lib/types/chat";

const ChatPanel = dynamic(() => import("@/components/chat/ChatPanel"), { ssr: false });

function AgentSlotNote({ children }: { children: ReactNode }) {
  return (
    <p className="px-3 py-3 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">{children}</p>
  );
}

function AgentSlotHeader({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-[var(--line)] px-3 py-2.5 text-[13px] font-semibold text-[var(--ink)]">
      {children}
    </div>
  );
}

/**
 * Agent 工作区壳。左侧对话树 / 右侧窗面板由后续代理替换
 * `data-agent-slot="conversations"` 与 `data-agent-slot="windows"`。
 * 中间复用现有 `ChatPanel`，保证切到 Agent 不崩。
 */
export default function AgentWorkspace() {
  const isMobile = useIsMobile();
  const activeSubjectId = useStore((s) => s.activeSubjectId);
  const activeCategoryId = useStore((s) => s.activeCategoryId);
  const activeItemId = useStore((s) => s.activeItemId);
  const academicYear = useAcademicYear((s) => s.year);

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
    <div data-agent-slot="main" className="h-full min-h-0">
      <ChatPanel chatContext={chatContext} />
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
        <Panel id="agent-conversations" order={1} defaultSize={22} minSize={14} maxSize={36}>
          <aside
            data-agent-slot="conversations"
            className="flex h-full flex-col bg-[var(--bg-panel)]"
          >
            <AgentSlotHeader>对话</AgentSlotHeader>
            <AgentSlotNote>左侧对话树将在后续接入。可替换本栏。</AgentSlotNote>
          </aside>
        </Panel>
        <PanelResizeHandle className="group relative w-px bg-[var(--line)] outline-none data-[resize-handle-state=drag]:bg-[var(--accent)]">
          <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
        </PanelResizeHandle>
        <Panel id="agent-main" order={2} defaultSize={50} minSize={32}>
          {main}
        </Panel>
        <PanelResizeHandle className="group relative w-px bg-[var(--line)] outline-none data-[resize-handle-state=drag]:bg-[var(--accent)]">
          <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
        </PanelResizeHandle>
        <Panel id="agent-windows" order={3} defaultSize={28} minSize={16} maxSize={44}>
          <aside data-agent-slot="windows" className="flex h-full flex-col bg-[var(--bg-panel)]">
            <AgentSlotHeader>窗口</AgentSlotHeader>
            <AgentSlotNote>右侧窗面板将在后续接入。可替换本栏。</AgentSlotNote>
          </aside>
        </Panel>
      </PanelGroup>
    </div>
  );
}
