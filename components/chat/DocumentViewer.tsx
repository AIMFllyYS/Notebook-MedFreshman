"use client";

import { useCallback } from "react";
import { FileText, FileDigit } from "lucide-react";
import { useDocuments, getDocumentMarkdown } from "@/lib/hooks/useDocuments";
import { assembleDocumentMarkdown } from "@/lib/documents/types";
import { MessageContent } from "@/components/chat/MessageContent";
import { downloadAsMarkdown } from "@/lib/documents/export";
import ManagedWindow from "@/components/window/ManagedWindow";

function documentWindowId(id: string) {
  return `document-viewer:${id}`;
}

export default function DocumentViewerLayer() {
  const viewerId = useDocuments((s) => s.viewerId);
  const byId = useDocuments((s) => s.byId);

  if (!viewerId || !byId[viewerId]) return null;
  return <DocumentViewerSingle documentId={viewerId} />;
}

function DocumentViewerSingle({ documentId }: { documentId: string }) {
  const doc = useDocuments((s) => s.byId[documentId]);
  const closeViewer = useDocuments((s) => s.closeViewer);
  const handleClose = useCallback(() => closeViewer(), [closeViewer]);

  if (!doc) return null;

  const winId = documentWindowId(documentId);
  const markdown = getDocumentMarkdown(documentId) || assembleDocumentMarkdown(doc);
  const progress = `${doc.sections.filter((s) => s.status === "done").length} / ${doc.sections.length}`;

  const actions = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        data-no-drag
        onClick={() => downloadAsMarkdown(markdown, doc.spec.title)}
        title="下载 Markdown"
        className="press flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--md-sys-color-surface-variant)]"
      >
        <FileText size={15} />
      </button>
    </div>
  );

  return (
    <ManagedWindow
      windowId={winId}
      title={`${doc.spec.title} · ${progress}`}
      icon={<FileDigit size={15} />}
      onClose={handleClose}
      fullscreenTarget="notes"
      minSize={{ minW: 420, minH: 360 }}
      overlayId={`document-viewer-${documentId}`}
      actions={actions}
      bodyClassName="flex flex-col"
      unmountWhenMinimized
    >
      <div className="min-h-0 flex-1 overflow-auto p-4 chat-prose">
        <MessageContent content={markdown} enableVisualizations={false} preserveLineBreaks={false} />
      </div>
    </ManagedWindow>
  );
}
