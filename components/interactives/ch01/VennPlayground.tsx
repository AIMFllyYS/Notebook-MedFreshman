"use client";

import { memo, useState } from "react";

type RegionKey = "a" | "b" | "ab" | "out";

interface Op {
  key: string;
  label: string;
  regions: RegionKey[];
  note: string;
}

const OPS: Op[] = [
  { key: "A", label: "A", regions: ["a", "ab"], note: "事件 A 发生的所有样本点。" },
  { key: "B", label: "B", regions: ["b", "ab"], note: "事件 B 发生的所有样本点。" },
  { key: "union", label: "A ∪ B", regions: ["a", "b", "ab"], note: "和事件：A 与 B 至少一个发生。" },
  { key: "inter", label: "A ∩ B", regions: ["ab"], note: "积事件：A 与 B 同时发生。" },
  { key: "amb", label: "A − B", regions: ["a"], note: "差事件：A 发生且 B 不发生。" },
  { key: "bma", label: "B − A", regions: ["b"], note: "差事件：B 发生且 A 不发生。" },
  { key: "acomp", label: "Aᶜ", regions: ["b", "out"], note: "对立事件：A 不发生。" },
  { key: "sym", label: "A △ B", regions: ["a", "b"], note: "对称差：恰好一个发生（异或）。" },
  { key: "demorgan", label: "(A ∪ B)ᶜ", regions: ["out"], note: "德摩根律：(A∪B)ᶜ = Aᶜ ∩ Bᶜ，两者都不发生。" },
];

const ACCENT = "#5b46e5";
const REGION_BASE = "#e9ebf2";

function VennPlaygroundBase() {
  const [opKey, setOpKey] = useState("inter");
  const op = OPS.find((o) => o.key === opKey)!;
  const on = (r: RegionKey) => op.regions.includes(r);
  const fill = (r: RegionKey) => (on(r) ? ACCENT : REGION_BASE);

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4">
      <svg viewBox="0 0 340 210" className="w-full" style={{ maxHeight: 230 }}>
        {/* 样本空间 Ω 边框 */}
        <rect x="6" y="6" width="328" height="198" rx="10" fill="#f7f8fb" stroke="#d7dbe6" />
        <text x="18" y="26" fontSize="13" fill="#8a94a6" fontStyle="italic">Ω</text>

        <defs>
          <mask id="venn-not-b">
            <rect x="0" y="0" width="340" height="210" fill="white" />
            <circle cx="205" cy="110" r="66" fill="black" />
          </mask>
          <mask id="venn-not-a">
            <rect x="0" y="0" width="340" height="210" fill="white" />
            <circle cx="135" cy="110" r="66" fill="black" />
          </mask>
          <mask id="venn-only-b">
            <rect x="0" y="0" width="340" height="210" fill="white" />
            <circle cx="135" cy="110" r="66" fill="black" />
          </mask>
          <mask id="venn-out">
            <rect x="0" y="0" width="340" height="210" fill="white" />
            <circle cx="135" cy="110" r="66" fill="black" />
            <circle cx="205" cy="110" r="66" fill="black" />
          </mask>
        </defs>

        {/* 区域填充（顺序：out 底，再 a、b，再 ab 顶） */}
        <rect x="6" y="6" width="328" height="198" rx="10" fill={fill("out")} mask="url(#venn-out)" opacity={on("out") ? 0.85 : 0.5} />
        <circle cx="135" cy="110" r="66" fill={fill("a")} mask="url(#venn-not-b)" opacity={on("a") ? 0.9 : 0.55} />
        <circle cx="205" cy="110" r="66" fill={fill("b")} mask="url(#venn-only-b)" opacity={on("b") ? 0.9 : 0.55} />
        <circle cx="135" cy="110" r="66" fill={fill("ab")} mask="url(#venn-not-a)" opacity={on("ab") ? 0.95 : 0.6} />

        {/* 轮廓 */}
        <circle cx="135" cy="110" r="66" fill="none" stroke="#6d28d9" strokeWidth="1.6" />
        <circle cx="205" cy="110" r="66" fill="none" stroke="#0f766e" strokeWidth="1.6" />
        <text x="92" y="74" fontSize="16" fontWeight="700" fill="#6d28d9">A</text>
        <text x="240" y="74" fontSize="16" fontWeight="700" fill="#0f766e">B</text>
      </svg>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {OPS.map((o) => (
          <button
            key={o.key}
            onClick={() => setOpKey(o.key)}
            className={
              "rounded-lg px-2.5 py-1 text-[13px] font-medium transition-colors " +
              (o.key === opKey
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-muted)] text-[var(--ink-soft)] hover:bg-[var(--accent-weak)]")
            }
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="mt-3 rounded-lg bg-[var(--bg-muted)] px-3 py-2 text-[13px] leading-relaxed text-[var(--ink-soft)]">
        <span className="font-semibold text-[var(--ink)]">{op.label}</span> — {op.note}
      </p>
    </div>
  );
}

export default memo(VennPlaygroundBase);
