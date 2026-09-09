'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AgentArrowUpIcon, AgentLoopIcon, AgentAlertIcon, AgentInfoIcon, AgentCloseIcon } from '@/components/icons/AgentIcons';
import ChatMessage from '@/components/chat/ChatMessage';
import { STICK_THRESHOLD_PX, useStickToBottom } from '@/lib/hooks/useStickToBottom';
import type { ChatMessage as ChatMessageType } from '@/lib/types/chat';

interface ChatThreadProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
  /** 非持久化的本次请求提示，例如备用端点切换；每个面板独立。 */
  info?: string | null;
  onClearInfo?: () => void;
  onFollowUpClick: (question: string) => void;
  /** IndexedDB 水合完成标志；false 时显示加载占位。默认 true。 */
  hydrated?: boolean;
  /** 水合后消息为空时展示（主面板传 ChatEmptyState；划词浮窗传简短提示）。 */
  emptyState?: React.ReactNode;
  /** 对话字号缩放（写入 --chat-fs）。默认 1。 */
  fontScale?: number;
  /** 浮动输入区实际占用高度，包含工具栏、附件/引用和安全间距。 */
  bottomInset?: number;
  /** 外部滚动容器 ref（主面板传入，供 SelectionPopover 绑定划词选区）。 */
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  sessionId?: string;
  repairModelId?: string;
  topic?: string;
}

/**
 * 对话转录视图：虚拟列表 + 滚动容器 + 水合占位 + 空态 + 加载/错误 + 回到底部。
 */
export default function ChatThread({
  messages,
  isLoading,
  error,
  onClearError,
  info,
  onClearInfo,
  onFollowUpClick,
  hydrated = true,
  emptyState,
  fontScale = 1,
  bottomInset = 0,
  scrollContainerRef,
  sessionId,
  repairModelId,
  topic,
}: ChatThreadProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const scrollRef = scrollContainerRef ?? internalRef;
  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;
  const wasLoadingRef = useRef(isLoading);

  const displayMessages = useMemo(
    () => messages.filter((m) => m.role === 'user' || m.role === 'assistant'),
    [messages],
  );
  const lastDisplay = displayMessages[displayMessages.length - 1];
  const lastDisplayId = lastDisplay?.id;
  const safeBottomInset = Number.isFinite(bottomInset) ? Math.max(0, bottomInset) : 0;
  // Keep the estimate close to a compact header + thinking line. A 120px floor
  // used to park 「AI 正在思考中」 far below 「AI 助教」 on the first streamed row.
  const MESSAGE_ESTIMATE_PX = 72;
  const reserveThreadLoading = lastDisplay?.role !== 'assistant';

  const virtualizer = useVirtualizer({
    count: displayMessages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => MESSAGE_ESTIMATE_PX,
    overscan: 4,
    getItemKey: (index) => displayMessages[index]?.id ?? index,
    initialRect: { width: 0, height: 480 },
  });
  // v3.17 把该回调放在 instance 上，不是 useVirtualizer options（计划 19 B3）。
  virtualizer.shouldAdjustScrollPositionOnItemSizeChange = (item, _delta, instance) => {
    if (isLoadingRef.current && item.index === instance.options.count - 1) return false;
    return true;
  };
  const virtualItems = virtualizer.getVirtualItems();
  const rows =
    virtualItems.length > 0
      ? virtualItems
      : displayMessages.slice(0, Math.min(displayMessages.length, 14)).map((_, index) => ({
          index,
          start: index * MESSAGE_ESTIMATE_PX,
        }));
  const totalSize = virtualizer.getTotalSize() || displayMessages.length * MESSAGE_ESTIMATE_PX;

  const { onScroll, isAtBottom, setWantStick, wantStickRef } = useStickToBottom(
    scrollRef,
    isLoading,
    STICK_THRESHOLD_PX,
    [safeBottomInset],
  );

  // 非流式：新消息且贴底时滚到末尾。流式刚结束对齐一次（无 smooth）。
  useEffect(() => {
    const finishedStreaming = wasLoadingRef.current && !isLoading;
    wasLoadingRef.current = isLoading;
    if (isLoading || !wantStickRef.current || displayMessages.length === 0) return;
    virtualizer.scrollToIndex(
      displayMessages.length - 1,
      finishedStreaming ? { align: 'end' } : { align: 'end', behavior: 'smooth' },
    );
    // virtualizer 引用稳定；safeBottomInset 变化由 stick-to-bottom deps 重启循环处理。
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 计划 19 B2：故意收窄依赖
  }, [displayMessages.length, isLoading]);

  const jumpToBottom = () => {
    if (displayMessages.length > 0) {
      virtualizer.scrollToIndex(displayMessages.length - 1, { align: 'end', behavior: 'smooth' });
    }
    setWantStick(true);
  };

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="chat-messages"
        style={{
          ['--chat-fs' as string]: `${Math.round(13 * fontScale)}px`,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          paddingBottom: safeBottomInset || undefined,
          overflowAnchor: 'none',
        } as React.CSSProperties}
      >
        {!hydrated ? (
          <div className="chat-loading">
            <AgentLoopIcon size={16} className="animate-pulse motion-reduce:animate-none" style={{ color: 'var(--ink-soft)' }} />
            <span className="chat-loading-text">正在加载历史记录...</span>
          </div>
        ) : displayMessages.length === 0 ? (
          emptyState ?? null
        ) : (
          <>
            <div
              style={{
                height: totalSize,
                width: '100%',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              {rows.map((virtualRow) => {
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
                      sessionId={sessionId}
                      repairModelId={repairModelId}
                      topic={topic}
                    />
                  </div>
                );
              })}
            </div>
            {reserveThreadLoading && (
              <div
                className="chat-loading"
                data-testid="chat-thread-loading"
                style={{ visibility: isLoading ? 'visible' : 'hidden' }}
                aria-hidden={!isLoading}
              >
                <AgentLoopIcon size={16} className="animate-pulse motion-reduce:animate-none" style={{ color: 'var(--ink-soft)' }} />
                <span className="chat-loading-text">AI 正在思考中...</span>
              </div>
            )}
          </>
        )}

        {info ? (
          <div role="status" aria-live="polite" className="mx-3 my-2 flex items-start gap-2 rounded-xl bg-[var(--md-sys-color-secondary-container)] px-3 py-2 text-xs text-[var(--md-sys-color-on-secondary-container)]">
            <AgentInfoIcon size={14} className="mt-0.5 shrink-0" />
            <span className="min-w-0 flex-1 break-words">{info}</span>
            {onClearInfo ? (
              <button type="button" onClick={onClearInfo} aria-label="关闭连接提示" className="shrink-0 rounded p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2">
                <AgentCloseIcon size={14} />
              </button>
            ) : null}
          </div>
        ) : null}

        {error && (
          <div className="chat-error" role="alert">
            <AgentAlertIcon size={16} />
            <span>{error}</span>
            <button type="button" onClick={onClearError} className="chat-error-close" aria-label="关闭错误提示">
              <AgentCloseIcon size={14} />
            </button>
          </div>
        )}
      </div>

      {!isAtBottom && (
        <button onClick={jumpToBottom} className="chat-scroll-btn" title="跟随最新输出" style={safeBottomInset ? { bottom: safeBottomInset + 8 } : undefined}>
          <AgentArrowUpIcon size={18} style={{ transform: 'rotate(180deg)' }} />
        </button>
      )}
    </>
  );
}
