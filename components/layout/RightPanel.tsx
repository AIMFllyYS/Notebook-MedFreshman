"use client";

import clsx from "clsx";
import { useStore, type RightTab } from "@/lib/store";
import ChatPanel from "@/components/chat/ChatPanel";
import VideoTab from "@/components/video/VideoTab";
import InteractiveTab from "@/components/interactives/InteractiveTab";

const TABS: { id: RightTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "ai",
    label: "AI 对话",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "video",
    label: "动画讲解",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "interactive",
    label: "可交互",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.5 2.5M16.5 16.5 19 19M19 5l-2.5 2.5M7.5 16.5 5 19" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export default function RightPanel() {
  const tab = useStore((s) => s.rightTab);
  const setTab = useStore((s) => s.setRightTab);

  return (
    <div className="flex h-full flex-col border-l border-[var(--line)] bg-[var(--bg-panel)]">
      <div className="flex shrink-0 items-center gap-1 border-b border-[var(--line)] px-2 py-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
              tab === t.id
                ? "bg-[var(--accent-weak)] text-[var(--accent-ink)]"
                : "text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* 三板块全部挂载、仅切换可见性，保留各自状态 */}
      <div className="min-h-0 flex-1">
        <div className={clsx("h-full", tab === "ai" ? "block" : "hidden")}>
          <ChatPanel />
        </div>
        <div className={clsx("h-full", tab === "video" ? "block" : "hidden")}>
          <VideoTab />
        </div>
        <div className={clsx("h-full", tab === "interactive" ? "block" : "hidden")}>
          <InteractiveTab />
        </div>
      </div>
    </div>
  );
}
