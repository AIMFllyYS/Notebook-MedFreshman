"use client";

import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";

interface CanvasControlsProps {
  onReset: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export function CanvasControls({ onReset, onZoomIn, onZoomOut }: CanvasControlsProps) {
  return (
    <div className="svg-canvas-controls">
      {onZoomIn && (
        <button onClick={onZoomIn} title="放大" aria-label="放大">
          <ZoomIn size={14} />
        </button>
      )}
      {onZoomOut && (
        <button onClick={onZoomOut} title="缩小" aria-label="缩小">
          <ZoomOut size={14} />
        </button>
      )}
      <button onClick={onReset} title="重置视图" aria-label="重置视图">
        <Maximize2 size={14} />
      </button>
    </div>
  );
}
