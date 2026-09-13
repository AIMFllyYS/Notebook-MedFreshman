'use client';

import { useMemo, useState } from 'react';

export const USER_DOT_LIMIT = 12;

export type UserDotEntry = {
  index: number;
  id: string;
  preview: string;
};

export type VisibleUserDot =
  | { type: 'dot'; entry: UserDotEntry; turn: number }
  | { type: 'range'; entries: UserDotEntry[]; startTurn: number; endTurn: number };

export function visibleUserDots(
  entries: readonly UserDotEntry[],
  activeIndex: number,
  limit = USER_DOT_LIMIT,
): VisibleUserDot[] {
  const withTurn = entries.map((entry, turn) => ({ entry, turn: turn + 1 }));
  if (withTurn.length <= limit) {
    return withTurn.map(({ entry, turn }) => ({ type: 'dot', entry, turn }));
  }

  const activePos = Math.max(0, entries.findIndex((entry) => entry.index === activeIndex));
  const windowSize = Math.max(3, limit - 4);
  const windowStart = Math.min(
    Math.max(1, activePos - Math.floor(windowSize / 2)),
    Math.max(1, entries.length - 1 - windowSize),
  );
  const windowEnd = Math.min(entries.length - 1, windowStart + windowSize);

  const items: VisibleUserDot[] = [{ type: 'dot', entry: entries[0], turn: 1 }];
  if (windowStart > 1) {
    const before = withTurn.slice(1, windowStart);
    items.push({
      type: 'range',
      entries: before.map((item) => item.entry),
      startTurn: before[0].turn,
      endTurn: before[before.length - 1].turn,
    });
  }
  for (const item of withTurn.slice(windowStart, windowEnd)) {
    items.push({ type: 'dot', entry: item.entry, turn: item.turn });
  }
  if (windowEnd < entries.length - 1) {
    const after = withTurn.slice(windowEnd, -1);
    if (after.length) {
      items.push({
        type: 'range',
        entries: after.map((item) => item.entry),
        startTurn: after[0].turn,
        endTurn: after[after.length - 1].turn,
      });
    }
  }
  items.push({ type: 'dot', entry: entries[entries.length - 1], turn: entries.length });
  return items;
}

export function activeUserDotIndex(entries: readonly UserDotEntry[], firstVisibleIndex: number): number {
  if (!entries.length) return -1;
  let current = entries[0].index;
  for (const entry of entries) {
    if (entry.index <= firstVisibleIndex) current = entry.index;
    else break;
  }
  return current;
}

function previewLabel(preview: string, turn: number): string {
  const clipped = preview.replace(/\s+/g, ' ').trim().slice(0, 32);
  return clipped ? `第 ${turn} 次提问：${clipped}` : `第 ${turn} 次提问`;
}

export default function ChatMessageDots({
  entries,
  firstVisibleIndex,
  onJump,
}: {
  entries: readonly UserDotEntry[];
  firstVisibleIndex: number;
  onJump: (index: number) => void;
}) {
  const activeIndex = activeUserDotIndex(entries, firstVisibleIndex);
  const items = useMemo(() => visibleUserDots(entries, activeIndex), [entries, activeIndex]);
  const [expandedRange, setExpandedRange] = useState<string | null>(null);

  if (entries.length === 0) return null;

  return (
    <nav className="chat-message-dots" aria-label="对话定位" data-testid="chat-message-dots">
      {items.map((item) => {
        if (item.type === 'dot') {
          return (
            <DotButton
              key={item.entry.id}
              entry={item.entry}
              turn={item.turn}
              current={item.entry.index === activeIndex}
              onJump={onJump}
            />
          );
        }
        const rangeId = `${item.entries[0].id}:${item.entries[item.entries.length - 1].id}`;
        const expanded = expandedRange === rangeId;
        return (
          <div
            key={rangeId}
            className="chat-message-dots-cluster"
            onMouseEnter={() => setExpandedRange(rangeId)}
            onMouseLeave={() => setExpandedRange((current) => (current === rangeId ? null : current))}
          >
            {expanded ? (
              item.entries.map((entry, offset) => (
                <DotButton
                  key={entry.id}
                  entry={entry}
                  turn={item.startTurn + offset}
                  current={entry.index === activeIndex}
                  onJump={onJump}
                />
              ))
            ) : (
              <button
                type="button"
                className="chat-message-dots-range"
                aria-label={`第 ${item.startTurn}–${item.endTurn} 次提问`}
                aria-expanded={false}
                title={`第 ${item.startTurn}–${item.endTurn} 次提问`}
                onClick={() => setExpandedRange(rangeId)}
                onFocus={() => setExpandedRange(rangeId)}
              >
                ···
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function DotButton({
  entry,
  turn,
  current,
  onJump,
}: {
  entry: UserDotEntry;
  turn: number;
  current: boolean;
  onJump: (index: number) => void;
}) {
  const label = previewLabel(entry.preview, turn);
  return (
    <button
      type="button"
      className="chat-message-dot"
      data-testid="chat-message-dot"
      data-message-index={entry.index}
      aria-label={label}
      aria-current={current ? 'true' : undefined}
      title={label}
      onClick={() => onJump(entry.index)}
    />
  );
}
