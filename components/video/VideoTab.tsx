"use client";

import { useStore } from "@/lib/store";
import { getVideosForSection } from "@/content/media";

export default function VideoTab() {
  const chapterId = useStore((s) => s.activeChapterId);
  const sectionId = useStore((s) => s.activeSectionId);
  const openPip = useStore((s) => s.openPip);
  const videos = getVideosForSection(chapterId, sectionId);

  return (
    <div className="scroll-y h-full px-3 py-4">
      <p className="mb-3 px-1 text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
        动画讲解 · {sectionId}
      </p>
      {videos.length === 0 ? (
        <div className="mt-10 flex flex-col items-center px-6 text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-weak)] text-2xl">
            🎬
          </div>
          <h3 className="text-[14px] font-semibold">本节动画讲解即将生成</h3>
          <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-[var(--ink-faint)]">
            将由 Manim 按本节知识点渲染一到多个 MP4 动画，支持小窗播放。
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {videos.map((v) => (
            <button
              key={v.id}
              onClick={() => openPip(v)}
              className="hover-lift group overflow-hidden rounded-xl border border-[var(--line)] bg-white text-left transition-shadow"
            >
              <div className="relative aspect-video w-full bg-gradient-to-br from-[#ece9ff] to-[#e6f7f1]">
                {v.poster && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.poster} alt={v.title} className="h-full w-full object-cover" />
                )}
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-white/85 text-[var(--accent-ink)] shadow-md transition-transform group-hover:scale-110">
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
          ))}
        </div>
      )}
    </div>
  );
}
