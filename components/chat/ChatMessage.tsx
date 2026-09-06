'use client';

import React, { useMemo } from 'react';
import { AgentArrowUpRightIcon, AgentFileIcon, AgentGlobeIcon, AgentImageIcon, AgentLoopIcon, AgentUserIcon } from '@/components/icons/AgentIcons';
import type { ChatMessage as ChatMessageType, WebSearchSource } from '@/lib/types/chat';
import { MessageContent } from '@/components/chat/MessageContent';
import { FollowUpQuestions } from '@/components/chat/FollowUpQuestions';
import ArtifactCard from '@/components/chat/ArtifactCard';
import ImageGenCard from '@/components/chat/ImageGenCard';
import { AgentTrace } from '@/components/chat/AgentTrace';
import AttachmentThumbnails from '@/components/chat/AttachmentThumbnails';
import { openMessageMenu } from '@/lib/hooks/useContextMenu';
import { buildTrace } from '@/lib/chat/buildTrace';
import { getMessageText, getToolPartsByName } from '@/lib/chat/messageParts';
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
  const parts = message.parts;
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

  // One card per artifact ID, even if a restored tool result references it again.
  const resultCards = useMemo(() => {
    const seen = new Set<string>();
    return parts.filter((part) => {
      if (part.type !== 'tool-renderInteractive' && part.type !== 'tool-generateImage') return false;
      if (part.state !== 'output-available' || part.preliminary) return false;
      const id = part.type === 'tool-renderInteractive' ? part.output.artifactId : part.output.imageGenId;
      if (!id || seen.has(`${part.type}:${id}`)) return false;
      seen.add(`${part.type}:${id}`);
      return true;
    });
  }, [parts]);

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
            {getToolPartsByName(message, 'searchNotes').map((part) => part.state === 'output-available' && !part.preliminary && part.output.hits?.length ? (
              <div key={part.toolCallId} className="search-hit-inline-cards">
                <div className="search-hit-inline-header">
                  <AgentFileIcon size={16} />
                  <span>引用笔记 · {part.output.hits.length} 条</span>
                </div>
                <div className="search-hit-inline-list">
                  {part.output.hits.map((hit, index) => (
                    <div key={`${hit.path}:${index}`} className="search-hit-inline-item">
                      <span className="search-hit-inline-title">{hit.title}</span>
                      <span className="search-hit-inline-path break-all">{hit.path}</span>
                      {hit.snippet ? <span className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">{hit.snippet}</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null)}
            {getToolPartsByName(message, 'webSearch').map((part) => part.state === 'output-available' && !part.preliminary && part.output.sources?.length
              ? <SourceCards key={part.toolCallId} sources={part.output.sources} cacheHit={part.output.cacheHit} />
              : null)}
            {directSources.length ? <SourceCards sources={directSources} label="参考来源" /> : null}
            {parts.map((part) => part.type === 'source-document' ? (
              <div key={part.sourceId} className="my-2 flex min-w-0 items-center gap-2 rounded-lg bg-[var(--md-sys-color-surface-container)] px-3 py-2 text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
                <AgentFileIcon size={16} className="shrink-0" /><span className="min-w-0 break-words">{part.title || part.filename || '参考文档'}</span>
              </div>
            ) : null)}
            {resultCards.map((part) => {
              if (part.type === 'tool-renderInteractive' && part.state === 'output-available') return (
                <ArtifactCard
                  key={`artifact:${part.output.artifactId}`}
                  artifactId={part.output.artifactId}
                  title={part.output.title}
                  prompt={part.output.prompt}
                  modelId={part.output.modelId}
                  unsupportedReason={part.output.unsupportedReason}
                  autoStart={!!isStreaming}
                />
              );
              if (part.type === 'tool-generateImage' && part.state === 'output-available') return (
                <ImageGenCard
                  key={`image:${part.output.imageGenId}`}
                  imageGenId={part.output.imageGenId}
                  prompt={part.output.prompt}
                  title={part.output.title}
                  size={part.output.size}
                  count={part.output.count}
                  modelId={part.output.modelId}
                />
              );
              return null;
            })}
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
            {!isStreaming && followUpQuestions.length > 0 ? <FollowUpQuestions questions={followUpQuestions} onSelect={onFollowUpSelect} /> : null}
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

function SourceCards({ sources, cacheHit, label = '联网来源' }: { sources: WebSearchSource[]; cacheHit?: boolean; label?: string }) {
  return (
    <div className="my-3 min-w-0 space-y-1.5" aria-label={label}>
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
        <AgentGlobeIcon size={16} />
        <span>{label} · {sources.length} 条</span>
        {cacheHit ? <span className="text-[var(--md-sys-color-outline)]">· 来自缓存</span> : null}
      </div>
      {sources.map((source, index) => (
        <a
          key={`${source.url}:${index}`}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 flex-col gap-1 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] px-3 py-2 no-underline transition-colors hover:bg-[var(--md-sys-color-surface-container-high)] focus-visible:outline-2 focus-visible:outline-[var(--md-sys-color-primary)] motion-reduce:transition-none"
        >
          <span className="flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-[var(--md-sys-color-on-surface)]"><span className="min-w-0 flex-1 truncate">{index + 1}. {source.title || sourceHost(source.url)}</span><AgentArrowUpRightIcon size={14} className="shrink-0" /></span>
          {source.snippet ? <span className="line-clamp-2 text-[11px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">{source.snippet}</span> : null}
          <span className="truncate text-[10px] text-[var(--md-sys-color-outline)]">{sourceHost(source.url)}</span>
        </a>
      ))}
    </div>
  );
}
