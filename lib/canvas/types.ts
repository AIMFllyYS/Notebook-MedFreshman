export type CanvasBlockKind = 'raw-svg' | 'plot' | 'multi-plot' | 'molecule' | 'html';

export interface CanvasBlockBase {
  kind: CanvasBlockKind;
  title?: string;
  width?: number;
  height?: number;
}

export interface PlotAttrs {
  xmin?: number;
  xmax?: number;
  ymin?: number;
  ymax?: number;
  label?: string;
  xlabel?: string;
  ylabel?: string;
  color?: string;
  samples?: number;
  grid?: boolean;
  axes?: boolean;
}

export interface CanvasAttrs {
  xmin?: number;
  xmax?: number;
  ymin?: number;
  ymax?: number;
  xlabel?: string;
  ylabel?: string;
  width?: number;
  height?: number;
  grid?: boolean;
  axes?: boolean;
}

export interface PlotSpec {
  fn: string;
  color?: string;
  label?: string;
  samples?: number;
}

export interface RawSvgCanvasBlock extends CanvasBlockBase {
  kind: 'raw-svg';
  source: string;
}

export interface PlotCanvasBlock extends CanvasBlockBase {
  kind: 'plot';
  fn: string;
  attrs: PlotAttrs;
}

export interface MultiPlotCanvasBlock extends CanvasBlockBase {
  kind: 'multi-plot';
  attrs: CanvasAttrs;
  plots: PlotSpec[];
}

export interface MoleculeCanvasBlock extends CanvasBlockBase {
  kind: 'molecule';
  source: string;
}

export interface HtmlCanvasBlock extends CanvasBlockBase {
  kind: 'html';
  source: string;
}

export type CanvasBlock =
  | RawSvgCanvasBlock
  | PlotCanvasBlock
  | MultiPlotCanvasBlock
  | MoleculeCanvasBlock
  | HtmlCanvasBlock;

export interface CanvasDiagnostic {
  ok: boolean;
  reason: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface CanvasRevisionRequest {
  block: CanvasBlock;
  instruction: string;
  topic?: string;
  modelId: string;
  customApiGroups?: unknown[];
}

export interface CanvasRevisionResponse {
  block: CanvasBlock;
  diagnostics: CanvasDiagnostic[];
}
