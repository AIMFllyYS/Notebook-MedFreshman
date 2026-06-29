// 上游 OpenAI 兼容 API 错误解析与容灾判定（chat/completions）。

export const DEFAULT_CHAT_TIMEOUT_MS = 45_000;

export interface ParsedUpstreamError {
  errorCode?: string;
  message?: string;
}

/** 从 HTTP 响应体解析 error code / message（智谱、SiliconFlow 等格式兼容）。 */
export function parseUpstreamErrorBody(text: string): ParsedUpstreamError {
  try {
    const j = JSON.parse(text) as Record<string, unknown>;
    const err = j.error as Record<string, unknown> | undefined;
    const code = err?.code ?? j.code;
    const message = err?.message ?? j.message;
    return {
      errorCode: code != null ? String(code) : undefined,
      message: typeof message === "string" ? message : undefined,
    };
  } catch {
    return { message: text.slice(0, 200) };
  }
}

/**
 * 是否适合切换到 endpoints 链中的下一端点。
 * 401/403/429 等鉴权/限流/余额问题不在此降级（换 key 无效）。
 */
export function isRecoverableUpstreamFailure(status: number, errorCode?: string): boolean {
  if (status === 502 || status === 503 || status === 504) return true;
  if (status === 400 && errorCode) {
    const recoverableCodes = new Set(["1211", "20012", "1210"]);
    if (recoverableCodes.has(errorCode)) return true;
  }
  return false;
}

export function isFetchAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === "AbortError") return true;
  if (err instanceof Error && err.name === "AbortError") return true;
  return false;
}
