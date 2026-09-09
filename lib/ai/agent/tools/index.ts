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
/** @public 兼容旧 import 路径；设置面板与思考链从 presentations / toolPresentation 取用。 */
export { STUDY_TOOL_NAMES } from "@/lib/ai/agent/tools/names";
export type {
  ResultCardContext,
  ResultCardProps,
  ToolIconKind,
  ToolModule,
  ToolPart,
  ToolPresentation,
} from "@/lib/ai/agent/tools/registry";
/** @public 客户端展示契约入口；ChatSettings / ToolTraceStep 仍走 toolPresentation 兼容层。 */
export { TOOL_PRESENTATION, TOGGLEABLE_TOOLS, getToolPresentation } from "@/lib/ai/agent/tools/presentations";
/** @public 结果卡片注册表。ChatMessage 从 resultCards 取用，避免类型桶误拉组件。 */
export { TOOL_REGISTRY, TOOL_RESULT_CARDS, RESULT_CARD_ORDER } from "@/lib/ai/agent/tools/catalog";
