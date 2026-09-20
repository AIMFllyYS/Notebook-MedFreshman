import type { I18nKey } from "@/lib/i18n";

export type ShortcutScope = "global" | "review" | "window" | "overlay" | "chat-input";

export type ShortcutCategory =
  | "global"
  | "window"
  | "review"
  | "overlay"
  | "right-panel"
  | "chat";

export interface ShortcutDef {
  id: string;
  keys: string;
  /** 展示文案的词典 key（settings.keyboard.shortcut.<id>.*），渲染处一律 t(labelKey)。 */
  labelKey: I18nKey;
  descriptionKey: I18nKey;
  scope: ShortcutScope;
  category: ShortcutCategory;
}

/** 所有快捷键定义（单一真相源）。keys 格式：mod / alt / shift + 小写 key，多键用 | 分隔。 */
export const SHORTCUTS: ShortcutDef[] = [
  // ── 全局 ──
  { id: "global.search", keys: "mod+shift+f", labelKey: "settings.keyboard.shortcut.global.search.label", descriptionKey: "settings.keyboard.shortcut.global.search.description", scope: "global", category: "global" },
  { id: "global.aiFloating", keys: "mod+i", labelKey: "settings.keyboard.shortcut.global.aiFloating.label", descriptionKey: "settings.keyboard.shortcut.global.aiFloating.description", scope: "global", category: "global" },
  { id: "global.toggleSidebar", keys: "mod+b", labelKey: "settings.keyboard.shortcut.global.toggleSidebar.label", descriptionKey: "settings.keyboard.shortcut.global.toggleSidebar.description", scope: "global", category: "global" },
  { id: "global.billing", keys: "mod+4", labelKey: "settings.keyboard.shortcut.global.billing.label", descriptionKey: "settings.keyboard.shortcut.global.billing.description", scope: "global", category: "global" },
  { id: "global.newChat", keys: "mod+shift+n", labelKey: "settings.keyboard.shortcut.global.newChat.label", descriptionKey: "settings.keyboard.shortcut.global.newChat.description", scope: "global", category: "global" },
  { id: "global.toggleTopBar", keys: "mod+shift+t", labelKey: "settings.keyboard.shortcut.global.toggleTopBar.label", descriptionKey: "settings.keyboard.shortcut.global.toggleTopBar.description", scope: "global", category: "global" },
  { id: "global.openReview", keys: "mod+shift+r", labelKey: "settings.keyboard.shortcut.global.openReview.label", descriptionKey: "settings.keyboard.shortcut.global.openReview.description", scope: "global", category: "global" },
  { id: "global.shortcutHelp", keys: "mod+shift+/", labelKey: "settings.keyboard.shortcut.global.shortcutHelp.label", descriptionKey: "settings.keyboard.shortcut.global.shortcutHelp.description", scope: "global", category: "global" },

  // ── 右栏 Tab ──
  { id: "global.rightTab.ai", keys: "mod+1", labelKey: "settings.keyboard.shortcut.global.rightTab.ai.label", descriptionKey: "settings.keyboard.shortcut.global.rightTab.ai.description", scope: "global", category: "right-panel" },
  { id: "global.rightTab.video", keys: "mod+2", labelKey: "settings.keyboard.shortcut.global.rightTab.video.label", descriptionKey: "settings.keyboard.shortcut.global.rightTab.video.description", scope: "global", category: "right-panel" },
  { id: "global.rightTab.interactive", keys: "mod+3", labelKey: "settings.keyboard.shortcut.global.rightTab.interactive.label", descriptionKey: "settings.keyboard.shortcut.global.rightTab.interactive.description", scope: "global", category: "right-panel" },
  { id: "global.rightTab.browser", keys: "mod+5", labelKey: "settings.keyboard.shortcut.global.rightTab.browser.label", descriptionKey: "settings.keyboard.shortcut.global.rightTab.browser.description", scope: "global", category: "right-panel" },

  // ── 窗口 ──
  { id: "window.close", keys: "alt+w", labelKey: "settings.keyboard.shortcut.window.close.label", descriptionKey: "settings.keyboard.shortcut.window.close.description", scope: "window", category: "window" },
  { id: "window.minimize", keys: "alt+m", labelKey: "settings.keyboard.shortcut.window.minimize.label", descriptionKey: "settings.keyboard.shortcut.window.minimize.description", scope: "window", category: "window" },
  { id: "window.fullscreen", keys: "alt+enter", labelKey: "settings.keyboard.shortcut.window.fullscreen.label", descriptionKey: "settings.keyboard.shortcut.window.fullscreen.description", scope: "window", category: "window" },

  // ── 浮层 ──
  { id: "overlay.escape", keys: "escape", labelKey: "settings.keyboard.shortcut.overlay.escape.label", descriptionKey: "settings.keyboard.shortcut.overlay.escape.description", scope: "overlay", category: "overlay" },

  // ── 复习板 ──
  { id: "review.prevCard", keys: "arrowleft", labelKey: "settings.keyboard.shortcut.review.prevCard.label", descriptionKey: "settings.keyboard.shortcut.review.prevCard.description", scope: "review", category: "review" },
  { id: "review.nextCard", keys: "arrowright", labelKey: "settings.keyboard.shortcut.review.nextCard.label", descriptionKey: "settings.keyboard.shortcut.review.nextCard.description", scope: "review", category: "review" },
  { id: "review.flipCard", keys: "space|enter", labelKey: "settings.keyboard.shortcut.review.flipCard.label", descriptionKey: "settings.keyboard.shortcut.review.flipCard.description", scope: "review", category: "review" },

  // ── 对话输入 ──
  { id: "chat.send", keys: "enter", labelKey: "settings.keyboard.shortcut.chat.send.label", descriptionKey: "settings.keyboard.shortcut.chat.send.description", scope: "chat-input", category: "chat" },
  { id: "chat.newline", keys: "shift+enter", labelKey: "settings.keyboard.shortcut.chat.newline.label", descriptionKey: "settings.keyboard.shortcut.chat.newline.description", scope: "chat-input", category: "chat" },
];

export const SHORTCUT_BY_ID = Object.fromEntries(SHORTCUTS.map((s) => [s.id, s])) as Record<string, ShortcutDef>;

export const SHORTCUT_CATEGORIES: { id: ShortcutCategory; labelKey: I18nKey }[] = [
  { id: "global", labelKey: "settings.keyboard.category.global" },
  { id: "right-panel", labelKey: "settings.keyboard.category.rightPanel" },
  { id: "window", labelKey: "settings.keyboard.category.window" },
  { id: "review", labelKey: "settings.keyboard.category.review" },
  { id: "overlay", labelKey: "settings.keyboard.category.overlay" },
  { id: "chat", labelKey: "settings.keyboard.category.chat" },
];
