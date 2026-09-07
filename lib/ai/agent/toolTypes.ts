// 工具的输入 / 输出契约（客户端安全：不导入任何服务端模块）。
//
// 服务端 lib/ai/agent/tools/*.ts 用 zod 定义 inputSchema 并断言与此处一致；
// 客户端 ChatMessage 的 UITools 泛型直接引用此处，UI 才能从 `tool-xxx` part 的
// input / output 拿到强类型数据（来源、命中、artifactId 等）。
//
// 约定：每个 output 都有 `text`——这是回灌给模型的唯一内容（tool.toModelOutput），
// 其余字段只给前端展示，避免结构化数据重复计入上下文 token。

import type { WebSearchSource } from "@/lib/types/chat";
import type { QuizQuestion } from "@/lib/quiz/types";
import type { DocumentSpec } from "@/lib/documents/types";

export interface SearchHit {
  title: string;
  path: string;
  snippet: string;
}

export interface TextToolOutput {
  text: string;
}

export interface GetCurrentPageOutput extends TextToolOutput {
  contextKey: string;
  /** 同一 contextKey 在本次对话工具链中已注入过，本次只返回提示。 */
  deduped?: boolean;
}

export interface GetOutlineInput {
  crossYear?: boolean;
}
export interface GetOutlineOutput extends TextToolOutput {
  contextKey: string;
  deduped?: boolean;
}

export interface GetSectionInput {
  path?: string;
  sectionId?: string;
}
export interface GetSectionOutput extends TextToolOutput {
  contextKey?: string;
  title?: string;
  found: boolean;
  deduped?: boolean;
}

export interface SearchNotesInput {
  query: string;
  crossYear?: boolean;
  /** 限定科目 id，如 histology。不传则搜当前学年全部科目。 */
  subjectId?: string;
}
export interface SearchNotesDiagnostics {
  bm25Hits: number;
  vecHits: number;
  mode: string;
  indexBuiltAt?: string;
  ms: number;
  embedError?: string;
}

export interface SearchNotesOutput extends TextToolOutput {
  contextKey?: string;
  hits: SearchHit[];
  deduped?: boolean;
  diagnostics?: SearchNotesDiagnostics;
}

export interface WebSearchInput {
  query: string;
  numResults?: number;
}
export interface WebSearchOutput extends TextToolOutput {
  contextKey?: string;
  sources: WebSearchSource[];
  cacheHit?: boolean;
  deduped?: boolean;
}

export interface ImageSearchInput {
  query: string;
  numResults?: number;
}
export interface ImageSearchOutput extends TextToolOutput {
  contextKey?: string;
  sources: WebSearchSource[];
  provider: "unsplash";
  limitReached?: boolean;
  deduped?: boolean;
}

export interface RenderInteractiveInput {
  title: string;
  prompt: string;
}
export interface RenderInteractiveOutput extends TextToolOutput {
  /** 前端据此独立请求 /api/artifact 流式生成 HTML。 */
  artifactId: string;
  title: string;
  prompt: string;
  /** 发起生成时选中的模型 id，避免后续切换模型污染 artifact 请求。 */
  modelId?: string;
  /** 当前模型不支持 HTML 交互生成时的原因；前端显示且不请求 /api/artifact。 */
  unsupportedReason?: string;
}

export interface DrawDiagramInput {
  title: string;
  description: string;
  type?: "circuit" | "optics" | "field" | "molecule" | "geometry" | "custom";
}
export type DrawDiagramOutput = TextToolOutput;

export interface GenerateImageInput {
  prompt: string;
  title: string;
  size?: "1024x1024" | "960x1280" | "768x1024" | "720x1440" | "720x1280";
  count?: number;
}
export interface GenerateImageOutput extends TextToolOutput {
  /** 前端展示批准卡片，用户批准后独立请求 /api/image-gen。 */
  imageGenId: string;
  prompt: string;
  title: string;
  size: string;
  count: number;
  /** 发起时选中的生图模型 id，批准后必须使用该模型。 */
  modelId?: string;
}

export interface UseSkillInput {
  name: string;
}
export interface UseSkillOutput extends TextToolOutput {
  skill: string;
  found: boolean;
  contextKey?: string;
  deduped?: boolean;
}

// ─── createQuiz：结构化出题，前端用题库组件渲染 ───────────────────────────

/** 模型在工具参数里写的单题（宽松：id / difficulty / points 等可省略，服务端补默认值）。 */
export interface CreateQuizQuestionInput {
  type: QuizQuestion["type"];
  stem: string;
  options?: string[];
  /** 选择题为选项下标（多选为下标数组）；判断题 1=正确 0=错误；主观题为参考答案文本。 */
  answer?: number | number[] | string;
  hint?: string;
  explanation?: string;
  difficulty?: QuizQuestion["difficulty"];
  points?: number;
  label?: string;
  scoring_criteria?: string[];
  reasoning?: string;
  sourceRef?: { path?: string; label?: string };
  passage?: string;
  subQuestions?: QuizQuestion["subQuestions"];
  blanks?: QuizQuestion["blanks"];
  items?: QuizQuestion["items"];
}

export interface CreateQuizInput {
  title: string;
  /** 出题意图：讲解后即时检验 / 针对漏洞诊断 / 用户主动要练习 / 章节小测。 */
  intent?: "check" | "diagnose" | "practice" | "exam";
  questions: CreateQuizQuestionInput[];
}

export interface CreateQuizOutput extends TextToolOutput {
  quizId: string;
  title: string;
  intent: NonNullable<CreateQuizInput["intent"]>;
  /** 已归一化的题目（补齐 id / difficulty / source / points），前端直接交给 QuizQuestion 渲染。 */
  questions: QuizQuestion[];
  /** 被丢弃的非法题目数量（结构不完整），给前端做提示。 */
  droppedCount: number;
}

// ─── searchNoteImages：检索课程笔记中已有的图片 ───────────────────────────

export interface SearchNoteImagesInput {
  query: string;
  crossYear?: boolean;
  subjectId?: string;
  limit?: number;
}

export interface NoteImageHit {
  /** 站内根相对路径，如 /images/anatomy/textbook/p0405_01.png。 */
  src: string;
  alt: string;
  caption: string;
  /** 所在笔记的复合路径，如 anatomy/textbook/ch09-4，可直传 getSection。 */
  path: string;
  subjectId: string;
  categoryId: string;
  itemId: string;
  /** 所在笔记的面包屑标题。 */
  title: string;
  /** 图片前后的正文片段，帮助模型判断是否切题。 */
  context: string;
  score: number;
}

export interface SearchNoteImagesOutput extends TextToolOutput {
  contextKey?: string;
  images: NoteImageHit[];
  deduped?: boolean;
}

// ─── writeDocument：长文档撰写（前端分节流式生成） ───────────────────────

export type WriteDocumentInput = DocumentSpec;

export interface WriteDocumentOutput extends TextToolOutput {
  /** 前端据此独立请求 /api/document 分节生成。 */
  documentId: string;
  spec: DocumentSpec;
  /** 发起时选中的模型 id，避免后续切换模型污染文档请求。 */
  modelId?: string;
  unsupportedReason?: string;
}

/** 供 UIMessage<…, StudyTools> 使用的 UITools 形状（type alias 才能满足 Record 约束）。 */
export type StudyTools = {
  getCurrentPage: { input: Record<string, never>; output: GetCurrentPageOutput };
  getOutline: { input: GetOutlineInput; output: GetOutlineOutput };
  getSection: { input: GetSectionInput; output: GetSectionOutput };
  searchNotes: { input: SearchNotesInput; output: SearchNotesOutput };
  searchNoteImages: { input: SearchNoteImagesInput; output: SearchNoteImagesOutput };
  webSearch: { input: WebSearchInput; output: WebSearchOutput };
  imageSearch: { input: ImageSearchInput; output: ImageSearchOutput };
  renderInteractive: { input: RenderInteractiveInput; output: RenderInteractiveOutput };
  drawDiagram: { input: DrawDiagramInput; output: DrawDiagramOutput };
  generateImage: { input: GenerateImageInput; output: GenerateImageOutput };
  createQuiz: { input: CreateQuizInput; output: CreateQuizOutput };
  writeDocument: { input: WriteDocumentInput; output: WriteDocumentOutput };
  useSkill: { input: UseSkillInput; output: UseSkillOutput };
};

export type StudyToolName = keyof StudyTools;

export const STUDY_TOOL_NAMES: readonly StudyToolName[] = [
  "getCurrentPage",
  "getOutline",
  "getSection",
  "searchNotes",
  "searchNoteImages",
  "webSearch",
  "imageSearch",
  "renderInteractive",
  "drawDiagram",
  "generateImage",
  "createQuiz",
  "writeDocument",
  "useSkill",
];
