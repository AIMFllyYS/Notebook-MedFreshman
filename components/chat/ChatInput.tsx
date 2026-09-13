'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo, useId } from 'react';
import {
  AgentGlobeIcon, AgentArrowUpIcon, AgentStopIcon, AgentQuoteIcon,
  AgentCloseIcon, AgentCheckIcon, AgentPaperclipIcon,
} from '@/components/icons/AgentIcons';
import type { ChatContext, ChatAttachment } from '@/lib/types/chat';
import { useChatUI } from '@/lib/hooks/useChatUI';
import { useSettings, type ThinkingEffort } from '@/lib/hooks/useSettings';
import { useImageAttachments } from '@/lib/hooks/useImageAttachments';
import { ACCEPTED_DOCUMENT_FILE_TYPES } from '@/lib/ai/imageUtils';
import { useKeyboardSettings } from '@/lib/keyboard/useKeyboardSettings';
import {
  getModelInfoWithCustom,
  modelSupportsThinkingEffort,
  modelAllowsDisableThinking,
  modelThinkingLevels,
  clampThinkingEffort,
} from '@/lib/ai/models';
import ModelMenu from '@/components/chat/ModelMenu';
import ThinkingMenuButton, { ThinkingMenuItems } from '@/components/chat/ThinkingMenu';
import AnchoredMenu from '@/components/ui/AnchoredMenu';
import InputLimitDialog from '@/components/chat/InputLimitDialog';
import TokenDashboard from '@/components/chat/TokenDashboard';
import AttachmentThumbnails from '@/components/chat/AttachmentThumbnails';

export interface ChatInputProps {
  onSend: (content: string, options?: {
    quotedText?: string;
    enableThinking?: boolean;
    thinkingEffort?: ThinkingEffort;
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
  /** 浮动输入区占用的底部安全距离（高度 + 实际底距 + 呼吸间距），供会话滚动区避让。 */
  onComposerInsetChange?: (inset: number) => void;
  /** 可选上下文警告等内容：与输入区一起测量，避免被底部浮层遮住。 */
  notice?: React.ReactNode;
}

export const MAX_INPUT_CHARACTERS = 50_000;

type QueuedMessage = {
  id: string;
  content: string;
  quotedText?: string;
  attachments?: ChatAttachment[];
};

function countCharacters(text: string) {
  // Count Unicode code points without allocating a second large array.
  let count = 0;
  for (const character of text) count += character ? 1 : 0;
  return count;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, onStop, isLoading, onOpenSettings, disabled: externalDisabled, disabledReason, modelId, onModelChange, showTokenDashboard = true, floatingSessionId, disableQuote = false, onComposerInsetChange, notice }) => {
  const [input, setInput] = useState('');
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([]);
  const [editingQueuedId, setEditingQueuedId] = useState<string | null>(null);
  const queueAwaitingLoadingRef = useRef(false);
  const countId = useId();
  const characterCount = useMemo(() => countCharacters(input), [input]);
  const overLimit = characterCount > MAX_INPUT_CHARACTERS;
  const showCharacterCount = characterCount > 1_000;
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const composingRef = useRef(false);
  const [isFocused, setIsFocused] = useState(false);
  const [enableThinking, setEnableThinking] = useState(() => useSettings.getState().defaultThinking);
  const [thinkingEffort, setThinkingEffort] = useState<ThinkingEffort>(
    () => useSettings.getState().defaultThinkingEffort,
  );
  const [enableSearch, setEnableSearch] = useState(() => useSettings.getState().defaultSearch);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const lastInsetRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { quotedText, clearQuotedText } = useChatUI();
  const globalSelectedModelId = useSettings((s) => s.selectedModelId);
  const customApiGroups = useSettings((s) => s.customApiGroups);
  const selectedModelId = modelId ?? globalSelectedModelId;
  const selectedModelInfo = useMemo(
    () => getModelInfoWithCustom(selectedModelId, customApiGroups),
    [selectedModelId, customApiGroups],
  );
  const thinkingSupported = selectedModelInfo?.thinking === true;
  const thinkingLevels = modelThinkingLevels(selectedModelInfo);
  const thinkingEffortSupported = modelSupportsThinkingEffort(selectedModelInfo);
  const thinkingAllowOff = modelAllowsDisableThinking(selectedModelInfo);
  const displayEffort = thinkingEffortSupported
    ? clampThinkingEffort(selectedModelInfo, thinkingEffort)
    : thinkingEffort;
  const effectiveEnableThinking = (enableThinking || !!selectedModelInfo?.thinkingRequired) && thinkingSupported;
  const effectiveThinkingEffort = effectiveEnableThinking ? displayEffort : undefined;
  const effectiveQuote = disableQuote ? null : quotedText;
  const sendShortcutEnabled = useKeyboardSettings((s) => s.isEnabled('chat.send'));
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
    info: attachInfo,
  } = useImageAttachments();

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
    }
  }, [input]);

  useEffect(() => {
    const composer = composerRef.current;
    if (!composer || !onComposerInsetChange) return;
    const reportInset = () => {
      const bottom = Number.parseFloat(window.getComputedStyle(composer).bottom) || 0;
      const next = Math.ceil(composer.getBoundingClientRect().height + bottom + 16);
      if (lastInsetRef.current !== null && Math.abs(next - lastInsetRef.current) < 2) return;
      lastInsetRef.current = next;
      onComposerInsetChange(next);
    };
    reportInset();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(reportInset);
    observer?.observe(composer);
    window.addEventListener('resize', reportInset);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', reportInset);
      // 保留最后测量值；StrictMode effect 重放时不先清零，避免滚动区短暂失去避让空间。
    };
  }, [onComposerInsetChange]);

  const dispatchMessage = useCallback((message: QueuedMessage) => {
    onSend(message.content, {
      quotedText: message.quotedText,
      enableThinking: effectiveEnableThinking,
      thinkingEffort: effectiveThinkingEffort,
      enableSearch,
      attachments: message.attachments,
    });
  }, [onSend, effectiveEnableThinking, effectiveThinkingEffort, enableSearch]);

  const clearDraft = useCallback(() => {
    setInput('');
    clearAttachments();
    if (effectiveQuote) clearQuotedText();
  }, [clearAttachments, effectiveQuote, clearQuotedText]);

  const handleSend = useCallback(() => {
    if (overLimit) { setShowLimitDialog(true); return; }
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0) || externalDisabled) return;

    const message: QueuedMessage = {
      id: crypto.randomUUID(),
      content: trimmed || '请阅读并分析附件',
      quotedText: effectiveQuote || undefined,
      attachments: toChatFormat(),
    };
    if (isLoading) {
      if (editingQueuedId) {
        setQueuedMessages((items) => items.map((item) => item.id === editingQueuedId ? { ...item, content: message.content } : item));
        setEditingQueuedId(null);
      } else {
        setQueuedMessages((items) => [...items, message]);
      }
    } else {
      dispatchMessage(message);
    }
    clearDraft();
  }, [input, overLimit, attachments, isLoading, externalDisabled, effectiveQuote, toChatFormat, editingQueuedId, dispatchMessage, clearDraft]);

  useEffect(() => {
    if (isLoading) {
      // 下一轮生成已经开始，允许在它结束后继续发送队列中的下一条。
      queueAwaitingLoadingRef.current = false;
      return;
    }
    if (externalDisabled || queuedMessages.length === 0) return;
    // onSend 通常会让父级立即进入 loading；即使父级更新稍有延迟，也不能
    // 在同一轮 effect 中把多条排队消息一次性发出。
    if (queueAwaitingLoadingRef.current) return;
    const next = queuedMessages[0];
    queueAwaitingLoadingRef.current = true;
    setQueuedMessages((items) => items[0]?.id === next.id ? items.slice(1) : items);
    setEditingQueuedId((current) => current === next.id ? null : current);
    dispatchMessage(next);
  }, [dispatchMessage, externalDisabled, isLoading, queuedMessages]);

  const editQueuedMessage = useCallback((message: QueuedMessage) => {
    setInput(message.content);
    setEditingQueuedId(message.id);
    textareaRef.current?.focus();
  }, []);

  const cancelQueuedMessage = useCallback((id: string) => {
    setQueuedMessages((items) => items.filter((item) => item.id !== id));
    setEditingQueuedId((current) => current === id ? null : current);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (composingRef.current || e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      if (!sendShortcutEnabled) return;
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

  const inputDisabled = !!externalDisabled;
  const sendDisabled = !!externalDisabled || (!isLoading && (overLimit || (!input.trim() && attachments.length === 0)));
  const showStopButton = isLoading && !input.trim() && attachments.length === 0;
  const thinkingProps = {
    enabled: effectiveEnableThinking, effort: displayEffort, supported: thinkingSupported,
    disabled: inputDisabled, levels: thinkingLevels, allowOff: thinkingAllowOff,
    onChange: ({ enabled, effort }: { enabled: boolean; effort: ThinkingEffort }) => {
      setEnableThinking(selectedModelInfo?.thinkingRequired ? true : enabled);
      setThinkingEffort(thinkingEffortSupported ? clampThinkingEffort(selectedModelInfo, effort) : effort);
    },
  };

  return (
    <div
      ref={composerRef}
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
      {notice}
      {attachError && (
        <div style={{
          padding: '6px 12px', fontSize: '11px', color: 'var(--md-sys-color-error)',
          background: 'var(--md-sys-color-error-container)', borderRadius: '8px', margin: '0 0 4px',
        }}>
          {attachError}
        </div>
      )}
      {attachInfo ? <div className="chat-attachment-notice" role="status">{attachInfo}</div> : null}

      {queuedMessages.length > 0 && (
        <div className="chat-input-queue" role="region" aria-label="等待发送">
          <div className="chat-input-queue-heading">
            <span className="chat-input-queue-label"><span className="chat-input-queue-pulse" />等待发送</span>
            <span className="chat-input-queue-count">{queuedMessages.length} 条</span>
          </div>
          <div className="chat-input-queue-list">
            {queuedMessages.map((message, index) => (
              <div className="chat-input-queue-item" key={message.id}>
                <span className="chat-input-queue-index">{index + 1}</span>
                <span className="chat-input-queue-text" title={message.content}>{message.content}</span>
                <button type="button" className="chat-input-queue-action" onClick={() => editQueuedMessage(message)} aria-label={`编辑第 ${index + 1} 条排队内容`}>编辑</button>
                <button type="button" className="chat-input-queue-action chat-input-queue-action-muted" onClick={() => cancelQueuedMessage(message.id)} aria-label={`取消第 ${index + 1} 条排队内容`}>取消</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {effectiveQuote && (
        <div className="chat-input-quote">
          <AgentQuoteIcon size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--md-sys-color-tertiary)' }} />
          <div className="chat-input-quote-label">
            <AgentQuoteIcon size={10} />
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
            <AgentCloseIcon size={14} />
          </button>
        </div>
      )}

      <div className="chat-input-toolbar" aria-label="对话选项">
        <div className="chat-input-toolbar-group chat-input-toolbar-options">
          {thinkingSupported && (
            <ThinkingMenuButton {...thinkingProps} />
          )}

          <button
            onClick={() => setEnableSearch(!enableSearch)}
            disabled={inputDisabled}
            className={`chat-input-toggle chat-input-toggle-search ${enableSearch ? 'chat-input-toggle-search-active' : ''} ${inputDisabled ? 'chat-input-toggle-disabled' : ''}`}
            title="联网搜索（需配置搜索API）"
            aria-pressed={enableSearch}
          >
            <AgentGlobeIcon size={12} />
            <span className="chat-input-toggle-text">联网搜索</span>
            {enableSearch && <AgentCheckIcon size={10} />}
          </button>
        </div>

        <AnchoredMenu label="更多对话选项" placement="top" width={250} disabled={inputDisabled}
          className="chat-input-toggle chat-input-more" trigger={<>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="3" cy="8" r="1.2" fill="currentColor" /><circle cx="8" cy="8" r="1.2" fill="currentColor" /><circle cx="13" cy="8" r="1.2" fill="currentColor" /></svg>
            {(effectiveEnableThinking || enableSearch) && <span className="chat-input-more-dot" />}
          </>}>
          {(close) => <>
            {thinkingSupported ? <ThinkingMenuItems {...thinkingProps} onChange={(next) => { thinkingProps.onChange(next); close(); }} />
              : <div className="app-menu-heading">当前模型不支持深度思考</div>}
            <div className="app-menu-separator" />
            <button type="button" role="menuitemcheckbox" aria-checked={enableSearch} disabled={inputDisabled} className="app-menu-item"
              onClick={() => { setEnableSearch((value) => !value); close(); }}>
              <span className="app-menu-check"><AgentGlobeIcon size={13} /></span>
              <span>联网搜索<small>使用搜索 API 获取最新信息</small></span>
              {enableSearch && <AgentCheckIcon size={12} />}
            </button>
          </>}
        </AnchoredMenu>

        <div className="chat-input-toolbar-group chat-input-toolbar-models">
          {showTokenDashboard && <TokenDashboard isLoading={isLoading} floatingSessionId={floatingSessionId} modelId={modelId} />}
          <ModelMenu
            onOpenSettings={onOpenSettings}
            value={modelId}
            onChange={onModelChange}
            thinkingEnabled={effectiveEnableThinking}
            thinkingEffort={displayEffort}
            onThinkingChange={({ enabled, effort }) => {
              setEnableThinking(enabled);
              setThinkingEffort(effort);
            }}
          />
        </div>
      </div>

      <div className={`chat-input-row ${isFocused ? 'chat-input-row-focused' : ''} ${showCharacterCount ? 'chat-input-row-with-count' : ''}`}>
        {attachments.length > 0 ? (
          <AttachmentThumbnails previews={attachments} onRemove={removeAttachment} embedded />
        ) : null}
        <div className="chat-input-editor-row">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            const next = e.target.value;
            setInput(next);
            if (!composingRef.current && !overLimit && countCharacters(next) > MAX_INPUT_CHARACTERS) setShowLimitDialog(true);
          }}
          onCompositionStart={() => { composingRef.current = true; }}
          onCompositionEnd={(e) => {
            composingRef.current = false;
            if (countCharacters(e.currentTarget.value) > MAX_INPUT_CHARACTERS) setShowLimitDialog(true);
          }}
          aria-label="输入问题"
          aria-describedby={showCharacterCount ? countId : undefined}
          aria-invalid={overLimit || undefined}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={externalDisabled ? (disabledReason || '输入已禁用') : isLoading ? '继续输入，发送后将排队…' : '输入问题，或粘贴 / 拖入图片与文档...'}
          disabled={inputDisabled}
          rows={1}
          className="chat-input-textarea"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept={`image/jpeg,image/png,image/gif,image/webp,${ACCEPTED_DOCUMENT_FILE_TYPES}`}
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {showCharacterCount && (
          <div id={countId} className={`chat-input-count ${overLimit ? 'chat-input-count-error' : ''}`} aria-live={overLimit ? 'assertive' : 'off'}>
            <span>{characterCount.toLocaleString('en-US')} / 50,000 字</span>
          </div>
        )}

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
          title="上传图片或文档"
          aria-label="上传图片或文档"
        >
          <AgentPaperclipIcon size={14} />
        </button>

        <button
          onClick={showStopButton ? onStop : handleSend}
          disabled={sendDisabled}
          className="chat-input-send"
          style={{
            background: showStopButton ? 'var(--md-sys-color-error-container)' : ((!input.trim() && attachments.length === 0) ? 'var(--md-sys-color-outline-variant)' : 'var(--md-sys-color-primary)'),
            color: showStopButton ? 'var(--md-sys-color-on-error-container)' : ((!input.trim() && attachments.length === 0) ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-primary)'),
            cursor: sendDisabled ? 'not-allowed' : 'pointer',
          }}
          title={showStopButton ? '停止生成' : '发送'}
        >
          {showStopButton ? <AgentStopIcon size={14} /> : <AgentArrowUpIcon size={14} />}
        </button>
        </div>
      </div>
      {showLimitDialog && <InputLimitDialog count={characterCount} limit={MAX_INPUT_CHARACTERS} onClose={() => setShowLimitDialog(false)} />}
    </div>
  );
};

export default ChatInput;
