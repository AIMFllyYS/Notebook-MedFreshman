"use client";

import { FileText, MonitorPlay, MessageSquare, Hand, Globe } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useStore, type MobileTab } from "@/lib/store";

const TABS: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
  { id: "detail", label: "详解", icon: <FileText size={20} /> },
  { id: "video", label: "动画", icon: <MonitorPlay size={20} /> },
  { id: "ai", label: "AI对话", icon: <MessageSquare size={20} /> },
  { id: "interactive", label: "交互", icon: <Hand size={20} /> },
  { id: "browser", label: "浏览器", icon: <Globe size={20} /> },
];

export default function MobileBottomNav() {
  const tab = useStore((s) => s.mobileTab);
  const setTab = useStore((s) => s.setMobileTab);

  return (
    <nav className="mobile-bottom-nav shrink-0 border-t border-[var(--line)] bg-[var(--bg-panel)]/85">
      <div
        className="flex items-end justify-around"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 pt-2 pb-1.5 transition-colors",
                active
                  ? "text-[var(--accent)]"
                  : "text-[var(--ink-faint)]",
              )}
            >
              {active && (
                <motion.span
                  layoutId="mobile-nav-pill"
                  className="absolute top-0.5 h-[3px] w-8 rounded-full bg-[var(--accent)]"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="flex h-7 w-7 items-center justify-center">
                {t.icon}
              </span>
              <span className="text-[10px] font-medium leading-tight">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
