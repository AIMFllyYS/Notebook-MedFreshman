"use client";

import { useCallback } from "react";
import { BookOpen, Globe, Link2, Search } from "lucide-react";
import { openSourceTrace, sourceItemKey } from "@/lib/chat/openSourceTrace";
import type { SourceRound, TraceSource } from "@/lib/chat/traceSources";
import { useStore } from "@/lib/stores/ui";
import { useT } from "@/lib/i18n";
import { sourceRoundLabelKey } from "./sourceRoundLabel";

/**
 * 「来源」页签：这条对话检索过的**所有轮次**，每轮带着它的搜索词。
 *
 * 与右上角来源框分工：来源框是常驻入口（只显示条数与前几个 host），
 * 这里是把"搜了什么 → 查到什么"整条链路摊开看的地方。
 */
export default function AgentLinksPane({
  rounds,
  sources,
}: {
  rounds: SourceRound[];
  sources: TraceSource[];
}) {
  const t = useT();
  const setAgentDockCollapsed = useStore((state) => state.setAgentDockCollapsed);

  const openAll = useCallback(
    (activeKey: string) => {
      if (!sources.length) return;
      // 不再预贴 label：SourceTraceViewer 的兜底就是 trace.tool.<tool>.label，与上面那行同源。
      openSourceTrace(sources, { rounds, activeKey });
      setAgentDockCollapsed(false);
    },
    [rounds, setAgentDockCollapsed, sources],
  );

  if (rounds.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center" data-testid="agent-links-empty">
        <p className="max-w-[320px] text-[13px] leading-relaxed text-[var(--ink-soft)]">{t("agent.links.empty")}</p>
      </div>
    );
  }

  return (
    <div className="scroll-y h-full min-h-0 px-4 py-4" data-testid="agent-links-pane">
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5">
        {rounds.map((round) => (
          <section key={round.id} className="min-w-0">
            <header className="mb-2 flex items-center gap-2">
              <Search size={13} className="shrink-0 text-[var(--accent)]" />
              <span className="text-[12px] font-semibold text-[var(--ink)]">{t(sourceRoundLabelKey(round.tool))}</span>
              {round.query ? (
                <span
                  className="min-w-0 truncate rounded-md bg-[var(--bg-muted)] px-1.5 py-0.5 text-[11.5px] text-[var(--ink-soft)]"
                  title={round.query}
                >
                  {t("agent.sources.query", { query: round.query })}
                </span>
              ) : null}
              <span className="ml-auto shrink-0 text-[11px] text-[var(--ink-faint)]">
                {t("agent.sources.count", { count: round.sources.length })}
              </span>
            </header>
            <ul className="flex flex-col gap-1">
              {round.sources.map((source) => {
                const index = Math.max(0, sources.indexOf(source));
                return (
                  <li key={sourceItemKey(source, index)} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => openAll(sourceItemKey(source, index))}
                      className="press flex w-full min-w-0 items-center gap-2 rounded-lg border border-[var(--line-soft)] bg-[var(--bg-panel)] px-2.5 py-2 text-left hover:border-[var(--accent)]"
                    >
                      {source.kind === "web" ? (
                        <Globe size={14} className="shrink-0 text-[var(--ink-faint)]" />
                      ) : (
                        <BookOpen size={14} className="shrink-0 text-[var(--ink-faint)]" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-[var(--ink)]">{source.title}</span>
                        <span className="block truncate text-[11.5px] text-[var(--ink-faint)]">
                          {source.kind === "note" ? source.path : source.url || t("agent.sources.noLink")}
                        </span>
                      </span>
                      <Link2 size={13} className="shrink-0 text-[var(--ink-faint)]" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
