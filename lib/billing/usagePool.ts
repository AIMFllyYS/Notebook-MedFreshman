/**
 * L1 #68 用量池归属：只看这次调用用的是平台凭证还是用户自备 key。
 * 内置模型主聊天走平台中转 → platform；用户自配能力凭证 → byok。
 * custom-openai（桌面自由中转）走 RELAY_*，isCustom=false，必须当平台凭证。
 */

import { CUSTOM_OPENAI_MODEL_ID } from "@/lib/ai/models";

export type UsagePool = "platform" | "byok";

/** BYOK 池只计量平台侧开销：token × ¥0.5 / 百万 token。 */
export const BYOK_OVERHEAD_CNY_PER_MILLION = 0.5;

export function resolveUsagePool(usedPlatformCredentials: boolean): UsagePool {
  return usedPlatformCredentials ? "platform" : "byok";
}

export function usedPlatformCredentialsForProvider(provider: {
  isCustom?: boolean;
  registryId?: string;
}): boolean {
  if (provider.registryId === CUSTOM_OPENAI_MODEL_ID) return true;
  return provider.isCustom !== true;
}

/** 主模型：平台凭证进 platform；用户自备 key 不进任何池。 */
export function resolveMainModelPool(usedPlatformCredentials: boolean): UsagePool | null {
  return usedPlatformCredentials ? "platform" : null;
}
