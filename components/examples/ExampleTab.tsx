"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import type { ExampleDetail, ExampleListItem } from "@/lib/content/loader";
import { fadeInUpVariants } from "@/lib/motion";
import LazyVisible from "@/components/ui/LazyVisible";
import { SkeletonLine } from "@/components/notes/NoteSkeleton";

const NoteRenderer = dynamic(() => import("@/components/notes/NoteRenderer"), {
  ssr: false,
  loading: () => <div className="py-8 text-center text-[13px] text-[var(--ink-faint)]">加载中…</div>,
});

function EmptyExamples({ sectionId }: { sectionId: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--bg-elevated)] p-8 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[var(--accent-weak)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      </div>
      <h3 className="text-[16px] font-semibold">本节暂无例题</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-[14px] leading-relaxed text-[var(--ink-soft)]">
        「{sectionId || "本节"}」的例题正在整理中，敬请期待。
      </p>
    </div>
  );
}

interface ExampleTabProps {
  initialExamples: ExampleListItem[];
  sectionId: string;
  subjectId: string;
  chapterId: string;
}

export default function ExampleTab({
  initialExamples,
  sectionId,
  subjectId,
  chapterId,
}: ExampleTabProps) {
  const examples = initialExamples;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ExampleDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    setSelectedId(null);
    setSelected(null);
  }, [sectionId]);

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      return;
    }
    let cancelled = false;
    setLoadingDetail(true);
    const params = new URLSearchParams({
      chapterId,
      sectionId,
      subjectId,
      id: selectedId,
    });
    void fetch(`/api/examples?${params}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { example?: ExampleDetail } | null) => {
        if (!cancelled) setSelected(data?.example ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, chapterId, sectionId, subjectId]);

  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-10">
      <div className="mb-6">
        <div className="text-[13px] font-semibold text-[var(--accent)]">例题精讲</div>
        <h2 className="mt-1 text-[22px] font-bold tracking-tight text-[var(--ink)]">
          {sectionId} · 例题列表
        </h2>
        <p className="mt-1.5 text-[14px] text-[var(--ink-soft)]">
          点击例题卡片查看完整解答与易错点分析。
        </p>
      </div>

      {examples.length === 0 ? (
        <EmptyExamples sectionId={sectionId} />
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="wait">
            {!selectedId && (
              <motion.div
                key="list"
                variants={fadeInUpVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col gap-2.5"
              >
                {examples.map((ex, idx) => (
                  <LazyVisible key={ex.id} placeholder={<SkeletonLine height={76} className="rounded-xl" />}>
                  <button
                    onClick={() => setSelectedId(ex.id)}
                    className="hover-lift group flex w-full items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--md-sys-color-surface-container-lowest)] p-4 text-left transition-shadow"
                  >
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--accent-weak)] text-[12px] font-bold text-[var(--accent-ink)]">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-semibold text-[var(--ink)]">{ex.title}</div>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-1 shrink-0 text-[var(--ink-faint)] transition-transform group-hover:translate-x-0.5"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                  </LazyVisible>
                ))}
              </motion.div>
            )}

            {selectedId && (
              <motion.div
                key="detail"
                variants={fadeInUpVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <button
                  onClick={() => setSelectedId(null)}
                  className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--md-sys-color-primary)]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                  返回例题列表
                </button>
                {loadingDetail || !selected ? (
                  <div className="py-8 text-center text-[13px] text-[var(--ink-faint)]">加载例题正文…</div>
                ) : (
                  <div className="prose-notes animate-fade-in">
                    <NoteRenderer content={selected.content} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
