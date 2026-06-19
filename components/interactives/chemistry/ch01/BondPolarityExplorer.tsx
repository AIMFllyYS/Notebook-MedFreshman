"use client";

import { memo, useState, useMemo, type ReactElement } from "react";

const ACCENT = "#5b46e5";

type BondType = "nonpolar" | "polar" | "ionic";

interface AtomData {
  symbol: string;
  name: string;
  en: number; // Pauling electronegativity
}

interface BondResult {
  type: BondType;
  label: string;
  description: string;
  color: string;
}

const ATOMS: ReadonlyArray<AtomData> = [
  { symbol: "H", name: "氢", en: 2.1 },
  { symbol: "C", name: "碳", en: 2.5 },
  { symbol: "N", name: "氮", en: 3.0 },
  { symbol: "O", name: "氧", en: 3.5 },
  { symbol: "F", name: "氟", en: 4.0 },
  { symbol: "Cl", name: "氯", en: 3.0 },
  { symbol: "Br", name: "溴", en: 2.8 },
  { symbol: "S", name: "硫", en: 2.5 },
];

function classifyBond(delta: number): BondResult {
  if (delta < 0.6) {
    return {
      type: "nonpolar",
      label: "非极性共价键",
      description:
        "电负性差很小（Δχ < 0.6），成键电子对几乎均等地被两个原子共享，分子无明显正负电荷中心。",
      color: "#16a34a",
    };
  }
  if (delta < 1.7) {
    return {
      type: "polar",
      label: "极性共价键",
      description:
        "电负性差中等（0.6 ≤ Δχ < 1.7），成键电子对偏向电负性较大的原子，使其带部分负电荷 δ−，另一原子带部分正电荷 δ+。",
      color: ACCENT,
    };
  }
  return {
    type: "ionic",
    label: "离子键",
    description:
      "电负性差很大（Δχ ≥ 1.7），电子几乎完全转移给电负性较大的原子，形成正、负离子并以静电引力结合。",
    color: "#dc2626",
  };
}

function AtomSelector({
  title,
  value,
  onChange,
}: {
  title: string;
  value: number;
  onChange: (en: number) => void;
}): ReactElement {
  return (
    <div className="flex-1">
      <div className="mb-1 text-xs font-medium text-[var(--ink-soft)]">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ATOMS.map((atom: AtomData) => {
          const active: boolean = atom.en === value;
          return (
            <button
              key={atom.symbol}
              type="button"
              onClick={() => onChange(atom.en)}
              className="rounded-lg border px-2.5 py-1 text-sm transition-colors"
              style={{
                borderColor: active ? ACCENT : "var(--line)",
                background: active ? ACCENT : "var(--bg-muted)",
                color: active ? "#ffffff" : "var(--ink)",
              }}
            >
              <span className="font-semibold">{atom.symbol}</span>
              <span className="ml-1 text-[11px] opacity-80">{atom.en.toFixed(1)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BondPolarityExplorerBase(): ReactElement {
  const [enA, setEnA] = useState<number>(2.1); // 默认 H
  const [enB, setEnB] = useState<number>(4.0); // 默认 F

  const atomA: AtomData =
    ATOMS.find((a: AtomData) => a.en === enA) ?? ATOMS[0];
  const atomB: AtomData =
    ATOMS.find((a: AtomData) => a.en === enB) ?? ATOMS[0];

  const delta: number = useMemo<number>(
    () => Math.abs(enA - enB),
    [enA, enB]
  );

  const result: BondResult = useMemo<BondResult>(
    () => classifyBond(delta),
    [delta]
  );

  // 偶极方向：电负性大的原子带 δ−（箭头指向它）
  const bMoreNegative: boolean = enB >= enA;
  const deltaSymbolA: string =
    delta === 0 ? "" : bMoreNegative ? "δ+" : "δ−";
  const deltaSymbolB: string =
    delta === 0 ? "" : bMoreNegative ? "δ−" : "δ+";

  // SVG 几何参数
  const svgW = 360;
  const svgH = 150;
  const cyAtom = 70;
  const cxA = 100;
  const cxB = 260;
  const rAtom = 28;

  // 箭头长度随 Δχ 增大（Δχ 上限按 3.5 归一），最长不超过原子间距
  const maxArrow = 110;
  const arrowLen: number = Math.min(maxArrow, (delta / 3.5) * maxArrow);
  const arrowCenterX = (cxA + cxB) / 2;
  const arrowY = cyAtom + rAtom + 28;
  // 箭头从 δ+ 指向 δ−
  const arrowFromX: number = bMoreNegative
    ? arrowCenterX - arrowLen / 2
    : arrowCenterX + arrowLen / 2;
  const arrowToX: number = bMoreNegative
    ? arrowCenterX + arrowLen / 2
    : arrowCenterX - arrowLen / 2;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
      <h3 className="text-base font-semibold text-[var(--ink)]">
        电负性与键极性探索器
      </h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        选择两个成键原子，实时计算电负性差 Δχ 并判定键的类型，下方用偶极箭头直观展示键的极性。
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <AtomSelector title="原子 A" value={enA} onChange={setEnA} />
        <AtomSelector title="原子 B" value={enB} onChange={setEnB} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3">
          <div className="text-xs text-[var(--ink-soft)]">电负性差 Δχ</div>
          <div className="mt-0.5 text-2xl font-bold text-[var(--ink)]">
            {delta.toFixed(1)}
          </div>
          <div className="mt-0.5 text-xs text-[var(--ink-soft)]">
            |{atomA.en.toFixed(1)} − {atomB.en.toFixed(1)}| ={" "}
            {atomA.symbol}–{atomB.symbol}
          </div>
        </div>
        <div
          className="rounded-lg border p-3"
          style={{
            borderColor: result.color,
            background: "var(--bg-muted)",
          }}
        >
          <div className="text-xs text-[var(--ink-soft)]">键的类型</div>
          <div
            className="mt-0.5 text-lg font-bold"
            style={{ color: result.color }}
          >
            {result.label}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-2">
        <svg
          width="100%"
          viewBox={`0 0 ${svgW} ${svgH}`}
          role="img"
          aria-label={`${atomA.symbol} 与 ${atomB.symbol} 成键的偶极示意图`}
          style={{ maxWidth: svgW }}
        >
          <defs>
            <marker
              id="bpe-arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L8,3 L0,6 Z" fill={result.color} />
            </marker>
          </defs>

          {/* 键（连线） */}
          <line
            x1={cxA + rAtom}
            y1={cyAtom}
            x2={cxB - rAtom}
            y2={cyAtom}
            stroke="var(--line)"
            strokeWidth={4}
          />

          {/* 原子 A */}
          <circle
            cx={cxA}
            cy={cyAtom}
            r={rAtom}
            fill="var(--bg-muted)"
            stroke={ACCENT}
            strokeWidth={2.5}
          />
          <text
            x={cxA}
            y={cyAtom + 5}
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill="var(--ink)"
          >
            {atomA.symbol}
          </text>
          {deltaSymbolA && (
            <text
              x={cxA}
              y={cyAtom - rAtom - 8}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill={result.color}
            >
              {deltaSymbolA}
            </text>
          )}

          {/* 原子 B */}
          <circle
            cx={cxB}
            cy={cyAtom}
            r={rAtom}
            fill="var(--bg-muted)"
            stroke={ACCENT}
            strokeWidth={2.5}
          />
          <text
            x={cxB}
            y={cyAtom + 5}
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill="var(--ink)"
          >
            {atomB.symbol}
          </text>
          {deltaSymbolB && (
            <text
              x={cxB}
              y={cyAtom - rAtom - 8}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill={result.color}
            >
              {deltaSymbolB}
            </text>
          )}

          {/* 偶极箭头：δ+ → δ− */}
          {delta > 0 && (
            <line
              x1={arrowFromX}
              y1={arrowY}
              x2={arrowToX}
              y2={arrowY}
              stroke={result.color}
              strokeWidth={3}
              markerEnd="url(#bpe-arrowhead)"
            />
          )}
          {delta === 0 && (
            <text
              x={arrowCenterX}
              y={arrowY + 4}
              textAnchor="middle"
              fontSize="12"
              fill="var(--ink-soft)"
            >
              无偶极（对称分布）
            </text>
          )}
          {delta > 0 && (
            <text
              x={arrowCenterX}
              y={arrowY + 22}
              textAnchor="middle"
              fontSize="11"
              fill="var(--ink-soft)"
            >
              偶极矩方向（指向 δ−）
            </text>
          )}
        </svg>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
        {result.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-md border border-[var(--line)] px-2 py-1 text-[var(--ink-soft)]">
          Δχ &lt; 0.6 非极性共价键
        </span>
        <span className="rounded-md border border-[var(--line)] px-2 py-1 text-[var(--ink-soft)]">
          0.6 ≤ Δχ &lt; 1.7 极性共价键
        </span>
        <span className="rounded-md border border-[var(--line)] px-2 py-1 text-[var(--ink-soft)]">
          Δχ ≥ 1.7 离子键
        </span>
      </div>
    </div>
  );
}

export default memo(BondPolarityExplorerBase);
