"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import type { ManagedWindow } from "@/lib/hooks/useWindowManager";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { closeManagedWindow } from "@/lib/keyboard/windowActions";
import { activateManagedSurface, useAgentDockRuntime } from "@/lib/window/agentDockRuntime";
import { WindowTypeIcon } from "@/components/window/WindowTypeIcon";

export default function AgentDockTabs({
  windows,
  addContent,
}: {
  windows: ManagedWindow[];
  addContent?: ReactNode;
}) {
  const active = useAgentDockRuntime((state) => state.active);
  const { bringToFront, restoreWindow } = useWindowManager();

  const activateWindow = (window: ManagedWindow) => {
    if (window.minimized) restoreWindow(window.id);
    else bringToFront(window.id);
    activateManagedSurface(window.id);
  };

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <div
        data-testid="agent-dock-tabs"
        role="tablist"
        aria-label="工作区标签"
        className="hide-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
      >
        {windows.map((window) => {
          const selected = active?.kind === "managed" && active.id === window.id;
          return (
            <div
              key={window.id}
              role="presentation"
              className={clsx(
                "group flex min-w-0 max-w-[min(18rem,48%)] shrink-0 items-center rounded-lg border transition-colors",
                selected
                  ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
                  : "border-transparent text-[var(--ink-soft)] hover:border-[var(--line)] hover:bg-[var(--bg-muted)]",
                window.minimized && "opacity-65",
              )}
            >
              <button
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`打开 ${window.title}`}
                onClick={() => activateWindow(window)}
                className="press flex min-w-0 items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium"
              >
                <WindowTypeIcon type={window.type} icon={window.icon} data={window.data} size={14} />
                <span className="min-w-0 truncate">{window.title}</span>
              </button>
              <button
                type="button"
                aria-label={`关闭 ${window.title}`}
                onClick={(event) => {
                  event.stopPropagation();
                  closeManagedWindow(window);
                }}
                className="mr-1 grid h-5 w-5 shrink-0 place-items-center rounded-md text-[var(--ink-faint)] opacity-0 transition-opacity hover:bg-[var(--bg-panel)] hover:text-[var(--md-sys-color-error)] group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
        </div>

      {addContent}
    </div>
  );
}
