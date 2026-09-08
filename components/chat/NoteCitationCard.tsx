'use client';

import React, { useState } from 'react';
import { AgentChevronIcon, AgentFileIcon } from '@/components/icons/AgentIcons';
import type { SearchHit } from '@/lib/ai/agent/toolTypes';
import { useNoteCitations } from '@/lib/hooks/useNoteCitations';

export default function NoteCitationCard({ hits }: { hits: SearchHit[] }) {
  const [expanded, setExpanded] = useState(false);
  const openViewer = useNoteCitations((s) => s.openViewer);

  if (!hits.length) return null;

  return (
    <div className="note-citation-card" data-testid="note-citation-card">
      <div className="note-citation-card-header">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
          className="note-citation-card-toggle"
        >
          <AgentFileIcon size={16} className="shrink-0" />
          <span className="min-w-0 flex-1 truncate">引用笔记 · {hits.length} 条</span>
          <AgentChevronIcon
            size={14}
            className="shrink-0 opacity-70"
            style={{ transform: expanded ? 'rotate(180deg)' : undefined }}
          />
        </button>
        <button
          type="button"
          className="note-citation-card-open"
          onClick={() => openViewer(hits, hits[0]?.path)}
        >
          查看
        </button>
      </div>
      {expanded ? (
        <ul className="note-citation-card-list">
          {hits.map((hit, index) => (
            <li key={`${hit.path}:${index}`}>
              <button
                type="button"
                className="note-citation-card-item"
                onClick={() => openViewer(hits, hit.path)}
              >
                <span className="note-citation-card-title">{hit.title}</span>
                <span className="note-citation-card-path">{hit.path}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
