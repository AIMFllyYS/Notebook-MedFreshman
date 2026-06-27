"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Download, MonitorPlay } from "lucide-react";
import { useArtifacts } from "@/lib/hooks/useArtifacts";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { useFullscreenTrack } from "@/lib/hooks/useFullscreenTrack";
import { useDraggable } from "@/lib/hooks/useDraggable";
import { useResizable } from "@/lib/hooks/useResizable";
import WindowChrome from "@/components/window/WindowChrome";
import { downloadHtmlFile } from "@/lib/utils/downloadHtml";

function artifactWindowId(id: string) {
  return `artifact-viewer:${id}`;
}

export default function ArtifactViewer() {
  const viewerId = useArtifacts((s) => s.viewerId);
  const byId = useArtifacts((s) => s.byId);
  const closeViewer = useArtifacts((s) => s.closeViewer);
  const managed = useWindowManager((s) => (viewerId ? s.windows.find((w) => w.id === artifactWindowId(viewerId)) : undefined));
  const { bringToFront, commitGeometry, minimizeWindow, setFullscreen } = useWindowManager();
  const preExpandRef = useRef<{ pos: { x: number; y: number }; size: { width: number; height: number } } | null>(null);

  const art = viewerId ? byId[viewerId] : null;

  const { elRef, onPointerDown } = useDraggable((dx, dy) => {
    if (!managed || !viewerId) return;
    commitGeometry(artifactWindowId(viewerId), {
      pos: {
        x: Math.max(0, Math.min(managed.pos.x + dx, window.innerWidth - managed.size.width)),
        y: Math.max(0, Math.min(managed.pos.y + dy, window.innerHeight - managed.size.height)),
      },
    });
  });
  const onResizeStart = useResizable(
    elRef,
    (width, height) => {
      if (viewerId) commitGeometry(artifactWindowId(viewerId), { size: { width, height } });
    },
    { minW: 420, minH: 320 },
  );

  useFullscreenTrack(viewerId ? artifactWindowId(viewerId) : "", managed?.fullscreen ?? false);

  useEffect(() => {
    if (!art) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeViewer();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [art, closeViewer]);

  if (!art || !viewerId || !managed) return null;

  const winId = artifactWindowId(viewerId);
  const openExternal = () => {
    const url = URL.createObjectURL(new Blob([art.html], { type: "text/html" }));
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

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

  const actions = (
    <button
      type="button"
      data-no-drag
      onClick={() => downloadHtmlFile(art.html, art.title)}
      title="下载 HTML"
      className="press flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--md-sys-color-surface-variant)]"
    >
      <Download size={15} />
    </button>
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
        boxShadow: managed.fullscreen
          ? "0 0 0 1px var(--line)"
          : "0 16px 48px rgba(0,0,0,0.3), 0 0 0 1px var(--line)",
        zIndex: managed.z,
      }}
    >
      <WindowChrome
        title={art.title}
        icon={<MonitorPlay size={15} />}
        onClose={closeViewer}
        onMinimize={() => minimizeWindow(winId)}
        onFullscreen={toggleFullscreen}
        isFullscreen={managed.fullscreen}
        isMinimized={managed.minimized}
        onDragStart={onPointerDown}
        showExternalLink
        onExternalLink={openExternal}
        actions={actions}
        bodyClassName="flex flex-col bg-white"
      >
        {!managed.minimized && (
          <iframe
            title={art.title}
            srcDoc={art.html}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads"
            className="min-h-0 w-full flex-1 border-0 bg-white"
          />
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
