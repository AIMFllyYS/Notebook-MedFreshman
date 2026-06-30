import { ensureSvgRoot, normalizeCanvasAttrs, normalizePlotAttrs, normalizeSvgDiagramBlock, SVG_ROOT_RE } from './normalize';
import { diagnosePlotExpression } from './plot';
import type { CanvasBlock, CanvasDiagnostic, PlotSpec } from './types';

export type CanvasRevisionExtractResult =
  | { ok: true; block: CanvasBlock }
  | { ok: false; error: string; rawOutput: string };

const SVG_DIAGRAM_RE = /^<SvgDiagram\b([^>]*)>([\s\S]*?)<\/SvgDiagram>$/i;
function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function finiteNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function compact<T extends Record<string, unknown>>(value: T): T {
  for (const key of Object.keys(value)) {
    if (value[key] === undefined) delete value[key];
  }
  return value;
}

function stripFence(output: string): string {
  const trimmed = output.trim();
  const fenced = trimmed.match(/^```(?:json|canvas|svg|html)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function parseAttrs(rawAttrs: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([A-Za-z_][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(rawAttrs))) {
    attrs[match[1]] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attrs;
}

function parseJsonObject(output: string): unknown {
  const trimmed = stripFence(output);
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start === -1 || end <= start) throw new Error('No JSON object found.');
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

function coercePlotSpec(value: unknown): PlotSpec | null {
  if (!isRecord(value)) return null;
  const fn = text(value.fn);
  if (!fn) return null;
  return compact({
    fn,
    color: text(value.color),
    label: text(value.label),
    samples: finiteNumber(value.samples),
  });
}

function coerceJsonBlock(value: unknown): CanvasBlock | null {
  if (!isRecord(value)) return null;
  const kind = text(value.kind);
  const base = compact({
    title: text(value.title),
    width: finiteNumber(value.width),
    height: finiteNumber(value.height),
  });

  if (kind === 'raw-svg') {
    const source = text(value.source);
    return source ? compact({
      ...base,
      kind,
      source: ensureSvgRoot(source, finiteNumber(value.width), finiteNumber(value.height)),
    }) as CanvasBlock : null;
  }

  if (kind === 'html') {
    const source = text(value.source);
    return source ? compact({ ...base, kind, source }) as CanvasBlock : null;
  }

  if (kind === 'molecule') {
    const source = text(value.source);
    return source ? compact({ ...base, kind, source }) as CanvasBlock : null;
  }

  if (kind === 'plot') {
    const fn = text(value.fn);
    if (!fn) return null;
    return compact({
      ...base,
      kind,
      fn,
      attrs: normalizePlotAttrs(isRecord(value.attrs) ? value.attrs : value),
    }) as CanvasBlock;
  }

  if (kind === 'multi-plot') {
    const plots = Array.isArray(value.plots) ? value.plots.map(coercePlotSpec).filter(Boolean) as PlotSpec[] : [];
    if (plots.length === 0) return null;
    return compact({
      ...base,
      kind,
      attrs: normalizeCanvasAttrs(isRecord(value.attrs) ? value.attrs : value),
      plots,
    }) as CanvasBlock;
  }

  return null;
}

export function extractCanvasRevisionBlock(output: string): CanvasRevisionExtractResult {
  const rawOutput = String(output ?? '');
  const trimmed = stripFence(rawOutput);

  if (SVG_ROOT_RE.test(trimmed)) {
    return { ok: true, block: { kind: 'raw-svg', source: trimmed } };
  }

  const rootedSvg = trimmed.startsWith('<') ? ensureSvgRoot(trimmed) : trimmed;
  if (rootedSvg !== trimmed && SVG_ROOT_RE.test(rootedSvg)) {
    return { ok: true, block: { kind: 'raw-svg', source: rootedSvg } };
  }

  const legacy = trimmed.match(SVG_DIAGRAM_RE);
  if (legacy) {
    return { ok: true, block: normalizeSvgDiagramBlock(parseAttrs(legacy[1]), legacy[2]) };
  }

  try {
    const block = coerceJsonBlock(parseJsonObject(trimmed));
    if (block) return { ok: true, block };
  } catch {
    // Fall through to structured error.
  }

  return {
    ok: false,
    error: 'Model did not return a valid canvas JSON object.',
    rawOutput,
  };
}

export function diagnoseCanvasBlock(block: CanvasBlock): CanvasDiagnostic[] {
  if (block.kind === 'raw-svg') {
    if (!block.source.trim()) {
      return [{ ok: false, reason: 'empty-svg', message: 'Raw SVG source is empty.' }];
    }
    const rootedSvg = ensureSvgRoot(block.source, block.width, block.height).trim();
    if (!SVG_ROOT_RE.test(rootedSvg)) {
      return [{ ok: false, reason: 'incomplete-svg', message: 'Raw SVG must be a complete <svg>...</svg> document.' }];
    }
    return [{ ok: true, reason: 'valid-svg', message: 'Raw SVG looks complete.' }];
  }

  if (block.kind === 'html') {
    return block.source.trim()
      ? [{ ok: true, reason: 'valid-html', message: 'HTML canvas source is present.' }]
      : [{ ok: false, reason: 'empty-html', message: 'HTML canvas source is empty.' }];
  }

  if (block.kind === 'molecule') {
    return block.source.trim()
      ? [{ ok: true, reason: 'valid-molecule', message: 'Molecule source is present.' }]
      : [{ ok: false, reason: 'empty-molecule', message: 'Molecule source is empty.' }];
  }

  if (block.kind === 'plot') {
    const diagnostic = diagnosePlotExpression(block.fn, block.attrs);
    return diagnostic.ok
      ? [{ ok: true, reason: 'valid-plot', message: `Plot expression sampled ${diagnostic.sampledPoints} points.` }]
      : [{ ok: false, reason: diagnostic.reason, message: diagnostic.message, details: { normalizedFn: diagnostic.normalizedFn } }];
  }

  if (block.kind === 'multi-plot') {
    if (block.plots.length === 0) {
      return [{ ok: false, reason: 'empty-plots', message: 'Multi-plot canvas has no plots.' }];
    }
    const failed = block.plots
      .map((plot) => ({ plot, diagnostic: diagnosePlotExpression(plot.fn, block.attrs) }))
      .find((entry) => !entry.diagnostic.ok);
    if (failed && !failed.diagnostic.ok) {
      return [{
        ok: false,
        reason: failed.diagnostic.reason,
        message: failed.diagnostic.message,
        details: { fn: failed.plot.fn, normalizedFn: failed.diagnostic.normalizedFn },
      }];
    }
    return [{ ok: true, reason: 'valid-multi-plot', message: 'All plot expressions sampled successfully.' }];
  }

  return [{ ok: false, reason: 'unknown-kind', message: 'Unknown canvas block kind.' }];
}
