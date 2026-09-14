"use client";

import { useEffect, useRef, useState } from "react";

export default function DocxDocumentPane({ src, name }: { src: string; name: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    host.replaceChildren();
    setError(null);
    void (async () => {
      try {
        const { renderAsync } = await import("docx-preview");
        const response = await fetch(src);
        const blob = await response.blob();
        if (cancelled) return;
        await renderAsync(blob, host, undefined, {
          className: "docx-preview",
          inWrapper: true,
          ignoreWidth: false,
          breakPages: true,
        });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : `无法打开 ${name}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [name, src]);

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-[13px] font-semibold text-[var(--ink)]">无法渲染 Word</p>
        <p className="max-w-sm text-[12px] leading-6 text-[var(--ink-soft)]">{error}</p>
      </div>
    );
  }

  return <div ref={hostRef} className="docx-preview-host h-full min-h-0 overflow-auto bg-[var(--bg-muted)] p-4" />;
}
