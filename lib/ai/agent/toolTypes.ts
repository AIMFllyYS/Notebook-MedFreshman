/**
 * @public
 * 工具的输入 / 输出契约（客户端安全：不导入任何服务端模块）。
 *
 * 每个工具一个目录：
 * ```
 * lib/ai/agent/tools/<name>/
 *   types.ts  presentation.ts  tool.ts
 * 有卡片时：components/chat/toolCards/<name>Card.tsx
 * ```
 * 13 个目录：getCurrentPage / getOutline / getSection / searchNotes /
 * searchNoteImages / webSearch / imageSearch / renderInteractive / drawDiagram /
 * generateImage / createQuiz / writeDocument / useSkill。
 *
 * 本文件只做兼容旧 import 路径的 re-export（真实类型在各 `types.ts`）。
 * 客户端 ChatMessage 的 UITools 泛型直接引用此处，UI 才能从 `tool-xxx` part 的
 * input / output 拿到强类型数据（来源、命中、artifactId 等）。
 *
 * 新增步骤见 `docs/refer/adding-an-agent-tool.md`。
 * 客户端只从 `tools/index.ts` 取类型 / presentation；卡片在 `components/chat/toolCards/`；
 * `tool.ts` 与 `server.ts` 仅服务端可导入。
 *
 * 约定：每个 output 都有 `text`——这是回灌给模型的唯一内容（tool.toModelOutput），
 * 其余字段只给前端展示，避免结构化数据重复计入上下文 token。
 * `renderInteractive` 这个 id 不得改名（已写入 IndexedDB 聊天历史）。
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
/** @public 兼容旧 import 路径。从 names 取，避免经 index 拉进 ResultCard。 */
export { STUDY_TOOL_NAMES } from "@/lib/ai/agent/tools/names";
