'use client';

import React, { useMemo, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { ChevronLeft, ChevronRight, GitMerge, Sigma } from 'lucide-react';

export interface FormulaStepsProps {
  /** 每个元素是一步（可能含 LaTeX，使用 $...$ 或 $$...$$） */
  steps: string[];
  /** 默认 false（静态模式：展示完整列表） */
  interactive?: boolean;
}

/**
 * 将文本中的 $...$ 与 $$...$$ 用 KaTeX 渲染为 HTML，其余文本原样保留。
 * 返回的字符串可直接通过 dangerouslySetInnerHTML 注入。
 */
function renderLatex(text: string): string {
  // 先处理 $$...$$（display mode）
  const afterDisplay = text.replace(
    /\$\$([\s\S]+?)\$\$/g,
    (_, math) =>
      katex.renderToString(math, { displayMode: true, throwOnError: false })
  );
  // 再处理 $...$（inline mode）
  const afterInline = afterDisplay.replace(
    /\$([^\$]+?)\$/g,
    (_, math) =>
      katex.renderToString(math, { displayMode: false, throwOnError: false })
  );
  return afterInline;
}

/** 转义 HTML 特殊字符，避免普通文本被当作 HTML 解析 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * 把单步文本切成 [普通文本, 数学片段] 的序列：
 * - 普通文本需先转义再插入
 * - 数学片段用 KaTeX 渲染
 * 这样可以避免对整段文本做转义时破坏 KaTeX 输出的 HTML。
 */
function renderStepHtml(text: string): string {
  // 用正则同时匹配 $$...$$ 与 $...$，按出现顺序处理
  const parts: string[] = [];
  const regex = /\$\$([\s\S]+?)\$\$|\$([^\$]+?)\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(text.slice(lastIndex, match.index)));
    }
    const display = match[1];
    const inline = match[2];
    if (display !== undefined) {
      parts.push(
        katex.renderToString(display, { displayMode: true, throwOnError: false })
      );
    } else if (inline !== undefined) {
      parts.push(
        katex.renderToString(inline, { displayMode: false, throwOnError: false })
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(escapeHtml(text.slice(lastIndex)));
  }
  return parts.join('');
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

  // 预渲染每一步的 HTML
  const renderedSteps = useMemo(
    () => steps.map((s) => renderStepHtml(s)),
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
                dangerouslySetInnerHTML={{ __html: renderedSteps[current] }}
              />
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
          {renderedSteps.map((html, idx) => (
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
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormulaSteps;
