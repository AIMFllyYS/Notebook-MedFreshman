"use client";

import { useEffect, useDeferredValue, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { manifest } from "@/content/manifest";
import NoteRenderer from "./NoteRenderer";
import SelectionPopover from "./SelectionPopover";

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

function EmptyNote({
  chapterId,
  sectionId,
  title,
}: {
  chapterId: string;
  sectionId: string;
  title: string;
}) {
  const sendToChat = useStore((s) => s.sendToChat);
  const setRightTab = useStore((s) => s.setRightTab);
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--bg-elevated)] p-8 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[var(--accent-weak)] text-[var(--accent-ink)]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
      </div>
      <h3 className="text-[16px] font-semibold">本小节正在系统性撰写中</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-[14px] leading-relaxed text-[var(--ink-soft)]">
        「{sectionId} {title}」的详尽原创讲解将由 AI 按 SOP 逐节生成。你也可以现在就向右侧 AI 提问。
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() =>
            sendToChat(`请基于当前页面，系统、通俗地讲解「${sectionId} ${title}」这一节的核心内容、直觉与典型例子。`)
          }
          className="press rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90"
        >
          问 AI：这一节讲什么
        </button>
        <button
          onClick={() => setRightTab("interactive")}
          className="press rounded-lg bg-[var(--bg-muted)] px-4 py-2 text-[13px] font-medium text-[var(--ink-soft)] hover:bg-[var(--line)]"
        >
          看看交互内容
        </button>
      </div>
    </div>
  );
}

export default function NotesPane() {
  const activeChapterId = useStore((s) => s.activeChapterId);
  const activeSectionId = useStore((s) => s.activeSectionId);
  // 延迟读取：面板 resize 期间不急于更新内容
  const chapterId = useDeferredValue(activeChapterId);
  const sectionId = useDeferredValue(activeSectionId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setContent(null);
    fetch(`/api/section?chapterId=${chapterId}&sectionId=${sectionId}`)
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
  }, [chapterId, sectionId]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 });
  }, [chapterId, sectionId]);

  const ch = manifest.chapters.find((c) => c.id === chapterId);
  const sec = ch?.sections.find((s) => s.id === sectionId);

  return (
    <div className="relative flex h-full flex-col bg-[var(--bg-app)]">
      <div ref={containerRef} data-notes-root className="scroll-y flex-1">
        <article className="mx-auto w-full max-w-3xl px-8 py-10">
          <div className="mb-7">
            <div className="text-[13px] font-semibold text-[var(--accent)]">
              第{ch?.number}章 · {ch?.title}
            </div>
            <h1 className="mt-1.5 text-[28px] font-bold tracking-tight text-[var(--ink)]">
              <span className="mr-2 font-mono text-[var(--ink-faint)]">{sec?.id}</span>
              {sec?.title}
            </h1>
            {sec?.summary && (
              <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--ink-soft)]">
                {sec.summary}
              </p>
            )}
          </div>

          {loading ? (
            <Skeleton />
          ) : content ? (
            <div key={sectionId} className="prose-notes animate-fade-in">
              <NoteRenderer content={content} />
            </div>
          ) : (
            <div key={sectionId} className="animate-fade-in">
              <EmptyNote
                chapterId={chapterId}
                sectionId={sectionId}
                title={sec?.title ?? ""}
              />
            </div>
          )}
        </article>
      </div>
      <SelectionPopover containerRef={containerRef} />
    </div>
  );
}
