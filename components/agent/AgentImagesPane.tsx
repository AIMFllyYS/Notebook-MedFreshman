"use client";

import { ImageOff } from "lucide-react";
import type { AgentImageItem } from "@/lib/agent/sessionImages";
import { useLightbox } from "@/lib/stores/lightbox";
import { useT } from "@/lib/i18n";

const KIND_LABEL_KEY: Record<AgentImageItem["kind"], string> = {
  web: "agent.images.search",
  note: "agent.images.search",
  generated: "agent.images.generated",
};

/**
 * 「图片」页签：这条对话里出现过的图片（联网图搜 / 笔记配图 / 已生成）。
 *
 * 注意这里**不接管生成流程**：生成仍然在回答流里跑（用户明确要求），
 * 这个页签只是把已经产出的图收拢到一处看。
 */
export default function AgentImagesPane({ images }: { images: AgentImageItem[] }) {
  const t = useT();

  if (images.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center" data-testid="agent-images-empty">
        <ImageOff size={20} className="text-[var(--ink-faint)]" />
        <p className="max-w-[320px] text-[13px] leading-relaxed text-[var(--ink-soft)]">{t("agent.images.empty")}</p>
      </div>
    );
  }

  const groups: { kind: AgentImageItem["kind"]; items: AgentImageItem[] }[] = (
    ["generated", "web", "note"] as const
  )
    .map((kind) => ({ kind, items: images.filter((image) => image.kind === kind) }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="scroll-y h-full min-h-0 px-4 py-4" data-testid="agent-images-pane">
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-6">
        {groups.map((group) => (
          <section key={group.kind}>
            <h3 className="mb-2 text-[12px] font-semibold text-[var(--ink)]">
              {t(KIND_LABEL_KEY[group.kind])}
              <span className="ml-1.5 text-[11px] font-normal text-[var(--ink-faint)]">{group.items.length}</span>
            </h3>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
              {group.items.map((image) => (
                <li key={image.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => useLightbox.getState().open(image.src, image.alt || image.title)}
                    title={image.title}
                    className="press block w-full overflow-hidden rounded-lg border border-[var(--line-soft)] bg-[var(--bg-muted)]"
                  >
                    {/* 图片可能来自站内、Unsplash 或 data URL，统一走原生 img（已存在的图库用法）。 */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.src}
                      alt={image.alt || image.title}
                      loading="lazy"
                      className="h-[110px] w-full object-cover"
                    />
                    <span className="block truncate px-2 py-1.5 text-left text-[11.5px] text-[var(--ink-soft)]">
                      {image.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
