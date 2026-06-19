"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";

/**
 * 环己烷椅式翻转（ChairFlip）
 *
 * 椅式构象的六个碳交替位于"上"与"下"两层。
 * 每个碳带一根直立键 a（axial，竖直方向）和一根平伏键 e（equatorial，近水平方向）。
 * 椅式翻转（ring flip）后：原来的 a 键全部变成 e 键，e 键全部变成 a 键。
 * 大取代基（如甲基）偏好占据 e 键（赤道键），位阻更小、更稳定。
 */

interface Carbon {
  /** 碳原子坐标 */
  x: number;
  y: number;
  /** 直立键(axial)末端的方向单位向量，乘以键长得到键终点 */
  axialDir: { dx: number; dy: number };
  /** 平伏键(equatorial)末端的方向单位向量 */
  equatorialDir: { dx: number; dy: number };
}

// 预先算好的椅式骨架六个碳坐标（标准椅式投影：上下交错）
const RING: Carbon[] = [
  { x: 70, y: 150, axialDir: { dx: 0, dy: -1 }, equatorialDir: { dx: -0.9, dy: 0.45 } },
  { x: 130, y: 185, axialDir: { dx: 0, dy: 1 }, equatorialDir: { dx: -0.9, dy: -0.45 } },
  { x: 200, y: 150, axialDir: { dx: 0, dy: -1 }, equatorialDir: { dx: 0.9, dy: 0.45 } },
  { x: 270, y: 110, axialDir: { dx: 0, dy: 1 }, equatorialDir: { dx: 0.9, dy: -0.45 } },
  { x: 210, y: 75, axialDir: { dx: 0, dy: -1 }, equatorialDir: { dx: -0.9, dy: 0.45 } },
  { x: 140, y: 110, axialDir: { dx: 0, dy: 1 }, equatorialDir: { dx: 0.9, dy: -0.45 } },
];

const BOND_LEN = 30;

// 取代基放在哪个碳上（索引 0）
const SUBSTITUENT_INDEX = 0;

// 颜色：a 键(直立)与 e 键(平伏)用不同颜色区分
const COLOR_AXIAL = "#dc2626"; // 红：axial 直立键
const COLOR_EQUATORIAL = "#2563eb"; // 蓝：equatorial 平伏键

interface BondEnd {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function axialEnd(c: Carbon): BondEnd {
  return {
    x1: c.x,
    y1: c.y,
    x2: c.x + c.axialDir.dx * BOND_LEN,
    y2: c.y + c.axialDir.dy * BOND_LEN,
  };
}

function equatorialEnd(c: Carbon): BondEnd {
  return {
    x1: c.x,
    y1: c.y,
    x2: c.x + c.equatorialDir.dx * BOND_LEN,
    y2: c.y + c.equatorialDir.dy * BOND_LEN,
  };
}

function ChairFlipBase() {
  // flipped = false 表示第一种椅式；true 表示翻转后的椅式
  const [flipped, setFlipped] = useState<boolean>(false);

  // 翻转后，每个碳的 axial / equatorial 方向互换。
  // 用 scaleY(-1) 镜像整张图实现"翻转"的视觉效果，同时逻辑上交换 a/e。
  //
  // 关键化学事实：翻转后原 axial 位置变为 equatorial、原 equatorial 变为 axial。
  // 这里我们直接在渲染时，根据 flipped 决定每个碳"哪根键标 a、哪根键标 e"。

  // 取代基在当前构象中是 a 还是 e：
  // 约定第一种构象取代基占 axial（a），翻转后变为 equatorial（e）。
  const substituentIsAxial = !flipped;
  const substituentPosition = substituentIsAxial ? "a（直立键 / axial）" : "e（平伏键 / equatorial）";
  const stabilityNote = substituentIsAxial
    ? "甲基目前在 a 键，1,3-直立位有较大位阻，能量较高（不利）。"
    : "甲基目前在 e 键（赤道键），位阻最小，能量较低（更稳定，优势构象）。";

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
      <h3 className="text-base font-semibold text-[var(--ink)]">
        环己烷椅式翻转：直立键 a ⇄ 平伏键 e
      </h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        椅式构象的六个碳交替分布在上下两层，每个碳带一根
        <span style={{ color: COLOR_AXIAL }} className="font-medium">直立键 a</span>
        和一根
        <span style={{ color: COLOR_EQUATORIAL }} className="font-medium">平伏键 e</span>
        。点击"翻转"会在两个等能（取代基除外）的椅式间切换——
        <b>翻转后 a 键全部变 e 键、e 键全部变 a 键</b>。
      </p>

      <div className="mt-3 flex flex-col items-center">
        <motion.svg
          width={340}
          height={230}
          viewBox="0 0 340 230"
          className="rounded-lg bg-[var(--bg-muted)]"
          animate={{ scaleY: flipped ? -1 : 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ transformOrigin: "center" }}
        >
          {/* 环骨架：依次连接六个碳，闭合成环 */}
          {RING.map((c, i) => {
            const next = RING[(i + 1) % RING.length];
            return (
              <line
                key={`ring-${i}`}
                x1={c.x}
                y1={c.y}
                x2={next.x}
                y2={next.y}
                stroke="var(--ink)"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* 每个碳的 a 键与 e 键。
              flipped=false 时：axial 方向标 a、equatorial 方向标 e。
              flipped=true 时：a/e 标签与颜色互换（轴向不变，但化学身份对调）。 */}
          {RING.map((c, i) => {
            const ax = axialEnd(c);
            const eq = equatorialEnd(c);
            // 当前 axial 物理方向上的键，化学身份在翻转后变为 e
            const axialIsA = !flipped;
            const axialColor = axialIsA ? COLOR_AXIAL : COLOR_EQUATORIAL;
            const equatorialColor = axialIsA ? COLOR_EQUATORIAL : COLOR_AXIAL;
            return (
              <g key={`bonds-${i}`}>
                <line
                  x1={ax.x1}
                  y1={ax.y1}
                  x2={ax.x2}
                  y2={ax.y2}
                  stroke={axialColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <line
                  x1={eq.x1}
                  y1={eq.y1}
                  x2={eq.x2}
                  y2={eq.y2}
                  stroke={equatorialColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* 取代基（甲基 CH3）画在 SUBSTITUENT_INDEX 碳上。
              第一种构象放在 axial 方向；翻转后该物理方向身份变为 e。
              为了让甲基始终"可读"，给标签做反向缩放抵消整体镜像。 */}
          {(() => {
            const c = RING[SUBSTITUENT_INDEX];
            const ax = axialEnd(c);
            return (
              <g>
                <circle
                  cx={ax.x2}
                  cy={ax.y2}
                  r={11}
                  fill={substituentIsAxial ? COLOR_AXIAL : COLOR_EQUATORIAL}
                  opacity={0.18}
                  stroke={substituentIsAxial ? COLOR_AXIAL : COLOR_EQUATORIAL}
                  strokeWidth={1.5}
                />
                <g
                  transform={
                    flipped
                      ? `translate(${ax.x2} ${ax.y2}) scale(1 -1) translate(${-ax.x2} ${-ax.y2})`
                      : undefined
                  }
                >
                  <text
                    x={ax.x2}
                    y={ax.y2 + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill="var(--ink)"
                  >
                    CH₃
                  </text>
                </g>
              </g>
            );
          })()}
        </motion.svg>

        <button
          type="button"
          onClick={() => setFlipped((v) => !v)}
          className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-5 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-elevated)]"
        >
          翻转椅式（ring flip）
        </button>
      </div>

      {/* 图例 */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--ink-soft)]">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-4 rounded"
            style={{ backgroundColor: COLOR_AXIAL }}
          />
          a 键 · 直立键 axial
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-4 rounded"
            style={{ backgroundColor: COLOR_EQUATORIAL }}
          />
          e 键 · 平伏键 equatorial
        </span>
      </div>

      {/* 取代基状态说明 */}
      <div className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3 text-sm">
        <p className="text-[var(--ink)]">
          甲基（CH₃）当前处于：<b>{substituentPosition}</b>
        </p>
        <p className="mt-1 text-[var(--ink-soft)]">{stabilityNote}</p>
        <p className="mt-2 text-[var(--ink-soft)]">
          结论：<b className="text-[var(--ink)]">大取代基偏好 e 键（赤道键）</b>
          ——平伏取向避开了 1,3-直立相互作用，使该椅式构象成为优势（更稳定）构象。
        </p>
      </div>
    </div>
  );
}

export default memo(ChairFlipBase);
