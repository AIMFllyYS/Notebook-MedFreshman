import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
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
});
