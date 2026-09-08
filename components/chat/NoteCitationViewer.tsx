'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen } from 'lucide-react';
import { useNoteCitations, NOTE_CITATION_WINDOW_ID } from '@/lib/hooks/useNoteCitations';
import { useWindowManager } from '@/lib/hooks/useWindowManager';
import { useFullscreenTrack } from '@/lib/hooks/useFullscreenTrack';
import { useDraggable } from '@/lib/hooks/useDraggable';
import { useResizable } from '@/lib/hooks/useResizable';
import WindowChrome from '@/components/window/WindowChrome';
import { useOverlayRegistration } from '@/lib/keyboard/useOverlayRegistration';
import NoteRenderer from '@/components/notes/NoteRenderer';
import { noteBreadcrumb, noteHref, parseNotePath } from '@/lib/content/notePath';
import type { SearchHit } from '@/lib/ai/agent/toolTypes';

type LoadState = 'idle' | 'loading' | 'done' | 'missing' | 'error';

export default function NoteCitationViewer() {
  const hits = useNoteCitations((s) => s.hits);
  const activePath = useNoteCitations((s) => s.activePath);
  if (!activePath || hits.length === 0) return null;
  return <NoteCitationViewerWindow hits={hits} activePath={activePath} />;
}

function NoteCitationViewerWindow({ hits, activePath }: { hits: SearchHit[]; activePath: string }) {
  const setActivePath = useNoteCitations((s) => s.setActivePath);
  const closeViewer = useNoteCitations((s) => s.closeViewer);
  const managed = useWindowManager((s) => s.windows.find((w) => w.id === NOTE_CITATION_WINDOW_ID));
  const { bringToFront, commitGeometry, minimizeWindow, setFullscreen } = useWindowManager();
  const preExpandRef = useRef<{ pos: { x: number; y: number }; size: { width: number; height: number } } | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const [status, setStatus] = useState<LoadState>('idle');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const active = hits.find((hit) => hit.path === activePath) ?? hits[0];
  const parsed = active ? parseNotePath(active.path) : null;

  const { elRef, onPointerDown } = useDraggable((dx, dy) => {
    if (!managed) return;
    commitGeometry(NOTE_CITATION_WINDOW_ID, {
      pos: {
        x: Math.max(0, Math.min(managed.pos.x + dx, window.innerWidth - managed.size.width)),
        y: Math.max(0, Math.min(managed.pos.y + dy, window.innerHeight - managed.size.height)),
      },
    });
  });
  const onResizeStart = useResizable(elRef, (width, height) => {
    commitGeometry(NOTE_CITATION_WINDOW_ID, { size: { width, height } });
  }, { minW: 480, minH: 360 });

  useFullscreenTrack(NOTE_CITATION_WINDOW_ID, managed?.fullscreen ?? false);
  useOverlayRegistration({
    id: 'note-citation-viewer',
    open: !!managed,
    onClose: closeViewer,
    priority: 30,
  });

  useEffect(() => {
    if (!active) return;
    const cached = cacheRef.current.get(active.path);
    if (cached) {
      setContent(cached);
      setStatus('done');
      setError(null);
      return;
    }
    setContent('');
    const loc = parseNotePath(active.path);
    if (!loc) {
      setContent(active.snippet || '');
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
        return res.json() as Promise<{ content?: string | null }>;
      })
      .then((data) => {
        const markdown = typeof data.content === 'string' ? data.content : '';
        if (markdown.trim()) {
          cacheRef.current.set(active.path, markdown);
          setContent(markdown);
          setStatus('done');
        } else {
          setContent(active.snippet || '');
          setStatus('missing');
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setContent(active.snippet || '');
        setStatus('error');
        setError(err instanceof Error ? err.message : '读取笔记失败');
      });
    return () => controller.abort();
  }, [active]);

  const toggleFullscreen = useCallback(() => {
    const current = useWindowManager.getState().windows.find((w) => w.id === NOTE_CITATION_WINDOW_ID);
    if (!current) return;
    if (current.fullscreen) {
      const snap = preExpandRef.current;
      if (snap) commitGeometry(NOTE_CITATION_WINDOW_ID, { pos: snap.pos, size: snap.size });
      preExpandRef.current = null;
      setFullscreen(NOTE_CITATION_WINDOW_ID, false);
      return;
    }
    preExpandRef.current = { pos: current.pos, size: current.size };
    const rect = document.getElementById('notes-panel')?.getBoundingClientRect();
    if (rect && rect.width > 0 && rect.height > 0) {
      commitGeometry(NOTE_CITATION_WINDOW_ID, { pos: { x: rect.left, y: rect.top }, size: { width: rect.width, height: rect.height } });
    }
    setFullscreen(NOTE_CITATION_WINDOW_ID, true);
  }, [commitGeometry, setFullscreen]);

  if (!managed || !active) return null;

  const heading = parsed ? noteBreadcrumb(parsed, active.title) : active.title;

  return createPortal(
    <div
      ref={elRef}
      onPointerDownCapture={() => bringToFront(NOTE_CITATION_WINDOW_ID)}
      className="note-citation-window"
      style={{
        position: 'fixed',
        left: managed.pos.x,
        top: managed.pos.y,
        width: managed.size.width,
        height: managed.size.height,
        background: 'var(--bg-panel)',
        borderRadius: managed.fullscreen ? 0 : 14,
        overflow: 'hidden',
        display: managed.minimized ? 'none' : 'flex',
        flexDirection: 'column',
        boxShadow: managed.fullscreen ? '0 0 0 1px var(--line)' : '0 16px 48px rgba(0,0,0,0.3), 0 0 0 1px var(--line)',
        zIndex: managed.z,
      }}
    >
      <WindowChrome
        title={heading}
        icon={<BookOpen size={15} />}
        onClose={closeViewer}
        onMinimize={() => minimizeWindow(NOTE_CITATION_WINDOW_ID)}
        onFullscreen={toggleFullscreen}
        isFullscreen={managed.fullscreen}
        isMinimized={managed.minimized}
        onDragStart={onPointerDown}
        showExternalLink={!!parsed}
        onExternalLink={parsed ? () => { window.open(noteHref(parsed), '_blank', 'noopener'); } : undefined}
        bodyClassName="flex min-h-0 min-w-0 flex-1 overflow-hidden"
      >
        {!managed.minimized && (
          <div className="note-citation-layout">
            <nav className="note-citation-sidebar" aria-label="引用列表">
              {hits.map((hit, index) => {
                const selected = hit.path === active.path;
                return (
                  <button
                    key={`${hit.path}:${index}`}
                    type="button"
                    data-no-drag
                    className={`note-citation-nav-item${selected ? ' is-active' : ''}`}
                    onClick={() => setActivePath(hit.path)}
                  >
                    <span className="note-citation-nav-title">{hit.title}</span>
                    <span className="note-citation-nav-path">{hit.path}</span>
                  </button>
                );
              })}
            </nav>
            <div className="note-citation-body">
              {active.snippet ? (
                <div className="note-citation-snippet">
                  <div className="note-citation-snippet-label">检索片段</div>
                  <p>{active.snippet}</p>
                </div>
              ) : null}
              {status === 'loading' ? (
                <p className="note-citation-status">正在读取笔记正文…</p>
              ) : null}
              {status === 'error' ? (
                <p className="note-citation-status is-error">{error || '读取失败'}</p>
              ) : null}
              {status === 'missing' ? (
                <p className="note-citation-status">未找到完整正文，已显示检索片段。</p>
              ) : null}
              {content ? (
                <div className="prose-notes note-citation-prose">
                  <NoteRenderer content={content} />
                </div>
              ) : null}
            </div>
          </div>
        )}
      </WindowChrome>
      {!managed.fullscreen && !managed.minimized && (
        <div
          data-no-drag
          onPointerDown={onResizeStart}
          title="拖拽缩放窗口"
          style={{
            position: 'absolute',
            right: 1,
            bottom: 1,
            width: 18,
            height: 18,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            padding: 2,
            color: 'var(--md-sys-color-outline)',
            cursor: 'nwse-resize',
            touchAction: 'none',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d="M11 4 L4 11" />
            <path d="M11 8 L8 11" />
          </svg>
        </div>
      )}
    </div>,
    document.body,
  );
}
