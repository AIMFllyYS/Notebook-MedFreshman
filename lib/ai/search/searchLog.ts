/** 检索链路结构化日志：单行 JSON，便于 pm2 / journald / grep。 */

type LogLevel = "info" | "warn" | "error";

const seenMessages = new Set<string>();

function emit(level: LogLevel, event: string, fields: Record<string, unknown> = {}): void {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, event, ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const searchLog = {
  info: (event: string, fields: Record<string, unknown> = {}) => emit("info", event, fields),
  warn: (event: string, fields: Record<string, unknown> = {}) => emit("warn", event, fields),
  error: (event: string, fields: Record<string, unknown> = {}) => emit("error", event, fields),
};

/** 同一 message 只打一次（进程内），替代原来全局只打第一条的 logSearchIndexOnce。 */
export function searchLogOnce(
  level: LogLevel,
  event: string,
  message: string,
  fields: Record<string, unknown> = {},
): void {
  if (seenMessages.has(message)) return;
  seenMessages.add(message);
  emit(level, event, { message, ...fields });
}

function resetSearchLogOnce(): void {
  seenMessages.clear();
}
