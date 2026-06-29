"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useLightbox } from "@/lib/stores/lightbox";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";

export function ImageLightbox() {
  const { src, alt, close } = useLightbox();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  useOverlayRegistration({ id: "image-lightbox", open: !!src, onClose: close, priority: 90 });

  useEffect(() => {
    if (src) {
      document.body.style.overflow = "hidden";
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [src]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.25, Math.min(5, z * factor)));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({
      x: panStart.current.x + dx,
      y: panStart.current.y + dy,
    });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (zoom > 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(2);
    }
  }, [zoom]);

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(5, z * 1.2));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.25, z * 0.8));
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  if (!src) return null;

  return createPortal(
    <div
      className="image-lightbox-backdrop"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={alt || "图片查看"}
    >
      <button
        className="image-lightbox-close"
        onClick={close}
        aria-label="关闭"
        type="button"
      >
        <X size={24} />
      </button>

      <div
        className="image-lightbox-controls"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={zoomOut} aria-label="缩小" type="button">
          <ZoomOut size={18} />
        </button>
        <span className="image-lightbox-zoom-label">
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={zoomIn} aria-label="放大" type="button">
          <ZoomIn size={18} />
        </button>
        <button onClick={resetView} aria-label="重置" type="button">
          <RotateCcw size={18} />
        </button>
      </div>

      <img
        src={src}
        alt={alt}
        className="image-lightbox-img"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          cursor: isDragging ? "grabbing" : zoom > 1 ? "grab" : "zoom-in",
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleDoubleClick();
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        draggable={false}
      />
    </div>,
    document.body,
  );
}
