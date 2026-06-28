// 目录（TOC）类型定义 —— 由 useToc hook 从正文 DOM 提取，驱动侧边栏目录树视图。

export interface TocItem {
  /** DOM 元素 id，用于 scrollIntoView 锚点跳转 */
  id: string;
  /** 标题层级（1 = 页面标题 h1，2 = h2，以此类推） */
  level: 1 | 2 | 3 | 4;
  /** 纯文本（textContent，已去除 HTML 标签与数学公式符号） */
  text: string;
  /** 子标题树 */
  children: TocItem[];
}
