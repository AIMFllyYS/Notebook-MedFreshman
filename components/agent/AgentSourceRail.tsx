"use client";

import { useCallback } from "react";
import { BookOpen, Globe, Link2 } from "lucide-react";
import { openSourceTrace } from "@/lib/chat/openSourceTrace";
import { sourceItemKey } from "@/lib/chat/openSourceTrace";
import type { SourceRound, TraceSource } from "@/lib/chat/traceSources";
import { useStore } from "@/lib/stores/ui";
import { useT } from "@/lib/i18n";
import { labelRounds } from "./sourceRoundLabel";

/** 卡片副标题：网页取 host，笔记取面包屑路径。 */
function sourceMeta(source: TraceSource): string {
  if (source.kind === "note") return source.path || "";
  try {
    return new URL(source.url).hostname.replace(/^www\./, "");
  } catch {
    return source.url || "";
  }
}

/**
 * 右侧固定来源栏（Perplexity 口径）。
 *
 * 为什么不再用浮层卡片：浮层是**叠在正文上**的，宽一点的正文（比如笔记图片卡）会钻到它底下。
 * 这里改成对话列旁边的一条**真实列**：正文自己被压窄，两者永不重叠。
 *
 * 右栏一展开就整条隐藏 —— 那时用户已经在看完整的来源面板，再留一条栏纯属重复；
 * 点任意一张卡也会走同一条路：开面板 + 展开右栏。
 */
export default function AgentSourceRail({
  rounds,
  sources,
}: {
  rounds: SourceRound[];
  sources: TraceSource[];
}) {
  const t = useT();
  const setAgentDockCollapsed = useStore((state) => state.setAgentDockCollapsed);

  const openAt = useCallback(
    (source: TraceSource, index: number) => {
      if (!sources.length) return;
      openSourceTrace(sources, { rounds: labelRounds(rounds, t), activeKey: sourceItemKey(source, index) });
      setAgentDockCollapsed(false);
    },
    [rounds, setAgentDockCollapsed, sources, t],
  );

  if (sources.length === 0) return null;

  return (
    <aside
      data-testid="agent-source-rail"
      className="flex h-full min-h-0 w-[268px] shrink-0 flex-col border-l border-[var(--line-soft)] bg-[var(--bg-panel)]"
    >
      <header className="flex h-11 shrink-0 items-center gap-1.5 border-b border-[var(--line-soft)] px-3">
        <Link2 size={14} className="shrink-0 text-[var(--accent)]" />
        <span className="text-[12.5px] font-semibold text-[var(--ink)]">
          {t("agent.sources.count", { count: sources.length })}
        </span>
      </header>

      <div className="scroll-y flex min-h-0 flex-1 flex-col gap-1.5 px-2 py-2">
        {sources.map((source, index) => (
          <button
            key={sourceItemKey(source, index)}
            type="button"
            onClick={() => openAt(source, index)}
            title={t("agent.sources.openPanel")}
            className="press flex w-full min-w-0 flex-col gap-1 rounded-lg border border-[var(--line-soft)] bg-[var(--bg-panel)] px-2.5 py-2 text-left hover:border-[var(--accent)] hover:bg-[var(--bg-muted)]"
          >
            <span className="flex min-w-0 items-start gap-1.5">
              <span className="mt-[1px] shrink-0 text-[11px] font-semibold tabular-nums text-[var(--ink-faint)]">
                {index + 1}
              </span>
              {source.kind === "web" ? (
                <Globe size={13} className="mt-[2px] shrink-0 text-[var(--ink-faint)]" />
              ) : (
                <BookOpen size={13} className="mt-[2px] shrink-0 text-[var(--ink-faint)]" />
              )}
              {/* 标题最多两行：来源栏要能"读摘要"，一行标题 + 两行摘要是它的信息密度上限。 */}
              <span className="line-clamp-2 min-w-0 flex-1 text-[12.5px] font-medium leading-[1.35] text-[var(--ink)]">
                {source.title}
              </span>
            </span>
            {source.snippet ? (
              <span className="line-clamp-3 pl-[18px] text-[11.5px] leading-[1.5] text-[var(--ink-soft)]">
                {source.snippet}
              </span>
            ) : null}
            <span className="truncate pl-[18px] text-[10.5px] text-[var(--ink-faint)]">
              {sourceMeta(source) || t("agent.sources.noLink")}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
