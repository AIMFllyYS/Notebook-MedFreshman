'use client';

import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import { ChevronLeft, ChevronRight, GitMerge, Sigma } from 'lucide-react';
import { sharedRemarkPlugins, sharedRehypePlugins } from '@/lib/markdown/plugins';

export interface FormulaStepsProps {
  /** 每个元素是一步（可能含 LaTeX，使用 $...$ 或 $$...$$） */
  steps: string[];
  /** 默认 false（静态模式：展示完整列表） */
  interactive?: boolean;
}

const LATEX_COMMAND_RE = /\\(?:frac|sqrt|left|right|sum|prod|int|lim|sin|cos|tan|log|ln|mathrm|mathbf|vec|overline|hat|tilde|cdot|times|div|leq|geq|neq|approx|to|infty|alpha|beta|gamma|rho|sigma|mu|theta|Delta|partial)\b/;
const CJK_RE = /[\u3400-\u9fff]/;

function hasMathDelimiter(text: string): boolean {
  return /\$[^$]+\$|\$\$[\s\S]+?\$\$/.test(text);
}

function normalizeStepMarkdown(step: string): string {
  const trimmed = step.trim();
  if (!trimmed || hasMathDelimiter(trimmed) || !LATEX_COMMAND_RE.test(trimmed)) {
    return step;
  }

  // 兼容旧消息/模型偶发输出：整步明显是公式时才自动补数学定界符。
  if (!CJK_RE.test(trimmed)) {
    return `$${trimmed}$`;
  }

  return step;
}

function StepMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={sharedRemarkPlugins}
      rehypePlugins={sharedRehypePlugins}
      components={{
        p: ({ children: paragraphChildren }) => <>{paragraphChildren}</>,
      }}
    >
      {normalizeStepMarkdown(children)}
    </ReactMarkdown>
  );
}

/**
 * FormulaSteps 原语：用 KaTeX 渲染含 LaTeX 的公式推导步骤。
 * - 静态模式：编号步骤列表，全部展示
 * - 交互模式：上一步/下一步导航，当前步骤高亮
 */
export const FormulaSteps: React.FC<FormulaStepsProps> = ({
  steps,
  interactive = false,
}) => {
  const [current, setCurrent] = useState(0);

  const renderedSteps = useMemo(
    () => steps.map((s) => normalizeStepMarkdown(s)),
    [steps]
  );

  if (steps.length === 0) return null;

  const goPrev = () => setCurrent((c) => Math.max(0, c - 1));
  const goNext = () => setCurrent((c) => Math.min(steps.length - 1, c + 1));

  return (
    <div
      style={{
        padding: '0.85rem',
        borderRadius: '10px',
        border: '1px solid var(--md-sys-color-outline-variant)',
        background: 'var(--md-sys-color-surface-container-high)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.5rem',
          marginBottom: '0.5rem',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {interactive ? (
            <GitMerge size={15} style={{ color: 'var(--md-sys-color-primary)' }} />
          ) : (
            <Sigma size={15} style={{ color: 'var(--md-sys-color-primary)' }} />
          )}
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.82rem',
              color: 'var(--md-sys-color-on-surface)',
            }}
          >
            公式推导步骤
          </span>
        </div>
        {interactive && (
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--md-sys-color-on-surface-variant)',
            }}
          >
            第 {current + 1} / {steps.length} 步
          </span>
        )}
      </div>

      {interactive ? (
        <div>
          <div
            style={{
              padding: '0.75rem',
              background: 'var(--md-sys-color-surface-container)',
              borderRadius: '8px',
              borderLeft: '3px solid var(--md-sys-color-primary)',
              fontSize: '0.85rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              minHeight: '56px',
              overflowX: 'auto',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}
            >
              <span
                style={{
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'var(--md-sys-color-primary-container)',
                  color: 'var(--md-sys-color-on-primary-container)',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {current + 1}
              </span>
              <div
                style={{ lineHeight: 1.6, flex: 1 }}
              >
                <StepMarkdown>{renderedSteps[current]}</StepMarkdown>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              marginTop: '0.6rem',
              justifyContent: 'flex-end',
            }}
          >
            <button
              onClick={goPrev}
              disabled={current === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontSize: '0.74rem',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid var(--md-sys-color-outline)',
                background: 'transparent',
                color: 'var(--md-sys-color-on-surface-variant)',
                cursor: current === 0 ? 'not-allowed' : 'pointer',
                opacity: current === 0 ? 0.4 : 1,
              }}
            >
              <ChevronLeft size={13} />
              上一步
            </button>
            <button
              onClick={goNext}
              disabled={current === steps.length - 1}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontSize: '0.74rem',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                border: 'none',
                background: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
                cursor: current === steps.length - 1 ? 'not-allowed' : 'pointer',
                opacity: current === steps.length - 1 ? 0.4 : 1,
              }}
            >
              下一步
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {renderedSteps.map((step, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.5rem 0.65rem',
                background: 'var(--md-sys-color-surface-container)',
                borderRadius: '6px',
                borderLeft: '3px solid var(--md-sys-color-primary)',
                fontSize: '0.85rem',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              <span
                style={{
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'var(--md-sys-color-primary-container)',
                  color: 'var(--md-sys-color-on-primary-container)',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </span>
              <div
                style={{ lineHeight: 1.6, flex: 1, overflowX: 'auto' }}
              >
                <StepMarkdown>{step}</StepMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormulaSteps;
