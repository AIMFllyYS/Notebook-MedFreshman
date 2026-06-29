import { describe, expect, it } from 'vitest';
import { normalizeSvgDiagramBlock } from './normalize';
import { serializeCanvasBlockToSvgDiagram } from './serialize';

describe('canvas block normalization', () => {
  it('normalizes raw SvgDiagram content to raw-svg block', () => {
    const block = normalizeSvgDiagramBlock(
      { mode: 'raw', title: 'photoelectric effect', width: 600, height: 360 },
      '<svg viewBox="0 0 600 360"><line x1="0" y1="0" x2="10" y2="10" /></svg>',
    );

    expect(block).toMatchObject({
      kind: 'raw-svg',
      title: 'photoelectric effect',
      width: 600,
      height: 360,
    });
    expect(block.kind === 'raw-svg' ? block.source : '').toContain('<svg');
  });

  it('normalizes molecule SvgDiagram content to molecule block', () => {
    const block = normalizeSvgDiagramBlock(
      { mode: 'molecule', title: 'nitrobenzene' },
      'O=[N+]([O-])c1ccccc1',
    );

    expect(block).toEqual({
      kind: 'molecule',
      title: 'nitrobenzene',
      source: 'O=[N+]([O-])c1ccccc1',
    });
  });

  it('normalizes math SvgDiagram attrs to plot block', () => {
    const block = normalizeSvgDiagramBlock(
      { mode: 'math', fn: 'sin(x)', xmin: '-3.14', xmax: '3.14', label: 'sine' },
      '',
    );

    expect(block.kind).toBe('plot');
    if (block.kind === 'plot') {
      expect(block.fn).toBe('sin(x)');
      expect(block.attrs.xmin).toBe(-3.14);
      expect(block.attrs.label).toBe('sine');
    }
  });

  it('serializes a kind-changing revision as a full SvgDiagram mode change', () => {
    const markup = serializeCanvasBlockToSvgDiagram({
      kind: 'html',
      title: 'interactive normal distribution',
      source: '<!doctype html><html><body>demo</body></html>',
      height: 420,
    });

    expect(markup).toContain('<SvgDiagram');
    expect(markup).toContain('mode="html"');
    expect(markup).toContain('interactive normal distribution');
    expect(markup).toContain('<!doctype html>');
  });
});
