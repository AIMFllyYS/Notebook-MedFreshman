"use client";

import { useCallback, useMemo, useState } from "react";
import { Presentation, ShieldCheck } from "lucide-react";
import ManagedWindow from "@/components/window/ManagedWindow";
import FileTypeIcon from "@/components/icons/file-types/FileTypeIcon";
import PdfDocumentPane from "@/components/window/PdfDocumentPane";
import DocxDocumentPane from "@/components/window/DocxDocumentPane";
import PptxDocumentPane from "@/components/window/PptxDocumentPane";
import DocumentWorkspace from "@/components/window/DocumentWorkspace";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import type { AttachmentPreviewData } from "@/lib/stores/windowManager";
import { MessageContent } from "@/components/chat/MessageContent";


const LOCAL_PREVIEW_CSP = "default-src 'none'; img-src data: blob:; media-src data: blob:; style-src 'unsafe-inline'; font-src data:; form-action 'none'; base-uri 'none'";

/** 给用户上传的 HTML 加入离线策略；iframe 本身还会禁用全部 sandbox 权限。 */
export function lockHtmlPreviewToLocal(html: string): string {
  const policy = `<meta http-equiv="Content-Security-Policy" content="${LOCAL_PREVIEW_CSP}">`;
  const head = /<head(?=[\s>])/i.exec(html);
  if (head) {
    const at = html.indexOf(">", head.index) + 1;
    return html.slice(0, at) + policy + html.slice(at);
  }
  const root = /<html(?=[\s>])/i.exec(html);
  if (root) {
    const at = html.indexOf(">", root.index) + 1;
    return `${html.slice(0, at)}<head>${policy}</head>${html.slice(at)}`;
  }
  return `<head>${policy}</head>${html}`;
}

export default function AttachmentPreviewViewer() {
  const hasPreview = useWindowManager((state) => state.windows.some((win) => win.type === "attachment-preview"));
  if (!hasPreview) return null;
  return <AttachmentPreviewWindows />;
}

function AttachmentPreviewWindows() {
  const windows = useWindowManager((state) => state.windows);
  const ids: string[] = [];
  for (const win of windows) {
    if (win.type === "attachment-preview") ids.push(win.id);
  }
  return <>{ids.map((id) => <AttachmentPreviewWindow key={id} windowId={id} />)}</>;
}

function AttachmentPreviewWindow({ windowId }: { windowId: string }) {
  const managed = useWindowManager((state) => state.windows.find((win) => win.id === windowId));
  const closeWindow = useWindowManager((state) => state.closeWindow);
  const handleClose = useCallback(() => closeWindow(windowId), [closeWindow, windowId]);
  const data = managed?.data as AttachmentPreviewData | undefined;
  const localHtml = data?.kind === "html" ? lockHtmlPreviewToLocal(data.content) : "";

  if (!managed || !data) return null;

  return (
    <ManagedWindow
      windowId={windowId}
      title={data.name}
      icon={<FileTypeIcon kind={data.kind === "ppt" ? "ppt" : undefined} mimeType={data.mimeType} name={data.name} size={15} />}
      onClose={handleClose}
      fullscreenTarget="notes"
      minSize={{ minW: 360, minH: 280 }}
      className="attachment-preview-window"
      testId="attachment-preview-window"
      actions={(
        <span className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-[var(--ink-soft)]" title="文件只在本机读取和预览">
          <ShieldCheck size={12} />
          仅本地
        </span>
      )}
      bodyClassName="flex min-h-0 flex-1 overflow-hidden bg-[var(--bg-panel)]"
      unmountWhenMinimized
    >
      {data.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element -- local data URLs are intentionally kept out of remote loaders.
        <img src={data.content} alt={data.name} className="h-full w-full object-contain p-4" />
      ) : data.kind === "pdf" ? (
        <PdfDocumentPane src={data.content} name={data.name} />
      ) : data.kind === "docx" ? (
        <DocxDocumentPane src={data.content} name={data.name} />
      ) : data.kind === "html" ? (
        <iframe srcDoc={localHtml} sandbox="" title={data.name} className="h-full w-full border-0 bg-white" />
      ) : data.kind === "markdown" ? (
        <MarkdownPreviewPane content={data.content} />
      ) : data.kind === "ppt" ? (
        data.mimeType.includes("presentationml") ? (
          <PptxDocumentPane src={data.content} name={data.name} />
        ) : (
          <div className="flex h-full min-h-52 flex-col items-center justify-center gap-3 px-6 text-center">
            <Presentation size={32} className="text-[var(--md-sys-color-primary)]" />
            <p className="text-[13px] font-semibold text-[var(--ink)]">PowerPoint 本地预览</p>
            <p className="max-w-md text-[12px] leading-6 text-[var(--ink-soft)]">
              旧版 .ppt 为二进制格式，浏览器无法在不联网的情况下还原版式；文件仍保存在本机。
            </p>
          </div>
        )
      ) : (
        <pre className="h-full w-full overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-[12px] leading-6 text-[var(--ink)]">{data.content}</pre>
      )}
    </ManagedWindow>
  );
}

function markdownOutline(content: string) {
  const items = [...content.matchAll(/^(#{1,4})\s+(.+)$/gm)].map((match, index) => ({
    id: String(index + 1),
    title: match[2].trim(),
    meta: `H${match[1].length}`,
  }));
  return items.length ? items : [{ id: "1", title: "正文" }];
}

function MarkdownPreviewPane({ content }: { content: string }) {
  const outline = useMemo(() => markdownOutline(content), [content]);
  const [activeId, setActiveId] = useState(outline[0]?.id ?? "1");
  return (
    <DocumentWorkspace outline={outline} activeId={activeId} onSelect={setActiveId} outlineLabel="Markdown 目录">
      <div className="h-full overflow-auto bg-[var(--bg-panel)] px-6 py-5 chat-prose">
        <MessageContent content={content} enableVisualizations={false} preserveLineBreaks={false} />
      </div>
    </DocumentWorkspace>
  );
}


