"use client";

import { createPortal } from "react-dom";

interface CanvasFullscreenPortalProps {
  open: boolean;
  onExit: () => void;
  children: React.ReactNode;
}

/**
 * 画布「真全屏」覆盖层。
 *
 * 为何必须 portal 到 document.body：聊天滚动容器 `.chat-messages{contain:layout}` 与
 * 消息体 `.chat-message{content-visibility:auto}` 都会为 `position:fixed` 后代建立**包含块**，
 * 若用原地 `.is-fullscreen` class 切换，fixed 会锚定到窄窄的消息列而非视口 → 全屏被裁在气泡里。
 * portal 把画布体挂到 body 子树，彻底脱离这些祖先（与 ArtifactViewer / ContentPageClient 同策）。
 *
 * 退出全屏：点背板（onExit）/ Esc（useCanvasFullscreen）/ 画布控件药丸里的 Minimize 键。
 * 不再放单独的大圆关闭键——会与药丸控件在右上角重合（单药丸方案）。
 *
 * 注：pan/zoom 等状态由各画布体组件（RawSvgViewer 等）持有，本组件只改 children 的 DOM 落点，
 * 故全屏开合不丢交互状态。
 */
export function CanvasFullscreenPortal({ open, onExit, children }: CanvasFullscreenPortalProps) {
  // 非全屏 / SSR：原位渲染。open 仅由客户端点击触发，故 SSR 与首帧（open=false）始终走原位，
  // 无水合错配；`typeof document` 守卫确保 createPortal 只在浏览器执行。
  if (!open || typeof document === "undefined") return <>{children}</>;

  return createPortal(
    <div className="canvas-fullscreen-backdrop" onClick={onExit}>
      <div className="canvas-fullscreen-stage" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export default CanvasFullscreenPortal;
