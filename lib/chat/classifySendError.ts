export function classifySendError(
  err: unknown,
  flags: { stalled: boolean; aborted: boolean },
): string | null {
  if (flags.stalled) return "连接超过 60 秒没有响应，请重试。";
  const isAbort =
    flags.aborted ||
    (err != null && typeof err === "object" && "name" in err && err.name === "AbortError");
  if (isAbort) return null;
  return err instanceof Error ? err.message : "发生未知错误";
}
