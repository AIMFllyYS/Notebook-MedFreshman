/** 全局搜索 Spotlight 与加号菜单网址栏共用输入框 class，不要各写一套。 */
export const SPOTLIGHT_BACKDROP_CLASS = "fixed inset-0 z-[10000] bg-black/20 backdrop-blur-[2px]";
export const SPOTLIGHT_PANEL_CLASS =
  "mx-auto mt-[12vh] w-[min(720px,calc(100vw-28px))] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] shadow-2xl";
export const SPOTLIGHT_HEADER_CLASS = "flex items-center gap-3 border-b border-[var(--line)] px-4 py-3";
export const SPOTLIGHT_CLOSE_CLASS =
  "grid h-7 w-7 place-items-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]";
/** 顶栏全局搜索输入框与加号「输入网址」共用的圆角底。 */
export const SPOTLIGHT_SEARCH_FIELD_CLASS =
  "relative flex h-8 min-w-0 items-center gap-2 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--line)_76%,var(--md-sys-color-primary)_24%)] bg-[linear-gradient(120deg,color-mix(in_srgb,var(--bg-elevated)_92%,var(--md-sys-color-primary)_8%),var(--bg-panel))] px-3 text-[13px] text-[var(--ink-soft)] shadow-sm";
export const SPOTLIGHT_INPUT_CLASS =
  "min-w-0 flex-1 bg-transparent text-[15px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]";
export const SPOTLIGHT_BODY_CLASS = "max-h-[58vh] overflow-y-auto p-2";
