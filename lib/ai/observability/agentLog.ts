// Agent 生命周期 JSONL 日志：用 AI SDK 钩子落盘，只做密钥剥离，不改事件语义。
// 服务端 → 仓库 log/；Electron 子进程 → userData/logs（由主进程注入 ELECTRON_USER_DATA）。

import fs from "node:fs";
import path from "node:path";
import type { TelemetryOptions } from "ai";

export const AGENT_LOG_FILENAME = "agent-lifecycle.jsonl";

const SECRET_ENV_NAMES = [
  "RELAY_API_KEY",
  "AI_API_KEY",
  "MIMO_API_KEY",
  "ZHIPU_API_KEY",
  "UNSPLASH_ACCESS_KEY",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
] as const;

const SECRET_KEY =
  /^(?:api[_-]?key|authorization|access[_-]?token|refresh[_-]?token|client[_-]?secret|secret|password|passwd|bearer|x-api-key|x-auth-token|token)$/i;

export type AgentLogWriter = (hook: string, data: unknown) => void;

export interface AgentLogRecord {
  ts: string;
  hook: string;
  data: unknown;
}

export function resolveAgentLogPath(
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
): string {
  const override = env.AGENT_LOG_PATH?.trim();
  if (override) return override;
  const userData = env.ELECTRON_USER_DATA?.trim();
  if (userData) return path.join(userData, "logs", AGENT_LOG_FILENAME);
  return path.join(cwd, "log", AGENT_LOG_FILENAME);
}

export function collectEnvSecrets(env: NodeJS.ProcessEnv = process.env): string[] {
  const secrets: string[] = [];
  for (const name of SECRET_ENV_NAMES) {
    const value = env[name]?.trim();
    if (value && value.length >= 8) secrets.push(value);
  }
  return secrets;
}

export function toJsonSafe(value: unknown): unknown {
  const seen = new WeakSet<object>();
  const walk = (node: unknown): unknown => {
    if (node == null) return node;
    if (typeof node === "string" || typeof node === "boolean") return node;
    if (typeof node === "number") return Number.isFinite(node) ? node : String(node);
    if (typeof node === "bigint") return node.toString();
    if (typeof node === "function" || typeof node === "symbol" || typeof node === "undefined") {
      return undefined;
    }
    if (node instanceof Date) return node.toISOString();
    if (node instanceof Error) {
      return { name: node.name, message: node.message, stack: node.stack };
    }
    if (typeof Headers !== "undefined" && node instanceof Headers) {
      return Object.fromEntries(node.entries());
    }
    if (typeof node === "object") {
      if (seen.has(node)) return "[Circular]";
      seen.add(node);
      if (Array.isArray(node)) return node.map(walk);
      const out: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
        const next = walk(val);
        if (next !== undefined) out[key] = next;
      }
      return out;
    }
    return String(node);
  };
  return walk(value);
}

function redactString(value: string, secrets: string[]): string {
  let text = value;
  for (const secret of secrets) {
    if (secret) text = text.split(secret).join("[REDACTED]");
  }
  return text
    .replace(/\bBearer\s+[^\s,"'\]}]+/gi, "Bearer [REDACTED]")
    .replace(/\bsk-[a-zA-Z0-9_-]{8,}/g, "[REDACTED]")
    .replace(/([?&](?:api[_-]?key|key|token)=)[^&\s]+/gi, "$1[REDACTED]");
}

export function redactSecrets(value: unknown, extraSecrets: string[] = []): unknown {
  const secrets = [...collectEnvSecrets(), ...extraSecrets.filter((s) => s && s.length >= 8)];
  const walk = (node: unknown): unknown => {
    if (typeof node === "string") return redactString(node, secrets);
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === "object") {
      const out: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
        out[key] = SECRET_KEY.test(key) ? "[REDACTED]" : walk(val);
      }
      return out;
    }
    return node;
  };
  return walk(value);
}

export function appendAgentLog(hook: string, data: unknown, filePath = resolveAgentLogPath()): void {
  const record: AgentLogRecord = {
    ts: new Date().toISOString(),
    hook,
    data: redactSecrets(toJsonSafe(data)),
  };
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(record)}\n`, "utf8");
}

function defaultWrite(hook: string, data: unknown): void {
  if (process.env.NODE_TEST_CONTEXT && !process.env.AGENT_LOG_PATH) return;
  appendAgentLog(hook, data);
}

export function createAgentLifecycleHooks(options?: { write?: AgentLogWriter }): {
  onStepStart: (event: unknown) => void;
  onStepEnd: (event: unknown) => void;
  onStepFinish: (event: unknown) => void;
  onToolExecutionStart: (event: unknown) => void;
  onToolExecutionEnd: (event: unknown) => void;
  telemetry: TelemetryOptions;
} {
  const write = options?.write ?? defaultWrite;
  const bind = (hook: string) => (event: unknown) => {
    try {
      write(hook, event);
    } catch {
      // 日志失败不得打断对话
    }
  };

  const onStepEnd = bind("onStepEnd");
  return {
    onStepStart: bind("onStepStart"),
    onStepEnd,
    // SDK 仍接受该别名；构造时优先 onStepEnd，避免同一步写两行
    onStepFinish: onStepEnd,
    onToolExecutionStart: bind("onToolExecutionStart"),
    onToolExecutionEnd: bind("onToolExecutionEnd"),
    telemetry: {
      isEnabled: true,
      functionId: "study-tutor",
      integrations: [
        {
          onLanguageModelCallStart: bind("onLanguageModelCallStart"),
          onLanguageModelCallEnd: bind("onLanguageModelCallEnd"),
        },
      ],
    },
  };
}
