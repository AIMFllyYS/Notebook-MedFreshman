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
  label: string;
  description: string;
  scope: ShortcutScope;
  category: ShortcutCategory;
}

/** 所有快捷键定义（单一真相源）。keys 格式：mod / alt / shift + 小写 key，多键用 | 分隔。 */
export const SHORTCUTS: ShortcutDef[] = [
  // ── 全局 ──
  { id: "global.search", keys: "mod+shift+f", label: "全局搜索", description: "打开全局内容搜索", scope: "global", category: "global" },
  { id: "global.aiFloating", keys: "mod+i", label: "AI 助手浮窗", description: "打开无选文的 AI 划词浮窗", scope: "global", category: "global" },
  { id: "global.toggleSidebar", keys: "mod+b", label: "收起/展开侧栏", description: "切换左侧导航栏", scope: "global", category: "global" },
  { id: "global.billing", keys: "mod+4", label: "API 计费总览", description: "打开 API 计费总览窗口", scope: "global", category: "global" },
  { id: "global.newChat", keys: "mod+shift+n", label: "新建对话", description: "创建新的 AI 对话并切到 AI 栏", scope: "global", category: "global" },
  { id: "global.toggleTopBar", keys: "mod+shift+t", label: "收起/展开顶栏", description: "切换顶部导航栏", scope: "global", category: "global" },
  { id: "global.openReview", keys: "mod+shift+r", label: "打开复习板", description: "跳转到当前科目复习板", scope: "global", category: "global" },
  { id: "global.shortcutHelp", keys: "mod+shift+/", label: "快捷键帮助", description: "打开快捷键参考面板", scope: "global", category: "global" },

  // ── 右栏 Tab ──
  { id: "global.rightTab.ai", keys: "mod+1", label: "AI 对话栏", description: "切换到右侧 AI 对话", scope: "global", category: "right-panel" },
  { id: "global.rightTab.video", keys: "mod+2", label: "动画讲解栏", description: "切换到右侧动画讲解", scope: "global", category: "right-panel" },
  { id: "global.rightTab.interactive", keys: "mod+3", label: "可交互栏", description: "切换到右侧可交互演示", scope: "global", category: "right-panel" },
  { id: "global.rightTab.browser", keys: "mod+5", label: "浏览器栏", description: "切换到右侧内置浏览器", scope: "global", category: "right-panel" },

  // ── 窗口 ──
  { id: "window.close", keys: "alt+w", label: "关闭窗口", description: "关闭当前选中的浮窗", scope: "window", category: "window" },
  { id: "window.minimize", keys: "alt+m", label: "最小化窗口", description: "最小化/还原当前选中的浮窗", scope: "window", category: "window" },
  { id: "window.fullscreen", keys: "alt+enter", label: "全屏窗口", description: "全屏/退出全屏当前选中的浮窗", scope: "window", category: "window" },

  // ── 浮层 ──
  { id: "overlay.escape", keys: "escape", label: "关闭浮层", description: "关闭最上层弹窗/菜单/浮层", scope: "overlay", category: "overlay" },

  // ── 复习板 ──
  { id: "review.prevCard", keys: "arrowleft", label: "上一张卡", description: "复习板切换到上一张记忆卡", scope: "review", category: "review" },
  { id: "review.nextCard", keys: "arrowright", label: "下一张卡", description: "复习板切换到下一张记忆卡", scope: "review", category: "review" },
  { id: "review.flipCard", keys: "space|enter", label: "翻面", description: "复习板翻转当前记忆卡", scope: "review", category: "review" },

  // ── 对话输入 ──
  { id: "chat.send", keys: "enter", label: "发送消息", description: "在对话输入框按 Enter 发送", scope: "chat-input", category: "chat" },
  { id: "chat.newline", keys: "shift+enter", label: "换行", description: "在对话输入框按 Shift+Enter 换行", scope: "chat-input", category: "chat" },
];

export const SHORTCUT_BY_ID = Object.fromEntries(SHORTCUTS.map((s) => [s.id, s])) as Record<string, ShortcutDef>;

export const SHORTCUT_CATEGORIES: { id: ShortcutCategory; label: string }[] = [
  { id: "global", label: "全局" },
  { id: "right-panel", label: "右栏" },
  { id: "window", label: "窗口" },
  { id: "review", label: "复习板" },
  { id: "overlay", label: "浮层" },
  { id: "chat", label: "对话" },
];
