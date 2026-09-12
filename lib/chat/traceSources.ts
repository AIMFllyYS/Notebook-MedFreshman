import type { SearchHit } from '@/lib/ai/agent/toolTypes';
import { getToolPartsByName } from '@/lib/chat/messageParts';
import type { ChatMessagePart, WebSearchSource } from '@/lib/types/chat';

export type TraceSource =
  | { kind: 'note'; title: string; path: string; snippet: string }
  | { kind: 'web'; title: string; url: string; snippet: string };

/** 按 key 去重；空 key 放行（无 id 的条目不该被误丢）。 */
export function dedupeByKey<T>(items: readonly T[], keyFn: (item: T) => string | null | undefined): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!key) {
      out.push(item);
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function noteItemKey(item: { path?: string | null }): string | null {
  return item.path || null;
}

export function webItemKey(item: { url?: string | null }): string | null {
  return item.url || null;
}

export function noteImageItemKey(item: { src?: string | null }): string | null {
  return item.src || null;
}

export function collectMessageSources(parts: ChatMessagePart[]): TraceSource[] {
  const notes: TraceSource[] = getToolPartsByName({ parts }, 'searchNotes').flatMap((part) =>
    part.state === 'output-available' && !part.preliminary
      ? (part.output.hits ?? []).map((hit: SearchHit) => ({
          kind: 'note' as const,
          title: hit.title,
          path: hit.path,
          snippet: hit.snippet ?? '',
        }))
      : [],
  );

  const web: TraceSource[] = getToolPartsByName({ parts }, 'webSearch').flatMap((part) =>
    part.state === 'output-available' && !part.preliminary
      ? (part.output.sources ?? []).map((source: WebSearchSource) => ({
          kind: 'web' as const,
          title: source.title || source.url,
          url: source.url,
          snippet: source.snippet ?? '',
        }))
      : [],
  );

  return [
    ...dedupeByKey(notes, (item) => noteItemKey(item)),
    ...dedupeByKey(web, (item) => webItemKey(item)),
  ];
}
