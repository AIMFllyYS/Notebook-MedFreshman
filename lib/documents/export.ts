// 文档导出工具：Markdown 下载已提供，docx / LaTeX / PDF 为待完善的占位实现。

export function downloadAsMarkdown(markdown: string, title: string): void {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[<>:"/\\|?*\s]+/g, "_")}.md`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function downloadAsLaTeX(markdown: string, title: string): void {
  // TODO: 将 Markdown / KaTeX 转换为 LaTeX 源码后提供 .tex 下载。
  void markdown;
  void title;
}
