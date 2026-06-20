"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, Star, Home, Globe } from "lucide-react";
import { useBrowser } from "@/lib/hooks/useBrowser";

/** 右侧 Tab 栏最右的「＋」功能按钮：新增收藏网址（生成固定 Tab）、管理收藏、设置主页。 */
export default function BrowserSettingsButton({ onAdded }: { onAdded?: () => void }) {
  const bookmarks = useBrowser((s) => s.bookmarks);
  const addBookmark = useBrowser((s) => s.addBookmark);
  const removeBookmark = useBrowser((s) => s.removeBookmark);
  const homeUrl = useBrowser((s) => s.homeUrl);
  const setHomeUrl = useBrowser((s) => s.setHomeUrl);
  const openBookmark = useBrowser((s) => s.openBookmark);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [home, setHome] = useState(homeUrl);

  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => setHome(homeUrl), [homeUrl]);

  // 定位（按钮下方右对齐）
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const width = 280;
    let left = r.right - width;
    if (left < 8) left = 8;
    setPos({ top: r.bottom + 6, left });
  }, [open]);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        btnRef.current?.contains(e.target as Node) ||
        popRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const submit = () => {
    if (!url.trim()) return;
    const id = addBookmark(name, url);
    if (id) {
      openBookmark(id);
      setName("");
      setUrl("");
      setOpen(false);
      onAdded?.();
    }
  };

  const inputCls =
    "w-full rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-2.5 py-1.5 text-[12.5px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)]";

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        title="收藏 / 浏览器设置"
        className="press flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
      >
        <Plus size={16} />
      </button>

      {open &&
        createPortal(
          <div
            ref={popRef}
            style={{ top: pos.top, left: pos.left, width: 280 }}
            className="fixed z-[9999] rounded-xl border border-[var(--line)] bg-[var(--bg-panel)] p-3 shadow-lg animate-[dropdown-in_0.15s_ease-out]"
          >
            {/* 新增收藏 */}
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
              <Star size={12} /> 新增收藏网址
            </div>
            <div className="flex flex-col gap-1.5">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="名称（可选）"
                className={inputCls}
              />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="https://…"
                className={inputCls}
              />
              <button
                onClick={submit}
                disabled={!url.trim()}
                className="press rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--md-sys-color-on-primary)] disabled:opacity-40"
              >
                添加为标签
              </button>
            </div>

            {/* 收藏管理 */}
            {bookmarks.length > 0 && (
              <div className="mt-3 border-t border-[var(--line)] pt-2">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
                  我的收藏
                </div>
                <div className="flex max-h-[160px] flex-col gap-0.5 overflow-y-auto">
                  {bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--bg-muted)]"
                    >
                      <Globe size={13} className="shrink-0 text-[var(--ink-faint)]" />
                      <button
                        onClick={() => {
                          openBookmark(bm.id);
                          setOpen(false);
                          onAdded?.();
                        }}
                        className="min-w-0 flex-1 truncate text-left text-[12.5px] text-[var(--ink)]"
                        title={bm.url}
                      >
                        {bm.name}
                      </button>
                      <button
                        onClick={() => removeBookmark(bm.id)}
                        title="删除"
                        className="shrink-0 rounded p-1 text-[var(--ink-faint)] opacity-0 transition-opacity hover:text-[var(--md-sys-color-error)] group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 主页设置 */}
            <div className="mt-3 border-t border-[var(--line)] pt-2">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
                <Home size={12} /> 主页
              </div>
              <div className="flex gap-1.5">
                <input
                  value={home}
                  onChange={(e) => setHome(e.target.value)}
                  placeholder="留空则显示起始页"
                  className={inputCls}
                />
                <button
                  onClick={() => setHomeUrl(home)}
                  className="press shrink-0 rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-[12px] text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
                >
                  保存
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
