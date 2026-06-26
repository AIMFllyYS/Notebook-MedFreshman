// AI 工具系统（单一真相源）：定义 + 服务端执行器。
// 全科目覆盖：基于 contentTree（非旧 manifest），支持复合路径如 "physics/detail/2.1"。
import type { ToolDefinition } from "@/lib/types/tools";
import {
  getMultiSubjectOutline,
  resolveContentPath,
  findContentItem,
  readContentMarkdown,
  searchAllContent,
} from "@/lib/content/loader";
import { runWebSearchDetailed } from "@/lib/ai/webSearch";
import { searchImages, trackPhotoDownload } from "@/lib/ai/imageSearch";
import type { Skill } from "@/lib/types/skill";
import { CHEM_DRAW_GUIDE } from "@/lib/chemistry/svgTemplates";

export interface ToolContext {
  subjectId: string;
  categoryId: string;
  itemId: string;
  /** 本次请求携带的全部技能（含正文），供 useSkill 按名取用。 */
  skills?: Skill[];
}

/** 工具执行结果：content 回灌给模型；meta 透传给前端展示（如联网来源）。 */
export interface ToolRunResult {
  content: string;
  meta?: Record<string, unknown>;
}

export const ALL_TOOLS: Record<string, ToolDefinition> = {
  getCurrentPage: {
    type: "function",
    function: {
      name: "getCurrentPage",
      description:
        "获取用户当前正在阅读的页面完整正文（含标题、公式、知识点）。当问题出现'这一节/这页/当前/这里/上面这段/这道题'等指代当前页面的说法时，应优先调用。",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  getOutline: {
    type: "function",
    function: {
      name: "getOutline",
      description:
        "获取全部科目的完整课程目录（包括概率论、物理、化学、近代史、毛概的详解/录音/纪要分类）。需要了解课程全貌、各章关系，或把某知识点定位到哪一小节时调用。返回的每个条目后附有复合路径（如 physics/detail/2.1），可直接传给 getSection 获取全文。",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  getSection: {
    type: "function",
    function: {
      name: "getSection",
      description:
        '按路径获取任意科目任意页面的完整笔记正文，用于跨小节或跨科目讲解与对比（不要凭记忆复述教材）。path 格式为 "科目/分类/内容id"，例如 "physics/detail/2.1"、"chemistry/recording/rec-05"。也可只传 sectionId（如 "1.4"），默认读取当前科目的 detail 分类。可先调用 getOutline 查看有效路径。',
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: '复合路径，格式 "科目/分类/内容id"，如 "physics/detail/2.1"、"chemistry/recording/rec-05"。优先使用此参数。',
          },
          sectionId: {
            type: "string",
            description: '向下兼容：纯小节 id（如 "1.4"），默认读取当前科目 detail 分类。优先使用 path 参数。',
          },
        },
        required: [],
      },
    },
  },
  searchNotes: {
    type: "function",
    function: {
      name: "searchNotes",
      description:
        "在全部课程内容（所有科目的详解、录音、纪要）中按关键词检索，返回带上下文的相关片段及其所在位置。不确定教材是否讲过某点时先检索。返回结果的 path 字段可直接传给 getSection 获取完整内容。",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "检索关键词，如 '贝叶斯公式'、'马氏规则'" },
        },
        required: ["query"],
      },
    },
  },
  webSearch: {
    type: "function",
    function: {
      name: "webSearch",
      description:
        "联网搜索互联网实时信息，用于教材之外的最新进展、外部事实核实。使用后须注明来源，且与教材内容区分。",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "搜索关键词，建议用中文" },
          numResults: { type: "number", description: "返回结果数量，默认 5" },
        },
        required: ["query"],
      },
    },
  },
  renderInteractive: {
    type: "function",
    function: {
      name: "renderInteractive",
      description:
        "当一个概念用静态文字难以讲清、且交互能显著提升理解时，调用本工具在后台生成一个可交互的 HTML 演示（例如：可拖动滑块看概率分布随参数变化、物理受力/矢量合成、分子构象翻转/反应机理分步等）。生成后用户可在对话中点击「查看」打开。仅在交互确有必要时调用，不要滥用。",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "演示标题（简短）" },
          prompt: { type: "string", description: "要可视化/讲解的知识点与交互需求的详细描述" },
        },
        required: ["title", "prompt"],
      },
    },
  },
  imageSearch: {
    type: "function",
    function: {
      name: "imageSearch",
      description:
        "搜索互联网图片并返回可嵌入的图片链接。当讲解需要配图（如物理实验装置、化学分子结构、生物组织图等）时调用。返回结果包含图片 URL，可直接以 Markdown 图片语法嵌入回复。",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "图片搜索关键词，如 '高斯面示意图'" },
          numResults: { type: "number", description: "返回图片数量，默认 3" },
        },
        required: ["query"],
      },
    },
  },
  drawDiagram: {
    type: "function",
    function: {
      name: "drawDiagram",
      description:
        "SVG 图形预处理工具：分析图形需求并返回 SVG 编写指南（推荐结构、颜色规范、模板片段）。调用后按指南在回复中编写 <SvgDiagram mode=\"raw\"> 标签输出 SVG 内容。简单函数图像仍优先用 ::plot。",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "图形标题" },
          description: { type: "string", description: "需要绘制的图形的详细描述" },
          type: {
            type: "string",
            description: "图形类型",
            enum: ["circuit", "optics", "field", "molecule", "geometry", "custom"],
          },
        },
        required: ["title", "description"],
      },
    },
  },
  useSkill: {
    type: "function",
    function: {
      name: "useSkill",
      description:
        "调用一个用户上传的「技能」，把它的完整内容加载到上下文作为专门指导。当用户的问题与某技能的名称/描述相关时调用；可用技能见系统提示词中的「可调用的技能库」清单。一次只调用最相关的一个技能，同一技能不要重复调用。",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "要调用的技能名称，必须与技能库清单中的名称完全一致。",
          },
        },
        required: ["name"],
      },
    },
  },
};

/**
 * 取本次请求要启用的工具定义。
 * - enableSearch 控制是否暴露 webSearch/imageSearch；
 * - disabled 来自用户设置；
 * - skillNames 非空时追加 useSkill 工具，并把技能名作为 name 参数的 enum（提升选名准确度，
 *   且在一次会话内稳定、利于上游 prefix 缓存）。
 */
export function getToolDefs(opts: {
  enableSearch: boolean;
  disabled?: string[];
  skillNames?: string[];
}): ToolDefinition[] {
  const names = ["getCurrentPage", "getOutline", "getSection", "searchNotes", "renderInteractive", "drawDiagram"];
  if (opts.enableSearch) names.push("webSearch", "imageSearch");
  const disabled = new Set(opts.disabled ?? []);
  const defs = names.filter((n) => !disabled.has(n)).map((n) => ALL_TOOLS[n]);

  const skillNames = (opts.skillNames ?? []).filter(Boolean);
  if (skillNames.length > 0 && !disabled.has("useSkill")) {
    const base = ALL_TOOLS.useSkill;
    defs.push({
      type: "function",
      function: {
        name: base.function.name,
        description: base.function.description,
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "要调用的技能名称，必须与技能库清单中的名称完全一致。",
              enum: skillNames,
            },
          },
          required: ["name"],
        },
      },
    });
  }
  return defs;
}

function currentPagePayload(ctx: ToolContext): string {
  const md = readContentMarkdown(ctx.subjectId, ctx.categoryId, ctx.itemId);
  const found = findContentItem(ctx.subjectId, ctx.categoryId, ctx.itemId);
  const title = found
    ? `${found.subjectName} > ${found.categoryName} > ${found.parentTitle ? found.parentTitle + " > " : ""}${found.item.title}`
    : `${ctx.subjectId} / ${ctx.categoryId} / ${ctx.itemId}`;
  if (!md) {
    return `【${title}】该页正文尚未生成（占位）。可结合标题与课程大纲作答，并说明该处正在完善。`;
  }
  return `【${title}】\n\n${md}`;
}

export async function runTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<ToolRunResult> {
  switch (name) {
    case "getCurrentPage":
      return { content: currentPagePayload(ctx) };

    case "getOutline":
      return { content: getMultiSubjectOutline() };

    case "getSection": {
      const pathArg = String(args.path ?? "");
      const sectionIdArg = String(args.sectionId ?? "");
      const input = pathArg || sectionIdArg;
      if (!input) {
        return { content: "缺少参数：请传入 path（如 \"physics/detail/2.1\"）或 sectionId（如 \"1.4\"）。可调用 getOutline 查看有效路径。" };
      }
      const resolved = resolveContentPath(input, ctx.subjectId);
      const md = readContentMarkdown(resolved.subjectId, resolved.categoryId, resolved.itemId);
      if (!md) {
        return {
          content: `【${resolved.title}】未找到该页面内容${resolved.found ? "（正文尚未生成）" : "（路径无效）"}。可调用 getOutline 查看有效路径。`,
        };
      }
      return { content: `【${resolved.title}】\n\n${md}` };
    }

    case "searchNotes": {
      const hits = await searchAllContent(String(args.query ?? ""));
      if (!hits.length) return { content: "未检索到相关内容。可尝试更换关键词，或调用 getOutline 浏览目录。", meta: { hits: [] } };
      const lines = hits.map(
        (h) => `[${h.title}] (path: ${h.path})\n…${h.snippet}…`,
      );
      lines.push("\n如需查看完整内容，可调用 getSection(path: \"对应路径\")。");
      return {
        content: lines.join("\n\n"),
        meta: { hits: hits.slice(0, 5).map((h) => ({ title: h.title, path: h.path, snippet: h.snippet })) },
      };
    }

    case "webSearch": {
      const r = await runWebSearchDetailed(String(args.query ?? ""), Number(args.numResults) || 5);
      return { content: r.content, meta: { sources: r.sources, cacheHit: r.cacheHit } };
    }
    case "imageSearch": {
      const results = await searchImages(String(args.query ?? ""), Number(args.numResults) || 3);
      if (!results.length) {
        return {
          content: `未找到「${args.query}」的相关图片。`,
          meta: { sources: [] },
        };
      }
      const content = results
        .map(
          (r, i) =>
            `[${i + 1}] ${r.alt}\n![${r.alt}](${r.url})\nPhoto by [${r.author}](${r.source}) on [Unsplash](https://unsplash.com)`,
        )
        .join("\n\n");
      for (const r of results) {
        trackPhotoDownload(r.downloadLocation);
      }
      return {
        content,
        meta: { sources: results, provider: "unsplash" },
      };
    }

    case "drawDiagram": {
      const type = String(args.type ?? "custom");
      const title = String(args.title ?? "示意图");
      const desc = String(args.description ?? "");
      return { content: buildDiagramGuidance(type, title, desc) };
    }

    case "useSkill": {
      const wanted = String(args.name ?? "").trim();
      const list = ctx.skills ?? [];
      const skill =
        list.find((s) => s.name === wanted) ??
        list.find((s) => s.name.toLowerCase() === wanted.toLowerCase());
      if (!skill) {
        const available = list.map((s) => s.name).join("、") || "（无）";
        return {
          content: `未找到名为「${wanted}」的技能。可用技能：${available}。`,
          meta: { skill: wanted, found: false },
        };
      }
      const head = skill.description ? `${skill.description}\n\n` : "";
      return {
        content: `【技能：${skill.name}】\n${head}${skill.content}`,
        meta: { skill: skill.name, found: true },
      };
    }

    default:
      return { content: `未知工具：${name}` };
  }
}

// ─── drawDiagram 引导壳 ───────────────────────────────────────────────

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
  ...SVG 元素...
</SvgDiagram>

${DIAGRAM_GUIDANCE_COMMON}

${guide.tips}

请在你的下一段回复中直接输出完整的 <SvgDiagram> 标签。`;
}
