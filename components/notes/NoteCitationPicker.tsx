"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, BookmarkCheck, Search, X } from "lucide-react";
import { navTree } from "@/lib/content-data/nav";
import { subjectColor } from "@/lib/content-data/subjects.registry";
import { useReviewCards } from "@/lib/hooks/useReviewCards";
import { cardRefDirective, noteRefDirective } from "@/lib/notes/noteCitations";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";
import type { ContentItem } from "@/lib/types/content";

export type CitationPickerKind = "note" | "card";

export interface NoteCitationPickerProps {
  kind: CitationPickerKind;
  /** 限定科目；null = 跨科目搜索。 */
  subjectId: string | null;
  /** 选中后回调，参数是可直接插入正文的 Markdown 指令行。选择器不负责写入。 */
  onPick: (markdown: string) => void;
  onClose: () => void;
}

interface Candidate {
  key: string;
  /** 主标题。 */
  title: string;
  /** 面包屑 / 来源说明。 */
  meta: string;
  /** 该科目主色，用于左侧色条。 */
  color: string;
  /** 选中后要插入的 Markdown。 */
  markdown: string;
  /** 参与搜索的文本。 */
  haystack: string;
}

/** 讲义候选：从轻量导航树摊平，跳过 stub（还没有正文的占位项，引用过去是空页）。 */
function noteCandidates(subjectId: string | null): Candidate[] {
  const out: Candidate[] = [];
  for (const subject of navTree.subjects) {
    if (subjectId && subject.id !== subjectId) continue;
    const color = subjectColor(subject.id);
    for (const category of subject.categories) {
      const walk = (items: ContentItem[], trail: string[]) => {
        for (const item of items) {
          if (item.children && item.children.length > 0) {
            walk(item.children, [...trail, item.title]);
            if (item.navigationOnly) continue;
          }
          // stub 还没有正文，navigationOnly 只是导航分组，引用过去都是空页。
          if (item.status === "stub" || item.navigationOnly || item.id === "toc") continue;
          const path = `${subject.id}/${category.id}/${item.id}`;
          const meta = [subject.name, category.name, ...trail].filter(Boolean).join(" · ");
          out.push({
            key: path,
            title: item.title,
            meta,
            color,
            markdown: noteRefDirective({ path, title: item.title, snippet: "" }),
            haystack: `${item.title} ${meta} ${path}`.toLowerCase(),
          });
        }
      };
      walk(category.items, []);
    }
  }
  return out;
}

const STATUS_LABEL: Record<string, string> = {
  saved: "原文已存，未成卡",
  processing: "AI 处理中",
  parsing: "AI 处理中",
  error: "上次处理失败",
  ready: "",
};

export default function NoteCitationPicker({
  kind,
  subjectId,
  onPick,
  onClose,
}: NoteCitationPickerProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const cardsById = useReviewCards((s) => s.byId);
  const cardOrder = useReviewCards((s) => s.order);

  const close = useCallback(() => onClose(), [onClose]);
  useOverlayRegistration({ id: "note-citation-picker", open: true, onClose: close, priority: 80 });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) close();
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [close]);

  const candidates = useMemo<Candidate[]>(() => {
    if (kind === "note") return noteCandidates(subjectId);

    return cardOrder
      .map((id) => cardsById[id])
      .filter((card) => Boolean(card) && (!subjectId || card.subjectId === subjectId))
      .reverse()
      .map((card) => {
        const label = (card.front || card.originalText).replace(/\s+/g, " ").trim();
        const status = STATUS_LABEL[card.status] ?? "";
        return {
          key: card.id,
          title: label.slice(0, 90) || "（空卡）",
          meta: [card.sourceLabel, status].filter(Boolean).join(" · "),
          color: subjectColor(card.subjectId),
          markdown: cardRefDirective({ cardId: card.id, label: label.slice(0, 60) }),
          haystack: `${label} ${card.back} ${card.sourceLabel}`.toLowerCase(),
        };
      });
  }, [kind, subjectId, cardsById, cardOrder]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? candidates.filter((c) => c.haystack.includes(q)) : candidates;
    // 候选量大（讲义近千项），只渲染前 200 条，靠搜索收敛而不是靠滚动。
    return list.slice(0, 200);
  }, [candidates, query]);

  const isNote = kind === "note";
  const Icon = isNote ? BookOpen : BookmarkCheck;
  const heading = isNote ? "引用课程讲义" : "引用复习闪卡";
  const hint = isNote
    ? "选一节讲义。笔记里会留下可点击的引用，点击后跳到该节并高亮定位。"
    : "选一张复习卡。笔记里的引用会实时跟着卡片内容变化，可就地翻面。";

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="note-picker-scrim" role="presentation">
      <div
        ref={panelRef}
        className="note-picker"
        role="dialog"
        aria-modal="true"
        aria-label={heading}
        data-no-drag
      >
        <header className="note-picker-head">
          <Icon size={15} className="note-picker-head-icon" aria-hidden="true" />
          <div className="note-picker-head-text">
            <strong>{heading}</strong>
            <small>{hint}</small>
          </div>
          <button type="button" className="note-picker-close" onClick={close} aria-label="关闭">
            <X size={15} />
          </button>
        </header>

        <label className="note-picker-search">
          <Search size={14} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isNote ? "搜索章节标题…" : "搜索卡面内容…"}
            aria-label="搜索"
          />
        </label>

        <div className="note-picker-list scroll-y">
          {filtered.length === 0 ? (
            <p className="note-picker-empty">
              {candidates.length === 0
                ? isNote
                  ? "这个科目还没有可引用的讲义。"
                  : "还没有复习卡。先去正文划词选「记录」生成几张。"
                : "没有匹配项。"}
            </p>
          ) : (
            filtered.map((candidate) => (
              <button
                key={candidate.key}
                type="button"
                className="note-picker-item"
                style={{ borderLeftColor: candidate.color }}
                onClick={() => {
                  onPick(candidate.markdown);
                  close();
                }}
              >
                <span className="note-picker-item-title">{candidate.title}</span>
                {candidate.meta ? (
                  <span className="note-picker-item-meta">{candidate.meta}</span>
                ) : null}
              </button>
            ))
          )}
        </div>

        <footer className="note-picker-foot">
          共 {candidates.length} 项{filtered.length < candidates.length ? `，显示 ${filtered.length} 项` : ""}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
