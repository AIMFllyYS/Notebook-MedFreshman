'use client';

import React from 'react';
import { HelpCircle, Lightbulb } from 'lucide-react';
import QuizMarkdown from '@/components/quiz/QuizMarkdown';
import { openSourceTrace } from '@/lib/chat/openSourceTrace';
import type { TraceSource } from '@/lib/chat/traceSources';

interface FollowUpQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  title?: string;
  sources?: TraceSource[];
}

export const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({
  questions,
  onSelect,
  title = '你可能还想问',
  sources = [],
}) => {
  if ((!questions || questions.length === 0) && sources.length === 0) return null;

  return (
    <div className="followup-card" data-testid="followups">
      <div className="followup-header">
        <Lightbulb size={14} style={{ color: 'var(--md-sys-color-primary)' }} />
        <span className="followup-title">{questions.length ? title : '本轮依据'}</span>
        {sources.length > 0 ? (
          <button
            type="button"
            className="followup-sources"
            onClick={() => openSourceTrace(sources)}
          >
            来源 · {sources.length}
          </button>
        ) : null}
      </div>
      {questions.length > 0 ? (
        <div className="followup-list">
          {questions.map((question, index) => (
            <button
              key={index}
              onClick={() => onSelect(question)}
              className="followup-btn"
              type="button"
            >
              <HelpCircle size={14} style={{ color: 'var(--md-sys-color-primary)', flexShrink: 0 }} />
              <span className="followup-btn-text"><QuizMarkdown inline>{question}</QuizMarkdown></span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default FollowUpQuestions;
