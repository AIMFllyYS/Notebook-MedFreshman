"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Command, Search, X } from "lucide-react";
import { contentTree } from "@/lib/content-data";
import { buildGlobalSearchIndex, searchGlobalIndex } from "@/lib/search/globalSearch";

const SEARCH_LIMIT = 32;

export default function GlobalSearchButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const index = useMemo(() => buildGlobalSearchIndex(contentTree), []);
  const results = useMemo(
    () => searchGlobalIndex(index, deferredQuery, SEARCH_LIMIT),
    [deferredQuery, index],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const openResult = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="全局搜索 Ctrl+K"
        className="group relative flex h-8 min-w-0 items-center gap-2 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--line)_76%,var(--md-sys-color-primary)_24%)] bg-[linear-gradient(120deg,color-mix(in_srgb,var(--bg-elevated)_92%,var(--md-sys-color-primary)_8%),var(--bg-panel))] px-3 text-[13px] text-[var(--ink-soft)] shadow-sm transition-colors hover:border-[var(--md-sys-color-primary)] hover:text-[var(--ink)]"
      >
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.18),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
        <Search size={15} className="relative shrink-0" />
        <span className="relative hidden max-w-28 truncate lg:inline">全局搜索</span>
        <span className="relative hidden items-center gap-0.5 rounded-md border border-[var(--line)] px-1.5 py-0.5 text-[10px] text-[var(--ink-faint)] xl:flex">
          <Command size={10} /> K
        </span>
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[10000] bg-black/20 backdrop-blur-[2px]" onPointerDown={() => setOpen(false)}>
          <div
            className="mx-auto mt-[12vh] w-[min(720px,calc(100vw-28px))] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] shadow-2xl"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
              <Search size={18} className="shrink-0 text-[var(--md-sys-color-primary)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索课程、章节、录音、摘要..."
                className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="关闭"
                className="grid h-7 w-7 place-items-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[58vh] overflow-y-auto p-2">
              {deferredQuery.trim() ? (
                results.length > 0 ? (
                  results.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => openResult(result.href)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[var(--bg-muted)]"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)]">
                        <Search size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-[var(--ink)]">
                          {result.itemId} {result.title}
                        </span>
                        <span className="block truncate text-[12px] text-[var(--ink-faint)]">
                          {result.breadcrumbs || `${result.subjectName} / ${result.categoryName}`}
                        </span>
                        {result.summary && (
                          <span className="mt-0.5 block truncate text-[12px] text-[var(--ink-soft)]">
                            {result.summary}
                          </span>
                        )}
                      </span>
                      <ArrowUpRight size={14} className="shrink-0 text-[var(--ink-faint)]" />
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-10 text-center text-[13px] text-[var(--ink-faint)]">
                    没有匹配结果
                  </div>
                )
              ) : (
                <div className="px-4 py-10 text-center text-[13px] text-[var(--ink-faint)]">
                  输入关键词、章节编号或课程名开始搜索
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
