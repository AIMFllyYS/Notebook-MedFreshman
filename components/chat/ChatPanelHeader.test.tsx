import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ChatPanelHeader from './ChatPanelHeader';

describe('ChatPanelHeader native assistant glyphs', () => {
  it('keeps topic, accessible button labels and each toolbar action intact', () => {
    const onOpenSettings = vi.fn();
    const onOpenHistory = vi.fn();
    const onNewChat = vi.fn();
    const { container, getByText, getByTitle } = render(<ChatPanelHeader topic="细胞生物学" onOpenSettings={onOpenSettings}
      onOpenHistory={onOpenHistory} onNewChat={onNewChat} />);
    expect(getByText('AI 助教')).toBeTruthy();
    expect(getByText('细胞生物学')).toBeTruthy();
    expect(container.querySelector('[data-agent-icon="loop"]')).not.toBeNull();
    expect(getByTitle('AI 设置').querySelector('[data-agent-icon="settings"]')).not.toBeNull();
    expect(getByTitle('历史记录').querySelector('[data-agent-icon="history"]')).not.toBeNull();
    expect(getByTitle('开启新对话').querySelector('[data-agent-icon="plus"]')).not.toBeNull();
    fireEvent.click(getByTitle('AI 设置'));
    fireEvent.click(getByTitle('历史记录'));
    fireEvent.click(getByTitle('开启新对话'));
    expect(onOpenSettings).toHaveBeenCalledOnce();
    expect(onOpenHistory).toHaveBeenCalledOnce();
    expect(onNewChat).toHaveBeenCalledOnce();
    expect(container.querySelector('.lucide')).toBeNull();
    for (const icon of container.querySelectorAll('svg')) expect(icon.getAttribute('aria-hidden')).toBe('true');
  });
});
