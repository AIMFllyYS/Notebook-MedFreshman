// 非标准思考字段归一化。
//
// @ai-sdk/openai-compatible 只识别 delta.reasoning_content / delta.reasoning。部分中转网关
// （尤其把 Claude extended thinking 转成 OpenAI 格式的代理）会把思考放在 delta.thinking、
// delta.reasoning_details，甚至是 { type: "thinking", thinking: "..." } 这类结构化对象或数组。
// 字段名是标准的，也不代表字段值一定是字符串。所有 OpenAI 兼容响应都经过这个轻量
// fetch 包装；只转换可识别的思考结构，不掩盖其他协议错误，未改动的 SSE 行保留原始字节。

const STANDARD_FIELDS = ["reasoning_content", "reasoning"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

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

/** 标准字段受 SDK 类型校验：数组的每一项都须可识别，不能把未知数据静默丢弃。 */
function readStructuredReasoning(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const parts = value.map(readStructuredReasoning);
    return parts.every((part) => part !== undefined) ? parts.join("") : undefined;
  }
  if (isRecord(value)) {
    if (typeof value.text === "string") return value.text;
    if (typeof value.thinking === "string") return value.thinking;
    if (typeof value.content === "string") return value.content;
    if (Array.isArray(value.content)) return readStructuredReasoning(value.content);
  }
  return undefined;
}

/** 改写单个 delta / message 对象；返回是否有改动。 */
export function normalizeReasoningObject(target: Record<string, unknown>, field: string): boolean {
  let changed = false;
  for (const key of STANDARD_FIELDS) {
    const value = target[key];
    if (value == null || typeof value === "string") continue;
    const text = readStructuredReasoning(value);
    if (text !== undefined) {
      target[key] = text;
      changed = true;
    }
  }

  const primary = target.reasoning_content;
  if (typeof primary === "string" && primary) return changed;
  // 不能用别名覆盖格式错误的标准字段；应交给 SDK 报告真正的协议错误。
  if (primary != null && typeof primary !== "string") return changed;
  if (target.reasoning != null && typeof target.reasoning !== "string") return changed;
  if (typeof target.reasoning === "string" && target.reasoning) {
    // SDK 原生识别 reasoning，无需在标准字符串响应中重复注入字段。
    if (primary == null) return changed;
    // SDK 使用 ?? 选择字段；空 reasoning_content 会挡住有效的 reasoning。
    target.reasoning_content = target.reasoning;
    return true;
  }

  const candidates = [field, "reasoning_details", "thinking", "reasoning_text"];
  for (const key of candidates) {
    if (!(key in target)) continue;
    const text = extractReasoningText(target[key]);
    if (text) {
      target.reasoning_content = text;
      return true;
    }
  }
  return changed;
}

/** 改写一条 SSE `data:` 行的 JSON 载荷；解析失败或无改动时返回原行。 */
export function normalizeSseLine(line: string, field: string): string {
  if (!line.startsWith("data:")) return line;
  const payload = line.slice(5).trim();
  if (!payload || payload === "[DONE]") return line;
  let json: unknown;
  try {
    json = JSON.parse(payload);
  } catch {
    return line;
  }
  if (!isRecord(json) || "error" in json || !Array.isArray(json.choices)) return line;
  let changed = false;
  for (const choice of json.choices) {
    if (!isRecord(choice)) continue;
    if (isRecord(choice.delta) && normalizeReasoningObject(choice.delta, field)) changed = true;
    if (isRecord(choice.message) && normalizeReasoningObject(choice.message, field)) changed = true;
  }
  return changed ? `data: ${JSON.stringify(json)}${line.endsWith("\r") ? "\r" : ""}` : line;
}

function createSseNormalizeTransform(field: string): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
  const encoder = new TextEncoder();
  let buffer: Uint8Array = new Uint8Array(0);

  function normalizeLine(bytes: Uint8Array, lineEnd: number): Uint8Array {
    // 非 data 行（注释、心跳、event/id 等）不需要解码。
    if (bytes[0] !== 100 || bytes[1] !== 97 || bytes[2] !== 116 || bytes[3] !== 97 || bytes[4] !== 58) return bytes;
    let line: string;
    try {
      line = decoder.decode(bytes.subarray(0, lineEnd));
    } catch {
      // 非法 UTF-8 留给 SDK 处理，不能用替换字符改写响应。
      return bytes;
    }
    const normalized = normalizeSseLine(line, field);
    if (normalized === line) return bytes;
    const data = encoder.encode(normalized);
    const result = new Uint8Array(data.length + bytes.length - lineEnd);
    result.set(data);
    result.set(bytes.subarray(lineEnd), data.length);
    return result;
  }

  return new TransformStream({
    transform(chunk, controller) {
      if (buffer.length > 0) {
        const joined = new Uint8Array(buffer.length + chunk.length);
        joined.set(buffer);
        joined.set(chunk, buffer.length);
        buffer = joined;
      } else {
        buffer = chunk;
      }
      let start = 0;
      for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];
        if (byte !== 10 && byte !== 13) continue;
        // CRLF 可以被拆到两个网络 chunk；保留末尾 CR 到下一次读取。
        if (byte === 13 && i === buffer.length - 1) break;
        const end = byte === 13 && buffer[i + 1] === 10 ? i + 2 : i + 1;
        controller.enqueue(normalizeLine(buffer.subarray(start, end), i - start));
        start = end;
        i = end - 1;
      }
      buffer = buffer.subarray(start);
    },
    flush(controller) {
      if (buffer.length > 0) {
        const lineEnd = buffer[buffer.length - 1] === 13 ? buffer.length - 1 : buffer.length;
        controller.enqueue(normalizeLine(buffer, lineEnd));
      }
    },
  });
}

/**
 * 返回一个包装 fetch：流式响应逐行改写 SSE，非流式 JSON 响应改写 choices[].message。
 * 传给 createOpenAICompatible({ fetch })。
 */
export function createReasoningNormalizingFetch(
  field = "reasoning_content",
  baseFetch?: typeof fetch,
): typeof fetch {
  return async (input, init) => {
    const res = await (baseFetch ?? fetch)(input, init);
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
