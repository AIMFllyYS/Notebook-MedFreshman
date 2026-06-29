import type { NextRequest } from 'next/server';
import { buildSvgRepairMessages, extractSvgRepairMarkup } from '@/lib/ai/svgRepairPrompt';
import { chatCompletionsUrl, resolveProvider } from '@/lib/ai/provider';
import { getModelInfoWithCustom, type CustomApiGroup } from '@/lib/ai/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const modelId = typeof body.modelId === 'string' ? body.modelId : '';
  const customApiGroups: CustomApiGroup[] = Array.isArray(body.customApiGroups) ? body.customApiGroups : [];
  const svg = typeof body.svg === 'string' ? body.svg : '';
  const title = typeof body.title === 'string' ? body.title : undefined;
  const instruction = typeof body.instruction === 'string' ? body.instruction : undefined;
  const topic = typeof body.topic === 'string' ? body.topic : undefined;

  if (!modelId) {
    return Response.json({ error: '缺少模型配置，无法修复 SVG。' }, { status: 400 });
  }
  if (!svg.trim()) {
    return Response.json({ error: '缺少 SVG 内容，无法修复。' }, { status: 400 });
  }

  const modelInfo = getModelInfoWithCustom(modelId, customApiGroups);
  if (!modelInfo) {
    return Response.json({ error: `当前模型 ${modelId} 不存在或未配置。` }, { status: 400 });
  }
  if (modelInfo.type === 'image') {
    return Response.json({ error: '当前选择的是生图模型，不能用于 SVG 画布修复。请切换到文本对话模型。' }, { status: 400 });
  }

  const provider = resolveProvider(modelId, customApiGroups);
  if (!provider.configured) {
    return Response.json({ error: '当前模型 API 尚未配置，无法修复 SVG。' }, { status: 400 });
  }

  const res = await fetch(chatCompletionsUrl(provider.baseUrl), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.apiModelId,
      messages: buildSvgRepairMessages({ svg, title, instruction, topic }),
      temperature: 0.2,
      max_tokens: 2200,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return Response.json({ error: `SVG 修复请求失败：${res.status} ${text.slice(0, 200)}` }, { status: 502 });
  }

  const json = await res.json().catch(() => null);
  const output = String(json?.choices?.[0]?.message?.content ?? '').trim();
  const repaired = extractSvgRepairMarkup(output);
  if (!/^<svg\b[\s\S]*<\/svg>$/i.test(repaired)) {
    return Response.json({ error: '模型没有返回完整 SVG，请换一个修复要求重试。' }, { status: 422 });
  }

  return Response.json({ svg: repaired });
}
