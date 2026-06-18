"use client";

import { memo } from "react";
import { useStore } from "@/lib/store";
import { getInteractivesForSection } from "./registry";
import LazyVisible from "@/components/ui/LazyVisible";

function InteractiveTabBase() {
  const activeSubjectId = useStore((s) => s.activeSubjectId);
  const chapterId = useStore((s) => s.activeChapterId);
  const sectionId = useStore((s) => s.activeSectionId);
  const items = getInteractivesForSection(activeSubjectId, chapterId, sectionId);

  return (
    <div className="scroll-y h-full px-3 py-4">
      <p className="mb-3 px-1 text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
        可交互内容 · {sectionId}
      </p>
      {items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center px-6 text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-weak)] text-[var(--accent-ink)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
          </div>
          <h3 className="text-[14px] font-semibold">本节交互内容即将生成</h3>
          <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-[var(--ink-faint)]">
            将提供可点击、拖动的 SVG / 图表式可视化，帮助直观理解本节知识本质。
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {items.map((item) => {
            const C = item.Component;
            return (
              <LazyVisible
                key={item.id}
                placeholder={<div className="h-48 rounded-xl border border-[var(--line)] bg-[var(--bg-muted)] animate-shimmer" />}
              >
                <div className="animate-scale-in">
                  <h3 className="text-[14px] font-semibold text-[var(--ink)]">{item.title}</h3>
                  {item.description && (
                    <p className="mb-2 mt-0.5 text-[12.5px] leading-relaxed text-[var(--ink-faint)]">
                      {item.description}
                    </p>
                  )}
                  <C />
                </div>
              </LazyVisible>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(InteractiveTabBase);
