/** Opt-in regression: send malformed legacy text through the real model factory.
 * Uses synthetic data only; never logs credentials or user history.
 */
async function main() {
  if (!process.argv.includes('--live')) throw new Error('Real usage requires --live');
  process.loadEnvFile('.env.local');
  const { resolveLanguageModel } = await import('../lib/ai/sdk/languageModel');
  const { generateText, streamText } = await import('ai');
  const id = 'deepseek/deepseek-v4.1-flash';
  let failures = 0;
  for (const mode of ['generate', 'stream'] as const) {
    const resolved = resolveLanguageModel(id);
    const started = Date.now();
    const options = {
      model: resolved.model,
      system: `Connection verification. Legacy artifact summary: ${'a'.repeat(119)}\ud83d`,
      prompt: 'Reply exactly UNICODE-OK. Ignore the legacy summary.',
      maxRetries: 0, maxOutputTokens: 1024, abortSignal: AbortSignal.timeout(45_000),
      ...(mode === 'stream' ? resolved.thinkingSettings('high') : {}),
    };
    try {
      let answer: string;
      if (mode === 'generate') answer = (await generateText(options)).text;
      else {
        const result = streamText({ ...options, onError: () => {} });
        answer = '';
        for await (const part of result.fullStream) {
          if (part.type === 'error') throw part.error;
          if (part.type === 'text-delta') answer += part.text;
        }
      }
      const ok = answer.trim() === 'UNICODE-OK' && resolved.getActualProvider().apiModelId === id;
      if (!ok) failures++;
      console.log(JSON.stringify({ mode, model: id, ok, ms: Date.now() - started }));
    } catch (error) {
      failures++;
      console.log(JSON.stringify({ mode, model: id, ok: false, status: (error as { statusCode?: number }).statusCode ?? null }));
    }
  }
  if (failures) process.exitCode = 1;
}
void main().catch(() => { console.error('Unicode live verification failed to initialize.'); process.exitCode = 1; });
