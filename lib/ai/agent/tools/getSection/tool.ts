import { tool } from "ai";
import { z } from "zod";
import { readContentMarkdown, resolveContentPath } from "@/lib/content/loader";
import type { GetSectionOutput } from "@/lib/ai/agent/tools/getSection/types";
import { allocateCiteIndex, prefixCiteTag } from "@/lib/ai/agent/tools/citeIndex";
import { dedupeByContextKey, toText, type StudyToolContext, type StudyToolRuntime } from "@/lib/ai/agent/tools/_shared";

export function createGetSectionTool(ctx: StudyToolContext, runtime: StudyToolRuntime) {
  return tool({
    description:
      '按路径获取任意科目任意页面的完整笔记正文，用于跨小节或跨科目讲解与对比（不要凭记忆复述教材）。path 格式为 "科目/分类/内容id"，例如 "physics/detail/2.1"、"chemistry/recording/rec-05"。也可只传 sectionId（如 "1.4"），默认读取当前科目的 detail 分类。可先调用 getOutline 查看有效路径。回灌正文带有 [n] 编号；凡依据该页写出的句子，句末必须标注该编号。',
    inputSchema: z.object({
      path: z.string().optional().describe('复合路径，格式 "科目/分类/内容id"，如 "physics/detail/2.1"、"chemistry/recording/rec-05"。优先使用此参数。'),
      sectionId: z.string().optional().describe('向下兼容：纯小节 id（如 "1.4"），默认读取当前科目 detail 分类。优先使用 path 参数。'),
    }),
    execute: async ({ path, sectionId }): Promise<GetSectionOutput> => {
      const input = (path ?? "") || (sectionId ?? "");
      if (!input) {
        return {
          text: '缺少参数：请传入 path（如 "physics/detail/2.1"）或 sectionId（如 "1.4"）。可调用 getOutline 查看有效路径。',
          found: false,
        };
      }
      const resolved = resolveContentPath(input, ctx.subjectId);
      const resolvedPath = `${resolved.subjectId}/${resolved.categoryId}/${resolved.itemId}`;
      const contextKey = `section:${resolvedPath}`;
      if (!resolved.found) {
        return dedupeByContextKey(runtime, "getSection", {
          text: `【${resolved.title}】未找到该页面内容（路径无效）。可调用 getOutline 查看有效路径。`,
          contextKey,
          title: resolved.title,
          path: resolvedPath,
          found: false,
        });
      }
      const md = readContentMarkdown(resolved.subjectId, resolved.categoryId, resolved.itemId);
      if (!md) {
        return dedupeByContextKey(runtime, "getSection", {
          text: `【${resolved.title}】未找到该页面内容（正文尚未生成）。可调用 getOutline 查看有效路径。`,
          contextKey,
          title: resolved.title,
          path: resolvedPath,
          found: false,
        });
      }
      const already = runtime.loadedContextKeys.has(contextKey);
      const citeIndex = already ? undefined : allocateCiteIndex(runtime);
      const body = `【${resolved.title}】\n\n${md}`;
      return dedupeByContextKey(runtime, "getSection", {
        text: citeIndex ? prefixCiteTag(body, citeIndex, "教材", resolvedPath) : body,
        contextKey,
        title: resolved.title,
        path: resolvedPath,
        found: true,
        citeIndex,
      });
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
