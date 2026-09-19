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
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { PanelTopClose, PanelTopOpen, PanelRightOpen, Maximize, Minimize } from "lucide-react";
import { useStore } from "@/lib/stores/ui";
import { useAgentDockRuntime } from "@/lib/window/agentDockRuntime";
import AgentDockColumn from "./AgentDockColumn";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useAcademicYear } from "@/lib/hooks/useAcademicYear";
import { getSubject, getCategory, getContentItem } from "@/lib/content-data";
import { DEFAULT_SUBJECT } from "@/lib/constants/subjects";
import { NOTES_PANEL_ID, RIGHT_PANEL_ID } from "@/lib/constants/layout";
import type { SubjectId } from "@/lib/types/content";
import { isSubjectReviewPath, resolveRouteLayout } from "@/lib/content/routeLayout";
import type { ChatContext } from "@/lib/types/chat";
import {
  appModeFromPathname,
  hrefForMobileAppMode,
  resolveAppMode,
  resolveMobileAppMode,
  usesMobileStudioChrome,
  usesStudioChrome,
} from "@/lib/constants/app-mode";
import { useAppMode } from "@/lib/stores/appMode";
import { hydrateSettings } from "@/lib/stores/settings";
import SubjectSidebar from "./SubjectSidebar";
import RightPanel from "./RightPanel";
import ModeSwitcher from "./ModeSwitcher";
import MobileTopBar from "./MobileTopBar";
import MobileBottomNav from "./MobileBottomNav";
import MobileChapterPicker from "./MobileChapterPicker";
import MobileReviewHub from "./MobileReviewHub";
import MobileSettingsPanel from "./MobileSettingsPanel";
import MobileSidebarDrawer from "./MobileSidebarDrawer";
import MobileMiniChat from "./MobileMiniChat";
import { ChatSkeleton, PageLoader } from "@/components/shared/ResizeLoader";
import WindowTaskbar from "@/components/window/WindowTaskbar";
import GlobalSearchButton from "@/components/search/GlobalSearchButton";
import KeyboardShortcutProvider from "@/components/keyboard/KeyboardShortcutProvider";
import { formatShortcut } from "@/lib/keyboard/format";
import { useKeyboardSettings } from "@/lib/keyboard/useKeyboardSettings";
import ToastHost from "@/components/shared/ToastHost";
import LoginOverlay from "@/components/auth/LoginOverlay";

const PipPlayer = dynamic(() => import("@/components/video/PipPlayer"), { ssr: false });
const DeferredWindowLayers = dynamic(() => import("@/components/window/DeferredWindowLayers"), { ssr: false });
const ChatPanel = dynamic(() => import("@/components/chat/ChatPanel"), { ssr: false });
const AgentSettingsOverlay = dynamic(() => import("@/components/chat/AgentSettingsOverlay"), { ssr: false });
const BrowserTab = dynamic(() => import("@/components/browser/BrowserTab"), { ssr: false });

function TopBar({
  subjectId,
  categoryId,
  itemId,
  hideWindowTaskbar = false,
  agentMode = false,
  dockOpen = false,
  onToggleDock,
}: {
  subjectId: SubjectId;
  categoryId: string;
  itemId: string;
  hideWindowTaskbar?: boolean;
  /** Agent 工作区：顶栏只留品牌 + 全屏 + 右侧工作区开关，面包屑/全局搜索/收起顶栏都不在这里。 */
  agentMode?: boolean;
  /** 右侧工作区当前是否展开（Agent 模式）。 */
  dockOpen?: boolean;
  onToggleDock?: () => void;
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
      {!agentMode && <button
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
      </button>}
      <ModeSwitcher />
      {!agentMode && <div className="ml-2 flex min-w-0 items-center gap-1.5 text-[13px] text-[var(--ink-faint)]">
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
      </div>}

      <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-1">
        {!topBarCollapsed && !agentMode && (
          <div className="mr-1 flex min-w-0 flex-1 items-center justify-end gap-1 border-r border-[var(--line)] pr-2">
            <GlobalSearchButton />
            {!hideWindowTaskbar && <WindowTaskbar host="topbar" />}
          </div>
        )}
        {!agentMode && (
          <button
            onClick={toggleTopBar}
            title={topBarCollapsed ? "展开顶部导航栏" : "收起顶部导航栏"}
            aria-pressed={topBarCollapsed}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
          >
            {topBarCollapsed ? <PanelTopOpen size={18} /> : <PanelTopClose size={18} />}
          </button>
        )}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "退出全屏" : "全屏"}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
        {agentMode && (
          <button
            onClick={onToggleDock}
            title={dockOpen ? "收起右侧工作区" : "展开右侧工作区"}
            aria-label={dockOpen ? "收起右侧工作区" : "展开右侧工作区"}
            aria-pressed={dockOpen}
            data-testid="agent-dock-toggle"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
          >
            <PanelRightOpen size={18} />
          </button>
        )}
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const isMobile = useIsMobile();
  const hydrateMode = useAppMode((s) => s.hydrate);
  const syncFromPathname = useAppMode((s) => s.syncFromPathname);
  const rememberStudioPath = useAppMode((s) => s.rememberStudioPath);
  const persistedMode = useAppMode((s) => s.mode);
  const lastStudioPath = useAppMode((s) => s.lastStudioPath);
  const resolvedMode = isMobile
    ? resolveMobileAppMode(pathname, persistedMode)
    : resolveAppMode(pathname, persistedMode);
  const studioChrome = isMobile ? usesMobileStudioChrome(pathname) : usesStudioChrome(pathname);
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
  /** 只有 /agent 这一条路由用 Agent 专用外壳（左对话栏 + 中央对话 + 通顶的右侧工作区）。 */
  const isAgentRoute = !isMobile && appModeFromPathname(pathname) === "agent";
  const agentLayoutProfile = useStore((s) => s.layoutProfile);
  const agentDockCollapsed = useStore((s) => s.rightCollapsedByProfile[s.layoutProfile] ?? false);
  const agentDockRef = useRef<ImperativePanelHandle>(null);
  const registerPanelControls = useAgentDockRuntime((s) => s.registerPanelControls);
  const setActiveRoute = useStore((s) => s.setActiveRoute);
  const setTocData = useStore((s) => s.setTocData);
  const rightCollapsedByProfile = useStore((s) => s.rightCollapsedByProfile);
  const setRightCollapsedForProfile = useStore((s) => s.setRightCollapsedForProfile);

  const rightCollapsed = routeLayout.showRightPanel
    ? rightCollapsedByProfile[routeLayout.profile]
    : false;

  // 顶栏开关 / 面板自身收起按钮改的是 store，这里把它同步到分栏面板上。
  useEffect(() => {
    if (!isAgentRoute) return;
    const panel = agentDockRef.current;
    if (!panel) return;
    try {
      if (agentDockCollapsed && !panel.isCollapsed()) panel.collapse();
      if (!agentDockCollapsed && panel.isCollapsed()) panel.expand();
    } catch {
      // 首帧还没有几何信息
    }
  }, [agentDockCollapsed, isAgentRoute]);

  useEffect(() => {
    if (!isAgentRoute) return;
    registerPanelControls({
      collapse: () => agentDockRef.current?.collapse(),
      expand: () => agentDockRef.current?.expand(),
      toggleExpand: () => {
        const panel = agentDockRef.current;
        if (!panel) return;
        try {
          if (panel.isCollapsed()) {
            panel.expand();
            return;
          }
          panel.resize(panel.getSize() < 45 ? 46 : 34);
        } catch {
          // react-resizable-panels 在首帧还没有几何信息，下一次用户操作会重试
        }
      },
    });
    return () => registerPanelControls(null);
  }, [isAgentRoute, registerPanelControls]);

  useLayoutEffect(() => {
    hydrateLayout();
    hydrateMode();
    // 本机设置只能在客户端水合之后应用；首帧保持 DEFAULTS 才不会 hydration mismatch。
    hydrateSettings();
    syncFromPathname(pathname, { retainAgentOnStudio: isMobile });
    rememberStudioPath(pathname);
    if (route) setActiveRoute(route.subjectId, route.categoryId, route.itemId);
  }, [hydrateLayout, hydrateMode, syncFromPathname, rememberStudioPath, pathname, route, setActiveRoute, isMobile]);

  useEffect(() => {
    if (!isMobile || appModeFromPathname(pathname) !== "agent") return;
    const target = hrefForMobileAppMode("agent", lastStudioPath);
    if (target !== pathname) router.replace(target);
  }, [isMobile, pathname, lastStudioPath, router]);

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

  const isReviewRoute = isSubjectReviewPath(pathname);
  const showLessonPane =
    mobileTab === "detail" || (mobileTab === "review" && isReviewRoute);

  // ── Mobile layout ──────────────────────────────────────────
  const mobileSidebarOpen = useStore((s) => s.mobileSidebarOpen);
  const closeMobileSidebar = useStore((s) => s.setMobileSidebarOpen);

  if (isMobile) {
    return (
      <KeyboardShortcutProvider>
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-[var(--bg-app)]" data-app-mode={resolvedMode} data-subject={route?.subjectId ?? activeSubjectId ?? DEFAULT_SUBJECT} data-mobile-sidebar={mobileSidebarOpen || undefined}>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {studioChrome && <MobileSidebarDrawer />}
          <div
            className={clsx("mobile-shell-page flex h-full min-h-0 flex-col", mobileSidebarOpen && "is-shifted")}
          >
            <MobileTopBar />
            <div className="relative min-h-0 flex-1 overflow-hidden">
              {!studioChrome ? (
                <div className="absolute inset-0">{children}</div>
              ) : (
                <>
                  <div className={clsx("absolute inset-0", !showLessonPane && "invisible pointer-events-none")}>
                    {/* 被 ManagedWindow fullscreenTarget="notes" 用作全屏对齐目标，勿改 id */}
                    <div id={NOTES_PANEL_ID} className="h-full">
                      {children}
                    </div>
                  </div>
                  {mobileTab === "review" && !isReviewRoute && (
                    <div className="absolute inset-0">
                      <MobileReviewHub />
                    </div>
                  )}
                  {mobileTab === "ai" && (
                    <div className="absolute inset-0">
                      <ChatPanel chatContext={chatContext} />
                    </div>
                  )}
                  {mobileTab === "browser" && (
                    <div className="absolute inset-0">
                      <BrowserTab />
                    </div>
                  )}
                  {mobileTab === "settings" && (
                    <div className="absolute inset-0">
                      <MobileSettingsPanel />
                    </div>
                  )}
                  {studioChrome && <MobileMiniChat chatContext={chatContext} />}
                </>
              )}
              {mobileSidebarOpen && (
                <button
                  type="button"
                  className="mobile-sidebar-backdrop"
                  aria-label="关闭侧栏"
                  data-testid="mobile-sidebar-backdrop"
                  onClick={() => closeMobileSidebar(false)}
                />
              )}
            </div>
          </div>
        </div>

        {studioChrome && <MobileBottomNav />}
        {studioChrome && <MobileChapterPicker />}
        <AnimatePresence>
          <PipPlayer />
        </AnimatePresence>
        <DeferredWindowLayers />
        <AgentSettingsOverlay />
        <LoginOverlay />
        <ToastHost />
      </div>
      </KeyboardShortcutProvider>
    );
  }

  // ── Agent desktop layout：右侧工作区是独立一列，通到窗口最顶（与顶栏最上沿平齐）──
  if (isAgentRoute) {
    return (
      <KeyboardShortcutProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--bg-app)]" data-resizing={isResizing || undefined} data-app-mode={resolvedMode} data-subject={activeSubjectId} data-layout-profile={agentLayoutProfile} data-agent-shell>
        <PanelGroup direction="horizontal" autoSaveId="studysolo-agent-shell-v1" className="h-full min-h-0 w-full">
          <Panel id="agent-shell-main" order={1} minSize={36}>
            <div className="flex h-full min-h-0 flex-col">
              <TopBar
                subjectId={route?.subjectId ?? DEFAULT_SUBJECT}
                categoryId={route?.categoryId ?? "detail"}
                itemId={route?.itemId ?? ""}
                hideWindowTaskbar
                agentMode
                dockOpen={!agentDockCollapsed}
                onToggleDock={() => setRightCollapsedForProfile(agentLayoutProfile, !agentDockCollapsed)}
              />
              <div className="min-h-0 flex-1">{children}</div>
            </div>
          </Panel>
          <PanelResizeHandle
            onDragging={handleDragging}
            className="group relative w-px bg-[var(--line)] outline-none data-[resize-handle-state=drag]:bg-[var(--accent)]"
          >
            <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="block h-7 w-1 rounded-full bg-[var(--accent)]/40" />
            </span>
          </PanelResizeHandle>
          <Panel
            ref={agentDockRef}
            id="agent-shell-dock"
            order={2}
            collapsible
            collapsedSize={0}
            defaultSize={agentDockCollapsed ? 0 : 34}
            minSize={20}
            maxSize={58}
            onCollapse={() => setRightCollapsedForProfile(agentLayoutProfile, true)}
            onExpand={() => setRightCollapsedForProfile(agentLayoutProfile, false)}
          >
            <AgentDockColumn />
          </Panel>
        </PanelGroup>
        {/* 业务窗口/全局浮层必须与 Studio 一样挂在这个壳里，否则右栏会出现"有标签没正文"。 */}
        <DeferredWindowLayers />
        <AgentSettingsOverlay />
        <LoginOverlay />
        <AnimatePresence>
          <PipPlayer />
        </AnimatePresence>
        <ToastHost />
      </div>
      </KeyboardShortcutProvider>
    );
  }

  // ── Desktop layout (unchanged) ─────────────────────────────
  return (
    <KeyboardShortcutProvider>
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-app)]" data-resizing={isResizing || undefined} data-app-mode={resolvedMode} data-subject={route?.subjectId ?? activeSubjectId ?? DEFAULT_SUBJECT} data-layout-profile={routeLayout.profile}>
      <TopBar
        subjectId={route?.subjectId ?? DEFAULT_SUBJECT}
        categoryId={route?.categoryId ?? "detail"}
        itemId={route?.itemId ?? ""}
        hideWindowTaskbar={resolvedMode === "agent"}
        agentMode={resolvedMode === "agent"}
      />
      {!studioChrome ? (
      <div className="min-h-0 flex-1">
        {children}
      </div>
      ) : (
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
                <div id={RIGHT_PANEL_ID} className="relative h-full">
                  <RightPanel />
                  {isResizing && <ChatSkeleton />}
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
      )}
      <AnimatePresence>
        <PipPlayer />
      </AnimatePresence>
      <DeferredWindowLayers />
      <AgentSettingsOverlay />
      <LoginOverlay />
      <ToastHost />
    </div>
    </KeyboardShortcutProvider>
  );
}
