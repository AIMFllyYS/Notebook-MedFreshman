"use client";

import { memo, useState, useMemo } from "react";

type Substrate = "methyl" | "primary" | "secondary" | "tertiary";
type Nucleophile = "strong" | "weak";
type Solvent = "protic" | "aprotic";

type Mechanism = "SN2" | "SN1" | "mixed";

interface Verdict {
  mechanism: Mechanism;
  sn2Score: number;
  sn1Score: number;
  reasons: string[];
}

const SUBSTRATES: { value: Substrate; label: string; note: string }[] = [
  { value: "methyl", label: "甲基卤代烷 CH₃X", note: "无空间位阻，碳正离子最不稳定" },
  { value: "primary", label: "伯卤代烷 RCH₂X", note: "空间位阻小，碳正离子不稳定" },
  { value: "secondary", label: "仲卤代烷 R₂CHX", note: "介于两者之间，机理取决于条件" },
  { value: "tertiary", label: "叔卤代烷 R₃CX", note: "空间位阻大，碳正离子最稳定" },
];

const NUCLEOPHILES: { value: Nucleophile; label: string; note: string }[] = [
  { value: "strong", label: "强亲核试剂", note: "如 OH⁻、RO⁻、CN⁻、I⁻" },
  { value: "weak", label: "弱亲核试剂", note: "如 H₂O、ROH 等中性分子" },
];

const SOLVENTS: { value: Solvent; label: string; note: string }[] = [
  { value: "aprotic", label: "极性非质子溶剂", note: "如 DMSO、DMF、丙酮，不形成氢键" },
  { value: "protic", label: "极性质子溶剂", note: "如 H₂O、ROH，可氢键溶剂化稳定碳正离子" },
];

/**
 * 纯函数：根据底物、亲核试剂、溶剂综合判定 SN1/SN2 倾向。
 * 分别累加 SN2 与 SN1 的有利因素得分，比较后给出结论与理由。
 */
function decideMechanism(
  substrate: Substrate,
  nucleophile: Nucleophile,
  solvent: Solvent
): Verdict {
  let sn2Score = 0;
  let sn1Score = 0;
  const reasons: string[] = [];

  // 底物级数：级数越低越有利于 SN2（背面进攻无位阻），越高越有利于 SN1（碳正离子越稳定）
  switch (substrate) {
    case "methyl":
      sn2Score += 3;
      sn1Score -= 3;
      reasons.push("甲基卤代烷无空间位阻、且无法生成稳定碳正离子，强烈偏向 SN2。");
      break;
    case "primary":
      sn2Score += 2;
      sn1Score -= 2;
      reasons.push("伯卤代烷位阻小、伯碳正离子极不稳定，倾向 SN2。");
      break;
    case "secondary":
      sn2Score += 1;
      sn1Score += 1;
      reasons.push("仲卤代烷处于边界，SN1 与 SN2 均可能，由亲核试剂与溶剂决定。");
      break;
    case "tertiary":
      sn2Score -= 3;
      sn1Score += 3;
      reasons.push("叔卤代烷位阻大、叔碳正离子稳定，背面进攻受阻，强烈偏向 SN1。");
      break;
  }

  // 亲核试剂：强亲核试剂利于 SN2（决速步含亲核试剂）；弱亲核试剂下 SN2 难以进行，相对利于 SN1
  if (nucleophile === "strong") {
    sn2Score += 2;
    reasons.push("强亲核试剂主动进攻、参与 SN2 决速步，加速双分子取代。");
  } else {
    sn1Score += 2;
    reasons.push("弱亲核试剂难以发动背面进攻，反应更依赖先生成碳正离子的 SN1 路径。");
  }

  // 溶剂：极性非质子利于 SN2（不束缚亲核试剂）；极性质子利于 SN1（氢键溶剂化稳定碳正离子与离去基团）
  if (solvent === "aprotic") {
    sn2Score += 2;
    reasons.push("极性非质子溶剂不与亲核试剂形成氢键，裸露的亲核试剂活性更高，利于 SN2。");
  } else {
    sn1Score += 2;
    reasons.push("极性质子溶剂通过氢键溶剂化稳定碳正离子和离去基团，利于 SN1 的电离步。");
  }

  let mechanism: Mechanism;
  if (sn2Score - sn1Score >= 2) {
    mechanism = "SN2";
  } else if (sn1Score - sn2Score >= 2) {
    mechanism = "SN1";
  } else {
    mechanism = "mixed";
  }

  return { mechanism, sn2Score, sn1Score, reasons };
}

function OptionButton<T extends string>({
  active,
  label,
  note,
  onClick,
}: {
  active: boolean;
  label: string;
  note: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-lg border px-3 py-2 text-left transition-colors",
        active
          ? "border-indigo-500 bg-indigo-50"
          : "border-[var(--line)] bg-[var(--bg-muted)] hover:border-indigo-300",
      ].join(" ")}
    >
      <span className="block text-sm font-medium text-[var(--ink)]">{label}</span>
      <span className="block text-xs text-[var(--ink-soft)]">{note}</span>
    </button>
  );
}

/** SN2：背面进攻 + 瓦尔登翻转（构型翻转）示意图 */
function SN2Diagram() {
  return (
    <svg viewBox="0 0 320 160" className="w-full" role="img" aria-label="SN2 背面进攻与构型翻转示意">
      {/* 中心碳 */}
      <circle cx="160" cy="80" r="14" fill="#6366f1" />
      <text x="160" y="85" textAnchor="middle" fontSize="11" fill="#fff">C</text>

      {/* 离去基团 X（右侧离去） */}
      <circle cx="245" cy="80" r="12" fill="#f87171" />
      <text x="245" y="84" textAnchor="middle" fontSize="10" fill="#fff">X</text>
      <line x1="174" y1="80" x2="231" y2="80" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 3" />

      {/* 亲核试剂 Nu 从左侧背面进攻 */}
      <circle cx="55" cy="80" r="12" fill="#10b981" />
      <text x="55" y="84" textAnchor="middle" fontSize="9" fill="#fff">Nu</text>
      <line x1="67" y1="80" x2="146" y2="80" stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" />
      <polygon points="146,80 138,75 138,85" fill="#10b981" />

      {/* 三个其余取代基（伞翻转示意：进攻前向右，过渡态展开） */}
      <line x1="160" y1="80" x2="190" y2="40" stroke="var(--ink-soft)" strokeWidth="1.5" />
      <line x1="160" y1="80" x2="190" y2="120" stroke="var(--ink-soft)" strokeWidth="1.5" />
      <line x1="160" y1="80" x2="200" y2="80" stroke="var(--ink-soft)" strokeWidth="1.5" />

      <text x="160" y="148" textAnchor="middle" fontSize="11" fill="var(--ink)">
        一步协同：背面进攻 → 瓦尔登翻转（构型翻转）
      </text>
    </svg>
  );
}

/** SN1：碳正离子平面中间体 + 两面进攻（外消旋化）示意图 */
function SN1Diagram() {
  return (
    <svg viewBox="0 0 320 160" className="w-full" role="img" aria-label="SN1 碳正离子平面中间体与两面进攻示意">
      {/* 平面碳正离子 sp²，三个取代基 120° 共面 */}
      <circle cx="160" cy="80" r="14" fill="#6366f1" />
      <text x="160" y="78" textAnchor="middle" fontSize="11" fill="#fff">C</text>
      <text x="160" y="89" textAnchor="middle" fontSize="8" fill="#fff">+</text>

      {/* 三个共面取代基（sp² 平面三角形） */}
      <line x1="160" y1="80" x2="160" y2="40" stroke="var(--ink-soft)" strokeWidth="1.5" />
      <line x1="160" y1="80" x2="125" y2="100" stroke="var(--ink-soft)" strokeWidth="1.5" />
      <line x1="160" y1="80" x2="195" y2="100" stroke="var(--ink-soft)" strokeWidth="1.5" />

      {/* Nu 从上方进攻 */}
      <circle cx="80" cy="80" r="12" fill="#10b981" />
      <text x="80" y="84" textAnchor="middle" fontSize="9" fill="#fff">Nu</text>
      <line x1="92" y1="80" x2="146" y2="80" stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" />
      <polygon points="146,80 138,75 138,85" fill="#10b981" />

      {/* Nu 从下方进攻（另一面） */}
      <circle cx="240" cy="80" r="12" fill="#10b981" />
      <text x="240" y="84" textAnchor="middle" fontSize="9" fill="#fff">Nu</text>
      <line x1="228" y1="80" x2="174" y2="80" stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" />
      <polygon points="174,80 182,75 182,85" fill="#10b981" />

      <text x="160" y="148" textAnchor="middle" fontSize="11" fill="var(--ink)">
        两步：电离生成平面碳正离子 → 两面进攻 → 外消旋化
      </text>
    </svg>
  );
}

function SN1SN2CompareBase() {
  const [substrate, setSubstrate] = useState<Substrate>("primary");
  const [nucleophile, setNucleophile] = useState<Nucleophile>("strong");
  const [solvent, setSolvent] = useState<Solvent>("aprotic");

  const verdict = useMemo<Verdict>(
    () => decideMechanism(substrate, nucleophile, solvent),
    [substrate, nucleophile, solvent]
  );

  const headline: string =
    verdict.mechanism === "SN2"
      ? "倾向 SN2（双分子亲核取代）"
      : verdict.mechanism === "SN1"
      ? "倾向 SN1（单分子亲核取代）"
      : "竞争状态：SN1 与 SN2 势均力敌";

  const headlineColor: string =
    verdict.mechanism === "SN2"
      ? "text-emerald-700"
      : verdict.mechanism === "SN1"
      ? "text-rose-700"
      : "text-amber-700";

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4">
      <h3 className="text-lg font-semibold text-[var(--ink)]">SN1 / SN2 机理对比</h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        选择底物级数、亲核试剂强弱与溶剂极性，综合判定卤代烷亲核取代是走 SN2（一步背面进攻、构型翻转）
        还是 SN1（两步经碳正离子、外消旋化）。
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {/* 底物 */}
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--ink)]">底物（卤代烷级数）</p>
          <div className="space-y-2">
            {SUBSTRATES.map((s) => (
              <OptionButton
                key={s.value}
                active={substrate === s.value}
                label={s.label}
                note={s.note}
                onClick={() => setSubstrate(s.value)}
              />
            ))}
          </div>
        </div>

        {/* 亲核试剂 */}
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--ink)]">亲核试剂强弱</p>
          <div className="space-y-2">
            {NUCLEOPHILES.map((n) => (
              <OptionButton
                key={n.value}
                active={nucleophile === n.value}
                label={n.label}
                note={n.note}
                onClick={() => setNucleophile(n.value)}
              />
            ))}
          </div>
        </div>

        {/* 溶剂 */}
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--ink)]">溶剂极性</p>
          <div className="space-y-2">
            {SOLVENTS.map((sv) => (
              <OptionButton
                key={sv.value}
                active={solvent === sv.value}
                label={sv.label}
                note={sv.note}
                onClick={() => setSolvent(sv.value)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 判定结果 */}
      <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3">
        <p className={["text-base font-semibold", headlineColor].join(" ")}>{headline}</p>
        <div className="mt-1 flex gap-4 text-xs text-[var(--ink-soft)]">
          <span>SN2 有利度评分：{verdict.sn2Score}</span>
          <span>SN1 有利度评分：{verdict.sn1Score}</span>
        </div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--ink)]">
          {verdict.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      {/* 机理示意图 */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div
          className={[
            "rounded-lg border p-3",
            verdict.mechanism === "SN2"
              ? "border-emerald-400 bg-emerald-50"
              : "border-[var(--line)] bg-[var(--bg-muted)]",
          ].join(" ")}
        >
          <p className="mb-2 text-sm font-semibold text-emerald-700">SN2 机理</p>
          <SN2Diagram />
          <p className="mt-2 text-xs text-[var(--ink-soft)]">
            速率 = k[底物][Nu]，双分子决速步。亲核试剂从离去基团背面进攻，过渡态为五配位，
            产物立体构型发生<strong>翻转（瓦尔登翻转）</strong>，手性底物得到单一对映体（构型反转）。
          </p>
        </div>

        <div
          className={[
            "rounded-lg border p-3",
            verdict.mechanism === "SN1"
              ? "border-rose-400 bg-rose-50"
              : "border-[var(--line)] bg-[var(--bg-muted)]",
          ].join(" ")}
        >
          <p className="mb-2 text-sm font-semibold text-rose-700">SN1 机理</p>
          <SN1Diagram />
          <p className="mt-2 text-xs text-[var(--ink-soft)]">
            速率 = k[底物]，单分子决速步为电离生成<strong>平面 sp² 碳正离子</strong>中间体。
            亲核试剂可从平面两侧等概率进攻，手性底物因此<strong>外消旋化</strong>（生成接近 1:1 的对映体）。
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--ink-soft)]">
        规律小结：SN2 偏好「伯/甲基卤代烷 + 强亲核试剂 + 极性非质子溶剂」，构型翻转；
        SN1 偏好「叔卤代烷 + 极性质子溶剂」，经碳正离子外消旋化。仲卤代烷常处于竞争边界。
      </p>
    </div>
  );
}

export default memo(SN1SN2CompareBase);
