import type { NextRequest } from 'next/server';
import { getModelInfoWithCustom, type CustomApiGroup } from '@/lib/ai/models';
import { chatCompletionsUrl, resolveProvider } from '@/lib/ai/provider';
import { buildCanvasRevisionMessages } from '@/lib/canvas/revisionPrompt';
import { diagnoseCanvasBlock, extractCanvasRevisionBlock } from '@/lib/canvas/revisionOutput';
import type { CanvasBlock } from '@/lib/canvas/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasUsableBlock(value: unknown): value is CanvasBlock {
  return isRecord(value) && typeof value.kind === 'string';
}

async function readUpstreamText(res: Response): Promise<string> {
  return res.text().then((text) => text.slice(0, 300)).catch(() => '');
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const modelId = typeof body.modelId === 'string' ? body.modelId : '';
  const customApiGroups: CustomApiGroup[] = Array.isArray(body.customApiGroups) ? body.customApiGroups : [];
  const instruction = typeof body.instruction === 'string' ? body.instruction.trim() : '';
  const topic = typeof body.topic === 'string' ? body.topic : undefined;

  if (!modelId) {
    return Response.json({ error: 'Missing model configuration for canvas revision.' }, { status: 400 });
  }
  if (!hasUsableBlock(body.block)) {
    return Response.json({ error: 'Missing current canvas block.' }, { status: 400 });
  }
  if (!instruction) {
    return Response.json({ error: 'Missing canvas revision instruction.' }, { status: 400 });
  }

  const modelInfo = getModelInfoWithCustom(modelId, customApiGroups);
  if (!modelInfo) {
    return Response.json({ error: `Model ${modelId} is not configured.` }, { status: 400 });
  }
  if (modelInfo.type === 'image') {
    return Response.json({ error: 'The selected model is an image model. Choose a text chat model for canvas revision.' }, { status: 400 });
  }

  const provider = resolveProvider(modelId, customApiGroups);
  if (!provider.configured) {
    return Response.json({ error: 'The selected model API is not configured.' }, { status: 400 });
  }

  const upstream = await fetch(chatCompletionsUrl(provider.baseUrl), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.apiModelId,
      messages: buildCanvasRevisionMessages({
        block: body.block,
        instruction,
        topic,
      }),
      temperature: 0.2,
      max_tokens: 6000,
      stream: false,
    }),
    signal: AbortSignal.timeout(provider.timeoutMs),
  });

  if (!upstream.ok) {
    const text = await readUpstreamText(upstream);
    return Response.json({ error: `Canvas revision request failed: ${upstream.status} ${text}` }, { status: 502 });
  }

  const json = await upstream.json().catch(() => null);
  const output = String(json?.choices?.[0]?.message?.content ?? '').trim();
  const extracted = extractCanvasRevisionBlock(output);
  if (!extracted.ok) {
    return Response.json({ error: extracted.error, rawOutput: extracted.rawOutput }, { status: 422 });
  }

  const diagnostics = diagnoseCanvasBlock(extracted.block);
  const failed = diagnostics.find((diagnostic) => !diagnostic.ok);
  if (failed) {
    return Response.json(
      {
        error: failed.message,
        rawOutput: output,
        diagnostics,
      },
      { status: 422 },
    );
  }

  return Response.json({ block: extracted.block, diagnostics });
}
