// SSE 心跳保活：在上游首个 chunk 到达前定期向响应体写入 `: heartbeat` 注释行，
// 防止 EdgeOne 等边缘节点在 LLM 首 token 延迟期间因 idle timeout 断开连接。
// SSE 规范规定以冒号开头的行是注释，AI SDK 客户端解析器会直接忽略。

const HEARTBEAT_BYTES = new TextEncoder().encode(": heartbeat\n\n");

export function withSseHeartbeat(response: Response, intervalMs = 15_000): Response {
  const body = response.body;
  if (!body) return response;

  let timer: ReturnType<typeof setInterval> | null = null;
  let firstChunkSeen = false;

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const stream = new TransformStream<Uint8Array, Uint8Array>({
    start(controller) {
      timer = setInterval(() => {
        if (firstChunkSeen) return stop();
        try {
          controller.enqueue(HEARTBEAT_BYTES);
        } catch {
          stop();
        }
      }, intervalMs);
    },
    transform(chunk, controller) {
      firstChunkSeen = true;
      stop();
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
