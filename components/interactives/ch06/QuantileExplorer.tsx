"use client";

import { useState, useCallback, useMemo } from "react";

// ─── 设计常量 ────────────────────────────────────────────────────────────────
const ACCENT = "#5b46e5";
const ACCENT_LIGHT = "#ede9fe";
const ORANGE = "#ea580c";
const ORANGE_LIGHT = "#fff7ed";
const GREEN = "#0f766e";
const GREEN_LIGHT = "#ccfbf1";
const GRAY_LINE = "#e7e9ef";
const GRAY_BG = "#fafbfd";

// ─── 数学工具 ─────────────────────────────────────────────────────────────────

/** Box-Muller 生成标准正态样本（在事件处理函数内调用） */
function randNormal(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** 指数分布采样：F(x)=1-e^{-λx}，令 λ=1 */
function randExp(): number {
  let u = 0;
  while (u === 0) u = Math.random();
  return -Math.log(u);
}

/** 均匀分布 U(0,1) */
function randUniform(): number {
  return Math.random();
}

/** 标准正态分布 CDF（Abramowitz & Stegun 近似，精度 ~1e-7） */
function normCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const poly =
    t * (0.319381530 +
      t * (-0.356563782 +
        t * (1.781477937 +
          t * (-1.821255978 +
            t * 1.330274429))));
  const cdf = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x) * poly;
  return x >= 0 ? cdf : 1 - cdf;
}

/** 标准正态分布分位数 — Beasley-Springer-Moro 近似 */
function normQuantile(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;

  const c0 = 2.515517, c1 = 0.802853, c2 = 0.010328;
  const d1 = 1.432788, d2 = 0.189269, d3 = 0.001308;

  const q = p < 0.5 ? p : 1 - p;
  const t = Math.sqrt(-2 * Math.log(q));
  const x = t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);
  return p < 0.5 ? -x : x;
}

// ─── 类型 ─────────────────────────────────────────────────────────────────────

type Distribution = "normal" | "uniform" | "exponential";

interface QQPoint {
  theoretical: number;
  sample: number;
  rank: number;
}

// ─── 生成函数 ─────────────────────────────────────────────────────────────────

function generateSample(dist: Distribution, n: number): number[] {
  const raw: number[] = [];
  for (let i = 0; i < n; i++) {
    if (dist === "normal") raw.push(randNormal());
    else if (dist === "uniform") raw.push(randUniform());
    else raw.push(randExp());
  }
  return raw.sort((a, b) => a - b);
}

/** 计算 Q-Q 图点：横轴 = 正态理论分位数，纵轴 = 样本分位数（Z-score 化） */
function computeQQ(sorted: number[]): QQPoint[] {
  const n = sorted.length;
  if (n === 0) return [];

  // 对样本做 Z-score 标准化，便于与标准正态对比
  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(sorted.reduce((a, b) => a + (b - mean) ** 2, 0) / n) || 1;

  return sorted.map((v, i) => {
    // Filliben 公式: p_i = (i+1 - 0.375) / (n + 0.25)，避免 0 和 1
    const p = (i + 1 - 0.375) / (n + 0.25);
    return {
      theoretical: normQuantile(p),
      sample: (v - mean) / std,
      rank: i + 1,
    };
  });
}

// ─── SVG 辅助 ────────────────────────────────────────────────────────────────

const SVG_W = 300;
const SVG_H = 240;
const PAD = { top: 20, right: 20, bottom: 36, left: 42 };

function plotW() { return SVG_W - PAD.left - PAD.right; }
function plotH() { return SVG_H - PAD.top - PAD.bottom; }

function scaleX(v: number, lo: number, hi: number): number {
  return PAD.left + ((v - lo) / (hi - lo)) * plotW();
}
function scaleY(v: number, lo: number, hi: number): number {
  return PAD.top + plotH() - ((v - lo) / (hi - lo)) * plotH();
}

// ─── 分布描述 ────────────────────────────────────────────────────────────────

const DIST_META: Record<Distribution, { label: string; color: string; bg: string; desc: string }> = {
  normal: {
    label: "正态 N(0,1)",
    color: ACCENT,
    bg: ACCENT_LIGHT,
    desc: "点接近对角线 → 服从正态分布",
  },
  uniform: {
    label: "均匀 U(0,1)",
    color: GREEN,
    bg: GREEN_LIGHT,
    desc: "S 形弯曲 → 尾部轻于正态（尾巴短）",
  },
  exponential: {
    label: "指数 Exp(1)",
    color: ORANGE,
    bg: ORANGE_LIGHT,
    desc: "右端上翘 → 右偏分布（长右尾）",
  },
};

// ─── 柱状图（排序后样本可视化） ──────────────────────────────────────────────

function SortedBar({
  sorted,
  dist,
  hoveredIdx,
  onHover,
}: {
  sorted: number[];
  dist: Distribution;
  hoveredIdx: number | null;
  onHover: (i: number | null) => void;
}) {
  const n = sorted.length;
  if (n === 0) return <div className="h-16 flex items-center justify-center text-[12px] text-[var(--ink-soft)]">点击「重新抽样」开始</div>;

  const lo = sorted[0];
  const hi = sorted[n - 1];
  const range = hi - lo || 1;
  const color = DIST_META[dist].color;

  // 只显示最多 80 根竖线，太多会糊
  const stride = Math.max(1, Math.floor(n / 80));
  const bars: { i: number; v: number }[] = [];
  for (let i = 0; i < n; i += stride) bars.push({ i, v: sorted[i] });

  return (
    <div className="relative" style={{ height: 52 }}>
      <div className="absolute inset-0 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] overflow-hidden">
        {bars.map(({ i, v }) => {
          const heightPct = ((v - lo) / range) * 100;
          const leftPct = (i / (n - 1 || 1)) * 100;
          const isHov = hoveredIdx !== null && Math.abs(i - hoveredIdx) <= stride;
          return (
            <div
              key={i}
              className="absolute bottom-0 transition-opacity"
              style={{
                left: `${leftPct}%`,
                width: `${Math.max(1, 100 / bars.length - 0.3)}%`,
                height: `${Math.max(4, heightPct)}%`,
                background: color,
                opacity: isHov ? 1 : 0.55,
                minHeight: 2,
              }}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
            />
          );
        })}
      </div>
      {/* 标注 */}
      <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-[10px] text-[var(--ink-soft)] px-1">
        <span>x₍₁₎ = {lo.toFixed(3)}</span>
        <span className="font-semibold text-[var(--ink)]">顺序统计量</span>
        <span>x₍ₙ₎ = {hi.toFixed(3)}</span>
      </div>
    </div>
  );
}

// ─── Q-Q 图 ───────────────────────────────────────────────────────────────────

function QQPlot({
  points,
  dist,
  hoveredIdx,
  onHover,
}: {
  points: QQPoint[];
  dist: Distribution;
  hoveredIdx: number | null;
  onHover: (i: number | null) => void;
}) {
  const color = DIST_META[dist].color;

  const allX = points.map((p) => p.theoretical);
  const allY = points.map((p) => p.sample);

  const lo = Math.min(-2.5, Math.min(...allX), Math.min(...allY));
  const hi = Math.max(2.5, Math.max(...allX), Math.max(...allY));

  const xTicks = [-2, -1, 0, 1, 2];
  const yTicks = [-2, -1, 0, 1, 2];

  const hov = hoveredIdx !== null && points[hoveredIdx];

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full rounded-lg border border-[var(--line)]"
      style={{ background: GRAY_BG }}
      onMouseLeave={() => onHover(null)}
    >
      {/* 网格 */}
      {xTicks.map((t) => (
        <line
          key={`vg${t}`}
          x1={scaleX(t, lo, hi)}
          y1={PAD.top}
          x2={scaleX(t, lo, hi)}
          y2={PAD.top + plotH()}
          stroke={GRAY_LINE}
          strokeWidth={1}
        />
      ))}
      {yTicks.map((t) => (
        <line
          key={`hg${t}`}
          x1={PAD.left}
          y1={scaleY(t, lo, hi)}
          x2={PAD.left + plotW()}
          y2={scaleY(t, lo, hi)}
          stroke={GRAY_LINE}
          strokeWidth={1}
        />
      ))}

      {/* 参考对角线 y=x */}
      <line
        x1={scaleX(lo, lo, hi)}
        y1={scaleY(lo, lo, hi)}
        x2={scaleX(hi, lo, hi)}
        y2={scaleY(hi, lo, hi)}
        stroke="#94a3b8"
        strokeWidth={1.5}
        strokeDasharray="5 3"
      />
      <text
        x={scaleX(hi, lo, hi) - 4}
        y={scaleY(hi, lo, hi) + 12}
        fontSize={9}
        fill="#94a3b8"
        textAnchor="end"
      >
        y=x
      </text>

      {/* 散点 */}
      {points.map((pt, i) => {
        const cx = scaleX(pt.theoretical, lo, hi);
        const cy = scaleY(pt.sample, lo, hi);
        const isHov = i === hoveredIdx;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={isHov ? 5 : points.length > 60 ? 2.5 : 3.5}
            fill={color}
            opacity={isHov ? 1 : 0.65}
            stroke={isHov ? "white" : "none"}
            strokeWidth={1.5}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => onHover(i)}
          />
        );
      })}

      {/* Hover 详情 */}
      {hov && (
        <g>
          <line
            x1={scaleX(hov.theoretical, lo, hi)}
            y1={PAD.top}
            x2={scaleX(hov.theoretical, lo, hi)}
            y2={PAD.top + plotH()}
            stroke={color}
            strokeWidth={1}
            strokeDasharray="3 2"
            opacity={0.6}
          />
          <line
            x1={PAD.left}
            y1={scaleY(hov.sample, lo, hi)}
            x2={PAD.left + plotW()}
            y2={scaleY(hov.sample, lo, hi)}
            stroke={color}
            strokeWidth={1}
            strokeDasharray="3 2"
            opacity={0.6}
          />
          {/* Tooltip */}
          {(() => {
            const tx = scaleX(hov.theoretical, lo, hi);
            const ty = scaleY(hov.sample, lo, hi);
            const boxW = 108, boxH = 38;
            const bx = Math.min(tx + 8, PAD.left + plotW() - boxW - 4);
            const by = Math.max(PAD.top + 4, ty - boxH - 4);
            return (
              <g>
                <rect x={bx} y={by} width={boxW} height={boxH} rx={5} fill="white" stroke={color} strokeWidth={1} />
                <text x={bx + 6} y={by + 14} fontSize={10} fill={color} fontWeight="700">
                  x₍{hov.rank}₎  理论: {hov.theoretical.toFixed(3)}
                </text>
                <text x={bx + 6} y={by + 28} fontSize={10} fill="#475569">
                  样本 Z: {hov.sample.toFixed(3)}
                </text>
              </g>
            );
          })()}
        </g>
      )}

      {/* 坐标轴 */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotH()} stroke="#cbd5e1" strokeWidth={1.5} />
      <line x1={PAD.left} y1={PAD.top + plotH()} x2={PAD.left + plotW()} y2={PAD.top + plotH()} stroke="#cbd5e1" strokeWidth={1.5} />

      {/* X 轴刻度 */}
      {xTicks.map((t) => (
        <g key={`xt${t}`}>
          <line
            x1={scaleX(t, lo, hi)} y1={PAD.top + plotH()}
            x2={scaleX(t, lo, hi)} y2={PAD.top + plotH() + 4}
            stroke="#cbd5e1" strokeWidth={1}
          />
          <text x={scaleX(t, lo, hi)} y={PAD.top + plotH() + 14} fontSize={9} textAnchor="middle" fill="#64748b">
            {t}
          </text>
        </g>
      ))}

      {/* Y 轴刻度 */}
      {yTicks.map((t) => (
        <g key={`yt${t}`}>
          <line
            x1={PAD.left - 4} y1={scaleY(t, lo, hi)}
            x2={PAD.left} y2={scaleY(t, lo, hi)}
            stroke="#cbd5e1" strokeWidth={1}
          />
          <text x={PAD.left - 6} y={scaleY(t, lo, hi) + 3} fontSize={9} textAnchor="end" fill="#64748b">
            {t}
          </text>
        </g>
      ))}

      {/* 轴标签 */}
      <text
        x={PAD.left + plotW() / 2}
        y={SVG_H - 2}
        fontSize={10}
        textAnchor="middle"
        fill="#475569"
        fontWeight="600"
      >
        理论正态分位数
      </text>
      <text
        x={10}
        y={PAD.top + plotH() / 2}
        fontSize={10}
        textAnchor="middle"
        fill="#475569"
        fontWeight="600"
        transform={`rotate(-90, 10, ${PAD.top + plotH() / 2})`}
      >
        样本分位数 (Z)
      </text>
    </svg>
  );
}

// ─── 统计摘要 ─────────────────────────────────────────────────────────────────

function computeStats(sorted: number[]) {
  const n = sorted.length;
  if (n === 0) return null;
  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  const variance = sorted.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  const q1 = sorted[Math.floor(n * 0.25)];
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const skewness = n > 2
    ? sorted.reduce((a, b) => a + ((b - mean) / (std || 1)) ** 3, 0) / n
    : 0;
  return { mean, std, median, q1, q3, skewness };
}

/** 用相关系数粗估正态性，> 0.95 认为"接近正态" */
function qqCorrelation(points: QQPoint[]): number {
  if (points.length < 3) return 1;
  const xs = points.map((p) => p.theoretical);
  const ys = points.map((p) => p.sample);
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  const num = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0);
  const dx = Math.sqrt(xs.reduce((a, x) => a + (x - mx) ** 2, 0));
  const dy = Math.sqrt(ys.reduce((a, y) => a + (y - my) ** 2, 0));
  return dx * dy > 0 ? num / (dx * dy) : 1;
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function QuantileExplorer() {
  const [dist, setDist] = useState<Distribution>("normal");
  const [n, setN] = useState(30);
  const [sorted, setSorted] = useState<number[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [sampleCount, setSampleCount] = useState(0);

  const handleSample = useCallback(() => {
    setSorted(generateSample(dist, n));
    setSampleCount((c) => c + 1);
    setHoveredIdx(null);
  }, [dist, n]);

  const qqPoints = useMemo(() => computeQQ(sorted), [sorted]);
  const stats = useMemo(() => computeStats(sorted), [sorted]);
  const corr = useMemo(() => qqCorrelation(qqPoints), [qqPoints]);

  const meta = DIST_META[dist];
  const isNormalLike = corr > 0.97;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-5">
      {/* 标题 */}
      <div>
        <h3 className="text-[15px] font-bold text-[var(--ink)]">样本分位数与 Q-Q 图</h3>
        <p className="text-[12px] text-[var(--ink-soft)] mt-0.5 leading-relaxed">
          从不同分布抽样，观察 Q-Q 图点是否沿对角线排列——这正是正态性检验的直觉。
        </p>
      </div>

      {/* 控制面板 */}
      <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-3 space-y-4">
        {/* 分布选择 */}
        <div>
          <div className="mb-2 text-[13px] font-semibold text-[var(--ink)]">总体分布</div>
          <div className="flex flex-wrap gap-2">
            {(["normal", "uniform", "exponential"] as Distribution[]).map((d) => {
              const m = DIST_META[d];
              const active = dist === d;
              return (
                <button
                  key={d}
                  onClick={() => { setDist(d); setSorted([]); setSampleCount(0); setHoveredIdx(null); }}
                  className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all"
                  style={{
                    background: active ? m.color : "transparent",
                    color: active ? "white" : m.color,
                    border: `1.5px solid ${m.color}`,
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 样本量滑块 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[var(--ink)]">样本量 n</span>
            <span
              className="rounded-md px-2 py-0.5 text-[13px] font-mono font-bold"
              style={{ background: meta.bg, color: meta.color }}
            >
              {n}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={1}
            value={n}
            onChange={(e) => { setN(Number(e.target.value)); setSorted([]); setSampleCount(0); setHoveredIdx(null); }}
            className="w-full h-1.5 cursor-pointer"
            style={{ accentColor: meta.color }}
          />
          <div className="flex justify-between text-[10px] text-[var(--ink-soft)]">
            <span>10</span><span>100</span>
          </div>
        </div>

        {/* 抽样按钮 */}
        <button
          onClick={handleSample}
          className="w-full rounded-lg py-2 text-[14px] font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{ background: meta.color }}
        >
          {sorted.length === 0 ? "▶ 开始抽样" : "↻ 重新抽样"}
          {sampleCount > 0 && (
            <span className="ml-2 text-[11px] opacity-80 font-normal">（第 {sampleCount} 次）</span>
          )}
        </button>
      </div>

      {/* 顺序统计量条形图 */}
      {sorted.length > 0 && (
        <div>
          <div className="mb-3 text-[12px] font-semibold text-[var(--ink)]">
            排序后样本（顺序统计量 x₍₁₎ ≤ x₍₂₎ ≤ … ≤ x₍ₙ₎）
          </div>
          <SortedBar sorted={sorted} dist={dist} hoveredIdx={hoveredIdx} onHover={setHoveredIdx} />
          <div className="mt-7" />
        </div>
      )}

      {/* Q-Q 图 */}
      {sorted.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[12px] font-semibold text-[var(--ink)]">Q-Q 图（悬停查看分位数详情）</div>
            {qqPoints.length > 0 && (
              <div
                className="rounded-md px-2 py-0.5 text-[11px] font-mono font-bold"
                style={{
                  background: isNormalLike ? ACCENT_LIGHT : ORANGE_LIGHT,
                  color: isNormalLike ? ACCENT : ORANGE,
                }}
              >
                相关系数 r = {corr.toFixed(4)}
              </div>
            )}
          </div>
          <QQPlot
            points={qqPoints}
            dist={dist}
            hoveredIdx={hoveredIdx}
            onHover={setHoveredIdx}
          />
        </div>
      )}

      {/* 正态性判断 */}
      {sorted.length > 0 && (
        <div
          className="rounded-lg border-2 p-3 text-[12px] leading-relaxed"
          style={{
            borderColor: isNormalLike ? ACCENT : ORANGE,
            background: isNormalLike ? ACCENT_LIGHT : ORANGE_LIGHT,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[15px]">{isNormalLike ? "✓" : "✗"}</span>
            <span
              className="font-bold text-[13px]"
              style={{ color: isNormalLike ? ACCENT : ORANGE }}
            >
              {isNormalLike ? "点接近对角线 → 可能来自正态总体" : "点偏离对角线 → 不服从正态分布"}
            </span>
          </div>
          <p style={{ color: isNormalLike ? "#3730a3" : "#9a3412" }}>
            {meta.desc}。
            {dist === "uniform" && " 均匀分布尾部「截断」，没有极端值，所以 Q-Q 图两端向内弯曲。"}
            {dist === "exponential" && " 指数分布右偏，有长右尾，样本最大值比正态分位数大很多，图形右端上翘。"}
            {dist === "normal" && " 多次抽样重试，n 越大点越贴近 y=x 对角线。"}
          </p>
        </div>
      )}

      {/* 统计摘要 */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {[
            { label: "均值 x̄", val: stats.mean.toFixed(3), color: meta.color, bg: meta.bg },
            { label: "标准差 s", val: stats.std.toFixed(3), color: "#475569", bg: "#f1f5f9" },
            { label: "中位数", val: stats.median.toFixed(3), color: "#475569", bg: "#f1f5f9" },
            { label: "Q₁", val: stats.q1.toFixed(3), color: "#475569", bg: "#f1f5f9" },
            { label: "Q₃", val: stats.q3.toFixed(3), color: "#475569", bg: "#f1f5f9" },
            {
              label: "偏度",
              val: stats.skewness.toFixed(3),
              color: Math.abs(stats.skewness) > 0.5 ? ORANGE : GREEN,
              bg: Math.abs(stats.skewness) > 0.5 ? ORANGE_LIGHT : GREEN_LIGHT,
            },
          ].map(({ label, val, color, bg }) => (
            <div key={label} className="rounded-lg p-2 text-center" style={{ background: bg }}>
              <div className="text-[10px] text-[var(--ink-soft)]">{label}</div>
              <div className="text-[14px] font-bold font-mono mt-0.5" style={{ color }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* 知识点洞察 */}
      <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2.5 text-[12px] text-[var(--ink-soft)] leading-relaxed space-y-1.5">
        <p>
          <span className="font-semibold text-[var(--ink)]">Q-Q 图的本质：</span>
          将样本第 k 个顺序统计量 x₍ₖ₎ 与正态分布的第 k/(n+1) 分位数对比。若样本来自正态总体，
          散点近似落在 <span className="font-mono">y = x</span> 对角线上；若有系统偏离，说明分布形态不同。
        </p>
        <p>
          <span className="font-semibold text-[var(--ink)]">正态性检验的直觉：</span>
          Shapiro-Wilk 检验、K-S 检验等都在量化这种偏离程度。
          这里的 Q-Q 相关系数 r 越接近 1，越支持正态性。
        </p>
        <p>
          <span className="font-semibold text-[var(--ink)]">提示：</span>
          多点击「重新抽样」感受抽样随机性——n 小时点散漫，n=100 时规律清晰。
        </p>
      </div>
    </div>
  );
}
