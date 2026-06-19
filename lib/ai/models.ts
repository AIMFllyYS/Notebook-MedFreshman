// 硅基流动（SiliconFlow）精选模型注册表 —— 供 AI 对话的模型选择菜单。
// model id 经 `GET /v1/models` 真实核对（2026-06）。env 默认即 DeepSeek-V4 系。

export interface ModelInfo {
  /** 发给 OpenAI 兼容 API 的精确 model id；CUSTOM_MODEL_ID 为自定义占位。 */
  id: string;
  label: string;
  /** 分组名（用于下拉菜单分区）。 */
  group: string;
  /** 是否支持思考链（reasoning_content）。 */
  thinking: boolean;
  /** 是否支持 function calling（工具调用）。 */
  tools: boolean;
  /** 上下文窗口（千 token），用于提示。 */
  contextK?: number;
  hint: string;
}

export const CUSTOM_MODEL_ID = "custom";

export const MODELS: ModelInfo[] = [
  // ── DeepSeek ──────────────────────────────
  { id: "deepseek-ai/DeepSeek-V4-Pro", label: "DeepSeek V4 Pro", group: "DeepSeek", thinking: true, tools: true, contextK: 1000, hint: "旗舰推理 · 1M 上下文 · 最强但较贵" },
  { id: "deepseek-ai/DeepSeek-V4-Flash", label: "DeepSeek V4 Flash", group: "DeepSeek", thinking: true, tools: true, contextK: 1000, hint: "性价比推理 · 1M · 日常首选" },
  { id: "deepseek-ai/DeepSeek-V3.2", label: "DeepSeek V3.2", group: "DeepSeek", thinking: true, tools: true, contextK: 160, hint: "稳健通用 · 工具调用强" },
  { id: "deepseek-ai/DeepSeek-R1", label: "DeepSeek R1", group: "DeepSeek", thinking: true, tools: false, contextK: 64, hint: "经典深度推理思维链" },
  // ── 智谱 GLM ──────────────────────────────
  { id: "zai-org/GLM-5.2", label: "GLM-5.2", group: "智谱 GLM", thinking: true, tools: true, contextK: 200, hint: "GLM 最新旗舰 · 中文强" },
  { id: "Pro/zai-org/GLM-5.1", label: "GLM-5.1 Pro", group: "智谱 GLM", thinking: true, tools: true, contextK: 128, hint: "思考默认开 · 适合长讲解" },
  { id: "zai-org/GLM-4.5-Air", label: "GLM-4.5 Air", group: "智谱 GLM", thinking: true, tools: true, contextK: 128, hint: "轻量快 · 中文好" },
  // ── 通义 Qwen ─────────────────────────────
  { id: "Qwen/Qwen3.6-35B-A3B", label: "Qwen3.6 35B", group: "通义 Qwen", thinking: true, tools: true, contextK: 256, hint: "MoE · 速度/成本均衡 · 推荐主力" },
  { id: "Qwen/Qwen3.5-397B-A17B", label: "Qwen3.5 397B", group: "通义 Qwen", thinking: true, tools: true, contextK: 128, hint: "最大 MoE · 能力上限高" },
  { id: "Qwen/Qwen3.5-35B-A3B", label: "Qwen3.5 35B", group: "通义 Qwen", thinking: true, tools: true, contextK: 256, hint: "均衡稳定" },
  // ── 其他 ─────────────────────────────────
  { id: "Pro/moonshotai/Kimi-K2.6", label: "Kimi K2.6 Pro", group: "其他旗舰", thinking: false, tools: true, contextK: 256, hint: "Agent / 多工具编排强" },
  { id: "MiniMaxAI/MiniMax-M2.5", label: "MiniMax M2.5", group: "其他旗舰", thinking: true, tools: true, contextK: 200, hint: "综合能力均衡" },
];

export const DEFAULT_MODEL_ID = "deepseek-ai/DeepSeek-V4-Flash";

export function getModelInfo(id: string): ModelInfo | undefined {
  return MODELS.find((m) => m.id === id);
}

/** 按 group 聚合，保持声明顺序，供菜单分区渲染。 */
export function getModelGroups(): { group: string; models: ModelInfo[] }[] {
  const order: string[] = [];
  const map = new Map<string, ModelInfo[]>();
  for (const m of MODELS) {
    if (!map.has(m.group)) {
      map.set(m.group, []);
      order.push(m.group);
    }
    map.get(m.group)!.push(m);
  }
  return order.map((group) => ({ group, models: map.get(group)! }));
}
