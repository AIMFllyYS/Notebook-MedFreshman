"use client";

import { memo, useState, useMemo } from "react";

type Molecule = "ethane" | "butane";

interface ConformerInfo {
  name: string;
  description: string;
}

interface EnergyPoint {
  theta: number;
  energy: number;
}

const PRIMARY = "#6d28d9";
const TWO_PI = Math.PI * 2;

/** 将角度（度）规整到 [0, 360) */
function normalizeDeg(deg: number): number {
  const m = deg % 360;
  return m < 0 ? m + 360 : m;
}

/** 角度转弧度 */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * 乙烷势能：周期 120°，重叠式（0/120/240）为峰，交叉式（60/180/300）为谷。
 * 能垒约 12 kJ/mol。E(θ) = (Vmax/2) * (1 + cos(3θ))。
 */
function ethaneEnergy(thetaDeg: number): number {
  const vMax = 12;
  const r = toRad(thetaDeg);
  return (vMax / 2) * (1 + Math.cos(3 * r));
}

/**
 * 丁烷（绕 C2-C3）势能（相对值，单位约 kJ/mol）：
 * θ=180 对位交叉(anti) 最稳 = 0；θ=60/300 邻位交叉(gauche) ≈ 3.8；
 * θ=120/240 部分重叠 ≈ 16；θ=0/360 全重叠(syn) 最高 ≈ 20。
 * 用余弦级数拟合上述特征点。
 */
function butaneEnergy(thetaDeg: number): number {
  const r = toRad(thetaDeg);
  // 拟合系数：在 θ=0 取最大、θ=180 取最小、并在 60/300 形成 gauche 次低谷
  const e =
    8.0 +
    8.0 * Math.cos(r) +
    1.0 * Math.cos(2 * r) +
    3.0 * Math.cos(3 * r);
  return e < 0 ? 0 : e;
}

function energyAt(mol: Molecule, thetaDeg: number): number {
  return mol === "ethane" ? ethaneEnergy(thetaDeg) : butaneEnergy(thetaDeg);
}

/** 判断当前构象名称与说明 */
function conformerInfo(mol: Molecule, thetaDeg: number): ConformerInfo {
  const t = normalizeDeg(thetaDeg);
  const near = (target: number): boolean => {
    const d = Math.abs(normalizeDeg(t - target));
    const dd = Math.min(d, 360 - d);
    return dd <= 12;
  };

  if (mol === "ethane") {
    if (near(0) || near(120) || near(240)) {
      return {
        name: "重叠式 (Eclipsed)",
        description: "前后碳上的氢正对重叠，电子云排斥最大，能量最高（峰）。",
      };
    }
    if (near(60) || near(180) || near(300)) {
      return {
        name: "交叉式 (Staggered)",
        description: "前后氢错开 60°，排斥最小，最稳定（谷）。",
      };
    }
    return {
      name: "扭转中间构象",
      description: "介于交叉式与重叠式之间，能量处于上升或下降的斜坡上。",
    };
  }

  // butane
  if (near(180)) {
    return {
      name: "对位交叉式 (Anti)",
      description: "两个甲基相距最远（180°），空间位阻最小，全局最稳定（最低谷）。",
    };
  }
  if (near(60) || near(300)) {
    return {
      name: "邻位交叉式 (Gauche)",
      description: "两个甲基相隔 60°，比对位稍高，为局部次低谷。",
    };
  }
  if (near(120) || near(240)) {
    return {
      name: "部分重叠式",
      description: "甲基与氢重叠，能量较高（次高峰）。",
    };
  }
  if (near(0)) {
    return {
      name: "全重叠式 (Syn / Eclipsed)",
      description: "两个甲基正对重叠，位阻最大，能量最高（最高峰）。",
    };
  }
  return {
    name: "扭转中间构象",
    description: "介于稳定与不稳定构象之间的过渡区域。",
  };
}

function NewmanProjectionBase() {
  const [molecule, setMolecule] = useState<Molecule>("ethane");
  const [theta, setTheta] = useState<number>(60);

  // 势能曲线采样点
  const curve: EnergyPoint[] = useMemo(() => {
    const pts: EnergyPoint[] = [];
    for (let d = 0; d <= 360; d += 2) {
      pts.push({ theta: d, energy: energyAt(molecule, d) });
    }
    return pts;
  }, [molecule]);

  const maxEnergy: number = useMemo(() => {
    let m = 0;
    for (const p of curve) {
      if (p.energy > m) m = p.energy;
    }
    return m === 0 ? 1 : m;
  }, [curve]);

  const currentEnergy: number = energyAt(molecule, theta);
  const info: ConformerInfo = conformerInfo(molecule, theta);

  // ---- 纽曼投影 SVG 几何 ----
  const cx = 110;
  const cy = 110;
  const rCircle = 70;
  const frontLen = 62; // 前面键长（从圆心向外）
  const backLen = 70; // 后面键画到圆周

  // 前面原子：Y 形（上、左下、右下），固定方向 90°、210°、330°（数学坐标，向上为 90）
  const frontAngles: number[] = [90, 210, 330];
  // 后面原子：倒 Y（下、左上、右上）= 270°、30°、150°，再叠加旋转 θ
  const backBaseAngles: number[] = [270, 30, 150];

  // SVG 坐标系 y 向下，故用 -sin
  function frontEnd(angleDeg: number): { x: number; y: number } {
    const a = toRad(angleDeg);
    return { x: cx + frontLen * Math.cos(a), y: cy - frontLen * Math.sin(a) };
  }
  function backEnd(angleDeg: number): { x: number; y: number } {
    const a = toRad(angleDeg);
    return { x: cx + backLen * Math.cos(a), y: cy - backLen * Math.sin(a) };
  }

  // 前面取代基标签：乙烷全是 H；丁烷前碳 CH3 在顶端、两个 H
  const frontLabels: string[] =
    molecule === "ethane" ? ["H", "H", "H"] : ["CH₃", "H", "H"];
  // 后面取代基标签：乙烷全 H；丁烷后碳 CH3 在第一个键（基准 270°）
  const backLabels: string[] =
    molecule === "ethane" ? ["H", "H", "H"] : ["CH₃", "H", "H"];

  // ---- 势能曲线 SVG 几何 ----
  const plotW = 340;
  const plotH = 180;
  const padL = 44;
  const padR = 14;
  const padT = 16;
  const padB = 34;
  const innerW = plotW - padL - padR;
  const innerH = plotH - padT - padB;

  function px(thetaDeg: number): number {
    return padL + (thetaDeg / 360) * innerW;
  }
  function py(energy: number): number {
    return padT + innerH - (energy / maxEnergy) * innerH;
  }

  const pathD: string = useMemo(() => {
    let d = "";
    curve.forEach((p, i) => {
      const x = px(p.theta);
      const y = py(p.energy);
      d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    });
    return d;
    // px/py 依赖 molecule(maxEnergy) 与 curve
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve, maxEnergy]);

  const dotX: number = px(normalizeDeg(theta));
  const dotY: number = py(currentEnergy);

  const xTicks: number[] = [0, 60, 120, 180, 240, 300, 360];

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4">
      <h3 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>
        纽曼投影构象能量
      </h3>
      <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
        拖动滑块调节二面角 θ，左侧纽曼投影中后面原子的键随 θ 旋转，右侧势能曲线显示对应的相对能量。
        交叉式稳定（谷）、重叠式高能（峰）；丁烷以对位交叉式最稳定。
      </p>

      {/* 分子切换 */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setMolecule("ethane")}
          className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
          style={{
            borderColor: molecule === "ethane" ? PRIMARY : "var(--line)",
            backgroundColor: molecule === "ethane" ? PRIMARY : "white",
            color: molecule === "ethane" ? "white" : "var(--ink)",
          }}
        >
          乙烷 (C₂H₆)
        </button>
        <button
          type="button"
          onClick={() => setMolecule("butane")}
          className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
          style={{
            borderColor: molecule === "butane" ? PRIMARY : "var(--line)",
            backgroundColor: molecule === "butane" ? PRIMARY : "white",
            color: molecule === "butane" ? "white" : "var(--ink)",
          }}
        >
          丁烷 (绕 C2–C3)
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 纽曼投影 */}
        <div
          className="rounded-lg border p-2"
          style={{ borderColor: "var(--line)", backgroundColor: "var(--bg-muted)" }}
        >
          <svg viewBox="0 0 220 220" className="mx-auto block h-auto w-full max-w-[260px]">
            {/* 后面原子的圆（代表后碳） */}
            <circle
              cx={cx}
              cy={cy}
              r={rCircle}
              fill="white"
              stroke="var(--line)"
              strokeWidth={2}
            />

            {/* 后面三条键：从圆周指向外侧，随 θ 旋转 */}
            {backBaseAngles.map((base, i) => {
              const ang = base + theta;
              const end = backEnd(ang);
              const start = {
                x: cx + rCircle * Math.cos(toRad(ang)),
                y: cy - rCircle * Math.sin(toRad(ang)),
              };
              const isMethyl = molecule === "butane" && i === 0;
              return (
                <g key={`back-${i}`}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="#64748b"
                    strokeWidth={isMethyl ? 5 : 4}
                    strokeLinecap="round"
                  />
                  <text
                    x={end.x}
                    y={end.y}
                    dx={end.x >= cx ? 4 : -4}
                    dy={end.y >= cy ? 12 : -4}
                    fontSize={11}
                    textAnchor={end.x >= cx ? "start" : "end"}
                    fill="#475569"
                  >
                    {backLabels[i]}
                  </text>
                </g>
              );
            })}

            {/* 前面三条键：从圆心向外，Y 形，固定 */}
            {frontAngles.map((ang, i) => {
              const end = frontEnd(ang);
              const isMethyl = molecule === "butane" && i === 0;
              return (
                <g key={`front-${i}`}>
                  <line
                    x1={cx}
                    y1={cy}
                    x2={end.x}
                    y2={end.y}
                    stroke={PRIMARY}
                    strokeWidth={isMethyl ? 6 : 5}
                    strokeLinecap="round"
                  />
                  <text
                    x={end.x}
                    y={end.y}
                    dx={Math.abs(end.x - cx) < 6 ? 0 : end.x > cx ? 6 : -6}
                    dy={end.y > cy ? 14 : -6}
                    fontSize={12}
                    fontWeight={600}
                    textAnchor={Math.abs(end.x - cx) < 6 ? "middle" : end.x > cx ? "start" : "end"}
                    fill={PRIMARY}
                  >
                    {frontLabels[i]}
                  </text>
                </g>
              );
            })}

            {/* 前面原子中心点 */}
            <circle cx={cx} cy={cy} r={4} fill={PRIMARY} />
          </svg>
          <p className="mt-1 text-center text-xs" style={{ color: "var(--ink-soft)" }}>
            紫色 = 前碳（圆心 Y 形）；灰色 = 后碳（圆周倒 Y，随 θ 旋转）
          </p>
        </div>

        {/* 势能曲线 */}
        <div
          className="rounded-lg border p-2"
          style={{ borderColor: "var(--line)", backgroundColor: "var(--bg-muted)" }}
        >
          <svg viewBox={`0 0 ${plotW} ${plotH}`} className="block h-auto w-full">
            {/* 坐标轴 */}
            <line
              x1={padL}
              y1={padT}
              x2={padL}
              y2={padT + innerH}
              stroke="var(--line)"
              strokeWidth={1.5}
            />
            <line
              x1={padL}
              y1={padT + innerH}
              x2={padL + innerW}
              y2={padT + innerH}
              stroke="var(--line)"
              strokeWidth={1.5}
            />

            {/* x 轴刻度 */}
            {xTicks.map((t) => (
              <g key={`xt-${t}`}>
                <line
                  x1={px(t)}
                  y1={padT + innerH}
                  x2={px(t)}
                  y2={padT + innerH + 4}
                  stroke="var(--line)"
                  strokeWidth={1}
                />
                <text
                  x={px(t)}
                  y={padT + innerH + 16}
                  fontSize={9}
                  textAnchor="middle"
                  fill="var(--ink-soft)"
                >
                  {t}°
                </text>
              </g>
            ))}

            {/* y 轴标签 */}
            <text
              x={6}
              y={padT + innerH / 2}
              fontSize={9}
              textAnchor="middle"
              fill="var(--ink-soft)"
              transform={`rotate(-90 6 ${padT + innerH / 2})`}
            >
              相对能量 (kJ/mol)
            </text>
            <text x={padL - 6} y={padT + 4} fontSize={9} textAnchor="end" fill="var(--ink-soft)">
              {maxEnergy.toFixed(0)}
            </text>
            <text
              x={padL - 6}
              y={padT + innerH}
              fontSize={9}
              textAnchor="end"
              fill="var(--ink-soft)"
            >
              0
            </text>

            {/* 能量曲线 */}
            <path d={pathD} fill="none" stroke={PRIMARY} strokeWidth={2} />

            {/* 当前点的辅助竖线 */}
            <line
              x1={dotX}
              y1={dotY}
              x2={dotX}
              y2={padT + innerH}
              stroke={PRIMARY}
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.5}
            />

            {/* 当前 θ 动点 */}
            <circle cx={dotX} cy={dotY} r={5} fill="#f59e0b" stroke="white" strokeWidth={1.5} />
          </svg>
          <p className="mt-1 text-center text-xs" style={{ color: "var(--ink-soft)" }}>
            橙色点 = 当前 θ 对应能量
          </p>
        </div>
      </div>

      {/* 滑块 */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-sm">
          <label htmlFor="theta-slider" style={{ color: "var(--ink)" }}>
            二面角 θ
          </label>
          <span className="font-mono font-semibold" style={{ color: PRIMARY }}>
            {normalizeDeg(theta).toFixed(0)}°
          </span>
        </div>
        <input
          id="theta-slider"
          type="range"
          min={0}
          max={360}
          step={1}
          value={theta}
          onChange={(e) => setTheta(Number(e.target.value))}
          className="w-full cursor-pointer"
          style={{ accentColor: PRIMARY }}
        />
        <div className="mt-1 flex justify-between text-xs" style={{ color: "var(--ink-soft)" }}>
          <span>0°</span>
          <span>180°</span>
          <span>360°</span>
        </div>
      </div>

      {/* 当前构象信息 */}
      <div
        className="mt-4 rounded-lg border p-3"
        style={{ borderColor: PRIMARY, backgroundColor: "var(--bg-muted)" }}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-base font-semibold" style={{ color: PRIMARY }}>
            {info.name}
          </span>
          <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
            相对能量 ≈ {currentEnergy.toFixed(1)} kJ/mol
          </span>
        </div>
        <p className="mt-1 text-sm" style={{ color: "var(--ink)" }}>
          {info.description}
        </p>
      </div>
    </div>
  );
}

export default memo(NewmanProjectionBase);
