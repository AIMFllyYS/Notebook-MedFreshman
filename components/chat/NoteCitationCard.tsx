'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AgentFileIcon } from '@/components/icons/AgentIcons';
import type { SearchHit } from '@/lib/ai/agent/toolTypes';
import { useNoteCitations } from '@/lib/hooks/useNoteCitations';
import { requestCitedNote } from '@/lib/notes/openCitedNote';
import AgentFoldHeader from '@/components/chat/AgentFoldHeader';

export default function NoteCitationCard({ hits }: { hits: SearchHit[] }) {
  const [expanded, setExpanded] = useState(false);
  const openViewer = useNoteCitations((s) => s.openViewer);
  const router = useRouter();

  if (!hits.length) return null;

  const openInNotes = (path: string, snippet: string) => {
    const href = requestCitedNote(path, snippet);
    if (href) router.push(href);
  };

  return (
    <div className="note-citation-card agent-fold" data-testid="note-citation-card">
      <AgentFoldHeader
        icon={<AgentFileIcon size={16} className="shrink-0" />}
        title={`引用笔记 · ${hits.length} 条`}
        expanded={expanded}
        onToggle={() => setExpanded((open) => !open)}
        action={(
          <button
            type="button"
            className="agent-fold-action"
            onClick={() => openViewer(hits, hits[0]?.path)}
          >
            查看
          </button>
        )}
      />
      {expanded ? (
        <ul className="agent-fold-list hide-scrollbar">
          {hits.map((hit, index) => (
            <li key={`${hit.path}:${index}`}>
              <button
                type="button"
                className="note-citation-card-item"
                onClick={() => openInNotes(hit.path, hit.snippet)}
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
