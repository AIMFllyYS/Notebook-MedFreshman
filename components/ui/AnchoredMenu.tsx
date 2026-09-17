"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from "react";
import { createPortal } from "react-dom";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";
import {
  APP_MENU_Z_INDEX,
  computeAnchoredMenuBox,
  isUsableAnchorRect,
  type AnchoredMenuBox,
} from "@/lib/ui/anchoredMenuPosition";

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
  triggerRef?: Ref<HTMLButtonElement>;
  triggerData?: Record<`data-${string}`, string>;
  /** 叠在 Spotlight 等高层 overlay 上时提高菜单层。默认已盖过设置层与 Mac 窗。 */
  menuZIndex?: number;
}

function assignRef(ref: Ref<HTMLButtonElement> | undefined, node: HTMLButtonElement | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(node);
    return;
  }
  (ref as { current: HTMLButtonElement | null }).current = node;
}

function sameBox(a: AnchoredMenuBox | null, b: AnchoredMenuBox): boolean {
  return !!a && a.left === b.left && a.top === b.top && a.width === b.width && a.maxHeight === b.maxHeight;
}

function writeBox(menu: HTMLElement, box: AnchoredMenuBox) {
  menu.style.left = `${box.left}px`;
  menu.style.top = `${box.top}px`;
  menu.style.width = `${box.width}px`;
  menu.style.maxHeight = `${box.maxHeight}px`;
  menu.dataset.placed = "true";
}

/** Shared non-modal menu: portal, viewport collision handling and keyboard/focus lifecycle. */
export default function AnchoredMenu({ label, trigger, children, className = "", style, disabled, width = 240,
  placement = "bottom", role = "menu", testId, triggerRef, triggerData, menuZIndex = APP_MENU_Z_INDEX }: AnchoredMenuProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<AnchoredMenuBox | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const setButtonRef = useCallback((node: HTMLButtonElement | null) => {
    buttonRef.current = node;
    assignRef(triggerRef, node);
  }, [triggerRef]);
  const menuRef = useRef<HTMLDivElement>(null);
  const focusedRef = useRef(false);
  const close = useCallback(() => {
    setOpen(false);
    setBox(null);
  }, []);
  useOverlayRegistration({ id: `menu-${id}`, open, onClose: close, priority: 70 });

  useLayoutEffect(() => {
    if (!open) {
      focusedRef.current = false;
      return;
    }

    let raf = 0;
    const apply = (next: AnchoredMenuBox) => {
      const menu = menuRef.current;
      if (menu) writeBox(menu, next);
      setBox((prev) => (sameBox(prev, next) ? prev : next));
    };

    const measure = (): "close" | AnchoredMenuBox | null => {
      const button = buttonRef.current;
      const menu = menuRef.current;
      if (!button || !menu) return null;
      if (button.disabled || button.closest("[hidden]") || getComputedStyle(button).display === "none") return "close";
      const rect = button.getBoundingClientRect();
      if (!isUsableAnchorRect(rect)) return null;
      const menuHeight = menu.scrollHeight;
      if (menuHeight === 0 && menu.childElementCount > 0) return null;
      return computeAnchoredMenuBox({
        anchor: rect,
        menuHeight,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        preferredWidth: width,
        placement,
      });
    };

    const update = () => {
      const next = measure();
      if (next === "close") {
        close();
        return true;
      }
      if (!next) return false;
      apply(next);
      if (!focusedRef.current) {
        focusedRef.current = true;
        const selected = menuRef.current?.querySelector<HTMLElement>('[aria-selected="true"], [aria-checked="true"]');
        (selected ?? menuRef.current?.querySelector<HTMLElement>("button:not(:disabled)"))?.focus({ preventScroll: true });
        selected?.scrollIntoView?.({ block: "nearest" });
      }
      return true;
    };

    const retry = () => {
      if (update()) return;
      raf = requestAnimationFrame(retry);
    };
    retry();

    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => { update(); });
    if (buttonRef.current) observer?.observe(buttonRef.current);
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
  }, [close, open, width, placement]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!buttonRef.current?.contains(event.target as Node) && !menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  return <>
    <button ref={setButtonRef} type="button" aria-label={label} title={label} aria-haspopup={role}
      aria-expanded={open} aria-controls={open ? id : undefined} disabled={disabled}
      className={className} style={style} data-testid={testId} {...triggerData}
      onClick={() => {
        if (open) close();
        else { setBox(null); setOpen(true); }
      }}
      onKeyDown={(event) => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setBox(null); setOpen(true); } }}>
      {trigger}
    </button>
    {open && createPortal(<div ref={menuRef} id={id} role={role} aria-label={label} className="app-menu"
      data-placed={box ? "true" : "false"}
      style={{
        left: box?.left ?? 0,
        top: box?.top ?? 0,
        width: box?.width ?? width,
        maxHeight: box?.maxHeight ?? 320,
        zIndex: menuZIndex,
      }}
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
