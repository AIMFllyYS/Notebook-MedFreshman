"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, RectangleHorizontal } from "lucide-react";
import DocumentWorkspace, { type DocumentOutlineItem } from "@/components/window/DocumentWorkspace";

type PdfjsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
type PdfDocumentProxy = Awaited<ReturnType<PdfjsModule["getDocument"]>["promise"]>;
type PdfOutlineNode = Awaited<ReturnType<PdfDocumentProxy["getOutline"]>> extends Array<infer T> | null ? T : never;

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
  return pdfjs;
}

async function sourceToData(src: string): Promise<Uint8Array | { url: string }> {
  if (src.startsWith("blob:") || src.startsWith("http://") || src.startsWith("https://")) {
    return { url: src };
  }
  if (src.startsWith("data:")) {
    const response = await fetch(src);
    return new Uint8Array(await response.arrayBuffer());
  }
  throw new Error("无法读取该 PDF");
}

function flattenOutline(
  nodes: PdfOutlineNode[] | null | undefined,
  pdf: PdfDocumentProxy,
): Promise<DocumentOutlineItem[]> {
  async function walk(items: PdfOutlineNode[], acc: DocumentOutlineItem[]): Promise<void> {
    for (const item of items) {
      let page = 1;
      try {
        const dest = typeof item.dest === "string" ? await pdf.getDestination(item.dest) : Array.isArray(item.dest) ? item.dest : null;
        if (dest?.[0]) page = (await pdf.getPageIndex(dest[0])) + 1;
      } catch {
        page = acc.length + 1;
      }
      acc.push({
        id: String(page),
        title: (item.title || `第 ${page} 页`).trim() || `第 ${page} 页`,
        meta: `第 ${page} 页`,
      });
      if (item.items?.length) await walk(item.items as PdfOutlineNode[], acc);
    }
  }
  if (!nodes?.length) {
    return Promise.resolve(
      Array.from({ length: pdf.numPages }, (_, index) => ({
        id: String(index + 1),
        title: `第 ${index + 1} 页`,
      })),
    );
  }
  const acc: DocumentOutlineItem[] = [];
  return walk(nodes, acc).then(() => (acc.length ? acc : flattenOutline(null, pdf)));
}

export default function PdfDocumentPane({ src, name }: { src: string; name: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [scale, setScale] = useState(1.15);
  const [outline, setOutline] = useState<DocumentOutlineItem[]>([]);
  const pdfRef = useRef<PdfDocumentProxy | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    void (async () => {
      try {
        const pdfjs = await loadPdfjs();
        const input = await sourceToData(src);
        const task = pdfjs.getDocument(
          input instanceof Uint8Array
            ? { data: input, cMapUrl: "/pdfjs/cmaps/", cMapPacked: true, standardFontDataUrl: "/pdfjs/standard_fonts/" }
            : { url: input.url, cMapUrl: "/pdfjs/cmaps/", cMapPacked: true, standardFontDataUrl: "/pdfjs/standard_fonts/" },
        );
        const pdf = await task.promise;
        if (cancelled) {
          await pdf.destroy();
          return;
        }
        pdfRef.current?.destroy().catch(() => {});
        pdfRef.current = pdf;
        setPageCount(pdf.numPages);
        setPage(1);
        setOutline(await flattenOutline(await pdf.getOutline(), pdf));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "无法打开 PDF");
      }
    })();
    return () => {
      cancelled = true;
      pdfRef.current?.destroy().catch(() => {});
      pdfRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas || error) return;
    let cancelled = false;
    void (async () => {
      const pdfPage = await pdf.getPage(page);
      if (cancelled) return;
      const viewport = pdfPage.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      await pdfPage.render({ canvasContext: ctx, canvas, viewport }).promise;
    })();
    return () => {
      cancelled = true;
    };
  }, [page, scale, error, outline]);

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-[13px] font-semibold text-[var(--ink)]">无法渲染 PDF</p>
        <p className="max-w-sm text-[12px] leading-6 text-[var(--ink-soft)]">{error}</p>
      </div>
    );
  }

  return (
    <DocumentWorkspace
      outline={outline}
      activeId={String(page)}
      onSelect={(id) => setPage(Number(id) || 1)}
      outlineLabel={`${name} 目录`}
      toolbar={
        <>
          <button type="button" data-no-drag title="上一页" onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft size={13} />
          </button>
          <span>
            {page} / {pageCount}
          </span>
          <button type="button" data-no-drag title="下一页" onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
            <ChevronRight size={13} />
          </button>
          <span className="mx-1 h-3 w-px bg-[var(--line)]" />
          <button type="button" data-no-drag title="缩小" onClick={() => setScale((s) => Math.max(0.5, Number((s - 0.15).toFixed(2))))}>
            −
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button type="button" data-no-drag title="放大" onClick={() => setScale((s) => Math.min(2.5, Number((s + 0.15).toFixed(2))))}>
            +
          </button>
          <button type="button" data-no-drag title="适应宽度" onClick={() => setScale(1)}>
            <RectangleHorizontal size={13} />
          </button>
        </>
      }
    >
      <div className="flex min-h-full justify-center p-4">
        <canvas ref={canvasRef} className="document-workspace-paper max-w-full" />
      </div>
    </DocumentWorkspace>
  );
}
