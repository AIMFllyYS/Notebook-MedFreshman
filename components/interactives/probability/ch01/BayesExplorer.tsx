"use client";

import { memo, useState } from "react";

// ─── 设计常量 ────────────────────────────────────────────────
const ACCENT = "#5b46e5";
const ACCENT_LIGHT = "#ede9fe";
const GREEN = "#0f766e";
const GREEN_LIGHT = "#ccfbf1";
const RED = "#dc2626";
const RED_LIGHT = "#fee2e2";
const GRAY = "#e9ebf2";

// ─── 辅助：将概率格式化成百分比（最多 2 位小数）────────────────
function pct(v: number): string {
  return (v * 100).toFixed(1) + "%";
}
function fmt4(v: number): string {
  return v.toFixed(4);
}

// ─── 方块网格参数 ─────────────────────────────────────────────
// 100 个小格（10×10），每格 = 1 人/1000 人中的 10 人，即人群 1000 人
const GRID_N = 1000; // 模拟人群总数
const COLS = 40;
const ROWS = 25;
// SVG 尺寸
const SVG_W = 360;
const SVG_H = 200;
const CELL_W = SVG_W / COLS;
const CELL_H = SVG_H / ROWS;

type CellType = "TP" | "FP" | "FN" | "TN";

interface CellInfo {
  type: CellType;
  col: number;
  row: number;
}

function buildCells(tp: number, fp: number, fn: number, tn: number): CellInfo[] {
  const total = tp + fp + fn + tn;
  const cells: CellInfo[] = [];
  // 按比例分配格子（四舍五入凑 COLS*ROWS）
  const scale = (COLS * ROWS) / total;
  const counts: Record<CellType, number> = {
    TP: Math.round(tp * scale),
    FP: Math.round(fp * scale),
    FN: Math.round(fn * scale),
    TN: 0,
  };
  counts.TN = COLS * ROWS - counts.TP - counts.FP - counts.FN;

  const order: CellType[] = ["TP", "FP", "FN", "TN"];
  let idx = 0;
  for (const type of order) {
    const n = counts[type];
    for (let i = 0; i < n; i++) {
      cells.push({
        type,
        col: idx % COLS,
        row: Math.floor(idx / COLS),
      });
      idx++;
    }
  }
  return cells;
}

function cellColor(type: CellType, highlighted: string): string {
  if (highlighted === "positive" && (type === "TP" || type === "FP")) {
    return type === "TP" ? ACCENT : RED;
  }
  if (highlighted === "disease" && (type === "TP" || type === "FN")) {
    return type === "TP" ? ACCENT : GREEN;
  }
  const base: Record<CellType, string> = {
    TP: ACCENT,
    FP: RED,
    FN: GREEN,
    TN: GRAY,
  };
  return base[type];
}

function cellOpacity(type: CellType, highlighted: string): number {
  if (highlighted === "positive") {
    if (type === "TP" || type === "FP") return 1;
    return 0.2;
  }
  if (highlighted === "disease") {
    if (type === "TP" || type === "FN") return 1;
    return 0.2;
  }
  return 0.85;
}

// ─── 滑块组件 ─────────────────────────────────────────────────
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  color?: string;
  note?: string;
}

function Slider({ label, value, min, max, step, onChange, color, note }: SliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[var(--ink)]">{label}</span>
        <span
          className="rounded-md px-2 py-0.5 text-[13px] font-mono font-bold"
          style={{ background: color ? color + "22" : ACCENT_LIGHT, color: color ?? ACCENT }}
        >
          {pct(value)}
        </span>
      </div>
      {note && (
        <p className="text-[11px] text-[var(--ink-soft)] leading-relaxed">{note}</p>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)] h-1.5 cursor-pointer"
        style={{ accentColor: color ?? ACCENT }}
      />
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────
function BayesExplorerBase() {
  // 三个可调参数
  const [prevalence, setPrevalence] = useState(0.01);   // 先验：患病率 P(D)
  const [sensitivity, setSensitivity] = useState(0.9);  // 灵敏度 P(+|D)
  const [specificity, setSpecificity] = useState(0.95); // 特异度 P(-|D̄)

  // 高亮模式
  const [highlighted, setHighlighted] = useState<string>("all");

  // ─── 核心贝叶斯计算 ─────────────────────────────────────────
  const pD = prevalence;          // P(D)
  const pDc = 1 - pD;             // P(D̄)
  const pPosDgD = sensitivity;    // P(+|D)
  const pNegDgDc = specificity;   // P(-|D̄)
  const pPosDgDc = 1 - specificity; // P(+|D̄) = 假阳性率 FPR

  // 全概率公式: P(+) = P(+|D)P(D) + P(+|D̄)P(D̄)
  const pPos = pPosDgD * pD + pPosDgDc * pDc;

  // 后验：贝叶斯公式 P(D|+) = P(+|D)P(D) / P(+)
  const posterior = pPos > 0 ? (pPosDgD * pD) / pPos : 0;

  // 计数（基于 GRID_N = 1000 人）
  const nD = Math.round(pD * GRID_N);          // 患病人数
  const nDc = GRID_N - nD;                      // 非患病人数
  const nTP = Math.round(pPosDgD * nD);         // 真阳性
  const nFN = nD - nTP;                         // 假阴性
  const nFP = Math.round(pPosDgDc * nDc);       // 假阳性
  const nTN = nDc - nFP;                        // 真阴性
  const nPos = nTP + nFP;                       // 检测阳性总数

  // 方块格子数据
  const cells = buildCells(nTP, nFP, nFN, nTN);

  // 高亮按钮列表
  const highlights = [
    { key: "all", label: "全体人群" },
    { key: "positive", label: "检测阳性" },
    { key: "disease", label: "实际患病" },
  ];

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-5">
      {/* 标题 */}
      <div>
        <h3 className="text-[15px] font-bold text-[var(--ink)]">贝叶斯推断可视化</h3>
        <p className="text-[12px] text-[var(--ink-soft)] mt-0.5">
          调整患病率、灵敏度、特异度，观察「阳性中真正患病」的后验概率如何变化。
        </p>
      </div>

      {/* 三个滑块 */}
      <div className="space-y-4 rounded-lg bg-[var(--bg-muted)] px-4 py-3">
        <Slider
          label="患病率 P(D)（先验）"
          value={prevalence}
          min={0.001}
          max={0.3}
          step={0.001}
          onChange={setPrevalence}
          color={ACCENT}
          note="患病率极低时，即使灵敏度很高，假阳性也可能淹没真阳性。"
        />
        <Slider
          label="灵敏度 P(+|D)（患病者检出率）"
          value={sensitivity}
          min={0.5}
          max={0.999}
          step={0.001}
          onChange={setSensitivity}
          color={GREEN}
          note="灵敏度越高，漏诊（FN）越少，「患病者被正确检出」越多。"
        />
        <Slider
          label="特异度 P(−|D̄)（健康者排除率）"
          value={specificity}
          min={0.5}
          max={0.999}
          step={0.001}
          onChange={setSpecificity}
          color={RED}
          note="特异度越高，误报（FP）越少，假阳性率 = 1 − 特异度越小。"
        />
      </div>

      {/* 方块可视化区域 */}
      <div>
        {/* 高亮切换按钮 */}
        <div className="mb-2 flex flex-wrap gap-1.5">
          {highlights.map((h) => (
            <button
              key={h.key}
              onClick={() => setHighlighted(h.key)}
              className={
                "rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors " +
                (h.key === highlighted
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-muted)] text-[var(--ink-soft)] hover:bg-[var(--accent-weak)]")
              }
            >
              {h.label}
            </button>
          ))}
          <span className="ml-auto self-center text-[11px] text-[var(--ink-soft)]">
            每格 ≈ {(GRID_N / (COLS * ROWS)).toFixed(1)} 人（总 {GRID_N} 人）
          </span>
        </div>

        {/* SVG 方块图 */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full rounded-lg border border-[var(--line)]"
          style={{ maxHeight: 220 }}
        >
          {cells.map((cell, i) => (
            <rect
              key={i}
              x={cell.col * CELL_W + 0.5}
              y={cell.row * CELL_H + 0.5}
              width={CELL_W - 1}
              height={CELL_H - 1}
              fill={cellColor(cell.type, highlighted)}
              opacity={cellOpacity(cell.type, highlighted)}
              rx={0.8}
            />
          ))}
        </svg>

        {/* 图例 */}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {[
            { color: ACCENT, label: `真阳性 TP（患病+阳）`, n: nTP },
            { color: RED, label: `假阳性 FP（健康+阳）`, n: nFP },
            { color: GREEN, label: `假阴性 FN（患病+阴）`, n: nFN },
            { color: GRAY, label: `真阴性 TN（健康+阴）`, n: nTN },
          ].map(({ color, label, n }) => (
            <div key={label} className="flex items-center gap-1.5 text-[11px] text-[var(--ink-soft)]">
              <span
                className="inline-block h-3 w-3 rounded-sm flex-shrink-0"
                style={{ background: color }}
              />
              <span>{label}</span>
              <span className="font-mono font-semibold text-[var(--ink)]">{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 核心结果展示 */}
      <div className="rounded-lg border-2 p-4 space-y-3"
        style={{ borderColor: ACCENT, background: ACCENT_LIGHT }}>
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-[var(--ink)]">
            后验概率 P(D | +)
          </span>
          <span
            className="text-[22px] font-extrabold font-mono"
            style={{ color: ACCENT }}
          >
            {pct(posterior)}
          </span>
        </div>
        <p className="text-[12px] text-[var(--ink-soft)] leading-relaxed">
          检测阳性的 <b className="text-[var(--ink)]">{nPos}</b> 人中，
          真正患病的只有 <b className="text-[var(--ink)]">{nTP}</b> 人，
          有 <b style={{ color: RED }}>{nFP}</b> 人是假阳性。
          {posterior < 0.5 && (
            <span className="block mt-1 font-semibold" style={{ color: RED }}>
              [!] 即使检测阳性，实际患病概率仍不足 50%！这是「基率谬误」的典型体现。
            </span>
          )}
        </p>

        {/* 柱状进度条：直观对比 TP vs FP */}
        <div>
          <div className="mb-1 flex justify-between text-[11px] text-[var(--ink-soft)]">
            <span style={{ color: ACCENT }}>真阳性 {nTP}</span>
            <span style={{ color: RED }}>假阳性 {nFP}</span>
          </div>
          <div className="h-5 w-full rounded-full overflow-hidden flex" style={{ background: RED }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: nPos > 0 ? `${(nTP / nPos) * 100}%` : "0%",
                background: ACCENT,
              }}
            />
          </div>
          <div className="mt-1 text-center text-[11px] text-[var(--ink-soft)]">
            阳性中真患病占比 = {pct(posterior)}
          </div>
        </div>
      </div>

      {/* 全概率公式与贝叶斯公式 */}
      <div className="space-y-3">
        {/* 全概率公式数值代入 */}
        <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-3 text-[12px] leading-loose text-[var(--ink-soft)]">
          <div className="font-semibold text-[13px] text-[var(--ink)] mb-1">全概率公式</div>
          <div className="font-mono">
            P(+) = P(+|D)·P(D) + P(+|D̄)·P(D̄)
          </div>
          <div className="font-mono mt-0.5">
            {"     "}&nbsp;&nbsp;&nbsp;= {fmt4(pPosDgD)} × {fmt4(pD)}
            {" + "}{fmt4(pPosDgDc)} × {fmt4(pDc)}
          </div>
          <div className="font-mono mt-0.5">
            {"     "}&nbsp;&nbsp;&nbsp;={" "}
            <span style={{ color: ACCENT, fontWeight: 700 }}>{fmt4(pPosDgD * pD)}</span>
            {" + "}
            <span style={{ color: RED, fontWeight: 700 }}>{fmt4(pPosDgDc * pDc)}</span>
            {" = "}
            <b className="text-[var(--ink)]">{fmt4(pPos)}</b>
          </div>
        </div>

        {/* 贝叶斯公式数值代入 */}
        <div className="rounded-lg bg-[var(--bg-muted)] px-4 py-3 text-[12px] leading-loose text-[var(--ink-soft)]">
          <div className="font-semibold text-[13px] text-[var(--ink)] mb-1">贝叶斯公式</div>
          <div className="font-mono">
            P(D|+) = P(+|D)·P(D) / P(+)
          </div>
          <div className="font-mono mt-0.5">
            {"       "}&nbsp;&nbsp;&nbsp;&nbsp;={" "}
            <span style={{ color: ACCENT, fontWeight: 700 }}>{fmt4(pPosDgD * pD)}</span>
            {" / "}
            <b className="text-[var(--ink)]">{fmt4(pPos)}</b>
          </div>
          <div className="font-mono mt-0.5">
            {"       "}&nbsp;&nbsp;&nbsp;&nbsp;={" "}
            <span
              className="text-[15px] font-extrabold"
              style={{ color: ACCENT }}
            >
              {fmt4(posterior)}
            </span>
            {" ≈ "}
            <span style={{ color: ACCENT, fontWeight: 700 }}>{pct(posterior)}</span>
          </div>
        </div>
      </div>

      {/* 关键数据摘要 */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "人群患病率 P(D)", val: pct(pD), bg: ACCENT_LIGHT, col: ACCENT },
          { label: "检测阳性率 P(+)", val: pct(pPos), bg: "#f0fdf4", col: GREEN },
          { label: "假阳性率 P(+|D̄)", val: pct(pPosDgDc), bg: RED_LIGHT, col: RED },
          { label: "后验 P(D|+)", val: pct(posterior), bg: ACCENT_LIGHT, col: ACCENT },
        ].map(({ label, val, bg, col }) => (
          <div
            key={label}
            className="rounded-lg p-2.5 text-center"
            style={{ background: bg }}
          >
            <div className="text-[10px] text-[var(--ink-soft)] leading-snug">{label}</div>
            <div className="text-[16px] font-extrabold font-mono mt-0.5" style={{ color: col }}>
              {val}
            </div>
          </div>
        ))}
      </div>

      {/* 洞察提示 */}
      <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2.5 text-[12px] text-[var(--ink-soft)] leading-relaxed">
        <span className="font-semibold text-[var(--ink)]">直觉提示：</span>
        当患病率很低时，即使检测很准（高灵敏度+高特异度），绝大多数阳性仍是假阳性——这就是
        <b className="text-[var(--ink)]">基率谬误</b>（Base Rate Fallacy）。
        提高先验（患病率）或提高特异度，都能显著改善后验。
        点击「检测阳性」可高亮看清楚蓝（TP）vs 红（FP）的比例。
      </div>
    </div>
  );
}

export default memo(BayesExplorerBase);
