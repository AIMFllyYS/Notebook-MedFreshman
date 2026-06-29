export type PlotDiagnostic =
  | { ok: true; normalizedFn: string; sampledPoints: number }
  | {
      ok: false;
      reason: 'empty-fn' | 'unsupported-syntax' | 'no-finite-samples' | 'empty-path';
      normalizedFn: string;
      message: string;
    };

interface PlotNormalizeOptions {
  mu?: number;
  sigma?: number;
}

interface PlotDiagnoseOptions extends PlotNormalizeOptions {
  xmin?: number;
  xmax?: number;
  samples?: number;
}

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

const LATEX_COMMAND_RE = /\\[A-Za-z]+/;

function splitArgs(value: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) {
      args.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }

  args.push(value.slice(start).trim());
  return args;
}

function normalPdfExpr(x: string, mu: string, sigma: string): string {
  return `(1/((${sigma})*sqrt(2*pi)))*exp(-(((${x})-(${mu}))^2)/(2*(${sigma})^2))`;
}

export function normalizePlotExpression(expr: string, options: PlotNormalizeOptions = {}): string {
  const mu = String(options.mu ?? 0);
  const sigma = String(options.sigma ?? 1);
  let normalized = (expr ?? '')
    .trim()
    .replace(/\u2212/g, '-')
    .replace(/\bMath\./g, '')
    .replace(/μ/g, mu)
    .replace(/σ/g, sigma);

  normalized = normalized.replace(/\b(?:normal_pdf|gaussian)\s*\(([^()]*(?:\([^)]*\)[^()]*)*)\)/gi, (_full, rawArgs: string) => {
    const [x = 'x', nextMu = '0', nextSigma = '1'] = splitArgs(rawArgs);
    return normalPdfExpr(x, nextMu, nextSigma);
  });

  normalized = normalized.replace(/\bphi\s*\(([^()]*(?:\([^)]*\)[^()]*)*)\)/gi, (_full, rawArg: string) => {
    const [x = 'x'] = splitArgs(rawArg);
    return normalPdfExpr(x, '0', '1');
  });

  return normalized;
}

function compileForDiagnosis(expr: string): (x: number) => number {
  const funcNames = Object.keys(MATH_FUNCS);
  const funcValues = Object.values(MATH_FUNCS);
  const constNames = Object.keys(MATH_CONSTS);
  const constValues = Object.values(MATH_CONSTS);
  const jsExpr = expr
    .replace(/\^/g, '**')
    .replace(/(\d)([a-zA-Z(])/g, '$1*$2')
    .replace(/\)(\d)/g, ')*$1')
    .replace(/\)([a-zA-Z(])/g, ')*$1');

  const fn = new Function(
    'x',
    ...funcNames,
    ...constNames,
    `"use strict"; return (${jsExpr});`,
  );

  return (x: number) => {
    const result = fn(x, ...funcValues, ...constValues);
    return typeof result === 'number' ? result : NaN;
  };
}

export function diagnosePlotExpression(expr: string, options: PlotDiagnoseOptions = {}): PlotDiagnostic {
  const normalizedFn = normalizePlotExpression(expr, options);
  if (!normalizedFn) {
    return {
      ok: false,
      reason: 'empty-fn',
      normalizedFn,
      message: 'Function expression is empty.',
    };
  }

  if (LATEX_COMMAND_RE.test(normalizedFn)) {
    return {
      ok: false,
      reason: 'unsupported-syntax',
      normalizedFn,
      message: 'Function plots do not accept LaTeX syntax. Use plain expressions such as normal_pdf(x,0,1).',
    };
  }

  let fn: (x: number) => number;
  try {
    fn = compileForDiagnosis(normalizedFn);
  } catch {
    return {
      ok: false,
      reason: 'unsupported-syntax',
      normalizedFn,
      message: 'Function expression could not be parsed.',
    };
  }

  const xmin = options.xmin ?? -10;
  const xmax = options.xmax ?? 10;
  const samples = Math.max(2, Math.floor(options.samples ?? 200));
  const dx = (xmax - xmin) / (samples - 1);
  let sampledPoints = 0;

  for (let i = 0; i < samples; i += 1) {
    try {
      const y = fn(xmin + i * dx);
      if (Number.isFinite(y)) sampledPoints += 1;
    } catch {
      return {
        ok: false,
        reason: 'unsupported-syntax',
        normalizedFn,
        message: 'Function expression failed while sampling.',
      };
    }
  }

  if (sampledPoints === 0) {
    return {
      ok: false,
      reason: 'no-finite-samples',
      normalizedFn,
      message: 'Function expression produced no finite sample points.',
    };
  }

  return {
    ok: true,
    normalizedFn,
    sampledPoints,
  };
}
