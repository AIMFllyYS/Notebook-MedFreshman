import assert from 'node:assert/strict';
import { test } from 'node:test';
import { collectMessageSources } from './traceSources.ts';
import type { ChatMessagePart } from '@/lib/types/chat';

test('collectMessageSources gathers notes and dedupes web urls', () => {
  const parts = [
    {
      type: 'tool-searchNotes',
      toolCallId: 'n',
      state: 'output-available',
      input: { query: '贝叶斯' },
      output: { text: 'ok', hits: [{ title: '贝叶斯', path: 'probability/detail/1.4', snippet: '公式' }] },
    },
    {
      type: 'tool-webSearch',
      toolCallId: 'w',
      state: 'output-available',
      input: { query: 'q' },
      output: { text: 'ok', sources: [{ title: '课程', url: 'https://example.edu/a', snippet: '摘要' }] },
    },
    { type: 'source-url', sourceId: 'dup', title: '课程重复', url: 'https://example.edu/a' },
    { type: 'source-url', sourceId: 'extra', title: '补充', url: 'https://example.edu/b' },
  ] as ChatMessagePart[];

  const sources = collectMessageSources(parts);
  assert.equal(sources.length, 3);
  assert.deepEqual(sources[0], { kind: 'note', title: '贝叶斯', path: 'probability/detail/1.4', snippet: '公式' });
  assert.equal(sources.filter((s) => s.kind === 'web').length, 2);
});
