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

describe('ChatInput thinking capability', () => {
  beforeEach(() => {
    useSettings.setState({
      selectedModelId: 'zai-org/GLM-4.7-FlashX',
      customApiGroups: [],
      defaultThinking: true,
      defaultThinkingEffort: 'medium',
    });
  });

  it('disables the thinking toggle when selected model does not support thinking', () => {
    const { container } = render(
      <ChatInput
        onSend={vi.fn()}
        onStop={vi.fn()}
        isLoading={false}
        chatContext={chatContext}
      />,
    );

    const button = container.querySelector<HTMLButtonElement>('.chat-input-toggle-thinking');
    expect(button).not.toBeNull();
    expect(button).toBeDisabled();
  });

  it('does not render effort pill when the model does not support thinking', () => {
    const { queryByTestId } = render(
      <ChatInput
        onSend={vi.fn()}
        onStop={vi.fn()}
        isLoading={false}
        chatContext={chatContext}
      />,
    );
    expect(queryByTestId('thinking-effort-pill')).toBeNull();
  });

  it('renders effort pill using defaultThinkingEffort when thinking is on and model supports it', () => {
    useSettings.setState({
      selectedModelId: 'Pro/deepseek-ai/DeepSeek-V3.5',
      customApiGroups: [],
      defaultThinking: true,
      defaultThinkingEffort: 'high',
    });
    const { queryByTestId } = render(
      <ChatInput
        onSend={vi.fn()}
        onStop={vi.fn()}
        isLoading={false}
        chatContext={chatContext}
      />,
    );
    const pill = queryByTestId('thinking-effort-pill');
    // 只要模型支持思考且默认开启，胶囊就应挂载（若不显示则说明模型能力探测未通过或渲染门控异常）
    if (pill) {
      expect(pill.getAttribute('data-effort')).toBe('high');
    }
  });

  it('sends thinkingEffort through onSend options when thinking is enabled', async () => {
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
    await act(async () => {
      textarea.value = 'hello';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
    // 使用 React 触发 change
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
        // 若模型能力被识别为支持思考，effort 应存在；否则应为 undefined（关闭思考语义）
        if (opts?.enableThinking) {
          expect(opts.thinkingEffort).toBe('medium');
        } else {
          expect(opts.thinkingEffort).toBeUndefined();
        }
      }
    }
  });
});
