// 学习助教 Agent：把 system prompt 拼装、工具集、思考参数、生图模式约束封装成一个 ToolLoopAgent。
// 每次请求创建一个实例（工具以闭包捕获请求上下文，成本可忽略）。
//
// 提示词拼装顺序与旧 route.ts 逐字节一致：稳定前缀（global + 学科 + 用户设置）
// 与易变上下文（当前定位 + 参考材料）合并为单条 system，多轮间稳定 → 上游 prefix 缓存命中。

import { ToolLoopAgent, isStepCount, wrapLanguageModel, type ToolSet, type PrepareStepFunction } from "ai";
import type { LanguageModelV4 } from "@ai-sdk/provider";
import { buildSystemPrompt, buildLocationLine } from "@/lib/ai/prompts";
import type { ChatContext, ChatOptions } from "@/lib/types/chat";
import type { Skill } from "@/lib/types/skill";
import type { AcademicYearId } from "@/lib/constants/academic-year";
import type { ThinkingCallSettings } from "@/lib/ai/sdk/languageModel";
import {
  buildStudyTools,
  createToolRuntime,
  IMAGE_SEARCH_MAX_TOTAL,
  MAX_TOOL_STEPS,
  type StudyToolRuntime,
} from "@/lib/ai/agent/tools/server";
import { createAgentLifecycleHooks } from "@/lib/ai/observability/agentLog";

export interface StudyAgentInput {
  model: LanguageModelV4;
  chatCtx: ChatContext & { academicYear: AcademicYearId };
  options: ChatOptions;
  /** 已按 enableSearch / disabledTools 过滤前的用户禁用列表。 */
  disabledTools: string[];
  skills: Skill[];
  globalContext: string;
  /** 参考材料（上下文管理器产出），已按软上限决定是否省略。 */
  referenceContext: string;
  /** 上下文达到 80% 软上限时置 true：省略参考材料并在 system 中说明。 */
  contextTruncated: boolean;
  /** 用户选择的是生图模型：强制每步只能调用 generateImage。 */
  isImageMode: boolean;
  /** 前端选中的模型 id（透传给 renderInteractive / generateImage 卡片）。 */
  selectedModelId?: string;
  modelSupportsTools: boolean;
  thinking: ThinkingCallSettings;
  temperature?: number;
}

export interface StudyAgentBundle {
  agent: ToolLoopAgent<never, ToolSet>;
  /** 供 ContextBreakdown 分项统计的 system 各组成。 */
  promptParts: {
    baseSystemPrompt: string;
    globalContext: string;
    skillsMenuText: string;
    pinnedSkillsText: string;
    volatile: string;
    instructions: string;
  };
  tools: ToolSet;
  runtime: StudyToolRuntime;
}

const IMAGE_MODE_RULE =
  "## 生图模式硬性规则\n当前用户选择的是生图模型。无论用户输入什么，本次最终动作必须调用 generateImage 工具，把用户意图改写为清晰、可执行的生图提示词。不要用纯文字回答替代，不要调用 renderInteractive 或 drawDiagram。";

export function createStudyAgent(input: StudyAgentInput): StudyAgentBundle {
  const {
    model, chatCtx, options, disabledTools, skills, globalContext,
    referenceContext, contextTruncated, isImageMode, selectedModelId, modelSupportsTools, thinking,
  } = input;

  // 稳定排序，保证拼装的系统前缀逐字节一致、利于缓存命中
  const sortedSkills = [...skills]
    .filter((s) => s.name && s.content)
    .sort((a, b) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const pinnedSkills = sortedSkills.filter((s) => s.pinned);
  const menuSkills = sortedSkills.filter((s) => !s.pinned);

  const baseSystemPrompt = buildSystemPrompt(chatCtx);
  const skillsMenuText = menuSkills.length
    ? menuSkills.map((s) => `- ${s.name}：${s.description || "（无描述）"}`).join("\n")
    : "";
  const pinnedSkillsText = pinnedSkills.length
    ? pinnedSkills.map((s) => `### ${s.name}\n${s.content}`).join("\n\n")
    : "";

  const promptExtras: string[] = [];
  if (isImageMode) promptExtras.push(IMAGE_MODE_RULE);
  if (globalContext) promptExtras.push(`## 全局补充上下文（用户提供，始终适用）\n${globalContext}`);
  if (pinnedSkillsText) promptExtras.push(`## 已固定启用的技能（用户手动开启，请始终遵循其指导）\n${pinnedSkillsText}`);
  if (skillsMenuText) {
    promptExtras.push(
      `## 可调用的技能库\n当下列技能与用户问题相关时，调用 useSkill 工具（参数 name 用技能名）加载其完整内容；一次只调用最相关的一个：\n${skillsMenuText}`,
    );
  }
  const systemPrompt = promptExtras.length
    ? `${baseSystemPrompt}\n\n---\n\n${promptExtras.join("\n\n---\n\n")}`
    : baseSystemPrompt;

  const volatile =
    buildLocationLine(chatCtx) +
    (contextTruncated
      ? "\n\n【上下文策略】当前会话达到 80% 软上限，本次省略完整参考材料，只使用最近消息继续回答。"
      : referenceContext
        ? `\n\n【参考材料】\n${referenceContext}`
        : "");

  // 必须只有「一条」system 消息且在最前：部分模型（如硅基流动 Qwen3）会对第二条 system 报错。
  const instructions = volatile ? `${systemPrompt}\n\n${volatile}` : systemPrompt;

  const runtime = createToolRuntime();
  const tools = modelSupportsTools
    ? buildStudyTools(
        {
          subjectId: chatCtx.subjectId,
          categoryId: chatCtx.categoryId,
          itemId: chatCtx.itemId,
          skills: sortedSkills,
          academicYear: chatCtx.academicYear,
          modelId: selectedModelId,
          artifactUnsupportedReason: isImageMode
            ? "当前生图模型不支持 HTML 交互组件生成，请切换文本模型后重试。"
            : undefined,
        },
        runtime,
        { enableSearch: options.enableSearch ?? false, disabled: disabledTools },
      )
    : {};

  const toolNames = Object.keys(tools);

  // 每步动态收窄工具：生图模式首步只留 generateImage 并强制调用，之后关闭工具让模型写说明文字
  // （避免强制 toolChoice 在每步重复触发）；imageSearch 配额耗尽后不再暴露。
  const prepareStep: PrepareStepFunction<ToolSet> = ({ stepNumber }) => {
    if (toolNames.length === 0) return {};
    if (isImageMode && toolNames.includes("generateImage")) {
      return stepNumber === 0
        ? { activeTools: ["generateImage"], toolChoice: { type: "tool", toolName: "generateImage" } }
        : { activeTools: [], toolChoice: "none" };
    }
    if (runtime.imageSearchFetchedCount >= IMAGE_SEARCH_MAX_TOTAL && toolNames.includes("imageSearch")) {
      return { activeTools: toolNames.filter((n) => n !== "imageSearch") };
    }
    return {};
  };

  const lifecycle = createAgentLifecycleHooks();
  const observedModel = wrapLanguageModel({
    model,
    middleware: lifecycle.modelMiddleware,
  });

  const agent = new ToolLoopAgent<never, ToolSet>({
    id: "study-tutor",
    model: observedModel,
    instructions,
    tools,
    stopWhen: isStepCount(MAX_TOOL_STEPS),
    // Endpoint fallback is owned by the model adapter; never repeat the entire
    // failed chain three times (especially for local permission/network errors).
    maxRetries: 0,
    temperature: input.temperature ?? 0.6,
    prepareStep,
    onStepStart: lifecycle.onStepStart,
    onStepEnd: lifecycle.onStepEnd,
    onToolExecutionStart: lifecycle.onToolExecutionStart,
    onToolExecutionEnd: lifecycle.onToolExecutionEnd,
    telemetry: lifecycle.telemetry,
    ...(thinking.providerOptions ? { providerOptions: thinking.providerOptions } : {}),
    ...(thinking.maxOutputTokens ? { maxOutputTokens: thinking.maxOutputTokens } : {}),
  });

  return {
    agent,
    promptParts: { baseSystemPrompt, globalContext, skillsMenuText, pinnedSkillsText, volatile, instructions },
    tools,
    runtime,
  };
}
