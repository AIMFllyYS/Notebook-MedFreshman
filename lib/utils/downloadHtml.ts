/**
 * 把一段 HTML 字符串触发为浏览器下载，让用户把 AI 生成的 HTML 存成本地 `.html` 自用。
 *
 * 在父级（应用上下文）执行，与 iframe sandbox 无关，故始终可用。文件名按标题清洗文件系统非法字符。
 */
export function downloadHtmlFile(html: string, title?: string) {
  const safe =
    (title || 'demo')
      .replace(/[\\/:*?"<>|]+/g, '_') // 文件系统非法字符
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 60) || 'demo';
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safe}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default downloadHtmlFile;
