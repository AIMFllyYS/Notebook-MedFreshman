"use client";

import { memo, useState } from "react";

type CationKey = "methyl" | "primary" | "secondary" | "tertiary";

interface CationData {
  key: CationKey;
  label: string;
  shortLabel: string;
  /** 中心碳上连接的甲基（烷基）数目 */
  adjacentMethyls: number;
  /** 参与 σ-p 超共轭的相邻 C-H σ 键数目 */
  hyperconjugationBonds: number;
  /** 相对稳定性（用于能量条与排序，数值越大越稳定） */
  stability: number;
  /** 结构简式描述 */
  formula: string;
}

const CATIONS: CationData[] = [
  {
    key: "methyl",
    label: "甲基碳正离子",
    shortLabel: "甲基 CH₃⁺",
    adjacentMethyls: 0,
    hyperconjugationBonds: 0,
    stability: 1,
    formula: "CH₃⁺",
  },
  {
    key: "primary",
    label: "伯（1°）碳正离子",
    shortLabel: "伯 1°",
    adjacentMethyls: 1,
    hyperconjugationBonds: 3,
    stability: 2,
    formula: "CH₃–CH₂⁺",
  },
  {
    key: "secondary",
    label: "仲（2°）碳正离子",
    shortLabel: "仲 2°",
    adjacentMethyls: 2,
    hyperconjugationBonds: 6,
    stability: 3,
    formula: "(CH₃)₂CH⁺",
  },
  {
    key: "tertiary",
    label: "叔（3°）碳正离子",
    shortLabel: "叔 3°",
    adjacentMethyls: 3,
    hyperconjugationBonds: 9,
    stability: 4,
    formula: "(CH₃)₃C⁺",
  },
];

interface ResonanceCation {
  key: string;
  label: string;
  formula: string;
  note: string;
}

const RESONANCE_CATIONS: ResonanceCation[] = [
  {
    key: "allyl",
    label: "烯丙基正离子",
    formula: "CH₂=CH–CH₂⁺",
    note: "正电荷通过 π 体系离域到两端碳，共振分散电荷。",
  },
  {
    key: "benzyl",
    label: "苄基正离子",
    formula: "C₆H₅–CH₂⁺",
    note: "正电荷离域进入苯环（邻、对位），多个共振式使其格外稳定。",
  },
];

const PRIMARY_COLOR = "#2563eb";
const POSITIVE_COLOR = "#dc2626";
const BOND_COLOR = "#16a34a";

/** 围绕中心点均匀放置的方向角（度），用于画甲基取代基 */
function methylAngles(count: number): number[] {
  if (count <= 0) return [];
  const base = -90; // 顶部开始
  const angles: number[] = [];
  for (let i = 0; i < count; i += 1) {
    angles.push(base + (360 / count) * i);
  }
  return angles;
}

function CarbocationStabilityBase() {
  const [selected, setSelected] = useState<CationKey>("tertiary");
  const [showResonance, setShowResonance] = useState<boolean>(false);

  const current: CationData =
    CATIONS.find((c) => c.key === selected) ?? CATIONS[0];

  const maxStability = Math.max(...CATIONS.map((c) => c.stability));

  // SVG 几何参数
  const cx = 130;
  const cy = 120;
  const bondLen = 62;
  const angles = methylAngles(current.adjacentMethyls);

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
      <h3 className="text-base font-semibold text-[var(--ink)]">
        碳正离子稳定性：超共轭与诱导效应
      </h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        点击下方任一碳正离子，观察其结构、参与 σ-p 超共轭的相邻 C–H σ 键数目，
        以及稳定性排序。中心碳上连接的烷基越多，可超共轭的 C–H 键越多、诱导供电子越强，
        正电荷越分散，离子越稳定。
      </p>

      {/* 选择按钮 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {CATIONS.map((c) => {
          const active = c.key === selected;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setSelected(c.key)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "border-transparent bg-[var(--primary,#2563eb)] text-white shadow"
                  : "border-[var(--line)] bg-[var(--bg-muted,#f8fafc)] text-[var(--ink)] hover:border-[var(--primary,#2563eb)]"
              }`}
              style={
                active ? { backgroundColor: PRIMARY_COLOR } : undefined
              }
            >
              {c.shortLabel}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* 结构图 */}
        <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted,#f8fafc)] p-3">
          <p className="mb-1 text-sm font-medium text-[var(--ink)]">
            {current.label}（{current.formula}）
          </p>
          <svg
            viewBox="0 0 260 240"
            className="h-56 w-full"
            role="img"
            aria-label={`${current.label}结构与超共轭 C-H 键`}
          >
            {/* 与甲基相连的键 + 超共轭 C-H 键高亮 */}
            {angles.map((deg, idx) => {
              const rad = (deg * Math.PI) / 180;
              const ex = cx + bondLen * Math.cos(rad);
              const ey = cy + bondLen * Math.sin(rad);
              // 每个甲基贡献 3 个相邻 C-H σ 键（小标记）
              const hMarks = [0, 1, 2].map((h) => {
                const hAngle = rad + (h - 1) * 0.55;
                const hx = ex + 22 * Math.cos(hAngle);
                const hy = ey + 22 * Math.sin(hAngle);
                return { hx, hy, key: `${idx}-${h}` };
              });
              return (
                <g key={`m-${idx}`}>
                  {/* C(中心)-C(甲基) 键 */}
                  <line
                    x1={cx}
                    y1={cy}
                    x2={ex}
                    y2={ey}
                    stroke="var(--ink)"
                    strokeWidth={2}
                  />
                  {/* 甲基碳 */}
                  <circle r={14} cx={ex} cy={ey} fill="var(--bg-muted)" stroke="var(--ink)" strokeWidth={1.5} />
                  <text
                    x={ex}
                    y={ey + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fill="var(--ink)"
                  >
                    C
                  </text>
                  {/* 超共轭 C-H σ 键（高亮绿色虚线 + H） */}
                  {hMarks.map((m) => (
                    <g key={m.key}>
                      <line
                        x1={ex}
                        y1={ey}
                        x2={m.hx}
                        y2={m.hy}
                        stroke={BOND_COLOR}
                        strokeWidth={2}
                        strokeDasharray="3 2"
                      />
                      <text
                        x={m.hx}
                        y={m.hy + 3}
                        textAnchor="middle"
                        fontSize={9}
                        fill={BOND_COLOR}
                      >
                        H
                      </text>
                    </g>
                  ))}
                </g>
              );
            })}

            {/* 中心碳正离子 */}
            <circle
              r={20}
              cx={cx}
              cy={cy}
              fill="var(--bg-muted)"
              stroke={POSITIVE_COLOR}
              strokeWidth={2.5}
            />
            <text
              x={cx}
              y={cy + 5}
              textAnchor="middle"
              fontSize={14}
              fontWeight={700}
              fill={POSITIVE_COLOR}
            >
              C⁺
            </text>

            {/* 甲基碳正离子无相邻烷基：画三个直接的 C-H（不超共轭） */}
            {current.adjacentMethyls === 0 &&
              methylAngles(3).map((deg, idx) => {
                const rad = (deg * Math.PI) / 180;
                const hx = cx + 46 * Math.cos(rad);
                const hy = cy + 46 * Math.sin(rad);
                return (
                  <g key={`h0-${idx}`}>
                    <line
                      x1={cx}
                      y1={cy}
                      x2={hx}
                      y2={hy}
                      stroke="var(--ink)"
                      strokeWidth={2}
                    />
                    <text
                      x={hx}
                      y={hy + 3}
                      textAnchor="middle"
                      fontSize={11}
                      fill="var(--ink-soft)"
                    >
                      H
                    </text>
                  </g>
                );
              })}
          </svg>
          <p className="text-xs text-[var(--ink-soft)]">
            高亮绿色虚线为参与 σ-p 超共轭的相邻 C–H σ 键：
            <span className="font-semibold text-[#16a34a]">
              {" "}
              {current.hyperconjugationBonds} 个
            </span>
            （相邻甲基数 {current.adjacentMethyls}，每个甲基约贡献 3 个 C–H）。
          </p>
        </div>

        {/* 能量条形图 */}
        <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted,#f8fafc)] p-3">
          <p className="mb-2 text-sm font-medium text-[var(--ink)]">
            稳定性排序：叔 &gt; 仲 &gt; 伯 &gt; 甲基
          </p>
          <div className="space-y-2">
            {[...CATIONS]
              .sort((a, b) => b.stability - a.stability)
              .map((c) => {
                const pct = (c.stability / maxStability) * 100;
                const active = c.key === selected;
                return (
                  <div key={c.key}>
                    <div className="flex items-center justify-between text-xs text-[var(--ink-soft)]">
                      <span
                        className={active ? "font-semibold text-[var(--ink)]" : ""}
                      >
                        {c.shortLabel}
                      </span>
                      <span>超共轭 {c.hyperconjugationBonds} 个 C–H</span>
                    </div>
                    <div className="mt-1 h-4 w-full overflow-hidden rounded bg-[var(--bg-elevated)] ring-1 ring-[var(--line)]">
                      <div
                        className="h-full rounded transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: active ? POSITIVE_COLOR : PRIMARY_COLOR,
                          opacity: active ? 1 : 0.55,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
          <p className="mt-2 text-xs text-[var(--ink-soft)]">
            条越长代表越稳定（能量越低）。烷基越多 → 超共轭 C–H 越多、诱导供电子越强。
          </p>
        </div>
      </div>

      {/* 文字解释 */}
      <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] p-3 text-sm text-[var(--ink-soft)]">
        <p className="font-medium text-[var(--ink)]">为什么烷基越多越稳定？</p>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>
            <span className="font-semibold text-[var(--ink)]">超共轭（σ-p 共轭）：</span>
            相邻 C–H σ 键的成键电子与中心碳的空 p 轨道部分交盖，把电子密度送入空轨道，
            分散正电荷。可超共轭的 C–H 越多，稳定化作用越强。
          </li>
          <li>
            <span className="font-semibold text-[var(--ink)]">诱导效应：</span>
            烷基相对 H 是供电子（+I）基团，沿 σ 键向缺电子的中心碳推送电子密度，
            降低正电荷集中程度。
          </li>
          <li>
            二者协同：叔（9 个 C–H、3 个烷基）&gt; 仲（6、2）&gt; 伯（3、1）&gt;
            甲基（0、0），故稳定性 <span className="font-semibold text-[var(--ink)]">叔 &gt; 仲 &gt; 伯 &gt; 甲基</span>。
          </li>
        </ul>
      </div>

      {/* 可选：共振稳定的碳正离子 */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowResonance((v) => !v)}
          className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted,#f8fafc)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--primary,#2563eb)]"
        >
          {showResonance ? "− 隐藏" : "+ 加分项"}：共振稳定的碳正离子（烯丙基 / 苄基）
        </button>

        {showResonance && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {RESONANCE_CATIONS.map((r) => (
              <div
                key={r.key}
                className="rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] p-3"
              >
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {r.label}
                </p>
                <p className="mt-0.5 font-mono text-sm text-[#dc2626]">
                  {r.formula}
                </p>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">{r.note}</p>
              </div>
            ))}
            <p className="text-xs text-[var(--ink-soft)] sm:col-span-2">
              共振离域比超共轭更有效：烯丙基/苄基正离子借助 π 体系把正电荷分摊到多个原子上，
              因此通常比一般的仲、甚至叔碳正离子更稳定。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(CarbocationStabilityBase);
