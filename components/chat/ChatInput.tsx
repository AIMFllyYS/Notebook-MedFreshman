'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Lightbulb, Globe, Send, Square, Quote, X, CheckCircle, Paperclip,
} from 'lucide-react';
import type { ChatContext, ChatAttachment } from '@/lib/types/chat';
import { useChatUI } from '@/lib/hooks/useChatUI';
import { useSettings } from '@/lib/hooks/useSettings';
import { useImageAttachments } from '@/lib/hooks/useImageAttachments';
import ModelMenu from '@/components/chat/ModelMenu';
import TokenDashboard from '@/components/chat/TokenDashboard';
import AttachmentThumbnails from '@/components/chat/AttachmentThumbnails';

export interface ChatInputProps {
  onSend: (content: string, options?: {
    quotedText?: string;
    enableThinking?: boolean;
    enableSearch?: boolean;
    attachments?: ChatAttachment[];
  }) => void;
  onStop: () => void;
  isLoading: boolean;
  chatContext: ChatContext;
  onOpenSettings?: () => void;
  disabled?: boolean;
  disabledReason?: string;
  /** 受控模型（划词浮窗每窗独立选模型）；不传则模型菜单读写全局 useSettings。 */
  modelId?: string;
  onModelChange?: (id: string) => void;
  /** 是否显示上下文 token 看板（划词浮窗传 false，避免显示主面板的全局统计）。默认 true。 */
  showTokenDashboard?: boolean;
  /** 划词浮窗的 sessionId，用于独立 token 统计。不传则用全局 tracker。 */
  floatingSessionId?: string;
  /** 禁用「引用到输入框」（划词浮窗传 true，避免全局选区引用串入浮窗）。默认 false。 */
  disableQuote?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, onStop, isLoading, onOpenSettings, disabled: externalDisabled, disabledReason, modelId, onModelChange, showTokenDashboard = true, floatingSessionId, disableQuote = false }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [enableThinking, setEnableThinking] = useState(() => useSettings.getState().defaultThinking);
  const [enableSearch, setEnableSearch] = useState(() => useSettings.getState().defaultSearch);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { quotedText, clearQuotedText } = useChatUI();
  const effectiveQuote = disableQuote ? null : quotedText;
  const {
    attachments,
    addFiles,
    remove: removeAttachment,
    clear: clearAttachments,
    toChatFormat,
    handlePaste,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    isDragging,
    error: attachError,
  } = useImageAttachments();

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0) || isLoading || externalDisabled) return;

    onSend(trimmed || '请描述这张图片', {
      quotedText: effectiveQuote || undefined,
      enableThinking,
      enableSearch,
      attachments: toChatFormat(),
    });
    setInput('');
    clearAttachments();
    if (effectiveQuote) clearQuotedText();
  }, [input, attachments, isLoading, externalDisabled, onSend, enableThinking, enableSearch, effectiveQuote, clearQuotedText, toChatFormat, clearAttachments]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    await addFiles(Array.from(files));
    e.target.value = '';
  };

  const inputDisabled = isLoading || !!externalDisabled;

  return (
    <div
      className="chat-input-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      style={isDragging ? {
        outline: '2px dashed var(--md-sys-color-primary)',
        outlineOffset: '-4px',
        borderRadius: '12px',
      } : undefined}
    >
      {attachError && (
        <div style={{
          padding: '6px 12px', fontSize: '11px', color: 'var(--md-sys-color-error)',
          background: 'var(--md-sys-color-error-container)', borderRadius: '8px', margin: '0 0 4px',
        }}>
          {attachError}
        </div>
      )}

      {attachments.length > 0 && (
        <AttachmentThumbnails previews={attachments} onRemove={removeAttachment} />
      )}

      {effectiveQuote && (
        <div className="chat-input-quote">
          <Quote size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--md-sys-color-tertiary)' }} />
          <div className="chat-input-quote-label">
            <Quote size={10} />
            <span>引用自当前页面</span>
          </div>
          <div className="chat-input-quote-text">
            {effectiveQuote}
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
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={externalDisabled ? (disabledReason || '输入已禁用') : isLoading ? 'AI 正在思考中...' : '输入问题，Shift+Enter换行，Ctrl+V粘贴图片...'}
          disabled={inputDisabled}
          rows={1}
          className="chat-input-textarea"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <button
          onClick={handleAttachClick}
          disabled={inputDisabled}
          className="chat-input-send"
          style={{
            background: 'transparent',
            color: 'var(--ink-soft)',
            cursor: inputDisabled ? 'not-allowed' : 'pointer',
            opacity: inputDisabled ? 0.4 : 1,
          }}
          title="上传图片附件"
        >
          <Paperclip size={14} />
        </button>

        <button
          onClick={isLoading ? onStop : handleSend}
          disabled={(!input.trim() && attachments.length === 0) && !isLoading}
          className="chat-input-send"
          style={{
            background: isLoading ? 'var(--md-sys-color-error-container)' : ((!input.trim() && attachments.length === 0) ? 'var(--md-sys-color-outline-variant)' : 'var(--md-sys-color-primary)'),
            color: isLoading ? 'var(--md-sys-color-on-error-container)' : ((!input.trim() && attachments.length === 0) ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-primary)'),
            cursor: ((!input.trim() && attachments.length === 0) && !isLoading) ? 'not-allowed' : 'pointer',
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
            disabled={inputDisabled}
            className={`chat-input-toggle chat-input-toggle-thinking ${enableThinking ? 'chat-input-toggle-thinking-active' : ''} ${inputDisabled ? 'chat-input-toggle-disabled' : ''}`}
            title="开启深度思考（展示推理过程）"
          >
            <Lightbulb size={12} />
            <span className="chat-input-toggle-text">深度思考</span>
            {enableThinking && <CheckCircle size={10} />}
          </button>

          <button
            onClick={() => setEnableSearch(!enableSearch)}
            disabled={inputDisabled}
            className={`chat-input-toggle chat-input-toggle-search ${enableSearch ? 'chat-input-toggle-search-active' : ''} ${inputDisabled ? 'chat-input-toggle-disabled' : ''}`}
            title="联网搜索（需配置搜索API）"
          >
            <Globe size={12} />
            <span className="chat-input-toggle-text">联网搜索</span>
            {enableSearch && <CheckCircle size={10} />}
          </button>
        </div>

        <div className="chat-input-toolbar-group" style={{ gap: 4, flexShrink: 0 }}>
          {showTokenDashboard && <TokenDashboard isLoading={isLoading} floatingSessionId={floatingSessionId} modelId={modelId} />}
          <ModelMenu onOpenSettings={onOpenSettings} value={modelId} onChange={onModelChange} />
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
