import { describe, expect, it } from 'vitest';
import { diagnoseCanvasBlock, extractCanvasRevisionBlock } from './revisionOutput';

describe('extractCanvasRevisionBlock', () => {
  it('extracts raw JSON output', () => {
    const result = extractCanvasRevisionBlock('{"kind":"plot","fn":"phi(x)","attrs":{"xmin":-4,"xmax":4}}');

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.block.kind).toBe('plot');
  });

  it('extracts JSON from fenced blocks', () => {
    const result = extractCanvasRevisionBlock('```json\n{"kind":"molecule","source":"CCO"}\n```');

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.block).toEqual({ kind: 'molecule', source: 'CCO' });
  });

  it('maps legacy full SVG output to raw-svg', () => {
    const result = extractCanvasRevisionBlock('<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" /></svg>');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.block.kind).toBe('raw-svg');
      expect(result.block.source).toContain('<svg');
    }
  });

  it('wraps bare SVG children returned directly by the model', () => {
    const result = extractCanvasRevisionBlock('<rect x="4" y="4" width="20" height="10" />');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.block.kind).toBe('raw-svg');
      expect(result.block.source).toContain('<svg');
      expect(result.block.source).toContain('<rect');
      expect(diagnoseCanvasBlock(result.block)[0].ok).toBe(true);
    }
  });

  it('wraps bare SVG children inside JSON raw-svg revisions', () => {
    const result = extractCanvasRevisionBlock(
      '{"kind":"raw-svg","width":500,"height":260,"source":"<path d=\\"M0 0 L10 10\\" />"}',
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.block.kind).toBe('raw-svg');
      expect(result.block.source).toContain('viewBox="0 0 500 260"');
      expect(diagnoseCanvasBlock(result.block)[0].ok).toBe(true);
    }
  });

  it('maps legacy SvgDiagram html output to html block', () => {
    const result = extractCanvasRevisionBlock(
      '<SvgDiagram mode="html" title="demo"><!doctype html><html><body>demo</body></html></SvgDiagram>',
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.block.kind).toBe('html');
      expect(result.block.title).toBe('demo');
      expect(result.block.source).toContain('<!doctype html>');
    }
  });

  it('returns structured error for invalid output', () => {
    const result = extractCanvasRevisionBlock('I updated it for you.');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.rawOutput).toContain('updated');
  });
});
