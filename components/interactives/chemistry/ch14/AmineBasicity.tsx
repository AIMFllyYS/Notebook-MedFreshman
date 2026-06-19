"use client";

import { memo, useState } from "react";

type BasicityLevel = "strong" | "medium" | "weak" | "very-weak" | "none";

interface AmineCompound {
  id: string;
  name: string;
  formula: string;
  /** 相对碱性评分（0-100），仅用于条形图直观比较 */
  strength: number;
  /** 近似 pKb 或定性描述 */
  pkb: string;
  level: BasicityLevel;
  reason: string;
}

// 碱性由强到弱排列：脂肪胺 > 氨 > 芳胺；吡咯几乎无碱性。
const AMINES: readonly AmineCompound[] = [
  {
    id: "dimethylamine",
    name: "二甲胺",
    formula: "(CH₃)₂NH",
    strength: 96,
    pkb: "pKb ≈ 3.3",
    level: "strong",
    reason:
      "两个烷基（甲基）的供电子诱导效应增大氮上电子云密度，并能较好地稳定共轭酸（铵离子）正电荷，故碱性最强（在水溶液中略强于甲胺）。",
  },
  {
    id: "methylamine",
    name: "甲胺",
    formula: "CH₃NH₂",
    strength: 90,
    pkb: "pKb ≈ 3.4",
    level: "strong",
    reason:
      "甲基的供电子诱导效应使氮原子孤对电子云密度升高，更易接受质子，碱性强于氨。",
  },
  {
    id: "ammonia",
    name: "氨",
    formula: "NH₃",
    strength: 78,
    pkb: "pKb ≈ 4.8",
    level: "medium",
    reason:
      "作为基准物，氮上无供电子或吸电子取代基，碱性介于脂肪胺与芳胺之间。",
  },
  {
    id: "pyridine",
    name: "吡啶",
    formula: "C₅H₅N",
    strength: 42,
    pkb: "pKb ≈ 8.8",
    level: "weak",
    reason:
      "吡啶氮以 sp² 杂化参与芳香环，但其孤对电子位于环平面内的 sp² 轨道上，并不参与 6π 芳香共轭体系，因此孤对可用于结合质子，仍具明显碱性（弱于脂肪胺，因 sp² 轨道 s 成分较高、电子被氮拉得更紧）。",
  },
  {
    id: "p-methoxyaniline",
    name: "对甲氧基苯胺",
    formula: "CH₃O–C₆H₄–NH₂",
    strength: 30,
    pkb: "pKb ≈ 8.7",
    level: "weak",
    reason:
      "对位甲氧基为给电子基（共轭供电子），向苯环输送电子，部分抵消苯环对氨基孤对的拉电子作用，因此碱性比苯胺略强，但仍弱于氨。",
  },
  {
    id: "aniline",
    name: "苯胺",
    formula: "C₆H₅–NH₂",
    strength: 22,
    pkb: "pKb ≈ 9.4",
    level: "weak",
    reason:
      "氨基氮的孤对电子与苯环 π 体系发生共轭离域，电子云密度降低，且共轭酸无此共振稳定，故芳胺碱性远弱于脂肪胺和氨。",
  },
  {
    id: "p-nitroaniline",
    name: "对硝基苯胺",
    formula: "O₂N–C₆H₄–NH₂",
    strength: 8,
    pkb: "pKb ≈ 13",
    level: "very-weak",
    reason:
      "对位硝基为强吸电子基（–I 与 –M 共同作用），通过共轭进一步抽走氨基孤对电子，使氮上电子密度大幅下降，碱性比苯胺还弱得多。",
  },
  {
    id: "pyrrole",
    name: "吡咯",
    formula: "C₄H₄NH",
    strength: 2,
    pkb: "几乎无碱性（共轭酸 pKa ≈ -3.8）",
    level: "none",
    reason:
      "吡咯氮的孤对电子参与构成 6π 电子的芳香体系（满足休克尔规则）。一旦质子化将破坏芳香性，故孤对几乎不可用于结合质子，吡咯几乎没有碱性（反而 N–H 呈弱酸性）。",
  },
];

const LEVEL_LABEL: Record<BasicityLevel, string> = {
  strong: "碱性强",
  medium: "中等",
  weak: "碱性弱",
  "very-weak": "碱性很弱",
  none: "几乎无碱性",
};

const LEVEL_COLOR: Record<BasicityLevel, string> = {
  strong: "var(--primary, #2563eb)",
  medium: "#0ea5e9",
  weak: "#f59e0b",
  "very-weak": "#f97316",
  none: "var(--ink-faint)",
};

function AmineBasicityBase() {
  const [revealed, setRevealed] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected: AmineCompound | null =
    selectedId === null
      ? null
      : AMINES.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
      <h3 className="text-lg font-semibold text-[var(--ink)]">
        胺的碱性比较
      </h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        含氮化合物的碱性取决于氮上孤对电子的可给出程度。一般规律：
        <span className="font-medium text-[var(--ink)]"> 脂肪胺 &gt; 氨 &gt; 芳胺</span>；
        吡啶孤对不参与芳香共轭故有碱性，吡咯孤对参与 6π 芳香体系故几乎无碱性。
        点击下方按钮查看排序，并点击任一化合物查看其碱性成因。
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          className="rounded-lg border border-[var(--line)] bg-[var(--primary,#2563eb)] px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {revealed ? "隐藏碱性排序" : "查看碱性排序（强 → 弱）"}
        </button>
        {revealed ? (
          <span className="text-xs text-[var(--ink-soft)]">
            条形越长，碱性越强
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        {AMINES.map((c, index) => {
          const isSelected = c.id === selectedId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(isSelected ? null : c.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                isSelected
                  ? "border-[var(--primary,#2563eb)] bg-[var(--bg-muted)]"
                  : "border-[var(--line)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-muted)]"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="flex items-baseline gap-2">
                  {revealed ? (
                    <span className="text-xs font-semibold text-[var(--ink-soft)]">
                      #{index + 1}
                    </span>
                  ) : null}
                  <span className="text-sm font-medium text-[var(--ink)]">
                    {c.name}
                  </span>
                  <span className="text-xs text-[var(--ink-soft)]">
                    {c.formula}
                  </span>
                </span>
                <span className="text-xs text-[var(--ink-soft)]">
                  {c.pkb} · {LEVEL_LABEL[c.level]}
                </span>
              </div>

              {revealed ? (
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-muted)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${c.strength}%`,
                      backgroundColor: LEVEL_COLOR[c.level],
                    }}
                  />
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-[var(--ink)]">
              {selected.name}
            </span>
            <span className="text-xs text-[var(--ink-soft)]">
              {selected.formula} · {selected.pkb}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-soft)]">
            {selected.reason}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-xs text-[var(--ink-soft)]">
          提示：点击上方任一化合物查看其碱性强弱的电子效应解释。
        </p>
      )}
    </div>
  );
}

export default memo(AmineBasicityBase);
