'use client';

import React from 'react';
import {
  VennDiagram,
  DistributionChart,
  FormulaSteps as FormulaStepsPrimitive,
  VideoPlayer,
} from '@/components/visualizations';

// ----------------------------------------------------
// ChatMessageVisualizations: 标签分发器
// 将 AI 输出的 XML 标签分发到 Phase 4 创建的公共可视化原语。
// XML 属性经 parseXmlTags 解析后均为字符串，这里负责按需转为 number/boolean。
// ----------------------------------------------------
interface ChatMessageVisualizationsProps {
  tagName: string;
  props: Record<string, any>;
  childrenText: string;
}

const toNum = (v: unknown): number | undefined =>
  v === undefined || v === null || v === '' ? undefined : Number(v);

const toBool = (v: unknown): boolean => v === 'true' || v === true;

export const ChatMessageVisualizations: React.FC<ChatMessageVisualizationsProps> = ({
  tagName,
  props,
  childrenText,
}) => {
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
          type={props.type || 'normal'}
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
          src={props.src}
          title={props.title}
          poster={props.poster}
        />
      );

    default:
      return null;
  }
};

export default ChatMessageVisualizations;
