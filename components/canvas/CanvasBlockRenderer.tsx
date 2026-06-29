"use client";

import type { CanvasBlock } from '@/lib/canvas/types';
import { RawSvgRenderer } from './renderers/RawSvgRenderer';
import { PlotRenderer } from './renderers/PlotRenderer';
import { MultiPlotRenderer } from './renderers/MultiPlotRenderer';
import { MoleculeRenderer } from './renderers/MoleculeRenderer';
import { HtmlRenderer } from './renderers/HtmlRenderer';

interface CanvasBlockRendererProps {
  block: CanvasBlock;
  onRevisionSubmit?: (instruction: string) => void | Promise<void>;
}

export function CanvasBlockRenderer({ block, onRevisionSubmit }: CanvasBlockRendererProps) {
  switch (block.kind) {
    case 'raw-svg':
      return <RawSvgRenderer block={block} onRevisionSubmit={onRevisionSubmit} />;
    case 'plot':
      return <PlotRenderer block={block} onRevisionSubmit={onRevisionSubmit} />;
    case 'multi-plot':
      return <MultiPlotRenderer block={block} onRevisionSubmit={onRevisionSubmit} />;
    case 'molecule':
      return <MoleculeRenderer block={block} onRevisionSubmit={onRevisionSubmit} />;
    case 'html':
      return <HtmlRenderer block={block} onRevisionSubmit={onRevisionSubmit} />;
  }
}

export default CanvasBlockRenderer;
