import assert from 'node:assert/strict';
import { before, test } from 'node:test';
import type { NextRequest } from 'next/server';
import { DefaultChatTransport, readUIMessageStream, type UIMessageChunk } from 'ai';
import { buildCustomModelRegistryId, type CustomApiGroup } from '@/lib/ai/models';
import { createUserMessage, getMessageText, getReasoningText, getToolParts } from '@/lib/chat/messageParts';
import type { ChatMessage } from '@/lib/types/chat';

// Test-local credentials and intercepted fetch: never use configured or paid endpoints.
let POST: typeof import('@/app/api/chat/route')['POST'];
before(async () => {
  process.env.AI_BASE_URL = 'https://primary.invalid/v1';
  process.env.AI_API_KEY = 'test-only';
  process.env.ZHIPU_BASE_URL = 'https://backup.invalid/v1';
  process.env.ZHIPU_API_KEY = 'test-only';
  ({ POST } = await import('@/app/api/chat/route'));
});

const finalAnswer = '这是最终回答。<FollowUp>如何应用|如何验证</FollowUp>';
const groups: CustomApiGroup[] = [{
  id: 'test', name: 'Test', baseUrl: 'https://custom.invalid/v1', apiKey: 'test-only',
  models: [{ id: 'study-model', thinking: true, tools: true, vision: true, apiProtocol: 'openai' }],
}];

function responseStream(events: unknown[], anthropic = false): Response {
  const data = events.map((event) => `${anthropic ? `event: ${(event as { type: string }).type}\n` : ''}data: ${JSON.stringify(event)}\n\n`).join('');
  return new Response(data + (anthropic ? '' : 'data: [DONE]\n\n'), {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

function openAiStep(tool?: { name: string; arguments: Record<string, unknown> }, text = finalAnswer): Response {
  const delta = tool ? { tool_calls: [{ index: 0, id: 'call-1', type: 'function', function: {
    name: tool.name, arguments: JSON.stringify(tool.arguments),
  } }] } : { content: text };
  return responseStream([
    { choices: [{ index: 0, delta: { reasoning: '先分析，再查阅资料。' }, finish_reason: null }] },
    { choices: [{ index: 0, delta, finish_reason: null }] },
    { choices: [{ index: 0, delta: {}, finish_reason: tool ? 'tool_calls' : 'stop' }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15, prompt_tokens_details: { cached_tokens: 3 } } },
  ]);
}

async function chat(body: Record<string, unknown> = {}, messages = [createUserMessage('u1', '解释这一节')]) {
  const transport = new DefaultChatTransport<ChatMessage>({
    api: 'https://app.invalid/api/chat',
    fetch: async (_input, init) => POST(new Request('https://app.invalid/api/chat', init) as NextRequest),
  });
  const stream = await transport.sendMessages({
    trigger: 'submit-message', chatId: 'test-session', messageId: undefined, abortSignal: undefined, messages,
    body: { modelId: buildCustomModelRegistryId('test', 'study-model'), customApiGroups: groups,
      contextTruncated: true, enableThinking: true, academicYear: 'freshman-2', ...body },
  });
  const chunks: UIMessageChunk[] = [];
  let message: ChatMessage | undefined;
  for await (const snapshot of readUIMessageStream<ChatMessage>({
    stream: stream.pipeThrough(new TransformStream({ transform(chunk, controller) {
      chunks.push(chunk);
      controller.enqueue(chunk);
    } })),
    terminateOnError: false,
  })) message = snapshot;
  return { chunks, message };
}

test('chat SDK: invalid message shape returns HTTP 400 without fetching upstream', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw new Error('unexpected fetch'); });
  const response = await POST(new Request('https://app.invalid/api/chat', {
    method: 'POST', body: JSON.stringify({ messages: [{ role: 'user', parts: 'invalid' }] }),
  }) as NextRequest);
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /请求体不合法/);
  assert.equal(fetch.mock.callCount(), 0);
});

test('chat SDK: real route → transport → parts preserves reasoning, tools, cross-step usage and finish ordering', async (t) => {
  const requests: Array<Record<string, unknown>> = [];
  t.mock.method(globalThis, 'fetch', async (_url: unknown, init: RequestInit) => {
    requests.push(JSON.parse(String(init.body)));
    return requests.length === 1 ? openAiStep({ name: 'getSection', arguments: { path: 'probability/detail/1.4' } }) : openAiStep();
  });
  const { chunks, message } = await chat({ clientContextTokens: 100_000 });
  assert.ok(message);
  assert.equal(requests.length, 2);
  assert.match(getReasoningText(message), /先分析/);
  assert.equal(getMessageText(message), finalAnswer);
  assert.equal(getToolParts(message)[0].state, 'output-available');
  assert.equal(getToolParts(message)[0].type, 'tool-getSection');
  assert.deepEqual(message.metadata?.usage, { promptTokens: 20, completionTokens: 10, cachedTokens: 6, totalTokens: 30 });
  const breakdown = message.parts.find((p) => p.type === 'data-context-breakdown');
  assert.equal(breakdown?.data.total, 100_000);
  assert.equal(breakdown?.data.truncated, true);
  const types = chunks.map((c) => c.type);
  assert.ok(types.indexOf('data-usage') < types.indexOf('finish'));
  assert.ok(types.indexOf('data-context-breakdown') < types.indexOf('finish'));
  assert.equal(types.filter((type) => type === 'finish').length, 1);
  const firstMessages = requests[0].messages as Array<{ role: string; content: string }>;
  assert.equal(firstMessages.filter((m) => m.role === 'system').length, 1);
  assert.match(firstMessages[0].content, /80% 软上限/);
  assert.doesNotMatch(firstMessages[0].content, /【参考材料】/);
  const modelToolResult = (requests[1].messages as Array<{ role: string; content: string }>).find((m) => m.role === 'tool');
  assert.ok(modelToolResult?.content);
  assert.doesNotMatch(modelToolResult.content, /"contextKey"|"sources"/);
});

test('chat SDK: native Anthropic thinking and image inputs use Messages protocol', async (t) => {
  let upstream: Record<string, unknown> = {};
  t.mock.method(globalThis, 'fetch', async (url: unknown, init: RequestInit) => {
    assert.equal(String(url), 'https://custom.invalid/v1/messages');
    assert.equal(new Headers(init.headers).get('x-api-key'), 'test-only');
    upstream = JSON.parse(String(init.body));
    return responseStream([
      { type: 'message_start', message: { id: 'msg-1', type: 'message', role: 'assistant', model: 'study-model', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 8, cache_read_input_tokens: 2, output_tokens: 0 } } },
      { type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: '先识别图片。' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'signature_delta', signature: 'test-signature' } },
      { type: 'content_block_stop', index: 0 },
      { type: 'content_block_start', index: 1, content_block: { type: 'text', text: '' } },
      { type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: finalAnswer } },
      { type: 'content_block_stop', index: 1 },
      { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 5 } },
      { type: 'message_stop' },
    ], true);
  });
  const user = createUserMessage('image-user', '看图解释');
  user.parts.push({ type: 'file', mediaType: 'image/png', url: 'data:image/png;base64,aGVsbG8=' });
  const { message } = await chat({ customApiGroups: [{ ...groups[0], models: [{ ...groups[0].models[0], apiProtocol: 'anthropic' }] }] }, [user]);
  assert.ok(message);
  assert.equal(getReasoningText(message), '先识别图片。');
  assert.equal(getMessageText(message), finalAnswer);
  assert.deepEqual(upstream.thinking, { type: 'enabled', budget_tokens: 8000 });
  const input = upstream.messages as Array<{ content: Array<{ type: string }> }>;
  assert.ok(input[0].content.some((p) => p.type === 'image'));
  assert.equal(message.metadata?.usage?.cachedTokens, 2);
});

test('chat SDK: native Anthropic tool loop round-trips thinking signatures and text-only tool output', async (t) => {
  const requests: Array<Record<string, unknown>> = [];
  t.mock.method(globalThis, 'fetch', async (url: unknown, init: RequestInit) => {
    assert.equal(String(url), 'https://custom.invalid/v1/messages');
    assert.equal(new Headers(init.headers).get('x-api-key'), 'test-only');
    requests.push(JSON.parse(String(init.body)));
    const firstStep = requests.length === 1;
    assert.ok(requests.length <= 2, '工具结果之后只能再生成一次最终回答');
    return responseStream([
      { type: 'message_start', message: { id: `msg-${requests.length}`, type: 'message', role: 'assistant', model: 'study-model', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: firstStep ? 8 : 6, cache_read_input_tokens: firstStep ? 2 : 4, output_tokens: 0 } } },
      { type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: firstStep ? '先读取这一节。' : '根据资料解释。' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'signature_delta', signature: `test-signature-${requests.length}` } },
      { type: 'content_block_stop', index: 0 },
      ...(firstStep ? [
        { type: 'content_block_start', index: 1, content_block: { type: 'tool_use', id: 'native-call-1', name: 'getSection', input: {} } },
        { type: 'content_block_delta', index: 1, delta: { type: 'input_json_delta', partial_json: '{"path":"probability/' } },
        { type: 'content_block_delta', index: 1, delta: { type: 'input_json_delta', partial_json: 'detail/1.4"}' } },
      ] : [
        { type: 'content_block_start', index: 1, content_block: { type: 'text', text: '' } },
        { type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: finalAnswer } },
      ]),
      { type: 'content_block_stop', index: 1 },
      { type: 'message_delta', delta: { stop_reason: firstStep ? 'tool_use' : 'end_turn', stop_sequence: null }, usage: { output_tokens: 5 } },
      { type: 'message_stop' },
    ], true);
  });

  const { chunks, message } = await chat({
    customApiGroups: [{ ...groups[0], models: [{ ...groups[0].models[0], apiProtocol: 'anthropic' }] }],
  });
  assert.equal(requests.length, 2);
  assert.ok(message);
  assert.equal(getMessageText(message), finalAnswer);
  assert.match(getReasoningText(message), /先读取这一节/);
  assert.match(getReasoningText(message), /根据资料解释/);
  const tool = getToolParts(message)[0];
  assert.ok(tool.type === 'tool-getSection' && tool.state === 'output-available');
  assert.equal(tool.toolCallId, 'native-call-1');
  assert.deepEqual(tool.input, { path: 'probability/detail/1.4' });
  assert.ok(tool.output.text.length > 0);
  assert.deepEqual(message.metadata?.usage, { promptTokens: 20, completionTokens: 10, cachedTokens: 6, totalTokens: 30 });

  type ContentBlock = { type: string; id?: string; name?: string; input?: unknown; signature?: string; tool_use_id?: string; content?: string | Array<{ type: string; text?: string }> };
  const history = requests[1].messages as Array<{ role: string; content: ContentBlock[] }>;
  const assistant = history.find((entry) => entry.role === 'assistant');
  assert.equal(assistant?.content.find((part) => part.type === 'thinking')?.signature, 'test-signature-1');
  const toolUse = assistant?.content.find((part) => part.type === 'tool_use');
  assert.equal(toolUse?.id, 'native-call-1');
  assert.equal(toolUse?.name, 'getSection');
  assert.deepEqual(toolUse?.input, { path: 'probability/detail/1.4' });
  const toolResult = history.flatMap((entry) => entry.content).find((part) => part.type === 'tool_result');
  assert.equal(toolResult?.tool_use_id, 'native-call-1');
  const resultText = typeof toolResult?.content === 'string'
    ? toolResult.content : toolResult?.content?.map((part) => part.text ?? '').join('');
  assert.equal(resultText, tool.output.text);
  assert.doesNotMatch(resultText ?? '', /"contextKey"|"sources"/);
  const types = chunks.map((chunk) => chunk.type);
  assert.ok(types.indexOf('tool-input-available') < types.indexOf('tool-output-available'));
  assert.ok(types.indexOf('tool-output-available') < types.indexOf('text-delta'));
  assert.equal(types.filter((type) => type === 'finish').length, 1);
  assert.equal(types.includes('error'), false);
});

test('chat SDK: successful fallback follow-ups reuse the custom model and arrive before finish', async (t) => {
  const requests: Array<Record<string, unknown>> = [];
  const answerWithoutFollowUps = '条件概率是在给定事件发生的条件下计算概率。';
  t.mock.method(globalThis, 'fetch', async (url: unknown, init: RequestInit) => {
    assert.equal(String(url), 'https://custom.invalid/v1/chat/completions');
    assert.equal(new Headers(init.headers).get('Authorization'), 'Bearer test-only');
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    requests.push(body);
    assert.equal(body.model, 'study-model');
    if (requests.length === 1) {
      assert.equal(body.stream, true);
      return openAiStep(undefined, answerWithoutFollowUps);
    }
    assert.equal(requests.length, 2, '追问兜底只调用一次');
    assert.notEqual(body.stream, true);
    return Response.json({
      choices: [{ message: { role: 'assistant', content: '1. 如何应用\n2. 如何验证\n3. 能否推广\n4. 忽略第四个问题' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 4, completion_tokens: 3, total_tokens: 7 },
    });
  });
  const { chunks, message } = await chat({}, [createUserMessage('fallback-user', '什么是条件概率？')]);
  assert.equal(requests.length, 2);
  assert.ok(message);
  assert.equal(getMessageText(message), answerWithoutFollowUps);
  const followUp = message.parts.find((part) => part.type === 'data-followup');
  assert.deepEqual(followUp?.data, { questions: ['如何应用', '如何验证', '能否推广'] });
  const fallbackMessages = requests[1].messages as Array<{ role: string; content: string }>;
  assert.deepEqual(fallbackMessages.map((entry) => entry.role), ['system', 'user']);
  assert.match(fallbackMessages[0].content, /^你是学习助教/);
  assert.equal(fallbackMessages[1].content, `学生提问：什么是条件概率？\n\n助教回答（摘要）：${answerWithoutFollowUps}\n\n请生成3个追问：`);
  assert.equal(requests[1].max_tokens, 200);
  const types = chunks.map((chunk) => chunk.type);
  const followUpIndex = types.indexOf('data-followup');
  assert.ok(followUpIndex > types.lastIndexOf('text-end'));
  assert.ok(followUpIndex < types.indexOf('finish'));
  assert.equal(types.filter((type) => type === 'data-followup').length, 1);
  assert.equal(types.filter((type) => type === 'finish').length, 1);
  assert.equal(types.includes('error'), false);
});

test('chat SDK: 503 switches registry endpoint and sends transient info before successful answer', async (t) => {
  const urls: string[] = [];
  t.mock.method(globalThis, 'fetch', async (url: unknown) => {
    urls.push(String(url));
    return urls.length === 1 ? new Response('{"error":{"message":"unavailable"}}', { status: 503 }) : openAiStep();
  });
  const { chunks, message } = await chat({ modelId: 'zai-org/GLM-5.2', customApiGroups: [] });
  assert.deepEqual(urls, ['https://primary.invalid/v1/chat/completions', 'https://backup.invalid/v1/chat/completions']);
  const info = chunks.find((c) => c.type === 'data-info');
  assert.ok(info && 'transient' in info && info.transient);
  assert.ok(message);
  assert.equal(message.parts.some((p) => p.type === 'data-info'), false);
  assert.equal(getMessageText(message), finalAnswer);
});

test('chat SDK: authentication errors remain errors, never fail over or become success usage', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('{"error":{"message":"test unauthorized"}}', { status: 401 }));
  const { chunks } = await chat({ modelId: 'zai-org/GLM-5.2', customApiGroups: [] });
  assert.equal(fetch.mock.callCount(), 1);
  assert.ok(chunks.some((c) => c.type === 'error'));
  assert.equal(chunks.some((c) => c.type === 'data-info' || c.type === 'data-usage'), false);
  assert.equal(chunks.some((c) => c.type === 'finish'), false);
  assert.ok(chunks.some((c) => c.type === 'error' && /HTTP 401/.test(c.errorText)));
});

test('chat SDK: partial text then upstream error retains detail but never requests followups or emits success', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => responseStream([
    { choices: [{ index: 0, delta: { content: '保留部分回答' }, finish_reason: null }] },
    { error: { message: 'upstream interrupted', type: 'server_error' } },
  ]));
  const { chunks, message } = await chat();
  assert.equal(fetch.mock.callCount(), 1);
  assert.ok(message);
  assert.equal(getMessageText(message), '保留部分回答');
  assert.ok(chunks.some((chunk) => chunk.type === 'error' && /upstream interrupted/.test(chunk.errorText)));
  assert.equal(chunks.some((chunk) => ['finish', 'data-followup', 'data-usage', 'message-metadata'].includes(chunk.type)), false);
});

test('chat SDK: network permission failure is actionable and does not retry the whole chain', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('fetch failed', { cause: Object.assign(new Error('connect EACCES 198.18.0.220:443'), { code: 'EACCES' }) });
  });
  const { chunks } = await chat();
  assert.equal(fetch.mock.callCount(), 1);
  assert.ok(chunks.some((chunk) => chunk.type === 'error' && /EACCES.*网络访问/.test(chunk.errorText)));
  assert.equal(chunks.some((chunk) => chunk.type === 'finish'), false);
});

test('chat SDK: missing academicYear accepts the default instead of failing HTTP validation', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => openAiStep());
  const { message } = await chat({ academicYear: undefined });
  assert.ok(message);
  assert.equal(getMessageText(message), finalAnswer);
});

test('chat SDK: legacy customProvider is retained for the follow-up model', async (t) => {
  const requests: Array<{ stream?: boolean; model?: string }> = [];
  t.mock.method(globalThis, 'fetch', async (url: unknown, init: RequestInit) => {
    assert.equal(String(url), 'https://legacy.invalid/v1/chat/completions');
    const request = JSON.parse(String(init.body));
    requests.push(request);
    return request.stream ? openAiStep(undefined, '短回答') : new Response(JSON.stringify({
      choices: [{ index: 0, message: { role: 'assistant', content: '继续吗|怎么应用|如何检验' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 4, completion_tokens: 2, total_tokens: 6 },
    }), { headers: { 'Content-Type': 'application/json' } });
  });
  const { chunks } = await chat({ modelId: 'custom', customApiGroups: [],
    customProvider: { baseUrl: 'https://legacy.invalid/v1', apiKey: 'test-only', model: 'legacy-model' } });
  assert.equal(requests.length, 2);
  assert.ok(requests.every((request) => request.model === 'legacy-model'));
  assert.ok(chunks.some((chunk) => chunk.type === 'data-followup'));
});

test('chat SDK: image mode exposes only generateImage once and preserves selected image model on card', async (t) => {
  const requests: Array<Record<string, unknown>> = [];
  t.mock.method(globalThis, 'fetch', async (_url: unknown, init: RequestInit) => {
    requests.push(JSON.parse(String(init.body)));
    return requests.length === 1 ? openAiStep({ name: 'generateImage', arguments: { prompt: 'a cell', title: '细胞' } }) : openAiStep();
  });
  const imageId = buildCustomModelRegistryId('test', 'image-model');
  const { message } = await chat({ modelId: imageId, imageModeTextModel: buildCustomModelRegistryId('test', 'study-model'),
    customApiGroups: [{ ...groups[0], models: [...groups[0].models, { id: 'image-model', type: 'image' }] }] });
  assert.equal(requests.length, 2);
  assert.deepEqual((requests[0].tools as Array<{ function: { name: string } }>).map((t) => t.function.name), ['generateImage']);
  assert.deepEqual(requests[0].tool_choice, { type: 'function', function: { name: 'generateImage' } });
  assert.equal((requests[1].tools as unknown[] | undefined)?.length ?? 0, 0);
  assert.ok(message);
  const part = getToolParts(message)[0];
  assert.ok(part.type === 'tool-generateImage' && part.state === 'output-available');
  assert.equal(part.output.modelId, imageId);
});
