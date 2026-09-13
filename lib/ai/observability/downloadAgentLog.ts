// 设置页导出入口：走 /api/logs/export 取回原始字节后触发下载，不解析 JSONL、不改字段。

export const AGENT_LOG_EXPORT_URL = "/api/logs/export";
export const AGENT_LOG_EXPORT_FILENAME = "agent-lifecycle.jsonl";

export type ExportAgentLogsResult = {
  ok: boolean;
  empty: boolean;
  filename: string;
  byteLength: number;
  error?: string;
};

export function filenameFromContentDisposition(header: string | null): string {
  if (!header) return AGENT_LOG_EXPORT_FILENAME;
  const star = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(header);
  const plain = /filename="([^"]+)"|filename=([^;\s]+)/i.exec(header);
  const raw = star?.[1]?.trim() ?? plain?.[1]?.trim() ?? plain?.[2]?.trim();
  if (!raw) return AGENT_LOG_EXPORT_FILENAME;
  try {
    return decodeURIComponent(raw.replace(/^["']|["']$/g, ""));
  } catch {
    return raw.replace(/^["']|["']$/g, "");
  }
}

export function downloadRawBytes(bytes: Uint8Array, filename: string): void {
  const copy = bytes.slice();
  const blob = new Blob([copy], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportAgentLogs(deps?: {
  fetch?: typeof fetch;
  download?: (bytes: Uint8Array, filename: string) => void;
}): Promise<ExportAgentLogsResult> {
  const fetcher = deps?.fetch ?? globalThis.fetch;
  const download = deps?.download ?? downloadRawBytes;
  if (typeof fetcher !== "function") {
    return {
      ok: false,
      empty: true,
      filename: AGENT_LOG_EXPORT_FILENAME,
      byteLength: 0,
      error: "无法导出",
    };
  }
  try {
    const res = await fetcher(AGENT_LOG_EXPORT_URL, { cache: "no-store" });
    if (!res.ok) {
      return {
        ok: false,
        empty: true,
        filename: AGENT_LOG_EXPORT_FILENAME,
        byteLength: 0,
        error: "导出失败",
      };
    }
    const bytes = new Uint8Array(await res.arrayBuffer());
    const filename = filenameFromContentDisposition(res.headers.get("content-disposition"));
    download(bytes, filename);
    return { ok: true, empty: bytes.byteLength === 0, filename, byteLength: bytes.byteLength };
  } catch {
    return {
      ok: false,
      empty: true,
      filename: AGENT_LOG_EXPORT_FILENAME,
      byteLength: 0,
      error: "导出失败",
    };
  }
}
