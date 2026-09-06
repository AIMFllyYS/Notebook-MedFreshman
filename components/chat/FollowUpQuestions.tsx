'use client';

import React from 'react';
import { AgentArrowUpRightIcon } from '@/components/icons/AgentIcons';
import QuizMarkdown from '@/components/quiz/QuizMarkdown';

interface FollowUpQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  title?: string;
}

export const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({ questions, onSelect, title = '你可能还想问' }) => {
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className="agent-followups mt-5 min-w-0 border-t border-[var(--md-sys-color-outline-variant)] pt-3">
      <div className="mb-1.5 text-[11px] font-medium text-[var(--md-sys-color-on-surface-variant)]">
        <span>{title}</span>
      </div>
      <div className="space-y-0.5">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            className="group flex min-h-9 w-full min-w-0 items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-[12px] text-[var(--md-sys-color-on-surface)] transition-colors hover:bg-[var(--md-sys-color-surface-container-high)] focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
            type="button"
          >
            <span className="min-w-0 flex-1 [overflow-wrap:anywhere]"><QuizMarkdown inline>{question}</QuizMarkdown></span>
            <AgentArrowUpRightIcon size={15} className="shrink-0 text-[var(--md-sys-color-on-surface-variant)]" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default FollowUpQuestions;
