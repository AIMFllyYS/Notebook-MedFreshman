/**
 * /api/chat 服务端用量台账：上游 usage 到手即写 usage_ledger，
 * 不依赖客户端 SSE。0/0 不落行；reasoning / cache-write 进列并参与计价。
 */

import { extractAccessToken, verifySupabaseAccessToken, type VerifyAccessToken } from "@/lib/auth/aiGate";
import { createServiceAuthClient } from "@/lib/auth/serviceClient";
import { getModelInfo, getModelInfoWithCustom, type CustomApiGroup } from "@/lib/ai/models";
import type { UsageSummary } from "@/lib/types/chat";

const CHAT_USAGE_ROUTE = "/api/chat";
const USAGE_WAIT_MS = 3_000;

type UsagePool = "platform" | "byok";

interface MappedUsage {
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
  cacheWriteTokens: number;
  totalTokens: number;
}

interface ModelPricing {
  input: number;
  cachedInput: number;
  output: number;
  cacheWrite?: number;
}

export interface UsageLedgerRow {
  user_id: string;
  pool: UsagePool;
  route: string;
  kind: "llm";
  selected_model_id: string | null;
  actual_model_id: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  cached_tokens: number;
  reasoning_tokens: number;
  cache_write_tokens: number;
  image_count: number;
  cost_cny: number;
  session_id: string | null;
  request_id: string | null;
  meta: Record<string, unknown>;
}

interface SettleChatUsageInput {
  rawUsage: unknown;
  userId?: string | null;
  selectedModelId?: string | null;
  actualModelId?: string | null;
  customGroups?: CustomApiGroup[];
  pool?: UsagePool;
  sessionId?: string | null;
  requestId?: string | null;
  route?: string;
  aborted?: boolean;
  insert?: (row: UsageLedgerRow) => Promise<void>;
}

interface SettleChatUsageResult {
  usage: MappedUsage;
  summary: UsageSummary | undefined;
  row: UsageLedgerRow | null;
  recorded: boolean;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value != null && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}

function tokenCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

function optionalToken(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

/** 同时吃 LanguageModelUsage（扁平 + details）和 SDK mock 的嵌套 {total, cacheRead, …}。 */
export function mapLanguageModelUsage(raw: unknown): MappedUsage {
  const u = asRecord(raw) ?? {};
  const input = u.inputTokens;
  const output = u.outputTokens;
  const nestedInput = asRecord(input);
  const nestedOutput = asRecord(output);
  const inputDetails = asRecord(u.inputTokenDetails) ?? nestedInput ?? {};
  const outputDetails = asRecord(u.outputTokenDetails) ?? nestedOutput ?? {};

  const promptTokens = nestedInput
    ? tokenCount(nestedInput.total) ||
      tokenCount(nestedInput.noCache) + tokenCount(nestedInput.cacheRead) + tokenCount(nestedInput.cacheWrite)
    : tokenCount(input);
  const completionTokens = nestedOutput
    ? tokenCount(nestedOutput.total) || tokenCount(nestedOutput.text) + tokenCount(nestedOutput.reasoning)
    : tokenCount(output);
  const cachedTokens = tokenCount(inputDetails.cacheReadTokens) || tokenCount(nestedInput?.cacheRead);
  const cacheWriteTokens = tokenCount(inputDetails.cacheWriteTokens) || tokenCount(nestedInput?.cacheWrite);
  const reasoningTokens = tokenCount(outputDetails.reasoningTokens) || tokenCount(nestedOutput?.reasoning);
  const totalTokens = tokenCount(u.totalTokens) || promptTokens + completionTokens;

  return {
    promptTokens,
    completionTokens,
    cachedTokens,
    cacheWriteTokens,
    reasoningTokens,
    totalTokens,
  };
}

export function hasBillableUsage(usage: MappedUsage): boolean {
  return (
    usage.promptTokens > 0 ||
    usage.completionTokens > 0 ||
    usage.cachedTokens > 0 ||
    usage.reasoningTokens > 0 ||
    usage.cacheWriteTokens > 0
  );
}

function toUsageSummary(usage: MappedUsage, actualModelId?: string | null): UsageSummary {
  return {
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    cachedTokens: usage.cachedTokens,
    totalTokens: usage.totalTokens,
    ...(actualModelId ? { actualModelId } : {}),
  };
}

/**
 * 落地端点的计价 id：apiModelId 能对上注册表时用它（GLM → mimo-v2.5），
 * 否则退回 registryId（自定义模型、同模型换供应商）。
 */
export function resolveActualBillingModelId(provider: {
  registryId: string;
  apiModelId: string;
  isCustom?: boolean;
}): string {
  if (!provider.isCustom && getModelInfo(provider.apiModelId)) return provider.apiModelId;
  return provider.registryId;
}

function roundCostCny(value: number): number {
  return Number(value.toFixed(6));
}

/**
 * ¥ / 百万 token。uncached 优先用 noCacheTokens；否则 prompt − cacheRead − cacheWrite。
 * reasoning 已含在 completion 里时不重复加；仅当 completion 为 0 时按 output 价计 reasoning。
 * DeepSeek 等注册了 cacheWrite 单价的模型，cache-write token 单独乘该单价。
 */
export function calcUsageCostCny(usage: MappedUsage, pricing?: ModelPricing, raw?: unknown): number {
  if (!pricing) return 0;
  const details = asRecord(asRecord(raw)?.inputTokenDetails) ?? asRecord(asRecord(raw)?.inputTokens);
  const noCache = optionalToken(details?.noCacheTokens) ?? optionalToken(details?.noCache);
  const uncached = noCache ?? Math.max(0, usage.promptTokens - usage.cachedTokens - usage.cacheWriteTokens);
  const outputTokens = usage.completionTokens > 0 ? usage.completionTokens : usage.reasoningTokens;
  const cacheWritePrice = pricing.cacheWrite ?? 0;
  return roundCostCny(
    (uncached * pricing.input +
      usage.cachedTokens * pricing.cachedInput +
      usage.cacheWriteTokens * cacheWritePrice +
      outputTokens * pricing.output) /
      1_000_000,
  );
}

export function buildUsageLedgerRow(input: {
  usage: MappedUsage;
  userId: string;
  selectedModelId?: string | null;
  actualModelId?: string | null;
  customGroups?: CustomApiGroup[];
  pool?: UsagePool;
  sessionId?: string | null;
  requestId?: string | null;
  route?: string;
  aborted?: boolean;
  rawUsage?: unknown;
}): UsageLedgerRow | null {
  if (!hasBillableUsage(input.usage)) return null;
  const actualModelId = input.actualModelId ?? input.selectedModelId ?? null;
  const selectedModelId = input.selectedModelId ?? null;
  const pricing = actualModelId
    ? getModelInfoWithCustom(actualModelId, input.customGroups ?? [])?.pricing
    : undefined;
  return {
    user_id: input.userId,
    pool: input.pool ?? "platform",
    route: input.route ?? CHAT_USAGE_ROUTE,
    kind: "llm",
    selected_model_id: selectedModelId,
    actual_model_id: actualModelId,
    prompt_tokens: input.usage.promptTokens,
    completion_tokens: input.usage.completionTokens,
    cached_tokens: input.usage.cachedTokens,
    reasoning_tokens: input.usage.reasoningTokens,
    cache_write_tokens: input.usage.cacheWriteTokens,
    image_count: 0,
    cost_cny: calcUsageCostCny(input.usage, pricing, input.rawUsage),
    session_id: input.sessionId ?? null,
    request_id: input.requestId ?? null,
    meta: { aborted: input.aborted === true, source: "chat-main" },
  };
}

export async function awaitUsage(
  totalUsage: PromiseLike<unknown> | unknown,
  timeoutMs = USAGE_WAIT_MS,
): Promise<unknown | undefined> {
  try {
    return await Promise.race([
      Promise.resolve(totalUsage),
      new Promise<undefined>((resolve) => {
        setTimeout(() => resolve(undefined), timeoutMs);
      }),
    ]);
  } catch {
    return undefined;
  }
}

export async function resolveLedgerUserId(
  headers: { get(name: string): string | null },
  deps?: { verify?: VerifyAccessToken },
): Promise<string | null> {
  const token = extractAccessToken(headers);
  if (!token) return null;
  try {
    const user = await (deps?.verify ?? verifySupabaseAccessToken)(token);
    return user?.id ?? null;
  } catch {
    return null;
  }
}

async function defaultInsert(row: UsageLedgerRow): Promise<void> {
  const client = createServiceAuthClient();
  const { error } = await client.from("usage_ledger").insert(row);
  if (error) throw new Error(error.message);
}

/** 有消耗才写库。缺 user / 0/0 / 写库失败都不抛，避免打断对话流。 */
export async function settleChatUsage(input: SettleChatUsageInput): Promise<SettleChatUsageResult> {
  const usage = mapLanguageModelUsage(input.rawUsage);
  const summary = hasBillableUsage(usage) ? toUsageSummary(usage, input.actualModelId) : undefined;
  if (!summary || !input.userId) {
    return { usage, summary, row: null, recorded: false };
  }
  const row = buildUsageLedgerRow({
    usage,
    userId: input.userId,
    selectedModelId: input.selectedModelId,
    actualModelId: input.actualModelId,
    customGroups: input.customGroups,
    pool: input.pool,
    sessionId: input.sessionId,
    requestId: input.requestId,
    route: input.route,
    aborted: input.aborted,
    rawUsage: input.rawUsage,
  });
  if (!row) return { usage, summary, row: null, recorded: false };
  try {
    await (input.insert ?? defaultInsert)(row);
    return { usage, summary, row, recorded: true };
  } catch (error) {
    console.warn("[usage_ledger] insert failed:", error instanceof Error ? error.message : error);
    return { usage, summary, row, recorded: false };
  }
}
