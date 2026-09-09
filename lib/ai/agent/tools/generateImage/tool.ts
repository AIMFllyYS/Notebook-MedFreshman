import { tool } from "ai";
import { z } from "zod";
import type { GenerateImageOutput } from "@/lib/ai/agent/tools/generateImage/types";
import { toText, type StudyToolContext } from "@/lib/ai/agent/tools/_shared";

export function createGenerateImageTool(ctx: StudyToolContext) {
  return tool({
    description:
      "AI 生图工具。当 SVG/交互演示无法充分展示（需要写实风格图片、复杂场景、艺术化呈现），或用户明确要求生图时调用。调用后系统会先展示生图提示词卡片，用户批准后才会实际生成图片，生成过程在独立窗口中展示。优先使用用户配置的默认生图模型，未配置时降级使用硅基流动生图模型。不要滥用——优先使用 SVG 和交互演示，仅在确实需要真实图片时调用。",
    inputSchema: z.object({
      prompt: z.string().describe("优化的生图提示词（英文或中文，描述要生成的图片内容、风格、构图等）"),
      title: z.string().describe("图片标题（简短中文）"),
      size: z.enum(["1024x1024", "960x1280", "768x1024", "720x1440", "720x1280"]).optional().describe("图片尺寸"),
      count: z.number().optional().describe("生成数量（1-4），默认 1"),
    }),
    // 不在此处调用生图 API——前端展示批准卡片，用户批准后独立请求 /api/image-gen。
    execute: async ({ prompt, title, size, count }, { toolCallId }): Promise<GenerateImageOutput> => ({
      text: `生图请求「${title || "AI 生图"}」已提交，等待用户批准后才会实际生成。请用一两句话说明这张图将帮助理解什么，然后继续你的讲解。`,
      imageGenId: `img_${toolCallId}`,
      prompt,
      title,
      size: size ?? "1024x1024",
      count: Math.min(Math.max(Number(count) || 1, 1), 4),
      modelId: ctx.modelId,
    }),
    toModelOutput: ({ output }) => toText(output),
  });
}
