import { describe, expect, it } from 'vitest';
import { replaceSvgDiagramBlock } from './svgBlockPatch';

describe('replaceSvgDiagramBlock', () => {
  it('replaces only the requested SvgDiagram block and preserves attributes', () => {
    const content = [
      '<SvgDiagram title="first" mode="raw"><svg><circle /></svg></SvgDiagram>',
      'middle',
      '<SvgDiagram title="second" mode="raw" width="500"><svg><line /></svg></SvgDiagram>',
    ].join('\n');

    const updated = replaceSvgDiagramBlock(content, 1, '<svg><rect /></svg>');

    expect(updated).toContain('<SvgDiagram title="first" mode="raw"><svg><circle /></svg></SvgDiagram>');
    expect(updated).toContain('<SvgDiagram title="second" mode="raw" width="500"><svg><rect /></svg></SvgDiagram>');
    expect(updated).not.toContain('<svg><line /></svg>');
  });

  it('returns the original content when the requested block is missing', () => {
    const content = 'plain answer';

    expect(replaceSvgDiagramBlock(content, 0, '<svg />')).toBe(content);
  });
});
