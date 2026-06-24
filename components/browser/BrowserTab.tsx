"use client";

import { useEffect, useRef, useState } from "react";
import { Home, RotateCw, ArrowRight, ArrowLeft, ExternalLink, Globe, Search, Smartphone, Monitor, ShieldAlert, Loader2 } from "lucide-react";
import { useBrowser, MOBILE_LOGICAL_WIDTH, type ViewMode } from "@/lib/hooks/useBrowser";

/** 可嵌入预检结果缓存（url → 是否允许内嵌），避免重复探测。 */
const embedCache = new Map<string, boolean>();

/** Electron <webview> 元素的运行时方法（注入式，非标准 DOM）。 */
interface WebviewEl extends HTMLElement {
  loadURL(url: string): Promise<void>;
  reload(): void;
  goBack(): void;
  goForward(): void;
  getURL(): string;
}
// <webview> 是 Electron 注入的自定义元素，非标准 JSX；以字符串 host 元素形式渲染，旁路类型检查。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Webview: any = "webview";

/** 右侧面板内置浏览器：地址栏 + 自适应（手机视口模拟）iframe。本地使用，仅做基础 sandbox 安全。 */
export default function BrowserTab() {
  const currentUrl = useBrowser((s) => s.currentUrl);
  const reloadNonce = useBrowser((s) => s.reloadNonce);
  const viewMode = useBrowser((s) => s.viewMode);
  const navigate = useBrowser((s) => s.navigate);
  const reload = useBrowser((s) => s.reload);
  const goHome = useBrowser((s) => s.goHome);
  const setViewMode = useBrowser((s) => s.setViewMode);

  const [addr, setAddr] = useState(currentUrl);
  useEffect(() => setAddr(currentUrl), [currentUrl]);

  // 桌面端（Electron）→ 用真实 <webview> 跑全站；网页/开发态 → 维持 iframe + 可嵌入预检。
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    setIsDesktop(
      typeof window !== "undefined" &&
        !!(window as unknown as { desktop?: { isElectron?: boolean } }).desktop?.isElectron,
    );
  }, []);
  const webviewRef = useRef<WebviewEl | null>(null);

  // 可嵌入预检：乐观渲染 iframe，同时探测响应头；判为不可内嵌则切到提示面板。
  const [blocked, setBlocked] = useState(false);
  const [forced, setForced] = useState<string | null>(null);
  useEffect(() => {
    if (!currentUrl || forced === currentUrl) {
      setBlocked(false);
      return;
    }
    const cached = embedCache.get(currentUrl);
    if (cached !== undefined) {
      setBlocked(!cached);
      return;
    }
    setBlocked(false); // 乐观：先按可嵌入渲染
    let alive = true;
    fetch(`/api/can-embed?url=${encodeURIComponent(currentUrl)}`)
      .then((r) => r.json())
      .then((d) => {
        const ok = d?.embeddable !== false;
        embedCache.set(currentUrl, ok);
        if (alive && forced !== currentUrl) setBlocked(!ok);
      })
      .catch(() => {
        /* 探测失败不阻断 */
      });
    return () => {
      alive = false;
    };
  }, [currentUrl, forced]);

  const go = () => {
    if (addr.trim()) navigate(addr);
  };

  const toggleView = () => setViewMode(viewMode === "mobile" ? "desktop" : "mobile");

  return (
    <div className="flex h-full flex-col bg-[var(--bg-panel)]">
      {/* 工具栏 */}
      <div className="flex shrink-0 items-center gap-1 border-b border-[var(--line)] px-2 py-1.5">
        <button
          onClick={goHome}
          title="主页 / 必应搜索"
          className="press flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
        >
          <Home size={15} />
        </button>
        {isDesktop && (
          <>
            <button
              onClick={() => webviewRef.current?.goBack()}
              title="后退"
              disabled={!currentUrl}
              className="press flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)] disabled:opacity-40"
            >
              <ArrowLeft size={15} />
            </button>
            <button
              onClick={() => webviewRef.current?.goForward()}
              title="前进"
              disabled={!currentUrl}
              className="press flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)] disabled:opacity-40"
            >
              <ArrowRight size={15} />
            </button>
          </>
        )}
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
        <button
          onClick={toggleView}
          title={viewMode === "mobile" ? "当前：手机视图（点击切桌面）" : "当前：桌面视图（点击切手机）"}
          className="press flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
        >
          {viewMode === "mobile" ? <Smartphone size={15} /> : <Monitor size={15} />}
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
          isDesktop ? (
            <WebviewSite
              url={currentUrl}
              nonce={reloadNonce}
              webviewRef={webviewRef}
              onUrlChange={setAddr}
            />
          ) : blocked ? (
            <EmbedBlocked url={currentUrl} onForce={() => setForced(currentUrl)} />
          ) : (
            <FramedSite url={currentUrl} nonce={reloadNonce} viewMode={viewMode} />
          )
        ) : (
          <BingStartPage onSearch={navigate} />
        )}
      </div>
    </div>
  );
}

/**
 * 自适应 iframe：手机视图下以固定逻辑视口宽（414px）渲染，再 transform 缩放贴合面板宽，
 * 让所有站点都拿到"手机视口"并完整放进右侧窄面板（无横向溢出）；桌面视图按面板原宽 1:1。
 */
function FramedSite({ url, nonce, viewMode }: { url: string; nonce: number; viewMode: ViewMode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const logicalW = viewMode === "mobile" ? MOBILE_LOGICAL_WIDTH : size.w;
  const scale = size.w > 0 && logicalW > 0 ? size.w / logicalW : 1;
  const logicalH = scale > 0 ? size.h / scale : size.h;

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-white">
      {size.w > 0 && (
        <iframe
          key={`${url}:${nonce}:${viewMode}`}
          src={url}
          title="内置浏览器"
          style={{
            width: logicalW,
            height: logicalH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            border: 0,
          }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads allow-modals"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-read; clipboard-write"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
    </div>
  );
}

/**
 * 桌面端真实浏览器：内嵌 Electron <webview>（真·Chromium，持久分区保留登录态/Cookie）。
 * 无 can-embed 限制、无 sandbox —— 几乎可打开所有站点（含需登录的 DeepSeek/Claude 等）。
 * 导航沿用 useBrowser store：currentUrl 变化→loadURL，reloadNonce 变化→reload；
 * 内部跳转经 did-navigate 同步回地址栏。前进/后退由工具栏经 webviewRef 调用。
 */
function WebviewSite({
  url,
  nonce,
  webviewRef,
  onUrlChange,
}: {
  url: string;
  nonce: number;
  webviewRef: React.MutableRefObject<WebviewEl | null>;
  onUrlChange: (u: string) => void;
}) {
  const localRef = useRef<WebviewEl | null>(null);
  const [initialUrl] = useState(() => url); // 定格挂载时地址作为初始 src
  const lastLoaded = useRef(url);
  const firstNonce = useRef(nonce);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 事件监听：地址同步 + 加载态 + 失败兜底（把"白屏"变成可读错误，便于定位）。
  useEffect(() => {
    const wv = localRef.current;
    if (!wv) return;
    const onNav = (e: Event) => {
      const u = (e as unknown as { url?: string }).url || wv.getURL?.();
      if (u) onUrlChange(u);
    };
    const onStart = () => { setError(null); setLoading(true); };
    const onStop = () => setLoading(false);
    const onReady = () => {
      setLoading(false);
      // 兜底：若 src 属性未触发导航（自定义元素属性/属性时序问题），dom-ready 后主动 loadURL。
      try {
        const cur = wv.getURL?.();
        if ((!cur || cur === "about:blank") && initialUrl) wv.loadURL(initialUrl).catch(() => {});
      } catch { /* ignore */ }
    };
    const onFail = (e: Event) => {
      const ev = e as unknown as { errorCode?: number; errorDescription?: string; isMainFrame?: boolean };
      // -3 = ERR_ABORTED（重定向/主动取消）忽略；仅主框架失败才提示。
      if (ev.isMainFrame && ev.errorCode !== -3) {
        setError(`${ev.errorDescription || "加载失败"}（${ev.errorCode}）`);
        setLoading(false);
      }
    };
    const onGone = () => { setError("页面渲染进程已退出，请重试。"); setLoading(false); };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 书签/标签/主页/地址栏访问 → store.currentUrl 变化 → loadURL。
  useEffect(() => {
    const wv = localRef.current;
    if (wv && url && url !== lastLoaded.current) {
      lastLoaded.current = url;
      setError(null);
      wv.loadURL(url).catch(() => {});
    }
  }, [url]);

  // 刷新按钮 → reloadNonce 变化 → reload 当前页面。
  useEffect(() => {
    if (nonce === firstNonce.current) return;
    firstNonce.current = nonce;
    setError(null);
    localRef.current?.reload();
  }, [nonce]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <Webview
        ref={(n: WebviewEl | null) => {
          localRef.current = n;
          webviewRef.current = n;
        }}
        src={initialUrl}
        partition="persist:browser"
        allowpopups="true"
        // 绝对铺满 + display:flex，规避 <webview> 默认 display 导致塌成 0 高的白屏。
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "flex", border: 0 }}
      />
      {loading && !error && (
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-[var(--bg-panel)] px-2.5 py-1 text-[11px] text-[var(--ink-soft)] shadow">
          <Loader2 size={12} className="animate-spin" /> 加载中…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[var(--bg-panel)] px-6 text-center">
          <ShieldAlert size={26} className="text-[var(--ink-soft)]" />
          <p className="text-[14px] font-semibold text-[var(--ink)]">页面加载失败</p>
          <p className="max-w-[300px] text-[12px] leading-relaxed text-[var(--ink-soft)]">{error}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setError(null); setLoading(true); localRef.current?.reload(); }}
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
      )}
    </div>
  );
}

/** 必应搜索起始页（浏览器标签的默认页）：本地深色搜索框 → 走 bing.com/search 结果页（可内嵌）。 */
function BingStartPage({ onSearch }: { onSearch: (q: string) => void }) {
  const [q, setQ] = useState("");
  const submit = () => {
    if (q.trim()) onSearch(q.trim());
  };
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-weak)] text-[var(--accent-ink)]">
        <Search size={28} />
      </div>
      <p className="text-[17px] font-semibold tracking-tight text-[var(--ink)]">必应搜索</p>
      <p className="mt-1 text-[12px] text-[var(--ink-soft)]">搜索网页，或直接输入网址访问</p>

      <div className="mt-5 flex w-full max-w-[360px] items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--bg-muted)] px-4 py-2.5 focus-within:border-[var(--accent)]">
        <Search size={15} className="shrink-0 text-[var(--ink-faint)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          autoFocus
          placeholder="搜索内容或网址…"
          className="min-w-0 flex-1 bg-transparent text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
        />
        <button
          onClick={submit}
          disabled={!q.trim()}
          title="搜索"
          className="press flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--md-sys-color-on-primary)] disabled:opacity-40"
        >
          <ArrowRight size={15} />
        </button>
      </div>

      <p className="mt-6 max-w-[300px] text-[11px] leading-relaxed text-[var(--ink-faint)]">
        常用站点（如 B 站）已固定在上方标签栏，点击即可切换；用右上角「＋」可新增固定标签。
      </p>
    </div>
  );
}

/** 站点禁止被内嵌时的提示面板（替代困惑的空白页），主推「在新标签打开」。 */
function EmbedBlocked({ url, onForce }: { url: string; onForce: () => void }) {
  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    /* 保持原串 */
  }
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-muted)] text-[var(--ink-soft)]">
        <ShieldAlert size={28} />
      </div>
      <p className="text-[15px] font-semibold text-[var(--ink)]">该站点禁止被内嵌</p>
      <p className="mt-1 max-w-[300px] text-[12px] leading-relaxed text-[var(--ink-soft)]">
        <span className="font-medium text-[var(--ink)]">{host}</span>{" "}
        通过 X-Frame-Options / CSP 拒绝在内置浏览器中显示，这是站点侧的安全策略，无法绕过。请在新标签页打开。
      </p>

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="press mt-5 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-[var(--md-sys-color-on-primary)]"
      >
        <ExternalLink size={15} /> 在新标签页打开
      </a>

      <button
        onClick={onForce}
        className="press mt-3 text-[11.5px] text-[var(--ink-faint)] underline-offset-2 hover:underline"
      >
        仍要尝试内嵌（可能显示空白）
      </button>
    </div>
  );
}
