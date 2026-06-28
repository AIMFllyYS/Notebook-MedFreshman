// AI Provider 解析层：集中决定"用哪个 base / key / model"。
// 规则：
//   - modelId === "custom" 且自定义 baseUrl/apiKey/model 三者齐全 → 用自定义端点。
//   - modelInfo.provider === "mimo" → 用 MIMO_BASE_URL / MIMO_API_KEY。
//   - 否则 → 用 env 默认端点（AI_BASE_URL/AI_API_KEY），modelId 决定具体模型。
// 仅服务端导入（读取 process.env）。

import { getModelInfo, CUSTOM_PREFIX } from "@/lib/ai/models";

const BASE = process.env.AI_BASE_URL || "";
const KEY = process.env.AI_API_KEY || "";
const REASONING_FIELD = process.env.AI_REASONING_FIELD || "reasoning_content";

const MIMO_BASE = process.env.MIMO_BASE_URL || "https://api.xiaomimimo.com/v1";
const MIMO_KEY = process.env.MIMO_API_KEY || "";

export const ENV_MODEL_PRO = process.env.AI_MODEL_PRO || "deepseek-ai/DeepSeek-V4-Pro";
export const ENV_MODEL_FLASH = process.env.AI_MODEL_FLASH || "deepseek-ai/DeepSeek-V4-Flash";

export interface CustomProvider {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
}

export interface ResolvedProvider {
  baseUrl: string;
  apiKey: string;
  model: string;
  reasoningField: string;
  isCustom: boolean;
  /** env 端点是否已正确配置（自定义端点 configured 恒为 true）。 */
  configured: boolean;
}

export function resolveProvider(
  modelId: string | undefined,
  custom?: CustomProvider,
): ResolvedProvider {
  const isCustomModel =
    modelId === "custom" || (modelId?.startsWith(CUSTOM_PREFIX) ?? false);
  const customModelName = modelId?.startsWith(CUSTOM_PREFIX)
    ? modelId.slice(CUSTOM_PREFIX.length)
    : custom?.model;

  if (
    isCustomModel &&
    custom?.baseUrl?.trim() &&
    custom?.apiKey?.trim() &&
    customModelName?.trim()
  ) {
    return {
      baseUrl: custom.baseUrl.trim(),
      apiKey: custom.apiKey.trim(),
      model: customModelName.trim(),
      reasoningField: REASONING_FIELD,
      isCustom: true,
      configured: true,
    };
  }

  const model = modelId && modelId !== "custom" && !(modelId?.startsWith(CUSTOM_PREFIX) ?? false) ? modelId : ENV_MODEL_FLASH;
  const info = getModelInfo(model);

  if (info?.provider === "mimo") {
    const configured = !!(MIMO_BASE && MIMO_KEY);
    return {
      baseUrl: MIMO_BASE,
      apiKey: MIMO_KEY,
      model,
      reasoningField: REASONING_FIELD,
      isCustom: false,
      configured,
    };
  }

  const configured = !!(BASE && KEY && !BASE.includes("your-endpoint"));
  return {
    baseUrl: BASE,
    apiKey: KEY,
    model,
    reasoningField: REASONING_FIELD,
    isCustom: false,
    configured,
  };
}

/** base 末尾去斜杠后拼出 /chat/completions。 */
export function chatCompletionsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
}

/** 深度思考预算（token），按用户选择的力度映射。 */
export function thinkingBudget(effort: string | undefined): number {
  switch (effort) {
    case "low":
      return 2000;
    case "high":
      return 16000;
    case "max":
      return 32000;
    case "medium":
    default:
      return 8000;
  }
}
