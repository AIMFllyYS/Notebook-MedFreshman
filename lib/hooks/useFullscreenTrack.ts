"use client";

import { useEffect, useRef } from "react";
import { resolveFullscreenRect, type FullscreenTarget } from "@/lib/constants/layout";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

/**
 * 全屏期间跟随目标矩形（默认笔记栏）。
 * `viewport` 跟随视口；`notes` 跟随 `#notes-panel`。
 */
export function useFullscreenTrack(
  windowId: string,
  enabled: boolean,
  target: FullscreenTarget = "notes",
) {
  const targetRef = useRef(target);
  targetRef.current = target;
  const targetKey = typeof target === "function" ? "fn" : target;

  useEffect(() => {
    if (!enabled || !windowId) return;

    const sync = () => {
      const rect = resolveFullscreenRect(targetRef.current);
      if (!rect || rect.width <= 0 || rect.height <= 0) return;
      useWindowManager.getState().commitGeometry(windowId, {
        pos: { x: rect.left, y: rect.top },
        size: { width: rect.width, height: rect.height },
      });
    };

    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [enabled, windowId, targetKey]);
}
