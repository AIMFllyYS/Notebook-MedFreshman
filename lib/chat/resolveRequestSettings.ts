import { getModelInfoWithCustom, type CustomApiGroup, type ModelInfo, type ThinkingEffort } from "@/lib/ai/models";
import type { ChatAttachment, ChatOptions } from "@/lib/types/chat";

export interface SendMessageOptions {
  quotedText?: string;
  enableThinking?: boolean;
  thinkingEffort?: ThinkingEffort;
  enableSearch?: boolean;
  attachments?: ChatAttachment[];
}

export interface RequestSettingsInput {
  selectedModelId: string;
  customApiGroups: CustomApiGroup[];
  defaultThinkingEffort: ThinkingEffort;
}

export interface ResolvedRequestSettings {
  effectiveModelId: string;
  model: ModelInfo | undefined;
  enableThinking: boolean;
  thinkingEffort: ThinkingEffort | undefined;
  enableSearch: boolean | undefined;
  contextMode: "full" | "semantic";
}

export function resolveRequestSettings(
  settings: RequestSettingsInput,
  options: ChatOptions | undefined,
  sendOptions: SendMessageOptions | undefined,
  ovModelId?: string,
): ResolvedRequestSettings {
  const effectiveModelId = ovModelId ?? settings.selectedModelId;
  const model = getModelInfoWithCustom(effectiveModelId, settings.customApiGroups);
  const requestedThinking = sendOptions?.enableThinking ?? options?.enableThinking;
  const enableThinking = requestedThinking === true && model?.thinking === true;
  const thinkingEffort = enableThinking
    ? sendOptions?.thinkingEffort ?? options?.thinkingEffort ?? settings.defaultThinkingEffort
    : undefined;
  const enableSearch = sendOptions?.enableSearch ?? options?.enableSearch;
  const contextMode = options?.contextMode ?? "full";
  return { effectiveModelId, model, enableThinking, thinkingEffort, enableSearch, contextMode };
}
