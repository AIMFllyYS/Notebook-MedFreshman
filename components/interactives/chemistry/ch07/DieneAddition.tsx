"use client";

import { memo, useState, useMemo } from "react";

interface ProductRatio {
  readonly twelve: number; // 1,2-加成（动力学产物）百分比
  readonly fourteen: number; // 1,4-加成（热力学产物）百分比
}

/**
 * 在给定温度下，估算 1,3-丁二烯 + HBr 的 1,2- 与 1,4- 加成产物比例。
 *
 * 经典实验事实（Allinger/March 等教材）：
 *   -80℃ 左右  ≈ 1,2 : 1,4 = 80 : 20  （动力学控制，低温）
 *   +40℃ 左右  ≈ 1,2 : 1,4 = 20 : 80  （热力学控制，高温）
 *
 * 这里用 -80→+40 温度区间做线性插值，给出直观的连续变化趋势。
 */
function computeRatio(tempC: number): ProductRatio {
  const tMin = -80;
  const tMax = 40;
  const clamped = Math.min(tMax, Math.max(tMin, tempC));
  const frac = (clamped - tMin) / (tMax - tMin); // 0 (低温) → 1 (高温)

  // 低温：1,2 为主 (80%)；高温：1,4 为主 (80%)
  const twelve = 80 - frac * 60; // 80 → 20
  const fourteen = 100 - twelve; // 20 → 80

  return {
    twelve: Math.round(twelve),
    fourteen: Math.round(fourteen),
  };
}

function DieneAdditionBase() {
  const [tempC, setTempC] = useState<number>(-80);

  const ratio = useMemo<ProductRatio>(() => computeRatio(tempC), [tempC]);

  const isKineticDominant = ratio.twelve >= ratio.fourteen;

  const regimeLabel = useMemo<string>(() => {
    if (tempC <= -40) return "低温区 · 动力学控制";
    if (tempC >= 10) return "高温区 · 热力学控制";
    return "过渡区";
  }, [tempC]);

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4">
      <h3 className="text-lg font-semibold text-[var(--ink)]">
        共轭二烯的 1,2- 加成 vs 1,4- 加成
      </h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        以 <span className="font-medium text-[var(--ink)]">1,3-丁二烯 + HBr</span>{" "}
        为例，拖动温度滑块观察两种加成产物比例的变化：低温利于
        <span className="font-medium text-[#2563eb]"> 动力学产物（1,2-加成）</span>，
        高温利于
        <span className="font-medium text-[#dc2626]"> 热力学产物（1,4-加成）</span>。
      </p>

      {/* 温度控制 */}
      <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="diene-temp"
            className="text-sm font-medium text-[var(--ink)]"
          >
            反应温度
          </label>
          <span className="text-sm font-semibold tabular-nums text-[var(--ink)]">
            {tempC} ℃
            <span className="ml-2 text-xs font-normal text-[var(--ink-soft)]">
              {regimeLabel}
            </span>
          </span>
        </div>
        <input
          id="diene-temp"
          type="range"
          min={-80}
          max={40}
          step={5}
          value={tempC}
          onChange={(e) => setTempC(Number(e.target.value))}
          className="mt-2 w-full accent-[#7c3aed]"
        />
        <div className="mt-1 flex justify-between text-xs text-[var(--ink-soft)]">
          <span>-80 ℃（低温）</span>
          <span>+40 ℃（高温）</span>
        </div>
      </div>

      {/* 比例条形图 */}
      <div className="mt-4 space-y-3">
        <RatioBar
          label="1,2-加成产物 · 3-溴-1-丁烯"
          tag="动力学产物（低温，生成快）"
          percent={ratio.twelve}
          color="#2563eb"
          active={isKineticDominant}
        />
        <RatioBar
          label="1,4-加成产物 · 1-溴-2-丁烯"
          tag="热力学产物（高温，更稳定）"
          percent={ratio.fourteen}
          color="#dc2626"
          active={!isKineticDominant}
        />
      </div>

      {/* SVG 结构图 */}
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* 反应物：1,3-丁二烯 */}
        <figure className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3">
          <svg viewBox="0 0 200 90" className="w-full" role="img" aria-label="1,3-丁二烯结构">
            <text x="6" y="40" fontSize="11" fill="var(--ink)">
              CH₂
            </text>
            <DoubleBond x1={36} x2={66} y={36} />
            <text x="68" y="40" fontSize="11" fill="var(--ink)">
              CH
            </text>
            <SingleBond x1={90} x2={110} y={36} />
            <text x="112" y="40" fontSize="11" fill="var(--ink)">
              CH
            </text>
            <DoubleBond x1={134} x2={164} y={36} />
            <text x="166" y="40" fontSize="11" fill="var(--ink)">
              CH₂
            </text>
            <text x="6" y="70" fontSize="9" fill="var(--ink-soft)">
              C1 — C2 = C3 — C4 共轭体系
            </text>
          </svg>
          <figcaption className="mt-1 text-center text-xs font-medium text-[var(--ink)]">
            反应物：1,3-丁二烯
          </figcaption>
        </figure>

        {/* 1,2-加成产物 */}
        <figure
          className="rounded-lg border p-3 transition-colors"
          style={{
            borderColor: isKineticDominant ? "#2563eb" : "var(--line)",
            backgroundColor: isKineticDominant ? "#eff6ff" : "var(--bg-muted)",
          }}
        >
          <svg viewBox="0 0 200 90" className="w-full" role="img" aria-label="3-溴-1-丁烯结构">
            <text x="6" y="40" fontSize="11" fill="var(--ink)">
              CH₂
            </text>
            <DoubleBond x1={36} x2={66} y={36} />
            <text x="68" y="40" fontSize="11" fill="var(--ink)">
              CH
            </text>
            <SingleBond x1={90} x2={110} y={36} />
            <text x="108" y="40" fontSize="11" fill="var(--ink)">
              CHBr
            </text>
            <SingleBond x1={142} x2={162} y={36} />
            <text x="164" y="40" fontSize="11" fill="var(--ink)">
              CH₃
            </text>
            <text x="6" y="70" fontSize="9" fill="#2563eb">
              H 加 C1，Br 加 C2（1,2-加成）
            </text>
          </svg>
          <figcaption className="mt-1 text-center text-xs font-medium text-[#2563eb]">
            1,2-加成：3-溴-1-丁烯
          </figcaption>
        </figure>

        {/* 1,4-加成产物 */}
        <figure
          className="rounded-lg border p-3 transition-colors"
          style={{
            borderColor: !isKineticDominant ? "#dc2626" : "var(--line)",
            backgroundColor: !isKineticDominant ? "#fef2f2" : "var(--bg-muted)",
          }}
        >
          <svg viewBox="0 0 200 90" className="w-full" role="img" aria-label="1-溴-2-丁烯结构">
            <text x="2" y="40" fontSize="11" fill="var(--ink)">
              BrCH₂
            </text>
            <SingleBond x1={40} x2={60} y={36} />
            <text x="62" y="40" fontSize="11" fill="var(--ink)">
              CH
            </text>
            <DoubleBond x1={84} x2={114} y={36} />
            <text x="116" y="40" fontSize="11" fill="var(--ink)">
              CH
            </text>
            <SingleBond x1={138} x2={158} y={36} />
            <text x="160" y="40" fontSize="11" fill="var(--ink)">
              CH₃
            </text>
            <text x="6" y="70" fontSize="9" fill="#dc2626">
              H 加 C1，Br 加 C4（1,4-加成）
            </text>
          </svg>
          <figcaption className="mt-1 text-center text-xs font-medium text-[#dc2626]">
            1,4-加成：1-溴-2-丁烯
          </figcaption>
        </figure>
      </div>

      {/* 烯丙基碳正离子中间体共振解释 */}
      <div className="mt-5 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-3">
        <h4 className="text-sm font-semibold text-[var(--ink)]">
          为什么会有两个加成位置？——烯丙基碳正离子的共振
        </h4>

        <svg
          viewBox="0 0 360 70"
          className="mt-2 w-full max-w-md"
          role="img"
          aria-label="烯丙基碳正离子共振"
        >
          {/* 共振式 A：正电荷在 C2 */}
          <text x="2" y="30" fontSize="10" fill="var(--ink)">
            CH₂=CH–CH⁺–CH₃
          </text>
          {/* 共振双向箭头 */}
          <line x1="120" y1="26" x2="160" y2="26" stroke="var(--ink-soft)" strokeWidth="1" />
          <polygon points="160,26 153,23 153,29" fill="var(--ink-soft)" />
          <polygon points="120,26 127,23 127,29" fill="var(--ink-soft)" />
          {/* 共振式 B：正电荷在 C4 */}
          <text x="168" y="30" fontSize="10" fill="var(--ink)">
            ⁺CH₂–CH=CH–CH₃
          </text>
          <text x="2" y="55" fontSize="9" fill="var(--ink-soft)">
            正电荷离域在 C2 与 C4 之间，Br⁻ 既可进攻 C2（→1,2）也可进攻 C4（→1,4）
          </text>
        </svg>

        <ul className="mt-2 space-y-1 text-xs text-[var(--ink-soft)]">
          <li>
            • HBr 中的 <span className="font-medium text-[var(--ink)]">H⁺ 先加到 C1</span>，
            生成烯丙基型碳正离子，正电荷通过共振离域在 C2 和 C4 上。
          </li>
          <li>
            • <span className="font-medium text-[#2563eb]">低温（动力学控制）</span>：Br⁻ 优先进攻电荷密度更高、距离更近的 C2，
            过渡态能垒低、生成快 → 主要得 <span className="font-medium">1,2-加成产物</span>。
          </li>
          <li>
            • <span className="font-medium text-[#dc2626]">高温（热力学控制）</span>：反应可逆，体系趋向更稳定产物；
            1,4-产物是<span className="font-medium"> 内（二取代）双键</span>，更稳定 → 主要得{" "}
            <span className="font-medium">1,4-加成产物</span>。
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ----------------------------- 子组件 ----------------------------- */

interface RatioBarProps {
  readonly label: string;
  readonly tag: string;
  readonly percent: number;
  readonly color: string;
  readonly active: boolean;
}

function RatioBar({ label, tag, percent, color, active }: RatioBarProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-[var(--ink)]">
          {label}
          {active && (
            <span
              className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              主产物
            </span>
          )}
        </span>
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>
          {percent}%
        </span>
      </div>
      <div className="mt-1 h-4 w-full overflow-hidden rounded-full bg-[var(--bg-muted)]">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <p className="mt-0.5 text-xs" style={{ color }}>
        {tag}
      </p>
    </div>
  );
}

interface BondProps {
  readonly x1: number;
  readonly x2: number;
  readonly y: number;
}

function SingleBond({ x1, x2, y }: BondProps) {
  return <line x1={x1} y1={y} x2={x2} y2={y} stroke="var(--ink)" strokeWidth="1.4" />;
}

function DoubleBond({ x1, x2, y }: BondProps) {
  return (
    <g>
      <line x1={x1} y1={y - 2.5} x2={x2} y2={y - 2.5} stroke="var(--ink)" strokeWidth="1.4" />
      <line x1={x1} y1={y + 2.5} x2={x2} y2={y + 2.5} stroke="var(--ink)" strokeWidth="1.4" />
    </g>
  );
}

export default memo(DieneAdditionBase);
