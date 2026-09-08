import type { SearchHit } from '@/lib/ai/agent/toolTypes';
import { getToolPartsByName } from '@/lib/chat/messageParts';
import type { ChatMessagePart, WebSearchSource } from '@/lib/types/chat';

export type TraceSource =
  | { kind: 'note'; title: string; path: string; snippet: string }
  | { kind: 'web'; title: string; url: string; snippet: string };

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

  const webFromTools = getToolPartsByName({ parts }, 'webSearch').flatMap((part) =>
    part.state === 'output-available' && !part.preliminary
      ? (part.output.sources ?? []).map((source: WebSearchSource) => ({
          kind: 'web' as const,
          title: source.title || source.url,
          url: source.url,
          snippet: source.snippet ?? '',
        }))
      : [],
  );

  const webFromParts = parts.flatMap((part) =>
    part.type === 'source-url'
      ? [{ kind: 'web' as const, title: part.title || part.url, url: part.url, snippet: '' }]
      : [],
  );

  const seen = new Set<string>();
  const web: TraceSource[] = [];
  for (const item of [...webFromTools, ...webFromParts]) {
    if (item.kind !== 'web' || seen.has(item.url)) continue;
    seen.add(item.url);
    web.push(item);
  }
  return [...notes, ...web];
}
