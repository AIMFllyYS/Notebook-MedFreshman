import { describe, expect, it } from 'vitest';
import { analyzeSvgHealth } from './svgHealth';

describe('analyzeSvgHealth', () => {
  it('reports empty svg roots as not visible', () => {
    const result = analyzeSvgHealth('<svg viewBox="0 0 100 100"></svg>');

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('no-visible-elements');
  });

  it('accepts svg markup with visible primitives', () => {
    const result = analyzeSvgHealth('<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="20" /></svg>');

    expect(result.ok).toBe(true);
  });

  it('flags visible elements outside the declared viewBox', () => {
    const result = analyzeSvgHealth('<svg viewBox="0 0 10 10"><circle cx="500" cy="500" r="20" /></svg>');

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('out-of-viewbox');
  });
});
