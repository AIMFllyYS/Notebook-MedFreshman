// /api/chat 与卫星路由请求体校验（zod）。
// 宽松策略：未知字段忽略、类型不符回退默认，避免因客户端旧版本字段而 400。
// 加上限只约束体积与枚举，不把可选字段改成必填。

import { z } from "zod";
import { DEFAULT_ACADEMIC_YEAR, isAcademicYearId, type AcademicYearId } from "@/lib/constants/academic-year";
import type { CustomApiGroup, CustomModelConfig } from "@/lib/ai/models";
import { normalizeCapabilityEndpoints } from "@/lib/ai/capabilityEndpoints";

/** 服务端入参上限。与客户端约定对齐并留余量，避免卡死正常使用。 */
export const REQUEST_LIMITS = {
  /** 客户端软上限截断后只发 16 条；200 留足历史回放。 */
  messages: 200,
  /** 正常一条消息不会超过个位数 part。 */
  parts: 64,
  /** 设置里手填的全局背景。 */
  globalContextChars: 32 * 1024,
  /** 客户端 MAX_SKILLS = 20。 */
  skills: 32,
  skillContentChars: 32 * 1024,
  /** #71 之后这里只会剩本次用到的那一个。 */
  customApiGroups: 32,
  /**
   * 客户端 `MAX_IMAGE_SIZE` = 2MB 原图；发出去的是 data URL（约 4/3）。
   * 服务端按 4MB 字符串略宽，避免压缩后的合法附件被拒。
   */
  filePartChars: 4 * 1024 * 1024,
  /** artifact / image-gen / record / canvas 的 prompt、instruction、text。 */
  satellitePromptChars: 32 * 1024,
  /** canvas HTML/SVG source；交互演示可比普通 prompt 大。 */
  canvasSourceChars: 256 * 1024,
  /** 长文档前文，服务端实际只取尾部 1200 字。 */
  documentPreviousMarkdownChars: 128 * 1024,
} as const;

function filePartPayloadLength(part: Record<string, unknown>): number {
  const url = typeof part.url === "string" ? part.url : "";
  const data = typeof part.data === "string" ? part.data : "";
  return Math.max(url.length, data.length);
}

const skillSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    content: z.string().max(REQUEST_LIMITS.skillContentChars).optional(),
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
const uiMessageSchema = z
  .object({
    id: z.string().optional(),
    role: z.enum(["user", "assistant"], "不支持的消息角色，仅允许 user 或 assistant。"),
    parts: z
      .array(z.record(z.string(), z.unknown()))
      .max(REQUEST_LIMITS.parts, `单条消息的内容块超过上限（最多 ${REQUEST_LIMITS.parts} 个）。`),
    metadata: z.unknown().optional(),
  })
  .superRefine((message, ctx) => {
    for (const part of message.parts) {
      if (part.type !== "file") continue;
      if (filePartPayloadLength(part) <= REQUEST_LIMITS.filePartChars) continue;
      ctx.addIssue({
        code: "custom",
        message: `附件过大（单张不超过 ${Math.round(REQUEST_LIMITS.filePartChars / (1024 * 1024))}MB）。`,
      });
      break;
    }
  });

/** 自定义模型配置字段较多且多为可选高级项：只校验 id，其余字段透传（由 models.ts 消费时再判定）。 */
const customModelSchema = z
  .looseObject({ id: z.string() })
  .transform((m) => m as unknown as CustomModelConfig);

export const customApiGroupSchema: z.ZodType<CustomApiGroup, unknown> = z.object({
  id: z.string(),
  name: z.string(),
  baseUrl: z.string(),
  apiKey: z.string(),
  models: z.array(customModelSchema),
  timeoutMs: z.number().finite().positive().max(600_000).optional(),
});

export const customProviderSchema = z.object({
  baseUrl: z.string().optional(),
  apiKey: z.string().optional(),
  model: z.string().optional(),
});

/** 卫星路由：缺省或非数组回退 []（与原先 Array.isArray 手判一致）；数组元素仍校验。 */
const satelliteApiGroupsSchema = z
  .unknown()
  .transform((value) => (Array.isArray(value) ? value : []))
  .pipe(
    z
      .array(customApiGroupSchema)
      .max(REQUEST_LIMITS.customApiGroups, `自定义 API 分组超过上限（最多 ${REQUEST_LIMITS.customApiGroups} 个）。`),
  )
  .optional()
  .default([]);

const finiteNumber = z.number().refine((n) => Number.isFinite(n));

/** 客户端 body 字段见 `lib/chat/buildChatRequestBody.ts` 的 `ChatRequestBody`（messages 由 transport 另传）。 */
export const chatRequestSchema = z.object({
  messages: z
    .array(uiMessageSchema)
    .max(REQUEST_LIMITS.messages, `消息数量超过上限（最多 ${REQUEST_LIMITS.messages} 条）。`)
    .default([]),
  /** DefaultChatTransport 的 chatId，用作 usage_ledger.session_id。 */
  id: z.string().optional(),
  modelId: z.string().optional(),
  /** 兼容旧式 model:'flash'/'pro'（如划词浮窗早期版本）。 */
  model: z.enum(["flash", "pro"]).optional(),
  customProvider: z.object({ baseUrl: z.string().optional(), apiKey: z.string().optional(), model: z.string().optional() }).optional(),
  customApiGroups: z
    .array(customApiGroupSchema)
    .max(REQUEST_LIMITS.customApiGroups, `自定义 API 分组超过上限（最多 ${REQUEST_LIMITS.customApiGroups} 个）。`)
    .default([]),
  defaultImageModelId: z.string().nullable().optional(),
  imageModeTextModel: z.string().default("mimo-v2.5"),
  imageModeTextModelFallback: z.string().default("mimo-v2.5"),
  capabilityEndpoints: z
    .unknown()
    .optional()
    .transform((v) => normalizeCapabilityEndpoints(v ?? {})),
  disabledTools: z.array(z.string()).default([]),
  contextTruncated: z.boolean().default(false),
  sessionContextBudgetTokens: finiteNumber.optional().nullable(),
  clientContextTokens: finiteNumber.optional().nullable(),
  globalContext: z
    .string()
    .max(REQUEST_LIMITS.globalContextChars, `全局背景过长（最多 ${REQUEST_LIMITS.globalContextChars} 字）。`)
    .default(""),
  skills: z
    .array(skillSchema)
    .max(REQUEST_LIMITS.skills, `技能数量超过上限（最多 ${REQUEST_LIMITS.skills} 个）。`)
    .default([]),
  artifacts: z
    .array(
      z
        .object({
          id: z.string(),
          title: z.string().optional(),
          summary: z.string().max(2000).optional(),
          html: z.string().max(REQUEST_LIMITS.canvasSourceChars).optional(),
        })
        .transform((item) => ({
          id: item.id,
          title: String(item.title ?? ""),
          summary: String(item.summary ?? ""),
          html: item.html,
        })),
    )
    .max(16)
    .default([]),
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

export const artifactRequestSchema = z.object({
  id: z.unknown().optional(),
  title: z.string().max(REQUEST_LIMITS.satellitePromptChars).optional(),
  prompt: z.string().max(REQUEST_LIMITS.satellitePromptChars).optional(),
  modelId: z.string().optional(),
  customApiGroups: satelliteApiGroupsSchema,
  customProvider: customProviderSchema.optional(),
});

export const documentRequestSchema = z.object({
  id: z.unknown().optional(),
  spec: z.unknown().optional(),
  modelId: z.string().optional(),
  customApiGroups: satelliteApiGroupsSchema,
  customProvider: customProviderSchema.optional(),
  phase: z.enum(["outline", "section"]).optional(),
  outline: z.array(z.unknown()).max(64).optional(),
  sectionIndex: finiteNumber.optional(),
  previousMarkdown: z.string().max(REQUEST_LIMITS.documentPreviousMarkdownChars).optional(),
});

export const imageGenRequestSchema = z.object({
  modelId: z.string().optional(),
  prompt: z.string().max(REQUEST_LIMITS.satellitePromptChars).optional(),
  size: z.string().optional(),
  count: z.unknown().optional(),
  customApiGroups: satelliteApiGroupsSchema,
  defaultImageModelId: z.string().nullable().optional(),
  capabilityEndpoints: z.unknown().optional(),
  probe: z.boolean().optional(),
});

export const recordRequestSchema = z.object({
  mode: z.string().optional(),
  text: z.string().max(REQUEST_LIMITS.satellitePromptChars).optional(),
  userInstruction: z.string().max(REQUEST_LIMITS.satellitePromptChars).optional(),
  currentCard: z.unknown().optional(),
  subjectName: z.string().optional(),
  categoryName: z.string().optional(),
  itemLabel: z.string().optional(),
  enableThinking: z.boolean().optional(),
  customApiGroups: satelliteApiGroupsSchema,
  modelId: z.string().optional(),
});

export const canvasReviseRequestSchema = z
  .object({
    modelId: z.string().optional(),
    customApiGroups: satelliteApiGroupsSchema,
    instruction: z.string().max(REQUEST_LIMITS.satellitePromptChars).optional(),
    topic: z.string().max(8 * 1024).optional(),
    block: z.unknown().optional(),
  })
  .superRefine((body, ctx) => {
    if (body.block == null) return;
    const encoded = typeof body.block === "string" ? body.block : JSON.stringify(body.block);
    if (encoded.length > REQUEST_LIMITS.canvasSourceChars) {
      ctx.addIssue({ code: "custom", message: "画布内容过大，请缩小后重试。" });
    }
  });

export type ArtifactRequest = z.infer<typeof artifactRequestSchema>;
export type DocumentRequest = z.infer<typeof documentRequestSchema>;
export type ImageGenRequest = z.infer<typeof imageGenRequestSchema>;
export type RecordRequest = z.infer<typeof recordRequestSchema>;
export type CanvasReviseRequest = z.infer<typeof canvasReviseRequestSchema>;

function issuePath(issue: z.core.$ZodIssue): string {
  return issue.path.map(String).join(".");
}

function formatZodIssue(issue: z.core.$ZodIssue): string {
  const path = issuePath(issue);
  if (issue.code === "invalid_value" && /(^|\.)role$/.test(path)) {
    return "不支持的消息角色，仅允许 user 或 assistant。";
  }
  if (issue.code === "too_big") {
    if (path === "messages") return `消息数量超过上限（最多 ${REQUEST_LIMITS.messages} 条）。`;
    if (path === "globalContext") return `全局背景过长（最多 ${REQUEST_LIMITS.globalContextChars} 字）。`;
    if (path === "skills") return `技能数量超过上限（最多 ${REQUEST_LIMITS.skills} 个）。`;
    if (path.includes("skills") && path.endsWith("content")) {
      return `单个技能正文过长（最多 ${REQUEST_LIMITS.skillContentChars} 字）。`;
    }
    if (path === "customApiGroups") {
      return `自定义 API 分组超过上限（最多 ${REQUEST_LIMITS.customApiGroups} 个）。`;
    }
    if (path.endsWith("parts")) return `单条消息的内容块超过上限（最多 ${REQUEST_LIMITS.parts} 个）。`;
    if (path === "prompt" || path === "instruction" || path === "text" || path === "title") {
      return `内容过长（最多 ${REQUEST_LIMITS.satellitePromptChars} 字）。`;
    }
    if (path === "previousMarkdown") {
      return `文档前文过长（最多 ${REQUEST_LIMITS.documentPreviousMarkdownChars} 字）。`;
    }
    if (issue.origin === "string") return "字段过长，请缩短后重试。";
    if (issue.origin === "array") return "列表数量超过上限，请减少后重试。";
  }
  if (issue.message && !/^(Too (big|small)|Invalid |Invalid input|expected )/i.test(issue.message)) {
    return issue.message;
  }
  return "请求体不合法，请检查字段后重试。";
}

/** 把 ZodError 收成一句可读中文；绝不回传 issue.input 或裸 JSON dump。 */
export function formatRequestError(error: unknown): string {
  if (error instanceof z.ZodError) {
    const parts = [...new Set(error.issues.map(formatZodIssue).filter(Boolean))];
    const detail = parts.slice(0, 3).join("；");
    if (detail) return detail.startsWith("请求体") ? detail : `请求体不合法：${detail}`;
  }
  return "请求体不合法，请检查后重试。";
}

export function collectRequestSecrets(body: {
  customApiGroups?: { apiKey?: string }[] | null;
  customProvider?: { apiKey?: string } | null;
}): string[] {
  const secrets: string[] = [];
  if (body.customProvider?.apiKey) secrets.push(body.customProvider.apiKey);
  for (const group of body.customApiGroups ?? []) {
    if (group?.apiKey) secrets.push(group.apiKey);
  }
  return secrets;
}

/** 解析请求体；不合法时抛出 ZodError，由路由转成用户可读的错误事件。 */
export function parseChatRequest(raw: unknown): ChatRequest {
  return chatRequestSchema.parse(raw ?? {});
}

export function parseArtifactRequest(raw: unknown): ArtifactRequest {
  return artifactRequestSchema.parse(raw ?? {});
}

export function parseDocumentRequest(raw: unknown): DocumentRequest {
  return documentRequestSchema.parse(raw ?? {});
}

export function parseImageGenRequest(raw: unknown): ImageGenRequest {
  return imageGenRequestSchema.parse(raw ?? {});
}

export function parseRecordRequest(raw: unknown): RecordRequest {
  return recordRequestSchema.parse(raw ?? {});
}

export function parseCanvasReviseRequest(raw: unknown): CanvasReviseRequest {
  return canvasReviseRequestSchema.parse(raw ?? {});
}
