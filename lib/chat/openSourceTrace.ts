import { useWindowManager } from '@/lib/hooks/useWindowManager';
import type { TraceSource } from '@/lib/chat/traceSources';
import type { WebSearchSource } from '@/lib/types/chat';

export const SOURCE_TRACE_WINDOW_ID = 'source-trace-viewer';

export function sourceItemKey(source: TraceSource): string {
  return source.kind === 'note' ? `note:${source.path}` : `web:${source.url}`;
}

export function openSourceTrace(
  sources: TraceSource[],
  options?: { id?: string; title?: string; activeKey?: string },
) {
  if (!sources.length) return;
  const id = options?.id ?? SOURCE_TRACE_WINDOW_ID;
  const title = options?.title ?? `来源追踪 · ${sources.length} 条`;
  const activeKey = options?.activeKey ?? sourceItemKey(sources[0]);
  const { pos, size } = sourceTraceGeometry();
  const wm = useWindowManager.getState();
  const existing = wm.windows.find((win) => win.id === id);
  if (existing) {
    wm.updateWindow(id, { title, data: { sources, activeKey } });
    if (existing.minimized) wm.restoreWindow(id);
    else wm.bringToFront(id);
    return;
  }
  wm.openWindow({
    id,
    type: 'source-trace-viewer',
    title,
    pos,
    size,
    data: { sources, activeKey },
  });
}

export function openWebSearchSources(sources: WebSearchSource[], activeUrl?: string) {
  const items: TraceSource[] = sources
    .filter((source) => source.url)
    .map((source) => ({
      kind: 'web' as const,
      title: source.title || source.url,
      url: source.url,
      snippet: source.snippet ?? '',
    }));
  if (!items.length) return;
  const active = items.find((item) => item.kind === 'web' && item.url === activeUrl) ?? items[0];
  openSourceTrace(items, {
    id: `web-search:${items[0].kind === 'web' ? items[0].url : items.length}`,
    title: `联网来源 · ${items.length} 条`,
    activeKey: sourceItemKey(active),
  });
}

function sourceTraceGeometry() {
  if (typeof window === 'undefined') {
    return { pos: { x: 48, y: 64 }, size: { width: 920, height: 680 } };
  }
  const width = Math.min(960, Math.floor(window.innerWidth * 0.78));
  const height = Math.min(820, Math.floor(window.innerHeight * 0.86));
  return {
    pos: {
      x: Math.max(16, Math.floor(window.innerWidth * 0.12)),
      y: Math.max(16, Math.floor(window.innerHeight * 0.06)),
    },
    size: { width, height },
  };
}
