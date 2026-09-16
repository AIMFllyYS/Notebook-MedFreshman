/** 全局搜索与输入网址弹窗共用的 Spotlight chrome，不要各写一套。 */
export const SPOTLIGHT_BACKDROP_CLASS = "fixed inset-0 z-[10000] bg-black/20 backdrop-blur-[2px]";
export const SPOTLIGHT_PANEL_CLASS =
  "mx-auto mt-[12vh] w-[min(720px,calc(100vw-28px))] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] shadow-2xl";
export const SPOTLIGHT_HEADER_CLASS = "flex items-center gap-3 border-b border-[var(--line)] px-4 py-3";
export const SPOTLIGHT_CLOSE_CLASS =
  "grid h-7 w-7 place-items-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]";
export const SPOTLIGHT_INPUT_CLASS =
  "min-w-0 flex-1 bg-transparent text-[15px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]";
export const SPOTLIGHT_BODY_CLASS = "max-h-[58vh] overflow-y-auto p-2";
