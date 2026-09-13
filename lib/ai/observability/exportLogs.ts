// 导出已落盘的 Agent JSONL：只读原始字节，不解析、不改写、不二次清洗。
// 路径沿用 #52：resolveAgentLogPath（服务端 log/、Electron userData/logs、AGENT_LOG_PATH）。

import { existsSync, readFileSync } from "node:fs";
import { AGENT_LOG_FILENAME, resolveAgentLogPath } from "./agentLog";

export function readRawAgentLog(filePath = resolveAgentLogPath()): {
  bytes: Buffer;
  exists: boolean;
  path: string;
} {
  if (!existsSync(filePath)) {
    return { bytes: Buffer.alloc(0), exists: false, path: filePath };
  }
  return { bytes: readFileSync(filePath), exists: true, path: filePath };
}

export function agentLogContentDisposition(filename = AGENT_LOG_FILENAME): string {
  return `attachment; filename="${filename}"`;
}
