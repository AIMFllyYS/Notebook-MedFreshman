export type SvgHealthReason =
  | 'ok'
  | 'empty'
  | 'no-svg-root'
  | 'no-visible-elements'
  | 'out-of-viewbox';

export interface SvgHealthResult {
  ok: boolean;
  reason: SvgHealthReason;
  visibleElementCount: number;
}

const VISIBLE_TAGS = new Set([
  'circle',
  'ellipse',
  'rect',
  'line',
  'polyline',
  'polygon',
  'path',
  'text',
  'tspan',
  'use',
  'image',
]);

function parseViewBox(svg: Element): { minX: number; minY: number; width: number; height: number } | null {
  const raw = svg.getAttribute('viewBox') ?? svg.getAttribute('viewbox');
  if (!raw) return null;
  const nums = raw.trim().split(/[\s,]+/).map(Number).filter(Number.isFinite);
  if (nums.length !== 4 || nums[2] <= 0 || nums[3] <= 0) return null;
  return { minX: nums[0], minY: nums[1], width: nums[2], height: nums[3] };
}

function numAttr(el: Element, name: string): number | null {
  const raw = el.getAttribute(name);
  if (!raw) return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

function hasPointInsideViewBox(el: Element, viewBox: NonNullable<ReturnType<typeof parseViewBox>>): boolean {
  const maxX = viewBox.minX + viewBox.width;
  const maxY = viewBox.minY + viewBox.height;
  const tag = el.tagName.toLowerCase();
  const points: Array<{ x: number; y: number }> = [];

  if (tag === 'circle' || tag === 'ellipse') {
    const x = numAttr(el, 'cx');
    const y = numAttr(el, 'cy');
    if (x !== null && y !== null) points.push({ x, y });
  } else if (tag === 'rect' || tag === 'image' || tag === 'text' || tag === 'use') {
    const x = numAttr(el, 'x') ?? 0;
    const y = numAttr(el, 'y') ?? 0;
    points.push({ x, y });
  } else if (tag === 'line') {
    const x1 = numAttr(el, 'x1');
    const y1 = numAttr(el, 'y1');
    const x2 = numAttr(el, 'x2');
    const y2 = numAttr(el, 'y2');
    if (x1 !== null && y1 !== null) points.push({ x: x1, y: y1 });
    if (x2 !== null && y2 !== null) points.push({ x: x2, y: y2 });
  } else {
    return true;
  }

  if (points.length === 0) return true;
  return points.some((point) =>
    point.x >= viewBox.minX && point.x <= maxX && point.y >= viewBox.minY && point.y <= maxY,
  );
}

export function analyzeSvgHealth(markup: string): SvgHealthResult {
  const source = markup.trim();
  if (!source) return { ok: false, reason: 'empty', visibleElementCount: 0 };
  if (typeof DOMParser === 'undefined') {
    const visibleElementCount = (source.match(/<(?:circle|ellipse|rect|line|polyline|polygon|path|text|tspan|use|image)\b/gi) ?? []).length;
    return visibleElementCount > 0
      ? { ok: true, reason: 'ok', visibleElementCount }
      : { ok: false, reason: 'no-visible-elements', visibleElementCount: 0 };
  }

  const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return { ok: false, reason: 'no-svg-root', visibleElementCount: 0 };

  const visible = Array.from(svg.querySelectorAll('*')).filter((el) => VISIBLE_TAGS.has(el.tagName.toLowerCase()));
  if (visible.length === 0) return { ok: false, reason: 'no-visible-elements', visibleElementCount: 0 };

  const viewBox = parseViewBox(svg);
  if (viewBox && !visible.some((el) => hasPointInsideViewBox(el, viewBox))) {
    return { ok: false, reason: 'out-of-viewbox', visibleElementCount: visible.length };
  }

  return { ok: true, reason: 'ok', visibleElementCount: visible.length };
}
