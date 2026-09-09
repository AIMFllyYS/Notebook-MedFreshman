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

export function createWebSearchTool(runtime: StudyToolRuntime) {
  return tool({
    description:
      "联网搜索互联网实时信息，用于教材之外的最新进展、外部事实核实。使用后须注明来源，且与教材内容区分。",
    inputSchema: z.object({
      query: z.string().describe("搜索关键词，建议用中文"),
      numResults: z.number().optional().describe("返回结果数量，默认 5"),
    }),
    execute: async ({ query, numResults }): Promise<WebSearchOutput> => {
      const r = await runWebSearchDetailed(query, Number(numResults) || 5);
      return dedupeByContextKey(runtime, "webSearch", {
        text: r.content,
        contextKey: `web:${normalizeContextKeyPart(query)}`,
        sources: r.sources,
        cacheHit: r.cacheHit,
      });
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
