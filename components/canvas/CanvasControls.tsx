"use client";

import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Download } from "lucide-react";

interface CanvasControlsProps {
  onReset?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  /** 「下载 HTML」；省略则不显示（仅 HTML 图层用）。 */
  onDownload?: () => void;
  /** 「新页面展开」；省略则不显示（仅 HTML 图层用）。 */
  onOpenExternal?: () => void;
  /** 进入/退出「放大查看」全屏；省略则不显示该键。 */
  onMaximize?: () => void;
  /** 当前是否全屏：决定 onMaximize 键显示 放大(Maximize2) 还是 退出(Minimize2)。 */
  fullscreen?: boolean;
}

/**
 * 画布右上角半透明悬浮控件——与正文 HTML（ContentPageClient）控件**完全同款**：
 * 深色半透明药丸 + 白色图标 + backdrop-blur。每个键按需出现：
 * 缩放体传 zoom/reset，HTML 图层传 onOpenExternal，全屏由壳层传 onMaximize。
 * 全屏时 onMaximize 键变 Minimize2（退出）——全屏内唯一退出件（另有 Esc / 点背板）。
 * 样式在 app/styles/canvas.css 的 .svg-canvas-controls（保留该类名供指针守卫选择器使用）。
 */
export function CanvasControls({
  onReset,
  onZoomIn,
  onZoomOut,
  onDownload,
  onOpenExternal,
  onMaximize,
  fullscreen = false,
}: CanvasControlsProps) {
  return (
    <div className="svg-canvas-controls">
      {onZoomIn && (
        <button className="press" onClick={onZoomIn} title="放大" aria-label="放大">
          <ZoomIn size={11} />
        </button>
      )}
      {onZoomOut && (
        <button className="press" onClick={onZoomOut} title="缩小" aria-label="缩小">
          <ZoomOut size={11} />
        </button>
      )}
      {onReset && (
        <button className="press" onClick={onReset} title="重置视图" aria-label="重置视图">
          <RotateCcw size={11} />
        </button>
      )}
      {onDownload && (
        <button className="press" onClick={onDownload} title="下载 HTML" aria-label="下载 HTML">
          <Download size={11} />
        </button>
      )}
      {onOpenExternal && (
        <button className="press" onClick={onOpenExternal} title="新页面展开" aria-label="新页面展开">
          <ExternalLink size={11} />
        </button>
      )}
      {onMaximize && (
        <button
          className="press"
          onClick={onMaximize}
          title={fullscreen ? "退出全屏" : "放大查看"}
          aria-label={fullscreen ? "退出全屏" : "放大查看"}
        >
          {fullscreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
        </button>
      )}
    </div>
  );
}
