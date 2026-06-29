import { normalizePlotExpression } from "@/lib/canvas/plot";

/**
 * SVG Canvas utility functions:
 * - Math expression parser (safe, no eval)
 * - Axis tick calculator
 * - SVG path generator from sampled points
 */

// ── Math Expression Parser ──────────────────────────────────────────────────

const MATH_FUNCS: Record<string, (...args: number[]) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  exp: Math.exp,
  log: Math.log,
  ln: Math.log,
  log10: Math.log10,
  log2: Math.log2,
  sqrt: Math.sqrt,
  abs: Math.abs,
  ceil: Math.ceil,
  floor: Math.floor,
  round: Math.round,
  sign: Math.sign,
  pow: Math.pow,
  min: Math.min,
  max: Math.max,
};

const MATH_CONSTS: Record<string, number> = {
  pi: Math.PI,
  PI: Math.PI,
  e: Math.E,
  E: Math.E,
};

/**
 * Compile a math expression string into a function of x.
 * Uses the Function constructor with a controlled scope — only math
 * functions and constants are available, no access to global scope.
 */
export function compileMathExpr(expr: string): (x: number) => number {
  const sanitized = normalizePlotExpression(expr)
    .replace(/\^/g, "**")
    .replace(/(\d)([a-zA-Z(])/g, "$1*$2")  // 2x -> 2*x, 2( -> 2*(
    .replace(/\)(\d)/g, ")*$1")              // )2 -> )*2
    .replace(/\)([a-zA-Z(])/g, ")*$1");      // )x -> )*x, )( -> )*(

  const funcNames = Object.keys(MATH_FUNCS);
  const funcValues = Object.values(MATH_FUNCS);
  const constNames = Object.keys(MATH_CONSTS);
  const constValues = Object.values(MATH_CONSTS);

  try {
    const fn = new Function(
      "x",
      ...funcNames,
      ...constNames,
      `"use strict"; return (${sanitized});`,
    );
    return (x: number) => {
      try {
        const result = fn(x, ...funcValues, ...constValues);
        return typeof result === "number" ? result : NaN;
      } catch {
        return NaN;
      }
    };
  } catch {
    return () => NaN;
  }
}

// ── Axis Tick Calculator ────────────────────────────────────────────────────

export interface TickMark {
  value: number;
  label: string;
}

/**
 * Calculate "nice" tick positions for a given range.
 * Returns 5-10 ticks with clean intervals (1, 2, 5 multiples).
 */
export function calculateTicks(min: number, max: number, maxTicks = 8): TickMark[] {
  const range = max - min;
  if (range <= 0 || !isFinite(range)) return [];

  const roughStep = range / maxTicks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;

  let niceStep: number;
  if (residual <= 1.5) niceStep = 1 * magnitude;
  else if (residual <= 3.5) niceStep = 2 * magnitude;
  else if (residual <= 7.5) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  const start = Math.ceil(min / niceStep) * niceStep;
  const ticks: TickMark[] = [];

  for (let v = start; v <= max + niceStep * 0.01; v += niceStep) {
    const rounded = Math.round(v * 1e12) / 1e12;
    if (rounded >= min && rounded <= max) {
      ticks.push({ value: rounded, label: formatTickLabel(rounded, niceStep) });
    }
  }
  return ticks;
}

function formatTickLabel(value: number, step: number): string {
  if (value === 0) return "0";
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  return value.toFixed(decimals).replace(/\.?0+$/, "");
}

// ── SVG Path Generator ──────────────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

/**
 * Sample a function and generate SVG path data.
 * Breaks the path at discontinuities (large jumps or NaN).
 */
export function sampleFunctionToPath(
  fn: (x: number) => number,
  xMin: number,
  xMax: number,
  samples: number,
  toSvgX: (x: number) => number,
  toSvgY: (y: number) => number,
  yMin: number,
  yMax: number,
): string {
  const dx = (xMax - xMin) / (samples - 1);
  const yRange = yMax - yMin;
  const jumpThreshold = yRange * 2;

  let pathData = "";
  let prevY: number | null = null;
  let inPath = false;

  for (let i = 0; i < samples; i++) {
    const x = xMin + i * dx;
    const y = fn(x);

    if (!isFinite(y) || isNaN(y)) {
      inPath = false;
      prevY = null;
      continue;
    }

    const svgX = toSvgX(x);
    const svgY = toSvgY(y);

    if (prevY !== null && Math.abs(y - prevY) > jumpThreshold) {
      inPath = false;
    }

    if (!inPath) {
      pathData += `M${svgX.toFixed(2)},${svgY.toFixed(2)}`;
      inPath = true;
    } else {
      pathData += `L${svgX.toFixed(2)},${svgY.toFixed(2)}`;
    }

    prevY = y;
  }

  return pathData;
}

/**
 * Auto-range Y axis by sampling the function.
 */
export function autoRangeY(
  fn: (x: number) => number,
  xMin: number,
  xMax: number,
  samples = 200,
): { yMin: number; yMax: number } {
  let min = Infinity;
  let max = -Infinity;
  const dx = (xMax - xMin) / (samples - 1);

  for (let i = 0; i < samples; i++) {
    const x = xMin + i * dx;
    const y = fn(x);
    if (isFinite(y)) {
      if (y < min) min = y;
      if (y > max) max = y;
    }
  }

  if (!isFinite(min) || !isFinite(max)) return { yMin: -1, yMax: 1 };

  const padding = (max - min) * 0.1 || 1;
  return { yMin: min - padding, yMax: max + padding };
}

// ── Color Palette ───────────────────────────────────────────────────────────

const CURVE_COLORS = [
  "var(--md-sys-color-primary)",
  "var(--md-sys-color-tertiary)",
  "var(--md-sys-color-error)",
  "var(--color-formula, #1976d2)",
  "var(--color-success, #2e7d32)",
  "var(--color-warning, #f57c00)",
];

export function getCurveColor(index: number, explicit?: string): string {
  if (explicit) {
    if (CURVE_COLORS.some((c) => c.includes(explicit))) {
      return `var(--md-sys-color-${explicit})`;
    }
    return explicit;
  }
  return CURVE_COLORS[index % CURVE_COLORS.length];
}
