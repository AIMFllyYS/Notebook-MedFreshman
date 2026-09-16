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
import { createSearchFlashcardsTool } from "@/lib/ai/agent/tools/searchFlashcards/tool";
import { createSearchNoteImagesTool } from "@/lib/ai/agent/tools/searchNoteImages/tool";
import { createWebSearchTool } from "@/lib/ai/agent/tools/webSearch/tool";
import { createImageSearchTool } from "@/lib/ai/agent/tools/imageSearch/tool";
import { createRenderInteractiveTool } from "@/lib/ai/agent/tools/renderInteractive/tool";
import { createDrawDiagramTool } from "@/lib/ai/agent/tools/drawDiagram/tool";
import { createGenerateImageTool } from "@/lib/ai/agent/tools/generateImage/tool";
import { createCreateQuizTool } from "@/lib/ai/agent/tools/createQuiz/tool";
import { createWriteDocumentTool } from "@/lib/ai/agent/tools/writeDocument/tool";
import { createGetArtifactTool } from "@/lib/ai/agent/tools/getArtifact/tool";
import { createUseSkillTool } from "@/lib/ai/agent/tools/useSkill/tool";
import { createProposeMemoryTool } from "@/lib/ai/agent/tools/proposeMemory/tool";
import { createCommitNotesTool } from "@/lib/ai/agent/tools/commitNotes/tool";
import { createCommitFlashcardsTool } from "@/lib/ai/agent/tools/commitFlashcards/tool";
import { createUpdateUserNoteTool } from "@/lib/ai/agent/tools/updateUserNote/tool";
import type { EditingUserNoteContext } from "@/lib/notes/editingUserNote";
import type { ArtifactCatalogItem } from "@/lib/ai/agent/tools/getArtifact/types";

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
  /** 请求携带的演示目录（html 只给 getArtifact，不进 prompt）。始终暴露该工具，避免工具 schema 随有无产物 bust。 */
  artifacts?: ArtifactCatalogItem[];
  /**
   * 记忆闭环第二步：学生确认后才把完整 commit schema 暴露给模型。
   * 未确认时只给 proposeMemory，避免模型直接写笔记/闪卡。
   */
  memoryCommit?: "note" | "flashcards";
  /** 学生从笔记窗打开助教时才暴露 updateUserNote。 */
  editingUserNote?: EditingUserNoteContext;
  /** 窗内笔记 Agent 不暴露演示/生图/长文等重工具。 */
  noteWindowAgent?: boolean;
}

const NOTE_WINDOW_HIDDEN_TOOLS = new Set<StudyToolName>([
  "searchNotes",
  "searchFlashcards",
  "renderInteractive",
  "drawDiagram",
  "generateImage",
  "createQuiz",
  "writeDocument",
  "proposeMemory",
  "commitNotes",
  "commitFlashcards",
]);

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
    searchFlashcards: createSearchFlashcardsTool(ctx, runtime),
    webSearch: createWebSearchTool(runtime),
    imageSearch: createImageSearchTool(runtime),
    searchNoteImages: createSearchNoteImagesTool(ctx, runtime),
    createQuiz: createCreateQuizTool(),
    writeDocument: createWriteDocumentTool(ctx),
    renderInteractive: createRenderInteractiveTool(ctx),
    drawDiagram: createDrawDiagramTool(),
    generateImage: createGenerateImageTool(ctx),
    getArtifact: createGetArtifactTool(opts.artifacts ?? []),
    useSkill: createUseSkillTool(ctx, runtime),
    proposeMemory: createProposeMemoryTool(),
    commitNotes: createCommitNotesTool(),
    commitFlashcards: createCommitFlashcardsTool(),
    updateUserNote: createUpdateUserNoteTool(ctx),
  } satisfies Record<StudyToolName, unknown>;

  // 稳定工具在前；enableSearch / useSkill 易变，追加在末尾，失效范围可解释。
  const names: StudyToolName[] = [
    "getCurrentPage",
    "getOutline",
    "getSection",
    "searchNotes",
    "searchFlashcards",
    "searchNoteImages",
    "renderInteractive",
    "drawDiagram",
    "generateImage",
    "createQuiz",
    "writeDocument",
    "getArtifact",
    "proposeMemory",
    "updateUserNote",
  ];
  if (opts.memoryCommit === "note") names.push("commitNotes");
  if (opts.memoryCommit === "flashcards") names.push("commitFlashcards");
  if (opts.enableSearch) names.push("webSearch", "imageSearch");
  if (menuSkillNames.length > 0) names.push("useSkill");

  const selected: ToolSet = {};
  for (const n of names) {
    if (disabled.has(n)) continue;
    if (opts.noteWindowAgent && NOTE_WINDOW_HIDDEN_TOOLS.has(n)) continue;
    selected[n] = all[n];
  }
  return selected;
}
