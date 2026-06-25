import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RecordCardAI } from "@/lib/review/types";
import {
  resolveProvider,
  chatCompletionsUrl,
  ENV_MODEL_FLASH,
  type CustomProvider,
} from "@/lib/ai/provider";

// 「记录」后台成卡路由：把用户划词/右键选中的原文，用 DeepSeek-V4-Flash 一次性转成复习卡片 JSON。
// 单发非流式（stream:false）。端点解析复用 resolveProvider —— 与 /api/chat 完全一致：
//   - 桌面端：env 注入 SiliconFlow 端点 + AI_API_KEY → 默认走 deepseek-flash；
//   - 自定义端点（设置面板）：客户端传 customProvider → 用其端点与模型。
// API Key 仅在服务端使用，绝不下发前端。

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_INPUT = 4000;

const SYSTEM_PROMPT =
  `你是学习记忆卡片生成器。把给定原文转成一张用于「主动回忆」复习的卡片。\n` +
  `先判断原文属于哪类，再生成对应卡片：\n` +
  `1) 若是知识点 / 概念 / 结论 / 定义 → cardType="cloze"（填空闪卡）：\n` +
  `   - front：保留原句但把 1~2 个最关键的术语/数值/公式挖空，用「____」占位；\n` +
  `   - back：填空后的完整正确句子；\n` +
  `   - blanks：被挖去的答案片段数组（按出现顺序）。\n` +
  `2) 若是题目 / 例题 / 习题 → cardType="qa"（问答卡）：\n` +
  `   - front：题干（可适度精简但保留全部条件）；\n` +
  `   - back：正确答案 + 关键步骤/解析；\n` +
  `   - blanks 省略。\n` +
  `通用要求：\n` +
  `- 全部用中文；数学/化学公式用 $...$ 行内、$$...$$ 块级（KaTeX/mhchem 语法）；\n` +
  `- 内容必须忠于原文，不杜撰；\n` +
  `- explanation：可选，1~2 句补充说明或记忆提示。\n` +
  `只输出一个 JSON 对象，不要任何额外文字、不要代码围栏。示例：\n` +
  `{"cardType":"cloze","front":"动能定理：合外力做的功等于物体____的变化","back":"动能定理：合外力做的功等于物体动能的变化","blanks":["动能"],"explanation":"W合=ΔEk"}`;

function clampInput(text: string): string {
  if (text.length <= MAX_INPUT) return text;
  return text.slice(0, MAX_INPUT) + "…（原文过长已截断）";
}

function parseCard(raw: string): RecordCardAI | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  let obj: unknown;
  try {
    obj = JSON.parse(match[0]);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  const cardType = o.cardType === "cloze" ? "cloze" : o.cardType === "qa" ? "qa" : null;
  const front = typeof o.front === "string" ? o.front.trim() : "";
  const back = typeof o.back === "string" ? o.back.trim() : "";
  if (!cardType || !front || !back) return null;
  const blanks = Array.isArray(o.blanks)
    ? o.blanks.map((x) => String(x)).filter(Boolean)
    : undefined;
  const explanation = typeof o.explanation === "string" ? o.explanation.trim() : undefined;
  return { cardType, front, back, blanks, explanation };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const text: string = typeof body.text === "string" ? body.text.trim() : "";
  const subjectName: string = String(body.subjectName ?? "");
  const categoryName: string = String(body.categoryName ?? "");
  const itemLabel: string = String(body.itemLabel ?? "");
  const customProvider: CustomProvider | undefined = body.customProvider;
  // 非自定义端点时强制使用快速成卡模型（deepseek-flash）；自定义端点则用其模型。
  const modelId: string | undefined =
    body.modelId === "custom" ? "custom" : ENV_MODEL_FLASH;

  if (!text) {
    return NextResponse.json({ error: "原文为空" }, { status: 400 });
  }

  const provider = resolveProvider(modelId, customProvider);
  if (!provider.configured) {
    return NextResponse.json({ error: "AI 服务未配置（请先填写密钥）" }, { status: 503 });
  }

  const contextLine =
    `当前出处：${[subjectName, categoryName, itemLabel].filter(Boolean).join(" / ") || "(未指定)"}。`;

  try {
    const res = await fetch(chatCompletionsUrl(provider.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        stream: false,
        temperature: 0.3,
        max_tokens: 1200,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `${contextLine}\n请把下面的原文转成一张复习卡片（仅 JSON 对象）：\n"""\n${clampInput(text)}\n"""`,
          },
        ],
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `成卡服务返回 ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";
    const card = parseCard(content);
    if (!card) {
      return NextResponse.json({ error: "成卡结果解析失败" }, { status: 502 });
    }
    return NextResponse.json({ card, model: provider.model });
  } catch {
    return NextResponse.json({ error: "成卡请求异常" }, { status: 502 });
  }
}
