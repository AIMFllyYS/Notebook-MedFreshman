export interface ParsedSseJsonEvents<T = unknown> {
  events: T[];
  remaining: string;
  hadActivity: boolean;
}

export function parseSseJsonEvents<T = unknown>(buffer: string): ParsedSseJsonEvents<T> {
  const lines = buffer.split("\n");
  const remaining = lines.pop() || "";
  const events: T[] = [];

  for (const line of lines) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") continue;
    try {
      events.push(JSON.parse(data) as T);
    } catch {
      /* 忽略解析失败的完整 data 行 */
    }
  }

  return { events, remaining, hadActivity: lines.length > 0 };
}
