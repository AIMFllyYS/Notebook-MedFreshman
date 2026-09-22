// 文档导出工具：目前只交付 Markdown 下载。

export function downloadAsMarkdown(markdown: string, title: string): void {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[<>:"/\\|?*\s]+/g, "_")}.md`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
