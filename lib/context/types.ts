import type { ChatContext } from '@/lib/types/chat';
import { MODELS, getModelInfo } from '@/lib/ai/models';
import type { ReferenceTier } from '@/lib/context/referenceTiers';

export type ContextMode = 'full' | 'semantic';
export type { ReferenceTier };

export interface BuildContextOptions {
  /** 客户端已达软上限：跳过全文/检索，只用目录+当前页摘要。 */
  compact?: boolean;
}

export interface ContextManager {
  mode: ContextMode;
  buildContext(
    chatContext: ChatContext,
    userMessage: string,
    options?: BuildContextOptions,
  ): Promise<BuildContextResult>;
}

export interface BuildContextResult {
  context: string;
  tokenCount: number;
  maxTokens: number;
  cacheHit: boolean;
  sources?: string[];
  overflow: boolean;
  tier?: ReferenceTier;
}

/** 由 `lib/ai/models.ts` 的 `contextK`（千 token）派生，不再单独维护一份上限表。 */
export const MODEL_TOKEN_LIMITS: Record<string, number> = Object.fromEntries([
  ...MODELS
    .filter((m) => (m.contextK ?? 0) > 0)
    .map((m) => [m.id, (m.contextK as number) * 1000]),
  ['default', 128_000],
]);

export function getMaxTokens(model: string): number {
  const k = getModelInfo(model)?.contextK;
  if (typeof k === 'number' && k > 0) return k * 1000;
  return MODEL_TOKEN_LIMITS.default;
}

/** 参考材料收尾：不含用户原话，提问只留在最后一条 user。 */
export function closeReferenceMaterials(body: string): string {
  return body.trim() ? `${body}\n\n以上是参考材料` : body;
}
