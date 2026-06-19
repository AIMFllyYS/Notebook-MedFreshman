"use client";

import { memo, useState } from "react";

type DirectingType = "ortho-para" | "meta";

type Substituent = {
  /** 取代基化学式（用于显示，含下标字符） */
  formula: string;
  /** 取代基名称 */
  name: string;
  /** 定位类型：邻对位定位基 / 间位定位基 */
  directing: DirectingType;
  /** true = 致活（活化苯环），false = 致钝（钝化苯环） */
  activating: boolean;
  /** 是否为卤素（致钝的邻对位定位基这一特例） */
  isHalogen: boolean;
  /** 电子效应说明（诱导 / 共轭） */
  reason: string;
};

const SUBSTITUENTS: readonly Substituent[] = [
  {
    formula: "-OH",
    name: "羟基",
    directing: "ortho-para",
    activating: true,
    isHalogen: false,
    reason:
      "氧上孤对电子与苯环 p-π 共轭，向环上供电子（+C 效应强于 -I 诱导吸电子），使邻、对位电子云密度升高。",
  },
  {
    formula: "-NH₂",
    name: "氨基",
    directing: "ortho-para",
    activating: true,
    isHalogen: false,
    reason:
      "氮上孤对电子与苯环强共轭供电子（+C），活化能力很强，邻、对位电子云密度显著升高。",
  },
  {
    formula: "-OCH₃",
    name: "甲氧基",
    directing: "ortho-para",
    activating: true,
    isHalogen: false,
    reason: "氧的孤对电子与环共轭供电子（+C），整体表现为供电子、活化苯环。",
  },
  {
    formula: "-CH₃",
    name: "甲基",
    directing: "ortho-para",
    activating: true,
    isHalogen: false,
    reason:
      "通过 σ 超共轭与 +I 诱导效应向环供电子，使邻、对位电子云密度升高，属弱活化基。",
  },
  {
    formula: "-Cl",
    name: "氯",
    directing: "ortho-para",
    activating: false,
    isHalogen: true,
    reason:
      "特例：卤素 -I 诱导吸电子（钝化苯环）强于其弱 +C 共轭供电子，故整体致钝；但共轭主要补偿邻、对位，反应仍主要进入邻、对位。",
  },
  {
    formula: "-Br",
    name: "溴",
    directing: "ortho-para",
    activating: false,
    isHalogen: true,
    reason:
      "特例：卤素以 -I 诱导吸电子为主，钝化苯环；弱 +C 共轭使邻、对位相对受益，反应主要进入邻、对位。",
  },
  {
    formula: "-NO₂",
    name: "硝基",
    directing: "meta",
    activating: false,
    isHalogen: false,
    reason:
      "强吸电子（-I 诱导 + -C 共轭），使邻、对位电子云密度下降最多，间位相对最高，故定位于间位并强烈钝化苯环。",
  },
  {
    formula: "-COOH",
    name: "羧基",
    directing: "meta",
    activating: false,
    isHalogen: false,
    reason:
      "羰基吸电子（-I + -C），邻、对位缺电子更明显，亲电试剂主要进入间位，苯环被钝化。",
  },
  {
    formula: "-CHO",
    name: "醛基",
    directing: "meta",
    activating: false,
    isHalogen: false,
    reason:
      "醛基羰基吸电子（-I + -C），降低邻、对位电子云密度，定位于间位并钝化苯环。",
  },
  {
    formula: "-SO₃H",
    name: "磺酸基",
    directing: "meta",
    activating: false,
    isHalogen: false,
    reason:
      "磺酸基强吸电子（-I + -C），邻、对位电子云密度下降，亲电取代主要发生在间位，钝化苯环。",
  },
] as const;

/** 苯环六个顶点（正六边形，1 号位在顶部，顺时针编号） */
const RING_VERTICES: readonly { x: number; y: number }[] = [
  { x: 130, y: 40 }, // 1：取代基所在位（顶部）
  { x: 208, y: 85 }, // 2：邻位
  { x: 208, y: 175 }, // 3：间位
  { x: 130, y: 220 }, // 4：对位
  { x: 52, y: 175 }, // 5：间位
  { x: 52, y: 85 }, // 6：邻位
];

/** 邻对位定位：高亮 2、4、6（邻位+对位） */
const ORTHO_PARA_POSITIONS: readonly number[] = [1, 3, 5];
/** 间位定位：高亮 3、5（间位） */
const META_POSITIONS: readonly number[] = [2, 4];

const PRIMARY = "var(--accent)"; // 自定义主色

function DirectingEffectBase() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const selected: Substituent = SUBSTITUENTS[selectedIndex];

  const highlightSet: readonly number[] =
    selected.directing === "ortho-para"
      ? ORTHO_PARA_POSITIONS
      : META_POSITIONS;

  const ringPath: string =
    RING_VERTICES.map((v, i) => `${i === 0 ? "M" : "L"} ${v.x} ${v.y}`).join(
      " "
    ) + " Z";

  const positionLabel: string =
    selected.directing === "ortho-para" ? "邻位 + 对位" : "间位";

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
      <h3 className="text-lg font-semibold text-[var(--ink)]">
        芳环定位效应预测
      </h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        选择苯环上已有的取代基，判断它是「邻对位定位基」还是「间位定位基」，
        并预测下一个亲电取代主要进入的位置（高亮显示）。
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 取代基选择列表 */}
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--ink-soft)]">
            选择苯环上的取代基：
          </p>
          <div className="flex flex-wrap gap-2">
            {SUBSTITUENTS.map((s, i) => {
              const active = i === selectedIndex;
              return (
                <button
                  key={s.formula}
                  type="button"
                  onClick={() => setSelectedIndex(i)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "border-transparent text-white"
                      : "border-[var(--line)] bg-[var(--bg-muted)] text-[var(--ink)] hover:border-[var(--ink-soft)]"
                  }`}
                  style={active ? { backgroundColor: PRIMARY } : undefined}
                >
                  {s.formula}
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-[var(--ink)]">
                {selected.formula}（{selected.name}）
              </span>
              <span
                className="rounded-md px-2 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: PRIMARY }}
              >
                {selected.directing === "ortho-para"
                  ? "邻对位定位基"
                  : "间位定位基"}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                  selected.activating
                    ? "bg-emerald-500/10 text-[var(--color-success)]"
                    : "bg-rose-500/10 text-[var(--md-sys-color-error)]"
                }`}
              >
                {selected.activating ? "致活（活化苯环）" : "致钝（钝化苯环）"}
              </span>
            </div>

            {selected.isHalogen && (
              <p className="mt-2 rounded-md bg-amber-500/10 px-2 py-1 text-xs text-[var(--color-warning)]">
                ⚠ 特例：卤素是「致钝的邻对位定位基」——既钝化苯环，又把反应导向邻、对位。
              </p>
            )}

            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
              <span className="font-medium text-[var(--ink)]">原因：</span>
              {selected.reason}
            </p>

            <p className="mt-2 text-sm text-[var(--ink)]">
              下一个亲电取代主要进入：
              <span className="font-semibold" style={{ color: PRIMARY }}>
                {" "}
                {positionLabel}
              </span>
            </p>
          </div>
        </div>

        {/* 苯环示意图 */}
        <div className="flex flex-col items-center justify-center">
          <svg
            viewBox="0 0 260 260"
            className="h-64 w-64"
            role="img"
            aria-label={`带 ${selected.formula} 取代基的苯环，高亮 ${positionLabel}`}
          >
            {/* 苯环骨架 */}
            <path
              d={ringPath}
              fill="none"
              stroke="var(--ink)"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            {/* 内圈（表示芳香大 π 键） */}
            <circle
              cx={130}
              cy={130}
              r={48}
              fill="none"
              stroke="var(--ink-soft)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />

            {RING_VERTICES.map((v, i) => {
              const isSubstituent = i === 0;
              const isHighlight = highlightSet.includes(i);
              return (
                <g key={`vertex-${i}`}>
                  {isHighlight && (
                    <circle
                      cx={v.x}
                      cy={v.y}
                      r={16}
                      fill={PRIMARY}
                      fillOpacity={0.18}
                      stroke={PRIMARY}
                      strokeWidth={2}
                    />
                  )}
                  <circle
                    cx={v.x}
                    cy={v.y}
                    r={5}
                    fill={
                      isSubstituent
                        ? PRIMARY
                        : isHighlight
                        ? PRIMARY
                        : "var(--ink-soft)"
                    }
                  />
                  {/* 位置编号 */}
                  <text
                    x={v.x}
                    y={v.y - 22}
                    textAnchor="middle"
                    fontSize="11"
                    fill="var(--ink-soft)"
                  >
                    {i + 1}
                  </text>
                </g>
              );
            })}

            {/* 1 号位取代基标签 */}
            <text
              x={RING_VERTICES[0].x}
              y={RING_VERTICES[0].y - 6}
              textAnchor="middle"
              fontSize="14"
              fontWeight="600"
              fill={PRIMARY}
            >
              {selected.formula}
            </text>
          </svg>

          <div className="mt-2 flex items-center gap-4 text-xs text-[var(--ink-soft)]">
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: PRIMARY }}
              />
              取代基 / 主要进攻位
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-[var(--ink-soft)]" />
              其它碳
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(DirectingEffectBase);
