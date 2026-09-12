'use client';

import React, { useState } from 'react';
import { AgentGlobeIcon } from '@/components/icons/AgentIcons';
import type { WebSearchSource } from '@/lib/types/chat';
import AgentFoldHeader from '@/components/chat/AgentFoldHeader';
import { openSourcePreview } from '@/lib/chat/openSourcePreview';
import { dedupeByKey, webItemKey } from '@/lib/chat/traceSources';

function sourceHost(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

export default function WebSourceFold({
  sources,
  cacheHit,
  label = '联网来源',
}: {
  sources: WebSearchSource[];
  cacheHit?: boolean;
  label?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const unique = dedupeByKey(sources, webItemKey);
  if (!unique.length) return null;

  return (
    <div className="agent-fold" data-testid="web-source-fold" aria-label={label}>
      <AgentFoldHeader
        icon={<AgentGlobeIcon size={16} className="shrink-0" />}
        title={`${label} · ${unique.length} 条${cacheHit ? ' · 缓存' : ''}`}
        expanded={expanded}
        onToggle={() => setExpanded((open) => !open)}
      />
      {expanded ? (
        <ul className="agent-fold-list hide-scrollbar">
          {unique.map((source, index) => (
            <li key={source.url}>
              <button
                type="button"
                className="web-source-item"
                onClick={() => openSourcePreview({ url: source.url, title: source.title })}
              >
                <span className="web-source-item-title">
                  <span className="min-w-0 flex-1 truncate">{index + 1}. {source.title || sourceHost(source.url)}</span>
                </span>
                <span className="web-source-item-host">{sourceHost(source.url)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
