import { tool } from "ai";
import { z } from "zod";
import { findContentItem, readContentMarkdown } from "@/lib/content/loader";
import type { GetCurrentPageOutput } from "@/lib/ai/agent/tools/getCurrentPage/types";
import { allocateCiteIndex, prefixCiteTag } from "@/lib/ai/agent/tools/citeIndex";
import { dedupeByContextKey, toText, type StudyToolContext, type StudyToolRuntime } from "@/lib/ai/agent/tools/_shared";
import { isPageBoundContext } from "@/lib/types/chat";

/**
 * Agent 的通用对话不绑定页面（见 isPageBoundContext）。这时「当前页」根本不存在，
 * 不能回成「该页正文尚未生成（占位）」——那会让模型以为有一页没写完的笔记，
 * 转而向用户解释一个并不存在的页面。直说没有打开的页面，并给出可用的替代路径。
 */
const NO_BOUND_PAGE =
  "【当前页面】用户此刻没有打开任何小节页面：这是通用对话，上下文由用户显式引用（引用笔记、附件、技能）提供。" +
  "请直接按问题作答；需要材料时用 getOutline / searchNotes / getSection 主动查找，不要假设存在「当前这一节」。";

function resolveCurrentPage(ctx: StudyToolContext): {
  text: string;
  path?: string;
  title?: string;
  citable: boolean;
} {
  if (!isPageBoundContext(ctx)) return { text: NO_BOUND_PAGE, citable: false };
  const path = `${ctx.subjectId}/${ctx.categoryId}/${ctx.itemId}`;
  const md = readContentMarkdown(ctx.subjectId, ctx.categoryId, ctx.itemId);
  const found = findContentItem(ctx.subjectId, ctx.categoryId, ctx.itemId);
  const title = found
    ? `${found.subjectName} > ${found.categoryName} > ${found.parentTitle ? found.parentTitle + " > " : ""}${found.item.title}`
    : `${ctx.subjectId} / ${ctx.categoryId} / ${ctx.itemId}`;
  if (!md) {
    return {
      text: `【${title}】该页正文尚未生成（占位）。可结合标题与课程大纲作答，并说明该处正在完善。`,
      path,
      title,
      citable: false,
    };
  }
  return { text: `【${title}】\n\n${md}`, path, title, citable: true };
}

export function createGetCurrentPageTool(ctx: StudyToolContext, runtime: StudyToolRuntime) {
  return tool({
    description:
      "获取用户当前正在阅读的页面完整正文（含标题、公式、知识点）。当问题出现'这一节/这页/当前/这里/上面这段/这道题'等指代当前页面的说法时，应优先调用。回灌正文带有 [n] 编号；凡依据该页写出的句子，句末必须标注该编号。",
    inputSchema: z.object({}),
    execute: async (): Promise<GetCurrentPageOutput> => {
      const page = resolveCurrentPage(ctx);
      const contextKey = `page:${ctx.subjectId}/${ctx.categoryId}/${ctx.itemId}`;
      const already = runtime.loadedContextKeys.has(contextKey);
      const citeIndex = page.citable && !already ? allocateCiteIndex(runtime) : undefined;
      return dedupeByContextKey(runtime, "getCurrentPage", {
        text: citeIndex ? prefixCiteTag(page.text, citeIndex, "当前页", page.path) : page.text,
        contextKey: `page:${ctx.subjectId}/${ctx.categoryId}/${ctx.itemId}`,
        path: page.path,
        title: page.title,
        found: page.citable,
        citeIndex,
      });
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
