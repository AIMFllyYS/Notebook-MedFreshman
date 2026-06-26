"use client";

import { Maximize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface CanvasControlsProps {
  onReset?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  /** 进入「放大查看」全屏；省略则不显示该键。 */
  onMaximize?: () => void;
}

/**
 * 画布右上角半透明悬浮控件（与正文 HTML 控件一套视觉语言）。
 * 每个键按需出现：缩放体传 zoom/reset，全屏由壳层传 onMaximize。
 */
export function CanvasControls({ onReset, onZoomIn, onZoomOut, onMaximize }: CanvasControlsProps) {
  return (
    <div className="svg-canvas-controls">
      {onZoomIn && (
        <button className="press" onClick={onZoomIn} title="放大" aria-label="放大">
          <ZoomIn size={15} />
        </button>
      )}
      {onZoomOut && (
        <button className="press" onClick={onZoomOut} title="缩小" aria-label="缩小">
          <ZoomOut size={15} />
        </button>
      )}
      {onReset && (
        <button className="press" onClick={onReset} title="重置视图" aria-label="重置视图">
          <RotateCcw size={15} />
        </button>
      )}
      {onMaximize && (
        <button className="press" onClick={onMaximize} title="放大查看" aria-label="放大查看">
          <Maximize2 size={15} />
        </button>
      )}
    </div>
  );
}
