'use client';

import React from 'react';
import {
  AgentDocumentIcon,
  AgentFileIcon,
  AgentGalleryIcon,
  AgentImageIcon,
  AgentLoopIcon,
  AgentQuizIcon,
  AgentSearchIcon,
  AgentTerminalIcon,
} from '@/components/icons/AgentIcons';
import { AgentTraceStep } from '@/components/chat/AgentTraceStep';
import { getTraceToolOutput, type TraceToolStep as ToolStep } from '@/lib/chat/buildTrace';
import { getToolPresentation, type ToolIconKind } from '@/lib/chat/toolPresentation';

export const ToolTraceStep = React.memo(function ToolTraceStep({ step }: { step: ToolStep }) {
  const { part } = step;
  const input = part.input ?? (part.state === 'output-error' && 'rawInput' in part ? part.rawInput : undefined);
  const output = getTraceToolOutput(part);
  const hasInput = input != null && (typeof input !== 'object' || Object.keys(input).length > 0);

  return (
    <AgentTraceStep {...step} icon={<ToolIcon name={step.name} />}>
      <div className="min-w-0 space-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[var(--md-sys-color-outline)]">
          <code className="break-all">{step.name}()</code>
          {step.status === 'running' || step.status === 'waiting' || step.status === 'interrupted' ? <span>{step.summary}</span> : null}
        </div>
        {hasInput ? (
          <div className="agent-trace-subdetail">
            <p className="mb-1 text-[10px] font-medium text-[var(--md-sys-color-outline)]">输入参数</p>
            <pre className="m-0 max-h-40 overflow-auto whitespace-pre-wrap break-words py-1 font-mono text-[11px] leading-relaxed [overflow-wrap:anywhere]">{typeof input === 'string' ? input : JSON.stringify(input, null, 2)}</pre>
          </div>
        ) : null}
        {output ? (
          <div className="agent-trace-subdetail">
            <p className={`mb-1 text-[10px] font-medium ${step.status === 'error' ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-sys-color-outline)]'}`}>{step.status === 'error' ? '调用失败' : '返回结果'}</p>
            <pre className={`m-0 max-h-44 overflow-auto whitespace-pre-wrap break-words py-1 font-mono text-[11px] leading-relaxed [overflow-wrap:anywhere] ${step.status === 'error' ? 'text-[var(--md-sys-color-error)]' : ''}`}>{output}</pre>
          </div>
        ) : null}
        {!hasInput && !output && step.status === 'complete' ? <span>运行成功</span> : null}
      </div>
    </AgentTraceStep>
  );
});

const ICONS: Record<ToolIconKind, React.ReactElement> = {
  search: <AgentSearchIcon />,
  file: <AgentFileIcon />,
  image: <AgentImageIcon />,
  gallery: <AgentGalleryIcon />,
  skill: <AgentLoopIcon />,
  terminal: <AgentTerminalIcon />,
  quiz: <AgentQuizIcon />,
  document: <AgentDocumentIcon />,
};

/** 图标来自 toolPresentation 注册表；未知（dynamic-tool）工具回落到终端图标。 */
export function ToolIcon({ name }: { name: string }) {
  return ICONS[getToolPresentation(name)?.icon ?? 'terminal'];
}

