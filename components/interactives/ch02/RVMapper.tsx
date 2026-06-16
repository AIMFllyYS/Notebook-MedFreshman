"use client";

import { useState, useCallback } from "react";

// ─── 设计常量 ────────────────────────────────────────────────────────────────
const ACCENT = "#5b46e5";
const ACCENT_LIGHT = "#ede9fe";
const INK = "#1a1a2e";
const INK_SOFT = "#6b7280";
const LINE = "#e5e7eb";
const BG_MUTED = "#f8f9fc";
const BAR_COLORS = [
  "#5b46e5", "#7c3aed", "#0ea5e9", "#059669", "#d97706", "#dc2626",
];

// ─── 类型定义 ─────────────────────────────────────────────────────────────────
interface DieOutcome {
  face: number;   // 1–6，骰子点数
  xValue: number; // 用户指定的 X 值
}

type PresetKey = "identity" | "oddEven" | "square" | "sign" | "custom";

interface Preset {
  key: PresetKey;
  label: string;
  fn: (face: number) => number;
  description: string;
}

// ─── 预设变换 ─────────────────────────────────────────────────────────────────
const PRESETS: Preset[] = [
  {
    key: "identity",
    label: "X = 点数",
    fn: (f) => f,
    description: "最简单：X 直接等于骰子点数，六个样本点映射到六个不同实数值。",
  },
  {
    key: "oddEven",
    label: "X = 奇偶",
    fn: (f) => (f % 2 === 1 ? 1 : 0),
    description: "X=1 表示奇数（1,3,5），X=0 表示偶数（2,4,6）。多对一映射，P(X=1)=P(X=0)=1/2。",
  },
  {
    key: "square",
    label: "X = 点数²",
    fn: (f) => f * f,
    description: "X = 点数的平方：1,4,9,16,25,36。每个值概率仍为 1/6，但值域分布极不均匀。",
  },
  {
    key: "sign",
    label: "X = ⌊点数/2⌋",
    fn: (f) => Math.floor(f / 2),
    description: "X 将 6 个点数压缩为 3 个值：0(点数1),1(点数2,3),2(点数4,5),3(点数6)。",
  },
  {
    key: "custom",
    label: "自定义",
    fn: (f) => f,
    description: "点击各样本点的数字输入框，自由设定 X 值，观察分布律变化。",
  },
];

function getInitialOutcomes(presetFn: (f: number) => number): DieOutcome[] {
  return [1, 2, 3, 4, 5, 6].map((face) => ({
    face,
    xValue: presetFn(face),
  }));
}

// ─── 骰子面 SVG ───────────────────────────────────────────────────────────────
const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 25], [72, 25], [28, 50], [72, 50], [28, 75], [72, 75]],
};

interface DieFaceProps {
  face: number;
  selected: boolean;
  onClick: () => void;
}

function DieFace({ face, selected, onClick }: DieFaceProps) {
  const dots = DOT_POSITIONS[face] ?? [];
  return (
    <button
      onClick={onClick}
      className="rounded-xl border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1"
      style={{
        borderColor: selected ? ACCENT : LINE,
        background: selected ? ACCENT_LIGHT : "white",
        boxShadow: selected ? `0 0 0 2px ${ACCENT}44` : "0 1px 3px rgba(0,0,0,0.08)",
        padding: 0,
        width: 52,
        height: 52,
        flexShrink: 0,
      }}
      aria-label={`骰子点数 ${face}`}
    >
      <svg viewBox="0 0 100 100" width={44} height={44} style={{ display: "block", margin: "auto" }}>
        {dots.map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={9}
            fill={selected ? ACCENT : INK}
          />
        ))}
      </svg>
    </button>
  );
}

// ─── 计算分布律 ───────────────────────────────────────────────────────────────
interface DistEntry {
  xVal: number;
  faces: number[];
  prob: number; // = faces.length / 6
}

function computeDistribution(outcomes: DieOutcome[]): DistEntry[] {
  const map = new Map<number, number[]>();
  for (const { face, xValue } of outcomes) {
    const existing = map.get(xValue);
    if (existing) {
      existing.push(face);
    } else {
      map.set(xValue, [face]);
    }
  }
  return Array.from(map.entries())
    .map(([xVal, faces]) => ({ xVal, faces, prob: faces.length / 6 }))
    .sort((a, b) => a.xVal - b.xVal);
}

// ─── 柱状图 ───────────────────────────────────────────────────────────────────
const CHART_W = 420;
const CHART_H = 160;
const CHART_PL = 44;
const CHART_PR = 12;
const CHART_PT = 16;
const CHART_PB = 36;

interface DistChartProps {
  dist: DistEntry[];
  hoveredX: number | null;
  onHover: (x: number | null) => void;
}

function DistChart({ dist, hoveredX, onHover }: DistChartProps) {
  const innerW = CHART_W - CHART_PL - CHART_PR;
  const innerH = CHART_H - CHART_PT - CHART_PB;

  const maxProb = Math.max(...dist.map((d) => d.prob), 1 / 6);
  const yScale = (p: number) => innerH - (p / maxProb) * innerH;
  const yPx = (p: number) => CHART_PT + yScale(p);

  // y 轴刻度
  const yTicks: number[] = [];
  const step = maxProb <= 1 / 6 ? 1 / 6 : maxProb <= 3 / 6 ? 1 / 6 : 2 / 6;
  for (let v = 0; v <= maxProb + 0.001; v += step) {
    yTicks.push(Math.round(v * 6) / 6);
  }

  const barCount = dist.length;
  const totalBarWidth = innerW;
  const barW = Math.min(48, (totalBarWidth / Math.max(barCount, 1)) * 0.6);
  const spacing = barCount > 1 ? totalBarWidth / (barCount - 1) : 0;
  const barX = (i: number) =>
    barCount === 1
      ? CHART_PL + innerW / 2
      : CHART_PL + i * spacing;

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full rounded-lg border"
      style={{ borderColor: LINE, background: BG_MUTED, maxHeight: 180 }}
      onMouseLeave={() => onHover(null)}
    >
      {/* 网格线 */}
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={CHART_PL}
            y1={yPx(v)}
            x2={CHART_W - CHART_PR}
            y2={yPx(v)}
            stroke={v === 0 ? "#d1d5db" : "#e5e7eb"}
            strokeWidth={v === 0 ? 1.5 : 1}
          />
          <text
            x={CHART_PL - 6}
            y={yPx(v) + 4}
            fontSize={9}
            textAnchor="end"
            fill={INK_SOFT}
          >
            {v === 0 ? "0" : `${Math.round(v * 6)}/6`}
          </text>
        </g>
      ))}

      {/* y 轴标签 */}
      <text
        x={8}
        y={CHART_PT + innerH / 2}
        fontSize={9}
        fill={INK_SOFT}
        textAnchor="middle"
        transform={`rotate(-90, 8, ${CHART_PT + innerH / 2})`}
      >
        P(X=x)
      </text>

      {/* 柱子 */}
      {dist.map((d, i) => {
        const cx = barX(i);
        const topY = yPx(d.prob);
        const bottomY = yPx(0);
        const barH = bottomY - topY;
        const isHovered = hoveredX === d.xVal;
        const color = BAR_COLORS[i % BAR_COLORS.length];

        return (
          <g
            key={d.xVal}
            onMouseEnter={() => onHover(d.xVal)}
            style={{ cursor: "pointer" }}
          >
            {/* 柱子 */}
            <rect
              x={cx - barW / 2}
              y={topY}
              width={barW}
              height={Math.max(barH, 0)}
              fill={color}
              opacity={isHovered ? 1 : 0.78}
              rx={3}
            />
            {/* hover 时高亮背景 */}
            {isHovered && (
              <rect
                x={cx - barW / 2 - 4}
                y={CHART_PT}
                width={barW + 8}
                height={innerH}
                fill={color}
                opacity={0.08}
                rx={4}
              />
            )}
            {/* 概率标签（柱顶） */}
            <text
              x={cx}
              y={topY - 4}
              fontSize={9}
              textAnchor="middle"
              fill={color}
              fontWeight={700}
            >
              {d.faces.length}/6
            </text>
            {/* x 轴标签 */}
            <text
              x={cx}
              y={CHART_H - CHART_PB + 14}
              fontSize={10}
              textAnchor="middle"
              fill={isHovered ? ACCENT : INK_SOFT}
              fontWeight={isHovered ? 700 : 400}
            >
              {d.xVal}
            </text>
          </g>
        );
      })}

      {/* x 轴标签 "x" */}
      <text
        x={CHART_W - CHART_PR}
        y={CHART_H - CHART_PB + 14}
        fontSize={10}
        textAnchor="end"
        fill={INK_SOFT}
        fontStyle="italic"
      >
        x
      </text>
    </svg>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function RVMapper() {
  const [activePreset, setActivePreset] = useState<PresetKey>("identity");
  const [outcomes, setOutcomes] = useState<DieOutcome[]>(() =>
    getInitialOutcomes(PRESETS.find((p) => p.key === "identity")!.fn)
  );
  const [selectedFace, setSelectedFace] = useState<number | null>(null);
  const [hoveredX, setHoveredX] = useState<number | null>(null);

  // 切换预设
  const applyPreset = useCallback((preset: Preset) => {
    setActivePreset(preset.key);
    if (preset.key !== "custom") {
      setOutcomes(getInitialOutcomes(preset.fn));
    }
    setSelectedFace(null);
  }, []);

  // 更新某个样本点的 X 值
  const updateXValue = useCallback((face: number, val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    setOutcomes((prev) =>
      prev.map((o) => (o.face === face ? { ...o, xValue: num } : o))
    );
    // 一旦手动编辑，切换到 custom 模式
    setActivePreset("custom");
  }, []);

  const dist = computeDistribution(outcomes);
  const currentPreset = PRESETS.find((p) => p.key === activePreset)!;

  // 当前悬停 X 值对应的样本点
  const hoveredFaces = hoveredX !== null
    ? dist.find((d) => d.xVal === hoveredX)?.faces ?? []
    : [];

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-5">
      {/* 标题区 */}
      <div>
        <h3 className="text-[15px] font-bold" style={{ color: INK }}>
          随机变量映射器
        </h3>
        <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: INK_SOFT }}>
          掷一颗骰子，样本空间 Ω = &#123;1, 2, 3, 4, 5, 6&#125;。为每个样本点 ω 指定实数值 X(ω)，
          即定义了一个<b style={{ color: INK }}>随机变量</b>。底部实时展示 X 的分布律 P(X=x)。
        </p>
      </div>

      {/* 预设变换按钮 */}
      <div>
        <div className="mb-2 text-[12px] font-semibold" style={{ color: INK }}>
          选择变换预设
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.key}
              onClick={() => applyPreset(preset)}
              className="rounded-lg px-2.5 py-1 text-[12px] font-medium transition-all duration-150"
              style={{
                background: activePreset === preset.key ? ACCENT : BG_MUTED,
                color: activePreset === preset.key ? "white" : INK_SOFT,
                border: `1px solid ${activePreset === preset.key ? ACCENT : LINE}`,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
        {/* 预设说明 */}
        <p
          className="mt-2 text-[11px] leading-relaxed rounded-lg px-3 py-2"
          style={{ background: ACCENT_LIGHT, color: ACCENT }}
        >
          {currentPreset.description}
        </p>
      </div>

      {/* 映射区：样本点 → X 值 */}
      <div
        className="rounded-xl p-4"
        style={{ background: BG_MUTED, border: `1px solid ${LINE}` }}
      >
        <div className="mb-3 text-[12px] font-semibold" style={{ color: INK }}>
          定义映射 X : Ω → ℝ
        </div>
        <div className="flex flex-col gap-2.5">
          {outcomes.map(({ face, xValue }) => {
            const isHighlighted = hoveredFaces.includes(face);
            const isSelected = selectedFace === face;
            return (
              <div
                key={face}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-150"
                style={{
                  background: isHighlighted
                    ? ACCENT_LIGHT
                    : isSelected
                    ? "#f5f3ff"
                    : "white",
                  border: `1px solid ${isHighlighted ? ACCENT : isSelected ? "#c4b5fd" : LINE}`,
                }}
              >
                {/* 骰子图标 */}
                <DieFace
                  face={face}
                  selected={isHighlighted || isSelected}
                  onClick={() =>
                    setSelectedFace(selectedFace === face ? null : face)
                  }
                />

                {/* 映射箭头 */}
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-[13px]" style={{ color: INK_SOFT }}>
                    ω = {face}
                  </span>
                  <svg width={28} height={14} className="flex-shrink-0">
                    <defs>
                      <marker
                        id={`arrow-${face}`}
                        markerWidth={6}
                        markerHeight={6}
                        refX={3}
                        refY={3}
                        orient="auto"
                      >
                        <path
                          d="M0,0 L0,6 L6,3 z"
                          fill={isHighlighted ? ACCENT : "#9ca3af"}
                        />
                      </marker>
                    </defs>
                    <line
                      x1={2}
                      y1={7}
                      x2={20}
                      y2={7}
                      stroke={isHighlighted ? ACCENT : "#9ca3af"}
                      strokeWidth={1.5}
                      markerEnd={`url(#arrow-${face})`}
                    />
                  </svg>
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: isHighlighted ? ACCENT : INK }}
                  >
                    X =
                  </span>
                </div>

                {/* X 值输入框 */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={xValue}
                    onChange={(e) => updateXValue(face, e.target.value)}
                    onFocus={() => setSelectedFace(face)}
                    onBlur={() => setSelectedFace(null)}
                    className="w-[70px] rounded-lg border px-2 py-1 text-[13px] font-mono font-bold text-center transition-all focus:outline-none focus:ring-2"
                    style={{
                      borderColor: isHighlighted ? ACCENT : LINE,
                      background: isHighlighted ? "white" : BG_MUTED,
                      color: isHighlighted ? ACCENT : INK,
                      boxShadow: isHighlighted ? `0 0 0 2px ${ACCENT}33` : "none",
                    }}
                    step="1"
                  />
                  <span className="text-[11px]" style={{ color: INK_SOFT }}>
                    P = 1/6
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 分布律图表 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[12px] font-semibold" style={{ color: INK }}>
            分布律 P(X = x)
          </div>
          <div className="text-[11px]" style={{ color: INK_SOFT }}>
            共 <b style={{ color: INK }}>{dist.length}</b> 个不同取值，
            概率之和 ={" "}
            <b style={{ color: ACCENT }}>
              {dist.reduce((s, d) => s + d.prob, 0).toFixed(4)}
            </b>
          </div>
        </div>
        <DistChart dist={dist} hoveredX={hoveredX} onHover={setHoveredX} />
      </div>

      {/* 分布律表格 */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: `1px solid ${LINE}` }}
      >
        <table className="w-full text-[12px]">
          <thead>
            <tr style={{ background: BG_MUTED }}>
              <th
                className="px-3 py-2 text-left font-semibold"
                style={{ color: INK, borderBottom: `1px solid ${LINE}` }}
              >
                x（取值）
              </th>
              {dist.map((d) => (
                <th
                  key={d.xVal}
                  className="px-3 py-2 text-center font-mono font-bold transition-colors"
                  style={{
                    color: hoveredX === d.xVal ? ACCENT : INK,
                    background:
                      hoveredX === d.xVal ? ACCENT_LIGHT : "transparent",
                    borderBottom: `1px solid ${LINE}`,
                  }}
                  onMouseEnter={() => setHoveredX(d.xVal)}
                  onMouseLeave={() => setHoveredX(null)}
                >
                  {d.xVal}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                className="px-3 py-2 font-semibold"
                style={{ color: INK_SOFT, borderBottom: `1px solid ${LINE}` }}
              >
                P(X = x)
              </td>
              {dist.map((d) => (
                <td
                  key={d.xVal}
                  className="px-3 py-2 text-center font-mono transition-colors"
                  style={{
                    color: hoveredX === d.xVal ? ACCENT : INK,
                    fontWeight: hoveredX === d.xVal ? 700 : 400,
                    background:
                      hoveredX === d.xVal ? ACCENT_LIGHT : "transparent",
                    borderBottom: `1px solid ${LINE}`,
                  }}
                  onMouseEnter={() => setHoveredX(d.xVal)}
                  onMouseLeave={() => setHoveredX(null)}
                >
                  {d.faces.length}/6
                </td>
              ))}
            </tr>
            <tr style={{ background: BG_MUTED }}>
              <td
                className="px-3 py-2 text-[11px]"
                style={{ color: INK_SOFT }}
              >
                对应样本点
              </td>
              {dist.map((d) => (
                <td
                  key={d.xVal}
                  className="px-3 py-2 text-center text-[11px] transition-colors"
                  style={{
                    color: hoveredX === d.xVal ? ACCENT : INK_SOFT,
                    background:
                      hoveredX === d.xVal ? ACCENT_LIGHT : "transparent",
                  }}
                  onMouseEnter={() => setHoveredX(d.xVal)}
                  onMouseLeave={() => setHoveredX(null)}
                >
                  &#123;{d.faces.join(", ")}&#125;
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 洞察区 */}
      <div
        className="rounded-lg px-3 py-2.5 text-[12px] leading-relaxed space-y-2"
        style={{
          background: BG_MUTED,
          border: `1px solid ${LINE}`,
          color: INK_SOFT,
        }}
      >
        <div>
          <span className="font-semibold" style={{ color: INK }}>
            核心概念：
          </span>
          随机变量 X 是从样本空间 Ω 到实数 ℝ 的<b style={{ color: INK }}>函数</b>。
          它把随机试验的结果"数值化"，使我们能用数学工具分析概率。
        </div>
        <div>
          <span className="font-semibold" style={{ color: INK }}>
            分布律归一：
          </span>
          不论如何设置 X 值，所有概率之和始终等于 1。
          这是因为骰子 6 个等可能结果的概率之和 = 6 × (1/6) = 1。
        </div>
        {dist.length < 6 && (
          <div>
            <span className="font-semibold" style={{ color: ACCENT }}>
              多对一映射：
            </span>
            当前有多个样本点映射到相同 X 值，形成"合并"效果，该取值的概率变大——
            这正是随机变量强大之处：通过变换揭示概率的结构。
          </div>
        )}
      </div>
    </div>
  );
}
