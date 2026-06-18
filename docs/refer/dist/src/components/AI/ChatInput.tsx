import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as Icons from 'lucide-react';
import { useChatUIStore } from '../../store/useChatUIStore';

interface ChatInputProps {
  onSend: (content: string, options?: { enableThinking?: boolean; enableSearch?: boolean }) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const QUICK_PROMPTS = [
  { icon: 'Lightbulb', label: '解释概念', text: '请解释当前小节的核心数学概念，并配合直观的物理解释。' },
  { icon: 'BookOpen', label: '给我出题', text: '请根据当前小节的考点，给我出一道典型考研难度的练习题。' },
  { icon: 'GitMerge', label: '推导公式', text: '请详细推导当前小节的核心公式，并写出每一步的演算逻辑。' },
];

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading, disabled }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [enableThinking, setEnableThinking] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { quotedText, setQuotedText } = useChatUIStore();

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
    if (!trimmed || isLoading || disabled) return;
    
    let finalMessage = trimmed;
    if (quotedText) {
      finalMessage = `[用户从正文中引用了以下内容，请重点针对该内容回答]:\n<Quote>\n${quotedText}\n</Quote>\n\n${trimmed}`;
      setQuotedText(null);
    }
    
    onSend(finalMessage, { enableThinking, enableSearch });
    setInput('');
  }, [input, isLoading, disabled, onSend, enableThinking, enableSearch, quotedText, setQuotedText]);

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

  return (
    <div 
      style={{ 
        padding: '8px 12px',
        background: 'var(--md-sys-color-surface-container)',
        borderTop: '1px solid var(--md-sys-color-outline-variant)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      {/* Quick prompts */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {QUICK_PROMPTS.map((prompt) => {
          const IconComp = (Icons as any)[prompt.icon] || Icons.HelpCircle;
          return (
            <button
              key={prompt.label}
              onClick={() => handleQuickPrompt(prompt.text)}
              disabled={isLoading || disabled}
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
                cursor: (isLoading || disabled) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || disabled) ? 0.5 : 1,
                transition: 'all 0.2s ease',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if(!(isLoading || disabled)) {
                  e.currentTarget.style.background = 'var(--md-sys-color-primary-container)';
                  e.currentTarget.style.color = 'var(--md-sys-color-primary)';
                  e.currentTarget.style.borderColor = 'var(--md-sys-color-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if(!(isLoading || disabled)) {
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
          background: 'var(--md-sys-color-surface-variant)',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'var(--md-sys-color-on-surface-variant)',
          margin: '2px 0'
        }}>
          <Icons.Quote 
            size={14} 
            style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--md-sys-color-primary)' }} 
          />
          <div style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontStyle: 'italic'
          }}>
            {quotedText}
          </div>
          <button
            onClick={() => setQuotedText(null)}
            style={{
              position: 'absolute',
              right: '6px',
              top: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--md-sys-color-on-surface-variant)',
              padding: '2px'
            }}
            title="移除引用"
          >
            <Icons.X size={14} />
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
          disabled={isLoading || disabled}
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
            margin: 0
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading || disabled}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: (!input.trim() || isLoading || disabled) ? 'var(--md-sys-color-outline-variant)' : 'var(--md-sys-color-primary)',
            color: (!input.trim() || isLoading || disabled) ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-primary)',
            cursor: (!input.trim() || isLoading || disabled) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
          title="发送"
        >
          <Icons.Send size={14} style={{ marginLeft: '1px' }} />
        </button>
      </div>

      {/* Toolbar with switches */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 4px'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Thinking toggle */}
          <button
            onClick={() => setEnableThinking(!enableThinking)}
            disabled={isLoading || disabled}
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
              cursor: (isLoading || disabled) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || disabled) ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
            title="开启深度思考（展示推理过程）"
          >
            <Icons.Brain size={12} />
            <span>深度思考</span>
            {enableThinking && <Icons.CheckCircle size={10} />}
          </button>

          {/* Search toggle */}
          <button
            onClick={() => setEnableSearch(!enableSearch)}
            disabled={isLoading || disabled}
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
              cursor: (isLoading || disabled) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || disabled) ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
            title="联网搜索（需配置搜索API）"
          >
            <Icons.Globe size={12} />
            <span>联网搜索</span>
            {enableSearch && <Icons.CheckCircle size={10} />}
          </button>
        </div>

        {/* Model indicator */}
        <span style={{ 
          fontSize: '10px', 
          color: 'var(--md-sys-color-outline)',
          fontWeight: 400
        }}>
          deepseek-v4
        </span>
      </div>
    </div>
  );
};

export default ChatInput;
