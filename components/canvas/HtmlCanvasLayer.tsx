"use client";

import { useCallback } from "react";
import { CanvasControls } from "./CanvasControls";
import { CanvasFullscreenPortal } from "./CanvasFullscreenPortal";
import { useCanvasFullscreen } from "@/lib/hooks/useCanvasFullscreen";
import { downloadHtmlFile } from "@/lib/utils/downloadHtml";

interface HtmlCanvasLayerProps {
  /** AI 写入的 HTML 源（可含 <script>，在沙箱 iframe 内运行）。 */
  html: string;
  title?: string;
  height?: number;
}

/**
 * canvas 内的「HTML 图层」：把 AI 写的 HTML 放进沙箱 iframe 渲染。
 *
 * 与 renderInteractive（弹窗 artifact）不同——这是**内联在消息画布里**的轻量图层，
 * 可与同一条回复里的 SVG/分子图并列。iframe sandbox 允许脚本/同源/弹窗/表单/下载，
 * 故 AI 写的 HTML 可联网引 CDN 库（Chart.js/D3 等）；本地 dev 与打包应用（Electron 渲染进程）均支持 srcdoc。
 *
 * 控件与正文 HTML 一套：下载 HTML（本地保存）+ 新页面展开（Blob URL）+ 全屏（portal 真全屏）。
 */
export function HtmlCanvasLayer({ html, title = "HTML 演示", height = 360 }: HtmlCanvasLayerProps) {
  const { fullscreen, toggle, exit } = useCanvasFullscreen();

  const openExternal = useCallback(() => {
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }, [html]);

  const download = useCallback(() => downloadHtmlFile(html, title), [html, title]);

  return (
    <CanvasFullscreenPortal open={fullscreen} onExit={exit}>
      <div className="svg-canvas-wrapper html-canvas-layer">
        <iframe
          title={title}
          srcDoc={html}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals allow-downloads"
          className="html-canvas-frame"
          style={{ height: fullscreen ? "100%" : height }}
        />
        <CanvasControls onDownload={download} onOpenExternal={openExternal} onMaximize={toggle} fullscreen={fullscreen} />
      </div>
    </CanvasFullscreenPortal>
  );
}

export default HtmlCanvasLayer;
