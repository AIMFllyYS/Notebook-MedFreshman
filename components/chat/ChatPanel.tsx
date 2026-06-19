'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Sparkles, Plus, Trash2, Clock, X, ArrowDown, Loader, AlertTriangle, Settings,
} from 'lucide-react';
import { useChat } from '@/lib/hooks/useChat';
import { useChatHistory, type ChatSession } from '@/lib/hooks/useChatHistory';
import { useSettings } from '@/lib/hooks/useSettings';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import ChatSettings from '@/components/chat/ChatSettings';
import { FollowUpQuestions } from '@/components/chat/FollowUpQuestions';
import { QUICK_PROMPTS } from '@/lib/constants/prompts';
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
  const sessions = useChatHistory((s) => s.sessions);
  const activeSessionId = useChatHistory((s) => s.activeSessionId);
  const createSession = useChatHistory((s) => s.createSession);
  const deleteSession = useChatHistory((s) => s.deleteSession);
  const switchSession = useChatHistory((s) => s.switchSession);
  const clearHistory = useChatHistory((s) => s.clearHistory);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fontScale = useSettings((s) => s.fontScale);

  // Auto-scroll only if already at bottom
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAtBottom(true);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100);
  };

  const handleSend = (content: string, options?: { quotedText?: string; enableThinking?: boolean; enableSearch?: boolean }) => {
    sendMessage(content, {
      quotedText: options?.quotedText,
      enableThinking: options?.enableThinking,
      enableSearch: options?.enableSearch,
    });
  };

  const handleFollowUpClick = (question: string) => {
    sendMessage(question);
  };

  const handleNewChat = () => {
    createSession(chatContext);
  };

  const handleClearCurrent = () => {
    if (activeSessionId) {
      deleteSession(activeSessionId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--md-sys-color-surface-container-low)', position: 'relative' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        background: 'var(--md-sys-color-surface-container)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} style={{ color: 'var(--md-sys-color-primary)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>AI 助教</span>
          {chatContext && (
            <span style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', marginLeft: '4px' }}>
              {chatContext.currentTopic}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setShowSettings(true)}
            title="AI 设置"
            style={{
              padding: '4px 8px', borderRadius: '6px', border: 'none', background: 'transparent',
              color: 'var(--md-sys-color-on-surface-variant)', fontSize: '11px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Settings size={12} /> 设置
          </button>
          <button
            onClick={() => setShowHistory(true)}
            title="历史记录"
            style={{
              padding: '4px 8px', borderRadius: '6px', border: 'none', background: 'transparent',
              color: 'var(--md-sys-color-on-surface-variant)', fontSize: '11px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Clock size={12} /> 历史
          </button>
          <button
            onClick={handleNewChat}
            title="开启新对话"
            style={{
              padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--md-sys-color-outline-variant)',
              background: 'var(--md-sys-color-surface)', color: 'var(--md-sys-color-primary)', fontSize: '11px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500,
            }}
          >
            <Plus size={12} /> 新对话
          </button>
          {messages.length > 0 && (
            <button
              onClick={handleClearCurrent}
              title="清空当前记录"
              style={{
                padding: '4px 8px', borderRadius: '6px', border: 'none', background: 'transparent',
                color: 'var(--md-sys-color-on-surface-variant)', fontSize: '11px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)'; e.currentTarget.style.color = 'var(--md-sys-color-error)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)'; }}
            >
              <Trash2 size={12} /> 清空
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '12px', ['--chat-fs' as string]: `${Math.round(13 * fontScale)}px` } as React.CSSProperties}
      >
        {messages.length === 0 ? (
          <div style={{
            margin: 'auto', textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'var(--md-sys-color-primary-container)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
            }}>
              <Sparkles size={24} style={{ color: 'var(--md-sys-color-primary)' }} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '0.5rem' }}>我是你的概率论助教</p>
            <p style={{ fontSize: '12px', maxWidth: '240px' }}>
              遇到不懂的概念随时问我，我可以解释公式、出题练习、或者帮你梳理知识点
            </p>
            {chatContext && (
              <div style={{
                marginTop: '1rem', padding: '8px 12px',
                background: 'var(--md-sys-color-surface-container-high)', borderRadius: '8px', fontSize: '11px',
              }}>
                当前学习: {chatContext.currentTopic}
              </div>
            )}
            {/* 快捷指令：仅在空对话（新建页面）时复用追问组件呈现，开始对话后隐藏 */}
            <div style={{ width: '100%', maxWidth: '300px', marginTop: '0.5rem' }}>
              <FollowUpQuestions
                title="试试这样问我"
                questions={QUICK_PROMPTS.map((p) => p.text)}
                onSelect={handleFollowUpClick}
              />
            </div>
          </div>
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
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px',
                color: 'var(--md-sys-color-on-surface-variant)', fontSize: '13px',
              }}>
                <Loader size={16} className="animate-spin" style={{ color: 'var(--md-sys-color-primary)' }} />
                <span>AI 正在思考中...</span>
              </div>
            )}
          </>
        )}

        {error && (
          <div style={{
            color: 'var(--md-sys-color-error)', padding: '12px',
            border: '1px solid var(--md-sys-color-error)', borderRadius: '8px',
            margin: '12px 0', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '13px', background: 'var(--md-sys-color-error-container)',
          }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
            <button onClick={clearError} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-error)' }}>
              <X size={14} />
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          style={{
            position: 'absolute', bottom: '80px', right: '20px', width: '36px', height: '36px',
            borderRadius: '50%', background: 'var(--md-sys-color-primary-container)',
            color: 'var(--md-sys-color-primary)', border: '1px solid var(--md-sys-color-outline-variant)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: 'var(--md-sys-elevation-level2)', zIndex: 10,
          }}
          title="跟随最新输出"
        >
          <ArrowDown size={18} />
        </button>
      )}

      {/* Input Area */}
      <ChatInput
        onSend={handleSend}
        onStop={stopGeneration}
        isLoading={isLoading}
        chatContext={chatContext}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Settings Overlay */}
      {showSettings && <ChatSettings onClose={() => setShowSettings(false)} />}

      {/* History Overlay */}
      {showHistory && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'var(--md-sys-color-surface-container-low)', zIndex: 50,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> 历史对话
            </h3>
            <button onClick={() => setShowHistory(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-on-surface-variant)' }}>
              <X size={18} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2rem', fontSize: '13px' }}>
                暂无历史记录
              </div>
            ) : (
              sessions.map((session: ChatSession) => (
                <div
                  key={session.id}
                  style={{
                    padding: '12px', borderRadius: '8px', border: '1px solid',
                    borderColor: session.id === activeSessionId ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline-variant)',
                    background: session.id === activeSessionId ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface)',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative',
                  }}
                  onClick={() => { switchSession(session.id); setShowHistory(false); }}
                >
                  <div style={{ fontWeight: 500, fontSize: '13px', color: session.id === activeSessionId ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)' }}>
                    {session.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{new Date(session.updatedAt).toLocaleString()}</span>
                    <span>{session.messages.length} 条消息</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                    style={{ position: 'absolute', right: '8px', top: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-on-surface-variant)' }}
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
