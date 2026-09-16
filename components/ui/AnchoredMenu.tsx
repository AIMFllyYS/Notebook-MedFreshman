"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";

interface AnchoredMenuProps {
  label: string;
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  width?: number;
  placement?: "top" | "bottom";
  role?: "menu" | "listbox";
  testId?: string;
  triggerData?: Record<`data-${string}`, string>;
  /** 叠在 Spotlight 等高层 overlay 上时提高菜单层。 */
  menuZIndex?: number;
}

/** Shared non-modal menu: portal, viewport collision handling and keyboard/focus lifecycle. */
export default function AnchoredMenu({ label, trigger, children, className = "", style, disabled, width = 240,
  placement = "bottom", role = "menu", testId, triggerData, menuZIndex }: AnchoredMenuProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 8, top: 8, width, maxHeight: 320 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOverlayRegistration({ id: `menu-${id}`, open, onClose: close, priority: 70 });

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const button = buttonRef.current;
      const menu = menuRef.current;
      if (!button || !menu) return;
      const rect = button.getBoundingClientRect();
      if (button.disabled || button.closest('[hidden]') || getComputedStyle(button).display === "none") {
        setOpen(false);
        return;
      }
      const menuWidth = Math.min(Math.max(width, rect.width), window.innerWidth - 16);
      const above = Math.max(0, rect.top - 14);
      const below = Math.max(0, window.innerHeight - rect.bottom - 14);
      const desiredHeight = Math.min(menu.scrollHeight, 360);
      const onTop = placement === "top" ? above >= desiredHeight || above > below : below < desiredHeight && above > below;
      const maxHeight = Math.max(40, Math.min(360, onTop ? above : below));
      const height = Math.min(desiredHeight, maxHeight);
      setPosition({
        left: Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8)),
        top: Math.max(8, Math.min(onTop ? rect.top - height - 6 : rect.bottom + 6, window.innerHeight - height - 8)),
        width: menuWidth, maxHeight,
      });
    };
    update();
    const selected = menuRef.current?.querySelector<HTMLElement>('[aria-selected="true"], [aria-checked="true"]');
    (selected ?? menuRef.current?.querySelector<HTMLElement>('button:not(:disabled)'))?.focus({ preventScroll: true });
    selected?.scrollIntoView?.({ block: "nearest" });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    if (buttonRef.current) observer?.observe(buttonRef.current);
    const scroll = (event: Event) => { if (!menuRef.current?.contains(event.target as Node)) update(); };
    window.addEventListener("resize", update);
    document.addEventListener("scroll", scroll, true);
    return () => { observer?.disconnect(); window.removeEventListener("resize", update); document.removeEventListener("scroll", scroll, true); };
  }, [open, width, placement]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!buttonRef.current?.contains(event.target as Node) && !menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  return <>
    <button ref={buttonRef} type="button" aria-label={label} title={label} aria-haspopup={role}
      aria-expanded={open} aria-controls={open ? id : undefined} disabled={disabled}
      className={className} style={style} data-testid={testId} {...triggerData}
      onClick={() => setOpen((value) => !value)}
      onKeyDown={(event) => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); } }}>
      {trigger}
    </button>
    {open && createPortal(<div ref={menuRef} id={id} role={role} aria-label={label} className="app-menu" style={{ ...position, zIndex: menuZIndex }}
      onKeyDown={(event) => {
        if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); buttonRef.current?.focus(); return; }
        if (event.key === "Tab") { close(); return; }
        const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
        const index = items.indexOf(document.activeElement as HTMLButtonElement);
        let next = -1;
        if (event.key === "ArrowDown") next = (index + 1) % items.length;
        if (event.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = items.length - 1;
        if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey) {
          next = items.findIndex((item, i) => i > index && item.textContent?.trim().toLowerCase().startsWith(event.key.toLowerCase()));
          if (next < 0) next = items.findIndex((item) => item.textContent?.trim().toLowerCase().startsWith(event.key.toLowerCase()));
        }
        if (next >= 0 && items[next]) { event.preventDefault(); items[next].focus(); }
      }}>
      {children(close)}
    </div>, document.body)}
  </>;
}
