// 非标准思考字段归一化。
//
// @ai-sdk/openai-compatible 只识别 delta.reasoning_content / delta.reasoning。部分中转网关
// （尤其把 Claude extended thinking 转成 OpenAI 格式的代理）会把思考放在 delta.thinking、
// delta.reasoning_details，甚至是 { type: "thinking", thinking: "..." } 这类结构化对象或数组。
// 这里用一个包装 fetch 在 SSE 层把这些字段改写成 reasoning_content，其余字节原样透传，
// 让 provider 之上的所有逻辑保持标准。

const STANDARD_FIELDS = new Set(["reasoning_content", "reasoning"]);

/** 从字符串 / 数组 / {text|thinking|content} 对象里抽出纯文本思考增量。 */
export function extractReasoningText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(extractReasoningText).join("");
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.text === "string") return obj.text;
    if (typeof obj.thinking === "string") return obj.thinking;
    if (typeof obj.content === "string") return obj.content;
    if (Array.isArray(obj.content)) return extractReasoningText(obj.content);
  }
  return "";
}

/** 是否需要包装：只有字段名不在标准集合内时才启用（避免无谓的流改写开销）。 */
export function needsReasoningNormalization(field: string | undefined): field is string {
  return !!field && !STANDARD_FIELDS.has(field);
}

/** 改写单个 delta / message 对象；返回是否有改动。 */
export function normalizeReasoningObject(target: Record<string, unknown>, field: string): boolean {
  if (typeof target.reasoning_content === "string" && target.reasoning_content) return false;
  const candidates = [field, "reasoning_details", "thinking", "reasoning_text"];
  for (const key of candidates) {
    if (!(key in target)) continue;
    const text = extractReasoningText(target[key]);
    if (text) {
      target.reasoning_content = text;
      return true;
    }
  }
  return false;
}

/** 改写一条 SSE `data:` 行的 JSON 载荷；解析失败或无改动时返回原行。 */
export function normalizeSseLine(line: string, field: string): string {
  if (!line.startsWith("data:")) return line;
  const payload = line.slice(5).trim();
  if (!payload || payload === "[DONE]") return line;
  let json: { choices?: Array<{ delta?: Record<string, unknown>; message?: Record<string, unknown> }> };
  try {
    json = JSON.parse(payload);
  } catch {
    return line;
  }
  let changed = false;
  for (const choice of json.choices ?? []) {
    if (choice.delta && normalizeReasoningObject(choice.delta, field)) changed = true;
    if (choice.message && normalizeReasoningObject(choice.message, field)) changed = true;
  }
  return changed ? `data: ${JSON.stringify(json)}` : line;
}

function createSseNormalizeTransform(field: string): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        controller.enqueue(encoder.encode(normalizeSseLine(line, field) + "\n"));
      }
    },
    flush(controller) {
      if (buffer) controller.enqueue(encoder.encode(normalizeSseLine(buffer, field)));
    },
  });
}

/**
 * 返回一个包装 fetch：流式响应逐行改写 SSE，非流式 JSON 响应改写 choices[].message。
 * 传给 createOpenAICompatible({ fetch })。
 */
export function createReasoningNormalizingFetch(
  field: string,
  baseFetch: typeof fetch = fetch,
): typeof fetch {
  return async (input, init) => {
    const res = await baseFetch(input, init);
    if (!res.ok || !res.body) return res;
    const contentType = res.headers.get("content-type") ?? "";
    // 正文被改写后长度/编码已变，不能沿用这两个头。
    const headers = new Headers(res.headers);
    headers.delete("content-length");
    headers.delete("content-encoding");
    if (contentType.includes("text/event-stream")) {
      return new Response(res.body.pipeThrough(createSseNormalizeTransform(field)), {
        status: res.status,
        statusText: res.statusText,
        headers,
      });
    }
    if (contentType.includes("application/json")) {
      const text = await res.text();
      const normalized = normalizeSseLine(`data: ${text}`, field);
      const body = normalized.startsWith("data: ") ? normalized.slice(6) : text;
      return new Response(body, { status: res.status, statusText: res.statusText, headers });
    }
    return res;
  };
}
