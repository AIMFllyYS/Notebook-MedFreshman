"use client";

import { useCallback } from "react";
import clsx from "clsx";
import { Link2 } from "lucide-react";
import { openSourceTrace } from "@/lib/chat/openSourceTrace";
import type { SourceRound, TraceSource } from "@/lib/chat/traceSources";
import { useT } from "@/lib/i18n";
import { labelRounds } from "./sourceRoundLabel";

/**
 * 来源 chip 上显示什么：网页取 host（域名比整条 URL 好认），笔记取标题。
 * 笔记**不要**退回路径尾段（"2.1" / "ch09" 这种）：它认不出是哪篇，等于白占一个位置。
 */
function sourceLabel(source: TraceSource): string {
  if (source.kind === "web") {
    try {
      return new URL(source.url).hostname.replace(/^www\./, "");
    } catch {
      return source.url || source.title;
    }
  }
  return source.title || source.path;
}

/**
 * Agent 对话右上角**固定**的来源框。
 *
 * 它解决的是"Agent 到底查了什么、我能不能核"这件事：不问用户要不要看，
 * 只要这条对话产生过来源就常驻在右上角。
 *
 * 右栏一展开就自动隐藏——那时用户已经在看完整的来源面板了，
 * 再浮一个入口只会挡住正文（这是用户明确要求的交互）。
 */
export default function AgentSourceDock({
  rounds,
  sources,
  hidden,
}: {
  rounds: SourceRound[];
  sources: TraceSource[];
  /** 右栏已展开、或不在回答页签时由上层置 true。 */
  hidden: boolean;
}) {
  const t = useT();
  const open = useCallback(() => {
    if (!sources.length) return;
    // 带上 rounds：右侧面板会按检索轮次分组，用户能看出"搜了什么"。
    openSourceTrace(sources, rounds.length ? { rounds: labelRounds(rounds, t) } : undefined);
  }, [rounds, sources, t]);

  if (hidden || sources.length === 0) return null;

  const preview = sources.slice(0, 3).map(sourceLabel);

  return (
    <button
      type="button"
      onClick={open}
      title={t("agent.sources.openPanel")}
      aria-label={t("agent.sources.openPanel")}
      data-testid="agent-source-dock"
      className={clsx(
        "press absolute right-4 top-3 z-20 flex max-w-[260px] flex-col items-start gap-1.5",
        "rounded-xl border border-[var(--line-soft)] bg-[var(--bg-panel)]/95 px-3 py-2 text-left",
        "shadow-[0_6px_20px_rgba(0,0,0,0.16)] backdrop-blur",
        "hover:border-[var(--accent)]",
      )}
    >
      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--ink)]">
        <Link2 size={13} className="shrink-0 text-[var(--accent)]" />
        {t("agent.sources.count", { count: sources.length })}
      </span>
      <span className="flex flex-wrap items-center gap-1">
        {preview.map((label, index) => (
          <span
            key={`${label}:${index}`}
            className="max-w-[96px] truncate rounded-md bg-[var(--bg-muted)] px-1.5 py-0.5 text-[11px] text-[var(--ink-soft)]"
          >
            {label}
          </span>
        ))}
        {sources.length > preview.length ? (
          <span className="text-[11px] text-[var(--ink-faint)]">+{sources.length - preview.length}</span>
        ) : null}
      </span>
    </button>
  );
}
