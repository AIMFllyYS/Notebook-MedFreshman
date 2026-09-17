"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";
import {
  APP_MENU_Z_INDEX,
  computeAnchoredMenuBox,
  isUsableAnchorRect,
  type AnchoredMenuBox,
} from "@/lib/ui/anchoredMenuPosition";

export default function ComposerPalette({
  open,
  anchorRef,
  ignoreRefs,
  label,
  onClose,
  children,
}: {
  open: boolean;
  anchorRef: { readonly current: HTMLElement | null };
  /** 加号等触发器：pointerdown 关闭时不要误伤随后的 click 开窗。 */
  ignoreRefs?: ReadonlyArray<{ readonly current: HTMLElement | null }>;
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const id = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<AnchoredMenuBox | null>(null);
  if (!open && box) setBox(null);
  useOverlayRegistration({ id: `composer-palette-${id}`, open, onClose, priority: 80 });

  useLayoutEffect(() => {
    if (!open) return;

    let raf = 0;
    const apply = (next: AnchoredMenuBox) => {
      const menu = menuRef.current;
      if (menu) {
        menu.style.left = `${next.left}px`;
        menu.style.top = `${next.top}px`;
        menu.style.width = `${next.width}px`;
        menu.style.maxHeight = `${next.maxHeight}px`;
        menu.dataset.placed = "true";
      }
      setBox((prev) => (
        prev
        && prev.left === next.left
        && prev.top === next.top
        && prev.width === next.width
        && prev.maxHeight === next.maxHeight
          ? prev
          : next
      ));
    };

    const measure = (): AnchoredMenuBox | null => {
      const anchor = anchorRef.current;
      const menu = menuRef.current;
      if (!anchor || !menu) return null;
      const rect = anchor.getBoundingClientRect();
      if (!isUsableAnchorRect(rect)) return null;
      const menuHeight = menu.scrollHeight;
      if (menuHeight === 0 && menu.childElementCount > 0) return null;
      return computeAnchoredMenuBox({
        anchor: rect,
        menuHeight,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        preferredWidth: 320,
        placement: "top",
      });
    };

    const update = () => {
      const next = measure();
      if (!next) return false;
      apply(next);
      return true;
    };

    const retry = () => {
      if (update()) return;
      raf = requestAnimationFrame(retry);
    };
    retry();

    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => { update(); });
    if (anchorRef.current) observer?.observe(anchorRef.current);
    if (menuRef.current) observer?.observe(menuRef.current);
    const scroll = (event: Event) => { if (!menuRef.current?.contains(event.target as Node)) update(); };
    window.addEventListener("resize", update);
    document.addEventListener("scroll", scroll, true);
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("resize", update);
      document.removeEventListener("scroll", scroll, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      if (ignoreRefs?.some((ref) => ref.current?.contains(target))) return;
      onClose();
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open, anchorRef, ignoreRefs, onClose]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div
      ref={menuRef}
      role="dialog"
      aria-label={label}
      className="app-menu composer-palette"
      data-testid="composer-palette"
      data-placed={box ? "true" : "false"}
      style={{
        left: box?.left ?? 0,
        top: box?.top ?? 0,
        width: box?.width ?? 320,
        maxHeight: box?.maxHeight ?? 320,
        zIndex: APP_MENU_Z_INDEX,
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
