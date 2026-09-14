import { REQUEST_TOO_LARGE_MESSAGE, isPayloadTooLargeError } from "@/lib/chat/requestBudget";
import { formatLoginRequiredError } from "@/lib/auth/loginHint";

export function classifySendError(
  err: unknown,
  flags: { stalled: boolean; aborted: boolean },
): string | null {
  if (flags.stalled) return "连接超过 60 秒没有响应，请重试。";
  const isAbort =
    flags.aborted ||
    (err != null && typeof err === "object" && "name" in err && err.name === "AbortError");
  if (isAbort) return null;
  if (isPayloadTooLargeError(err)) return REQUEST_TOO_LARGE_MESSAGE;
  const raw = err instanceof Error ? err.message : "发生未知错误";
  return formatLoginRequiredError(raw);
}
