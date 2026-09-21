import { AGENT_LOG_FILENAME } from "@/lib/ai/observability/agentLog";
import { agentLogContentDisposition, readRawAgentLog } from "@/lib/ai/observability/exportLogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 原样返回已落盘 JSONL，不解析、不改写。路径由 resolveAgentLogPath 按 #52 约定解析。
 *
 * 访问控制：日志里是**全局**生命周期事件（含 prompt / 工具输入输出），不是单用户数据。
 * 只在桌面端（ELECTRON_USER_DATA）或自托管显式开启（AGENT_LOG_EXPORT=1）时提供；
 * 托管部署上匿名可下会泄漏所有用户的会话内容，一律 404。
 */
function exportEnabled(): boolean {
  return Boolean(process.env.ELECTRON_USER_DATA?.trim()) || process.env.AGENT_LOG_EXPORT === "1";
}

export async function GET() {
  if (!exportEnabled()) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  const { bytes, exists } = readRawAgentLog();
  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": agentLogContentDisposition(AGENT_LOG_FILENAME),
      "Cache-Control": "no-store",
      "X-Agent-Log-Exists": exists ? "1" : "0",
    },
  });
}
