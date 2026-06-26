"use client";

import { useState, useCallback, useEffect } from "react";

/**
 * 画布「放大查看」全屏态。
 * 各画布体（RawSvgViewer / SvgCanvas / HtmlCanvasLayer）共用，统一 Esc 退出。
 */
export function useCanvasFullscreen() {
  const [fullscreen, setFullscreen] = useState(false);
  const toggle = useCallback(() => setFullscreen((v) => !v), []);
  const exit = useCallback(() => setFullscreen(false), []);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    // 全屏时锁定 body 滚动，退出/卸载时恢复（与 ContentPageClient 同策）。
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [fullscreen]);

  return { fullscreen, toggle, exit };
}
