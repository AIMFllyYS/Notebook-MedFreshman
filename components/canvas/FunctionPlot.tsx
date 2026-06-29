"use client";

import { useMemo } from "react";
import { compileMathExpr, sampleFunctionToPath, getCurveColor } from "./canvasUtils";
import { diagnosePlotExpression } from "@/lib/canvas/plot";

export interface FunctionPlotProps {
  /** Math expression in x, e.g. "sin(x)/x" */
  fn: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  /** Pixel bounds of the plot area (set by parent SvgCanvas) */
  plotLeft: number;
  plotTop: number;
  plotWidth: number;
  plotHeight: number;
  /** Visual */
  color?: string;
  colorIndex?: number;
  label?: string;
  strokeWidth?: number;
  samples?: number;
}

export function FunctionPlot({
  fn,
  xMin,
  xMax,
  yMin,
  yMax,
  plotLeft,
  plotTop,
  plotWidth,
  plotHeight,
  color,
  colorIndex = 0,
  label,
  strokeWidth = 2,
  samples = 500,
}: FunctionPlotProps) {
  const diagnostic = useMemo(
    () => diagnosePlotExpression(fn, { xmin: xMin, xmax: xMax, samples }),
    [fn, samples, xMax, xMin],
  );
  const normalizedFn = diagnostic.normalizedFn;
  const compiledFn = useMemo(() => compileMathExpr(normalizedFn), [normalizedFn]);

  const toSvgX = (x: number) => plotLeft + ((x - xMin) / (xMax - xMin)) * plotWidth;
  const toSvgY = (y: number) => plotTop + ((yMax - y) / (yMax - yMin)) * plotHeight;

  const pathData = useMemo(
    () => diagnostic.ok ? sampleFunctionToPath(compiledFn, xMin, xMax, samples, toSvgX, toSvgY, yMin, yMax) : '',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [diagnostic.ok, normalizedFn, xMin, xMax, yMin, yMax, plotLeft, plotTop, plotWidth, plotHeight, samples],
  );

  const resolvedColor = getCurveColor(colorIndex, color);

  if (!diagnostic.ok || !pathData.trim()) {
    return (
      <g data-testid="plot-diagnostic" aria-label={diagnostic.ok ? 'empty plot path' : diagnostic.message}>
        <text x={plotLeft + 8} y={plotTop + 20} fontSize={12} fill="var(--md-sys-color-error)">
          {diagnostic.ok ? 'No drawable curve points.' : diagnostic.message}
        </text>
      </g>
    );
  }

  return (
    <>
      <path
        d={pathData}
        className="svg-canvas-curve"
        stroke={resolvedColor}
        strokeWidth={strokeWidth}
      />
      {label && (
        <title>{label}</title>
      )}
    </>
  );
}
