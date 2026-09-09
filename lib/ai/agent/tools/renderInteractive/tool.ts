import { tool } from "ai";
import { z } from "zod";
import type { RenderInteractiveOutput } from "@/lib/ai/agent/tools/renderInteractive/types";
import { toText, type StudyToolContext } from "@/lib/ai/agent/tools/_shared";

/**
 * renderInteractive —— 生成 HTML 演示（Artifact）。
 * 工具 id 因已持久化在聊天历史（tool-renderInteractive part）中而保留历史名称；
 * 对外文案、组件、store 统一用 "artifact / 演示"。不要改这个 id。
 *
 * 链路：本工具 → lib/ai/artifact.ts（生成）→ app/api/artifact/route.ts（SSE）
 *      → components/chat/ArtifactCard.tsx（消息内卡片）→ lib/hooks/useArtifacts.ts（store）
 *      → components/chat/ArtifactViewer.tsx（全局浮窗，AppShell 挂载，不属于右侧面板或笔记区）。
 *
 * 不是这些文件：
 * - components/interactives/（手写 React 交互组件、右侧「可交互」tab）
 * - components/canvas/renderers/HtmlRenderer.tsx（drawDiagram html 模式、消息内联 iframe）
 * - ContentPageClient 的 renderType='html'（内容页课件 iframe，计划 21）
 */
export function createRenderInteractiveTool(ctx: StudyToolContext) {
  return tool({
    description:
      "当一个概念用静态文字难以讲清、且交互能显著提升理解时，调用本工具在后台生成一个可交互的 HTML 演示（例如：可拖动滑块看概率分布随参数变化、物理受力/矢量合成、分子构象翻转/反应机理分步等）。生成后用户可在对话卡片右上角点击「打开演示」。仅在交互确有必要时调用，不要滥用。",
    inputSchema: z.object({
      title: z.string().describe("演示标题（简短）"),
      prompt: z.string().describe("要可视化/讲解的知识点与交互需求的详细描述"),
    }),
    // 产物 id 随 tool 结果下发；前端卡片拿到 title/prompt 后独立请求 /api/artifact 流式生成 HTML，
    // 不阻塞主聊天流。
    execute: async ({ title, prompt }, { toolCallId }): Promise<RenderInteractiveOutput> => ({
      text: `交互演示「${title || "交互演示"}」已开始在前端独立生成。请用一两句话说明这个演示将帮助理解什么，然后继续你的讲解。`,
      artifactId: `art_${toolCallId}`,
      title,
      prompt,
      modelId: ctx.modelId,
      unsupportedReason: ctx.artifactUnsupportedReason,
    }),
    toModelOutput: ({ output }) => toText(output),
  });
}
