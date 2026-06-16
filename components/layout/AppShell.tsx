"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import { useStore } from "@/lib/store";
import { manifest } from "@/content/manifest";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import NotesPane from "@/components/notes/NotesPane";
import PipPlayer from "@/components/video/PipPlayer";

function TopBar() {
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const chapterId = useStore((s) => s.activeChapterId);
  const sectionId = useStore((s) => s.activeSectionId);

  const crumb = useMemo(() => {
    const ch = manifest.chapters.find((c) => c.id === chapterId);
    const sec = ch?.sections.find((s) => s.id === sectionId);
    return { ch, sec };
  }, [chapterId, sectionId]);

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-[var(--line)] bg-[var(--bg-panel)] px-3">
      <button
        onClick={toggleSidebar}
        title={sidebarCollapsed ? "展开导航" : "收起导航"}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--accent)] text-[13px] font-bold text-white">
          概
        </span>
        <span className="text-[15px] font-semibold tracking-tight">
          {manifest.course}
        </span>
        <span className="ml-1 rounded-md bg-[var(--bg-muted)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--ink-faint)]">
          辅助学习
        </span>
      </div>
      <div className="ml-2 flex min-w-0 items-center gap-1.5 text-[13px] text-[var(--ink-faint)]">
        {crumb.ch && (
          <>
            <span className="shrink-0">·</span>
            <span className="shrink-0 truncate">
              第{crumb.ch.number}章 {crumb.ch.title}
            </span>
            {crumb.sec && (
              <>
                <span className="shrink-0 text-[var(--ink-faint)]">/</span>
                <span className="truncate font-medium text-[var(--ink-soft)]">
                  {crumb.sec.id} {crumb.sec.title}
                </span>
              </>
            )}
          </>
        )}
      </div>
    </header>
  );
}

export default function AppShell() {
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useStore((s) => s.setSidebarCollapsed);
  const leftRef = useRef<ImperativePanelHandle>(null);

  // store 折叠状态 -> 面板命令式同步
  useEffect(() => {
    const panel = leftRef.current;
    if (!panel) return;
    if (sidebarCollapsed && !panel.isCollapsed()) panel.collapse();
    else if (!sidebarCollapsed && panel.isCollapsed()) panel.expand();
  }, [sidebarCollapsed]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-app)]">
      <TopBar />
      <div className="min-h-0 flex-1">
        <PanelGroup direction="horizontal" autoSaveId="gailvlun-layout-v1">
          <Panel
            ref={leftRef}
            id="sidebar"
            order={1}
            collapsible
            collapsedSize={0}
            minSize={13}
            defaultSize={19}
            maxSize={34}
            onCollapse={() => setSidebarCollapsed(true)}
            onExpand={() => setSidebarCollapsed(false)}
          >
            <Sidebar />
          </Panel>

          <PanelResizeHandle className="group relative w-px bg-[var(--line)] outline-none data-[resize-handle-state=drag]:bg-[var(--accent)]">
            <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="block h-7 w-1 rounded-full bg-[var(--accent)]/40" />
            </span>
          </PanelResizeHandle>

          <Panel id="notes" order={2} minSize={32} defaultSize={50}>
            <NotesPane />
          </Panel>

          <PanelResizeHandle className="group relative w-px bg-[var(--line)] outline-none data-[resize-handle-state=drag]:bg-[var(--accent)]">
            <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="block h-7 w-1 rounded-full bg-[var(--accent)]/40" />
            </span>
          </PanelResizeHandle>

          <Panel id="right" order={3} minSize={22} defaultSize={31}>
            <RightPanel />
          </Panel>
        </PanelGroup>
      </div>
      <PipPlayer />
    </div>
  );
}
