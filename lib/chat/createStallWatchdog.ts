/** 流式请求无活动超时：默认 60s 无 touch 则 onStall。 */

export function createStallWatchdog(onStall: () => void, timeoutMs = 60_000, intervalMs = 5_000) {
  let lastActivity = Date.now();
  let stalled = false;
  const interval = setInterval(() => {
    if (!stalled && Date.now() - lastActivity > timeoutMs) {
      stalled = true;
      onStall();
    }
  }, intervalMs);
  return {
    touch() {
      lastActivity = Date.now();
    },
    stop() {
      clearInterval(interval);
    },
  };
}
