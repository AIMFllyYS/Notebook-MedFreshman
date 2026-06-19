// AI 工具系统（单一真相源）：定义 + 服务端执行器。
// 注意：工具"声明"（发给模型）与"执行"（runTool）必须同名同源，避免历史上的
// camelCase / snake_case 不匹配导致工具调用全部命中"未知工具"。
import type { ToolDefinition } from "@/lib/types/tools";
import {
  getOutlineText,
  locateSection,
  readContentMarkdown,
  searchNotes,
} from "@/lib/content/loader";
import { runWebSearchDetailed } from "@/lib/ai/webSearch";

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
        "获取整门课程的章节大纲（全部章与小节标题及摘要）。需要了解课程全貌、各章关系，或把某知识点定位到哪一小节时调用。",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  getSection: {
    type: "function",
    function: {
      name: "getSection",
      description: "按小节 id 获取任意小节的完整笔记正文，用于跨小节讲解或对比（不要凭记忆复述教材）。",
      parameters: {
        type: "object",
        properties: {
          sectionId: { type: "string", description: '小节 id，例如 "1.4"' },
        },
        required: ["sectionId"],
      },
    },
  },
  searchNotes: {
    type: "function",
    function: {
      name: "searchNotes",
      description: "在全书笔记中按关键词检索，返回若干带上下文的相关片段。不确定教材是否讲过某点时先检索。",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "检索关键词，如 '贝叶斯公式'" },
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
};

/** 取本次请求要启用的工具定义。enableSearch 控制是否暴露 webSearch；disabled 来自用户设置。 */
export function getToolDefs(opts: { enableSearch: boolean; disabled?: string[] }): ToolDefinition[] {
  const names = ["getCurrentPage", "getOutline", "getSection", "searchNotes"];
  if (opts.enableSearch) names.push("webSearch");
  const disabled = new Set(opts.disabled ?? []);
  return names.filter((n) => !disabled.has(n)).map((n) => ALL_TOOLS[n]);
}

function currentPagePayload(ctx: ToolContext): string {
  const md = readContentMarkdown(ctx.subjectId, ctx.categoryId, ctx.itemId);
  const loc = ctx.categoryId === "detail" ? locateSection(ctx.itemId) : undefined;
  const title = loc
    ? `第${loc.chapter.number}章 ${loc.chapter.title} / ${loc.section.id} ${loc.section.title}`
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
      return { content: getOutlineText() };
    case "getSection": {
      const sid = String(args.sectionId ?? "");
      const loc = locateSection(sid);
      if (!loc) return { content: `未找到小节 ${sid}。可调用 getOutline 查看有效的小节 id。` };
      const md = readContentMarkdown(ctx.subjectId, "detail", sid);
      const title = `第${loc.chapter.number}章 ${loc.chapter.title} / ${loc.section.id} ${loc.section.title}`;
      return { content: md ? `【${title}】\n\n${md}` : `【${title}】该小节正文尚未生成（占位）。` };
    }
    case "searchNotes": {
      const hits = searchNotes(String(args.query ?? ""));
      if (!hits.length) return { content: "未检索到相关内容（可能对应小节尚未生成详细笔记）。" };
      return { content: hits.map((h) => `[${h.title}] …${h.snippet}…`).join("\n\n") };
    }
    case "webSearch": {
      const r = await runWebSearchDetailed(String(args.query ?? ""), Number(args.numResults) || 5);
      return { content: r.content, meta: { sources: r.sources, cacheHit: r.cacheHit } };
    }
    default:
      return { content: `未知工具：${name}` };
  }
}
