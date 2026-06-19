"use client";

import { memo, useState, useCallback } from "react";

// ─── 设计常量 ──────────────────────────────────────────────────
const ACCENT = "#5b46e5";
const ACCENT_LIGHT = "#ede9fe";
const TEAL = "#0d9488";
const TEAL_LIGHT = "#ccfbf1";
const ORANGE = "#ea580c";
const ORANGE_LIGHT = "#ffedd5";
const GRAY_LINE = "var(--line)";
const GRAY_BG = "var(--bg-muted)";

// ─── SVG 图表尺寸 ─────────────────────────────────────────────
const W = 480;
const H = 200;
const PAD = { top: 16, right: 16, bottom: 36, left: 42 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;

// ─── 分布类型 ─────────────────────────────────────────────────
type DistType = "normal" | "uniform" | "exponential" | "bernoulli";

interface DistParams {
  type: DistType;
  // Normal: mu, sigma
  // Uniform: a, b
  // Exponential: lambda
  // Bernoulli: p
  p1: number;
  p2: number;
}

interface DistConfig {
  label: string;
  params: [string, string, number, number, number][];
  // [display name, key, min, max, step]
  mean: (d: DistParams) => number;
  variance: (d: DistParams) => number;
  sample: (d: DistParams) => number;
  pdf?: (x: number, d: DistParams) => number;
  support: (d: DistParams) => [number, number];
}

const DIST_CONFIGS: Record<DistType, DistConfig> = {
  normal: {
    label: "正态分布 N(μ,σ²)",
    params: [
      ["均值 μ", "p1", -3, 3, 0.1],
      ["标准差 σ", "p2", 0.2, 3, 0.1],
    ],
    mean: (d) => d.p1,
    variance: (d) => d.p2 * d.p2,
    sample: (d) => {
      // Box–Muller
      const u = 1 - Math.random();
      const v = Math.random();
      return d.p1 + d.p2 * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },
    pdf: (x, d) => {
      const s = d.p2;
      const mu = d.p1;
      return (
        Math.exp(-0.5 * ((x - mu) / s) ** 2) /
        (s * Math.sqrt(2 * Math.PI))
      );
    },
    support: (d) => [d.p1 - 4 * d.p2, d.p1 + 4 * d.p2],
  },
  uniform: {
    label: "均匀分布 U(a,b)",
    params: [
      ["左端 a", "p1", -5, 4, 0.5],
      ["右端 b", "p2", -4, 5, 0.5],
    ],
    mean: (d) => (d.p1 + d.p2) / 2,
    variance: (d) => Math.max(0, (d.p2 - d.p1) ** 2 / 12),
    sample: (d) => d.p1 + Math.random() * Math.max(0.001, d.p2 - d.p1),
    pdf: (x, d) => {
      const len = d.p2 - d.p1;
      if (len <= 0) return 0;
      return x >= d.p1 && x <= d.p2 ? 1 / len : 0;
    },
    support: (d) => [d.p1 - 0.5, d.p2 + 0.5],
  },
  exponential: {
    label: "指数分布 Exp(λ)",
    params: [
      ["速率 λ", "p1", 0.2, 4, 0.1],
      ["偏移 c", "p2", 0, 3, 0.25],
    ],
    mean: (d) => d.p2 + 1 / d.p1,
    variance: (d) => 1 / (d.p1 * d.p1),
    sample: (d) => d.p2 + -Math.log(1 - Math.random()) / d.p1,
    pdf: (x, d) => {
      const shifted = x - d.p2;
      if (shifted < 0) return 0;
      return d.p1 * Math.exp(-d.p1 * shifted);
    },
    support: (d) => [d.p2, d.p2 + 8 / d.p1],
  },
  bernoulli: {
    label: "伯努利分布 B(p)",
    params: [
      ["成功概率 p", "p1", 0.05, 0.95, 0.05],
      ["倍率 k", "p2", 1, 5, 1],
    ],
    mean: (d) => d.p1 * d.p2,
    variance: (d) => d.p1 * (1 - d.p1) * d.p2 * d.p2,
    sample: (d) => (Math.random() < d.p1 ? d.p2 : 0),
    support: () => [-0.5, 5.5],
  },
};

const DEFAULT_DIST: DistParams = { type: "normal", p1: 0, p2: 1 };

// ─── 辅助：生成 N 个样本 ────────────────────────────────────────
function sampleDist(d: DistParams, n: number): number[] {
  const cfg = DIST_CONFIGS[d.type];
  const arr: number[] = [];
  for (let i = 0; i < n; i++) arr.push(cfg.sample(d));
  return arr;
}

// ─── 辅助：将样本装桶为直方图 ───────────────────────────────────
function buildHistogram(
  data: number[],
  binMin: number,
  binMax: number,
  numBins: number
): number[] {
  const bins = new Array<number>(numBins).fill(0);
  const span = binMax - binMin;
  if (span <= 0) return bins;
  for (const v of data) {
    const idx = Math.floor(((v - binMin) / span) * numBins);
    const clamped = Math.min(Math.max(idx, 0), numBins - 1);
    bins[clamped]++;
  }
  return bins;
}

// ─── 辅助：判断是否有解析 PDF ────────────────────────────────────
function hasAnalyticConvPDF(xType: DistType, yType: DistType): boolean {
  if (xType === "normal" && yType === "normal") return true;
  if (xType === "uniform" && yType === "uniform") return true;
  if (xType === "exponential" && yType === "exponential") return true;
  return false;
}

// 计算解析卷积 PDF（支持部分组合）
function analyticConvPDF(
  z: number,
  xDist: DistParams,
  yDist: DistParams
): number {
  const xt = xDist.type;
  const yt = yDist.type;

  // Normal + Normal → Normal(μ₁+μ₂, σ₁²+σ₂²)
  if (xt === "normal" && yt === "normal") {
    const mu = xDist.p1 + yDist.p1;
    const sigma = Math.sqrt(xDist.p2 ** 2 + yDist.p2 ** 2);
    return (
      Math.exp(-0.5 * ((z - mu) / sigma) ** 2) /
      (sigma * Math.sqrt(2 * Math.PI))
    );
  }

  // Exp(λ₁) + Exp(λ₂) → Hypo-exponential or Erlang(2,λ) if λ₁=λ₂
  if (xt === "exponential" && yt === "exponential") {
    const lam1 = xDist.p1;
    const lam2 = yDist.p1;
    const shift = xDist.p2 + yDist.p2;
    const s = z - shift;
    if (s < 0) return 0;
    if (Math.abs(lam1 - lam2) < 1e-6) {
      // Erlang(2,λ)
      return lam1 * lam1 * s * Math.exp(-lam1 * s);
    }
    return (
      (lam1 * lam2) / (lam2 - lam1) *
      (Math.exp(-lam1 * s) - Math.exp(-lam2 * s))
    );
  }

  // Uniform[a1,b1] + Uniform[a2,b2] → Trapezoid / Triangle
  if (xt === "uniform" && yt === "uniform") {
    const a1 = xDist.p1,
      b1 = Math.max(xDist.p1 + 0.001, xDist.p2);
    const a2 = yDist.p1,
      b2 = Math.max(yDist.p1 + 0.001, yDist.p2);
    const len1 = b1 - a1;
    const len2 = b2 - a2;
    const lo = a1 + a2;
    const hi = b1 + b2;
    if (z <= lo || z >= hi) return 0;
    // 分段计算三角/梯形卷积
    const t = z - lo;
    const L = hi - lo;
    const m1 = b1 - a1;
    const m2 = b2 - a2;
    // max(0,t-m2) .. min(t, m1) 积分
    const upper = Math.min(t, m1);
    const lower = Math.max(0, t - m2);
    if (upper <= lower) return 0;
    return (upper - lower) / (len1 * len2);
  }

  return 0;
}

// ─── 分布选择器与参数滑块 ────────────────────────────────────────
interface DistPanelProps {
  label: string;
  color: string;
  dist: DistParams;
  onChange: (d: DistParams) => void;
}

function DistPanel({ label, color, dist, onChange }: DistPanelProps) {
  const cfg = DIST_CONFIGS[dist.type];
  const types: DistType[] = ["normal", "uniform", "exponential", "bernoulli"];

  function setType(t: DistType) {
    const defaults: Record<DistType, DistParams> = {
      normal: { type: "normal", p1: 0, p2: 1 },
      uniform: { type: "uniform", p1: -1, p2: 1 },
      exponential: { type: "exponential", p1: 1, p2: 0 },
      bernoulli: { type: "bernoulli", p1: 0.5, p2: 2 },
    };
    onChange(defaults[t]);
  }

  function setParam(key: "p1" | "p2", val: number) {
    onChange({ ...dist, [key]: val });
  }

  // Guard: uniform needs b > a
  const safeP2 =
    dist.type === "uniform"
      ? Math.max(dist.p1 + 0.5, dist.p2)
      : dist.p2;

  const mean = cfg.mean(dist);
  const variance = cfg.variance({ ...dist, p2: safeP2 });

  return (
    <div
      className="flex-1 rounded-lg p-3 space-y-3"
      style={{ background: color + "18", border: `1.5px solid ${color}44` }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 rounded-full flex-shrink-0"
          style={{ background: color }}
        />
        <span className="font-semibold text-[13px]" style={{ color }}>
          {label}
        </span>
      </div>

      {/* 分布类型选择 */}
      <div className="flex flex-wrap gap-1">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className="rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors"
            style={
              dist.type === t
                ? { background: color, color: "#fff" }
                : {
                    background: "var(--bg-muted)",
                    color: "var(--ink-soft)",
                  }
            }
          >
            {t === "normal"
              ? "正态"
              : t === "uniform"
              ? "均匀"
              : t === "exponential"
              ? "指数"
              : "伯努利"}
          </button>
        ))}
      </div>

      {/* 参数滑块 */}
      {cfg.params.map(([name, key, min, max, step]) => {
        const paramKey = key as "p1" | "p2";
        const currentVal = paramKey === "p2" ? safeP2 : dist[paramKey];
        return (
          <div key={key} className="space-y-0.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-[var(--ink-soft)]">{name}</span>
              <span
                className="font-mono font-bold"
                style={{ color }}
              >
                {currentVal.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={currentVal}
              onChange={(e) => setParam(paramKey, Number(e.target.value))}
              className="w-full h-1.5 cursor-pointer"
              style={{ accentColor: color }}
            />
          </div>
        );
      })}

      {/* 均值/方差 */}
      <div className="flex gap-3 text-[11px] text-[var(--ink-soft)]">
        <span>
          E = <b style={{ color }} className="font-mono">{mean.toFixed(3)}</b>
        </span>
        <span>
          Var = <b style={{ color }} className="font-mono">{variance.toFixed(3)}</b>
        </span>
      </div>
    </div>
  );
}

// ─── 直方图 SVG ────────────────────────────────────────────────
interface HistogramSVGProps {
  bins: number[];
  sampleCount: number;
  binMin: number;
  binMax: number;
  xDist: DistParams;
  yDist: DistParams;
  showPdf: boolean;
}

function HistogramSVG({
  bins,
  sampleCount,
  binMin,
  binMax,
  xDist,
  yDist,
  showPdf,
}: HistogramSVGProps) {
  const numBins = bins.length;
  const span = binMax - binMin;
  const binWidth = span / numBins;

  // 密度值 = count / (n * binWidth)
  const densities = bins.map((c) => c / (sampleCount * binWidth));
  const maxDens = Math.max(...densities, 0.001);

  // 计算 PDF 曲线点
  const pdfPoints: [number, number][] = [];
  const hasPdf =
    showPdf && hasAnalyticConvPDF(xDist.type, yDist.type);

  if (hasPdf) {
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const z = binMin + (i / steps) * span;
      const density = analyticConvPDF(z, xDist, yDist);
      pdfPoints.push([z, density]);
    }
  }

  const maxDensAll = hasPdf
    ? Math.max(maxDens, ...pdfPoints.map((p) => p[1]), 0.001)
    : maxDens;

  // 坐标映射
  function xScale(v: number) {
    return PAD.left + ((v - binMin) / span) * CHART_W;
  }
  function yScale(d: number) {
    return PAD.top + CHART_H - (d / maxDensAll) * CHART_H;
  }

  // X 轴刻度（最多 6 个）
  const tickCount = 5;
  const ticks: number[] = [];
  for (let i = 0; i <= tickCount; i++) {
    ticks.push(binMin + (i / tickCount) * span);
  }

  const pdfPath =
    hasPdf && pdfPoints.length > 1
      ? pdfPoints
          .map(([z, d], i) => `${i === 0 ? "M" : "L"}${xScale(z).toFixed(2)},${yScale(d).toFixed(2)}`)
          .join(" ")
      : "";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* 背景 */}
      <rect
        x={PAD.left}
        y={PAD.top}
        width={CHART_W}
        height={CHART_H}
        fill={GRAY_BG}
        stroke={GRAY_LINE}
      />

      {/* Y 轴网格线 */}
      {[0.25, 0.5, 0.75, 1.0].map((f) => {
        const d = f * maxDensAll;
        const yy = yScale(d);
        return (
          <g key={f}>
            <line
              x1={PAD.left}
              y1={yy}
              x2={PAD.left + CHART_W}
              y2={yy}
              stroke={GRAY_LINE}
              strokeDasharray="3 3"
            />
            <text
              x={PAD.left - 4}
              y={yy + 3}
              fontSize={9}
              textAnchor="end"
              fill="var(--ink-faint)"
            >
              {d.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* 直方图条 */}
      {densities.map((d, i) => {
        const bx = xScale(binMin + i * binWidth);
        const bw = (CHART_W / numBins) - 0.5;
        const bh = (d / maxDensAll) * CHART_H;
        const by = PAD.top + CHART_H - bh;
        return (
          <rect
            key={i}
            x={bx + 0.25}
            y={by}
            width={Math.max(bw, 0.5)}
            height={Math.max(bh, 0)}
            fill={ACCENT}
            opacity={0.55}
            rx={0.5}
          />
        );
      })}

      {/* 理论 PDF 曲线 */}
      {hasPdf && pdfPath && (
        <path
          d={pdfPath}
          fill="none"
          stroke={ORANGE}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )}

      {/* X 轴刻度 */}
      {ticks.map((v) => (
        <g key={v}>
          <line
            x1={xScale(v)}
            y1={PAD.top + CHART_H}
            x2={xScale(v)}
            y2={PAD.top + CHART_H + 3}
            stroke="var(--ink-faint)"
          />
          <text
            x={xScale(v)}
            y={PAD.top + CHART_H + 13}
            fontSize={9}
            textAnchor="middle"
            fill="var(--ink-faint)"
          >
            {v.toFixed(1)}
          </text>
        </g>
      ))}

      {/* 轴标签 */}
      <text
        x={PAD.left + CHART_W / 2}
        y={H - 2}
        fontSize={10}
        textAnchor="middle"
        fill="var(--ink-faint)"
      >
        Z = X + Y
      </text>
      <text
        x={9}
        y={PAD.top + CHART_H / 2}
        fontSize={9}
        textAnchor="middle"
        fill="var(--ink-faint)"
        transform={`rotate(-90, 9, ${PAD.top + CHART_H / 2})`}
      >
        密度
      </text>
    </svg>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────
const N_SAMPLES = 5000;
const N_BINS = 50;

function ConvolutionDemoBase() {
  const [xDist, setXDist] = useState<DistParams>({ type: "normal", p1: 0, p2: 1 });
  const [yDist, setYDist] = useState<DistParams>({ type: "normal", p1: 0, p2: 1 });
  const [bins, setBins] = useState<number[]>([]);
  const [binRange, setBinRange] = useState<[number, number]>([-6, 6]);
  const [simCount, setSimCount] = useState(0);
  const [showPdf, setShowPdf] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  // 均值 / 方差 (理论)
  const xCfg = DIST_CONFIGS[xDist.type];
  const yCfg = DIST_CONFIGS[yDist.type];

  const safeXDist = { ...xDist, p2: xDist.type === "uniform" ? Math.max(xDist.p1 + 0.5, xDist.p2) : xDist.p2 };
  const safeYDist = { ...yDist, p2: yDist.type === "uniform" ? Math.max(yDist.p1 + 0.5, yDist.p2) : yDist.p2 };

  const xMean = xCfg.mean(safeXDist);
  const yMean = yCfg.mean(safeYDist);
  const xVar = xCfg.variance(safeXDist);
  const yVar = yCfg.variance(safeYDist);
  const zMean = xMean + yMean;
  const zVar = xVar + yVar;

  const canSimulate = !(
    (xDist.type === "uniform" && xDist.p2 <= xDist.p1) ||
    (yDist.type === "uniform" && yDist.p2 <= yDist.p1)
  );

  const simulate = useCallback(() => {
    if (!canSimulate || isRunning) return;
    setIsRunning(true);

    // 运行在事件处理内部，符合合同（Math.random 仅在事件处理中使用）
    const xs = sampleDist(safeXDist, N_SAMPLES);
    const zs = xs.map((x, i) => x + sampleDist(safeYDist, 1)[0]);
    // 重新计算，避免闭包问题
    const zSamples: number[] = [];
    for (let i = 0; i < N_SAMPLES; i++) {
      zSamples.push(sampleDist(safeXDist, 1)[0] + sampleDist(safeYDist, 1)[0]);
    }

    // 自动确定范围（±3σ + padding）
    const sortedZ = [...zSamples].sort((a, b) => a - b);
    const lo = sortedZ[Math.floor(N_SAMPLES * 0.005)];
    const hi = sortedZ[Math.ceil(N_SAMPLES * 0.995)];
    const pad = (hi - lo) * 0.1;
    const rMin = lo - pad;
    const rMax = hi + pad;

    const newBins = buildHistogram(zSamples, rMin, rMax, N_BINS);
    setBins(newBins);
    setBinRange([rMin, rMax]);
    setSimCount((c) => c + 1);
    setIsRunning(false);
    void zs; // 消除未使用变量警告
  }, [safeXDist, safeYDist, canSimulate, isRunning]);

  const hasResult = bins.length > 0;
  const hasPdf = showPdf && hasAnalyticConvPDF(xDist.type, yDist.type);

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4 space-y-4">
      {/* 标题 */}
      <div>
        <h3 className="text-[15px] font-bold text-[var(--ink)]">
          卷积演示：Z = X + Y 的分布
        </h3>
        <p className="text-[12px] text-[var(--ink-soft)] mt-0.5">
          分别选择 X、Y 的分布类型与参数，运行蒙特卡洛模拟 {N_SAMPLES.toLocaleString()} 次，观察 Z 的经验分布与理论 PDF。
        </p>
      </div>

      {/* X / Y 参数面板 */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <DistPanel
          label="X 分布"
          color={TEAL}
          dist={xDist}
          onChange={setXDist}
        />
        <div className="flex items-center justify-center text-[18px] font-bold text-[var(--ink-soft)] select-none">
          +
        </div>
        <DistPanel
          label="Y 分布"
          color={ACCENT}
          dist={yDist}
          onChange={setYDist}
        />
      </div>

      {/* 公式行 */}
      <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-3 space-y-1.5">
        <div className="text-[12px] font-semibold text-[var(--ink)] mb-1">
          独立随机变量之和的期望与方差（可加性）
        </div>
        <div className="font-mono text-[11px] text-[var(--ink-soft)] space-y-0.5">
          <div>
            E[Z] = E[X] + E[Y]
            <span className="ml-3">
              ={" "}
              <span style={{ color: TEAL }} className="font-bold">
                {xMean.toFixed(3)}
              </span>{" "}
              +{" "}
              <span style={{ color: ACCENT }} className="font-bold">
                {yMean.toFixed(3)}
              </span>{" "}
              ={" "}
              <span className="font-bold text-[var(--ink)]">
                {zMean.toFixed(3)}
              </span>
            </span>
          </div>
          <div>
            Var[Z] = Var[X] + Var[Y]
            <span className="ml-3">
              ={" "}
              <span style={{ color: TEAL }} className="font-bold">
                {xVar.toFixed(3)}
              </span>{" "}
              +{" "}
              <span style={{ color: ACCENT }} className="font-bold">
                {yVar.toFixed(3)}
              </span>{" "}
              ={" "}
              <span className="font-bold text-[var(--ink)]">
                {zVar.toFixed(3)}
              </span>
            </span>
          </div>
          {hasPdf && (
            <div className="text-[10px] mt-1 text-[var(--ink-soft)]">
              [OK] 此组合有解析卷积公式，橙色曲线为理论 PDF
            </div>
          )}
        </div>
      </div>

      {/* 模拟按钮行 */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={simulate}
          disabled={!canSimulate || isRunning}
          className="rounded-lg px-4 py-1.5 text-[13px] font-semibold text-white transition-opacity"
          style={{
            background: canSimulate ? ACCENT : "var(--ink-faint)",
            opacity: isRunning ? 0.7 : 1,
          }}
        >
          {isRunning ? "模拟中..." : `模拟 ${N_SAMPLES.toLocaleString()} 次`}
        </button>

        {hasResult && (
          <label className="flex items-center gap-1.5 text-[12px] text-[var(--ink-soft)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showPdf}
              onChange={(e) => setShowPdf(e.target.checked)}
              className="cursor-pointer"
              style={{ accentColor: ORANGE }}
            />
            <span style={{ color: ORANGE }} className="font-medium">
              叠加理论 PDF
            </span>
          </label>
        )}

        {!canSimulate && (
          <span className="text-[11px] text-red-500">
            均匀分布需要 b &gt; a
          </span>
        )}

        {simCount > 0 && (
          <span className="ml-auto text-[11px] text-[var(--ink-soft)]">
            已模拟 {simCount} 次
          </span>
        )}
      </div>

      {/* 直方图区域 */}
      {hasResult ? (
        <div className="space-y-2">
          <HistogramSVG
            bins={bins}
            sampleCount={N_SAMPLES}
            binMin={binRange[0]}
            binMax={binRange[1]}
            xDist={safeXDist}
            yDist={safeYDist}
            showPdf={showPdf}
          />

          {/* 图例 */}
          <div className="flex flex-wrap gap-4 text-[11px] text-[var(--ink-soft)]">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-5 rounded-sm opacity-60"
                style={{ background: ACCENT }}
              />
              经验直方图（密度）
            </div>
            {hasPdf && (
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-0.5 w-5"
                  style={{ background: ORANGE }}
                />
                <span style={{ color: ORANGE }}>理论 PDF（卷积解析式）</span>
              </div>
            )}
            {!hasPdf && showPdf && (
              <div className="text-[10px] text-[var(--ink-soft)] opacity-60">
                （该组合暂无解析 PDF，仅显示经验分布）
              </div>
            )}
          </div>

          {/* 统计摘要 */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "理论 E[Z]", val: zMean.toFixed(4), color: ACCENT },
              { label: "理论 σ[Z]", val: Math.sqrt(Math.max(0, zVar)).toFixed(4), color: TEAL },
              { label: "理论 Var[Z]", val: zVar.toFixed(4), color: ORANGE },
            ].map(({ label, val, color }) => (
              <div
                key={label}
                className="rounded-lg p-2"
                style={{ background: color + "18" }}
              >
                <div className="text-[10px] text-[var(--ink-soft)]">{label}</div>
                <div
                  className="text-[14px] font-extrabold font-mono"
                  style={{ color }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="rounded-lg flex items-center justify-center"
          style={{
            height: H,
            background: GRAY_BG,
            border: `1px dashed ${GRAY_LINE}`,
          }}
        >
          <div className="text-center space-y-1">
            <div className="text-[13px] text-[var(--ink-soft)]">
              点击「模拟」按钮开始
            </div>
            <div className="text-[11px]" style={{ color: ACCENT }}>
              将生成 {N_SAMPLES.toLocaleString()} 对 (X,Y) 样本，计算 Z = X + Y
            </div>
          </div>
        </div>
      )}

      {/* 知识洞察 */}
      <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2.5 text-[12px] text-[var(--ink-soft)] leading-relaxed">
        <span className="font-semibold text-[var(--ink)]">核心洞察：</span>
        当 X 和 Y 相互独立时，Z = X+Y 的分布由卷积决定：
        <span className="font-mono mx-1">f_Z(z) = ∫ f_X(x)·f_Y(z−x)dx</span>
        。期望和方差均可加，但分布形状取决于具体类型——
        两个正态相加仍是正态，两个均匀相加得三角/梯形，两个指数相加得 Erlang。
        尝试混合不同类型，观察中心极限定理的收敛趋势！
      </div>
    </div>
  );
}

export default memo(ConvolutionDemoBase);
