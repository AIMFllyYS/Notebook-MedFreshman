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
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  return { fullscreen, toggle, exit };
}
