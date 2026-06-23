"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLightbox } from "@/lib/stores/lightbox";

export function ImageLightbox() {
  const { src, alt, close } = useLightbox();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    },
    [close],
  );

  useEffect(() => {
    if (src) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [src, handleKeyDown]);

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
      <img
        src={src}
        alt={alt}
        className="image-lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body,
  );
}
