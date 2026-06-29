import type { CanvasBlock, CanvasAttrs, PlotAttrs } from './types';

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function addAttr(parts: string[], name: string, value: unknown): void {
  if (value === undefined || value === null || value === '') return;
  parts.push(`${name}="${escapeAttr(String(value))}"`);
}

function addBaseAttrs(parts: string[], block: CanvasBlock): void {
  addAttr(parts, 'title', block.title);
  addAttr(parts, 'width', block.width);
  addAttr(parts, 'height', block.height);
}

function addPlotAttrs(parts: string[], attrs: PlotAttrs | CanvasAttrs): void {
  addAttr(parts, 'xmin', attrs.xmin);
  addAttr(parts, 'xmax', attrs.xmax);
  addAttr(parts, 'ymin', attrs.ymin);
  addAttr(parts, 'ymax', attrs.ymax);
  addAttr(parts, 'xlabel', attrs.xlabel);
  addAttr(parts, 'ylabel', attrs.ylabel);
  addAttr(parts, 'grid', attrs.grid);
  addAttr(parts, 'axes', attrs.axes);
}

export function serializeCanvasBlockToSvgDiagram(block: CanvasBlock): string {
  const attrs: string[] = ['SvgDiagram'];

  if (block.kind === 'raw-svg') {
    addAttr(attrs, 'mode', 'raw');
    addBaseAttrs(attrs, block);
    return `<${attrs.join(' ')}>${block.source}</SvgDiagram>`;
  }

  if (block.kind === 'molecule') {
    addAttr(attrs, 'mode', 'molecule');
    addBaseAttrs(attrs, block);
    return `<${attrs.join(' ')}>${block.source}</SvgDiagram>`;
  }

  if (block.kind === 'html') {
    addAttr(attrs, 'mode', 'html');
    addBaseAttrs(attrs, block);
    return `<${attrs.join(' ')}>${block.source}</SvgDiagram>`;
  }

  if (block.kind === 'plot') {
    addAttr(attrs, 'mode', 'math');
    addBaseAttrs(attrs, block);
    addAttr(attrs, 'fn', block.fn);
    addPlotAttrs(attrs, block.attrs);
    addAttr(attrs, 'label', block.attrs.label);
    addAttr(attrs, 'color', block.attrs.color);
    addAttr(attrs, 'samples', block.attrs.samples);
    return `<${attrs.join(' ')} />`;
  }

  addAttr(attrs, 'mode', 'math');
  addBaseAttrs(attrs, block);
  addPlotAttrs(attrs, block.attrs);
  const body = block.plots
    .map((plot) => {
      const plotAttrs = ['Plot'];
      addAttr(plotAttrs, 'fn', plot.fn);
      addAttr(plotAttrs, 'label', plot.label);
      addAttr(plotAttrs, 'color', plot.color);
      addAttr(plotAttrs, 'samples', plot.samples);
      return `<${plotAttrs.join(' ')} />`;
    })
    .join('\n');
  return `<${attrs.join(' ')}>${body}</SvgDiagram>`;
}
