/**
 * L1 #68 用量池归属。判据有两层，缺一层就会记错账：
 * 1. 这次调用花的是谁的 key（平台凭证 / 用户自备）；
 * 2. 这一轮请求的主模型花的是谁的 key。
 *
 * 主模型：平台凭证 → platform；用户自备（BYOK）→ 不进任何池（钱是他自己的）。
 * 侧车（搜索 / 搜图 / 嵌入 / 重排）：用户自备 key → 不进任何池；用平台 key 时跟随主模型归属——
 * 平台轮进 platform（按模型单价），BYOK 轮进 byok（¥0.5/百万 token）。
 * custom-openai（桌面自由中转）走 RELAY_*，isCustom=false，必须当平台凭证。
 */

import { CUSTOM_OPENAI_MODEL_ID } from "@/lib/ai/models";

export type UsagePool = "platform" | "byok";

/** BYOK 池只计量平台侧开销：token × ¥0.5 / 百万 token。 */
export const BYOK_OVERHEAD_CNY_PER_MILLION = 0.5;

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

/** 侧车入账参数。`skipInsert` 为真时这笔开销不属于我们，不落台账。 */
export interface SidecarBilling {
  pool?: UsagePool;
  /** 显式给值：BYOK 主模型会把 skipInsert 放进 ALS，侧车要能把自己这笔捞回来。 */
  skipInsert: boolean;
}

/**
 * 侧车归属。注意不能只看侧车自己的 key：BYOK 轮里我们垫付的搜索 / 嵌入仍是平台成本，
 * 要进 byok 池按 ¥0.5/百万 token 计量，而不是按模型单价记到 platform 上。
 */
export function resolveSidecarBilling(input: {
  usedPlatformCredentials: boolean;
  mainUsedPlatformCredentials: boolean;
}): SidecarBilling {
  if (!input.usedPlatformCredentials) return { skipInsert: true };
  return { pool: input.mainUsedPlatformCredentials ? "platform" : "byok", skipInsert: false };
}
