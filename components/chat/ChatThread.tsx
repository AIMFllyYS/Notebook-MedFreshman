'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, Loader, AlertTriangle, X } from 'lucide-react';
import ChatMessage from '@/components/chat/ChatMessage';
import type { ChatMessage as ChatMessageType } from '@/lib/types/chat';

interface ChatThreadProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
  onFollowUpClick: (question: string) => void;
  /** IndexedDB 水合完成标志；false 时显示加载占位。默认 true。 */
  hydrated?: boolean;
  /** 水合后消息为空时展示（主面板传 ChatEmptyState；划词浮窗传简短提示）。 */
  emptyState?: React.ReactNode;
  /** 对话字号缩放（写入 --chat-fs）。默认 1。 */
  fontScale?: number;
  /** 外部滚动容器 ref（主面板传入，供 SelectionPopover 绑定划词选区）。 */
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * 对话转录视图：滚动容器 + 水合占位 + 空态 + 消息列表 + 加载/错误 + 回到底部。
 * 主对话面板与划词浮窗共用同一套消息渲染（ChatMessage：工具/交互演示/检索引用/FollowUp 全支持）。
 * 返回 Fragment（而非包裹 div），让 .chat-messages 直接作为父级 flex 子节点撑满高度，
 * 回到底部按钮以最近的定位祖先（.chat-panel / 浮窗根）为基准绝对定位。
 */
export default function ChatThread({
  messages,
  isLoading,
  error,
  onClearError,
  onFollowUpClick,
  hydrated = true,
  emptyState,
  fontScale = 1,
  scrollContainerRef,
}: ChatThreadProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const scrollRef = scrollContainerRef ?? internalRef;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  // ref 镜像，供 rAF 跟随循环读取最新「是否在底部」而不重启循环。
  const isAtBottomRef = useRef(true);
  const setAtBottom = (v: boolean) => {
    isAtBottomRef.current = v;
    setIsAtBottom(v);
  };

  // 非流式：新消息出现/生成完成且仍在底部 → 平滑滚到底，做最终落位。
  useEffect(() => {
    if (isLoading) return;
    if (isAtBottomRef.current) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 流式贴底跟随：rAF 即时钉底，覆盖 token 流入 + 思考/工具面板展开动画带来的高度变化
  // （smooth 跟不上、动画期 messages 不变故 effect 不触发）。用户上滑 → isAtBottom 置否
  // → 停止跟随、可自由上下；滑回最底部（<100px）→ handleScroll 重新置真 → 恢复跟随。
  useEffect(() => {
    if (!isLoading) return;
    let raf = 0;
    const tick = () => {
      const el = scrollRef.current;
      if (el && isAtBottomRef.current && el.scrollHeight - el.scrollTop - el.clientHeight > 1) {
        el.scrollTop = el.scrollHeight;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isLoading, scrollRef]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 100);
  };

  const jumpToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setAtBottom(true);
  };

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="chat-messages"
        style={{ ['--chat-fs' as string]: `${Math.round(13 * fontScale)}px` } as React.CSSProperties}
      >
        {!hydrated ? (
          <div className="chat-loading">
            <Loader size={16} className="animate-spin" style={{ color: 'var(--md-sys-color-primary)' }} />
            <span className="chat-loading-text">正在加载历史记录...</span>
          </div>
        ) : messages.length === 0 ? (
          emptyState ?? null
        ) : (
          <>
            {messages.filter((m) => m.role !== 'tool').map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onFollowUpSelect={onFollowUpClick}
                isStreaming={isLoading && msg === messages[messages.length - 1] && msg.role === 'assistant'}
              />
            ))}
            {isLoading && (
              <div className="chat-loading">
                <Loader size={16} className="animate-spin" style={{ color: 'var(--md-sys-color-primary)' }} />
                <span className="chat-loading-text">AI 正在思考中...</span>
              </div>
            )}
          </>
        )}

        {error && (
          <div className="chat-error">
            <AlertTriangle size={16} />
            <span>{error}</span>
            <button onClick={onClearError} className="chat-error-close">
              <X size={14} />
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!isAtBottom && (
        <button onClick={jumpToBottom} className="chat-scroll-btn" title="跟随最新输出">
          <ArrowDown size={18} />
        </button>
      )}
    </>
  );
}
