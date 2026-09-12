import type { ComponentType } from "react";
import type { ToolUIPart } from "ai";
import type { ChatMessage } from "@/lib/types/chat";
import type { StudyToolName, StudyTools } from "@/lib/ai/agent/tools/names";

export type ToolIconKind = "search" | "file" | "image" | "gallery" | "skill" | "terminal" | "quiz" | "document";

export interface ToolPresentation {
  /** 思考链步骤标题（动词短语）。 */
  label: string;
  /** 设置面板开关名。 */
  settingsLabel: string;
  /** 设置面板描述。 */
  description: string;
  icon: ToolIconKind;
  /** 是否在设置面板中提供开关；imageSearch 随「联网搜索」开关，useSkill 随技能库。 */
  toggleable: boolean;
}

export type ToolPart<N extends StudyToolName> = Extract<ToolUIPart<StudyTools>, { type: `tool-${N}` }>;

export interface ResultCardContext {
  isStreaming: boolean;
}

export interface ResultCardProps<N extends StudyToolName = StudyToolName> {
  part: ToolPart<N>;
  message: ChatMessage;
  isStreaming: boolean;
  ctx: ResultCardContext;
}

export interface ToolModule<N extends StudyToolName = StudyToolName> {
  name: N;
  presentation: ToolPresentation;
  /** 客户端：把该工具 output-available 的 parts 渲染为结果卡片。缺省表示该工具无卡片。 */
  ResultCard?: ComponentType<ResultCardProps<N>>;
  /** 结果卡片去重键（renderInteractive / generateImage 按 artifactId / imageGenId 去重）。 */
  resultKey?: (part: ToolPart<N>) => string | null;
  /** 卡片渲染条件（如 hits.length > 0）。缺省 = output-available && !preliminary */
  shouldRender?: (part: ToolPart<N>) => boolean;
  /** 同名工具多次调用合成一张卡（searchNotes / webSearch / 图片检索）。 */
  aggregate?: boolean;
  /** 聚合条目去重键（path / url）。空键放行，避免误丢无 id 条目。 */
  itemKey?: (item: unknown) => string | null;
  /** 从一次调用取出待合并条目。 */
  itemsOf?: (part: ToolPart<N>) => readonly unknown[];
  /** 把去重后的条目写回第一张卡使用的 part。 */
  withItems?: (part: ToolPart<N>, items: readonly unknown[]) => ToolPart<N>;
}
