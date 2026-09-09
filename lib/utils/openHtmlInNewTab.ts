/**
 * 把一段 HTML 用 Blob URL 在新标签页打开。
 * Artifact 浮窗、消息内卡片、消息内联 HtmlRenderer 共用，不要再复制 Blob 这段。
 */
export function openHtmlInNewTab(html: string, revokeMs = 60_000): void {
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), revokeMs);
}
