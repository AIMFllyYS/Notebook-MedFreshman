import React, { useRef, useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import { useChatHistoryStore } from '../../store/useChatHistoryStore';
import ChatMessageComponent from './ChatMessage';
import ChatInput from './ChatInput';
import type { ChatContext } from '../../types/chat';

const ChatPanel: React.FC = () => {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();
  const { sessions, activeSessionId, switchSession, deleteSession } = useChatHistoryStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const { chapterId, sectionId } = useParams<{ chapterId: string; sectionId: string }>();
  
  // 构建当前上下文
  const chatContext: ChatContext | undefined = chapterId ? {
    chapterId: Number(chapterId),
    sectionId: sectionId || `${chapterId}.1`,
    currentTopic: `第${chapterId}章${sectionId ? `第${sectionId}节` : ''}`,
  } : undefined;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAtBottom(true);
  };

  // Auto-scroll only if we're already at the bottom
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // Consider "at bottom" if within 100px from the bottom
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(atBottom);
  };

  const handleSend = (content: string, options?: { enableThinking?: boolean; enableSearch?: boolean }) => {
    sendMessage(content, { ...chatContext, ...options });
  };

  // 处理追问问题点击
  const handleFollowUpClick = (question: string) => {
    // 直接发送追问问题，保持当前的深度思考和搜索设置
    sendMessage(question, chatContext);
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
        background: 'var(--md-sys-color-surface-container)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icons.Sparkles size={14} style={{ color: 'var(--md-sys-color-primary)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
            AI 助教
          </span>
          {chatContext && (
            <span style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', marginLeft: '4px' }}>
              · 第{chatContext.chapterId}章
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            onClick={() => setShowHistory(true)} 
            title="历史记录"
            style={{ 
              padding: '4px 8px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              color: 'var(--md-sys-color-on-surface-variant)',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Icons.Clock size={12} />
            历史
          </button>
          
          <button 
            onClick={clearMessages} 
            title="开启新对话"
            style={{ 
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--md-sys-color-outline-variant)',
              background: 'var(--md-sys-color-surface)',
              color: 'var(--md-sys-color-primary)',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500
            }}
          >
            <Icons.Plus size={12} />
            新对话
          </button>
          
          {messages.length > 0 && (
            <button 
              onClick={clearMessages} 
              title="清空当前记录"
              style={{ 
                padding: '4px 8px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: 'var(--md-sys-color-on-surface-variant)',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)';
                e.currentTarget.style.color = 'var(--md-sys-color-error)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)';
              }}
            >
              <Icons.Trash2 size={12} />
              清空
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column',
          padding: '12px'
        }}
      >
        {messages.length === 0 ? (
          <div style={{ 
            margin: 'auto', 
            textAlign: 'center', 
            color: 'var(--md-sys-color-on-surface-variant)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            padding: '2rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--md-sys-color-primary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Icons.Sparkles size={24} style={{ color: 'var(--md-sys-color-primary)' }} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '0.5rem' }}>
              我是你的概率论助教
            </p>
            <p style={{ fontSize: '12px', maxWidth: '240px' }}>
              遇到不懂的概念随时问我，我可以解释公式、出题练习、或者帮你梳理知识点
            </p>
            {chatContext && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '8px 12px',
                background: 'var(--md-sys-color-surface-container-high)',
                borderRadius: '8px',
                fontSize: '11px'
              }}>
                当前学习: 第{chatContext.chapterId}章 {chatContext.sectionId}
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.filter(m => m.role !== 'tool').map((msg) => (
              <ChatMessageComponent 
                key={msg.id} 
                message={msg} 
                onSendMessage={msg.role === 'assistant' ? handleFollowUpClick : undefined}
                isStreaming={isLoading && msg === messages[messages.length - 1] && msg.role === 'assistant'}
              />
            ))}
            
            {isLoading && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '12px',
                color: 'var(--md-sys-color-on-surface-variant)',
                fontSize: '13px'
              }}>
                <Icons.Loader size={16} className="animate-spin" style={{ color: 'var(--md-sys-color-primary)' }} />
                <span>AI 正在思考中...</span>
              </div>
            )}
          </>
        )}
        
        {error && (
          <div style={{ 
            color: 'var(--md-sys-color-error)', 
            padding: '12px', 
            border: '1px solid var(--md-sys-color-error)', 
            borderRadius: '8px', 
            margin: '12px 0', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '13px',
            background: 'rgba(239, 83, 80, 0.05)'
          }}>
            <Icons.AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--md-sys-color-primary-container)',
            color: 'var(--md-sys-color-primary)',
            border: '1px solid var(--md-sys-color-outline-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            zIndex: 10
          }}
          title="跟随最新输出"
        >
          <Icons.ArrowDown size={18} />
        </button>
      )}

      {/* Input Area - 使用ChatInput组件 */}
      <ChatInput 
        onSend={handleSend} 
        isLoading={isLoading} 
        disabled={!chatContext}
      />

      {/* History Overlay */}
      {showHistory && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--md-sys-color-surface-container-low)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--md-sys-color-outline-variant)'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icons.Clock size={16} />
              历史对话
            </h3>
            <button onClick={() => setShowHistory(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-on-surface-variant)' }}>
              <Icons.X size={18} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2rem', fontSize: '13px' }}>
                暂无历史记录
              </div>
            ) : (
              sessions.map(session => (
                <div 
                  key={session.id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: session.id === activeSessionId ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline-variant)',
                    background: session.id === activeSessionId ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    position: 'relative'
                  }}
                  onClick={() => { switchSession(session.id); setShowHistory(false); }}
                >
                  <div style={{ fontWeight: 500, fontSize: '13px', color: session.id === activeSessionId ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)' }}>
                    {session.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{new Date(session.timestamp).toLocaleString()}</span>
                    <span>{session.messages.length} 条消息</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '8px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--md-sys-color-on-surface-variant)'
                    }}
                    title="删除"
                  >
                    <Icons.Trash2 size={14} />
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
