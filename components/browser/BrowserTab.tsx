"use client";

import { useEffect, useState } from "react";
import { Home, RotateCw, ArrowRight, ExternalLink, Globe, Compass } from "lucide-react";
import { useBrowser, normalizeUrl } from "@/lib/hooks/useBrowser";

/** 右侧面板内置浏览器：地址栏 + iframe。本地使用，仅做基础 sandbox 安全。 */
export default function BrowserTab() {
  const currentUrl = useBrowser((s) => s.currentUrl);
  const reloadNonce = useBrowser((s) => s.reloadNonce);
  const bookmarks = useBrowser((s) => s.bookmarks);
  const navigate = useBrowser((s) => s.navigate);
  const reload = useBrowser((s) => s.reload);
  const goHome = useBrowser((s) => s.goHome);

  const [addr, setAddr] = useState(currentUrl);
  useEffect(() => setAddr(currentUrl), [currentUrl]);

  const go = () => {
    if (addr.trim()) navigate(addr);
  };

  return (
    <div className="flex h-full flex-col bg-[var(--bg-panel)]">
      {/* 工具栏 */}
      <div className="flex shrink-0 items-center gap-1 border-b border-[var(--line)] px-2 py-1.5">
        <button
          onClick={goHome}
          title="主页"
          className="press flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
        >
          <Home size={15} />
        </button>
        <button
          onClick={reload}
          title="刷新"
          disabled={!currentUrl}
          className="press flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)] disabled:opacity-40"
        >
          <RotateCw size={15} />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-2.5 py-1.5 focus-within:border-[var(--accent)]">
          <Globe size={13} className="shrink-0 text-[var(--ink-faint)]" />
          <input
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") go();
            }}
            placeholder="输入网址或搜索内容…"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
          />
        </div>
        <button
          onClick={go}
          title="访问"
          className="press flex h-8 w-8 items-center justify-center rounded-lg text-[var(--accent-ink)] hover:bg-[var(--accent-weak)]"
        >
          <ArrowRight size={15} />
        </button>
        <a
          href={currentUrl || undefined}
          target="_blank"
          rel="noreferrer"
          title="在新标签页打开（适用于禁止内嵌的站点）"
          className="press flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)] aria-disabled:opacity-40"
          aria-disabled={!currentUrl}
          onClick={(e) => {
            if (!currentUrl) e.preventDefault();
          }}
        >
          <ExternalLink size={15} />
        </a>
      </div>

      {/* 内容区 */}
      <div className="min-h-0 flex-1">
        {currentUrl ? (
          <iframe
            key={`${currentUrl}:${reloadNonce}`}
            src={currentUrl}
            title="内置浏览器"
            className="h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads allow-modals"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-read; clipboard-write"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <StartPage bookmarks={bookmarks} onOpen={navigate} />
        )}
      </div>
    </div>
  );
}

function StartPage({
  bookmarks,
  onOpen,
}: {
  bookmarks: { id: string; name: string; url: string }[];
  onOpen: (url: string) => void;
}) {
  return (
    <div className="flex h-full flex-col items-center overflow-y-auto px-6 py-10 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-weak)] text-[var(--accent-ink)]">
        <Compass size={28} />
      </div>
      <p className="text-[15px] font-semibold text-[var(--ink)]">内置浏览器</p>
      <p className="mt-1 max-w-[280px] text-[12px] leading-relaxed text-[var(--ink-soft)]">
        在上方地址栏输入网址即可访问；可用右上角「＋」收藏常用站点为标签。B 站视频链接会自动转为可内嵌的播放器。
      </p>

      {bookmarks.length > 0 && (
        <div className="mt-6 grid w-full max-w-[320px] grid-cols-2 gap-2">
          {bookmarks.map((bm) => (
            <button
              key={bm.id}
              onClick={() => onOpen(bm.url)}
              className="press flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2.5 text-left hover:border-[var(--accent)]"
            >
              <Globe size={15} className="shrink-0 text-[var(--accent-ink)]" />
              <span className="truncate text-[12.5px] font-medium text-[var(--ink)]">{bm.name}</span>
            </button>
          ))}
        </div>
      )}

      <p className="mt-6 max-w-[280px] text-[11px] leading-relaxed text-[var(--ink-faint)]">
        提示：部分站点（如各家 AI、登录后页面）会禁止被内嵌，若页面空白请用工具栏「在新标签页打开」。
      </p>
    </div>
  );
}
