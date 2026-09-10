import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export interface RenderInteractiveInput {
  title: string;
  prompt: string;
}

export interface RenderInteractiveOutput extends TextToolOutput {
  /** 前端据此独立请求 /api/artifact 流式生成 HTML。 */
  artifactId: string;
  title: string;
  prompt: string;
  /** 发起生成时选中的模型 id，避免后续切换模型污染 artifact 请求。 */
  modelId?: string;
  /** 当前模型不支持 HTML 交互生成时的原因；前端显示且不请求 /api/artifact。 */
  unsupportedReason?: string;
}
