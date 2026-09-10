// 服务端内容加载器：读取磁盘上的 .md 笔记，供 API 路由与 AI 工具使用。
// 仅可在服务端（route handler / server component）导入。
import fs from "node:fs";
import path from "node:path";
import { contentTree } from "@/lib/content-data/manifest";
import { hasCapability } from "@/lib/content/categoryKeys";
import type { Category, ContentItem } from "@/lib/types/content";
import {
  subjectVisibleToAgent,
  type AcademicYearId,
} from "@/lib/constants/academic-year";
import { getSubjectMeta } from "@/lib/content-data/subjects.registry";
import { CONTENT_PATH_RESOLVERS, LEGACY_CHAPTERS_ROOT } from "@/lib/content/contentPaths";
import { normalizeSearchQuery } from "@/lib/ai/search/queryNormalize";

/** 读取某小节的 markdown 正文；不存在则返回 null。 */
export function readSectionMarkdown(
  chapterId: string,
  sectionId: string,
): string | null {
  const file = path.join(LEGACY_CHAPTERS_ROOT, chapterId, `${sectionId}.md`);
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function resolveFilePath(
  subjectId: string,
  categoryId: string,
  itemId: string,
  ext: string,
): string {
  const resolver = CONTENT_PATH_RESOLVERS[getSubjectMeta(subjectId)?.contentRoot?.detail ?? "subject-tree"];
  return resolver(subjectId, categoryId, itemId, ext);
}

/**
 * 按 (subjectId, categoryId, itemId) 读取内容 markdown；不存在返回 null。
 * 供 page.tsx 做 SSR 首屏渲染与 /api/section 客户端回退共用，统一路径解析逻辑。
 *
 * 路径由 registry 的 contentRoot.detail 选择 resolver（见 lib/content/contentPaths.ts）：
 * - legacy-chapters + detail：itemId "1.1" → ch01/1.1.md，章级 id "ch01" → ch01/index.md
 * - 其余：content/{subjectId}/{categoryId}/{itemId}.md
 */
export function readContentMarkdown(
  subjectId: string,
  categoryId: string,
  itemId: string,
): string | null {
  const filePath = resolveFilePath(subjectId, categoryId, itemId, "md");
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

/**
 * 按 (subjectId, categoryId, itemId) 读取 HTML 内容；不存在返回 null。
 * 路径与 markdown 共用同一套 resolver，仅扩展名为 html。
 */
export function readContentHtml(
  subjectId: string,
  categoryId: string,
  itemId: string,
): string | null {
  const filePath = resolveFilePath(subjectId, categoryId, itemId, "html");
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

/**
 * 统一内容加载器：根据 renderType 分发到 readContentMarkdown 或 readContentHtml。
 * component 类型不走文件系统，返回 null（由客户端 ComponentRenderer 处理）。
 */
export function readContent(
  subjectId: string,
  categoryId: string,
  itemId: string,
  renderType?: string,
): string | null {
  if (renderType === "html") {
    return readContentHtml(subjectId, categoryId, itemId);
  }
  if (renderType === "component") {
    return null;
  }
  return readContentMarkdown(subjectId, categoryId, itemId);
}

// ─────────────────────────────────────────────────────────────
// 例题读取（与正文一致走服务端 SSR；/api/examples 仅作客户端回退/兼容）
// ─────────────────────────────────────────────────────────────

const EXAMPLES_ROOT = path.join(process.cwd(), "content", "examples");

export interface ExampleListItem {
  id: string;
  title: string;
}

export interface ExampleDetail extends ExampleListItem {
  content: string;
}

/** @deprecated 使用 ExampleListItem / ExampleDetail */
export type ExampleMeta = ExampleDetail;

function exampleTitleFromContent(content: string, file: string): string {
  const exampleLabelMatch = content.match(/:::example\{label=([^}]+)\}/);
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const raw = exampleLabelMatch
    ? exampleLabelMatch[1].trim()
    : titleMatch
      ? titleMatch[1].trim()
      : file.replace(/\.md$/, "");
  return raw.replace(/^["']|["']$/g, "");
}

/** 允许 Unicode 文件名（如 EX01_硫酸黏度测定），仅拦截路径穿越。 */
function isSafeExampleId(exampleId: string): boolean {
  if (!exampleId) return false;
  if (exampleId.includes("..")) return false;
  if (/[\\/]/.test(exampleId)) return false;
  return exampleId === path.basename(exampleId);
}

function examplesDir(subjectId: string, chapterId: string, sectionId: string): string | null {
  if (!chapterId || !sectionId) return null;
  return subjectId && subjectId !== "probability"
    ? path.join(EXAMPLES_ROOT, subjectId, chapterId, sectionId)
    : path.join(EXAMPLES_ROOT, chapterId, sectionId);
}

/** 仅返回例题 id/title（SSR 列表用，不含正文）。 */
export function readExamplesMeta(
  subjectId: string,
  chapterId: string,
  sectionId: string,
): ExampleListItem[] {
  const dir = examplesDir(subjectId, chapterId, sectionId);
  if (!dir) return [];
  let files: string[];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
  } catch {
    return [];
  }
  return files.map((file) => {
    const content = fs.readFileSync(path.join(dir, file), "utf8");
    return {
      id: file.replace(/\.md$/, ""),
      title: exampleTitleFromContent(content, file),
    };
  });
}

/** 按 id 读取单题正文（按需加载）。 */
export function readExampleById(
  subjectId: string,
  chapterId: string,
  sectionId: string,
  exampleId: string,
): ExampleDetail | null {
  const dir = examplesDir(subjectId, chapterId, sectionId);
  if (!dir || !isSafeExampleId(exampleId)) return null;
  const filePath = path.join(dir, `${exampleId}.md`);
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return {
      id: exampleId,
      title: exampleTitleFromContent(content, `${exampleId}.md`),
      content,
    };
  } catch {
    return null;
  }
}

/**
 * 读取某小节下的所有例题（含正文；导出/兼容用）。
 */
export function readExamples(
  subjectId: string,
  chapterId: string,
  sectionId: string,
): ExampleMeta[] {
  return readExamplesMeta(subjectId, chapterId, sectionId).map((meta) => {
    const detail = readExampleById(subjectId, chapterId, sectionId, meta.id);
    return detail ?? { ...meta, content: "" };
  });
}

// ─────────────────────────────────────────────────────────────
// 题目测试读取（content/quiz/{subjectId}/{chapterId}.json）
// 由 /api/quiz 客户端读取；非 .md 文件，不走 readContentMarkdown。
// ─────────────────────────────────────────────────────────────

const QUIZ_ROOT = path.join(process.cwd(), "content", "quiz");

/**
 * 读取某章节的题目测试 JSON（学科命名空间，防多科 chapterId 冲突）：
 * content/quiz/{subjectId}/{chapterId}.json。
 * 文件不存在 / 解析失败 / 参数为空时返回 null。
 */
export function readQuiz(subjectId: string, chapterId: string): unknown | null {
  if (!subjectId || !chapterId) return null;
  // 仅允许安全的标识符，避免路径穿越。
  if (!/^[a-zA-Z0-9_-]+$/.test(subjectId) || !/^[a-zA-Z0-9_-]+$/.test(chapterId)) {
    return null;
  }
  const file = path.join(QUIZ_ROOT, subjectId, `${chapterId}.json`);
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// 多科目 AI 工具函数（基于 contentTree，覆盖全部科目/分类）
// ─────────────────────────────────────────────────────────────

/** 板块是否参与 AI 检索 / 大纲：由 manifest 的 capabilities 声明。 */
function isSearchable(cat: Category): boolean {
  return hasCapability(cat, "search");
}

/** 从 contentTree 中按 (subjectId, categoryId, itemId) 查找内容项及其标题。 */
export function findContentItem(
  subjectId: string,
  categoryId: string,
  itemId: string,
): { subjectName: string; categoryName: string; item: ContentItem; parentTitle?: string } | undefined {
  for (const subject of contentTree.subjects) {
    if (subject.id !== subjectId) continue;
    for (const cat of subject.categories) {
      if (cat.id !== categoryId) continue;
      for (const item of cat.items) {
        if (item.id === itemId) {
          return { subjectName: subject.name, categoryName: cat.name, item };
        }
        if (item.children) {
          const child = item.children.find((c) => c.id === itemId);
          if (child) {
            return { subjectName: subject.name, categoryName: cat.name, item: child, parentTitle: item.title };
          }
        }
      }
    }
  }
  return undefined;
}

export type ContentSearchScope = AcademicYearId | "all";

/** 生成全科目大纲文本，供 AI 的 getOutline 工具。默认可按学年过滤，cross-year 传 "all"。 */
export function getMultiSubjectOutline(scope: ContentSearchScope = "all"): string {
  const lines: string[] = [];

  for (const subject of contentTree.subjects) {
    if (subject.id === "other") continue;
    if (!subjectVisibleToAgent(subject.id, scope)) continue;
    lines.push(`\n=== ${subject.name} (${subject.id}) ===`);

    for (const cat of subject.categories) {
      if (!isSearchable(cat)) continue;
      if (!cat.items.length) continue;

      for (const item of cat.items) {
        if (item.children?.length) {
          const chNum = item.id.replace(/^ch0?/, "");
          lines.push(`\n  第${chNum}章 ${item.title}`);
          if (item.summary) lines.push(`    概要：${item.summary}`);
          for (const sec of item.children) {
            const flag = sec.status === "done" ? "" : "（待完善）";
            const p = `${subject.id}/${cat.id}/${sec.id}`;
            lines.push(`    - ${sec.id} ${sec.title}${flag} (${p})`);
          }
        } else {
          const label = cat.name || cat.id;
          const flag = item.status === "done" ? "" : "（待完善）";
          const p = `${subject.id}/${cat.id}/${item.id}`;
          lines.push(`  [${label}] ${item.id} ${item.title}${flag} (${p})`);
        }
      }
    }
  }
  return lines.join("\n");
}

/** 解析复合路径或小节 ID 为统一的内容定位。 */
export interface ResolvedPath {
  subjectId: string;
  categoryId: string;
  itemId: string;
  title: string;
  found: boolean;
}

export function resolveContentPath(
  pathOrId: string,
  fallbackSubjectId: string,
): ResolvedPath {
  const parts = pathOrId.split("/");
  if (parts.length >= 3) {
    const [subjectId, categoryId, ...rest] = parts;
    const itemId = rest.join("/");
    const found = findContentItem(subjectId, categoryId, itemId);
    const title = found
      ? `${found.subjectName} > ${found.categoryName} > ${found.parentTitle ? found.parentTitle + " > " : ""}${found.item.title}`
      : `${subjectId} > ${categoryId} > ${itemId}`;
    return { subjectId, categoryId, itemId, title, found: !!found };
  }

  // 向下兼容：纯小节 ID（如 "1.4"），默认当前科目 detail
  const found = findContentItem(fallbackSubjectId, "detail", pathOrId);
  const title = found
    ? `${found.subjectName} > ${found.categoryName} > ${found.parentTitle ? found.parentTitle + " > " : ""}${found.item.title}`
    : `${fallbackSubjectId} > detail > ${pathOrId}`;
  return { subjectId: fallbackSubjectId, categoryId: "detail", itemId: pathOrId, title, found: !!found };
}

/** 纯文本化 markdown（去掉指令与符号），用于检索/喂给 AI。 */
export function stripMarkdown(md: string): string {
  return md
    .replace(/:::[a-zA-Z]+(\{[^}]*\})?/g, " ")
    .replace(/:::/g, " ")
    .replace(/[#>*_`~]/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, (m) => " " + m.replace(/\$/g, "") + " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/** 多科全分类搜索结果。 */
export interface MultiSearchHit {
  subjectId: string;
  subjectName: string;
  categoryId: string;
  itemId: string;
  title: string;
  snippet: string;
  /** 可直接传给 getSection 的复合路径 */
  path: string;
}

/**
 * 在全部科目的 detail/recording/summary 中做关键词检索（子串匹配 fallback）。
 * detail 命中优先排在前面。多关键词按空格拆分做 OR 匹配。
 */
function substringSearch(
  query: string,
  limit = 8,
  scope: ContentSearchScope = "all",
  subjectId?: string,
): MultiSearchHit[] {
  const q = query.trim();
  if (!q) return [];
  const keywords = q.split(/\s+/).filter(Boolean);
  if (!keywords.length) return [];

  const detailHits: MultiSearchHit[] = [];
  const otherHits: MultiSearchHit[] = [];

  for (const subject of contentTree.subjects) {
    if (subject.id === "other") continue;
    if (subjectId && subject.id !== subjectId) continue;
    if (!subjectVisibleToAgent(subject.id, scope)) continue;
    for (const cat of subject.categories) {
      if (!isSearchable(cat)) continue;
      const isDetail = cat.id === "detail";

      const leafItems: { item: ContentItem; parentTitle?: string }[] = [];
      for (const item of cat.items) {
        if (item.children?.length) {
          for (const child of item.children) {
            leafItems.push({ item: child, parentTitle: item.title });
          }
        } else {
          leafItems.push({ item });
        }
      }

      for (const { item, parentTitle } of leafItems) {
        if (item.status === "stub") continue;
        const md = readContentMarkdown(subject.id, cat.id, item.id);
        if (!md) continue;
        const text = stripMarkdown(md);

        let matchIdx = -1;
        for (const kw of keywords) {
          const idx = text.indexOf(kw);
          if (idx >= 0) { matchIdx = idx; break; }
        }
        if (matchIdx < 0) continue;

        const start = Math.max(0, matchIdx - 80);
        const end = Math.min(text.length, matchIdx + 120);
        const titleParts = [subject.name, cat.name];
        if (parentTitle) titleParts.push(parentTitle);
        titleParts.push(`${item.id} ${item.title}`);

        const hit: MultiSearchHit = {
          subjectId: subject.id,
          subjectName: subject.name,
          categoryId: cat.id,
          itemId: item.id,
          title: titleParts.join(" > "),
          snippet: (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : ""),
          path: `${subject.id}/${cat.id}/${item.id}`,
        };

        if (isDetail) {
          detailHits.push(hit);
        } else {
          otherHits.push(hit);
        }

        if (detailHits.length + otherHits.length >= limit * 2) break;
      }
      if (detailHits.length + otherHits.length >= limit * 2) break;
    }
  }

  return [...detailHits, ...otherHits].slice(0, limit);
}

export interface SearchAllContentOptions {
  limit?: number;
  /** 默认 all：跨学年。智能体默认传入当前学年；crossYear 时传 all。 */
  academicYear?: ContentSearchScope;
  /** 硬过滤到某一科目（如 histology）。 */
  subjectId?: string;
  /** 当前正在阅读的科目：先在该科目内搜，不足 3 条再放开学年。 */
  preferSubjectId?: string;
  /** 当前页面标题，供短查询向量扩展。 */
  queryContext?: string;
  /**
   * 索引未命中时是否回退全库子串扫描。默认跟 substringSearchAllowed()。
   * 测试可显式设为 false，证明 hybrid/BM25 索引本身能检索大二教材。
   */
  allowSubstring?: boolean;
}

/**
 * 在全部科目中做语义+关键词混合检索。
 * 索引存在时使用 hybridSearch（BM25 + 向量 + rerank），否则 fallback 到子串匹配。
 */
export async function searchAllContent(
  query: string,
  limitOrOpts: number | SearchAllContentOptions = 8,
): Promise<MultiSearchHit[]> {
  const q = normalizeSearchQuery(query.trim()) || query.trim();
  if (!q) return [];
  const opts: SearchAllContentOptions =
    typeof limitOrOpts === "number" ? { limit: limitOrOpts } : limitOrOpts;
  const limit = opts.limit ?? 8;
  const scope: ContentSearchScope = opts.academicYear ?? "all";

  try {
    const { hybridSearch } = await import('@/lib/ai/search/hybridSearch');
    const results = await hybridSearch(q, {
      topK: Math.max(limit * 3, 16),
      academicYear: scope,
      subjectId: opts.subjectId,
      preferSubjectId: opts.preferSubjectId,
      queryContext: opts.queryContext,
    });
    const filtered = results.filter((hit) => {
      if (opts.subjectId && hit.subjectId !== opts.subjectId) return false;
      return subjectVisibleToAgent(hit.subjectId, scope);
    });
    if (filtered.length > 0) return filtered.slice(0, limit);
  } catch (err) {
    const { searchLog } = await import('@/lib/ai/search/searchLog');
    searchLog.error('search.query', { message: String((err as Error).message), query: q.slice(0, 80) });
  }

  const allowSubstring = opts.allowSubstring ?? substringSearchAllowed();
  if (!allowSubstring) {
    const { searchLog } = await import('@/lib/ai/search/searchLog');
    searchLog.warn('search.fallback.disabled', { env: process.env.NODE_ENV, query: q.slice(0, 80) });
    return [];
  }
  const { searchLog } = await import('@/lib/ai/search/searchLog');
  searchLog.info('search.fallback.substring', { env: process.env.NODE_ENV, query: q.slice(0, 80) });
  return substringSearch(q, limit, scope, opts.subjectId);
}

function substringSearchAllowed(): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  console.warn(
    '[search] 生产环境未找到检索索引，已禁用全库子串扫描。请运行 pnpm build-index 构建索引。',
  );
  return false;
}
