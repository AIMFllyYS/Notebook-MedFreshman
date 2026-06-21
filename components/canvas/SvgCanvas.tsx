"use client";

import {
  useRef,
  useState,
  useCallback,
  type ReactNode,
  type PointerEvent as RPointerEvent,
  type WheelEvent as RWheelEvent,
} from "react";
import { calculateTicks } from "./canvasUtils";
import { CanvasControls } from "./CanvasControls";

export interface SvgCanvasProps {
  width?: number;
  height?: number;
  /** Math-space bounds: [xMin, xMax, yMin, yMax] */
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  axisLabels?: { x?: string; y?: string };
  pannable?: boolean;
  zoomable?: boolean;
  className?: string;
  children?: ReactNode;
}

const PADDING = { top: 20, right: 20, bottom: 36, left: 48 };
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;

export default function SvgCanvas({
  width = 600,
  height = 400,
  xMin: xMinProp = -10,
  xMax: xMaxProp = 10,
  yMin: yMinProp = -5,
  yMax: yMaxProp = 5,
  showGrid = true,
  showAxes = true,
  axisLabels,
  pannable = true,
  zoomable = true,
  className,
  children,
}: SvgCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  const plotW = width - PADDING.left - PADDING.right;
  const plotH = height - PADDING.top - PADDING.bottom;

  const xRange = xMaxProp - xMinProp;
  const yRange = yMaxProp - yMinProp;

  const handlePointerDown = useCallback(
    (e: RPointerEvent<SVGSVGElement>) => {
      if (!pannable) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    },
    [pannable, pan],
  );

  const handlePointerMove = useCallback(
    (e: RPointerEvent<SVGSVGElement>) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy });
    },
    [],
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleWheel = useCallback(
    (e: RWheelEvent<SVGSVGElement>) => {
      if (!zoomable) return;
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((z) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z * factor)));
    },
    [zoomable],
  );

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const xTicks = calculateTicks(xMinProp, xMaxProp);
  const yTicks = calculateTicks(yMinProp, yMaxProp);

  const toSvgX = (x: number) => PADDING.left + ((x - xMinProp) / xRange) * plotW;
  const toSvgY = (y: number) => PADDING.top + ((yMaxProp - y) / yRange) * plotH;

  const originSvgX = toSvgX(0);
  const originSvgY = toSvgY(0);
  const originInView =
    0 >= xMinProp && 0 <= xMaxProp && 0 >= yMinProp && 0 <= yMaxProp;

  return (
    <div className={`svg-canvas-wrapper ${className ?? ""}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        style={{ touchAction: "none" }}
      >
        <defs>
          <clipPath id="plot-area">
            <rect x={PADDING.left} y={PADDING.top} width={plotW} height={plotH} />
          </clipPath>
        </defs>

        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{ transformOrigin: `${width / 2}px ${height / 2}px` }}
        >
          {/* Grid */}
          {showGrid && (
            <g className="svg-canvas-grid" clipPath="url(#plot-area)">
              {xTicks.map((t) => (
                <line
                  key={`gx-${t.value}`}
                  x1={toSvgX(t.value)}
                  y1={PADDING.top}
                  x2={toSvgX(t.value)}
                  y2={PADDING.top + plotH}
                />
              ))}
              {yTicks.map((t) => (
                <line
                  key={`gy-${t.value}`}
                  x1={PADDING.left}
                  y1={toSvgY(t.value)}
                  x2={PADDING.left + plotW}
                  y2={toSvgY(t.value)}
                />
              ))}
            </g>
          )}

          {/* Axes */}
          {showAxes && (
            <g className="svg-canvas-axis">
              {/* X axis */}
              {originInView || yMinProp <= 0 ? (
                <>
                  <line
                    x1={PADDING.left}
                    y1={originInView ? originSvgY : PADDING.top + plotH}
                    x2={PADDING.left + plotW}
                    y2={originInView ? originSvgY : PADDING.top + plotH}
                  />
                  <polygon
                    points={`${PADDING.left + plotW},${originInView ? originSvgY : PADDING.top + plotH} ${PADDING.left + plotW - 6},${(originInView ? originSvgY : PADDING.top + plotH) - 3} ${PADDING.left + plotW - 6},${(originInView ? originSvgY : PADDING.top + plotH) + 3}`}
                    fill="var(--md-sys-color-on-surface)"
                  />
                </>
              ) : null}
              {/* Y axis */}
              {originInView || xMinProp <= 0 ? (
                <>
                  <line
                    x1={originInView ? originSvgX : PADDING.left}
                    y1={PADDING.top}
                    x2={originInView ? originSvgX : PADDING.left}
                    y2={PADDING.top + plotH}
                  />
                  <polygon
                    points={`${originInView ? originSvgX : PADDING.left},${PADDING.top} ${(originInView ? originSvgX : PADDING.left) - 3},${PADDING.top + 6} ${(originInView ? originSvgX : PADDING.left) + 3},${PADDING.top + 6}`}
                    fill="var(--md-sys-color-on-surface)"
                  />
                </>
              ) : null}

              {/* X tick labels */}
              {xTicks.map((t) =>
                t.value === 0 && originInView ? null : (
                  <g key={`xt-${t.value}`} className="svg-canvas-tick">
                    <line
                      x1={toSvgX(t.value)}
                      y1={(originInView ? originSvgY : PADDING.top + plotH) - 3}
                      x2={toSvgX(t.value)}
                      y2={(originInView ? originSvgY : PADDING.top + plotH) + 3}
                    />
                    <text
                      x={toSvgX(t.value)}
                      y={(originInView ? originSvgY : PADDING.top + plotH) + 16}
                      textAnchor="middle"
                    >
                      {t.label}
                    </text>
                  </g>
                ),
              )}
              {/* Y tick labels */}
              {yTicks.map((t) =>
                t.value === 0 && originInView ? null : (
                  <g key={`yt-${t.value}`} className="svg-canvas-tick">
                    <line
                      x1={(originInView ? originSvgX : PADDING.left) - 3}
                      y1={toSvgY(t.value)}
                      x2={(originInView ? originSvgX : PADDING.left) + 3}
                      y2={toSvgY(t.value)}
                    />
                    <text
                      x={(originInView ? originSvgX : PADDING.left) - 8}
                      y={toSvgY(t.value) + 4}
                      textAnchor="end"
                    >
                      {t.label}
                    </text>
                  </g>
                ),
              )}

              {/* Axis labels */}
              {axisLabels?.x && (
                <text
                  className="svg-canvas-axis-label"
                  x={PADDING.left + plotW - 4}
                  y={(originInView ? originSvgY : PADDING.top + plotH) + 32}
                  textAnchor="end"
                >
                  {axisLabels.x}
                </text>
              )}
              {axisLabels?.y && (
                <text
                  className="svg-canvas-axis-label"
                  x={(originInView ? originSvgX : PADDING.left) + 12}
                  y={PADDING.top + 4}
                  textAnchor="start"
                >
                  {axisLabels.y}
                </text>
              )}

              {/* Origin label */}
              {originInView && (
                <text
                  className="svg-canvas-tick"
                  x={originSvgX - 8}
                  y={originSvgY + 16}
                  textAnchor="end"
                  fill="var(--md-sys-color-on-surface-variant)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  O
                </text>
              )}
            </g>
          )}

          {/* Plot area content (children get clipped) */}
          <g clipPath="url(#plot-area)">{children}</g>
        </g>
      </svg>

      {(pannable || zoomable) && (
        <CanvasControls
          onReset={resetView}
          onZoomIn={zoomable ? () => setZoom((z) => Math.min(ZOOM_MAX, z * 1.2)) : undefined}
          onZoomOut={zoomable ? () => setZoom((z) => Math.max(ZOOM_MIN, z / 1.2)) : undefined}
        />
      )}
    </div>
  );
}

export { SvgCanvas };
