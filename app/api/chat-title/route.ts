import type { NextRequest } from "next/server";
import { generateText } from "ai";
import {
  DEFAULT_SESSION_TITLE_MODEL,
  buildFallbackSessionTitle,
  sanitizeSessionTitle,
} from "@/lib/chat/sessionTitle";
import { resolveLanguageModel, UPSTREAM_PROVIDER_NAME } from "@/lib/ai/sdk/languageModel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_SILICONFLOW_BASE_URL = "https://api.siliconflow.cn/v1";

function titleProvider() {
  return {
    baseUrl:
      process.env.SILICONFLOW_BASE_URL ||
      process.env.AI_TITLE_BASE_URL ||
      DEFAULT_SILICONFLOW_BASE_URL,
    apiKey:
      process.env.SILICONFLOW_API_KEY ||
      process.env.AI_TITLE_API_KEY ||
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

  try {
    // Title credentials/model deliberately have their own precedence. Resolve
    // this explicit endpoint as custom so unknown title models never become Flash.
    const resolved = resolveLanguageModel("custom", provider);
    const { text } = await generateText({
      model: resolved.model,
      instructions: "你是学习软件的会话标题生成器。只输出一个中文纯文本标题，约20字，不要引号、编号、解释、换行或 Markdown。",
      prompt: `请为这次 AI 对话生成标题：\n${content.slice(0, 1800)}`,
      temperature: 0.2,
      maxOutputTokens: 48,
      providerOptions: { [UPSTREAM_PROVIDER_NAME]: { enable_thinking: false } },
      maxRetries: 0,
      abortSignal: req.signal,
      timeout: resolved.provider.timeoutMs,
    });
    return Response.json({
      title: sanitizeSessionTitle(text, fallback),
      generated: true,
      model: provider.model,
    });
  } catch {
    return Response.json({ title: fallback, generated: false, model: provider.model });
  }
}
