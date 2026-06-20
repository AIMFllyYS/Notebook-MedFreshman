'use client';

import React, { useState, useEffect } from 'react';
import { BrainCircuit, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import AnimatedCollapse from '@/components/ui/AnimatedCollapse';

interface ReasoningBlockProps {
  content: string;
  isStreaming: boolean;
}

export const ReasoningBlock: React.FC<ReasoningBlockProps> = ({ content, isStreaming }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 流式时自动展开
  useEffect(() => {
    if (isStreaming) {
      setIsExpanded(true);
    }
  }, [isStreaming]);

  if (!content || content.trim() === '') {
    return null;
  }

  // 截取前两行作为预览
  const lines = content.split('\n');
  const previewLines = lines.slice(0, 2).join('\n');
  const previewContent = previewLines.length > 120 ? previewLines.slice(0, 120) + '...' : previewLines;

  return (
    <div
      style={{
        margin: '8px 0',
        borderRadius: '8px',
        background: 'var(--md-sys-color-surface-container-high)',
        border: '1px solid var(--md-sys-color-outline-variant)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 border-none bg-transparent cursor-pointer transition-colors duration-200 hover:bg-[var(--md-sys-color-surface-container-highest)]"
        type="button"
      >
        <div className="flex items-center gap-1.5">
          <BrainCircuit size={14} style={{ color: 'var(--md-sys-color-primary)' }} />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--md-sys-color-primary)',
            }}
          >
            思考过程
          </span>
          {isStreaming && (
            <Loader2
              size={12}
              className="animate-spin"
              style={{ color: 'var(--md-sys-color-primary)' }}
            />
          )}
        </div>
        <div className="flex items-center gap-1">
          <span
            style={{
              fontSize: '11px',
              color: 'var(--md-sys-color-on-surface-variant)',
            }}
          >
            {isExpanded ? '收起' : '展开思考过程'}
          </span>
          {isExpanded ? (
            <ChevronUp size={14} style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
          ) : (
            <ChevronDown size={14} style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatedCollapse isOpen={isExpanded}>
        <div
          style={{
            padding: '0 12px 12px 12px',
            borderTop: '1px solid var(--md-sys-color-outline-variant)',
          }}
        >
          <pre
            style={{
              margin: 0,
              padding: '8px 0',
              fontSize: '12px',
              lineHeight: '1.6',
              color: 'var(--md-sys-color-on-surface-variant)',
              fontFamily: 'Inter, -apple-system, sans-serif',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {content}
          </pre>
        </div>
      </AnimatedCollapse>

      {/* Collapsed Preview */}
      <AnimatedCollapse isOpen={!isExpanded}>
        <div
          style={{
            padding: '8px 12px',
            borderTop: '1px solid var(--md-sys-color-outline-variant)',
            fontSize: '12px',
            color: 'var(--md-sys-color-on-surface-variant)',
            lineHeight: '1.5',
          }}
        >
          {previewContent}
        </div>
      </AnimatedCollapse>
    </div>
  );
};

export default ReasoningBlock;
