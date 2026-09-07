import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
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
      selectedModelId: 'Tongyi-MAI/Z-Image-Turbo',
      customApiGroups: [],
      defaultThinking: true,
      defaultThinkingEffort: 'medium',
    });
  });

  it('custom send/stop/attachment glyphs preserve keyboard actions and floating model thinking override', () => {
    useSettings.setState({ defaultThinking: true, defaultThinkingEffort: 'high' });
    const onSend = vi.fn();
    const onStop = vi.fn();
    const props = { onSend, onStop, isLoading: false, chatContext, modelId: 'mimo-v2.5', onModelChange: vi.fn() };
    const { container, getByTitle, getByRole, getByTestId, rerender } = render(<ChatInput {...props} />);
    expect(getByTestId('thinking-menu-button')).not.toBeDisabled();
    expect(getByTitle('发送').querySelector('[data-agent-icon="arrow-up"]')).not.toBeNull();
    expect(getByTitle('上传图片附件').querySelector('[data-agent-icon="paperclip"]')).not.toBeNull();
    expect(getByTitle('联网搜索（需配置搜索API）').querySelector('[data-agent-icon="globe"]')).not.toBeNull();
    fireEvent.change(getByRole('textbox'), { target: { value: '解释这一页' } });
    fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });
    expect(onSend).toHaveBeenCalledOnce();
    expect(onSend).toHaveBeenCalledWith('解释这一页', expect.objectContaining({ enableThinking: true, thinkingEffort: 'high' }));
    expect(useSettings.getState().selectedModelId).toBe('Tongyi-MAI/Z-Image-Turbo');
    rerender(<ChatInput {...props} isLoading />);
    expect(getByTitle('停止生成').querySelector('[data-agent-icon="stop"]')).not.toBeNull();
    fireEvent.click(getByTitle('停止生成'));
    expect(onStop).toHaveBeenCalledOnce();
    expect(container.querySelector('.lucide')).toBeNull();
  });

  it('hides thinking menu button when the model does not support thinking', () => {
    const { queryByTestId } = render(
      <ChatInput
        onSend={vi.fn()}
        onStop={vi.fn()}
        isLoading={false}
        chatContext={chatContext}
      />,
    );
    expect(queryByTestId('thinking-menu-button')).toBeNull();
  });

  it('shows enabled state with default effort when model supports thinking and defaultThinking is on', () => {
    useSettings.setState({
      selectedModelId: 'mimo-v2.5',
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
    expect(btn.getAttribute('data-enabled')).toBe('1');
    expect(btn.getAttribute('data-effort')).toBe('high');
    expect(btn.textContent).toContain('深度思考·High');
  });

  it('sends effective thinkingEffort through onSend when thinking is enabled', async () => {
    useSettings.setState({
      selectedModelId: 'mimo-v2.5',
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
    fireEvent.change(textarea, { target: { value: 'hello' } });

    const sendBtn = Array.from(container.querySelectorAll<HTMLButtonElement>('.chat-input-send'))
      .find((b) => b.title === '发送' || b.title === '停止生成');
    expect(sendBtn).toBeDefined();
    await act(async () => { sendBtn!.click(); });
    expect(onSend).toHaveBeenCalledOnce();
    expect(onSend).toHaveBeenCalledWith('hello', expect.objectContaining({ enableThinking: true, thinkingEffort: 'medium' }));
  });
});
