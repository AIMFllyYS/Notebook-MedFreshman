"use client";

import { memo, useState, type ReactElement } from "react";

type Mechanism = "E2" | "E1";

interface AlkeneProduct {
  name: string;
  /** 双键上烷基取代基数目（取代度，越大越稳定） */
  substitution: number;
  /** 该 β-氢消除后双键的几何/位置说明 */
  detail: string;
  /** 是否为扎伊采夫主产物（多取代烯烃） */
  isZaitsev: boolean;
  /** 强碱大体积下（霍夫曼取向）该产物所占示意比例(%) */
  hofmannRatio: number;
  /** 普通碱/扎伊采夫取向下该产物所占示意比例(%) */
  zaitsevRatio: number;
}

interface Substrate {
  id: string;
  name: string;
  formula: string;
  /** 与离去基团相连的碳的类型，决定 E1 碳正离子稳定性倾向 */
  carbonClass: "1°" | "2°" | "3°";
  /** 可发生消除的不同 β-氢及对应烯烃产物 */
  products: AlkeneProduct[];
  note: string;
}

const SUBSTRATES: readonly Substrate[] = [
  {
    id: "2-bromobutane",
    name: "2-溴丁烷",
    formula: "CH3-CHBr-CH2-CH3",
    carbonClass: "2°",
    note: "两侧 β-碳上都有氢，消除方向不同得到不同取代度烯烃。",
    products: [
      {
        name: "2-丁烯 (但-2-烯)",
        substitution: 2,
        detail: "消除 C3 上的 β-氢，双键在 C2=C3，二取代烯烃，E2 主要给反式(E)。",
        isZaitsev: true,
        hofmannRatio: 30,
        zaitsevRatio: 80,
      },
      {
        name: "1-丁烯 (但-1-烯)",
        substitution: 1,
        detail: "消除 C1 上的 β-氢，双键在 C1=C2，端烯（一取代），霍夫曼产物。",
        isZaitsev: false,
        hofmannRatio: 70,
        zaitsevRatio: 20,
      },
    ],
  },
  {
    id: "2-bromo-2-methylbutane",
    name: "2-溴-2-甲基丁烷",
    formula: "(CH3)2CBr-CH2-CH3",
    carbonClass: "3°",
    note: "叔卤代烷，易走 E1（稳定叔碳正离子），也可 E2；存在两类 β-氢。",
    products: [
      {
        name: "2-甲基-2-丁烯",
        substitution: 3,
        detail: "消除 C3 的 β-氢，双键在 C2=C3，三取代烯烃，最稳定的扎伊采夫主产物。",
        isZaitsev: true,
        hofmannRatio: 28,
        zaitsevRatio: 82,
      },
      {
        name: "2-甲基-1-丁烯",
        substitution: 2,
        detail: "消除甲基上的 β-氢，双键在 C2=CH2，二取代端烯，霍夫曼（少取代）产物。",
        isZaitsev: false,
        hofmannRatio: 72,
        zaitsevRatio: 18,
      },
    ],
  },
  {
    id: "2-bromo-2-methylbutane-tBuOK",
    name: "2-溴-2,3-二甲基丁烷",
    formula: "(CH3)2CBr-CH(CH3)2",
    carbonClass: "3°",
    note: "叔卤代烷，β-碳上分别为甲基氢与次甲基氢，体现取向之争。",
    products: [
      {
        name: "2,3-二甲基-2-丁烯",
        substitution: 4,
        detail: "消除次甲基(C3-H)，双键在 C2=C3，四取代烯烃，高度稳定的扎伊采夫主产物。",
        isZaitsev: true,
        hofmannRatio: 25,
        zaitsevRatio: 85,
      },
      {
        name: "2,3-二甲基-1-丁烯",
        substitution: 2,
        detail: "消除一个甲基上的氢，得到端烯，二取代，霍夫曼产物。",
        isZaitsev: false,
        hofmannRatio: 75,
        zaitsevRatio: 15,
      },
    ],
  },
];

const MECH_INFO: Record<Mechanism, { title: string; points: readonly string[] }> = {
  E2: {
    title: "E2 · 双分子消除（一步协同）",
    points: [
      "强碱进攻 β-氢、C–H 与 C–X 键同时断裂，一步完成。",
      "立体要求：β-H 与离去基团需反式共平面（anti-periplanar），即反式消除。",
      "速率 = k[底物][碱]，二级反应；过渡态部分双键性，倾向生成更稳定（多取代）烯烃。",
    ],
  },
  E1: {
    title: "E1 · 单分子消除（碳正离子分步）",
    points: [
      "先离去基团离去生成碳正离子（决速步），再失去 β-氢形成双键。",
      "速率 = k[底物]，与碱浓度无关；叔/烯丙位等稳定碳正离子最易走 E1。",
      "碳正离子平面构型，无严格反式要求；同样遵循扎伊采夫，主要给多取代烯烃。",
    ],
  },
};

function bar(ratio: number, color: string): ReactElement {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--bg-muted)]">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${ratio}%`, backgroundColor: color }}
      />
    </div>
  );
}

function EliminationZaitsevBase() {
  const [substrateId, setSubstrateId] = useState<string>(SUBSTRATES[0].id);
  const [mechanism, setMechanism] = useState<Mechanism>("E2");
  const [bulkyBase, setBulkyBase] = useState<boolean>(false);

  const substrate: Substrate =
    SUBSTRATES.find((s) => s.id === substrateId) ?? SUBSTRATES[0];

  const ratioOf = (p: AlkeneProduct): number =>
    bulkyBase ? p.hofmannRatio : p.zaitsevRatio;

  const orientationLabel = bulkyBase
    ? "反扎伊采夫 · 霍夫曼取向（少取代烯烃为主）"
    : "扎伊采夫取向（多取代、更稳定烯烃为主）";

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
      <h3 className="mb-1 text-lg font-semibold text-[var(--ink)]">
        E1 / E2 消除与扎伊采夫规则
      </h3>
      <p className="mb-4 text-sm text-[var(--ink-soft)]">
        卤代烷消除 HX 生成烯烃。同一底物的不同 β-氢被消除会得到不同取代度的烯烃：
        <b className="text-[var(--ink)]">扎伊采夫规则</b>指出主产物通常是双键上取代基更多、
        更稳定的烯烃；而用<b className="text-[var(--ink)]">强碱、大体积碱</b>（如叔丁醇钾）时，
        取向可逆转为少取代的<b className="text-[var(--ink)]">霍夫曼产物</b>（反扎伊采夫）。
      </p>

      {/* 底物选择 */}
      <div className="mb-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]">
          选择卤代烷底物
        </div>
        <div className="flex flex-wrap gap-2">
          {SUBSTRATES.map((s) => {
            const active = s.id === substrateId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSubstrateId(s.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-indigo-500 bg-[var(--accent-weak)] text-[var(--accent)]"
                    : "border-[var(--line)] bg-[var(--bg-elevated)] text-[var(--ink)] hover:bg-[var(--bg-muted)]"
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
        <div className="mt-2 rounded-lg bg-[var(--bg-muted)] p-3">
          <div className="font-mono text-sm text-[var(--ink)]">{substrate.formula}</div>
          <div className="mt-1 text-xs text-[var(--ink-soft)]">
            连碳类型：<b className="text-[var(--ink)]">{substrate.carbonClass}</b> · {substrate.note}
          </div>
        </div>
      </div>

      {/* 机理与碱选择 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex overflow-hidden rounded-lg border border-[var(--line)]">
          {(["E2", "E1"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMechanism(m)}
              className={`px-4 py-1.5 text-sm transition-colors ${
                mechanism === m
                  ? "bg-indigo-600 text-white"
                  : "bg-[var(--bg-elevated)] text-[var(--ink)] hover:bg-[var(--bg-muted)]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--ink)]">
          <input
            type="checkbox"
            checked={bulkyBase}
            onChange={(e) => setBulkyBase(e.target.checked)}
            className="h-4 w-4 accent-indigo-600"
          />
          强碱 / 大体积碱（叔丁醇钾，t-BuOK）
        </label>
      </div>

      {/* 机理说明 */}
      <div className="mb-4 rounded-lg border border-[var(--line)] p-3">
        <div className="mb-1 text-sm font-semibold text-[var(--ink)]">
          {MECH_INFO[mechanism].title}
        </div>
        <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--ink-soft)]">
          {MECH_INFO[mechanism].points.map((pt) => (
            <li key={pt}>{pt}</li>
          ))}
        </ul>
        {mechanism === "E2" ? (
          <ZaitsevAntiSvg />
        ) : (
          <div className="mt-3 rounded bg-[var(--bg-muted)] p-2 text-xs text-[var(--ink-soft)]">
            E1 经平面碳正离子中间体（
            <span className="font-mono text-[var(--ink)]">
              R3C<sup>+</sup>
            </span>
            ），无反式共平面要求，主产物仍服从扎伊采夫。
          </div>
        )}
      </div>

      {/* 取向标签 */}
      <div
        className={`mb-3 rounded-lg px-3 py-2 text-sm font-medium ${
          bulkyBase
            ? "bg-amber-500/10 text-[var(--color-warning)]"
            : "bg-emerald-500/10 text-[var(--color-success)]"
        }`}
      >
        当前取向：{orientationLabel}
      </div>

      {/* 产物分布 */}
      <div className="space-y-3">
        {substrate.products.map((p) => {
          const ratio = ratioOf(p);
          const isMajor = ratio >= 50;
          return (
            <div
              key={p.name}
              className="rounded-lg border border-[var(--line)] p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--ink)]">{p.name}</span>
                  <span className="rounded bg-[var(--bg-muted)] px-1.5 py-0.5 text-[11px] text-[var(--ink-soft)]">
                    {p.substitution} 取代烯烃
                  </span>
                  {p.isZaitsev ? (
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[11px] text-[var(--color-success)]">
                      扎伊采夫（更稳定）
                    </span>
                  ) : (
                    <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[11px] text-[var(--color-warning)]">
                      霍夫曼（少取代）
                    </span>
                  )}
                </div>
                <span
                  className={`text-sm font-semibold ${
                    isMajor ? "text-[var(--accent)]" : "text-[var(--ink-soft)]"
                  }`}
                >
                  ~{ratio}% · {isMajor ? "主产物" : "次产物"}
                </span>
              </div>
              <div className="mt-2">
                {bar(ratio, isMajor ? "var(--accent)" : "var(--line)")}
              </div>
              <p className="mt-2 text-xs text-[var(--ink-soft)]">{p.detail}</p>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-[var(--ink-soft)]">
        提示：比例为教学示意值。普通碱（如乙醇钠）下多取代的扎伊采夫产物占主；
        换用大体积强碱（t-BuOK）时，因难以接近内侧拥挤的 β-氢，转而消除位阻较小的端位
        β-氢，少取代的霍夫曼产物上升为主，即反扎伊采夫取向。
      </p>
    </div>
  );
}

function ZaitsevAntiSvg(): ReactElement {
  return (
    <div className="mt-3">
      <svg
        viewBox="0 0 320 120"
        role="img"
        aria-label="E2 反式共平面消除示意"
        className="w-full max-w-md"
      >
        <rect
          x="0.5"
          y="0.5"
          width="319"
          height="119"
          rx="8"
          fill="var(--bg-muted)"
          stroke="var(--line)"
        />
        {/* Cα-Cβ 键 */}
        <line x1="120" y1="60" x2="200" y2="60" stroke="var(--ink)" strokeWidth="2" />
        <circle cx="120" cy="60" r="14" fill="#fff" stroke="var(--ink)" strokeWidth="1.5" />
        <circle cx="200" cy="60" r="14" fill="#fff" stroke="var(--ink)" strokeWidth="1.5" />
        <text x="120" y="64" textAnchor="middle" fontSize="11" fill="var(--ink)">
          Cα
        </text>
        <text x="200" y="64" textAnchor="middle" fontSize="11" fill="var(--ink)">
          Cβ
        </text>
        {/* 离去基团 X 在 Cα 上方 */}
        <line x1="120" y1="46" x2="120" y2="22" stroke="#dc2626" strokeWidth="2" />
        <text x="120" y="18" textAnchor="middle" fontSize="11" fill="#dc2626">
          X (离去)
        </text>
        {/* β-H 在 Cβ 下方（反式） */}
        <line x1="200" y1="74" x2="200" y2="98" stroke="#2563eb" strokeWidth="2" />
        <text x="200" y="112" textAnchor="middle" fontSize="11" fill="#2563eb">
          β-H
        </text>
        {/* 碱进攻 β-H */}
        <text x="255" y="102" textAnchor="middle" fontSize="10" fill="var(--ink-soft)">
          B:⁻ →
        </text>
        {/* anti 标注 */}
        <text x="160" y="40" textAnchor="middle" fontSize="10" fill="var(--ink-soft)">
          反式共平面 (anti)
        </text>
      </svg>
      <div className="mt-1 text-[11px] text-[var(--ink-soft)]">
        X 与 β-H 处于反式共平面，碱夺 β-H、X 离去、Cα=Cβ 形成双键 —— E2 的反式消除。
      </div>
    </div>
  );
}

export default memo(EliminationZaitsevBase);
