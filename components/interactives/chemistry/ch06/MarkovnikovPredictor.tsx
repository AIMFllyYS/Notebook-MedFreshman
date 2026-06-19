"use client";

import { memo, useState } from "react";

type CarbocationClass = "primary" | "secondary" | "tertiary";

interface AlkeneCarbon {
  /** 该碳上的取代基描述（用于展示加成后结构） */
  label: string;
  /** 双键碳上原有的 H 数量（用于马氏规则判定：H 多者得 H） */
  hydrogens: number;
  /** 若 H⁺ 加到“另一个”碳，本碳变为碳正离子时的级数 */
  cationClassIfPositive: CarbocationClass;
}

interface Alkene {
  id: string;
  name: string;
  formula: string;
  /** 双键左碳 (C1) */
  c1: AlkeneCarbon;
  /** 双键右碳 (C2) */
  c2: AlkeneCarbon;
}

interface HalideAcid {
  id: string;
  name: string;
  /** 卤素符号 */
  x: string;
  /** 过氧化物效应是否适用（仅 HBr 适用反马氏自由基加成） */
  peroxideEffect: boolean;
}

const ALKENES: readonly Alkene[] = [
  {
    id: "propene",
    name: "丙烯",
    formula: "CH₃CH=CH₂",
    c1: {
      label: "CH₃CH",
      hydrogens: 1,
      cationClassIfPositive: "secondary",
    },
    c2: {
      label: "CH₂",
      hydrogens: 2,
      cationClassIfPositive: "primary",
    },
  },
  {
    id: "isobutylene",
    name: "2-甲基丙烯（异丁烯）",
    formula: "(CH₃)₂C=CH₂",
    c1: {
      label: "(CH₃)₂C",
      hydrogens: 0,
      cationClassIfPositive: "tertiary",
    },
    c2: {
      label: "CH₂",
      hydrogens: 2,
      cationClassIfPositive: "primary",
    },
  },
  {
    id: "but-1-ene",
    name: "1-丁烯",
    formula: "CH₃CH₂CH=CH₂",
    c1: {
      label: "CH₃CH₂CH",
      hydrogens: 1,
      cationClassIfPositive: "secondary",
    },
    c2: {
      label: "CH₂",
      hydrogens: 2,
      cationClassIfPositive: "primary",
    },
  },
  {
    id: "2-methylbut-2-ene",
    name: "2-甲基-2-丁烯",
    formula: "(CH₃)₂C=CHCH₃",
    c1: {
      label: "(CH₃)₂C",
      hydrogens: 0,
      cationClassIfPositive: "tertiary",
    },
    c2: {
      label: "CHCH₃",
      hydrogens: 1,
      cationClassIfPositive: "secondary",
    },
  },
];

const HALIDE_ACIDS: readonly HalideAcid[] = [
  { id: "hbr", name: "HBr", x: "Br", peroxideEffect: true },
  { id: "hcl", name: "HCl", x: "Cl", peroxideEffect: false },
  { id: "hi", name: "HI", x: "I", peroxideEffect: false },
];

const CATION_LABEL: Record<CarbocationClass, string> = {
  primary: "伯碳正离子 (1°)",
  secondary: "仲碳正离子 (2°)",
  tertiary: "叔碳正离子 (3°)",
};

const CATION_RANK: Record<CarbocationClass, number> = {
  primary: 1,
  secondary: 2,
  tertiary: 3,
};

const PRIMARY = "var(--accent)";

interface PathInfo {
  /** H⁺ 加到哪个碳（"c1" | "c2"） */
  hOn: "c1" | "c2";
  /** 形成碳正离子的碳 */
  cationCarbon: AlkeneCarbon;
  /** 得到 H 的碳 */
  hCarbon: AlkeneCarbon;
  cationClass: CarbocationClass;
}

function buildPaths(alkene: Alkene): { pathA: PathInfo; pathB: PathInfo } {
  // 路径 A：H⁺ 加到 c1 → c2 成为碳正离子
  const pathA: PathInfo = {
    hOn: "c1",
    cationCarbon: alkene.c2,
    hCarbon: alkene.c1,
    cationClass: alkene.c2.cationClassIfPositive,
  };
  // 路径 B：H⁺ 加到 c2 → c1 成为碳正离子
  const pathB: PathInfo = {
    hOn: "c2",
    cationCarbon: alkene.c1,
    hCarbon: alkene.c2,
    cationClass: alkene.c1.cationClassIfPositive,
  };
  return { pathA, pathB };
}

function productFormula(
  alkene: Alkene,
  x: string,
  xOn: "c1" | "c2",
): string {
  // xOn 表示 X 加到哪个碳；另一个碳得到 H
  const c1Group = xOn === "c1" ? `C(${x})` : "CH";
  const c2Group = xOn === "c2" ? `C(${x})` : "CH";
  // 用紧凑结构式拼接（保留原碳骨架描述）
  const left = alkene.c1.label.replace(/C$/, c1Group).replace(/CH$/, c1Group);
  const right = alkene.c2.label.replace(/C$/, c2Group).replace(/CH₂$/, "CH").replace(/CH$/, c2Group);
  return `${left}—${right}`;
}

function MarkovnikovPredictorBase() {
  const [alkeneId, setAlkeneId] = useState<string>(ALKENES[0].id);
  const [acidId, setAcidId] = useState<string>(HALIDE_ACIDS[0].id);
  const [peroxide, setPeroxide] = useState<boolean>(false);

  const alkene: Alkene =
    ALKENES.find((a) => a.id === alkeneId) ?? ALKENES[0];
  const acid: HalideAcid =
    HALIDE_ACIDS.find((h) => h.id === acidId) ?? HALIDE_ACIDS[0];

  const { pathA, pathB } = buildPaths(alkene);

  // 比较两条路径碳正离子稳定性，更稳定者为马氏（离子型）主产物路径
  const markovnikovPath: PathInfo =
    CATION_RANK[pathA.cationClass] >= CATION_RANK[pathB.cationClass]
      ? pathA
      : pathB;
  const antiMarkovnikovPath: PathInfo =
    markovnikovPath === pathA ? pathB : pathA;

  // 是否启用反马氏：仅当 HBr + 过氧化物
  const radicalActive: boolean = peroxide && acid.peroxideEffect;

  // 主产物：自由基加成时 H 加位置与离子型相反 → X 加到含氢多的碳
  // 离子型（马氏）：X 加到 markovnikovPath 中“形成碳正离子的碳”（含氢少的碳）
  const mainPath: PathInfo = radicalActive ? antiMarkovnikovPath : markovnikovPath;

  // X 加在“形成碳正离子（离子型）/自由基（自由基型）”的那个碳上
  const xOn: "c1" | "c2" =
    mainPath.cationCarbon === alkene.c1 ? "c1" : "c2";

  const mainProduct: string = productFormula(alkene, acid.x, xOn);

  // 过氧化物开启但不适用（HCl/HI）的提示
  const peroxideIgnored: boolean = peroxide && !acid.peroxideEffect;

  function renderPathCard(
    path: PathInfo,
    title: string,
    isMarkovnikov: boolean,
  ) {
    const stable: boolean = path === markovnikovPath;
    return (
      <div
        className="rounded-lg border p-3"
        style={{
          borderColor: isMarkovnikov ? PRIMARY : "var(--line)",
          background: isMarkovnikov ? "var(--accent-weak)" : "var(--bg-muted)",
        }}
      >
        <div className="mb-1 text-sm font-semibold" style={{ color: "var(--ink)" }}>
          {title}
        </div>
        <div className="text-xs" style={{ color: "var(--ink-soft)" }}>
          H⁺ 加到{" "}
          <span className="font-mono">
            {path.hOn === "c1" ? alkene.c1.label : alkene.c2.label}
          </span>
        </div>
        <div className="mt-1 text-sm" style={{ color: "var(--ink)" }}>
          → 生成 <span className="font-semibold">{CATION_LABEL[path.cationClass]}</span>
        </div>
        <div className="mt-1 text-xs" style={{ color: stable ? PRIMARY : "var(--ink-soft)" }}>
          {stable ? "更稳定（超共轭 / 诱导效应更强）" : "较不稳定"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
      <h3 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
        马氏规则加成预测
      </h3>
      <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
        选择不对称烯烃与卤化氢 HX，比较两条加成路径所生成碳正离子的稳定性，
        判定主产物。马氏规则：H 加到含氢较多的双键碳，X 加到含氢较少的碳，
        生成更稳定的碳正离子。开启“过氧化物存在”后，HBr 走自由基加成生成反马氏产物。
      </p>

      {/* 控制区 */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium" style={{ color: "var(--ink-soft)" }}>
            选择烯烃
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            {ALKENES.map((a) => {
              const active = a.id === alkeneId;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAlkeneId(a.id)}
                  className="rounded-lg border px-2 py-1 text-xs transition-colors"
                  style={{
                    borderColor: active ? PRIMARY : "var(--line)",
                    background: active ? PRIMARY : "var(--bg-muted)",
                    color: active ? "white" : "var(--ink)",
                  }}
                >
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium" style={{ color: "var(--ink-soft)" }}>
            选择卤化氢 HX
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            {HALIDE_ACIDS.map((h) => {
              const active = h.id === acidId;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setAcidId(h.id)}
                  className="rounded-lg border px-3 py-1 text-xs font-mono transition-colors"
                  style={{
                    borderColor: active ? PRIMARY : "var(--line)",
                    background: active ? PRIMARY : "var(--bg-muted)",
                    color: active ? "white" : "var(--ink)",
                  }}
                >
                  {h.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 过氧化物开关 */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={peroxide}
          onClick={() => setPeroxide((p) => !p)}
          className="relative h-6 w-11 rounded-full transition-colors"
          style={{ background: peroxide ? PRIMARY : "var(--line)" }}
        >
          <span
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
            style={{ transform: peroxide ? "translateX(22px)" : "translateX(2px)" }}
          />
        </button>
        <span className="text-sm" style={{ color: "var(--ink)" }}>
          过氧化物存在（ROOR，自由基引发剂）
        </span>
      </div>

      {peroxideIgnored && (
        <div
          className="mt-2 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: "#f59e0b", background: "rgba(245,158,11,0.08)", color: "var(--color-warning)" }}
        >
          注意：过氧化物效应（反马氏自由基加成）仅对 <strong>HBr</strong> 适用。
          {acid.name} 仍按马氏规则进行离子型加成，开关不影响产物。
        </div>
      )}

      {/* 反应式 SVG 概览 */}
      <div className="mt-4 rounded-lg border p-3" style={{ borderColor: "var(--line)", background: "var(--bg-muted)" }}>
        <svg viewBox="0 0 480 70" className="w-full" role="img" aria-label="加成反应总览">
          <text x="8" y="40" fontSize="16" fontFamily="monospace" fill="var(--ink)">
            {alkene.formula}
          </text>
          <text x="170" y="40" fontSize="16" fill="var(--ink-soft)">
            +
          </text>
          <text x="190" y="40" fontSize="16" fontFamily="monospace" fill="var(--ink)">
            {acid.name}
          </text>
          <line x1="250" y1="35" x2="320" y2="35" stroke={PRIMARY} strokeWidth="2" />
          <polygon points="320,35 312,31 312,39" fill={PRIMARY} />
          {radicalActive && (
            <text x="252" y="26" fontSize="11" fill={PRIMARY}>
              ROOR
            </text>
          )}
          <text x="330" y="40" fontSize="16" fontFamily="monospace" fill={PRIMARY}>
            {mainProduct}
          </text>
        </svg>
      </div>

      {/* 两条路径对比（离子型机理） */}
      {!radicalActive ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {renderPathCard(pathA, "路径 A", pathA === markovnikovPath)}
          {renderPathCard(pathB, "路径 B", pathB === markovnikovPath)}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border p-3" style={{ borderColor: PRIMARY, background: "rgba(37,99,235,0.06)" }}>
          <div className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            自由基链式加成机理（过氧化物效应）
          </div>
          <ul className="mt-1 list-disc pl-5 text-xs" style={{ color: "var(--ink-soft)" }}>
            <li>过氧化物受热分解产生自由基，夺取 H—Br 生成 Br·。</li>
            <li>
              Br· 先加到双键上含氢较多的碳，生成更稳定的碳自由基（取向与 H⁺ 相反）。
            </li>
            <li>该碳自由基再夺取 H 完成链增长，结果 Br 加到含氢较多的碳 → 反马氏产物。</li>
          </ul>
        </div>
      )}

      {/* 结论 */}
      <div
        className="mt-4 rounded-lg border p-3"
        style={{ borderColor: PRIMARY, background: "rgba(37,99,235,0.06)" }}
      >
        <div className="text-sm font-semibold" style={{ color: PRIMARY }}>
          {radicalActive ? "主产物（反马氏，自由基加成）" : "主产物（马氏规则，离子型加成）"}
        </div>
        <div className="mt-1 font-mono text-base" style={{ color: "var(--ink)" }}>
          {mainProduct}
        </div>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {radicalActive ? (
            <>
              在过氧化物存在下，{acid.name} 通过自由基链式机理加成：Br 加到含氢
              <strong>较多</strong>的碳上，与马氏规则相反，故得到反马氏产物。
              （此效应仅对 HBr 成立；HCl 键太强、HI 键太弱，均无过氧化物效应。）
            </>
          ) : (
            <>
              比较两条路径：{markovnikovPath === pathA ? "路径 A" : "路径 B"} 生成
              {CATION_LABEL[markovnikovPath.cationClass]}，比
              {antiMarkovnikovPath === pathA ? "路径 A" : "路径 B"} 的
              {CATION_LABEL[antiMarkovnikovPath.cationClass]}更稳定。 因此 H⁺ 优先加到含氢
              <strong>较多</strong>的碳，X⁻ 加到含氢<strong>较少</strong>的碳，
              符合马氏规则，生成更稳定碳正离子对应的主产物。
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default memo(MarkovnikovPredictorBase);
