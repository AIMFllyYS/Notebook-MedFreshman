"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { ExternalLink, Loader2, RotateCw, ShieldAlert } from "lucide-react";

export interface WebviewEl extends HTMLElement {
  loadURL(url: string): Promise<void>;
  reload(): void;
  goBack(): void;
  goForward(): void;
  getURL(): string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Webview: any = "webview";

/**
 * Electron &lt;webview&gt;：绝对铺满，避免默认 display 塌成 0 高白屏。
 * 源预览 / 来源右栏 / 右侧浏览器共用同一分区 persist:browser。
 */
export default function WebviewSite({
  url,
  nonce = 0,
  webviewRef,
  onUrlChange,
}: {
  url: string;
  nonce?: number;
  webviewRef?: MutableRefObject<WebviewEl | null>;
  onUrlChange?: (url: string) => void;
}) {
  const localRef = useRef<WebviewEl | null>(null);
  const [initialUrl] = useState(() => url);
  const lastLoaded = useRef(url);
  const firstNonce = useRef(nonce);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const wv = localRef.current;
    if (!wv) return;
    const onNav = (event: Event) => {
      const next = (event as unknown as { url?: string }).url || wv.getURL?.();
      if (next) onUrlChange?.(next);
    };
    const onStart = () => {
      setError(null);
      setLoading(true);
    };
    const onStop = () => setLoading(false);
    const onReady = () => {
      setLoading(false);
      try {
        const current = wv.getURL?.();
        if ((!current || current === "about:blank") && initialUrl) wv.loadURL(initialUrl).catch(() => {});
      } catch {
        /* ignore */
      }
    };
    const onFail = (event: Event) => {
      const detail = event as unknown as { errorCode?: number; errorDescription?: string; isMainFrame?: boolean };
      if (detail.isMainFrame && detail.errorCode !== -3) {
        setError(`${detail.errorDescription || "加载失败"}（${detail.errorCode}）`);
        setLoading(false);
      }
    };
    const onGone = () => {
      setError("页面渲染进程已退出，请重试。");
      setLoading(false);
    };

    wv.addEventListener("did-navigate", onNav);
    wv.addEventListener("did-navigate-in-page", onNav);
    wv.addEventListener("did-start-loading", onStart);
    wv.addEventListener("did-stop-loading", onStop);
    wv.addEventListener("dom-ready", onReady);
    wv.addEventListener("did-fail-load", onFail);
    wv.addEventListener("render-process-gone", onGone);
    return () => {
      wv.removeEventListener("did-navigate", onNav);
      wv.removeEventListener("did-navigate-in-page", onNav);
      wv.removeEventListener("did-start-loading", onStart);
      wv.removeEventListener("did-stop-loading", onStop);
      wv.removeEventListener("dom-ready", onReady);
      wv.removeEventListener("did-fail-load", onFail);
      wv.removeEventListener("render-process-gone", onGone);
    };
  }, [initialUrl, onUrlChange]);

  useEffect(() => {
    const wv = localRef.current;
    if (wv && url && url !== lastLoaded.current) {
      lastLoaded.current = url;
      setError(null);
      wv.loadURL(url).catch(() => {});
    }
  }, [url]);

  useEffect(() => {
    if (nonce === firstNonce.current) return;
    firstNonce.current = nonce;
    setError(null);
    localRef.current?.reload();
  }, [nonce]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <Webview
        ref={(node: WebviewEl | null) => {
          localRef.current = node;
          if (webviewRef) webviewRef.current = node;
        }}
        src={initialUrl}
        partition="persist:browser"
        allowpopups="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "flex", border: 0 }}
      />
      {loading && !error ? (
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-[var(--bg-panel)] px-2.5 py-1 text-[11px] text-[var(--ink-soft)] shadow">
          <Loader2 size={12} className="animate-spin" /> 加载中…
        </div>
      ) : null}
      {error ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[var(--bg-panel)] px-6 text-center">
          <ShieldAlert size={26} className="text-[var(--ink-soft)]" />
          <p className="text-[14px] font-semibold text-[var(--ink)]">页面加载失败</p>
          <p className="max-w-[300px] text-[12px] leading-relaxed text-[var(--ink-soft)]">{error}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setLoading(true);
                localRef.current?.reload();
              }}
              className="press inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--md-sys-color-on-primary)]"
            >
              <RotateCw size={13} /> 重试
            </button>
            <a
              href={url || undefined}
              target="_blank"
              rel="noreferrer"
              className="press inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3.5 py-1.5 text-[12.5px] text-[var(--ink-soft)]"
            >
              <ExternalLink size={13} /> 系统浏览器打开
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
