/**
 * 只允许 http(s) 外链进入 href / iframe src / window.open。
 * 其余 scheme（javascript:、data:text/html、file: 等）一律视为「没有链接」，
 * 防止 AI 输出、搜索结果或 localStorage 里的脏数据变成可点击/可加载的 XSS 入口。
 */
export function safeHttpUrl(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : "";
}

/**
 * 图片类的「打开/下载」回退：允许 http(s)、blob: 与 data:image/*，
 * 其余 scheme（javascript: 等）返回空串。window.open 对 javascript:
 * URL 会让脚本带着本站源跑起来，必须在这里拦住。
 */
export function safeImageSrc(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  return /^(https?:|blob:|data:image\/)/i.test(trimmed) ? trimmed : "";
}
