import type { StudyToolName } from "@/lib/ai/agent/tools/names";

/** 计划模式禁止的写类工具。斜杠 / 加号菜单代理读此集合，不要自己再列一份。 */
export const PLAN_MODE_WRITE_TOOLS = [
  "writeDocument",
  "renderInteractive",
  "drawDiagram",
  "generateImage",
  "createQuiz",
  "proposeMemory",
  "commitNotes",
  "commitFlashcards",
  "updateUserNote",
] as const satisfies readonly StudyToolName[];

export const PLAN_MODE_WRITE_TOOL_SET = new Set<StudyToolName>(PLAN_MODE_WRITE_TOOLS);

export function isPlanModeWriteTool(name: string): boolean {
  return PLAN_MODE_WRITE_TOOL_SET.has(name as StudyToolName);
}

/** 拼进 volatile 段，避免改稳定前缀。模型先写计划正文，不能调写工具。 */
export const PLAN_MODE_RULE =
  "## 计划模式（只读）\n当前为计划模式。你只能阅读与检索（当前页、大纲、节、笔记、闪卡、图片、联网、已有演示、技能），不能调用任何会写入或生成产物的工具（写文档、长文、HTML 演示、生图、出题、沉淀笔记/闪卡、改写笔记等）。\n请先输出一份可执行的计划文档：目标、步骤、将用到的只读材料、风险与待确认项。不要执行写入。";
