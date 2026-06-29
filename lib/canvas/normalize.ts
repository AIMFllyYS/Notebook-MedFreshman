import type { CanvasBlock, CanvasAttrs, PlotAttrs } from './types';

type LegacyProps = Record<string, unknown>;

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function num(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function bool(value: unknown): boolean | undefined {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
}

function baseProps(props: LegacyProps): Pick<CanvasBlock, 'title' | 'width' | 'height'> {
  return {
    title: str(props.title),
    width: num(props.width),
    height: num(props.height),
  };
}

export function normalizePlotAttrs(props: LegacyProps): PlotAttrs {
  return {
    xmin: num(props.xmin),
    xmax: num(props.xmax),
    ymin: num(props.ymin),
    ymax: num(props.ymax),
    label: str(props.label),
    xlabel: str(props.xlabel),
    ylabel: str(props.ylabel),
    color: str(props.color),
    samples: num(props.samples),
    grid: bool(props.grid),
    axes: bool(props.axes),
  };
}

export function normalizeCanvasAttrs(props: LegacyProps): CanvasAttrs {
  return {
    xmin: num(props.xmin),
    xmax: num(props.xmax),
    ymin: num(props.ymin),
    ymax: num(props.ymax),
    xlabel: str(props.xlabel),
    ylabel: str(props.ylabel),
    width: num(props.width),
    height: num(props.height),
    grid: bool(props.grid),
    axes: bool(props.axes),
  };
}

export function normalizeSvgDiagramBlock(props: LegacyProps, childrenText: string): CanvasBlock {
  const mode = str(props.mode)?.toLowerCase() ?? 'raw';
  const source = (childrenText ?? '').trim();
  const common = baseProps(props);

  if (mode === 'molecule') {
    return {
      ...common,
      kind: 'molecule',
      source,
    };
  }

  if (mode === 'math') {
    return {
      ...common,
      kind: 'plot',
      fn: str(props.fn) ?? source,
      attrs: normalizePlotAttrs(props),
    };
  }

  if (mode === 'html') {
    return {
      ...common,
      kind: 'html',
      source,
    };
  }

  return {
    ...common,
    kind: 'raw-svg',
    source,
  };
}
