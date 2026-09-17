"use client";

import { useCallback } from "react";

/** 从左缘加宽：右缘固定，只改 x + width。Agent 模式右侧弹出窗用。 */
export function useWestResizable(
  elRef: React.RefObject<HTMLElement | null>,
  onCommit: (geom: { pos: { x: number; y: number }; size: { width: number; height: number } }) => void,
  opts?: { minW?: number; minLeft?: number },
) {
  const minW = opts?.minW ?? 320;
  const minLeft = opts?.minLeft ?? 72;

  return useCallback(
    (e: React.PointerEvent) => {
      const el = elRef.current;
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();

      const rect = el.getBoundingClientRect();
      const startX = e.clientX;
      const right = rect.left + rect.width;
      let last = { x: rect.left, w: rect.width };
      let raf: number | null = null;

      const clamp = (clientX: number) => {
        const delta = clientX - startX;
        const width = Math.max(minW, Math.min(right - minLeft, rect.width - delta));
        return { x: right - width, w: width };
      };

      const onMove = (ev: PointerEvent) => {
        last = clamp(ev.clientX);
        if (raf == null) {
          raf = requestAnimationFrame(() => {
            raf = null;
            if (elRef.current) {
              elRef.current.style.left = `${last.x}px`;
              elRef.current.style.width = `${last.w}px`;
            }
          });
        }
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        if (raf != null) cancelAnimationFrame(raf);
        onCommit({
          pos: { x: last.x, y: rect.top },
          size: { width: last.w, height: rect.height },
        });
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [elRef, onCommit, minW, minLeft],
  );
}
