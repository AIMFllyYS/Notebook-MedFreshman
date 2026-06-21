"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { PanelTopClose, PanelTopOpen, Maximize, Minimize } from "lucide-react";
import { useStore } from "@/lib/store";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { getSubject, getCategory, getContentItem } from "@/content";
import type { SubjectId, CategoryId } from "@/lib/types/content";
import { isSubjectId, isCategoryId } from "@/lib/types/content";
import type { ChatContext } from "@/lib/types/chat";
import SubjectSidebar from "./SubjectSidebar";
import RightPanel from "./RightPanel";
import BrandLogo from "./BrandLogo";
import MobileTopBar from "./MobileTopBar";
import MobileBottomNav from "./MobileBottomNav";
import MobileChapterPicker from "./MobileChapterPicker";
import { PencilLoader, PageLoader } from "@/components/shared/ResizeLoader";

const PipPlayer = dynamic(() => import("@/components/video/PipPlayer"), { ssr: false });
const QuickExplainWindow = dynamic(() => import("@/components/chat/QuickExplainWindow"), { ssr: false });
const ChatPanel = dynamic(() => import("@/components/chat/ChatPanel"), { ssr: false });
const VideoTab = dynamic(() => import("@/components/video/VideoTab"), { ssr: false });
const InteractiveTab = dynamic(() => import("@/components/interactives/InteractiveTab"), { ssr: false });
const BrowserTab = dynamic(() => import("@/components/browser/BrowserTab"), { ssr: false });

/** 从 pathname 解析路由信息：/[subject]/[category]/[id]。
 *  科目/分类段做运行时校验，非法段返回 null（不再无脑 `as` 强转）。 */
function parseRoute(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 3) return null;
  const [subjectId, categoryId, itemId] = segments;
  if (!isSubjectId(subjectId) || !isCategoryId(categoryId)) return null;
  return { subjectId, categoryId, itemId };
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
  const topBarCollapsed = useStore((s) => s.topBarCollapsed);
  const toggleTopBar = useStore((s) => s.toggleTopBar);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      /* ignore */
    }
  }, []);

  const subject = getSubject(subjectId);
  const category = getCategory(subjectId, categoryId);
  const item = getContentItem(subjectId, categoryId, itemId);

  return (
    <header
      data-topbar
      className={clsx(
        "flex shrink-0 items-center gap-3 bg-[var(--bg-panel)] px-3 transition-all duration-300 ease-out overflow-hidden",
        topBarCollapsed ? "h-0 border-b-0 py-0" : "h-12 border-b border-[var(--line)]",
      )}
    >
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
        <span className="flex h-7 w-7 items-center justify-center">
          <BrandLogo size={24} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">
          期末复习工作站
        </span>
      </div>
      <div className="ml-2 flex min-w-0 items-center gap-1.5 text-[13px] text-[var(--ink-faint)]">
        {subject && (
          <>
            <span className="shrink-0">·</span>
            <span className="shrink-0 truncate font-medium text-[var(--ink-soft)]">
              {subject.name}
            </span>
          </>
        )}
        {category && (
          <>
            <span className="shrink-0 text-[var(--ink-faint)]">/</span>
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

      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={toggleTopBar}
          title={topBarCollapsed ? "展开顶部导航栏" : "收起顶部导航栏"}
          aria-pressed={topBarCollapsed}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
        >
          {topBarCollapsed ? <PanelTopOpen size={18} /> : <PanelTopClose size={18} />}
        </button>
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "退出全屏" : "全屏"}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useStore((s) => s.setSidebarCollapsed);
  const hydrateLayout = useStore((s) => s.hydrateLayout);
  const mobileTab = useStore((s) => s.mobileTab);
  const activeSubjectId = useStore((s) => s.activeSubjectId);
  const activeCategoryId = useStore((s) => s.activeCategoryId);
  const activeItemId = useStore((s) => s.activeItemId);
  const leftRef = useRef<ImperativePanelHandle>(null);
  const [, startTransition] = useTransition();
  const [isResizing, setIsResizing] = useState(false);
  const handleDragging = useCallback((dragging: boolean) => setIsResizing(dragging), []);

  const route = useMemo(() => parseRoute(pathname), [pathname]);
  const setActiveRoute = useStore((s) => s.setActiveRoute);

  useEffect(() => {
    if (route) setActiveRoute(route.subjectId, route.categoryId, route.itemId);
  }, [route, setActiveRoute]);

  useEffect(() => {
    hydrateLayout();
  }, [hydrateLayout]);

  useEffect(() => {
    const panel = leftRef.current;
    if (!panel) return;
    if (sidebarCollapsed && !panel.isCollapsed()) panel.collapse();
    else if (!sidebarCollapsed && panel.isCollapsed()) panel.expand();
  }, [sidebarCollapsed]);

  const chatContext: ChatContext = useMemo(
    () => ({
      subjectId: activeSubjectId,
      categoryId: activeCategoryId,
      itemId: activeItemId,
      currentTopic: `${activeSubjectId} ${activeCategoryId} ${activeItemId}`,
    }),
    [activeSubjectId, activeCategoryId, activeItemId],
  );

  // ── Mobile layout ──────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-[var(--bg-app)]">
        <MobileTopBar />

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className={clsx("h-full", mobileTab !== "detail" && "hidden")}>
            <div id="notes-panel" className="h-full">
              {children}
            </div>
          </div>
          {mobileTab === "video" && (
            <div className="h-full">
              <VideoTab />
            </div>
          )}
          {mobileTab === "ai" && (
            <div className="h-full">
              <ChatPanel chatContext={chatContext} />
            </div>
          )}
          {mobileTab === "interactive" && (
            <div className="h-full">
              <InteractiveTab />
            </div>
          )}
          {mobileTab === "browser" && (
            <div className="h-full">
              <BrowserTab />
            </div>
          )}
        </div>

        <MobileBottomNav />
        <MobileChapterPicker />
        <AnimatePresence>
          <PipPlayer />
        </AnimatePresence>
      </div>
    );
  }

  // ── Desktop layout (unchanged) ─────────────────────────────
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-app)]" data-resizing={isResizing || undefined}>
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

          <PanelResizeHandle onDragging={handleDragging} className="group relative w-px bg-[var(--line)] outline-none data-[resize-handle-state=drag]:bg-[var(--accent)]">
            <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="block h-7 w-1 rounded-full bg-[var(--accent)]/40" />
            </span>
          </PanelResizeHandle>

          <Panel id="notes" order={2} minSize={32} defaultSize={50}>
            <div className="relative h-full w-full">
              <div id="notes-panel" className="h-full w-full">
                {children}
              </div>
              {isResizing && <PageLoader />}
            </div>
          </Panel>

          <PanelResizeHandle onDragging={handleDragging} className="group relative w-px bg-[var(--line)] outline-none data-[resize-handle-state=drag]:bg-[var(--accent)]">
            <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="block h-7 w-1 rounded-full bg-[var(--accent)]/40" />
            </span>
          </PanelResizeHandle>

          <Panel id="right" order={3} minSize={22} defaultSize={31}>
            <div className="relative h-full">
              <RightPanel />
              {isResizing && <PencilLoader />}
            </div>
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
