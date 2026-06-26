'use client';

import React, { useRef } from 'react';
import { BrainCircuit, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import AnimatedCollapse from '@/components/ui/AnimatedCollapse';
import { MessageContent } from '@/components/chat/MessageContent';
import { openMessageMenu } from '@/lib/hooks/useContextMenu';
import { useProcessingDisclosure } from '@/lib/hooks/useProcessingDisclosure';
import { useStickToBottom } from '@/lib/hooks/useStickToBottom';

interface ReasoningBlockProps {
  content: string;
  /** 整条回复是否仍在处理（思考/工具）。处理中自动展开思考、完成自动折叠。 */
  isProcessing: boolean;
}

export const ReasoningBlock: React.FC<ReasoningBlockProps> = ({ content, isProcessing }) => {
  // 处理中自动展开、完成自动折叠，中途手动开合受尊重。
  const [isExpanded, setIsExpanded] = useProcessingDisclosure(isProcessing);
  // 思考流式时让内层滚动框贴底跟随；用户上滑退出跟随、滑回底部恢复。
  const scrollRef = useRef<HTMLDivElement>(null);
  const onScroll = useStickToBottom(scrollRef, isProcessing);

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
          {isProcessing && (
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
          ref={scrollRef}
          onScroll={onScroll}
          className="chat-prose"
          onContextMenu={(e) => openMessageMenu(e, content)}
          style={{
            padding: '8px 12px 12px 12px',
            borderTop: '1px solid var(--md-sys-color-outline-variant)',
            fontSize: '12px',
            lineHeight: '1.6',
            color: 'var(--md-sys-color-on-surface-variant)',
            maxHeight: '300px',
            overflowY: 'auto',
            wordBreak: 'break-word',
          }}
        >
          {/* 思考过程复用全量富文本渲染（markdown + 公式），软换行保留模型分行 */}
          <MessageContent content={content} enableVisualizations={false} preserveLineBreaks />
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
