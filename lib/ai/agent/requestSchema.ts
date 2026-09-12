// /api/chat 请求体校验（zod）。宽松策略：未知字段忽略、类型不符回退默认，避免因客户端旧版本字段而 400。

import { z } from "zod";
import { DEFAULT_ACADEMIC_YEAR, isAcademicYearId, type AcademicYearId } from "@/lib/constants/academic-year";
import type { CustomApiGroup, CustomModelConfig } from "@/lib/ai/models";

const skillSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    content: z.string().optional(),
    pinned: z.boolean().optional(),
    createdAt: z.number().optional(),
  })
  .transform((s) => ({
    id: String(s.id ?? ""),
    name: String(s.name ?? "").trim(),
    description: String(s.description ?? ""),
    content: String(s.content ?? ""),
    pinned: s.pinned === true,
    createdAt: Number(s.createdAt ?? 0),
  }));

/** 客户端 UIMessage（只校验最外层，parts 由 convertToModelMessages 再做严格校验）。 */
const uiMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(z.record(z.string(), z.unknown())),
  metadata: z.unknown().optional(),
});

/** 自定义模型配置字段较多且多为可选高级项：只校验 id，其余字段透传（由 models.ts 消费时再判定）。 */
const customModelSchema = z
  .looseObject({ id: z.string() })
  .transform((m) => m as unknown as CustomModelConfig);

const customApiGroupSchema: z.ZodType<CustomApiGroup, unknown> = z.object({
  id: z.string(),
  name: z.string(),
  baseUrl: z.string(),
  apiKey: z.string(),
  models: z.array(customModelSchema),
});

const finiteNumber = z.number().refine((n) => Number.isFinite(n));

/** 客户端 body 字段见 `lib/chat/buildChatRequestBody.ts` 的 `ChatRequestBody`（messages 由 transport 另传）。 */
export const chatRequestSchema = z.object({
  messages: z.array(uiMessageSchema).default([]),
  /** DefaultChatTransport 的 chatId，用作 usage_ledger.session_id。 */
  id: z.string().optional(),
  modelId: z.string().optional(),
  /** 兼容旧式 model:'flash'/'pro'（如划词浮窗早期版本）。 */
  model: z.enum(["flash", "pro"]).optional(),
  customProvider: z.object({ baseUrl: z.string().optional(), apiKey: z.string().optional(), model: z.string().optional() }).optional(),
  customApiGroups: z.array(customApiGroupSchema).default([]),
  defaultImageModelId: z.string().nullable().optional(),
  imageModeTextModel: z.string().default("mimo-v2.5"),
  imageModeTextModelFallback: z.string().default("mimo-v2.5-pro"),
  disabledTools: z.array(z.string()).default([]),
  contextTruncated: z.boolean().default(false),
  sessionContextBudgetTokens: finiteNumber.optional().nullable(),
  clientContextTokens: finiteNumber.optional().nullable(),
  globalContext: z.string().default(""),
  skills: z.array(skillSchema).default([]),
  subjectId: z.string().default("other"),
  categoryId: z.string().default("detail"),
  itemId: z.string().default(""),
  currentTopic: z.string().default(""),
  enableThinking: z.boolean().default(false),
  enableSearch: z.boolean().default(false),
  thinkingEffort: z.enum(["low", "medium", "high", "max"]).default("medium"),
  contextMode: z.enum(["full", "semantic"]).default("full"),
  academicYear: z
    .unknown()
    .default(DEFAULT_ACADEMIC_YEAR)
    .transform((v): AcademicYearId => (isAcademicYearId(v) ? v : DEFAULT_ACADEMIC_YEAR)),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

/** 解析请求体；不合法时抛出 ZodError，由路由转成用户可读的错误事件。 */
export function parseChatRequest(raw: unknown): ChatRequest {
  return chatRequestSchema.parse(raw ?? {});
}
