"use client";

import { memo, useState } from "react";

type ForceType = "dispersion" | "dipole" | "hydrogen";

interface Molecule {
  name: string;
  formula: string;
  force: ForceType;
  bp: number; // 真实沸点 (℃)
}

interface MoleculeGroup {
  id: string;
  title: string;
  description: string;
  molecules: Molecule[];
  explanation: string;
}

const FORCE_LABEL: Record<ForceType, string> = {
  dispersion: "色散力",
  dipole: "偶极-偶极",
  hydrogen: "氢键",
};

const FORCE_COLOR: Record<ForceType, string> = {
  dispersion: "#94a3b8",
  dipole: "#6366f1",
  hydrogen: "#ef4444",
};

const GROUPS: MoleculeGroup[] = [
  {
    id: "alkane-series",
    title: "正构烷烃同系列",
    description: "同类型分子间作用力（色散力），比较分子量对沸点的影响。",
    molecules: [
      { name: "甲烷", formula: "CH₄", force: "dispersion", bp: -161.5 },
      { name: "乙烷", formula: "C₂H₆", force: "dispersion", bp: -88.6 },
      { name: "丁烷", formula: "C₄H₁₀", force: "dispersion", bp: -0.5 },
      { name: "己烷", formula: "C₆H₁₄", force: "dispersion", bp: 68.7 },
    ],
    explanation:
      "四者主导作用力都是色散力。分子量越大、电子数越多，瞬时偶极越易产生且越强，色散力越大，因此沸点随碳链增长（分子量增大）而单调升高。",
  },
  {
    id: "pentane-isomers",
    title: "同分异构体（支链效应）",
    description: "分子式同为 C₅H₁₂，比较支链程度对沸点的影响。",
    molecules: [
      { name: "正戊烷", formula: "C₅H₁₂", force: "dispersion", bp: 36 },
      { name: "异戊烷", formula: "C₅H₁₂", force: "dispersion", bp: 28 },
      { name: "新戊烷", formula: "C₅H₁₂", force: "dispersion", bp: 9.5 },
    ],
    explanation:
      "三者分子量相同、均为色散力主导。支链越多分子越趋近球形，表面积越小、分子间接触面越少，色散力越弱，因此沸点：正戊烷 > 异戊烷 > 新戊烷。",
  },
  {
    id: "hydrogen-bond",
    title: "氢键组（C₂H₆O 与乙烷对比）",
    description: "相近分子量下，比较色散力、偶极力与氢键的强弱差异。",
    molecules: [
      { name: "乙烷", formula: "C₂H₆", force: "dispersion", bp: -88.6 },
      { name: "二甲醚", formula: "CH₃OCH₃", force: "dipole", bp: -24 },
      { name: "乙醇", formula: "C₂H₅OH", force: "hydrogen", bp: 78.4 },
    ],
    explanation:
      "乙烷只有弱色散力，沸点最低；二甲醚分子有极性 C–O–C，存在偶极-偶极作用，沸点升高；乙醇含 –OH，分子间能形成氢键（最强），需要更多能量才能气化，沸点最高（78.4℃）。可见氢键 > 偶极力 > 色散力。",
  },
];

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function BoilingPointComparatorBase() {
  const [groupId, setGroupId] = useState<string>(GROUPS[0].id);
  const [order, setOrder] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<boolean>(false);

  const group: MoleculeGroup =
    GROUPS.find((g) => g.id === groupId) ?? GROUPS[0];
  const molecules = group.molecules;

  // 正确顺序：按沸点从低到高排列的原始索引
  const correctOrder: number[] = molecules
    .map((_, i) => i)
    .sort((a, b) => molecules[a].bp - molecules[b].bp);

  function selectGroup(id: string): void {
    setGroupId(id);
    setOrder([]);
    setRevealed(false);
  }

  function pick(index: number): void {
    if (revealed) return;
    setOrder((prev) =>
      prev.includes(index) ? prev : [...prev, index]
    );
  }

  function resetGuess(): void {
    setOrder([]);
    setRevealed(false);
  }

  function reveal(): void {
    setRevealed(true);
  }

  const guessComplete = order.length === molecules.length;
  const guessCorrect = revealed && arraysEqual(order, correctOrder);

  // 条形图刻度
  const bps = molecules.map((m) => m.bp);
  const minBp = Math.min(...bps, 0);
  const maxBp = Math.max(...bps, 0);
  const range = maxBp - minBp || 1;
  const chartW = 520;
  const chartH = 40 + molecules.length * 52;
  const padLeft = 120;
  const padRight = 70;
  const barAreaW = chartW - padLeft - padRight;
  const zeroX = padLeft + ((0 - minBp) / range) * barAreaW;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4">
      <h3 className="text-lg font-semibold text-[var(--ink)]">
        分子间作用力与沸点比较
      </h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        选择一组分子，先按「沸点从低到高」猜测排列顺序，再揭晓真实沸点并理解背后的分子间作用力原理。
      </p>

      {/* 分组选择 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {GROUPS.map((g) => {
          const active = g.id === groupId;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => selectGroup(g.id)}
              className={
                "rounded-lg border px-3 py-1.5 text-sm transition-colors " +
                (active
                  ? "border-indigo-500 bg-indigo-500 text-white"
                  : "border-[var(--line)] bg-[var(--bg-muted)] text-[var(--ink)] hover:border-indigo-400")
              }
            >
              {g.title}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-sm text-[var(--ink-soft)]">{group.description}</p>

      {/* 猜测区 */}
      <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3">
        <div className="mb-2 text-sm font-medium text-[var(--ink)]">
          1. 点击分子，按你认为的「沸点从低 → 高」依次排列：
        </div>
        <div className="flex flex-wrap gap-2">
          {molecules.map((m, i) => {
            const chosen = order.includes(i);
            const pos = order.indexOf(i);
            return (
              <button
                key={m.name + i}
                type="button"
                disabled={revealed || chosen}
                onClick={() => pick(i)}
                className={
                  "relative rounded-lg border px-3 py-2 text-sm transition-colors " +
                  (chosen
                    ? "cursor-default border-indigo-300 bg-white text-[var(--ink-soft)] opacity-60"
                    : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-indigo-400")
                }
              >
                <span className="font-medium">{m.name}</span>{" "}
                <span className="text-xs text-[var(--ink-soft)]">
                  {m.formula}
                </span>
                {chosen && (
                  <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-xs text-white">
                    {pos + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 已选顺序展示 */}
        {order.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-[var(--ink)]">
            <span className="text-[var(--ink-soft)]">你的顺序：</span>
            {order.map((idx, k) => (
              <span key={idx} className="flex items-center gap-1.5">
                <span className="rounded bg-white px-2 py-0.5 ring-1 ring-[var(--line)]">
                  {molecules[idx].name}
                </span>
                {k < order.length - 1 && (
                  <span className="text-[var(--ink-soft)]">→</span>
                )}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!guessComplete || revealed}
            onClick={reveal}
            className={
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors " +
              (guessComplete && !revealed
                ? "bg-indigo-500 text-white hover:bg-indigo-600"
                : "cursor-not-allowed bg-[var(--bg-muted)] text-[var(--ink-soft)] ring-1 ring-[var(--line)]")
            }
          >
            揭晓答案
          </button>
          <button
            type="button"
            onClick={resetGuess}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-sm text-[var(--ink)] transition-colors hover:border-indigo-400"
          >
            重新猜
          </button>
        </div>
      </div>

      {/* 揭晓区 */}
      {revealed && (
        <div className="mt-4">
          <div
            className={
              "mb-3 rounded-lg px-3 py-2 text-sm font-medium " +
              (guessCorrect
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-amber-50 text-amber-700 ring-1 ring-amber-200")
            }
          >
            {guessCorrect
              ? "完全正确！你的排序与真实沸点一致。"
              : "差一点～ 正确顺序见下方条形图。"}
          </div>

          <div className="mb-2 text-sm font-medium text-[var(--ink)]">
            2. 真实沸点（℃）— 从低到高
          </div>

          {/* 条形图 */}
          <div className="overflow-x-auto">
            <svg
              width={chartW}
              height={chartH}
              viewBox={`0 0 ${chartW} ${chartH}`}
              role="img"
              aria-label="各分子真实沸点条形图"
            >
              {/* 0℃ 基准线 */}
              <line
                x1={zeroX}
                y1={10}
                x2={zeroX}
                y2={chartH - 10}
                stroke="var(--line)"
                strokeDasharray="4 3"
              />
              <text
                x={zeroX}
                y={chartH - 2}
                fontSize={10}
                textAnchor="middle"
                fill="var(--ink-soft)"
              >
                0℃
              </text>

              {correctOrder.map((idx, rank) => {
                const m = molecules[idx];
                const y = 20 + rank * 52;
                const valX = padLeft + ((m.bp - minBp) / range) * barAreaW;
                const x = Math.min(zeroX, valX);
                const w = Math.abs(valX - zeroX);
                return (
                  <g key={m.name + idx}>
                    {/* 名称 */}
                    <text
                      x={padLeft - 8}
                      y={y + 18}
                      fontSize={12}
                      textAnchor="end"
                      fill="var(--ink)"
                    >
                      {m.name}
                    </text>
                    <text
                      x={padLeft - 8}
                      y={y + 31}
                      fontSize={9}
                      textAnchor="end"
                      fill="var(--ink-soft)"
                    >
                      {m.formula}
                    </text>
                    {/* 条 */}
                    <rect
                      x={x}
                      y={y}
                      width={Math.max(w, 2)}
                      height={26}
                      rx={3}
                      fill={FORCE_COLOR[m.force]}
                    />
                    {/* 数值 */}
                    <text
                      x={valX + (m.bp >= 0 ? 6 : -6)}
                      y={y + 18}
                      fontSize={11}
                      textAnchor={m.bp >= 0 ? "start" : "end"}
                      fill="var(--ink)"
                    >
                      {m.bp}℃
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 图例 */}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--ink-soft)]">
            {(Object.keys(FORCE_LABEL) as ForceType[]).map((f) => (
              <span key={f} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ backgroundColor: FORCE_COLOR[f] }}
                />
                {FORCE_LABEL[f]}
              </span>
            ))}
          </div>

          {/* 解释 */}
          <div className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3 text-sm leading-relaxed text-[var(--ink)]">
            <span className="font-medium">为什么？</span> {group.explanation}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(BoilingPointComparatorBase);
