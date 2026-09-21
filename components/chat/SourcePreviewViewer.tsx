"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { Globe } from "lucide-react";
import EmbedFallback from "@/components/browser/EmbedFallback";
import WebviewSite from "@/components/browser/WebviewSite";
import ManagedWindow from "@/components/window/ManagedWindow";
import { useEmbeddable } from "@/lib/hooks/useEmbeddable";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { useT } from "@/lib/i18n";

function SourcePreviewIcon({ iconUrl }: { iconUrl?: string }) {
  const [failedIcon, setFailedIcon] = useState<string | null>(null);
  if (iconUrl && failedIcon !== iconUrl) {
    // 动态站点 favicon 不在 next/image 的静态远程域名白名单内。
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={iconUrl} alt="" aria-hidden="true" className="h-[15px] w-[15px] rounded-sm object-contain" onError={() => setFailedIcon(iconUrl)} />;
  }
  return <Globe size={15} />;
}

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
  const t = useT();

  const data = (managed?.data ?? {}) as { url?: string; title?: string; iconUrl?: string };
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

  // 预览 iframe 带 allow-same-origin + allow-scripts：若 url 指向本应用同源地址，
  // iframe 内脚本就能摸到 parent.document（沙箱逃逸）。预览只面向外部站点，
  // 同源地址一律降级为跳转卡片。
  let sameOrigin = false;
  if (typeof window !== "undefined") {
    try {
      sameOrigin = new URL(url, window.location.href).origin === window.location.origin;
    } catch {
      // 解析不出的地址不允许嵌入。
      sameOrigin = true;
    }
  }
  const showFallback = blocked || loadFailed || sameOrigin;

  return (
    <ManagedWindow
      windowId={windowId}
      title={managed.title}
      icon={<SourcePreviewIcon iconUrl={data.iconUrl ?? managed.icon} />}
      onClose={handleClose}
      fullscreenTarget="notes"
      className="source-preview-window"
      testId="source-preview-window"
      externalLink={{
        onOpen: () => {
          window.open(url, "_blank", "noopener,noreferrer");
        },
        label: t("window.source.openOriginal"),
      }}
      bodyClassName="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white"
      unmountWhenMinimized
    >
      {showFallback ? (
        <EmbedFallback
          url={url}
          reason={reason || (loadFailed ? t("window.state.pageLoadFailed") : undefined)}
          onForce={() => {
            setLoadFailed(false);
            forceEmbed();
          }}
        />
      ) : isDesktop ? (
        <WebviewSite url={url} />
      ) : (
        <iframe
          key={url}
          src={url}
          title={managed.title}
          className="min-h-0 w-full flex-1 border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads allow-modals"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-write"
          referrerPolicy="no-referrer-when-downgrade"
          onError={() => setLoadFailed(true)}
          onLoad={(event) => {
            try {
              const doc = event.currentTarget.contentDocument;
              if (doc && (doc.URL === "about:blank" || !doc.body?.childElementCount)) setLoadFailed(true);
            } catch {
              /* cross-origin: treated as rendered */
            }
          }}
        />
      )}
    </ManagedWindow>
  );
}


