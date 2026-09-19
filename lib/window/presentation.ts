export type ManagedWindowPresentation = "floating" | "dock" | "sheet" | "pending";

export interface WindowPresentationInput {
  agent: boolean;
  mobile: boolean;
  dockHostAvailable: boolean;
}

/**
 * Resolve the outer presentation only. Business windows stay unaware of this
 * decision, which keeps the same document/note/iframe body usable in every
 * app mode.
 */
export function resolveManagedWindowPresentation({
  agent,
  mobile,
  dockHostAvailable,
}: WindowPresentationInput): ManagedWindowPresentation {
  if (!agent) return "floating";
  if (mobile) return "sheet";
  return dockHostAvailable ? "dock" : "pending";
}

export function isManagedWindowInteractive(input: {
  presentation: ManagedWindowPresentation;
  minimized: boolean;
  active: boolean;
  dockCollapsed: boolean;
}): boolean {
  if (input.minimized) return false;
  if (input.presentation === "dock") return input.active && !input.dockCollapsed;
  return input.presentation === "floating" || input.presentation === "sheet";
}
