import type { CustomApiGroup } from "@/lib/ai/models";
import {
  EMPTY_CAPABILITY_ENDPOINTS,
  normalizeCapabilityEndpoints,
  type CapabilityEndpoints,
} from "@/lib/ai/capabilityEndpoints";
import type { ChatContext } from "@/lib/types/chat";
import type { Skill } from "@/lib/types/skill";
import type { ContextBudget } from "./estimateContextBudget";
import type { ResolvedRequestSettings } from "./resolveRequestSettings";
import type { ArtifactCatalogItem } from "@/lib/context/compactArtifacts";

export interface ChatRequestBodySettings {
  customApiGroups: CustomApiGroup[];
  customBaseUrl: string;
  customApiKey: string;
  customModelId: string;
  defaultImageModelId: string | null;
  imageModeTextModel: string;
  imageModeTextModelFallback: string;
  capabilityEndpoints?: CapabilityEndpoints;
  disabledTools: string[];
  globalContext: string;
}

/** 发给 /api/chat 的 body（messages 由 transport 另传）。字段须与 chatRequestSchema 对齐。 */
export interface ChatRequestBody {
  modelId: string;
  customApiGroups: CustomApiGroup[];
  customProvider?: { baseUrl: string; apiKey: string; model: string };
  defaultImageModelId: string | null;
  imageModeTextModel: string;
  imageModeTextModelFallback: string;
  capabilityEndpoints: CapabilityEndpoints;
  disabledTools: string[];
  subjectId: string;
  categoryId: string;
  itemId: string;
  currentTopic: string;
  academicYear: string;
  enableThinking: boolean;
  thinkingEffort: ResolvedRequestSettings["thinkingEffort"];
  enableSearch: boolean | undefined;
  contextMode: ResolvedRequestSettings["contextMode"];
  contextTruncated: boolean;
  sessionContextBudgetTokens: number;
  clientContextTokens: number;
  globalContext: string;
  skills: Skill[];
  artifacts?: ArtifactCatalogItem[];
}

export function buildChatRequestBody(
  ctx: ChatContext,
  settings: ChatRequestBodySettings,
  resolved: ResolvedRequestSettings,
  budget: ContextBudget,
  skills: Skill[],
  academicYear: string,
  artifacts: ArtifactCatalogItem[] = [],
): ChatRequestBody {
  const customProvider: ChatRequestBody["customProvider"] =
    settings.customApiGroups.length === 0 && settings.customBaseUrl
      ? { baseUrl: settings.customBaseUrl, apiKey: settings.customApiKey, model: settings.customModelId }
      : undefined;
  return {
    modelId: resolved.effectiveModelId,
    customApiGroups: settings.customApiGroups,
    customProvider,
    defaultImageModelId: settings.defaultImageModelId,
    imageModeTextModel: settings.imageModeTextModel,
    imageModeTextModelFallback: settings.imageModeTextModelFallback,
    capabilityEndpoints: normalizeCapabilityEndpoints(settings.capabilityEndpoints ?? EMPTY_CAPABILITY_ENDPOINTS),
    disabledTools: settings.disabledTools,
    subjectId: ctx.subjectId,
    categoryId: ctx.categoryId,
    itemId: ctx.itemId,
    currentTopic: ctx.currentTopic,
    academicYear,
    enableThinking: resolved.enableThinking,
    thinkingEffort: resolved.thinkingEffort,
    enableSearch: resolved.enableSearch,
    contextMode: resolved.contextMode,
    contextTruncated: budget.softLimitReached,
    sessionContextBudgetTokens: budget.limit,
    clientContextTokens: budget.estimated,
    globalContext: settings.globalContext,
    skills,
    artifacts,
  };
}
