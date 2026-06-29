"use client";

import type { CanvasBlock } from '@/lib/canvas/types';
import { RawSvgRenderer } from './renderers/RawSvgRenderer';
import { PlotRenderer } from './renderers/PlotRenderer';
import { MultiPlotRenderer } from './renderers/MultiPlotRenderer';
import { MoleculeRenderer } from './renderers/MoleculeRenderer';
import { HtmlRenderer } from './renderers/HtmlRenderer';

interface CanvasBlockRendererProps {
  block: CanvasBlock;
  revisionTopic?: string;
  onRevisionSubmit?: (instruction: string) => void | Promise<void>;
  onRevisionAccepted?: (block: CanvasBlock) => void;
}

export function CanvasBlockRenderer({ block, revisionTopic, onRevisionSubmit, onRevisionAccepted }: CanvasBlockRendererProps) {
  switch (block.kind) {
    case 'raw-svg':
      return <RawSvgRenderer block={block} revisionTopic={revisionTopic} onRevisionSubmit={onRevisionSubmit} onRevisionAccepted={onRevisionAccepted} />;
    case 'plot':
      return <PlotRenderer block={block} revisionTopic={revisionTopic} onRevisionSubmit={onRevisionSubmit} onRevisionAccepted={onRevisionAccepted} />;
    case 'multi-plot':
      return <MultiPlotRenderer block={block} revisionTopic={revisionTopic} onRevisionSubmit={onRevisionSubmit} onRevisionAccepted={onRevisionAccepted} />;
    case 'molecule':
      return <MoleculeRenderer block={block} revisionTopic={revisionTopic} onRevisionSubmit={onRevisionSubmit} onRevisionAccepted={onRevisionAccepted} />;
    case 'html':
      return <HtmlRenderer block={block} revisionTopic={revisionTopic} onRevisionSubmit={onRevisionSubmit} onRevisionAccepted={onRevisionAccepted} />;
  }
}

export default CanvasBlockRenderer;
