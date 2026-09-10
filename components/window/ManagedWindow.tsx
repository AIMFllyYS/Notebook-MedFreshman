"use client";

import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import WindowChrome from "@/components/window/WindowChrome";
import {
  useManagedWindowChrome,
  type FullscreenTarget,
} from "@/lib/hooks/useManagedWindowChrome";
import type { WindowSize } from "@/lib/hooks/useWindowManager";

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
 * 全局浮窗壳。portal 到 `document.body`，由 AppShell 挂载，不属于右侧面板或笔记区。
 * 拖拽 / 缩放 / 全屏 / 最小化 / Esc 只应出现在这里。
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
  const {
    managed,
    elRef,
    onPointerDown,
    onResizeStart,
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
  });

  if (!managed || typeof document === "undefined") return null;

  const showBody = !(unmountWhenMinimized && managed.minimized);

  return createPortal(
    <div
      ref={elRef}
      onPointerDownCapture={() => bringToFront(windowId)}
      className={className}
      data-testid={testId}
      style={{
        background: "var(--bg-panel)",
        borderRadius: managed.fullscreen ? 0 : 14,
        overflow: "hidden",
        flexDirection: "column",
        boxShadow: managed.fullscreen
          ? "0 0 0 1px var(--line)"
          : "0 16px 48px rgba(0,0,0,0.3), 0 0 0 1px var(--line)",
        ...frameStyle,
        ...(managed.fullscreen ? { borderRadius: 0 } : {}),
        position: "fixed",
        left: managed.pos.x,
        top: managed.pos.y,
        width: managed.size.width,
        height: managed.size.height,
        display: managed.minimized ? "none" : "flex",
        zIndex: managed.z,
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
      >
        {showBody ? children : null}
      </WindowChrome>
      {!managed.fullscreen && !managed.minimized && <ResizeGrip onPointerDown={onResizeStart} />}
    </div>,
    document.body,
  );
}
