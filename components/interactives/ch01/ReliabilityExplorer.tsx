"use client";

import { memo, useState } from "react";

// ─── 常量与类型 ─────────────────────────────────────────────────────────────

type Mode = "series" | "parallel";

interface Component {
  id: number;
  label: string;
  p: number; // 可靠度 0..1
}

const ACCENT = "#5b46e5";
const COLOR_OK = "#22c55e";
const COLOR_FAIL = "#ef4444";
const COLOR_WIRE = "#6b7280";
const COLOR_WIRE_OK = COLOR_OK;
const COLOR_WIRE_FAIL = "#fca5a5";

const INIT_COMPONENTS: Component[] = [
  { id: 1, label: "A", p: 0.9 },
  { id: 2, label: "B", p: 0.8 },
  { id: 3, label: "C", p: 0.75 },
];

// ─── 纯函数：计算系统可靠度 ─────────────────────────────────────────────────

function calcSeries(ps: number[]): number {
  return ps.reduce((acc, p) => acc * p, 1);
}

function calcParallel(ps: number[]): number {
  return 1 - ps.reduce((acc, p) => acc * (1 - p), 1);
}

// ─── SVG：串联电路 ──────────────────────────────────────────────────────────

interface CircuitProps {
  components: Component[];
  sysOk: boolean | null;
  compOk: boolean[] | null;
  mode: Mode;
}

const SVG_W = 340;
const SVG_H = 130;

function SeriesCircuit({ components, sysOk, compOk }: Omit<CircuitProps, "mode">) {
  const n = components.length;
  const BOX_W = 52;
  const BOX_H = 34;
  const CY = SVG_H / 2;
  const totalBoxW = n * BOX_W + (n - 1) * 20; // gap=20
  const startX = (SVG_W - totalBoxW) / 2;

  const wireColor = (ok: boolean | null) =>
    ok === null ? COLOR_WIRE : ok ? COLOR_WIRE_OK : COLOR_WIRE_FAIL;
  const sysWire = wireColor(sysOk);

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ maxHeight: 130 }}>
      {/* 左端输入导线 */}
      <line x1={8} y1={CY} x2={startX} y2={CY} stroke={sysWire} strokeWidth={2.4} />
      {/* 电源符号 */}
      <circle cx={8} cy={CY} r={5} fill={sysOk === false ? COLOR_FAIL : ACCENT} />

      {components.map((comp, i) => {
        const boxX = startX + i * (BOX_W + 20);
        const ok = compOk ? compOk[i] : null;
        const boxColor = ok === null ? "#e9ebf2" : ok ? "#dcfce7" : "#fee2e2";
        const strokeCol = ok === null ? "#c4c9d4" : ok ? COLOR_OK : COLOR_FAIL;
        const textCol = ok === null ? "#4b5563" : ok ? "#15803d" : "#b91c1c";

        // 左连接线
        const leftWire = i === 0 ? startX : startX + i * (BOX_W + 20);
        const prevOk = i === 0 ? sysOk : compOk ? compOk[i - 1] : null;

        return (
          <g key={comp.id}>
            {/* 元件间导线 */}
            {i > 0 && (
              <line
                x1={startX + (i - 1) * (BOX_W + 20) + BOX_W}
                y1={CY}
                x2={leftWire}
                y2={CY}
                stroke={wireColor(prevOk)}
                strokeWidth={2.4}
              />
            )}
            {/* 元件矩形 */}
            <rect
              x={boxX}
              y={CY - BOX_H / 2}
              width={BOX_W}
              height={BOX_H}
              rx={6}
              fill={boxColor}
              stroke={strokeCol}
              strokeWidth={1.8}
            />
            {/* 标签 */}
            <text x={boxX + BOX_W / 2} y={CY - 4} textAnchor="middle" fontSize={13} fontWeight={700} fill={textCol}>
              {comp.label}
            </text>
            {/* 可靠度 */}
            <text x={boxX + BOX_W / 2} y={CY + 11} textAnchor="middle" fontSize={10} fill={textCol}>
              {(comp.p * 100).toFixed(0)}%
            </text>
            {/* 状态图标 */}
            {ok !== null && (
              <text x={boxX + BOX_W - 6} y={CY - BOX_H / 2 + 12} textAnchor="middle" fontSize={10} fill={strokeCol}>
                {ok ? "✓" : "✗"}
              </text>
            )}
          </g>
        );
      })}

      {/* 右端导线 */}
      <line
        x1={startX + (n - 1) * (BOX_W + 20) + BOX_W}
        y1={CY}
        x2={SVG_W - 8}
        y2={CY}
        stroke={wireColor(sysOk)}
        strokeWidth={2.4}
      />
      {/* 负载符号 */}
      <circle cx={SVG_W - 8} cy={CY} r={5} fill={sysOk === false ? COLOR_FAIL : ACCENT} />
      <text x={SVG_W / 2} y={SVG_H - 8} textAnchor="middle" fontSize={11} fill="#9ca3af">
        ← 串联：全部正常系统才正常 →
      </text>
    </svg>
  );
}

function ParallelCircuit({ components, sysOk, compOk }: Omit<CircuitProps, "mode">) {
  const n = components.length;
  const BOX_W = 52;
  const BOX_H = 28;
  const branchGap = 36;
  const totalH = n * BOX_H + (n - 1) * branchGap;
  const svgH = totalH + 40;
  const CY = svgH / 2;

  const wireColor = (ok: boolean | null) =>
    ok === null ? COLOR_WIRE : ok ? COLOR_WIRE_OK : COLOR_WIRE_FAIL;
  const sysWire = wireColor(sysOk);

  const branchY = (i: number) => CY - ((n - 1) / 2) * (BOX_H + branchGap) + i * (BOX_H + branchGap);
  const boxX = SVG_W / 2 - BOX_W / 2;
  const junctionL = boxX - 28;
  const junctionR = boxX + BOX_W + 28;

  return (
    <svg viewBox={`0 0 ${SVG_W} ${svgH}`} className="w-full" style={{ maxHeight: svgH }}>
      {/* 左端总线 */}
      <line x1={8} y1={CY} x2={junctionL} y2={CY} stroke={sysWire} strokeWidth={2.4} />
      <circle cx={8} cy={CY} r={5} fill={sysOk === false ? COLOR_FAIL : ACCENT} />
      {/* 右端总线 */}
      <line x1={junctionR} y1={CY} x2={SVG_W - 8} y2={CY} stroke={sysWire} strokeWidth={2.4} />
      <circle cx={SVG_W - 8} cy={CY} r={5} fill={sysOk === false ? COLOR_FAIL : ACCENT} />

      {/* 左右汇流竖线 */}
      {n > 1 && (
        <>
          <line
            x1={junctionL}
            y1={branchY(0)}
            x2={junctionL}
            y2={branchY(n - 1)}
            stroke={COLOR_WIRE}
            strokeWidth={2}
          />
          <line
            x1={junctionR}
            y1={branchY(0)}
            x2={junctionR}
            y2={branchY(n - 1)}
            stroke={COLOR_WIRE}
            strokeWidth={2}
          />
        </>
      )}

      {components.map((comp, i) => {
        const by = branchY(i);
        const ok = compOk ? compOk[i] : null;
        const boxColor = ok === null ? "#e9ebf2" : ok ? "#dcfce7" : "#fee2e2";
        const strokeCol = ok === null ? "#c4c9d4" : ok ? COLOR_OK : COLOR_FAIL;
        const textCol = ok === null ? "#4b5563" : ok ? "#15803d" : "#b91c1c";
        const branchWire = wireColor(ok);

        return (
          <g key={comp.id}>
            {/* 左分支线 */}
            <line x1={junctionL} y1={by} x2={boxX} y2={by} stroke={branchWire} strokeWidth={2.2} />
            {/* 右分支线 */}
            <line x1={boxX + BOX_W} y1={by} x2={junctionR} y2={by} stroke={branchWire} strokeWidth={2.2} />
            {/* 元件矩形 */}
            <rect
              x={boxX}
              y={by - BOX_H / 2}
              width={BOX_W}
              height={BOX_H}
              rx={6}
              fill={boxColor}
              stroke={strokeCol}
              strokeWidth={1.8}
            />
            <text x={boxX + BOX_W / 2} y={by - 2} textAnchor="middle" fontSize={13} fontWeight={700} fill={textCol}>
              {comp.label}
            </text>
            <text x={boxX + BOX_W / 2} y={by + 11} textAnchor="middle" fontSize={10} fill={textCol}>
              {(comp.p * 100).toFixed(0)}%
            </text>
            {ok !== null && (
              <text x={boxX + BOX_W - 4} y={by - BOX_H / 2 + 11} textAnchor="middle" fontSize={10} fill={strokeCol}>
                {ok ? "✓" : "✗"}
              </text>
            )}
          </g>
        );
      })}

      <text x={SVG_W / 2} y={svgH - 6} textAnchor="middle" fontSize={11} fill="#9ca3af">
        ← 并联：任一正常系统即正常 →
      </text>
    </svg>
  );
}

// ─── 可靠度颜色 ─────────────────────────────────────────────────────────────

function reliabilityColor(r: number): string {
  if (r >= 0.9) return COLOR_OK;
  if (r >= 0.6) return "#f59e0b";
  return COLOR_FAIL;
}

// ─── 主组件 ─────────────────────────────────────────────────────────────────

function ReliabilityExplorerBase() {
  const [mode, setMode] = useState<Mode>("series");
  const [components, setComponents] = useState<Component[]>(INIT_COMPONENTS);
  const [simResult, setSimResult] = useState<{
    compOk: boolean[];
    sysOk: boolean;
  } | null>(null);
  const [simCount, setSimCount] = useState(0);
  const [simSuccess, setSimSuccess] = useState(0);

  const ps = components.map((c) => c.p);
  const sysR = mode === "series" ? calcSeries(ps) : calcParallel(ps);

  function updateP(id: number, newP: number) {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, p: Math.round(newP * 100) / 100 } : c))
    );
    setSimResult(null);
  }

  function runOnce() {
    const compOk = components.map((c) => Math.random() < c.p);
    const sysOk =
      mode === "series" ? compOk.every(Boolean) : compOk.some(Boolean);
    setSimResult({ compOk, sysOk });
    setSimCount((n) => n + 1);
    setSimSuccess((n) => n + (sysOk ? 1 : 0));
  }

  function runMany(k: number) {
    let sc = simCount;
    let ss = simSuccess;
    let last: { compOk: boolean[]; sysOk: boolean } | null = null;
    for (let i = 0; i < k; i++) {
      const compOk = components.map((c) => Math.random() < c.p);
      const sysOk =
        mode === "series" ? compOk.every(Boolean) : compOk.some(Boolean);
      sc++;
      if (sysOk) ss++;
      last = { compOk, sysOk };
    }
    setSimResult(last);
    setSimCount(sc);
    setSimSuccess(ss);
  }

  function resetSim() {
    setSimResult(null);
    setSimCount(0);
    setSimSuccess(0);
  }

  const simFreq = simCount > 0 ? simSuccess / simCount : null;
  const rCol = reliabilityColor(sysR);

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4">
      {/* 标题 + 模式切换 */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-[15px] font-semibold text-[var(--ink)]">可靠性系统探索</h3>
        <div className="flex gap-1.5">
          {(["series", "parallel"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); resetSim(); }}
              className={
                "rounded-lg px-3 py-1 text-[13px] font-medium transition-colors " +
                (mode === m
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-muted)] text-[var(--ink-soft)] hover:bg-[var(--accent-weak)]")
              }
            >
              {m === "series" ? "串联" : "并联"}
            </button>
          ))}
        </div>
      </div>

      {/* 电路图 */}
      <div className="rounded-lg bg-[var(--bg-muted)] p-2 mb-3">
        {mode === "series" ? (
          <SeriesCircuit
            components={components}
            sysOk={simResult ? simResult.sysOk : null}
            compOk={simResult ? simResult.compOk : null}
          />
        ) : (
          <ParallelCircuit
            components={components}
            sysOk={simResult ? simResult.sysOk : null}
            compOk={simResult ? simResult.compOk : null}
          />
        )}
      </div>

      {/* 元件可靠度滑块 */}
      <div className="space-y-2.5 mb-3">
        {components.map((comp, i) => {
          const ok = simResult ? simResult.compOk[i] : null;
          return (
            <div key={comp.id} className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                style={{
                  background:
                    ok === null ? "#e9ebf2" : ok ? "#dcfce7" : "#fee2e2",
                  color:
                    ok === null ? "#4b5563" : ok ? "#15803d" : "#b91c1c",
                  border: `1.5px solid ${ok === null ? "#c4c9d4" : ok ? COLOR_OK : COLOR_FAIL}`,
                }}
              >
                {comp.label}
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(comp.p * 100)}
                onChange={(e) => updateP(comp.id, Number(e.target.value) / 100)}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: ACCENT }}
              />
              <span className="w-10 text-right font-mono text-[13px] font-semibold text-[var(--ink)]">
                {(comp.p * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* 系统可靠度展示 */}
      <div className="rounded-lg border border-[var(--line)] px-3 py-2.5 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[var(--ink-soft)] mb-0.5">
              系统可靠度
              <span className="ml-1.5 font-mono text-[10px] bg-[var(--bg-muted)] px-1.5 py-0.5 rounded text-[var(--ink-soft)]">
                {mode === "series"
                  ? `R = ${components.map((c) => `${(c.p * 100).toFixed(0)}%`).join(" × ")}`
                  : `R = 1 − ${components.map((c) => `(1−${(c.p * 100).toFixed(0)}%)`).join("×")}`}
              </span>
            </p>
            <p className="text-[22px] font-bold font-mono" style={{ color: rCol }}>
              {(sysR * 100).toFixed(2)}%
            </p>
          </div>
          {/* 可靠度条形 */}
          <div className="w-28 h-3 rounded-full bg-[var(--bg-muted)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${sysR * 100}%`, background: rCol }}
            />
          </div>
        </div>

        {/* 对比提示 */}
        <div className="mt-1.5 text-[11px] text-[var(--ink-soft)]">
          {mode === "series" ? (
            <span>
              串联：系统可靠度 <b className="text-[var(--ink)]">低于</b> 最弱元件（
              {Math.min(...ps.map((p) => p * 100)).toFixed(0)}%），元件越多越脆弱。
            </span>
          ) : (
            <span>
              并联：系统可靠度 <b className="text-[var(--ink)]">高于</b> 最强元件（
              {Math.max(...ps.map((p) => p * 100)).toFixed(0)}%），冗余提升可靠性。
            </span>
          )}
        </div>
      </div>

      {/* 蒙特卡洛模拟 */}
      <div className="rounded-lg bg-[var(--bg-muted)] px-3 py-2.5">
        <p className="text-[12px] font-semibold text-[var(--ink-soft)] mb-2">
          Monte Carlo 模拟（验证理论值）
        </p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <button
            onClick={runOnce}
            className="rounded-lg bg-[var(--accent)] px-2.5 py-1 text-[12px] font-medium text-white hover:opacity-90"
          >
            运行 1 次
          </button>
          {[100, 1000].map((k) => (
            <button
              key={k}
              onClick={() => runMany(k)}
              className="rounded-lg bg-[var(--accent)] px-2.5 py-1 text-[12px] font-medium text-white hover:opacity-90"
            >
              运行 {k} 次
            </button>
          ))}
          <button
            onClick={resetSim}
            className="rounded-lg bg-white border border-[var(--line)] px-2.5 py-1 text-[12px] font-medium text-[var(--ink-soft)] hover:bg-[var(--line)]"
          >
            重置
          </button>
        </div>

        {simCount > 0 ? (
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12px]">
            <span className="text-[var(--ink-soft)]">
              已运行 <b className="text-[var(--ink)]">{simCount}</b> 次
            </span>
            <span className="text-[var(--ink-soft)]">
              成功 <b className="text-[var(--ink)]">{simSuccess}</b> 次
            </span>
            <span className="text-[var(--ink-soft)]">
              频率{" "}
              <b className="font-mono" style={{ color: reliabilityColor(simFreq!) }}>
                {((simFreq ?? 0) * 100).toFixed(2)}%
              </b>
            </span>
            <span className="text-[var(--ink-soft)]">
              理论{" "}
              <b className="font-mono text-[var(--ink)]">
                {(sysR * 100).toFixed(2)}%
              </b>
            </span>
            {simResult && (
              <span
                className="font-semibold"
                style={{ color: simResult.sysOk ? COLOR_OK : COLOR_FAIL }}
              >
                最近一次：{simResult.sysOk ? "✓ 系统正常" : "✗ 系统失效"}
              </span>
            )}
          </div>
        ) : (
          <p className="text-[12px] text-[var(--ink-soft)] italic">
            点击按钮随机模拟各元件工作/失效，观察频率收敛到理论值。
          </p>
        )}

        {/* 频率与理论对比条 */}
        {simCount >= 10 && simFreq !== null && (
          <div className="mt-2 flex items-center gap-2 text-[11px] text-[var(--ink-soft)]">
            <span className="w-8">模拟</span>
            <div className="flex-1 h-2 rounded-full bg-white border border-[var(--line)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${simFreq * 100}%`,
                  background: reliabilityColor(simFreq),
                }}
              />
            </div>
            <span className="w-8">理论</span>
            <div className="flex-1 h-2 rounded-full bg-white border border-[var(--line)] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${sysR * 100}%`, background: rCol }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 公式说明 */}
      <div className="mt-3 rounded-lg border border-[var(--line)] px-3 py-2 text-[12px] leading-relaxed text-[var(--ink-soft)]">
        {mode === "series" ? (
          <>
            <b className="text-[var(--ink)]">串联系统</b>：各元件独立，系统正常当且仅当所有元件均正常。
            由独立事件乘法定理：{" "}
            <code className="bg-[var(--bg-muted)] px-1 rounded text-[var(--accent)]">
              R = p₁ × p₂ × … × pₙ
            </code>
            ，可靠度严格低于最小分量。
          </>
        ) : (
          <>
            <b className="text-[var(--ink)]">并联系统</b>：至少一个元件正常即可。系统失效概率
            = 所有元件同时失效，故{" "}
            <code className="bg-[var(--bg-muted)] px-1 rounded text-[var(--accent)]">
              R = 1 − (1−p₁)(1−p₂)…(1−pₙ)
            </code>
            ，冗余显著提升可靠性。
          </>
        )}
      </div>
    </div>
  );
}

export default memo(ReliabilityExplorerBase);
