'use client';

import React, { useRef } from 'react';
import { AgentLoopIcon } from '@/components/icons/AgentIcons';
import { AgentTraceStep } from '@/components/chat/AgentTraceStep';
import { MessageContent } from '@/components/chat/MessageContent';
import type { TraceTextStep } from '@/lib/chat/buildTrace';
import { openMessageMenu } from '@/lib/hooks/useContextMenu';
import { useStickToBottom } from '@/lib/hooks/useStickToBottom';

export const ReasoningTraceStep = React.memo(function ReasoningTraceStep({ step }: { step: TraceTextStep }) {
  if (step.kind === 'text') {
    return (
      <li className="agent-trace-step agent-trace-commentary text-[13px] leading-[1.7] text-[var(--md-sys-color-on-surface)]" data-trace-id={step.id} data-trace-kind={step.kind} data-trace-status={step.status}>
        <ReasoningContent step={step} />
      </li>
    );
  }
  return (
    <AgentTraceStep {...step} icon={<AgentLoopIcon />} expandWhileRunning>
      <ReasoningContent step={step} />
    </AgentTraceStep>
  );
});

// Mounted only when this disclosure is open: collapsed reasoning does not keep a
// requestAnimationFrame scroll-follow loop alive during a long streamed answer.
function ReasoningContent({ step }: { step: TraceTextStep }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const onScroll = useStickToBottom(scrollRef, step.status === 'running');

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      onContextMenu={(event) => openMessageMenu(event, step.text)}
      className="chat-prose max-h-64 min-w-0 overflow-x-hidden overflow-y-auto break-words pr-2 [overflow-wrap:anywhere]"
    >
      {step.text ? <MessageContent content={step.text} enableVisualizations={false} preserveLineBreaks /> : <span>正在整理思路…</span>}
    </div>
  );
}

export default ReasoningTraceStep;
