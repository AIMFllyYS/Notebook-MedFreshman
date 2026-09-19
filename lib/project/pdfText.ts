"use client";

/**
 * 从 PDF 里抽纯文本（项目文件的「本地基础解析」用）。
 * 复用 PdfDocumentPane 那套 pdfjs 加载方式（同一份 worker 资源，避免两处路径不一致）。
 * 只取文本层：不做 OCR，扫描件会返回很少文字——这是已知边界，UI 里会提示字数。
 */
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({
    data,
    cMapUrl: "/pdfjs/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "/pdfjs/standard_fonts/",
  });
  const pdf = await task.promise;
  try {
    const pages: string[] = [];
    for (let page = 1; page <= pdf.numPages; page += 1) {
      const proxy = await pdf.getPage(page);
      const content = await proxy.getTextContent();
      const text = content.items
        .map((item) => ("str" in item && typeof item.str === "string" ? item.str : ""))
        .join(" ")
        .replace(/[ \t]+/g, " ")
        .trim();
      pages.push(`## 第 ${page} 页\n\n${text || "（这一页没有文本层）"}`);
    }
    return pages.join("\n\n");
  } finally {
    await pdf.destroy().catch(() => {});
  }
}