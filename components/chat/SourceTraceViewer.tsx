'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Globe } from 'lucide-react';
import { openSourcePreview } from '@/lib/chat/openSourcePreview';
import { SOURCE_TRACE_WINDOW_ID } from '@/lib/chat/openSourceTrace';
import type { TraceSource } from '@/lib/chat/traceSources';
import { requestCitedNote } from '@/lib/notes/openCitedNote';
import { useWindowManager } from '@/lib/hooks/useWindowManager';
import ManagedWindow from '@/components/window/ManagedWindow';

export default function SourceTraceViewer() {
  const managed = useWindowManager((s) => s.windows.find((w) => w.id === SOURCE_TRACE_WINDOW_ID));
  if (!managed) return null;
  const sources = Array.isArray((managed.data as { sources?: TraceSource[] }).sources)
    ? (managed.data as { sources: TraceSource[] }).sources
    : [];
  return <SourceTraceWindow sources={sources} title={managed.title} />;
}

function SourceTraceWindow({ sources, title }: { sources: TraceSource[]; title: string }) {
  const router = useRouter();
  const closeWindow = useWindowManager((s) => s.closeWindow);
  const handleClose = useCallback(() => closeWindow(SOURCE_TRACE_WINDOW_ID), [closeWindow]);

  return (
    <ManagedWindow
      windowId={SOURCE_TRACE_WINDOW_ID}
      title={title}
      icon={<BookOpen size={15} />}
      onClose={handleClose}
      fullscreenTarget="notes"
      minSize={{ minW: 360, minH: 320 }}
      className="source-trace-window"
      overlayId="source-trace-viewer"
      bodyClassName="flex min-h-0 min-w-0 flex-1 overflow-hidden"
      unmountWhenMinimized
    >
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
    </ManagedWindow>
  );
}
