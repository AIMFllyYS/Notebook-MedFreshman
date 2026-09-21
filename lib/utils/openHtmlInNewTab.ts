import {
  ARTIFACT_IFRAME_SANDBOX,
  injectOpaqueOriginStorageShim,
} from "@/lib/sandbox/opaqueOriginStorageShim";

/**
 * 把一段 HTML 用 Blob URL 在新标签页打开。
 * Artifact 浮窗、消息内卡片、消息内联 HtmlRenderer 共用，不要再复制 Blob 这段。
 *
 * blob: 顶层文档会继承打开者的源——直接把不可信 HTML 开成顶层页等于让它带着
 * 应用源跑脚本（可读 localStorage 里的 API 密钥等）。这里改为打开一个壳页：
 * 壳页本身没有任何脚本，HTML 装进 sandbox iframe 的 srcdoc，仍是 opaque origin。
 */
function escapeSrcdoc(html: string): string {
  return html.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function openHtmlInNewTab(html: string, revokeMs = 60_000): void {
  const doc =
    '<!doctype html><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    "<title>Preview</title>" +
    "<style>html,body{margin:0;height:100%}iframe{display:block;width:100%;height:100%;border:0}</style>" +
    `<iframe sandbox="${ARTIFACT_IFRAME_SANDBOX}" srcdoc="${escapeSrcdoc(injectOpaqueOriginStorageShim(html))}"></iframe>`;
  const url = URL.createObjectURL(new Blob([doc], { type: "text/html" }));
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), revokeMs);
}
