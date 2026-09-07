import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import ChatThread from './ChatThread';
import type { ChatMessage } from '@/lib/types/chat';

function makeMessages(n: number): ChatMessage[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `m-${i}`,
    role: i % 2 === 0 ? 'user' : 'assistant',
    parts: [{ type: 'text', text: `Message ${i}` }],
    timestamp: i,
  })) as ChatMessage[];
}

describe('ChatThread virtualizer', () => {
  it('reserves dynamic bottom space for a floating composer without changing message content', () => {
    const { container, rerender } = render(<ChatThread messages={makeMessages(2)} isLoading={false} error={null}
      onClearError={() => {}} onFollowUpClick={() => {}} bottomInset={180} />);
    const viewport = container.querySelector('.chat-messages') as HTMLElement;
    expect(viewport.style.paddingBottom).toBe('180px');
    expect(viewport.style.scrollPaddingBottom).toBe('180px');
    rerender(<ChatThread messages={makeMessages(2)} isLoading={false} error={null}
      onClearError={() => {}} onFollowUpClick={() => {}} bottomInset={240} />);
    expect(viewport.style.paddingBottom).toBe('240px');
    expect(container.querySelectorAll('.chat-message').length).toBe(2);
  });

  it('announces transient connection info separately from error messages', () => {
    const clear = vi.fn();
    const { getByRole, queryByText } = render(<ChatThread messages={[]} isLoading={false} error={null}
      onClearError={() => {}} onFollowUpClick={() => {}} info="已切换到备用 API" onClearInfo={clear} />);
    expect(getByRole('status').textContent).toContain('已切换到备用 API');
    expect(getByRole('status').querySelector('[data-agent-icon="info"]')).not.toBeNull();
    expect(queryByText('接口错误')).toBeNull();
    fireEvent.click(getByRole('button', { name: '关闭连接提示' }));
    expect(clear).toHaveBeenCalledOnce();
  });

  it('uses a motion-safe monochrome loop for history hydration without changing its status text', () => {
    const { container, getByText } = render(<ChatThread messages={[]} isLoading={false} error={null}
      onClearError={() => {}} onFollowUpClick={() => {}} hydrated={false} />);
    expect(getByText('正在加载历史记录...')).toBeTruthy();
    const icon = container.querySelector('[data-agent-icon="loop"]');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(icon?.getAttribute('class')).toContain('motion-reduce:animate-none');
    expect(container.querySelector('.lucide')).toBeNull();
  });

  it('announces a handled request failure as an alert with an accessible dismiss action', () => {
    const clear = vi.fn();
    const { getByRole } = render(<ChatThread messages={[]} isLoading={false} error="请求连接失败，请重试。"
      onClearError={clear} onFollowUpClick={() => {}} />);
    const alert = getByRole('alert');
    expect(alert).toHaveTextContent('请求连接失败，请重试。');
    expect(alert.querySelector('[data-agent-icon="alert"]')).not.toBeNull();
    fireEvent.click(getByRole('button', { name: '关闭错误提示' }));
    expect(clear).toHaveBeenCalledOnce();
  });

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

  it('filters system and unexpected legacy roles before virtualizing', () => {
    const messages: ChatMessage[] = [
      { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'visible user' }], timestamp: 1 },
      { id: 's1', role: 'system', parts: [{ type: 'text', text: 'hidden system payload' }], timestamp: 2 },
      // Runtime guard for unmigrated input; tool is no longer a UIMessage role.
      // @ts-expect-error intentionally invalid legacy role
      { id: 't1', role: 'tool', parts: [{ type: 'text', text: 'hidden tool payload' }], timestamp: 2 },
      { id: 'a1', role: 'assistant', parts: [{ type: 'text', text: 'visible assistant' }], timestamp: 3 },
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
    expect(queryByText('hidden system payload')).toBeNull();
  });

  it('shows the thread loading line only before the assistant row exists', () => {
    const userOnly: ChatMessage[] = [
      { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'visible user' }], timestamp: 1 },
    ];
    const withAssistant: ChatMessage[] = [
      ...userOnly,
      { id: 'a1', role: 'assistant', parts: [], timestamp: 2 },
    ];
    const { getByText, getByTestId, queryByTestId, rerender } = render(
      <div style={{ height: 480, display: 'flex', flexDirection: 'column' }}>
        <ChatThread
          messages={userOnly}
          isLoading
          error={null}
          onClearError={() => {}}
          onFollowUpClick={() => {}}
          hydrated
        />
      </div>,
    );
    expect(getByTestId('chat-thread-loading')).toHaveTextContent('AI 正在思考中...');
    rerender(
      <div style={{ height: 480, display: 'flex', flexDirection: 'column' }}>
        <ChatThread
          messages={withAssistant}
          isLoading
          error={null}
          onClearError={() => {}}
          onFollowUpClick={() => {}}
          hydrated
        />
      </div>,
    );
    expect(queryByTestId('chat-thread-loading')).toBeNull();
    expect(getByText('正在思考…')).toBeTruthy();
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
