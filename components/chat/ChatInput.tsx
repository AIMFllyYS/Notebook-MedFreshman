'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  BrainCircuit, Globe, Send, Square, Quote, X, CheckCircle, Paperclip,
} from 'lucide-react';
import type { ChatContext, ChatAttachment } from '@/lib/types/chat';
import { useChatUI } from '@/lib/hooks/useChatUI';
import { useSettings } from '@/lib/hooks/useSettings';
import { getModelInfo } from '@/lib/ai/models';
import ModelMenu from '@/components/chat/ModelMenu';

interface AttachmentPreview {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB — above this we compress

function compressImage(file: File, maxDim = 1920): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, onStop, isLoading, chatContext, onOpenSettings, disabled: externalDisabled, disabledReason }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [enableThinking, setEnableThinking] = useState(() => useSettings.getState().defaultThinking);
  const [enableSearch, setEnableSearch] = useState(() => useSettings.getState().defaultSearch);
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { quotedText, clearQuotedText } = useChatUI();

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (attachError) {
      const t = setTimeout(() => setAttachError(null), 3000);
      return () => clearTimeout(t);
    }
  }, [attachError]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0) || isLoading || externalDisabled) return;

    const chatAttachments: ChatAttachment[] | undefined =
      attachments.length > 0
        ? attachments.map((a) => ({ type: 'image' as const, mimeType: a.mimeType, base64: a.base64 }))
        : undefined;

    onSend(trimmed || '请描述这张图片', {
      quotedText: quotedText || undefined,
      enableThinking,
      enableSearch,
      attachments: chatAttachments,
    });
    setInput('');
    setAttachments([]);
    if (quotedText) clearQuotedText();
  }, [input, attachments, isLoading, externalDisabled, onSend, enableThinking, enableSearch, quotedText, clearQuotedText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachClick = () => {
    const modelId = useSettings.getState().selectedModelId;
    const info = getModelInfo(modelId);
    if (info && !info.vision) {
      setAttachError(`当前模型 ${info.label} 不支持图片上传`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const newAttachments: AttachmentPreview[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setAttachError('仅支持图片文件（JPG/PNG/GIF/WebP）');
        continue;
      }
      try {
        const needsCompress = file.size > MAX_IMAGE_SIZE;
        const base64 = needsCompress ? await compressImage(file) : await readFileAsDataUrl(file);
        const previewUrl = URL.createObjectURL(file);
        const mimeType = needsCompress ? 'image/jpeg' : file.type;
        newAttachments.push({ file, previewUrl, base64, mimeType });
      } catch {
        setAttachError(`处理 ${file.name} 失败`);
      }
    }
    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = '';
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const inputDisabled = isLoading || !!externalDisabled;

  return (
    <div className="chat-input-container">
      {attachError && (
        <div style={{
          padding: '6px 12px', fontSize: '11px', color: 'var(--md-sys-color-error)',
          background: 'var(--md-sys-color-error-container)', borderRadius: '8px', margin: '0 0 4px',
        }}>
          {attachError}
        </div>
      )}

      {attachments.length > 0 && (
        <div style={{
          display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '6px 8px',
          borderRadius: '10px 10px 0 0',
          background: 'var(--bg-muted)', borderBottom: '1px solid var(--line)',
        }}>
          {attachments.map((a, i) => (
            <div key={i} style={{ position: 'relative', width: 56, height: 56, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <img src={a.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => removeAttachment(i)}
                style={{
                  position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

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
          placeholder={externalDisabled ? (disabledReason || '输入已禁用') : isLoading ? 'AI 正在思考中...' : '输入问题，Shift+Enter换行...'}
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
            <BrainCircuit size={12} />
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

        <ModelMenu onOpenSettings={onOpenSettings} />
      </div>
    </div>
  );
};

export default ChatInput;
