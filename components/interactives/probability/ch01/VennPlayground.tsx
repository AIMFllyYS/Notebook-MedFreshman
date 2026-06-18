"use client";

import { memo, useState } from "react";
import { VennDiagram, type VennRegion } from "@/components/visualizations";

interface Op {
  key: string;
  label: string;
  regions: VennRegion[];
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

function VennPlaygroundBase() {
  const [opKey, setOpKey] = useState("inter");
  const op = OPS.find((o) => o.key === opKey)!;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4">
      {/* 维恩图绘制：复用 VennDiagram 原语，高亮当前运算的区域 */}
      <VennDiagram
        interactive={true}
        highlightRegions={op.regions}
      />

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
