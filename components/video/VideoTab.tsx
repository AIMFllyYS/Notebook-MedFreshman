"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import { getVideosForSection } from "@/content/media";

// NoteRenderer 较重（含 KaTeX/highlight），折叠讲稿展开时才懒加载
const NoteRenderer = dynamic(() => import("@/components/notes/NoteRenderer"), {
  ssr: false,
  loading: () => <div className="py-4 text-center text-[12px] text-[var(--ink-faint)]">加载讲稿…</div>,
});

export default function VideoTab() {
  const activeSubjectId = useStore((s) => s.activeSubjectId);
  const chapterId = useStore((s) => s.activeChapterId);
  const sectionId = useStore((s) => s.activeSectionId);
  const openPip = useStore((s) => s.openPip);
  const videos = getVideosForSection(activeSubjectId, chapterId, sectionId);

  // 记录每个视频卡片的讲稿展开状态，key 为视频 id
  const [expandedScripts, setExpandedScripts] = useState<Record<string, boolean>>({});
  const toggleScript = (id: string) =>
    setExpandedScripts((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="scroll-y h-full px-3 py-4">
      <p className="mb-3 px-1 text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
        动画讲解 · {sectionId}
      </p>
      {videos.length === 0 ? (
        <div className="mt-10 flex flex-col items-center px-6 text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-weak)] text-[var(--accent-ink)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </div>
          <h3 className="text-[14px] font-semibold">本节动画讲解即将生成</h3>
          <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-[var(--ink-faint)]">
            将由 Manim 按本节知识点渲染一到多个 MP4 动画，支持小窗播放。
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {videos.map((v) => {
            const hasScript = Boolean(v.scriptMd);
            const isExpanded = expandedScripts[v.id];
            return (
              <div
                key={v.id}
                className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--md-sys-color-surface-container-lowest)]"
              >
                {/* 播放区：点击打开画中画 */}
                <button
                  onClick={() => openPip(v)}
                  className="hover-lift group block w-full text-left transition-shadow"
                >
                  <div className="relative aspect-video w-full bg-gradient-to-br from-[#ece9ff] to-[#e6f7f1]">
                    {v.poster && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.poster} alt={v.title} className="h-full w-full object-cover" />
                    )}
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--md-sys-color-surface-container-lowest)]/85 text-[var(--accent-ink)] shadow-md transition-transform group-hover:scale-110">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      </span>
                    </span>
                  </div>
                  <div className="px-3 py-2.5">
                    <div className="text-[14px] font-semibold text-[var(--ink)]">{v.title}</div>
                    {v.description && (
                      <div className="mt-0.5 line-clamp-2 text-[12.5px] text-[var(--ink-faint)]">{v.description}</div>
                    )}
                  </div>
                </button>

                {/* 配套讲稿折叠区 */}
                {hasScript && (
                  <div className="border-t border-[var(--line)]">
                    <button
                      onClick={() => toggleScript(v.id)}
                      className="flex w-full items-center justify-between px-3 py-2 text-[12.5px] font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--bg-muted)]"
                    >
                      <span className="flex items-center gap-1.5">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        配套讲稿
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-[var(--line)] bg-[var(--bg-app)] px-3 py-3">
                        <div className="prose-notes max-w-none">
                          <NoteRenderer content={v.scriptMd!} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
