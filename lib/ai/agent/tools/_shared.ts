import type { Skill } from "@/lib/types/skill";
import type { AcademicYearId } from "@/lib/constants/academic-year";
import type { TextToolOutput } from "@/lib/ai/agent/tools/_types";

export const IMAGE_SEARCH_MAX_TOTAL = 20;
export const MAX_TOOL_STEPS = 6;
/** 第 6 步仍返回 tool-calls、没有第 7 次 LLM 消化时下发给用户。 */
export const TOOL_STEP_LIMIT_INFO =
  "本次达到了工具调用上限，讲解可能不完整，可以再问一次让我继续。";

export interface StudyToolContext {
  subjectId: string;
  categoryId: string;
  itemId: string;
  /** 本次请求携带的全部技能（含正文），供 useSkill 按名取用。 */
  skills: Skill[];
  /** 当前 UI 学年。getOutline / searchNotes 默认只搜该学年，crossYear 可放开。 */
  academicYear: AcademicYearId;
  /** 发起本次对话时选中的模型 id（透传给 renderInteractive / generateImage 的前端卡片）。 */
  modelId?: string;
  /** 生图模式下当前模型不支持 HTML 交互生成的提示。 */
  artifactUnsupportedReason?: string;
}

/** 跨工具轮次的可变状态（同一请求内共享）。 */
export interface StudyToolRuntime {
  imageSearchFetchedCount: number;
  loadedContextKeys: Set<string>;
}

export function createToolRuntime(): StudyToolRuntime {
  return { imageSearchFetchedCount: 0, loadedContextKeys: new Set() };
}

export function normalizeContextKeyPart(value: unknown): string {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** 同一 contextKey 在本次对话工具链中已注入过 → 只回「已加载」提示，避免重复展开全文。 */
export function dedupeByContextKey<T extends TextToolOutput & { contextKey?: string; deduped?: boolean }>(
  runtime: StudyToolRuntime,
  toolName: string,
  output: T,
): T {
  if (!output.contextKey) return output;
  if (runtime.loadedContextKeys.has(output.contextKey)) {
    return {
      ...output,
      deduped: true,
      text: `【上下文已加载】${toolName} 的上下文 ${output.contextKey} 已在本次对话工具链中注入过，请引用前文已加载内容，不要重复展开全文。`,
    };
  }
  runtime.loadedContextKeys.add(output.contextKey);
  return output;
}

/** toModelOutput 只回灌 text（必须以内联 lambda 形式传入，预先定型的函数会破坏 tool() 的 OUTPUT 推断）。 */
export const toText = (output: TextToolOutput) => ({ type: "text" as const, value: output.text });

export function menuSkillNamesOf(skills: Skill[]): string[] {
  return skills.filter((s) => !s.pinned).map((s) => s.name).filter(Boolean);
}
