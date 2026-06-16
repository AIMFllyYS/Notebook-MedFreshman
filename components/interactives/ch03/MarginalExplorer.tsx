"use client";

import { useState, Fragment } from "react";

// ─── 设计常量 ────────────────────────────────────────────────────────────────
const ACCENT = "#5b46e5";
const ACCENT_LIGHT = "#ede9fe";
const ACCENT_MID = "#7c6af0";
const TEAL = "#0d9488";
const TEAL_LIGHT = "#ccfbf1";
const ORANGE = "#ea580c";
const ORANGE_LIGHT = "#ffedd5";
const GRAY_BG = "#f4f5f9";

// ─── 热力图色阶 ───────────────────────────────────────────────────────────────
function heatColor(ratio: number): string {
  const stops: [number, number, number][] = [
    [240, 238, 255],
    [189, 176, 255],
    [124, 106, 240],
    [63, 39, 186],
  ];
  const t = Math.max(0, Math.min(1, ratio));
  const seg = t * (stops.length - 1);
  const i = Math.min(Math.floor(seg), stops.length - 2);
  const f = seg - i;
  const a = stops[i];
  const b = stops[i + 1];
  return `rgb(${Math.round(a[0] + f * (b[0] - a[0]))},${Math.round(a[1] + f * (b[1] - a[1]))},${Math.round(a[2] + f * (b[2] - a[2]))})`;
}

// ─── 类型 ─────────────────────────────────────────────────────────────────────
type Mode = "rowSelect" | "colSelect";
type Tab = "main" | "counterexample";

// ─── 预设联合分布 ──────────────────────────────────────────────────────────────
const PRESET_MAIN: number[][] = [
  [0.10, 0.08, 0.06],
  [0.12, 0.18, 0.10],
  [0.08, 0.14, 0.14],
];

// 反例：两组不同联合分布，但边缘分布完全相同
// 联合分布 A
const CE_A: number[][] = [
  [0.2, 0.1, 0.1],
  [0.1, 0.2, 0.1],
  [0.1, 0.1, 0.0],
];
// 联合分布 B（不同于 A，但行/列之和相同）
const CE_B: number[][] = [
  [0.15, 0.15, 0.1],
  [0.15, 0.1, 0.15],
  [0.1, 0.05, 0.05],
];

const X_LABELS = ["x₁", "x₂", "x₃"];
const Y_LABELS = ["y₁", "y₂", "y₃"];

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
function normalize(raw: number[][]): number[][] {
  let sum = 0;
  for (const row of raw) for (const v of row) sum += Math.max(0, v);
  if (sum === 0) return raw.map((row) => row.map(() => 1 / 9));
  return raw.map((row) => row.map((v) => Math.max(0, v) / sum));
}

function marginalX(p: number[][]): number[] {
  return p.map((row) => row.reduce((s, v) => s + v, 0));
}

function marginalY(p: number[][]): number[] {
  const n = p[0].length;
  return Array.from({ length: n }, (_, j) =>
    p.reduce((s, row) => s + row[j], 0)
  );
}

function fmt4(v: number): string {
  return v.toFixed(4);
}

function randomRaw(n: number): number[][] {
  return Array.from({ length: n }, () =>
    Array.from({ length: n }, () => Math.random())
  );
}

// ─── 热力图尺寸常量 ────────────────────────────────────────────────────────────
const CELL = 56;
const MARGIN_L = 30;
const MARGIN_T = 24;

// ─── 子组件：单个条形图（边缘分布可视化）────────────────────────────────────────
interface MarginalBarProps {
  values: number[];
  labels: string[];
  color: string;
  lightColor: string;
  highlightIdx: number | null;
  direction: "horizontal" | "vertical";
}

function MarginalBar({ values, labels, color, lightColor, highlightIdx, direction }: MarginalBarProps) {
  const maxVal = Math.max(...values, 0.001);

  if (direction === "horizontal") {
    // 横排，每个条形从左到右
    return (
      <div className="flex flex-col gap-1.5">
        {values.map((v, i) => {
          const pct = v / maxVal;
          const isHL = highlightIdx === i;
          return (
            <div
              key={i}
              className="flex items-center gap-2"
              style={{ opacity: highlightIdx === null || isHL ? 1 : 0.3, transition: "opacity 0.25s" }}
            >
              <span
                className="text-[12px] font-semibold w-6 text-right flex-shrink-0"
                style={{ color: isHL ? color : "#9ca3af" }}
              >
                {labels[i]}
              </span>
              <div
                className="relative h-7 rounded-md overflow-hidden flex-1"
                style={{ background: lightColor, minWidth: 60 }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-md"
                  style={{
                    width: `${pct * 100}%`,
                    background: isHL ? color : `${color}80`,
                    transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
                  }}
                />
                <span
                  className="absolute inset-0 flex items-center justify-end pr-2 text-[11px] font-mono font-bold"
                  style={{ color: pct > 0.5 ? "#fff" : color }}
                >
                  {fmt4(v)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 竖排，每个条形从底到顶
  const BAR_H = 80;
  return (
    <div className="flex gap-3 items-end justify-center" style={{ height: BAR_H + 36 }}>
      {values.map((v, j) => {
        const pct = v / maxVal;
        const isHL = highlightIdx === j;
        const barH = Math.round(pct * BAR_H);
        return (
          <div
            key={j}
            className="flex flex-col items-center gap-1"
            style={{ opacity: highlightIdx === null || isHL ? 1 : 0.3, transition: "opacity 0.25s" }}
          >
            <span
              className="text-[10px] font-mono font-bold"
              style={{ color: isHL ? color : "#9ca3af" }}
            >
              {fmt4(v)}
            </span>
            <div
              className="w-8 rounded-t-md"
              style={{
                height: barH,
                background: isHL ? color : `${color}80`,
                minHeight: 2,
                transition: "height 0.35s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
            <span
              className="text-[12px] font-semibold"
              style={{ color: isHL ? color : "#9ca3af" }}
            >
              {labels[j]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── 热力图主体 ───────────────────────────────────────────────────────────────
interface HeatmapProps {
  p: number[][];
  selectedRow: number | null;
  selectedCol: number | null;
  mode: Mode;
  onRowClick: (i: number) => void;
  onColClick: (j: number) => void;
}

function Heatmap({ p, selectedRow, selectedCol, mode, onRowClick, onColClick }: HeatmapProps) {
  const maxP = Math.max(...p.flatMap((r) => r), 0.001);
  const N = p.length;
  const W = MARGIN_L + N * CELL + 4;
  const H = MARGIN_T + N * CELL + 4;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ maxWidth: 240, userSelect: "none" }}
    >
      {/* Y 标签（顶部）+ 可点击 */}
      {Y_LABELS.map((yl, j) => {
        const isHL = mode === "colSelect" && selectedCol === j;
        return (
          <g key={j} style={{ cursor: "pointer" }} onClick={() => onColClick(j)}>
            <rect
              x={MARGIN_L + j * CELL}
              y={0}
              width={CELL}
              height={MARGIN_T}
              fill={isHL ? ACCENT_LIGHT : "transparent"}
              rx={4}
            />
            <text
              x={MARGIN_L + j * CELL + CELL / 2}
              y={MARGIN_T - 6}
              textAnchor="middle"
              fontSize="12"
              fontWeight={isHL ? "800" : "600"}
              fill={isHL ? ACCENT : "#6b7280"}
            >
              {yl}
            </text>
          </g>
        );
      })}

      {/* X 标签（左侧）+ 可点击 */}
      {X_LABELS.map((xl, i) => {
        const isHL = mode === "rowSelect" && selectedRow === i;
        return (
          <g key={i} style={{ cursor: "pointer" }} onClick={() => onRowClick(i)}>
            <rect
              x={0}
              y={MARGIN_T + i * CELL}
              width={MARGIN_L}
              height={CELL}
              fill={isHL ? ACCENT_LIGHT : "transparent"}
              rx={4}
            />
            <text
              x={MARGIN_L - 5}
              y={MARGIN_T + i * CELL + CELL / 2 + 4}
              textAnchor="end"
              fontSize="12"
              fontWeight={isHL ? "800" : "600"}
              fill={isHL ? ACCENT : "#6b7280"}
            >
              {xl}
            </text>
          </g>
        );
      })}

      {/* 主格子 */}
      {p.map((row, i) =>
        row.map((val, j) => {
          const cx = MARGIN_L + j * CELL;
          const cy = MARGIN_T + i * CELL;
          const ratio = val / maxP;

          // 判断高亮
          const rowHL = mode === "rowSelect" && selectedRow === i;
          const colHL = mode === "colSelect" && selectedCol === j;
          const dimmed =
            (mode === "rowSelect" && selectedRow !== null && selectedRow !== i) ||
            (mode === "colSelect" && selectedCol !== null && selectedCol !== j);

          const bgColor = heatColor(ratio);
          const textColor = ratio > 0.55 ? "#ffffff" : ACCENT;

          return (
            <g key={`${i}-${j}`}>
              <rect
                x={cx + 1}
                y={cy + 1}
                width={CELL - 2}
                height={CELL - 2}
                rx={6}
                fill={bgColor}
                opacity={dimmed ? 0.2 : 1}
                stroke={rowHL || colHL ? ACCENT : "transparent"}
                strokeWidth={rowHL || colHL ? 2.5 : 0}
                style={{ transition: "opacity 0.25s" }}
              />
              <text
                x={cx + CELL / 2}
                y={cy + CELL / 2 + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill={textColor}
                opacity={dimmed ? 0.3 : 1}
                style={{ pointerEvents: "none", transition: "opacity 0.25s" }}
              >
                {fmt4(val)}
              </text>
            </g>
          );
        })
      )}

      {/* 行高亮覆盖框 */}
      {mode === "rowSelect" && selectedRow !== null && (
        <rect
          x={MARGIN_L + 1}
          y={MARGIN_T + selectedRow * CELL + 1}
          width={N * CELL - 2}
          height={CELL - 2}
          rx={6}
          fill="none"
          stroke={ACCENT}
          strokeWidth={2.5}
          strokeDasharray="5 3"
          opacity={0.6}
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* 列高亮覆盖框 */}
      {mode === "colSelect" && selectedCol !== null && (
        <rect
          x={MARGIN_L + selectedCol * CELL + 1}
          y={MARGIN_T + 1}
          width={CELL - 2}
          height={N * CELL - 2}
          rx={6}
          fill="none"
          stroke={TEAL}
          strokeWidth={2.5}
          strokeDasharray="5 3"
          opacity={0.6}
          style={{ pointerEvents: "none" }}
        />
      )}
    </svg>
  );
}

// ─── 反例热力图（仅展示，不交互）────────────────────────────────────────────────
interface MiniHeatProps {
  p: number[][];
  label: string;
}

function MiniHeat({ p, label }: MiniHeatProps) {
  const maxP = Math.max(...p.flatMap((r) => r), 0.001);
  const N = p.length;
  const C = 44;
  const ML = 24;
  const MT = 18;
  const W = ML + N * C + 4;
  const H = MT + N * C + 4;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[12px] font-semibold text-[var(--ink)]">{label}</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, userSelect: "none" }}>
        {Y_LABELS.map((yl, j) => (
          <text key={j} x={ML + j * C + C / 2} y={MT - 4} textAnchor="middle" fontSize="10" fill="#9ca3af">{yl}</text>
        ))}
        {X_LABELS.map((xl, i) => (
          <text key={i} x={ML - 4} y={MT + i * C + C / 2 + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{xl}</text>
        ))}
        {p.map((row, i) =>
          row.map((val, j) => {
            const ratio = val / maxP;
            const textColor = ratio > 0.55 ? "#ffffff" : ACCENT;
            return (
              <g key={`${i}-${j}`}>
                <rect x={ML + j * C + 1} y={MT + i * C + 1} width={C - 2} height={C - 2} rx={5} fill={heatColor(ratio)} />
                <text x={ML + j * C + C / 2} y={MT + i * C + C / 2 + 4} textAnchor="middle" fontSize="9" fontWeight="700" fill={textColor} style={{ pointerEvents: "none" }}>
                  {val.toFixed(2)}
                </text>
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function MarginalExplorer() {
  const [tab, setTab] = useState<Tab>("main");
  const [raw, setRaw] = useState<number[][]>(PRESET_MAIN.map((r) => [...r]));
  const [mode, setMode] = useState<Mode>("rowSelect");
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCol, setSelectedCol] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<[number, number] | null>(null);
  const [editInput, setEditInput] = useState<string>("");

  // 归一化
  const p = normalize(raw);
  const pX = marginalX(p);
  const pY = marginalY(p);

  // 当前高亮行/列的原始概率行向量（边缘展示用）
  const highlightedRowProbs: number[] | null =
    mode === "rowSelect" && selectedRow !== null ? p[selectedRow] : null;
  const highlightedColProbs: number[] | null =
    mode === "colSelect" && selectedCol !== null
      ? p.map((row) => row[selectedCol!])
      : null;

  // 计算当前选中行的边缘概率（行求和即为 pX[i]）
  const currentMarginalVal: number | null =
    mode === "rowSelect" && selectedRow !== null
      ? pX[selectedRow]
      : mode === "colSelect" && selectedCol !== null
      ? pY[selectedCol]
      : null;

  const currentLabel: string =
    mode === "rowSelect" && selectedRow !== null
      ? `P(X=x${selectedRow + 1}) = Σⱼ p(x${selectedRow + 1},yⱼ)`
      : mode === "colSelect" && selectedCol !== null
      ? `P(Y=y${selectedCol + 1}) = Σᵢ p(xᵢ,y${selectedCol + 1})`
      : "";

  // 输入处理
  function handleInputChange(i: number, j: number, val: string) {
    setEditInput(val);
    setEditingCell([i, j]);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setRaw((prev) =>
        prev.map((row, ri) => row.map((v, ci) => (ri === i && ci === j ? num : v)))
      );
    }
  }

  function handleInputFocus(i: number, j: number) {
    setEditingCell([i, j]);
    setEditInput(raw[i][j].toString());
  }

  function handleInputBlur() {
    setEditingCell(null);
    setEditInput("");
  }

  function handleRandom() {
    setRaw(randomRaw(3));
    setSelectedRow(null);
    setSelectedCol(null);
  }

  function handleReset() {
    setRaw(PRESET_MAIN.map((r) => [...r]));
    setSelectedRow(null);
    setSelectedCol(null);
  }

  function handleRowClick(i: number) {
    if (mode !== "rowSelect") return;
    setSelectedRow((prev) => (prev === i ? null : i));
    setSelectedCol(null);
  }

  function handleColClick(j: number) {
    if (mode !== "colSelect") return;
    setSelectedCol((prev) => (prev === j ? null : j));
    setSelectedRow(null);
  }

  function handleModeChange(m: Mode) {
    setMode(m);
    setSelectedRow(null);
    setSelectedCol(null);
  }

  // 反例：计算 CE_A、CE_B 的边缘分布
  const pA = normalize(CE_A);
  const pB = normalize(CE_B);
  const pXA = marginalX(pA);
  const pYA = marginalY(pA);
  const pXB = marginalX(pB);
  const pYB = marginalY(pB);

  const marginalsMatch =
    pXA.every((v, i) => Math.abs(v - pXB[i]) < 0.001) &&
    pYA.every((v, j) => Math.abs(v - pYB[j]) < 0.001);

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-4">
      {/* 标题 */}
      <div>
        <h3 className="text-[15px] font-bold text-[var(--ink)]">边缘分布提取演示</h3>
        <p className="text-[12px] text-[var(--ink-soft)] mt-0.5">
          点击行号提取 X 的边缘分布（对 Y 求和），点击列号提取 Y 的边缘分布（对 X 求和）——直观体会「投影」的含义。
        </p>
      </div>

      {/* 标签页 */}
      <div className="flex gap-1 rounded-lg bg-[var(--bg-muted)] p-1">
        {([
          { key: "main", label: "主探索器" },
          { key: "counterexample", label: "反例：同边缘，异联合" },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={
              "flex-1 rounded-md py-1.5 text-[12px] font-medium transition-colors " +
              (tab === key
                ? "bg-white shadow-sm text-[var(--ink)]"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]")
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* ──────────── 主探索器 ──────────── */}
      {tab === "main" && (
        <div className="space-y-4">
          {/* 模式切换 */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[12px] text-[var(--ink-soft)]">投影方向：</span>
            <button
              onClick={() => handleModeChange("rowSelect")}
              className={
                "rounded-lg px-3 py-1 text-[12px] font-medium transition-colors " +
                (mode === "rowSelect"
                  ? "text-white"
                  : "bg-[var(--bg-muted)] text-[var(--ink-soft)]")
              }
              style={{ background: mode === "rowSelect" ? ACCENT : undefined }}
            >
              固定 X → 对 Y 求和
            </button>
            <button
              onClick={() => handleModeChange("colSelect")}
              className={
                "rounded-lg px-3 py-1 text-[12px] font-medium transition-colors " +
                (mode === "colSelect"
                  ? "text-white"
                  : "bg-[var(--bg-muted)] text-[var(--ink-soft)]")
              }
              style={{ background: mode === "colSelect" ? TEAL : undefined }}
            >
              固定 Y → 对 X 求和
            </button>
            <button
              onClick={handleRandom}
              className="ml-auto rounded-lg px-2.5 py-1 text-[12px] font-medium bg-[var(--bg-muted)] text-[var(--ink-soft)] hover:bg-[var(--accent-weak,#ede9fe)] transition-colors"
            >
              随机
            </button>
            <button
              onClick={handleReset}
              className="rounded-lg px-2.5 py-1 text-[12px] font-medium bg-[var(--bg-muted)] text-[var(--ink-soft)] hover:bg-[var(--line,#e9ebf2)] transition-colors"
            >
              重置
            </button>
          </div>

          {/* 提示文字 */}
          <div
            className="rounded-lg px-3 py-2 text-[12px] font-medium border"
            style={{
              borderColor: mode === "rowSelect" ? `${ACCENT}40` : `${TEAL}40`,
              background: mode === "rowSelect" ? ACCENT_LIGHT : TEAL_LIGHT,
              color: mode === "rowSelect" ? ACCENT : TEAL,
            }}
          >
            {mode === "rowSelect"
              ? "点击左侧行标签（x₁/x₂/x₃）高亮整行，右侧条形图即为 P(X=xᵢ) = Σⱼ p(xᵢ,yⱼ)"
              : "点击顶部列标签（y₁/y₂/y₃）高亮整列，下方条形图即为 P(Y=yⱼ) = Σᵢ p(xᵢ,yⱼ)"}
          </div>

          {/* 核心布局 */}
          <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
            {/* 左：可编辑输入网格 */}
            <div className="flex-shrink-0">
              <p className="text-[11px] text-[var(--ink-soft)] mb-1.5">输入任意正数（自动归一化）</p>
              <div className="grid gap-1" style={{ gridTemplateColumns: "auto repeat(3, 68px)" }}>
                <div className="text-[11px] text-[var(--ink-soft)] flex items-end justify-center pb-1">X↓ Y→</div>
                {Y_LABELS.map((yl) => (
                  <div key={yl} className="text-center text-[12px] font-semibold text-[var(--ink)]">{yl}</div>
                ))}
                {raw.map((row, i) => (
                  <Fragment key={`row-${i}`}>
                    <div className="flex items-center justify-center text-[12px] font-semibold text-[var(--ink)]">
                      {X_LABELS[i]}
                    </div>
                    {row.map((v, j) => {
                      const isEditing = editingCell !== null && editingCell[0] === i && editingCell[1] === j;
                      return (
                        <input
                          key={`inp-${i}-${j}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={isEditing ? editInput : v.toFixed(2)}
                          onChange={(e) => handleInputChange(i, j, e.target.value)}
                          onFocus={() => handleInputFocus(i, j)}
                          onBlur={handleInputBlur}
                          className="w-full rounded-md border border-[var(--line)] bg-[var(--bg-muted)] px-1 py-1.5 text-center text-[12px] font-mono text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                        />
                      );
                    })}
                  </Fragment>
                ))}
              </div>
              <div className="mt-1.5 text-[11px] text-[var(--ink-soft)]">
                合计：<span className="font-mono font-semibold text-[var(--ink)]">
                  {raw.flatMap((r) => r).reduce((s, v) => s + Math.max(0, v), 0).toFixed(4)}
                </span>（归一化后 = 1）
              </div>
            </div>

            {/* 中：热力图 */}
            <div className="flex-shrink-0 flex flex-col gap-1">
              <p className="text-[11px] text-[var(--ink-soft)]">联合分布热力图（可点击行/列标签）</p>
              <Heatmap
                p={p}
                selectedRow={selectedRow}
                selectedCol={selectedCol}
                mode={mode}
                onRowClick={handleRowClick}
                onColClick={handleColClick}
              />
            </div>

            {/* 右：边缘分布条形图 */}
            <div className="flex-1 min-w-0">
              {mode === "rowSelect" ? (
                <div className="space-y-3">
                  <p className="text-[11px] text-[var(--ink-soft)]">
                    X 的边缘分布 P(X=xᵢ) ← 对该行所有 y 值求和
                  </p>
                  <MarginalBar
                    values={pX}
                    labels={X_LABELS}
                    color={ACCENT}
                    lightColor={ACCENT_LIGHT}
                    highlightIdx={selectedRow}
                    direction="horizontal"
                  />

                  {/* 展开该行各格子 */}
                  {selectedRow !== null && highlightedRowProbs !== null && (
                    <div
                      className="rounded-lg p-3 space-y-2"
                      style={{ background: ACCENT_LIGHT, border: `1px solid ${ACCENT}40` }}
                    >
                      <div className="text-[12px] font-semibold" style={{ color: ACCENT }}>
                        {X_LABELS[selectedRow]} 这一行的分解
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {highlightedRowProbs.map((v, j) => (
                          <div key={j} className="text-center">
                            <div className="text-[10px] text-[var(--ink-soft)]">p(x{selectedRow + 1},{Y_LABELS[j]})</div>
                            <div
                              className="rounded-md px-2 py-1 text-[12px] font-mono font-bold"
                              style={{ background: "white", color: ACCENT }}
                            >
                              {fmt4(v)}
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center text-[12px] font-semibold" style={{ color: ACCENT }}>
                          = {fmt4(pX[selectedRow])}
                        </div>
                      </div>
                      <div className="text-[11px] font-mono" style={{ color: `${ACCENT}cc` }}>
                        {currentLabel} = {highlightedRowProbs.map(fmt4).join(" + ")} = {fmt4(currentMarginalVal!)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] text-[var(--ink-soft)]">
                    Y 的边缘分布 P(Y=yⱼ) ← 对该列所有 x 值求和
                  </p>
                  <MarginalBar
                    values={pY}
                    labels={Y_LABELS}
                    color={TEAL}
                    lightColor={TEAL_LIGHT}
                    highlightIdx={selectedCol}
                    direction="horizontal"
                  />

                  {/* 展开该列各格子 */}
                  {selectedCol !== null && highlightedColProbs !== null && (
                    <div
                      className="rounded-lg p-3 space-y-2"
                      style={{ background: TEAL_LIGHT, border: `1px solid ${TEAL}40` }}
                    >
                      <div className="text-[12px] font-semibold" style={{ color: TEAL }}>
                        {Y_LABELS[selectedCol]} 这一列的分解
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {highlightedColProbs.map((v, i) => (
                          <div key={i} className="text-center">
                            <div className="text-[10px] text-[var(--ink-soft)]">p({X_LABELS[i]},y{selectedCol + 1})</div>
                            <div
                              className="rounded-md px-2 py-1 text-[12px] font-mono font-bold"
                              style={{ background: "white", color: TEAL }}
                            >
                              {fmt4(v)}
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center text-[12px] font-semibold" style={{ color: TEAL }}>
                          = {fmt4(pY[selectedCol])}
                        </div>
                      </div>
                      <div className="text-[11px] font-mono" style={{ color: `${TEAL}cc` }}>
                        {currentLabel} = {highlightedColProbs.map(fmt4).join(" + ")} = {fmt4(currentMarginalVal!)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 两组边缘分布汇总 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3" style={{ background: GRAY_BG }}>
              <div className="text-[12px] font-semibold text-[var(--ink)] mb-2">X 的边缘分布</div>
              <div className="flex gap-2">
                {pX.map((v, i) => (
                  <div key={i} className="flex-1 text-center">
                    <div className="text-[11px] text-[var(--ink-soft)]">{X_LABELS[i]}</div>
                    <div
                      className="mt-1 rounded-md py-1 text-[12px] font-mono font-bold"
                      style={{
                        background: mode === "rowSelect" && selectedRow === i ? ACCENT : ACCENT_LIGHT,
                        color: mode === "rowSelect" && selectedRow === i ? "#fff" : ACCENT,
                        transition: "background 0.2s",
                      }}
                    >
                      {fmt4(v)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg p-3" style={{ background: GRAY_BG }}>
              <div className="text-[12px] font-semibold text-[var(--ink)] mb-2">Y 的边缘分布</div>
              <div className="flex gap-2">
                {pY.map((v, j) => (
                  <div key={j} className="flex-1 text-center">
                    <div className="text-[11px] text-[var(--ink-soft)]">{Y_LABELS[j]}</div>
                    <div
                      className="mt-1 rounded-md py-1 text-[12px] font-mono font-bold"
                      style={{
                        background: mode === "colSelect" && selectedCol === j ? TEAL : TEAL_LIGHT,
                        color: mode === "colSelect" && selectedCol === j ? "#fff" : TEAL,
                        transition: "background 0.2s",
                      }}
                    >
                      {fmt4(v)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 公式说明 */}
          <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2.5 text-[12px] text-[var(--ink-soft)] leading-relaxed">
            <span className="font-semibold text-[var(--ink)]">边缘分布定义：</span>
            <span className="font-mono ml-1">P(X=xᵢ) = Σⱼ p(xᵢ,yⱼ)</span>
            {" "}即把联合分布表按行求和（对 Y「积分」掉）；
            <span className="font-mono ml-1">P(Y=yⱼ) = Σᵢ p(xᵢ,yⱼ)</span>
            {" "}即按列求和（对 X「积分」掉）。边缘分布是联合分布在某一维度的「投影」。
          </div>
        </div>
      )}

      {/* ──────────── 反例：同边缘不同联合 ──────────── */}
      {tab === "counterexample" && (
        <div className="space-y-4">
          <div className="rounded-lg border px-3 py-2.5 text-[13px] leading-relaxed"
            style={{ borderColor: `${ORANGE}40`, background: ORANGE_LIGHT, color: ORANGE }}>
            <span className="font-bold">关键洞察：</span>
            知道边缘分布 P(X) 和 P(Y)，<b>不能</b>唯一确定联合分布 P(X,Y)！
            下面两个联合分布完全不同，但它们的边缘分布却完全一致。
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center">
            {/* 联合分布 A */}
            <div className="flex flex-col items-center gap-3">
              <MiniHeat p={pA} label="联合分布 A" />
              <div className="text-[11px] text-[var(--ink-soft)] text-center">
                <div className="font-semibold text-[var(--ink)] mb-1">边缘分布（A）</div>
                <div className="flex gap-2 mb-1">
                  {pXA.map((v, i) => (
                    <div key={i} className="text-center">
                      <div className="text-[10px]">{X_LABELS[i]}</div>
                      <div className="font-mono font-bold" style={{ color: ACCENT }}>{fmt4(v)}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  {pYA.map((v, j) => (
                    <div key={j} className="text-center">
                      <div className="text-[10px]">{Y_LABELS[j]}</div>
                      <div className="font-mono font-bold" style={{ color: ACCENT_MID }}>{fmt4(v)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 分隔符 */}
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <div className="text-2xl font-bold" style={{ color: ORANGE }}>≠</div>
                <div className="text-[11px] text-[var(--ink-soft)] text-center">联合<br/>不同</div>
              </div>
            </div>

            {/* 联合分布 B */}
            <div className="flex flex-col items-center gap-3">
              <MiniHeat p={pB} label="联合分布 B" />
              <div className="text-[11px] text-[var(--ink-soft)] text-center">
                <div className="font-semibold text-[var(--ink)] mb-1">边缘分布（B）</div>
                <div className="flex gap-2 mb-1">
                  {pXB.map((v, i) => (
                    <div key={i} className="text-center">
                      <div className="text-[10px]">{X_LABELS[i]}</div>
                      <div className="font-mono font-bold" style={{ color: ACCENT }}>{fmt4(v)}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  {pYB.map((v, j) => (
                    <div key={j} className="text-center">
                      <div className="text-[10px]">{Y_LABELS[j]}</div>
                      <div className="font-mono font-bold" style={{ color: ACCENT_MID }}>{fmt4(v)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 边缘相同确认 */}
          <div
            className="rounded-lg border px-4 py-3 text-center"
            style={{
              borderColor: marginalsMatch ? `${TEAL}40` : `${ORANGE}40`,
              background: marginalsMatch ? TEAL_LIGHT : ORANGE_LIGHT,
            }}
          >
            <div
              className="text-[14px] font-bold"
              style={{ color: marginalsMatch ? TEAL : ORANGE }}
            >
              {marginalsMatch ? "边缘分布完全相同" : "边缘分布有差异"}
            </div>
            <div className="text-[12px] mt-1" style={{ color: marginalsMatch ? TEAL : ORANGE }}>
              {marginalsMatch
                ? "两个截然不同的联合分布，投影到 X 轴或 Y 轴后得到的边缘分布一模一样！"
                : "（请检查反例数据设置）"}
            </div>
          </div>

          {/* 对比：X 边缘 */}
          <div className="rounded-lg p-3" style={{ background: GRAY_BG }}>
            <div className="text-[12px] font-semibold text-[var(--ink)] mb-2">X 边缘分布对比（A vs B）</div>
            <div className="space-y-1.5">
              {pXA.map((vA, i) => {
                const vB = pXB[i];
                const match = Math.abs(vA - vB) < 0.001;
                return (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <span className="text-[var(--ink-soft)] w-4">{X_LABELS[i]}</span>
                    <span className="font-mono" style={{ color: ACCENT }}>{fmt4(vA)}</span>
                    <span className="text-[var(--ink-soft)]">vs</span>
                    <span className="font-mono" style={{ color: ACCENT_MID }}>{fmt4(vB)}</span>
                    <span className="ml-1 text-[11px] font-bold" style={{ color: match ? TEAL : ORANGE }}>
                      {match ? "相同" : "不同"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 结论 */}
          <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2.5 text-[12px] text-[var(--ink-soft)] leading-relaxed">
            <span className="font-semibold text-[var(--ink)]">结论：</span>
            边缘分布是联合分布的"影子"——它丢失了 X 与 Y 之间的<b className="text-[var(--ink)]">相关结构</b>（协方差、独立性信息等）。
            只有当 X 与 Y <b className="text-[var(--ink)]">相互独立</b>时，边缘分布才能完全恢复联合分布（此时
            <span className="font-mono ml-1">p(xᵢ,yⱼ) = P(X=xᵢ)·P(Y=yⱼ)</span>）。
          </div>
        </div>
      )}
    </div>
  );
}
