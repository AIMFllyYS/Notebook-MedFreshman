/**
 * 把元素滚到滚动容器的顶部（留一点上边距）。
 *
 * 不能用 `el.offsetTop`：它相对的是最近的**定位祖先**。在阅读器里
 * `.document-workspace-body` 没有 position，`offsetParent` 实际是 `.document-workspace-stage`，
 * 于是 32px 的工具栏高度会被算进去 —— 点大纲跳到第 N 页会多滚一截，目标页顶部落到视口外。
 * 用 rect 差值则与 offsetParent、祖先滚动位置都无关。
 */
export function scrollToElementTop(
  container: HTMLElement,
  element: HTMLElement,
  offset = 8,
): void {
  const delta = element.getBoundingClientRect().top - container.getBoundingClientRect().top;
  container.scrollTop = Math.max(0, container.scrollTop + delta - offset);
}
