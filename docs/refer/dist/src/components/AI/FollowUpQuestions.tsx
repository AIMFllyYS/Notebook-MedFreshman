import React from 'react';
import * as Icons from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface FollowUpQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({ questions, onQuestionClick }) => {
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div style={{
      margin: '12px 0 0 0',
      padding: '12px',
      borderRadius: '8px',
      background: 'var(--md-sys-color-primary-container)',
      border: '1px solid var(--md-sys-color-primary)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '10px'
      }}>
        <Icons.Lightbulb size={14} style={{ color: 'var(--md-sys-color-primary)' }} />
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--md-sys-color-primary)'
        }}>
          你可能还想问
        </span>
      </div>

      {/* Questions */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid var(--md-sys-color-outline-variant)',
              background: 'var(--md-sys-color-surface)',
              color: 'var(--md-sys-color-on-surface)',
              fontSize: '13px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--md-sys-color-primary-container)';
              e.currentTarget.style.borderColor = 'var(--md-sys-color-primary)';
              e.currentTarget.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--md-sys-color-surface)';
              e.currentTarget.style.borderColor = 'var(--md-sys-color-outline-variant)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <span style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'var(--md-sys-color-primary-container)',
              color: 'var(--md-sys-color-primary)',
              fontSize: '10px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {index + 1}
            </span>
            <span style={{ flex: 1, pointerEvents: 'none' }}>
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({node, ...props}) => <p style={{ margin: 0, lineHeight: '1.4' }} {...props} />
                }}
              >
                {question}
              </ReactMarkdown>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FollowUpQuestions;
