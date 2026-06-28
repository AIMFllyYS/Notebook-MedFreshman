"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import clsx from "clsx";
import { FileText, ClipboardCheck, Lightbulb, PanelTopClose, PanelTopOpen, Maximize, Minimize, ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import SelectionPopover from "@/components/notes/SelectionPopover";
import type { SubjectId, RenderType } from "@/lib/types/content";
import type { ExampleMeta } from "@/app/api/examples/route";
import { useStore } from "@/lib/store";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { tabPanelVariants } from "@/lib/motion";
import { ComponentRenderer } from "@/lib/content/componentRegistry";
import { useToc } from "@/lib/hooks/useToc";
import WindowTaskbar from "@/components/window/WindowTaskbar";
import GlobalSearchButton from "@/components/search/GlobalSearchButton";

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
  categoryId: string;
  itemId: string;
  /** 服务端 SSR 注入的正文 markdown 原文；html/component 类型与「新标签打开」仍需要原文字符串 */
  initialContent: string | null;
  /** 服务端/构建期预渲染好的正文 React 树（仅 markdown 类型非空）；客户端不再解析 markdown */
  renderedNote?: React.ReactNode;
  /** 服务端 SSR 注入的例题列表（随路由变化重新下发） */
  initialExamples: ExampleMeta[];
  /** 例题所属小节 id（detail 分类为 itemId，否则为 ""） */
  sectionId: string;
  itemTitle: string;
  itemSummary: string;
  subjectName: string;
  categoryName: string;
  itemStatus: string;
  renderType?: RenderType;
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
  subjectId,
  categoryId,
  itemId,
  initialContent,
  renderedNote,
  initialExamples,
  sectionId,
  itemTitle,
  itemSummary,
  subjectName,
  categoryName,
  renderType = 'markdown',
}: ContentPageClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<ContentTab>("content");
  const topBarCollapsed = useStore((s) => s.topBarCollapsed);
  const toggleTopBar = useStore((s) => s.toggleTopBar);
  const isMobile = useIsMobile();
  const [htmlFullscreenItem, setHtmlFullscreenItem] = useState<string | null>(null);
  const isHtmlFullscreen = htmlFullscreenItem === itemId;

  // markdown 模式显示全部 Tab；html / component 模式只显示正文 Tab（无例题/测试）
  const visibleTabs = renderType === 'markdown' ? CONTENT_TABS : CONTENT_TABS.filter((t) => t.id === 'content');

  const tabIndex = visibleTabs.findIndex((t) => t.id === activeTab);
  const prevTabIndexRef = useRef(tabIndex);
  const [tabDirection, setTabDirection] = useState<1 | -1>(1);

  // 正文由服务端 SSR 注入（initialContent）。客户端切换路由时 page.tsx 会重新做
  // 服务端渲染并以新 prop 下发，无需再 fetch /api/section，消除瀑布与骨架闪烁。
  const content = initialContent;

  // 路由→store 的同步已上移到 AppShell（覆盖所有分类），此处不再处理。

  // TOC 提取：仅在正文 Tab 且 markdown 类型时扫描 DOM 标题构建目录树
  useToc(
    containerRef,
    activeTab === 'content' && renderType === 'markdown',
    itemId,
    initialContent ?? '',
  );

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 });
  }, [itemId]);

  // HTML 全屏时锁定 body 滚动，退出时恢复。
  useEffect(() => {
    if (isHtmlFullscreen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isHtmlFullscreen]);

  const handleOpenInNewTab = useCallback(() => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    // 延迟回收，避免新标签页尚未加载就被 revoke
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, [content]);

  return (
    <div className="relative flex h-full flex-col bg-[var(--bg-app)]" data-subject={subjectId}>
      {/* Content tab bar */}
      <div className="flex shrink-0 items-center border-b border-[var(--line)] bg-[var(--bg-app)]">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
            const newIdx = visibleTabs.findIndex((x) => x.id === t.id);
            setTabDirection(newIdx >= prevTabIndexRef.current ? 1 : -1);
            prevTabIndexRef.current = newIdx;
            setActiveTab(t.id);
          }}
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

        {!isMobile && topBarCollapsed && (
          <div className="ml-auto mr-1 flex min-w-0 flex-1 items-center justify-end gap-1 border-r border-[var(--line)] pr-2">
            <GlobalSearchButton />
            <WindowTaskbar host="content-tab" />
          </div>
        )}

        {!isMobile && (
          <button
            onClick={toggleTopBar}
            title={topBarCollapsed ? "展开顶部导航栏" : "收起顶部导航栏"}
            aria-pressed={topBarCollapsed}
            className={clsx(
              "mr-1 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]",
              !topBarCollapsed && "ml-auto",
            )}
          >
            {topBarCollapsed ? <PanelTopOpen size={18} /> : <PanelTopClose size={18} />}
          </button>
        )}

      </div>

      {/* Content area */}
      <div ref={containerRef} data-notes-root className="scroll-y flex-1">
        <AnimatePresence mode="wait">
          {activeTab === "content" && (
            <motion.div
              key="content"
              variants={tabPanelVariants(tabDirection)}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full"
            >
              <article className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-10">
                <div className="mb-5 sm:mb-7">
                  <div className="text-[12px] sm:text-[13px] font-semibold text-[var(--accent)]">
                    {subjectName} · {categoryName}
                  </div>
                  <h1 className="mt-1 sm:mt-1.5 text-[22px] sm:text-[28px] font-bold tracking-tight text-[var(--ink)]">
                    <span className="mr-1.5 sm:mr-2 font-mono text-[var(--ink-faint)]">
                      {itemId}
                    </span>
                    {itemTitle}
                  </h1>
                  {itemSummary && (
                    <p className="mt-2 sm:mt-2.5 text-[14px] sm:text-[15px] leading-relaxed text-[var(--ink-soft)]">
                      {itemSummary}
                    </p>
                  )}
                </div>

                {content ? (
                  renderType === 'html' ? (
                    <div key={itemId} className="animate-fade-in relative h-full">
                      {/* HTML 工具组件操作栏：全屏 + 新页面展开，仅作用于 iframe */}
                      <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-lg bg-black/30 px-1 py-0.5 backdrop-blur-sm">
                        <button
                          onClick={handleOpenInNewTab}
                          title="新页面展开"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/20"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          onClick={() => setHtmlFullscreenItem(itemId)}
                          title="全屏"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/20"
                        >
                          <Maximize size={14} />
                        </button>
                      </div>
                      <iframe
                        srcDoc={content}
                        sandbox="allow-scripts allow-same-origin"
                        className="h-full min-h-[60vh] w-full rounded-lg border border-[var(--line)]"
                        title={itemTitle}
                      />
                    </div>
                  ) : renderType === 'component' ? (
                    <div key={itemId} className="animate-fade-in">
                      <ComponentRenderer subjectId={subjectId} categoryId={categoryId} itemId={itemId} />
                    </div>
                  ) : (
                    <div key={itemId} className="prose-notes animate-fade-in">
                      {renderedNote}
                    </div>
                  )
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
              variants={tabPanelVariants(tabDirection)}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full"
            >
              <ExampleTab initialExamples={initialExamples} sectionId={sectionId} />
            </motion.div>
          )}
          {activeTab === "quiz" && (
            <motion.div
              key="quiz"
              variants={tabPanelVariants(tabDirection)}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full"
            >
              <QuizTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 划词助手：在正文阅读区选中文字即弹出（解释/举例/追问/引用） */}
      <SelectionPopover containerRef={containerRef} />

      {/* HTML 全屏覆盖层 */}
      {isHtmlFullscreen && content && (
        <div className="fixed inset-0 z-[100] bg-white">
          <iframe
            srcDoc={content}
            sandbox="allow-scripts allow-same-origin"
            className="h-full w-full border-0"
            title={itemTitle}
          />
          <button
            onClick={() => setHtmlFullscreenItem(null)}
            title="退出全屏"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <Minimize size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
