import assert from 'node:assert/strict';
import { test } from 'node:test';
import { collectMessageSources, dedupeByKey } from './traceSources.ts';
import type { ChatMessagePart } from '@/lib/types/chat';

test('dedupeByKey drops duplicate keys and keeps empty-key items', () => {
  const items = [
    { id: 'a' },
    { id: 'a' },
    { id: '' },
    { id: '' },
    { id: 'b' },
  ];
  assert.deepEqual(
    dedupeByKey(items, (item) => item.id || null),
    [{ id: 'a' }, { id: '' }, { id: '' }, { id: 'b' }],
  );
});

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
    {
      type: 'tool-webSearch',
      toolCallId: 'w2',
      state: 'output-available',
      input: { query: 'q2' },
      output: { text: 'ok', sources: [
        { title: '课程重复', url: 'https://example.edu/a', snippet: '' },
        { title: '补充', url: 'https://example.edu/b', snippet: '' },
      ] },
    },
  ] as ChatMessagePart[];

  const sources = collectMessageSources(parts);
  assert.equal(sources.length, 3);
  assert.deepEqual(sources[0], { kind: 'note', title: '贝叶斯', path: 'probability/detail/1.4', snippet: '公式' });
  assert.equal(sources.filter((s) => s.kind === 'web').length, 2);
});

test('collectMessageSources dedupes notes by path and ignores source-url parts', () => {
  const parts = [
    {
      type: 'tool-searchNotes',
      toolCallId: 'n1',
      state: 'output-available',
      input: { query: 'a' },
      output: { text: 'ok', hits: [{ title: '贝叶斯', path: 'probability/detail/1.4', snippet: '公式' }] },
    },
    {
      type: 'tool-searchNotes',
      toolCallId: 'n2',
      state: 'output-available',
      input: { query: 'b' },
      output: { text: 'ok', hits: [
        { title: '贝叶斯重复', path: 'probability/detail/1.4', snippet: '另一段' },
        { title: '全概率', path: 'probability/detail/1.3', snippet: '全概率' },
      ] },
    },
    { type: 'source-url', sourceId: 'extra', title: '补充', url: 'https://example.edu/b' },
  ] as ChatMessagePart[];

  const sources = collectMessageSources(parts);
  assert.equal(sources.length, 2);
  assert.deepEqual(sources.map((s) => s.kind === 'note' ? s.path : ''), [
    'probability/detail/1.4',
    'probability/detail/1.3',
  ]);
});
