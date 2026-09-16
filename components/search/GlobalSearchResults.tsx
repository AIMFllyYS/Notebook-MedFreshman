"use client";

import { BookOpen, Layers, StickyNote, ArrowUpRight } from "lucide-react";
import { SkeletonLine } from "@/components/notes/NoteSkeleton";
import { GLOBAL_SEARCH_SECTIONS, type GlobalSearchHit } from "@/lib/search/globalSearch";

const SECTION_ICON = {
  flashcard: Layers,
  note: StickyNote,
  body: BookOpen,
} as const;

function SearchHitSkeleton() {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5" data-search-skeleton>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--bg-muted)]">
        <SkeletonLine width={16} height={16} className="rounded-md" />
      </span>
      <span className="min-w-0 flex-1 space-y-1.5">
        <SkeletonLine width="46%" height={14} />
        <SkeletonLine width="72%" height={11} />
      </span>
    </div>
  );
}

function HitButton({
  hit,
  icon: Icon,
  onOpen,
}: {
  hit: GlobalSearchHit;
  icon: typeof BookOpen;
  onOpen: (hit: GlobalSearchHit) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(hit)}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[var(--bg-muted)]"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)]">
        <Icon size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold text-[var(--ink)]">{hit.title}</span>
        <span className="block truncate text-[12px] text-[var(--ink-faint)]">{hit.breadcrumbs}</span>
        {hit.snippet && (
          <span className="mt-0.5 block truncate text-[12px] text-[var(--ink-soft)]">{hit.snippet}</span>
        )}
      </span>
      <ArrowUpRight size={14} className="shrink-0 text-[var(--ink-faint)]" />
    </button>
  );
}

interface GlobalSearchResultsProps {
  query: string;
  noteHits: GlobalSearchHit[];
  cardHits: GlobalSearchHit[];
  bodyHits: GlobalSearchHit[];
  notesLoading: boolean;
  cardsLoading: boolean;
  bodyLoading: boolean;
  onOpen: (hit: GlobalSearchHit) => void;
}

export default function GlobalSearchResults({
  query,
  noteHits,
  cardHits,
  bodyHits,
  notesLoading,
  cardsLoading,
  bodyLoading,
  onOpen,
}: GlobalSearchResultsProps) {
  if (!query.trim()) {
    return (
      <div className="px-4 py-10 text-center text-[13px] text-[var(--ink-faint)]">
        输入关键词，跨学年检索章节、正文、笔记和闪卡
      </div>
    );
  }

  const sections = [
    { id: "flashcard" as const, hits: cardHits, loading: cardsLoading },
    { id: "note" as const, hits: noteHits, loading: notesLoading },
    { id: "body" as const, hits: bodyHits, loading: bodyLoading },
  ];
  const visible = sections.filter((section) => section.loading || section.hits.length > 0);

  if (visible.length === 0) {
    return <div className="px-4 py-10 text-center text-[13px] text-[var(--ink-faint)]">没有匹配结果</div>;
  }

  return (
    <div className="flex flex-col gap-1">
      {visible.map((section) => {
        const meta = GLOBAL_SEARCH_SECTIONS.find((item) => item.id === section.id)!;
        const Icon = SECTION_ICON[section.id];
        return (
          <section
            key={section.id}
            role="region"
            data-search-section={section.id}
            aria-label={meta.label}
            className="pb-1"
          >
            <h3 className="px-3 pb-1 pt-2 text-[11px] font-semibold tracking-wide text-[var(--ink-faint)]">
              {meta.label}
            </h3>
            {section.hits.map((hit) => (
              <HitButton key={hit.id} hit={hit} icon={Icon} onOpen={onOpen} />
            ))}
            {section.loading && (
              <>
                <SearchHitSkeleton />
                <SearchHitSkeleton />
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}
