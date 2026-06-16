"use client";

import { useState, useMemo } from "react";

// ─── 设计常量 ────────────────────────────────────────────────────────────────
const ACCENT = "#5b46e5";
const ACCENT_LIGHT = "#ede9fe";
const TEAL = "#0f766e";
const TEAL_LIGHT = "#ccfbf1";
const ORANGE = "#ea580c";
const ORANGE_LIGHT = "#fff7ed";
const GRAY_LINE = "#e7e9ef";
const GRAY_BG = "#fafbfd";

// ─── SVG 布局 ────────────────────────────────────────────────────────────────
const SVG_W = 480;
const SVG_H = 220;
const PAD = { top: 18, right: 24, bottom: 38, left: 44 };
const PW = SVG_W - PAD.left - PAD.right;
const PH = SVG_H - PAD.top - PAD.bottom;

function sx(v: number, lo: number, hi: number): number {
  return PAD.left + ((v - lo) / (hi - lo)) * PW;
}
function sy(v: number, lo: number, hi: number): number {
  return PAD.top + PH - ((v - lo) / (hi - lo)) * PH;
}

// ─── 数学工具：Gamma 函数近似（Lanczos，精度 ~1e-10） ────────────────────────
function lnGamma(z: number): number {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  }
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function gamma(z: number): number {
  return Math.exp(lnGamma(z));
}

// ─── χ² 分布 PDF：pdf(x; k) = x^(k/2-1) * e^(-x/2) / (2^(k/2) * Γ(k/2)) ──
function chi2PDF(x: number, k: number): number {
  if (x <= 0) return 0;
  const lp =
    (k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.log(2) - lnGamma(k / 2);
  return Math.exp(lp);
}

// ─── t 分布 PDF：pdf(t; n) = Γ((n+1)/2)/[√(nπ) Γ(n/2)] * (1+t²/n)^(-(n+1)/2) ──
function tPDF(t: number, n: number): number {
  const lp =
    lnGamma((n + 1) / 2) -
    0.5 * Math.log(n * Math.PI) -
    lnGamma(n / 2) -
    ((n + 1) / 2) * Math.log(1 + (t * t) / n);
  return Math.exp(lp);
}

// ─── F 分布 PDF ───────────────────────────────────────────────────────────────
function fPDF(x: number, d1: number, d2: number): number {
  if (x <= 0) return 0;
  const lp =
    0.5 * d1 * Math.log(d1) +
    0.5 * d2 * Math.log(d2) +
    (0.5 * d1 - 1) * Math.log(x) -
    ((d1 + d2) / 2) * Math.log(d2 + d1 * x) +
    lnGamma((d1 + d2) / 2) -
    lnGamma(d1 / 2) -
    lnGamma(d2 / 2);
  return Math.exp(lp);
}

// ─── 标准正态 PDF ─────────────────────────────────────────────────────────────
function normPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// ─── 不完全 Gamma 正则化（用于数值积分/CDF，正则化下不完全 Gamma 函数） ────────
// 使用级数展开（小 x）和连分式展开（大 x）
function incGammaLower(a: number, x: number): number {
  // 使用级数展开：P(a,x) = e^{-x} x^a / Γ(a) * Σ_{n=0}^∞ x^n / Γ(a+n+1)/Γ(a)
  if (x < 0) return 0;
  if (x === 0) return 0;
  // 用级数展开
  let sum = 1.0 / a;
  let term = 1.0 / a;
  let aa = a;
  for (let i = 1; i < 150; i++) {
    aa += 1;
    term *= x / aa;
    sum += term;
    if (Math.abs(term) < Math.abs(sum) * 1e-9) break;
  }
  return Math.exp(-x + a * Math.log(x) - lnGamma(a)) * sum;
}

// χ² CDF（正则化下不完全 Gamma P(k/2, x/2)）
function chi2CDF(x: number, k: number): number {
  if (x <= 0) return 0;
  return incGammaLower(k / 2, x / 2);
}

// ─── 数值积分（梯形法，高精度） ───────────────────────────────────────────────
function integrate(
  f: (x: number) => number,
  lo: number,
  hi: number,
  steps = 800
): number {
  const h = (hi - lo) / steps;
  let s = 0.5 * (f(lo) + f(hi));
  for (let i = 1; i < steps; i++) s += f(lo + i * h);
  return s * h;
}

// ─── χ² 临界值（二分法求解 P(χ² > c) = α） ──────────────────────────────────
function chi2Critical(k: number, alpha: number): number {
  let a = 0.001;
  let b = k + 10 * Math.sqrt(2 * k) + 10;
  // 确保区间有效：P(χ²>a) > alpha > P(χ²>b)
  for (let iter = 0; iter < 100; iter++) {
    const mid = (a + b) / 2;
    const pVal = 1 - chi2CDF(mid, k);
    if (pVal > alpha) a = mid;
    else b = mid;
    if (b - a < 1e-7) return (a + b) / 2;
  }
  return (a + b) / 2;
}

// ─── t 分布临界值（双侧，二分法） ────────────────────────────────────────────
// 数值积分求 CDF
function tCDFRight(t: number, n: number): number {
  // P(T > t) 用数值积分
  const upper = t + 30;
  return integrate((x) => tPDF(x, n), t, upper, 600);
}

function tCritical(n: number, alpha: number): number {
  // 双侧：P(|T| > c) = alpha => P(T > c) = alpha/2
  const target = alpha / 2;
  let lo = 0.001;
  let hi = 20;
  for (let iter = 0; iter < 80; iter++) {
    const mid = (lo + hi) / 2;
    const p = tCDFRight(mid, n);
    if (p > target) lo = mid;
    else hi = mid;
    if (hi - lo < 1e-6) return (lo + hi) / 2;
  }
  return (lo + hi) / 2;
}

// ─── F 分布临界值（二分法） ───────────────────────────────────────────────────
function fCDFRight(x: number, d1: number, d2: number): number {
  const upper = x + 40;
  return integrate((t) => fPDF(t, d1, d2), x, upper, 600);
}

function fCritical(d1: number, d2: number, alpha: number): number {
  let lo = 0.001;
  let hi = 20;
  for (let iter = 0; iter < 80; iter++) {
    const mid = (lo + hi) / 2;
    const p = fCDFRight(mid, d1, d2);
    if (p > alpha) lo = mid;
    else hi = mid;
    if (hi - lo < 1e-6) return (lo + hi) / 2;
  }
  return (lo + hi) / 2;
}

// ─── 类型 ────────────────────────────────────────────────────────────────────
type TabId = "chi2" | "t" | "F";

interface TabMeta {
  id: TabId;
  label: string;
  color: string;
  bg: string;
  tint: string;
}

const TABS: TabMeta[] = [
  { id: "chi2", label: "χ²(n)", color: ACCENT, bg: ACCENT_LIGHT, tint: "#7c3aed" },
  { id: "t", label: "t(n)", color: TEAL, bg: TEAL_LIGHT, tint: TEAL },
  { id: "F", label: "F(m,n)", color: ORANGE, bg: ORANGE_LIGHT, tint: ORANGE },
];

// ─── 滑块组件 ────────────────────────────────────────────────────────────────
interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  color: string;
  bg: string;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}

function SliderRow({ label, value, min, max, step, color, bg, onChange, format }: SliderRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-[var(--ink)]">{label}</span>
        <span
          className="rounded-md px-2 py-0.5 text-[12px] font-mono font-bold"
          style={{ background: bg, color }}
        >
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 cursor-pointer"
        style={{ accentColor: color }}
      />
      <div className="flex justify-between text-[10px] text-[var(--ink-soft)]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// ─── 生成曲线点 ───────────────────────────────────────────────────────────────
interface CurveConfig {
  tabId: TabId;
  chi2N: number;
  tN: number;
  fM: number;
  fN: number;
  alpha: number;
  showNormal: boolean;
}

interface CurveResult {
  xs: number[];
  ys: number[];
  normYs: number[];
  xLo: number;
  xHi: number;
  yMax: number;
  critical: number;
  criticalLabel: string;
  tailArea: number;
}

function computeCurve(cfg: CurveConfig): CurveResult {
  const { tabId, chi2N, tN, fM, fN, alpha } = cfg;
  const POINTS = 400;

  let xLo: number, xHi: number, pdfFn: (x: number) => number, critical: number, criticalLabel: string;

  if (tabId === "chi2") {
    xLo = 0.01;
    xHi = Math.max(chi2N * 3, 20);
    pdfFn = (x) => chi2PDF(x, chi2N);
    critical = chi2Critical(chi2N, alpha);
    criticalLabel = `χ²_α(${chi2N}) = ${critical.toFixed(3)}`;
  } else if (tabId === "t") {
    const span = Math.max(4, Math.sqrt(tN + 2) * 3);
    xLo = -span;
    xHi = span;
    pdfFn = (x) => tPDF(x, tN);
    critical = tCritical(tN, alpha);
    criticalLabel = `t_{α/2}(${tN}) = ${critical.toFixed(3)}`;
  } else {
    xLo = 0.01;
    xHi = Math.max((fM / fN) * 6 + 2, 6);
    pdfFn = (x) => fPDF(x, fM, fN);
    critical = fCritical(fM, fN, alpha);
    criticalLabel = `F_α(${fM},${fN}) = ${critical.toFixed(3)}`;
  }

  const step = (xHi - xLo) / POINTS;
  const xs: number[] = [];
  const ys: number[] = [];
  const normYs: number[] = [];

  for (let i = 0; i <= POINTS; i++) {
    const x = xLo + i * step;
    xs.push(x);
    ys.push(pdfFn(x));
    // 正态对照（标准化到相同均值/方差级别）
    if (tabId === "chi2") {
      const mean = chi2N;
      const std = Math.sqrt(2 * chi2N);
      normYs.push(normPDF((x - mean) / std) / std);
    } else if (tabId === "t") {
      normYs.push(normPDF(x));
    } else {
      const mean = fN > 2 ? fN / (fN - 2) : 1;
      const v = fN > 4 ? (2 * fN * fN * (fM + fN - 2)) / (fM * (fN - 2) ** 2 * (fN - 4)) : 1;
      const std = Math.sqrt(v);
      normYs.push(normPDF((x - mean) / std) / std);
    }
  }

  const yMax = Math.max(...ys) * 1.12;

  // 右尾面积（数值积分）
  const tailArea = integrate(pdfFn, critical, xHi + 20, 600);

  return { xs, ys, normYs, xLo, xHi, yMax, critical, criticalLabel, tailArea };
}

// ─── SVG 曲线图 ───────────────────────────────────────────────────────────────
interface DistPlotProps {
  result: CurveResult;
  tabId: TabId;
  color: string;
  showNormal: boolean;
  alpha: number;
}

function DistPlot({ result, tabId, color, showNormal, alpha }: DistPlotProps) {
  const { xs, ys, normYs, xLo, xHi, yMax, critical } = result;

  function px(x: number): number { return sx(x, xLo, xHi); }
  function py(y: number): number { return sy(y, 0, yMax); }

  // 主曲线路径
  const curvePath = xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${px(x).toFixed(2)},${py(ys[i]).toFixed(2)}`)
    .join(" ");

  // 正态曲线路径
  const normPath = showNormal
    ? xs
        .map((x, i) => `${i === 0 ? "M" : "L"}${px(x).toFixed(2)},${py(normYs[i]).toFixed(2)}`)
        .join(" ")
    : "";

  // 右尾阴影路径（主分布）
  const tailXs = xs.filter((x) => x >= critical);
  const tailPath =
    tailXs.length > 1
      ? [
          `M${px(critical).toFixed(2)},${py(0).toFixed(2)}`,
          ...tailXs.map((x) => `L${px(x).toFixed(2)},${py(ys[xs.indexOf(x)]).toFixed(2)}`),
          `L${px(tailXs[tailXs.length - 1]).toFixed(2)},${py(0).toFixed(2)}`,
          "Z",
        ].join(" ")
      : "";

  // t 分布左尾
  let leftTailPath = "";
  if (tabId === "t") {
    const leftTailXs = xs.filter((x) => x <= -critical);
    leftTailPath =
      leftTailXs.length > 1
        ? [
            `M${px(leftTailXs[0]).toFixed(2)},${py(0).toFixed(2)}`,
            ...leftTailXs.map((x) => `L${px(x).toFixed(2)},${py(ys[xs.indexOf(x)]).toFixed(2)}`),
            `L${px(-critical).toFixed(2)},${py(0).toFixed(2)}`,
            "Z",
          ].join(" ")
        : "";
  }

  // x 轴刻度
  const xRange = xHi - xLo;
  const xStep = xRange <= 10 ? 1 : xRange <= 30 ? 5 : xRange <= 60 ? 10 : 20;
  const xTickStart = Math.ceil(xLo / xStep) * xStep;
  const xTicks: number[] = [];
  for (let t = xTickStart; t <= xHi; t += xStep) xTicks.push(t);

  const yStep = yMax / 4;
  const yTicks = [yStep, 2 * yStep, 3 * yStep].map((v) => v);

  const critX = px(critical);

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full rounded-lg border border-[var(--line)]"
      style={{ background: GRAY_BG }}
    >
      {/* 网格线 */}
      {yTicks.map((t, i) => (
        <line
          key={`yg${i}`}
          x1={PAD.left}
          y1={py(t)}
          x2={PAD.left + PW}
          y2={py(t)}
          stroke={GRAY_LINE}
          strokeWidth={1}
        />
      ))}
      {xTicks.map((t, i) => (
        <line
          key={`xg${i}`}
          x1={px(t)}
          y1={PAD.top}
          x2={px(t)}
          y2={PAD.top + PH}
          stroke={GRAY_LINE}
          strokeWidth={1}
        />
      ))}

      {/* 左尾面积（t 分布双侧） */}
      {tabId === "t" && leftTailPath && (
        <path d={leftTailPath} fill={color} opacity={0.25} />
      )}

      {/* 右尾面积 */}
      {tailPath && <path d={tailPath} fill={color} opacity={0.25} />}

      {/* 正态对照曲线 */}
      {showNormal && normPath && (
        <path
          d={normPath}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="5 3"
          opacity={0.7}
        />
      )}

      {/* 主分布曲线 */}
      <path d={curvePath} fill="none" stroke={color} strokeWidth={2.2} />

      {/* 临界值竖线 */}
      {critical > xLo && critical < xHi && (
        <>
          <line
            x1={critX}
            y1={PAD.top}
            x2={critX}
            y2={PAD.top + PH}
            stroke={color}
            strokeWidth={1.8}
            strokeDasharray="4 3"
          />
          {tabId === "t" && (
            <line
              x1={px(-critical)}
              y1={PAD.top}
              x2={px(-critical)}
              y2={PAD.top + PH}
              stroke={color}
              strokeWidth={1.8}
              strokeDasharray="4 3"
            />
          )}
          {/* α 标注 */}
          <text
            x={Math.min(critX + 6, PAD.left + PW - 32)}
            y={PAD.top + 16}
            fontSize={10}
            fill={color}
            fontWeight="700"
          >
            α={alpha.toFixed(2)}
          </text>
        </>
      )}

      {/* 坐标轴 */}
      <line
        x1={PAD.left}
        y1={PAD.top}
        x2={PAD.left}
        y2={PAD.top + PH}
        stroke="#94a3b8"
        strokeWidth={1.5}
      />
      <line
        x1={PAD.left}
        y1={PAD.top + PH}
        x2={PAD.left + PW}
        y2={PAD.top + PH}
        stroke="#94a3b8"
        strokeWidth={1.5}
      />

      {/* X 轴刻度 */}
      {xTicks.map((t, i) => (
        <g key={`xt${i}`}>
          <line
            x1={px(t)}
            y1={PAD.top + PH}
            x2={px(t)}
            y2={PAD.top + PH + 4}
            stroke="#94a3b8"
            strokeWidth={1}
          />
          <text
            x={px(t)}
            y={PAD.top + PH + 14}
            fontSize={9}
            textAnchor="middle"
            fill="#64748b"
          >
            {t % 1 === 0 ? t : t.toFixed(1)}
          </text>
        </g>
      ))}

      {/* Y 轴刻度 */}
      {yTicks.map((t, i) => (
        <g key={`yt${i}`}>
          <line
            x1={PAD.left - 4}
            y1={py(t)}
            x2={PAD.left}
            y2={py(t)}
            stroke="#94a3b8"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 6}
            y={py(t) + 3}
            fontSize={8}
            textAnchor="end"
            fill="#64748b"
          >
            {t.toFixed(2)}
          </text>
        </g>
      ))}

      {/* 轴标签 */}
      <text
        x={PAD.left + PW / 2}
        y={SVG_H - 2}
        fontSize={10}
        textAnchor="middle"
        fill="#475569"
        fontWeight="600"
      >
        x
      </text>
      <text
        x={9}
        y={PAD.top + PH / 2}
        fontSize={10}
        textAnchor="middle"
        fill="#475569"
        fontWeight="600"
        transform={`rotate(-90,9,${PAD.top + PH / 2})`}
      >
        f(x)
      </text>

      {/* 正态对照图例 */}
      {showNormal && (
        <g>
          <line
            x1={PAD.left + PW - 74}
            y1={PAD.top + 8}
            x2={PAD.left + PW - 54}
            y2={PAD.top + 8}
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="5 3"
          />
          <text
            x={PAD.left + PW - 50}
            y={PAD.top + 11}
            fontSize={9}
            fill="#94a3b8"
          >
            N(0,1)
          </text>
        </g>
      )}
    </svg>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function SamplingDistExplorer() {
  const [activeTab, setActiveTab] = useState<TabId>("chi2");

  // χ² 参数
  const [chi2N, setChi2N] = useState(5);

  // t 参数
  const [tN, setTN] = useState(5);

  // F 参数
  const [fM, setFM] = useState(5);
  const [fN, setFN] = useState(10);

  // 显著性水平 α
  const [alpha, setAlpha] = useState(0.05);

  // 是否显示正态对照
  const [showNormal, setShowNormal] = useState(true);

  const tab = TABS.find((t) => t.id === activeTab)!;

  // 计算曲线（useMemo 避免重复计算）
  const curveResult = useMemo(
    () =>
      computeCurve({
        tabId: activeTab,
        chi2N,
        tN,
        fM,
        fN,
        alpha,
        showNormal,
      }),
    [activeTab, chi2N, tN, fM, fN, alpha, showNormal]
  );

  // 当前自由度描述
  function dfDesc(): string {
    if (activeTab === "chi2") return `自由度 n = ${chi2N}`;
    if (activeTab === "t") return `自由度 n = ${tN}`;
    return `自由度 m = ${fM}, n = ${fN}`;
  }

  // 分布均值/方差理论值
  function theoreticalStats(): { mean: string; variance: string; convergence: string } {
    if (activeTab === "chi2") {
      return {
        mean: `E(X) = n = ${chi2N}`,
        variance: `Var(X) = 2n = ${2 * chi2N}`,
        convergence: `n→∞ 时，(χ²-n)/√(2n) → N(0,1)`,
      };
    }
    if (activeTab === "t") {
      const v = tN > 2 ? `n/(n-2) = ${(tN / (tN - 2)).toFixed(3)}` : "∞（n≤2时无定义）";
      return {
        mean: "E(X) = 0（n>1）",
        variance: `Var(X) = ${v}`,
        convergence: `n→∞ 时，t(n) → N(0,1)（图中虚线）`,
      };
    }
    const vMean = fN > 2 ? `n/(n-2) = ${(fN / (fN - 2)).toFixed(3)}` : "∞（n≤2）";
    return {
      mean: `E(X) = ${vMean}`,
      variance: fN > 4 ? `Var(X) = 2n²(m+n-2)/[m(n-2)²(n-4)]` : "∞（n≤4）",
      convergence: `m,n→∞ 时，F(m,n) 的标准化形式趋近 N(0,1)`,
    };
  }

  const stats = theoreticalStats();

  // 关联说明
  function relationNote(): string {
    if (activeTab === "chi2") {
      return `若 X₁,…,Xₙ ~ N(0,1) 独立，则 X₁²+…+Xₙ² ~ χ²(n)。样本方差 S² 的抽样分布正是 χ²。`;
    }
    if (activeTab === "t") {
      return `若 X~N(0,1) 与 Y~χ²(n) 独立，则 X/√(Y/n) ~ t(n)。样本均值标准化后服从 t 分布。`;
    }
    return `若 X~χ²(m)，Y~χ²(n) 独立，则 (X/m)/(Y/n) ~ F(m,n)。方差比检验的基础分布。`;
  }

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-5">
      {/* 标题 */}
      <div>
        <h3 className="text-[15px] font-bold text-[var(--ink)]">三大抽样分布探索器</h3>
        <p className="text-[12px] text-[var(--ink-soft)] mt-0.5 leading-relaxed">
          切换 χ²、t、F 分布，调整自由度与显著性水平，实时观察 PDF 曲线与右尾临界值。
        </p>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="rounded-lg px-4 py-1.5 text-[13px] font-bold transition-all"
            style={{
              background: activeTab === t.id ? t.color : "transparent",
              color: activeTab === t.id ? "white" : t.color,
              border: `2px solid ${t.color}`,
            }}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={() => setShowNormal((v) => !v)}
          className="ml-auto rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all border"
          style={{
            borderColor: GRAY_LINE,
            background: showNormal ? "#f1f5f9" : "white",
            color: showNormal ? "#475569" : "#94a3b8",
          }}
        >
          {showNormal ? "▣" : "□"} 正态对照
        </button>
      </div>

      {/* 控制面板 */}
      <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-3 space-y-4">
        {/* χ² 参数 */}
        {activeTab === "chi2" && (
          <SliderRow
            label="自由度 n"
            value={chi2N}
            min={1}
            max={30}
            step={1}
            color={tab.color}
            bg={tab.bg}
            onChange={setChi2N}
          />
        )}
        {/* t 参数 */}
        {activeTab === "t" && (
          <SliderRow
            label="自由度 n"
            value={tN}
            min={1}
            max={30}
            step={1}
            color={tab.color}
            bg={tab.bg}
            onChange={setTN}
          />
        )}
        {/* F 参数 */}
        {activeTab === "F" && (
          <div className="space-y-3">
            <SliderRow
              label="分子自由度 m"
              value={fM}
              min={1}
              max={20}
              step={1}
              color={tab.color}
              bg={tab.bg}
              onChange={setFM}
            />
            <SliderRow
              label="分母自由度 n"
              value={fN}
              min={2}
              max={30}
              step={1}
              color={tab.color}
              bg={tab.bg}
              onChange={setFN}
            />
          </div>
        )}

        {/* 显著性水平 */}
        <SliderRow
          label="显著性水平 α（右尾概率）"
          value={alpha}
          min={0.01}
          max={0.1}
          step={0.01}
          color="#dc2626"
          bg="#fee2e2"
          onChange={setAlpha}
          format={(v) => v.toFixed(2)}
        />
      </div>

      {/* PDF 曲线图 */}
      <div>
        <div className="mb-2 flex items-center justify-between flex-wrap gap-1">
          <span className="text-[12px] font-semibold text-[var(--ink)]">
            概率密度曲线 — {dfDesc()}
          </span>
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-mono font-bold"
            style={{ background: "#fee2e2", color: "#dc2626" }}
          >
            {curveResult.criticalLabel}
          </span>
        </div>
        <DistPlot
          result={curveResult}
          tabId={activeTab}
          color={tab.color}
          showNormal={showNormal}
          alpha={alpha}
        />
        <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-6 rounded-sm"
              style={{ background: tab.color, opacity: 0.3 }}
            />
            <span className="text-[var(--ink-soft)]">
              右尾面积 ≈ {curveResult.tailArea.toFixed(4)}（理论 = {alpha.toFixed(2)}）
            </span>
          </div>
          {showNormal && (
            <div className="flex items-center gap-1.5">
              <svg width="18" height="6">
                <line
                  x1="0"
                  y1="3"
                  x2="18"
                  y2="3"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="5 3"
                />
              </svg>
              <span className="text-[var(--ink-soft)]">标准正态 N(0,1)</span>
            </div>
          )}
        </div>
      </div>

      {/* 临界值与理论结果 */}
      <div
        className="rounded-lg border-2 p-4 space-y-3"
        style={{ borderColor: tab.color, background: tab.bg }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[14px] font-bold text-[var(--ink)]">临界值</span>
          <span
            className="text-[20px] font-extrabold font-mono"
            style={{ color: tab.color }}
          >
            {curveResult.criticalLabel}
          </span>
        </div>
        <p className="text-[12px] text-[var(--ink-soft)] leading-relaxed">
          {activeTab === "chi2" &&
            `右尾面积 P(χ²(${chi2N}) > ${curveResult.critical.toFixed(3)}) = α = ${alpha.toFixed(2)}。
            当检验统计量超过此临界值，拒绝 H₀。`}
          {activeTab === "t" &&
            `双侧临界值：P(|t(${tN})| > ${curveResult.critical.toFixed(3)}) = α = ${alpha.toFixed(2)}。
            左右两侧各占 α/2 = ${(alpha / 2).toFixed(3)}。`}
          {activeTab === "F" &&
            `右尾面积 P(F(${fM},${fN}) > ${curveResult.critical.toFixed(3)}) = α = ${alpha.toFixed(2)}。
            F 分布仅在右尾做单侧检验（方差比总为正）。`}
        </p>
      </div>

      {/* 理论参数 */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {[
          { label: "均值", val: stats.mean, color: tab.color, bg: tab.bg },
          { label: "方差", val: stats.variance, color: "#475569", bg: "#f1f5f9" },
          { label: "极限行为", val: stats.convergence, color: "#475569", bg: "#f1f5f9" },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className="rounded-lg p-2.5" style={{ background: bg }}>
            <div className="text-[10px] font-semibold text-[var(--ink-soft)] mb-0.5">{label}</div>
            <div className="text-[11px] font-mono font-bold leading-snug" style={{ color }}>
              {val}
            </div>
          </div>
        ))}
      </div>

      {/* n→∞ 渐近正态对比说明 */}
      {showNormal && (
        <div
          className="rounded-lg border p-3 space-y-1"
          style={{ borderColor: GRAY_LINE, background: "#f8fafc" }}
        >
          <div className="text-[12px] font-bold text-[var(--ink)]">
            n → ∞ 收敛到正态（图中灰虚线）
          </div>
          <p className="text-[11px] text-[var(--ink-soft)] leading-relaxed">
            {activeTab === "chi2" &&
              `自由度 n 增大时，χ²(n) 的 PDF 越来越接近正态形状：均值 n、标准差 √(2n)。
              当前 n=${chi2N}，${chi2N >= 20 ? "曲线已相当接近正态。" : "增大 n 可明显看到收敛效果。"}`}
            {activeTab === "t" &&
              `自由度 n 增大时，t(n) 的尾部越来越细，趋近 N(0,1)。
              当前 n=${tN}，${tN >= 30 ? "与正态已十分接近（工程上常用 n≥30 直接用正态）。" : "可看到 t 分布比正态有更厚的尾部（重尾特性）。"}`}
            {activeTab === "F" &&
              `m,n 均增大时，F(m,n) 的形状越来越对称，趋向正态。
              当前 F(${fM},${fN})，${Math.min(fM, fN) >= 15 ? "对称性已较好，中心近似正态。" : "可以看到明显的右偏形状。"}`}
          </p>
        </div>
      )}

      {/* 分布来源与检验联系 */}
      <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2.5 text-[12px] text-[var(--ink-soft)] leading-relaxed space-y-1.5">
        <div className="font-semibold text-[13px] text-[var(--ink)]">
          {activeTab === "chi2" && "χ² 分布的来源"}
          {activeTab === "t" && "t 分布的来源"}
          {activeTab === "F" && "F 分布的来源"}
        </div>
        <p>{relationNote()}</p>
        <p>
          <span className="font-semibold text-[var(--ink)]">检验用途：</span>
          {activeTab === "chi2" && "样本方差检验、拟合优度检验、独立性检验。"}
          {activeTab === "t" && "单样本均值 t 检验、两样本均值 t 检验、回归系数显著性检验。"}
          {activeTab === "F" && "方差齐性检验（F 检验）、方差分析（ANOVA）、回归方程整体显著性检验。"}
        </p>
        <p className="text-[11px]">
          <span className="font-semibold text-[var(--ink)]">使用提示：</span>
          拖动自由度滑块观察曲线形状变化；调整 α 看临界值如何移动；开启「正态对照」直观感受收敛速度。
        </p>
      </div>
    </div>
  );
}
