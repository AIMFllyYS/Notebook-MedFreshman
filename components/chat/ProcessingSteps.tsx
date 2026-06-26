'use client';

import React from 'react';
import {
  ChevronUp, ChevronDown, Loader, CheckCircle2,
} from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/lib/types/chat';
import { ReasoningBlock } from '@/components/chat/ReasoningBlock';
import { ToolCallDashboard } from '@/components/chat/ToolCallDashboard';
import { useProcessingDisclosure } from '@/lib/hooks/useProcessingDisclosure';

interface ProcessingStepsProps {
  msg: ChatMessageType;
  streaming?: boolean;
}

const ProcessingSteps: React.FC<ProcessingStepsProps> = ({ msg, streaming }) => {
  const hasReasoning = !!msg.reasoningContent;
  const hasTools = !!msg.toolCalls && msg.toolCalls.length > 0;

  const isProcessing = streaming || (msg.toolCalls?.some((t) => t.status === 'running') ?? false);

  // 外壳：处理开始自动展开、完成自动折叠到「处理完毕」头，中途手动开合受尊重。
  const [expanded, setExpanded] = useProcessingDisclosure(isProcessing);

  if (!hasReasoning && !hasTools) return null;

  return (
    <div className="processing-steps">
      <button
        onClick={() => setExpanded(!expanded)}
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
            <ReasoningBlock content={msg.reasoningContent} isProcessing={isProcessing} />
          )}
          {msg.toolCalls && msg.toolCalls.length > 0 && (
            <ToolCallDashboard toolCalls={msg.toolCalls} isProcessing={isProcessing} />
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessingSteps;
