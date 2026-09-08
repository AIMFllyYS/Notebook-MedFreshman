"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Globe } from "lucide-react";
import EmbedFallback from "@/components/browser/EmbedFallback";
import WindowChrome from "@/components/window/WindowChrome";
import { useEmbeddable } from "@/lib/hooks/useEmbeddable";
import { useDraggable } from "@/lib/hooks/useDraggable";
import { useFullscreenTrack } from "@/lib/hooks/useFullscreenTrack";
import { useResizable } from "@/lib/hooks/useResizable";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";

export default function SourcePreviewViewer() {
  // Boolean snapshot stays referentially stable for React 19's getSnapshot.
  const hasPreview = useWindowManager((s) => s.windows.some((win) => win.type === "source-preview"));
  if (!hasPreview) return null;
  return <SourcePreviewWindows />;
}

function SourcePreviewWindows() {
  const windows = useWindowManager((s) => s.windows);
  const ids: string[] = [];
  for (const win of windows) {
    if (win.type === "source-preview") ids.push(win.id);
  }
  return (
    <>
      {ids.map((id) => (
        <SourcePreviewWindow key={id} windowId={id} />
      ))}
    </>
  );
}

function SourcePreviewWindow({ windowId }: { windowId: string }) {
  const managed = useWindowManager((s) => s.windows.find((win) => win.id === windowId));
  const { bringToFront, commitGeometry, minimizeWindow, setFullscreen, closeWindow } = useWindowManager();
  const preExpandRef = useRef<{ pos: { x: number; y: number }; size: { width: number; height: number } } | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const data = (managed?.data ?? {}) as { url?: string; title?: string };
  const url = data.url ?? "";
  const { blocked, reason, forceEmbed } = useEmbeddable(url || null);

  useEffect(() => {
    setLoadFailed(false);
  }, [url]);

  const { elRef, onPointerDown } = useDraggable((dx, dy) => {
    if (!managed) return;
    commitGeometry(windowId, {
      pos: {
        x: Math.max(0, Math.min(managed.pos.x + dx, window.innerWidth - managed.size.width)),
        y: Math.max(0, Math.min(managed.pos.y + dy, window.innerHeight - managed.size.height)),
      },
    });
  });
  const onResizeStart = useResizable(elRef, (width, height) => {
    commitGeometry(windowId, { size: { width, height } });
  }, { minW: 420, minH: 320 });

  useFullscreenTrack(windowId, managed?.fullscreen ?? false);
  const handleClose = useCallback(() => closeWindow(windowId), [closeWindow, windowId]);
  useOverlayRegistration({
    id: windowId,
    open: !!managed,
    onClose: handleClose,
    priority: 30,
  });

  const toggleFullscreen = useCallback(() => {
    const current = useWindowManager.getState().windows.find((win) => win.id === windowId);
    if (!current) return;
    if (current.fullscreen) {
      const snap = preExpandRef.current;
      if (snap) commitGeometry(windowId, { pos: snap.pos, size: snap.size });
      preExpandRef.current = null;
      setFullscreen(windowId, false);
      return;
    }
    preExpandRef.current = { pos: current.pos, size: current.size };
    const rect = document.getElementById("notes-panel")?.getBoundingClientRect();
    if (rect && rect.width > 0 && rect.height > 0) {
      commitGeometry(windowId, { pos: { x: rect.left, y: rect.top }, size: { width: rect.width, height: rect.height } });
    }
    setFullscreen(windowId, true);
  }, [commitGeometry, setFullscreen, windowId]);

  if (!managed || !url) return null;

  const showFallback = (blocked || loadFailed) && !managed.minimized;
  const openOriginal = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return createPortal(
    <div
      ref={elRef}
      onPointerDownCapture={() => bringToFront(windowId)}
      className="source-preview-window"
      data-testid="source-preview-window"
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
        title={managed.title}
        icon={<Globe size={15} />}
        onClose={handleClose}
        onMinimize={() => minimizeWindow(windowId)}
        onFullscreen={toggleFullscreen}
        isFullscreen={managed.fullscreen}
        isMinimized={managed.minimized}
        onDragStart={onPointerDown}
        showExternalLink
        externalLinkLabel="打开原页面"
        onExternalLink={openOriginal}
        bodyClassName="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white"
      >
        {!managed.minimized && (
          showFallback ? (
            <EmbedFallback
              url={url}
              reason={reason || (loadFailed ? "页面加载失败" : undefined)}
              onForce={() => {
                setLoadFailed(false);
                forceEmbed();
              }}
            />
          ) : (
            <iframe
              key={url}
              src={url}
              title={managed.title}
              className="min-h-0 w-full flex-1 border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads allow-modals"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-read; clipboard-write"
              referrerPolicy="no-referrer-when-downgrade"
              onError={() => setLoadFailed(true)}
            />
          )
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
