import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import NoteCitationCard from './NoteCitationCard';
import { useNoteCitations } from '@/lib/hooks/useNoteCitations';
import { useWindowManager } from '@/lib/hooks/useWindowManager';

afterEach(() => {
  cleanup();
  useNoteCitations.getState().closeViewer();
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
});

const hits = [
  { title: '贝叶斯公式', path: 'probability/detail/1.4', snippet: '很长的笔记片段不应该出现在折叠块里' },
  { title: '全概率公式', path: 'probability/detail/1.3', snippet: '另一段也很长的正文' },
];

describe('NoteCitationCard', () => {
  it('stays collapsed by default and does not render snippets in the chat', () => {
    render(<NoteCitationCard hits={hits} />);
    expect(screen.getByText(/引用笔记 · 2 条/)).toBeVisible();
    expect(screen.queryByText('贝叶斯公式')).not.toBeInTheDocument();
    expect(screen.queryByText(/很长的笔记片段/)).not.toBeInTheDocument();
  });

  it('expands to title rows only and opens the Mac viewer without inlining bodies', () => {
    render(<NoteCitationCard hits={hits} />);
    fireEvent.click(screen.getByRole('button', { name: /引用笔记 · 2 条/ }));
    expect(screen.getByText('贝叶斯公式')).toBeVisible();
    expect(screen.queryByText(/很长的笔记片段/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '查看' }));
    expect(useNoteCitations.getState().activePath).toBe('probability/detail/1.4');
    expect(useWindowManager.getState().windows.some((w) => w.type === 'note-citation-viewer')).toBe(true);
  });
});
