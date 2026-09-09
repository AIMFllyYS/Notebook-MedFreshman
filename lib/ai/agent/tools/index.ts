/**
 * Agent 工具注册表的客户端入口。
 * 只导出类型、展示元数据与结果卡片；不要从这里 re-export tool.ts / server.ts。
 */

export type { TextToolOutput } from "@/lib/ai/agent/tools/_types";
export type { GetCurrentPageInput, GetCurrentPageOutput } from "@/lib/ai/agent/tools/getCurrentPage/types";
export type { GetOutlineInput, GetOutlineOutput } from "@/lib/ai/agent/tools/getOutline/types";
export type { GetSectionInput, GetSectionOutput } from "@/lib/ai/agent/tools/getSection/types";
export type { SearchHit, SearchNotesDiagnostics, SearchNotesInput, SearchNotesOutput } from "@/lib/ai/agent/tools/searchNotes/types";
export type { NoteImageHit, SearchNoteImagesInput, SearchNoteImagesOutput } from "@/lib/ai/agent/tools/searchNoteImages/types";
export type { WebSearchInput, WebSearchOutput } from "@/lib/ai/agent/tools/webSearch/types";
export type { ImageSearchInput, ImageSearchOutput } from "@/lib/ai/agent/tools/imageSearch/types";
export type { RenderInteractiveInput, RenderInteractiveOutput } from "@/lib/ai/agent/tools/renderInteractive/types";
export type { DrawDiagramInput, DrawDiagramOutput } from "@/lib/ai/agent/tools/drawDiagram/types";
export type { GenerateImageInput, GenerateImageOutput } from "@/lib/ai/agent/tools/generateImage/types";
export type { CreateQuizInput, CreateQuizOutput, CreateQuizQuestionInput } from "@/lib/ai/agent/tools/createQuiz/types";
export type { WriteDocumentInput, WriteDocumentOutput } from "@/lib/ai/agent/tools/writeDocument/types";
export type { UseSkillInput, UseSkillOutput } from "@/lib/ai/agent/tools/useSkill/types";
export type { StudyTools, StudyToolName } from "@/lib/ai/agent/tools/names";
export { STUDY_TOOL_NAMES } from "@/lib/ai/agent/tools/names";
export type {
  ResultCardContext,
  ResultCardProps,
  ToolIconKind,
  ToolModule,
  ToolPart,
  ToolPresentation,
} from "@/lib/ai/agent/tools/registry";
