// 自动路由的「模型兜底」：让一个极便宜的快速模型在候选里挑一个，只回别名。
//
// 设计要点（对应需求）：
//  - **规则优先**：明显的硬任务（做题/出题/讲解/系统检索…）根本不问模型，直接用规则定；
//    见 autoRoute.ts 的 HARD_TASK_RE。模型只处理"规则说不清"的短问题。
//  - **输出收窄**：temperature 0 + max_tokens 24 + response_format=json_object + 只认四个别名，
//    再叠一层正则提取（模型偶尔会无视格式多吐几个字，正则把它捞回来）。
//  - **失败即回落**：超时 6s、任何异常都返回 null，调用方沿用规则结果，绝不阻塞主流程。

import { callFastModel } from "@/lib/ai/fastModel";
import { buildModelRouterPrompt } from "@/lib/ai/prompts";

/** 别名 → 注册 id。别名刻意取短：JSON 更短，max_tokens 才能压到个位数。 */
export const ROUTER_ALIAS_TO_MODEL: Record<string, string> = {
  laguna: "poolside/laguna-s-2.1-free",
  ling: "inclusionai/ling-3.0-flash-sante:free",
  ds: "deepseek/deepseek-v4.1-flash",
  glm: "z-ai/glm-5.3-flash",
};

/** 模型 → 别名（提示词里用）。 */
export function routerAliasForModel(modelId: string): string | undefined {
  return Object.keys(ROUTER_ALIAS_TO_MODEL).find((alias) => ROUTER_ALIAS_TO_MODEL[alias] === modelId);
}

/**
 * 从快速模型的原始输出里提取选择结果。
 * 先认标准 JSON，再退化成"文本里出现哪个别名就取哪个"——上游偶尔会加前后缀。
 */
export function parseRouterChoice(raw: string, allowed: readonly string[]): string | null {
  if (!raw) return null;
  const allowedSet = new Set(allowed);
  const jsonLike = raw.match(/"m"\s*:\s*"([A-Za-z0-9_-]+)"/);
  const candidate = jsonLike?.[1]?.toLowerCase();
  if (candidate) {
    const model = ROUTER_ALIAS_TO_MODEL[candidate];
    if (model && allowedSet.has(model)) return model;
  }
  // 退化路径：取文本里出现的第一个合法别名（按别名在 JSON 之外的出现位置）。
  let best: { index: number; model: string } | null = null;
  for (const alias of Object.keys(ROUTER_ALIAS_TO_MODEL)) {
    const index = raw.toLowerCase().indexOf(alias);
    if (index < 0) continue;
    const model = ROUTER_ALIAS_TO_MODEL[alias];
    if (!allowedSet.has(model)) continue;
    if (!best || index < best.index) best = { index, model };
  }
  return best?.model ?? null;
}

/** 发给快速模型的极简任务摘要（不传整段聊天历史）。 */
export function buildRouterUserLine(input: {
  text: string;
  hasImages: boolean;
  thinking: boolean;
}): string {
  const trimmed = input.text.replace(/\s+/g, " ").trim().slice(0, 300);
  return [
    `带图片：${input.hasImages ? "是" : "否"}`,
    `开启深度思考：${input.thinking ? "是" : "否"}`,
    `用户提问：${trimmed || "（空）"}`,
  ].join("\n");
}

/**
 * 让快速模型挑一个模型。返回注册 id；未配置 / 超时 / 输出不可解析时返回 null。
 */
export async function routeModelByFastModel(input: {
  text: string;
  hasImages: boolean;
  thinking: boolean;
  allowed: readonly string[];
}): Promise<{ modelId: string | null; elapsedMs: number; raw: string }> {
  const system = buildModelRouterPrompt();
  if (!system) return { modelId: null, elapsedMs: 0, raw: "" };
  const result = await callFastModel({
    system,
    user: buildRouterUserLine(input),
    maxTokens: 24,
    json: true,
    temperature: 0,
  });
  if (!result) return { modelId: null, elapsedMs: 0, raw: "" };
  return {
    modelId: parseRouterChoice(result.text, input.allowed),
    elapsedMs: result.elapsedMs,
    raw: result.text,
  };
}
