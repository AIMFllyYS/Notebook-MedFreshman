"use client";

import { Children, isValidElement, useMemo } from "react";
import SvgCanvas from "./SvgCanvas";
import { FunctionPlot } from "./FunctionPlot";
import { compileMathExpr, autoRangeY, getCurveColor } from "./canvasUtils";

interface NodeProps {
  node?: { properties?: Record<string, unknown> };
  children?: React.ReactNode;
}

const PADDING = { top: 20, right: 20, bottom: 36, left: 48 };

/**
 * Container `:::canvas` directive — wraps multiple `::plot` children
 * in a shared SvgCanvas with unified axes.
 */
export function CanvasDirective({ node, children }: NodeProps) {
  const props = node?.properties ?? {};
  const width = numOrDefault(props.width, 600);
  const height = numOrDefault(props.height, 400);
  const xMin = numOrDefault(props.xmin, -10);
  const xMax = numOrDefault(props.xmax, 10);
  const xlabel = String(props.xlabel ?? "x");
  const ylabel = String(props.ylabel ?? "y");
  const grid = String(props.grid ?? "") !== "false";
  const axes = String(props.axes ?? "") !== "false";

  // Collect ::plot children (rendered as <functionplot> elements)
  const plots: { fn: string; color: string; label: string; samples: number }[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const type = child.type;
    const childProps = child.props as Record<string, unknown>;
    const nodeProps = (childProps.node as { properties?: Record<string, unknown> })?.properties;
    if (nodeProps?.fn) {
      plots.push({
        fn: String(nodeProps.fn),
        color: String(nodeProps.color ?? ""),
        label: String(nodeProps.label ?? ""),
        samples: numOrDefault(nodeProps.samples, 500),
      });
    }
  });

  // Auto-range Y from all functions if not explicitly set
  const autoY = useMemo(() => {
    let globalMin = Infinity;
    let globalMax = -Infinity;
    for (const p of plots) {
      const compiled = compileMathExpr(p.fn);
      const { yMin, yMax } = autoRangeY(compiled, xMin, xMax);
      if (yMin < globalMin) globalMin = yMin;
      if (yMax > globalMax) globalMax = yMax;
    }
    if (!isFinite(globalMin)) globalMin = -5;
    if (!isFinite(globalMax)) globalMax = 5;
    return { yMin: globalMin, yMax: globalMax };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plots.map((p) => p.fn).join("|"), xMin, xMax]);

  const yMin = numOrDefault(props.ymin, autoY.yMin);
  const yMax = numOrDefault(props.ymax, autoY.yMax);

  const plotW = width - PADDING.left - PADDING.right;
  const plotH = height - PADDING.top - PADDING.bottom;

  const hasLabels = plots.some((p) => p.label);

  return (
    <SvgCanvas
      width={width}
      height={height}
      xMin={xMin}
      xMax={xMax}
      yMin={yMin}
      yMax={yMax}
      showGrid={grid}
      showAxes={axes}
      axisLabels={{ x: xlabel, y: ylabel }}
    >
      {plots.map((p, i) => (
        <FunctionPlot
          key={`${p.fn}-${i}`}
          fn={p.fn}
          xMin={xMin}
          xMax={xMax}
          yMin={yMin}
          yMax={yMax}
          plotLeft={PADDING.left}
          plotTop={PADDING.top}
          plotWidth={plotW}
          plotHeight={plotH}
          color={p.color}
          colorIndex={i}
          label={p.label}
          samples={p.samples}
        />
      ))}
      {/* Legend */}
      {hasLabels && (
        <g className="svg-canvas-legend">
          {plots
            .filter((p) => p.label)
            .map((p, i) => {
              const y = PADDING.top + 12 + i * 20;
              return (
                <g key={`legend-${i}`}>
                  <rect
                    x={PADDING.left + 8}
                    y={y - 2}
                    width={p.label.length * 7 + 28}
                    height={18}
                    rx={4}
                    fill="var(--md-sys-color-surface-container)"
                    fillOpacity={0.85}
                    stroke="var(--md-sys-color-outline-variant)"
                    strokeWidth={0.5}
                  />
                  <line
                    x1={PADDING.left + 14}
                    y1={y + 7}
                    x2={PADDING.left + 28}
                    y2={y + 7}
                    stroke={getCurveColor(i, p.color)}
                    strokeWidth={2}
                  />
                  <text x={PADDING.left + 32} y={y + 11} fontSize={11}>
                    {p.label}
                  </text>
                </g>
              );
            })}
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
