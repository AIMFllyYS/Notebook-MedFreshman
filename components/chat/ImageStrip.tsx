"use client";

import { useRef, useCallback, type ReactNode, type PointerEvent as RPointerEvent } from "react";

interface ImageStripProps {
  children: ReactNode;
}

/**
 * Horizontal scroll strip for grouping multiple chat images in a single 200px row.
 * Supports drag-to-scroll via pointer events.
 */
export function ImageStrip({ children }: ImageStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; scrollLeft: number } | null>(null);

  const handlePointerDown = useCallback((e: RPointerEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, scrollLeft: el.scrollLeft };
    el.style.cursor = "grabbing";
  }, []);

  const handlePointerMove = useCallback((e: RPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !containerRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    containerRef.current.scrollLeft = dragRef.current.scrollLeft - dx;
  }, []);

  const handlePointerUp = useCallback((e: RPointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    const el = containerRef.current;
    if (el) {
      el.releasePointerCapture(e.pointerId);
      el.style.cursor = "";
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="chat-image-strip"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {children}
    </div>
  );
}
