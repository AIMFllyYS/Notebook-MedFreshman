// 全局 artifact 流注册表：子智能体 fire-and-forget 生成 HTML 时，
// 将流式状态写入此处；独立 SSE 端点 (/api/artifact-stream) 从此处读取并推给前端。
//
// 设计：
// - 模块级 Map，单进程内有效（当前部署为单实例，足够）。
// - 每个 session 持有一个 EventEmitter，新 chunk 时 emit("delta")，
//   SSE 端点 subscribe 以实现实时推送。
// - 5 分钟 TTL 自动清理，避免内存泄漏。

import { EventEmitter } from "node:events";

export interface ArtifactSession {
  id: string;
  title: string;
  chunks: string[];
  chunkIndex: number;
  done: boolean;
  html?: string;
  error?: string;
  emitter: EventEmitter;
  createdAt: number;
}

const TTL_MS = 5 * 60 * 1000;

const registry = new Map<string, ArtifactSession>();

/** 注册新 artifact 会话。 */
export function register(id: string, title: string): ArtifactSession {
  const session: ArtifactSession = {
    id,
    title,
    chunks: [],
    chunkIndex: 0,
    done: false,
    emitter: new EventEmitter(),
    createdAt: Date.now(),
  };
  registry.set(id, session);
  scheduleCleanup(id);
  return session;
}

/** 追加一个 delta chunk，并 emit 事件通知 SSE 端点。 */
export function appendChunk(id: string, delta: string): void {
  const s = registry.get(id);
  if (!s || s.done) return;
  s.chunks.push(delta);
  s.emitter.emit("delta", delta);
}

/** 标记完成，存最终 HTML，emit done 事件。 */
export function finalize(id: string, html: string): void {
  const s = registry.get(id);
  if (!s) return;
  s.done = true;
  s.html = html;
  s.emitter.emit("done", html);
  scheduleCleanup(id);
}

/** 标记失败，emit error 事件。 */
export function fail(id: string, message: string): void {
  const s = registry.get(id);
  if (!s) return;
  s.done = true;
  s.error = message;
  s.emitter.emit("error", message);
  scheduleCleanup(id);
}

/** 读取会话状态（SSE 端点用）。 */
export function get(id: string): ArtifactSession | undefined {
  return registry.get(id);
}

/** 延迟清理：TTL 后从 Map 中移除，释放 EventEmitter。 */
function scheduleCleanup(id: string): void {
  setTimeout(() => {
    const s = registry.get(id);
    if (s) {
      s.emitter.removeAllListeners();
      registry.delete(id);
    }
  }, TTL_MS);
}
