"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";

type GroupKey = "a" | "b" | "c" | "d";

interface Substituent {
  label: string;
  color: string;
}

type SubstituentMap = Record<GroupKey, Substituent>;

interface Vertex {
  key: GroupKey;
  x: number;
  y: number;
}

// 四面体投影到 2D 的四个顶点（相对中心碳的偏移）
const VERTICES: Vertex[] = [
  { key: "a", x: 0, y: -52 }, // 顶部
  { key: "b", x: 46, y: 26 }, // 右下
  { key: "c", x: -46, y: 26 }, // 左下
  { key: "d", x: 0, y: 14 }, // 朝向观察者（中间偏下）
];

// 手性分子：四个基团全不同
const CHIRAL_GROUPS: SubstituentMap = {
  a: { label: "—H", color: "#94a3b8" },
  b: { label: "—Cl", color: "#22c55e" },
  c: { label: "—Br", color: "#a16207" },
  d: { label: "—F", color: "#3b82f6" },
};

// 非手性分子：有两个相同基团（a 与 d 同为 —H）
const ACHIRAL_GROUPS: SubstituentMap = {
  a: { label: "—H", color: "#94a3b8" },
  b: { label: "—Cl", color: "#22c55e" },
  c: { label: "—Br", color: "#a16207" },
  d: { label: "—H", color: "#94a3b8" },
};

interface MoleculeProps {
  groups: SubstituentMap;
  mirrored: boolean;
  rotation: number;
}

function Molecule({ groups, mirrored, rotation }: MoleculeProps) {
  const cx = 0;
  const cy = 0;
  // 镜像沿竖直镜面：x 取反
  const sign = mirrored ? -1 : 1;

  return (
    <motion.g
      animate={{ rotate: rotation, scaleX: sign }}
      transition={{ type: "tween", duration: 0.7, ease: "easeInOut" }}
      style={{ transformOrigin: "center", transformBox: "fill-box" }}
    >
      {/* 四条键 */}
      {VERTICES.map((v) => (
        <line
          key={`bond-${v.key}`}
          x1={cx}
          y1={cy}
          x2={v.x}
          y2={v.y}
          stroke="var(--ink-soft)"
          strokeWidth={3}
          strokeLinecap="round"
        />
      ))}

      {/* 中心碳 */}
      <circle cx={cx} cy={cy} r={11} fill="var(--ink)" />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize={11}
        fill="#ffffff"
        fontWeight={700}
      >
        C
      </text>

      {/* 四个基团 */}
      {VERTICES.map((v) => {
        const sub = groups[v.key];
        return (
          <g key={`atom-${v.key}`}>
            <circle cx={v.x} cy={v.y} r={15} fill={sub.color} />
            <text
              x={v.x}
              y={v.y + 4}
              textAnchor="middle"
              fontSize={10}
              fill="#ffffff"
              fontWeight={700}
              // 镜像时把文字再翻回来，保证可读
              transform={mirrored ? `scale(-1,1) translate(${-2 * v.x},0)` : undefined}
            >
              {sub.label}
            </text>
          </g>
        );
      })}
    </motion.g>
  );
}

function ChiralityMirrorBase() {
  const [mode, setMode] = useState<"chiral" | "achiral">("chiral");
  const [rotation, setRotation] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);

  const groups = mode === "chiral" ? CHIRAL_GROUPS : ACHIRAL_GROUPS;
  const isChiral = mode === "chiral";

  const handleRotate = () => {
    setRotation((r) => r + 120);
    setAttempts((a) => a + 1);
  };

  const handleReset = () => {
    setRotation(0);
    setAttempts(0);
  };

  const switchMode = (next: "chiral" | "achiral") => {
    setMode(next);
    setRotation(0);
    setAttempts(0);
  };

  // 提示文字：手性 → 永远无法重叠；非手性 → 可以重叠
  const resultText = isChiral
    ? attempts === 0
      ? "点击「旋转镜像」试着把右侧镜像转去与左侧原分子重叠。"
      : "无论怎么旋转，镜像都无法与原分子完全重叠 —— 这就是手性（对映异构体）。"
    : attempts === 0
      ? "这里把 d 基团也换成 —H（两个相同基团）。试试旋转镜像。"
      : "因为存在对称面，旋转后镜像可以与原分子重叠 —— 这是非手性分子。";

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4">
      <h3 className="text-lg font-bold text-[var(--ink)]">手性与镜像</h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        一个连有四个<strong>不同</strong>基团的碳原子（手性碳），其分子与镜像无法通过旋转完全重叠，
        如同左右手。这种「与镜像不可重叠」的性质称为<strong>手性</strong>，对应一对
        <strong>对映异构体</strong>。
      </p>

      {/* 模式切换 */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => switchMode("chiral")}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            isChiral
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-[var(--line)] bg-[var(--bg-muted)] text-[var(--ink)]"
          }`}
        >
          手性 (a,b,c,d 全不同)
        </button>
        <button
          type="button"
          onClick={() => switchMode("achiral")}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            !isChiral
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-[var(--line)] bg-[var(--bg-muted)] text-[var(--ink)]"
          }`}
        >
          非手性 (含相同基团)
        </button>
      </div>

      {/* SVG：原分子 | 镜面 | 镜像 */}
      <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-2">
        <svg viewBox="0 0 360 200" className="h-auto w-full" role="img" aria-label="手性碳分子及其镜像">
          {/* 左侧：原分子 */}
          <g transform="translate(90,100)">
            <Molecule groups={groups} mirrored={false} rotation={0} />
          </g>

          {/* 中间镜面（虚线） */}
          <line
            x1={180}
            y1={20}
            x2={180}
            y2={180}
            stroke="var(--ink-soft)"
            strokeWidth={2}
            strokeDasharray="6 6"
          />
          <text x={180} y={16} textAnchor="middle" fontSize={11} fill="var(--ink-soft)">
            镜面
          </text>

          {/* 右侧：镜像（可旋转） */}
          <g transform="translate(270,100)">
            <Molecule groups={groups} mirrored rotation={rotation} />
          </g>

          {/* 标签 */}
          <text x={90} y={196} textAnchor="middle" fontSize={11} fill="var(--ink)" fontWeight={600}>
            原分子
          </text>
          <text x={270} y={196} textAnchor="middle" fontSize={11} fill="var(--ink)" fontWeight={600}>
            镜像
          </text>
        </svg>
      </div>

      {/* 控制按钮 */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleRotate}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          旋转镜像 (+120°)
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
        >
          复位
        </button>
        <span className="text-sm text-[var(--ink-soft)]">
          已旋转 {attempts} 次（当前 {rotation % 360}°）
        </span>
      </div>

      {/* 结果说明 */}
      <p
        className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
          isChiral
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}
      >
        {resultText}
      </p>

      {/* 知识小结 */}
      <div className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3 text-sm text-[var(--ink-soft)]">
        <p className="font-semibold text-[var(--ink)]">判定要点</p>
        <ul className="mt-1 list-inside list-disc space-y-1">
          <li>
            <strong>手性</strong> = 分子与其镜像<strong>不能</strong>通过旋转、平移完全重叠。
          </li>
          <li>
            根本原因：分子<strong>缺乏对称面（σ）和对称中心（i）</strong>。四个基团全不同的碳为手性中心。
          </li>
          <li>
            一旦出现<strong>两个相同基团</strong>（如 a、d 同为 —H），分子产生对称面，镜像即可重叠，变为非手性。
          </li>
        </ul>
      </div>
    </div>
  );
}

export default memo(ChiralityMirrorBase);
