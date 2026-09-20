import { normalizeLocale, type Locale } from "./types";

/** `<html lang>` 用的 BCP-47 标签，与 app/layout.tsx 服务端渲染时的默认值保持一致。 */
const HTML_LANG: Record<Locale, string> = { zh: "zh-CN", en: "en" };

/**
 * 把当前语言同步到文档根节点：`lang` 给屏幕阅读器与浏览器自动翻译用，
 * `data-locale` 给需要按语言微调的 CSS 用。
 *
 * 为什么放在 i18n 而不是 AppShell：任何用到文字的组件挂载时都该让文档属性正确，
 * 只挂在 AppShell 上会让「单独渲染某个面板」的场景（测试、右栏窗口）拿到过期的 lang。
 */
export function syncDocumentLocale(locale: Locale): void {
  // SSR 与 node 单测下没有 document，这里静默跳过（与 store 的 hydrated 约定一致）。
  if (typeof document === "undefined") return;
  const normalized = normalizeLocale(locale);
  const root = document.documentElement;
  root.lang = HTML_LANG[normalized];
  root.dataset.locale = normalized;
}
