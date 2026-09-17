/** Floating menus sit above Agent settings (10000), dialogs (10020) and Mac windows (~5000+). */
export const APP_MENU_Z_INDEX = 12000;

export type MenuPlacement = "top" | "bottom";

export interface AnchorRect {
  left: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface AnchoredMenuBox {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
}

/** First `position:fixed` layout often reports a 0×0 rect; do not show until this is true. */
export function isUsableAnchorRect(rect: AnchorRect): boolean {
  return rect.width > 0 && rect.height > 0;
}

export function computeAnchoredMenuBox({
  anchor,
  menuHeight,
  viewport,
  preferredWidth,
  placement = "bottom",
}: {
  anchor: AnchorRect;
  menuHeight: number;
  viewport: ViewportSize;
  preferredWidth: number;
  placement?: MenuPlacement;
}): AnchoredMenuBox {
  const menuWidth = Math.min(Math.max(preferredWidth, anchor.width), viewport.width - 16);
  const above = Math.max(0, anchor.top - 14);
  const below = Math.max(0, viewport.height - anchor.bottom - 14);
  const desiredHeight = Math.min(menuHeight, 360);
  const onTop = placement === "top" ? above >= desiredHeight || above > below : below < desiredHeight && above > below;
  const maxHeight = Math.max(40, Math.min(360, onTop ? above : below));
  const height = Math.min(desiredHeight, maxHeight);
  return {
    left: Math.max(8, Math.min(anchor.left, viewport.width - menuWidth - 8)),
    top: Math.max(8, Math.min(onTop ? anchor.top - height - 6 : anchor.bottom + 6, viewport.height - height - 8)),
    width: menuWidth,
    maxHeight,
  };
}
