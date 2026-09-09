import { tool } from "ai";
import { z } from "zod";
import { CHEM_DRAW_GUIDE } from "@/lib/chemistry/svgTemplates";
import type { DrawDiagramOutput } from "@/lib/ai/agent/tools/drawDiagram/types";
import { toText } from "@/lib/ai/agent/tools/_shared";

const DIAGRAM_GUIDANCE_COMMON = `【颜色规范】
- 线条/文字：currentColor（自动适配主题）
- 强调色：var(--diagram-primary)、var(--diagram-secondary)、var(--diagram-tertiary)
- 错误/警告：var(--diagram-error)
- 填充/背景：none 或 var(--diagram-surface)
- 禁止硬编码 black/white/#000/#fff`;

const TYPE_GUIDANCE: Record<string, { dims: string; tips: string }> = {
  molecule: {
    dims: 'width="400" height="300"',
    tips: CHEM_DRAW_GUIDE,
  },
  circuit: {
    dims: 'width="550" height="350"',
    tips: `【电路元件模板】
- 导线：<line stroke="currentColor" stroke-width="2"/>
- 电阻：锯齿线（6段 zigzag）或矩形
- 电容：两条平行短线（间距5px）
- 电池：一长一短平行线
- 开关：断开线段 + 圆点
- 电流方向：marker-end 箭头
- 节点：<circle r="3" fill="currentColor"/>`,
  },
  optics: {
    dims: 'width="550" height="300"',
    tips: `【光学元件模板】
- 凸透镜：双弧线 + 上下箭头
- 凹透镜：内凹弧线 + 上下反向箭头
- 光线：<line stroke="var(--diagram-primary)"/> + marker-end
- 焦点标记：<circle r="3"/> + "F" 文字
- 虚像/虚光线：stroke-dasharray="5 3"
- 光轴：<line stroke="currentColor" stroke-dasharray="2 4"/>`,
  },
  field: {
    dims: 'width="450" height="400"',
    tips: `【场线模板】
- 电场线：<path d="M... Q..." /> 二次贝塞尔曲线 + marker-end
- 正电荷：<circle fill="var(--diagram-error)"/> + "+" 文字
- 负电荷：<circle fill="var(--diagram-primary)"/> + "−" 文字
- 等势线：<circle fill="none" stroke-dasharray="4 3"/>
- 磁场：用 ⊙（出纸面）和 ⊗（入纸面）表示`,
  },
  geometry: {
    dims: 'width="450" height="400"',
    tips: `【几何模板】
- 顶点标签：<text font-size="14" font-weight="600">A</text>（偏移顶点外侧）
- 边：<line stroke="currentColor" stroke-width="1.5"/>
- 角弧：<path d="M... A..." fill="none"/>（小圆弧）
- 辅助线：stroke-dasharray="4 3" + 较细 stroke-width="1"
- 直角标记：小正方形 <rect width="8" height="8" fill="none"/>
- 长度标注：平行偏移线 + 双箭头 + 数值文字`,
  },
  custom: {
    dims: 'width="500" height="350"',
    tips: `【通用建议】
- 使用 <defs> 定义可复用的 marker（箭头等）
- 文字标注用 <text>，对齐用 text-anchor
- 分组用 <g transform="translate(...)">
- 保持元素间留足间距（≥20px）`,
  },
};

function buildDiagramGuidance(type: string, title: string, desc: string): string {
  const guide = TYPE_GUIDANCE[type] || TYPE_GUIDANCE.custom;
  return `【drawDiagram 编写指南】
类型：${type} | 需求：${desc}

【输出格式】
<SvgDiagram title="${title}" mode="raw" ${guide.dims}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360">
    ...SVG 元素...
  </svg>
</SvgDiagram>

${DIAGRAM_GUIDANCE_COMMON}

${guide.tips}

请在你的下一段回复中直接输出完整的 <SvgDiagram> 标签；mode="raw" 的标签体必须是完整 <svg ...>...</svg>，不要只输出 <path>/<rect>/<text> 等 SVG 子元素。`;
}

export function createDrawDiagramTool() {
  return tool({
    description:
      'SVG 图形预处理工具：分析图形需求并返回 SVG 编写指南（推荐结构、颜色规范、模板片段）。调用后按指南在回复中编写 <SvgDiagram mode="raw">，标签体必须包含完整 <svg ...>...</svg> 根标签。简单函数图像仍优先用 ::plot。',
    inputSchema: z.object({
      title: z.string().describe("图形标题"),
      description: z.string().describe("需要绘制的图形的详细描述"),
      type: z.enum(["circuit", "optics", "field", "molecule", "geometry", "custom"]).optional().describe("图形类型"),
    }),
    execute: async ({ title, description, type }): Promise<DrawDiagramOutput> => ({
      text: buildDiagramGuidance(type ?? "custom", title || "示意图", description),
    }),
    toModelOutput: ({ output }) => toText(output),
  });
}
