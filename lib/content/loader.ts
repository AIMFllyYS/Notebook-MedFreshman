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
