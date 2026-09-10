import { tool } from "ai";
import { z } from "zod";
import { findContentItem, readContentMarkdown } from "@/lib/content/loader";
import type { GetCurrentPageOutput } from "@/lib/ai/agent/tools/getCurrentPage/types";
import { dedupeByContextKey, toText, type StudyToolContext, type StudyToolRuntime } from "@/lib/ai/agent/tools/_shared";

function currentPagePayload(ctx: StudyToolContext): string {
  const md = readContentMarkdown(ctx.subjectId, ctx.categoryId, ctx.itemId);
  const found = findContentItem(ctx.subjectId, ctx.categoryId, ctx.itemId);
  const title = found
    ? `${found.subjectName} > ${found.categoryName} > ${found.parentTitle ? found.parentTitle + " > " : ""}${found.item.title}`
    : `${ctx.subjectId} / ${ctx.categoryId} / ${ctx.itemId}`;
  if (!md) {
    return `【${title}】该页正文尚未生成（占位）。可结合标题与课程大纲作答，并说明该处正在完善。`;
  }
  return `【${title}】\n\n${md}`;
}

export function createGetCurrentPageTool(ctx: StudyToolContext, runtime: StudyToolRuntime) {
  return tool({
    description:
      "获取用户当前正在阅读的页面完整正文（含标题、公式、知识点）。当问题出现'这一节/这页/当前/这里/上面这段/这道题'等指代当前页面的说法时，应优先调用。",
    inputSchema: z.object({}),
    execute: async (): Promise<GetCurrentPageOutput> =>
      dedupeByContextKey(runtime, "getCurrentPage", {
        text: currentPagePayload(ctx),
        contextKey: `page:${ctx.subjectId}/${ctx.categoryId}/${ctx.itemId}`,
      }),
    toModelOutput: ({ output }) => toText(output),
  });
}
