'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { BookOpen, Globe } from 'lucide-react';
import EmbedFallback from '@/components/browser/EmbedFallback';
import WebviewSite from '@/components/browser/WebviewSite';
import ManagedWindow from '@/components/window/ManagedWindow';
import DocumentWorkspace from '@/components/window/DocumentWorkspace';
import NoteRenderer from '@/components/notes/NoteRenderer';
import PlainTextReader from '@/components/notes/PlainTextReader';
import { SOURCE_TRACE_WINDOW_ID, sourceItemKey } from '@/lib/chat/openSourceTrace';
import type { TraceSource } from '@/lib/chat/traceSources';
import { noteBreadcrumb, noteHref, parseNotePath } from '@/lib/content/notePath';
import { useEmbeddable } from '@/lib/hooks/useEmbeddable';
import { useWindowManager } from '@/lib/hooks/useWindowManager';

type LoadState = 'idle' | 'loading' | 'done' | 'missing' | 'error';
type SectionFormat = 'markdown' | 'text' | 'html';

export default function SourceTraceViewer() {
  const windows = useWindowManager((s) => s.windows);
  const ids = windows.filter((win) => win.type === 'source-trace-viewer').map((win) => win.id);
  if (ids.length === 0) return null;
  return (
    <>
      {ids.map((id) => (
        <SourceTraceWindow key={id} windowId={id} />
      ))}
    </>
  );
}

function SourceTraceWindow({ windowId }: { windowId: string }) {
  const managed = useWindowManager((s) => s.windows.find((w) => w.id === windowId));
  const closeWindow = useWindowManager((s) => s.closeWindow);
  const updateWindow = useWindowManager((s) => s.updateWindow);
  const handleClose = useCallback(() => closeWindow(windowId), [closeWindow, windowId]);

  const sources = useMemo(() => {
    const raw = (managed?.data as { sources?: TraceSource[] } | undefined)?.sources;
    return Array.isArray(raw) ? raw : [];
  }, [managed?.data]);
  const activeKey = (managed?.data as { activeKey?: string } | undefined)?.activeKey ?? (sources[0] ? sourceItemKey(sources[0]) : '');
  const active = sources.find((source) => sourceItemKey(source) === activeKey) ?? sources[0];

  if (!managed) return null;

  return (
    <ManagedWindow
      windowId={windowId}
      title={managed.title}
      icon={active?.kind === 'web' ? <Globe size={15} /> : <BookOpen size={15} />}
      onClose={handleClose}
      fullscreenTarget="notes"
      minSize={{ minW: 520, minH: 360 }}
      className="source-trace-window"
      overlayId={windowId === SOURCE_TRACE_WINDOW_ID ? 'source-trace-viewer' : `source-trace-${windowId}`}
      externalLink={
        active?.kind === 'web'
          ? { onOpen: () => window.open(active.url, '_blank', 'noopener,noreferrer'), label: '打开原页面' }
          : active?.kind === 'note'
            ? (() => {
                const parsed = parseNotePath(active.path);
                return parsed ? { onOpen: () => { window.open(noteHref(parsed), '_blank', 'noopener'); } } : false;
              })()
            : false
      }
      bodyClassName="flex min-h-0 min-w-0 flex-1 overflow-hidden"
      unmountWhenMinimized
    >
      {sources.length === 0 ? (
        <p className="source-trace-empty">本轮没有可追踪的引用依据。</p>
      ) : (
        <DocumentWorkspace
          outlineLabel="来源目录"
          outline={sources.map((source) => ({
            id: sourceItemKey(source),
            kindLabel: source.kind === 'note' ? '笔记' : '网页',
            title: source.title,
            meta: source.kind === 'note' ? source.path : source.url,
          }))}
          activeId={sourceItemKey(active)}
          onSelect={(id) => updateWindow(windowId, { data: { sources, activeKey: id } })}
        >
          {active.kind === 'note' ? <NoteSourceStage source={active} /> : <WebSourceStage source={active} />}
        </DocumentWorkspace>
      )}
    </ManagedWindow>
  );
}

function NoteSourceStage({ source }: { source: Extract<TraceSource, { kind: 'note' }> }) {
  const cacheRef = useRef<Map<string, { content: string; format: SectionFormat }>>(new Map());
  const [status, setStatus] = useState<LoadState>('idle');
  const [content, setContent] = useState('');
  const [format, setFormat] = useState<SectionFormat>('markdown');
  const [error, setError] = useState<string | null>(null);
  const parsed = parseNotePath(source.path);
  const heading = parsed ? noteBreadcrumb(parsed, source.title) : source.title;

  useEffect(() => {
    const loc = parseNotePath(source.path);
    const cached = cacheRef.current.get(source.path);
    if (cached) {
      setContent(cached.content);
      setFormat(cached.format);
      setStatus('done');
      setError(null);
      return;
    }
    if (!loc) {
      setContent(source.snippet || '');
      setFormat('markdown');
      setStatus('missing');
      setError('无法解析笔记路径');
      return;
    }
    const controller = new AbortController();
    setStatus('loading');
    setError(null);
    const params = new URLSearchParams({
      subjectId: loc.subjectId,
      categoryId: loc.categoryId,
      itemId: loc.itemId,
    });
    fetch(`/api/section?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`读取失败 ${res.status}`);
        return res.json() as Promise<{ content?: string | null; format?: SectionFormat | null }>;
      })
      .then((data) => {
        const text = typeof data.content === 'string' ? data.content : '';
        const fmt: SectionFormat = data.format === 'text' || data.format === 'html' ? data.format : 'markdown';
        if (text.trim()) {
          cacheRef.current.set(source.path, { content: text, format: fmt });
          setContent(text);
          setFormat(fmt);
          setStatus('done');
        } else {
          setContent(source.snippet || '');
          setFormat('markdown');
          setStatus('missing');
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setContent(source.snippet || '');
        setFormat('markdown');
        setStatus('error');
        setError(err instanceof Error ? err.message : '读取笔记失败');
      });
    return () => controller.abort();
  }, [source.path, source.snippet, source.title]);

  return (
    <div className="note-citation-body h-full overflow-auto bg-[var(--bg-panel)] p-4">
      {source.snippet ? (
        <div className="note-citation-snippet">
          <div className="note-citation-snippet-label">检索片段</div>
          <p>{source.snippet}</p>
        </div>
      ) : null}
      {status === 'loading' ? <p className="note-citation-status">正在读取笔记正文…</p> : null}
      {status === 'error' ? <p className="note-citation-status is-error">{error || '读取失败'}</p> : null}
      {status === 'missing' ? <p className="note-citation-status">未找到完整正文，已显示检索片段。</p> : null}
      {content ? (
        format === 'html' ? (
          <iframe srcDoc={content} sandbox="allow-popups" className="h-full min-h-[320px] w-full flex-1 border-0" title={heading} />
        ) : format === 'text' ? (
          <PlainTextReader content={content} />
        ) : (
          <div className="prose-notes note-citation-prose">
            <NoteRenderer content={content} />
          </div>
        )
      ) : null}
    </div>
  );
}

function WebSourceStage({ source }: { source: Extract<TraceSource, { kind: 'web' }> }) {
  const isDesktop = useSyncExternalStore(
    () => () => {},
    () => !!(window as unknown as { desktop?: { isElectron?: boolean } }).desktop?.isElectron,
    () => false,
  );
  const { blocked, reason, forceEmbed } = useEmbeddable(isDesktop ? null : source.url);
  const [loadFailed, setLoadFailed] = useState(false);
  const showFallback = !isDesktop && (blocked || loadFailed);

  if (showFallback) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-auto bg-[var(--bg-panel)]">
        <div className="note-citation-snippet m-4">
          <div className="note-citation-snippet-label">页面摘要</div>
          <p className="text-[13px] font-semibold text-[var(--ink)]">{source.title}</p>
          <p className="mt-1 break-all text-[11px] text-[var(--ink-faint)]">{source.url}</p>
          {source.snippet ? <p className="mt-2 text-[13px] leading-6 text-[var(--ink)]">{source.snippet}</p> : null}
        </div>
        <details className="mx-4 mb-3 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2">
          <summary className="cursor-pointer text-[12px] font-medium text-[var(--ink-soft)]">原始 JSON</summary>
          <pre className="mt-2 overflow-auto text-[11px] leading-5 text-[var(--ink)]">{JSON.stringify(source, null, 2)}</pre>
        </details>
        <div className="min-h-48 flex-1">
          <EmbedFallback url={source.url} reason={reason || (loadFailed ? '页面加载失败' : undefined)} onForce={() => { setLoadFailed(false); forceEmbed(); }} />
        </div>
      </div>
    );
  }

  if (isDesktop) {
    return <WebviewSite url={source.url} />;
  }

  return (
    <iframe
      key={source.url}
      src={source.url}
      title={source.title}
      className="h-full min-h-0 w-full flex-1 border-0 bg-white"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads allow-modals"
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-read; clipboard-write"
      referrerPolicy="no-referrer-when-downgrade"
      onError={() => setLoadFailed(true)}
      onLoad={(event) => {
        try {
          const doc = event.currentTarget.contentDocument;
          if (doc && (doc.URL === 'about:blank' || !doc.body?.childElementCount)) setLoadFailed(true);
        } catch {
          /* cross-origin: treated as rendered */
        }
      }}
    />
  );
}
