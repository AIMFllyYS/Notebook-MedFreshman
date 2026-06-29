'use client';

import React, { useCallback } from 'react';
import {
  VennDiagram,
  DistributionChart,
  FormulaSteps as FormulaStepsPrimitive,
  VideoPlayer,
} from '@/components/visualizations';
import { DiagramCanvas, isDiagramMode } from '@/components/canvas';
import { useChatHistory } from '@/lib/hooks/useChatHistory';
import { replaceCanvasBlock } from '@/lib/chat/rendering/canvasBlockPatch';
import type { CanvasBlock } from '@/lib/canvas/types';

// ----------------------------------------------------
// ChatMessageVisualizations: 标签分发器
// 将 AI 输出的 XML 标签分发到 Phase 4 创建的公共可视化原语。
// XML 属性经 parseXmlTags 解析后均为字符串，这里负责按需转为 number/boolean。
// ----------------------------------------------------
interface ChatMessageVisualizationsProps {
  tagName: string;
  props: Record<string, unknown>;
  childrenText: string;
  repairContext?: {
    sessionId?: string;
    messageId?: string;
    blockIndex?: number;
    modelId?: string;
    topic?: string;
  };
}

const toNum = (v: unknown): number | undefined =>
  v === undefined || v === null || v === '' ? undefined : Number(v);

const toBool = (v: unknown): boolean => v === 'true' || v === true;

const toStr = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v : undefined;

const toDistributionType = (v: unknown): 'normal' | 'binomial' | 'poisson' =>
  v === 'binomial' || v === 'poisson' || v === 'normal' ? v : 'normal';

export const ChatMessageVisualizations: React.FC<ChatMessageVisualizationsProps> = ({
  tagName,
  props,
  childrenText,
  repairContext,
}) => {
  const handleCanvasRevision = useCallback((nextBlock: CanvasBlock) => {
    const sessionId = repairContext?.sessionId;
    const messageId = repairContext?.messageId;
    const blockIndex = repairContext?.blockIndex;
    if (!sessionId || !messageId || blockIndex === undefined) return;

    const state = useChatHistory.getState();
    const message = state.messagesById[sessionId]?.find((item) => item.id === messageId);
    if (!message) return;

    const content = replaceCanvasBlock(message.content, blockIndex, nextBlock);
    if (content !== message.content) {
      state.updateMessage(sessionId, messageId, { content });
    }
  }, [repairContext]);

  switch (tagName) {
    case 'InteractiveVenn':
      return (
        <VennDiagram
          a={toNum(props.a)}
          b={toNum(props.b)}
          ab={toNum(props.ab)}
          interactive={toBool(props.interactive)}
        />
      );

    case 'InlineDistribution': {
      const hasParams =
        props.mu !== undefined ||
        props.sigma !== undefined ||
        props.n !== undefined ||
        props.p !== undefined ||
        props.lambda !== undefined;
      return (
        <DistributionChart
          type={toDistributionType(props.type)}
          params={
            hasParams
              ? {
                  mu: toNum(props.mu),
                  sigma: toNum(props.sigma),
                  n: toNum(props.n),
                  p: toNum(props.p),
                  lambda: toNum(props.lambda),
                }
              : undefined
          }
          interactive={toBool(props.interactive)}
        />
      );
    }

    case 'FormulaSteps': {
      const steps = childrenText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      return (
        <FormulaStepsPrimitive
          steps={steps}
          interactive={toBool(props.interactive)}
        />
      );
    }

    case 'ManimPlayer':
      return (
        <VideoPlayer
          src={toStr(props.src) ?? ''}
          title={toStr(props.title)}
          poster={toStr(props.poster)}
        />
      );

    case 'SvgDiagram': {
      // 统一画布：mode 路由 raw(自由SVG) / math(函数图) / molecule(SMILES) / html(沙箱)。
      const mode = isDiagramMode(props.mode) ? props.mode : 'raw';
      const title = props.title ? String(props.title) : undefined;
      return (
        <DiagramCanvas
          mode={mode}
          content={childrenText.trim()}
          title={title}
          width={toNum(props.width)}
          height={toNum(props.height)}
          attrs={props}
          repairContext={{
            modelId: repairContext?.modelId,
            topic: repairContext?.topic,
          }}
          onRevisionAccepted={handleCanvasRevision}
        />
      );
    }

    default:
      return null;
  }
};

export default ChatMessageVisualizations;
