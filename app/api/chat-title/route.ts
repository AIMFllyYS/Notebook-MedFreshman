import type { NextRequest } from "next/server";
import {
  DEFAULT_SESSION_TITLE_MODEL,
  buildFallbackSessionTitle,
  sanitizeSessionTitle,
} from "@/lib/chat/sessionTitle";
import { chatCompletionsUrl } from "@/lib/ai/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_SILICONFLOW_BASE_URL = "https://api.siliconflow.cn/v1";

interface TitleChoice {
  message?: {
    content?: string;
  };
}

interface TitleResponse {
  choices?: TitleChoice[];
}

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
    const resp = await fetch(chatCompletionsUrl(provider.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: "system",
            content:
              "你是学习软件的会话标题生成器。只输出一个中文纯文本标题，约20字，不要引号、编号、解释、换行或 Markdown。",
          },
          {
            role: "user",
            content: `请为这次 AI 对话生成标题：\n${content.slice(0, 1800)}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 48,
        enable_thinking: false,
      }),
    });
    if (!resp.ok) {
      return Response.json({ title: fallback, generated: false, model: provider.model });
    }
    const data = (await resp.json()) as TitleResponse;
    const raw = data.choices?.[0]?.message?.content ?? "";
    return Response.json({
      title: sanitizeSessionTitle(raw, fallback),
      generated: true,
      model: provider.model,
    });
  } catch {
    return Response.json({ title: fallback, generated: false, model: provider.model });
  }
}
