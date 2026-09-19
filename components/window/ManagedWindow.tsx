"use client";

import { useEffect, useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import WindowChrome from "@/components/window/WindowChrome";
import {
  useManagedWindowChrome,
  type FullscreenTarget,
} from "@/lib/hooks/useManagedWindowChrome";
import { useWindowManager, type WindowSize } from "@/lib/hooks/useWindowManager";
import { isAgentWorkspace } from "@/lib/stores/workspace";
import { useAppMode } from "@/lib/stores/appMode";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useAgentDockRuntime, activateManagedSurface } from "@/lib/window/agentDockRuntime";
import {
  isManagedWindowInteractive,
  resolveManagedWindowPresentation,
} from "@/lib/window/presentation";
import { useDockTypingFocusGuard } from "@/lib/window/dockTypingFocus";

export type { FullscreenTarget };

export interface ManagedWindowProps {
  /** useWindowManager 中的窗口 id，如 `artifact-viewer:${artifactId}` */
  windowId: string;
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  /** 全屏贴合目标。默认 `notes`（对齐笔记栏），与现网 viewer 行为一致。 */
  fullscreenTarget?: FullscreenTarget;
  minSize?: { minW: number; minH: number };
  externalLink?: { onOpen: () => void; label?: string } | false;
  actions?: ReactNode;
  bodyClassName?: string;
  overlayPriority?: number;
  overlayId?: string;
  registerOverlay?: boolean;
  /** iframe 类窗口应设 true，最小化时卸载 children 以释放资源。 */
  unmountWhenMinimized?: boolean;
  className?: string;
  testId?: string;
  onResize?: (size: WindowSize) => void;
  /** 视觉覆盖（背景/阴影/圆角/动画）。几何与 display/zIndex 仍由窗口管理器决定。 */
  frameStyle?: CSSProperties;
  children: ReactNode;
}

function ResizeGrip({ onPointerDown }: { onPointerDown: (event: PointerEvent) => void }) {
  return (
    <div
      data-no-drag
      onPointerDown={onPointerDown}
      title="拖拽缩放窗口"
      style={{
        position: "absolute",
        right: 1,
        bottom: 1,
        width: 18,
        height: 18,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: 2,
        color: "var(--md-sys-color-outline)",
        cursor: "nwse-resize",
        touchAction: "none",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M11 4 L4 11" />
        <path d="M11 8 L8 11" />
      </svg>
    </div>
  );
}

/**
 * 兼容窗口壳。Studio 使用原 fixed 浮窗；Agent 桌面 Portal 到右栏稳定宿主；
 * Agent 窄屏使用 body 上的右侧 sheet。业务正文和关闭回调保持不变。
 */
export default function ManagedWindow({
  windowId,
  title,
  icon,
  onClose,
  fullscreenTarget = "notes",
  minSize,
  externalLink,
  actions,
  bodyClassName,
  overlayPriority,
  overlayId,
  registerOverlay,
  unmountWhenMinimized = false,
  className,
  testId,
  onResize,
  frameStyle,
  children,
}: ManagedWindowProps) {
  const managed = useWindowManager((state) => state.windows.find((window) => window.id === windowId));
  const appMode = useAppMode((state) => state.mode);
  const isMobile = useIsMobile();
  const dockHost = useAgentDockRuntime((state) => state.contentHost);
  const activeSurface = useAgentDockRuntime((state) => state.active);
  const dockCollapsed = useAgentDockRuntime((state) => state.collapsed);
  const agent = appMode === "agent" || isAgentWorkspace();
  const presentation = resolveManagedWindowPresentation({
    agent,
    mobile: isMobile,
    dockHostAvailable: !!dockHost,
  });
  const dockActive =
    presentation === "dock" &&
    activeSurface?.kind === "managed" &&
    activeSurface.id === windowId;
  const interactive = isManagedWindowInteractive({
    presentation,
    minimized: managed?.minimized ?? true,
    active: dockActive,
    dockCollapsed,
  });
  const escapeSuppressed = useDockTypingFocusGuard(presentation === "dock" ? dockHost : null);

  // 窄屏 sheet 覆盖整页，关闭后把焦点还给打开它的入口；桌面浮窗保持原行为。
  const sheetReturnFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (presentation !== "sheet" || typeof document === "undefined") return;
    const active = document.activeElement;
    sheetReturnFocusRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
    return () => {
      const target = sheetReturnFocusRef.current;
      sheetReturnFocusRef.current = null;
      if (!target?.isConnected) return;
      queueMicrotask(() => {
        const current = document.activeElement;
        if (current === document.body || current === null) target.focus();
      });
    };
  }, [presentation]);

  const {
    elRef,
    onPointerDown,
    onResizeStart,
    onWestResizeStart,
    toggleFullscreen,
    bringToFront,
    minimizeWindow,
  } = useManagedWindowChrome({
    windowId,
    onClose,
    fullscreenTarget,
    minSize,
    overlayPriority,
    overlayId,
    registerOverlay,
    onResize,
    presentation: presentation === "pending" ? "dock" : presentation,
    interactive,
    escapeSuppressed,
  });

  if (!managed || typeof document === "undefined" || presentation === "pending") return null;

  const showBody = !(unmountWhenMinimized && managed.minimized);
  const portalTarget = presentation === "dock" ? dockHost : document.body;
  if (!portalTarget) return null;

  const surface = presentation === "dock" ? "dock" : presentation === "sheet" ? "sheet" : "floating";
  const visible = presentation === "dock" ? dockActive && !dockCollapsed && !managed.minimized : !managed.minimized;
  const floatingFrameStyle = presentation === "floating" ? frameStyle : undefined;

  return createPortal(
    <div
      ref={elRef}
      onPointerDownCapture={() => {
        bringToFront(windowId);
        if (presentation === "dock") activateManagedSurface(windowId);
      }}
      className={className}
      data-testid={testId}
      data-surface={surface}
      role={surface === "sheet" ? "dialog" : undefined}
      aria-label={surface === "sheet" ? title : undefined}
      data-window-active={visible || undefined}
      style={{
        background: "var(--bg-panel)",
        borderRadius: presentation === "floating" && managed.fullscreen ? 0 : presentation === "floating" ? 14 : 0,
        overflow: "hidden",
        flexDirection: "column",
        boxShadow:
          presentation === "dock"
            ? "none"
            : managed.fullscreen
              ? "0 0 0 1px var(--line)"
              : "0 16px 48px rgba(0,0,0,0.3), 0 0 0 1px var(--line)",
        ...floatingFrameStyle,
        ...(presentation === "dock"
          ? {
              position: "relative",
              width: "100%",
              height: "100%",
              minWidth: 0,
              minHeight: 0,
              display: visible ? "flex" : "none",
              zIndex: 1,
            }
          : presentation === "sheet"
            ? {
                position: "fixed",
                right: 0,
                top: 0,
                width: "min(100vw, 720px)",
                height: "100dvh",
                display: visible ? "flex" : "none",
                zIndex: managed.z,
                boxShadow: "-18px 0 48px rgba(0,0,0,0.24), 0 0 0 1px var(--line)",
              }
            : {
                position: "fixed",
                left: managed.pos.x,
                top: managed.pos.y,
                width: managed.size.width,
                height: managed.size.height,
                display: visible ? "flex" : "none",
                zIndex: managed.z,
              }),
        ...(presentation === "sheet" ? { animation: "agent-window-sheet-in 180ms var(--ease-out, ease-out) both" } : {}),
      }}
    >
      <WindowChrome
        title={title}
        icon={icon}
        onClose={onClose}
        onMinimize={() => minimizeWindow(windowId)}
        onFullscreen={toggleFullscreen}
        isFullscreen={managed.fullscreen}
        isMinimized={managed.minimized}
        onDragStart={onPointerDown}
        showExternalLink={Boolean(externalLink)}
        externalLinkLabel={externalLink ? externalLink.label : undefined}
        onExternalLink={externalLink ? externalLink.onOpen : undefined}
        actions={actions}
        bodyClassName={bodyClassName}
        surface={surface}
      >
        {showBody ? children : null}
      </WindowChrome>
      {presentation === "floating" && !managed.fullscreen && !managed.minimized && isAgentWorkspace() && (
        <div
          data-no-drag
          data-testid="agent-window-widen"
          onPointerDown={onWestResizeStart}
          title="拖拽加宽"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            cursor: "ew-resize",
            touchAction: "none",
          }}
        />
      )}
      {presentation === "floating" && !managed.fullscreen && !managed.minimized && <ResizeGrip onPointerDown={onResizeStart} />}
    </div>,
    portalTarget,
  );
}
