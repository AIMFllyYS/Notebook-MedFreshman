'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface FollowUpQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({ questions, onSelect }) => {
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        margin: '12px 0 0 0',
        padding: '12px',
        borderRadius: '8px',
        background: 'var(--md-sys-color-primary-container)',
        border: '1px solid var(--md-sys-color-primary)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <Sparkles size={14} style={{ color: 'var(--md-sys-color-primary)' }} />
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--md-sys-color-primary)',
          }}
        >
          你可能还想问
        </span>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-1.5">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            className="flex items-center gap-2 px-2.5 py-2 rounded-md border cursor-pointer transition-all duration-200 text-left"
            style={{
              border: '1px solid var(--md-sys-color-outline-variant)',
              background: 'var(--md-sys-color-surface)',
              color: 'var(--md-sys-color-on-surface)',
              fontSize: '13px',
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
            type="button"
          >
            <Sparkles size={14} style={{ color: 'var(--md-sys-color-primary)', flexShrink: 0 }} />
            <span style={{ flex: 1, pointerEvents: 'none', lineHeight: '1.4' }}>{question}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FollowUpQuestions;
