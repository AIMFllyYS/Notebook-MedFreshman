// SSE 心跳保活：定期向响应体写入 `: heartbeat` 注释行，防止反向代理 / 网关在
// LLM 首 token 延迟期间因 idle timeout 断开连接。
// SSE 规范规定以冒号开头的行是注释，AI SDK 客户端解析器会直接忽略。
//
// 两种模式：
//  - 默认（首 chunk 前）：只在首个真实 chunk 到达前保活。适合"首个 token 慢"的场景。
//  - keepaliveWhileIdle：首 chunk 之后**继续**保活，但只在"距上一个真实 chunk 超过
//    一个心跳间隔"时才写注释；正常持续输出时一个字节都不多发。
//    为什么需要它：深度思考模型常常"先吐 role 帧、再闷头思考几十秒"，这段静默既不在
//    首字节超时的保护范围内（那只管"零 chunk"），又会撞上客户端 stall watchdog。
//    客户端的字节层 onActivity 能收到注释并续期看门狗（见 lib/chat/createStallWatchdog.ts）。

const HEARTBEAT_BYTES = new TextEncoder().encode(": heartbeat\n\n");

export interface SseHeartbeatOptions {
  /** 心跳间隔（毫秒）。 */
  intervalMs?: number;
  /**
   * 首 chunk 之后是否继续保活：true = 空闲补心跳，流持续输出时不发。
   * 默认 false，保持"只护首 token 延迟"的历史行为。
   */
  keepaliveWhileIdle?: boolean;
}

export function withSseHeartbeat(
  response: Response,
  intervalMsOrOptions: number | SseHeartbeatOptions = 15_000,
): Response {
  const body = response.body;
  if (!body) return response;

  const options: SseHeartbeatOptions =
    typeof intervalMsOrOptions === "number" ? { intervalMs: intervalMsOrOptions } : intervalMsOrOptions;
  const intervalMs = options.intervalMs ?? 15_000;
  const keepaliveWhileIdle = options.keepaliveWhileIdle === true;

  let timer: ReturnType<typeof setInterval> | null = null;
  let firstChunkSeen = false;
  let lastChunkAt = Date.now();

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const stream = new TransformStream<Uint8Array, Uint8Array>({
    start(controller) {
      timer = setInterval(() => {
        try {
          if (!firstChunkSeen) {
            controller.enqueue(HEARTBEAT_BYTES);
            return;
          }
          if (!keepaliveWhileIdle) return stop();
          // 空闲保活：最近一个间隔内有过真实数据就不发，避免逐字节尾随。
          if (Date.now() - lastChunkAt >= intervalMs) controller.enqueue(HEARTBEAT_BYTES);
        } catch {
          stop();
        }
      }, intervalMs);
    },
    transform(chunk, controller) {
      firstChunkSeen = true;
      lastChunkAt = Date.now();
      if (!keepaliveWhileIdle) stop();
      controller.enqueue(chunk);
    },
    flush: stop,
  });

  return new Response(body.pipeThrough(stream), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
