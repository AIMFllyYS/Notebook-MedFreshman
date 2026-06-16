"use client";

import { useState } from "react";

// ─── 设计常量 ────────────────────────────────────────────────────
const ACCENT = "#5b46e5";
const ACCENT_LIGHT = "#ede9fe";
const GREEN = "#0f766e";
const GREEN_LIGHT = "#ccfbf1";
const ORANGE = "#c2410c";
const GRAY_LINE = "#e9ebf2";

// ─── 分布类型 ─────────────────────────────────────────────────────
type DistType = "exponential" | "normal" | "uniform";

// ─── SVG 参数 ────────────────────────────────────────────────────
const SVG_W = 500;
const SVG_H = 200;
const PAD_L = 48;
const PAD_R = 20;
const PAD_T = 18;
const PAD_B = 36;
const CHART_W = SVG_W - PAD_L - PAD_R;
const CHART_H = SVG_H - PAD_T - PAD_B;

// ─── 辅助格式化 ──────────────────────────────────────────────────
function fmt(v: number, d = 4): string {
  return isFinite(v) ? v.toFixed(d) : "—";
}

function fmt3(v: number): string {
  return isFinite(v) ? v.toFixed(3) : "—";
}

// ─── 解析样本输入 ─────────────────────────────────────────────────
function parseSamples(text: string): number[] {
  return text
    .split(/[\s,;，；]+/)
    .map((s) => parseFloat(s.trim()))
    .filter((v) => isFinite(v));
}

// ─── 样本统计量 ───────────────────────────────────────────────────
function sampleMean(data: number[]): number {
  if (data.length === 0) return NaN;
  return data.reduce((s, x) => s + x, 0) / data.length;
}

function sampleMean2(data: number[]): number {
  // 二阶样本矩 (1/n)·Σxᵢ²
  if (data.length === 0) return NaN;
  return data.reduce((s, x) => s + x * x, 0) / data.length;
}

function sampleVariance(data: number[]): number {
  // 用样本矩计算：B₂ - x̄² = E[X²] - (E[X])²
  if (data.length === 0) return NaN;
  const m1 = sampleMean(data);
  const m2 = sampleMean2(data);
  return m2 - m1 * m1;
}

// ─── 矩估计量 ─────────────────────────────────────────────────────
interface EstimateResult {
  params: Record<string, number>;
}

function momentEstimate(dist: DistType, data: number[]): EstimateResult {
  if (data.length === 0) return { params: {} };
  const m1 = sampleMean(data);
  const m2 = sampleMean2(data);
  const b2 = m2 - m1 * m1; // 样本二阶中心矩

  if (dist === "exponential") {
    // E[X] = 1/λ → λ̂ = 1/x̄
    return { params: { lambda: 1 / m1 } };
  } else if (dist === "normal") {
    // E[X]=μ, D(X)=σ² → μ̂=x̄, σ̂²=B₂
    return { params: { mu: m1, sigma2: b2, sigma: Math.sqrt(Math.max(0, b2)) } };
  } else {
    // uniform [a,b]: E[X]=(a+b)/2, D(X)=(b-a)²/12
    // → a+b=2m1, (b-a)²=12b2 → b-a=√(12b2)
    // → b̂=m1+√(3b2), â=m1-√(3b2)
    const half = Math.sqrt(Math.max(0, 3 * b2));
    return { params: { a: m1 - half, b: m1 + half } };
  }
}

// ─── 分布配置（含真实参数默认值）────────────────────────────────
interface DistConfig {
  label: string;
  shortLabel: string;
  paramNames: string[];
  trueParamLabels: string[];
  trueParamDefaults: number[];
  trueParamMin: number[];
  trueParamMax: number[];
  trueParamStep: number[];
  generateSample: (params: number[], n: number) => number[];
}

const DIST_CONFIGS: Record<DistType, DistConfig> = {
  exponential: {
    label: "指数分布 Exp(λ)",
    shortLabel: "Exp(λ)",
    paramNames: ["lambda"],
    trueParamLabels: ["真实 λ"],
    trueParamDefaults: [1.5],
    trueParamMin: [0.1],
    trueParamMax: [5],
    trueParamStep: [0.1],
    generateSample: ([lambda], n) => {
      const arr: number[] = [];
      for (let i = 0; i < n; i++) {
        arr.push(-Math.log(1 - Math.random()) / lambda);
      }
      return arr;
    },
  },
  normal: {
    label: "正态分布 N(μ, σ²)",
    shortLabel: "N(μ,σ²)",
    paramNames: ["mu", "sigma2", "sigma"],
    trueParamLabels: ["真实 μ", "真实 σ"],
    trueParamDefaults: [2, 1.5],
    trueParamMin: [-5, 0.1],
    trueParamMax: [5, 5],
    trueParamStep: [0.1, 0.1],
    generateSample: ([mu, sigma], n) => {
      const arr: number[] = [];
      for (let i = 0; i < n; i++) {
        // Box-Muller
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-12))) * Math.cos(2 * Math.PI * u2);
        arr.push(mu + sigma * z);
      }
      return arr;
    },
  },
  uniform: {
    label: "均匀分布 U(a, b)",
    shortLabel: "U(a,b)",
    paramNames: ["a", "b"],
    trueParamLabels: ["真实 a", "真实 b"],
    trueParamDefaults: [1, 5],
    trueParamMin: [-5, 0],
    trueParamMax: [0, 10],
    trueParamStep: [0.1, 0.1],
    generateSample: ([a, b], n) => {
      const arr: number[] = [];
      for (let i = 0; i < n; i++) {
        arr.push(a + Math.random() * (b - a));
      }
      return arr;
    },
  },
};

// ─── 矩估计步骤文字 ────────────────────────────────────────────────
interface DerivationStep {
  label: string;
  math: string;
  color?: string;
}

function getDerivationSteps(
  dist: DistType,
  data: number[],
  estimate: EstimateResult
): DerivationStep[] {
  if (data.length === 0) return [];

  const m1 = sampleMean(data);
  const m2 = sampleMean2(data);
  const b2 = m2 - m1 * m1;

  if (dist === "exponential") {
    const lambda = estimate.params.lambda;
    return [
      {
        label: "① 总体一阶矩",
        math: `E[X] = ∫₀^∞ x·λe^{-λx} dx = 1/λ`,
      },
      {
        label: "② 令总体矩 = 样本矩",
        math: `E[X] = x̄   →   1/λ = x̄`,
      },
      {
        label: "③ 解出矩估计量",
        math: `λ̂ = 1 / x̄`,
        color: ACCENT,
      },
      {
        label: "④ 代入样本数值",
        math: `x̄ = ${fmt(m1)}   →   λ̂ = 1 / ${fmt(m1)} = ${fmt(lambda)}`,
        color: GREEN,
      },
    ];
  } else if (dist === "normal") {
    const { mu, sigma2, sigma } = estimate.params;
    return [
      {
        label: "① 总体一、二阶矩",
        math: `E[X] = μ,   E[X²] = D(X) + (E[X])² = σ² + μ²`,
      },
      {
        label: "② 令总体矩 = 样本矩",
        math: `μ = x̄,   σ² + μ² = B₂ = (1/n)·Σxᵢ²`,
      },
      {
        label: "③ 解出矩估计量",
        math: `μ̂ = x̄,   σ̂² = B₂ − x̄² = (1/n)·Σxᵢ² − x̄²`,
        color: ACCENT,
      },
      {
        label: "④ 代入数值（n=" + data.length + "）",
        math: `x̄ = ${fmt(m1)},  B₂ = ${fmt(m2)},  σ̂² = ${fmt(sigma2)},  σ̂ = ${fmt(sigma)}`,
        color: GREEN,
      },
      {
        label: "⑤ 矩估计结果",
        math: `μ̂ = ${fmt(mu, 3)},   σ̂ = ${fmt(sigma, 3)}`,
        color: GREEN,
      },
    ];
  } else {
    // uniform
    const { a, b } = estimate.params;
    return [
      {
        label: "① 总体一、二阶矩",
        math: `E[X] = (a+b)/2,   D(X) = (b−a)²/12`,
      },
      {
        label: "② 总体二阶矩",
        math: `E[X²] = D(X)+(E[X])² = (b−a)²/12 + (a+b)²/4`,
      },
      {
        label: "③ 令总体矩 = 样本矩",
        math: `(a+b)/2 = x̄,   (b−a)²/12 = B₂−x̄²`,
      },
      {
        label: "④ 解方程组",
        math: `b−a = √(12·(B₂−x̄²)),   a+b = 2x̄`,
        color: ACCENT,
      },
      {
        label: "⑤ 矩估计量",
        math: `â = x̄ − √(3·(B₂−x̄²)),   b̂ = x̄ + √(3·(B₂−x̄²))`,
        color: ACCENT,
      },
      {
        label: "⑥ 代入数值",
        math: `x̄=${fmt(m1)}, B₂−x̄²=${fmt(b2)}, √(3·${fmt(b2)})=${fmt(Math.sqrt(Math.max(0,3*b2)))}`,
        color: GREEN,
      },
      {
        label: "⑦ 结果",
        math: `â = ${fmt(a, 3)},   b̂ = ${fmt(b, 3)}`,
        color: GREEN,
      },
    ];
  }
}

// ─── 收敛折线图数据 ────────────────────────────────────────────────
// 用固定随机种子（伪随机序列）演示：n 从 5 → 200 时，矩估计量与真实值对比
// 注意：每次用户点击"重新模拟"时才会重新生成

interface ConvergenceSeries {
  ns: number[];
  trueVals: number[][];   // 每个参数的真实值（常数）
  estVals: number[][];    // 每个参数的矩估计序列
  paramLabels: string[];
  colors: string[];
}

function buildConvergenceSeries(
  dist: DistType,
  trueParams: number[],
  bigSample: number[]
): ConvergenceSeries {
  const ns: number[] = [];
  const maxN = bigSample.length;
  // 采样点：5,8,12,18,25,35,50,70,100,140,200 (若 maxN>=200)
  const checkpoints = [5, 8, 12, 18, 25, 35, 50, 70, 100, 140, 200];
  for (const n of checkpoints) {
    if (n <= maxN) ns.push(n);
  }
  if (ns[ns.length - 1] !== maxN) ns.push(maxN);

  let paramLabels: string[];
  let colors: string[];
  let trueValuesList: number[][];

  if (dist === "exponential") {
    paramLabels = ["λ̂（矩估计）"];
    colors = [ACCENT];
    trueValuesList = [[trueParams[0]]];
  } else if (dist === "normal") {
    paramLabels = ["μ̂（矩估计）", "σ̂（矩估计）"];
    colors = [ACCENT, GREEN];
    trueValuesList = [[trueParams[0]], [trueParams[1]]];
  } else {
    paramLabels = ["â（矩估计）", "b̂（矩估计）"];
    colors = [ACCENT, ORANGE];
    trueValuesList = [[trueParams[0]], [trueParams[1]]];
  }

  // 对每个 n，截取前 n 个样本做矩估计
  const estVals: number[][] = paramLabels.map(() => []);

  for (const n of ns) {
    const slice = bigSample.slice(0, n);
    const est = momentEstimate(dist, slice);
    if (dist === "exponential") {
      estVals[0].push(isFinite(est.params.lambda) ? est.params.lambda : NaN);
    } else if (dist === "normal") {
      estVals[0].push(isFinite(est.params.mu) ? est.params.mu : NaN);
      estVals[1].push(isFinite(est.params.sigma) ? est.params.sigma : NaN);
    } else {
      estVals[0].push(isFinite(est.params.a) ? est.params.a : NaN);
      estVals[1].push(isFinite(est.params.b) ? est.params.b : NaN);
    }
  }

  return {
    ns,
    trueVals: trueValuesList,
    estVals,
    paramLabels,
    colors,
  };
}

// ─── 折线图 SVG ───────────────────────────────────────────────────
function ConvergenceChart({ series }: { series: ConvergenceSeries }) {
  const { ns, trueVals, estVals, paramLabels, colors } = series;
  if (ns.length < 2) return null;

  // 收集所有值以确定 y 轴范围
  const allVals: number[] = [];
  for (const arr of estVals) for (const v of arr) if (isFinite(v)) allVals.push(v);
  for (const arr of trueVals) for (const v of arr) if (isFinite(v)) allVals.push(v);
  if (allVals.length === 0) return null;

  const yMin = Math.min(...allVals);
  const yMax = Math.max(...allVals);
  const ySpan = yMax - yMin || 1;
  const yPad = ySpan * 0.2;
  const yLo = yMin - yPad;
  const yHi = yMax + yPad;

  const nMin = ns[0];
  const nMax = ns[ns.length - 1];

  function sx(n: number): number {
    return PAD_L + ((n - nMin) / (nMax - nMin)) * CHART_W;
  }
  function sy(v: number): number {
    return PAD_T + CHART_H * (1 - (v - yLo) / (yHi - yLo));
  }

  // Y 轴刻度（5个）
  const yTicks: number[] = [];
  for (let i = 0; i <= 4; i++) {
    yTicks.push(yLo + (i / 4) * (yHi - yLo));
  }
  // X 轴刻度
  const xTicks = [ns[0], ...ns.filter((n, i) => i > 0 && i < ns.length - 1 && i % 3 === 0), ns[ns.length - 1]];

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full rounded-lg border border-[var(--line)]" style={{ background: "#fafbfd" }}>
      {/* 网格 */}
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={PAD_L} y1={sy(v)} x2={PAD_L + CHART_W} y2={sy(v)} stroke={GRAY_LINE} strokeWidth={1} />
          <text x={PAD_L - 5} y={sy(v) + 3.5} fontSize="9" textAnchor="end" fill="#8a94a6">
            {Math.abs(v) < 100 ? v.toFixed(2) : v.toFixed(0)}
          </text>
        </g>
      ))}
      {xTicks.map((n, i) => (
        <g key={i}>
          <line x1={sx(n)} y1={PAD_T} x2={sx(n)} y2={PAD_T + CHART_H} stroke={GRAY_LINE} strokeWidth={1} />
          <text x={sx(n)} y={PAD_T + CHART_H + 14} fontSize="9" textAnchor="middle" fill="#8a94a6">{n}</text>
        </g>
      ))}

      {/* 轴线 */}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + CHART_H} stroke="#c8ccd8" />
      <line x1={PAD_L} y1={PAD_T + CHART_H} x2={PAD_L + CHART_W} y2={PAD_T + CHART_H} stroke="#c8ccd8" />

      {/* 真实值水平参考线 */}
      {trueVals.map((arr, pi) => {
        const tv = arr[0];
        if (!isFinite(tv)) return null;
        const tyy = sy(tv);
        if (tyy < PAD_T - 2 || tyy > PAD_T + CHART_H + 2) return null;
        return (
          <g key={pi}>
            <line
              x1={PAD_L}
              y1={tyy}
              x2={PAD_L + CHART_W}
              y2={tyy}
              stroke={colors[pi]}
              strokeWidth={1.5}
              strokeDasharray="6 3"
              opacity={0.5}
            />
            <text
              x={PAD_L + CHART_W - 2}
              y={tyy - 3}
              fontSize="9"
              textAnchor="end"
              fill={colors[pi]}
              opacity={0.7}
            >
              真值
            </text>
          </g>
        );
      })}

      {/* 矩估计折线 */}
      {estVals.map((arr, pi) => {
        const pts = arr.map((v, i) => ({ x: sx(ns[i]), y: isFinite(v) ? sy(v) : null }));
        const segments: string[] = [];
        let cmd = "M";
        for (const pt of pts) {
          if (pt.y === null) { cmd = "M"; continue; }
          segments.push(`${cmd}${pt.x.toFixed(2)},${pt.y.toFixed(2)}`);
          cmd = "L";
        }
        return (
          <g key={pi}>
            <path d={segments.join(" ")} fill="none" stroke={colors[pi]} strokeWidth={2} />
            {pts.map((pt, i) =>
              pt.y !== null ? (
                <circle key={i} cx={pt.x} cy={pt.y} r={3} fill={colors[pi]} stroke="white" strokeWidth={1} />
              ) : null
            )}
          </g>
        );
      })}

      {/* 轴标签 */}
      <text x={PAD_L + CHART_W / 2} y={SVG_H - 4} fontSize="10" textAnchor="middle" fill="#8a94a6">
        样本量 n
      </text>

      {/* 图例 */}
      {paramLabels.map((label, pi) => (
        <g key={pi}>
          <line
            x1={PAD_L + 4 + pi * 110}
            y1={PAD_T + 8}
            x2={PAD_L + 20 + pi * 110}
            y2={PAD_T + 8}
            stroke={colors[pi]}
            strokeWidth={2}
          />
          <text x={PAD_L + 23 + pi * 110} y={PAD_T + 11} fontSize="9" fill={colors[pi]}>
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── 滑块子组件 ──────────────────────────────────────────────────
interface ParamSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  color: string;
}

function ParamSlider({ label, value, min, max, step, onChange, color }: ParamSliderProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-[12px] font-semibold text-[var(--ink)]">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 cursor-pointer"
        style={{ accentColor: color }}
      />
      <span
        className="w-14 shrink-0 rounded-md px-2 py-0.5 text-center text-[12px] font-mono font-bold"
        style={{ background: color + "22", color }}
      >
        {value.toFixed(2)}
      </span>
    </div>
  );
}

// ─── 主组件 ──────────────────────────────────────────────────────
export default function MomentEstimator() {
  const [dist, setDist] = useState<DistType>("exponential");
  const [dataText, setDataText] = useState<string>("2.1, 0.8, 1.5, 0.4, 3.2, 0.6, 1.9, 2.7, 0.3, 1.1");
  const [sampleSize, setSampleSize] = useState<number>(30);
  const [showDerivation, setShowDerivation] = useState<boolean>(true);
  // 真实参数（用于随机生成 & 收敛图）
  const [trueParamsExp, setTrueParamsExp] = useState<number[]>([1.5]);
  const [trueParamsNorm, setTrueParamsNorm] = useState<number[]>([2.0, 1.5]);
  const [trueParamsUnif, setTrueParamsUnif] = useState<number[]>([1.0, 5.0]);
  // 收敛图用的大样本（点击"重新模拟"时更新）
  const [convSample, setConvSample] = useState<number[]>([]);
  const [showConv, setShowConv] = useState<boolean>(false);

  // 当前分布的真实参数
  function getTrueParams(): number[] {
    if (dist === "exponential") return trueParamsExp;
    if (dist === "normal") return trueParamsNorm;
    return trueParamsUnif;
  }

  function setTrueParams(vals: number[]) {
    if (dist === "exponential") setTrueParamsExp(vals);
    else if (dist === "normal") setTrueParamsNorm(vals);
    else setTrueParamsUnif(vals);
  }

  const config = DIST_CONFIGS[dist];
  const trueParams = getTrueParams();

  // 解析当前样本
  const data = parseSamples(dataText);
  const estimate = momentEstimate(dist, data);
  const steps = getDerivationSteps(dist, data, estimate);

  // 样本统计量
  const m1 = sampleMean(data);
  const m2 = sampleMean2(data);
  const b2 = m2 - m1 * m1;

  // 随机生成样本（在事件处理函数内）
  function handleGenerateSample() {
    const sample = config.generateSample(trueParams, sampleSize);
    setDataText(sample.map((v) => v.toFixed(3)).join(", "));
  }

  // 切换分布
  function switchDist(d: DistType) {
    setDist(d);
    setShowConv(false);
    setConvSample([]);
    // 生成默认样本
    const cfg = DIST_CONFIGS[d];
    let tp: number[];
    if (d === "exponential") tp = trueParamsExp;
    else if (d === "normal") tp = trueParamsNorm;
    else tp = trueParamsUnif;
    const sample = cfg.generateSample(tp, 20);
    setDataText(sample.map((v) => v.toFixed(3)).join(", "));
  }

  // 重新模拟收敛过程
  function handleRunConvergence() {
    const bigN = 200;
    const sample = config.generateSample(trueParams, bigN);
    setConvSample(sample);
    setShowConv(true);
  }

  // 收敛图数据
  const convSeries =
    showConv && convSample.length >= 5
      ? buildConvergenceSeries(dist, trueParams, convSample)
      : null;

  // 误差计算（与真实参数对比）
  function computeErrors(): Array<{ label: string; est: number; true_: number; color: string }> {
    if (!data.length) return [];
    if (dist === "exponential") {
      return [{ label: "λ", est: estimate.params.lambda, true_: trueParams[0], color: ACCENT }];
    } else if (dist === "normal") {
      return [
        { label: "μ", est: estimate.params.mu, true_: trueParams[0], color: ACCENT },
        { label: "σ", est: estimate.params.sigma, true_: trueParams[1], color: GREEN },
      ];
    } else {
      return [
        { label: "a", est: estimate.params.a, true_: trueParams[0], color: ACCENT },
        { label: "b", est: estimate.params.b, true_: trueParams[1], color: ORANGE },
      ];
    }
  }

  const errors = computeErrors();

  // 参数滑块颜色
  const sliderColors = [ACCENT, GREEN, ORANGE];

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-5">
      {/* 标题 */}
      <div>
        <h3 className="text-[15px] font-bold text-[var(--ink)]">矩估计量计算器</h3>
        <p className="text-[12px] text-[var(--ink-soft)] mt-0.5">
          选择总体分布，输入样本数据，自动推导矩估计量公式并给出数值估计；
          观察样本量 n 增大时估计量向真实参数收敛的过程。
        </p>
      </div>

      {/* 分布选择 Tab */}
      <div className="flex gap-1.5 flex-wrap">
        {(["exponential", "normal", "uniform"] as DistType[]).map((d) => (
          <button
            key={d}
            onClick={() => switchDist(d)}
            className={
              "rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors " +
              (d === dist
                ? "bg-[var(--accent)] text-white"
                : "border border-[var(--line)] bg-white text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]")
            }
          >
            {DIST_CONFIGS[d].label}
          </button>
        ))}
      </div>

      {/* 真实参数（用于生成样本）+ 样本输入 */}
      <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-3 space-y-3">
        <div className="text-[12px] font-semibold text-[var(--ink)]">
          设定真实参数（用于随机生成样本）
        </div>
        {config.trueParamLabels.map((label, i) => (
          <ParamSlider
            key={label}
            label={label}
            value={trueParams[i]}
            min={config.trueParamMin[i]}
            max={config.trueParamMax[i]}
            step={config.trueParamStep[i]}
            onChange={(v) => {
              const next = [...trueParams];
              next[i] = v;
              // 强制均匀分布 a < b
              if (dist === "uniform") {
                if (i === 0 && v >= next[1]) next[1] = v + 0.5;
                if (i === 1 && v <= next[0]) next[0] = v - 0.5;
              }
              setTrueParams(next);
            }}
            color={sliderColors[i]}
          />
        ))}

        {/* 样本量 & 生成按钮 */}
        <div className="flex items-center gap-3 pt-1">
          <span className="w-20 shrink-0 text-[12px] font-semibold text-[var(--ink)]">样本量 n</span>
          <input
            type="range"
            min={5}
            max={100}
            step={1}
            value={sampleSize}
            onChange={(e) => setSampleSize(Number(e.target.value))}
            className="flex-1 h-1.5 cursor-pointer"
            style={{ accentColor: ACCENT }}
          />
          <span
            className="w-14 shrink-0 rounded-md px-2 py-0.5 text-center text-[12px] font-mono font-bold"
            style={{ background: ACCENT_LIGHT, color: ACCENT }}
          >
            {sampleSize}
          </span>
        </div>
        <button
          onClick={handleGenerateSample}
          className="rounded-lg bg-[var(--accent)] px-4 py-1.5 text-[12px] font-medium text-white hover:opacity-90 transition-opacity"
        >
          随机生成样本
        </button>
      </div>

      {/* 样本数据文本框 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[var(--ink)]">
            样本数据（逗号分隔）
            {data.length > 0 && (
              <span className="ml-2 font-normal text-[var(--ink-soft)]">
                n = {data.length}
              </span>
            )}
          </span>
          {data.length === 0 && dataText.trim() !== "" && (
            <span className="text-[11px] text-red-500">格式有误，请检查</span>
          )}
        </div>
        <textarea
          value={dataText}
          onChange={(e) => setDataText(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-[12px] font-mono text-[var(--ink)] placeholder-[var(--ink-soft)] focus:outline-none focus:border-[var(--accent)] resize-none"
          placeholder="输入样本值，逗号/空格分隔"
          spellCheck={false}
        />
      </div>

      {/* 样本统计量 */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: "一阶样本矩 x̄",
              val: fmt(m1),
              sub: "(1/n)·Σxᵢ",
              color: ACCENT,
            },
            {
              label: "二阶样本矩 B₂",
              val: fmt(m2),
              sub: "(1/n)·Σxᵢ²",
              color: GREEN,
            },
            {
              label: "样本方差 B₂−x̄²",
              val: fmt(b2),
              sub: "= σ̂² (矩估计)",
              color: ORANGE,
            },
          ].map(({ label, val, sub, color }) => (
            <div
              key={label}
              className="rounded-lg p-2.5 text-center"
              style={{ background: color + "15", border: `1px solid ${color}30` }}
            >
              <div className="text-[10px] text-[var(--ink-soft)] leading-snug">{label}</div>
              <div className="text-[15px] font-extrabold font-mono mt-0.5" style={{ color }}>
                {val}
              </div>
              <div className="text-[10px] text-[var(--ink-soft)]">{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* 矩估计推导步骤 */}
      {data.length > 0 && (
        <div className="rounded-lg border border-[var(--line)] overflow-hidden">
          <button
            onClick={() => setShowDerivation((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-[var(--bg-muted)] text-[13px] font-semibold text-[var(--ink)] hover:bg-[var(--line)] transition-colors"
          >
            <span>矩估计推导过程</span>
            <span className="text-[var(--ink-soft)] text-[11px]">
              {showDerivation ? "收起 ▲" : "展开 ▼"}
            </span>
          </button>

          {showDerivation && (
            <div className="divide-y divide-[var(--line)]">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="flex gap-3 px-4 py-3 items-start"
                  style={{
                    background: step.color ? step.color + "08" : undefined,
                  }}
                >
                  <span
                    className="shrink-0 text-[11px] font-semibold mt-0.5"
                    style={{ color: step.color ?? "#8a94a6" }}
                  >
                    {step.label}
                  </span>
                  <span
                    className="font-mono text-[12px] leading-relaxed break-all"
                    style={{ color: step.color ?? "var(--ink)" }}
                  >
                    {step.math}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 矩估计结果 vs 真实参数 */}
      {data.length > 0 && errors.length > 0 && (
        <div
          className="rounded-lg border-2 p-4 space-y-3"
          style={{ borderColor: ACCENT, background: ACCENT_LIGHT }}
        >
          <div className="text-[13px] font-bold text-[var(--ink)]">矩估计结果对比</div>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${errors.length}, 1fr)` }}>
            {errors.map(({ label, est, true_, color }) => (
              <div
                key={label}
                className="rounded-lg p-3 text-center"
                style={{ background: "white", border: `1.5px solid ${color}40` }}
              >
                <div className="text-[10px] text-[var(--ink-soft)]">参数 {label}</div>
                <div className="text-[20px] font-extrabold font-mono mt-0.5" style={{ color }}>
                  {fmt3(est)}
                </div>
                <div className="text-[10px] text-[var(--ink-soft)] mt-0.5">
                  矩估计 {label}̂
                </div>
                {isFinite(true_) && (
                  <div
                    className="mt-1 text-[10px] font-mono rounded px-1.5 py-0.5"
                    style={{
                      background: Math.abs(est - true_) < 0.1 ? GREEN_LIGHT : "#fef3c7",
                      color: Math.abs(est - true_) < 0.1 ? GREEN : "#92400e",
                    }}
                  >
                    真值 {true_.toFixed(3)}｜误差 {Math.abs(est - true_).toFixed(3)}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--ink-soft)] leading-relaxed">
            矩估计的理论保证：当样本量 n → ∞ 时，由大数定律，样本矩依概率收敛于总体矩，从而矩估计量也收敛于真实参数（一致估计量）。
          </p>
        </div>
      )}

      {/* 收敛性演示 */}
      <div className="rounded-lg border border-[var(--line)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-muted)]">
          <div>
            <span className="text-[13px] font-semibold text-[var(--ink)]">收敛性演示</span>
            <span className="ml-2 text-[11px] text-[var(--ink-soft)]">
              n 增大时矩估计量趋近真实参数
            </span>
          </div>
          <button
            onClick={handleRunConvergence}
            className="rounded-lg bg-[var(--accent)] px-3 py-1 text-[12px] font-medium text-white hover:opacity-90 transition-opacity"
          >
            {showConv ? "重新模拟" : "开始模拟"}
          </button>
        </div>

        {showConv && convSeries ? (
          <div className="p-3 space-y-2">
            <ConvergenceChart series={convSeries} />
            <p className="text-[11px] text-[var(--ink-soft)] leading-relaxed px-1">
              虚线为真实参数值，实线为矩估计量随 n 的变化。随着样本量增大，
              矩估计量的波动越来越小并趋近于真值——这正是矩估计一致性的直观体现。
            </p>
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-[12px] text-[var(--ink-soft)]">
            点击「开始模拟」生成 200 个样本，观察矩估计量随 n 变化的收敛过程
          </div>
        )}
      </div>

      {/* 直觉说明 */}
      <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2.5 text-[12px] text-[var(--ink-soft)] leading-relaxed">
        <span className="font-semibold text-[var(--ink)]">矩估计核心思想：</span>
        用<strong className="text-[var(--ink)]">样本矩</strong>替换<strong className="text-[var(--ink)]">总体矩</strong>。
        总体 k 阶矩 μₖ = E[Xᵏ] 是参数 θ 的函数；将其替换为样本 k 阶矩
        Bₖ = (1/n)·Σxᵢᵏ，反解出参数即为矩估计量 θ̂。
        方法简单、直观，但当总体分布的高阶矩需要用时，估计精度可能不如极大似然估计。
      </div>
    </div>
  );
}
