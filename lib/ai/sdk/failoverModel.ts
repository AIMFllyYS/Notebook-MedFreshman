// endpoints 链容灾：把多个 LanguageModelV4 串成一个模型，主端点在「尚未产出任何 chunk」
// 时失败（可恢复的 5xx / 特定 400 code / 超时）则切到下一个；一旦开始流式输出就不再切换，
// 避免把两个端点的半截回答拼在一起。
//
// 也承载生图模式「文本模型不可用 → 降级到备用文本模型」的场景（链就是 [primary, fallback]）。

import type {
  LanguageModelV4,
  LanguageModelV4CallOptions,
  LanguageModelV4GenerateResult,
  LanguageModelV4StreamPart,
  LanguageModelV4StreamResult,
} from "@ai-sdk/provider";
import { APICallError } from "@ai-sdk/provider";
import { isRecoverableUpstreamFailure, parseUpstreamErrorBody, isFetchAbortError } from "@/lib/ai/upstream";

export interface FailoverCandidate {
  model: LanguageModelV4;
  /** 供 onFailover 回调展示（如 apiModelId）。 */
  label: string;
}

export interface FailoverOptions {
  /** 切换到下一候选时触发；index 为新候选在链中的下标。 */
  onFailover?: (next: FailoverCandidate, index: number, error: unknown) => void;
  /** 自定义可恢复判定；默认按 upstream.ts 的规则 + 超时 abort。 */
  isRecoverable?: (error: unknown) => boolean;
}

/** 默认判定：上游 502/503/504、智谱/SF 的可恢复 400 code、以及超时导致的 abort。 */
export function defaultIsRecoverable(error: unknown): boolean {
  if (APICallError.isInstance(error)) {
    const status = error.statusCode ?? 0;
    const code = error.responseBody ? parseUpstreamErrorBody(error.responseBody).errorCode : undefined;
    return isRecoverableUpstreamFailure(status, code);
  }
  // fetch 层面的网络错误 / 超时（AbortSignal.timeout 触发的是 TimeoutError，也视为可恢复）
  if (isFetchAbortError(error)) return true;
  if (error instanceof Error && (error.name === "TimeoutError" || /fetch failed|ECONNRESET|ENOTFOUND/i.test(error.message))) {
    return true;
  }
  return false;
}

export function createFailoverLanguageModel(
  candidates: FailoverCandidate[],
  options: FailoverOptions = {},
): LanguageModelV4 {
  if (candidates.length === 0) throw new Error("createFailoverLanguageModel: 至少需要一个候选模型");
  if (candidates.length === 1) return candidates[0].model;

  const primary = candidates[0].model;
  const isRecoverable = options.isRecoverable ?? defaultIsRecoverable;

  // 用户主动取消不应触发切换：只有非用户 abort 才算可恢复。
  const shouldFailover = (error: unknown, signal: AbortSignal | undefined, index: number) =>
    index < candidates.length - 1 && !(signal?.aborted && isFetchAbortError(error)) && isRecoverable(error);

  return {
    specificationVersion: "v4",
    provider: primary.provider,
    modelId: primary.modelId,
    supportedUrls: primary.supportedUrls,

    async doGenerate(callOptions: LanguageModelV4CallOptions): Promise<LanguageModelV4GenerateResult> {
      let lastError: unknown;
      for (let i = 0; i < candidates.length; i++) {
        try {
          return await candidates[i].model.doGenerate(callOptions);
        } catch (err) {
          lastError = err;
          if (!shouldFailover(err, callOptions.abortSignal, i)) throw err;
          options.onFailover?.(candidates[i + 1], i + 1, err);
        }
      }
      throw lastError;
    },

    async doStream(callOptions: LanguageModelV4CallOptions): Promise<LanguageModelV4StreamResult> {
      let lastError: unknown;
      for (let i = 0; i < candidates.length; i++) {
        let result: LanguageModelV4StreamResult;
        try {
          result = await candidates[i].model.doStream(callOptions);
        } catch (err) {
          lastError = err;
          if (!shouldFailover(err, callOptions.abortSignal, i)) throw err;
          options.onFailover?.(candidates[i + 1], i + 1, err);
          continue;
        }

        // doStream 成功返回并不代表上游已开始输出：部分 provider 把 HTTP 错误延后成流内 error part。
        // 因此还要窥探首个 chunk——若首个 chunk 就是 error 且可恢复，同样切换。
        const reader = result.stream.getReader();
        const first = await reader.read();
        if (!first.done && first.value.type === "error" && shouldFailover(first.value.error, callOptions.abortSignal, i)) {
          reader.releaseLock();
          await result.stream.cancel().catch(() => {});
          lastError = first.value.error;
          options.onFailover?.(candidates[i + 1], i + 1, first.value.error);
          continue;
        }

        // 把窥探过的首个 chunk 放回流头。
        const replayed = new ReadableStream<LanguageModelV4StreamPart>({
          async start(controller) {
            if (!first.done) controller.enqueue(first.value);
          },
          async pull(controller) {
            const { done, value } = await reader.read();
            if (done) controller.close();
            else controller.enqueue(value);
          },
          cancel(reason) {
            return reader.cancel(reason);
          },
        });
        return { ...result, stream: replayed };
      }
      throw lastError;
    },
  };
}
