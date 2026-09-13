/** Explicit, opt-in paid smoke test. Never imported by unit tests; never prints credentials. */
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

async function main() {
  if (!process.argv.includes('--live')) throw new Error('Real usage requires --live');
  process.loadEnvFile('.env.local');
  const { MODELS, CUSTOM_OPENAI_MODEL_ID, buildCustomModelRegistryId } = await import('../lib/ai/models');
  const { resolveLanguageModel } = await import('../lib/ai/sdk/languageModel');
  const { streamText, ToolLoopAgent, isStepCount, tool } = await import('ai');
  const { z } = await import('zod');
  const requested = process.argv.find((arg) => arg.startsWith('--models='))?.slice(9).split(',');
  const matrix = process.argv.includes('--matrix');
  const withTools = process.argv.includes('--tools');
  const results: unknown[] = [];
  let failures = 0;
  const catalog = MODELS.filter((model) => model.type !== 'image' && model.id !== CUSTOM_OPENAI_MODEL_ID && (!requested || requested.includes(model.id)));
  for (const info of catalog) {
    for (const effort of matrix ? [undefined, 'low', 'medium', 'high'] as const : [undefined]) {
      for (const custom of matrix && info.id.startsWith('deepseek/') ? [false, true] : [false]) {
        const original = resolveLanguageModel(info.id).provider;
        const groups = [{ id: 'probe', name: 'Probe', baseUrl: original.baseUrl, apiKey: original.apiKey,
          models: [{ id: original.apiModelId, thinking: true, tools: true, apiProtocol: 'openai' as const, thinkingLevels: ['low', 'medium', 'high'] as const }] }];
        const model = custom ? resolveLanguageModel(buildCustomModelRegistryId('probe', original.apiModelId), groups.map((g) => ({ ...g, models: g.models.map((m) => ({ ...m, thinkingLevels: [...m.thinkingLevels] })) }))) : resolveLanguageModel(info.id);
        const started = Date.now();
        let toolCalls = 0;
        let failure: unknown;
        const stream = withTools ? await new ToolLoopAgent({ model: model.model,
          instructions: 'Call read_probe_value with {"key":"sample"} exactly once, then quote its returned value. The key is explicitly sample. Do not ask for clarification or guess the value.',
          tools: { read_probe_value: tool({ description: 'Read a runtime verification value.', inputSchema: z.object({ key: z.string() }), execute: async () => { toolCalls++; return { text: 'VERIFIED-42' }; } }) },
          stopWhen: isStepCount(2), prepareStep: ({ stepNumber }) => stepNumber === 0 ? { toolChoice: { type: 'tool', toolName: 'read_probe_value' } } : { activeTools: [], toolChoice: 'none' },
          maxRetries: 0, maxOutputTokens: 1024, ...model.thinkingSettings('medium'),
        }).stream({ prompt: 'Read key sample via read_probe_value. Do not guess.', abortSignal: AbortSignal.timeout(60_000) })
          : streamText({ model: model.model, prompt: 'Reply only OK.', temperature: 0.6, maxOutputTokens: 256,
            maxRetries: 0, ...(effort ? model.thinkingSettings(effort) : {}), abortSignal: AbortSignal.timeout(45_000), onError: () => {} });
        let content = '';
        try {
          for await (const chunk of stream.fullStream) {
            if (chunk.type === 'text-delta') content += chunk.text;
            if (chunk.type === 'error') failure = chunk.error;
          }
          if (failure) throw failure;
          const actualModelId = model.getActualProvider().apiModelId;
          const record = { id: info.id, actualModelId, mode: custom ? 'custom' : 'builtin', effort: withTools ? 'medium/tools' : effort ?? 'default', ok: actualModelId === original.apiModelId && (withTools ? toolCalls === 1 && content.includes('VERIFIED-42') : !!content.trim()), toolCalls, content: content.slice(0, 200), finish: await stream.finishReason, usage: await stream.totalUsage, ms: Date.now() - started };
          results.push(record); console.log(JSON.stringify(record));
          if (!record.ok) failures++;
        } catch (error) {
          const e = error as { statusCode?: number; message?: string; responseBody?: string };
          let detail = e.message ?? 'Unknown error';
          try { detail = JSON.parse(e.responseBody ?? '{}')?.error?.message ?? detail; } catch { /* no raw response */ }
          const record = { id: info.id, mode: custom ? 'custom' : 'builtin', effort: effort ?? 'default', ok: false, status: e.statusCode, detail: detail.split(original.apiKey).join('[hidden]').slice(0, 400) };
          results.push(record); console.log(JSON.stringify(record));
          failures++;
        }
      }
    }
  }
  const output = process.argv.find((arg) => arg.startsWith('--output='))?.slice(9);
  if (output) writeFileSync(output, JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
  if (process.argv.includes('--strict') && failures) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error.message); process.exitCode = 1; });
