import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = process.env.AI_BASE_URL || "";
const KEY = process.env.AI_API_KEY || "";
const MODEL_FLASH = process.env.AI_MODEL_FLASH || "v4-flash";

interface ClientMessage {
  role: "user" | "assistant";
  content: string;
}

// 举一反三：由更快的 Flash 档模型生成 3 个可点击的追问
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const messages: ClientMessage[] = Array.isArray(body.messages) ? body.messages : [];

  if (!BASE || !KEY || BASE.includes("your-endpoint") || messages.length === 0) {
    return NextResponse.json({ questions: [] });
  }

  // 仅取最近若干轮，控制开销
  const recent = messages.slice(-4);
  try {
    const res = await fetch(`${BASE.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_FLASH,
        stream: false,
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content:
              "你是学习追问助手。基于给定对话，提出 3 个简短、具体、能引发举一反三式深入思考的后续问题（站在学生视角）。只输出一个 JSON 字符串数组，例如 [\"问题一\",\"问题二\",\"问题三\"]，每条不超过 28 字，不要任何额外文字。",
          },
          ...recent,
          { role: "user", content: "请据此给出 3 个举一反三的追问（仅 JSON 数组）。" },
        ],
      }),
    });
    if (!res.ok) return NextResponse.json({ questions: [] });
    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\[[\s\S]*\]/);
    let questions: string[] = [];
    if (match) {
      try {
        const arr = JSON.parse(match[0]);
        if (Array.isArray(arr)) questions = arr.map((x) => String(x)).slice(0, 3);
      } catch {
        /* ignore */
      }
    }
    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ questions: [] });
  }
}
