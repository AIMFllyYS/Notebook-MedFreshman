'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import { AgentAlertIcon, AgentPlusIcon } from '@/components/icons/AgentIcons';
import { useAutoHideChatHeader } from '@/lib/hooks/useAutoHideChatHeader';
import { useChat } from '@/lib/hooks/useChat';
import { useChatHistory, ensureChatHistoryBootstrap } from '@/lib/hooks/useChatHistory';
import { useFloatingChats } from '@/lib/hooks/useFloatingChats';
import { useChatReady } from '@/lib/hooks/useChatReady';
import { useSettings } from '@/lib/hooks/useSettings';
import { useStore } from '@/lib/store';
import { useTokenTracker } from '@/lib/hooks/useTokenTracker';
import { subjectShortName } from '@/lib/content-data/subjects.registry';
import SelectionPopover from '@/components/notes/SelectionPopover';
import ChatThread from '@/components/chat/ChatThread';
import ChatInput from '@/components/chat/ChatInput';
import ChatSettings from '@/components/chat/ChatSettings';
import { ImageLightbox } from '@/components/shared/ImageLightbox';
import ChatPanelHeader from '@/components/chat/ChatPanelHeader';
import ChatEmptyState from '@/components/chat/ChatEmptyState';
import ChatHistoryOverlay from '@/components/chat/ChatHistoryOverlay';
import type { ChatContext, ChatOptions, ChatAttachment } from '@/lib/types/chat';

interface ChatPanelProps {
  chatContext: ChatContext;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ chatContext }) => {
  const [chatOptions] = useState<ChatOptions>({
    enableThinking: false,
    enableSearch: false,
    contextMode: 'full',
  });
  const { messages, isLoading, error, info, sendMessage, stopGeneration, clearError, clearInfo, sessionId } = useChat(chatContext, chatOptions);
  const outbound = useStore((s) => s.outbound);
  const clearOutbound = useStore((s) => s.clearOutbound);
  const activeSessionId = useChatHistory((s) => s.activeSessionId);
  const createSession = useChatHistory((s) => s.createSession);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [composerInset, setComposerInset] = useState(150);
  const fontScale = useSettings((s) => s.fontScale);
  const selectedModelId = useSettings((s) => s.selectedModelId);
  const chatReady = useChatReady();

  useEffect(() => {
    void ensureChatHistoryBootstrap();
  }, []);

  const ctxTokens = useTokenTracker((s) => s.currentContextTokens);
  const ctxLimit = useTokenTracker((s) => s.modelContextLimit);
  const contextWarning = useTokenTracker((s) => s.contextWarning);
  const contextTruncated = useTokenTracker((s) => s.contextTruncated);
  const ctxRatio = ctxLimit > 0 ? ctxTokens / ctxLimit : 0;
  const showWarning = ctxRatio >= 0.8 || contextTruncated;

  // 切换会话时重置 token 统计——外部 store 同步，置于 effect。
  useEffect(() => {
    useTokenTracker.getState().resetSession();
  }, [activeSessionId]);

  useEffect(() => {
    return () => stopGeneration();
  }, [stopGeneration]);

  useEffect(() => {
    if (!chatReady || isLoading || !outbound?.content.trim()) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled || useStore.getState().outbound !== outbound) return;
      // busy/hydration 的同步门控可能在 effect 排队后变化；被拒绝的项仍等待下一次就绪。
      if (sendMessage(outbound.content) && useStore.getState().outbound === outbound) clearOutbound();
    });
    return () => { cancelled = true; };
  }, [outbound, sendMessage, clearOutbound, chatReady, isLoading]);

  const handleSend = (content: string, options?: { quotedText?: string; enableThinking?: boolean; enableSearch?: boolean; attachments?: ChatAttachment[] }) => {
    sendMessage(content, options);
  };

  const handleFollowUpClick = useCallback((question: string) => sendMessage(question), [sendMessage]);
  const handleNewChat = () => {
    stopGeneration();
    createSession(chatContext);
    useTokenTracker.getState().resetSession();
  };
  const subjectName = subjectShortName(chatContext?.subjectId);

  const hasUserSent = useMemo(() => messages.some((m) => m.role === 'user'), [messages]);
  const headerPinned = showSettings || showHistory;
  const {
    autoHideEnabled,
    headerCollapsed,
    onRevealZoneEnter,
    onHeaderEnter,
    onHeaderLeave,
    onHeaderPointerDown,
    onHeaderPointerUp,
  } = useAutoHideChatHeader(hasUserSent, headerPinned);

  return (
    <div
      className={clsx(
        'chat-panel',
        autoHideEnabled && 'chat-panel--auto-hide-header',
        headerCollapsed && 'chat-panel--header-collapsed',
      )}
    >
      {/* 收起态：容器内窄感应条唤出；展开态：不渲染感应条，按钮直接可点 */}
      <div
        className={clsx(
          'chat-header-sticky',
          autoHideEnabled && 'chat-header-sticky--overlay',
          headerCollapsed && 'chat-header-sticky--hidden',
        )}
        aria-hidden={headerCollapsed || undefined}
        onPointerEnter={onHeaderEnter}
        onPointerLeave={onHeaderLeave}
        onPointerDown={onHeaderPointerDown}
        onPointerUp={onHeaderPointerUp}
      >
        {autoHideEnabled && headerCollapsed && (
          <div
            className="chat-header-reveal-zone"
            aria-hidden
            onPointerEnter={onRevealZoneEnter}
          />
        )}
        <ChatPanelHeader
          topic={chatContext?.currentTopic ?? ''}
          onOpenSettings={() => setShowSettings(true)}
          onOpenHistory={() => setShowHistory(true)}
          onNewChat={handleNewChat}
        />
      </div>

      <ChatThread
        messages={messages}
        isLoading={isLoading}
        error={error}
        onClearError={clearError}
        info={info}
        onClearInfo={clearInfo}
        onFollowUpClick={handleFollowUpClick}
        hydrated={chatReady}
        fontScale={fontScale}
        bottomInset={composerInset}
        scrollContainerRef={scrollContainerRef}
        sessionId={sessionId ?? undefined}
        repairModelId={selectedModelId}
        topic={chatContext?.currentTopic ?? ''}
        emptyState={
          <ChatEmptyState
            topic={chatContext?.currentTopic ?? ''}
            subjectName={subjectName}
            onFollowUpClick={handleFollowUpClick}
          />
        }
      />

      <ChatInput
        onSend={handleSend}
        onStop={stopGeneration}
        isLoading={isLoading || !chatReady}
        chatContext={chatContext}
        onOpenSettings={() => setShowSettings(true)}
        onComposerInsetChange={setComposerInset}
        notice={showWarning ? (
          <div role="status" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', marginBottom: 8,
            borderRadius: 10, fontSize: 12,
            background: 'var(--md-sys-color-error-container)',
            color: 'var(--md-sys-color-on-error-container)',
          }}>
            <AgentAlertIcon size={14} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>
              {contextWarning || `上下文已使用 ${Math.round(ctxRatio * 100)}%，之后请求会自动压缩较早对话；你仍然可以继续输入。`}
            </span>
            <button type="button" onClick={handleNewChat} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 8, border: 'none',
              background: 'var(--md-sys-color-error)', color: 'var(--md-sys-color-on-error)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              <AgentPlusIcon size={12} /> 新建对话
            </button>
          </div>
        ) : null}
      />

      {showSettings && <ChatSettings onClose={() => setShowSettings(false)} />}
      <SelectionPopover containerRef={scrollContainerRef} />

      {showHistory && (
        <ChatHistoryOverlay
          onSelectMain={(id) => { useChatHistory.getState().switchSession(id); setShowHistory(false); }}
          onRestoreFloating={(id) => { useFloatingChats.getState().restoreWindow(id); setShowHistory(false); }}
          onClose={() => setShowHistory(false)}
        />
      )}
      <ImageLightbox />
    </div>
  );
};

export default ChatPanel;
