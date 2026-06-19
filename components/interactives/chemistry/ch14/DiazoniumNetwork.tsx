"use client";

import { memo, useState } from "react";

type ReactionCategory =
  | "sandmeyer"
  | "iodo"
  | "schiemann"
  | "reduction"
  | "hydrolysis"
  | "coupling";

interface DiazoniumReaction {
  id: string;
  reagent: string;
  condition: string;
  reactionName: string;
  product: string;
  productLabel: string;
  category: ReactionCategory;
  description: string;
  angle: number; // 度数，0 = 正右方，顺时针递增
}

const REACTIONS: readonly DiazoniumReaction[] = [
  {
    id: "cucl",
    reagent: "CuCl",
    condition: "Cu(I) 催化",
    reactionName: "桑德迈尔反应",
    product: "C₆H₅Cl",
    productLabel: "氯苯",
    category: "sandmeyer",
    description:
      "桑德迈尔反应：芳基重氮盐与 CuCl 作用，重氮基 −N₂⁺ 被 −Cl 取代生成氯苯，放出 N₂。",
    angle: -90,
  },
  {
    id: "cubr",
    reagent: "CuBr",
    condition: "Cu(I) 催化",
    reactionName: "桑德迈尔反应",
    product: "C₆H₅Br",
    productLabel: "溴苯",
    category: "sandmeyer",
    description:
      "桑德迈尔反应：与 CuBr 作用，−N₂⁺ 被 −Br 取代生成溴苯，并放出 N₂。",
    angle: -50,
  },
  {
    id: "cucn",
    reagent: "CuCN",
    condition: "Cu(I) 催化",
    reactionName: "桑德迈尔反应",
    product: "C₆H₅CN",
    productLabel: "苯甲腈",
    category: "sandmeyer",
    description:
      "桑德迈尔反应：与 CuCN 作用，−N₂⁺ 被 −CN 取代生成苯甲腈，可进一步制备羧酸。",
    angle: -10,
  },
  {
    id: "ki",
    reagent: "KI",
    condition: "无需催化，微热",
    reactionName: "卤代（碘代）",
    product: "C₆H₅I",
    productLabel: "碘苯",
    category: "iodo",
    description:
      "与 KI 共热即可，无需铜盐催化，−N₂⁺ 被 −I 取代生成碘苯，放出 N₂。",
    angle: 30,
  },
  {
    id: "hbf4",
    reagent: "HBF₄",
    condition: "生成重氮氟硼酸盐后加热",
    reactionName: "席曼反应",
    product: "C₆H₅F",
    productLabel: "氟苯",
    category: "schiemann",
    description:
      "席曼反应（Balz–Schiemann）：重氮盐与 HBF₄ 生成 ArN₂⁺BF₄⁻ 沉淀，加热分解得氟苯，放出 N₂ 和 BF₃。",
    angle: 70,
  },
  {
    id: "h3po2",
    reagent: "H₃PO₂",
    condition: "次磷酸还原",
    reactionName: "还原脱重氮基",
    product: "C₆H₆",
    productLabel: "苯",
    category: "reduction",
    description:
      "次磷酸 H₃PO₂（或乙醇）作还原剂，−N₂⁺ 被 −H 取代生成苯，用于从芳环上去除原有取代基（定位后脱去氨基）。",
    angle: 130,
  },
  {
    id: "h2o",
    reagent: "H₂O",
    condition: "稀硫酸中加热水解",
    reactionName: "水解",
    product: "C₆H₅OH",
    productLabel: "苯酚",
    category: "hydrolysis",
    description:
      "在稀硫酸中加热，重氮盐水解，−N₂⁺ 被 −OH 取代生成苯酚，并放出 N₂。",
    angle: 180,
  },
  {
    id: "coupling",
    reagent: "酚 / 芳胺",
    condition: "弱碱/弱酸性，低温偶联",
    reactionName: "偶联反应",
    product: "Ar−N=N−Ar′",
    productLabel: "偶氮化合物（偶氮染料）",
    category: "coupling",
    description:
      "偶联反应：重氮盐作为亲电试剂进攻酚或芳胺的对位（或邻位），生成含 −N=N− 的偶氮化合物，是合成偶氮染料的关键步骤。",
    angle: 230,
  },
];

const CATEGORY_COLOR: Record<ReactionCategory, string> = {
  sandmeyer: "#2563eb",
  iodo: "#0891b2",
  schiemann: "#7c3aed",
  reduction: "#16a34a",
  hydrolysis: "#ea580c",
  coupling: "#db2777",
};

const VIEW = 560;
const CENTER = VIEW / 2;
const CENTER_R = 52;
const NODE_RX = 62;
const NODE_RY = 30;
const ORBIT = 200;

function polar(angleDeg: number, radius: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function DiazoniumNetworkBase() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const active: DiazoniumReaction | null =
    REACTIONS.find((r) => r.id === activeId) ?? null;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
      <h3 className="text-lg font-semibold text-[var(--ink)]">
        重氮盐转化网络
      </h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        中心为芳基重氮盐 ArN₂⁺（如苯重氮盐 C₆H₅N₂⁺）。点击周围的试剂，查看它经由哪种反应转化为相应产物。
      </p>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row">
        <div className="flex-1">
          <svg
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            className="h-auto w-full select-none"
            role="img"
            aria-label="重氮盐转化网络图"
          >
            <defs>
              <marker
                id="diazo-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
              </marker>
            </defs>

            {/* 连线与产物节点 */}
            {REACTIONS.map((r) => {
              const isActive = r.id === activeId;
              const color = CATEGORY_COLOR[r.category];
              const node = polar(r.angle, ORBIT);
              const start = polar(r.angle, CENTER_R + 4);
              const end = polar(r.angle, ORBIT - NODE_RX - 4);

              return (
                <g
                  key={r.id}
                  style={{ color }}
                  className="cursor-pointer"
                  onClick={() => setActiveId(r.id)}
                >
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={color}
                    strokeWidth={isActive ? 3.5 : 1.5}
                    strokeOpacity={
                      activeId === null ? 0.4 : isActive ? 1 : 0.12
                    }
                    markerEnd="url(#diazo-arrow)"
                  />

                  {/* 反应名（沿连线中点） */}
                  {isActive ? (
                    <text
                      x={polar(r.angle, (CENTER_R + ORBIT - NODE_RX) / 2).x}
                      y={polar(r.angle, (CENTER_R + ORBIT - NODE_RX) / 2).y - 6}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight={700}
                      fill={color}
                    >
                      {r.reactionName}
                    </text>
                  ) : null}

                  {/* 产物节点 */}
                  <ellipse
                    cx={node.x}
                    cy={node.y}
                    rx={NODE_RX}
                    ry={NODE_RY}
                    fill={isActive ? color : "var(--bg-muted)"}
                    stroke={color}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    fillOpacity={isActive ? 1 : 0.6}
                    strokeOpacity={activeId === null || isActive ? 1 : 0.3}
                  />
                  <text
                    x={node.x}
                    y={node.y - 4}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight={700}
                    fill={isActive ? "#ffffff" : "var(--ink)"}
                    fillOpacity={activeId === null || isActive ? 1 : 0.4}
                  >
                    {r.product}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 12}
                    textAnchor="middle"
                    fontSize="11"
                    fill={isActive ? "#ffffff" : "var(--ink-soft)"}
                    fillOpacity={activeId === null || isActive ? 1 : 0.4}
                  >
                    {r.productLabel}
                  </text>
                </g>
              );
            })}

            {/* 中心重氮盐 */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={CENTER_R}
              fill="var(--accent)"
              stroke="var(--bg-elevated)"
              strokeWidth={3}
            />
            <text
              x={CENTER}
              y={CENTER - 4}
              textAnchor="middle"
              fontSize="18"
              fontWeight={800}
              fill="var(--accent-ink)"
            >
              ArN₂⁺
            </text>
            <text
              x={CENTER}
              y={CENTER + 16}
              textAnchor="middle"
              fontSize="11"
              fill="var(--accent-ink)"
              fillOpacity={0.85}
            >
              芳基重氮盐
            </text>
          </svg>
        </div>

        {/* 右侧：试剂按钮 + 说明 */}
        <div className="flex w-full flex-col gap-3 lg:w-72">
          <div className="grid grid-cols-2 gap-2">
            {REACTIONS.map((r) => {
              const isActive = r.id === activeId;
              const color = CATEGORY_COLOR[r.category];
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveId(r.id)}
                  className="rounded-lg border px-2 py-2 text-left text-sm transition-colors"
                  style={{
                    borderColor: isActive ? color : "var(--line)",
                    backgroundColor: isActive ? color : "var(--bg-muted)",
                    color: isActive ? "#ffffff" : "var(--ink)",
                  }}
                >
                  <span className="block font-semibold">{r.reagent}</span>
                  <span
                    className="block text-xs"
                    style={{
                      color: isActive ? "rgba(255,255,255,0.85)" : "var(--ink-soft)",
                    }}
                  >
                    {r.condition}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3">
            {active ? (
              <div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: CATEGORY_COLOR[active.category] }}
                >
                  {active.reactionName}
                </div>
                <div className="mt-1 text-sm text-[var(--ink)]">
                  ArN₂⁺ &nbsp;
                  <span className="font-semibold">{active.reagent}</span>
                  &nbsp;→&nbsp;
                  <span className="font-semibold">
                    {active.product}（{active.productLabel}）
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[var(--ink-soft)]">
                  {active.description}
                </p>
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-[var(--ink-soft)]">
                点击任一试剂按钮（或图中产物），高亮对应的转化路径并查看反应名称与说明。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(DiazoniumNetworkBase);
