'use client';

import React, { useSyncExternalStore } from 'react';
import { Globe, Layers, MousePointerClick, NotebookPen } from 'lucide-react';

/**
 * Agent 空对话欢迎页：问候语在上、输入框居中、示例清单在下（对齐 ChatGPT 官网那种首页）。
 *
 * 这里刻意不做「我是你的 X 助教 + 当前学习：Y」那一套：Agent 是通用型助手，
 * 开新对话时不预设主题，示例只是几条**能直接点走**的起手式，点下去就等于把这句话发出去。
 */
export interface AgentWelcomeExample {
  id: string;
  text: string;
  icon: React.ReactNode;
}

/** 起手式覆盖 Agent 真正能做的几类事：整理笔记 / 出闪卡 / 交互演示 / 联网查资料。 */
export const AGENT_WELCOME_EXAMPLES: readonly AgentWelcomeExample[] = [
  { id: 'outline', text: '把今天的课堂笔记整理成复习提纲', icon: <NotebookPen size={15} /> },
  { id: 'flashcards', text: '按我的笔记出 5 张复习闪卡', icon: <Layers size={15} /> },
  { id: 'demo', text: '做一个可拖动的演示，帮我理解一个公式', icon: <MousePointerClick size={15} /> },
  { id: 'brief', text: '查一下最新资料，整理成一页简报', icon: <Globe size={15} /> },
];

/** 按本机时间分档打招呼；纯函数，方便单测直接钉住每一档。 */
export function welcomeGreeting(hour: number): string {
  if (hour < 5) return '夜深了，想做点什么？';
  if (hour < 11) return '早上好，今天想做点什么？';
  if (hour < 13) return '中午好，想做点什么？';
  if (hour < 18) return '下午好，今天想做点什么？';
  if (hour < 23) return '晚上好，想做点什么？';
  return '夜深了，想做点什么？';
}

/**
 * 时钟是外部可变值，用 useSyncExternalStore 读：服务端快照给空串，
 * 于是首帧水合与客户端不一致的风险为零（欢迎页本身也只在客户端就绪后才出现）。
 */
const subscribeClock = () => () => {};
const readHour = () => new Date().getHours();
const readHourOnServer = () => -1;

export function AgentWelcomeGreeting() {
  const hour = useSyncExternalStore(subscribeClock, readHour, readHourOnServer);
  if (hour < 0) return null;
  return (
    <p className="chat-welcome-greeting animate-fade-up" data-testid="agent-welcome-greeting">
      {welcomeGreeting(hour)}
    </p>
  );
}

export function AgentWelcomeExamples({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="chat-welcome-examples animate-fade-up" data-testid="agent-welcome-examples">
      {AGENT_WELCOME_EXAMPLES.map((example) => (
        <button
          key={example.id}
          type="button"
          onClick={() => onSelect(example.text)}
          className="chat-welcome-example press"
          data-testid={`agent-welcome-example-${example.id}`}
        >
          <span className="chat-welcome-example-icon" aria-hidden>{example.icon}</span>
          <span className="chat-welcome-example-text">{example.text}</span>
        </button>
      ))}
    </div>
  );
}
