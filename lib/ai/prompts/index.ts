// 动态提示词加载器（服务端）：把 MD 文件按 (科目) 拼装为稳定的 system 前缀。
// 设计：global.md（含工具说明，几乎不变）+ subjects/<id>.md（按学科切换）= 稳定前缀，
// 利于上游 prefix 缓存命中；易变上下文（当前页/检索结果）由 route 放在前缀之后的消息里。
import fs from "node:fs";
import path from "node:path";
import { getSubjectMeta, subjectName } from "@/lib/content-data/subjects.registry";
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

/** 稳定 system 前缀：global（{subjectName} 已替换）+ 学科专门化段。 */
export function buildSystemPrompt(ctx: ChatContext): string {
  const global = readMd("global.md").replace(/\{subjectName\}/g, subjectName(ctx.subjectId));
  const subjectRel = subjectPromptFile(ctx.subjectId);
  const subject = subjectRel ? readMd(subjectRel) : "";
  return subject ? `${global}\n\n---\n\n${subject}` : global;
}

/** 当前定位行（轻量、相对易变，放前缀之后的消息里）。 */
export function buildLocationLine(ctx: ChatContext): string {
  let s = `【当前位置】科目：${subjectName(ctx.subjectId)} ｜ 分类：${ctx.categoryId} ｜ 内容项：${ctx.itemId}`;
  if (ctx.currentTopic) s += ` ｜ 主题：${ctx.currentTopic}`;
  return s;
}
