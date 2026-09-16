"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, Quote, Search } from "lucide-react";
import { useUserNotes } from "@/lib/hooks/useUserNotes";
import { useReviewCards } from "@/lib/hooks/useReviewCards";
import { useStore } from "@/lib/stores/ui";
import { subjectName } from "@/lib/content-data/subjects.registry";
import { citeReviewCards, citeUserNotes } from "@/lib/user-notes/workspace";
import {
  filterUserNotes,
  markdownExcerpt,
  orderedUserNotes,
  relativeTime,
} from "@/lib/user-notes/list";
import type { ComposerCitationKind } from "@/lib/hooks/useComposerCitations";
import type { ReviewCard } from "@/lib/review/types";

// 可复用的「引用到对话」选择面板：加号菜单塞进 280–320px 下拉即可，自己不管弹层。

interface CiteRow {
  id: string;
  title: string;
  subtitle: string;
  preview: string;
  /** 复习卡还没成卡时标一下，仍然允许引用（原文在）。 */
  pending?: boolean;
}

const ROW_BASE =
  "press mb-1 flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors";

function cardTitle(card: ReviewCard): string {
  return card.front?.trim() || markdownExcerpt(card.originalText);
}

export default function WorkspaceCitePanel({
  kind,
  subjectId,
  onDone,
}: {
  kind: ComposerCitationKind;
  /** 缺省用当前活动科目；面板内可切「全部科目」。 */
  subjectId?: string;
  onDone: () => void;
}) {
  const activeSubjectId = useStore((s) => s.activeSubjectId);
  const scopeSubjectId = subjectId ?? activeSubjectId;
  const [allSubjects, setAllSubjects] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const noteById = useUserNotes((s) => s.byId);
  const noteOrder = useUserNotes((s) => s.order);
  const cardById = useReviewCards((s) => s.byId);
  const cardOrder = useReviewCards((s) => s.order);

  const rows = useMemo<CiteRow[]>(() => {
    const needle = query.trim().toLowerCase();
    if (kind === "user-note") {
      return filterUserNotes(orderedUserNotes(noteById, noteOrder), {
        query,
        subjectId: allSubjects ? undefined : scopeSubjectId,
      }).map((note) => ({
          id: note.id,
          title: note.title,
          subtitle: `${subjectName(note.subjectId)} · ${relativeTime(note.updatedAt)}`,
          preview: markdownExcerpt(note.markdown),
        }));
    }
    return cardOrder
      .map((id) => cardById[id])
      .filter(Boolean)
      .filter((card) => (allSubjects ? true : card.subjectId === scopeSubjectId))
      .filter((card) =>
        needle
          ? `${card.front} ${card.back} ${card.originalText}`.toLowerCase().includes(needle)
          : true,
      )
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((card) => ({
        id: card.id,
        title: cardTitle(card),
        subtitle: card.sourceLabel || subjectName(card.subjectId),
        preview: card.back?.trim() || markdownExcerpt(card.originalText),
        pending: card.status !== "ready",
      }));
  }, [kind, query, allSubjects, scopeSubjectId, noteById, noteOrder, cardById, cardOrder]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleCite = () => {
    if (selected.length === 0) return;
    if (kind === "user-note") citeUserNotes(selected);
    else citeReviewCards(selected);
    setSelected([]);
    onDone();
  };

  const label = kind === "user-note" ? "笔记" : "闪卡";

  return (
    <div className="flex flex-col gap-1.5 p-2">
      <div className="flex items-center gap-1">
        <ScopeChip active={!allSubjects} onClick={() => setAllSubjects(false)}>
          本科目
        </ScopeChip>
        <ScopeChip active={allSubjects} onClick={() => setAllSubjects(true)}>
          全部科目
        </ScopeChip>
      </div>

      <div className="relative">
        <Search
          size={13}
          className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`搜索${label}`}
          aria-label={`搜索${label}`}
          className="h-8 w-full rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] pl-7 pr-2 text-[12.5px] text-[var(--ink)] outline-none"
          type="search"
        />
      </div>

      <div className="scroll-y max-h-[220px] min-h-0 overflow-y-auto" role="group" aria-label={`选择${label}`}>
        {rows.length === 0 ? (
          <p className="px-1 py-6 text-center text-[11.5px] leading-relaxed text-[var(--ink-faint)]">
            {query
              ? `没有匹配的${label}`
              : kind === "user-note"
                ? allSubjects
                  ? "还没有任何笔记，先在笔记工作区写一篇。"
                  : `「${subjectName(scopeSubjectId)}」还没有笔记。`
                : allSubjects
                  ? "还没有复习卡，先在正文里划词记录。"
                  : `「${subjectName(scopeSubjectId)}」还没有复习卡。`}
          </p>
        ) : (
          rows.map((row) => {
            const checked = selected.includes(row.id);
            return (
              <button
                key={row.id}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggle(row.id)}
                className={`${ROW_BASE} ${
                  checked
                    ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                    : "text-[var(--ink)] hover:bg-[var(--md-sys-color-surface-variant)]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-[2px] flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[4px] border ${
                    checked
                      ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
                      : "border-[var(--md-sys-color-outline)]"
                  }`}
                >
                  {checked ? <Check size={10} /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1">
                    <span className="truncate text-[12.5px] font-semibold">{row.title}</span>
                    {row.pending ? (
                      <span className="shrink-0 rounded px-1 text-[10px] text-[var(--md-sys-color-on-surface-variant)] ring-1 ring-[var(--md-sys-color-outline-variant)]">
                        未成卡
                      </span>
                    ) : null}
                  </span>
                  <span className="block truncate text-[11px] text-[var(--ink-faint)]">{row.subtitle}</span>
                  <span className="line-clamp-2 block text-[11px] leading-snug text-[var(--ink-soft)]">
                    {row.preview}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[var(--md-sys-color-outline-variant)] pt-2">
        <span className="text-[11px] text-[var(--ink-faint)]">已选 {selected.length} 项</span>
        <button
          type="button"
          onClick={handleCite}
          disabled={selected.length === 0}
          className="press flex items-center gap-1.5 rounded-lg bg-[var(--md-sys-color-primary)] px-2.5 py-1.5 text-[12px] font-semibold text-[var(--md-sys-color-on-primary)] disabled:opacity-40"
        >
          <Quote size={12} /> 引用到对话
        </button>
      </div>
    </div>
  );
}

function ScopeChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`press rounded-lg px-2 py-1 text-[11.5px] font-semibold transition-colors ${
        active
          ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
          : "text-[var(--ink-soft)] hover:bg-[var(--md-sys-color-surface-variant)]"
      }`}
    >
      {children}
    </button>
  );
}
