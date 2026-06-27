"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookmarkCheck, MonitorPlay, Sparkles } from "lucide-react";
import { useWindowManager, type ManagedWindow } from "@/lib/hooks/useWindowManager";
import OverflowMenu from "@/components/window/OverflowMenu";

interface WindowTaskbarProps {
  host: "topbar" | "content-tab";
}

const ICON_SLOT = 32;

function WindowIcon({ type }: { type: ManagedWindow["type"] }) {
  if (type === "floating-chat") return <Sparkles size={15} />;
  if (type === "record-preview") return <BookmarkCheck size={15} />;
  return <MonitorPlay size={15} />;
}

export function partitionTaskbarWindows(
  windows: ManagedWindow[],
  host: WindowTaskbarProps["host"],
  width: number,
) {
  if (windows.length === 0) return { visible: [] as ManagedWindow[], overflow: [] as ManagedWindow[] };
  const reserved = host === "topbar" ? 80 : 40;
  const maxWidth = Math.max(0, width - reserved);
  if (maxWidth < ICON_SLOT) return { visible: [] as ManagedWindow[], overflow: windows };

  const needsOverflow = windows.length * ICON_SLOT > maxWidth;
  const overflowSlot = needsOverflow ? 1 : 0;
  const maxVisible = Math.max(0, Math.floor(maxWidth / ICON_SLOT) - overflowSlot);
  return {
    visible: windows.slice(0, maxVisible),
    overflow: windows.slice(maxVisible),
  };
}

export default function WindowTaskbar({ host }: WindowTaskbarProps) {
  const windows = useWindowManager((state) => state.windows);
  const { minimizeWindow, restoreWindow } = useWindowManager();
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { visible, overflow } = useMemo(() => {
    return partitionTaskbarWindows(windows, host, width);
  }, [host, width, windows]);

  const toggle = (id: string) => {
    const win = useWindowManager.getState().windows.find((item) => item.id === id);
    if (!win) return;
    if (win.minimized) restoreWindow(id);
    else minimizeWindow(id);
  };

  if (windows.length === 0) {
    return <div ref={ref} className="min-w-0 flex-1" />;
  }

  return (
    <motion.div
      ref={ref}
      layoutId="window-taskbar"
      className="flex min-w-0 flex-1 flex-row-reverse items-center gap-1 overflow-visible"
      transition={{ type: "spring", stiffness: 480, damping: 38 }}
    >
      {overflow.length > 0 && <OverflowMenu windows={overflow} onToggle={toggle} />}
      {visible.map((win) => (
        <button
          key={win.id}
          type="button"
          onClick={() => toggle(win.id)}
          title={win.title}
          className="group relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)] hover:text-[var(--md-sys-color-primary)]"
        >
          <WindowIcon type={win.type} />
          {win.badge && win.badge > 1 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--md-sys-color-primary)] px-1 text-[10px] font-semibold leading-none text-[var(--md-sys-color-on-primary)]">
              {win.badge}
            </span>
          )}
          <span className="pointer-events-none absolute right-0 top-8 z-[7000] max-w-56 translate-y-1 rounded-md border border-[var(--line)] bg-[var(--bg-panel)] px-2 py-1 text-[12px] text-[var(--ink)] opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
            {win.title}
          </span>
        </button>
      ))}
    </motion.div>
  );
}
