'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  BrainCircuit, Globe, Send, Square, Quote, X, CheckCircle, HelpCircle,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import type { ChatContext } from '@/lib/types/chat';
import { QUICK_PROMPTS } from '@/lib/constants/prompts';
import { useChatUI } from '@/lib/hooks/useChatUI';

interface ChatInputProps {
  onSend: (content: string, options?: { quotedText?: string; enableThinking?: boolean; enableSearch?: boolean }) => void;
  onStop: () => void;
  isLoading: boolean;
  chatContext: ChatContext;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, onStop, isLoading, chatContext }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [enableThinking, setEnableThinking] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { quotedText, clearQuotedText } = useChatUI();

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    onSend(trimmed, { quotedText: quotedText || undefined, enableThinking, enableSearch });
    setInput('');
    if (quotedText) clearQuotedText();
  }, [input, isLoading, onSend, enableThinking, enableSearch, quotedText, clearQuotedText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (text: string) => {
    if (isLoading) return;
    onSend(text);
  };

  const disabled = isLoading;

  return (
    <div style={{
      padding: '8px 12px',
      background: 'var(--md-sys-color-surface-container)',
      borderTop: '1px solid var(--md-sys-color-outline-variant)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      {/* Quick prompts */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {QUICK_PROMPTS.map((prompt) => {
          const IconComp = (Icons as any)[prompt.icon] || HelpCircle;
          return (
            <button
              key={prompt.label}
              onClick={() => handleQuickPrompt(prompt.text)}
              disabled={disabled}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '12px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                background: 'var(--md-sys-color-surface)',
                color: 'var(--md-sys-color-on-surface-variant)',
                fontSize: '11px',
                fontWeight: 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 0.2s ease',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'var(--md-sys-color-primary-container)';
                  e.currentTarget.style.color = 'var(--md-sys-color-primary)';
                  e.currentTarget.style.borderColor = 'var(--md-sys-color-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'var(--md-sys-color-surface)';
                  e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)';
                  e.currentTarget.style.borderColor = 'var(--md-sys-color-outline-variant)';
                }
              }}
            >
              <IconComp size={10} />
              <span>{prompt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quoted Text Block */}
      {quotedText && (
        <div style={{
          position: 'relative',
          padding: '8px 12px 8px 32px',
          background: 'var(--md-sys-color-tertiary-container)',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'var(--md-sys-color-on-tertiary-container)',
          margin: '2px 0',
          borderLeft: '3px solid var(--md-sys-color-tertiary)',
        }}>
          <Quote size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--md-sys-color-tertiary)' }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '4px',
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--md-sys-color-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            <Quote size={10} />
            <span>引用自当前页面</span>
          </div>
          <div style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontStyle: 'italic',
            lineHeight: 1.4,
          }}>
            {quotedText}
          </div>
          <button
            onClick={clearQuotedText}
            style={{
              position: 'absolute',
              right: '6px',
              top: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--md-sys-color-on-tertiary-container)',
              padding: '2px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="移除引用"
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'var(--md-sys-color-surface-variant)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'transparent')
            }
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input row */}
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-end',
        background: 'var(--md-sys-color-surface-container-high)',
        borderRadius: '12px',
        padding: '6px 8px',
        border: isFocused ? '1px solid var(--md-sys-color-primary)' : '1px solid var(--md-sys-color-outline-variant)',
        transition: 'all 0.2s ease',
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isLoading ? 'AI 正在思考中...' : '输入问题，Shift+Enter换行...'}
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            padding: '6px 8px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--md-sys-color-on-surface)',
            fontSize: '14px',
            lineHeight: '1.4',
            fontFamily: 'inherit',
            outline: 'none',
            minHeight: '36px',
            maxHeight: '120px',
            margin: 0,
          }}
        />
        <button
          onClick={isLoading ? onStop : handleSend}
          disabled={!input.trim() && !isLoading}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: isLoading ? 'var(--md-sys-color-error-container)' : (!input.trim() ? 'var(--md-sys-color-outline-variant)' : 'var(--md-sys-color-primary)'),
            color: isLoading ? 'var(--md-sys-color-on-error-container)' : (!input.trim() ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-primary)'),
            cursor: (!input.trim() && !isLoading) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
          title={isLoading ? '停止生成' : '发送'}
        >
          {isLoading ? <Square size={14} /> : <Send size={14} style={{ marginLeft: '1px' }} />}
        </button>
      </div>

      {/* Toolbar with switches */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Thinking toggle */}
          <button
            onClick={() => setEnableThinking(!enableThinking)}
            disabled={disabled}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '10px',
              border: 'none',
              background: enableThinking ? 'var(--md-sys-color-primary-container)' : 'transparent',
              color: enableThinking ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
              fontSize: '11px',
              fontWeight: 500,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
            title="开启深度思考（展示推理过程）"
          >
            <BrainCircuit size={12} />
            <span>深度思考</span>
            {enableThinking && <CheckCircle size={10} />}
          </button>

          {/* Search toggle */}
          <button
            onClick={() => setEnableSearch(!enableSearch)}
            disabled={disabled}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '10px',
              border: 'none',
              background: enableSearch ? 'var(--md-sys-color-tertiary-container)' : 'transparent',
              color: enableSearch ? 'var(--md-sys-color-tertiary)' : 'var(--md-sys-color-on-surface-variant)',
              fontSize: '11px',
              fontWeight: 500,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
            title="联网搜索（需配置搜索API）"
          >
            <Globe size={12} />
            <span>联网搜索</span>
            {enableSearch && <CheckCircle size={10} />}
          </button>
        </div>

        {/* Model indicator */}
        <span style={{ fontSize: '10px', color: 'var(--md-sys-color-outline)', fontWeight: 400 }}>
          {enableThinking ? 'deepseek-pro' : 'deepseek-flash'}
        </span>
      </div>
    </div>
  );
};

export default ChatInput;
