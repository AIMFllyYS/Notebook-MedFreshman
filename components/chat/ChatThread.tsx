'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowDown, Loader, AlertTriangle, X } from 'lucide-react';
import ChatMessage from '@/components/chat/ChatMessage';
import { useStickToBottom } from '@/lib/hooks/useStickToBottom';
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
 * 对话转录视图：虚拟列表 + 滚动容器 + 水合占位 + 空态 + 加载/错误 + 回到底部。
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
  const [isAtBottom, setIsAtBottom] = useState(true);
  const isAtBottomRef = useRef(true);
  const setAtBottom = (v: boolean) => {
    isAtBottomRef.current = v;
    setIsAtBottom(v);
  };

  const displayMessages = useMemo(
    () => messages.filter((m) => m.role !== 'tool'),
    [messages],
  );
  const lastDisplayId = displayMessages[displayMessages.length - 1]?.id;

  const virtualizer = useVirtualizer({
    count: displayMessages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 120,
    overscan: 10,
    getItemKey: (index) => displayMessages[index]?.id ?? index,
  });

  const onStickScroll = useStickToBottom(scrollRef, isLoading);

  const handleScroll = () => {
    onStickScroll();
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 100);
  };

  // 非流式：新消息且贴底时滚到末尾
  useEffect(() => {
    if (isLoading || !isAtBottomRef.current || displayMessages.length === 0) return;
    virtualizer.scrollToIndex(displayMessages.length - 1, { align: 'end', behavior: 'smooth' });
  }, [displayMessages.length, isLoading, virtualizer]);

  // 流式：钉住最后一条（高度变化时 measureElement + stick-to-bottom 协同）
  useEffect(() => {
    if (!isLoading || !isAtBottomRef.current || displayMessages.length === 0) return;
    virtualizer.scrollToIndex(displayMessages.length - 1, { align: 'end' });
  }, [messages, isLoading, displayMessages.length, virtualizer]);

  const jumpToBottom = () => {
    if (displayMessages.length > 0) {
      virtualizer.scrollToIndex(displayMessages.length - 1, { align: 'end', behavior: 'smooth' });
    }
    setAtBottom(true);
  };

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="chat-messages"
        style={{
          ['--chat-fs' as string]: `${Math.round(13 * fontScale)}px`,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
        } as React.CSSProperties}
      >
        {!hydrated ? (
          <div className="chat-loading">
            <Loader size={16} className="animate-spin" style={{ color: 'var(--md-sys-color-primary)' }} />
            <span className="chat-loading-text">正在加载历史记录...</span>
          </div>
        ) : displayMessages.length === 0 ? (
          emptyState ?? null
        ) : (
          <>
            <div
              style={{
                height: virtualizer.getTotalSize(),
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const msg = displayMessages[virtualRow.index];
                if (!msg) return null;
                return (
                  <div
                    key={msg.id}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <ChatMessage
                      message={msg}
                      onFollowUpSelect={onFollowUpClick}
                      isStreaming={isLoading && msg.id === lastDisplayId && msg.role === 'assistant'}
                    />
                  </div>
                );
              })}
            </div>
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
      </div>

      {!isAtBottom && (
        <button onClick={jumpToBottom} className="chat-scroll-btn" title="跟随最新输出">
          <ArrowDown size={18} />
        </button>
      )}
    </>
  );
}
