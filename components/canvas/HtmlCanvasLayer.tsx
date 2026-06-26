"use client";

import { CanvasControls } from "./CanvasControls";
import { useCanvasFullscreen } from "@/lib/hooks/useCanvasFullscreen";

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
 * 可与同一条回复里的 SVG/分子图并列。隔离仅靠 iframe sandbox（无 allow-same-origin、
 * 无网络访问），故必须写自包含 HTML；本地 dev 与打包应用（Electron 渲染进程）均支持 srcdoc。
 */
export function HtmlCanvasLayer({ html, title = "HTML 演示", height = 360 }: HtmlCanvasLayerProps) {
  const { fullscreen, toggle, exit } = useCanvasFullscreen();

  return (
    <>
      {fullscreen && <div className="canvas-fullscreen-backdrop" onClick={exit} />}
      <div className={`svg-canvas-wrapper html-canvas-layer${fullscreen ? " is-fullscreen" : ""}`}>
        <iframe
          title={title}
          srcDoc={html}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          className="html-canvas-frame"
          style={{ height: fullscreen ? "100%" : height }}
        />
        <CanvasControls onMaximize={toggle} />
      </div>
    </>
  );
}

export default HtmlCanvasLayer;
