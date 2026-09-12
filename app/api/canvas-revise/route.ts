import type { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { APICallError } from '@ai-sdk/provider';
import { getModelInfoWithCustom, type CustomApiGroup } from '@/lib/ai/models';
import { resolveLanguageModel } from '@/lib/ai/sdk/languageModel';
import { buildCanvasRevisionMessages } from '@/lib/canvas/revisionPrompt';
import { diagnoseCanvasBlock, extractCanvasRevisionBlock } from '@/lib/canvas/revisionOutput';
import type { CanvasBlock } from '@/lib/canvas/types';
import { resolveActualBillingModelId, settleUsage } from '@/lib/billing/usageLedger';
import { assertQuotaAvailable, quotaRejectedJson, resolveQuotaUserId } from '@/lib/billing/quotaGate';
import { resolveMainModelPool, usedPlatformCredentialsForProvider } from '@/lib/billing/usagePool';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasUsableBlock(value: unknown): value is CanvasBlock {
  return isRecord(value) && typeof value.kind === 'string';
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

  const { model, provider } = resolveLanguageModel(modelId, customApiGroups);
  if (!provider.configured) {
    return Response.json({ error: 'The selected model API is not configured.' }, { status: 400 });
  }

  const userId = await resolveQuotaUserId(req.headers);
  const pool = resolveMainModelPool(usedPlatformCredentialsForProvider(provider));
  const gate = await assertQuotaAvailable({ userId, pool });
  if (!gate.ok) return quotaRejectedJson(gate);

  let output: string;
  try {
    const result = await generateText({
      model,
      messages: buildCanvasRevisionMessages({
        block: body.block,
        instruction,
        topic,
      }),
      // This shared business prompt returns system+user messages in fixed order.
      allowSystemInMessages: true,
      temperature: 0.2,
      maxOutputTokens: 6000,
      maxRetries: 0,
      abortSignal: req.signal,
      timeout: provider.timeoutMs,
    });
    output = result.text.trim();
    await settleUsage({
      headers: req.headers,
      rawUsage: result.totalUsage ?? result.usage,
      route: '/api/canvas-revise',
      kind: 'llm',
      selectedModelId: modelId,
      actualModelId: resolveActualBillingModelId(provider),
      customGroups: customApiGroups,
      pool: pool ?? undefined,
      skipInsert: pool == null,
      meta: { source: 'canvas-revise' },
    });
  } catch (err) {
    const detail = APICallError.isInstance(err) && err.statusCode
      ? `${err.statusCode} ${(err.responseBody ?? '').slice(0, 300)}`
      : String((err as Error)?.message ?? err);
    return Response.json({ error: `Canvas revision request failed: ${detail}` }, { status: 502 });
  }

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
