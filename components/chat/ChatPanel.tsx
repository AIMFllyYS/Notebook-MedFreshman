'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowDown, Loader, AlertTriangle, X, MessageSquarePlus } from 'lucide-react';
import { useChat } from '@/lib/hooks/useChat';
import { useChatHistory } from '@/lib/hooks/useChatHistory';
import { useHydrated } from '@/lib/hooks/useHydrated';
import { useSettings } from '@/lib/hooks/useSettings';
import { useStore } from '@/lib/store';
import { useTokenTracker } from '@/lib/hooks/useTokenTracker';
import SelectionPopover from '@/components/notes/SelectionPopover';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import ChatSettings from '@/components/chat/ChatSettings';
import ArtifactViewer from '@/components/chat/ArtifactViewer';
import ChatPanelHeader from '@/components/chat/ChatPanelHeader';
import ChatEmptyState from '@/components/chat/ChatEmptyState';
import ChatHistoryOverlay from '@/components/chat/ChatHistoryOverlay';
import type { ChatContext, ChatOptions } from '@/lib/types/chat';

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [warnDismissed, setWarnDismissed] = useState(false);
  const fontScale = useSettings((s) => s.fontScale);
  const hydrated = useHydrated(useChatHistory);

  const ctxTokens = useTokenTracker((s) => s.currentContextTokens);
  const ctxLimit = useTokenTracker((s) => s.modelContextLimit);
  const ctxRatio = ctxLimit > 0 ? ctxTokens / ctxLimit : 0;
  const showWarning = ctxRatio >= 0.8 && ctxRatio < 1 && !warnDismissed;
  const contextFull = ctxRatio >= 1;

  useEffect(() => {
    useTokenTracker.getState().resetSession();
    setWarnDismissed(false);
  }, [activeSessionId]);

  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  useEffect(() => {
    if (hydrated && outbound && outbound.content) {
      sendMessage(outbound.content);
      clearOutbound();
    }
  }, [outbound, sendMessage, clearOutbound, hydrated]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100);
  };

  const handleSend = (content: string, options?: { quotedText?: string; enableThinking?: boolean; enableSearch?: boolean }) => {
    sendMessage(content, options);
  };

  const handleFollowUpClick = useCallback((question: string) => sendMessage(question), [sendMessage]);
  const handleNewChat = () => {
    createSession(chatContext);
    setWarnDismissed(false);
    useTokenTracker.getState().resetSession();
  };
  const handleClearCurrent = () => { if (activeSessionId) deleteSession(activeSessionId); };

  const subjectName = chatContext?.subjectId === 'chemistry' ? '化学'
    : chatContext?.subjectId === 'physics' ? '物理'
    : '概率论';

  return (
    <div className="chat-panel">
      <ChatPanelHeader
        topic={chatContext?.currentTopic ?? ''}
        hasMessages={messages.length > 0}
        onOpenSettings={() => setShowSettings(true)}
        onOpenHistory={() => setShowHistory(true)}
        onNewChat={handleNewChat}
        onClearCurrent={handleClearCurrent}
      />

      <div
        ref={scrollContainerRef}
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
          <ChatEmptyState
            topic={chatContext?.currentTopic ?? ''}
            subjectName={subjectName}
            onFollowUpClick={handleFollowUpClick}
          />
        ) : (
          <>
            {messages.filter((m) => m.role !== 'tool').map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onFollowUpSelect={handleFollowUpClick}
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
            <button onClick={clearError} className="chat-error-close">
              <X size={14} />
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!isAtBottom && (
        <button
          onClick={() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); setIsAtBottom(true); }}
          className="chat-scroll-btn"
          title="跟随最新输出"
        >
          <ArrowDown size={18} />
        </button>
      )}

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
      <ArtifactViewer />

      {showHistory && (
        <ChatHistoryOverlay
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={(id) => { switchSession(id); setShowHistory(false); }}
          onDelete={deleteSession}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

export default ChatPanel;
