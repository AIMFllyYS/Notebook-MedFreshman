'use client';

import React, { useState } from 'react';
import { AgentGlobeIcon } from '@/components/icons/AgentIcons';
import type { WebSearchSource } from '@/lib/types/chat';
import AgentFoldHeader from '@/components/chat/AgentFoldHeader';
import { openWebSearchSources } from '@/lib/chat/openSourceTrace';
import { dedupeByKey, webItemKey } from '@/lib/chat/traceSources';
import { useT } from '@/lib/i18n';

function sourceHost(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

export default function WebSourceFold({
  sources,
  cacheHit,
  label,
}: {
  sources: WebSearchSource[];
  cacheHit?: boolean;
  label?: string;
}) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const unique = dedupeByKey(sources, webItemKey);
  if (!unique.length) return null;
  const resolvedLabel = label ?? t('trace.webSources.title');

  return (
    <div className="agent-fold" data-testid="web-source-fold" aria-label={resolvedLabel}>
      <AgentFoldHeader
        icon={<AgentGlobeIcon size={16} className="shrink-0" />}
        title={t('trace.webSources.foldTitle', {
          label: resolvedLabel,
          count: unique.length,
          footnote: cacheHit ? t('trace.webSources.cached') : '',
        })}
        expanded={expanded}
        onToggle={() => setExpanded((open) => !open)}
      />
      {expanded ? (
        <ul className="agent-fold-list hide-scrollbar">
          {unique.map((source, index) => (
            <li key={source.url || `web:${index}:${source.title || "untitled"}`}>
              <button
                type="button"
                className="web-source-item"
                onClick={() => openWebSearchSources(unique, source.url, index)}
              >
                <span className="web-source-item-title">
                  <span className="min-w-0 flex-1 truncate">{index + 1}. {source.title || sourceHost(source.url)}</span>
                </span>
                <span className="web-source-item-host" title={source.url || undefined}>
                  {source.url || t('agent.sources.noLink')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
