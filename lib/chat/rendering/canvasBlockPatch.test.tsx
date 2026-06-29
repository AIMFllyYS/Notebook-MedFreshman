import { describe, expect, it } from 'vitest';
import { replaceCanvasBlock } from './canvasBlockPatch';

describe('replaceCanvasBlock', () => {
  it('replaces a raw SVG block and preserves surrounding markdown', () => {
    const content = ['before', '<SvgDiagram mode="raw"><svg><circle /></svg></SvgDiagram>', 'after'].join('\n');

    const updated = replaceCanvasBlock(content, 0, {
      kind: 'raw-svg',
      source: '<svg viewBox="0 0 10 10"><rect width="10" height="10" /></svg>',
    });

    expect(updated).toContain('before');
    expect(updated).toContain('after');
    expect(updated).toContain('<rect width="10" height="10" />');
    expect(updated).not.toContain('<circle />');
  });

  it('replaces a molecule block with raw SVG and updates mode', () => {
    const content = '<SvgDiagram mode="molecule" title="ethanol">CCO</SvgDiagram>';

    const updated = replaceCanvasBlock(content, 0, {
      kind: 'raw-svg',
      title: 'ethanol diagram',
      source: '<svg viewBox="0 0 10 10"><text x="1" y="5">EtOH</text></svg>',
    });

    expect(updated).toContain('mode="raw"');
    expect(updated).toContain('title="ethanol diagram"');
    expect(updated).not.toContain('mode="molecule"');
    expect(updated).not.toContain('CCO');
  });

  it('replaces a self-closing plot block with HTML and updates mode', () => {
    const content = '<SvgDiagram mode="math" fn="phi(x)" xmin="-4" xmax="4" />';

    const updated = replaceCanvasBlock(content, 0, {
      kind: 'html',
      title: 'Interactive normal curve',
      source: '<!doctype html><html><body><input type="range" /></body></html>',
    });

    expect(updated).toContain('mode="html"');
    expect(updated).toContain('<!doctype html>');
    expect(updated).not.toContain('fn="phi(x)"');
  });

  it('only replaces the selected block index', () => {
    const content = [
      '<SvgDiagram mode="raw"><svg><circle /></svg></SvgDiagram>',
      '<SvgDiagram mode="molecule">CCO</SvgDiagram>',
    ].join('\n');

    const updated = replaceCanvasBlock(content, 1, {
      kind: 'molecule',
      source: 'c1ccccc1',
    });

    expect(updated).toContain('<svg><circle /></svg>');
    expect(updated).toContain('c1ccccc1');
    expect(updated).not.toContain('CCO');
  });
});
