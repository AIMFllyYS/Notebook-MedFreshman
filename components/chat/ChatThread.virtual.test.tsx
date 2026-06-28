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
});
