"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Presentation } from "lucide-react";
import DocumentWorkspace from "@/components/window/DocumentWorkspace";
import { parsePptxSlideBytes, type PptxSlideText } from "@/lib/chat/parsePptx";

const SLIDE_WIDTH = 960;
const SLIDE_HEIGHT = 540;

async function sourceToBuffer(src: string): Promise<ArrayBuffer> {
  if (src.startsWith("data:")) {
    const encoded = src.slice(src.indexOf(",") + 1);
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return bytes.buffer;
  }
  if (src.startsWith("blob:") || src.startsWith("http://") || src.startsWith("https://")) {
    const response = await fetch(src);
    return response.arrayBuffer();
  }
  throw new Error("无法读取该 PPTX");
}

function fitSlide(stage: HTMLElement, scaler: HTMLElement, host: HTMLElement) {
  const pad = 16;
  const availW = Math.max(160, stage.clientWidth - pad);
  const availH = Math.max(90, stage.clientHeight - pad);
  const scale = Math.min(availW / SLIDE_WIDTH, availH / SLIDE_HEIGHT);
  if (!Number.isFinite(scale) || scale <= 0) return;
  scaler.style.width = `${SLIDE_WIDTH * scale}px`;
  scaler.style.height = `${SLIDE_HEIGHT * scale}px`;
  host.style.width = `${SLIDE_WIDTH}px`;
  host.style.height = `${SLIDE_HEIGHT}px`;
  host.style.transform = `scale(${scale})`;
  host.style.transformOrigin = "top left";
}

export default function PptxDocumentPane({ src, name }: { src: string; name: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const scalerRef = useRef<HTMLDivElement | null>(null);
  const previewerRef = useRef<{
    slideCount: number;
    renderSingleSlide: (index: number) => void;
    destroy: () => void;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<PptxSlideText[] | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [visual, setVisual] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setVisual(false);
    previewerRef.current?.destroy();
    previewerRef.current = null;
    if (hostRef.current) hostRef.current.replaceChildren();

    void (async () => {
      const host = hostRef.current;
      if (!host) return;
      let titles: PptxSlideText[] = [];
      try {
        const buffer = await sourceToBuffer(src);
        try {
          titles = parsePptxSlideBytes(new Uint8Array(buffer));
        } catch {
          titles = [];
        }
        if (!cancelled) setSlides(titles.length ? titles : null);
        const { init } = await import("pptx-preview");
        if (cancelled) return;
        const previewer = init(host, { width: SLIDE_WIDTH, height: SLIDE_HEIGHT, mode: "slide" });
        await previewer.preview(buffer);
        if (cancelled) {
          previewer.destroy();
          return;
        }
        previewerRef.current = previewer;
        const count = Math.max(previewer.slideCount || titles.length || 1, 1);
        setPageCount(count);
        setPage(1);
        host.querySelectorAll("button").forEach((button) => {
          button.style.display = "none";
        });
        setVisual(true);
      } catch (err) {
        if (!cancelled) {
          setVisual(false);
          if (!titles.length) setError(err instanceof Error ? err.message : `无法打开 ${name}`);
        }
      }
    })();

    return () => {
      cancelled = true;
      previewerRef.current?.destroy();
      previewerRef.current = null;
    };
  }, [name, src]);

  useEffect(() => {
    if (!visual || !previewerRef.current) return;
    previewerRef.current.renderSingleSlide(Math.max(0, page - 1));
  }, [page, visual]);

  useLayoutEffect(() => {
    if (!visual) return;
    const stage = stageRef.current;
    const scaler = scalerRef.current;
    const host = hostRef.current;
    if (!stage || !scaler || !host) return;
    const apply = () => fitSlide(stage, scaler, host);
    apply();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(apply);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [visual, page]);

  const outline = (slides ?? Array.from({ length: pageCount }, (_, index) => ({
    number: index + 1,
    text: `幻灯片 ${index + 1}`,
  }))).map((slide) => ({
    id: String(slide.number),
    title: slide.text.slice(0, 36) || `幻灯片 ${slide.number}`,
    meta: `Slide ${slide.number}`,
  }));

  if (error && !slides?.length) {
    return (
      <div className="flex h-full min-h-52 flex-col items-center justify-center gap-3 px-6 text-center">
        <Presentation size={32} className="text-[var(--md-sys-color-primary)]" />
        <p className="text-[13px] font-semibold text-[var(--ink)]">PowerPoint 本地预览</p>
        <p className="max-w-md text-[12px] leading-6 text-[var(--ink-soft)]">{error}</p>
      </div>
    );
  }

  const current = slides?.find((slide) => slide.number === page);

  return (
    <DocumentWorkspace
      outline={outline}
      activeId={String(page)}
      onSelect={(id) => setPage(Number(id) || 1)}
      outlineLabel="幻灯片"
      resizable
      toolbar={
        <>
          <button type="button" data-no-drag title="上一页" onClick={() => setPage((value) => Math.max(1, value - 1))}>
            <ChevronLeft size={13} />
          </button>
          <span>
            {page} / {pageCount}
          </span>
          <button type="button" data-no-drag title="下一页" onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
            <ChevronRight size={13} />
          </button>
        </>
      }
    >
      <div ref={stageRef} className="pptx-stage-fit">
        <div
          ref={scalerRef}
          className="pptx-stage-scaler document-workspace-paper overflow-hidden rounded-xl"
          hidden={!visual}
        >
          <div ref={hostRef} className="pptx-visual-host" />
        </div>
        {!visual && current ? (
          <article className="document-workspace-paper min-h-52 w-full max-w-3xl rounded-xl p-6">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
              Slide {current.number}
            </div>
            <p className="whitespace-pre-wrap text-[15px] leading-7 text-[var(--ink)]">{current.text}</p>
          </article>
        ) : null}
      </div>
    </DocumentWorkspace>
  );
}
