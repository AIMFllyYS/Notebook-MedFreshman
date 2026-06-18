'use client';

import React, { useCallback, useId, useState } from 'react';
import { GitMerge, Sliders } from 'lucide-react';

/** 可被高亮的维恩图区域：a=仅A，b=仅B，ab=交集，out=两圆之外 */
export type VennRegion = 'a' | 'b' | 'ab' | 'out';

/** 高亮模式预设（映射到一组区域） */
export type VennHighlightMode =
  | 'union' // A ∪ B
  | 'intersection' // A ∩ B
  | 'difference' // A − B
  | 'complement' // (A ∪ B)ᶜ
  | 'symmetric-difference'; // A △ B

const HIGHLIGHT_PRESETS: Record<VennHighlightMode, VennRegion[]> = {
  union: ['a', 'b', 'ab'],
  intersection: ['ab'],
  difference: ['a'],
  complement: ['out'],
  'symmetric-difference': ['a', 'b'],
};

export interface VennDiagramProps {
  /** P(A)，默认 0.6 */
  a?: number;
  /** P(B)，默认 0.5 */
  b?: number;
  /** P(A∩B)，默认 0.2 */
  ab?: number;
  /** 默认 false（静态模式） */
  interactive?: boolean;
  /** 当交互模式下数值变化时回调 */
  onChange?: (a: number, b: number, ab: number) => void;
  /** 高亮模式预设；与 highlightRegions 二选一 */
  highlightMode?: VennHighlightMode;
  /** 显式指定高亮区域（优先于 highlightMode） */
  highlightRegions?: VennRegion[];
}

const SVG_W = 280;
const SVG_H = 180;
const CY = 95;
const R = 60;

/**
 * 根据三个概率计算派生量。
 * 约束：P(AB) ≤ min(P(A), P(B))，P(A)+P(B)-P(AB) ≤ 1
 */
function derive(a: number, b: number, ab: number) {
  const safeAB = Math.min(ab, Math.min(a, b));
  const union = a + b - safeAB;
  const onlyA = a - safeAB;
  const onlyB = b - safeAB;
  const neither = Math.max(0, 1 - union);
  return {
    a,
    b,
    ab: safeAB,
    union: Number(union.toFixed(3)),
    onlyA: Number(onlyA.toFixed(3)),
    onlyB: Number(onlyB.toFixed(3)),
    neither: Number(neither.toFixed(3)),
  };
}

/**
 * 根据 P(AB) 与 min(P(A),P(B)) 的比值动态决定两圆中心距离：
 * 比值越大（重叠越深）→ 距离越小。
 */
function centersFromOverlap(a: number, b: number, ab: number): [number, number] {
  const minAB = Math.min(a, b);
  const t = minAB > 0 ? Math.min(1, ab / minAB) : 0;
  const maxDist = R * 1.6; // 几乎分离
  const minDist = R * 0.35; // 高度重叠
  const dist = maxDist - t * (maxDist - minDist);
  return [SVG_W / 2 - dist / 2, SVG_W / 2 + dist / 2];
}

const round = (v: number) => Number(v.toFixed(2));

/**
 * VennDiagram 原语：纯 SVG 渲染两圆相交的维恩图。
 * - 静态模式：展示 P(A)、P(B)、P(A∩B)、P(A∪B) 等数值
 * - 交互模式：三个滑块调参，自动维持概率约束，圆距离随 P(AB) 变化
 */
export const VennDiagram: React.FC<VennDiagramProps> = ({
  a: aInit = 0.6,
  b: bInit = 0.5,
  ab: abInit = 0.2,
  interactive = false,
  onChange,
  highlightMode,
  highlightRegions,
}) => {
  const [a, setA] = useState(aInit);
  const [b, setB] = useState(bInit);
  const [ab, setAb] = useState(Math.min(abInit, Math.min(aInit, bInit)));

  // 解析高亮区域：显式 > 预设
  const highlight: VennRegion[] | null = highlightRegions
    ? highlightRegions
    : highlightMode
    ? HIGHLIGHT_PRESETS[highlightMode]
    : null;
  const isOn = (r: VennRegion) => !!highlight && highlight.includes(r);

  // 唯一 mask ID 前缀，避免同页多实例冲突
  const uid = useId().replace(/[:]/g, '');
  const maskOnlyA = `venn-${uid}-only-a`;
  const maskOnlyB = `venn-${uid}-only-b`;
  const maskAB = `venn-${uid}-ab`;
  const maskOut = `venn-${uid}-out`;

  const emit = useCallback(
    (na: number, nb: number, nab: number) => {
      onChange?.(round(na), round(nb), round(nab));
    },
    [onChange]
  );

  // 调 P(A)：若 P(AB) > newA 则压缩 P(AB)；若违反并集约束则压缩 P(B)
  const handleA = (val: number) => {
    let na = val;
    let nab = ab;
    let nb = b;
    if (nab > na) nab = na;
    if (na + nb - nab > 1) nb = Math.max(nab, Number((1 - na + nab).toFixed(2)));
    setA(na);
    setAb(nab);
    setB(nb);
    emit(na, nb, nab);
  };

  // 调 P(B)：对称逻辑
  const handleB = (val: number) => {
    let nb = val;
    let nab = ab;
    let na = a;
    if (nab > nb) nab = nb;
    if (na + nb - nab > 1) na = Math.max(nab, Number((1 - nb + nab).toFixed(2)));
    setB(nb);
    setAb(nab);
    setA(na);
    emit(na, nb, nab);
  };

  // 调 P(AB)：不能超过 min(P(A), P(B))
  const handleAB = (val: number) => {
    const maxAB = Math.min(a, b);
    const nab = Math.min(val, maxAB);
    setAb(nab);
    emit(a, b, nab);
  };

  const d = derive(a, b, ab);
  const [cx1, cx2] = centersFromOverlap(a, b, ab);

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fill: 'var(--md-sys-color-on-surface-variant)',
  };
  const valueStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    fill: 'var(--md-sys-color-on-surface)',
  };

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
          gap: '0.4rem',
          paddingBottom: '0.5rem',
          marginBottom: '0.5rem',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        }}
      >
        {interactive ? (
          <Sliders size={15} style={{ color: 'var(--md-sys-color-primary)' }} />
        ) : (
          <GitMerge size={15} style={{ color: 'var(--md-sys-color-primary)' }} />
        )}
        <span
          style={{
            fontWeight: 600,
            fontSize: '0.82rem',
            color: 'var(--md-sys-color-on-surface)',
          }}
        >
          {interactive ? '事件概率调节' : '维恩图'}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ width: '100%', maxWidth: '320px', display: 'block', margin: '0 auto' }}
      >
        {/* 样本空间 Ω */}
        <rect
          x="6"
          y="6"
          width={SVG_W - 12}
          height={SVG_H - 12}
          rx="8"
          fill="none"
          stroke="var(--md-sys-color-outline-variant)"
          strokeDasharray="4 2"
        />
        <text x="12" y="20" style={labelStyle}>
          Ω
        </text>

        {/* 圆 A */}
        <circle
          cx={cx1}
          cy={CY}
          r={R}
          fill="var(--md-sys-color-primary)"
          fillOpacity="0.22"
          stroke="var(--md-sys-color-primary)"
          strokeWidth="1.5"
        />
        {/* 圆 B */}
        <circle
          cx={cx2}
          cy={CY}
          r={R}
          fill="var(--md-sys-color-tertiary)"
          fillOpacity="0.22"
          stroke="var(--md-sys-color-tertiary)"
          strokeWidth="1.5"
        />

        {/* 高亮叠加层（当 highlightMode / highlightRegions 存在时） */}
        {highlight && (
          <>
            <defs>
              {/* 仅 A：白底 + 黑 B 圆 → 排除 B */}
              <mask id={maskOnlyA}>
                <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="white" />
                <circle cx={cx2} cy={CY} r={R} fill="black" />
              </mask>
              {/* 仅 B：白底 + 黑 A 圆 → 排除 A */}
              <mask id={maskOnlyB}>
                <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="white" />
                <circle cx={cx1} cy={CY} r={R} fill="black" />
              </mask>
              {/* 交集：黑底 + 白 A 圆 → 仅 A 内可见，应用到 B 圆形即得 A∩B */}
              <mask id={maskAB}>
                <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="black" />
                <circle cx={cx1} cy={CY} r={R} fill="white" />
              </mask>
              {/* 两圆之外：白底 + 黑 A、B 圆 */}
              <mask id={maskOut}>
                <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="white" />
                <circle cx={cx1} cy={CY} r={R} fill="black" />
                <circle cx={cx2} cy={CY} r={R} fill="black" />
              </mask>
            </defs>
            {isOn('out') && (
              <rect
                x="6"
                y="6"
                width={SVG_W - 12}
                height={SVG_H - 12}
                rx="8"
                fill="var(--md-sys-color-primary)"
                fillOpacity="0.42"
                mask={`url(#${maskOut})`}
              />
            )}
            {isOn('a') && (
              <circle
                cx={cx1}
                cy={CY}
                r={R}
                fill="var(--md-sys-color-primary)"
                fillOpacity="0.5"
                mask={`url(#${maskOnlyA})`}
              />
            )}
            {isOn('b') && (
              <circle
                cx={cx2}
                cy={CY}
                r={R}
                fill="var(--md-sys-color-primary)"
                fillOpacity="0.5"
                mask={`url(#${maskOnlyB})`}
              />
            )}
            {isOn('ab') && (
              <circle
                cx={cx2}
                cy={CY}
                r={R}
                fill="var(--md-sys-color-primary)"
                fillOpacity="0.6"
                mask={`url(#${maskAB})`}
              />
            )}
          </>
        )}

        {/* 标签 */}
        <text
          x={cx1 - R * 0.55}
          y={CY - R * 0.45}
          style={{ fontSize: '13px', fontWeight: 700, fill: 'var(--md-sys-color-primary)' }}
        >
          A
        </text>
        <text
          x={cx2 + R * 0.4}
          y={CY - R * 0.45}
          style={{ fontSize: '13px', fontWeight: 700, fill: 'var(--md-sys-color-tertiary)' }}
        >
          B
        </text>

        {/* 区域数值标注 */}
        <text x={cx1 - R * 0.3} y={CY + 4} style={valueStyle}>
          {d.onlyA.toFixed(2)}
        </text>
        <text x={(cx1 + cx2) / 2 - 8} y={CY + 4} style={valueStyle}>
          {d.ab.toFixed(2)}
        </text>
        <text x={cx2 + R * 0.15} y={CY + 4} style={valueStyle}>
          {d.onlyB.toFixed(2)}
        </text>
        <text x={SVG_W - 36} y={CY + 4} style={valueStyle}>
          {d.neither.toFixed(2)}
        </text>
      </svg>

      {/* 概率汇总 */}
      <div
        style={{
          marginTop: '0.5rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.35rem 0.75rem',
          fontSize: '0.74rem',
          color: 'var(--md-sys-color-on-surface-variant)',
        }}
      >
        <div>
          P(A) = <span style={{ color: 'var(--md-sys-color-primary)', fontWeight: 600 }}>{d.a.toFixed(2)}</span>
        </div>
        <div>
          P(B) = <span style={{ color: 'var(--md-sys-color-tertiary)', fontWeight: 600 }}>{d.b.toFixed(2)}</span>
        </div>
        <div>
          P(A∩B) = <span style={{ fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>{d.ab.toFixed(2)}</span>
        </div>
        <div>
          P(A∪B) = <span style={{ fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>{d.union.toFixed(2)}</span>
        </div>
      </div>

      {interactive && (
        <div
          style={{
            marginTop: '0.6rem',
            paddingTop: '0.6rem',
            borderTop: '1px solid var(--md-sys-color-outline-variant)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
            fontSize: '0.78rem',
          }}
        >
          <SliderRow
            label="P(A)"
            value={a}
            color="var(--md-sys-color-primary)"
            onChange={handleA}
          />
          <SliderRow
            label="P(B)"
            value={b}
            color="var(--md-sys-color-tertiary)"
            onChange={handleB}
          />
          <SliderRow
            label="P(A∩B)"
            value={ab}
            color="var(--md-sys-color-secondary)"
            onChange={handleAB}
          />
        </div>
      )}
    </div>
  );
};

const SliderRow: React.FC<{
  label: string;
  value: number;
  color: string;
  onChange: (v: number) => void;
}> = ({ label, value, color, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
    <span
      style={{
        width: '64px',
        color: 'var(--md-sys-color-on-surface-variant)',
        flexShrink: 0,
      }}
    >
      {label} = {value.toFixed(2)}
    </span>
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ flex: 1, accentColor: color }}
    />
  </div>
);

export default VennDiagram;
