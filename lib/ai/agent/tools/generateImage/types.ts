import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export interface GenerateImageInput {
  prompt: string;
  title: string;
  size?: "1024x1024" | "960x1280" | "768x1024" | "720x1440" | "720x1280";
  count?: number;
}

export interface GenerateImageOutput extends TextToolOutput {
  /** 前端展示批准卡片，用户批准后独立请求 /api/image-gen。 */
  imageGenId: string;
  prompt: string;
  title: string;
  size: string;
  count: number;
  /** 发起时选中的生图模型 id，批准后必须使用该模型。 */
  modelId?: string;
}
