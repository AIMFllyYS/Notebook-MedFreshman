"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";

type NucleophileId = "HCN" | "RMgX" | "ROH" | "RNH2" | "NaBH4";

interface Nucleophile {
  id: NucleophileId;
  label: string;
  nuSymbol: string;
  productType: string;
  productNote: string;
  mechanism: string;
}

const NUCLEOPHILES: readonly Nucleophile[] = [
  {
    id: "HCN",
    label: "HCN（氢氰酸）",
    nuSymbol: "⁻CN",
    productType: "α-羟基腈（氰醇）",
    productNote: "CN⁻ 进攻羰基碳，O 接 H 得 —C(OH)(CN)—",
    mechanism:
      "氰根 CN⁻ 作为亲核试剂进攻缺电子的羰基碳，C=O 的 π 电子转移到氧上形成醇盐氧负离子，质子化后得到 α-羟基腈。",
  },
  {
    id: "RMgX",
    label: "RMgX（格氏试剂）",
    nuSymbol: "R⁻",
    productType: "醇（加水后）",
    productNote: "碳负离子 R⁻ 加成生成醇盐，水解后得醇",
    mechanism:
      "格氏试剂提供强亲核的碳负离子 R⁻，进攻羰基碳形成 C—C 键，氧成为醇盐氧负离子，再加水（酸性后处理）质子化得到醇。",
  },
  {
    id: "ROH",
    label: "ROH（醇）",
    nuSymbol: "RO⁻ / ROH",
    productType: "半缩醛 / 缩醛",
    productNote: "一分子醇加成得半缩醛，再与一分子醇脱水得缩醛",
    mechanism:
      "醇氧上的孤对电子进攻羰基碳（通常酸催化），先生成半缩醛（—C(OH)(OR)—），再与第二分子醇脱去一分子水形成缩醛（—C(OR)₂—）。",
  },
  {
    id: "RNH2",
    label: "RNH₂（伯胺）",
    nuSymbol: "R–NH₂",
    productType: "亚胺（失水，Schiff 碱）",
    productNote: "胺加成得氨基醇中间体，再脱水生成 C=N 亚胺",
    mechanism:
      "伯胺氮上的孤对电子进攻羰基碳，加成得到半缩胺醇（氨基醇）中间体，随后质子转移并脱去一分子水，形成含 C=N 的亚胺（Schiff 碱）。",
  },
  {
    id: "NaBH4",
    label: "NaBH₄（氢负离子源）",
    nuSymbol: "H⁻",
    productType: "醇",
    productNote: "H⁻ 加到羰基碳，O 质子化得醇",
    mechanism:
      "硼氢化钠提供氢负离子 H⁻，进攻羰基碳完成还原，π 电子转移到氧形成醇盐氧负离子，质子化后得到醇（醛→伯醇，酮→仲醇）。",
  },
];

function CarbonylAdditionBase() {
  const [selectedId, setSelectedId] = useState<NucleophileId>("HCN");
  const selected: Nucleophile =
    NUCLEOPHILES.find((n) => n.id === selectedId) ?? NUCLEOPHILES[0];

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4">
      <h3 className="text-lg font-semibold text-[var(--ink)]">
        羰基亲核加成（Nucleophilic Addition）
      </h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        羰基 C=O 中氧电负性大，使碳带部分正电荷（δ+）、氧带部分负电荷（δ−）。
        亲核试剂 Nu 进攻缺电子的羰基碳，C=O 的 π 电子转移到氧上，完成亲核加成。
      </p>

      {/* 亲核试剂选择 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {NUCLEOPHILES.map((n) => {
          const active = n.id === selectedId;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => setSelectedId(n.id)}
              className={[
                "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                active
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-[var(--line)] bg-[var(--bg-muted)] text-[var(--ink)] hover:border-indigo-400",
              ].join(" ")}
            >
              {n.label}
            </button>
          );
        })}
      </div>

      {/* SVG 演示区 */}
      <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-2">
        <svg
          viewBox="0 0 420 200"
          className="h-auto w-full"
          role="img"
          aria-label="羰基亲核加成示意图"
        >
          {/* Nu（亲核试剂） */}
          <text
            x="40"
            y="105"
            textAnchor="middle"
            className="fill-emerald-600"
            fontSize="18"
            fontWeight="700"
          >
            {selected.nuSymbol}
          </text>
          <text x="40" y="128" textAnchor="middle" fontSize="11" fill="var(--ink-soft)">
            亲核试剂 Nu
          </text>

          {/* 进攻箭头：从 Nu 指向羰基碳，循环动画 */}
          <motion.line
            x1="78"
            y1="100"
            x2="178"
            y2="100"
            stroke="#059669"
            strokeWidth="2.5"
            markerEnd="url(#nuArrow)"
            initial={{ pathLength: 0, opacity: 0.3 }}
            animate={{ pathLength: [0, 1, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* 羰基碳 C，标 δ+ */}
          <text
            x="200"
            y="106"
            textAnchor="middle"
            fontSize="26"
            fontWeight="700"
            fill="var(--ink)"
          >
            C
          </text>
          <text x="200" y="78" textAnchor="middle" fontSize="13" fill="#dc2626" fontWeight="700">
            δ+
          </text>

          {/* C=O 双键 */}
          <line x1="222" y1="94" x2="288" y2="94" stroke="var(--ink)" strokeWidth="2" />
          <line x1="222" y1="104" x2="288" y2="104" stroke="var(--ink)" strokeWidth="2" />

          {/* 氧 O，标 δ− */}
          <text
            x="308"
            y="106"
            textAnchor="middle"
            fontSize="26"
            fontWeight="700"
            fill="#2563eb"
          >
            O
          </text>
          <text x="308" y="78" textAnchor="middle" fontSize="13" fill="#2563eb" fontWeight="700">
            δ−
          </text>

          {/* π 电子转移到 O 的弯箭头（动画脉动） */}
          <motion.path
            d="M 255 88 Q 285 55 305 80"
            fill="none"
            stroke="#7c3aed"
            strokeWidth="2"
            markerEnd="url(#piArrow)"
            initial={{ opacity: 0.25 }}
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          />
          <text x="270" y="48" textAnchor="middle" fontSize="11" fill="#7c3aed">
            π 电子 → O
          </text>

          {/* 羰基碳的两个取代基示意键 */}
          <line x1="186" y1="118" x2="160" y2="150" stroke="var(--ink-soft)" strokeWidth="1.5" />
          <line x1="214" y1="118" x2="240" y2="150" stroke="var(--ink-soft)" strokeWidth="1.5" />
          <text x="150" y="166" textAnchor="middle" fontSize="11" fill="var(--ink-soft)">
            R / H
          </text>
          <text x="248" y="166" textAnchor="middle" fontSize="11" fill="var(--ink-soft)">
            R&apos; / H
          </text>

          <defs>
            <marker
              id="nuArrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill="#059669" />
            </marker>
            <marker
              id="piArrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill="#7c3aed" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* 产物 / 机理说明 */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3">
          <p className="text-xs font-medium text-[var(--ink-soft)]">产物类型</p>
          <p className="mt-1 text-base font-semibold text-indigo-600">
            {selected.productType}
          </p>
          <p className="mt-1 text-sm text-[var(--ink)]">{selected.productNote}</p>
        </div>
        <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3">
          <p className="text-xs font-medium text-[var(--ink-soft)]">加成机理</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]">
            {selected.mechanism}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--ink-soft)]">
        通则：亲核试剂（绿色 Nu）进攻带 δ+ 的羰基碳，C=O 的 π 键断裂、电子对（紫色箭头）
        转移到带 δ− 的氧上，氧成为氧负离子，再经质子化或后续脱水得到最终产物。
      </p>
    </div>
  );
}

export default memo(CarbonylAdditionBase);
