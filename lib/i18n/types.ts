import type { zh } from "./messages/zh";

/**
 * 支持的语言。加语言 = 这里加一个值 + 一份 `messages/<locale>.ts`，其余代码不用动。
 */
export type Locale = "zh" | "en";

export const LOCALES: readonly Locale[] = ["zh", "en"];

/** 默认语言。中文是词典真相源，任何查不到的 key 都回退到它。 */
export const DEFAULT_LOCALE: Locale = "zh";

/**
 * 词典形状：由中文词典推导。
 * 为什么不手写 interface：手写的形状与 zh.ts 会各自漂移，漏 key 只有运行时才发现；
 * 从 zh 推导后，en.ts 的 `satisfies LocaleMessages` 能在 typecheck 阶段就抓出缺口。
 */
export type LocaleMessages = typeof zh;

/** 归一化外部输入（localStorage / 旧配置）里的语言值：不认识的一律回中文。 */
export function normalizeLocale(value: unknown): Locale {
  return LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}
