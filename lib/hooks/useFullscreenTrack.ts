"use client";

import { useEffect } from "react";
import { NOTES_PANEL_ID, resolveFullscreenRect, type FullscreenTarget } from "@/lib/constants/layout";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

/**
 * 全屏期间跟随目标矩形（默认笔记栏）。
 * `viewport` 跟随视口；`notes` 跟随 `#notes-panel`（含右侧 AI 开合导致的栏宽变化）。
 */
export function useFullscreenTrack(
  windowId: string,
  enabled: boolean,
  target: FullscreenTarget = "notes",
) {
  useEffect(() => {
    if (!enabled || !windowId) return;

    const sync = () => {
      const rect = resolveFullscreenRect(target);
      if (!rect || rect.width <= 0 || rect.height <= 0) return;
      useWindowManager.getState().commitGeometry(windowId, {
        pos: { x: rect.left, y: rect.top },
        size: { width: rect.width, height: rect.height },
      });
    };

    sync();
    window.addEventListener("resize", sync);
    const panel = target === "notes" ? document.getElementById(NOTES_PANEL_ID) : null;
    const observer =
      panel && typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : null;
    if (panel) observer?.observe(panel);

    return () => {
      window.removeEventListener("resize", sync);
      observer?.disconnect();
    };
  }, [enabled, windowId, target]);
}
