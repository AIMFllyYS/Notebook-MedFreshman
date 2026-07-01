import { describe, expect, it } from 'vitest';
import { extractThinkBlocksFromContent, parseChatContent, splitThinkContent } from './parseChatContent';

describe('parseChatContent', () => {
  it('extracts pseudo thinking tags from markdown content', () => {
    const parsed = parseChatContent('before <think>hidden reasoning</think> after');

    expect(parsed.markdown).toBe('before  after');
    expect(parsed.reasoning).toEqual(['hidden reasoning']);
    expect(parsed.blocks.map((block) => block.content ?? block.childrenText).join('')).not.toContain('<think>');
  });

  it('strips incomplete think tails while streaming', () => {
    const parsed = parseChatContent('answer\n<think>partial reasoning', { streaming: true });

    expect(parsed.markdown).toBe('answer\n');
    expect(parsed.reasoning).toEqual([]);
  });

  it('can extract multiple complete pseudo thinking blocks', () => {
    expect(extractThinkBlocksFromContent('<think>a</think>正文<think>b</think>')).toEqual(['a', 'b']);
  });
});

describe('splitThinkContent', () => {
  it('surfaces an unclosed <think> block as live reasoning while streaming', () => {
    const result = splitThinkContent('<think>还在想', { streaming: true });

    expect(result.content).toBe('');
    expect(result.reasoning).toBe('还在想');
  });

  it('keeps visible content before an in-progress think block', () => {
    const result = splitThinkContent('前情提要\n<think>正在推理中', { streaming: true });

    expect(result.content).toBe('前情提要\n');
    expect(result.reasoning).toBe('正在推理中');
  });

  it('merges a completed think block with a still-open next one', () => {
    const result = splitThinkContent('<think>第一段</think>正文<think>第二段还没写完', { streaming: true });

    expect(result.content).toBe('正文');
    expect(result.reasoning).toBe('第一段\n\n第二段还没写完');
  });

  it('drops an unclosed tail once streaming has finished', () => {
    const result = splitThinkContent('<think>完整</think>正文', { streaming: false });

    expect(result.content).toBe('正文');
    expect(result.reasoning).toBe('完整');
  });
});
