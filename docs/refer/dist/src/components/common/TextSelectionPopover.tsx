import React, { useEffect, useState, useRef } from 'react';
import * as Icons from 'lucide-react';
import { useChatUIStore } from '../../store/useChatUIStore';

export const TextSelectionPopover: React.FC = () => {
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { setQuotedText, setQuickExplainText } = useChatUIStore();

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Don't trigger if clicking inside the popover itself
      if (popoverRef.current && popoverRef.current.contains(e.target as Node)) {
        return;
      }

      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (selection && text && text.length > 0 && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Calculate position above the selection
        setPosition({
          top: rect.top + window.scrollY - 45, // 45px above
          left: rect.left + window.scrollX + (rect.width / 2)
        });
        setSelectionRange(range);
      } else {
        setSelectionRange(null);
        setPosition(null);
      }
    };

    const handleSelectionChange = () => {
      // If user starts modifying selection and it becomes empty, hide it
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === '') {
        setSelectionRange(null);
        setPosition(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  if (!selectionRange || !position) return null;

  const handleQuote = () => {
    const text = selectionRange.toString().trim();
    if (text) {
      setQuotedText(text);
    }
    // Clear selection
    window.getSelection()?.removeAllRanges();
    setSelectionRange(null);
    setPosition(null);
  };

  const handleExplain = () => {
    const text = selectionRange.toString().trim();
    if (text) {
      setQuickExplainText(text);
    }
    window.getSelection()?.removeAllRanges();
    setSelectionRange(null);
    setPosition(null);
  };

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        gap: '4px',
        padding: '6px',
        background: 'var(--md-sys-color-surface-container-highest)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 0 0 1px var(--md-sys-color-outline-variant)',
        animation: 'fade-in 0.15s ease-out',
      }}
    >
      <button
        onClick={handleQuote}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 10px',
          border: 'none',
          background: 'transparent',
          color: 'var(--md-sys-color-on-surface)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          borderRadius: '6px',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--md-sys-color-surface-variant)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Icons.MessageSquarePlus size={14} style={{ color: 'var(--md-sys-color-primary)' }} />
        添加至会话
      </button>

      <div style={{ width: '1px', background: 'var(--md-sys-color-outline-variant)', margin: '4px 2px' }} />

      <button
        onClick={handleExplain}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 10px',
          border: 'none',
          background: 'transparent',
          color: 'var(--md-sys-color-on-surface)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          borderRadius: '6px',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--md-sys-color-surface-variant)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Icons.Sparkles size={14} style={{ color: 'var(--md-sys-color-primary)' }} />
        快捷解释
      </button>
    </div>
  );
};
