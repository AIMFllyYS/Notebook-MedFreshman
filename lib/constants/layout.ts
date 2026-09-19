/**
 * 中间笔记栏 DOM id。
 * `ManagedWindow` 的 `fullscreenTarget: "notes"` 用它做全屏对齐目标。
 * 浮窗本身 portal 到 `document.body`，既不属于笔记区也不属于右侧 Agent 面板。
 * 勿改此字符串。
 */
export const NOTES_PANEL_ID = "notes-panel";

/** 右侧面板 DOM id。Agent 模式下 Mac 窗放大铺在这一栏。 */
export const RIGHT_PANEL_ID = "right-panel";

/** Stable portal target below the Agent dock tabs and built-in tool chrome. */
export const AGENT_DOCK_CONTENT_ID = "agent-dock-content";

export type FullscreenTarget = "viewport" | "notes" | "right" | (() => DOMRect | null);

function panelRect(id: string): DOMRect | null {
  if (typeof document === "undefined") return null;
  const rect = document.getElementById(id)?.getBoundingClientRect();
  return rect && rect.width > 0 && rect.height > 0 ? rect : null;
}

/** 解析全屏目标矩形。`notes` / `right` 在目标栏缺失时返回 null，由调用方决定是否回退。 */
export function resolveFullscreenRect(target: FullscreenTarget = "viewport"): DOMRect | null {
  if (typeof target === "function") return target();
  if (target === "notes") return panelRect(NOTES_PANEL_ID);
  if (target === "right") return panelRect(RIGHT_PANEL_ID);
  if (typeof window === "undefined") return null;
  return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
}
