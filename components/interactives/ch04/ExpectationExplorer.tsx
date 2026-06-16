"use client";

import { useState, useRef, useCallback } from "react";

// ─── 设计常量 ────────────────────────────────────────────────────────────────
const ACCENT = "#5b46e5";
const ACCENT_LIGHT = "#ede9fe";
const RED = "#dc2626";
const RED_LIGHT = "#fee2e2";
const GRAY_BG = "#f8f9fb";
const GRAY_STROKE = "#e7e9ef";
const INK = "#1a1a2e";
const INK_SOFT = "#6b7280";

// ─── SVG 布局 ─────────────────────────────────────────────────────────────────
const SVG_W = 560;
const SVG_H = 260;
const AXIS_Y = 210;       // 数轴 y 坐标
const BAR_BOTTOM = AXIS_Y - 4;
const BAR_MAX_H = 160;    // 最大柱高度（概率=1 时）
const X_LEFT = 50;
const X_RIGHT = SVG_W - 30;
const X_RANGE = X_RIGHT - X_LEFT;

// x 轴刻度范围
const X_MIN_VAL = -4;
const X_MAX_VAL = 10;
const TICK_COUNT = 15; // X_MAX_VAL - X_MIN_VAL + 1

// ─── 类型 ─────────────────────────────────────────────────────────────────────
interface Mass {
  x: number;    // 取值 (X_MIN_VAL ~ X_MAX_VAL)
  p: number;    // 概率 (0 ~ 1)
}

type DragTarget =
  | { kind: "x"; idx: number; startSvgX: number; startX: number }
  | { kind: "p"; idx: number; startSvgY: number; startP: number };

// ─── 坐标转换 ─────────────────────────────────────────────────────────────────
function valToSvgX(x: number): number {
  return X_LEFT + ((x - X_MIN_VAL) / (X_MAX_VAL - X_MIN_VAL)) * X_RANGE;
}

function svgXToVal(svgX: number): number {
  const raw = ((svgX - X_LEFT) / X_RANGE) * (X_MAX_VAL - X_MIN_VAL) + X_MIN_VAL;
  return Math.round(Math.min(X_MAX_VAL, Math.max(X_MIN_VAL, raw)));
}

function probToBarH(p: number): number {
  return p * BAR_MAX_H;
}

function svgYToProb(svgY: number): number {
  const h = BAR_BOTTOM - svgY;
  return Math.min(0.99, Math.max(0.01, h / BAR_MAX_H));
}

// ─── 预设分布 ──────────────────────────────────────────────────────────────
// 二项 B(4, 0.5)
function presetBinomial(): Mass[] {
  const n = 4;
  const p = 0.5;
  const result: Mass[] = [];
  for (let k = 0; k <= n; k++) {
    const coef = binom(n, k);
    result.push({ x: k, p: coef * Math.pow(p, k) * Math.pow(1 - p, n - k) });
  }
  return result;
}

// 泊松 Poisson(λ=2)，取 k=0..4
function presetPoisson(): Mass[] {
  const lambda = 2;
  const result: Mass[] = [];
  for (let k = 0; k <= 4; k++) {
    result.push({ x: k, p: (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k) });
  }
  return result;
}

// 几何 Geometric(p=0.5)，取 k=1..5
function presetGeometric(): Mass[] {
  const p = 0.5;
  const result: Mass[] = [];
  for (let k = 1; k <= 5; k++) {
    result.push({ x: k, p: p * Math.pow(1 - p, k - 1) });
  }
  return result;
}

function binom(n: number, k: number): number {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  let num = 1;
  let den = 1;
  for (let i = 0; i < k; i++) {
    num *= n - i;
    den *= i + 1;
  }
  return num / den;
}

function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// ─── 初始分布 ─────────────────────────────────────────────────────────────────
const INITIAL_MASSES: Mass[] = [
  { x: 0, p: 0.1 },
  { x: 2, p: 0.3 },
  { x: 4, p: 0.3 },
  { x: 6, p: 0.2 },
  { x: 8, p: 0.1 },
];

// ─── 计算统计量 ───────────────────────────────────────────────────────────────
function computeStats(masses: Mass[]) {
  const sumP = masses.reduce((s, m) => s + m.p, 0);
  const ex = masses.reduce((s, m) => s + m.x * m.p, 0) / (sumP || 1);
  const ex2 = masses.reduce((s, m) => s + m.x * m.x * m.p, 0) / (sumP || 1);
  const variance = ex2 - ex * ex;
  return { sumP, ex, ex2, variance };
}

// ─── 辅助格式化 ──────────────────────────────────────────────────────────────
function fmt(v: number, d = 4): string {
  return v.toFixed(d);
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function ExpectationExplorer() {
  const [masses, setMasses] = useState<Mass[]>(INITIAL_MASSES);
  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // ─── 统计量 ──────────────────────────────────────────────────────────────
  const { sumP, ex, ex2, variance } = computeStats(masses);
  const probabilityOk = Math.abs(sumP - 1) < 0.005;

  // ─── SVG 坐标转换（clientXY → SVG 坐标）────────────────────────────────
  const clientToSvg = useCallback((clientX: number, clientY: number): [number, number] => {
    const el = svgRef.current;
    if (!el) return [0, 0];
    const rect = el.getBoundingClientRect();
    const scaleX = SVG_W / rect.width;
    const scaleY = SVG_H / rect.height;
    return [(clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY];
  }, []);

  // ─── 拖动开始 ────────────────────────────────────────────────────────────
  function startDragX(e: React.PointerEvent, idx: number) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const [svgX] = clientToSvg(e.clientX, e.clientY);
    setDragTarget({ kind: "x", idx, startSvgX: svgX, startX: masses[idx].x });
  }

  function startDragP(e: React.PointerEvent, idx: number) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const [, svgY] = clientToSvg(e.clientX, e.clientY);
    setDragTarget({ kind: "p", idx, startSvgY: svgY, startP: masses[idx].p });
  }

  // ─── 拖动移动 ────────────────────────────────────────────────────────────
  function onPointerMove(e: React.PointerEvent) {
    if (!dragTarget) return;
    e.preventDefault();
    const [svgX, svgY] = clientToSvg(e.clientX, e.clientY);

    setMasses((prev) => {
      const next = prev.map((m) => ({ ...m }));
      if (dragTarget.kind === "x") {
        const newX = svgXToVal(svgX);
        // 避免两个质量块在相同 x 值
        const occupied = new Set(prev.map((m, i) => (i === dragTarget.idx ? -999 : m.x)));
        if (!occupied.has(newX)) {
          next[dragTarget.idx].x = newX;
        }
      } else {
        const newP = svgYToProb(svgY);
        next[dragTarget.idx].p = newP;
      }
      return next;
    });
  }

  function onPointerUp() {
    setDragTarget(null);
  }

  // ─── 重置 ────────────────────────────────────────────────────────────────
  function reset() {
    setMasses(INITIAL_MASSES.map((m) => ({ ...m })));
  }

  // ─── 一键导入预设 ────────────────────────────────────────────────────────
  function loadPreset(name: "binomial" | "poisson" | "geometric") {
    const map = {
      binomial: presetBinomial,
      poisson: presetPoisson,
      geometric: presetGeometric,
    };
    setMasses(map[name]());
  }

  // ─── 归一化（均分剩余概率）────────────────────────────────────────────
  function normalize() {
    if (sumP <= 0) return;
    setMasses((prev) => prev.map((m) => ({ ...m, p: m.p / sumP })));
  }

  // ─── 期望 ▽ 标记的 SVG x 坐标 ─────────────────────────────────────────
  const exSvgX = valToSvgX(ex);
  const exSvgXClamped = Math.max(X_LEFT - 2, Math.min(X_RIGHT + 2, exSvgX));

  // ─── 颜色辅助 ────────────────────────────────────────────────────────────
  const COLORS = [
    "#5b46e5", "#0f766e", "#d97706", "#dc2626", "#7c3aed",
  ];

  return (
    <div
      className="rounded-xl border border-[var(--line)] bg-white p-4"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      {/* 标题区 */}
      <div className="mb-3">
        <h3 className="text-[15px] font-bold" style={{ color: INK }}>
          期望：加权重心探索器
        </h3>
        <p className="mt-0.5 text-[12px]" style={{ color: INK_SOFT }}>
          拖动柱子底部圆点调整 <b>x 取值</b>，拖动柱顶圆点调整<b>概率高度</b>，
          观察期望「重心 ▽」如何移动。
        </p>
      </div>

      {/* 主 SVG 可视化 */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full select-none rounded-lg border"
        style={{ borderColor: GRAY_STROKE, background: GRAY_BG, touchAction: "none", maxHeight: 280 }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* 背景网格线（水平） */}
        {[0.25, 0.5, 0.75, 1.0].map((p) => {
          const lineY = BAR_BOTTOM - probToBarH(p);
          return (
            <g key={p}>
              <line
                x1={X_LEFT}
                y1={lineY}
                x2={X_RIGHT}
                y2={lineY}
                stroke={p === 1.0 ? "#c4b5fd" : "#e7e9ef"}
                strokeDasharray={p < 1.0 ? "4 3" : "none"}
                strokeWidth={p === 1.0 ? 1.5 : 1}
              />
              <text
                x={X_LEFT - 6}
                y={lineY + 3.5}
                fontSize="10"
                textAnchor="end"
                fill={INK_SOFT}
              >
                {p}
              </text>
            </g>
          );
        })}

        {/* 数轴线 */}
        <line x1={X_LEFT - 8} y1={AXIS_Y} x2={X_RIGHT + 8} y2={AXIS_Y} stroke={INK} strokeWidth={1.5} />

        {/* X 轴刻度与数字 */}
        {Array.from({ length: TICK_COUNT }, (_, i) => i + X_MIN_VAL).map((v) => {
          const tx = valToSvgX(v);
          const showLabel = v % 2 === 0;
          return (
            <g key={v}>
              <line x1={tx} y1={AXIS_Y} x2={tx} y2={AXIS_Y + (showLabel ? 6 : 3)} stroke={INK} strokeWidth={1} />
              {showLabel && (
                <text x={tx} y={AXIS_Y + 17} fontSize="10" textAnchor="middle" fill={INK_SOFT}>
                  {v}
                </text>
              )}
            </g>
          );
        })}

        {/* 质量柱 */}
        {masses.map((m, idx) => {
          const bx = valToSvgX(m.x);
          const barH = probToBarH(m.p);
          const barTop = BAR_BOTTOM - barH;
          const color = COLORS[idx % COLORS.length];

          return (
            <g key={idx}>
              {/* 柱体 */}
              <rect
                x={bx - 14}
                y={barTop}
                width={28}
                height={barH}
                fill={color}
                opacity={0.75}
                rx={3}
              />

              {/* 概率标签（柱顶） */}
              {barH > 18 && (
                <text
                  x={bx}
                  y={barTop + 13}
                  fontSize="10"
                  textAnchor="middle"
                  fill="white"
                  fontWeight="600"
                >
                  {m.p.toFixed(2)}
                </text>
              )}

              {/* x 值标签（柱中下） */}
              <text
                x={bx}
                y={AXIS_Y - 10}
                fontSize="10"
                textAnchor="middle"
                fill={color}
                fontWeight="700"
              >
                x={m.x}
              </text>

              {/* 拖动柱顶（调整概率） */}
              <circle
                cx={bx}
                cy={barTop}
                r={7}
                fill={color}
                stroke="white"
                strokeWidth={2}
                style={{ cursor: "ns-resize" }}
                onPointerDown={(e) => startDragP(e, idx)}
              />

              {/* 拖动底部（调整 x） */}
              <circle
                cx={bx}
                cy={AXIS_Y + 2}
                r={6}
                fill="white"
                stroke={color}
                strokeWidth={2.5}
                style={{ cursor: "ew-resize" }}
                onPointerDown={(e) => startDragX(e, idx)}
              />
            </g>
          );
        })}

        {/* 期望 ▽ 标记 */}
        {isFinite(ex) && (
          <g>
            {/* 竖线 */}
            <line
              x1={exSvgXClamped}
              y1={AXIS_Y - 6}
              x2={exSvgXClamped}
              y2={AXIS_Y + 22}
              stroke={ACCENT}
              strokeWidth={2}
              strokeDasharray="5 3"
            />
            {/* 三角形标记 */}
            <polygon
              points={`${exSvgXClamped - 7},${AXIS_Y + 22} ${exSvgXClamped + 7},${AXIS_Y + 22} ${exSvgXClamped},${AXIS_Y + 33}`}
              fill={ACCENT}
            />
            {/* E[X] 标签 */}
            <text
              x={exSvgXClamped}
              y={AXIS_Y + 44}
              fontSize="11"
              textAnchor="middle"
              fill={ACCENT}
              fontWeight="700"
            >
              E[X]={ex.toFixed(2)}
            </text>
          </g>
        )}

        {/* p 轴标签 */}
        <text x={X_LEFT - 6} y={BAR_BOTTOM - BAR_MAX_H - 6} fontSize="10" textAnchor="end" fill={INK_SOFT}>
          p
        </text>

        {/* 提示：拖动说明 */}
        <text x={X_RIGHT} y={22} fontSize="10" textAnchor="end" fill={INK_SOFT}>
          ● 拖柱顶调概率 · 拖底圆调取值
        </text>
      </svg>

      {/* 概率警告 */}
      {!probabilityOk && (
        <div
          className="mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-semibold"
          style={{ borderColor: RED, background: RED_LIGHT, color: RED }}
        >
          <span>⚠</span>
          <span>
            概率之和 = {sumP.toFixed(4)}（应 = 1）。点击「归一化」自动修正，否则下方统计量仅供参考。
          </span>
          <button
            onClick={normalize}
            className="ml-auto rounded-md px-2 py-0.5 text-[11px] font-bold"
            style={{ background: RED, color: "white" }}
          >
            归一化
          </button>
        </div>
      )}

      {/* 统计量面板 */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "E[X]（期望）", val: fmt(ex, 4), color: ACCENT, bg: ACCENT_LIGHT },
          { label: "E[X²]（二阶矩）", val: fmt(ex2, 4), color: "#0f766e", bg: "#ccfbf1" },
          { label: "E[X]²", val: fmt(ex * ex, 4), color: "#d97706", bg: "#fef3c7" },
          {
            label: "D[X] = E[X²]−E[X]²",
            val: fmt(variance, 4),
            color: variance < 0 ? RED : "#7c3aed",
            bg: variance < 0 ? RED_LIGHT : "#f3e8ff",
          },
        ].map(({ label, val, color, bg }) => (
          <div
            key={label}
            className="rounded-lg p-2.5 text-center"
            style={{ background: bg }}
          >
            <div className="text-[10px] leading-snug" style={{ color: INK_SOFT }}>
              {label}
            </div>
            <div
              className="mt-0.5 font-mono text-[15px] font-extrabold"
              style={{ color }}
            >
              {val}
            </div>
          </div>
        ))}
      </div>

      {/* 公式展示区 */}
      <div className="mt-3 rounded-lg px-4 py-3 text-[12px] leading-loose" style={{ background: GRAY_BG }}>
        <div className="mb-1 text-[13px] font-semibold" style={{ color: INK }}>
          加权平均公式（实时数值代入）
        </div>
        <div className="font-mono" style={{ color: INK_SOFT }}>
          E[X] = Σ x·p(x) =&nbsp;
          {masses.map((m, i) => (
            <span key={i}>
              <span style={{ color: COLORS[i % COLORS.length], fontWeight: 700 }}>
                ({m.x})×{m.p.toFixed(3)}
              </span>
              {i < masses.length - 1 && " + "}
            </span>
          ))}
        </div>
        <div className="mt-0.5 font-mono">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;={" "}
          <span style={{ color: ACCENT, fontWeight: 700 }}>{fmt(ex, 4)}</span>
          {!probabilityOk && (
            <span style={{ color: RED }}>
              {" "}（∑p = {sumP.toFixed(3)} ≠ 1，实为加权均值）
            </span>
          )}
        </div>
      </div>

      {/* 每个质量块的详细数据 */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[360px] border-collapse text-[12px]">
          <thead>
            <tr style={{ background: GRAY_BG }}>
              {["质量块", "取值 x", "概率 p(x)", "x·p(x)", "x²·p(x)"].map((h) => (
                <th
                  key={h}
                  className="px-2 py-1.5 text-left font-semibold"
                  style={{ color: INK_SOFT, borderBottom: `1px solid ${GRAY_STROKE}` }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {masses.map((m, idx) => {
              const color = COLORS[idx % COLORS.length];
              return (
                <tr
                  key={idx}
                  style={{ borderBottom: `1px solid ${GRAY_STROKE}` }}
                >
                  <td className="px-2 py-1.5">
                    <span
                      className="inline-block h-3 w-3 rounded-sm"
                      style={{ background: color, verticalAlign: "middle" }}
                    />
                  </td>
                  <td className="px-2 py-1.5 font-mono font-bold" style={{ color }}>
                    {m.x}
                  </td>
                  <td className="px-2 py-1.5 font-mono" style={{ color: INK }}>
                    {m.p.toFixed(4)}
                  </td>
                  <td className="px-2 py-1.5 font-mono" style={{ color: INK }}>
                    {(m.x * m.p).toFixed(4)}
                  </td>
                  <td className="px-2 py-1.5 font-mono" style={{ color: INK }}>
                    {(m.x * m.x * m.p).toFixed(4)}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: ACCENT_LIGHT }}>
              <td className="px-2 py-1.5 font-bold" style={{ color: ACCENT }} colSpan={2}>
                合计
              </td>
              <td
                className="px-2 py-1.5 font-mono font-bold"
                style={{ color: probabilityOk ? ACCENT : RED }}
              >
                {sumP.toFixed(4)}
              </td>
              <td className="px-2 py-1.5 font-mono font-bold" style={{ color: ACCENT }}>
                {fmt(ex * sumP, 4)}
              </td>
              <td className="px-2 py-1.5 font-mono font-bold" style={{ color: ACCENT }}>
                {fmt(ex2 * sumP, 4)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 操作按钮区 */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="self-center text-[11px] font-semibold" style={{ color: INK_SOFT }}>
          预设分布：
        </span>
        {(
          [
            { key: "binomial", label: "二项 B(4, 0.5)" },
            { key: "poisson", label: "泊松 P(2)" },
            { key: "geometric", label: "几何 G(0.5)" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => loadPreset(key)}
            className="rounded-lg px-3 py-1 text-[12px] font-medium"
            style={{ background: ACCENT_LIGHT, color: ACCENT }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={reset}
          className="ml-auto rounded-lg px-3 py-1 text-[12px] font-medium"
          style={{ background: GRAY_BG, color: INK_SOFT, border: `1px solid ${GRAY_STROKE}` }}
        >
          重置
        </button>
      </div>

      {/* 洞察提示 */}
      <div
        className="mt-3 rounded-lg px-3 py-2.5 text-[12px] leading-relaxed"
        style={{ background: GRAY_BG, borderLeft: `3px solid ${ACCENT}` }}
      >
        <span className="font-semibold" style={{ color: INK }}>直觉要点：</span>
        <span style={{ color: INK_SOFT }}>
          {" "}E[X] 就是「各取值按概率加权的重心」——把概率想象成质量，重心 ▽ 总在最重的一侧偏移。
          方差 D[X] = E[X²] − (E[X])² 度量了质量块围绕重心的分散程度。
          注意 E[X²] ≥ (E[X])²（Jensen 不等式），因此 D[X] ≥ 0。
        </span>
      </div>
    </div>
  );
}
