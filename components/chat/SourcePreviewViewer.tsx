"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { Globe } from "lucide-react";
import EmbedFallback from "@/components/browser/EmbedFallback";
import ManagedWindow from "@/components/window/ManagedWindow";
import { useEmbeddable } from "@/lib/hooks/useEmbeddable";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

interface DesktopWebview extends HTMLElement {
  loadURL(url: string): Promise<void>;
}

// Electron 注入的真实 Chromium 视图；网页开发态仍使用普通 iframe。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Webview: any = "webview";

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
  const closeWindow = useWindowManager((s) => s.closeWindow);
  const handleClose = useCallback(() => closeWindow(windowId), [closeWindow, windowId]);

  const data = (managed?.data ?? {}) as { url?: string; title?: string };
  const url = data.url ?? "";
  const isDesktop = useSyncExternalStore(
    () => () => {},
    () => !!(window as unknown as { desktop?: { isElectron?: boolean } }).desktop?.isElectron,
    () => false,
  );
  const { blocked, reason, forceEmbed } = useEmbeddable(isDesktop ? null : url || null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [seenUrl, setSeenUrl] = useState(url);
  if (url !== seenUrl) {
    setSeenUrl(url);
    setLoadFailed(false);
  }

  if (!managed || !url) return null;

  const showFallback = blocked || loadFailed;

  return (
    <ManagedWindow
      windowId={windowId}
      title={managed.title}
      icon={<Globe size={15} />}
      onClose={handleClose}
      fullscreenTarget="notes"
      className="source-preview-window"
      testId="source-preview-window"
      externalLink={{
        onOpen: () => {
          window.open(url, "_blank", "noopener,noreferrer");
        },
        label: "打开原页面",
      }}
      bodyClassName="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white"
      unmountWhenMinimized
    >
      {showFallback ? (
        <EmbedFallback
          url={url}
          reason={reason || (loadFailed ? "页面加载失败" : undefined)}
          onForce={() => {
            setLoadFailed(false);
            forceEmbed();
          }}
        />
      ) : isDesktop ? (
        <DesktopEmbeddedSite url={url} />
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
      )}
    </ManagedWindow>
  );
}

function DesktopEmbeddedSite({ url }: { url: string }) {
  const ref = useCallback((node: DesktopWebview | null) => {
    if (!node) return;
    // The src attribute is normally enough; loadURL is a small compatibility fallback
    // for packaged Electron builds where the custom element is upgraded one tick later.
    if (!node.getAttribute("src")) void node.loadURL(url).catch(() => {});
  }, [url]);

  return (
    <Webview
      ref={ref}
      key={url}
      src={url}
      partition="persist:attachment-web-preview"
      allowpopups="true"
      style={{ width: "100%", height: "100%", display: "flex", border: 0, background: "white" }}
    />
  );
}
