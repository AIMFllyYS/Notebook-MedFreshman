import { AGENT_LOG_FILENAME } from "@/lib/ai/observability/agentLog";
import { agentLogContentDisposition, readRawAgentLog } from "@/lib/ai/observability/exportLogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 原样返回已落盘 JSONL，不解析、不改写。路径由 resolveAgentLogPath 按 #52 约定解析。 */
export async function GET() {
  const { bytes, exists } = readRawAgentLog();
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": agentLogContentDisposition(AGENT_LOG_FILENAME),
      "Cache-Control": "no-store",
      "X-Agent-Log-Exists": exists ? "1" : "0",
    },
  });
}
