import { useWindowManager } from '@/lib/hooks/useWindowManager';
import type { TraceSource } from '@/lib/chat/traceSources';

export const SOURCE_TRACE_WINDOW_ID = 'source-trace-viewer';

export function openSourceTrace(sources: TraceSource[]) {
  if (!sources.length) return;
  const { pos, size } = sourceTraceGeometry();
  useWindowManager.getState().openWindow({
    id: SOURCE_TRACE_WINDOW_ID,
    type: 'source-trace-viewer',
    title: `来源追踪 · ${sources.length} 条`,
    pos,
    size,
    data: { sources },
  });
}

function sourceTraceGeometry() {
  if (typeof window === 'undefined') {
    return { pos: { x: 48, y: 72 }, size: { width: 560, height: 640 } };
  }
  const width = Math.min(560, Math.floor(window.innerWidth * 0.5));
  const height = Math.min(680, Math.floor(window.innerHeight * 0.82));
  return {
    pos: {
      x: Math.max(16, Math.floor(window.innerWidth - width - 28)),
      y: Math.max(16, Math.floor(window.innerHeight * 0.08)),
    },
    size: { width, height },
  };
}
