// AI SDK 模型工厂：把 provider.ts 的凭证/端点解析结果装配成一个可直接交给
// ToolLoopAgent / generateText / streamText 的 LanguageModel。
//
//  - openai / siliconflow 协议 → @ai-sdk/openai-compatible（原生解析 reasoning_content、cached_tokens）
//  - anthropic 协议           → @ai-sdk/anthropic（替代旧 anthropicAdapter 的双向翻译）
//  - endpoints 链 / 生图模式文本模型降级 → createFailoverLanguageModel
//  - 正文里内嵌 <think> 的模型 → extractReasoningMiddleware（服务端统一抽成 reasoning）
//  - 非标准思考字段（thinking / reasoning_details / 结构化对象）→ createReasoningNormalizingFetch
//
// 仅服务端导入。

import type { LanguageModelV4, SharedV4ProviderOptions } from "@ai-sdk/provider";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createAnthropic } from "@ai-sdk/anthropic";
import { wrapLanguageModel, extractReasoningMiddleware } from "ai";
import {
  resolveProvider,
  resolveNextProvider,
  thinkingBudget,
  type CustomProvider,
  type ResolvedProvider,
} from "@/lib/ai/provider";
import {
  getModelInfo,
  getModelInfoWithCustom,
  wireThinkingEffort,
  type CustomApiGroup,
  type ModelInfo,
  type ThinkingEffort,
} from "@/lib/ai/models";
import { createFailoverLanguageModel, type FailoverCandidate } from "@/lib/ai/sdk/failoverModel";
import { createReasoningNormalizingFetch } from "@/lib/ai/sdk/reasoningNormalizer";

/** openai-compatible 实例统一用这个名字，providerOptions 也用同一个 key（无需按上游区分）。 */
export const UPSTREAM_PROVIDER_NAME = "upstream";

const ANTHROPIC_THINKING_MAX_TOKENS_MIN = 16_000;

export type { ThinkingEffort };

/** 思考相关的调用参数：providerOptions 按协议装配；Anthropic 还需要显式抬高 maxOutputTokens。 */
export interface ThinkingCallSettings {
  providerOptions?: SharedV4ProviderOptions;
  maxOutputTokens?: number;
}

export interface ResolvedLanguageModel {
  model: LanguageModelV4;
  /** 主端点的解析结果（registryId / 定价 / timeoutMs / apiModelId 等）。 */
  provider: ResolvedProvider;
  /** 注册表声明的能力（自定义模型来自分组配置）。 */
  supportsThinking: boolean;
  supportsTools: boolean;
  /** 若启用思考，返回应合并进 generateText/streamText/Agent 的参数；模型不支持思考时返回 {}。 */
  thinkingSettings(effort: ThinkingEffort | undefined): ThinkingCallSettings;
}

export interface ResolveLanguageModelOptions {
  /** 切换到备用端点/备用模型时回调（用于向前端推送提示）。 */
  onFailover?: (next: { label: string }, error: unknown) => void;
  /** 额外的整模型降级链（如生图模式：主文本模型 → imageModeTextModelFallback）。 */
  fallbackModelIds?: string[];
  /** 覆盖 failover 首字节超时。交互 HTML 生成要把深度思考等完，需远大于对话默认。 */
  firstChunkTimeoutMs?: number;
}

/** 兼容用户填 https://api.anthropic.com、…/v1、以及各种 One-API 中转（如 https://xxx.com/anthropic）。 */
export function normalizeAnthropicBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/+$/, "");
  return /\/v1$/.test(trimmed) ? trimmed : `${trimmed}/v1`;
}

function buildBaseModel(p: ResolvedProvider): LanguageModelV4 {
  if (p.apiProtocol === "anthropic") {
    const anthropic = createAnthropic({ baseURL: normalizeAnthropicBaseUrl(p.baseUrl), apiKey: p.apiKey });
    return anthropic(p.apiModelId);
  }
  const upstream = createOpenAICompatible({
    name: UPSTREAM_PROVIDER_NAME,
    baseURL: p.baseUrl.replace(/\/+$/, ""),
    apiKey: p.apiKey,
    includeUsage: true,
    // 标准字段名也可能携带结构化值；归一化只改可识别的思考内容，其余协议仍由 SDK 校验。
    fetch: createReasoningNormalizingFetch(p.reasoningField),
  });
  return wrapLanguageModel({
    model: upstream(p.apiModelId),
    middleware: extractReasoningMiddleware({ tagName: "think" }),
  });
}

/** 把主端点 + endpoints 链 + 额外降级模型展开成候选列表（只保留已配置凭证的）。 */
function collectCandidates(
  primary: ResolvedProvider,
  custom: CustomProvider | CustomApiGroup[] | null | undefined,
  fallbackModelIds: string[],
): ResolvedProvider[] {
  const list: ResolvedProvider[] = [primary];
  let cur = primary;
  while (true) {
    const next = resolveNextProvider(cur.registryId, cur.endpointIndex, custom);
    if (!next) break;
    list.push(next);
    cur = next;
  }
  for (const id of fallbackModelIds) {
    const p = resolveProvider(id, custom);
    if (p.configured && !list.some((x) => x.registryId === p.registryId && x.endpointIndex === p.endpointIndex)) {
      list.push(p);
    }
  }
  return list;
}

export function buildThinkingSettings(
  p: ResolvedProvider,
  effort: ThinkingEffort | undefined,
  info?: ModelInfo,
): ThinkingCallSettings {
  const budget = thinkingBudget(effort);
  const modelInfo = info ?? (p.isCustom ? undefined : getModelInfo(p.registryId));
  const effortStr = wireThinkingEffort(modelInfo, effort);
  switch (p.thinkingRequestStyle) {
    case "none":
      return {};
    case "openai-reasoning-effort":
      return { providerOptions: { [UPSTREAM_PROVIDER_NAME]: { reasoningEffort: effortStr } } };
    case "openrouter-reasoning":
      return { providerOptions: { [UPSTREAM_PROVIDER_NAME]: { reasoning: { effort: effortStr } } } };
    case "anthropic-thinking": {
      const maxOutputTokens = Math.max(ANTHROPIC_THINKING_MAX_TOKENS_MIN, budget + 4096);
      if (p.apiProtocol === "anthropic") {
        return {
          providerOptions: { anthropic: { thinking: { type: "enabled", budgetTokens: budget } } },
          maxOutputTokens,
        };
      }
      // "OpenAI 兼容"中转把 Anthropic 请求体原样透传时，仍按原生字段下发。
      return {
        providerOptions: { [UPSTREAM_PROVIDER_NAME]: { thinking: { type: "enabled", budget_tokens: budget } } },
        maxOutputTokens,
      };
    }
    case "siliconflow":
    default:
      return { providerOptions: { [UPSTREAM_PROVIDER_NAME]: { enable_thinking: true, thinking_budget: budget } } };
  }
}

export function resolveLanguageModel(
  modelId: string | undefined,
  custom?: CustomProvider | CustomApiGroup[] | null,
  options: ResolveLanguageModelOptions = {},
): ResolvedLanguageModel {
  const primary = resolveProvider(modelId, custom);
  const customGroups = Array.isArray(custom) ? custom : [];
  const info = getModelInfoWithCustom(primary.registryId, customGroups);
  const supportsThinking = primary.isCustom ? primary.thinkingRequestStyle !== "none" && (info?.thinking ?? true) : info?.thinking === true;
  const supportsTools = info?.tools !== false;

  const candidates: FailoverCandidate[] = collectCandidates(primary, custom, options.fallbackModelIds ?? []).map((p) => ({
    model: buildBaseModel(p),
    label: p.apiModelId,
  }));

  const model = createFailoverLanguageModel(candidates, {
    onFailover: (next, _index, error) => options.onFailover?.({ label: next.label }, error),
    // 与旧实现一致：首字节超时视为端点不可用（慢模型如 MoE 冷启动在 models.ts 单独放宽）。
    firstChunkTimeoutMs: options.firstChunkTimeoutMs ?? primary.timeoutMs,
  });

  return {
    model,
    provider: primary,
    supportsThinking,
    supportsTools,
    thinkingSettings: (effort) => (supportsThinking ? buildThinkingSettings(primary, effort, info) : {}),
  };
}
