import { describe, expect, it } from 'vitest';
import { buildSvgRepairMessages, extractSvgRepairMarkup } from './svgRepairPrompt';

describe('svg repair prompt', () => {
  it('requires SVG-only output without markdown or thinking tags', () => {
    const messages = buildSvgRepairMessages({
      svg: '<svg></svg>',
      title: 'demo',
      instruction: 'make it visible',
      topic: 'physics',
    });

    const system = String(messages[0].content);
    expect(system).toContain('Return only one complete <svg');
    expect(system).toContain('Do not output markdown');
    expect(system).toContain('Do not output <think>');
  });

  it('extracts a complete svg root from model output', () => {
    expect(extractSvgRepairMarkup('```svg\n<svg><circle /></svg>\n```')).toBe('<svg><circle /></svg>');
  });
});
