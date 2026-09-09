// 笔记图片索引与检索（服务端）。
//
// 课程笔记里的插图只以 `![alt](src)` 或 `::figure{src caption alt}` 存在于 markdown 正文中，
// 没有独立清单。这里在首次调用时遍历 contentTree 全部可搜索页面，抽出每张图的
// 图注 / alt / 所在小节标题 / 前后正文，构成内存索引；searchNoteImages 工具据此按
// 知识点短语打分检索，返回站内路径供 AI 直接用 ::figure 引用。
//
// 纯函数部分（extractNoteImages / scoreNoteImage / tokenizeForImages）不依赖文件系统，可单测。

import { contentTree } from "@/lib/content-data/manifest";
import { hasCapability } from "@/lib/content/categoryKeys";
import { readContentMarkdown, stripMarkdown } from "@/lib/content/loader";
import { chunkInScope, type SearchFilter } from "@/lib/ai/search/searchScope";
import { normalizeSearchQuery } from "@/lib/ai/search/queryNormalize";
import type { ContentItem } from "@/lib/types/content";
import type { NoteImageHit } from "@/lib/ai/agent/toolTypes";

export interface NoteImageEntry {
  src: string;
  alt: string;
  caption: string;
  path: string;
  subjectId: string;
  categoryId: string;
  itemId: string;
  /** 面包屑标题：科目 > 板块 > (章) > 小节。 */
  title: string;
  /** 图片上方最近的 ## / ### 标题。 */
  heading: string;
  /** 图片前后的正文片段（已 strip markdown）。 */
  context: string;
}

export interface NoteImageIndex {
  builtAt: number;
  entries: NoteImageEntry[];
}

const CONTEXT_BEFORE = 260;
const CONTEXT_AFTER = 160;
const MD_IMAGE_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
const FIGURE_RE = /:{2,3}figure\{([^}]*)\}/g;
const ATTR_RE = /([A-Za-z_][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'}]+))/g;

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const m of raw.matchAll(ATTR_RE)) attrs[m[1]] = (m[2] ?? m[3] ?? m[4] ?? "").trim();
  return attrs;
}

function nearestHeading(md: string, offset: number): string {
  const before = md.slice(0, offset);
  const matches = [...before.matchAll(/^#{1,4}\s+(.+)$/gm)];
  return matches.length ? matches[matches.length - 1][1].trim() : "";
}

/** stripMarkdown 不去掉图片语法本身，这里先剔除邻近的其他图片引用再取纯文本。 */
function plainText(fragment: string): string {
  return stripMarkdown(fragment.replace(MD_IMAGE_RE, " ").replace(FIGURE_RE, " ")).replace(/\s+/g, " ").trim();
}

function contextAround(md: string, start: number, end: number): string {
  const before = plainText(md.slice(Math.max(0, start - CONTEXT_BEFORE * 2), start)).slice(-CONTEXT_BEFORE);
  const after = plainText(md.slice(end, end + CONTEXT_AFTER * 2)).slice(0, CONTEXT_AFTER);
  return [before, after].filter(Boolean).join(" … ");
}

/** 只收站内静态资源（/images/... 等根相对路径），跳过外链与 data URL。 */
function isLocalImageSrc(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//") && /\.(png|jpe?g|gif|webp|svg|avif)(\?|#|$)/i.test(src);
}

/** 从一页 markdown 里抽出全部本地图片及其图注 / 上下文。 */
export function extractNoteImages(
  md: string,
  location: Pick<NoteImageEntry, "path" | "subjectId" | "categoryId" | "itemId" | "title">,
): NoteImageEntry[] {
  const found: { start: number; end: number; src: string; alt: string; caption: string }[] = [];
  for (const m of md.matchAll(MD_IMAGE_RE)) {
    found.push({ start: m.index!, end: m.index! + m[0].length, src: m[2], alt: m[1] ?? "", caption: m[3] ?? "" });
  }
  for (const m of md.matchAll(FIGURE_RE)) {
    const attrs = parseAttrs(m[1]);
    if (!attrs.src) continue;
    found.push({ start: m.index!, end: m.index! + m[0].length, src: attrs.src, alt: attrs.alt ?? "", caption: attrs.caption ?? attrs.title ?? "" });
  }
  found.sort((a, b) => a.start - b.start);

  const entries: NoteImageEntry[] = [];
  const seen = new Set<string>();
  for (const f of found) {
    if (!isLocalImageSrc(f.src) || seen.has(f.src)) continue;
    seen.add(f.src);
    entries.push({
      ...location,
      src: f.src,
      alt: f.alt.trim(),
      caption: f.caption.trim(),
      heading: nearestHeading(md, f.start),
      context: contextAround(md, f.start, f.end),
    });
  }
  return entries;
}

function buildIndex(): NoteImageIndex {
  const entries: NoteImageEntry[] = [];
  for (const subject of contentTree.subjects) {
    if (subject.id === "other") continue;
    for (const cat of subject.categories) {
      if (!hasCapability(cat, "search")) continue;
      const leafItems: { item: ContentItem; parentTitle?: string }[] = [];
      for (const item of cat.items) {
        if (item.children?.length) for (const child of item.children) leafItems.push({ item: child, parentTitle: item.title });
        else leafItems.push({ item });
      }
      for (const { item, parentTitle } of leafItems) {
        if (item.status === "stub" || item.id === "toc" || item.id.endsWith("-toc")) continue;
        const md = readContentMarkdown(subject.id, cat.id, item.id);
        if (!md || (!md.includes("![") && !md.includes("figure{"))) continue;
        const titleParts = [subject.name, cat.name];
        if (parentTitle) titleParts.push(parentTitle);
        titleParts.push(item.title);
        entries.push(
          ...extractNoteImages(md, {
            path: `${subject.id}/${cat.id}/${item.id}`,
            subjectId: subject.id,
            categoryId: cat.id,
            itemId: item.id,
            title: titleParts.join(" > "),
          }),
        );
      }
    }
  }
  return { builtAt: Date.now(), entries };
}

let cached: NoteImageIndex | null = null;
const DEV_TTL_MS = 5 * 60 * 1000;

/** 首次调用遍历全部笔记（数百个 md，约百毫秒级），之后常驻内存；开发环境 5 分钟后重建以感知内容改动。 */
export function getNoteImageIndex(): NoteImageIndex {
  const stale = cached && process.env.NODE_ENV !== "production" && Date.now() - cached.builtAt > DEV_TTL_MS;
  if (!cached || stale) cached = buildIndex();
  return cached;
}

function invalidateNoteImageIndex(): void {
  cached = null;
}

// ─── 打分 ────────────────────────────────────────────────────────────────

/** 中文按单字 + 相邻双字，英文/数字按小写单词。与 BM25 索引的切词口径一致，但此处自包含。 */
export function tokenizeForImages(text: string): string[] {
  const out: string[] = [];
  let latin = "";
  const flush = () => {
    if (latin) out.push(latin.toLowerCase());
    latin = "";
  };
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const code = ch.codePointAt(0)!;
    if (code >= 0x4e00 && code <= 0x9fff) {
      flush();
      out.push(ch);
      const next = chars[i + 1];
      if (next && next.codePointAt(0)! >= 0x4e00 && next.codePointAt(0)! <= 0x9fff) out.push(ch + next);
    } else if (/[A-Za-z0-9]/.test(ch)) {
      latin += ch;
    } else {
      flush();
    }
  }
  flush();
  return out;
}

const FIELD_WEIGHTS: Record<"caption" | "alt" | "heading" | "context" | "title", number> = {
  caption: 3,
  alt: 2.5,
  heading: 1.5,
  context: 1,
  title: 0.8,
};

function overlapScore(queryTokens: Set<string>, text: string, weight: number): number {
  if (!text || queryTokens.size === 0) return 0;
  const tokens = new Set(tokenizeForImages(text));
  let hits = 0;
  for (const t of queryTokens) {
    // 双字命中比单字更有区分度
    if (tokens.has(t)) hits += t.length >= 2 ? 1 : 0.35;
  }
  return (hits / queryTokens.size) * weight;
}

export function scoreNoteImage(entry: NoteImageEntry, query: string, queryTokens: Set<string>): number {
  let score = 0;
  score += overlapScore(queryTokens, entry.caption, FIELD_WEIGHTS.caption);
  score += overlapScore(queryTokens, entry.alt, FIELD_WEIGHTS.alt);
  score += overlapScore(queryTokens, entry.heading, FIELD_WEIGHTS.heading);
  score += overlapScore(queryTokens, entry.context, FIELD_WEIGHTS.context);
  score += overlapScore(queryTokens, entry.title, FIELD_WEIGHTS.title);
  // 整句子串命中（如「肝小叶」直接出现在图注里）给显著加分
  const q = query.toLowerCase();
  if (q.length >= 2) {
    if (entry.caption.toLowerCase().includes(q)) score += 4;
    else if (entry.alt.toLowerCase().includes(q)) score += 3;
    else if (entry.heading.toLowerCase().includes(q)) score += 1.5;
  }
  return score;
}

export interface SearchNoteImagesOptions extends SearchFilter {
  limit?: number;
}

const MIN_SCORE = 1.2;

export function searchNoteImages(query: string, opts: SearchNoteImagesOptions = {}): NoteImageHit[] {
  const normalized = normalizeSearchQuery(query);
  const queryTokens = new Set(tokenizeForImages(normalized));
  if (queryTokens.size === 0) return [];
  const limit = Math.min(Math.max(opts.limit ?? 6, 1), 12);
  const { entries } = getNoteImageIndex();

  const scored: { entry: NoteImageEntry; score: number }[] = [];
  for (const entry of entries) {
    if (!chunkInScope(entry.subjectId, opts)) continue;
    let score = scoreNoteImage(entry, normalized, queryTokens);
    if (score < MIN_SCORE) continue;
    if (opts.preferSubjectId && entry.subjectId === opts.preferSubjectId) score *= 1.15;
    scored.push({ entry, score });
  }
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ entry, score }) => ({
    src: entry.src,
    alt: entry.alt,
    caption: entry.caption,
    path: entry.path,
    subjectId: entry.subjectId,
    categoryId: entry.categoryId,
    itemId: entry.itemId,
    title: entry.title,
    context: entry.context.length > 220 ? `${entry.context.slice(0, 220)}…` : entry.context,
    score: Math.round(score * 100) / 100,
  }));
}

/** 回灌模型的文本：每张图给出 ::figure 引用写法与出处。 */
export function describeNoteImagesForModel(query: string, hits: NoteImageHit[]): string {
  if (hits.length === 0) {
    return `笔记中未找到与「${query}」相关的图片。可以换一个更具体的图注关键词（如「肝小叶」「凸透镜成像」）再试，或改用 imageSearch / drawDiagram。`;
  }
  const lines = hits.map((h, i) => {
    const label = h.caption || h.alt || `图 ${i + 1}`;
    const figure = `::figure{src="${h.src}" caption="${(h.caption || h.alt || label).replace(/"/g, "'")}" alt="${(h.alt || h.caption || label).replace(/"/g, "'")}"}`;
    return `[${i + 1}] ${label}\n来源：${h.title}（path: ${h.path}）\n${h.context ? `上下文：${h.context}\n` : ""}引用写法：${figure}`;
  });
  return `${lines.join("\n\n")}\n\n引用时把上面的 ::figure{...} 原样单独成段写进回复（不要改 src），并说明它来自哪一节；不要凭图注臆测图中细节，需要时调用 getSection(path) 读原文。`;
}
