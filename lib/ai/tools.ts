// AI 工具定义（OpenAI function-calling 规范）+ 服务端执行器。
// 让模型自行判断何时读取「当前页面 / 全书大纲 / 指定小节 / 全文检索」。
import {
  getOutlineText,
  locateSection,
  readSectionMarkdown,
  searchNotes,
} from "@/lib/content/loader";

export const TOOL_DEFS = [
  {
    type: "function",
    function: {
      name: "get_current_page",
      description:
        "获取用户当前正在阅读的小节内容（所属章、标题与完整笔记正文）。当用户问题中出现'这一节/这页/当前内容/这里/上面这段'等指代当前页面的说法时，应优先调用本工具。",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_outline",
      description:
        "获取整门《概率论与数理统计》课程的章节大纲（全部章与小节的标题及摘要）。当需要了解课程全貌、各章关系，或定位某个知识点位于哪一小节时调用。",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_section",
      description: "按小节 id 获取任意小节的完整笔记正文，用于跨小节讲解或对比。",
      parameters: {
        type: "object",
        properties: {
          sectionId: { type: "string", description: '小节 id，例如 "1.4"' },
        },
        required: ["sectionId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_notes",
      description: "在全书笔记中按关键词检索，返回若干带上下文的相关片段。",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "检索关键词，如 '贝叶斯公式'" },
        },
        required: ["query"],
      },
    },
  },
] as const;

export interface ToolContext {
  chapterId: string;
  sectionId: string;
}

function sectionPayload(chapterId: string, sectionId: string): string {
  const loc = locateSection(sectionId);
  const md = readSectionMarkdown(chapterId, sectionId);
  const title = loc ? `第${loc.chapter.number}章 ${loc.chapter.title} / ${loc.section.id} ${loc.section.title}` : sectionId;
  if (!md) {
    return `【${title}】该小节的详细笔记尚未生成（占位状态）。可结合标题与课程大纲作答，并说明该节内容正在完善。`;
  }
  return `【${title}】\n\n${md}`;
}

export async function runTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<string> {
  switch (name) {
    case "get_current_page":
      return sectionPayload(ctx.chapterId, ctx.sectionId);
    case "get_outline":
      return getOutlineText();
    case "get_section": {
      const sid = String(args.sectionId ?? "");
      const loc = locateSection(sid);
      if (!loc) return `未找到小节 ${sid}。可调用 get_outline 查看有效的小节 id。`;
      return sectionPayload(loc.chapter.id, sid);
    }
    case "search_notes": {
      const hits = searchNotes(String(args.query ?? ""));
      if (!hits.length) return "未检索到相关内容（可能对应小节尚未生成详细笔记）。";
      return hits
        .map((h) => `[${h.title}] …${h.snippet}…`)
        .join("\n\n");
    }
    default:
      return `未知工具：${name}`;
  }
}
