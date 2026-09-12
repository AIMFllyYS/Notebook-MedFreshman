import type { NextRequest } from "next/server";
import { generateText } from "ai";
import {
  DEFAULT_SESSION_TITLE_MODEL,
  buildFallbackSessionTitle,
  sanitizeSessionTitle,
} from "@/lib/chat/sessionTitle";
import { resolveLanguageModel, UPSTREAM_PROVIDER_NAME } from "@/lib/ai/sdk/languageModel";
import { settleUsage } from "@/lib/billing/usageLedger";
import { assertQuotaAvailable, resolveQuotaUserId } from "@/lib/billing/quotaGate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_RELAY_BASE_URL = "https://relay.protocom.org/v1";

function titleProvider() {
  return {
    baseUrl:
      process.env.AI_TITLE_BASE_URL ||
      process.env.RELAY_BASE_URL ||
      process.env.SILICONFLOW_BASE_URL ||
      DEFAULT_RELAY_BASE_URL,
    apiKey:
      process.env.AI_TITLE_API_KEY ||
      process.env.RELAY_API_KEY ||
      process.env.SILICONFLOW_API_KEY ||
      process.env.AI_API_KEY ||
      "",
    model: process.env.AI_TITLE_MODEL || DEFAULT_SESSION_TITLE_MODEL,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const content = String(body.content ?? "");
  const fallback = buildFallbackSessionTitle(content);
  const provider = titleProvider();

  if (!content.trim() || !provider.apiKey) {
    return Response.json({ title: fallback, generated: false, model: provider.model });
  }

  const userId = await resolveQuotaUserId(req.headers);
  const gate = await assertQuotaAvailable({ userId, pool: "platform" });
  if (!gate.ok) {
    return Response.json({ title: fallback, generated: false, model: provider.model });
  }

  try {
    // Title credentials/model deliberately have their own precedence. Resolve
    // this explicit endpoint as custom so unknown title models never become Flash.
    const resolved = resolveLanguageModel("custom", provider);
    const result = await generateText({
      model: resolved.model,
      instructions: "你是学习软件的会话标题生成器。只输出一个中文纯文本标题，约20字，不要引号、编号、解释、换行或 Markdown。",
      prompt: `请为这次 AI 对话生成标题：\n${content.slice(0, 1800)}`,
      temperature: 0.2,
      maxOutputTokens: 48,
      providerOptions: { [UPSTREAM_PROVIDER_NAME]: { reasoningEffort: "low" } },
      maxRetries: 0,
      abortSignal: req.signal,
      timeout: resolved.provider.timeoutMs,
    });
    await settleUsage({
      headers: req.headers,
      rawUsage: result.totalUsage ?? result.usage,
      route: "/api/chat-title",
      kind: "llm",
      selectedModelId: provider.model,
      actualModelId: provider.model,
      pool: "platform",
      meta: { source: "chat-title" },
    });
    return Response.json({
      title: sanitizeSessionTitle(result.text, fallback),
      generated: true,
      model: provider.model,
    });
  } catch {
    return Response.json({ title: fallback, generated: false, model: provider.model });
  }
}
