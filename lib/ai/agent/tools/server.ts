// Agent 工具服务端入口。只允许 studyAgent 与 API route 引用。
// 不要从客户端（components、lib/hooks、tools/index）导入本文件或各工具的 tool.ts。

import type { ToolSet } from "ai";
import type { StudyToolName } from "@/lib/ai/agent/tools/names";
import {
  menuSkillNamesOf,
  type StudyToolContext,
  type StudyToolRuntime,
} from "@/lib/ai/agent/tools/_shared";
import { createGetCurrentPageTool } from "@/lib/ai/agent/tools/getCurrentPage/tool";
import { createGetOutlineTool } from "@/lib/ai/agent/tools/getOutline/tool";
import { createGetSectionTool } from "@/lib/ai/agent/tools/getSection/tool";
import { createSearchNotesTool } from "@/lib/ai/agent/tools/searchNotes/tool";
import { createSearchNoteImagesTool } from "@/lib/ai/agent/tools/searchNoteImages/tool";
import { createWebSearchTool } from "@/lib/ai/agent/tools/webSearch/tool";
import { createImageSearchTool } from "@/lib/ai/agent/tools/imageSearch/tool";
import { createRenderInteractiveTool } from "@/lib/ai/agent/tools/renderInteractive/tool";
import { createDrawDiagramTool } from "@/lib/ai/agent/tools/drawDiagram/tool";
import { createGenerateImageTool } from "@/lib/ai/agent/tools/generateImage/tool";
import { createCreateQuizTool } from "@/lib/ai/agent/tools/createQuiz/tool";
import { createWriteDocumentTool } from "@/lib/ai/agent/tools/writeDocument/tool";
import { createUseSkillTool } from "@/lib/ai/agent/tools/useSkill/tool";

export {
  IMAGE_SEARCH_MAX_TOTAL,
  MAX_TOOL_STEPS,
  TOOL_STEP_LIMIT_INFO,
  createToolRuntime,
  type StudyToolContext,
  type StudyToolRuntime,
} from "@/lib/ai/agent/tools/_shared";

export interface BuildStudyToolsOptions {
  enableSearch: boolean;
  disabled?: string[];
}

/**
 * 构建本次请求的工具集。
 * - enableSearch 控制是否暴露 webSearch/imageSearch；
 * - disabled 来自用户设置；
 * - useSkill 只在有可调用技能时暴露，技能名作为 enum（提升选名准确度，且会话内稳定利于 prefix 缓存）。
 */
export function buildStudyTools(
  ctx: StudyToolContext,
  runtime: StudyToolRuntime,
  opts: BuildStudyToolsOptions,
): ToolSet {
  const disabled = new Set(opts.disabled ?? []);
  const menuSkillNames = menuSkillNamesOf(ctx.skills);

  const all = {
    getCurrentPage: createGetCurrentPageTool(ctx, runtime),
    getOutline: createGetOutlineTool(ctx, runtime),
    getSection: createGetSectionTool(ctx, runtime),
    searchNotes: createSearchNotesTool(ctx, runtime),
    webSearch: createWebSearchTool(runtime),
    imageSearch: createImageSearchTool(runtime),
    searchNoteImages: createSearchNoteImagesTool(ctx, runtime),
    createQuiz: createCreateQuizTool(),
    writeDocument: createWriteDocumentTool(ctx),
    renderInteractive: createRenderInteractiveTool(ctx),
    drawDiagram: createDrawDiagramTool(),
    generateImage: createGenerateImageTool(ctx),
    useSkill: createUseSkillTool(ctx, runtime),
  } satisfies Record<StudyToolName, unknown>;

  const names: StudyToolName[] = [
    "getCurrentPage",
    "getOutline",
    "getSection",
    "searchNotes",
    "searchNoteImages",
    "renderInteractive",
    "drawDiagram",
    "generateImage",
    "createQuiz",
    "writeDocument",
  ];
  if (opts.enableSearch) names.push("webSearch", "imageSearch");
  if (menuSkillNames.length > 0) names.push("useSkill");

  const selected: ToolSet = {};
  for (const n of names) {
    if (!disabled.has(n)) selected[n] = all[n];
  }
  return selected;
}
