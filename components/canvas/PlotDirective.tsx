"use client";

import { useMemo } from "react";
import SvgCanvas from "./SvgCanvas";
import { FunctionPlot } from "./FunctionPlot";
import { compileMathExpr, autoRangeY } from "./canvasUtils";

interface NodeProps {
  node?: { properties?: Record<string, unknown> };
  children?: React.ReactNode;
}

const PADDING = { top: 20, right: 20, bottom: 36, left: 48 };

/**
 * Standalone `::plot` directive — renders a single function plot
 * wrapped in its own SvgCanvas.
 */
export function PlotDirective({ node }: NodeProps) {
  const props = node?.properties ?? {};
  const fn = String(props.fn ?? "");
  const width = numOrDefault(props.width, 600);
  const height = numOrDefault(props.height, 400);
  const xMin = numOrDefault(props.xmin, -10);
  const xMax = numOrDefault(props.xmax, 10);
  const label = String(props.label ?? "");
  const xlabel = String(props.xlabel ?? "x");
  const ylabel = String(props.ylabel ?? "y");
  const color = String(props.color ?? "");
  const samples = numOrDefault(props.samples, 500);

  const compiled = useMemo(() => compileMathExpr(fn), [fn]);
  const autoY = useMemo(() => autoRangeY(compiled, xMin, xMax), [compiled, xMin, xMax]);

  const yMin = numOrDefault(props.ymin, autoY.yMin);
  const yMax = numOrDefault(props.ymax, autoY.yMax);

  if (!fn) return null;

  const plotW = width - PADDING.left - PADDING.right;
  const plotH = height - PADDING.top - PADDING.bottom;

  return (
    <SvgCanvas
      width={width}
      height={height}
      xMin={xMin}
      xMax={xMax}
      yMin={yMin}
      yMax={yMax}
      axisLabels={{ x: xlabel, y: ylabel }}
    >
      <FunctionPlot
        fn={fn}
        xMin={xMin}
        xMax={xMax}
        yMin={yMin}
        yMax={yMax}
        plotLeft={PADDING.left}
        plotTop={PADDING.top}
        plotWidth={plotW}
        plotHeight={plotH}
        color={color}
        colorIndex={0}
        label={label}
        samples={samples}
      />
      {label && (
        <g className="svg-canvas-legend">
          <rect
            x={PADDING.left + 8}
            y={PADDING.top + 8}
            width={label.length * 7.5 + 28}
            height={22}
            rx={4}
            fill="var(--md-sys-color-surface-container)"
            fillOpacity={0.85}
            stroke="var(--md-sys-color-outline-variant)"
            strokeWidth={0.5}
          />
          <line
            x1={PADDING.left + 14}
            y1={PADDING.top + 19}
            x2={PADDING.left + 28}
            y2={PADDING.top + 19}
            stroke={color ? `var(--md-sys-color-${color})` : "var(--md-sys-color-primary)"}
            strokeWidth={2}
          />
          <text x={PADDING.left + 32} y={PADDING.top + 23} fontSize={11}>
            {label}
          </text>
        </g>
      )}
    </SvgCanvas>
  );
}

function numOrDefault(val: unknown, fallback: number): number {
  if (val === "" || val === undefined || val === null) return fallback;
  const n = Number(val);
  return isFinite(n) ? n : fallback;
}
