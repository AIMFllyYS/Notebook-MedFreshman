"use client";

import { useEffect, useDeferredValue, useRef, useState } from "react";
import dynamic from "next/dynamic";
import clsx from "clsx";
import { FileText, ClipboardCheck, Lightbulb } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import NoteRenderer from "@/components/notes/NoteRenderer";
import type { SubjectId, CategoryId } from "@/lib/types/content";
import { useStore } from "@/lib/store";

const QuizTab = dynamic(() => import("@/components/quiz/QuizTab"), { ssr: false });
const ExampleTab = dynamic(() => import("@/components/examples/ExampleTab"), { ssr: false });

type ContentTab = "content" | "examples" | "quiz";

const CONTENT_TABS: { id: ContentTab; label: string; icon: React.ReactNode }[] = [
  { id: "content", label: "正文", icon: <FileText size={14} /> },
  { id: "examples", label: "例题", icon: <Lightbulb size={14} /> },
  { id: "quiz", label: "题目测试", icon: <ClipboardCheck size={14} /> },
];

interface ContentPageClientProps {
  subjectId: SubjectId;
  categoryId: CategoryId;
  itemId: string;
  itemTitle: string;
  itemSummary: string;
  subjectName: string;
  categoryName: string;
  itemStatus: string;
}

function Skeleton() {
  return (
    <div className="animate-shimmer space-y-3">
      {[..."xxxxxxx"].map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-[var(--bg-muted)]"
          style={{ width: `${[92, 78, 96, 64, 88, 72, 90][i]}%` }}
        />
      ))}
    </div>
  );
}

function EmptyNote({ itemId, title }: { itemId: string; title: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--bg-elevated)] p-8 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[var(--accent-weak)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
      </div>
      <h3 className="text-[16px] font-semibold">本内容正在系统性撰写中</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-[14px] leading-relaxed text-[var(--ink-soft)]">
        「{itemId} {title}」的详尽原创讲解将由 AI 按 SOP 逐节生成。
      </p>
    </div>
  );
}

function itemIdToChapterId(itemId: string): string {
  const chapterNum = parseInt(itemId.split('.')[0], 10);
  return `ch${String(chapterNum).padStart(2, '0')}`;
}

export default function ContentPageClient({
  subjectId,
  categoryId,
  itemId,
  itemTitle,
  itemSummary,
  subjectName,
  categoryName,
  itemStatus,
}: ContentPageClientProps) {
  const deferredItemId = useDeferredValue(itemId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ContentTab>("content");
  const setActiveSection = useStore((s) => s.setActiveSection);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setContent(null);
    fetch(
      `/api/section?subjectId=${subjectId}&categoryId=${categoryId}&itemId=${deferredItemId}`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setContent(d.content ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [subjectId, categoryId, deferredItemId]);

  // 同步路由到 store，使右侧面板（动画讲解/可交互/AI对话上下文）随路由联动。
  // 仅当 categoryId === 'detail' 时同步（教材/录音/纪要不联动右侧面板）。
  useEffect(() => {
    if (categoryId !== "detail") return;
    const chapterId = itemIdToChapterId(deferredItemId);
    setActiveSection(subjectId, chapterId, deferredItemId);
  }, [subjectId, categoryId, deferredItemId, setActiveSection]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 });
  }, [deferredItemId]);

  return (
    <div className="relative flex h-full flex-col bg-[var(--bg-app)]">
      {/* Content tab bar */}
      <div className="flex shrink-0 border-b border-[var(--line)] bg-[var(--bg-app)]">
        {CONTENT_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={clsx(
              "relative flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium transition-colors",
              activeTab === t.id
                ? "text-[var(--md-sys-color-primary)]"
                : "text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]",
            )}
          >
            {t.icon}
            {t.label}
            {activeTab === t.id && (
              <motion.div
                layoutId="content-tab-indicator"
                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-[var(--md-sys-color-primary)]"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div ref={containerRef} data-notes-root className="scroll-y flex-1">
        <AnimatePresence mode="wait">
          {activeTab === "content" && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <article className="mx-auto w-full max-w-3xl px-8 py-10">
                <div className="mb-7">
                  <div className="text-[13px] font-semibold text-[var(--accent)]">
                    {subjectName} · {categoryName}
                  </div>
                  <h1 className="mt-1.5 text-[28px] font-bold tracking-tight text-[var(--ink)]">
                    <span className="mr-2 font-mono text-[var(--ink-faint)]">
                      {itemId}
                    </span>
                    {itemTitle}
                  </h1>
                  {itemSummary && (
                    <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--ink-soft)]">
                      {itemSummary}
                    </p>
                  )}
                </div>

                {loading ? (
                  <Skeleton />
                ) : content ? (
                  <div key={itemId} className="prose-notes animate-fade-in">
                    <NoteRenderer content={content} />
                  </div>
                ) : (
                  <div key={itemId} className="animate-fade-in">
                    <EmptyNote itemId={itemId} title={itemTitle} />
                  </div>
                )}
              </article>
            </motion.div>
          )}
          {activeTab === "examples" && (
            <motion.div
              key="examples"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <ExampleTab />
            </motion.div>
          )}
          {activeTab === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <QuizTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
