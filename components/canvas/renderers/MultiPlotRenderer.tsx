"use client";

import type { MultiPlotCanvasBlock } from '@/lib/canvas/types';
import SvgCanvas from '../SvgCanvas';
import { FunctionPlot } from '../FunctionPlot';
import { CanvasFrame } from '../CanvasFrame';
import { autoRangeY, compileMathExpr } from '../canvasUtils';

interface MultiPlotRendererProps {
  block: MultiPlotCanvasBlock;
  onRevisionSubmit?: (instruction: string) => void | Promise<void>;
}

const PADDING = { top: 20, right: 20, bottom: 36, left: 48 };

export function MultiPlotRenderer({ block, onRevisionSubmit }: MultiPlotRendererProps) {
  const width = block.width ?? block.attrs.width ?? 600;
  const height = block.height ?? block.attrs.height ?? 400;
  const xMin = block.attrs.xmin ?? -10;
  const xMax = block.attrs.xmax ?? 10;
  const autoY = block.plots.reduce(
    (acc, plot) => {
      const next = autoRangeY(compileMathExpr(plot.fn), xMin, xMax);
      return { yMin: Math.min(acc.yMin, next.yMin), yMax: Math.max(acc.yMax, next.yMax) };
    },
    { yMin: Infinity, yMax: -Infinity },
  );
  const yMin = block.attrs.ymin ?? (Number.isFinite(autoY.yMin) ? autoY.yMin : -5);
  const yMax = block.attrs.ymax ?? (Number.isFinite(autoY.yMax) ? autoY.yMax : 5);
  const plotW = width - PADDING.left - PADDING.right;
  const plotH = height - PADDING.top - PADDING.bottom;

  return (
    <CanvasFrame title={block.title} source={JSON.stringify(block.plots, null, 2)} onRevisionSubmit={onRevisionSubmit}>
      <SvgCanvas
        width={width}
        height={height}
        xMin={xMin}
        xMax={xMax}
        yMin={yMin}
        yMax={yMax}
        axisLabels={{ x: block.attrs.xlabel ?? 'x', y: block.attrs.ylabel ?? 'y' }}
      >
        {block.plots.map((plot, index) => (
          <FunctionPlot
            key={`${plot.fn}-${index}`}
            fn={plot.fn}
            xMin={xMin}
            xMax={xMax}
            yMin={yMin}
            yMax={yMax}
            plotLeft={PADDING.left}
            plotTop={PADDING.top}
            plotWidth={plotW}
            plotHeight={plotH}
            color={plot.color}
            colorIndex={index}
            label={plot.label}
            samples={plot.samples}
          />
        ))}
      </SvgCanvas>
    </CanvasFrame>
  );
}

export default MultiPlotRenderer;
