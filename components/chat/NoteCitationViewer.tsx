'use client';

import { useEffect, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useNoteCitations, NOTE_CITATION_WINDOW_ID } from '@/lib/hooks/useNoteCitations';
import { useWindowManager } from '@/lib/hooks/useWindowManager';
import ManagedWindow from '@/components/window/ManagedWindow';
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
  const cacheRef = useRef<Map<string, string>>(new Map());
  const [status, setStatus] = useState<LoadState>('idle');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const active = hits.find((hit) => hit.path === activePath) ?? hits[0];
  const parsed = active ? parseNotePath(active.path) : null;

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

  if (!managed || !active) return null;

  const heading = parsed ? noteBreadcrumb(parsed, active.title) : active.title;

  return (
    <ManagedWindow
      windowId={NOTE_CITATION_WINDOW_ID}
      title={heading}
      icon={<BookOpen size={15} />}
      onClose={closeViewer}
      fullscreenTarget="notes"
      minSize={{ minW: 480, minH: 360 }}
      className="note-citation-window"
      overlayId="note-citation-viewer"
      externalLink={
        parsed
          ? { onOpen: () => { window.open(noteHref(parsed), '_blank', 'noopener'); } }
          : false
      }
      bodyClassName="flex min-h-0 min-w-0 flex-1 overflow-hidden"
      unmountWhenMinimized
    >
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
    </ManagedWindow>
  );
}
