'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  BrainCircuit, Globe, Send, Square, Quote, X, CheckCircle,
} from 'lucide-react';
import type { ChatContext } from '@/lib/types/chat';
import { useChatUI } from '@/lib/hooks/useChatUI';
import { useSettings } from '@/lib/hooks/useSettings';
import ModelMenu from '@/components/chat/ModelMenu';

interface ChatInputProps {
  onSend: (content: string, options?: { quotedText?: string; enableThinking?: boolean; enableSearch?: boolean }) => void;
  onStop: () => void;
  isLoading: boolean;
  chatContext: ChatContext;
  onOpenSettings?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, onStop, isLoading, chatContext, onOpenSettings }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [enableThinking, setEnableThinking] = useState(() => useSettings.getState().defaultThinking);
  const [enableSearch, setEnableSearch] = useState(() => useSettings.getState().defaultSearch);
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

  const disabled = isLoading;

  return (
    <div className="chat-input-container">
      {quotedText && (
        <div className="chat-input-quote">
          <Quote size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--md-sys-color-tertiary)' }} />
          <div className="chat-input-quote-label">
            <Quote size={10} />
            <span>引用自当前页面</span>
          </div>
          <div className="chat-input-quote-text">
            {quotedText}
          </div>
          <button
            onClick={clearQuotedText}
            className="chat-input-quote-close"
            title="移除引用"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className={`chat-input-row ${isFocused ? 'chat-input-row-focused' : ''}`}>
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
          className="chat-input-textarea"
        />
        <button
          onClick={isLoading ? onStop : handleSend}
          disabled={!input.trim() && !isLoading}
          className="chat-input-send"
          style={{
            background: isLoading ? 'var(--md-sys-color-error-container)' : (!input.trim() ? 'var(--md-sys-color-outline-variant)' : 'var(--md-sys-color-primary)'),
            color: isLoading ? 'var(--md-sys-color-on-error-container)' : (!input.trim() ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-primary)'),
            cursor: (!input.trim() && !isLoading) ? 'not-allowed' : 'pointer',
          }}
          title={isLoading ? '停止生成' : '发送'}
        >
          {isLoading ? <Square size={14} /> : <Send size={14} style={{ marginLeft: '1px' }} />}
        </button>
      </div>

      <div className="chat-input-toolbar">
        <div className="chat-input-toolbar-group">
          <button
            onClick={() => setEnableThinking(!enableThinking)}
            disabled={disabled}
            className={`chat-input-toggle chat-input-toggle-thinking ${enableThinking ? 'chat-input-toggle-thinking-active' : ''} ${disabled ? 'chat-input-toggle-disabled' : ''}`}
            title="开启深度思考（展示推理过程）"
          >
            <BrainCircuit size={12} />
            <span>深度思考</span>
            {enableThinking && <CheckCircle size={10} />}
          </button>

          <button
            onClick={() => setEnableSearch(!enableSearch)}
            disabled={disabled}
            className={`chat-input-toggle chat-input-toggle-search ${enableSearch ? 'chat-input-toggle-search-active' : ''} ${disabled ? 'chat-input-toggle-disabled' : ''}`}
            title="联网搜索（需配置搜索API）"
          >
            <Globe size={12} />
            <span>联网搜索</span>
            {enableSearch && <CheckCircle size={10} />}
          </button>
        </div>

        <ModelMenu onOpenSettings={onOpenSettings} />
      </div>
    </div>
  );
};

export default ChatInput;
