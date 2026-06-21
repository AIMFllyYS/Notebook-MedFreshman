"use client";

import { useMemo } from "react";
import { compileMathExpr, sampleFunctionToPath, getCurveColor } from "./canvasUtils";

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
  const compiledFn = useMemo(() => compileMathExpr(fn), [fn]);

  const toSvgX = (x: number) => plotLeft + ((x - xMin) / (xMax - xMin)) * plotWidth;
  const toSvgY = (y: number) => plotTop + ((yMax - y) / (yMax - yMin)) * plotHeight;

  const pathData = useMemo(
    () => sampleFunctionToPath(compiledFn, xMin, xMax, samples, toSvgX, toSvgY, yMin, yMax),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn, xMin, xMax, yMin, yMax, plotLeft, plotTop, plotWidth, plotHeight, samples],
  );

  const resolvedColor = getCurveColor(colorIndex, color);

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
