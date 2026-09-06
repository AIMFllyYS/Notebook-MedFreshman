// 工具的输入 / 输出契约（客户端安全：不导入任何服务端模块）。
//
// 服务端 lib/ai/agent/tools/*.ts 用 zod 定义 inputSchema 并断言与此处一致；
// 客户端 ChatMessage 的 UITools 泛型直接引用此处，UI 才能从 `tool-xxx` part 的
// input / output 拿到强类型数据（来源、命中、artifactId 等）。
//
// 约定：每个 output 都有 `text`——这是回灌给模型的唯一内容（tool.toModelOutput），
// 其余字段只给前端展示，避免结构化数据重复计入上下文 token。

import type { WebSearchSource } from "@/lib/types/chat";

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
}
export interface SearchNotesOutput extends TextToolOutput {
  contextKey?: string;
  hits: SearchHit[];
  deduped?: boolean;
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

/** 供 UIMessage<…, StudyTools> 使用的 UITools 形状（type alias 才能满足 Record 约束）。 */
export type StudyTools = {
  getCurrentPage: { input: Record<string, never>; output: GetCurrentPageOutput };
  getOutline: { input: GetOutlineInput; output: GetOutlineOutput };
  getSection: { input: GetSectionInput; output: GetSectionOutput };
  searchNotes: { input: SearchNotesInput; output: SearchNotesOutput };
  webSearch: { input: WebSearchInput; output: WebSearchOutput };
  imageSearch: { input: ImageSearchInput; output: ImageSearchOutput };
  renderInteractive: { input: RenderInteractiveInput; output: RenderInteractiveOutput };
  drawDiagram: { input: DrawDiagramInput; output: DrawDiagramOutput };
  generateImage: { input: GenerateImageInput; output: GenerateImageOutput };
  useSkill: { input: UseSkillInput; output: UseSkillOutput };
};

export type StudyToolName = keyof StudyTools;

export const STUDY_TOOL_NAMES: readonly StudyToolName[] = [
  "getCurrentPage",
  "getOutline",
  "getSection",
  "searchNotes",
  "webSearch",
  "imageSearch",
  "renderInteractive",
  "drawDiagram",
  "generateImage",
  "useSkill",
];
