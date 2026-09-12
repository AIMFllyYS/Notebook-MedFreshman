import type { NextRequest } from "next/server";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type ModelMessage,
  type UIMessageStreamWriter,
} from "ai";
import { compactArtifactMessages, compactUiParts } from "@/lib/context/compactArtifacts";
import { compactHistory } from "@/lib/context/compactHistory";
import { pruneStudyMessages } from "@/lib/context/pruneStudyMessages";
import { CONTEXT_WARNING } from "@/lib/chat/estimateContextBudget";
import { getContextManager } from "@/lib/context";
import type { ChatContext, ChatMessage, ChatOptions } from "@/lib/types/chat";
import { ENV_MODEL_PRO, ENV_MODEL_FLASH } from "@/lib/ai/provider";
import { getModelInfoWithCustom } from "@/lib/ai/models";
import { resolveLanguageModel } from "@/lib/ai/sdk/languageModel";
import { withSseHeartbeat } from "@/lib/ai/sdk/heartbeat";
import { toChatErrorMessage } from "@/lib/ai/sdk/errorMessage";
import { createStudyAgent } from "@/lib/ai/agent/studyAgent";
import { TOOL_STEP_LIMIT_INFO } from "@/lib/ai/agent/tools/server";
import { computeContextBreakdown } from "@/lib/ai/agent/contextBreakdown";
import { generateFallbackFollowUps } from "@/lib/ai/agent/followUps";
import { formatRequestError, parseChatRequest, type ChatRequest } from "@/lib/ai/agent/requestSchema";
import { awaitUsage, resolveActualBillingModelId, runWithLedgerContext, settleChatUsage } from "@/lib/billing/usageLedger";
import { assertQuotaAvailable, quotaRejectedJson, resolveQuotaUserId } from "@/lib/billing/quotaGate";
import { resolveMainModelPool, usedPlatformCredentialsForProvider } from "@/lib/billing/usagePool";
import { runWithCapabilityEndpoints } from "@/lib/ai/capabilityContext";
import { capabilitySecretValues } from "@/lib/ai/capabilityEndpoints";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Writer = UIMessageStreamWriter<ChatMessage>;

/** 把一段纯文本作为 assistant 正文写入流（用于「未配置」等友好提示，而非 error）。 */
function writeTextPart(writer: Writer, text: string) {
  const id = `txt_${Date.now()}`;
  writer.write({ type: "text-start", id });
  writer.write({ type: "text-delta", id, delta: text });
  writer.write({ type: "text-end", id });
}

function lastUserText(messages: ChatRequest["messages"]): string {
  const last = [...messages].reverse().find((m) => m.role === "user") ?? messages[messages.length - 1];
  if (!last) return "";
  return last.parts
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text as string)
    .join(" ");
}

function hasFileParts(messages: ChatRequest["messages"]): boolean {
  return messages.some((m) => m.parts.some((p) => p.type === "file"));
}

/** UIMessage → ModelMessage。reasoning / 旧工具结果由随后的 pruneMessages 处理。 */
async function toModelMessages(messages: ChatRequest["messages"]): Promise<ModelMessage[]> {
  const uiMessages = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m, i) => ({
      id: m.id ?? `m_${i}`,
      role: m.role,
      parts: compactUiParts(
        m.parts.filter((p) => {
          const type = p.type;
          return type === "text" || type === "file" || type === "reasoning"
            || (typeof type === "string" && type.startsWith("tool-"));
        }),
      ),
    })) as ChatMessage[];
  return convertToModelMessages(uiMessages, { ignoreIncompleteToolCalls: true });
}

export async function POST(req: NextRequest) {
  let body: ChatRequest;
  try {
    body = parseChatRequest(await req.json().catch(() => ({})));
  } catch (err) {
    return new Response(JSON.stringify({ error: formatRequestError(err) }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 模型选择：优先 modelId（新菜单）；兼容旧式 model:'flash'/'pro'。
  const modelId =
    body.modelId ?? (body.model === "pro" ? ENV_MODEL_PRO : body.model === "flash" ? ENV_MODEL_FLASH : undefined);
  const customGroups = body.customApiGroups;
  const effectiveCustom = customGroups.length > 0 ? customGroups : body.customProvider;
  const secrets = [
    body.customProvider?.apiKey,
    ...customGroups.map((group) => group.apiKey),
    ...capabilitySecretValues(body.capabilityEndpoints),
  ].filter((value): value is string => !!value);
  const formatError = (error: unknown) => toChatErrorMessage(error, secrets);
  const generationAbort = new AbortController();
  const generationSignal = AbortSignal.any([req.signal, generationAbort.signal]);
  const requestId = crypto.randomUUID();
  const userId = await resolveQuotaUserId(req.headers);

  // 生图模式：用户选择了生图模型时，文本对话使用 imageModeTextModel（失败降级到 fallback）。
  const selectedModelInfo = modelId ? getModelInfoWithCustom(modelId, customGroups) : undefined;
  const isImageMode = selectedModelInfo?.type === "image";
  const effectiveModelId = isImageMode ? body.imageModeTextModel : modelId;

  const previewProvider = resolveLanguageModel(effectiveModelId, effectiveCustom).provider;
  const mainPool = resolveMainModelPool(usedPlatformCredentialsForProvider(previewProvider));
  const gate = await assertQuotaAvailable({ userId, pool: mainPool });
  if (!gate.ok) return quotaRejectedJson(gate);

  try {
    const { getIndexHealth } = await import("@/lib/ai/search/indexHealth");
    getIndexHealth();
  } catch {
    /* 索引体检失败不阻断对话 */
  }

  const options: ChatOptions = {
    enableThinking: body.enableThinking,
    enableSearch: body.enableSearch,
    thinkingEffort: body.thinkingEffort,
    contextMode: body.contextMode,
  };
  const chatCtx: ChatContext & { academicYear: ChatRequest["academicYear"] } = {
    subjectId: body.subjectId,
    categoryId: body.categoryId,
    itemId: body.itemId,
    currentTopic: body.currentTopic,
    academicYear: body.academicYear,
  };

  const stream = createUIMessageStream<ChatMessage>({
    onError: formatError,
    execute: async ({ writer }) => runWithCapabilityEndpoints(body.capabilityEndpoints, () => runWithLedgerContext({
      userId,
      sessionId: body.id ?? null,
      requestId,
      route: "/api/chat",
      customGroups,
    }, async () => {
      const resolved = resolveLanguageModel(effectiveModelId, effectiveCustom, {
        fallbackModelIds: isImageMode ? [body.imageModeTextModelFallback] : [],
        onFailover: ({ label }) =>
          writer.write({
            type: "data-info",
            data: { message: `主端点不可用，已切换到备用 API（${label}）` },
            transient: true,
          }),
      });
      const { provider } = resolved;
      if (provider.apiKey) secrets.push(provider.apiKey);
      const modelInfo = effectiveModelId ? getModelInfoWithCustom(effectiveModelId, customGroups) : undefined;

      if (!provider.configured) {
        writeTextPart(
          writer,
          "AI 暂未配置。请在 .env.local 填写 AI_BASE_URL / AI_API_KEY，或在「设置」中填入自定义 API 后重试。",
        );
        return;
      }
      if (hasFileParts(body.messages) && modelInfo && !modelInfo.vision && !provider.isCustom) {
        throw new Error(`当前模型 ${modelInfo.label} 不支持图片理解，请切换到支持视觉的模型（如 MiMo V2.5）。`);
      }

      // 参考材料 + 软上限。客户端已截断则跳过全文/检索；溢出时再降一档。
      const userText = lastUserText(body.messages);
      const ctxManager = getContextManager(options.contextMode ?? "full", effectiveModelId);
      let ctxResult = await ctxManager.buildContext(chatCtx, userText, { compact: body.contextTruncated });
      const contextBudget = body.sessionContextBudgetTokens ?? ctxResult.maxTokens;
      let serverSoftLimitReached = contextBudget > 0 && ctxResult.tokenCount / contextBudget >= 0.8;
      if (!body.contextTruncated && (serverSoftLimitReached || ctxResult.overflow)) {
        ctxResult = await ctxManager.buildContext(chatCtx, userText, { compact: true });
        serverSoftLimitReached = contextBudget > 0 && ctxResult.tokenCount / contextBudget >= 0.8;
      }
      const contextTruncated = body.contextTruncated || serverSoftLimitReached || ctxResult.overflow;

      const bundle = createStudyAgent({
        model: resolved.model,
        chatCtx,
        options,
        disabledTools: body.disabledTools,
        skills: body.skills,
        globalContext: body.globalContext.trim(),
        referenceContext: ctxResult.context,
        contextTruncated,
        artifacts: body.artifacts,
        isImageMode,
        selectedModelId: modelId ?? effectiveModelId,
        modelSupportsTools: resolved.supportsTools,
        thinking: options.enableThinking ? resolved.thinkingSettings(options.thinkingEffort) : {},
      });

      const rawHistory = await toModelMessages(body.messages);
      const prunedHistory = pruneStudyMessages(compactArtifactMessages(rawHistory));
      const compacted = await compactHistory({
        messages: prunedHistory,
        shouldCompact: contextTruncated,
        sessionId: body.id,
        abortSignal: generationSignal,
        modelId: provider.registryId,
        isCustom: provider.isCustom,
        custom: effectiveCustom,
      });
      const historyMessages = compacted.messages;
      const startedAt = Date.now();
      const result = await bundle.agent.stream({
        messages: historyMessages,
        abortSignal: generationSignal,
      });

      // 手动转发而非 writer.merge：保证 usage / breakdown / followup 等 data part 与 finish 严格排在正文之后。
      let streamFailed = false;
      try {
        for await (const chunk of result.toUIMessageStream<ChatMessage>({
          sendReasoning: true, sendStart: true, sendFinish: false, onError: formatError,
        })) {
          writer.write(chunk);
          if (chunk.type === "error" || chunk.type === "abort") {
            // SDK failures are stream data, not necessarily rejected result promises.
            // Stop the provider and never run a second, billable follow-up request.
            generationAbort.abort();
            streamFailed = true;
            break;
          }
        }
      } catch {
        generationAbort.abort();
        streamFailed = true;
      }

      const aborted = streamFailed || generationSignal.aborted;
      const selectedModelId = modelId ?? effectiveModelId;
      const actualProvider = resolved.getActualProvider();
      const actualModelId = resolveActualBillingModelId(actualProvider);
      const usedPlatform = usedPlatformCredentialsForProvider(actualProvider);
      const pool = resolveMainModelPool(usedPlatform);
      // 上游 usage 到手即记账；abort/error 也走这里，不依赖客户端是否还连着 SSE。
      // BYOK 主模型不进任何池、不落行。
      const settled = await settleChatUsage({
        rawUsage: await awaitUsage(result.totalUsage),
        userId,
        selectedModelId,
        actualModelId,
        customGroups,
        pool: pool ?? undefined,
        skipInsert: pool == null,
        sessionId: body.id,
        requestId,
        aborted,
      });
      if (aborted) return;

      const [steps, finalText, finishReason] = await Promise.all([
        result.steps, result.text, result.finishReason,
      ]);

      // 第 6 步仍要工具且无第 7 次 LLM：SDK finishReason 为 tool-calls。
      if (finishReason === "tool-calls") {
        writer.write({
          type: "data-info",
          data: { message: TOOL_STEP_LIMIT_INFO },
          transient: true,
        });
      }

      // FollowUp 兜底：模型未输出 <FollowUp> 标签时，用轻量模型生成追问
      if (finalText && !/<FollowUp>[\s\S]*?<\/FollowUp>/i.test(finalText)) {
        const questions = await generateFallbackFollowUps({
          userText,
          answerText: finalText,
          modelId: provider.registryId,
          isCustom: provider.isCustom,
          custom: effectiveCustom,
          abortSignal: generationSignal,
        });
        if (questions.length > 0) writer.write({ type: "data-followup", data: { questions } });
      }

      writer.write({
        type: "data-context-breakdown",
        data: computeContextBreakdown({
          promptParts: bundle.promptParts,
          tools: bundle.tools,
          historyMessages,
          steps,
          clientContextTokens: body.clientContextTokens ?? null,
          truncated: contextTruncated,
          cacheHit: ctxResult.cacheHit,
          warning: contextTruncated ? CONTEXT_WARNING : undefined,
        }),
      });

      if (settled.summary) {
        writer.write({ type: "data-usage", data: settled.summary });
      }
      writer.write({
        type: "message-metadata",
        messageMetadata: {
          ...(settled.summary ? { usage: settled.summary } : {}),
          durationMs: Date.now() - startedAt,
          modelId: modelId ?? effectiveModelId,
          finishReason,
        },
      });
      writer.write({ type: "finish", finishReason });
    })),
  });

  return withSseHeartbeat(
    createUIMessageStreamResponse({
      stream,
      headers: {
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    }),
  );
}
