import { getModelInfo } from '@/lib/ai/models';
import { isProviderAvailable } from '@/lib/ai/provider';
import { routeModelByFastModel } from '@/lib/ai/modelRouter';

// Internal policy; never serialize these rules to the model picker or a system prompt.
//
// Auto 的候选池只有四个：两个免费模型 + 快速模型（DeepSeek V4.1 Flash）+ GLM-5.3 Flash。
// 选择分两层：**规则优先**（带图 / 开思考 / 长文 / 命中硬任务信号 → 直接定），
// **模型兜底**（短问题、规则说不清 → 让七牛云的极轻量模型回一个别名，见 modelRouter.ts）。

/** 免费池：上下文 256K、无视觉，只适合又短又简单的问答。 */
const FREE = ['poolside/laguna-s-2.1-free', 'inclusionai/ling-3.0-flash-sante:free'] as const;
/** 快速模型：默认首选，1M + 视觉 + 可关思考。 */
const FAST = ['deepseek/deepseek-v4.1-flash'] as const;
/** 强模型：编码 / 严格结构化输出更稳，但强制思考、略慢。 */
const STRONG = ['z-ai/glm-5.3-flash'] as const;

/**
 * 硬任务信号。命中任意一个就**不许**把免费模型排在前面：
 * 做题/出题、讲解、系统梳理、检索资料、写长文、写代码这些免费池扛不住。
 * 提示词里也写了同一条限制（model-router.md §硬性限制），这里是不依赖模型的硬闸门。
 */
const HARD_TASK_RE = /做题|答题|出题|道题|几道|题目|练习题|模拟题|真题|小测|测验|考试|测试题|讲解|讲一下|讲一讲|讲讲|梳理|总结|推导|证明|辨析|论述|综述|资料|检索|查一下|搜一下|找一下|写一篇|写作|论文|报告|讲义|代码|编程|调试|重构|报错|debug|bug/i;

export interface AutoRouteInput {
  hasImages: boolean;
  estimatedTokens: number;
  text: string;
  thinking: boolean;
}

export type AvailabilityCheck = (id: string) => boolean;

/** 规则层的偏好：这些情况一律先给"能扛事"的模型。 */
export function prefersStrongModel(input: AutoRouteInput): boolean {
  return input.hasImages || input.thinking || input.text.length > 600 || HARD_TASK_RE.test(input.text);
}

/** 候选池按可用性 / 视觉 / 上下文过滤，顺序固定为 [快速, 强, 免费…]。 */
export function autoRouteCandidates(
  input: AutoRouteInput,
  available: AvailabilityCheck = isProviderAvailable,
): string[] {
  return [...FAST, ...STRONG, ...FREE].filter((id) => {
    const model = getModelInfo(id);
    return !!model && model.tools
      && (!input.hasImages || model.vision === true)
      && input.estimatedTokens < (model.contextK ?? 128) * 800
      && available(id);
  });
}

/**
 * 纯规则结果（同步）。保留给测试与"模型不可用"时的回落路径。
 */
export function selectAutomaticModels(
  input: AutoRouteInput,
  available: AvailabilityCheck = isProviderAvailable,
): string[] {
  const usable = autoRouteCandidates(input, available);
  if (usable.length === 0) return [];
  const order = prefersStrongModel(input)
    ? [...FAST, ...STRONG, ...FREE]
    : [...FREE, ...FAST, ...STRONG];
  return order.filter((id) => usable.includes(id));
}

export interface AutoRouteDecision {
  /** 首选在第一位，其余按次序做端点级降级。 */
  models: string[];
  /** rules = 规则直接定；router = 问了快速模型。 */
  source: 'rules' | 'router';
  /** 内部诊断用（不进用户可见文案）。 */
  note: string;
}

/**
 * Auto 的完整决策：规则优先，模型只兜"规则说不清"的短问题。
 *
 * 为什么不让模型兜所有情况：那会把每次提问都加上一次分类调用的延迟（实测 ~1.2s），
 * 而带图 / 开思考 / 长文 / 硬任务这些情况规则本来就判得比模型准。
 */
export async function decideAutomaticModels(
  input: AutoRouteInput,
  deps: {
    available?: AvailabilityCheck;
    route?: typeof routeModelByFastModel;
  } = {},
): Promise<AutoRouteDecision> {
  const byRules = selectAutomaticModels(input, deps.available);
  if (byRules.length === 0) return { models: [], source: 'rules', note: 'no-candidate' };
  if (prefersStrongModel(input)) return { models: byRules, source: 'rules', note: 'strong-task' };
  if (byRules.length === 1) return { models: byRules, source: 'rules', note: 'single-candidate' };

  const route = deps.route ?? routeModelByFastModel;
  try {
    const picked = await route({
      text: input.text,
      hasImages: input.hasImages,
      thinking: input.thinking,
      allowed: byRules,
    });
    if (!picked.modelId) return { models: byRules, source: 'rules', note: 'router-unavailable' };
    return {
      models: [picked.modelId, ...byRules.filter((id) => id !== picked.modelId)],
      source: 'router',
      note: `${picked.modelId} ${picked.elapsedMs}ms raw=${JSON.stringify(picked.raw.slice(0, 40))}`,
    };
  } catch {
    return { models: byRules, source: 'rules', note: 'router-failed' };
  }
}
