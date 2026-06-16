"use client";

import { useState, useCallback } from "react";

// ─── Design constants ────────────────────────────────────────────────────────
const ACCENT = "#5b46e5";
const ACCENT_LIGHT = "#ede9fe";
const GREEN = "#0f766e";
const GREEN_LIGHT = "#d1fae5";
const RED = "#dc2626";
const RED_LIGHT = "#fee2e2";
const YELLOW = "#b45309";
const YELLOW_LIGHT = "#fef3c7";

// ─── Types ───────────────────────────────────────────────────────────────────
type Grid3x3 = [[number, number, number], [number, number, number], [number, number, number]];

// ─── Default joint distribution (independent example to start) ───────────────
// P(X=xi, Y=yj) = pi * qj where pi = [0.2, 0.5, 0.3] and qj = [0.3, 0.4, 0.3]
const INIT_GRID: Grid3x3 = [
  [0.06, 0.08, 0.06],
  [0.15, 0.20, 0.15],
  [0.09, 0.12, 0.09],
];

// ─── Preset distributions ────────────────────────────────────────────────────
type Preset = { label: string; grid: Grid3x3; description: string };

const PRESETS: Preset[] = [
  {
    label: "完全独立",
    description: "边缘分布乘积恰好等于联合概率，独立性指数 = 0",
    grid: [
      [0.06, 0.08, 0.06],
      [0.15, 0.20, 0.15],
      [0.09, 0.12, 0.09],
    ],
  },
  {
    label: "强相关",
    description: "概率集中在对角线，X 与 Y 高度正相关",
    grid: [
      [0.25, 0.05, 0.00],
      [0.05, 0.30, 0.05],
      [0.00, 0.05, 0.25],
    ],
  },
  {
    label: "负相关",
    description: "X 大时 Y 小，X 小时 Y 大，反对角线集中",
    grid: [
      [0.02, 0.06, 0.22],
      [0.06, 0.20, 0.04],
      [0.22, 0.04, 0.02],
    ],
  },
  {
    label: "边缘相同·不独立",
    description: "边缘分布均匀，但联合分布不是乘积",
    grid: [
      [0.02, 0.14, 0.17],
      [0.17, 0.08, 0.08],
      [0.14, 0.11, 0.09],
    ],
  },
];

// ─── Helper functions ─────────────────────────────────────────────────────────
function computeMarginalsAndIndex(grid: Grid3x3): {
  rowMargins: [number, number, number];
  colMargins: [number, number, number];
  total: number;
  independent: Grid3x3;
  deviations: Grid3x3;
  maxDev: number;
} {
  // Row marginals (pi)
  const rowMargins: [number, number, number] = [
    grid[0][0] + grid[0][1] + grid[0][2],
    grid[1][0] + grid[1][1] + grid[1][2],
    grid[2][0] + grid[2][1] + grid[2][2],
  ];
  // Column marginals (qj)
  const colMargins: [number, number, number] = [
    grid[0][0] + grid[1][0] + grid[2][0],
    grid[0][1] + grid[1][1] + grid[2][1],
    grid[0][2] + grid[1][2] + grid[2][2],
  ];

  const total = rowMargins[0] + rowMargins[1] + rowMargins[2];

  // Independence reference: pi * qj (normalized)
  const normR: [number, number, number] = [
    total > 0 ? rowMargins[0] / total : 0,
    total > 0 ? rowMargins[1] / total : 0,
    total > 0 ? rowMargins[2] / total : 0,
  ];
  const normC: [number, number, number] = [
    total > 0 ? colMargins[0] / total : 0,
    total > 0 ? colMargins[1] / total : 0,
    total > 0 ? colMargins[2] / total : 0,
  ];

  const independent: Grid3x3 = [
    [normR[0] * normC[0], normR[0] * normC[1], normR[0] * normC[2]],
    [normR[1] * normC[0], normR[1] * normC[1], normR[1] * normC[2]],
    [normR[2] * normC[0], normR[2] * normC[1], normR[2] * normC[2]],
  ];

  // Normalized grid values for comparison
  const normGrid: Grid3x3 = [
    [
      total > 0 ? grid[0][0] / total : 0,
      total > 0 ? grid[0][1] / total : 0,
      total > 0 ? grid[0][2] / total : 0,
    ],
    [
      total > 0 ? grid[1][0] / total : 0,
      total > 0 ? grid[1][1] / total : 0,
      total > 0 ? grid[1][2] / total : 0,
    ],
    [
      total > 0 ? grid[2][0] / total : 0,
      total > 0 ? grid[2][1] / total : 0,
      total > 0 ? grid[2][2] / total : 0,
    ],
  ];

  // Deviations: p(xi,yj) - pi*qj
  const deviations: Grid3x3 = [
    [
      normGrid[0][0] - independent[0][0],
      normGrid[0][1] - independent[0][1],
      normGrid[0][2] - independent[0][2],
    ],
    [
      normGrid[1][0] - independent[1][0],
      normGrid[1][1] - independent[1][1],
      normGrid[1][2] - independent[1][2],
    ],
    [
      normGrid[2][0] - independent[2][0],
      normGrid[2][1] - independent[2][1],
      normGrid[2][2] - independent[2][2],
    ],
  ];

  const maxDev = Math.max(...deviations.flat().map(Math.abs));

  return { rowMargins, colMargins, total, independent, deviations, maxDev };
}

// Interpolate color from green (0 deviation) -> yellow -> red (max deviation)
function deviationColor(dev: number, maxDev: number): string {
  if (maxDev < 1e-9) return "#e8f5e9"; // all-green when perfectly independent
  const ratio = Math.min(Math.abs(dev) / Math.max(maxDev, 0.001), 1);
  // red channel: 0->0x0f(green-dark), 1->0xdc(red)
  const r = Math.round(15 + (220 - 15) * ratio);
  const g = Math.round(118 - (118 - 38) * ratio);
  const b = Math.round(110 - 110 * ratio);
  return `rgb(${r},${g},${b})`;
}

function deviationBg(dev: number, maxDev: number): string {
  if (maxDev < 1e-9) return "#f0fdf4";
  const ratio = Math.min(Math.abs(dev) / Math.max(maxDev, 0.001), 1);
  const r = Math.round(240 + (254 - 240) * ratio);
  const g = Math.round(253 + (226 - 253) * ratio);
  const b = Math.round(244 + (226 - 244) * ratio);
  return `rgb(${r},${g},${b})`;
}

function fmt(v: number): string {
  return v.toFixed(4);
}

function fmtShort(v: number): string {
  return v.toFixed(3);
}

// ─── Cell Editor ──────────────────────────────────────────────────────────────
interface CellEditorProps {
  value: number;
  dev: number;
  maxDev: number;
  isSelected: boolean;
  onClick: () => void;
  onChange: (v: number) => void;
  row: number;
  col: number;
  independent: number;
}

function CellEditor({ value, dev, maxDev, isSelected, onClick, onChange, row, col, independent }: CellEditorProps) {
  const bg = deviationBg(dev, maxDev);
  const borderColor = isSelected ? ACCENT : deviationColor(dev, maxDev);
  const textColor = deviationColor(dev, maxDev);
  const absDev = Math.abs(dev);
  const isClose = absDev < 0.002;

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-lg p-1.5 cursor-pointer transition-all duration-200"
      style={{
        background: bg,
        border: `2px solid ${borderColor}`,
        minHeight: 64,
        boxShadow: isSelected ? `0 0 0 3px ${ACCENT}44` : undefined,
      }}
      onClick={onClick}
      title={`X=${row + 1}, Y=${col + 1} | 实际: ${fmt(value)} | 独立参考: ${fmt(independent)} | 偏差: ${dev >= 0 ? "+" : ""}${fmt(dev)}`}
    >
      <div
        className="text-[11px] font-bold leading-tight"
        style={{ color: isClose ? GREEN : textColor }}
      >
        {isClose ? "✓" : (dev > 0 ? "↑" : "↓")}
      </div>
      <div
        className="text-[13px] font-mono font-bold"
        style={{ color: textColor }}
      >
        {fmtShort(value)}
      </div>
      {isSelected && (
        <input
          type="range"
          min={0}
          max={0.5}
          step={0.001}
          value={value}
          onChange={handleSliderChange}
          onClick={(e) => e.stopPropagation()}
          className="w-full mt-1"
          style={{ accentColor: ACCENT, height: 14 }}
        />
      )}
    </div>
  );
}

// ─── Independence Gauge ───────────────────────────────────────────────────────
function IndependenceGauge({ maxDev }: { maxDev: number }) {
  const capped = Math.min(maxDev, 0.25);
  const pct = capped / 0.25;
  const gaugeColor =
    maxDev < 0.01
      ? GREEN
      : maxDev < 0.05
      ? YELLOW
      : RED;
  const gaugeLabel =
    maxDev < 0.005
      ? "几乎完全独立"
      : maxDev < 0.02
      ? "近似独立"
      : maxDev < 0.07
      ? "弱相关"
      : "强相关（不独立）";

  return (
    <div className="rounded-lg border border-[var(--line)] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold text-[var(--ink)]">独立性指数</span>
        <span
          className="rounded-md px-2 py-0.5 text-[13px] font-mono font-bold"
          style={{
            background: maxDev < 0.01 ? GREEN_LIGHT : maxDev < 0.05 ? YELLOW_LIGHT : RED_LIGHT,
            color: gaugeColor,
          }}
        >
          {fmt(maxDev)}
        </span>
      </div>
      <div className="text-[11px] font-mono text-[var(--ink-soft)]">
        max |p(xᵢ,yⱼ) − pᵢ·qⱼ| = {fmt(maxDev)}
      </div>
      {/* Gauge bar */}
      <div className="relative h-4 w-full rounded-full overflow-hidden" style={{ background: "#e5e7eb" }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct * 100}%`, background: gaugeColor }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[var(--ink-soft)]">
        <span style={{ color: GREEN }}>0 = 完全独立</span>
        <span style={{ color: RED }}>≥ 0.25 = 强相关</span>
      </div>
      <div
        className="text-center text-[12px] font-semibold rounded-md py-1"
        style={{
          background: maxDev < 0.01 ? GREEN_LIGHT : maxDev < 0.05 ? YELLOW_LIGHT : RED_LIGHT,
          color: gaugeColor,
        }}
      >
        {gaugeLabel}
      </div>
    </div>
  );
}

// ─── Marginal display ─────────────────────────────────────────────────────────
function MarginalBadge({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div
      className="rounded-md px-2 py-1 text-center"
      style={{ background: color + "22", minWidth: 54 }}
    >
      <div className="text-[9px] text-[var(--ink-soft)]">{label}</div>
      <div className="text-[12px] font-mono font-bold" style={{ color }}>
        {fmtShort(value)}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function IndependenceChecker() {
  const [grid, setGrid] = useState<Grid3x3>(() => INIT_GRID.map((r) => [...r]) as Grid3x3);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([1, 1]);
  const [showFormula, setShowFormula] = useState(false);
  const [activePreset, setActivePreset] = useState(0);

  const { rowMargins, colMargins, total, independent, deviations, maxDev } =
    computeMarginalsAndIndex(grid);

  // Normalize so grid sums to 1 after edits
  const normGrid: Grid3x3 = grid.map((row) =>
    row.map((v) => (total > 0 ? v / total : 0))
  ) as Grid3x3;

  function handleCellChange(r: number, c: number, rawVal: number) {
    const next = grid.map((row, ri) =>
      row.map((v, ci) => (ri === r && ci === c ? rawVal : v))
    ) as Grid3x3;
    setGrid(next);
  }

  function handlePreset(idx: number) {
    setActivePreset(idx);
    setGrid(PRESETS[idx].grid.map((r) => [...r]) as Grid3x3);
    setSelectedCell(null);
  }

  function handleRandomize() {
    // Generate random joint dist by randomly perturbing from independence
    const p: [number, number, number] = [Math.random(), Math.random(), Math.random()];
    const q: [number, number, number] = [Math.random(), Math.random(), Math.random()];
    const pSum = p[0] + p[1] + p[2];
    const qSum = q[0] + q[1] + q[2];
    const pn: [number, number, number] = [p[0] / pSum, p[1] / pSum, p[2] / pSum];
    const qn: [number, number, number] = [q[0] / qSum, q[1] / qSum, q[2] / qSum];
    // Add random perturbations
    const rawGrid: Grid3x3 = [
      [
        pn[0] * qn[0] + (Math.random() - 0.5) * 0.05,
        pn[0] * qn[1] + (Math.random() - 0.5) * 0.05,
        pn[0] * qn[2] + (Math.random() - 0.5) * 0.05,
      ],
      [
        pn[1] * qn[0] + (Math.random() - 0.5) * 0.05,
        pn[1] * qn[1] + (Math.random() - 0.5) * 0.05,
        pn[1] * qn[2] + (Math.random() - 0.5) * 0.05,
      ],
      [
        pn[2] * qn[0] + (Math.random() - 0.5) * 0.05,
        pn[2] * qn[1] + (Math.random() - 0.5) * 0.05,
        pn[2] * qn[2] + (Math.random() - 0.5) * 0.05,
      ],
    ];
    // Clamp negatives
    const clampedGrid = rawGrid.map((row) => row.map((v) => Math.max(v, 0.001))) as Grid3x3;
    setGrid(clampedGrid);
    setActivePreset(-1);
    setSelectedCell(null);
  }

  const xLabels = ["X₁", "X₂", "X₃"];
  const yLabels = ["Y₁", "Y₂", "Y₃"];

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-[15px] font-bold text-[var(--ink)]">随机变量独立性检验器</h3>
        <p className="text-[12px] text-[var(--ink-soft)] mt-0.5">
          编辑联合分布表，实时检验 p(xᵢ,yⱼ) = pᵢ·qⱼ 是否成立。
          <span style={{ color: GREEN }} className="font-semibold"> 绿</span>色表示接近独立，
          <span style={{ color: RED }} className="font-semibold"> 红</span>色表示偏离独立假设。
        </p>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handlePreset(idx)}
            className="rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors"
            style={{
              background: activePreset === idx ? ACCENT : "#f3f4f6",
              color: activePreset === idx ? "white" : "var(--ink-soft)",
              border: `1px solid ${activePreset === idx ? ACCENT : "var(--line)"}`,
            }}
            title={p.description}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={handleRandomize}
          className="rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors"
          style={{
            background: activePreset === -1 ? ACCENT : "#f3f4f6",
            color: activePreset === -1 ? "white" : "var(--ink-soft)",
            border: `1px solid ${activePreset === -1 ? ACCENT : "var(--line)"}`,
          }}
        >
          随机分布
        </button>
      </div>

      {/* Main grid + marginals */}
      <div className="overflow-x-auto">
        <div className="min-w-[340px]">
          {/* Column headers + column marginals */}
          <div className="flex items-end mb-1 ml-[64px] gap-1.5">
            {yLabels.map((yl, j) => (
              <div key={j} className="flex-1 text-center">
                <div className="text-[11px] font-semibold text-[var(--ink-soft)] mb-0.5">{yl}</div>
                <MarginalBadge
                  value={total > 0 ? colMargins[j] / total : 0}
                  label={`q${j + 1}`}
                  color={ACCENT}
                />
              </div>
            ))}
            <div className="w-[54px] text-center text-[9px] text-[var(--ink-soft)] self-end pb-1">边缘分布</div>
          </div>

          {/* Rows */}
          {xLabels.map((xl, i) => (
            <div key={i} className="flex items-center gap-1.5 mb-1.5">
              {/* Row label + row marginal */}
              <div className="flex flex-col items-center w-[64px] shrink-0 gap-0.5">
                <div className="text-[11px] font-semibold text-[var(--ink-soft)]">{xl}</div>
                <MarginalBadge
                  value={total > 0 ? rowMargins[i] / total : 0}
                  label={`p${i + 1}`}
                  color="#7c3aed"
                />
              </div>

              {/* 3 cells */}
              {[0, 1, 2].map((j) => {
                const isSelected = selectedCell !== null && selectedCell[0] === i && selectedCell[1] === j;
                return (
                  <div key={j} className="flex-1">
                    <CellEditor
                      value={grid[i][j]}
                      dev={deviations[i][j]}
                      maxDev={maxDev}
                      isSelected={isSelected}
                      onClick={() => setSelectedCell(isSelected ? null : [i, j])}
                      onChange={(v) => handleCellChange(i, j, v)}
                      row={i}
                      col={j}
                      independent={independent[i][j] * total}
                    />
                  </div>
                );
              })}

              {/* Row sum */}
              <div
                className="w-[54px] shrink-0 rounded-md px-1 py-1 text-center text-[11px] font-mono"
                style={{ background: "#f3f4f6", color: "var(--ink-soft)" }}
              >
                <div className="text-[9px]">行和</div>
                <div className="font-bold text-[var(--ink)]">{fmtShort(rowMargins[i])}</div>
              </div>
            </div>
          ))}

          {/* Column sums row */}
          <div className="flex items-center gap-1.5 ml-[64px]">
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                className="flex-1 rounded-md px-1 py-1 text-center text-[11px] font-mono"
                style={{ background: "#f3f4f6", color: "var(--ink-soft)" }}
              >
                <div className="text-[9px]">列和</div>
                <div className="font-bold text-[var(--ink)]">{fmtShort(colMargins[j])}</div>
              </div>
            ))}
            <div
              className="w-[54px] shrink-0 rounded-md px-1 py-1 text-center text-[11px] font-mono"
              style={{ background: ACCENT_LIGHT, color: ACCENT }}
            >
              <div className="text-[9px]">总和</div>
              <div className="font-bold">{fmtShort(total)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Instruction when cell selected */}
      {selectedCell !== null && (
        <div
          className="rounded-lg px-3 py-2 text-[12px] leading-relaxed"
          style={{ background: ACCENT_LIGHT, color: ACCENT }}
        >
          <span className="font-semibold">
            已选中 ({xLabels[selectedCell[0]]}, {yLabels[selectedCell[1]]}):
          </span>{" "}
          拖动格子内的滑块调整概率值。当前值 ={" "}
          <span className="font-mono font-bold">{fmt(grid[selectedCell[0]][selectedCell[1]])}</span>
          ，独立参考值 ={" "}
          <span className="font-mono font-bold">{fmt(independent[selectedCell[0]][selectedCell[1]])}</span>
          ，偏差 ={" "}
          <span
            className="font-mono font-bold"
            style={{ color: Math.abs(deviations[selectedCell[0]][selectedCell[1]]) < 0.002 ? GREEN : RED }}
          >
            {deviations[selectedCell[0]][selectedCell[1]] >= 0 ? "+" : ""}
            {fmt(deviations[selectedCell[0]][selectedCell[1]])}
          </span>
        </div>
      )}

      {/* Independence gauge */}
      <IndependenceGauge maxDev={maxDev} />

      {/* Independence reference grid (mini) */}
      <div className="rounded-lg border border-[var(--line)] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-[var(--ink)]">独立参考分布 pᵢ·qⱼ</span>
          <span className="text-[11px] text-[var(--ink-soft)]">若 X⊥Y，则联合分布应等于此值</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11px] font-mono">
            <thead>
              <tr>
                <th className="text-[var(--ink-soft)] pb-1 pr-2 text-left font-normal">pᵢ·qⱼ</th>
                {yLabels.map((yl, j) => (
                  <th key={j} className="pb-1 text-center font-semibold" style={{ color: ACCENT }}>
                    {yl}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {xLabels.map((xl, i) => (
                <tr key={i}>
                  <td className="pr-2 font-semibold" style={{ color: "#7c3aed" }}>{xl}</td>
                  {[0, 1, 2].map((j) => {
                    const actualNorm = normGrid[i][j];
                    const indepVal = independent[i][j];
                    const dev = deviations[i][j];
                    const isClose = Math.abs(dev) < 0.002;
                    return (
                      <td
                        key={j}
                        className="py-1 px-2 text-center rounded"
                        style={{
                          background: deviationBg(dev, maxDev),
                          color: deviationColor(dev, maxDev),
                          fontWeight: 600,
                        }}
                        title={`独立参考: ${fmt(indepVal)} | 实际: ${fmt(actualNorm)}`}
                      >
                        {fmtShort(indepVal)}
                        {isClose ? " ✓" : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula explanation toggle */}
      <div>
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
          style={{ color: ACCENT }}
        >
          <span
            className="inline-block transition-transform duration-200"
            style={{ transform: showFormula ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            ▶
          </span>
          独立性定义与检验方法
        </button>

        {showFormula && (
          <div className="mt-2 rounded-lg bg-[var(--bg-muted)] px-4 py-3 space-y-3 text-[12px] leading-relaxed text-[var(--ink-soft)]">
            <div>
              <div className="font-semibold text-[13px] text-[var(--ink)] mb-1">独立性定义</div>
              <div className="font-mono">X ⊥ Y  ⟺  P(X=xᵢ, Y=yⱼ) = P(X=xᵢ)·P(Y=yⱼ)</div>
              <div className="font-mono mt-1">
                即：p(xᵢ,yⱼ) = pᵢ·qⱼ &nbsp;对所有 i,j 成立
              </div>
            </div>
            <div>
              <div className="font-semibold text-[13px] text-[var(--ink)] mb-1">边缘分布计算</div>
              <div className="font-mono">pᵢ = P(X=xᵢ) = Σⱼ P(xᵢ,yⱼ)（行求和）</div>
              <div className="font-mono mt-0.5">qⱼ = P(Y=yⱼ) = Σᵢ P(xᵢ,yⱼ)（列求和）</div>
            </div>
            <div>
              <div className="font-semibold text-[13px] text-[var(--ink)] mb-1">独立性指数</div>
              <div className="font-mono">δ = max&#x7B;|p(xᵢ,yⱼ) − pᵢ·qⱼ|&#x7D;</div>
              <div className="mt-1">
                δ = 0 ⟹ 完全独立；δ 越大，X 与 Y 相关性越强。
                本组件中当前 δ ={" "}
                <span className="font-mono font-bold" style={{ color: maxDev < 0.01 ? GREEN : maxDev < 0.05 ? YELLOW : RED }}>
                  {fmt(maxDev)}
                </span>
              </div>
            </div>
            <div>
              <div className="font-semibold text-[13px] text-[var(--ink)] mb-1">颜色含义</div>
              <div className="flex gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded" style={{ background: GREEN }} />
                  <span>绿 = p(xᵢ,yⱼ) ≈ pᵢ·qⱼ（独立）</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded" style={{ background: YELLOW }} />
                  <span>黄 = 轻微偏差</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded" style={{ background: RED }} />
                  <span>红 = 显著违反独立性</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Insight panel */}
      <div
        className="rounded-lg border px-3 py-2.5 text-[12px] leading-relaxed"
        style={{
          borderColor: maxDev < 0.01 ? GREEN : maxDev < 0.05 ? YELLOW : RED,
          background: maxDev < 0.01 ? GREEN_LIGHT : maxDev < 0.05 ? YELLOW_LIGHT : RED_LIGHT,
          color: maxDev < 0.01 ? GREEN : maxDev < 0.05 ? YELLOW : RED,
        }}
      >
        {maxDev < 0.005 && (
          <span>
            <strong>X 与 Y 相互独立！</strong> 每格实际概率几乎等于边缘乘积 pᵢ·qⱼ，
            知道 X 的取值不改变 Y 的概率分布。
          </span>
        )}
        {maxDev >= 0.005 && maxDev < 0.05 && (
          <span>
            <strong>近似独立</strong>（δ = {fmt(maxDev)}）。存在轻微统计关联，
            在实际问题中通常可视为独立处理。
          </span>
        )}
        {maxDev >= 0.05 && maxDev < 0.12 && (
          <span>
            <strong>弱相关，不独立</strong>（δ = {fmt(maxDev)}）。红色格子的
            p(xᵢ,yⱼ) 偏离 pᵢ·qⱼ 较多，X 与 Y 存在可观测的统计依赖关系。
          </span>
        )}
        {maxDev >= 0.12 && (
          <span>
            <strong>强相关，显著不独立</strong>（δ = {fmt(maxDev)}）。红色高亮格子
            说明联合概率远超或远低于边缘乘积——X 的取值对 Y 的分布有显著影响。
          </span>
        )}
      </div>
    </div>
  );
}
