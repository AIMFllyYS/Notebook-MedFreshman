'use client';

import React from 'react';
import { User, Sparkles } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/lib/types/chat';
import { MessageContent } from '@/components/chat/MessageContent';
import ArtifactCard from '@/components/chat/ArtifactCard';
import ProcessingSteps from '@/components/chat/ProcessingSteps';

interface ChatMessageProps {
  message: ChatMessageType;
  onFollowUpSelect: (question: string) => void;
  isStreaming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onFollowUpSelect, isStreaming }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="chat-message-header">
        {isUser ? (
          <span className="chat-message-header-left">
            <User size={12} />
            <span className="chat-message-header-name">你</span>
          </span>
        ) : (
          <span className="chat-message-header-left">
            <Sparkles size={12} style={{ color: 'var(--md-sys-color-primary)' }} />
            <span className="chat-message-header-name">AI 助教</span>
            {message.metadata?.thinkingEnabled && (
              <span className="chat-message-badge chat-message-badge-thinking">深度思考</span>
            )}
            {message.metadata?.searchEnabled && (
              <span className="chat-message-badge chat-message-badge-search">联网搜索</span>
            )}
          </span>
        )}
      </div>

      <div className="chat-message-content">
        {isUser ? (
          <div className="chat-bubble-user">
            {message.content}
          </div>
        ) : (
          <>
            <ProcessingSteps msg={message} streaming={isStreaming} />
            {message.content && (
              <div className="chat-bubble-assistant chat-prose">
                <MessageContent
                  content={message.content}
                  enableVisualizations={true}
                  onFollowUpSelect={onFollowUpSelect}
                />
              </div>
            )}
            {message.toolCalls
              ?.filter((tc) => tc.name === 'renderInteractive' && tc.artifactId)
              .map((tc) => (
                <ArtifactCard key={tc.artifactId} artifactId={tc.artifactId!} />
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
