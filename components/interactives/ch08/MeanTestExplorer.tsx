"use client";

import { memo, useState } from "react";

// ─── Design tokens (static fallbacks for SVG) ──────────────────────────────
const ACCENT = "#5b46e5";
const ACCENT_LIGHT = "#ede9fe";
const RED = "#dc2626";
const RED_LIGHT = "#fee2e2";
const GREEN = "#0f766e";
const GREEN_LIGHT = "#ccfbf1";
const GRAY_LINE = "#e7e9ef";

// ─── SVG dimensions ────────────────────────────────────────────────────────
const SVG_W = 480;
const SVG_H = 180;
const PX = 40;
const PY = 20;
const PLOT_W = SVG_W - 2 * PX;
const PLOT_H = SVG_H - 2 * PY;

// ─── Math helpers ──────────────────────────────────────────────────────────
// Approximation of the standard normal PDF
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// Error function approximation (Abramowitz & Stegun 7.1.26)
function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const poly =
    t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  return sign * (1 - poly * Math.exp(-x * x));
}

// Standard normal CDF
function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

// Gamma function (Lanczos approximation, for t-distribution)
function gammaLanczos(z: number): number {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gammaLanczos(1 - z));
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

// Regularized incomplete beta function (continued fraction, used for t-CDF)
function betaInc(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = Math.log(gammaLanczos(a)) + Math.log(gammaLanczos(b)) - Math.log(gammaLanczos(a + b));
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / a;
  // Lentz's continued fraction
  let f = 1,
    c = 1,
    d = 1 - ((a + b) * x) / (a + 1);
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  f = d;
  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m;
    let num = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2));
    d = 1 + num * d;
    c = 1 + num / c;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    f *= d * c;
    num = -((a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1));
    d = 1 + num * d;
    c = 1 + num / c;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const delta = d * c;
    f *= delta;
    if (Math.abs(delta - 1) < 1e-10) break;
  }
  return front * f;
}

// t-distribution CDF (df degrees of freedom)
function tCDF(t: number, df: number): number {
  const x = df / (df + t * t);
  const ib = betaInc(df / 2, 0.5, x);
  if (t >= 0) return 1 - 0.5 * ib;
  return 0.5 * ib;
}

// t-distribution PDF
function tPDF(x: number, df: number): number {
  const lc =
    Math.log(gammaLanczos((df + 1) / 2)) -
    Math.log(gammaLanczos(df / 2)) -
    0.5 * Math.log(df * Math.PI);
  return Math.exp(lc - ((df + 1) / 2) * Math.log(1 + (x * x) / df));
}

// Normal quantile (inverse CDF) — rational approximation
function normalQuantile(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const plow = 0.02425;
  const phigh = 1 - plow;
  if (p < plow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= phigh) {
    const q = p - 0.5;
    const r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  const q = Math.sqrt(-2 * Math.log(1 - p));
  return (
    -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

// t critical value via bisection (df degrees of freedom, upper-tail probability p)
function tQuantile(p: number, df: number): number {
  if (p <= 0) return Infinity;
  if (p >= 1) return -Infinity;
  // Initial bracket
  let lo = -10,
    hi = 10;
  while (tCDF(hi, df) < p) hi *= 2;
  while (tCDF(lo, df) > p) lo *= 2;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (tCDF(mid, df) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// ─── Utility types ────────────────────────────────────────────────────────
type TestType = "z" | "t";
type TailType = "left" | "right" | "two";
type AlphaLevel = 0.01 | 0.05 | 0.1;

interface TestResult {
  statistic: number;
  pValue: number;
  criticalLow: number;
  criticalHigh: number;
  reject: boolean;
}

// ─── Compute test result ──────────────────────────────────────────────────
function computeTest(
  xbar: number,
  mu0: number,
  spread: number,
  n: number,
  tail: TailType,
  alpha: AlphaLevel,
  type: TestType
): TestResult {
  const se = spread / Math.sqrt(n);
  const stat = (xbar - mu0) / se;
  const df = n - 1;

  let pValue: number;
  let criticalLow: number;
  let criticalHigh: number;

  if (type === "z") {
    if (tail === "left") {
      pValue = normalCDF(stat);
      criticalLow = -Infinity;
      criticalHigh = normalQuantile(alpha);
    } else if (tail === "right") {
      pValue = 1 - normalCDF(stat);
      criticalLow = normalQuantile(1 - alpha);
      criticalHigh = Infinity;
    } else {
      pValue = 2 * Math.min(normalCDF(stat), 1 - normalCDF(stat));
      criticalLow = normalQuantile(alpha / 2);
      criticalHigh = normalQuantile(1 - alpha / 2);
    }
  } else {
    if (tail === "left") {
      pValue = tCDF(stat, df);
      criticalLow = -Infinity;
      criticalHigh = tQuantile(alpha, df);
    } else if (tail === "right") {
      pValue = 1 - tCDF(stat, df);
      criticalLow = tQuantile(1 - alpha, df);
      criticalHigh = Infinity;
    } else {
      pValue = 2 * Math.min(tCDF(stat, df), 1 - tCDF(stat, df));
      criticalLow = tQuantile(alpha / 2, df);
      criticalHigh = tQuantile(1 - alpha / 2, df);
    }
  }

  const reject =
    tail === "left"
      ? stat < criticalHigh!
      : tail === "right"
      ? stat > criticalLow!
      : stat < criticalLow! || stat > criticalHigh!;

  return {
    statistic: stat,
    pValue: Math.max(0, Math.min(1, pValue)),
    criticalLow,
    criticalHigh,
    reject,
  };
}

// ─── SVG distribution curve ───────────────────────────────────────────────
function buildCurve(
  xMin: number,
  xMax: number,
  pdfFn: (x: number) => number,
  steps = 200
): string {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    const y = pdfFn(x);
    const sx = PX + ((x - xMin) / (xMax - xMin)) * PLOT_W;
    const pdfMax = pdfFn(0);
    const sy = SVG_H - PY - (y / pdfMax) * PLOT_H * 0.85;
    pts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(2)},${sy.toFixed(2)}`);
  }
  return pts.join(" ");
}

function buildArea(
  xMin: number,
  xMax: number,
  areaXMin: number,
  areaXMax: number,
  pdfFn: (x: number) => number,
  steps = 200
): string {
  const clampedMin = Math.max(areaXMin, xMin);
  const clampedMax = Math.min(areaXMax, xMax);
  if (clampedMin >= clampedMax) return "";
  const pdfMax = pdfFn(0);
  const toSX = (x: number) => PX + ((x - xMin) / (xMax - xMin)) * PLOT_W;
  const toSY = (y: number) => SVG_H - PY - (y / pdfMax) * PLOT_H * 0.85;
  const baseline = SVG_H - PY;
  const pts: string[] = [`M${toSX(clampedMin).toFixed(2)},${baseline}`];
  for (let i = 0; i <= steps; i++) {
    const x = clampedMin + (i / steps) * (clampedMax - clampedMin);
    const y = pdfFn(x);
    pts.push(`L${toSX(x).toFixed(2)},${toSY(y).toFixed(2)}`);
  }
  pts.push(`L${toSX(clampedMax).toFixed(2)},${baseline}`, "Z");
  return pts.join(" ");
}

// ─── Number input component ───────────────────────────────────────────────
interface NumInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit?: string;
}

function NumInput({ label, value, min, max, step, onChange, unit }: NumInputProps) {
  return (
    <div className="space-y-0.5">
      <label className="block text-[12px] font-semibold text-[var(--ink)]">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
          }}
          className="w-full rounded-md border border-[var(--line)] bg-white px-2 py-1 text-[13px] font-mono text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
        />
        {unit && <span className="text-[11px] text-[var(--ink-soft)] whitespace-nowrap">{unit}</span>}
      </div>
    </div>
  );
}

// ─── Slider component ─────────────────────────────────────────────────────
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  fmt?: (v: number) => string;
}

function Slider({ label, value, min, max, step, onChange, fmt }: SliderProps) {
  const display = fmt ? fmt(value) : String(value);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-[var(--ink)]">{label}</span>
        <span className="rounded px-2 py-0.5 text-[12px] font-mono font-bold"
          style={{ background: ACCENT_LIGHT, color: ACCENT }}>
          {display}
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
        style={{ accentColor: ACCENT }}
      />
    </div>
  );
}

// ─── Distribution SVG ─────────────────────────────────────────────────────
interface DistSVGProps {
  result: TestResult;
  tail: TailType;
  type: TestType;
  df: number;
}

function DistSVG({ result, tail, type, df }: DistSVGProps) {
  const { statistic: stat, criticalLow, criticalHigh } = result;
  const xMin = -4.5;
  const xMax = 4.5;

  const pdf = type === "z" ? normalPDF : (x: number) => tPDF(x, df);

  const curvePath = buildCurve(xMin, xMax, pdf);
  const pdfMax = type === "z" ? normalPDF(0) : tPDF(0, df);
  const toSX = (x: number) => PX + ((Math.max(xMin, Math.min(xMax, x)) - xMin) / (xMax - xMin)) * PLOT_W;
  const toSY = (y: number) => SVG_H - PY - (y / pdfMax) * PLOT_H * 0.85;
  const baseline = SVG_H - PY;

  // Rejection area paths
  const rejLeftPath =
    tail === "left" || tail === "two"
      ? buildArea(xMin, xMax, xMin, Math.min(criticalHigh, xMax), pdf)
      : "";
  const rejRightPath =
    tail === "right" || tail === "two"
      ? buildArea(xMin, xMax, Math.max(criticalLow, xMin), xMax, pdf)
      : "";

  // Stat line position
  const statSX = toSX(stat);
  const statSY = toSY(pdf(Math.max(xMin, Math.min(xMax, stat))));
  const statColor = result.reject ? RED : ACCENT;

  // Critical value lines
  const critLines: { x: number; label: string }[] = [];
  if (tail === "left" || tail === "two") critLines.push({ x: criticalHigh, label: tail === "two" ? `-z/t` : `-z/t` });
  if (tail === "right" || tail === "two") critLines.push({ x: criticalLow, label: `z/t` });

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full rounded-lg border border-[var(--line)]">
      {/* Background */}
      <rect x={PX} y={PY} width={PLOT_W} height={PLOT_H} fill="#fafbfd" stroke={GRAY_LINE} />

      {/* X-axis ticks */}
      {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((v) => {
        const sx = toSX(v);
        return (
          <g key={v}>
            <line x1={sx} y1={baseline} x2={sx} y2={baseline + 3} stroke="#aab" />
            <text x={sx} y={baseline + 11} fontSize="8" textAnchor="middle" fill="#8a94a6">{v}</text>
          </g>
        );
      })}

      {/* Rejection area - left */}
      {rejLeftPath && (
        <path d={rejLeftPath} fill={RED} opacity={0.18} />
      )}
      {/* Rejection area - right */}
      {rejRightPath && (
        <path d={rejRightPath} fill={RED} opacity={0.18} />
      )}

      {/* Distribution curve */}
      <path d={curvePath} fill="none" stroke={ACCENT} strokeWidth="2" />

      {/* Critical value vertical lines */}
      {critLines.map(({ x }) => {
        if (x === Infinity || x === -Infinity || isNaN(x)) return null;
        const sx = toSX(x);
        return (
          <line key={x} x1={sx} y1={PY} x2={sx} y2={baseline} stroke={RED} strokeDasharray="4 3" strokeWidth="1.2" />
        );
      })}

      {/* Test statistic vertical line */}
      {!isNaN(statSX) && isFinite(statSX) && (
        <>
          <line
            x1={statSX}
            y1={PY}
            x2={statSX}
            y2={baseline}
            stroke={statColor}
            strokeWidth="2"
          />
          {/* Dot on curve */}
          {statSX >= PX && statSX <= PX + PLOT_W && (
            <circle cx={statSX} cy={statSY} r="4" fill={statColor} />
          )}
          {/* Label */}
          <text
            x={Math.min(Math.max(statSX, PX + 16), PX + PLOT_W - 16)}
            y={PY + 12}
            fontSize="9"
            textAnchor="middle"
            fill={statColor}
            fontWeight="bold"
          >
            {type === "z" ? "Z" : "T"}={stat.toFixed(3)}
          </text>
        </>
      )}

      {/* Critical value labels */}
      {tail !== "right" && isFinite(criticalHigh) && (
        <text
          x={toSX(criticalHigh) - 4}
          y={PY + 22}
          fontSize="8"
          textAnchor="end"
          fill={RED}
        >
          {criticalHigh.toFixed(3)}
        </text>
      )}
      {tail !== "left" && isFinite(criticalLow) && (
        <text
          x={toSX(criticalLow) + 4}
          y={PY + 22}
          fontSize="8"
          textAnchor="start"
          fill={RED}
        >
          {criticalLow.toFixed(3)}
        </text>
      )}

      {/* Axis labels */}
      <text x={PX + PLOT_W / 2} y={SVG_H - 1} fontSize="9" textAnchor="middle" fill="#8a94a6">
        {type === "z" ? "Z 统计量" : `T 统计量 (df=${df})`}
      </text>

      {/* Rejection region label */}
      {(tail === "left" || tail === "two") && (
        <text x={PX + 12} y={PY + PLOT_H * 0.5} fontSize="8" fill={RED} opacity={0.8}>拒绝域</text>
      )}
      {(tail === "right" || tail === "two") && (
        <text x={PX + PLOT_W - 6} y={PY + PLOT_H * 0.5} fontSize="8" textAnchor="end" fill={RED} opacity={0.8}>拒绝域</text>
      )}
    </svg>
  );
}

// ─── Derivation panel ─────────────────────────────────────────────────────
interface DerivationProps {
  testType: TestType;
  tail: TailType;
  xbar: number;
  mu0: number;
  spread: number;
  n: number;
  result: TestResult;
  alpha: AlphaLevel;
}

function Derivation({ testType, tail, xbar, mu0, spread, n, result, alpha }: DerivationProps) {
  const [open, setOpen] = useState(false);
  const df = n - 1;
  const se = spread / Math.sqrt(n);
  const stat = result.statistic;
  const spreadSymbol = testType === "z" ? "σ" : "S";
  const statSymbol = testType === "z" ? "Z" : "T";

  const tailLabel =
    tail === "left" ? "左尾检验 H₁: μ < μ₀" : tail === "right" ? "右尾检验 H₁: μ > μ₀" : "双尾检验 H₁: μ ≠ μ₀";

  return (
    <div className="rounded-lg border border-[var(--line)] overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-2.5 bg-[var(--bg-muted)] text-left"
      >
        <span className="text-[13px] font-semibold text-[var(--ink)]">推导步骤展开</span>
        <span className="text-[16px] text-[var(--ink-soft)]">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 py-3 space-y-3 text-[12px] leading-relaxed text-[var(--ink-soft)]">
          <div>
            <div className="font-semibold text-[var(--ink)] mb-1">Step 1：建立假设</div>
            <div className="font-mono bg-[var(--bg-muted)] rounded px-3 py-2">
              H₀: μ = {mu0}{"　"}|{"　"}{tailLabel}
            </div>
          </div>
          <div>
            <div className="font-semibold text-[var(--ink)] mb-1">Step 2：计算标准误</div>
            <div className="font-mono bg-[var(--bg-muted)] rounded px-3 py-2">
              SE = {spreadSymbol}/√n = {spread}/{Math.sqrt(n).toFixed(4)} = {se.toFixed(4)}
            </div>
          </div>
          <div>
            <div className="font-semibold text-[var(--ink)] mb-1">
              Step 3：计算检验统计量
              {testType === "t" && `（t 分布，df = n−1 = ${df}）`}
            </div>
            <div className="font-mono bg-[var(--bg-muted)] rounded px-3 py-2">
              {statSymbol} = (X̄ − μ₀) / SE{"\n"}
              {"　　"}= ({xbar} − {mu0}) / {se.toFixed(4)}{"\n"}
              {"　　"}= {(xbar - mu0).toFixed(4)} / {se.toFixed(4)}{"\n"}
              {"　　"}= <span style={{ color: ACCENT, fontWeight: 700 }}>{stat.toFixed(4)}</span>
            </div>
          </div>
          <div>
            <div className="font-semibold text-[var(--ink)] mb-1">Step 4：确定临界值与拒绝域</div>
            <div className="font-mono bg-[var(--bg-muted)] rounded px-3 py-2">
              显著性水平 α = {alpha}{"　"}
              {tail === "left" && `临界值 = ${result.criticalHigh.toFixed(4)}（左尾）`}
              {tail === "right" && `临界值 = ${result.criticalLow.toFixed(4)}（右尾）`}
              {tail === "two" && `临界值 = ±${Math.abs(result.criticalHigh).toFixed(4)}（双尾）`}
            </div>
          </div>
          <div>
            <div className="font-semibold text-[var(--ink)] mb-1">Step 5：计算 p 值</div>
            <div className="font-mono bg-[var(--bg-muted)] rounded px-3 py-2">
              {tail === "left" && `p = P(${statSymbol} ≤ ${stat.toFixed(4)}) = `}
              {tail === "right" && `p = P(${statSymbol} ≥ ${stat.toFixed(4)}) = `}
              {tail === "two" && `p = 2 × P(${statSymbol} ≥ |${stat.toFixed(4)}|) = `}
              <span style={{ color: ACCENT, fontWeight: 700 }}>{result.pValue.toFixed(4)}</span>
            </div>
          </div>
          <div>
            <div className="font-semibold text-[var(--ink)] mb-1">Step 6：作出结论</div>
            <div
              className="rounded px-3 py-2 font-semibold"
              style={{
                background: result.reject ? RED_LIGHT : GREEN_LIGHT,
                color: result.reject ? RED : GREEN,
              }}
            >
              {result.reject
                ? `p = ${result.pValue.toFixed(4)} < α = ${alpha}，拒绝 H₀`
                : `p = ${result.pValue.toFixed(4)} ≥ α = ${alpha}，不拒绝 H₀`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────
function MeanTestExplorerBase() {
  // Tab
  const [testType, setTestType] = useState<TestType>("z");

  // Inputs
  const [xbar, setXbar] = useState(102.5);
  const [mu0, setMu0] = useState(100);
  const [sigma, setSigma] = useState(10);   // Z test: known σ
  const [s, setS] = useState(10);           // t test: sample std dev S
  const [n, setN] = useState(25);

  // Test settings
  const [tail, setTail] = useState<TailType>("two");
  const [alpha, setAlpha] = useState<AlphaLevel>(0.05);

  const spread = testType === "z" ? sigma : s;
  const df = n - 1;

  // Validation
  const valid = n >= 2 && spread > 0;

  const result = valid
    ? computeTest(xbar, mu0, spread, n, tail, alpha, testType)
    : null;

  const tailOptions: { key: TailType; label: string; symbol: string }[] = [
    { key: "left", label: "左尾", symbol: "H₁: μ < μ₀" },
    { key: "two", label: "双尾", symbol: "H₁: μ ≠ μ₀" },
    { key: "right", label: "右尾", symbol: "H₁: μ > μ₀" },
  ];

  const alphaOptions: AlphaLevel[] = [0.01, 0.05, 0.1];

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-[15px] font-bold text-[var(--ink)]">正态总体均值假设检验</h3>
        <p className="text-[12px] text-[var(--ink-soft)] mt-0.5">
          输入样本统计量，选择检验方向与显著性水平，实时计算统计量、p 值与结论。
        </p>
      </div>

      {/* Test type tabs */}
      <div className="flex gap-1 rounded-lg bg-[var(--bg-muted)] p-1">
        {(["z", "t"] as TestType[]).map((tp) => (
          <button
            key={tp}
            onClick={() => setTestType(tp)}
            className={`flex-1 rounded-md py-1.5 text-[13px] font-semibold transition-colors ${
              testType === tp
                ? "bg-white shadow text-[var(--ink)]"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            {tp === "z" ? "Z 检验（σ 已知）" : "t 检验（σ 未知）"}
          </button>
        ))}
      </div>

      {/* Parameter inputs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 rounded-lg bg-[var(--bg-muted)] p-3">
        <NumInput
          label="样本均值 X̄"
          value={xbar}
          min={-1000}
          max={1000}
          step={0.1}
          onChange={setXbar}
        />
        <NumInput
          label="原假设均值 μ₀"
          value={mu0}
          min={-1000}
          max={1000}
          step={0.1}
          onChange={setMu0}
        />
        <NumInput
          label="样本量 n"
          value={n}
          min={2}
          max={10000}
          step={1}
          onChange={setN}
        />
        {testType === "z" ? (
          <NumInput
            label="总体标准差 σ（已知）"
            value={sigma}
            min={0.001}
            max={1000}
            step={0.1}
            onChange={setSigma}
          />
        ) : (
          <NumInput
            label="样本标准差 S"
            value={s}
            min={0.001}
            max={1000}
            step={0.1}
            onChange={setS}
          />
        )}

        {/* Sliders section */}
        <div className="col-span-2 sm:col-span-2">
          <Slider
            label="样本量 n（快速调整）"
            value={n}
            min={2}
            max={200}
            step={1}
            onChange={setN}
            fmt={(v) => `n = ${v}`}
          />
        </div>
      </div>

      {/* Test direction and alpha */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tail direction */}
        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-[var(--ink)]">检验方向</div>
          <div className="flex flex-col gap-1">
            {tailOptions.map(({ key, label, symbol }) => (
              <button
                key={key}
                onClick={() => setTail(key)}
                className={`rounded-lg px-3 py-1.5 text-left text-[12px] font-medium transition-colors ${
                  tail === key
                    ? "text-white"
                    : "bg-[var(--bg-muted)] text-[var(--ink-soft)] hover:bg-[var(--line)]"
                }`}
                style={tail === key ? { background: ACCENT } : {}}
              >
                <span className="font-semibold">{label}</span>
                <span className="ml-2 font-mono text-[11px] opacity-80">{symbol}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Alpha level */}
        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-[var(--ink)]">显著性水平 α</div>
          <div className="flex flex-col gap-1">
            {alphaOptions.map((a) => (
              <button
                key={a}
                onClick={() => setAlpha(a)}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-mono font-semibold transition-colors ${
                  alpha === a
                    ? "text-white"
                    : "bg-[var(--bg-muted)] text-[var(--ink-soft)] hover:bg-[var(--line)]"
                }`}
                style={alpha === a ? { background: ACCENT } : {}}
              >
                α = {a}
              </button>
            ))}
          </div>

          {/* Quick formula */}
          <div className="mt-2 rounded-md bg-[var(--bg-muted)] px-2 py-1.5 text-[11px] leading-snug text-[var(--ink-soft)]">
            {testType === "z" ? (
              <>
                <span className="font-semibold text-[var(--ink)]">Z 统计量</span>
                <br />
                Z = (X̄ − μ₀) / (σ / √n)
                <br />
                服从 N(0,1)
              </>
            ) : (
              <>
                <span className="font-semibold text-[var(--ink)]">T 统计量</span>
                <br />
                T = (X̄ − μ₀) / (S / √n)
                <br />
                服从 t(n−1) = t({df})
              </>
            )}
          </div>
        </div>
      </div>

      {/* Distribution visualization */}
      {result && (
        <DistSVG result={result} tail={tail} type={testType} df={df} />
      )}

      {/* Result panel */}
      {result && (
        <div
          className="rounded-lg border-2 p-4 space-y-3"
          style={{
            borderColor: result.reject ? RED : GREEN,
            background: result.reject ? RED_LIGHT : GREEN_LIGHT,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold" style={{ color: result.reject ? RED : GREEN }}>
              {result.reject ? "拒绝 H₀" : "不拒绝 H₀"}
            </span>
            <span
              className="rounded-full px-3 py-0.5 text-[12px] font-bold text-white"
              style={{ background: result.reject ? RED : GREEN }}
            >
              {result.reject ? "显著" : "不显著"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              {
                label: testType === "z" ? "Z 值" : "T 值",
                val: result.statistic.toFixed(4),
                color: result.reject ? RED : ACCENT,
              },
              {
                label: "p 值",
                val: result.pValue < 0.0001 ? "< 0.0001" : result.pValue.toFixed(4),
                color: result.pValue < alpha ? RED : GREEN,
              },
              {
                label: tail === "left" ? "左临界值" : tail === "right" ? "右临界值" : "临界值 ±",
                val:
                  tail === "two"
                    ? Math.abs(result.criticalHigh).toFixed(4)
                    : tail === "left"
                    ? result.criticalHigh.toFixed(4)
                    : result.criticalLow.toFixed(4),
                color: RED,
              },
              {
                label: "df",
                val: testType === "t" ? String(df) : "∞（Z）",
                color: ACCENT,
              },
            ].map(({ label, val, color }) => (
              <div key={label} className="rounded-lg bg-white bg-opacity-70 p-2 text-center">
                <div className="text-[10px] text-[var(--ink-soft)]">{label}</div>
                <div className="text-[15px] font-extrabold font-mono mt-0.5" style={{ color }}>
                  {val}
                </div>
              </div>
            ))}
          </div>

          <div className="text-[12px] leading-relaxed" style={{ color: result.reject ? RED : GREEN }}>
            {result.reject ? (
              <>
                在 α = {alpha} 水平下，p = {result.pValue.toFixed(4)} {"<"} {alpha}，有统计上的显著差异，
                有足够证据拒绝 H₀，认为总体均值与 μ₀ = {mu0} 有显著差异。
              </>
            ) : (
              <>
                在 α = {alpha} 水平下，p = {result.pValue.toFixed(4)} {"≥"} {alpha}，
                没有足够证据拒绝 H₀，无法认为总体均值与 μ₀ = {mu0} 有显著差异。
              </>
            )}
          </div>
        </div>
      )}

      {/* p-value bar visualization */}
      {result && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[var(--ink-soft)]">
            <span>p 值直观位置</span>
            <span>α = {alpha}</span>
          </div>
          <div className="relative h-5 w-full rounded-full overflow-hidden" style={{ background: GREEN_LIGHT }}>
            {/* Alpha threshold marker */}
            <div
              className="absolute top-0 h-full w-0.5"
              style={{ left: `${alpha * 100}%`, background: RED }}
            />
            {/* p value fill */}
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(result.pValue, 1) * 100}%`,
                background: result.reject ? RED : GREEN,
                opacity: 0.5,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[var(--ink-soft)]">
            <span>0</span>
            <span style={{ color: RED }}>α = {alpha}</span>
            <span>1</span>
          </div>
        </div>
      )}

      {/* Derivation steps */}
      {result && (
        <Derivation
          testType={testType}
          tail={tail}
          xbar={xbar}
          mu0={mu0}
          spread={spread}
          n={n}
          result={result}
          alpha={alpha}
        />
      )}

      {/* Educational insight */}
      <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2.5 text-[12px] text-[var(--ink-soft)] leading-relaxed">
        <span className="font-semibold text-[var(--ink)]">核心思想：</span>
        假设检验问题的本质是「若 H₀ 为真，观察到当前或更极端数据的概率（p 值）有多小？」。
        p 值越小，越有证据反对 H₀。Z 检验需要已知 σ；当 σ 未知且用样本 S 估计时，
        统计量服从 t 分布——样本量越小（df 越小），t 分布尾部越重，临界值越大。
      </div>
    </div>
  );
}

export default memo(MeanTestExplorerBase);
