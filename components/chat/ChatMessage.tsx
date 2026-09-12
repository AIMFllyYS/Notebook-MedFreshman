'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { AgentLoopIcon, AgentUserIcon } from '@/components/icons/AgentIcons';
import type { ChatMessage as ChatMessageType } from '@/lib/types/chat';
import { MessageContent } from '@/components/chat/MessageContent';
import { FollowUpQuestions } from '@/components/chat/FollowUpQuestions';
import { AgentTrace, TRACE_COLLAPSE_MS } from '@/components/chat/AgentTrace';
import AttachmentThumbnails from '@/components/chat/AttachmentThumbnails';
import { openMessageMenu } from '@/lib/hooks/useContextMenu';
import { buildTrace, type AgentTraceModel, type TraceStep } from '@/lib/chat/buildTrace';
import { getMessageText } from '@/lib/chat/messageParts';
import { extractFollowUpQuestionsFromContent } from '@/lib/chat/rendering/parseChatContent';
import { collectMessageSources } from '@/lib/chat/traceSources';
import { ToolResultCards } from '@/components/chat/toolCards/ToolResultCards';

interface ChatMessageProps {
  message: ChatMessageType;
  onFollowUpSelect: (question: string) => void;
  isStreaming?: boolean;
  sessionId?: string;
  repairModelId?: string;
  topic?: string;
}

function traceFromSteps(steps: TraceStep[]): AgentTraceModel {
  return {
    steps,
    blocks: [{ kind: 'trace', steps }],
    answerText: '',
    toolCount: steps.filter((step) => step.kind === 'tool').length,
    errorCount: steps.filter((step) => step.status === 'error').length,
    interruptedCount: steps.filter((step) => step.status === 'interrupted').length,
    waitingCount: steps.filter((step) => step.status === 'waiting').length,
  };
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
  const followUpQuestions = useMemo(() => {
    if (message.followUpQuestions?.length) return message.followUpQuestions;
    const fromParts = parts.flatMap((part) => part.type === 'data-followup' ? part.data.questions : []);
    if (fromParts.length) return fromParts;
    return extractFollowUpQuestionsFromContent(getMessageText({ parts }));
  }, [message.followUpQuestions, parts]);

  const traceSources = useMemo(() => isUser ? [] : collectMessageSources(parts), [isUser, parts]);

  const lastTraceIndex = useMemo(() => {
    for (let index = trace.blocks.length - 1; index >= 0; index--) {
      if (trace.blocks[index].kind === 'trace') return index;
    }
    return -1;
  }, [trace.blocks]);

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`} data-message-role={message.role} data-message-id={message.id}>
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
            {trace.blocks.length === 0 && isStreaming ? (
              <AgentTrace trace={trace} isStreaming durationMs={message.metadata?.durationMs} />
            ) : null}
            {trace.blocks.map((block, index) => {
              if (block.kind === 'trace') {
                return (
                  <AgentTrace
                    key={block.steps[0]?.id ?? `trace:${index}`}
                    trace={traceFromSteps(block.steps)}
                    isStreaming={isStreaming}
                    durationMs={index === lastTraceIndex ? message.metadata?.durationMs : undefined}
                  />
                );
              }
              return (
                <div
                  key={`answer:${index}`}
                  className="chat-bubble-assistant chat-prose"
                  style={{ background: 'transparent', border: 'none', padding: 0, borderRadius: 0 }}
                  onContextMenu={(e) => openMessageMenu(e, trace.answerText)}
                >
                  <MessageContent
                    content={block.text}
                    enableVisualizations={true}
                    sessionId={sessionId}
                    messageId={message.id}
                    repairModelId={repairModelId}
                    topic={topic}
                  />
                </div>
              );
            })}
            <ToolResultCards message={message} isStreaming={isStreaming} />
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
