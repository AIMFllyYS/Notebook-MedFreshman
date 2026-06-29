"use client";

import { CanvasBlockRenderer } from "./CanvasBlockRenderer";
import { normalizeSvgDiagramBlock } from "@/lib/canvas/normalize";

export type DiagramMode = "raw" | "math" | "molecule" | "html";

const MODES: DiagramMode[] = ["raw", "math", "molecule", "html"];

export function isDiagramMode(v: unknown): v is DiagramMode {
  return typeof v === "string" && (MODES as string[]).includes(v);
}

interface DiagramCanvasProps {
  mode: DiagramMode;
  /** 标签体：SVG 源 / SMILES / HTML（math 模式不用，函数从 attrs.fn 取）。 */
  content: string;
  title?: string;
  width?: number;
  height?: number;
  /** 原始标签属性，math 模式透传给 PlotDirective（fn/xmin/xmax/label/grid…）。 */
  attrs?: Record<string, unknown>;
  repairContext?: {
    modelId?: string;
    topic?: string;
  };
  onRepairContent?: (svg: string) => void;
}

/**
 * 统一画布壳：按 mode 把 AI 内容路由到合适的渲染体，四种能力同壳：
 *  - raw      自由 SVG（含投影式模板）          → RawSvgViewer
 *  - math     精准函数图                         → PlotDirective(SvgCanvas + FunctionPlot)
 *  - molecule SMILES 结构式                      → MoleculeRenderer(RDKit → RawSvgViewer)
 *  - html     沙箱 HTML                          → HtmlCanvasLayer(iframe)
 *
 * 控件（半透明/缩放/全屏）、错误降级各由具体体/上层 VizErrorBoundary 负责，本壳只做路由 + 标题。
 */
export function DiagramCanvas({ mode, content, title, width, height, attrs = {}, repairContext, onRepairContent }: DiagramCanvasProps) {
  void repairContext;
  void onRepairContent;
  const block = normalizeSvgDiagramBlock({ ...attrs, mode, title, width, height }, content);

  return (
    <div className="diagram-canvas">
      <CanvasBlockRenderer block={block} />
    </div>
  );
}

export default DiagramCanvas;
