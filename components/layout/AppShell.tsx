"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
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
import { PanelTopClose, PanelTopOpen, PanelRightOpen, Maximize, Minimize } from "lucide-react";
import { useStore } from "@/lib/stores/ui";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useAcademicYear } from "@/lib/hooks/useAcademicYear";
import { getSubject, getCategory, getContentItem } from "@/lib/content-data";
import { DEFAULT_SUBJECT } from "@/lib/constants/subjects";
import { NOTES_PANEL_ID } from "@/lib/constants/layout";
import type { SubjectId } from "@/lib/types/content";
import { resolveRouteLayout } from "@/lib/content/routeLayout";
import type { ChatContext } from "@/lib/types/chat";
import SubjectSidebar from "./SubjectSidebar";
import RightPanel from "./RightPanel";
import BrandLogo from "./BrandLogo";
import MobileTopBar from "./MobileTopBar";
import MobileBottomNav from "./MobileBottomNav";
import MobileChapterPicker from "./MobileChapterPicker";
import { ChatSkeleton, PageLoader } from "@/components/shared/ResizeLoader";
import WindowTaskbar from "@/components/window/WindowTaskbar";
import GlobalSearchButton from "@/components/search/GlobalSearchButton";
import KeyboardShortcutProvider from "@/components/keyboard/KeyboardShortcutProvider";
import { formatShortcut } from "@/lib/keyboard/format";
import { useKeyboardSettings } from "@/lib/keyboard/useKeyboardSettings";

const PipPlayer = dynamic(() => import("@/components/video/PipPlayer"), { ssr: false });
const FloatingChatLayer = dynamic(() => import("@/components/chat/FloatingChatLayer"), { ssr: false });
const RecordPreviewLayer = dynamic(() => import("@/components/review/RecordPreviewLayer"), { ssr: false });
const ArtifactViewer = dynamic(() => import("@/components/chat/ArtifactViewer"), { ssr: false });
const ImageGenViewerLayer = dynamic(() => import("@/components/chat/ImageGenViewer"), { ssr: false });
const DocumentViewerLayer = dynamic(() => import("@/components/chat/DocumentViewer"), { ssr: false });
const NoteCitationViewer = dynamic(() => import("@/components/chat/NoteCitationViewer"), { ssr: false });
const SourceTraceViewer = dynamic(() => import("@/components/chat/SourceTraceViewer"), { ssr: false });
const SourcePreviewViewer = dynamic(() => import("@/components/chat/SourcePreviewViewer"), { ssr: false });
const MessageContextMenu = dynamic(() => import("@/components/shared/MessageContextMenu"), { ssr: false });
const BillingDashboardLayer = dynamic(() => import("@/components/chat/BillingDashboard"), { ssr: false });
const ChatPanel = dynamic(() => import("@/components/chat/ChatPanel"), { ssr: false });
const VideoTab = dynamic(() => import("@/components/video/VideoTab"), { ssr: false });
const InteractiveTab = dynamic(() => import("@/components/interactives/InteractiveTab"), { ssr: false });
const BrowserTab = dynamic(() => import("@/components/browser/BrowserTab"), { ssr: false });

function TopBar({
  subjectId,
  categoryId,
  itemId,
}: {
  subjectId: SubjectId;
  categoryId: string;
  itemId: string;
}) {
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const topBarCollapsed = useStore((s) => s.topBarCollapsed);
  const toggleTopBar = useStore((s) => s.toggleTopBar);
  const sidebarShortcutEnabled = useKeyboardSettings((s) => s.isEnabled("global.toggleSidebar"));

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
        title={
          sidebarShortcutEnabled
            ? `${sidebarCollapsed ? "展开导航" : "收起导航"} ${formatShortcut("global.toggleSidebar")}`
            : sidebarCollapsed ? "展开导航" : "收起导航"
        }
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

      <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-1">
        {!topBarCollapsed && (
          <div className="mr-1 flex min-w-0 flex-1 items-center justify-end gap-1 border-r border-[var(--line)] pr-2">
            <GlobalSearchButton />
            <WindowTaskbar host="topbar" />
          </div>
        )}
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
  const rightRef = useRef<ImperativePanelHandle>(null);
  const sidebarPersistReadyRef = useRef(false);
  const rightPersistReadyRef = useRef(false);
  const [, startTransition] = useTransition();
  const [isResizing, setIsResizing] = useState(false);
  const handleDragging = useCallback((dragging: boolean) => setIsResizing(dragging), []);

  const routeLayout = useMemo(() => resolveRouteLayout(pathname), [pathname]);
  const route = routeLayout.route;
  const setActiveRoute = useStore((s) => s.setActiveRoute);
  const setTocData = useStore((s) => s.setTocData);
  const rightCollapsedByProfile = useStore((s) => s.rightCollapsedByProfile);
  const setRightCollapsedForProfile = useStore((s) => s.setRightCollapsedForProfile);

  const rightCollapsed = routeLayout.showRightPanel
    ? rightCollapsedByProfile[routeLayout.profile]
    : false;

  useLayoutEffect(() => {
    hydrateLayout();
    if (route) setActiveRoute(route.subjectId, route.categoryId, route.itemId);
  }, [hydrateLayout, route, setActiveRoute]);

  // TOC 数据只由内容页的 useToc 产出；离开内容页（首页 / review 等）时清掉，
  // 否则目录视图会残留上一页的标题树，点击也无法滚动（目标 DOM 已不存在）。
  // 内容页 → 内容页导航不清空，由新页面 hook 重建，避免闪烁。
  useEffect(() => {
    if (!route) setTocData([], null);
  }, [route, setTocData]);

  useLayoutEffect(() => {
    sidebarPersistReadyRef.current = false;
    rightPersistReadyRef.current = false;
  }, [routeLayout.profile]);

  useEffect(() => {
    const panel = leftRef.current;
    if (!panel) return;
    if (sidebarCollapsed && !panel.isCollapsed()) panel.collapse();
    else if (!sidebarCollapsed && panel.isCollapsed()) panel.expand();
    const id = window.setTimeout(() => {
      sidebarPersistReadyRef.current = true;
    }, 0);
    return () => window.clearTimeout(id);
  }, [sidebarCollapsed]);

  useEffect(() => {
    const panel = rightRef.current;
    if (!panel || !routeLayout.showRightPanel) return;
    if (rightCollapsed && !panel.isCollapsed()) panel.collapse();
    else if (!rightCollapsed && panel.isCollapsed()) panel.expand();
    const id = window.setTimeout(() => {
      rightPersistReadyRef.current = true;
    }, 0);
    return () => window.clearTimeout(id);
  }, [rightCollapsed, routeLayout.showRightPanel, routeLayout.profile]);

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

  // ── Mobile layout ──────────────────────────────────────────
  if (isMobile) {
    return (
      <KeyboardShortcutProvider>
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-[var(--bg-app)]" data-subject={route?.subjectId ?? activeSubjectId ?? DEFAULT_SUBJECT}>
        <MobileTopBar />

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className={clsx("h-full", mobileTab !== "detail" && "hidden")}>
            {/* 被 ManagedWindow fullscreenTarget="notes" 用作全屏对齐目标，勿改 id */}
            <div id={NOTES_PANEL_ID} className="h-full">
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
        <FloatingChatLayer />
        <RecordPreviewLayer />
        <ArtifactViewer />
        <ImageGenViewerLayer />
        <DocumentViewerLayer />
        <NoteCitationViewer />
        <SourceTraceViewer />
        <SourcePreviewViewer />
        <MessageContextMenu />
        <BillingDashboardLayer />
      </div>
      </KeyboardShortcutProvider>
    );
  }

  // ── Desktop layout (unchanged) ─────────────────────────────
  return (
    <KeyboardShortcutProvider>
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-app)]" data-resizing={isResizing || undefined} data-subject={route?.subjectId ?? activeSubjectId ?? DEFAULT_SUBJECT} data-layout-profile={routeLayout.profile}>
      <TopBar
        subjectId={route?.subjectId ?? DEFAULT_SUBJECT}
        categoryId={route?.categoryId ?? "detail"}
        itemId={route?.itemId ?? ""}
      />
      <div className="min-h-0 flex-1">
        <PanelGroup
          key={routeLayout.profile}
          direction="horizontal"
          autoSaveId={routeLayout.profile === "full" ? "gailvlun-layout-v2" : `gailvlun-layout-v2-${routeLayout.profile}`}
        >
          <Panel
            ref={leftRef}
            id="sidebar"
            order={1}
            collapsible
            collapsedSize={0}
            minSize={13}
            defaultSize={19}
            maxSize={34}
            onCollapse={() => {
              if (!sidebarPersistReadyRef.current) return;
              startTransition(() => setSidebarCollapsed(true));
            }}
            onExpand={() => {
              if (!sidebarPersistReadyRef.current) return;
              startTransition(() => setSidebarCollapsed(false));
            }}
          >
            <SubjectSidebar />
          </Panel>

          <PanelResizeHandle onDragging={handleDragging} className="group relative w-px bg-[var(--line)] outline-none data-[resize-handle-state=drag]:bg-[var(--accent)]">
            <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="block h-7 w-1 rounded-full bg-[var(--accent)]/40" />
            </span>
          </PanelResizeHandle>

          <Panel id="notes" order={2} minSize={32} defaultSize={routeLayout.showRightPanel ? 50 : 81}>
            <div className="relative h-full w-full">
              {/* 被 ManagedWindow fullscreenTarget="notes" 用作全屏对齐目标，勿改 id */}
              <div id={NOTES_PANEL_ID} className="h-full w-full">
                {children}
              </div>
              {routeLayout.showRightPanel && (
                <button
                  type="button"
                  data-expand-ai
                  onClick={() => setRightCollapsedForProfile(routeLayout.profile, false)}
                  title="展开 AI 面板"
                  aria-label="展开 AI 面板"
                  className="absolute right-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-1 rounded-l-lg border border-r-0 border-[var(--line)] bg-[var(--bg-panel)] px-1.5 py-3 text-[11px] font-medium text-[var(--ink-soft)] hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]"
                >
                  <PanelRightOpen size={16} />
                  <span>AI</span>
                </button>
              )}
              {isResizing && <PageLoader />}
            </div>
          </Panel>

          {routeLayout.showRightPanel && (
            <>
              <PanelResizeHandle onDragging={handleDragging} className="group relative w-px bg-[var(--line)] outline-none data-[resize-handle-state=drag]:bg-[var(--accent)]">
                <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="block h-7 w-1 rounded-full bg-[var(--accent)]/40" />
                </span>
              </PanelResizeHandle>

              <Panel
                ref={rightRef}
                id="right"
                order={3}
                collapsible
                collapsedSize={0}
                minSize={22}
                defaultSize={rightCollapsed ? 0 : 31}
                onCollapse={() => {
                  if (!rightPersistReadyRef.current) return;
                  startTransition(() => setRightCollapsedForProfile(routeLayout.profile, true));
                }}
                onExpand={() => {
                  if (!rightPersistReadyRef.current) return;
                  startTransition(() => setRightCollapsedForProfile(routeLayout.profile, false));
                }}
              >
                <div id="right-panel" className="relative h-full">
                  <RightPanel />
                  {isResizing && <ChatSkeleton />}
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
      <AnimatePresence>
        <PipPlayer />
      </AnimatePresence>
      <FloatingChatLayer />
      <RecordPreviewLayer />
      <ArtifactViewer />
      <ImageGenViewerLayer />
      <DocumentViewerLayer />
      <NoteCitationViewer />
      <SourceTraceViewer />
      <SourcePreviewViewer />
      <MessageContextMenu />
      <BillingDashboardLayer />
    </div>
    </KeyboardShortcutProvider>
  );
}
