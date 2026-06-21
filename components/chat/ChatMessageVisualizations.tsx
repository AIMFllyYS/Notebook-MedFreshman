'use client';

import React from 'react';
import {
  VennDiagram,
  DistributionChart,
  FormulaSteps as FormulaStepsPrimitive,
  VideoPlayer,
} from '@/components/visualizations';
import { SvgCanvas } from '@/components/canvas';

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

    case 'SvgDiagram': {
      const svgContent = childrenText.trim();
      const title = props.title || '示意图';
      return (
        <div style={{ margin: '0.8em 0' }}>
          {title && (
            <div style={{
              fontSize: '0.85em',
              fontWeight: 600,
              color: 'var(--md-sys-color-on-surface-variant)',
              marginBottom: '0.5em',
            }}>
              {title}
            </div>
          )}
          <SvgCanvas
            width={toNum(props.width) ?? 400}
            height={toNum(props.height) ?? 300}
            showGrid={toBool(props.grid)}
          >
            <g dangerouslySetInnerHTML={{ __html: svgContent }} />
          </SvgCanvas>
        </div>
      );
    }

    default:
      return null;
  }
};

export default ChatMessageVisualizations;
