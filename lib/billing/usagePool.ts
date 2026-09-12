/**
 * L1 #68 用量池归属：只看这次调用用的是平台凭证还是用户自备 key。
 * 内置模型主聊天走平台中转 → platform；用户自配能力凭证 → byok。
 */

export type UsagePool = "platform" | "byok";

export function resolveUsagePool(usedPlatformCredentials: boolean): UsagePool {
  return usedPlatformCredentials ? "platform" : "byok";
}
