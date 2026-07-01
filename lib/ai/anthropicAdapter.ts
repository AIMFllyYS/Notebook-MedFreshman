// Anthropic Messages 协议适配器：把 OpenAI Chat Completions 形状的请求 / 响应流
// 双向翻译成 Anthropic /v1/messages 协议。目的是让 route.ts 的主循环（工具、usage、
// FollowUp）保持零改动，只在发起 fetch 前后加两层转换。
//
// 支持特性：
//   - system 消息抽到顶层
//   - 图片 image_url（http/data URL）→ image block（url / base64）
//   - assistant.tool_calls ↔ tool_use blocks（id 直通，两侧都保留 toolu_xxx）
//   - role:"tool" ↔ role:"user" + tool_result block
//   - tools[].function.parameters ↔ tools[].input_schema
//   - tool_choice: "auto" | "none" | {function:{name}} ↔ Anthropic 三态
//   - thinking / extended thinking：注入 max_tokens、budget_tokens、temperature=1
//   - 流式：text_delta → content、thinking_delta → reasoning、
//           tool_use + input_json_delta → tool_calls
//   - usage 输入/输出 token 累加

const ANTHROPIC_VERSION = "2023-06-01";
const ANTHROPIC_THINKING_BETA = "interleaved-thinking-2025-05-14";
const DEFAULT_MAX_TOKENS = 8192;
const THINKING_MAX_TOKENS_MIN = 16000;

export interface BuildAnthropicRequestArgs {
  baseUrl: string;
  apiKey: string;
  /** OpenAI 形状的请求体（route.ts 里已经组装好的 reqBody）。 */
  openaiBody: Record<string, unknown>;
}

export interface AnthropicHttpRequest {
  url: string;
  headers: Record<string, string>;
  body: string;
}

interface AnthropicContentBlock {
  type: string;
  [key: string]: unknown;
}

interface AnthropicMessage {
  role: "user" | "assistant";
  content: AnthropicContentBlock[];
}

// ────────────────────────────────────────────────────────────────
// 请求翻译：OpenAI → Anthropic
// ────────────────────────────────────────────────────────────────

function joinBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/+$/, "");
  // 兼容用户填 https://api.anthropic.com（不带 /v1）与 https://api.anthropic.com/v1
  // 以及各种 One-API 中转（如 https://xxx.com/anthropic）。策略：
  // - 如果末尾已是 /v1 则拼 /messages
  // - 否则拼 /v1/messages
  if (/\/v1$/.test(trimmed)) return `${trimmed}/messages`;
  return `${trimmed}/v1/messages`;
}

function extractImagePart(url: string): AnthropicContentBlock | null {
  if (!url) return null;
  const dataMatch = /^data:([^;]+);base64,(.*)$/i.exec(url);
  if (dataMatch) {
    return {
      type: "image",
      source: {
        type: "base64",
        media_type: dataMatch[1],
        data: dataMatch[2],
      },
    };
  }
  if (/^https?:\/\//i.test(url)) {
    return {
      type: "image",
      source: { type: "url", url },
    };
  }
  return null;
}

function convertUserAssistantContent(
  content: unknown,
): AnthropicContentBlock[] {
  if (typeof content === "string") {
    if (!content) return [];
    return [{ type: "text", text: content }];
  }
  if (!Array.isArray(content)) return [];
  const blocks: AnthropicContentBlock[] = [];
  for (const part of content) {
    if (!part || typeof part !== "object") continue;
    const p = part as Record<string, unknown>;
    if (p.type === "text" && typeof p.text === "string") {
      blocks.push({ type: "text", text: p.text });
      continue;
    }
    if (p.type === "image_url") {
      const imgUrl =
        typeof p.image_url === "string"
          ? p.image_url
          : (p.image_url as { url?: string } | undefined)?.url;
      const block = extractImagePart(imgUrl ?? "");
      if (block) blocks.push(block);
    }
  }
  return blocks;
}

function convertToolChoice(
  choice: unknown,
): Record<string, unknown> | undefined {
  if (!choice) return undefined;
  if (choice === "auto") return { type: "auto" };
  if (choice === "none") return { type: "none" };
  if (choice === "required") return { type: "any" };
  if (typeof choice === "object") {
    const c = choice as Record<string, unknown>;
    if (c.type === "function") {
      const fn = c.function as { name?: string } | undefined;
      if (fn?.name) return { type: "tool", name: fn.name };
    }
  }
  return undefined;
}

function convertTools(tools: unknown): Record<string, unknown>[] | undefined {
  if (!Array.isArray(tools) || tools.length === 0) return undefined;
  const out: Record<string, unknown>[] = [];
  for (const t of tools) {
    if (!t || typeof t !== "object") continue;
    const fn = (t as { function?: Record<string, unknown> }).function;
    if (!fn || typeof fn.name !== "string") continue;
    out.push({
      name: fn.name,
      description: typeof fn.description === "string" ? fn.description : "",
      input_schema:
        (fn.parameters as Record<string, unknown> | undefined) ?? {
          type: "object",
          properties: {},
        },
    });
  }
  return out.length > 0 ? out : undefined;
}

interface ConvertMessagesResult {
  system?: string;
  messages: AnthropicMessage[];
}

function convertMessages(rawMessages: unknown): ConvertMessagesResult {
  const messages = Array.isArray(rawMessages) ? rawMessages : [];
  const systemParts: string[] = [];
  const out: AnthropicMessage[] = [];

  const pushMessage = (msg: AnthropicMessage) => {
    if (msg.content.length === 0) return;
    // Anthropic 要求同角色相邻消息合并
    const last = out[out.length - 1];
    if (last && last.role === msg.role) {
      last.content.push(...msg.content);
    } else {
      out.push(msg);
    }
  };

  for (const raw of messages) {
    if (!raw || typeof raw !== "object") continue;
    const m = raw as Record<string, unknown>;
    const role = m.role;

    if (role === "system") {
      if (typeof m.content === "string") {
        systemParts.push(m.content);
      } else if (Array.isArray(m.content)) {
        for (const p of m.content) {
          if (p && typeof p === "object" && (p as Record<string, unknown>).type === "text") {
            const t = (p as Record<string, unknown>).text;
            if (typeof t === "string") systemParts.push(t);
          }
        }
      }
      continue;
    }

    if (role === "tool") {
      const toolUseId =
        typeof m.tool_call_id === "string" ? m.tool_call_id : "";
      const contentText =
        typeof m.content === "string"
          ? m.content
          : Array.isArray(m.content)
            ? (m.content as Array<{ text?: string }>)
                .map((p) => p?.text ?? "")
                .join("")
            : "";
      pushMessage({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUseId,
            content: contentText,
          },
        ],
      });
      continue;
    }

    if (role === "user") {
      pushMessage({
        role: "user",
        content: convertUserAssistantContent(m.content),
      });
      continue;
    }

    if (role === "assistant") {
      const blocks: AnthropicContentBlock[] = [];
      const textBlocks = convertUserAssistantContent(m.content);
      blocks.push(...textBlocks);
      const toolCalls = m.tool_calls;
      if (Array.isArray(toolCalls)) {
        for (const tc of toolCalls) {
          if (!tc || typeof tc !== "object") continue;
          const call = tc as Record<string, unknown>;
          const fn = call.function as
            | { name?: string; arguments?: string }
            | undefined;
          const id = typeof call.id === "string" ? call.id : "";
          if (!fn?.name || !id) continue;
          let input: Record<string, unknown> = {};
          if (typeof fn.arguments === "string" && fn.arguments.trim()) {
            try {
              input = JSON.parse(fn.arguments);
            } catch {
              input = {};
            }
          }
          blocks.push({ type: "tool_use", id, name: fn.name, input });
        }
      }
      pushMessage({ role: "assistant", content: blocks });
    }
  }

  return {
    system: systemParts.length > 0 ? systemParts.join("\n\n") : undefined,
    messages: out,
  };
}

/**
 * 把 route.ts 组装的 OpenAI 形状 reqBody 翻译成 Anthropic /v1/messages 请求。
 * 保留原逻辑对 max_tokens / temperature / thinking 的意图。
 */
export function buildAnthropicRequest(
  args: BuildAnthropicRequestArgs,
): AnthropicHttpRequest {
  const { baseUrl, apiKey, openaiBody } = args;
  const body = { ...openaiBody };

  const { system, messages } = convertMessages(body.messages);
  const tools = convertTools(body.tools);
  const toolChoice = convertToolChoice(body.tool_choice);

  // Anthropic thinking 参数：openai 端是 { thinking: { type:"enabled", budget_tokens } }
  const thinkingParam = body.thinking as
    | { type?: string; budget_tokens?: number }
    | undefined;
  const thinkingEnabled = thinkingParam?.type === "enabled";
  const budgetTokens =
    typeof thinkingParam?.budget_tokens === "number"
      ? thinkingParam.budget_tokens
      : 4096;

  // Anthropic 强制要求 max_tokens；thinking 模式下必须 > budget_tokens
  const requestedMaxTokens =
    typeof body.max_tokens === "number" ? body.max_tokens : undefined;
  const maxTokens = thinkingEnabled
    ? Math.max(
        requestedMaxTokens ?? 0,
        budgetTokens + 4096,
        THINKING_MAX_TOKENS_MIN,
      )
    : (requestedMaxTokens ?? DEFAULT_MAX_TOKENS);

  // thinking 模式下 temperature 必须为 1（Anthropic 硬性约束）
  const temperature = thinkingEnabled
    ? 1
    : typeof body.temperature === "number"
      ? body.temperature
      : undefined;

  const anthropicBody: Record<string, unknown> = {
    model: body.model,
    messages,
    max_tokens: maxTokens,
    stream: true,
  };
  if (system) anthropicBody.system = system;
  if (temperature !== undefined) anthropicBody.temperature = temperature;
  if (tools) anthropicBody.tools = tools;
  if (toolChoice) anthropicBody.tool_choice = toolChoice;
  if (thinkingEnabled) {
    anthropicBody.thinking = {
      type: "enabled",
      budget_tokens: budgetTokens,
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": ANTHROPIC_VERSION,
    // 兼容 One-API/Anthropic 官方两种鉴权：OpenRouter 之类 gateway 认 Authorization
    Authorization: `Bearer ${apiKey}`,
  };
  if (thinkingEnabled) {
    headers["anthropic-beta"] = ANTHROPIC_THINKING_BETA;
  }

  return {
    url: joinBaseUrl(baseUrl),
    headers,
    body: JSON.stringify(anthropicBody),
  };
}

// ────────────────────────────────────────────────────────────────
// 响应流翻译：Anthropic SSE → OpenAI SSE（chat/completions.chunk 形状）
// ────────────────────────────────────────────────────────────────

interface OpenAiChunkDelta {
  content?: string;
  reasoning?: string;
  tool_calls?: Array<{
    index: number;
    id?: string;
    type?: "function";
    function?: { name?: string; arguments?: string };
  }>;
}

interface OpenAiChunk {
  choices?: Array<{
    index?: number;
    delta?: OpenAiChunkDelta;
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

function mapStopReason(reason: unknown): string | undefined {
  switch (reason) {
    case "end_turn":
    case "stop_sequence":
      return "stop";
    case "tool_use":
      return "tool_calls";
    case "max_tokens":
      return "length";
    default:
      return undefined;
  }
}

/**
 * 把 Anthropic SSE 输入流转换成 OpenAI 兼容形状的 SSE 输出流。
 * route.ts 的循环按行读 `data:` 前缀并 JSON.parse 为 StreamChunk，因此我们只需要
 * 输出同样格式的 SSE 行，其他逻辑（工具、reasoning、usage）都能复用。
 */
export function anthropicStreamToOpenAI(
  input: ReadableStream<Uint8Array>,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = input.getReader();

  // 每个 content_block index 的角色映射
  const blockKind = new Map<
    number,
    "text" | "thinking" | "tool_use" | "other"
  >();
  const toolBlockIndexMap = new Map<number, number>(); // anthropic block index → openai tool_calls index
  let nextToolIndex = 0;
  let promptTokens = 0;
  let completionTokens = 0;

  const emitLine = (
    controller: ReadableStreamDefaultController<Uint8Array>,
    chunk: OpenAiChunk,
  ) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
  };

  const handleEvent = (
    controller: ReadableStreamDefaultController<Uint8Array>,
    payload: Record<string, unknown>,
  ) => {
    const type = payload.type;

    if (type === "message_start") {
      const usage = (payload.message as { usage?: Record<string, number> } | undefined)
        ?.usage;
      if (usage) {
        promptTokens += usage.input_tokens ?? 0;
        completionTokens += usage.output_tokens ?? 0;
      }
      return;
    }

    if (type === "content_block_start") {
      const index =
        typeof payload.index === "number" ? payload.index : 0;
      const block = payload.content_block as Record<string, unknown> | undefined;
      const blockType = block?.type;
      if (blockType === "text") {
        blockKind.set(index, "text");
      } else if (blockType === "thinking") {
        blockKind.set(index, "thinking");
        // thinking 首块可能带有 thinking 字段的初始文本
        const initial = block?.thinking;
        if (typeof initial === "string" && initial.length > 0) {
          emitLine(controller, {
            choices: [{ index: 0, delta: { reasoning: initial } }],
          });
        }
      } else if (blockType === "tool_use") {
        blockKind.set(index, "tool_use");
        const toolIndex = nextToolIndex++;
        toolBlockIndexMap.set(index, toolIndex);
        emitLine(controller, {
          choices: [
            {
              index: 0,
              delta: {
                tool_calls: [
                  {
                    index: toolIndex,
                    id: typeof block?.id === "string" ? block.id : `toolu_${toolIndex}`,
                    type: "function",
                    function: {
                      name:
                        typeof block?.name === "string" ? block.name : "",
                      arguments: "",
                    },
                  },
                ],
              },
            },
          ],
        });
      } else {
        blockKind.set(index, "other");
      }
      return;
    }

    if (type === "content_block_delta") {
      const index = typeof payload.index === "number" ? payload.index : 0;
      const delta = payload.delta as Record<string, unknown> | undefined;
      if (!delta) return;
      const kind = blockKind.get(index);
      if (delta.type === "text_delta" && kind === "text") {
        const text = typeof delta.text === "string" ? delta.text : "";
        if (text) {
          emitLine(controller, {
            choices: [{ index: 0, delta: { content: text } }],
          });
        }
        return;
      }
      if (delta.type === "thinking_delta" && kind === "thinking") {
        const text = typeof delta.thinking === "string" ? delta.thinking : "";
        if (text) {
          emitLine(controller, {
            choices: [{ index: 0, delta: { reasoning: text } }],
          });
        }
        return;
      }
      if (delta.type === "input_json_delta" && kind === "tool_use") {
        const partial =
          typeof delta.partial_json === "string" ? delta.partial_json : "";
        const toolIndex = toolBlockIndexMap.get(index) ?? 0;
        if (partial) {
          emitLine(controller, {
            choices: [
              {
                index: 0,
                delta: {
                  tool_calls: [
                    {
                      index: toolIndex,
                      function: { arguments: partial },
                    },
                  ],
                },
              },
            ],
          });
        }
        return;
      }
      // signature_delta / 其他 delta 忽略
      return;
    }

    if (type === "content_block_stop") {
      // 无需转发；OpenAI 侧的工具调用聚合以最后 finish_reason 为准
      return;
    }

    if (type === "message_delta") {
      const delta = payload.delta as { stop_reason?: unknown } | undefined;
      const usage = payload.usage as { output_tokens?: number } | undefined;
      if (usage?.output_tokens) {
        // Anthropic 的 message_delta.usage.output_tokens 通常是累计值
        completionTokens = Math.max(completionTokens, usage.output_tokens);
      }
      const finish = mapStopReason(delta?.stop_reason);
      if (finish) {
        emitLine(controller, {
          choices: [{ index: 0, delta: {}, finish_reason: finish }],
        });
      }
      return;
    }

    if (type === "message_stop") {
      // 输出最终 usage 块并发送 [DONE]
      emitLine(controller, {
        usage: {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: promptTokens + completionTokens,
        },
      });
      return;
    }

    if (type === "error") {
      const err = payload.error as { message?: string; type?: string } | undefined;
      const message =
        (err?.message as string | undefined) ?? "Anthropic upstream error";
      // 走 route.ts 的 catch 路径不方便；这里塞成一个特殊 chunk 让上层识别
      // 实际错误在非 200 分支中已被 res.text() 捕获；此处仅为流内错误兜底。
      emitLine(controller, {
        choices: [
          { index: 0, delta: { content: `\n[Anthropic 错误] ${message}\n` } },
        ],
      });
      return;
    }
  };

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Anthropic SSE 也按空行分事件；这里逐行找 `data:` 开头。
          let nl: number;
          while ((nl = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, nl).trim();
            buffer = buffer.slice(nl + 1);
            if (!line) continue;
            if (line.startsWith("event:")) continue; // 事件类型行忽略；用 payload.type
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            let payload: Record<string, unknown>;
            try {
              payload = JSON.parse(data);
            } catch {
              continue;
            }
            handleEvent(controller, payload);
          }
        }
        // 收尾：确保 [DONE]
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}
