import { useWindowManager } from '@/lib/hooks/useWindowManager';
import type { TraceSource } from '@/lib/chat/traceSources';
import type { WebSearchSource } from '@/lib/types/chat';

export const SOURCE_TRACE_WINDOW_ID = 'source-trace-viewer';

export function sourceItemKey(source: TraceSource, index = 0): string {
  if (source.kind === 'note') {
    return source.path ? `note:${source.path}` : `note:${index}:${source.title || 'untitled'}`;
  }
  return source.url ? `web:${source.url}` : `web:${index}:${source.title || 'untitled'}`;
}

export function openSourceTrace(
  sources: TraceSource[],
  options?: { id?: string; title?: string; activeKey?: string },
) {
  if (!sources.length) return;
  const id = options?.id ?? SOURCE_TRACE_WINDOW_ID;
  const title = options?.title ?? `来源追踪 · ${sources.length} 条`;
  const activeKey = options?.activeKey ?? sourceItemKey(sources[0], 0);
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

export function openWebSearchSources(sources: WebSearchSource[], activeUrl?: string, activeIndex?: number) {
  const items: TraceSource[] = sources.map((source) => ({
    kind: 'web' as const,
    title: source.title || source.url || '未命名来源',
    url: source.url ?? '',
    snippet: source.snippet ?? '',
  }));
  if (!items.length) return;
  const index = activeIndex != null && activeIndex >= 0 && activeIndex < items.length
    ? activeIndex
    : Math.max(0, items.findIndex((item) => item.kind === 'web' && item.url && item.url === activeUrl));
  const active = items[index] ?? items[0];
  const firstUrl = items.find((item): item is Extract<TraceSource, { kind: 'web' }> => item.kind === 'web' && !!item.url)?.url;
  openSourceTrace(items, {
    id: `web-search:${firstUrl || items.length}`,
    title: `联网来源 · ${items.length} 条`,
    activeKey: sourceItemKey(active, index),
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
