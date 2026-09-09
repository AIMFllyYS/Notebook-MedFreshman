'use client';

import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AgentChevronIcon } from '@/components/icons/AgentIcons';
import type { AgentTraceModel } from '@/lib/chat/buildTrace';
import { useProcessingDisclosure } from '@/lib/hooks/useProcessingDisclosure';
import { ToolTraceStep } from '@/components/chat/ToolTraceStep';
import { ReasoningTraceStep } from '@/components/chat/ReasoningTraceStep';

export interface AgentTraceProps {
  trace: AgentTraceModel;
  isStreaming?: boolean;
  durationMs?: number;
}

function completedLabel(trace: AgentTraceModel, durationMs?: number): string {
  if (trace.interruptedCount > 0) return '处理已停止';
  if (trace.waitingCount > 0) return '等待工具批准';
  if (trace.errorCount > 0) return '处理结束，部分步骤未完成';
  if (durationMs != null && Number.isFinite(durationMs) && durationMs >= 0) {
    if (durationMs < 1000) return '已处理不到 1 秒';
    const seconds = Math.round(durationMs / 1000);
    if (seconds >= 60) return `已处理 ${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`;
    return `已处理 ${seconds} 秒`;
  }
  return '处理完成';
}

export const AgentTrace = React.memo(function AgentTrace({ trace, isStreaming = false, durationMs }: AgentTraceProps) {
  const contentId = useId();
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useProcessingDisclosure(isStreaming);
  const pulse = isStreaming && !reducedMotion && !trace.waitingCount;

  if (trace.steps.length === 0) {
    if (!isStreaming) return null;
    return (
      <section className="agent-trace mb-1 min-w-0" aria-label="Agent 处理过程">
        <p
          role="status"
          aria-live="polite"
          data-testid="agent-trace-thinking"
          className="flex min-h-9 max-w-full items-center rounded-md py-1.5 text-left text-[13px] leading-5 text-[var(--md-sys-color-on-surface-variant)]"
        >
          <motion.span
            className="min-w-0 [overflow-wrap:anywhere]"
            animate={pulse ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
            transition={pulse ? { duration: 2.4, repeat: Infinity } : { duration: 0 }}
          >
            正在思考…
          </motion.span>
        </p>
      </section>
    );
  }

  const activeStep = trace.steps.findLast((step) => step.status === 'running');
  const title = isStreaming
    ? (activeStep ? '正在处理…' : trace.waitingCount ? '等待工具批准' : '正在整理回答…')
    : completedLabel(trace, durationMs);

  return (
    <section className="agent-trace mb-4 min-w-0" aria-label="Agent 处理过程">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((open) => !open)}
        className="flex min-h-9 max-w-full items-center gap-1 rounded-md py-1.5 text-left text-[13px] leading-5 text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:text-[var(--md-sys-color-on-surface)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--md-sys-color-primary)] motion-reduce:transition-none"
      >
        <motion.span
          role="status"
          aria-live="polite"
          className="min-w-0 [overflow-wrap:anywhere]"
          animate={isStreaming && !reducedMotion && !trace.waitingCount ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
          transition={isStreaming && !reducedMotion && !trace.waitingCount ? { duration: 2.4, repeat: Infinity } : { duration: 0 }}
        >
          {title}
        </motion.span>
        <span aria-hidden="true" className={`shrink-0 transition-transform motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`}><AgentChevronIcon size={15} /></span>
      </button>
      <div id={contentId} hidden={!expanded}>
        {expanded ? (
          <motion.ol
            aria-label="按执行顺序排列的步骤"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.16 }}
            className="agent-trace-list"
          >
            {trace.steps.map((step) => step.kind === 'tool'
              ? <ToolTraceStep key={step.id} step={step} />
              : <ReasoningTraceStep key={step.id} step={step} />)}
          </motion.ol>
        ) : null}
      </div>
    </section>
  );
});

