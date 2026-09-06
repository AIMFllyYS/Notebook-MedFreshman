'use client';

import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AgentAlertIcon, AgentChevronIcon, AgentPauseIcon } from '@/components/icons/AgentIcons';
import type { TraceStatus } from '@/lib/chat/buildTrace';
import { useProcessingDisclosure } from '@/lib/hooks/useProcessingDisclosure';

export interface AgentTraceStepProps {
  id: string;
  kind: 'reasoning' | 'text' | 'tool';
  title: string;
  summary: string;
  status: TraceStatus;
  icon: React.ReactNode;
  children: React.ReactNode;
  /** Narrative can unfold live; tool details remain opt-in to keep the log compact. */
  expandWhileRunning?: boolean;
}

const STATUS_LABELS: Record<TraceStatus, string> = {
  running: '进行中',
  complete: '已完成',
  error: '失败',
  interrupted: '已停止',
  waiting: '待批准',
};

/** Flat activity row: one semantic glyph, one line of text, details on demand. */
export const AgentTraceStep = React.memo(function AgentTraceStep({ id, kind, title, summary, status, icon, children, expandWhileRunning = false }: AgentTraceStepProps) {
  const contentId = useId();
  const reducedMotion = useReducedMotion();
  const active = status === 'running';
  const [expanded, setExpanded] = useProcessingDisclosure(active && expandWhileRunning, status === 'error');
  const isError = status === 'error';
  const exceptional = isError || status === 'interrupted' || status === 'waiting';

  return (
    <li className="agent-trace-step" data-trace-id={id} data-trace-kind={kind} data-trace-status={status}>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((open) => !open)}
        className={`flex min-h-10 w-full min-w-0 items-center gap-2 rounded-md py-2 text-left text-[13px] leading-5 transition-colors hover:text-[var(--md-sys-color-on-surface)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--md-sys-color-primary)] motion-reduce:transition-none ${active ? 'text-[var(--md-sys-color-on-surface)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}`}
      >
        <motion.span
          aria-hidden="true"
          className={`flex h-5 w-5 shrink-0 items-center justify-center ${isError ? 'text-[var(--md-sys-color-error)]' : ''}`}
          animate={!reducedMotion && active ? { opacity: [0.45, 1, 0.45] } : { opacity: 0.85 }}
          transition={!reducedMotion && active ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
        >
          {isError ? <AgentAlertIcon /> : status === 'interrupted' ? <AgentPauseIcon /> : icon}
        </motion.span>
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="max-w-[70%] shrink-0 truncate">{title}</span>
          <span className={exceptional ? `shrink-0 text-[11px] ${isError ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-sys-color-outline)]'}` : 'sr-only'}>{STATUS_LABELS[status]}</span>
          {!expanded && summary ? <span className="min-w-0 truncate text-[12px] text-[var(--md-sys-color-outline)]">{summary}</span> : null}
          <span aria-hidden="true" className={`shrink-0 opacity-65 transition-transform motion-reduce:transition-none ${expanded ? 'rotate-180' : '-rotate-90'}`}>
            <AgentChevronIcon size={14} />
          </span>
        </span>
      </button>
      <div id={contentId} hidden={!expanded}>
        {expanded ? (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.16 }}
            className="agent-trace-step-body text-[12px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]"
          >
            {children}
          </motion.div>
        ) : null}
      </div>
    </li>
  );
});

export default AgentTraceStep;
