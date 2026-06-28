import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageContent } from './MessageContent';

vi.mock('@/components/chat/ChatMessageVisualizations', () => ({
  ChatMessageVisualizations: ({
    tagName,
    childrenText,
  }: {
    tagName: string;
    childrenText: string;
  }) => <div data-testid={`viz-${tagName}`}>{childrenText}</div>,
}));

vi.mock('@/components/chat/ToolCallDashboard', () => ({
  ToolCallDashboard: () => <div data-testid="tool-call-dashboard" />,
}));

vi.mock('@/components/shared/CodeBlock', () => ({
  default: ({ children }: { children: React.ReactNode }) => <pre>{children}</pre>,
}));

vi.mock('@/components/canvas', () => ({
  RawSvgViewer: ({ svg }: { svg: string }) => (
    <div data-testid="raw-svg-viewer" dangerouslySetInnerHTML={{ __html: svg }} />
  ),
}));

vi.mock('@/lib/utils/sanitizeSvg', () => ({
  sanitizeSvg: (svg: string) => svg,
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MessageContent', () => {
  it('普通 details/summary HTML 不显示拆碎的裸文本片段', () => {
    const { container } = render(
      <MessageContent content="<details><summary>点击查看答案</summary>答案</details>" />,
    );

    expect(container.querySelector('details')).not.toBeNull();
    expect(screen.getByText('点击查看答案')).toBeInTheDocument();
    expect(screen.getByText('答案')).toBeInTheDocument();
    expect(screen.queryByText('<')).not.toBeInTheDocument();
    expect(screen.queryByText('details>')).not.toBeInTheDocument();
  });

  it('未知 PascalCase 标签不进入 React 原生 DOM，不触发 unrecognized tag warning', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { container } = render(
      <MessageContent content={'正文 <SomeNewWidget foo="bar">内容</SomeNewWidget> 结尾'} />,
    );

    expect(container.querySelector('somenewwidget')).toBeNull();
    const warningText = [...consoleError.mock.calls, ...consoleWarn.mock.calls].flat().join('\n');
    expect(warningText).not.toMatch(/unrecognized tag|incorrect casing/i);
  });

  it('FollowUp 控制标签不显示在正文，但渲染为追问按钮', () => {
    const onFollowUpSelect = vi.fn();

    render(
      <MessageContent
        content={'正文\n\n<FollowUp>继续解释|换个例子</FollowUp>'}
        onFollowUpSelect={onFollowUpSelect}
      />,
    );

    expect(screen.getByText('正文')).toBeInTheDocument();
    expect(screen.queryByText(/FollowUp/)).not.toBeInTheDocument();
    expect(screen.queryByText(/继续解释\|换个例子/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /继续解释/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /换个例子/ })).toBeInTheDocument();
  });
});
