'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { FollowUpQuestions } from '@/components/chat/FollowUpQuestions';
import { QUICK_PROMPTS } from '@/lib/constants/prompts';

interface ChatEmptyStateProps {
  topic: string;
  subjectName: string;
  onFollowUpClick: (question: string) => void;
}

const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
  topic,
  subjectName,
  onFollowUpClick,
}) => {
  return (
    <div className="chat-empty-state animate-fade-up">
      <div className="chat-empty-icon">
        <Sparkles size={24} style={{ color: 'var(--md-sys-color-primary)' }} />
      </div>
      <p className="chat-empty-title">我是你的{subjectName}助教</p>
      <p className="chat-empty-desc">
        遇到不懂的概念随时问我，我可以解释公式、出题练习、或者帮你梳理知识点
      </p>
      {topic && (
        <div className="chat-empty-topic">
          当前学习: {topic}
        </div>
      )}
      <div className="chat-empty-prompts">
        <FollowUpQuestions
          title="试试这样问我"
          questions={QUICK_PROMPTS.map((p) => p.text)}
          onSelect={onFollowUpClick}
        />
      </div>
    </div>
  );
};

export default ChatEmptyState;
