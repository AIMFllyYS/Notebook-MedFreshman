/**
 * @public
 * 工具的输入 / 输出契约（客户端安全：不导入任何服务端模块）。
 *
 * 真实定义在 `lib/ai/agent/tools/<name>/types.ts`；本文件只做兼容旧 import 路径的 re-export。
 * 客户端 ChatMessage 的 UITools 泛型直接引用此处，UI 才能从 `tool-xxx` part 的
 * input / output 拿到强类型数据（来源、命中、artifactId 等）。
 *
 * 约定：每个 output 都有 `text`——这是回灌给模型的唯一内容（tool.toModelOutput），
 * 其余字段只给前端展示，避免结构化数据重复计入上下文 token。
 */

export type {
  TextToolOutput,
  GetCurrentPageInput,
  GetCurrentPageOutput,
  GetOutlineInput,
  GetOutlineOutput,
  GetSectionInput,
  GetSectionOutput,
  SearchHit,
  SearchNotesDiagnostics,
  SearchNotesInput,
  SearchNotesOutput,
  NoteImageHit,
  SearchNoteImagesInput,
  SearchNoteImagesOutput,
  WebSearchInput,
  WebSearchOutput,
  ImageSearchInput,
  ImageSearchOutput,
  RenderInteractiveInput,
  RenderInteractiveOutput,
  DrawDiagramInput,
  DrawDiagramOutput,
  GenerateImageInput,
  GenerateImageOutput,
  CreateQuizInput,
  CreateQuizOutput,
  CreateQuizQuestionInput,
  WriteDocumentInput,
  WriteDocumentOutput,
  UseSkillInput,
  UseSkillOutput,
  StudyTools,
  StudyToolName,
} from "@/lib/ai/agent/tools/index";
export { STUDY_TOOL_NAMES } from "@/lib/ai/agent/tools/index";
