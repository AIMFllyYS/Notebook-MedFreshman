"use client";

import { useEffect, useRef, useState } from "react";
import { BookmarkCheck, MonitorPlay, MoreHorizontal, Sparkles } from "lucide-react";
import type { ManagedWindow } from "@/lib/hooks/useWindowManager";

interface OverflowMenuProps {
  windows: ManagedWindow[];
  onToggle: (id: string) => void;
}

function WindowIcon({ type }: { type: ManagedWindow["type"] }) {
  if (type === "floating-chat") return <Sparkles size={14} />;
  if (type === "record-preview") return <BookmarkCheck size={14} />;
  return <MonitorPlay size={14} />;
}

export default function OverflowMenu({ windows, onToggle }: OverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (windows.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title="更多窗口"
        className="press flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-[7000] min-w-52 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--bg-panel)] py-1 shadow-xl">
          {windows.map((win) => (
            <button
              key={win.id}
              type="button"
              onClick={() => {
                onToggle(win.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[var(--ink)] hover:bg-[var(--bg-muted)]"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)]">
                <WindowIcon type={win.type} />
              </span>
              <span className="min-w-0 flex-1 truncate">{win.title}</span>
              {win.badge && win.badge > 1 && (
                <span className="text-[11px] text-[var(--ink-faint)]">{win.badge}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
