"use client";

import type { ReactNode } from "react";
import { ExternalLink, Maximize2, Minimize2, Minus, X } from "lucide-react";
import clsx from "clsx";

interface WindowChromeProps {
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  isMinimized?: boolean;
  children: ReactNode;
  onDragStart?: (event: React.PointerEvent) => void;
  showExternalLink?: boolean;
  onExternalLink?: () => void;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
}

function TrafficButton({
  tone,
  title,
  onClick,
  children,
}: {
  tone: "close" | "minimize" | "fullscreen";
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      data-no-drag
      onClick={onClick}
      title={title}
      className={clsx(
        "group flex h-3 w-3 items-center justify-center rounded-full border text-black/55 transition-colors",
        tone === "close" && "border-[#df514b] bg-[#ff5f57] hover:bg-[#ff4740]",
        tone === "minimize" && "border-[#d39c1d] bg-[#ffbd2e] hover:bg-[#f5aa13]",
        tone === "fullscreen" && "border-[#13a238] bg-[#28c840] hover:bg-[#20b837]",
      )}
    >
      <span className="opacity-0 transition-opacity group-hover:opacity-100">{children}</span>
    </button>
  );
}

export default function WindowChrome({
  title,
  icon,
  onClose,
  onMinimize,
  onFullscreen,
  isFullscreen,
  children,
  onDragStart,
  showExternalLink,
  onExternalLink,
  actions,
  className,
  bodyClassName,
}: WindowChromeProps) {
  return (
    <div className={clsx("flex h-full min-h-0 flex-col overflow-hidden", className)}>
      <div
        onPointerDown={isFullscreen ? undefined : onDragStart}
        className={clsx(
          "window-chrome-header relative flex min-h-8 shrink-0 items-center justify-center border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] px-3",
          isFullscreen ? "cursor-default" : "cursor-grab",
        )}
        style={{ userSelect: "none", touchAction: "none" }}
      >
        <div className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2">
          <TrafficButton tone="close" title="关闭" onClick={onClose}>
            <X size={9} strokeWidth={3} />
          </TrafficButton>
          <TrafficButton tone="minimize" title="最小化" onClick={onMinimize}>
            <Minus size={9} strokeWidth={3} />
          </TrafficButton>
          <TrafficButton tone="fullscreen" title={isFullscreen ? "还原" : "全屏"} onClick={onFullscreen}>
            {isFullscreen ? <Minimize2 size={8} strokeWidth={3} /> : <Maximize2 size={8} strokeWidth={3} />}
          </TrafficButton>
        </div>

        <div className="pointer-events-none absolute inset-x-24 top-1/2 flex min-w-0 -translate-y-1/2 items-center justify-center gap-1.5 text-[13px] font-semibold text-[var(--md-sys-color-on-surface)]">
          {icon && <span className="shrink-0 text-[var(--md-sys-color-primary)]">{icon}</span>}
          <span className="min-w-0 truncate">{title}</span>
        </div>

        <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-end gap-1">
          {actions}
          {showExternalLink && (
            <button
              type="button"
              data-no-drag
              onClick={onExternalLink}
              title="在新标签页打开"
              className="press flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--md-sys-color-surface-variant)]"
            >
              <ExternalLink size={15} />
            </button>
          )}
        </div>
      </div>
      <div className={clsx("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </div>
  );
}
