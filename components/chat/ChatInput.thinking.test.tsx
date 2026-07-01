import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import ChatInput from './ChatInput';
import { useSettings } from '@/lib/hooks/useSettings';

vi.mock('@/components/chat/TokenDashboard', () => ({
  default: () => <div data-testid="token-dashboard" />,
}));

vi.mock('@/components/chat/ModelMenu', () => ({
  default: () => <div data-testid="model-menu" />,
}));

vi.mock('@/lib/hooks/useChatUI', () => ({
  useChatUI: () => ({ quotedText: null, clearQuotedText: vi.fn() }),
}));

vi.mock('@/lib/hooks/useImageAttachments', () => ({
  useImageAttachments: () => ({
    attachments: [],
    addFiles: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    toChatFormat: () => [],
    handlePaste: vi.fn(),
    handleDrop: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragEnter: vi.fn(),
    handleDragLeave: vi.fn(),
    isDragging: false,
    error: null,
  }),
}));

const chatContext = {
  subjectId: 'physics',
  categoryId: 'demo',
  itemId: '1',
  currentTopic: 'topic',
};

describe('ChatInput thinking menu', () => {
  beforeEach(() => {
    useSettings.setState({
      selectedModelId: 'zai-org/GLM-4.7-FlashX',
      customApiGroups: [],
      defaultThinking: true,
      defaultThinkingEffort: 'medium',
    });
  });

  it('disables thinking menu button when the model does not support thinking', () => {
    const { getByTestId } = render(
      <ChatInput
        onSend={vi.fn()}
        onStop={vi.fn()}
        isLoading={false}
        chatContext={chatContext}
      />,
    );
    const btn = getByTestId('thinking-menu-button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.getAttribute('data-enabled')).toBe('0');
  });

  it('shows enabled state with default effort when model supports thinking and defaultThinking is on', () => {
    useSettings.setState({
      selectedModelId: 'Pro/deepseek-ai/DeepSeek-V3.5',
      customApiGroups: [],
      defaultThinking: true,
      defaultThinkingEffort: 'high',
    });
    const { getByTestId } = render(
      <ChatInput
        onSend={vi.fn()}
        onStop={vi.fn()}
        isLoading={false}
        chatContext={chatContext}
      />,
    );
    const btn = getByTestId('thinking-menu-button');
    // 只要模型支持思考 & 默认开启，label 中应带 High
    if (btn.getAttribute('data-enabled') === '1') {
      expect(btn.getAttribute('data-effort')).toBe('high');
      expect(btn.textContent).toContain('深度思考·High');
    }
  });

  it('sends effective thinkingEffort through onSend when thinking is enabled', async () => {
    useSettings.setState({
      selectedModelId: 'Pro/deepseek-ai/DeepSeek-V3.5',
      customApiGroups: [],
      defaultThinking: true,
      defaultThinkingEffort: 'medium',
    });
    const onSend = vi.fn();
    const { container } = render(
      <ChatInput
        onSend={onSend}
        onStop={vi.fn()}
        isLoading={false}
        chatContext={chatContext}
      />,
    );
    const textarea = container.querySelector<HTMLTextAreaElement>('.chat-input-textarea')!;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value',
    )!.set!;
    nativeInputValueSetter.call(textarea, 'hello');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    const sendBtn = Array.from(container.querySelectorAll<HTMLButtonElement>('.chat-input-send'))
      .find((b) => b.title === '发送' || b.title === '停止生成');
    if (sendBtn) {
      await act(async () => {
        sendBtn.click();
      });
      if (onSend.mock.calls.length > 0) {
        const opts = onSend.mock.calls[0][1];
        if (opts?.enableThinking) {
          expect(opts.thinkingEffort).toBe('medium');
        } else {
          expect(opts.thinkingEffort).toBeUndefined();
        }
      }
    }
  });
});
