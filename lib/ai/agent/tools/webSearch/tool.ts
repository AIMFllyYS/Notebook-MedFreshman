import { tool } from "ai";
import { z } from "zod";
import { runWebSearchDetailed } from "@/lib/ai/webSearch";
import type { WebSearchOutput } from "@/lib/ai/agent/tools/webSearch/types";
import {
  dedupeByContextKey,
  normalizeContextKeyPart,
  toText,
  type StudyToolRuntime,
} from "@/lib/ai/agent/tools/_shared";
import { allocateCiteIndex, appendCiteLegend, formatCiteLine } from "@/lib/ai/agent/tools/citeIndex";

/** 测试可替换联网搜索，避免打真实供应商。 */
export const webSearchIo = { runWebSearchDetailed };

/**
 * 联网搜索：背后是**多供应商并行 + 跨源综述**的子智能体。
 *
 * 三家的定位（提示词里也要说清，模型才知道该选谁）：
 *  - 默认优先级：Kimi > 智谱 > Perplexity
 *  - 权威性：    Perplexity > Kimi > 智谱
 *  - 成本敏感：  智谱 > Kimi > Perplexity
 */
export function createWebSearchTool(runtime: StudyToolRuntime) {
  return tool({
    description: [
      "联网搜索互联网实时信息（外部事实、最新进展、需要查证的数字与人名）。用后须注明来源，并与教材内容区分。",
      "可以自己决定这次搜几个来源（mode）：",
      "- daily（默认）：Kimi + 智谱。日常事务、新闻、天气、价格这类问题用它，便宜够快。",
      "- academic：Perplexity + Kimi。学术问题、需要证据/数据/权威来源时用它（Perplexity 权威性最高）。",
      "- comprehensive：三家全上并做跨源综述。问题复杂、需要交叉验证或系统性分析时才用（最慢，实测约 40–80s，受 Kimi 两轮搜索拖累）。",
      "- auto：交给策略按问题性质自动判断（拿不准就用它）。",
      "也可以显式点名 providers（kimi / zhipu / perplexity 里的一家或几家）。多源结果会自动按 URL 去重，并在两家以上出结果时做一次跨源综述。",
      "回灌结果带有 [n] 编号。凡依据某条来源写出的句子，句末必须标注对应编号。",
    ].join("\n"),
    inputSchema: z.object({
      query: z.string().describe("搜索关键词，建议用中文"),
      mode: z.enum(["auto", "daily", "academic", "comprehensive"]).optional().describe("搜索广度，缺省 auto"),
      providers: z.array(z.enum(["kimi", "zhipu", "perplexity"])).max(3).optional().describe("显式点名搜索源"),
      numResults: z.number().optional().describe("每个来源返回的结果数量，默认 5"),
    }),
    execute: async ({ query, mode, providers, numResults }): Promise<WebSearchOutput> => {
      const r = await webSearchIo.runWebSearchDetailed(query, Number(numResults) || 5, {
        mode: mode ?? "auto",
        providers,
      });
      const contextKey = "web:" + normalizeContextKeyPart(query) + ":" + (mode ?? "auto") + ":" + (providers ?? []).join("_");
      if (runtime.loadedContextKeys.has(contextKey)) {
        return dedupeByContextKey(runtime, "webSearch", {
          text: r.content,
          contextKey,
          sources: r.sources,
          cacheHit: r.cacheHit,
        });
      }
      const sources = (r.sources ?? []).map((source) => ({
        ...source,
        citeIndex: allocateCiteIndex(runtime),
      }));
      const lines = sources.map((source) =>
        formatCiteLine(source.citeIndex, source.title || source.url || source.alt || "", source.url ?? ""),
      );
      return dedupeByContextKey(runtime, "webSearch", {
        text: appendCiteLegend(r.content, lines),
        // 不同搜索策略不能互相去重：同一个问题用 daily 搜过，改成 comprehensive 必须真的再搜一次。
        contextKey,
        sources,
        cacheHit: r.cacheHit,
      });
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
