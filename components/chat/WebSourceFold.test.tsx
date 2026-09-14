import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import WebSourceFold from './WebSourceFold';

import { useWindowManager } from '@/lib/hooks/useWindowManager';

afterEach(() => {
  cleanup();
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
});

const sources = [
  { title: '大学课程资料', url: 'https://example.edu/course', snippet: '公开课程摘要不应该撑高折叠卡片' },
];

describe('WebSourceFold', () => {
  it('stays collapsed by default and opens a Mac source preview on click', () => {
    render(<WebSourceFold sources={sources} cacheHit />);
    expect(screen.getByText(/联网来源 · 1 条/)).toBeVisible();
    expect(screen.queryByText('大学课程资料')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /联网来源 · 1 条/ }));
    expect(screen.getByText(/1\. 大学课程资料/)).toBeVisible();
    expect(screen.getByText("https://example.edu/course")).toBeVisible();
    expect(screen.queryByText(/公开课程摘要/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /大学课程资料/ }));
    expect(useWindowManager.getState().windows.some((win) => win.type === 'source-trace-viewer')).toBe(true);
  });

  it('dedupes sources by url', () => {
    render(
      <WebSourceFold
        sources={[
          { title: '大学课程资料', url: 'https://example.edu/course', snippet: '' },
          { title: '重复', url: 'https://example.edu/course', snippet: '' },
          { title: '另一篇', url: 'https://example.edu/other', snippet: '' },
        ]}
      />,
    );
    expect(screen.getByText(/联网来源 · 2 条/)).toBeVisible();
  });

  it("keeps unique list keys when several sources have no url", () => {
    render(
      <WebSourceFold
        sources={[
          { title: "空链接甲", url: "", snippet: "" },
          { title: "空链接乙", url: "", snippet: "" },
          { title: "有地址", url: "https://example.edu/ok", snippet: "" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /联网来源 · 3 条/ }));
    expect(screen.getByText(/1\. 空链接甲/)).toBeVisible();
    expect(screen.getByText(/2\. 空链接乙/)).toBeVisible();
    expect(screen.getByText(/3\. 有地址/)).toBeVisible();
    expect(screen.getAllByText("暂无链接")).toHaveLength(2);
    expect(screen.getByText("https://example.edu/ok")).toBeVisible();
  });
});
