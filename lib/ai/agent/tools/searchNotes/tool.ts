import { tool } from "ai";
import { z } from "zod";
import { findContentItem, searchAllContent, type ContentSearchScope } from "@/lib/content/loader";
import { getIndexHealth } from "@/lib/ai/search/indexHealth";
import { getLastSearchDiagnostics } from "@/lib/ai/search/hybridSearch";
import type { SearchNotesOutput } from "@/lib/ai/agent/tools/searchNotes/types";
import {
  dedupeByContextKey,
  normalizeContextKeyPart,
  toText,
  type StudyToolContext,
  type StudyToolRuntime,
} from "@/lib/ai/agent/tools/_shared";

export function createSearchNotesTool(ctx: StudyToolContext, runtime: StudyToolRuntime) {
  return tool({
    description:
      "在课程内容（教材、详解、录音、纪要）中做语义+关键词检索，返回带上下文的相关片段及其所在位置。默认只搜当前学年；不确定教材是否讲过某点、或知识点可能跨学年时先检索。查询用知识点短语（如「核糖体」「被覆上皮」），不要用「什么是…」整句。返回结果的 path 字段可直接传给 getSection 获取完整内容；片段不够时必须再调 getSection。",
    inputSchema: z.object({
      query: z.string().describe("检索短语，如 '贝叶斯公式'、'线粒体'、'肝小叶'、'被覆上皮'。用知识点本身，不要用完整问句。"),
      crossYear: z.boolean().optional().describe("true 时跨学年检索（大一与大二都搜）。医学基础常与大一化学/物理交叉，此时应打开。"),
      subjectId: z.string().optional().describe("限定科目 id，如 histology、biochemistry、anatomy、cell-biology、instrumental-analysis。不传则搜当前学年全部科目。"),
    }),
    execute: async ({ query, crossYear, subjectId }): Promise<SearchNotesOutput> => {
      const health = getIndexHealth();
      if (!health.ok) {
        return { text: `检索索引未加载：${health.reason}`, hits: [] };
      }
      const found = findContentItem(ctx.subjectId, ctx.categoryId, ctx.itemId);
      const queryContext = found
        ? `${found.subjectName} ${found.parentTitle ?? ""} ${found.item.title}`.replace(/\s+/g, " ").trim()
        : undefined;
      const scope: ContentSearchScope = crossYear ? "all" : ctx.academicYear;
      const run = (year: ContentSearchScope) =>
        searchAllContent(query, {
          limit: 8,
          academicYear: year,
          subjectId: subjectId || undefined,
          preferSubjectId: subjectId ? undefined : ctx.subjectId,
          queryContext,
        });
      let hits = await run(scope);
      let widened = false;
      if (!hits.length && scope !== "all") {
        hits = await run("all");
        widened = hits.length > 0;
      }
      const diag = getLastSearchDiagnostics();
      const diagnostics = diag
        ? {
            bm25Hits: diag.bm25Hits,
            vecHits: diag.vecHits,
            mode: diag.mode,
            indexBuiltAt: diag.indexBuiltAt || health.manifest?.builtAt,
            ms: diag.ms,
            embedError: diag.embedError,
          }
        : undefined;
      if (!hits.length) {
        return { text: "未检索到相关内容。可尝试更换关键词，或调用 getOutline 浏览目录。", hits: [], diagnostics };
      }
      const lines = hits.map((h) => `[${h.title}] (path: ${h.path})\n…${h.snippet}…`);
      if (widened) lines.unshift("（当前学年无命中，以下为跨学年结果）");
      lines.push('\n如需查看完整内容，可调用 getSection(path: "对应路径")。');
      return dedupeByContextKey(runtime, "searchNotes", {
        text: lines.join("\n\n"),
        contextKey: `search:${normalizeContextKeyPart(query)}`,
        hits: hits.slice(0, 5).map((h) => ({ title: h.title, path: h.path, snippet: h.snippet })),
        diagnostics,
      });
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
