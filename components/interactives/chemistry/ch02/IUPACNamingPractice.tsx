"use client";

import { memo, useState } from "react";

const ACCENT = "#0f766e";
const ACCENT_SOFT = "#5eead4";
const SUBSTITUENT_COLOR = "#b45309";

interface Substituent {
  /** 取代基所在主链碳的位号（从 1 开始） */
  position: number;
  /** 取代基名称，如 "甲基"、"乙基" */
  name: string;
}

interface AlkaneStructure {
  id: string;
  /** 结构的通俗描述 */
  label: string;
  /** 主链碳原子数 */
  mainChainLength: number;
  /** 主链对应的烷烃词根，如 "丁烷"、"戊烷"、"己烷" */
  parentName: string;
  /** 取代基列表（已按正确编号给出） */
  substituents: Substituent[];
  /** 正确的系统命名 */
  systematicName: string;
  /** 逐步命名说明 */
  steps: string[];
}

const STRUCTURES: AlkaneStructure[] = [
  {
    id: "2-methylbutane",
    label: "丁烷主链 + 1 个甲基",
    mainChainLength: 4,
    parentName: "丁烷",
    substituents: [{ position: 2, name: "甲基" }],
    systematicName: "2-甲基丁烷",
    steps: [
      "① 选最长碳链：找出含碳最多的连续碳链，共 4 个碳，作为主链，词根为「丁烷」。",
      "② 编号：从靠近取代基的一端开始编号，使取代基位号最小。本例从右端编号，甲基落在 2 号碳（左端编号会得到 3 号，故选 2 号）。",
      "③ 列取代基：2 号碳上有 1 个甲基，记作「2-甲基」。",
      "④ 组合：取代基位号-取代基名 + 主链名 = 2-甲基丁烷。",
    ],
  },
  {
    id: "23-dimethylpentane",
    label: "戊烷主链 + 2 个甲基",
    mainChainLength: 5,
    parentName: "戊烷",
    substituents: [
      { position: 2, name: "甲基" },
      { position: 3, name: "甲基" },
    ],
    systematicName: "2,3-二甲基戊烷",
    steps: [
      "① 选最长碳链：最长连续碳链含 5 个碳，主链词根为「戊烷」。",
      "② 编号：从靠近取代基的一端编号，使位号组 (2,3) 最小（另一端编号为 (3,4)，较大）。",
      "③ 列取代基：2 号与 3 号碳各有 1 个甲基，相同取代基合并并用「二」表示倍数，记作「2,3-二甲基」。",
      "④ 组合：位号按从小到大排列，组合成 2,3-二甲基戊烷。",
    ],
  },
  {
    id: "3-ethyl-2-methylhexane",
    label: "己烷主链 + 1 个乙基 + 1 个甲基",
    mainChainLength: 6,
    parentName: "己烷",
    substituents: [
      { position: 2, name: "甲基" },
      { position: 3, name: "乙基" },
    ],
    systematicName: "3-乙基-2-甲基己烷",
    steps: [
      "① 选最长碳链：最长连续碳链含 6 个碳，主链词根为「己烷」。",
      "② 编号：从靠近取代基的一端编号，使位号组 (2,3) 最小。",
      "③ 列取代基：2 号碳上有甲基，3 号碳上有乙基。",
      "④ 组合：不同取代基按汉字（或英文字母）顺序排列，「乙基」先于「甲基」，故写成 3-乙基-2-甲基己烷。",
    ],
  },
  {
    id: "224-trimethylpentane",
    label: "戊烷主链 + 3 个甲基（异辛烷）",
    mainChainLength: 5,
    parentName: "戊烷",
    substituents: [
      { position: 2, name: "甲基" },
      { position: 2, name: "甲基" },
      { position: 4, name: "甲基" },
    ],
    systematicName: "2,2,4-三甲基戊烷",
    steps: [
      "① 选最长碳链：最长连续碳链含 5 个碳，主链词根为「戊烷」。",
      "② 编号：从靠近取代基的一端编号，使位号组 (2,2,4) 最小（另一端为 (2,4,4)，较大）。",
      "③ 列取代基：2 号碳上有 2 个甲基、4 号碳上有 1 个甲基，共 3 个甲基，用「三」表示倍数，记作「2,2,4-三甲基」。",
      "④ 组合：2,2,4-三甲基戊烷（即俗称的「异辛烷」）。",
    ],
  },
  {
    id: "3-methylhexane",
    label: "己烷主链 + 1 个甲基",
    mainChainLength: 6,
    parentName: "己烷",
    substituents: [{ position: 3, name: "甲基" }],
    systematicName: "3-甲基己烷",
    steps: [
      "① 选最长碳链：最长连续碳链含 6 个碳，主链词根为「己烷」。",
      "② 编号：从两端分别编号，靠近取代基一端使甲基位于 3 号碳（另一端为 4 号，较大），故取 3 号。",
      "③ 列取代基：3 号碳上有 1 个甲基，记作「3-甲基」。",
      "④ 组合：3-甲基己烷。",
    ],
  },
];

/** 主链折线的水平间距与上下起伏（锯齿状碳骨架） */
const DX = 56;
const PEAK_Y = 70;
const VALLEY_Y = 110;

function mainChainPoint(index: number): { x: number; y: number } {
  const x = 40 + index * DX;
  const y = index % 2 === 0 ? VALLEY_Y : PEAK_Y;
  return { x, y };
}

function IUPACNamingPracticeBase() {
  const [selectedId, setSelectedId] = useState<string>(STRUCTURES[0].id);
  const [showSteps, setShowSteps] = useState<boolean>(false);

  const structure: AlkaneStructure =
    STRUCTURES.find((s) => s.id === selectedId) ?? STRUCTURES[0];

  const chainPoints = Array.from(
    { length: structure.mainChainLength },
    (_, i) => mainChainPoint(i)
  );

  const polylinePoints = chainPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const svgWidth = 40 + (structure.mainChainLength - 1) * DX + 40;
  const svgHeight = 180;

  function handleSelect(id: string): void {
    setSelectedId(id);
    setShowSteps(false);
  }

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4">
      <h3 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>
        IUPAC 命名练习器
      </h3>
      <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
        选择一个支链烷烃结构，观察它的碳骨架，再点击「显示命名步骤」逐步推导其
        IUPAC 系统名。换不同结构反复练习，掌握「选主链 → 编号 → 列取代基 →
        组合」的命名套路。
      </p>

      {/* 结构选择 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {STRUCTURES.map((s) => {
          const active = s.id === selectedId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelect(s.id)}
              className="rounded-lg border px-3 py-1.5 text-sm transition-colors"
              style={{
                borderColor: active ? ACCENT : "var(--line)",
                backgroundColor: active ? ACCENT : "var(--bg-muted)",
                color: active ? "#ffffff" : "var(--ink)",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* SVG 碳骨架 */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          role="img"
          aria-label={`${structure.label} 的碳骨架示意图`}
        >
          {/* 主链折线 */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke={ACCENT}
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* 取代基的键（从主链碳向上引出短线）与标注 */}
          {structure.substituents.map((sub, i) => {
            const base = chainPoints[sub.position - 1];
            // 同一碳上有多个取代基时左右错开
            const sameCarbon = structure.substituents.filter(
              (x) => x.position === sub.position
            );
            const orderOnCarbon = sameCarbon.indexOf(sub);
            const offsetX = (orderOnCarbon - (sameCarbon.length - 1) / 2) * 22;
            const tipX = base.x + offsetX;
            const tipY = base.y - 40;
            return (
              <g key={`${sub.position}-${sub.name}-${i}`}>
                <line
                  x1={base.x}
                  y1={base.y}
                  x2={tipX}
                  y2={tipY}
                  stroke={SUBSTITUENT_COLOR}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                <circle cx={tipX} cy={tipY} r={4} fill={SUBSTITUENT_COLOR} />
                <text
                  x={tipX}
                  y={tipY - 8}
                  textAnchor="middle"
                  fontSize={12}
                  fill={SUBSTITUENT_COLOR}
                  fontWeight={600}
                >
                  {sub.name}
                </text>
              </g>
            );
          })}

          {/* 主链碳原子的位号标注 */}
          {chainPoints.map((p, i) => (
            <g key={`carbon-${i}`}>
              <circle cx={p.x} cy={p.y} r={5} fill={ACCENT_SOFT} stroke={ACCENT} strokeWidth={1.5} />
              <text
                x={p.x}
                y={p.y + 24}
                textAnchor="middle"
                fontSize={12}
                fill="var(--ink-soft)"
              >
                C{i + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* 操作按钮 */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowSteps((v) => !v)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: ACCENT }}
        >
          {showSteps ? "隐藏命名步骤" : "显示命名步骤"}
        </button>
        <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
          主链 {structure.mainChainLength} 个碳 · 取代基{" "}
          {structure.substituents.length} 个
        </span>
      </div>

      {/* 命名步骤 */}
      {showSteps && (
        <div className="mt-4 space-y-3">
          <ol className="space-y-2">
            {structure.steps.map((step, i) => (
              <li
                key={i}
                className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3 text-sm leading-relaxed"
                style={{ color: "var(--ink)" }}
              >
                {step}
              </li>
            ))}
          </ol>

          <div
            className="rounded-lg border-2 p-4 text-center"
            style={{ borderColor: ACCENT, backgroundColor: "#f0fdfa" }}
          >
            <div className="text-xs" style={{ color: "var(--ink-soft)" }}>
              正确的 IUPAC 系统名
            </div>
            <div
              className="mt-1 text-xl font-bold tracking-wide"
              style={{ color: ACCENT }}
            >
              {structure.systematicName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(IUPACNamingPracticeBase);
