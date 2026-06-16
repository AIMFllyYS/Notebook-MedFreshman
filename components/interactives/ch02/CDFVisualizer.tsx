"use client";

import { useState, useCallback, useRef, useEffect } from "react";

// ─── 设计令牌常量 ───────────────────────────────────────────────
const ACCENT = "#5b46e5";
const ACCENT_LIGHT = "#ede9fe";
const ACCENT_FILL = "#7c3aed33";
const INK = "#1a1a2e";
const INK_SOFT = "#6b7280";
const LINE = "#e5e7eb";
const BG_MUTED = "#f8f9fc";
const GREEN = "#059669";
const ORANGE = "#d97706";

// ─── SVG 布局 ───────────────────────────────────────────────────
const SVG_W = 540;
const SVG_H = 200;
const PAD_L = 48;
const PAD_R = 20;
const PAD_T = 16;
const PAD_B = 36;
const PLOT_W = SVG_W - PAD_L - PAD_R;
const PLOT_H = SVG_H - PAD_T - PAD_B;

// ─── 分布类型 ───────────────────────────────────────────────────
type DistType = "binomial" | "normal" | "exponential";

// ─── 数学工具 ───────────────────────────────────────────────────
// 二项分布 PMF：P(X=k) = C(n,k) * p^k * (1-p)^(n-k)
function binomPMF(k: number, n: number, p: number): number {
  if (k < 0 || k > n || !Number.isInteger(k)) return 0;
  return binomCoeff(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function binomCoeff(n: number, k: number): number {
  if (k === 0 || k === n) return 1;
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return result;
}

function binomCDF(x: number, n: number, p: number): number {
  let sum = 0;
  for (let k = 0; k <= Math.floor(x); k++) {
    sum += binomPMF(k, n, p);
  }
  return Math.min(sum, 1);
}

// 正态分布 PDF
function normalPDF(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

// 正态分布 CDF（使用 erf 近似）
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const poly =
    t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const result = 1 - poly * Math.exp(-x * x);
  return x >= 0 ? result : -result;
}

function normalCDF(x: number, mu: number, sigma: number): number {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)));
}

// 指数分布 PDF
function expPDF(x: number, lambda: number): number {
  if (x < 0) return 0;
  return lambda * Math.exp(-lambda * x);
}

// 指数分布 CDF
function expCDF(x: number, lambda: number): number {
  if (x < 0) return 0;
  return 1 - Math.exp(-lambda * x);
}

// ─── x 轴坐标映射 ───────────────────────────────────────────────
function xToSvg(x: number, xMin: number, xMax: number): number {
  return PAD_L + ((x - xMin) / (xMax - xMin)) * PLOT_W;
}

function svgToX(svgX: number, xMin: number, xMax: number): number {
  return xMin + ((svgX - PAD_L) / PLOT_W) * (xMax - xMin);
}

function yToSvg(y: number, yMax: number): number {
  return PAD_T + (1 - y / yMax) * PLOT_H;
}

// ─── 拖拽 Hook ───────────────────────────────────────────────────
function useDrag(
  onDrag: (svgX: number) => void,
  svgRef: React.RefObject<SVGSVGElement | null>
) {
  const dragging = useRef(false);

  const getSvgX = useCallback(
    (clientX: number): number => {
      const svg = svgRef.current;
      if (!svg) return 0;
      const rect = svg.getBoundingClientRect();
      const scaleX = SVG_W / rect.width;
      return (clientX - rect.left) * scaleX;
    },
    [svgRef]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      onDrag(getSvgX(e.clientX));
    },
    [onDrag, getSvgX]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging.current) return;
      onDrag(getSvgX(e.clientX));
    },
    [onDrag, getSvgX]
  );

  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // Touch support
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      dragging.current = true;
      onDrag(getSvgX(e.touches[0].clientX));
    },
    [onDrag, getSvgX]
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!dragging.current) return;
      onDrag(getSvgX(e.touches[0].clientX));
    },
    [onDrag, getSvgX]
  );

  const onTouchEnd = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onTouchMove, onTouchEnd]);

  return { onMouseDown, onTouchStart };
}

// ─── 格式化辅助 ─────────────────────────────────────────────────
function fmt4(v: number): string {
  return v.toFixed(4);
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// ─── 主组件 ─────────────────────────────────────────────────────
export default function CDFVisualizer() {
  // 分布选择
  const [distType, setDistType] = useState<DistType>("binomial");
  // 二项参数
  const [binomN] = useState(10);
  const [binomP, setBinomP] = useState(0.4);
  // 正态参数
  const [normalMu, setNormalMu] = useState(0);
  const [normalSigma, setNormalSigma] = useState(1);
  // 指数参数
  const [expLambda, setExpLambda] = useState(1);

  // 单滑块 x（用于 F(x) 计算）
  const [xVal, setXVal] = useState<number>(4);

  // 双滑块 a, b（用于区间概率 P(a<=X<=b)）
  const [aVal, setAVal] = useState<number>(2);
  const [bVal, setBVal] = useState<number>(6);

  // 是否显示区间模式
  const [showInterval, setShowInterval] = useState(false);

  // 视图模式：PDF/PMF 还是 CDF
  const [viewMode, setViewMode] = useState<"pdf" | "cdf">("pdf");

  const svgRef = useRef<SVGSVGElement>(null);

  // ─── 分布范围配置 ───────────────────────────────────────────
  const getRange = (): { xMin: number; xMax: number } => {
    if (distType === "binomial") return { xMin: -0.5, xMax: binomN + 0.5 };
    if (distType === "normal") return { xMin: normalMu - 4 * normalSigma, xMax: normalMu + 4 * normalSigma };
    return { xMin: 0, xMax: 8 / expLambda };
  };

  const { xMin, xMax } = getRange();

  // ─── CDF 值计算 ─────────────────────────────────────────────
  const getCDF = (x: number): number => {
    if (distType === "binomial") return binomCDF(x, binomN, binomP);
    if (distType === "normal") return normalCDF(x, normalMu, normalSigma);
    return expCDF(x, expLambda);
  };

  // 区间概率 P(a<=X<=b)
  const getIntervalProb = (a: number, b: number): number => {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    if (distType === "binomial") {
      return binomCDF(hi, binomN, binomP) - binomCDF(lo - 1, binomN, binomP);
    }
    return getCDF(hi) - getCDF(lo);
  };

  // 钳制到有效范围
  const clampX = (v: number) => clamp(v, xMin, xMax);

  // ─── PDF/PMF 最大值（用于 y 轴标准化）──────────────────────
  const getPDFMax = (): number => {
    if (distType === "binomial") {
      let max = 0;
      for (let k = 0; k <= binomN; k++) {
        const v = binomPMF(k, binomN, binomP);
        if (v > max) max = v;
      }
      return max * 1.3;
    }
    if (distType === "normal") {
      return normalPDF(normalMu, normalMu, normalSigma) * 1.3;
    }
    return expPDF(0, expLambda) * 1.3;
  };

  const pdfMax = getPDFMax();

  // ─── 生成 PDF/PMF 路径 ──────────────────────────────────────
  const buildPDFPath = (): string => {
    if (distType === "binomial") return ""; // 离散，用 rect 绘制
    const steps = 200;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = distType === "normal" ? normalPDF(x, normalMu, normalSigma) : expPDF(x, expLambda);
      const sx = xToSvg(x, xMin, xMax);
      const sy = yToSvg(y, pdfMax);
      pts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(2)},${sy.toFixed(2)}`);
    }
    return pts.join(" ");
  };

  // ─── 生成 CDF 路径 ───────────────────────────────────────────
  const buildCDFPath = (): string => {
    if (distType === "binomial") return ""; // 离散，用 step 函数
    const steps = 300;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = getCDF(x);
      const sx = xToSvg(x, xMin, xMax);
      const sy = yToSvg(y, 1);
      pts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(2)},${sy.toFixed(2)}`);
    }
    return pts.join(" ");
  };

  // ─── 阴影填充路径（左侧面积 F(x)）─────────────────────────
  const buildFillPath = (toX: number): string => {
    if (distType === "binomial") return "";
    const steps = 150;
    const x0 = xMin;
    const x1 = Math.min(toX, xMax);
    const sx0 = xToSvg(x0, xMin, xMax);
    const sx1 = xToSvg(x1, xMin, xMax);
    const baseY = PAD_T + PLOT_H;
    const pts: string[] = [`M${sx0.toFixed(2)},${baseY.toFixed(2)}`];
    for (let i = 0; i <= steps; i++) {
      const x = x0 + (i / steps) * (x1 - x0);
      const y = distType === "normal" ? normalPDF(x, normalMu, normalSigma) : expPDF(x, expLambda);
      const sx = xToSvg(x, xMin, xMax);
      const sy = yToSvg(y, pdfMax);
      pts.push(`L${sx.toFixed(2)},${sy.toFixed(2)}`);
    }
    pts.push(`L${sx1.toFixed(2)},${baseY.toFixed(2)}`);
    pts.push("Z");
    return pts.join(" ");
  };

  // 区间 [a, b] 的填充路径
  const buildIntervalFillPath = (fromX: number, toX: number): string => {
    if (distType === "binomial") return "";
    const steps = 150;
    const x0 = Math.max(Math.min(fromX, toX), xMin);
    const x1 = Math.min(Math.max(fromX, toX), xMax);
    const sx0 = xToSvg(x0, xMin, xMax);
    const sx1 = xToSvg(x1, xMin, xMax);
    const baseY = PAD_T + PLOT_H;
    const pts: string[] = [`M${sx0.toFixed(2)},${baseY.toFixed(2)}`];
    for (let i = 0; i <= steps; i++) {
      const x = x0 + (i / steps) * (x1 - x0);
      const y = distType === "normal" ? normalPDF(x, normalMu, normalSigma) : expPDF(x, expLambda);
      const sx = xToSvg(x, xMin, xMax);
      const sy = yToSvg(y, pdfMax);
      pts.push(`L${sx.toFixed(2)},${sy.toFixed(2)}`);
    }
    pts.push(`L${sx1.toFixed(2)},${baseY.toFixed(2)}`);
    pts.push("Z");
    return pts.join(" ");
  };

  // ─── 拖拽回调 ───────────────────────────────────────────────
  const handleDragX = useCallback(
    (svgX: number) => {
      const x = clampX(svgToX(svgX, xMin, xMax));
      if (distType === "binomial") {
        setXVal(Math.round(clamp(x, 0, binomN)));
      } else {
        setXVal(x);
      }
    },
    [xMin, xMax, distType, binomN]
  );

  const handleDragA = useCallback(
    (svgX: number) => {
      const x = clampX(svgToX(svgX, xMin, xMax));
      if (distType === "binomial") {
        setAVal(Math.round(clamp(x, 0, binomN)));
      } else {
        setAVal(x);
      }
    },
    [xMin, xMax, distType, binomN]
  );

  const handleDragB = useCallback(
    (svgX: number) => {
      const x = clampX(svgToX(svgX, xMin, xMax));
      if (distType === "binomial") {
        setBVal(Math.round(clamp(x, 0, binomN)));
      } else {
        setBVal(x);
      }
    },
    [xMin, xMax, distType, binomN]
  );

  const dragX = useDrag(handleDragX, svgRef);
  const dragA = useDrag(handleDragA, svgRef);
  const dragB = useDrag(handleDragB, svgRef);

  // ─── 分布切换时重置滑块 ──────────────────────────────────────
  const switchDist = (d: DistType) => {
    setDistType(d);
    if (d === "binomial") { setXVal(4); setAVal(2); setBVal(6); }
    else if (d === "normal") { setXVal(0); setAVal(-1); setBVal(1); }
    else { setXVal(1); setAVal(0.5); setBVal(2); }
  };

  // ─── 计算关键数值 ─────────────────────────────────────────────
  const fxVal = getCDF(xVal);
  const intervalProb = getIntervalProb(aVal, bVal);
  const loAB = Math.min(aVal, bVal);
  const hiAB = Math.max(aVal, bVal);

  // ─── 离散分布（二项）bars ──────────────────────────────────────
  const binomBars = (() => {
    if (distType !== "binomial") return [];
    const bars = [];
    const barW = (PLOT_W / (binomN + 1)) * 0.6;
    for (let k = 0; k <= binomN; k++) {
      const p = binomPMF(k, binomN, binomP);
      const sx = xToSvg(k, xMin, xMax);
      const sy = yToSvg(p, pdfMax);
      const barH = (PAD_T + PLOT_H) - sy;
      let fill = LINE;
      if (!showInterval) {
        fill = k <= Math.floor(xVal) ? ACCENT : LINE;
      } else {
        const lo = Math.min(Math.round(aVal), Math.round(bVal));
        const hi = Math.max(Math.round(aVal), Math.round(bVal));
        fill = k >= lo && k <= hi ? ORANGE : LINE;
      }
      bars.push({ k, sx, sy, barH, barW, fill, p });
    }
    return bars;
  })();

  // ─── 离散 CDF 阶梯路径 ──────────────────────────────────────
  const buildBinomCDFPath = (): string => {
    const pts: string[] = [];
    let cdf = 0;
    const baseY = yToSvg(0, 1);
    // 从左边界开始
    pts.push(`M${PAD_L.toFixed(2)},${baseY.toFixed(2)}`);
    for (let k = 0; k <= binomN; k++) {
      const sx = xToSvg(k, xMin, xMax);
      const prevCdf = cdf;
      cdf += binomPMF(k, binomN, binomP);
      // 水平线到当前 k
      pts.push(`L${sx.toFixed(2)},${yToSvg(prevCdf, 1).toFixed(2)}`);
      // 垂直跳跃
      pts.push(`L${sx.toFixed(2)},${yToSvg(cdf, 1).toFixed(2)}`);
    }
    // 延伸到右边界
    pts.push(`L${(PAD_L + PLOT_W).toFixed(2)},${yToSvg(1, 1).toFixed(2)}`);
    return pts.join(" ");
  };

  // ─── SVG x 坐标 ─────────────────────────────────────────────
  const xSvg = xToSvg(distType === "binomial" ? xVal : xVal, xMin, xMax);
  const aSvg = xToSvg(aVal, xMin, xMax);
  const bSvg = xToSvg(bVal, xMin, xMax);

  // x 轴刻度
  const xTicks = (() => {
    if (distType === "binomial") {
      return Array.from({ length: binomN + 1 }, (_, i) => i);
    }
    const count = 7;
    return Array.from({ length: count }, (_, i) => xMin + (i / (count - 1)) * (xMax - xMin));
  })();

  // y 轴刻度（PDF 视图）
  const yTicksPDF = [0, 0.25, 0.5, 0.75, 1].map((r) => r * pdfMax).filter((v) => v <= pdfMax);

  // ─── 分布名称 ───────────────────────────────────────────────
  const distName =
    distType === "binomial"
      ? `B(${binomN}, ${binomP})`
      : distType === "normal"
      ? `N(${normalMu}, ${normalSigma}²)`
      : `Exp(${expLambda})`;

  // ─── CDF 视图 y 轴 ───────────────────────────────────────────
  const yTicksCDF = [0, 0.25, 0.5, 0.75, 1];

  const baseLineY = PAD_T + PLOT_H;

  // ─── CDF 视图中 F(x) 的竖线和 point-in-CDF 标记 ────────────
  const fxSvgY_cdf = yToSvg(fxVal, 1);

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-4">
      {/* 标题 */}
      <div>
        <h3 className="text-[15px] font-bold text-[var(--ink)]">分布函数 F(x) 可视化</h3>
        <p className="text-[12px] text-[var(--ink-soft)] mt-0.5">
          拖动竖线，直观理解 F(x) = P(X ≤ x) 的含义；切换分布观察形态变化。
        </p>
      </div>

      {/* ── 分布选择 ──────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[12px] font-semibold text-[var(--ink-soft)]">分布：</span>
        {(
          [
            { key: "binomial", label: "离散 B(10, p)" },
            { key: "normal", label: "连续 N(μ, σ²)" },
            { key: "exponential", label: "连续 Exp(λ)" },
          ] as { key: DistType; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchDist(key)}
            className={
              "rounded-lg px-3 py-1 text-[12px] font-medium transition-colors " +
              (distType === key
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-muted)] text-[var(--ink-soft)] hover:bg-[var(--accent-weak)]")
            }
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex gap-1.5">
          {(["pdf", "cdf"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={
                "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors " +
                (viewMode === m
                  ? "bg-[#1a1a2e] text-white"
                  : "bg-[var(--bg-muted)] text-[var(--ink-soft)]")
              }
            >
              {m === "pdf" ? (distType === "binomial" ? "PMF" : "PDF") : "CDF"}
            </button>
          ))}
        </div>
      </div>

      {/* ── 参数控制 ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-lg bg-[var(--bg-muted)] px-4 py-2.5 text-[12px]">
        {distType === "binomial" && (
          <label className="flex items-center gap-2 text-[var(--ink-soft)]">
            <span>p =</span>
            <input
              type="range" min={0.05} max={0.95} step={0.05}
              value={binomP}
              onChange={(e) => setBinomP(Number(e.target.value))}
              className="w-24 cursor-pointer"
              style={{ accentColor: ACCENT }}
            />
            <b className="font-mono text-[var(--ink)]">{binomP.toFixed(2)}</b>
          </label>
        )}
        {distType === "normal" && (
          <>
            <label className="flex items-center gap-2 text-[var(--ink-soft)]">
              <span>μ =</span>
              <input
                type="range" min={-3} max={3} step={0.5}
                value={normalMu}
                onChange={(e) => { setNormalMu(Number(e.target.value)); setXVal(Number(e.target.value)); }}
                className="w-20 cursor-pointer"
                style={{ accentColor: ACCENT }}
              />
              <b className="font-mono text-[var(--ink)]">{normalMu.toFixed(1)}</b>
            </label>
            <label className="flex items-center gap-2 text-[var(--ink-soft)]">
              <span>σ =</span>
              <input
                type="range" min={0.5} max={3} step={0.25}
                value={normalSigma}
                onChange={(e) => setNormalSigma(Number(e.target.value))}
                className="w-20 cursor-pointer"
                style={{ accentColor: ACCENT }}
              />
              <b className="font-mono text-[var(--ink)]">{normalSigma.toFixed(2)}</b>
            </label>
          </>
        )}
        {distType === "exponential" && (
          <label className="flex items-center gap-2 text-[var(--ink-soft)]">
            <span>λ =</span>
            <input
              type="range" min={0.25} max={3} step={0.25}
              value={expLambda}
              onChange={(e) => setExpLambda(Number(e.target.value))}
              className="w-20 cursor-pointer"
              style={{ accentColor: ACCENT }}
            />
            <b className="font-mono text-[var(--ink)]">{expLambda.toFixed(2)}</b>
          </label>
        )}
        <label className="flex items-center gap-2 text-[var(--ink-soft)]">
          <span>区间模式</span>
          <button
            onClick={() => setShowInterval((v) => !v)}
            className={
              "relative inline-flex h-5 w-9 rounded-full transition-colors " +
              (showInterval ? "bg-[var(--accent)]" : "bg-[var(--line)]")
            }
          >
            <span
              className={
                "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform " +
                (showInterval ? "translate-x-4" : "translate-x-0")
              }
            />
          </button>
        </label>
      </div>

      {/* ── SVG 主图 ─────────────────────────────────────────── */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full select-none touch-none rounded-lg border border-[var(--line)]"
        style={{ maxHeight: 240, cursor: "ew-resize" }}
      >
        {/* 背景 */}
        <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H} fill={BG_MUTED} />

        {/* ── PDF / PMF 视图 ──────────────────────────────────── */}
        {viewMode === "pdf" && (
          <>
            {/* y 轴网格 */}
            {yTicksPDF.map((v) => {
              const sy = yToSvg(v, pdfMax);
              return (
                <g key={v}>
                  <line x1={PAD_L} y1={sy} x2={PAD_L + PLOT_W} y2={sy} stroke={LINE} strokeWidth={0.8} />
                  <text x={PAD_L - 4} y={sy + 3} fontSize={9} textAnchor="end" fill={INK_SOFT}>
                    {v.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* 连续分布：左侧阴影（F(x) 面积）或区间阴影 */}
            {distType !== "binomial" && !showInterval && (
              <path d={buildFillPath(xVal)} fill={ACCENT_FILL} stroke="none" />
            )}
            {distType !== "binomial" && showInterval && (
              <path d={buildIntervalFillPath(aVal, bVal)} fill={`${ORANGE}33`} stroke="none" />
            )}

            {/* 连续分布：PDF 曲线 */}
            {distType !== "binomial" && (
              <path d={buildPDFPath()} fill="none" stroke={ACCENT} strokeWidth={2} strokeLinejoin="round" />
            )}

            {/* 离散分布：PMF bars */}
            {distType === "binomial" &&
              binomBars.map(({ k, sx, sy, barH, barW, fill }) => (
                <rect
                  key={k}
                  x={sx - barW / 2}
                  y={sy}
                  width={barW}
                  height={barH}
                  fill={fill}
                  rx={2}
                  opacity={0.85}
                />
              ))}

            {/* x 轴 */}
            <line x1={PAD_L} y1={baseLineY} x2={PAD_L + PLOT_W} y2={baseLineY} stroke={LINE} strokeWidth={1} />

            {/* ─ 单滑块模式的竖线 ─ */}
            {!showInterval && (
              <g>
                {/* 阴影竖线 */}
                <line
                  x1={xSvg} y1={PAD_T}
                  x2={xSvg} y2={baseLineY}
                  stroke={ACCENT} strokeWidth={1.5} strokeDasharray="4 3"
                />
                {/* 拖拽手柄 */}
                <g
                  {...dragX}
                  style={{ cursor: "ew-resize" }}
                >
                  <rect
                    x={xSvg - 10} y={PAD_T}
                    width={20} height={PLOT_H}
                    fill="transparent"
                  />
                  <circle cx={xSvg} cy={baseLineY} r={7} fill={ACCENT} stroke="white" strokeWidth={1.5} />
                  <text
                    x={xSvg}
                    y={baseLineY + 16}
                    fontSize={10}
                    textAnchor="middle"
                    fill={ACCENT}
                    fontWeight="bold"
                  >
                    x
                  </text>
                </g>
              </g>
            )}

            {/* ─ 区间模式：a 和 b 滑块 ─ */}
            {showInterval && (
              <>
                {/* a 竖线 */}
                <line x1={aSvg} y1={PAD_T} x2={aSvg} y2={baseLineY} stroke={GREEN} strokeWidth={1.5} strokeDasharray="4 3" />
                <g {...dragA} style={{ cursor: "ew-resize" }}>
                  <rect x={aSvg - 10} y={PAD_T} width={20} height={PLOT_H} fill="transparent" />
                  <circle cx={aSvg} cy={baseLineY} r={7} fill={GREEN} stroke="white" strokeWidth={1.5} />
                  <text x={aSvg} y={baseLineY + 16} fontSize={10} textAnchor="middle" fill={GREEN} fontWeight="bold">a</text>
                </g>
                {/* b 竖线 */}
                <line x1={bSvg} y1={PAD_T} x2={bSvg} y2={baseLineY} stroke={ORANGE} strokeWidth={1.5} strokeDasharray="4 3" />
                <g {...dragB} style={{ cursor: "ew-resize" }}>
                  <rect x={bSvg - 10} y={PAD_T} width={20} height={PLOT_H} fill="transparent" />
                  <circle cx={bSvg} cy={baseLineY} r={7} fill={ORANGE} stroke="white" strokeWidth={1.5} />
                  <text x={bSvg} y={baseLineY + 16} fontSize={10} textAnchor="middle" fill={ORANGE} fontWeight="bold">b</text>
                </g>
              </>
            )}
          </>
        )}

        {/* ── CDF 视图 ─────────────────────────────────────────── */}
        {viewMode === "cdf" && (
          <>
            {/* y 轴网格 */}
            {yTicksCDF.map((v) => {
              const sy = yToSvg(v, 1);
              return (
                <g key={v}>
                  <line x1={PAD_L} y1={sy} x2={PAD_L + PLOT_W} y2={sy} stroke={v === 0 ? LINE : LINE} strokeWidth={0.8} />
                  <text x={PAD_L - 4} y={sy + 3} fontSize={9} textAnchor="end" fill={INK_SOFT}>
                    {v.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* 连续 CDF 曲线 */}
            {distType !== "binomial" && (
              <path d={buildCDFPath()} fill="none" stroke={ACCENT} strokeWidth={2.2} strokeLinejoin="round" />
            )}

            {/* 离散 CDF 阶梯 */}
            {distType === "binomial" && (
              <path d={buildBinomCDFPath()} fill="none" stroke={ACCENT} strokeWidth={2} strokeLinejoin="round" />
            )}

            {/* x 轴 */}
            <line x1={PAD_L} y1={baseLineY} x2={PAD_L + PLOT_W} y2={baseLineY} stroke={LINE} strokeWidth={1} />

            {/* F(x) 读取线（水平+竖直虚线 → 点） */}
            {!showInterval && (
              <g>
                {/* 竖线 */}
                <line x1={xSvg} y1={PAD_T} x2={xSvg} y2={fxSvgY_cdf} stroke={ACCENT} strokeWidth={1.5} strokeDasharray="4 3" />
                {/* 水平线到 y 轴 */}
                <line x1={PAD_L} y1={fxSvgY_cdf} x2={xSvg} y2={fxSvgY_cdf} stroke={ACCENT} strokeWidth={1.5} strokeDasharray="4 3" />
                {/* y 轴上的数值标注 */}
                <rect x={0} y={fxSvgY_cdf - 8} width={PAD_L - 4} height={14} fill="white" rx={2} />
                <text x={PAD_L - 5} y={fxSvgY_cdf + 4} fontSize={9.5} textAnchor="end" fill={ACCENT} fontWeight="bold">
                  {fxVal.toFixed(3)}
                </text>
                {/* 交叉点 */}
                <circle cx={xSvg} cy={fxSvgY_cdf} r={4.5} fill={ACCENT} stroke="white" strokeWidth={1.5} />
                {/* 拖拽手柄 */}
                <g {...dragX} style={{ cursor: "ew-resize" }}>
                  <rect x={xSvg - 10} y={PAD_T} width={20} height={PLOT_H} fill="transparent" />
                  <circle cx={xSvg} cy={baseLineY} r={7} fill={ACCENT} stroke="white" strokeWidth={1.5} />
                  <text x={xSvg} y={baseLineY + 16} fontSize={10} textAnchor="middle" fill={ACCENT} fontWeight="bold">x</text>
                </g>
              </g>
            )}

            {/* 区间模式 CDF：F(b) - F(a) */}
            {showInterval && (
              <>
                {/* a 滑块 */}
                <line x1={aSvg} y1={PAD_T} x2={aSvg} y2={baseLineY} stroke={GREEN} strokeWidth={1.5} strokeDasharray="4 3" />
                <g {...dragA} style={{ cursor: "ew-resize" }}>
                  <rect x={aSvg - 10} y={PAD_T} width={20} height={PLOT_H} fill="transparent" />
                  <circle cx={aSvg} cy={baseLineY} r={7} fill={GREEN} stroke="white" strokeWidth={1.5} />
                  <text x={aSvg} y={baseLineY + 16} fontSize={10} textAnchor="middle" fill={GREEN} fontWeight="bold">a</text>
                </g>
                {/* b 滑块 */}
                <line x1={bSvg} y1={PAD_T} x2={bSvg} y2={baseLineY} stroke={ORANGE} strokeWidth={1.5} strokeDasharray="4 3" />
                <g {...dragB} style={{ cursor: "ew-resize" }}>
                  <rect x={bSvg - 10} y={PAD_T} width={20} height={PLOT_H} fill="transparent" />
                  <circle cx={bSvg} cy={baseLineY} r={7} fill={ORANGE} stroke="white" strokeWidth={1.5} />
                  <text x={bSvg} y={baseLineY + 16} fontSize={10} textAnchor="middle" fill={ORANGE} fontWeight="bold">b</text>
                </g>
                {/* F(a) 水平线 */}
                {(() => {
                  const fa = getCDF(loAB);
                  const fb = getCDF(hiAB);
                  const sFa = yToSvg(fa, 1);
                  const sFb = yToSvg(fb, 1);
                  const sA = xToSvg(loAB, xMin, xMax);
                  const sB = xToSvg(hiAB, xMin, xMax);
                  return (
                    <>
                      <line x1={PAD_L} y1={sFa} x2={sA} y2={sFa} stroke={GREEN} strokeWidth={1} strokeDasharray="3 2" opacity={0.7} />
                      <line x1={PAD_L} y1={sFb} x2={sB} y2={sFb} stroke={ORANGE} strokeWidth={1} strokeDasharray="3 2" opacity={0.7} />
                      <text x={PAD_L - 4} y={sFa + 4} fontSize={8.5} textAnchor="end" fill={GREEN} fontWeight="bold">{fa.toFixed(3)}</text>
                      <text x={PAD_L - 4} y={sFb + 4} fontSize={8.5} textAnchor="end" fill={ORANGE} fontWeight="bold">{fb.toFixed(3)}</text>
                      {/* 标注 F(b)-F(a) 的双向箭头 */}
                      <line x1={PAD_L - 14} y1={sFa} x2={PAD_L - 14} y2={sFb} stroke={ACCENT} strokeWidth={1.5} markerStart="url(#arrowUp)" markerEnd="url(#arrowDown)" />
                    </>
                  );
                })()}
              </>
            )}

            {/* Arrow marker defs */}
            <defs>
              <marker id="arrowUp" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M3,6 L0,3 L6,3 Z" fill={ACCENT} />
              </marker>
              <marker id="arrowDown" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
                <path d="M3,0 L0,3 L6,3 Z" fill={ACCENT} />
              </marker>
            </defs>
          </>
        )}

        {/* x 轴刻度 */}
        {xTicks.map((v) => {
          const sx = xToSvg(v, xMin, xMax);
          return (
            <g key={v}>
              <line x1={sx} y1={baseLineY} x2={sx} y2={baseLineY + 4} stroke={INK_SOFT} strokeWidth={0.8} />
              <text x={sx} y={baseLineY + 13} fontSize={9} textAnchor="middle" fill={INK_SOFT}>
                {distType === "binomial" ? v : v.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* y 轴标签 */}
        <text
          x={PAD_L - 22}
          y={PAD_T + PLOT_H / 2}
          fontSize={9}
          fill={INK_SOFT}
          textAnchor="middle"
          transform={`rotate(-90, ${PAD_L - 22}, ${PAD_T + PLOT_H / 2})`}
        >
          {viewMode === "pdf" ? (distType === "binomial" ? "P(X=k)" : "f(x)") : "F(x)"}
        </text>

        {/* 分布名标签 */}
        <text x={PAD_L + PLOT_W - 4} y={PAD_T + 12} fontSize={10} textAnchor="end" fill={ACCENT} fontWeight="bold">
          {distName}
        </text>
      </svg>

      {/* ── 结果展示面板 ─────────────────────────────────────── */}
      {!showInterval ? (
        /* 单滑块：F(x) 面板 */
        <div
          className="rounded-lg border-2 p-4 space-y-2"
          style={{ borderColor: ACCENT, background: ACCENT_LIGHT }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[13px] font-bold text-[var(--ink)]">
              F(x) = P(X ≤ x)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[var(--ink-soft)]">
                x =
              </span>
              <span className="rounded-md bg-white px-2 py-0.5 text-[13px] font-mono font-bold" style={{ color: ACCENT }}>
                {distType === "binomial" ? xVal.toFixed(0) : xVal.toFixed(3)}
              </span>
              <span className="text-[18px] font-mono text-[var(--ink-soft)]">→</span>
              <span className="rounded-md bg-white px-3 py-0.5 text-[18px] font-mono font-extrabold" style={{ color: ACCENT }}>
                {fmt4(fxVal)}
              </span>
            </div>
          </div>
          <p className="text-[12px] text-[var(--ink-soft)] leading-relaxed">
            {distType === "binomial" ? (
              <>
                P(X ≤ {Math.floor(xVal)}) = 累加 P(X=0) + P(X=1) + … + P(X={Math.floor(xVal)})，
                即左侧蓝色柱子概率之和 = <b style={{ color: ACCENT }}>{fmt4(fxVal)}</b>
              </>
            ) : (
              <>
                左侧阴影面积 =
                {distType === "normal" ? ` ∫₋∞^{${xVal.toFixed(2)}} f(t) dt` : ` ∫₀^{${xVal.toFixed(2)}} f(t) dt`}
                {" = "}<b style={{ color: ACCENT }}>{fmt4(fxVal)}</b>
              </>
            )}
          </p>
          {/* 进度条 */}
          <div className="h-4 w-full rounded-full bg-white overflow-hidden border border-[var(--line)]">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{ width: `${fxVal * 100}%`, background: ACCENT }}
            />
          </div>
          <div className="text-center text-[11px] text-[var(--ink-soft)]">
            累积概率 {(fxVal * 100).toFixed(2)}%
          </div>
        </div>
      ) : (
        /* 区间模式：P(a≤X≤b) 面板 */
        <div
          className="rounded-lg border-2 p-4 space-y-2"
          style={{ borderColor: ORANGE, background: `${ORANGE}15` }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[13px] font-bold text-[var(--ink)]">
              P({distType === "binomial" ? "a≤X≤b" : "a≤X≤b"}) = F(b) − F(a{distType === "binomial" ? "−" : ""})
            </span>
            <span className="rounded-md bg-white px-3 py-0.5 text-[18px] font-mono font-extrabold" style={{ color: ORANGE }}>
              {fmt4(intervalProb)}
            </span>
          </div>
          {/* a, b 数值 */}
          <div className="flex gap-4 flex-wrap text-[12px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: GREEN }} />
              <span className="text-[var(--ink-soft)]">a =</span>
              <b className="font-mono" style={{ color: GREEN }}>{distType === "binomial" ? loAB.toFixed(0) : loAB.toFixed(3)}</b>
              <span className="text-[var(--ink-soft)]"> → F(a) =</span>
              <b className="font-mono" style={{ color: GREEN }}>{fmt4(getCDF(loAB))}</b>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: ORANGE }} />
              <span className="text-[var(--ink-soft)]">b =</span>
              <b className="font-mono" style={{ color: ORANGE }}>{distType === "binomial" ? hiAB.toFixed(0) : hiAB.toFixed(3)}</b>
              <span className="text-[var(--ink-soft)]"> → F(b) =</span>
              <b className="font-mono" style={{ color: ORANGE }}>{fmt4(getCDF(hiAB))}</b>
            </div>
          </div>
          <p className="text-[12px] text-[var(--ink-soft)]">
            P(a≤X≤b) = F(b) − F(a{distType === "binomial" ? "⁻" : ""}) ={" "}
            <b style={{ color: ORANGE }}>{fmt4(getCDF(hiAB))}</b>{" "}−{" "}
            <b style={{ color: GREEN }}>{fmt4(getCDF(loAB))}</b>{" "}={" "}
            <b style={{ color: ORANGE }}>{fmt4(intervalProb)}</b>
          </p>
          {/* 进度条 */}
          <div className="h-4 w-full rounded-full bg-white overflow-hidden border border-[var(--line)]">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{ width: `${intervalProb * 100}%`, background: ORANGE }}
            />
          </div>
          <div className="text-center text-[11px] text-[var(--ink-soft)]">
            区间概率 {(intervalProb * 100).toFixed(2)}%
          </div>
        </div>
      )}

      {/* ── 关键性质说明 ─────────────────────────────────────── */}
      <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2.5 text-[12px] text-[var(--ink-soft)] leading-relaxed">
        <span className="font-semibold text-[var(--ink)]">分布函数的核心性质：</span>
        <span className="ml-1">
          ① F(−∞)=0，F(+∞)=1；② F(x) 单调不减；③ 右连续 F(x⁺)=F(x)；
          {distType === "binomial"
            ? " 离散型在整数处有跳跃，P(X=k)=F(k)−F(k−1)。"
            : " 连续型 P(X=x)=0，F(x)=∫f(t)dt，区间概率=面积差。"}
        </span>
        <span className="ml-1 block mt-1">
          {viewMode === "pdf"
            ? "拖动竖线观察左侧阴影面积（即 F(x)）实时变化；开启「区间模式」可计算 P(a≤X≤b)。"
            : "切换到 CDF 视图可看到 F(x) 曲线，交叉点的纵坐标即为累积概率值。"}
        </span>
      </div>

      {/* ── 数据摘要卡片 ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-center">
        {[
          {
            label: "分布",
            val: distName,
            color: ACCENT,
            bg: ACCENT_LIGHT,
          },
          {
            label: "F(x) 值",
            val: fmt4(fxVal),
            color: ACCENT,
            bg: ACCENT_LIGHT,
          },
          {
            label: "1 − F(x)",
            val: fmt4(1 - fxVal),
            color: INK,
            bg: BG_MUTED,
          },
          {
            label: showInterval ? "区间概率" : "当前 x",
            val: showInterval
              ? fmt4(intervalProb)
              : (distType === "binomial" ? Math.floor(xVal).toFixed(0) : xVal.toFixed(3)),
            color: showInterval ? ORANGE : GREEN,
            bg: showInterval ? `${ORANGE}15` : `${GREEN}15`,
          },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className="rounded-lg p-2.5" style={{ background: bg }}>
            <div className="text-[10px] text-[var(--ink-soft)]">{label}</div>
            <div className="text-[14px] font-extrabold font-mono mt-0.5" style={{ color }}>
              {val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
