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

/**
 * Agent 中央对话的可读宽度上限（px）。
 *
 * **必须与 `app/globals.css` 里 `[data-agent-shell]` 的 `--agent-chat-max` 相等** ——
 * 站内所有消费方读那个 CSS 变量；公开分享页（`components/share/SharePage.tsx`）是裸壳，
 * 根节点上没有 `[data-agent-shell]`，读不到变量，只能拿这个常量写内联宽度。
 * 两边曾经漂过 140px（Agent 780 / 分享页兜底 920），`tests/agentShellControls.test.ts`
 * 现在会断言二者相等：改一处必须改另一处。
 */
export const AGENT_CHAT_MAX_PX = 780;

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
