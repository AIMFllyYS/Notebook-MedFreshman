/** Paid, explicit smoke test of the actual route + SSE reader. No user/account impersonation. */
import { pathToFileURL } from 'node:url';

async function main() {
  if (!process.argv.includes('--live')) throw new Error('Real usage requires --live');
  process.loadEnvFile('.env.local');
  const { POST } = await import('../app/api/chat/route');
  const { resolveProvider } = await import('../lib/ai/provider');
  const { buildCustomModelRegistryId } = await import('../lib/ai/models');
  const { DefaultChatTransport, readUIMessageStream } = await import('ai');
  const provider = resolveProvider('deepseek/deepseek-v4.1-flash');
  const prompt = '请仅回答“连接成功”，并附上 <FollowUp>继续|结束</FollowUp>。不要使用工具。';
  for (const custom of [false, true]) {
    const group = { id: 'live-probe', name: 'Probe', baseUrl: provider.baseUrl, apiKey: provider.apiKey,
      models: [{ id: provider.apiModelId, thinking: true, tools: true, vision: true, apiProtocol: 'openai' as const, contextK: 1000 }] };
    const transport = new DefaultChatTransport({
      api: 'https://local.invalid/api/chat',
      fetch: async (_url, init) => POST(new Request('https://local.invalid/api/chat', init) as Parameters<typeof POST>[0]),
    });
    const body = { modelId: custom ? buildCustomModelRegistryId(group.id, provider.apiModelId) : provider.registryId,
      customApiGroups: custom ? [group] : [], enableThinking: true, thinkingEffort: 'medium',
      enableSearch: false, subjectId: 'probability', categoryId: 'detail', itemId: '1.1', academicYear: 'freshman-2',
    };
    try {
      const stream = await transport.sendMessages({ chatId: 'live-connectivity', trigger: 'submit-message', messageId: 'u1',
        messages: [{ id: 'u1', role: 'user', parts: [{ type: 'text', text: prompt }] }], abortSignal: AbortSignal.timeout(60_000), body });
      let last;
      for await (const message of readUIMessageStream({ stream, terminateOnError: true })) last = message;
      const text = last?.parts.flatMap((part) => part.type === 'text' ? [part.text] : []).join('');
      const ok = !!text?.includes('连接成功');
      if (!ok) process.exitCode = 1;
      console.log(JSON.stringify({ mode: custom ? 'custom' : 'builtin', ok, text, metadata: last?.metadata }));
    } catch (error) {
      process.exitCode = 1;
      console.log(JSON.stringify({ mode: custom ? 'custom' : 'builtin', ok: false, error: String((error as Error).message).split(provider.apiKey).join('[hidden]') }));
    }
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((e) => { console.error(e.message); process.exitCode = 1; });
