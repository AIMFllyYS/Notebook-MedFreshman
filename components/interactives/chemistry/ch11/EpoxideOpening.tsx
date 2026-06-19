"use client";

import { memo, useState } from "react";

type Catalysis = "base" | "acid";

interface SiteInfo {
  label: string;
  description: string;
  attackedCarbon: "C1" | "C2";
  product: string;
  mechanism: string;
  reason: string;
}

const INFO: Record<Catalysis, SiteInfo> = {
  base: {
    label: "碱催化（亲核条件）",
    description:
      "强亲核试剂 CH₃O⁻ 在中性 / 碱性条件下直接进攻环氧三元环。",
    attackedCarbon: "C1",
    product: "CH₃O–CH₂–CH(OH)–CH₃",
    mechanism: "SN2 类（协同背面进攻）",
    reason:
      "碱性条件下没有质子化，环氧环的两个 C–O 键差别不大，反应受位阻控制。亲核试剂走 SN2 路径，从位阻较小的一端（端位 CH₂，即取代少的碳 C1）背面进攻，过渡态拥挤程度最低，因此优先在位阻小的碳上开环。",
  },
  acid: {
    label: "酸催化（质子化条件）",
    description:
      "先由 H⁺ 质子化环氧氧，弱亲核试剂 CH₃OH 再进攻被活化的环。",
    attackedCarbon: "C2",
    product: "CH₃O–CH(CH₃)–CH₂(OH)",
    mechanism: "碳正离子类（SN1 倾向 / 较松的过渡态）",
    reason:
      "质子化后 C–O 键拉长、断裂，部分正电荷分布到碳上。取代多、位阻大的碳（C2，连有甲基）能更好地稳定正电荷（更稳定的“类碳正离子”），故 C–O 键优先在该碳上断开，亲核试剂进攻位阻较大的取代多碳。区域选择性由电子效应（正电荷稳定性）主导，而非位阻。",
  },
};

const MAIN = "#2563eb";
const HILITE = "#dc2626";

function EpoxideOpeningBase() {
  const [mode, setMode] = useState<Catalysis>("base");
  const info = INFO[mode];
  const attackC1 = info.attackedCarbon === "C1";

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
      <h3 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>
        环氧乙烷开环：区域选择性（酸催化 vs 碱催化）
      </h3>
      <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
        以 1,2-环氧丙烷（2-甲基环氧乙烷）+ 甲氧基亲核试剂为例。切换催化条件，观察亲核试剂进攻
        <strong>位阻小的端位碳</strong>（碱催化，SN2 类）还是
        <strong>位阻大的取代多碳</strong>（酸催化，碳正离子类）。
      </p>

      {/* 切换按钮 */}
      <div className="mt-4 flex gap-2">
        {(["base", "acid"] as const).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                borderColor: active ? MAIN : "var(--line)",
                backgroundColor: active ? MAIN : "var(--bg-muted)",
                color: active ? "#fff" : "var(--ink)",
              }}
            >
              {m === "base" ? "碱催化" : "酸催化"}
            </button>
          );
        })}
      </div>

      {/* SVG 反应示意 */}
      <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3">
        <svg
          viewBox="0 0 520 240"
          className="h-auto w-full"
          role="img"
          aria-label="环氧三元环开环区域选择示意图"
        >
          {/* ===== 环氧三元环（左侧反应物） ===== */}
          {/* 三角形：顶点 O，底边两个碳 C1(右)、C2(左,带甲基) */}
          <g>
            {/* 环氧三角键 */}
            <line x1="120" y1="60" x2="80" y2="120" stroke="var(--ink)" strokeWidth={2} />
            <line x1="120" y1="60" x2="160" y2="120" stroke="var(--ink)" strokeWidth={2} />
            <line x1="80" y1="120" x2="160" y2="120" stroke="var(--ink)" strokeWidth={2} />

            {/* O 顶点（质子化时显示 H⁺） */}
            <circle cx="120" cy="60" r="13" fill="#fff" stroke="var(--ink)" strokeWidth={1.5} />
            <text x="120" y="65" textAnchor="middle" fontSize="13" fill="var(--ink)">
              {mode === "acid" ? "O⁺" : "O"}
            </text>
            {mode === "acid" && (
              <text x="120" y="38" textAnchor="middle" fontSize="12" fill={HILITE}>
                H⁺
              </text>
            )}

            {/* C2（左、取代多：带 CH₃，位阻大） */}
            <circle
              cx="80"
              cy="120"
              r="13"
              fill="#fff"
              stroke={!attackC1 ? HILITE : "var(--ink)"}
              strokeWidth={!attackC1 ? 2.5 : 1.5}
            />
            <text x="80" y="125" textAnchor="middle" fontSize="12" fill="var(--ink)">
              C2
            </text>
            {/* C2 上的甲基 */}
            <line x1="80" y1="120" x2="48" y2="150" stroke="var(--ink)" strokeWidth={2} />
            <text x="36" y="166" textAnchor="middle" fontSize="11" fill="var(--ink-soft)">
              CH₃
            </text>

            {/* C1（右、端位 CH₂，位阻小） */}
            <circle
              cx="160"
              cy="120"
              r="13"
              fill="#fff"
              stroke={attackC1 ? HILITE : "var(--ink)"}
              strokeWidth={attackC1 ? 2.5 : 1.5}
            />
            <text x="160" y="125" textAnchor="middle" fontSize="12" fill="var(--ink)">
              C1
            </text>
            <text x="178" y="150" textAnchor="middle" fontSize="11" fill="var(--ink-soft)">
              CH₂
            </text>
          </g>

          {/* ===== 亲核试剂进攻箭头（指向被进攻的碳） ===== */}
          {attackC1 ? (
            <g>
              <line
                x1="240"
                y1="120"
                x2="176"
                y2="120"
                stroke={HILITE}
                strokeWidth={2}
                markerEnd="url(#arrow)"
              />
              <text x="250" y="124" fontSize="12" fill={HILITE}>
                CH₃O⁻ 背面进攻 C1
              </text>
            </g>
          ) : (
            <g>
              <line
                x1="20"
                y1="120"
                x2="64"
                y2="120"
                stroke={HILITE}
                strokeWidth={2}
                markerEnd="url(#arrow)"
              />
              <text x="6" y="104" fontSize="12" fill={HILITE}>
                CH₃OH 进攻 C2
              </text>
            </g>
          )}

          {/* 反应箭头 */}
          <line x1="270" y1="200" x2="330" y2="200" stroke="var(--ink)" strokeWidth={2} markerEnd="url(#arrow)" />
          <text x="300" y="192" textAnchor="middle" fontSize="11" fill="var(--ink-soft)">
            开环
          </text>

          {/* ===== 产物（右侧） ===== */}
          <g>
            <text x="360" y="70" fontSize="12" fill={MAIN}>
              {mode === "base" ? "碱催化产物：" : "酸催化产物："}
            </text>
            <text x="360" y="96" fontSize="13" fill="var(--ink)">
              {info.product}
            </text>
            <text x="360" y="126" fontSize="11" fill="var(--ink-soft)">
              进攻碳：{info.attackedCarbon}
            </text>
            <text x="360" y="146" fontSize="11" fill="var(--ink-soft)">
              ({attackC1 ? "位阻小 / 端位 CH₂" : "位阻大 / 取代多碳"})
            </text>
          </g>

          {/* 箭头定义 */}
          <defs>
            <marker
              id="arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill={HILITE} />
            </marker>
          </defs>
        </svg>
      </div>

      {/* 文字解释 */}
      <div className="mt-4 space-y-2 text-sm" style={{ color: "var(--ink)" }}>
        <p className="font-semibold" style={{ color: MAIN }}>
          {info.label}
        </p>
        <p style={{ color: "var(--ink-soft)" }}>{info.description}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--line)] p-2">
            <span className="text-xs" style={{ color: "var(--ink-soft)" }}>
              机理类型
            </span>
            <p className="font-medium">{info.mechanism}</p>
          </div>
          <div className="rounded-lg border border-[var(--line)] p-2">
            <span className="text-xs" style={{ color: "var(--ink-soft)" }}>
              进攻位点
            </span>
            <p className="font-medium" style={{ color: HILITE }}>
              {info.attackedCarbon}（
              {attackC1 ? "位阻较小的端位碳" : "位阻较大的取代多碳"}）
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3">
          <span className="text-xs font-semibold" style={{ color: "var(--ink-soft)" }}>
            区域选择性原因
          </span>
          <p className="mt-1 leading-relaxed">{info.reason}</p>
        </div>
        <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
          小结：碱催化由<strong>位阻控制</strong>（SN2 类，进攻位阻小碳）；酸催化由
          <strong>电子效应控制</strong>（碳正离子稳定性，进攻位阻大、取代多的碳）。两条件给出
          <strong>相反</strong>的区域选择性，是环氧开环的经典对比。
        </p>
      </div>
    </div>
  );
}

export default memo(EpoxideOpeningBase);
