'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import { AlertTriangle, X, MessageSquarePlus } from 'lucide-react';
import { useAutoHideChatHeader } from '@/lib/hooks/useAutoHideChatHeader';
import { useChat } from '@/lib/hooks/useChat';
import { useChatHistory } from '@/lib/hooks/useChatHistory';
import { useFloatingChats } from '@/lib/hooks/useFloatingChats';
import { useHydrated } from '@/lib/hooks/useHydrated';
import { useSettings } from '@/lib/hooks/useSettings';
import { useStore } from '@/lib/store';
import { useTokenTracker } from '@/lib/hooks/useTokenTracker';
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
  const { messages, isLoading, error, sendMessage, stopGeneration, clearError } = useChat(chatContext, chatOptions);
  const outbound = useStore((s) => s.outbound);
  const clearOutbound = useStore((s) => s.clearOutbound);
  const sessions = useChatHistory((s) => s.sessions);
  const activeSessionId = useChatHistory((s) => s.activeSessionId);
  const createSession = useChatHistory((s) => s.createSession);
  const deleteSession = useChatHistory((s) => s.deleteSession);
  const switchSession = useChatHistory((s) => s.switchSession);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [warnDismissed, setWarnDismissed] = useState(false);
  const [warnSessionId, setWarnSessionId] = useState(activeSessionId);
  const fontScale = useSettings((s) => s.fontScale);
  const hydrated = useHydrated(useChatHistory);

  const ctxTokens = useTokenTracker((s) => s.currentContextTokens);
  const ctxLimit = useTokenTracker((s) => s.modelContextLimit);
  const ctxRatio = ctxLimit > 0 ? ctxTokens / ctxLimit : 0;
  const showWarning = ctxRatio >= 0.8 && ctxRatio < 1 && !warnDismissed;
  const contextFull = ctxRatio >= 1;

  // 切换会话时复位「告警已忽略」标志：render 阶段对齐（React 官方推荐，避免 effect 内 setState）。
  if (activeSessionId !== warnSessionId) {
    setWarnSessionId(activeSessionId);
    setWarnDismissed(false);
  }

  // 切换会话时重置 token 统计——外部 store 同步，置于 effect。
  useEffect(() => {
    useTokenTracker.getState().resetSession();
  }, [activeSessionId]);

  useEffect(() => {
    return () => stopGeneration();
  }, [stopGeneration]);

  useEffect(() => {
    if (hydrated && outbound && outbound.content) {
      sendMessage(outbound.content);
      clearOutbound();
    }
  }, [outbound, sendMessage, clearOutbound, hydrated]);

  const handleSend = (content: string, options?: { quotedText?: string; enableThinking?: boolean; enableSearch?: boolean; attachments?: ChatAttachment[] }) => {
    sendMessage(content, options);
  };

  const handleFollowUpClick = useCallback((question: string) => sendMessage(question), [sendMessage]);
  const handleNewChat = () => {
    stopGeneration();
    createSession(chatContext);
    setWarnDismissed(false);
    useTokenTracker.getState().resetSession();
  };
  // 删除会话：若是正开着的划词会话，先关掉对应浮窗，再删数据。
  const handleDeleteSession = (id: string) => {
    const fc = useFloatingChats.getState();
    const win = fc.windows.find((w) => w.sessionId === id);
    if (win) fc.closeWindow(win.id);
    deleteSession(id);
  };

  const subjectName = chatContext?.subjectId === 'chemistry' ? '化学'
    : chatContext?.subjectId === 'physics' ? '物理'
    : '概率论';

  const hasUserSent = useMemo(() => messages.some((m) => m.role === 'user'), [messages]);
  const headerPinned = showSettings || showHistory;
  const {
    autoHideEnabled,
    headerVisible,
    onPointerEnter,
    onPointerLeave,
  } = useAutoHideChatHeader(hasUserSent, headerPinned);

  return (
    <div className={clsx('chat-panel', autoHideEnabled && 'chat-panel--auto-hide-header')}>
      <div
        className={clsx(
          'chat-header-sticky',
          autoHideEnabled && 'chat-header-sticky--overlay',
          autoHideEnabled && !headerVisible && 'chat-header-sticky--hidden',
        )}
        onMouseEnter={onPointerEnter}
        onMouseLeave={onPointerLeave}
      >
        {autoHideEnabled && <div className="chat-header-reveal-zone" aria-hidden />}
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
        onFollowUpClick={handleFollowUpClick}
        hydrated={hydrated}
        fontScale={fontScale}
        scrollContainerRef={scrollContainerRef}
        emptyState={
          <ChatEmptyState
            topic={chatContext?.currentTopic ?? ''}
            subjectName={subjectName}
            onFollowUpClick={handleFollowUpClick}
          />
        }
      />

      {/* 上下文溢出警告 / 阻止条 */}
      {contextFull && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', margin: '0 8px 4px',
          borderRadius: 10, fontSize: 12,
          background: 'var(--md-sys-color-error-container)',
          color: 'var(--md-sys-color-on-error-container)',
        }}>
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>上下文已满（{Math.round(ctxRatio * 100)}%），无法继续输入。请新建对话。</span>
          <button
            onClick={handleNewChat}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 8, border: 'none',
              background: 'var(--md-sys-color-error)', color: 'var(--md-sys-color-on-error)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            <MessageSquarePlus size={12} /> 新建对话
          </button>
        </div>
      )}

      {showWarning && !contextFull && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 12px', margin: '0 8px 4px',
          borderRadius: 10, fontSize: 11.5,
          background: 'color-mix(in srgb, var(--md-sys-color-tertiary) 12%, transparent)',
          color: 'var(--md-sys-color-tertiary)',
        }}>
          <AlertTriangle size={13} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>
            上下文已使用 {Math.round(ctxRatio * 100)}%，建议让 AI 总结对话要点后开启新对话，避免溢出影响质量。
          </span>
          <button
            onClick={() => setWarnDismissed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'inherit' }}
          >
            <X size={13} />
          </button>
        </div>
      )}

      <ChatInput
        onSend={handleSend}
        onStop={stopGeneration}
        isLoading={isLoading || !hydrated}
        chatContext={chatContext}
        onOpenSettings={() => setShowSettings(true)}
        disabled={contextFull}
        disabledReason="上下文已满，请新建对话继续"
      />

      {showSettings && <ChatSettings onClose={() => setShowSettings(false)} />}
      <SelectionPopover containerRef={scrollContainerRef} />

      {showHistory && (
        <ChatHistoryOverlay
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectMain={(id) => { switchSession(id); setShowHistory(false); }}
          onRestoreFloating={(id) => { useFloatingChats.getState().restoreWindow(id); setShowHistory(false); }}
          onDelete={handleDeleteSession}
          onClose={() => setShowHistory(false)}
        />
      )}
      <ImageLightbox />
    </div>
  );
};

export default ChatPanel;
