"use client";

import { useEffect } from "react";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

export function useFullscreenTrack(windowId: string, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !windowId) return;

    const syncToNotesPanel = () => {
      const rect = document.getElementById("notes-panel")?.getBoundingClientRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) return;
      useWindowManager.getState().commitGeometry(windowId, {
        pos: { x: rect.left, y: rect.top },
        size: { width: rect.width, height: rect.height },
      });
    };

    syncToNotesPanel();
    window.addEventListener("resize", syncToNotesPanel);
    return () => window.removeEventListener("resize", syncToNotesPanel);
  }, [enabled, windowId]);
}
