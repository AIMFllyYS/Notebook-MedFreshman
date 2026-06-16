"use client";

import { useState } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const ACCENT = "#5b46e5";
const ACCENT_LIGHT = "#ede9fe";
const RED = "#dc2626";
const RED_LIGHT = "#fee2e2";
const GREEN = "#0f766e";
const GREEN_LIGHT = "#ccfbf1";
const GRAY_LINE = "#e7e9ef";

// ─── SVG dimensions ───────────────────────────────────────────────────────────
const SVG_W = 480;
const SVG_H = 200;
const PX = 44;
const PY = 24;
const PLOT_W = SVG_W - 2 * PX;
const PLOT_H = SVG_H - 2 * PY;

// ─── Math: Gamma function (Lanczos approximation) ─────────────────────────────
function gammaLanczos(z: number): number {
  const g = 7;
  const c = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gammaLanczos(1 - z));
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

function logGamma(z: number): number {
  return Math.log(Math.abs(gammaLanczos(z)));
}

// ─── χ² distribution PDF: f(x; k) = x^(k/2-1) * e^(-x/2) / (2^(k/2) * Γ(k/2)) ──
function chi2PDF(x: number, k: number): number {
  if (x <= 0) return 0;
  const k2 = k / 2;
  const logPDF = (k2 - 1) * Math.log(x) - x / 2 - k2 * Math.log(2) - logGamma(k2);
  return Math.exp(logPDF);
}

// ─── Regularized incomplete gamma function P(a, x) = γ(a,x)/Γ(a) ─────────────
// Used for χ² CDF: P(k/2, x/2)
function regularizedGammaP(a: number, x: number): number {
  if (x < 0) return 0;
  if (x === 0) return 0;
  if (x < a + 1) {
    // Series expansion
    let term = 1 / a;
    let sum = term;
    for (let n = 1; n <= 300; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-12) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
  } else {
    // Continued fraction (Lentz's method)
    let f = 1e-30;
    let c = f;
    let d = 1 - (a + 1 + x);
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d;
    f = d;
    for (let i = 1; i <= 300; i++) {
      const an1 = i * (a - i);
      const an2 = -(a + 2 * i + 1 - x);
      d = an2 + an1 * d;
      c = an2 + an1 / c;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      const delta = d * c;
      f *= delta;
      if (Math.abs(delta - 1) < 1e-12) break;
    }
    return 1 - Math.exp(-x + a * Math.log(x) - logGamma(a)) / f;
  }
}

// χ² CDF: P(χ² ≤ x) = regularizedGammaP(k/2, x/2)
function chi2CDF(x: number, k: number): number {
  if (x <= 0) return 0;
  return regularizedGammaP(k / 2, x / 2);
}

// ─── χ² quantile via bisection ───────────────────────────────────────────────
function chi2Quantile(p: number, k: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  // Initial guess: using Wilson-Hilferty approximation
  const mu = k;
  const sigma2 = 2 * k;
  let x = Math.max(0.01, mu + Math.sqrt(sigma2) * (p > 0.5 ? 2 : -2));
  // Bisection
  let lo = 0;
  let hi = Math.max(100, k * 5);
  while (chi2CDF(hi, k) < p) hi *= 2;
  for (let i = 0; i < 120; i++) {
    const mid = (lo + hi) / 2;
    if (chi2CDF(mid, k) < p) lo = mid;
    else hi = mid;
    if (hi - lo < 1e-9) break;
  }
  x = (lo + hi) / 2;
  return x;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type TailType = "left" | "right" | "two";
type AlphaLevel = 0.01 | 0.05 | 0.1;

interface TestResult {
  chi2Stat: number;
  df: number;
  pValue: number;
  criticalLow: number;   // lower critical value (for left/two)
  criticalHigh: number;  // upper critical value (for right/two)
  reject: boolean;
}

// ─── Compute χ² variance test ────────────────────────────────────────────────
function computeVarianceTest(
  s2: number,
  n: number,
  sigma02: number,
  tail: TailType,
  alpha: AlphaLevel
): TestResult {
  const df = n - 1;
  const chi2Stat = (df * s2) / sigma02;

  let pValue: number;
  let criticalLow: number;
  let criticalHigh: number;

  if (tail === "left") {
    pValue = chi2CDF(chi2Stat, df);
    criticalLow = 0;
    criticalHigh = chi2Quantile(alpha, df);
  } else if (tail === "right") {
    pValue = 1 - chi2CDF(chi2Stat, df);
    criticalLow = chi2Quantile(1 - alpha, df);
    criticalHigh = Infinity;
  } else {
    // two-sided: reject if chi2 < chi2_{alpha/2} OR chi2 > chi2_{1-alpha/2}
    const pLeft = chi2CDF(chi2Stat, df);
    const pRight = 1 - chi2CDF(chi2Stat, df);
    pValue = 2 * Math.min(pLeft, pRight);
    criticalLow = chi2Quantile(alpha / 2, df);
    criticalHigh = chi2Quantile(1 - alpha / 2, df);
  }

  const reject =
    tail === "left"
      ? chi2Stat < criticalHigh
      : tail === "right"
      ? chi2Stat > criticalLow
      : chi2Stat < criticalLow || chi2Stat > criticalHigh;

  return {
    chi2Stat,
    df,
    pValue: Math.max(0, Math.min(1, pValue)),
    criticalLow,
    criticalHigh,
    reject,
  };
}

// ─── SVG helpers ─────────────────────────────────────────────────────────────
function buildChi2Curve(xMin: number, xMax: number, df: number, pdfPeak: number): string {
  const steps = 300;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    const y = chi2PDF(x, df);
    const sx = PX + ((x - xMin) / (xMax - xMin)) * PLOT_W;
    const sy = SVG_H - PY - (y / pdfPeak) * PLOT_H * 0.88;
    pts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(2)},${sy.toFixed(2)}`);
  }
  return pts.join(" ");
}

function buildChi2Area(
  xMin: number,
  xMax: number,
  areaMin: number,
  areaMax: number,
  df: number,
  pdfPeak: number
): string {
  const clampedMin = Math.max(areaMin, xMin);
  const clampedMax = Math.min(areaMax, xMax);
  if (clampedMin >= clampedMax) return "";
  const toSX = (x: number) => PX + ((x - xMin) / (xMax - xMin)) * PLOT_W;
  const toSY = (y: number) => SVG_H - PY - (y / pdfPeak) * PLOT_H * 0.88;
  const baseline = SVG_H - PY;
  const steps = 200;
  const pts: string[] = [`M${toSX(clampedMin).toFixed(2)},${baseline}`];
  for (let i = 0; i <= steps; i++) {
    const x = clampedMin + (i / steps) * (clampedMax - clampedMin);
    const y = chi2PDF(x, df);
    pts.push(`L${toSX(x).toFixed(2)},${toSY(y).toFixed(2)}`);
  }
  pts.push(`L${toSX(clampedMax).toFixed(2)},${baseline}`, "Z");
  return pts.join(" ");
}

// ─── Numeric input component ─────────────────────────────────────────────────
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
      <label className="block text-[12px] font-semibold text-[var(--ink)]">{label}</label>
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
        {unit && (
          <span className="text-[11px] text-[var(--ink-soft)] whitespace-nowrap">{unit}</span>
        )}
      </div>
    </div>
  );
}

// ─── Slider component ─────────────────────────────────────────────────────────
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  fmt?: (v: number) => string;
  color?: string;
}

function Slider({ label, value, min, max, step, onChange, fmt, color }: SliderProps) {
  const display = fmt ? fmt(value) : String(value);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-[var(--ink)]">{label}</span>
        <span
          className="rounded px-2 py-0.5 text-[12px] font-mono font-bold"
          style={{ background: (color ?? ACCENT) + "22", color: color ?? ACCENT }}
        >
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
        style={{ accentColor: color ?? ACCENT }}
      />
    </div>
  );
}

// ─── Distribution SVG ─────────────────────────────────────────────────────────
interface DistSVGProps {
  result: TestResult;
  tail: TailType;
}

function DistSVG({ result, tail }: DistSVGProps) {
  const { chi2Stat, df, criticalLow, criticalHigh } = result;

  // Determine plot range: χ²(df), mode = max(df-2, 0)
  const mode = Math.max(df - 2, 0.1);
  const xMax = Math.max(chi2Quantile(0.999, df), chi2Stat * 1.1, criticalHigh * 1.1, 2);
  const xMin = 0;

  // PDF peak for scaling (at mode)
  const pdfPeak = chi2PDF(mode, df);
  const safePeak = pdfPeak > 0 ? pdfPeak : 1;

  const toSX = (x: number) =>
    PX + ((Math.max(xMin, Math.min(xMax, x)) - xMin) / (xMax - xMin)) * PLOT_W;
  const toSY = (y: number) => SVG_H - PY - (y / safePeak) * PLOT_H * 0.88;
  const baseline = SVG_H - PY;

  const curvePath = buildChi2Curve(xMin, xMax, df, safePeak);

  // Rejection areas
  const rejLeftPath =
    tail === "left" || tail === "two"
      ? buildChi2Area(xMin, xMax, xMin, criticalLow, df, safePeak)
      : "";
  const rejRightPath =
    tail === "right" || tail === "two"
      ? buildChi2Area(xMin, xMax, criticalHigh, xMax, df, safePeak)
      : "";

  // Stat marker position
  const statSX = toSX(chi2Stat);
  const statSY = toSY(chi2PDF(Math.max(0.01, Math.min(xMax, chi2Stat)), df));
  const statColor = result.reject ? RED : ACCENT;

  // X-axis tick marks (evenly spaced, avoid clutter)
  const tickStep = df <= 10 ? 2 : df <= 30 ? 5 : df <= 60 ? 10 : 20;
  const ticks: number[] = [];
  for (let v = 0; v <= xMax; v += tickStep) ticks.push(v);

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full rounded-lg border border-[var(--line)]"
    >
      {/* Background */}
      <rect x={PX} y={PY} width={PLOT_W} height={PLOT_H} fill="#fafbfd" stroke={GRAY_LINE} />

      {/* X-axis ticks */}
      {ticks.map((v) => {
        const sx = toSX(v);
        if (sx < PX || sx > PX + PLOT_W) return null;
        return (
          <g key={v}>
            <line x1={sx} y1={baseline} x2={sx} y2={baseline + 3} stroke="#aab" />
            <text x={sx} y={baseline + 12} fontSize="8" textAnchor="middle" fill="#8a94a6">
              {v}
            </text>
          </g>
        );
      })}

      {/* Rejection areas */}
      {rejLeftPath && <path d={rejLeftPath} fill={RED} opacity={0.2} />}
      {rejRightPath && <path d={rejRightPath} fill={RED} opacity={0.2} />}

      {/* Distribution curve */}
      <path d={curvePath} fill="none" stroke={ACCENT} strokeWidth="2" />

      {/* Critical value lines */}
      {(tail === "left" || tail === "two") && isFinite(criticalLow) && criticalLow > 0 && (
        <>
          <line
            x1={toSX(criticalLow)}
            y1={PY}
            x2={toSX(criticalLow)}
            y2={baseline}
            stroke={RED}
            strokeDasharray="4 3"
            strokeWidth="1.4"
          />
          <text
            x={toSX(criticalLow) - 4}
            y={PY + 14}
            fontSize="8"
            textAnchor="end"
            fill={RED}
            fontWeight="bold"
          >
            χ²α/2={criticalLow.toFixed(3)}
          </text>
        </>
      )}
      {(tail === "right" || tail === "two") && isFinite(criticalHigh) && (
        <>
          <line
            x1={toSX(criticalHigh)}
            y1={PY}
            x2={toSX(criticalHigh)}
            y2={baseline}
            stroke={RED}
            strokeDasharray="4 3"
            strokeWidth="1.4"
          />
          <text
            x={toSX(criticalHigh) + 4}
            y={PY + 14}
            fontSize="8"
            textAnchor="start"
            fill={RED}
            fontWeight="bold"
          >
            χ²1-α{tail === "two" ? "/2" : ""}={criticalHigh.toFixed(3)}
          </text>
        </>
      )}

      {/* Test statistic marker */}
      {isFinite(chi2Stat) && chi2Stat >= 0 && statSX >= PX && statSX <= PX + PLOT_W && (
        <>
          <line
            x1={statSX}
            y1={PY}
            x2={statSX}
            y2={baseline}
            stroke={statColor}
            strokeWidth="2.2"
          />
          <circle cx={statSX} cy={statSY} r="4.5" fill={statColor} />
          {/* Triangle marker */}
          <polygon
            points={`${statSX},${baseline - 6} ${statSX - 5},${baseline + 4} ${statSX + 5},${baseline + 4}`}
            fill={statColor}
          />
          <text
            x={Math.min(Math.max(statSX, PX + 20), PX + PLOT_W - 20)}
            y={PY + 24}
            fontSize="9"
            textAnchor="middle"
            fill={statColor}
            fontWeight="bold"
          >
            χ²={chi2Stat.toFixed(3)}
          </text>
        </>
      )}

      {/* Rejection region labels */}
      {(tail === "left" || tail === "two") && rejLeftPath && (
        <text x={PX + 6} y={PY + PLOT_H * 0.55} fontSize="8" fill={RED} opacity={0.9}>
          拒绝域
        </text>
      )}
      {(tail === "right" || tail === "two") && rejRightPath && (
        <text
          x={PX + PLOT_W - 6}
          y={PY + PLOT_H * 0.55}
          fontSize="8"
          textAnchor="end"
          fill={RED}
          opacity={0.9}
        >
          拒绝域
        </text>
      )}

      {/* Axis label */}
      <text
        x={PX + PLOT_W / 2}
        y={SVG_H - 1}
        fontSize="9"
        textAnchor="middle"
        fill="#8a94a6"
      >
        χ²({df}) 统计量
      </text>
    </svg>
  );
}

// ─── Derivation steps panel ───────────────────────────────────────────────────
interface DerivationProps {
  s2: number;
  n: number;
  sigma02: number;
  tail: TailType;
  alpha: AlphaLevel;
  result: TestResult;
}

function Derivation({ s2, n, sigma02, tail, alpha, result }: DerivationProps) {
  const [open, setOpen] = useState(false);
  const { df, chi2Stat, pValue, criticalLow, criticalHigh, reject } = result;

  const h1Label =
    tail === "left"
      ? "H₁: σ² < σ₀²"
      : tail === "right"
      ? "H₁: σ² > σ₀²"
      : "H₁: σ² ≠ σ₀²";

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
              H₀: σ² = σ₀² = {sigma02}{"　"}|{"　"}{h1Label}
            </div>
          </div>
          <div>
            <div className="font-semibold text-[var(--ink)] mb-1">Step 2：确认检验条件</div>
            <div className="font-mono bg-[var(--bg-muted)] rounded px-3 py-2">
              正态总体，方差待检验{"\n"}
              在 H₀ 下，统计量 χ² = (n−1)S²/σ₀² 服从 χ²(n−1){"\n"}
              自由度 df = n − 1 = {n} − 1 = {df}
            </div>
          </div>
          <div>
            <div className="font-semibold text-[var(--ink)] mb-1">Step 3：计算 χ² 统计量</div>
            <div className="font-mono bg-[var(--bg-muted)] rounded px-3 py-2">
              χ² = (n−1) × S² / σ₀²{"\n"}
              {"　　"}= {df} × {s2} / {sigma02}{"\n"}
              {"　　"}= {(df * s2).toFixed(4)} / {sigma02}{"\n"}
              {"　　"}= <span style={{ color: ACCENT, fontWeight: 700 }}>{chi2Stat.toFixed(4)}</span>
            </div>
          </div>
          <div>
            <div className="font-semibold text-[var(--ink)] mb-1">Step 4：确定临界值与拒绝域</div>
            <div className="font-mono bg-[var(--bg-muted)] rounded px-3 py-2">
              显著性水平 α = {alpha}，df = {df}{"\n"}
              {tail === "left" && (
                `拒绝域：χ² < χ²α(${df}) = ${criticalHigh.toFixed(4)}（左尾）`
              )}
              {tail === "right" && (
                `拒绝域：χ² > χ²1-α(${df}) = ${criticalLow.toFixed(4)}（右尾）`
              )}
              {tail === "two" && (
                `拒绝域：χ² < ${criticalLow.toFixed(4)} 或 χ² > ${criticalHigh.toFixed(4)}（双尾）`
              )}
            </div>
          </div>
          <div>
            <div className="font-semibold text-[var(--ink)] mb-1">Step 5：计算 p 值</div>
            <div className="font-mono bg-[var(--bg-muted)] rounded px-3 py-2">
              {tail === "left" && `p = P(χ²(${df}) ≤ ${chi2Stat.toFixed(4)}) = `}
              {tail === "right" && `p = P(χ²(${df}) ≥ ${chi2Stat.toFixed(4)}) = `}
              {tail === "two" && `p = 2 × min{P(χ²(${df}) ≤ χ²), P(χ²(${df}) ≥ χ²)} = `}
              <span style={{ color: ACCENT, fontWeight: 700 }}>{pValue.toFixed(4)}</span>
            </div>
          </div>
          <div>
            <div className="font-semibold text-[var(--ink)] mb-1">Step 6：作出结论</div>
            <div
              className="rounded px-3 py-2 font-semibold"
              style={{
                background: reject ? RED_LIGHT : GREEN_LIGHT,
                color: reject ? RED : GREEN,
              }}
            >
              {reject
                ? `p = ${pValue.toFixed(4)} < α = ${alpha}，拒绝 H₀，认为方差与 σ₀² 有显著差异`
                : `p = ${pValue.toFixed(4)} ≥ α = ${alpha}，不拒绝 H₀，无证据表明方差有显著变化`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VarianceTestExplorer() {
  // Parameter inputs
  const [s2, setS2] = useState(1.44);        // sample variance S²
  const [n, setN] = useState(16);             // sample size
  const [sigma02, setSigma02] = useState(1);  // hypothesized variance σ₀²
  const [tail, setTail] = useState<TailType>("two");
  const [alpha, setAlpha] = useState<AlphaLevel>(0.05);

  // Validation
  const valid = n >= 2 && s2 > 0 && sigma02 > 0;

  const result = valid ? computeVarianceTest(s2, n, sigma02, tail, alpha) : null;

  const tailOptions: { key: TailType; label: string; h1: string }[] = [
    { key: "left", label: "左尾", h1: "H₁: σ² < σ₀²" },
    { key: "two", label: "双尾", h1: "H₁: σ² ≠ σ₀²" },
    { key: "right", label: "右尾", h1: "H₁: σ² > σ₀²" },
  ];

  const alphaOptions: AlphaLevel[] = [0.01, 0.05, 0.1];

  // p-value bar display
  const pBarWidth = result ? Math.min(result.pValue, 1) * 100 : 0;
  const alphaPos = alpha * 100;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-[15px] font-bold text-[var(--ink)]">正态总体方差假设检验（χ² 检验）</h3>
        <p className="text-[12px] text-[var(--ink-soft)] mt-0.5">
          输入样本方差 S²、样本量 n、原假设方差 σ₀²，实时计算 χ² 统计量与检验结论。
        </p>
      </div>

      {/* Formula reminder */}
      <div className="rounded-lg bg-[var(--bg-muted)] px-3 py-2 text-[12px] text-[var(--ink-soft)]">
        <span className="font-semibold text-[var(--ink)]">统计量：</span>
        <span className="font-mono ml-1">χ² = (n−1)S² / σ₀²</span>
        <span className="ml-2 text-[11px]">在 H₀ 下服从 χ²(n−1)</span>
      </div>

      {/* Parameter inputs */}
      <div className="rounded-lg bg-[var(--bg-muted)] p-3 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <NumInput
            label="样本方差 S²"
            value={s2}
            min={0.001}
            max={100}
            step={0.01}
            onChange={setS2}
          />
          <NumInput
            label="假设方差 σ₀²"
            value={sigma02}
            min={0.001}
            max={100}
            step={0.01}
            onChange={setSigma02}
          />
          <NumInput
            label="样本量 n"
            value={n}
            min={2}
            max={500}
            step={1}
            onChange={setN}
          />
        </div>

        {/* Quick slider for S²/σ₀² ratio */}
        <Slider
          label="S²/σ₀² 比值（快速调整）"
          value={parseFloat((s2 / sigma02).toFixed(3))}
          min={0.05}
          max={10}
          step={0.05}
          onChange={(ratio) => setS2(parseFloat((ratio * sigma02).toFixed(4)))}
          fmt={(v) => `${v.toFixed(2)}x`}
        />
        <Slider
          label="样本量 n（快速调整）"
          value={n}
          min={2}
          max={100}
          step={1}
          onChange={setN}
          fmt={(v) => `n = ${v}, df = ${v - 1}`}
        />
      </div>

      {/* Test direction and alpha */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tail direction */}
        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-[var(--ink)]">检验方向</div>
          <div className="flex flex-col gap-1">
            {tailOptions.map(({ key, label, h1 }) => (
              <button
                key={key}
                onClick={() => setTail(key)}
                className={`rounded-lg px-3 py-1.5 text-left text-[12px] font-medium transition-colors ${
                  tail === key
                    ? "text-white"
                    : "bg-white border border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
                }`}
                style={tail === key ? { background: ACCENT } : {}}
              >
                <span className="font-semibold">{label}</span>
                <span className="ml-2 font-mono text-[11px] opacity-80">{h1}</span>
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
                    : "bg-white border border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
                }`}
                style={alpha === a ? { background: ACCENT } : {}}
              >
                α = {a}
              </button>
            ))}
          </div>

          {/* Quick info */}
          <div className="rounded-md bg-[var(--bg-muted)] px-2 py-1.5 text-[11px] leading-snug text-[var(--ink-soft)]">
            <span className="font-semibold text-[var(--ink)]">当前参数</span>
            <br />
            S² / σ₀² = {sigma02 > 0 ? (s2 / sigma02).toFixed(3) : "—"}
            <br />
            df = n−1 = {n - 1}
            {result && (
              <>
                <br />
                χ² ={" "}
                <span className="font-bold" style={{ color: result.reject ? RED : ACCENT }}>
                  {result.chi2Stat.toFixed(4)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Distribution SVG */}
      {result && <DistSVG result={result} tail={tail} />}

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
              {result.reject ? "方差显著变化" : "方差无显著变化"}
            </span>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              {
                label: "χ² 统计量",
                val: result.chi2Stat.toFixed(4),
                color: result.reject ? RED : ACCENT,
              },
              {
                label: "p 值",
                val: result.pValue < 0.0001 ? "< 0.0001" : result.pValue.toFixed(4),
                color: result.pValue < alpha ? RED : GREEN,
              },
              {
                label:
                  tail === "left"
                    ? "左临界值 χ²α"
                    : tail === "right"
                    ? "右临界值 χ²1-α"
                    : "临界值（双）",
                val:
                  tail === "left"
                    ? result.criticalHigh.toFixed(4)
                    : tail === "right"
                    ? result.criticalLow.toFixed(4)
                    : `${result.criticalLow.toFixed(3)} / ${result.criticalHigh.toFixed(3)}`,
                color: RED,
              },
              {
                label: "自由度 df",
                val: String(result.df),
                color: ACCENT,
              },
            ].map(({ label, val, color }) => (
              <div key={label} className="rounded-lg bg-white bg-opacity-70 p-2 text-center">
                <div className="text-[10px] text-[var(--ink-soft)] leading-snug">{label}</div>
                <div
                  className="text-[13px] font-extrabold font-mono mt-0.5 break-all"
                  style={{ color }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>

          {/* Conclusion text */}
          <div
            className="text-[12px] leading-relaxed"
            style={{ color: result.reject ? RED : GREEN }}
          >
            {result.reject ? (
              <>
                在 α = {alpha} 水平下，p = {result.pValue.toFixed(4)} &lt; {alpha}，
                有统计上的显著证据拒绝 H₀，认为总体方差与 σ₀² = {sigma02} 有显著差异。
              </>
            ) : (
              <>
                在 α = {alpha} 水平下，p = {result.pValue.toFixed(4)} ≥ {alpha}，
                没有足够证据拒绝 H₀，无法认为总体方差与 σ₀² = {sigma02} 有显著差异。
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
            <span style={{ color: RED }}>α = {alpha}</span>
          </div>
          <div
            className="relative h-5 w-full rounded-full overflow-hidden"
            style={{ background: GREEN_LIGHT }}
          >
            {/* Alpha threshold line */}
            <div
              className="absolute top-0 h-full w-0.5"
              style={{ left: `${alphaPos}%`, background: RED, zIndex: 2 }}
            />
            {/* p value fill */}
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${pBarWidth}%`,
                background: result.reject ? RED : GREEN,
                opacity: 0.55,
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
          s2={s2}
          n={n}
          sigma02={sigma02}
          tail={tail}
          alpha={alpha}
          result={result}
        />
      )}

      {/* Preset examples */}
      <div className="space-y-1.5">
        <div className="text-[12px] font-semibold text-[var(--ink)]">典型场景快速加载</div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "方差增大（右尾）", s2: 2, n: 20, sigma02: 1, tail: "right" as TailType, desc: "S²=2, n=20, σ₀²=1" },
            { label: "方差缩小（左尾）", s2: 0.3, n: 16, sigma02: 1, tail: "left" as TailType, desc: "S²=0.3, n=16, σ₀²=1" },
            { label: "双侧检验（无差异）", s2: 1.1, n: 30, sigma02: 1, tail: "two" as TailType, desc: "S²=1.1, n=30, σ₀²=1" },
            { label: "小样本强信号", s2: 5, n: 8, sigma02: 1, tail: "two" as TailType, desc: "S²=5, n=8, σ₀²=1" },
          ].map(({ label, s2: ps2, n: pn, sigma02: psg, tail: ptail, desc }) => (
            <button
              key={label}
              onClick={() => {
                setS2(ps2);
                setN(pn);
                setSigma02(psg);
                setTail(ptail);
              }}
              className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-2.5 py-1.5 text-left text-[11px] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors"
            >
              <div className="font-semibold">{label}</div>
              <div className="opacity-70 font-mono">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Educational insight */}
      <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2.5 text-[12px] text-[var(--ink-soft)] leading-relaxed">
        <span className="font-semibold text-[var(--ink)]">核心思想：</span>
        方差检验的关键是统计量{" "}
        <span className="font-mono text-[var(--ink)]">χ² = (n−1)S²/σ₀²</span>{" "}
        在 H₀ 为真时服从 χ² 分布。χ² 分布是非负的、右偏分布，均值为 df，方差为 2·df。
        当 S² 比 σ₀² 大得多时，χ² 值会落入右侧拒绝域；比 σ₀² 小得多时落入左侧。
        增大样本量 n 使分布更集中（均值不变，但峰更尖），临界值之间差距缩小，检验功效提升。
      </div>
    </div>
  );
}
