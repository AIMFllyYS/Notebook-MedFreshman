"use client";

import type { CanvasBlock } from "@/lib/canvas/types";
import { RawSvgRenderer } from "./renderers/RawSvgRenderer";

export interface RawSvgViewerProps {
  /** SVG markup, with or without an <svg> root. */
  svg: string;
  title?: string;
  width?: number;
  height?: number;
  sourceSvg?: string;
  topic?: string;
  onRevisionAccepted?: (block: CanvasBlock) => void;
}

/**
 * Compatibility wrapper for older call sites that pass raw SVG strings.
 * All rendering, diagnostics, and AI revision UI live in RawSvgRenderer/CanvasFrame.
 */
export function RawSvgViewer({
  svg,
  title = "Diagram",
  width = 400,
  height = 300,
  sourceSvg,
  topic,
  onRevisionAccepted,
}: RawSvgViewerProps) {
  return (
    <RawSvgRenderer
      block={{
        kind: "raw-svg",
        title,
        width,
        height,
        source: sourceSvg || svg,
      }}
      revisionTopic={topic}
      onRevisionAccepted={onRevisionAccepted}
    />
  );
}

export default RawSvgViewer;
