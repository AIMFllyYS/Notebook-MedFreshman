"use client";

import { memo, useState, useCallback } from "react";

// ─── 设计常量 ──────────────────────────────────────────────────
const ACCENT = "#5b46e5";
const ACCENT_LIGHT = "#ede9fe";
const LINE_COLORS = [
  "#5b46e5", "#0891b2", "#0f766e", "#ca8a04", "#dc2626",
  "#7c3aed", "#0369a1", "#065f46", "#92400e", "#991b1b",
  "#6d28d9", "#0e7490", "#166534", "#a16207", "#b91c1c",
  "#4338ca", "#155e75", "#14532d", "#78350f", "#7f1d1d",
];
const EPSILON_COLOR = "#f59e0b";
const EPSILON_BAND_FILL = "#fef9c366";

const NUM_LINES = 20;
const SVG_W = 520;
const SVG_H = 180;
const PAD_L = 46;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 28;
const CHART_W = SVG_W - PAD_L - PAD_R;
const CHART_H = SVG_H - PAD_T - PAD_B;

const SVG2_H = 130;
const CHART2_H = SVG2_H - PAD_T - PAD_B;

// ─── 分布类型 ──────────────────────────────────────────────────
type DistType = "bernoulli" | "uniform" | "exponential";

interface DistInfo {
  name: string;
  mean: number;
  variance: number;
  sample: () => number;
}

function getDistInfo(dist: DistType, param: number): DistInfo {
  if (dist === "bernoulli") {
    const p = param;
    return {
      name: `伯努利(p=${p.toFixed(2)})`,
      mean: p,
      variance: p * (1 - p),
      sample: () => (Math.random() < p ? 1 : 0),
    };
  }
  if (dist === "uniform") {
    // Uniform[0, 2*param] => mean = param, var = (2*param)^2/12
    const b = 2 * param;
    return {
      name: `均匀(0,${b.toFixed(1)})`,
      mean: param,
      variance: (b * b) / 12,
      sample: () => Math.random() * b,
    };
  }
  // exponential: mean = 1/lambda = param, var = param^2
  return {
    name: `指数(λ=${(1 / param).toFixed(2)})`,
    mean: param,
    variance: param * param,
    sample: () => -param * Math.log(1 - Math.random()),
  };
}

// ─── 模拟单条 X̄n 折线 ─────────────────────────────────────────
function simulateLine(
  distInfo: DistInfo,
  nMax: number,
  steps: number
): number[] {
  // 返回 steps 个均匀采样点的 X̄_{n_i}
  const ns = buildNSteps(nMax, steps);
  let acc = 0;
  let ni = 0;
  const result: number[] = [];
  for (let i = 1; i <= ns[ns.length - 1]; i++) {
    acc += distInfo.sample();
    if (i === ns[ni]) {
      result.push(acc / i);
      ni++;
    }
  }
  return result;
}

// ─── n 的采样点（对数等间距，更好地展示收敛） ─────────────────
function buildNSteps(nMax: number, steps: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const n = Math.max(1, Math.round(Math.exp(t * Math.log(nMax))));
    if (result.length === 0 || result[result.length - 1] !== n) {
      result.push(n);
    }
  }
  return result;
}

const STEPS = 60;

// ─── SVG 坐标映射 ─────────────────────────────────────────────
function xPos(i: number, total: number): number {
  return PAD_L + (i / (total - 1)) * CHART_W;
}

function yPos(value: number, yMin: number, yMax: number, chartH: number, padT: number): number {
  const ratio = (value - yMin) / (yMax - yMin);
  return padT + chartH * (1 - ratio);
}

function linePath(points: [number, number][]): string {
  if (points.length === 0) return "";
  return points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
}

// ─── 切比雪夫上界 ─────────────────────────────────────────────
function chebyshevBound(variance: number, epsilon: number, n: number): number {
  return Math.min(1, variance / (n * epsilon * epsilon));
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
      <span className="w-28 shrink-0 text-[12px] font-semibold text-[var(--ink)]">{label}</span>
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
        className="w-16 shrink-0 rounded-md px-2 py-0.5 text-center text-[12px] font-mono font-bold"
        style={{ background: ACCENT_LIGHT, color: color ?? ACCENT }}
      >
        {fmt(value)}
      </span>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────
function LLNSimulatorBase() {
  // 控制参数
  const [dist, setDist] = useState<DistType>("bernoulli");
  const [param, setParam] = useState(0.5);         // p / mean
  const [nMax, setNMax] = useState(300);
  const [epsilon, setEpsilon] = useState(0.15);

  // 模拟结果
  const [lines, setLines] = useState<number[][]>([]);
  const [mean, setMean] = useState(0);
  const [isSimulated, setIsSimulated] = useState(false);

  // param 范围随 dist 变化
  const paramConfig: Record<DistType, { min: number; max: number; step: number; label: string; fmt: (v: number) => string }> = {
    bernoulli: { min: 0.05, max: 0.95, step: 0.05, label: "参数 p", fmt: (v) => v.toFixed(2) },
    uniform: { min: 0.5, max: 3, step: 0.1, label: "均值 μ", fmt: (v) => v.toFixed(1) },
    exponential: { min: 0.5, max: 3, step: 0.1, label: "均值 μ", fmt: (v) => v.toFixed(1) },
  };
  const pc = paramConfig[dist];

  const handleSimulate = useCallback(() => {
    const info = getDistInfo(dist, param);
    const newLines: number[][] = [];
    for (let k = 0; k < NUM_LINES; k++) {
      newLines.push(simulateLine(info, nMax, STEPS));
    }
    setLines(newLines);
    setMean(info.mean);
    setIsSimulated(true);
  }, [dist, param, nMax]);

  // ─── 主图：X̄n 折线图 ──────────────────────────────────────
  const distInfo = getDistInfo(dist, param);
  const mu = mean || distInfo.mean;

  // y 轴范围：μ ± max(3σ, 2ε)
  const sigma = Math.sqrt(distInfo.variance);
  const ySpan = Math.max(3 * sigma, 2 * epsilon, 0.5);
  const yMin = distInfo.mean - ySpan;
  const yMax = distInfo.mean + ySpan;

  const pyMain = (v: number) => yPos(v, yMin, yMax, CHART_H, PAD_T);
  const pxMain = (i: number) => xPos(i, STEPS);

  const epsilonYLow = pyMain(mu - epsilon);
  const epsilonYHigh = pyMain(mu + epsilon);

  // Y 轴刻度
  const yTicks: number[] = [];
  const tickStep = ySpan / 2;
  for (let t = -2; t <= 2; t++) {
    yTicks.push(mu + t * tickStep);
  }

  // ─── 底图：超出比例 vs n ───────────────────────────────────
  const py2 = (v: number) => yPos(v, 0, 1, CHART2_H, PAD_T);

  // 计算超出比例（相对于当前 μ）
  const exceedFractions = isSimulated && lines.length > 0
    ? (() => {
        return Array.from({ length: STEPS }, (_, si) => {
          const exceed = lines.filter((line) => {
            const val = line[si];
            return val !== undefined && Math.abs(val - mean) > epsilon;
          }).length;
          return exceed / lines.length;
        });
      })()
    : [];

  // 切比雪夫上界折线（按 STEPS 对数等间距 n 轴）
  const chebyBounds = buildNSteps(nMax, STEPS).map((n) =>
    chebyshevBound(distInfo.variance, epsilon, n)
  );

  // 当前 n=nMax 处的切比雪夫上界
  const chebyAtN = chebyshevBound(distInfo.variance, epsilon, nMax);

  // ─── 悬停提示（最后一条模拟线在 nMax 处的值） ──────────────
  const lastVals = isSimulated && lines.length > 0
    ? lines.map((l) => l[l.length - 1]).filter((v) => v !== undefined)
    : [];
  const exceedCount = lastVals.filter((v) => Math.abs(v - mean) > epsilon).length;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-5">
      {/* 标题 */}
      <div>
        <h3 className="text-[15px] font-bold text-[var(--ink)]">大数定律模拟器</h3>
        <p className="text-[12px] text-[var(--ink-soft)] mt-0.5">
          模拟 {NUM_LINES} 条样本均值 X̄ₙ 折线，观察「n 越大，超出 ε 带的比例趋向 0」。
        </p>
      </div>

      {/* 控制面板 */}
      <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-3 space-y-3">
        {/* 分布选择 */}
        <div className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-[12px] font-semibold text-[var(--ink)]">选分布</span>
          <div className="flex gap-1.5">
            {(["bernoulli", "uniform", "exponential"] as DistType[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDist(d);
                  setParam(d === "bernoulli" ? 0.5 : 1.0);
                  setIsSimulated(false);
                  setLines([]);
                }}
                className={
                  "rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors " +
                  (d === dist
                    ? "bg-[var(--accent)] text-white"
                    : "bg-white border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--accent)]")
                }
              >
                {d === "bernoulli" ? "伯努利" : d === "uniform" ? "均匀" : "指数"}
              </button>
            ))}
          </div>
        </div>

        {/* 分布参数 */}
        <SliderRow
          label={pc.label}
          value={param}
          min={pc.min}
          max={pc.max}
          step={pc.step}
          fmt={pc.fmt}
          onChange={(v) => { setParam(v); setIsSimulated(false); setLines([]); }}
          color={ACCENT}
        />

        {/* n 滑块 */}
        <SliderRow
          label="最大 n"
          value={nMax}
          min={10}
          max={1000}
          step={10}
          fmt={(v) => String(v)}
          onChange={(v) => { setNMax(v); setIsSimulated(false); setLines([]); }}
          color="#0891b2"
        />

        {/* ε 滑块 */}
        <SliderRow
          label="误差 ε"
          value={epsilon}
          min={0.05}
          max={0.5}
          step={0.05}
          fmt={(v) => v.toFixed(2)}
          onChange={(v) => { setEpsilon(v); }}
          color={EPSILON_COLOR}
        />

        {/* 按钮 */}
        <button
          onClick={handleSimulate}
          className="w-full rounded-lg bg-[var(--accent)] py-1.5 text-[13px] font-bold text-white hover:opacity-90 transition-opacity"
        >
          模拟 {NUM_LINES} 条 X̄ₙ 折线
        </button>
      </div>

      {/* 分布信息 */}
      <div className="flex flex-wrap gap-3 text-[12px]">
        {[
          { label: "分布", val: getDistInfo(dist, param).name },
          { label: "均值 μ", val: getDistInfo(dist, param).mean.toFixed(4) },
          { label: "方差 σ²", val: getDistInfo(dist, param).variance.toFixed(4) },
          { label: "切比雪夫上界 P(|X̄ₙ-μ|>ε)", val: chebyAtN < 0.001 ? "<0.001" : chebyAtN.toFixed(4) },
        ].map(({ label, val }) => (
          <div key={label} className="rounded-lg bg-[var(--bg-muted)] px-3 py-1.5">
            <span className="text-[var(--ink-soft)]">{label}: </span>
            <span className="font-mono font-bold text-[var(--ink)]">{val}</span>
          </div>
        ))}
      </div>

      {/* 主图：X̄n 折线 */}
      <div>
        <div className="mb-1 text-[12px] font-semibold text-[var(--ink)]">
          样本均值 X̄ₙ 折线（对数 n 轴）
          {isSimulated && (
            <span className="ml-2 font-normal text-[var(--ink-soft)]">
              — n={nMax} 处超出 ε 带: <b style={{ color: exceedCount > 0 ? "#dc2626" : "#0f766e" }}>{exceedCount}/{NUM_LINES}</b>
            </span>
          )}
        </div>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full rounded-lg border border-[var(--line)]"
          style={{ background: "#fafbfd" }}
        >
          {/* ε 带 */}
          <rect
            x={PAD_L}
            y={Math.min(epsilonYHigh, epsilonYLow)}
            width={CHART_W}
            height={Math.abs(epsilonYLow - epsilonYHigh)}
            fill={EPSILON_BAND_FILL}
          />

          {/* y 轴刻度 */}
          {yTicks.map((t) => {
            const yy = pyMain(t);
            const isMu = Math.abs(t - mu) < 1e-9;
            const isEpsUp = Math.abs(t - (mu + epsilon)) < 1e-9;
            const isEpsDn = Math.abs(t - (mu - epsilon)) < 1e-9;
            return (
              <g key={t}>
                <line
                  x1={PAD_L}
                  y1={yy}
                  x2={SVG_W - PAD_R}
                  y2={yy}
                  stroke={isMu ? "#5b46e5" : isEpsUp || isEpsDn ? EPSILON_COLOR : "#e9ebf2"}
                  strokeDasharray={isMu ? "5 3" : isEpsUp || isEpsDn ? "4 3" : undefined}
                  strokeWidth={isMu || isEpsUp || isEpsDn ? 1.2 : 1}
                />
                <text x={PAD_L - 4} y={yy + 3} fontSize="9" textAnchor="end" fill="#8a94a6">
                  {t.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* μ 标签 */}
          <text x={SVG_W - PAD_R - 2} y={pyMain(mu) - 3} fontSize="9" textAnchor="end" fill={ACCENT}>
            μ={mu.toFixed(3)}
          </text>

          {/* ε 带标签 */}
          {epsilonYHigh > PAD_T + 6 && (
            <text x={PAD_L + 4} y={epsilonYHigh - 2} fontSize="9" fill={EPSILON_COLOR}>
              μ+ε
            </text>
          )}
          {epsilonYLow < PAD_T + CHART_H - 4 && (
            <text x={PAD_L + 4} y={epsilonYLow + 9} fontSize="9" fill={EPSILON_COLOR}>
              μ-ε
            </text>
          )}

          {/* X 轴标签 */}
          <text x={PAD_L} y={SVG_H - 4} fontSize="9" fill="#8a94a6">n=1</text>
          <text x={SVG_W - PAD_R} y={SVG_H - 4} fontSize="9" textAnchor="end" fill="#8a94a6">
            n={nMax}
          </text>

          {/* 折线 */}
          {isSimulated &&
            lines.map((line, k) => {
              const pts: [number, number][] = line.map((v, i) => [pxMain(i), pyMain(v)]);
              const lastVal = line[line.length - 1];
              const exceeded = lastVal !== undefined && Math.abs(lastVal - mean) > epsilon;
              return (
                <path
                  key={k}
                  d={linePath(pts)}
                  fill="none"
                  stroke={exceeded ? "#dc2626" : LINE_COLORS[k % LINE_COLORS.length]}
                  strokeWidth={exceeded ? 1.5 : 1}
                  opacity={exceeded ? 0.85 : 0.55}
                />
              );
            })}

          {/* 无数据提示 */}
          {!isSimulated && (
            <text
              x={SVG_W / 2}
              y={SVG_H / 2}
              textAnchor="middle"
              fontSize="12"
              fill="#b0b8cc"
            >
              点击「模拟」开始
            </text>
          )}

          {/* y 轴 */}
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + CHART_H} stroke="#d0d5e0" />
        </svg>
      </div>

      {/* 底图：超出比例 vs n */}
      <div>
        <div className="mb-1 text-[12px] font-semibold text-[var(--ink)]">
          超出 ε 带折线比例 vs n
          <span className="ml-1 font-normal text-[var(--ink-soft)]">（橙色=实验值，虚线=切比雪夫上界）</span>
        </div>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG2_H}`}
          className="w-full rounded-lg border border-[var(--line)]"
          style={{ background: "#fafbfd" }}
        >
          {/* y 轴刻度 */}
          {[0, 0.25, 0.5, 0.75, 1].map((v) => {
            const yy = py2(v);
            return (
              <g key={v}>
                <line
                  x1={PAD_L}
                  y1={yy}
                  x2={SVG_W - PAD_R}
                  y2={yy}
                  stroke={v === 0 ? "#5b46e5" : "#e9ebf2"}
                  strokeDasharray={v === 0 ? "4 3" : undefined}
                  strokeWidth={v === 0 ? 1.2 : 1}
                />
                <text x={PAD_L - 4} y={yy + 3} fontSize="9" textAnchor="end" fill="#8a94a6">
                  {v}
                </text>
              </g>
            );
          })}

          {/* "趋向 0" 标签 */}
          <text x={SVG_W - PAD_R - 2} y={py2(0) - 3} fontSize="9" textAnchor="end" fill={ACCENT}>
            趋向 0
          </text>

          {/* X 轴标签 */}
          <text x={PAD_L} y={SVG2_H - 4} fontSize="9" fill="#8a94a6">n=1</text>
          <text x={SVG_W - PAD_R} y={SVG2_H - 4} fontSize="9" textAnchor="end" fill="#8a94a6">
            n={nMax}
          </text>

          {/* 切比雪夫上界折线 */}
          <path
            d={linePath(chebyBounds.map((b, i) => [xPos(i, STEPS), py2(Math.min(1, b))] as [number, number]))}
            fill="none"
            stroke={EPSILON_COLOR}
            strokeWidth={1.5}
            strokeDasharray="5 3"
            opacity={0.9}
          />

          {/* 超出比例实验折线 */}
          {isSimulated && exceedFractions.length > 0 && (() => {
            const pts: [number, number][] = exceedFractions.map((f, i) => [xPos(i, STEPS), py2(f)]);
            return (
              <path
                d={linePath(pts)}
                fill="none"
                stroke="#f97316"
                strokeWidth={2}
                opacity={0.9}
              />
            );
          })()}

          {/* 无数据提示 */}
          {!isSimulated && (
            <text
              x={SVG_W / 2}
              y={SVG2_H / 2}
              textAnchor="middle"
              fontSize="12"
              fill="#b0b8cc"
            >
              模拟后显示
            </text>
          )}

          {/* y 轴 */}
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + CHART2_H} stroke="#d0d5e0" />
        </svg>
      </div>

      {/* 切比雪夫公式展示 */}
      <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-3 text-[12px] leading-loose text-[var(--ink-soft)]">
        <div className="font-semibold text-[13px] text-[var(--ink)] mb-1">切比雪夫不等式上界</div>
        <div className="font-mono text-[12px]">
          P(|X̄ₙ − μ| &gt; ε) ≤ σ² / (n·ε²)
        </div>
        <div className="font-mono text-[11px] mt-0.5 text-[var(--ink-soft)]">
          {"= "}
          <span style={{ color: "#0891b2", fontWeight: 700 }}>{distInfo.variance.toFixed(4)}</span>
          {" / ("}
          <span style={{ color: "#0891b2", fontWeight: 700 }}>{nMax}</span>
          {" × "}
          <span style={{ color: EPSILON_COLOR, fontWeight: 700 }}>{epsilon.toFixed(2)}²</span>
          {") = "}
          <span style={{ color: ACCENT, fontWeight: 700 }}>
            {chebyAtN < 0.0001 ? "<0.0001" : chebyAtN.toFixed(4)}
          </span>
        </div>
        <div className="mt-1 text-[11px]">
          当 n → ∞ 时，上界 → 0，即 <b className="text-[var(--ink)]">弱大数定律</b>：X̄ₙ 依概率收敛到 μ。
        </div>
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap gap-3 text-[11px] text-[var(--ink-soft)]">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-6 rounded-full" style={{ background: ACCENT, opacity: 0.6 }} />
          <span>未超出 ε 带的折线</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-6 rounded-full" style={{ background: "#dc2626" }} />
          <span>超出 ε 带的折线（在 n=nMax 时）</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded" style={{ background: EPSILON_BAND_FILL, border: `1px dashed ${EPSILON_COLOR}` }} />
          <span>ε 带（μ±ε）</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="24" height="8" style={{ display: "inline-block" }}>
            <line x1="0" y1="4" x2="24" y2="4" stroke={EPSILON_COLOR} strokeWidth="1.5" strokeDasharray="4 2" />
          </svg>
          <span>切比雪夫上界</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-6 rounded-full" style={{ background: "#f97316" }} />
          <span>实验超出比例</span>
        </div>
      </div>
    </div>
  );
}

export default memo(LLNSimulatorBase);
