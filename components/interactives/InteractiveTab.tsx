"use client";

import { useStore } from "@/lib/store";
import { getInteractivesForSection } from "./registry";

export default function InteractiveTab() {
  const chapterId = useStore((s) => s.activeChapterId);
  const sectionId = useStore((s) => s.activeSectionId);
  const items = getInteractivesForSection(chapterId, sectionId);

  return (
    <div className="scroll-y h-full px-3 py-4">
      <p className="mb-3 px-1 text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
        可交互内容 · {sectionId}
      </p>
      {items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center px-6 text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-weak)] text-2xl">
            🧩
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
              <div key={item.id}>
                <h3 className="text-[14px] font-semibold text-[var(--ink)]">{item.title}</h3>
                {item.description && (
                  <p className="mb-2 mt-0.5 text-[12.5px] leading-relaxed text-[var(--ink-faint)]">
                    {item.description}
                  </p>
                )}
                <C />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
