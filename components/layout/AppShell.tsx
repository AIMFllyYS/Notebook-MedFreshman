"use client";

import { useEffect, useMemo, useRef, useTransition } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { getSubject, getCategory, getContentItem } from "@/content";
import type { SubjectId, CategoryId } from "@/lib/types/content";
import SubjectSidebar from "./SubjectSidebar";
import RightPanel from "./RightPanel";

const PipPlayer = dynamic(() => import("@/components/video/PipPlayer"), { ssr: false });
const QuickExplainWindow = dynamic(() => import("@/components/chat/QuickExplainWindow"), { ssr: false });

/** 从 pathname 解析路由信息：/[subject]/[category]/[id] */
function parseRoute(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 3) {
    return {
      subjectId: segments[0] as SubjectId,
      categoryId: segments[1] as CategoryId,
      itemId: segments[2],
    };
  }
  return null;
}

function TopBar({
  subjectId,
  categoryId,
  itemId,
}: {
  subjectId: SubjectId;
  categoryId: CategoryId;
  itemId: string;
}) {
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);

  const subject = getSubject(subjectId);
  const category = getCategory(subjectId, categoryId);
  const item = getContentItem(subjectId, categoryId, itemId);

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
          {subject?.name.charAt(0) ?? "?"}
        </span>
        <span className="text-[15px] font-semibold tracking-tight">
          {subject?.name ?? ""}
        </span>
        <span className="ml-1 rounded-md bg-[var(--bg-muted)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--ink-faint)]">
          辅助学习
        </span>
      </div>
      <div className="ml-2 flex min-w-0 items-center gap-1.5 text-[13px] text-[var(--ink-faint)]">
        {category && (
          <>
            <span className="shrink-0">·</span>
            <span className="shrink-0 truncate">
              {category.name}
            </span>
            {item && (
              <>
                <span className="shrink-0 text-[var(--ink-faint)]">/</span>
                <span className="truncate font-medium text-[var(--ink-soft)]">
                  {itemId} {item.title}
                </span>
              </>
            )}
          </>
        )}
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useStore((s) => s.setSidebarCollapsed);
  const leftRef = useRef<ImperativePanelHandle>(null);
  const [, startTransition] = useTransition();

  const route = useMemo(() => parseRoute(pathname), [pathname]);

  // store 折叠状态 -> 面板命令式同步
  useEffect(() => {
    const panel = leftRef.current;
    if (!panel) return;
    if (sidebarCollapsed && !panel.isCollapsed()) panel.collapse();
    else if (!sidebarCollapsed && panel.isCollapsed()) panel.expand();
  }, [sidebarCollapsed]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-app)]">
      <TopBar
        subjectId={route?.subjectId ?? "probability"}
        categoryId={route?.categoryId ?? "detail"}
        itemId={route?.itemId ?? ""}
      />
      <div className="min-h-0 flex-1">
        <PanelGroup direction="horizontal" autoSaveId="gailvlun-layout-v2">
          <Panel
            ref={leftRef}
            id="sidebar"
            order={1}
            collapsible
            collapsedSize={0}
            minSize={13}
            defaultSize={19}
            maxSize={34}
            onCollapse={() => startTransition(() => setSidebarCollapsed(true))}
            onExpand={() => startTransition(() => setSidebarCollapsed(false))}
          >
            <SubjectSidebar />
          </Panel>

          <PanelResizeHandle className="group relative w-px bg-[var(--line)] outline-none data-[resize-handle-state=drag]:bg-[var(--accent)]">
            <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="block h-7 w-1 rounded-full bg-[var(--accent)]/40" />
            </span>
          </PanelResizeHandle>

          <Panel id="notes" order={2} minSize={32} defaultSize={50}>
            {children}
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
      <AnimatePresence>
        <PipPlayer />
      </AnimatePresence>
      <QuickExplainWindow />
    </div>
  );
}
