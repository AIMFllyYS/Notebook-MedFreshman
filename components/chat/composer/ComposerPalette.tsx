"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";

export default function ComposerPalette({
  open,
  anchorRef,
  label,
  onClose,
  children,
}: {
  open: boolean;
  anchorRef: { readonly current: HTMLElement | null };
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const id = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 8, top: 8, width: 280, maxHeight: 320 });
  useOverlayRegistration({ id: `composer-palette-${id}`, open, onClose, priority: 80 });

  const update = useCallback(() => {
    const button = anchorRef.current;
    const menu = menuRef.current;
    if (!button || !menu) return;
    const rect = button.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 16);
    const above = Math.max(80, rect.top - 14);
    const height = Math.min(menu.scrollHeight, Math.min(360, above));
    setPosition({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
      top: Math.max(8, rect.top - height - 8),
      width,
      maxHeight: height,
    });
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) return;
    update();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    if (menuRef.current) observer?.observe(menuRef.current);
    window.addEventListener("resize", update);
    const dismiss = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node) && !anchorRef.current?.contains(event.target as Node)) onClose();
    };
    document.addEventListener("pointerdown", dismiss);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, [open, update, children, anchorRef, onClose]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div
      ref={menuRef}
      role="dialog"
      aria-label={label}
      className="app-menu composer-palette"
      data-testid="composer-palette"
      style={position}
    >
      {children}
    </div>,
    document.body,
  );
}
