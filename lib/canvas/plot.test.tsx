import { describe, expect, it } from 'vitest';
import { diagnosePlotExpression, normalizePlotExpression } from './plot';

describe('plot diagnostics', () => {
  it('normalizes gaussian aliases into supported expressions', () => {
    expect(normalizePlotExpression('normal_pdf(x,0,1)')).toContain('exp');
    expect(normalizePlotExpression('gaussian(x,0,2)')).toContain('exp');
    expect(normalizePlotExpression('phi(x)')).toContain('exp');
  });

  it('normalizes sigma and mu symbols', () => {
    const expr = normalizePlotExpression(
      '1/(σ*sqrt(2*pi))*exp(-((x-μ)^2)/(2*σ^2))',
      { mu: 0, sigma: 1 },
    );

    expect(expr).toContain('sqrt');
    expect(expr).not.toContain('σ');
    expect(expr).not.toContain('μ');
  });

  it('reports invalid expression instead of returning an empty curve silently', () => {
    const result = diagnosePlotExpression('\\frac{1}{x}', { xmin: -1, xmax: 1 });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('unsupported-syntax');
  });
});
