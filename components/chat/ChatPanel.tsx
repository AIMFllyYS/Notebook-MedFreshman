'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ArrowDown, Loader, AlertTriangle, X } from 'lucide-react';
import { useChat } from '@/lib/hooks/useChat';
import { useChatHistory } from '@/lib/hooks/useChatHistory';
import { useSettings } from '@/lib/hooks/useSettings';
import { useStore } from '@/lib/store';
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
  const fontScale = useSettings((s) => s.fontScale);

  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  useEffect(() => {
    if (outbound && outbound.content) {
      sendMessage(outbound.content);
      clearOutbound();
    }
  }, [outbound, sendMessage, clearOutbound]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100);
  };

  const handleSend = (content: string, options?: { quotedText?: string; enableThinking?: boolean; enableSearch?: boolean }) => {
    sendMessage(content, options);
  };

  const handleFollowUpClick = (question: string) => sendMessage(question);
  const handleNewChat = () => createSession(chatContext);
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
        {messages.length === 0 ? (
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

      <ChatInput
        onSend={handleSend}
        onStop={stopGeneration}
        isLoading={isLoading}
        chatContext={chatContext}
        onOpenSettings={() => setShowSettings(true)}
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
