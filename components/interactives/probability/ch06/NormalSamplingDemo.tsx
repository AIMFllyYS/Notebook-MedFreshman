"use client";

import { memo, useState } from "react";

// ─── 设计常量 ────────────────────────────────────────────────────
const ACCENT = "#5b46e5"; // 作为 color 传入并与 alpha 拼接（color + "22"/"18"），保留 hex
const ACCENT_LIGHT = "var(--accent-weak)";
const GREEN = "#0f766e";
const GREEN_LIGHT = "#0f766e33"; // 半透明绿，深浅色皆可读
const ORANGE = "#c2410c";
const ORANGE_LIGHT = "#c2410c2e"; // 半透明橙，深浅色皆可读
const ROSE = "#be123c";
const ROSE_LIGHT = "#be123c2e"; // 半透明玫红，深浅色皆可读
const GRAY_LINE = "var(--line)";

const N_SAMPLES = 5000;

// ─── 统计辅助函数 ────────────────────────────────────────────────

/** Box-Muller 变换生成标准正态随机数 */
function randNorm(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** 从 N(mu, sigma^2) 抽 n 个样本，返回 [xbar, s2] */
function drawSample(mu: number, sigma: number, n: number): [number, number] {
  let sum = 0;
  let sum2 = 0;
  for (let i = 0; i < n; i++) {
    const x = mu + sigma * randNorm();
    sum += x;
    sum2 += x * x;
  }
  const xbar = sum / n;
  const s2 = n > 1 ? (sum2 - n * xbar * xbar) / (n - 1) : 0;
  return [xbar, s2];
}

/** 正态 PDF：N(mu, sigma^2) */
function normalPDF(x: number, mu: number, sigma: number): number {
  if (sigma <= 0) return 0;
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

/** 卡方分布 PDF：χ²(k) */
function chi2PDF(x: number, k: number): number {
  if (x <= 0 || k <= 0) return 0;
  const halfK = k / 2;
  return (
    Math.pow(x, halfK - 1) *
    Math.exp(-x / 2) /
    (Math.pow(2, halfK) * gammaFunc(halfK))
  );
}

/** t 分布 PDF：t(nu)，精度足够用于可视化 */
function tPDF(x: number, nu: number): number {
  if (nu <= 0) return 0;
  const halfNuPlus1 = (nu + 1) / 2;
  const halfNu = nu / 2;
  return (
    gammaFunc(halfNuPlus1) /
    (Math.sqrt(nu * Math.PI) * gammaFunc(halfNu)) *
    Math.pow(1 + (x * x) / nu, -halfNuPlus1)
  );
}

/** Lanczos 近似 Gamma 函数 */
function gammaFunc(z: number): number {
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gammaFunc(1 - z));
  }
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  const zz = z - 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (zz + i);
  }
  const t = zz + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, zz + 0.5) * Math.exp(-t) * x;
}

/** 正态分布 CDF（近似） */
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const poly =
    t * (0.319381530 +
      t * (-0.356563782 +
        t * (1.781477937 +
          t * (-1.821255978 +
            t * 1.330274429))));
  const cdf = 1 - normalPDF(x, 0, 1) * poly;
  return x >= 0 ? cdf : 1 - cdf;
}

/** 卡方分布 CDF（正规化不完全 gamma，数值积分近似） */
function chi2CDF(x: number, k: number): number {
  if (x <= 0) return 0;
  return lowerIncompleteGamma(k / 2, x / 2) / gammaFunc(k / 2);
}

/** 下不完全 gamma 函数（级数展开） */
function lowerIncompleteGamma(a: number, x: number): number {
  if (x <= 0) return 0;
  let sum = 0;
  let term = 1 / a;
  sum = term;
  for (let i = 1; i < 200; i++) {
    term *= x / (a + i);
    sum += term;
    if (Math.abs(term) < 1e-10) break;
  }
  return Math.exp(-x + a * Math.log(x)) * sum;
}

/** t 分布 CDF */
function tCDF(x: number, nu: number): number {
  // via incomplete beta
  const t2 = x * x;
  const ibeta = incompleteBeta(nu / (nu + t2), nu / 2, 0.5);
  const p = ibeta / 2;
  return x >= 0 ? 1 - p : p;
}

/** 正规化不完全 Beta（连分数） */
function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = gammaFunc(a) * gammaFunc(b) / gammaFunc(a + b);
  const factor = Math.pow(x, a) * Math.pow(1 - x, b) / (a * lbeta);
  // Lentz 连分数
  let h = 1;
  let f = 1;
  let C = 1;
  let D = 1 - (a + b) * x / (a + 1);
  if (Math.abs(D) < 1e-30) D = 1e-30;
  D = 1 / D;
  f = D;
  for (let m = 1; m <= 100; m++) {
    const m2 = 2 * m;
    let d = m * (b - m) * x / ((a + m2 - 1) * (a + m2));
    D = 1 + d * D;
    if (Math.abs(D) < 1e-30) D = 1e-30;
    C = 1 + d / C;
    if (Math.abs(C) < 1e-30) C = 1e-30;
    D = 1 / D;
    h = D * C;
    f *= h;
    d = -(a + m) * (a + b + m) * x / ((a + m2) * (a + m2 + 1));
    D = 1 + d * D;
    if (Math.abs(D) < 1e-30) D = 1e-30;
    C = 1 + d / C;
    if (Math.abs(C) < 1e-30) C = 1e-30;
    D = 1 / D;
    h = D * C;
    f *= h;
    if (Math.abs(h - 1) < 1e-7) break;
  }
  return factor * f;
}

/** Kolmogorov–Smirnov 检验 p 值（近似公式）*/
function ksPValue(D: number, n: number): number {
  // Kolmogorov 分布近似 P(K ≤ t) ≈ 1 - 2 * sum_{k=1}^∞ (-1)^{k+1} exp(-2k²t²)
  const t = D * Math.sqrt(n);
  if (t < 0.27) return 1;
  let sum = 0;
  for (let k = 1; k <= 50; k++) {
    sum += Math.pow(-1, k + 1) * Math.exp(-2 * k * k * t * t);
  }
  const p = 2 * sum;
  return Math.max(0, Math.min(1, p));
}

/** 计算 KS 统计量 D（给定一组数据和理论 CDF）*/
function ksStatistic(sorted: number[], cdf: (x: number) => number): number {
  const n = sorted.length;
  let D = 0;
  for (let i = 0; i < n; i++) {
    const Fn = (i + 1) / n;
    const F = cdf(sorted[i]);
    D = Math.max(D, Math.abs(Fn - F));
  }
  return D;
}

// ─── 直方图数据计算 ────────────────────────────────────────────

interface HistBin {
  lo: number;
  hi: number;
  count: number;
}

function makeHistogram(data: number[], nBins: number, lo: number, hi: number): HistBin[] {
  const bins: HistBin[] = [];
  const step = (hi - lo) / nBins;
  for (let i = 0; i < nBins; i++) {
    bins.push({ lo: lo + i * step, hi: lo + (i + 1) * step, count: 0 });
  }
  for (const v of data) {
    const idx = Math.min(nBins - 1, Math.max(0, Math.floor((v - lo) / step)));
    bins[idx].count++;
  }
  return bins;
}

// ─── SVG 直方图子组件 ──────────────────────────────────────────

interface HistChartProps {
  title: string;
  subtitle: string;
  data: number[];
  nBins: number;
  xMin: number;
  xMax: number;
  color: string;
  colorLight: string;
  pdfFn: (x: number) => number;
  ksPValue: number;
  nSamples: number;
  xLabel?: string;
}

function HistChart({
  title,
  subtitle,
  data,
  nBins,
  xMin,
  xMax,
  color,
  colorLight,
  pdfFn,
  ksPValue: ksP,
  nSamples,
  xLabel,
}: HistChartProps) {
  const W = 280;
  const H = 140;
  const PAD = { top: 8, right: 8, bottom: 28, left: 30 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const bins = makeHistogram(data, nBins, xMin, xMax);
  const step = (xMax - xMin) / nBins;

  // 直方图高度（密度 = count / (n * step)）
  const densities = bins.map((b) => (nSamples > 0 ? b.count / (nSamples * step) : 0));

  // 理论 PDF 点
  const pdfPoints = 80;
  const pdfCurve: Array<[number, number]> = [];
  for (let i = 0; i <= pdfPoints; i++) {
    const x = xMin + (i / pdfPoints) * (xMax - xMin);
    pdfCurve.push([x, pdfFn(x)]);
  }

  // y 轴最大值（取直方图与PDF的较大者）
  const maxDensity = Math.max(
    ...densities,
    ...pdfCurve.map(([, y]) => y),
    0.01
  );

  const scaleX = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * innerW;
  const scaleY = (y: number) => PAD.top + (1 - y / maxDensity) * innerH;

  // X 轴刻度（最多 5 个）
  const xTicks: number[] = [];
  const xStep = (xMax - xMin) / 4;
  for (let i = 0; i <= 4; i++) {
    xTicks.push(xMin + i * xStep);
  }

  // PDF 路径
  const pdfPath = pdfCurve
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${scaleX(x).toFixed(1)},${scaleY(y).toFixed(1)}`)
    .join(" ");

  // K-S 颜色
  const ksColor = ksP >= 0.05 ? GREEN : ROSE;

  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] p-2">
      <div className="mb-1 px-1">
        <div className="text-[12px] font-bold" style={{ color }}>{title}</div>
        <div className="text-[10px] text-[var(--ink-soft)]">{subtitle}</div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 150 }}>
        {/* 背景 */}
        <rect
          x={PAD.left} y={PAD.top}
          width={innerW} height={innerH}
          fill="var(--bg-muted)" stroke={GRAY_LINE}
        />

        {/* 直方图柱 */}
        {bins.map((bin, i) => {
          const bx = scaleX(bin.lo);
          const bw = Math.max(1, scaleX(bin.hi) - scaleX(bin.lo) - 1);
          const by = scaleY(densities[i]);
          const bh = scaleY(0) - by;
          return (
            <rect
              key={i}
              x={bx}
              y={by}
              width={bw}
              height={Math.max(0, bh)}
              fill={colorLight}
              stroke={color}
              strokeWidth="0.5"
              opacity="0.8"
            />
          );
        })}

        {/* 理论 PDF 曲线 */}
        {nSamples > 0 && (
          <path
            d={pdfPath}
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        )}

        {/* X 轴 */}
        <line
          x1={PAD.left} y1={PAD.top + innerH}
          x2={PAD.left + innerW} y2={PAD.top + innerH}
          stroke="var(--line)" strokeWidth="1"
        />

        {/* X 轴刻度 */}
        {xTicks.map((v) => (
          <g key={v}>
            <line
              x1={scaleX(v)} y1={PAD.top + innerH}
              x2={scaleX(v)} y2={PAD.top + innerH + 3}
              stroke="var(--line)"
            />
            <text
              x={scaleX(v)} y={PAD.top + innerH + 10}
              textAnchor="middle" fontSize="8" fill="var(--ink-faint)"
            >
              {Math.abs(v) < 0.01 ? "0" : v.toFixed(1)}
            </text>
          </g>
        ))}

        {/* X 轴标签 */}
        {xLabel && (
          <text
            x={PAD.left + innerW / 2}
            y={H - 2}
            textAnchor="middle"
            fontSize="8"
            fill="var(--ink-faint)"
            fontStyle="italic"
          >
            {xLabel}
          </text>
        )}
      </svg>

      {/* K-S 检验结果 */}
      <div
        className="mt-1 rounded px-2 py-0.5 text-[10px] font-mono text-center"
        style={{
          background: ksP >= 0.05 ? GREEN_LIGHT : ROSE_LIGHT,
          color: ksColor,
        }}
      >
        K-S p值 = {nSamples > 0 ? ksP.toFixed(4) : "—"}
        {nSamples > 0 && (
          <span className="ml-1">
            {ksP >= 0.05 ? "[OK] 符合理论" : "[X] 偏离理论"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── 滑块子组件 ────────────────────────────────────────────────

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  color: string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step, display, color, onChange }: SliderRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-[12px] font-semibold text-[var(--ink)] shrink-0">{label}</span>
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
        className="w-12 rounded-md px-1.5 py-0.5 text-center text-[12px] font-mono font-bold shrink-0"
        style={{ background: color + "22", color }}
      >
        {display}
      </span>
    </div>
  );
}

// ─── 主组件 ────────────────────────────────────────────────────

function NormalSamplingDemoBase() {
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [n, setN] = useState(10);

  // 抽样结果
  const [xbars, setXbars] = useState<number[]>([]);
  const [chi2Vals, setChi2Vals] = useState<number[]>([]);
  const [tVals, setTVals] = useState<number[]>([]);
  const [running, setRunning] = useState(false);

  // KS p 值
  const [ksXbar, setKsXbar] = useState(0);
  const [ksChi2, setKsChi2] = useState(0);
  const [ksT, setKsT] = useState(0);

  function runSampling() {
    setRunning(true);
    // 在下一个宏任务中执行（避免 UI 卡死）
    setTimeout(() => {
      const newXbars: number[] = [];
      const newChi2: number[] = [];
      const newT: number[] = [];

      for (let i = 0; i < N_SAMPLES; i++) {
        const [xbar, s2] = drawSample(mu, sigma, n);
        newXbars.push(xbar);
        // (n-1)S²/σ² ~ χ²(n-1)
        const chi2v = s2 > 0 ? ((n - 1) * s2) / (sigma * sigma) : 0;
        newChi2.push(chi2v);
        // t = (X̄ - μ) / (S / √n) ~ t(n-1)
        const tVal = s2 > 0 ? (xbar - mu) / (Math.sqrt(s2) / Math.sqrt(n)) : 0;
        newT.push(tVal);
      }

      // KS 统计量
      const sortedXbar = [...newXbars].sort((a, b) => a - b);
      const sortedChi2 = [...newChi2].sort((a, b) => a - b);
      const sortedT = [...newT].sort((a, b) => a - b);

      const sigmaXbar = sigma / Math.sqrt(n);
      const dXbar = ksStatistic(sortedXbar, (x) => normalCDF((x - mu) / sigmaXbar));
      const dChi2 = ksStatistic(sortedChi2, (x) => chi2CDF(x, n - 1));
      const dT = ksStatistic(sortedT, (x) => tCDF(x, n - 1));

      setXbars(newXbars);
      setChi2Vals(newChi2);
      setTVals(newT);
      setKsXbar(ksPValue(dXbar, N_SAMPLES));
      setKsChi2(ksPValue(dChi2, N_SAMPLES));
      setKsT(ksPValue(dT, N_SAMPLES));
      setRunning(false);
    }, 0);
  }

  function reset() {
    setXbars([]);
    setChi2Vals([]);
    setTVals([]);
    setKsXbar(0);
    setKsChi2(0);
    setKsT(0);
  }

  // 理论参数
  const sigmaXbar = sigma / Math.sqrt(n);
  const df = n - 1;

  // X̄ 直方图范围：[μ - 4σ_x̄, μ + 4σ_x̄]
  const xbarRange: [number, number] = [mu - 4 * sigmaXbar, mu + 4 * sigmaXbar];

  // χ² 范围：[0, df + 5√(2df)]
  const chi2Max = Math.max(df + 5 * Math.sqrt(2 * df), df * 3);
  const chi2Range: [number, number] = [0, chi2Max];

  // t 范围：[-5, 5]（t 分布尾重）
  const tRange: [number, number] = [-5, 5];

  const hasData = xbars.length > 0;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4 space-y-4">
      {/* 标题 */}
      <div>
        <h3 className="text-[15px] font-bold text-[var(--ink)]">正态总体抽样分布仿真</h3>
        <p className="text-[12px] text-[var(--ink-soft)] mt-0.5 leading-relaxed">
          设定正态总体参数与样本量，重复抽样 {N_SAMPLES.toLocaleString()} 次，实证验证四大抽样定理。
          蓝色柱 = 模拟经验分布；曲线 = 理论概率密度；K-S 检验 p 值衡量吻合度。
        </p>
      </div>

      {/* 参数控制区 */}
      <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-3 space-y-3">
        <div className="text-[12px] font-semibold text-[var(--ink)] mb-2">
          总体设定：X ~ N(μ, σ²)
        </div>
        <SliderRow
          label="均值 μ"
          value={mu}
          min={-2}
          max={2}
          step={0.1}
          display={mu.toFixed(1)}
          color={ACCENT}
          onChange={(v) => { setMu(v); reset(); }}
        />
        <SliderRow
          label="标准差 σ"
          value={sigma}
          min={0.5}
          max={3}
          step={0.1}
          display={sigma.toFixed(1)}
          color={ORANGE}
          onChange={(v) => { setSigma(v); reset(); }}
        />
        <SliderRow
          label="样本量 n"
          value={n}
          min={2}
          max={30}
          step={1}
          display={String(n)}
          color={GREEN}
          onChange={(v) => { setN(v); reset(); }}
        />

        {/* 理论参数预告 */}
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          {[
            {
              label: "X̄ ~ N(μ, σ²/n)",
              val: `N(${mu.toFixed(1)}, ${(sigma * sigma / n).toFixed(3)})`,
              color: ACCENT,
            },
            {
              label: "(n−1)S²/σ² ~ χ²(n−1)",
              val: `χ²(${df})`,
              color: ORANGE,
            },
            {
              label: "t = (X̄−μ)/(S/√n)",
              val: `t(${df})`,
              color: GREEN,
            },
          ].map(({ label, val, color }) => (
            <div
              key={label}
              className="rounded-md p-2"
              style={{ background: color + "18" }}
            >
              <div className="text-[9px] text-[var(--ink-soft)] leading-tight">{label}</div>
              <div className="text-[11px] font-bold font-mono mt-0.5" style={{ color }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={runSampling}
          disabled={running}
          className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-opacity"
          style={{
            background: ACCENT,
            opacity: running ? 0.6 : 1,
            cursor: running ? "not-allowed" : "pointer",
          }}
        >
          {running ? "仿真中…" : `▶ 重复抽样 ${N_SAMPLES.toLocaleString()} 次`}
        </button>
        <button
          onClick={reset}
          className="rounded-lg bg-[var(--bg-muted)] px-3 py-2 text-[13px] font-medium text-[var(--ink-soft)] hover:bg-[var(--line)]"
        >
          重置
        </button>
        {hasData && (
          <span className="text-[12px] text-[var(--ink-soft)] ml-auto">
            已完成 {N_SAMPLES.toLocaleString()} 次抽样，每次 n = {n} 个观测
          </span>
        )}
      </div>

      {/* 四图区域（2+1布局） */}
      {!hasData ? (
        <div
          className="rounded-lg border-2 border-dashed py-12 text-center text-[13px] text-[var(--ink-soft)]"
          style={{ borderColor: GRAY_LINE }}
        >
          点击「重复抽样」按钮，开始仿真验证四大抽样定理
        </div>
      ) : (
        <div className="space-y-3">
          {/* 上排：X̄ + χ² */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <HistChart
              title="样本均值 X̄"
              subtitle={`理论分布：N(μ, σ²/n) = N(${mu.toFixed(2)}, ${(sigma * sigma / n).toFixed(3)})`}
              data={xbars}
              nBins={40}
              xMin={xbarRange[0]}
              xMax={xbarRange[1]}
              color={ACCENT}
              colorLight={ACCENT_LIGHT}
              pdfFn={(x) => normalPDF(x, mu, sigmaXbar)}
              ksPValue={ksXbar}
              nSamples={N_SAMPLES}
              xLabel="x̄"
            />

            <HistChart
              title="卡方统计量 (n−1)S²/σ²"
              subtitle={`理论分布：χ²(n−1) = χ²(${df})`}
              data={chi2Vals}
              nBins={40}
              xMin={0}
              xMax={chi2Range[1]}
              color={ORANGE}
              colorLight={ORANGE_LIGHT}
              pdfFn={(x) => chi2PDF(x, df)}
              ksPValue={ksChi2}
              nSamples={N_SAMPLES}
              xLabel="(n−1)S²/σ²"
            />
          </div>

          {/* 下排：t统计量 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <HistChart
              title="t 统计量  (X̄ − μ) / (S/√n)"
              subtitle={`理论分布：t(n−1) = t(${df})（厚尾，比正态宽）`}
              data={tVals}
              nBins={40}
              xMin={tRange[0]}
              xMax={tRange[1]}
              color={GREEN}
              colorLight={GREEN_LIGHT}
              pdfFn={(x) => tPDF(x, df)}
              ksPValue={ksT}
              nSamples={N_SAMPLES}
              xLabel="t"
            />

            {/* 综合 K-S 汇总卡片 */}
            <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3 flex flex-col justify-between">
              <div>
                <div className="text-[13px] font-bold text-[var(--ink)] mb-1">K-S 检验汇总</div>
                <p className="text-[11px] text-[var(--ink-soft)] leading-relaxed mb-3">
                  K-S 检验零假设：样本来自指定理论分布。
                  p值 &gt; 0.05 表示无统计显著偏差，即<b className="text-[var(--ink)]">实证与理论高度吻合</b>。
                </p>
                <div className="space-y-2">
                  {[
                    { label: "X̄ vs N(μ, σ²/n)", p: ksXbar, color: ACCENT },
                    { label: "(n−1)S²/σ² vs χ²(n−1)", p: ksChi2, color: ORANGE },
                    { label: "t vs t(n−1)", p: ksT, color: GREEN },
                  ].map(({ label, p, color }) => {
                    const pass = p >= 0.05;
                    return (
                      <div key={label} className="rounded-md bg-[var(--bg-elevated)] border border-[var(--line)] px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold" style={{ color }}>{label}</span>
                          <span
                            className="text-[11px] font-mono font-bold"
                            style={{ color: pass ? GREEN : ROSE }}
                          >
                            p = {p.toFixed(4)}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full overflow-hidden bg-[var(--bg-muted)]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, p * 100 / 0.1)}%`,
                              background: pass ? GREEN : ROSE,
                            }}
                          />
                        </div>
                        <div className="mt-0.5 text-[9px]" style={{ color: pass ? GREEN : ROSE }}>
                          {pass ? "[OK] 不拒绝 H₀（吻合理论）" : "[X] 拒绝 H₀（n 太小时属正常）"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 核心结论 */}
              <div
                className="mt-3 rounded-lg p-2.5 text-[11px] leading-relaxed"
                style={{ background: ACCENT_LIGHT, color: ACCENT }}
              >
                <div className="font-bold mb-1">三大定理验证结论</div>
                <div>① X̄ 服从正态分布 N(μ, σ²/n)—— 期望/方差缩放 √n 倍</div>
                <div>② (n−1)S²/σ² 独立于 X̄，服从 χ²(n−1)</div>
                <div>③ t 统计量服从 t(n−1)，比标准正态有更厚的尾部</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 知识提示 */}
      <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2.5 text-[11px] text-[var(--ink-soft)] leading-relaxed">
        <span className="font-semibold text-[var(--ink)]">教学要点：</span>
        增大 n 时，X̄ 的分布向均值 μ 收缩（方差 σ²/n → 0），t 分布趋近于标准正态；
        σ 越大，所有统计量的离散程度越大，但 K-S 检验仍验证理论形状正确。
        这三个统计量是区间估计与假设检验的基础构建块。
      </div>
    </div>
  );
}

export default memo(NormalSamplingDemoBase);
