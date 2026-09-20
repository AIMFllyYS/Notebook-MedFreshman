import { useCallback, useEffect } from "react";
import { useSettings } from "@/lib/stores/settings";
import { syncDocumentLocale } from "./dom";
import { en } from "./messages/en";
import { zh } from "./messages/zh";
import { normalizeLocale, type Locale, type LocaleMessages } from "./types";

// 只转出消费方真正用得到的东西：多余的重导出会被 knip 判成「无人使用的导出」而卡住 pnpm lint。
export type { Locale, LocaleMessages } from "./types";
export { LOCALES } from "./types";

/** 词典表。加一种语言只需要在这里加一行（key 形状由 en.ts 的 satisfies 兜住）。 */
const MESSAGES: Record<Locale, LocaleMessages> = { zh, en };

/** 插值变量。数字会被 String()，方便 `{count}` 这类计数直接传 number。 */
export type TranslateVars = Record<string, string | number>;

/** 把嵌套词典压成 dot-path 联合类型，例如 "agent.nav.assets"。 */
type DotPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : DotPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type I18nKey = DotPaths<LocaleMessages>;

/**
 * 文案 key 参数的实际类型：保留 I18nKey 的字面量补全，同时允许任意字符串。
 * 为什么不用严格的 I18nKey 联合：多个模块并行开发时会先引用尚未落地的 key，
 * 严格联合会把「词典还没补」升级成编译错误，挡住别人的构建；缺 key 由运行时回退 + 开发期告警兜住。
 */
export type TranslateKey = I18nKey | (string & {});

export type Translate = (key: TranslateKey, vars?: TranslateVars) => string;

/** 按 dot-path 取字典里的字符串；任何一层缺失或落到非字符串都返回 undefined。 */
function lookup(dictionary: unknown, key: string): string | undefined {
  let node = dictionary;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null || !Object.prototype.hasOwnProperty.call(node, part)) {
      return undefined;
    }
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

/** `{name}` 占位符替换。没给值的占位符原样保留——比悄悄变成空串更容易定位。 */
function interpolate(template: string, vars: TranslateVars): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  );
}

/**
 * 取文案（纯函数，SSR / node 单测可用）。
 * 目标语言缺 key 时回退中文；两边都没有则原样返回 key 并在开发环境告警。
 */
export function translate(locale: Locale, key: TranslateKey, vars?: TranslateVars): string {
  const template = lookup(MESSAGES[normalizeLocale(locale)], key) ?? lookup(zh, key);
  if (template === undefined) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[i18n] 缺少文案 key「${key}」，已原样显示。`);
    }
    return key;
  }
  return vars ? interpolate(template, vars) : template;
}

/**
 * 非 React 上下文取词：事件回调、`lib/` 里的「开窗时翻标题」、模块级函数。
 *
 * 为什么必须有这一层：窗口标题会经通用 chrome（`WindowTaskbar` / `AgentDockTabs` / `OverflowMenu`）
 * **原样渲染**，把 key 存进 `windowManager` 会让标签条直接显示 `panel.addMenu.document`,
 * 所以标题必须在**开窗那一刻**就按当前语言翻好。这套理由原先在每个调用点抄一遍
 * （`translate(useSettings.getState().locale, …)` 满仓 24 处），现在只留在本文档上。
 *
 * 代价（有意为之）：切语言后**已经开着的**窗口标题不会跟着变，重开才更新。
 * 组件内取词一律继续用 `useT()` —— 它会跟着 locale 重新渲染。
 */
export function translateNow(key: TranslateKey, vars?: TranslateVars): string {
  return translate(useSettings.getState().locale, key, vars);
}

function collectKeys(source: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [name, value] of Object.entries(source)) {
    const path = prefix ? `${prefix}.${name}` : name;
    if (typeof value === "string") keys.push(path);
    else if (value && typeof value === "object") keys.push(...collectKeys(value as Record<string, unknown>, path));
  }
  return keys;
}

/** 全部可用 key（取自中文真相源）。用于开发期检索与「中英形状一致」的测试断言。 */
export const i18nKeys: readonly I18nKey[] = collectKeys(zh) as I18nKey[];

/** 订阅当前语言。需要按语言做非文案分支时用它，纯文案一律用 useT()。 */
export function useLocale(): Locale {
  return useSettings((s) => s.locale);
}

/**
 * 组件内取文案。返回的 t 是稳定引用：locale 不变时跨渲染保持同一个函数，
 * 可以安全地放进 useEffect / useMemo 的依赖数组。
 *
 * 文档语言属性在这里同步而不是塞进 AppShell：任何消费者（含单独渲染的面板与测试）挂载时
 * `<html lang>` 与 `data-locale` 都会立刻正确，不需要额外的接线。
 */
export function useT(): Translate {
  const locale = useLocale();
  useEffect(() => {
    syncDocumentLocale(locale);
  }, [locale]);
  return useCallback((key: TranslateKey, vars?: TranslateVars) => translate(locale, key, vars), [locale]);
}
