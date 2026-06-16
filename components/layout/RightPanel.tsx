"use client";

import dynamic from "next/dynamic";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useStore, type RightTab } from "@/lib/store";

const ChatPanel = dynamic(() => import("@/components/chat/ChatPanel"), { ssr: false });
const VideoTab = dynamic(() => import("@/components/video/VideoTab"), { ssr: false });
const InteractiveTab = dynamic(() => import("@/components/interactives/InteractiveTab"), { ssr: false });

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

const tabVariants = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -8, transition: { duration: 0.15, ease: [0.42, 0, 0.58, 1] } },
};

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
              "press flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
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

      <div className="min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === "ai" && (
            <motion.div key="ai" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <ChatPanel />
            </motion.div>
          )}
          {tab === "video" && (
            <motion.div key="video" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <VideoTab />
            </motion.div>
          )}
          {tab === "interactive" && (
            <motion.div key="interactive" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <InteractiveTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
