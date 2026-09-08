'use client';

import { useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { BookOpen, Globe } from 'lucide-react';
import { openSourcePreview } from '@/lib/chat/openSourcePreview';
import { SOURCE_TRACE_WINDOW_ID } from '@/lib/chat/openSourceTrace';
import type { TraceSource } from '@/lib/chat/traceSources';
import { requestCitedNote } from '@/lib/notes/openCitedNote';
import { useWindowManager } from '@/lib/hooks/useWindowManager';
import { useFullscreenTrack } from '@/lib/hooks/useFullscreenTrack';
import { useDraggable } from '@/lib/hooks/useDraggable';
import { useResizable } from '@/lib/hooks/useResizable';
import WindowChrome from '@/components/window/WindowChrome';
import { useOverlayRegistration } from '@/lib/keyboard/useOverlayRegistration';

export default function SourceTraceViewer() {
  const managed = useWindowManager((s) => s.windows.find((w) => w.id === SOURCE_TRACE_WINDOW_ID));
  if (!managed) return null;
  const sources = Array.isArray((managed.data as { sources?: TraceSource[] }).sources)
    ? (managed.data as { sources: TraceSource[] }).sources
    : [];
  return <SourceTraceWindow sources={sources} />;
}

function SourceTraceWindow({ sources }: { sources: TraceSource[] }) {
  const router = useRouter();
  const managed = useWindowManager((s) => s.windows.find((w) => w.id === SOURCE_TRACE_WINDOW_ID));
  const { bringToFront, commitGeometry, minimizeWindow, setFullscreen, closeWindow } = useWindowManager();
  const preExpandRef = useRef<{ pos: { x: number; y: number }; size: { width: number; height: number } } | null>(null);

  const { elRef, onPointerDown } = useDraggable((dx, dy) => {
    if (!managed) return;
    commitGeometry(SOURCE_TRACE_WINDOW_ID, {
      pos: {
        x: Math.max(0, Math.min(managed.pos.x + dx, window.innerWidth - managed.size.width)),
        y: Math.max(0, Math.min(managed.pos.y + dy, window.innerHeight - managed.size.height)),
      },
    });
  });
  const onResizeStart = useResizable(elRef, (width, height) => {
    commitGeometry(SOURCE_TRACE_WINDOW_ID, { size: { width, height } });
  }, { minW: 360, minH: 320 });

  useFullscreenTrack(SOURCE_TRACE_WINDOW_ID, managed?.fullscreen ?? false);
  const handleClose = useCallback(() => closeWindow(SOURCE_TRACE_WINDOW_ID), [closeWindow]);
  useOverlayRegistration({
    id: 'source-trace-viewer',
    open: !!managed,
    onClose: handleClose,
    priority: 30,
  });

  const toggleFullscreen = useCallback(() => {
    const current = useWindowManager.getState().windows.find((w) => w.id === SOURCE_TRACE_WINDOW_ID);
    if (!current) return;
    if (current.fullscreen) {
      const snap = preExpandRef.current;
      if (snap) commitGeometry(SOURCE_TRACE_WINDOW_ID, { pos: snap.pos, size: snap.size });
      preExpandRef.current = null;
      setFullscreen(SOURCE_TRACE_WINDOW_ID, false);
      return;
    }
    preExpandRef.current = { pos: current.pos, size: current.size };
    const rect = document.getElementById('notes-panel')?.getBoundingClientRect();
    if (rect && rect.width > 0 && rect.height > 0) {
      commitGeometry(SOURCE_TRACE_WINDOW_ID, { pos: { x: rect.left, y: rect.top }, size: { width: rect.width, height: rect.height } });
    }
    setFullscreen(SOURCE_TRACE_WINDOW_ID, true);
  }, [commitGeometry, setFullscreen]);

  if (!managed) return null;

  return createPortal(
    <div
      ref={elRef}
      onPointerDownCapture={() => bringToFront(SOURCE_TRACE_WINDOW_ID)}
      className="source-trace-window"
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
        title={managed.title}
        icon={<BookOpen size={15} />}
        onClose={handleClose}
        onMinimize={() => minimizeWindow(SOURCE_TRACE_WINDOW_ID)}
        onFullscreen={toggleFullscreen}
        isFullscreen={managed.fullscreen}
        isMinimized={managed.minimized}
        onDragStart={onPointerDown}
        bodyClassName="flex min-h-0 min-w-0 flex-1 overflow-hidden"
      >
        {!managed.minimized && (
          <div className="source-trace-body hide-scrollbar">
            {sources.length === 0 ? (
              <p className="source-trace-empty">本轮没有可追踪的引用依据。</p>
            ) : sources.map((source, index) => (
              source.kind === 'note' ? (
                <button
                  key={`note:${source.path}:${index}`}
                  type="button"
                  data-no-drag
                  className="source-trace-card"
                  onClick={() => {
                    const href = requestCitedNote(source.path, source.snippet);
                    if (href) router.push(href);
                  }}
                >
                  <span className="source-trace-kind"><BookOpen size={13} /> 笔记</span>
                  <span className="source-trace-card-title">{source.title}</span>
                  <span className="source-trace-card-meta">{source.path}</span>
                  {source.snippet ? <span className="source-trace-card-snippet">{source.snippet}</span> : null}
                </button>
              ) : (
                <button
                  key={`web:${source.url}:${index}`}
                  type="button"
                  data-no-drag
                  className="source-trace-card"
                  onClick={() => openSourcePreview({ url: source.url, title: source.title })}
                >
                  <span className="source-trace-kind"><Globe size={13} /> 网页</span>
                  <span className="source-trace-card-title">{source.title}</span>
                  <span className="source-trace-card-meta">{source.url}</span>
                  {source.snippet ? <span className="source-trace-card-snippet">{source.snippet}</span> : null}
                </button>
              )
            ))}
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
