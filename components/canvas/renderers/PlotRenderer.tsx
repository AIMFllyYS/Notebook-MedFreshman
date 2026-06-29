"use client";

import type { PlotCanvasBlock } from '@/lib/canvas/types';
import SvgCanvas from '../SvgCanvas';
import { FunctionPlot } from '../FunctionPlot';
import { CanvasFrame } from '../CanvasFrame';
import { compileMathExpr, autoRangeY } from '../canvasUtils';

interface PlotRendererProps {
  block: PlotCanvasBlock;
  onRevisionSubmit?: (instruction: string) => void | Promise<void>;
}

const PADDING = { top: 20, right: 20, bottom: 36, left: 48 };

export function PlotRenderer({ block, onRevisionSubmit }: PlotRendererProps) {
  const width = block.width ?? 600;
  const height = block.height ?? 400;
  const xMin = block.attrs.xmin ?? -10;
  const xMax = block.attrs.xmax ?? 10;
  const autoY = autoRangeY(compileMathExpr(block.fn), xMin, xMax);
  const yMin = block.attrs.ymin ?? autoY.yMin;
  const yMax = block.attrs.ymax ?? autoY.yMax;
  const plotW = width - PADDING.left - PADDING.right;
  const plotH = height - PADDING.top - PADDING.bottom;

  return (
    <CanvasFrame title={block.title} source={block.fn} onRevisionSubmit={onRevisionSubmit}>
      <SvgCanvas
        width={width}
        height={height}
        xMin={xMin}
        xMax={xMax}
        yMin={yMin}
        yMax={yMax}
        axisLabels={{ x: block.attrs.xlabel ?? 'x', y: block.attrs.ylabel ?? 'y' }}
      >
        <FunctionPlot
          fn={block.fn}
          xMin={xMin}
          xMax={xMax}
          yMin={yMin}
          yMax={yMax}
          plotLeft={PADDING.left}
          plotTop={PADDING.top}
          plotWidth={plotW}
          plotHeight={plotH}
          color={block.attrs.color}
          label={block.attrs.label}
          samples={block.attrs.samples}
        />
      </SvgCanvas>
    </CanvasFrame>
  );
}

export default PlotRenderer;
