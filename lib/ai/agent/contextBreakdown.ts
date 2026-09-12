// 上下文分项 token 统计（服务端按真实拼装精确计算，经 data part 回传给上下文看板）。
// system 各组成由源变量单独累计；对话与工具结果按工具名归类。

import type { ModelMessage, StepResult, ToolSet } from "ai";
import type { ContextBreakdown } from "@/lib/types/chat";
import { estimateTokens } from "@/lib/context/estimateTokens";
import type { StudyAgentBundle } from "@/lib/ai/agent/studyAgent";

const tk = (v: unknown) => estimateTokens(typeof v === "string" ? v : JSON.stringify(v ?? ""));

export interface ComputeBreakdownInput {
  promptParts: StudyAgentBundle["promptParts"];
  tools: ToolSet;
  /** 发给模型的历史消息（不含 system）。 */
  historyMessages: ModelMessage[];
  /** 本次 agent 循环的全部步骤。 */
  steps: Array<StepResult<ToolSet>>;
  clientContextTokens: number | null;
  truncated: boolean;
  cacheHit?: boolean;
  warning?: string;
}

function classifyTool(name: string): keyof Pick<ContextBreakdown, "skills" | "webSearch" | "pages" | "conversation"> {
  if (name === "useSkill") return "skills";
  if (name === "webSearch" || name === "imageSearch") return "webSearch";
  if (name === "getCurrentPage" || name === "getSection" || name === "searchNotes") return "pages";
  return "conversation";
}

/** 工具定义在请求体中的近似体积：description + JSON schema。 */
function toolDefsTokens(tools: ToolSet): number {
  let total = 0;
  for (const [name, t] of Object.entries(tools)) {
    total += tk(name) + tk(t.description ?? "");
    const schema = (t.inputSchema as { jsonSchema?: unknown } | undefined)?.jsonSchema;
    total += schema ? tk(schema) : 20;
  }
  return total;
}

export function computeContextBreakdown(input: ComputeBreakdownInput): ContextBreakdown {
  const { promptParts, tools, historyMessages, steps } = input;
  const breakdown: ContextBreakdown = {
    tools: tk(promptParts.baseSystemPrompt) + tk(promptParts.globalContext) + toolDefsTokens(tools),
    skills: tk(promptParts.skillsMenuText) + tk(promptParts.pinnedSkillsText),
    conversation: 0,
    pages: tk(promptParts.volatile),
    webSearch: 0,
    total: 0,
  };

  for (const msg of historyMessages) breakdown.conversation += tk(msg.content);

  for (const step of steps) {
    breakdown.conversation += tk(step.text) + tk(step.reasoningText ?? "");
    for (const call of step.toolCalls) breakdown.conversation += tk(call.input);
    for (const result of step.toolResults) {
      const output = result.output as { text?: unknown } | undefined;
      const payload = output && typeof output === "object" && "text" in output ? output.text : result.output;
      breakdown[classifyTool(result.toolName)] += tk(payload);
    }
  }

  breakdown.total =
    breakdown.tools + breakdown.skills + breakdown.conversation + breakdown.pages + breakdown.webSearch;
  // 环可以垫高，避免截断后假降；软上限判定必须用未垫高的 total。
  const padded =
    input.truncated &&
    input.clientContextTokens !== null &&
    input.clientContextTokens > breakdown.total
      ? input.clientContextTokens
      : breakdown.total;
  breakdown.displayTotal = padded;
  breakdown.truncated = input.truncated;
  breakdown.cacheHit = input.cacheHit;
  if (input.warning) breakdown.warning = input.warning;
  return breakdown;
}
