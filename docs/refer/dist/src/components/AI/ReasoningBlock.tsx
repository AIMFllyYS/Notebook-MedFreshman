import React, { useState } from 'react';
import * as Icons from 'lucide-react';

interface ReasoningBlockProps {
  content: string;
  isStreaming?: boolean;
}

export const ReasoningBlock: React.FC<ReasoningBlockProps> = ({ content, isStreaming }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!content || content.trim() === '') {
    return null;
  }

  // 截断过长的思考内容用于预览
  const previewContent = content.length > 120 ? content.slice(0, 120) + '...' : content;

  return (
    <div style={{
      margin: '8px 0',
      borderRadius: '8px',
      background: 'var(--md-sys-color-surface-container-high)',
      border: '1px solid var(--md-sys-color-outline-variant)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          transition: 'background 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--md-sys-color-surface-container-highest)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icons.Brain size={14} style={{ color: 'var(--md-sys-color-primary)' }} />
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--md-sys-color-primary)'
          }}>
            思考过程
          </span>
          {isStreaming && (
            <Icons.Loader size={12} className="animate-spin" style={{ color: 'var(--md-sys-color-primary)' }} />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            fontSize: '11px',
            color: 'var(--md-sys-color-on-surface-variant)'
          }}>
            {isExpanded ? '收起' : '展开'}
          </span>
          {isExpanded ? (
            <Icons.ChevronUp size={14} style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
          ) : (
            <Icons.ChevronDown size={14} style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div style={{
          padding: '0 12px 12px 12px',
          borderTop: '1px solid var(--md-sys-color-outline-variant)'
        }}>
          <pre style={{
            margin: 0,
            padding: '8px 0',
            fontSize: '12px',
            lineHeight: '1.6',
            color: 'var(--md-sys-color-on-surface-variant)',
            fontFamily: 'Inter, -apple-system, sans-serif',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {content}
          </pre>
        </div>
      )}

      {/* Collapsed Preview */}
      {!isExpanded && (
        <div style={{
          padding: '8px 12px',
          borderTop: '1px solid var(--md-sys-color-outline-variant)',
          fontSize: '12px',
          color: 'var(--md-sys-color-on-surface-variant)',
          lineHeight: '1.5'
        }}>
          {previewContent}
        </div>
      )}
    </div>
  );
};

export default ReasoningBlock;
