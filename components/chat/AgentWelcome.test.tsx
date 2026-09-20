import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { translate } from '@/lib/i18n';
import {
  AGENT_WELCOME_EXAMPLES,
  AgentWelcomeExamples,
  AgentWelcomeGreeting,
  welcomeGreeting,
} from './AgentWelcome';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('welcomeGreeting', () => {
  it('按本机时间分档打招呼，一天 24 小时都有话说', () => {
    expect(welcomeGreeting(0)).toContain('夜深了');
    expect(welcomeGreeting(8)).toContain('早上好');
    expect(welcomeGreeting(12)).toContain('中午好');
    expect(welcomeGreeting(15)).toContain('下午好');
    expect(welcomeGreeting(20)).toContain('晚上好');
    expect(welcomeGreeting(23)).toContain('夜深了');
    for (let hour = 0; hour < 24; hour += 1) {
      expect(welcomeGreeting(hour)).toMatch(/想做点什么/);
    }
  });
});

describe('AgentWelcome', () => {
  it('问候语读的是本机时钟', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-20T09:00:00'));
    render(<AgentWelcomeGreeting />);
    expect(screen.getByTestId('agent-welcome-greeting')).toHaveTextContent('早上好，今天想做点什么？');
  });

  it('示例清单是一组可点的条目，点一下就把这句话发出去', () => {
    const onSelect = vi.fn();
    render(<AgentWelcomeExamples onSelect={onSelect} />);
    const list = screen.getByTestId('agent-welcome-examples');
    expect(list.querySelectorAll('button')).toHaveLength(AGENT_WELCOME_EXAMPLES.length);
    // 起手式文案搬进了词典：断言「组件渲染的是该 key 的中文」而不是组件文件里的字面量。
    for (const example of AGENT_WELCOME_EXAMPLES) {
      expect(screen.getByTestId(`agent-welcome-example-${example.id}`)).toHaveTextContent(translate('zh', example.textKey));
    }
    fireEvent.click(screen.getByTestId('agent-welcome-example-flashcards'));
    expect(onSelect).toHaveBeenCalledWith(translate('zh', AGENT_WELCOME_EXAMPLES[1].textKey));
  });
});
