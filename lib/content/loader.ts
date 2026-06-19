// 服务端内容加载器：读取磁盘上的 .md 笔记，供 API 路由与 AI 工具使用。
// 仅可在服务端（route handler / server component）导入。
import fs from "node:fs";
import path from "node:path";
import { manifest } from "@/content/manifest";
import type { ChapterRef, SectionRef } from "@/lib/content/types";

const CONTENT_ROOT = path.join(process.cwd(), "content", "chapters");

export function getManifest() {
  return manifest;
}

export function findChapter(chapterId: string): ChapterRef | undefined {
  return manifest.chapters.find((c) => c.id === chapterId);
}

export interface LocatedSection {
  chapter: ChapterRef;
  section: SectionRef;
}

/** 在全书范围内按小节 id 定位（小节 id 全局唯一，如 "1.4"） */
export function locateSection(sectionId: string): LocatedSection | undefined {
  for (const chapter of manifest.chapters) {
    const section = chapter.sections.find((s) => s.id === sectionId);
    if (section) return { chapter, section };
  }
  return undefined;
}

/** 读取某小节的 markdown 正文；不存在则返回 null。 */
export function readSectionMarkdown(
  chapterId: string,
  sectionId: string,
): string | null {
  const file = path.join(CONTENT_ROOT, chapterId, `${sectionId}.md`);
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

/**
 * 按 (subjectId, categoryId, itemId) 读取内容 markdown；不存在返回 null。
 * 供 page.tsx 做 SSR 首屏渲染与 /api/section 客户端回退共用，统一路径解析逻辑。
 *
 * - probability/detail：复用 content/chapters 目录结构（itemId "1.1" → ch01/1.1.md，
 *   章级 id "ch01" → ch01/index.md）。
 * - 其他科目/分类：content/{subjectId}/{categoryId}/{itemId}.md。
 */
export function readContentMarkdown(
  subjectId: string,
  categoryId: string,
  itemId: string,
): string | null {
  if (subjectId === "probability" && categoryId === "detail") {
    const chapterMatch = itemId.match(/^(\d+)\./);
    if (chapterMatch) {
      const chapterNum = parseInt(chapterMatch[1], 10);
      const chapterId = `ch${String(chapterNum).padStart(2, "0")}`;
      return readSectionMarkdown(chapterId, itemId);
    }
    const chapterFile = path.join(CONTENT_ROOT, itemId, "index.md");
    try {
      return fs.readFileSync(chapterFile, "utf8");
    } catch {
      return null;
    }
  }

  const genericPath = path.join(
    process.cwd(),
    "content",
    subjectId,
    categoryId,
    `${itemId}.md`,
  );
  try {
    return fs.readFileSync(genericPath, "utf8");
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// 例题读取（与正文一致走服务端 SSR；/api/examples 仅作客户端回退/兼容）
// ─────────────────────────────────────────────────────────────

const EXAMPLES_ROOT = path.join(process.cwd(), "content", "examples");

export interface ExampleMeta {
  id: string;
  title: string;
  content: string;
}

/**
 * 由 (categoryId, itemId) 推导例题所在的 (chapterId, sectionId)。
 * 仅 detail 分类有例题：itemId "1.1" → chapterId "ch01"、sectionId "1.1"。
 * 其他分类返回空串（无例题）。
 */
export function deriveExampleKey(
  categoryId: string,
  itemId: string,
): { chapterId: string; sectionId: string } {
  if (categoryId !== "detail") return { chapterId: "", sectionId: "" };
  const n = parseInt(itemId.split(".")[0], 10);
  if (Number.isNaN(n)) return { chapterId: "", sectionId: "" };
  return { chapterId: `ch${String(n).padStart(2, "0")}`, sectionId: itemId };
}

/**
 * 读取某小节下的所有例题（学科命名空间，防多科 chapterId 冲突）：
 * - probability：content/examples/{chapterId}/{sectionId}/（兼容旧路径）
 * - 其他学科：content/examples/{subjectId}/{chapterId}/{sectionId}/
 * title 提取优先级：:::example{label=...} > 第一个 # 标题 > 文件名。
 * 目录不存在或 chapterId/sectionId 为空时返回 []。
 */
export function readExamples(
  subjectId: string,
  chapterId: string,
  sectionId: string,
): ExampleMeta[] {
  if (!chapterId || !sectionId) return [];
  const dir =
    subjectId && subjectId !== "probability"
      ? path.join(EXAMPLES_ROOT, subjectId, chapterId, sectionId)
      : path.join(EXAMPLES_ROOT, chapterId, sectionId);

  let files: string[];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
  } catch {
    return [];
  }

  return files.map((file) => {
    const content = fs.readFileSync(path.join(dir, file), "utf8");
    const exampleLabelMatch = content.match(/:::example\{label=([^}]+)\}/);
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = exampleLabelMatch
      ? exampleLabelMatch[1].trim()
      : titleMatch
        ? titleMatch[1].trim()
        : file.replace(/\.md$/, "");
    return { id: file.replace(/\.md$/, ""), title, content };
  });
}

/** 紧凑的全书大纲文本，供 AI 的 get_outline 工具。 */
export function getOutlineText(): string {
  const lines: string[] = [`课程：${manifest.course}`];
  for (const ch of manifest.chapters) {
    lines.push(`\n第${ch.number}章 ${ch.title}（${ch.id}）`);
    if (ch.summary) lines.push(`  概要：${ch.summary}`);
    for (const s of ch.sections) {
      const flag = s.status === "done" ? "" : "（待完善）";
      lines.push(`  - ${s.id} ${s.title}${flag}${s.summary ? "：" + s.summary : ""}`);
    }
  }
  return lines.join("\n");
}

/** 纯文本化 markdown（去掉指令与符号），用于检索/喂给 AI。 */
function stripMarkdown(md: string): string {
  return md
    .replace(/:::[a-zA-Z]+(\{[^}]*\})?/g, " ")
    .replace(/:::/g, " ")
    .replace(/[#>*_`~]/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, (m) => " " + m.replace(/\$/g, "") + " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export interface SearchHit {
  chapterId: string;
  sectionId: string;
  title: string;
  snippet: string;
}

/** 在全书笔记中做朴素子串检索，返回带上下文的命中片段。 */
export function searchNotes(query: string, limit = 6): SearchHit[] {
  const q = query.trim();
  if (!q) return [];
  const hits: SearchHit[] = [];
  for (const ch of manifest.chapters) {
    for (const s of ch.sections) {
      const md = readSectionMarkdown(ch.id, s.id);
      if (!md) continue;
      const text = stripMarkdown(md);
      const idx = text.indexOf(q);
      if (idx >= 0) {
        const start = Math.max(0, idx - 80);
        const end = Math.min(text.length, idx + q.length + 120);
        hits.push({
          chapterId: ch.id,
          sectionId: s.id,
          title: `${s.id} ${s.title}`,
          snippet: (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : ""),
        });
      }
      if (hits.length >= limit) return hits;
    }
  }
  return hits;
}
