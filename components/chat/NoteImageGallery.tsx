'use client';

import React from 'react';
import type { NoteImageHit } from '@/lib/ai/agent/toolTypes';
import { dedupeByKey, noteImageItemKey } from '@/lib/chat/traceSources';
import { AgentGalleryIcon } from '@/components/icons/AgentIcons';
import { ChatImage } from '@/components/chat/ChatImage';
import { ImageStrip } from '@/components/chat/ImageStrip';

interface NoteImageGalleryProps {
  images: NoteImageHit[];
  query?: string;
}

export default function NoteImageGallery({ images, query }: NoteImageGalleryProps) {
  const unique = dedupeByKey(images, noteImageItemKey);
  if (!unique.length) return null;
  return (
    <div className="my-3 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] p-3">
      <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-[var(--md-sys-color-on-surface)]">
        <AgentGalleryIcon size={16} />
        <span>笔记图片 · {unique.length} 张</span>
        {query ? <span className="ml-auto text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate max-w-[120px]">{query}</span> : null}
      </div>
      <ImageStrip>
        {unique.map((img, i) => (
          <div
            key={img.src}
            className="flex flex-col gap-1.5"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/uri-list', img.src);
              e.dataTransfer.setData('text/plain', img.src);
              e.dataTransfer.effectAllowed = 'copy';
            }}
          >
            <ChatImage src={img.src} alt={img.alt || img.caption || `图片 ${i + 1}`} />
            <div className="max-w-[180px] space-y-0.5 text-[10px] leading-tight text-[var(--md-sys-color-on-surface-variant)]">
              {img.caption ? <div className="line-clamp-2">{img.caption}</div> : null}
              <div className="truncate" title={img.title}>{img.title}</div>
            </div>
          </div>
        ))}
      </ImageStrip>
    </div>
  );
}
