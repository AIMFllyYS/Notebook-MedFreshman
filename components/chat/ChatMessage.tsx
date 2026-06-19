'use client';

import React, { useState } from 'react';
import {
  User, Sparkles, ChevronUp, ChevronDown, Loader, CheckCircle2,
} from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/lib/types/chat';
import { ReasoningBlock } from '@/components/chat/ReasoningBlock';
import { ToolCallDashboard } from '@/components/chat/ToolCallDashboard';
import { MessageContent } from '@/components/chat/MessageContent';

interface ChatMessageProps {
  message: ChatMessageType;
  onFollowUpSelect: (question: string) => void;
  isStreaming?: boolean;
}

/* ---- ProcessingSteps: collapsible container for reasoning + tool calls ---- */
const ProcessingSteps: React.FC<{ msg: ChatMessageType; streaming?: boolean }> = ({ msg, streaming }) => {
  const hasReasoning = !!msg.reasoningContent;
  const hasTools = !!msg.toolCalls && msg.toolCalls.length > 0;
  if (!hasReasoning && !hasTools) return null;

  const isProcessing = streaming || (msg.toolCalls && msg.toolCalls.some((t) => t.status === 'running'));
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const expanded = userExpanded !== null ? userExpanded : isProcessing;

  return (
    <div style={{
      border: '1px solid var(--md-sys-color-outline-variant)',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '12px',
      marginTop: '4px',
    }}>
      <button
        onClick={() => setUserExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'var(--md-sys-color-surface-container-high)',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--md-sys-color-on-surface-variant)',
          fontSize: '13px',
          fontWeight: 500,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isProcessing
            ? <Loader size={14} className="animate-spin" />
            : <CheckCircle2 size={14} style={{ color: 'var(--md-sys-color-tertiary)' }} />}
          <span>{isProcessing ? '正在深度思考与调用工具...' : '处理完毕'}</span>
        </div>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div style={{
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'var(--md-sys-color-surface-container)',
        }}>
          {msg.reasoningContent && (
            <ReasoningBlock content={msg.reasoningContent} isStreaming={!!(streaming && !hasTools)} />
          )}
          {msg.toolCalls && msg.toolCalls.length > 0 && (
            <ToolCallDashboard toolCalls={msg.toolCalls} />
          )}
        </div>
      )}
    </div>
  );
};

/* ---- Main ChatMessage component ---- */
const ChatMessage: React.FC<ChatMessageProps> = ({ message, onFollowUpSelect, isStreaming }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`} style={{ width: '100%', maxWidth: '100%', padding: '8px 0' }}>
      {/* Header */}
      <div style={{
        fontSize: '12px',
        color: 'var(--md-sys-color-on-surface-variant)',
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {isUser ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={12} />
            <span style={{ fontWeight: 500 }}>你</span>
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} style={{ color: 'var(--md-sys-color-primary)' }} />
            <span style={{ fontWeight: 500 }}>概率助教</span>
            {message.metadata?.thinkingEnabled && (
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-primary)' }}>
                深度思考
              </span>
            )}
            {message.metadata?.searchEnabled && (
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'var(--md-sys-color-tertiary-container)', color: 'var(--md-sys-color-tertiary)' }}>
                联网搜索
              </span>
            )}
          </span>
        )}
      </div>

      {/* Content Area */}
      <div style={{
        color: isUser ? 'var(--md-sys-color-on-surface)' : 'inherit',
        overflowWrap: 'break-word',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {isUser ? (
          <div style={{
            whiteSpace: 'pre-wrap',
            padding: '8px 12px',
            background: 'var(--md-sys-color-primary-container)',
            borderRadius: '12px',
            borderBottomRightRadius: '4px',
            fontSize: 'var(--chat-fs, 13px)',
            lineHeight: '1.5',
          }}>
            {message.content}
          </div>
        ) : (
          <>
            <ProcessingSteps msg={message} streaming={isStreaming} />
            <div style={{
              background: 'var(--md-sys-color-surface-container)',
              padding: '12px',
              borderRadius: '12px',
              borderBottomLeftRadius: '4px',
              fontSize: 'var(--chat-fs, 13px)',
              lineHeight: '1.5',
            }}>
              <MessageContent
                content={message.content}
                enableVisualizations={true}
                onFollowUpSelect={onFollowUpSelect}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
