import type { ContentItem, ContentTree, SubjectId } from "@/lib/types/content";
import { academicYearOfSubject, type AcademicYearId } from "@/lib/constants/academic-year";
import { subjectLabel } from "@/lib/notes/userNote";

export type GlobalSearchKind = "chapter" | "body" | "note" | "flashcard";

export const GLOBAL_SEARCH_SECTIONS = [
  { id: "flashcard", label: "闪卡" },
  { id: "note", label: "笔记" },
  { id: "body", label: "正文" },
] as const;

export type GlobalSearchSectionId = (typeof GLOBAL_SEARCH_SECTIONS)[number]["id"];

export interface GlobalSearchEntry {
  id: string;
  subjectId: SubjectId;
  categoryId: string;
  itemId: string;
  title: string;
  summary: string;
  subjectName: string;
  categoryName: string;
  breadcrumbs: string;
  href: string;
  haystack: string;
}

export interface GlobalSearchHit {
  id: string;
  kind: GlobalSearchKind;
  title: string;
  snippet: string;
  breadcrumbs: string;
  href?: string;
  noteId?: string;
  cardId?: string;
  subjectId?: string;
  categoryId?: string;
  itemId?: string;
  score: number;
}

export const SEARCH_QUERY_MAX_CHARS = 64;
export const SEARCH_SNIPPET_RADIUS = 56;

export function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}

/** 检索用纯文本：去掉指令 / 代码块 / 标记，并顺手剥一层 HTML 标签以免误搜。 */
export function stripForSearch(text: string): string {
  return text
    .replace(/:::[a-zA-Z]+(\{[^}]*\})?/g, " ")
    .replace(/:::/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractSnippet(text: string, query: string, radius = SEARCH_SNIPPET_RADIUS): string {
  const hay = text.replace(/\s+/g, " ").trim();
  if (!hay) return "";
  const needle = query.trim();
  const idx = needle ? hay.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  if (idx < 0) {
    return hay.length > radius * 2 ? `${hay.slice(0, radius * 2)}…` : hay;
  }
  const start = Math.max(0, idx - radius);
  const end = Math.min(hay.length, idx + needle.length + radius);
  return `${start > 0 ? "…" : ""}${hay.slice(start, end)}${end < hay.length ? "…" : ""}`;
}

/**
 * 可进全局索引的课程条目：跳过纯导航节点、占位、目录页，以及 HTML / 组件形态。
 * 可交互 HTML、artifact、课堂 notes.html、公式窗都不进。
 */
export function isIndexableContentItem(
  item: Pick<ContentItem, "id" | "status" | "renderType" | "navigationOnly">,
): boolean {
  if (item.navigationOnly) return false;
  if (item.status === "stub") return false;
  if (item.id === "toc") return false;
  if (item.renderType === "html" || item.renderType === "component") return false;
  return true;
}

function walkItems(
  items: ContentItem[],
  visitor: (item: ContentItem, parents: ContentItem[]) => void,
  parents: ContentItem[] = [],
) {
  for (const item of items) {
    visitor(item, parents);
    if (item.children?.length) walkItems(item.children, visitor, [...parents, item]);
  }
}

export function buildGlobalSearchIndex(tree: ContentTree): GlobalSearchEntry[] {
  const entries: GlobalSearchEntry[] = [];
  for (const subject of tree.subjects) {
    for (const category of subject.categories) {
      walkItems(category.items, (item, parents) => {
        if (!isIndexableContentItem(item)) return;
        const parentTrail = parents.map((parent) => parent.title).join(" / ");
        const breadcrumbs = [subject.name, category.name, parentTrail].filter(Boolean).join(" / ");
        const href = `/${subject.id}/${category.id}/${item.id}`;
        const haystack = normalizeSearchText(
          [item.id, item.title, item.summary ?? "", subject.name, category.name, parentTrail, href].join(" "),
        );
        entries.push({
          id: `${subject.id}:${category.id}:${item.id}`,
          subjectId: subject.id,
          categoryId: category.id,
          itemId: item.id,
          title: item.title,
          summary: item.summary ?? "",
          subjectName: subject.name,
          categoryName: category.name,
          breadcrumbs,
          href,
          haystack,
        });
      });
    }
  }
  return entries;
}

/** 当前学年科目排在前面，其余学年随后。客户端按这个顺序拉正文分片。 */
export function listBodySearchShards(tree: ContentTree, preferYear?: AcademicYearId): string[] {
  const preferred: string[] = [];
  const rest: string[] = [];
  for (const subject of tree.subjects) {
    if (preferYear && academicYearOfSubject(subject.id) === preferYear) preferred.push(subject.id);
    else rest.push(subject.id);
  }
  return [...preferred, ...rest];
}

function scoreFields(
  query: string,
  terms: string[],
  fields: { title: string; id?: string; summary?: string; body?: string; breadcrumbs?: string; haystack: string },
) {
  let score = 0;
  const title = normalizeSearchText(fields.title);
  const itemId = normalizeSearchText(fields.id ?? "");
  const summary = normalizeSearchText(fields.summary ?? "");
  const body = normalizeSearchText(fields.body ?? "");
  const breadcrumbs = normalizeSearchText(fields.breadcrumbs ?? "");

  if (title === query) score += 120;
  if (itemId && itemId === query) score += 100;
  if (title.includes(query)) score += 70;
  if (itemId && itemId.includes(query)) score += 56;
  if (summary.includes(query)) score += 34;
  if (body.includes(query)) score += 40;
  if (breadcrumbs.includes(query)) score += 22;

  for (const term of terms) {
    if (!fields.haystack.includes(term)) return 0;
    if (title.includes(term)) score += 14;
    else if (itemId && itemId.includes(term)) score += 11;
    else if (body.includes(term)) score += 8;
    else score += 4;
  }

  return score;
}

function scoreEntry(entry: GlobalSearchEntry, query: string, terms: string[]) {
  return scoreFields(query, terms, {
    title: entry.title,
    id: entry.itemId,
    summary: entry.summary,
    breadcrumbs: entry.breadcrumbs,
    haystack: entry.haystack,
  });
}

export function searchGlobalIndex(index: GlobalSearchEntry[], rawQuery: string, limit = 24) {
  const query = normalizeSearchText(rawQuery);
  if (!query) return [];
  const terms = query.split(/\s+/).filter(Boolean);

  return index
    .map((entry) => ({ entry, score: scoreEntry(entry, query, terms) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.href.localeCompare(b.entry.href))
    .slice(0, limit)
    .map((hit) => hit.entry);
}

export function chapterHitsFromIndex(
  index: GlobalSearchEntry[],
  rawQuery: string,
  limit = 12,
): GlobalSearchHit[] {
  const query = normalizeSearchText(rawQuery);
  if (!query) return [];
  const terms = query.split(/\s+/).filter(Boolean);
  return index
    .map((entry) => ({ entry, score: scoreEntry(entry, query, terms) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.href.localeCompare(b.entry.href))
    .slice(0, limit)
    .map(({ entry, score }) => toChapterHit(entry, score));
}

export function toChapterHit(entry: GlobalSearchEntry, score: number): GlobalSearchHit {
  return {
    id: entry.id,
    kind: "chapter",
    title: `${entry.itemId} ${entry.title}`,
    snippet: entry.summary,
    breadcrumbs: entry.breadcrumbs || `${entry.subjectName} / ${entry.categoryName}`,
    href: entry.href,
    subjectId: entry.subjectId,
    categoryId: entry.categoryId,
    itemId: entry.itemId,
    score,
  };
}

export function matchBodyText(
  entry: GlobalSearchEntry,
  rawBody: string,
  rawQuery: string,
): GlobalSearchHit | null {
  const query = normalizeSearchText(rawQuery);
  if (!query) return null;
  const terms = query.split(/\s+/).filter(Boolean);
  const body = stripForSearch(rawBody);
  if (!body) return null;
  const bodyNorm = normalizeSearchText(body);
  const haystack = `${entry.haystack} ${bodyNorm}`;
  const score = scoreFields(query, terms, {
    title: entry.title,
    id: entry.itemId,
    summary: entry.summary,
    body,
    breadcrumbs: entry.breadcrumbs,
    haystack,
  });
  if (score <= 0) return null;
  // 正文栏只要真正命中过正文的条目；纯标题命中留给章节阶段。
  const bodyHit = bodyNorm.includes(query) || terms.some((term) => bodyNorm.includes(term));
  if (!bodyHit) return null;
  return {
    id: entry.id,
    kind: "body",
    title: `${entry.itemId} ${entry.title}`,
    snippet: extractSnippet(body, rawQuery.trim()),
    breadcrumbs: entry.breadcrumbs || `${entry.subjectName} / ${entry.categoryName}`,
    href: entry.href,
    subjectId: entry.subjectId,
    categoryId: entry.categoryId,
    itemId: entry.itemId,
    score,
  };
}

export function matchUserNote(
  note: { id: string; title: string; markdown: string; subjectId: string | null },
  rawQuery: string,
): GlobalSearchHit | null {
  const query = normalizeSearchText(rawQuery);
  if (!query) return null;
  const terms = query.split(/\s+/).filter(Boolean);
  const body = stripForSearch(note.markdown);
  const breadcrumbs = subjectLabel(note.subjectId);
  const haystack = normalizeSearchText([note.title, body, breadcrumbs].join(" "));
  const score = scoreFields(query, terms, {
    title: note.title,
    summary: "",
    body,
    breadcrumbs,
    haystack,
  });
  if (score <= 0) return null;
  return {
    id: `note:${note.id}`,
    kind: "note",
    title: note.title || "无标题笔记",
    snippet: extractSnippet(body, rawQuery.trim()),
    breadcrumbs,
    noteId: note.id,
    subjectId: note.subjectId ?? undefined,
    score,
  };
}

export function matchFlashcard(
  card: {
    id: string;
    front: string;
    back: string;
    originalText: string;
    explanation?: string;
    sourceLabel: string;
    subjectId: string;
  },
  rawQuery: string,
): GlobalSearchHit | null {
  const query = normalizeSearchText(rawQuery);
  if (!query) return null;
  const terms = query.split(/\s+/).filter(Boolean);
  const title = card.front.trim() || card.originalText.trim() || "复习闪卡";
  const body = stripForSearch([card.front, card.back, card.originalText, card.explanation ?? ""].join(" "));
  const haystack = normalizeSearchText([title, body, card.sourceLabel, card.subjectId].join(" "));
  const score = scoreFields(query, terms, {
    title,
    body,
    breadcrumbs: card.sourceLabel,
    haystack,
  });
  if (score <= 0) return null;
  return {
    id: `flashcard:${card.id}`,
    kind: "flashcard",
    title,
    snippet: extractSnippet(body, rawQuery.trim()),
    breadcrumbs: card.sourceLabel || subjectLabel(card.subjectId),
    cardId: card.id,
    subjectId: card.subjectId,
    score,
  };
}

export function mergeBodyHits(
  chapterHits: GlobalSearchHit[],
  bodyHits: GlobalSearchHit[],
  limit = 16,
): GlobalSearchHit[] {
  const byId = new Map<string, GlobalSearchHit>();
  for (const hit of chapterHits) byId.set(hit.id, hit);
  for (const hit of bodyHits) {
    const existing = byId.get(hit.id);
    if (!existing) {
      byId.set(hit.id, hit);
      continue;
    }
    byId.set(hit.id, {
      ...existing,
      kind: existing.snippet ? existing.kind : "body",
      snippet: hit.snippet || existing.snippet,
      score: Math.max(existing.score, hit.score),
    });
  }
  return [...byId.values()]
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "zh-CN"))
    .slice(0, limit);
}

export function clampSearchQuery(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.length > SEARCH_QUERY_MAX_CHARS ? trimmed.slice(0, SEARCH_QUERY_MAX_CHARS) : trimmed;
}
