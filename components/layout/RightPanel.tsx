"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import clsx from "clsx";
import { MessageSquare, Settings, MonitorPlay, Hand, Globe, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore, type RightTab } from "@/lib/store";
import { useBrowser, normalizeUrl } from "@/lib/hooks/useBrowser";
import BrowserSettingsButton from "@/components/browser/BrowserSettingsButton";
import type { ChatContext } from "@/lib/types/chat";

const ChatPanel = dynamic(() => import("@/components/chat/ChatPanel"), { ssr: false });
const ChatSettings = dynamic(() => import("@/components/chat/ChatSettings"), { ssr: false });
const VideoTab = dynamic(() => import("@/components/video/VideoTab"), { ssr: false });
const InteractiveTab = dynamic(() => import("@/components/interactives/InteractiveTab"), { ssr: false });
const BrowserTab = dynamic(() => import("@/components/browser/BrowserTab"), { ssr: false });

type AiSubTab = "chat" | "settings";

const RIGHT_TABS: { id: RightTab; label: string; icon: React.ReactNode }[] = [
  { id: "ai", label: "AI 对话", icon: <MessageSquare size={15} /> },
  { id: "video", label: "动画讲解", icon: <MonitorPlay size={15} /> },
  { id: "interactive", label: "可交互", icon: <Hand size={15} /> },
  { id: "browser", label: "浏览器", icon: <Globe size={15} /> },
];

const AI_SUB_TABS: { id: AiSubTab; label: string; icon: React.ReactNode }[] = [
  { id: "chat", label: "对话", icon: <MessageSquare size={14} /> },
  { id: "settings", label: "设置", icon: <Settings size={14} /> },
];

const tabVariants = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -8, transition: { duration: 0.15, ease: [0.42, 0, 0.58, 1] } },
};

export default function RightPanel() {
  const tab = useStore((s) => s.rightTab);
  const setTab = useStore((s) => s.setRightTab);
  const activeSubjectId = useStore((s) => s.activeSubjectId);
  const activeCategoryId = useStore((s) => s.activeCategoryId);
  const activeItemId = useStore((s) => s.activeItemId);
  const [aiSubTab, setAiSubTab] = useState<AiSubTab>("chat");

  // 浏览器收藏夹标签
  const bookmarks = useBrowser((s) => s.bookmarks);
  const currentUrl = useBrowser((s) => s.currentUrl);
  const navigate = useBrowser((s) => s.navigate);
  const removeBookmark = useBrowser((s) => s.removeBookmark);

  const chatContext: ChatContext = useMemo(() => ({
    subjectId: activeSubjectId,
    categoryId: activeCategoryId,
    itemId: activeItemId,
    currentTopic: `${activeSubjectId} ${activeCategoryId} ${activeItemId}`,
  }), [activeSubjectId, activeCategoryId, activeItemId]);

  return (
    <div className="flex h-full flex-col border-l border-[var(--line)] bg-[var(--bg-panel)]">
      {/* Top-level tab bar（可横向滑动；含浏览器收藏夹标签 + 末尾「＋」） */}
      <div className="flex shrink-0 items-center gap-1 border-b border-[var(--line)] px-1.5 py-1.5">
        <div className="hide-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {RIGHT_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "press flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                tab === t.id
                  ? "bg-[var(--accent-weak)] text-[var(--accent-ink)]"
                  : "text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]",
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}

          {/* 浏览器收藏夹标签 */}
          {bookmarks.map((bm) => {
            const active = tab === "browser" && currentUrl === normalizeUrl(bm.url);
            return (
              <span
                key={bm.id}
                className={clsx(
                  "group flex shrink-0 items-center gap-1 rounded-lg border py-1.5 pl-2 pr-1 text-[12.5px] font-medium transition-colors",
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-weak)] text-[var(--accent-ink)]"
                    : "border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]",
                )}
              >
                <button
                  onClick={() => {
                    setTab("browser");
                    navigate(bm.url);
                  }}
                  className="press flex items-center gap-1"
                  title={bm.url}
                >
                  <Globe size={12} />
                  <span className="max-w-[88px] truncate">{bm.name}</span>
                </button>
                <button
                  onClick={() => removeBookmark(bm.id)}
                  title="移除收藏"
                  className="rounded p-0.5 text-[var(--ink-faint)] opacity-0 transition-opacity hover:text-[var(--md-sys-color-error)] group-hover:opacity-100"
                >
                  <X size={11} />
                </button>
              </span>
            );
          })}
        </div>

        <BrowserSettingsButton onAdded={() => setTab("browser")} />
      </div>

      {/* AI sub-tab bar (only when AI tab is active) */}
      {tab === "ai" && (
        <div className="flex shrink-0 border-b border-[var(--line)]">
          {AI_SUB_TABS.map((st) => (
            <button
              key={st.id}
              onClick={() => setAiSubTab(st.id)}
              className={clsx(
                "relative flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium transition-colors",
                aiSubTab === st.id
                  ? "text-[var(--md-sys-color-primary)]"
                  : "text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]",
              )}
            >
              {st.icon}
              {st.label}
              {/* Bottom border indicator */}
              {aiSubTab === st.id && (
                <motion.div
                  layoutId="ai-sub-tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-[var(--md-sys-color-primary)]"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content area */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === "ai" && aiSubTab === "chat" && (
            <motion.div key="ai-chat" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <ChatPanel chatContext={chatContext} />
            </motion.div>
          )}
          {tab === "ai" && aiSubTab === "settings" && (
            <motion.div key="ai-settings" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <ChatSettings />
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
          {tab === "browser" && (
            <motion.div key="browser" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <BrowserTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
