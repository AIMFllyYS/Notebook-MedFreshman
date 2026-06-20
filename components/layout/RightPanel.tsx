"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import clsx from "clsx";
import { MessageSquare, MonitorPlay, Hand, Globe, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore, type RightTab } from "@/lib/store";
import { tabPanelVariants } from "@/lib/motion";
import { useBrowser, BROWSE_TAB } from "@/lib/hooks/useBrowser";
import BrowserSettingsButton from "@/components/browser/BrowserSettingsButton";
import type { ChatContext } from "@/lib/types/chat";

const ChatPanel = dynamic(() => import("@/components/chat/ChatPanel"), { ssr: false });
const VideoTab = dynamic(() => import("@/components/video/VideoTab"), { ssr: false });
const InteractiveTab = dynamic(() => import("@/components/interactives/InteractiveTab"), { ssr: false });
const BrowserTab = dynamic(() => import("@/components/browser/BrowserTab"), { ssr: false });

const RIGHT_TABS: { id: RightTab; label: string; icon: React.ReactNode }[] = [
  { id: "ai", label: "AI 对话", icon: <MessageSquare size={15} /> },
  { id: "video", label: "动画讲解", icon: <MonitorPlay size={15} /> },
  { id: "interactive", label: "可交互", icon: <Hand size={15} /> },
  { id: "browser", label: "浏览器", icon: <Globe size={15} /> },
];

export default function RightPanel() {
  const tab = useStore((s) => s.rightTab);
  const setTab = useStore((s) => s.setRightTab);

  // 追踪方向：比较新旧 tab index 决定滑入方向
  const tabIndex = RIGHT_TABS.findIndex((t) => t.id === tab);
  const prevTabIndexRef = useRef(tabIndex);
  const dirRef = useRef<1 | -1>(1);
  const variants = tabPanelVariants(dirRef.current);
  const activeSubjectId = useStore((s) => s.activeSubjectId);
  const activeCategoryId = useStore((s) => s.activeCategoryId);
  const activeItemId = useStore((s) => s.activeItemId);

  // 浏览器收藏夹标签
  const bookmarks = useBrowser((s) => s.bookmarks);
  const activeTabId = useBrowser((s) => s.activeTabId);
  const openBrowse = useBrowser((s) => s.openBrowse);
  const openBookmark = useBrowser((s) => s.openBookmark);
  const removeBookmark = useBrowser((s) => s.removeBookmark);

  // 避免 hydration mismatch：bookmarks 源自 localStorage，SSR 时使用默认值，
  // 客户端 hydrate 后才使用 localStorage 的真实数据。
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const safeBookmarks = mounted ? bookmarks : [];

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
          {RIGHT_TABS.map((t) => {
            const isActive =
              t.id === "browser" ? tab === "browser" && activeTabId === BROWSE_TAB : tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  const newIdx = RIGHT_TABS.findIndex((x) => x.id === t.id);
                  dirRef.current = newIdx >= prevTabIndexRef.current ? 1 : -1;
                  prevTabIndexRef.current = newIdx;
                  setTab(t.id);
                  if (t.id === "browser") openBrowse();
                }}
                className={clsx(
                  "press flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-[var(--accent-weak)] text-[var(--accent-ink)]"
                    : "text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]",
                )}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}

          {/* 分隔符：核心标签 与 浏览器固定书签标签 分开 */}
          {safeBookmarks.length > 0 && (
            <span className="mx-0.5 h-5 w-px shrink-0 bg-[var(--line)]" aria-hidden />
          )}

          {/* 浏览器收藏夹标签（独立固定标签） */}
          {safeBookmarks.map((bm) => {
            const active = tab === "browser" && activeTabId === bm.id;
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
                    openBookmark(bm.id);
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

      {/* Content area */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={dirRef.current}>
          {tab === "ai" && (
            <motion.div key="ai-chat" variants={variants} initial="initial" animate="animate" exit="exit" className="h-full">
              <ChatPanel chatContext={chatContext} />
            </motion.div>
          )}
          {tab === "video" && (
            <motion.div key="video" variants={variants} initial="initial" animate="animate" exit="exit" className="h-full">
              <VideoTab />
            </motion.div>
          )}
          {tab === "interactive" && (
            <motion.div key="interactive" variants={variants} initial="initial" animate="animate" exit="exit" className="h-full">
              <InteractiveTab />
            </motion.div>
          )}
          {tab === "browser" && (
            <motion.div key="browser" variants={variants} initial="initial" animate="animate" exit="exit" className="h-full">
              <BrowserTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
