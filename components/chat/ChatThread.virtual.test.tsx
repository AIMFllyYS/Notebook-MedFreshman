import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ChatThread from './ChatThread';
import type { ChatMessage } from '@/lib/types/chat';

function makeMessages(n: number): ChatMessage[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `m-${i}`,
    role: i % 2 === 0 ? 'user' : 'assistant',
    content: `Message ${i}`,
    timestamp: i,
  })) as ChatMessage[];
}

describe('ChatThread virtualizer', () => {
  it('allocates virtual scroll height for large histories', () => {
    const { container } = render(
      <div style={{ height: 480, display: 'flex', flexDirection: 'column' }}>
        <ChatThread
          messages={makeMessages(200)}
          isLoading={false}
          error={null}
          onClearError={() => {}}
          onFollowUpClick={() => {}}
          hydrated
        />
      </div>,
    );
    const spacer = container.querySelector('.chat-messages > div[style*="position: relative"]') as HTMLElement | null;
    expect(spacer).toBeTruthy();
    const h = parseInt(spacer!.style.height, 10);
    expect(h).toBeGreaterThan(5000);
  });

  it('keeps rendered message DOM bounded for large histories', () => {
    const { container } = render(
      <div style={{ height: 480, display: 'flex', flexDirection: 'column' }}>
        <ChatThread
          messages={makeMessages(200)}
          isLoading={false}
          error={null}
          onClearError={() => {}}
          onFollowUpClick={() => {}}
          hydrated
        />
      </div>,
    );

    const renderedMessages = container.querySelectorAll('.chat-message');
    expect(renderedMessages.length).toBeGreaterThan(0);
    expect(renderedMessages.length).toBeLessThan(60);
  });

  it('filters tool messages before virtualizing', () => {
    const messages: ChatMessage[] = [
      { id: 'u1', role: 'user', content: 'visible user', timestamp: 1 },
      { id: 't1', role: 'tool', content: 'hidden tool payload', timestamp: 2 },
      { id: 'a1', role: 'assistant', content: 'visible assistant', timestamp: 3 },
    ];

    const { queryByText, getByText } = render(
      <div style={{ height: 480, display: 'flex', flexDirection: 'column' }}>
        <ChatThread
          messages={messages}
          isLoading={false}
          error={null}
          onClearError={() => {}}
          onFollowUpClick={() => {}}
          hydrated
        />
      </div>,
    );

    expect(getByText('visible user')).toBeTruthy();
    expect(getByText('visible assistant')).toBeTruthy();
    expect(queryByText('hidden tool payload')).toBeNull();
  });

  it('assigns the external scrollContainerRef to the real scroll viewport', () => {
    const scrollRef = React.createRef<HTMLDivElement>();

    render(
      <div style={{ height: 480, display: 'flex', flexDirection: 'column' }}>
        <ChatThread
          messages={makeMessages(5)}
          isLoading={false}
          error={null}
          onClearError={() => {}}
          onFollowUpClick={() => {}}
          hydrated
          scrollContainerRef={scrollRef}
        />
      </div>,
    );

    expect(scrollRef.current).toBeTruthy();
    expect(scrollRef.current?.classList.contains('chat-messages')).toBe(true);
  });
});
