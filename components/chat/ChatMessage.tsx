'use client';

import React, { useMemo } from 'react';
import { User, BookOpen, Images } from 'lucide-react';
import type { ChatMessage as ChatMessageType, ToolCallBlock } from '@/lib/types/chat';
import { MessageContent } from '@/components/chat/MessageContent';
import { FollowUpQuestions } from '@/components/chat/FollowUpQuestions';
import ArtifactCard from '@/components/chat/ArtifactCard';
import ImageGenCard from '@/components/chat/ImageGenCard';
import ProcessingSteps from '@/components/chat/ProcessingSteps';
import AttachmentThumbnails from '@/components/chat/AttachmentThumbnails';
import { openMessageMenu } from '@/lib/hooks/useContextMenu';
import PencilSparklesIcon from '@/components/icons/PencilSparklesIcon';
import { extractThinkBlocksFromContent } from '@/lib/chat/rendering/parseChatContent';
import { ImageStrip } from '@/components/chat/ImageStrip';
import { ChatImage } from '@/components/chat/ChatImage';

interface ChatMessageProps {
  message: ChatMessageType;
  onFollowUpSelect: (question: string) => void;
  isStreaming?: boolean;
  sessionId?: string;
  repairModelId?: string;
  topic?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onFollowUpSelect, isStreaming, sessionId, repairModelId, topic }) => {
  const isUser = message.role === 'user';
  const displayMessage = useMemo(() => {
    if (isUser) return message;
    const pseudoReasoning = extractThinkBlocksFromContent(message.content).join('\n\n');
    if (!pseudoReasoning) return message;
    const currentReasoning = message.reasoningContent?.trim() ?? '';
    const reasoningContent = currentReasoning.includes(pseudoReasoning)
      ? currentReasoning
      : [currentReasoning, pseudoReasoning].filter(Boolean).join('\n\n');
    return { ...message, reasoningContent };
  }, [isUser, message]);

  const imageSearchSources = useMemo(() => {
    if (isUser || isStreaming) return [];
    const calls: ToolCallBlock[] = (message.toolCalls ?? []).filter(
      (tc) => tc.name === 'imageSearch' && tc.status === 'success' && tc.sources && tc.sources.length > 0,
    );
    return calls.flatMap((tc) =>
      (tc.sources ?? []).map((s) => ({ ...s, _provider: tc.provider ?? 'unsplash' })),
    );
  }, [isUser, isStreaming, message.toolCalls]);

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
            <PencilSparklesIcon size={12} style={{ color: 'var(--md-sys-color-primary)' }} />
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
          <>
            {message.attachments && message.attachments.length > 0 && (
              <AttachmentThumbnails readonlyAttachments={message.attachments} size={80} />
            )}
            <div
              className="chat-bubble-user chat-prose"
              onContextMenu={(e) => openMessageMenu(e, message.content)}
            >
              <MessageContent content={message.content} enableVisualizations={false} preserveLineBreaks />
            </div>
          </>
        ) : (
          <>
            <ProcessingSteps msg={displayMessage} streaming={isStreaming} />
            {/* searchNotes inline reference cards */}
            {message.toolCalls
              ?.filter((tc) => tc.name === 'searchNotes' && tc.hits && tc.hits.length > 0)
              .map((tc) => (
                <div key={tc.id} className="search-hit-inline-cards">
                  <div className="search-hit-inline-header">
                    <BookOpen size={12} />
                    <span>引用笔记 · {tc.hits!.length} 条</span>
                  </div>
                  <div className="search-hit-inline-list">
                    {tc.hits!.map((h, i) => (
                      <div key={i} className="search-hit-inline-item">
                        <span className="search-hit-inline-title">{h.title}</span>
                        <span className="search-hit-inline-path">{h.path}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            {message.content && (
              <div
                className="chat-bubble-assistant chat-prose"
                onContextMenu={(e) => openMessageMenu(e, message.content)}
              >
                <MessageContent
                  content={message.content}
                  enableVisualizations={true}
                  onFollowUpSelect={message.followUpQuestions?.length ? undefined : onFollowUpSelect}
                  sessionId={sessionId}
                  messageId={message.id}
                  repairModelId={repairModelId}
                  topic={topic}
                />
              </div>
            )}
            {/* FollowUp 追问卡片：优先用 useChat.ts 流后解析的 followUpQuestions，
                MessageContent 正则提取作为兜底（followUpQuestions 为空时才启用） */}
            {!isStreaming && message.followUpQuestions && message.followUpQuestions.length > 0 && (
              <FollowUpQuestions questions={message.followUpQuestions} onSelect={onFollowUpSelect} />
            )}
            {message.toolCalls
              ?.filter((tc) => tc.name === 'renderInteractive' && tc.artifactId)
              .map((tc) => (
                <ArtifactCard
                  key={tc.artifactId}
                  artifactId={tc.artifactId!}
                  title={tc.title}
                  prompt={tc.prompt}
                  autoStart={!!isStreaming}
                />
              ))}
            {message.toolCalls
              ?.filter((tc) => tc.name === 'generateImage' && tc.imageGenId)
              .map((tc) => (
                <ImageGenCard
                  key={tc.imageGenId}
                  imageGenId={tc.imageGenId!}
                  prompt={tc.imageGenPrompt}
                  title={tc.imageGenTitle}
                  size={tc.imageGenSize}
                  count={tc.imageGenCount}
                />
              ))}
            {imageSearchSources.length > 0 && (
              <div className="image-search-gallery">
                <div className="image-search-gallery-header">
                  <Images size={13} style={{ color: 'var(--md-sys-color-primary)' }} />
                  <span>本次搜索图片 · {imageSearchSources.length} 张</span>
                  <span className="image-search-gallery-via">via Unsplash</span>
                </div>
                <ImageStrip>
                  {imageSearchSources.map((s, i) => (
                    <div key={i} className="image-search-gallery-item">
                      <ChatImage src={s.url} alt={s.alt || s.title || `图片 ${i + 1}`} />
                      <div className="image-search-gallery-credit">
                        <a href={s.url} target="_blank" rel="noopener noreferrer">
                          {s.title || s.alt || `图片 ${i + 1}`}
                        </a>
                        {' · '}
                        <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>
                      </div>
                    </div>
                  ))}
                </ImageStrip>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(ChatMessage);
