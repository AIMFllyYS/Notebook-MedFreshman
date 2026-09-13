import { tool } from "ai";
import { z } from "zod";
import type { ArtifactCatalogItem, GetArtifactOutput } from "@/lib/ai/agent/tools/getArtifact/types";
import { toText } from "@/lib/ai/agent/tools/_shared";

export function createGetArtifactTool(artifacts: ArtifactCatalogItem[] = []) {
  const catalog = artifacts;
  return tool({
    description:
      "按 id 取回此前生成的 HTML 演示全文。上下文里只保留 id、标题和摘要；需要核对、引用或修改演示内容时调用。id 形如 art_call_xxx。",
    inputSchema: z.object({
      id: z.string().describe("演示 id，来自【已生成的演示】列表或此前 renderInteractive 结果"),
    }),
    execute: async ({ id }): Promise<GetArtifactOutput> => {
      const item = catalog.find((artifact) => artifact.id === id);
      if (!item) {
        const available = catalog.map((artifact) => artifact.id).join("、") || "无";
        return {
          text: `未找到演示 ${id}。可用 id：${available}`,
          artifactId: id,
          found: false,
        };
      }
      if (!item.html) {
        return {
          text: `演示「${item.title || id}」尚无全文（可能仍在生成）。摘要：${item.summary || "（空）"}`,
          artifactId: item.id,
          title: item.title,
          found: true,
        };
      }
      return {
        text: `【演示 ${item.id} / ${item.title || "未命名"}】\n${item.html}`,
        artifactId: item.id,
        title: item.title,
        found: true,
      };
    },
    toModelOutput: ({ output }) => toText(output),
  });
}
