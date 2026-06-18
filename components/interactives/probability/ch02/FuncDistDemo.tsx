"use client";

import { memo, useState, useCallback } from "react";

// ─── 设计常量 ─────────────────────────────────────────────────
const ACCENT = "#5b46e5";
const ACCENT_LIGHT = "#ede9fe";
const ORANGE = "#ea580c";
const GREEN = "#0f766e";
const GRAY_LINE = "#e7e9ef";
const GRAY_BG = "#fafbfd";

// ─── SVG 尺寸 ─────────────────────────────────────────────────
const W = 320;
const H = 200;
const PAD_L = 38;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 30;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

// ─── 类型定义 ─────────────────────────────────────────────────
type DistKey = "normal" | "uniform" | "exponential";
type TransformKey = "square" | "abs" | "linear" | "exp";

interface DistConfig {
  label: string;
  shortLabel: string;
  sample: () => number;
  pdf: (x: number) => number;
  xMin: number;
  xMax: number;
  color: string;
}

interface TransformConfig {
  label: string;
  shortLabel: string;
  apply: (x: number) => number;
  theoreticalPdf: (y: number, dist: DistKey) => number;
  yMin: (dist: DistKey) => number;
  yMax: (dist: DistKey) => number;
  note: string;
}

// ─── 高斯采样（Box-Muller） ───────────────────────────────────
function gaussianSample(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ─── 分布配置 ────────────────────────────────────────────────
const DIST_CONFIGS: Record<DistKey, DistConfig> = {
  normal: {
    label: "标准正态 N(0,1)",
    shortLabel: "N(0,1)",
    sample: () => gaussianSample(),
    pdf: (x: number) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI),
    xMin: -3.5,
    xMax: 3.5,
    color: ACCENT,
  },
  uniform: {
    label: "均匀 U(0,1)",
    shortLabel: "U(0,1)",
    sample: () => Math.random(),
    pdf: (x: number) => (x >= 0 && x <= 1 ? 1 : 0),
    xMin: -0.2,
    xMax: 1.2,
    color: GREEN,
  },
  exponential: {
    label: "指数 Exp(1)",
    shortLabel: "Exp(1)",
    sample: () => -Math.log(1 - Math.random()),
    pdf: (x: number) => (x >= 0 ? Math.exp(-x) : 0),
    xMin: -0.2,
    xMax: 4.5,
    color: ORANGE,
  },
};

// ─── 变换配置（含理论 PDF） ──────────────────────────────────
function normalPdf(x: number): number {
  return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
}

const TRANSFORM_CONFIGS: Record<TransformKey, TransformConfig> = {
  square: {
    label: "Y = X²",
    shortLabel: "X²",
    apply: (x: number) => x * x,
    theoreticalPdf: (y: number, dist: DistKey): number => {
      if (y <= 0) return 0;
      if (dist === "normal") {
        // Y=X²: f_Y(y) = f_X(√y)/(√y) + f_X(-√y)/(√y) = 2·f_X(√y)/(2√y·...)
        // = (1/√y)·φ(√y) where doubled because ±√y
        const sqrtY = Math.sqrt(y);
        return (normalPdf(sqrtY) + normalPdf(-sqrtY)) / (2 * sqrtY);
      }
      if (dist === "uniform") {
        // X~U(0,1): Y=X², f_Y(y)=1/(2√y) for y in [0,1]
        if (y > 1) return 0;
        return 1 / (2 * Math.sqrt(y));
      }
      if (dist === "exponential") {
        // X~Exp(1): Y=X², x=√y, dx/dy=1/(2√y), f_Y(y)=e^{-√y}/(2√y)
        return Math.exp(-Math.sqrt(y)) / (2 * Math.sqrt(y));
      }
      return 0;
    },
    yMin: (_dist: DistKey) => 0,
    yMax: (dist: DistKey) => (dist === "normal" ? 9 : dist === "uniform" ? 1.05 : 16),
    note: "折叠效应：±x 都映射到同一个 y=x²，PDF 是 X 两侧贡献之和除以变换斜率。",
  },
  abs: {
    label: "Y = |X|",
    shortLabel: "|X|",
    apply: (x: number) => Math.abs(x),
    theoreticalPdf: (y: number, dist: DistKey): number => {
      if (y < 0) return 0;
      if (dist === "normal") {
        return 2 * normalPdf(y);
      }
      if (dist === "uniform") {
        // X~U(0,1): |X|=X, so same f_Y(y)=1 for y in [0,1]
        if (y > 1) return 0;
        return 1;
      }
      if (dist === "exponential") {
        // X~Exp(1) >=0: |X|=X
        return Math.exp(-y);
      }
      return 0;
    },
    yMin: (_dist: DistKey) => 0,
    yMax: (dist: DistKey) => (dist === "normal" ? 3.5 : dist === "uniform" ? 1.2 : 4.5),
    note: "绝对值把负半轴「折叠」到正半轴，密度加倍（仅对称分布明显）。",
  },
  linear: {
    label: "Y = 2X + 1",
    shortLabel: "2X+1",
    apply: (x: number) => 2 * x + 1,
    theoreticalPdf: (y: number, dist: DistKey): number => {
      // g(x)=2x+1, g^{-1}(y)=(y-1)/2, |dg^{-1}/dy|=1/2
      const x = (y - 1) / 2;
      return DIST_CONFIGS[dist].pdf(x) / 2;
    },
    yMin: (dist: DistKey) => {
      if (dist === "normal") return -6;
      if (dist === "uniform") return 0.8;
      return 0.8;
    },
    yMax: (dist: DistKey) => {
      if (dist === "normal") return 8;
      if (dist === "uniform") return 3.2;
      return 10;
    },
    note: "线性变换 Y=aX+b：PDF 形状不变，水平拉伸 a 倍，纵向压缩 1/a，保证面积=1。",
  },
  exp: {
    label: "Y = eˣ",
    shortLabel: "eˣ",
    apply: (x: number) => Math.exp(x),
    theoreticalPdf: (y: number, dist: DistKey): number => {
      if (y <= 0) return 0;
      // g(x)=e^x, g^{-1}(y)=ln(y), |dg^{-1}/dy|=1/y
      const x = Math.log(y);
      return DIST_CONFIGS[dist].pdf(x) / y;
    },
    yMin: (dist: DistKey) => (dist === "exponential" ? 0 : 0),
    yMax: (dist: DistKey) => {
      if (dist === "normal") return 8;
      if (dist === "uniform") return Math.E + 0.2;
      return 6;
    },
    note: "指数变换 Y=eˣ：将 X 拉伸到正半轴，产生「对数正态」等分布，右尾变厚。",
  },
};

// ─── 坐标映射 ─────────────────────────────────────────────────
function mapX(val: number, min: number, max: number): number {
  return PAD_L + ((val - min) / (max - min)) * PLOT_W;
}
function mapY(val: number, maxVal: number): number {
  return PAD_T + PLOT_H - (val / maxVal) * PLOT_H;
}

// ─── 刻度生成 ─────────────────────────────────────────────────
function niceTicks(min: number, max: number, count: number = 5): number[] {
  const range = max - min;
  const step = range / (count - 1);
  const ticks: number[] = [];
  for (let i = 0; i < count; i++) {
    ticks.push(parseFloat((min + step * i).toFixed(2)));
  }
  return ticks;
}

// ─── PDF 折线路径生成 ────────────────────────────────────────
function buildPdfPath(
  pdfFn: (v: number) => number,
  xMin: number,
  xMax: number,
  yMax: number,
  steps: number = 200
): string {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const xVal = xMin + t * (xMax - xMin);
    const yVal = pdfFn(xVal);
    if (!isFinite(yVal) || isNaN(yVal)) continue;
    const sx = mapX(xVal, xMin, xMax);
    const sy = mapY(Math.min(yVal, yMax * 1.05), yMax);
    pts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`);
  }
  return pts.join(" ");
}

// ─── 直方图计算 ──────────────────────────────────────────────
interface HistBin {
  x0: number;
  x1: number;
  density: number;
}

function buildHistogram(data: number[], bins: number, yMin: number, yMax: number): HistBin[] {
  const result: HistBin[] = [];
  const step = (yMax - yMin) / bins;
  const counts = new Array<number>(bins).fill(0);
  let total = 0;
  for (const v of data) {
    if (v < yMin || v > yMax) continue;
    const idx = Math.min(Math.floor((v - yMin) / step), bins - 1);
    counts[idx]++;
    total++;
  }
  for (let i = 0; i < bins; i++) {
    result.push({
      x0: yMin + i * step,
      x1: yMin + (i + 1) * step,
      density: total > 0 ? counts[i] / (total * step) : 0,
    });
  }
  return result;
}

// ─── 单个 SVG 图表组件 ────────────────────────────────────────
interface PdfChartProps {
  title: string;
  xLabel: string;
  pdfFn: (v: number) => number;
  xMin: number;
  xMax: number;
  color: string;
  histBins?: HistBin[];
  histColor?: string;
  pdfMaxY?: number;
}

function PdfChart({
  title,
  xLabel,
  pdfFn,
  xMin,
  xMax,
  color,
  histBins,
  histColor = "#94a3b8",
  pdfMaxY,
}: PdfChartProps) {
  // 计算 y 轴最大值
  let computedMax = 0;
  const steps = 200;
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    const y = pdfFn(x);
    if (isFinite(y) && !isNaN(y)) computedMax = Math.max(computedMax, y);
  }
  if (histBins) {
    for (const b of histBins) computedMax = Math.max(computedMax, b.density);
  }
  const yMax = (pdfMaxY ?? computedMax * 1.15) || 1;

  const pdfPath = buildPdfPath(pdfFn, xMin, xMax, yMax);
  const xTicks = niceTicks(xMin, xMax, 5);
  const yTicks = niceTicks(0, yMax, 4);

  return (
    <div>
      <div className="mb-1 text-center text-[11px] font-semibold text-[var(--ink-soft)]">{title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* 背景 */}
        <rect
          x={PAD_L}
          y={PAD_T}
          width={PLOT_W}
          height={PLOT_H}
          fill={GRAY_BG}
          stroke={GRAY_LINE}
        />

        {/* y 轴网格线 */}
        {yTicks.map((v) => {
          const sy = mapY(v, yMax);
          return (
            <g key={v}>
              <line
                x1={PAD_L}
                y1={sy}
                x2={PAD_L + PLOT_W}
                y2={sy}
                stroke={GRAY_LINE}
                strokeDasharray="3 2"
              />
              <text
                x={PAD_L - 4}
                y={sy + 3}
                fontSize="9"
                textAnchor="end"
                fill="#8a94a6"
              >
                {v.toFixed(v < 1 ? 1 : 0)}
              </text>
            </g>
          );
        })}

        {/* x 轴刻度 */}
        {xTicks.map((v) => {
          const sx = mapX(v, xMin, xMax);
          return (
            <g key={v}>
              <line
                x1={sx}
                y1={PAD_T + PLOT_H}
                x2={sx}
                y2={PAD_T + PLOT_H + 4}
                stroke="#8a94a6"
              />
              <text
                x={sx}
                y={PAD_T + PLOT_H + 13}
                fontSize="9"
                textAnchor="middle"
                fill="#8a94a6"
              >
                {Math.abs(v) < 0.001 ? "0" : v.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* 轴标签 */}
        <text
          x={PAD_L + PLOT_W / 2}
          y={H - 2}
          fontSize="10"
          textAnchor="middle"
          fill="#8a94a6"
        >
          {xLabel}
        </text>
        <text
          x={9}
          y={PAD_T + PLOT_H / 2}
          fontSize="9"
          textAnchor="middle"
          fill="#8a94a6"
          transform={`rotate(-90,9,${PAD_T + PLOT_H / 2})`}
        >
          密度
        </text>

        {/* 直方图 */}
        {histBins &&
          histBins.map((bin, i) => {
            const bx0 = mapX(bin.x0, xMin, xMax);
            const bx1 = mapX(bin.x1, xMin, xMax);
            const by = mapY(Math.min(bin.density, yMax * 1.05), yMax);
            const bh = PAD_T + PLOT_H - by;
            if (bh <= 0) return null;
            return (
              <rect
                key={i}
                x={bx0 + 0.5}
                y={by}
                width={Math.max(bx1 - bx0 - 1, 0)}
                height={bh}
                fill={histColor}
                opacity={0.45}
              />
            );
          })}

        {/* 理论/实际 PDF 曲线 */}
        {pdfPath && (
          <path d={pdfPath} fill="none" stroke={color} strokeWidth="2" />
        )}
      </svg>
    </div>
  );
}

// ─── 选项卡按钮 ──────────────────────────────────────────────
interface TabBtnProps {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}

function TabBtn({ active, onClick, color = ACCENT, children }: TabBtnProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors"
      style={
        active
          ? { background: color, color: "#fff" }
          : { background: "var(--bg-muted)", color: "var(--ink-soft)" }
      }
    >
      {children}
    </button>
  );
}

// ─── 主组件 ──────────────────────────────────────────────────
function FuncDistDemoBase() {
  const [distKey, setDistKey] = useState<DistKey>("normal");
  const [transformKey, setTransformKey] = useState<TransformKey>("square");
  const [samples, setSamples] = useState<number[]>([]);
  const [sampleCount, setSampleCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const dist = DIST_CONFIGS[distKey];
  const transform = TRANSFORM_CONFIGS[transformKey];

  // 执行采样
  const runSimulation = useCallback(() => {
    setIsRunning(true);
    const N = 10000;
    const rawSamples: number[] = [];
    for (let i = 0; i < N; i++) {
      rawSamples.push(dist.sample());
    }
    setSamples(rawSamples);
    setSampleCount(N);
    setIsRunning(false);
  }, [dist]);

  // 清空
  function reset() {
    setSamples([]);
    setSampleCount(0);
  }

  // Y 的样本
  const ySamples = samples.map(transform.apply);

  // Y 的范围
  const yMin = transform.yMin(distKey);
  const yMax = transform.yMax(distKey);

  // 构建直方图
  const HIST_BINS = 50;
  const histBins =
    ySamples.length > 0 ? buildHistogram(ySamples, HIST_BINS, yMin, yMax) : undefined;

  // Y 的理论 PDF
  const yPdfFn = (y: number) => transform.theoreticalPdf(y, distKey);

  // X 的 PDF
  const xPdfFn = dist.pdf;

  // 当前 Y 统计摘要
  const yMean =
    ySamples.length > 0
      ? ySamples.reduce((a, b) => a + b, 0) / ySamples.length
      : null;
  const yVar =
    ySamples.length > 0 && yMean !== null
      ? ySamples.reduce((a, b) => a + (b - yMean) ** 2, 0) / ySamples.length
      : null;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-4">
      {/* 标题 */}
      <div>
        <h3 className="text-[15px] font-bold text-[var(--ink)]">随机变量函数的分布</h3>
        <p className="text-[12px] text-[var(--ink-soft)] mt-0.5 leading-relaxed">
          选择 X 的分布和变换 g，左图为 X 的 PDF，右图为 Y=g(X) 的理论曲线与模拟直方图叠加。
        </p>
      </div>

      {/* 控制区 */}
      <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-3 space-y-3">
        {/* 选 X 的分布 */}
        <div>
          <div className="mb-1.5 text-[12px] font-semibold text-[var(--ink)]">
            X 的分布
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(DIST_CONFIGS) as DistKey[]).map((k) => (
              <TabBtn
                key={k}
                active={distKey === k}
                onClick={() => {
                  setDistKey(k);
                  setSamples([]);
                  setSampleCount(0);
                }}
                color={DIST_CONFIGS[k].color}
              >
                {DIST_CONFIGS[k].shortLabel}
              </TabBtn>
            ))}
          </div>
        </div>

        {/* 选变换 g */}
        <div>
          <div className="mb-1.5 text-[12px] font-semibold text-[var(--ink)]">
            变换 Y = g(X)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(TRANSFORM_CONFIGS) as TransformKey[]).map((k) => (
              <TabBtn
                key={k}
                active={transformKey === k}
                onClick={() => {
                  setTransformKey(k);
                  setSamples([]);
                  setSampleCount(0);
                }}
              >
                {TRANSFORM_CONFIGS[k].label}
              </TabBtn>
            ))}
          </div>
        </div>
      </div>

      {/* 图表区：X 的 PDF | Y 的 PDF + 直方图 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 左：X 的分布 */}
        <div className="rounded-lg border border-[var(--line)] p-2">
          <PdfChart
            title={`X ~ ${dist.label}`}
            xLabel="x"
            pdfFn={xPdfFn}
            xMin={dist.xMin}
            xMax={dist.xMax}
            color={dist.color}
          />
        </div>

        {/* 右：Y 的分布（理论 + 直方图） */}
        <div className="rounded-lg border border-[var(--line)] p-2">
          <PdfChart
            title={`Y = ${transform.label} 的分布`}
            xLabel="y"
            pdfFn={yPdfFn}
            xMin={yMin}
            xMax={yMax}
            color={ACCENT}
            histBins={histBins}
            histColor="#6366f1"
          />
        </div>
      </div>

      {/* 变换说明 */}
      <div
        className="rounded-lg border px-3 py-2.5 text-[12px] leading-relaxed"
        style={{ borderColor: ACCENT + "44", background: ACCENT_LIGHT }}
      >
        <span className="font-semibold" style={{ color: ACCENT }}>
          变换原理：
        </span>
        <span className="text-[var(--ink-soft)]"> {transform.note}</span>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="rounded-lg px-4 py-1.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: ACCENT }}
        >
          {isRunning ? "模拟中…" : "模拟 10000 次"}
        </button>
        <button
          onClick={reset}
          className="rounded-lg bg-[var(--bg-muted)] px-3 py-1.5 text-[13px] font-medium text-[var(--ink-soft)] hover:bg-[var(--line)]"
        >
          清除
        </button>
        {sampleCount > 0 && (
          <span className="text-[12px] text-[var(--ink-soft)]">
            已采样 <b className="text-[var(--ink)]">{sampleCount.toLocaleString()}</b> 个点
          </span>
        )}
      </div>

      {/* 模拟统计摘要 */}
      {sampleCount > 0 && yMean !== null && yVar !== null && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "X 分布", val: dist.shortLabel, color: dist.color },
            { label: "变换 g", val: transform.shortLabel, color: ACCENT },
            {
              label: "Y 均值（模拟）",
              val: yMean.toFixed(4),
              color: GREEN,
            },
            {
              label: "Y 方差（模拟）",
              val: yVar.toFixed(4),
              color: ORANGE,
            },
          ].map(({ label, val, color }) => (
            <div
              key={label}
              className="rounded-lg p-2.5 text-center"
              style={{ background: color + "18" }}
            >
              <div className="text-[10px] text-[var(--ink-soft)] leading-snug">{label}</div>
              <div
                className="mt-0.5 font-mono text-[14px] font-bold"
                style={{ color }}
              >
                {val}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 公式提示 */}
      <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2.5 text-[12px] text-[var(--ink-soft)] leading-relaxed space-y-1">
        <div className="font-semibold text-[13px] text-[var(--ink)] mb-1">
          变量变换公式（连续情形）
        </div>
        <div className="font-mono text-[11px] leading-loose">
          若 Y = g(X)，g 严格单调，则：
        </div>
        <div className="font-mono text-[11px] leading-loose">
          f_Y(y) = f_X(g⁻¹(y)) · |d/dy g⁻¹(y)|
        </div>
        <div className="font-mono text-[11px] leading-loose">
          非单调时（如 Y=X²）：对每个反函数分支分别求和。
        </div>
      </div>

      {/* 图例说明 */}
      <div className="flex flex-wrap gap-4 text-[11px] text-[var(--ink-soft)]">
        <div className="flex items-center gap-1.5">
          <div
            className="h-[3px] w-6 rounded-full"
            style={{ background: ACCENT }}
          />
          <span>理论 PDF 曲线</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="h-4 w-4 rounded-sm opacity-50"
            style={{ background: "#6366f1" }}
          />
          <span>模拟频率直方图（10000次）</span>
        </div>
      </div>
    </div>
  );
}

export default memo(FuncDistDemoBase);
