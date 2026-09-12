// 动态提示词加载器（服务端）：把 MD 文件按 (科目) 拼装为稳定的 system 前缀。
// 设计：global.md（含工具说明，几乎不变）+ subjects/<id>.md（按学科切换）= 稳定前缀，
// 利于上游 prefix 缓存命中；易变上下文（当前页/检索结果）由 route 放在前缀之后的消息里。
import fs from "node:fs";
import path from "node:path";
import { getSubjectMeta, subjectName } from "@/lib/content-data/subjects.registry";
import { ACADEMIC_YEAR_LABELS, isAcademicYearId } from "@/lib/constants/academic-year";
import type { ChatContext } from "@/lib/types/chat";

const PROMPT_ROOT = path.join(process.cwd(), "lib", "ai", "prompts");

/** 学科提示词文件：registry 可显式指定 promptFile，缺省约定为 subjects/{id}.md；文件不存在时 readMd 返回空串。 */
function subjectPromptFile(subjectId: string): string | undefined {
  const meta = getSubjectMeta(subjectId);
  if (!meta) return undefined;
  return meta.promptFile ?? `subjects/${meta.id}.md`;
}

const cache = new Map<string, string>();

function readMd(rel: string): string {
  // 生产环境 MD 不变 → 缓存；开发环境每次读，便于热编辑提示词。
  if (process.env.NODE_ENV === "production" && cache.has(rel)) {
    return cache.get(rel)!;
  }
  let text = "";
  try {
    text = fs.readFileSync(path.join(PROMPT_ROOT, rel), "utf8").trim();
  } catch {
    text = "";
  }
  if (process.env.NODE_ENV === "production") cache.set(rel, text);
  return text;
}

/**
 * 稳定 system 前缀：学科无关的 global 在前，当前科目名 + 学科 md 在后。
 * 换科目时失效从「当前科目」段起；global 教学法段可继续命中 prefix cache。
 */
export function buildSystemPrompt(ctx: ChatContext): string {
  const subject = subjectName(ctx.subjectId);
  const global = readMd("global.md")
    .replace(/「\{subjectName\}」/g, "")
    .replace(/\{subjectName\}/g, subject);
  const subjectRel = subjectPromptFile(ctx.subjectId);
  const subjectMd = subjectRel ? readMd(subjectRel) : "";
  const subjectBlock = subjectMd
    ? `当前科目：${subject}\n\n${subjectMd}`
    : `当前科目：${subject}`;
  return `${global}\n\n---\n\n${subjectBlock}`;
}

/**
 * 当前定位行（轻量、易变，必须放在 system 末尾）。
 * 换页改 itemId/主题；换学年改学年字段。失效范围止于这一行及之后的参考材料。
 */
export function buildLocationLine(ctx: ChatContext): string {
  const year = isAcademicYearId(ctx.academicYear)
    ? ACADEMIC_YEAR_LABELS[ctx.academicYear]
    : ctx.academicYear;
  let s = "【当前位置】";
  if (year) s += `学年：${year} ｜ `;
  s += `科目：${subjectName(ctx.subjectId)} ｜ 分类：${ctx.categoryId} ｜ 内容项：${ctx.itemId}`;
  if (ctx.currentTopic) s += ` ｜ 主题：${ctx.currentTopic}`;
  return s;
}
