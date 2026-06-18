'use client';

import React, { useState } from 'react';
import { BarChart2, Sliders, TrendingUp } from 'lucide-react';

export interface DistributionChartProps {
  type: 'normal' | 'binomial' | 'poisson';
  params?: {
    /** normal: 均值，默认 0 */
    mu?: number;
    /** normal: 标准差，默认 1 */
    sigma?: number;
    /** binomial: 试验次数，默认 10 */
    n?: number;
    /** binomial: 成功概率，默认 0.5 */
    p?: number;
    /** poisson: 参数，默认 3 */
    lambda?: number;
  };
  /** 默认 false */
  interactive?: boolean;
}

const SVG_W = 300;
const SVG_H = 160;
const PAD_L = 28;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 24;

// ── 数学工具 ──────────────────────────────────────────
function normalPdf(x: number, mu: number, sigma: number): number {
  const s = Math.max(1e-6, sigma);
  const coeff = 1 / (s * Math.sqrt(2 * Math.PI));
  return coeff * Math.exp(-0.5 * Math.pow((x - mu) / s, 2));
}

function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let res = 1;
  for (let i = 1; i <= k; i++) res = (res * (n - i + 1)) / i;
  return res;
}

function binomialPmf(n: number, p: number, k: number): number {
  return combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function poissonPmf(lambda: number, k: number): number {
  let factorial = 1;
  for (let i = 1; i <= k; i++) factorial *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
}

// ── 正态分布 SVG 路径 ─────────────────────────────────
function buildNormalPath(mu: number, sigma: number): { line: string; area: string; yMax: number } {
  const xMin = -4;
  const xMax = 4;
  const yMax = normalPdf(mu, mu, sigma); // 峰值
  const steps = 80;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (xMax - xMin) * (i / steps);
    const y = normalPdf(x, mu, sigma);
    const px = PAD_L + (i / steps) * (SVG_W - PAD_L - PAD_R);
    const py = SVG_H - PAD_B - (y / yMax) * (SVG_H - PAD_T - PAD_B);
    points.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`);
  }
  const line = points.join(' ');
  const baseY = SVG_H - PAD_B;
  const lastX = PAD_L + (SVG_W - PAD_L - PAD_R);
  const area = `${line} L${lastX.toFixed(1)},${baseY} L${PAD_L.toFixed(1)},${baseY} Z`;
  return { line, area, yMax };
}

// ── 离散分布柱状图数据 ────────────────────────────────
interface Bar {
  k: number;
  prob: number;
}

function buildBinomialBars(n: number, p: number): Bar[] {
  const bars: Bar[] = [];
  for (let k = 0; k <= n; k++) bars.push({ k, prob: binomialPmf(n, p, k) });
  return bars;
}

function buildPoissonBars(lambda: number): Bar[] {
  const bars: Bar[] = [];
  const maxK = Math.max(10, Math.ceil(lambda * 3) + 2);
  for (let k = 0; k < maxK; k++) bars.push({ k, prob: poissonPmf(lambda, k) });
  return bars;
}

// ── 主组件 ────────────────────────────────────────────
export const DistributionChart: React.FC<DistributionChartProps> = ({
  type,
  params = {},
  interactive = false,
}) => {
  const [mu, setMu] = useState(params.mu ?? 0);
  const [sigma, setSigma] = useState(params.sigma ?? 1);
  const [n, setN] = useState(params.n ?? 10);
  const [p, setP] = useState(params.p ?? 0.5);
  const [lambda, setLambda] = useState(params.lambda ?? 3);

  const label =
    type === 'normal'
      ? `正态分布 N(${mu.toFixed(1)}, ${(sigma * sigma).toFixed(2)})`
      : type === 'binomial'
      ? `二项分布 B(${n}, ${p.toFixed(2)})`
      : `泊松分布 P(λ=${lambda.toFixed(1)})`;

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
        {type === 'normal' ? (
          <TrendingUp size={15} style={{ color: 'var(--md-sys-color-primary)' }} />
        ) : (
          <BarChart2 size={15} style={{ color: 'var(--md-sys-color-primary)' }} />
        )}
        <span
          style={{
            fontWeight: 600,
            fontSize: '0.82rem',
            color: 'var(--md-sys-color-on-surface)',
          }}
        >
          {label}
        </span>
      </div>

      {type === 'normal' ? (
        <NormalChart mu={mu} sigma={sigma} />
      ) : type === 'binomial' ? (
        <BarsChart
          bars={buildBinomialBars(n, p)}
          highlight={Math.round(n * p)}
        />
      ) : (
        <BarsChart
          bars={buildPoissonBars(lambda)}
          highlight={Math.round(lambda)}
        />
      )}

      {/* 期望/方差 */}
      <div
        style={{
          marginTop: '0.4rem',
          display: 'flex',
          justifyContent: 'space-around',
          fontSize: '0.74rem',
          color: 'var(--md-sys-color-on-surface-variant)',
          padding: '0.4rem 0.5rem',
          borderRadius: '6px',
          background: 'var(--md-sys-color-surface-container)',
        }}
      >
        {type === 'normal' ? (
          <>
            <span>E(X) = {mu.toFixed(2)}</span>
            <span>D(X) = {(sigma * sigma).toFixed(2)}</span>
          </>
        ) : type === 'binomial' ? (
          <>
            <span>E(X) = {(n * p).toFixed(2)}</span>
            <span>D(X) = {(n * p * (1 - p)).toFixed(2)}</span>
          </>
        ) : (
          <>
            <span>E(X) = {lambda.toFixed(2)}</span>
            <span>D(X) = {lambda.toFixed(2)}</span>
          </>
        )}
      </div>

      {interactive && (
        <div
          style={{
            marginTop: '0.55rem',
            paddingTop: '0.55rem',
            borderTop: '1px solid var(--md-sys-color-outline-variant)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            fontSize: '0.76rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              marginBottom: '0.1rem',
            }}
          >
            <Sliders size={12} />
            <span style={{ fontSize: '0.72rem' }}>参数调节</span>
          </div>
          {type === 'normal' && (
            <>
              <SliderRow
                label={`μ = ${mu.toFixed(1)}`}
                min={-3}
                max={3}
                step={0.1}
                value={mu}
                color="var(--md-sys-color-primary)"
                onChange={setMu}
              />
              <SliderRow
                label={`σ = ${sigma.toFixed(2)}`}
                min={0.1}
                max={3}
                step={0.05}
                value={sigma}
                color="var(--md-sys-color-tertiary)"
                onChange={setSigma}
              />
            </>
          )}
          {type === 'binomial' && (
            <>
              <SliderRow
                label={`n = ${n}`}
                min={1}
                max={30}
                step={1}
                value={n}
                color="var(--md-sys-color-primary)"
                onChange={setN}
              />
              <SliderRow
                label={`p = ${p.toFixed(2)}`}
                min={0}
                max={1}
                step={0.01}
                value={p}
                color="var(--md-sys-color-tertiary)"
                onChange={setP}
              />
            </>
          )}
          {type === 'poisson' && (
            <SliderRow
              label={`λ = ${lambda.toFixed(1)}`}
              min={0.5}
              max={10}
              step={0.1}
              value={lambda}
              color="var(--md-sys-color-primary)"
              onChange={setLambda}
            />
          )}
        </div>
      )}
    </div>
  );
};

// ── 正态分布曲线子组件 ────────────────────────────────
const NormalChart: React.FC<{ mu: number; sigma: number }> = ({ mu, sigma }) => {
  const { line, area } = buildNormalPath(mu, sigma);
  const baseY = SVG_H - PAD_B;
  const peakX = PAD_L + ((mu + 4) / 8) * (SVG_W - PAD_L - PAD_R);
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ width: '100%', maxWidth: '360px', display: 'block', margin: '0 auto' }}
    >
      {/* 基线 */}
      <line
        x1={PAD_L}
        y1={baseY}
        x2={SVG_W - PAD_R}
        y2={baseY}
        stroke="var(--md-sys-color-outline-variant)"
        strokeWidth="1"
      />
      {/* 填充 */}
      <path d={area} fill="var(--md-sys-color-primary)" fillOpacity="0.12" />
      {/* 曲线 */}
      <path d={line} fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="2" />
      {/* 均值竖线 */}
      <line
        x1={peakX}
        y1={baseY}
        x2={peakX}
        y2={PAD_T + 4}
        stroke="var(--md-sys-color-tertiary)"
        strokeWidth="1"
        strokeDasharray="3 2"
      />
      <text
        x={peakX}
        y={baseY + 14}
        textAnchor="middle"
        style={{ fontSize: '9px', fill: 'var(--md-sys-color-on-surface-variant)' }}
      >
        μ
      </text>
      <text
        x={PAD_L}
        y={baseY + 14}
        style={{ fontSize: '9px', fill: 'var(--md-sys-color-on-surface-variant)' }}
      >
        -4
      </text>
      <text
        x={SVG_W - PAD_R}
        y={baseY + 14}
        textAnchor="end"
        style={{ fontSize: '9px', fill: 'var(--md-sys-color-on-surface-variant)' }}
      >
        4
      </text>
    </svg>
  );
};

// ── 离散柱状图子组件 ──────────────────────────────────
const BarsChart: React.FC<{ bars: Bar[]; highlight: number }> = ({ bars, highlight }) => {
  const maxProb = Math.max(...bars.map((b) => b.prob), 1e-6);
  const plotW = SVG_W - PAD_L - PAD_R;
  const plotH = SVG_H - PAD_T - PAD_B;
  const gap = 2;
  const barW = Math.max(3, (plotW - bars.length * gap) / bars.length);
  const baseY = SVG_H - PAD_B;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ width: '100%', maxWidth: '360px', display: 'block', margin: '0 auto' }}
    >
      <line
        x1={PAD_L}
        y1={baseY}
        x2={SVG_W - PAD_R}
        y2={baseY}
        stroke="var(--md-sys-color-outline-variant)"
        strokeWidth="1"
      />
      {bars.map((bar, i) => {
        const h = (bar.prob / maxProb) * plotH;
        const x = PAD_L + i * (barW + gap);
        const y = baseY - h;
        const isPeak = bar.k === highlight;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(0.5, h)}
              rx="1.5"
              fill={isPeak ? 'var(--md-sys-color-tertiary)' : 'var(--md-sys-color-primary)'}
              fillOpacity={isPeak ? 0.95 : 0.7}
            />
            {bars.length <= 16 && (
              <text
                x={x + barW / 2}
                y={baseY + 12}
                textAnchor="middle"
                style={{ fontSize: '8px', fill: 'var(--md-sys-color-on-surface-variant)' }}
              >
                {bar.k}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ── 滑块行 ────────────────────────────────────────────
const SliderRow: React.FC<{
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  color: string;
  onChange: (v: number) => void;
}> = ({ label, min, max, step, value, color, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
    <span
      style={{
        width: '72px',
        color: 'var(--md-sys-color-on-surface-variant)',
        flexShrink: 0,
      }}
    >
      {label}
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ flex: 1, accentColor: color }}
    />
  </div>
);

export default DistributionChart;
