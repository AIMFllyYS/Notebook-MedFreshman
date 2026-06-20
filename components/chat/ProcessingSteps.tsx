'use client';

import React, { useState } from 'react';
import {
  ChevronUp, ChevronDown, Loader, CheckCircle2,
} from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/lib/types/chat';
import { ReasoningBlock } from '@/components/chat/ReasoningBlock';
import { ToolCallDashboard } from '@/components/chat/ToolCallDashboard';

interface ProcessingStepsProps {
  msg: ChatMessageType;
  streaming?: boolean;
}

const ProcessingSteps: React.FC<ProcessingStepsProps> = ({ msg, streaming }) => {
  const hasReasoning = !!msg.reasoningContent;
  const hasTools = !!msg.toolCalls && msg.toolCalls.length > 0;
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);

  if (!hasReasoning && !hasTools) return null;

  const isProcessing = streaming || (msg.toolCalls?.some((t) => t.status === 'running') ?? false);
  const expanded = userExpanded !== null ? userExpanded : isProcessing;

  return (
    <div className="processing-steps">
      <button
        onClick={() => setUserExpanded(!expanded)}
        className="processing-steps-header"
      >
        <div className="processing-steps-header-left">
          {isProcessing
            ? <Loader size={14} className="animate-spin" />
            : <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />}
          <span>{isProcessing ? '正在深度思考与调用工具...' : '处理完毕'}</span>
        </div>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="processing-steps-body">
          {msg.reasoningContent && (
            <ReasoningBlock content={msg.reasoningContent} isStreaming={!!(streaming && !hasTools)} />
          )}
          {msg.toolCalls && msg.toolCalls.length > 0 && (
            <ToolCallDashboard toolCalls={msg.toolCalls} />
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessingSteps;
