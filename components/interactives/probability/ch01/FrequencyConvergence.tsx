"use client";

import { memo, useState } from "react";

const W = 340;
const H = 160;
const P = 26;
const MAX_POINTS = 600;

function FrequencyConvergenceBase() {
  const [total, setTotal] = useState(0);
  const [heads, setHeads] = useState(0);
  const [points, setPoints] = useState<number[]>([]);

  function flip(k: number) {
    let h = heads;
    let t = total;
    let pts = points.slice();
    for (let i = 0; i < k; i++) {
      t += 1;
      // 客户端模拟，使用 Math.random 抛硬币
      if (Math.random() < 0.5) h += 1;
      pts.push(h / t);
    }
    while (pts.length > MAX_POINTS) {
      pts = pts.filter((_, idx) => idx % 2 === 0);
    }
    setHeads(h);
    setTotal(t);
    setPoints(pts);
  }

  function reset() {
    setHeads(0);
    setTotal(0);
    setPoints([]);
  }

  const freq = total ? heads / total : 0;
  const y = (f: number) => P + (1 - f) * (H - 2 * P);
  const x = (i: number, n: number) => P + (n <= 1 ? 0 : (i / (n - 1)) * (W - 2 * P));
  const path =
    points.length > 1
      ? points
          .map((f, i) => `${i === 0 ? "M" : "L"}${x(i, points.length).toFixed(1)},${y(f).toFixed(1)}`)
          .join(" ")
      : "";

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <rect x={P} y={P} width={W - 2 * P} height={H - 2 * P} fill="#fafbfd" stroke="#e7e9ef" />
        {/* y 轴刻度 0 / 0.5 / 1 */}
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={P} y1={y(v)} x2={W - P} y2={y(v)} stroke={v === 0.5 ? "#c4b5fd" : "#eef0f4"} strokeDasharray={v === 0.5 ? "4 3" : undefined} />
            <text x={P - 6} y={y(v) + 3} fontSize="10" textAnchor="end" fill="#8a94a6">{v}</text>
          </g>
        ))}
        <text x={W - P} y={y(0.5) - 5} fontSize="10" textAnchor="end" fill="#7c3aed">理论概率 0.5</text>
        {path && <path d={path} fill="none" stroke="#5b46e5" strokeWidth="1.8" />}
        {points.length > 0 && (
          <circle cx={x(points.length - 1, points.length)} cy={y(freq)} r="3" fill="#5b46e5" />
        )}
      </svg>

      <div className="mt-3 flex items-center justify-between text-[13px]">
        <div className="flex gap-4">
          <span className="text-[var(--ink-faint)]">试验 <b className="text-[var(--ink)]">{total}</b></span>
          <span className="text-[var(--ink-faint)]">正面 <b className="text-[var(--ink)]">{heads}</b></span>
          <span className="text-[var(--ink-faint)]">频率 <b className="font-mono text-[var(--accent-ink)]">{freq.toFixed(4)}</b></span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {[1, 20, 500].map((k) => (
          <button
            key={k}
            onClick={() => flip(k)}
            className="rounded-lg bg-[var(--accent)] px-3 py-1 text-[13px] font-medium text-white hover:opacity-90"
          >
            抛 {k} 次
          </button>
        ))}
        <button
          onClick={reset}
          className="rounded-lg bg-[var(--bg-muted)] px-3 py-1 text-[13px] font-medium text-[var(--ink-soft)] hover:bg-[var(--line)]"
        >
          重置
        </button>
      </div>
    </div>
  );
}

export default memo(FrequencyConvergenceBase);
