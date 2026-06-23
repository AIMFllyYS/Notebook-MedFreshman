'use client';

import React from 'react';
import { Lightbulb, HelpCircle } from 'lucide-react';

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
    <div className="followup-card">
      <div className="followup-header">
        <Lightbulb size={14} style={{ color: 'var(--md-sys-color-primary)' }} />
        <span className="followup-title">{title}</span>
      </div>
      <div className="followup-list">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            className="followup-btn"
            type="button"
          >
            <HelpCircle size={14} style={{ color: 'var(--md-sys-color-primary)', flexShrink: 0 }} />
            <span className="followup-btn-text">{question}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FollowUpQuestions;
