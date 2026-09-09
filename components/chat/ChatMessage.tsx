'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { AgentFileIcon, AgentImageIcon, AgentLoopIcon, AgentUserIcon } from '@/components/icons/AgentIcons';
import type { ChatMessage as ChatMessageType } from '@/lib/types/chat';
import { MessageContent } from '@/components/chat/MessageContent';
import { FollowUpQuestions } from '@/components/chat/FollowUpQuestions';
import WebSourceFold from '@/components/chat/WebSourceFold';
import { AgentTrace, TRACE_COLLAPSE_MS } from '@/components/chat/AgentTrace';
import AttachmentThumbnails from '@/components/chat/AttachmentThumbnails';
import { openMessageMenu } from '@/lib/hooks/useContextMenu';
import { buildTrace } from '@/lib/chat/buildTrace';
import { getMessageText, getToolPartsByName } from '@/lib/chat/messageParts';
import { collectMessageSources } from '@/lib/chat/traceSources';
import { ImageStrip } from '@/components/chat/ImageStrip';
import { ChatImage } from '@/components/chat/ChatImage';
import { ToolResultCards } from '@/components/chat/toolCards/ToolResultCards';

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
  const parts = message.parts;
  const reducedMotion = useReducedMotion();
  const streaming = !!isStreaming;
  const [revealFollowups, setRevealFollowups] = useState(!streaming);
  const [prevStreaming, setPrevStreaming] = useState(streaming);
  const [revealNonce, setRevealNonce] = useState(0);
  if (prevStreaming !== streaming) {
    setPrevStreaming(streaming);
    if (streaming) {
      setRevealFollowups(false);
      setRevealNonce(0);
    } else if (reducedMotion) {
      setRevealFollowups(true);
      setRevealNonce(0);
    } else {
      setRevealFollowups(false);
      setRevealNonce((n) => n + 1);
    }
  }

  useEffect(() => {
    if (revealNonce === 0) return;
    const timer = window.setTimeout(() => setRevealFollowups(true), TRACE_COLLAPSE_MS);
    return () => window.clearTimeout(timer);
  }, [revealNonce]);
  const trace = useMemo(() => buildTrace({ parts }, !!isStreaming), [parts, isStreaming]);
  const userText = useMemo(() => isUser ? getMessageText({ parts }) : '', [isUser, parts]);
  const followUpQuestions = message.followUpQuestions?.length
    ? message.followUpQuestions
    : parts.flatMap((part) => part.type === 'data-followup' ? part.data.questions : []);

  const imageSearchSources = useMemo(() => {
    if (isUser || isStreaming) return [];
    return getToolPartsByName({ parts }, 'imageSearch').flatMap((part) =>
      part.state === 'output-available' && !part.preliminary ? part.output.sources ?? [] : [],
    );
  }, [isUser, isStreaming, parts]);

  const directSources = useMemo(() => parts.flatMap((part) => part.type === 'source-url'
    ? [{ title: part.title || sourceHost(part.url), url: part.url, snippet: '' }]
    : []), [parts]);

  const traceSources = useMemo(() => isUser ? [] : collectMessageSources(parts), [isUser, parts]);

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`} data-message-role={message.role}>
      <div className="chat-message-header">
        {isUser ? (
          <span className="chat-message-header-left">
            <span className="chat-message-header-name">你</span>
            <AgentUserIcon size={16} />
          </span>
        ) : (
          <span className="chat-message-header-left">
            <AgentLoopIcon size={18} />
            <span className="chat-message-header-name">AI 助教</span>
            {message.metadata?.thinkingEnabled ? <span className="sr-only">已启用深度思考</span> : null}
            {message.metadata?.searchEnabled ? <span className="sr-only">已启用联网搜索</span> : null}
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
              style={{ background: 'var(--md-sys-color-surface-container-high)', boxShadow: 'none' }}
              onContextMenu={(e) => openMessageMenu(e, userText)}
            >
              <MessageContent content={userText} enableVisualizations={false} preserveLineBreaks />
            </div>
          </>
        ) : (
          <>
            <AgentTrace trace={trace} isStreaming={isStreaming} durationMs={message.metadata?.durationMs} />
            {trace.answerText && (
              <div
                className="chat-bubble-assistant chat-prose"
                style={{ background: 'transparent', border: 'none', padding: 0, borderRadius: 0 }}
                onContextMenu={(e) => openMessageMenu(e, trace.answerText)}
              >
                <MessageContent
                  content={trace.answerText}
                  enableVisualizations={true}
                  onFollowUpSelect={isStreaming || followUpQuestions.length ? undefined : onFollowUpSelect}
                  sessionId={sessionId}
                  messageId={message.id}
                  repairModelId={repairModelId}
                  topic={topic}
                />
              </div>
            )}
            {/* Rich results remain available below the answer when the trace collapses. */}
            <ToolResultCards message={message} isStreaming={isStreaming} names={['searchNotes', 'webSearch']} />
            {directSources.length ? <WebSourceFold sources={directSources} label="参考来源" /> : null}
            {parts.map((part) => part.type === 'source-document' ? (
              <div key={part.sourceId} className="my-2 flex min-w-0 items-center gap-2 rounded-lg bg-[var(--md-sys-color-surface-container)] px-3 py-2 text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
                <AgentFileIcon size={16} className="shrink-0" /><span className="min-w-0 break-words">{part.title || part.filename || '参考文档'}</span>
              </div>
            ) : null)}
            <ToolResultCards message={message} isStreaming={isStreaming} names={['renderInteractive', 'generateImage', 'createQuiz', 'searchNoteImages', 'writeDocument']} />
            {imageSearchSources.length > 0 && (
              <div className="image-search-gallery">
                <div className="image-search-gallery-header">
                  <AgentImageIcon size={16} />
                  <span>本次搜索图片 · {imageSearchSources.length} 张</span>
                  <span className="image-search-gallery-via">via Unsplash</span>
                </div>
                <ImageStrip>
                  {imageSearchSources.map((s, i) => (
                    <div
                      key={i}
                      className="image-search-gallery-item"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/uri-list', s.url);
                        e.dataTransfer.setData('text/plain', s.url);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                    >
                      <ChatImage src={s.url} alt={s.alt || s.title || `图片 ${i + 1}`} />
                      <div className="image-search-gallery-credit">
                        <a href={s.url} target="_blank" rel="noopener noreferrer">
                          {s.title || s.alt || `图片 ${i + 1}`}
                        </a>
                        {s.author ? <>{' · '}<a href={s.authorUrl || s.url} target="_blank" rel="noopener noreferrer">{s.author}</a></> : null}
                        {' · '}
                        <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>
                      </div>
                    </div>
                  ))}
                </ImageStrip>
              </div>
            )}
            {revealFollowups && !isStreaming && (followUpQuestions.length > 0 || traceSources.length > 0) ? (
              <FollowUpQuestions questions={followUpQuestions} onSelect={onFollowUpSelect} sources={traceSources} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(ChatMessage);

function sourceHost(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}
