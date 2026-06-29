import { describe, expect, it } from 'vitest';
import { extractThinkBlocksFromContent, parseChatContent } from './parseChatContent';

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
