"use client";

import {
  useRef,
  useState,
  useCallback,
  type PointerEvent as RPointerEvent,
  type WheelEvent as RWheelEvent,
} from "react";
import { CanvasControls } from "./CanvasControls";
import { useCanvasFullscreen } from "@/lib/hooks/useCanvasFullscreen";

export interface RawSvgViewerProps {
  /** Sanitized SVG markup (inner elements, may or may not include an <svg> root) */
  svg: string;
  title?: string;
  width?: number;
  height?: number;
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;

/**
 * Lightweight SVG renderer for AI-authored diagrams with their own coordinate system.
 * No grid, no axes, no math coordinate mapping — just pan/zoom + theme CSS.
 */
export function RawSvgViewer({
  svg,
  title = "示意图",
  width = 400,
  height = 300,
}: RawSvgViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const { fullscreen, toggle, exit } = useCanvasFullscreen();
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  const handlePointerDown = useCallback(
    (e: RPointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    },
    [pan],
  );

  const handlePointerMove = useCallback((e: RPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleWheel = useCallback((e: RWheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z * factor)));
  }, []);

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const hasOwnSvgRoot = svg.trimStart().startsWith("<svg");
  const innerHtml = hasOwnSvgRoot
    ? svg
    : `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;

  return (
    <>
      {fullscreen && <div className="canvas-fullscreen-backdrop" onClick={exit} />}
      <div
        ref={containerRef}
        className={`svg-canvas-wrapper svg-raw-content${fullscreen ? " is-fullscreen" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        role="img"
        aria-label={title}
        style={{ touchAction: "none" }}
      >
        <div
          className="svg-raw-inner"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            width: "100%",
            height: "auto",
            minHeight: height,
          }}
          dangerouslySetInnerHTML={{ __html: innerHtml }}
        />
        <CanvasControls
          onReset={resetView}
          onZoomIn={() => setZoom((z) => Math.min(ZOOM_MAX, z * 1.2))}
          onZoomOut={() => setZoom((z) => Math.max(ZOOM_MIN, z / 1.2))}
          onMaximize={toggle}
        />
      </div>
    </>
  );
}
