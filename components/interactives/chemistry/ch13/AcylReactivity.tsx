"use client";

import { memo, useState } from "react";

type AcylDerivative = {
  id: string;
  name: string;
  leavingGroupSymbol: string;
  structure: string;
  leavingGroupAbility: string;
  electronicEffect: string;
  reactivityNote: string;
  /** 相对活性条形高度百分比，越高越活泼 */
  barHeight: number;
  accent: string;
};

const DERIVATIVES: readonly AcylDerivative[] = [
  {
    id: "acyl-chloride",
    name: "酰氯",
    leavingGroupSymbol: "Cl",
    structure: "R-CO-Cl",
    leavingGroupAbility:
      "离去基团 Cl⁻ 离去能力很强（HCl 是强酸，Cl⁻ 是弱碱、很稳定），亲核加成-消除的第二步极易发生。",
    electronicEffect:
      "Cl 的孤对电子与羰基的 p-π 共轭很弱（3p 轨道与 C 的 2p 匹配差），几乎不向羰基供电子，羰基碳带强正电、亲电性最高。",
    reactivityNote:
      "活性最高。可与水、醇、胺等多种弱亲核试剂迅速反应，是合成其他衍生物的常用起点。",
    barHeight: 100,
    accent: "#dc2626",
  },
  {
    id: "anhydride",
    name: "酸酐",
    leavingGroupSymbol: "OCOR",
    structure: "R-CO-O-CO-R",
    leavingGroupAbility:
      "离去基团羧酸根 RCOO⁻ 较稳定（羧酸是中等强度酸），离去能力较强，仅次于 Cl⁻。",
    electronicEffect:
      "O 的孤对电子被两个羰基共同争夺（分散给两个 C=O），对单个羰基的供电子共轭被削弱，羰基仍较亲电。",
    reactivityNote:
      "活性次于酰氯。常用于酰化反应，反应活性介于酰氯与酯之间。",
    barHeight: 72,
    accent: "#ea580c",
  },
  {
    id: "ester",
    name: "酯",
    leavingGroupSymbol: "OR",
    structure: "R-CO-OR",
    leavingGroupAbility:
      "离去基团 RO⁻ 碱性较强、较不稳定（醇是弱酸），离去能力较差，反应通常需酸或碱催化。",
    electronicEffect:
      "O 的孤对电子与羰基形成较强 p-π 共轭，向羰基供电子，部分抵消羰基碳的正电，亲电性下降。",
    reactivityNote:
      "活性较低。水解、醇解、氨解均需要催化或加热条件。",
    barHeight: 44,
    accent: "#ca8a04",
  },
  {
    id: "amide",
    name: "酰胺",
    leavingGroupSymbol: "NH₂",
    structure: "R-CO-NH₂",
    leavingGroupAbility:
      "离去基团 NH₂⁻ / 胺负离子碱性很强、极不稳定，是很差的离去基团，加成-消除的消除步骤非常困难。",
    electronicEffect:
      "N 电负性小、给电子能力强，孤对电子与羰基形成强 p-π 共轭（部分 C=N⁺ 性质），大幅降低羰基碳正电，亲电性最低。",
    reactivityNote:
      "活性最低。水解通常需强酸/强碱并长时间加热，反应最难发生。",
    barHeight: 20,
    accent: "#16a34a",
  },
];

function AcylReactivityBase() {
  const [selectedId, setSelectedId] = useState<string>(DERIVATIVES[0].id);
  const selected: AcylDerivative =
    DERIVATIVES.find((d) => d.id === selectedId) ?? DERIVATIVES[0];

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4">
      <h3 className="text-lg font-semibold text-[var(--ink)]">
        羧酸衍生物活性序列
      </h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        在亲核加成-消除反应中，四类羧酸衍生物的活性顺序为：
        <span className="font-medium text-[var(--ink)]">
          {" "}
          酰氯 &gt; 酸酐 &gt; 酯 &gt; 酰胺
        </span>
        。活性由两个因素共同决定：离去基团 L 的离去能力，以及 L 向羰基供电子的共轭强弱（供电子越强，羰基越不活泼）。点击下方任一类查看详情。
      </p>

      {/* 阶梯/条形图 */}
      <div className="mt-4 flex items-end gap-3" style={{ minHeight: 160 }}>
        {DERIVATIVES.map((d) => {
          const isActive = d.id === selectedId;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedId(d.id)}
              className="group flex flex-1 flex-col items-center justify-end rounded-lg p-1 transition-colors"
              style={{
                background: isActive ? "var(--bg-muted)" : "transparent",
              }}
              aria-pressed={isActive}
            >
              <span className="mb-1 text-xs font-medium text-[var(--ink-soft)]">
                {d.barHeight}
              </span>
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${d.barHeight}%`,
                  minHeight: 24,
                  background: d.accent,
                  opacity: isActive ? 1 : 0.55,
                  outline: isActive ? `2px solid ${d.accent}` : "none",
                  outlineOffset: 2,
                }}
              />
              <span
                className="mt-2 text-sm font-semibold"
                style={{ color: isActive ? d.accent : "var(--ink)" }}
              >
                {d.name}
              </span>
              <span className="text-[11px] text-[var(--ink-soft)]">
                {d.structure}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-center text-xs text-[var(--ink-soft)]">
        ← 活性从高到低（柱高表示相对活性，仅示意） →
      </p>

      {/* 详情面板 */}
      <div
        className="mt-4 rounded-lg border p-4"
        style={{
          borderColor: "var(--line)",
          background: "var(--bg-muted)",
        }}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className="text-base font-semibold"
            style={{ color: selected.accent }}
          >
            {selected.name}
          </span>
          <span className="font-mono text-sm text-[var(--ink)]">
            通式 {selected.structure}（L = {selected.leavingGroupSymbol}）
          </span>
        </div>

        <dl className="mt-3 space-y-3 text-sm">
          <div>
            <dt className="font-medium text-[var(--ink)]">
              离去基团（{selected.leavingGroupSymbol}）的离去能力
            </dt>
            <dd className="mt-0.5 text-[var(--ink-soft)]">
              {selected.leavingGroupAbility}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--ink)]">
              电子效应（L 的供电子共轭）
            </dt>
            <dd className="mt-0.5 text-[var(--ink-soft)]">
              {selected.electronicEffect}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--ink)]">活性说明</dt>
            <dd className="mt-0.5 text-[var(--ink-soft)]">
              {selected.reactivityNote}
            </dd>
          </div>
        </dl>
      </div>

      {/* 转化方向说明 */}
      <div className="mt-4 rounded-lg border border-[var(--line)] bg-white p-4">
        <p className="text-sm font-medium text-[var(--ink)]">
          转化方向：高活性 → 低活性 容易，反之困难
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <Pill label="酰氯" color="#dc2626" />
          <Arrow />
          <Pill label="酸酐" color="#ea580c" />
          <Arrow />
          <Pill label="酯" color="#ca8a04" />
          <Arrow />
          <Pill label="酰胺" color="#16a34a" />
        </div>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          例如酰氯醇解可生成酯（R-CO-Cl + R'OH → R-CO-OR' + HCl），因为生成物（酯）活性更低、反应趋势有利；而由酯直接转回酰氯则很困难，需特殊试剂。一般只能由活性高的衍生物制备活性低的衍生物，不能逆向自发进行。
        </p>
      </div>
    </div>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-semibold text-white"
      style={{ background: color }}
    >
      {label}
    </span>
  );
}

function Arrow() {
  return <span className="text-[var(--ink-soft)]">→</span>;
}

export default memo(AcylReactivityBase);
