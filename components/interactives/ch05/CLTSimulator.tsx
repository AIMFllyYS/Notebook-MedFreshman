"use client";

import { memo, useState, useCallback } from "react";

// ─── 设计常量 ──────────────────────────────────────────────────
const ACCENT = "#5b46e5";
const ACCENT_LIGHT = "#ede9fe";
const GREEN = "#0f766e";
const GREEN_LIGHT = "#d1fae5";
const ORANGE = "#ea580c";
const GRAY_LINE = "#e9ebf2";

// ─── SVG 尺寸 ──────────────────────────────────────────────────
const SVG_W = 520;
const SVG_H = 220;
const PAD_L = 46;
const PAD_R = 14;
const PAD_T = 14;
const PAD_B = 32;
const CHART_W = SVG_W - PAD_L - PAD_R;
const CHART_H = SVG_H - PAD_T - PAD_B;

// ─── 分布类型 ──────────────────────────────────────────────────
type DistType = "uniform" | "exponential" | "poisson" | "binomial";

interface DistInfo {
  name: string;
  shortName: string;
  mean: number;
  variance: number;
  /** 采样一个随机变量 */
  sample: () => number;
}

function getDistInfo(dist: DistType): DistInfo {
  if (dist === "uniform") {
    // Uniform[0, 1]: mean=0.5, var=1/12
    return {
      name: "均匀分布 U(0,1)",
      shortName: "均匀",
      mean: 0.5,
      variance: 1 / 12,
      sample: () => Math.random(),
    };
  }
  if (dist === "exponential") {
    // Exp(λ=1): mean=1, var=1
    return {
      name: "指数分布 Exp(1)",
      shortName: "指数",
      mean: 1,
      variance: 1,
      sample: () => -Math.log(1 - Math.random()),
    };
  }
  if (dist === "poisson") {
    // Poisson(λ=2): mean=2, var=2
    const lambda = 2;
    return {
      name: "泊松分布 P(λ=2)",
      shortName: "泊松",
      mean: lambda,
      variance: lambda,
      sample: () => {
        // Knuth 算法
        let L = Math.exp(-lambda);
        let k = 0;
        let p = 1;
        do {
          k++;
          p *= Math.random();
        } while (p > L);
        return k - 1;
      },
    };
  }
  // binomial: B(n=10, p=0.3): mean=3, var=2.1
  const bn = 10;
  const bp = 0.3;
  return {
    name: "二项分布 B(10,0.3)",
    shortName: "二项",
    mean: bn * bp,
    variance: bn * bp * (1 - bp),
    sample: () => {
      let s = 0;
      for (let i = 0; i < bn; i++) {
        if (Math.random() < bp) s++;
      }
      return s;
    },
  };
}

// ─── 正态 PDF N(0,1) ───────────────────────────────────────────
function normalPDF(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

// ─── K-S 检验统计量（与 N(0,1) 比较） ─────────────────────────
function normalCDF(z: number): number {
  // 近似公式
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly =
    t * (0.319381530 +
      t * (-0.356563782 +
        t * (1.781477937 +
          t * (-1.821255978 + t * 1.330274429))));
  const cdf = 1 - normalPDF(Math.abs(z)) * poly;
  return z >= 0 ? cdf : 1 - cdf;
}

function computeKS(sortedZ: number[]): number {
  const n = sortedZ.length;
  if (n === 0) return 0;
  let maxD = 0;
  for (let i = 0; i < n; i++) {
    const empirical = (i + 1) / n;
    const theory = normalCDF(sortedZ[i]);
    const d = Math.abs(empirical - theory);
    const d2 = Math.abs(empirical - 1 / n - theory);
    if (d > maxD) maxD = d;
    if (d2 > maxD) maxD = d2;
  }
  return maxD;
}

// ─── 直方图 bin 计算 ─────────────────────────────────────────
interface HistBin {
  z: number;      // bin 中心
  left: number;   // bin 左边界
  right: number;  // bin 右边界
  count: number;
  density: number; // count / (n * binWidth)
}

function buildHistogram(values: number[], binCount: number): HistBin[] {
  const zMin = -4;
  const zMax = 4;
  const binWidth = (zMax - zMin) / binCount;
  const bins: HistBin[] = Array.from({ length: binCount }, (_, i) => {
    const left = zMin + i * binWidth;
    const right = left + binWidth;
    return { z: left + binWidth / 2, left, right, count: 0, density: 0 };
  });
  for (const v of values) {
    const idx = Math.floor((v - zMin) / binWidth);
    if (idx >= 0 && idx < binCount) {
      bins[idx].count++;
    }
  }
  const total = values.length;
  for (const bin of bins) {
    bin.density = total > 0 ? bin.count / (total * binWidth) : 0;
  }
  return bins;
}

// ─── 坐标映射 ─────────────────────────────────────────────────
function xChart(z: number): number {
  // z ∈ [-4, 4] → [PAD_L, PAD_L + CHART_W]
  return PAD_L + ((z + 4) / 8) * CHART_W;
}

function yChart(density: number, maxDensity: number): number {
  return PAD_T + CHART_H - (density / maxDensity) * CHART_H;
}

// ─── 滑块子组件 ───────────────────────────────────────────────
interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  fmt: (v: number) => string;
  onChange: (v: number) => void;
  color?: string;
}

function SliderRow({ label, value, min, max, step, fmt, onChange, color }: SliderRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-[12px] font-semibold text-[var(--ink)]">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 cursor-pointer"
        style={{ accentColor: color ?? ACCENT }}
      />
      <span
        className="w-12 shrink-0 rounded-md px-2 py-0.5 text-center text-[12px] font-mono font-bold"
        style={{ background: (color ?? ACCENT) + "22", color: color ?? ACCENT }}
      >
        {fmt(value)}
      </span>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────
function CLTSimulatorBase() {
  const [dist, setDist] = useState<DistType>("uniform");
  const [sampleSize, setSampleSize] = useState(5); // n: 每组样本量

  // 模拟结果
  const [zValues, setZValues] = useState<number[]>([]);
  const [ksValue, setKsValue] = useState<number | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [groupCount, setGroupCount] = useState(0);

  const NUM_GROUPS = 10000;
  const BIN_COUNT = 40;

  const distInfo = getDistInfo(dist);

  // ─── 模拟 ─────────────────────────────────────────────────
  const handleSimulate = useCallback(() => {
    const info = getDistInfo(dist);
    const mu = info.mean;
    const sigma = Math.sqrt(info.variance);
    const sqrtN = Math.sqrt(sampleSize);

    const zArr: number[] = new Array(NUM_GROUPS);
    for (let g = 0; g < NUM_GROUPS; g++) {
      let sum = 0;
      for (let i = 0; i < sampleSize; i++) {
        sum += info.sample();
      }
      const xbar = sum / sampleSize;
      // 标准化: Z = (X̄ - μ) / (σ/√n)
      zArr[g] = (xbar - mu) / (sigma / sqrtN);
    }

    // K-S 统计量
    const sorted = zArr.slice().sort((a, b) => a - b);
    const ks = computeKS(sorted);

    setZValues(zArr);
    setKsValue(ks);
    setIsSimulated(true);
    setGroupCount(NUM_GROUPS);
  }, [dist, sampleSize]);

  // ─── 直方图数据 ─────────────────────────────────────────
  const bins = isSimulated && zValues.length > 0
    ? buildHistogram(zValues, BIN_COUNT)
    : buildHistogram([], BIN_COUNT);

  // 最大密度用于 y 轴缩放（与理论 PDF 的峰值比较）
  const maxBinDensity = Math.max(...bins.map((b) => b.density), 0.001);
  const maxPDFDensity = normalPDF(0); // ≈ 0.3989
  const maxDensity = Math.max(maxBinDensity, maxPDFDensity) * 1.1;

  // 理论曲线采样点
  const pdfPoints: [number, number][] = [];
  for (let i = 0; i <= 100; i++) {
    const z = -4 + (8 * i) / 100;
    pdfPoints.push([xChart(z), yChart(normalPDF(z), maxDensity)]);
  }

  const pdfPath = pdfPoints
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  // X 轴刻度
  const xTicks = [-3, -2, -1, 0, 1, 2, 3];

  // K-S 解释
  const ksColor = ksValue === null
    ? ACCENT
    : ksValue < 0.01
      ? GREEN
      : ksValue < 0.03
        ? "#ca8a04"
        : ORANGE;
  const ksLabel = ksValue === null
    ? "—"
    : ksValue < 0.01
      ? "极好 ✓"
      : ksValue < 0.03
        ? "良好"
        : "尚可";

  // n≥30 提示颜色
  const nLabelColor = sampleSize >= 30 ? GREEN : sampleSize >= 10 ? "#ca8a04" : ORANGE;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-5">
      {/* 标题 */}
      <div>
        <h3 className="text-[15px] font-bold text-[var(--ink)]">中心极限定理模拟实验室</h3>
        <p className="text-[12px] text-[var(--ink-soft)] mt-0.5">
          任选底层分布，调整样本量 n，模拟 10000 组后观察标准化样本均值收敛到 N(0,1)。
        </p>
      </div>

      {/* 控制面板 */}
      <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-3 space-y-3">
        {/* 分布选择 */}
        <div className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-[12px] font-semibold text-[var(--ink)]">底层分布</span>
          <div className="flex flex-wrap gap-1.5">
            {(["uniform", "exponential", "poisson", "binomial"] as DistType[]).map((d) => {
              const info = getDistInfo(d);
              return (
                <button
                  key={d}
                  onClick={() => {
                    setDist(d);
                    setIsSimulated(false);
                    setZValues([]);
                    setKsValue(null);
                  }}
                  className={
                    "rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors " +
                    (d === dist
                      ? "bg-[var(--accent)] text-white"
                      : "bg-white border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--accent)]")
                  }
                >
                  {info.shortName}
                </button>
              );
            })}
          </div>
        </div>

        {/* 分布信息小字 */}
        <div className="text-[11px] text-[var(--ink-soft)] pl-1">
          {distInfo.name}
          <span className="ml-3">μ = {distInfo.mean.toFixed(4)}</span>
          <span className="ml-3">σ² = {distInfo.variance.toFixed(4)}</span>
          <span className="ml-3">σ = {Math.sqrt(distInfo.variance).toFixed(4)}</span>
        </div>

        {/* n 滑块 */}
        <SliderRow
          label="样本量 n"
          value={sampleSize}
          min={1}
          max={50}
          step={1}
          fmt={(v) => String(v)}
          onChange={(v) => {
            setSampleSize(v);
            setIsSimulated(false);
            setZValues([]);
            setKsValue(null);
          }}
          color={ACCENT}
        />

        {/* n 含义提示 */}
        <div
          className="text-[11px] font-medium px-1 transition-colors"
          style={{ color: nLabelColor }}
        >
          {sampleSize < 10
            ? `n=${sampleSize}：样本量太小，近似效果差；建议 n ≥ 30`
            : sampleSize < 30
              ? `n=${sampleSize}：接近正态，但仍有偏差；n ≥ 30 通常已足够`
              : `n=${sampleSize} ≥ 30：CLT 近似效果很好`}
        </div>

        {/* 模拟按钮 */}
        <button
          onClick={handleSimulate}
          className="w-full rounded-lg bg-[var(--accent)] py-1.5 text-[13px] font-bold text-white hover:opacity-90 transition-opacity"
        >
          模拟 10000 组，计算标准化 X̄ₙ
        </button>
      </div>

      {/* 标准化说明 */}
      <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-2.5 text-[12px] text-[var(--ink-soft)] leading-relaxed">
        <span className="font-semibold text-[var(--ink)]">标准化公式：</span>
        <span className="font-mono ml-1">
          Z = (X̄ₙ − μ) / (σ / √n)
          {" = "}(X̄ₙ − {distInfo.mean.toFixed(3)}) / ({Math.sqrt(distInfo.variance).toFixed(3)} / √{sampleSize})
        </span>
        <span className="ml-2 text-[11px]">
          → 分母 σ/√n = {(Math.sqrt(distInfo.variance) / Math.sqrt(sampleSize)).toFixed(4)}
        </span>
      </div>

      {/* 直方图 + N(0,1) 曲线 */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[var(--ink)]">
            标准化 Z 的直方图
            {isSimulated && (
              <span className="ml-2 font-normal text-[var(--ink-soft)]">
                （{groupCount.toLocaleString()} 组 × n={sampleSize}）
              </span>
            )}
          </span>
          {isSimulated && ksValue !== null && (
            <span className="text-[11px] rounded-md px-2 py-0.5 font-mono font-bold"
              style={{ background: ksColor + "22", color: ksColor }}>
              K-S = {ksValue.toFixed(4)} {ksLabel}
            </span>
          )}
        </div>

        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full rounded-lg border border-[var(--line)]"
          style={{ background: "#fafbfd" }}
        >
          {/* 网格线 */}
          {[0.1, 0.2, 0.3, 0.4].map((v) => {
            const yy = yChart(v, maxDensity);
            if (yy < PAD_T || yy > PAD_T + CHART_H) return null;
            return (
              <g key={v}>
                <line
                  x1={PAD_L}
                  y1={yy}
                  x2={SVG_W - PAD_R}
                  y2={yy}
                  stroke={GRAY_LINE}
                  strokeWidth={1}
                />
                <text x={PAD_L - 4} y={yy + 3} fontSize="9" textAnchor="end" fill="#8a94a6">
                  {v.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* 直方图柱 */}
          {isSimulated &&
            bins.map((bin, i) => {
              const x1 = xChart(bin.left);
              const x2 = xChart(bin.right);
              const barW = Math.max(x2 - x1 - 1, 1);
              const barH = (bin.density / maxDensity) * CHART_H;
              const yTop = PAD_T + CHART_H - barH;
              return (
                <rect
                  key={i}
                  x={x1}
                  y={yTop}
                  width={barW}
                  height={barH}
                  fill={ACCENT}
                  opacity={0.55}
                  rx={0.5}
                />
              );
            })}

          {/* 理论 N(0,1) 曲线 */}
          <path
            d={pdfPath}
            fill="none"
            stroke={GREEN}
            strokeWidth={2}
            opacity={0.9}
          />

          {/* x 轴 */}
          <line
            x1={PAD_L}
            y1={PAD_T + CHART_H}
            x2={SVG_W - PAD_R}
            y2={PAD_T + CHART_H}
            stroke="#d0d5e0"
            strokeWidth={1}
          />

          {/* y 轴 */}
          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={PAD_T + CHART_H}
            stroke="#d0d5e0"
            strokeWidth={1}
          />

          {/* x 轴刻度 */}
          {xTicks.map((z) => {
            const xx = xChart(z);
            return (
              <g key={z}>
                <line
                  x1={xx}
                  y1={PAD_T + CHART_H}
                  x2={xx}
                  y2={PAD_T + CHART_H + 4}
                  stroke="#b0b8cc"
                  strokeWidth={1}
                />
                <text
                  x={xx}
                  y={PAD_T + CHART_H + 12}
                  fontSize="9"
                  textAnchor="middle"
                  fill="#8a94a6"
                >
                  {z}
                </text>
              </g>
            );
          })}

          {/* z=0 垂直虚线 */}
          <line
            x1={xChart(0)}
            y1={PAD_T}
            x2={xChart(0)}
            y2={PAD_T + CHART_H}
            stroke="#5b46e5"
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.5}
          />

          {/* 无数据提示 */}
          {!isSimulated && (
            <text
              x={SVG_W / 2}
              y={SVG_H / 2 - 4}
              textAnchor="middle"
              fontSize="13"
              fill="#b0b8cc"
            >
              点击「模拟」开始实验
            </text>
          )}

          {/* Y 轴标签 */}
          <text
            x={PAD_L - 4}
            y={PAD_T - 4}
            fontSize="9"
            textAnchor="end"
            fill="#8a94a6"
          >
            密度
          </text>

          {/* X 轴标签 */}
          <text
            x={SVG_W - PAD_R}
            y={PAD_T + CHART_H + 24}
            fontSize="9"
            textAnchor="end"
            fill="#8a94a6"
          >
            Z
          </text>

          {/* 图例（曲线） */}
          <line
            x1={PAD_L + 8}
            y1={PAD_T + 10}
            x2={PAD_L + 28}
            y2={PAD_T + 10}
            stroke={GREEN}
            strokeWidth={2}
          />
          <text x={PAD_L + 32} y={PAD_T + 13} fontSize="9" fill={GREEN}>
            N(0,1) 理论曲线
          </text>

          {/* 图例（柱） */}
          <rect
            x={PAD_L + 120}
            y={PAD_T + 5}
            width={12}
            height={10}
            fill={ACCENT}
            opacity={0.55}
            rx={1}
          />
          <text x={PAD_L + 136} y={PAD_T + 13} fontSize="9" fill={ACCENT}>
            实验直方图
          </text>
        </svg>
      </div>

      {/* 统计信息卡片 */}
      {isSimulated && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            {
              label: "模拟组数",
              val: groupCount.toLocaleString(),
              bg: ACCENT_LIGHT,
              col: ACCENT,
            },
            {
              label: "每组样本量 n",
              val: String(sampleSize),
              bg: (sampleSize >= 30 ? GREEN_LIGHT : "#fef3c7"),
              col: (sampleSize >= 30 ? GREEN : "#b45309"),
            },
            {
              label: "σ/√n（理论标准误）",
              val: (Math.sqrt(distInfo.variance) / Math.sqrt(sampleSize)).toFixed(4),
              bg: "#f0f9ff",
              col: "#0369a1",
            },
            {
              label: "K-S 距离",
              val: ksValue !== null ? ksValue.toFixed(4) : "—",
              bg: ksValue !== null ? ksColor + "22" : ACCENT_LIGHT,
              col: ksColor,
            },
          ].map(({ label, val, bg, col }) => (
            <div
              key={label}
              className="rounded-lg p-2.5 text-center"
              style={{ background: bg }}
            >
              <div className="text-[10px] text-[var(--ink-soft)] leading-snug">{label}</div>
              <div
                className="text-[15px] font-extrabold font-mono mt-0.5"
                style={{ color: col }}
              >
                {val}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CLT 定理陈述 */}
      <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-3 text-[12px] leading-loose text-[var(--ink-soft)] space-y-1">
        <div className="font-semibold text-[13px] text-[var(--ink)]">中心极限定理（CLT）</div>
        <div className="font-mono text-[11px]">
          设 X₁, X₂, …, Xₙ 独立同分布，均值 μ，方差 σ²（有限）
        </div>
        <div className="font-mono text-[11px]">
          Z = (X̄ₙ − μ) / (σ/√n)
          <span className="ml-2 font-sans not-italic">→ N(0,1)（n → ∞）</span>
        </div>
        <div className="mt-1 text-[11px]">
          无论底层分布是什么形状（均匀、指数、泊松…），只要均值和方差有限，
          样本均值标准化后的分布就趋向标准正态分布。
          <span
            className="ml-1 font-semibold"
            style={{ color: sampleSize >= 30 ? GREEN : ORANGE }}
          >
            n ≥ 30 通常已足够接近正态。
          </span>
        </div>
      </div>

      {/* K-S 统计量解释 */}
      <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2.5 text-[12px] text-[var(--ink-soft)] leading-relaxed">
        <span className="font-semibold text-[var(--ink)]">K-S 统计量（Kolmogorov–Smirnov）：</span>
        衡量实验经验分布 Fₙ(z) 与理论正态 CDF Φ(z) 的最大偏差。
        值越小说明越接近 N(0,1)。一般 D &lt; 0.01 表示拟合极好，
        D &lt; 0.03 表示良好。
        {isSimulated && ksValue !== null && (
          <span
            className="ml-1 font-bold"
            style={{ color: ksColor }}
          >
            当前 D = {ksValue.toFixed(4)}（{ksLabel}）。
          </span>
        )}
        {!isSimulated && (
          <span className="ml-1">点击「模拟」后显示。</span>
        )}
      </div>
    </div>
  );
}

export default memo(CLTSimulatorBase);
