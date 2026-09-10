/**
 * 中间笔记栏 DOM id。
 * `ManagedWindow` 的 `fullscreenTarget: "notes"` 用它做全屏对齐目标。
 * 浮窗本身 portal 到 `document.body`，既不属于笔记区也不属于右侧 Agent 面板。
 * 勿改此字符串。
 */
export const NOTES_PANEL_ID = "notes-panel";

export type FullscreenTarget = "viewport" | "notes" | (() => DOMRect | null);

/** 解析全屏目标矩形。`notes` 在笔记栏缺失时返回 null，由调用方决定是否回退。 */
export function resolveFullscreenRect(target: FullscreenTarget = "viewport"): DOMRect | null {
  if (typeof target === "function") return target();
  if (target === "notes") {
    const rect = document.getElementById(NOTES_PANEL_ID)?.getBoundingClientRect();
    return rect && rect.width > 0 && rect.height > 0 ? rect : null;
  }
  if (typeof window === "undefined") return null;
  return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
}
