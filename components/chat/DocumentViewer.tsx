"use client";

import { useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { FileText, FileSpreadsheet, FileDigit, FileX } from "lucide-react";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { useFullscreenTrack } from "@/lib/hooks/useFullscreenTrack";
import { useDraggable } from "@/lib/hooks/useDraggable";
import { useResizable } from "@/lib/hooks/useResizable";
import WindowChrome from "@/components/window/WindowChrome";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";
import { getDocumentMarkdown } from "@/lib/hooks/useDocuments";
import { assembleDocumentMarkdown } from "@/lib/documents/types";
import { MessageContent } from "@/components/chat/MessageContent";
import { downloadAsMarkdown } from "@/lib/documents/export";

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
  const managed = useWindowManager((s) => s.windows.find((w) => w.id === documentWindowId(documentId)));
  const { bringToFront, commitGeometry, minimizeWindow, setFullscreen } = useWindowManager();
  const preExpandRef = useRef<{ pos: { x: number; y: number }; size: { width: number; height: number } } | null>(null);

  const { elRef, onPointerDown } = useDraggable((dx, dy) => {
    if (!managed) return;
    commitGeometry(documentWindowId(documentId), {
      pos: {
        x: Math.max(0, Math.min(managed.pos.x + dx, window.innerWidth - managed.size.width)),
        y: Math.max(0, Math.min(managed.pos.y + dy, window.innerHeight - managed.size.height)),
      },
    });
  });
  const onResizeStart = useResizable(elRef, (width, height) => {
    commitGeometry(documentWindowId(documentId), { size: { width, height } });
  }, { minW: 420, minH: 360 });

  useFullscreenTrack(documentWindowId(documentId), managed?.fullscreen ?? false);

  const handleClose = useCallback(() => closeViewer(), [closeViewer]);
  useOverlayRegistration({
    id: `document-viewer-${documentId}`,
    open: !!doc,
    onClose: handleClose,
    priority: 30,
  });

  if (!doc || !managed) return null;

  const winId = documentWindowId(documentId);
  const markdown = getDocumentMarkdown(documentId) || assembleDocumentMarkdown(doc);

  function toggleFullscreen() {
    const current = useWindowManager.getState().windows.find((w) => w.id === winId);
    if (!current) return;
    if (current.fullscreen) {
      const snap = preExpandRef.current;
      if (snap) commitGeometry(winId, { pos: snap.pos, size: snap.size });
      preExpandRef.current = null;
      setFullscreen(winId, false);
      return;
    }
    preExpandRef.current = { pos: current.pos, size: current.size };
    const rect = document.getElementById("notes-panel")?.getBoundingClientRect();
    if (rect && rect.width > 0 && rect.height > 0) {
      commitGeometry(winId, { pos: { x: rect.left, y: rect.top }, size: { width: rect.width, height: rect.height } });
    }
    setFullscreen(winId, true);
  }

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
      <button
        type="button"
        data-no-drag
        onClick={() => { /* TODO: docx export */ }}
        title="导出 Word（待实现）"
        className="press flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ink-soft)] opacity-50 hover:bg-[var(--md-sys-color-surface-variant)]"
      >
        <FileSpreadsheet size={15} />
      </button>
      <button
        type="button"
        data-no-drag
        onClick={() => { /* TODO: LaTeX/PDF export */ }}
        title="导出 PDF（待实现）"
        className="press flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ink-soft)] opacity-50 hover:bg-[var(--md-sys-color-surface-variant)]"
      >
        <FileX size={15} />
      </button>
    </div>
  );

  return createPortal(
    <div
      ref={elRef}
      onPointerDownCapture={() => bringToFront(winId)}
      style={{
        position: "fixed",
        left: managed.pos.x,
        top: managed.pos.y,
        width: managed.size.width,
        height: managed.size.height,
        background: "var(--bg-panel)",
        borderRadius: managed.fullscreen ? 0 : 14,
        overflow: "hidden",
        display: managed.minimized ? "none" : "flex",
        flexDirection: "column",
        boxShadow: managed.fullscreen ? "0 0 0 1px var(--line)" : "0 16px 48px rgba(0,0,0,0.3), 0 0 0 1px var(--line)",
        zIndex: managed.z,
      }}
    >
      <WindowChrome
        title={`${doc.spec.title} · ${progress}`}
        icon={<FileDigit size={15} />}
        onClose={handleClose}
        onMinimize={() => minimizeWindow(winId)}
        onFullscreen={toggleFullscreen}
        isFullscreen={managed.fullscreen}
        isMinimized={managed.minimized}
        onDragStart={onPointerDown}
        actions={actions}
        bodyClassName="flex flex-col"
      >
        {!managed.minimized && (
          <div className="min-h-0 flex-1 overflow-auto p-4 chat-prose">
            <MessageContent content={markdown} enableVisualizations={false} preserveLineBreaks={false} />
          </div>
        )}
      </WindowChrome>
      {!managed.fullscreen && !managed.minimized && (
        <div
          data-no-drag
          onPointerDown={onResizeStart}
          title="拖拽缩放窗口"
          style={{
            position: "absolute",
            right: 1,
            bottom: 1,
            width: 18,
            height: 18,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            padding: 2,
            color: "var(--md-sys-color-outline)",
            cursor: "nwse-resize",
            touchAction: "none",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d="M11 4 L4 11" />
            <path d="M11 8 L8 11" />
          </svg>
        </div>
      )}
    </div>,
    document.body,
  );
}
