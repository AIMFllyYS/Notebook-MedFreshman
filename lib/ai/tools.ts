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
import { runWebSearchDetailed, runImageSearch } from "@/lib/ai/webSearch";

export interface ToolContext {
  subjectId: string;
  categoryId: string;
  itemId: string;
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
        "（暂未上线）生成 SVG 矢量示意图。当前此工具不可用，请直接在回复中使用 <SvgDiagram> 标签手动编写 SVG 内容。简单函数图像请使用 ::plot 指令。",
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
};

/** 取本次请求要启用的工具定义。enableSearch 控制是否暴露 webSearch/imageSearch；disabled 来自用户设置。 */
export function getToolDefs(opts: { enableSearch: boolean; disabled?: string[] }): ToolDefinition[] {
  const names = ["getCurrentPage", "getOutline", "getSection", "searchNotes", "renderInteractive", "drawDiagram"];
  if (opts.enableSearch) names.push("webSearch", "imageSearch");
  const disabled = new Set(opts.disabled ?? []);
  return names.filter((n) => !disabled.has(n)).map((n) => ALL_TOOLS[n]);
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
      if (!hits.length) return { content: "未检索到相关内容。可尝试更换关键词，或调用 getOutline 浏览目录。" };
      const lines = hits.map(
        (h) => `[${h.title}] (path: ${h.path})\n…${h.snippet}…`,
      );
      lines.push("\n如需查看完整内容，可调用 getSection(path: \"对应路径\")。");
      return { content: lines.join("\n\n") };
    }

    case "webSearch": {
      const r = await runWebSearchDetailed(String(args.query ?? ""), Number(args.numResults) || 5);
      return { content: r.content, meta: { sources: r.sources, cacheHit: r.cacheHit } };
    }
    case "imageSearch": {
      const r = await runImageSearch(String(args.query ?? ""), Number(args.numResults) || 3);
      return { content: r.content, meta: { sources: r.sources, cacheHit: r.cacheHit } };
    }

    case "drawDiagram":
      return {
        content: 'drawDiagram 工具暂未上线，请勿依赖此工具的输出。你可以直接在回复中使用 <SvgDiagram title="标题" width="400" height="300">SVG内容</SvgDiagram> 标签手动编写 SVG 图形。简单函数图像请使用 ::plot 指令。',
      };

    default:
      return { content: `未知工具：${name}` };
  }
}
