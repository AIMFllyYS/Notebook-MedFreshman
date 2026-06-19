"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import clsx from "clsx";
import { FileText, ClipboardCheck, Lightbulb } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import NoteRenderer from "@/components/notes/NoteRenderer";
import type { SubjectId, CategoryId } from "@/lib/types/content";
import type { ExampleMeta } from "@/app/api/examples/route";

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
  /** 服务端 SSR 注入的正文 markdown；null 表示该项暂无内容文件 */
  initialContent: string | null;
  /** 服务端 SSR 注入的例题列表（随路由变化重新下发） */
  initialExamples: ExampleMeta[];
  /** 例题所属小节 id（detail 分类为 itemId，否则为 ""） */
  sectionId: string;
  itemTitle: string;
  itemSummary: string;
  subjectName: string;
  categoryName: string;
  itemStatus: string;
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

export default function ContentPageClient({
  itemId,
  initialContent,
  initialExamples,
  sectionId,
  itemTitle,
  itemSummary,
  subjectName,
  categoryName,
}: ContentPageClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<ContentTab>("content");

  // 正文由服务端 SSR 注入（initialContent）。客户端切换路由时 page.tsx 会重新做
  // 服务端渲染并以新 prop 下发，无需再 fetch /api/section，消除瀑布与骨架闪烁。
  const content = initialContent;

  // 路由→store 的同步已上移到 AppShell（覆盖所有分类），此处不再处理。

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 });
  }, [itemId]);

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

                {content ? (
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
              <ExampleTab initialExamples={initialExamples} sectionId={sectionId} />
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
