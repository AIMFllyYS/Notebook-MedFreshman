"use client";

import { memo, useState, useMemo } from "react";

// ─── 设计常量 ────────────────────────────────────────────────────────────────
const ACCENT = "#5b46e5";
const ACCENT_LIGHT = "#ede9fe";
const TEAL = "#0d9488";
const TEAL_LIGHT = "#ccfbf1";
const GRAY_BORDER = "#e7e9ef";

// ─── 数学工具 ────────────────────────────────────────────────────────────────

/** log-阶乘（避免大 n 时数值溢出） */
function logFactorial(n: number): number {
  let r = 0;
  for (let i = 2; i <= n; i++) r += Math.log(i);
  return r;
}

/** 二项分布 P(X=k) = C(n,k) * p^k * (1-p)^(n-k) */
function binomPMF(n: number, p: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  const logP =
    logFactorial(n) -
    logFactorial(k) -
    logFactorial(n - k) +
    k * Math.log(p) +
    (n - k) * Math.log(1 - p);
  return Math.exp(logP);
}

/** 泊松分布 P(X=k) = e^{-λ} * λ^k / k! */
function poissonPMF(lambda: number, k: number): number {
  if (k < 0) return 0;
  const logP = -lambda + k * Math.log(lambda) - logFactorial(k);
  return Math.exp(logP);
}

// ─── 滑块子组件 ──────────────────────────────────────────────────────────────
interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  color: string;
  bgColor: string;
  onChange: (v: number) => void;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  color,
  bgColor,
  onChange,
}: SliderRowProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[var(--ink)]">{label}</span>
        <span
          className="rounded-md px-2 py-0.5 text-[13px] font-mono font-bold"
          style={{ background: bgColor, color }}
        >
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 cursor-pointer rounded-full"
        style={{ accentColor: color }}
      />
      <div className="flex justify-between text-[10px] text-[var(--ink-soft)]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// ─── SVG 柱状图 ──────────────────────────────────────────────────────────────
interface BarChartProps {
  data: { k: number; p: number }[];
  mean: number;
  color: string;
  label: string;
}

const CHART_W = 480;
const CHART_H = 200;
const PAD_L = 42;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 36;

function BarChart({ data, mean, color, label }: BarChartProps) {
  const chartW = CHART_W - PAD_L - PAD_R;
  const chartH = CHART_H - PAD_T - PAD_B;
  const n = data.length;

  const maxP = Math.max(...data.map((d) => d.p), 0.001);
  const barW = Math.max(2, (chartW / n) * 0.72);
  const gap = chartW / n;

  // y 轴刻度：最多 5 档
  const yTicks = useMemo(() => {
    const raw = [0, 0.25, 0.5, 0.75, 1].map((f) => +(maxP * f).toFixed(4));
    return raw.filter((v) => v <= maxP + 0.001);
  }, [maxP]);

  const toX = (k: number) => PAD_L + (k + 0.5) * gap;
  const toY = (p: number) => PAD_T + chartH - (p / maxP) * chartH;

  // 均值线 x 坐标
  const meanX = PAD_L + ((mean / (n - 1)) * chartW);

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full rounded-lg"
      style={{ maxHeight: 220 }}
      aria-label={label}
    >
      {/* 背景 */}
      <rect
        x={PAD_L}
        y={PAD_T}
        width={chartW}
        height={chartH}
        fill="#fafbfd"
        stroke={GRAY_BORDER}
        rx={2}
      />

      {/* y 轴刻度线 */}
      {yTicks.map((v) => {
        const y = toY(v);
        return (
          <g key={v}>
            <line
              x1={PAD_L}
              y1={y}
              x2={PAD_L + chartW}
              y2={y}
              stroke={GRAY_BORDER}
              strokeDasharray="3 3"
            />
            <text
              x={PAD_L - 5}
              y={y + 3}
              fontSize={9}
              textAnchor="end"
              fill="#8a94a6"
            >
              {v < 0.01 ? v.toExponential(1) : v.toFixed(3)}
            </text>
          </g>
        );
      })}

      {/* 均值虚线 */}
      {mean >= 0 && mean <= n - 1 && (
        <>
          <line
            x1={meanX}
            y1={PAD_T}
            x2={meanX}
            y2={PAD_T + chartH}
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="5 3"
            opacity={0.7}
          />
          <text
            x={meanX + 3}
            y={PAD_T + 10}
            fontSize={9}
            fill={color}
            fontWeight="600"
          >
            μ={mean.toFixed(2)}
          </text>
        </>
      )}

      {/* 柱状条 */}
      {data.map(({ k, p }) => {
        const x = toX(k) - barW / 2;
        const barH = (p / maxP) * chartH;
        const y = PAD_T + chartH - barH;
        return (
          <g key={k}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill={color}
              rx={1.5}
              opacity={0.85}
            >
              <title>
                P(X={k}) = {p.toFixed(6)}
              </title>
            </rect>
          </g>
        );
      })}

      {/* x 轴标签（每隔几个显示一次，避免拥挤） */}
      {data.map(({ k }) => {
        const step = n <= 15 ? 1 : n <= 25 ? 2 : 5;
        if (k % step !== 0 && k !== n - 1) return null;
        return (
          <text
            key={k}
            x={toX(k)}
            y={PAD_T + chartH + 14}
            fontSize={9}
            textAnchor="middle"
            fill="#8a94a6"
          >
            {k}
          </text>
        );
      })}

      {/* 轴标签 */}
      <text
        x={PAD_L + chartW / 2}
        y={CHART_H - 2}
        fontSize={10}
        textAnchor="middle"
        fill="#8a94a6"
      >
        k（X 的取值）
      </text>
      <text
        x={9}
        y={PAD_T + chartH / 2}
        fontSize={9}
        textAnchor="middle"
        fill="#8a94a6"
        transform={`rotate(-90, 9, ${PAD_T + chartH / 2})`}
      >
        P(X=k)
      </text>
    </svg>
  );
}

// ─── 统计数据卡片 ─────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  color: string;
  bg: string;
}

function StatCard({ label, value, color, bg }: StatCardProps) {
  return (
    <div className="rounded-lg p-3 text-center" style={{ background: bg }}>
      <div className="text-[11px] text-[var(--ink-soft)] leading-snug">{label}</div>
      <div
        className="mt-1 text-[18px] font-extrabold font-mono"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
type TabType = "binomial" | "poisson";

function BinomialExplorerBase() {
  const [tab, setTab] = useState<TabType>("binomial");

  // 二项分布参数
  const [n, setN] = useState(10);
  const [p, setP] = useState(0.5);

  // 泊松分布参数
  const [lambda, setLambda] = useState(3.0);

  // ─── 二项分布数据 ───────────────────────────────────────────
  const binomData = useMemo(() => {
    return Array.from({ length: n + 1 }, (_, k) => ({
      k,
      p: binomPMF(n, p, k),
    }));
  }, [n, p]);

  const binomMean = n * p;
  const binomVar = n * p * (1 - p);
  const binomStd = Math.sqrt(binomVar);

  // ─── 泊松分布数据 ───────────────────────────────────────────
  // 显示到均值 + 4σ（≈均值+4√λ），至少到 k=20
  const poissonKMax = Math.max(20, Math.ceil(lambda + 4 * Math.sqrt(lambda) + 2));

  const poissonData = useMemo(() => {
    return Array.from({ length: poissonKMax + 1 }, (_, k) => ({
      k,
      p: poissonPMF(lambda, k),
    }));
  }, [lambda, poissonKMax]);

  const poissonMean = lambda;
  const poissonVar = lambda;
  const poissonStd = Math.sqrt(lambda);

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-4">
      {/* 标题 */}
      <div>
        <h3 className="text-[15px] font-bold text-[var(--ink)]">
          二项 / 泊松分布探索器
        </h3>
        <p className="text-[12px] text-[var(--ink-soft)] mt-0.5">
          拖动滑块实时调参，直观感受参数如何改变分布的形状、中心与离散程度。
        </p>
      </div>

      {/* Tab 切换 */}
      <div className="flex rounded-lg overflow-hidden border border-[var(--line)] w-fit">
        {(
          [
            { key: "binomial", label: "二项分布 B(n, p)" },
            { key: "poisson", label: "泊松分布 P(λ)" },
          ] as { key: TabType; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={
              "px-4 py-2 text-[13px] font-semibold transition-colors " +
              (tab === key
                ? "text-white"
                : "text-[var(--ink-soft)] bg-[var(--bg-muted)] hover:bg-[var(--line)]")
            }
            style={tab === key ? { background: key === "binomial" ? ACCENT : TEAL } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ═══ 二项分布面板 ═══ */}
      {tab === "binomial" && (
        <>
          {/* 滑块区 */}
          <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-3 space-y-4">
            <SliderRow
              label="试验次数 n"
              value={n}
              min={1}
              max={30}
              step={1}
              displayValue={String(n)}
              color={ACCENT}
              bgColor={ACCENT_LIGHT}
              onChange={(v) => setN(v)}
            />
            <SliderRow
              label="成功概率 p"
              value={p}
              min={0}
              max={1}
              step={0.01}
              displayValue={p.toFixed(2)}
              color={ACCENT}
              bgColor={ACCENT_LIGHT}
              onChange={(v) => setP(v)}
            />
          </div>

          {/* 分布律说明 */}
          <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-2.5 text-[12px] text-[var(--ink-soft)] leading-loose font-mono">
            P(X=k) = C(n,k)·p^k·(1−p)^(n−k)
            <span className="ml-2 text-[var(--ink-soft)]">k = 0,1,…,n</span>
          </div>

          {/* 柱状图 */}
          <BarChart
            data={binomData}
            mean={binomMean}
            color={ACCENT}
            label={`二项分布 B(${n},${p.toFixed(2)}) 分布律柱状图`}
          />

          {/* 统计量 */}
          <div className="grid grid-cols-3 gap-2">
            <StatCard
              label="均值 E(X) = np"
              value={binomMean.toFixed(3)}
              color={ACCENT}
              bg={ACCENT_LIGHT}
            />
            <StatCard
              label="方差 D(X) = np(1−p)"
              value={binomVar.toFixed(3)}
              color={ACCENT}
              bg={ACCENT_LIGHT}
            />
            <StatCard
              label="标准差 σ = √(np(1−p))"
              value={binomStd.toFixed(3)}
              color={ACCENT}
              bg={ACCENT_LIGHT}
            />
          </div>

          {/* 洞察说明 */}
          <BinomInsight n={n} p={p} mean={binomMean} />
        </>
      )}

      {/* ═══ 泊松分布面板 ═══ */}
      {tab === "poisson" && (
        <>
          {/* 滑块区 */}
          <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-3 space-y-4">
            <SliderRow
              label="平均发生次数 λ"
              value={lambda}
              min={0.1}
              max={15}
              step={0.1}
              displayValue={lambda.toFixed(1)}
              color={TEAL}
              bgColor={TEAL_LIGHT}
              onChange={(v) => setLambda(v)}
            />
          </div>

          {/* 分布律说明 */}
          <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-2.5 text-[12px] text-[var(--ink-soft)] leading-loose font-mono">
            P(X=k) = e^(−λ) · λ^k / k!
            <span className="ml-2 text-[var(--ink-soft)]">k = 0,1,2,…</span>
          </div>

          {/* 柱状图 */}
          <BarChart
            data={poissonData}
            mean={poissonMean}
            color={TEAL}
            label={`泊松分布 P(λ=${lambda.toFixed(1)}) 分布律柱状图`}
          />

          {/* 统计量 */}
          <div className="grid grid-cols-3 gap-2">
            <StatCard
              label="均值 E(X) = λ"
              value={poissonMean.toFixed(3)}
              color={TEAL}
              bg={TEAL_LIGHT}
            />
            <StatCard
              label="方差 D(X) = λ"
              value={poissonVar.toFixed(3)}
              color={TEAL}
              bg={TEAL_LIGHT}
            />
            <StatCard
              label="标准差 σ = √λ"
              value={poissonStd.toFixed(3)}
              color={TEAL}
              bg={TEAL_LIGHT}
            />
          </div>

          {/* 洞察说明 */}
          <PoissonInsight lambda={lambda} />
        </>
      )}

      {/* 底部：二项 → 泊松 极限定理提示 */}
      <BinomPoissonBridge tab={tab} n={n} p={p} lambda={lambda} />
    </div>
  );
}

// ─── 二项分布洞察块 ───────────────────────────────────────────────────────────
function BinomInsight({ n, p, mean }: { n: number; p: number; mean: number }) {
  const isSymmetric = Math.abs(p - 0.5) < 0.05;
  const isLeftSkewed = p > 0.5;
  const isRightSkewed = p < 0.5;

  let shapeNote = "";
  if (isSymmetric) shapeNote = "p ≈ 0.5 时分布近似对称（钟形）。";
  else if (isLeftSkewed) shapeNote = "p > 0.5 时分布左偏（重心靠右），众数在均值右侧。";
  else if (isRightSkewed) shapeNote = "p < 0.5 时分布右偏（重心靠左），众数在均值左侧。";

  const largeN = n >= 20 && p >= 0.1 && p <= 0.9;

  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2.5 text-[12px] text-[var(--ink-soft)] leading-relaxed space-y-1">
      <span className="font-semibold text-[var(--ink)]">直觉：</span>
      <span>
        B({n}, {p.toFixed(2)}) 的均值为{" "}
        <b className="text-[var(--ink)]">{mean.toFixed(2)}</b>，即「平均成功次数」。
        {shapeNote && " " + shapeNote}
        {largeN && " n 较大且 p 适中时，二项分布近似正态分布（中心极限定理）。"}
      </span>
    </div>
  );
}

// ─── 泊松分布洞察块 ───────────────────────────────────────────────────────────
function PoissonInsight({ lambda }: { lambda: number }) {
  const isSmall = lambda < 1;
  const isLarge = lambda > 8;

  let note = "";
  if (isSmall) {
    note = `λ 很小时，P(X=0) 很大——事件极少发生，绝大多数时间次数为 0。`;
  } else if (isLarge) {
    note = `λ 较大时，泊松分布趋近正态分布，形状越来越对称。`;
  } else {
    note = `泊松分布的均值与方差相等，都等于 λ——这是泊松分布的标志性性质。`;
  }

  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2.5 text-[12px] text-[var(--ink-soft)] leading-relaxed space-y-1">
      <span className="font-semibold text-[var(--ink)]">直觉：</span>
      <span>
        {note} 泊松分布常用于「单位时间内随机事件发生次数」的建模（如呼叫中心来电、放射性衰变等）。
      </span>
    </div>
  );
}

// ─── 二项→泊松极限提示 ────────────────────────────────────────────────────────
function BinomPoissonBridge({
  tab,
  n,
  p,
  lambda,
}: {
  tab: TabType;
  n: number;
  p: number;
  lambda: number;
}) {
  // 当 n 很大、p 很小，np ≈ λ 时，二项 ≈ 泊松
  const np = n * p;
  const isClose = tab === "binomial" && n >= 20 && p <= 0.1 && Math.abs(np - lambda) < 0.5;
  const isCloseToCurrentLambda = tab === "poisson" && n >= 20 && p <= 0.1 && Math.abs(np - lambda) < 0.5;

  if (!isClose && !isCloseToCurrentLambda) {
    return (
      <div
        className="rounded-lg border border-dashed border-[var(--line)] px-3 py-2.5 text-[12px] text-[var(--ink-soft)] leading-relaxed"
      >
        <span className="font-semibold text-[var(--ink)]">极限定理：</span>
        当 n 很大、p 很小且 np = λ 保持不变时，
        <span className="font-mono"> B(n, p) → P(λ)</span>（泊松极限）。
        尝试设 n=30, p=0.1，再与 P(λ=3) 对比！
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border border-dashed px-3 py-2.5 text-[12px] leading-relaxed"
      style={{ borderColor: ACCENT, background: ACCENT_LIGHT, color: ACCENT }}
    >
      <span className="font-bold">极限定理验证中！</span>
      {" "}当前 np = {np.toFixed(2)}，接近泊松参数 λ={lambda.toFixed(1)}。
      切换到另一个 Tab，你会发现两张图形状几乎一致——这就是「泊松极限定理」的直观体现。
    </div>
  );
}

export default memo(BinomialExplorerBase);
