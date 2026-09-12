// #79 滚动摘要：较早历史交给便宜模型总结，保留最近 N 轮原文。只移除+替换，不改 system。

import { createHash } from "node:crypto";
import { generateText, type ModelMessage } from "ai";
import { ENV_MODEL_FLASH } from "@/lib/ai/provider";
import { resolveLanguageModel } from "@/lib/ai/sdk/languageModel";
import type { CustomApiGroup } from "@/lib/ai/models";
import type { CustomProvider } from "@/lib/ai/provider";
import { resolveActualBillingModelId, settleUsage } from "@/lib/billing/usageLedger";
import { resolveMainModelPool, usedPlatformCredentialsForProvider } from "@/lib/billing/usagePool";
import { appendAgentLog } from "@/lib/ai/observability/agentLog";

export const COMPACT_KEEP_TURNS = 6;
const COMPACTION_TIMEOUT_MS = 12_000;
const MAX_CACHE_SESSIONS = 32;
const MAX_SUMMARY_CHARS = 800;

export const COMPACTION_SYSTEM =
  "你是学习助教的上下文压缩器。把较早的对话历史压缩成一段简洁摘要，保留关键事实、结论、未决问题和学生掌握情况。不要发挥，不要列工具调用细节。只用中文，不超过 400 字。";

export interface CompactHistoryInput {
  messages: ModelMessage[];
  shouldCompact: boolean;
  sessionId?: string | null;
  keepTurns?: number;
  abortSignal?: AbortSignal;
  modelId?: string;
  isCustom?: boolean;
  custom?: CustomApiGroup[] | CustomProvider | null;
  generateSummary?: (prompt: string, abortSignal?: AbortSignal) => Promise<{ text: string; usage?: unknown }>;
}

export interface CompactHistoryResult {
  messages: ModelMessage[];
  compacted: boolean;
  reused: boolean;
  summary?: string;
  durationMs?: number;
}

interface CacheEntry {
  coveredCount: number;
  fingerprint: string;
  summary: string;
}

const cache = new Map<string, CacheEntry>();

export function resetCompactionCache(): void {
  cache.clear();
}

function fingerprint(messages: ModelMessage[]): string {
  return createHash("sha256").update(JSON.stringify(messages)).digest("hex");
}

function sessionKey(sessionId?: string | null): string {
  return sessionId?.trim() || "anon";
}

function touchCache(key: string, entry: CacheEntry): void {
  cache.delete(key);
  cache.set(key, entry);
  while (cache.size > MAX_CACHE_SESSIONS) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

function isUserMessage(message: ModelMessage): boolean {
  return message.role === "user";
}

/** 一轮 = 一条 user 及其后的 assistant/tool，直到下一条 user。保留最近 keepTurns 轮原文。 */
export function splitKeptTurns(
  messages: ModelMessage[],
  keepTurns = COMPACT_KEEP_TURNS,
): { old: ModelMessage[]; recent: ModelMessage[] } {
  const userIdx: number[] = [];
  for (let i = 0; i < messages.length; i++) {
    if (isUserMessage(messages[i]!)) userIdx.push(i);
  }
  if (userIdx.length <= keepTurns) return { old: [], recent: messages };
  const cut = userIdx[userIdx.length - keepTurns]!;
  return { old: messages.slice(0, cut), recent: messages.slice(cut) };
}

function partText(part: unknown): string {
  if (!part || typeof part !== "object") return "";
  const rec = part as { type?: string; text?: unknown; output?: unknown; toolName?: string };
  if (rec.type === "text" && typeof rec.text === "string") return rec.text;
  if (rec.type === "tool-result") {
    const output = rec.output;
    if (typeof output === "string") return output;
    if (output && typeof output === "object" && "value" in output) return String((output as { value: unknown }).value ?? "");
    return rec.toolName ? `[${rec.toolName}]` : "";
  }
  return "";
}

export function messageToPlain(message: ModelMessage): string {
  if (typeof message.content === "string") return `${message.role}: ${message.content}`;
  const text = message.content.map(partText).filter(Boolean).join(" ");
  return `${message.role}: ${text}`;
}

function extractiveSummary(messages: ModelMessage[]): string {
  return messages.map(messageToPlain).join("\n").slice(0, MAX_SUMMARY_CHARS);
}

function summaryMessages(summary: string): ModelMessage[] {
  return [
    {
      role: "user",
      content: `【对话摘要】此前讨论的压缩记录，回答开头提过的信息时请依据此摘要：\n${summary}`,
    },
    { role: "assistant", content: "已了解此前讨论，会结合摘要与最近对话继续。" },
  ];
}

function shouldWriteLog(): boolean {
  return !(process.env.NODE_TEST_CONTEXT && !process.env.AGENT_LOG_PATH);
}

export async function compactHistory(input: CompactHistoryInput): Promise<CompactHistoryResult> {
  if (!input.shouldCompact) {
    return { messages: input.messages, compacted: false, reused: false };
  }
  const keepTurns = input.keepTurns ?? COMPACT_KEEP_TURNS;
  const { old, recent } = splitKeptTurns(input.messages, keepTurns);
  if (old.length === 0) {
    return { messages: input.messages, compacted: false, reused: false };
  }

  const key = sessionKey(input.sessionId);
  const fp = fingerprint(old);
  const cached = cache.get(key);
  if (cached && cached.coveredCount === old.length && cached.fingerprint === fp) {
    return {
      messages: [...summaryMessages(cached.summary), ...recent],
      compacted: true,
      reused: true,
      summary: cached.summary,
    };
  }

  let prompt: string;
  if (cached && cached.coveredCount < old.length && fingerprint(old.slice(0, cached.coveredCount)) === cached.fingerprint) {
    const rolled = old.slice(cached.coveredCount);
    prompt = `已有摘要：\n${cached.summary}\n\n请把摘要与以下新增对话合并成一份新摘要：\n${rolled.map(messageToPlain).join("\n")}`;
  } else {
    prompt = `请压缩以下较早对话：\n${old.map(messageToPlain).join("\n")}`;
  }

  const startedAt = Date.now();
  let summary = "";
  let usage: unknown;
  const targetModel = input.isCustom ? input.modelId || ENV_MODEL_FLASH : ENV_MODEL_FLASH;

  try {
    if (input.generateSummary) {
      const generated = await input.generateSummary(prompt, input.abortSignal);
      summary = generated.text.trim();
      usage = generated.usage;
    } else {
      const resolved = resolveLanguageModel(targetModel, input.custom);
      const signals: AbortSignal[] = [AbortSignal.timeout(COMPACTION_TIMEOUT_MS)];
      if (input.abortSignal) signals.push(input.abortSignal);
      const result = await generateText({
        model: resolved.model,
        instructions: COMPACTION_SYSTEM,
        prompt,
        temperature: 0.2,
        maxOutputTokens: 500,
        maxRetries: 0,
        abortSignal: AbortSignal.any(signals),
      });
      summary = result.text.trim();
      usage = result.totalUsage ?? result.usage;
      const actual = resolved.getActualProvider();
      const pool = resolveMainModelPool(usedPlatformCredentialsForProvider(actual));
      await settleUsage({
        rawUsage: usage,
        route: "/api/chat",
        kind: "llm",
        selectedModelId: targetModel,
        actualModelId: resolveActualBillingModelId(actual),
        customGroups: Array.isArray(input.custom) ? input.custom : undefined,
        pool: pool ?? undefined,
        skipInsert: pool == null,
        meta: { source: "compaction" },
      });
    }
  } catch (err) {
    console.warn("[compaction] failed:", (err as Error)?.message);
    summary = "";
  }

  if (input.generateSummary && usage != null) {
    await settleUsage({
      rawUsage: usage,
      route: "/api/chat",
      kind: "llm",
      selectedModelId: targetModel,
      actualModelId: targetModel,
      meta: { source: "compaction" },
    });
  }

  const durationMs = Date.now() - startedAt;
  if (!summary) summary = extractiveSummary(old);
  summary = summary.slice(0, MAX_SUMMARY_CHARS);
  touchCache(key, { coveredCount: old.length, fingerprint: fp, summary });
  if (shouldWriteLog()) {
    appendAgentLog("onLanguageModelCallEnd", {
      event: "llm",
      source: "compaction",
      durationMs,
    });
  }
  return {
    messages: [...summaryMessages(summary), ...recent],
    compacted: true,
    reused: false,
    summary,
    durationMs,
  };
}
