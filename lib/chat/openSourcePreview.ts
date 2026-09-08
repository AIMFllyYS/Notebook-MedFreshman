import { useWindowManager } from "@/lib/hooks/useWindowManager";

export function sourcePreviewWindowId(url: string) {
  return `source-preview:${url}`;
}

export function openSourcePreview(source: { url: string; title?: string }) {
  if (!source.url) return;
  const id = sourcePreviewWindowId(source.url);
  const title = source.title?.trim() || sourceHost(source.url);
  const wm = useWindowManager.getState();
  const existing = wm.windows.find((win) => win.id === id);
  if (existing) {
    wm.updateWindow(id, { title, data: { url: source.url, title } });
    if (existing.minimized) wm.restoreWindow(id);
    else wm.bringToFront(id);
    return;
  }
  const { pos, size } = sourcePreviewGeometry();
  wm.openWindow({
    id,
    type: "source-preview",
    title,
    pos,
    size,
    data: { url: source.url, title },
  });
}

function sourceHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function sourcePreviewGeometry() {
  if (typeof window === "undefined") {
    return { pos: { x: 72, y: 64 }, size: { width: 920, height: 720 } };
  }
  const openCount = useWindowManager
    .getState()
    .windows.filter((win) => win.type === "source-preview" && !win.minimized).length;
  const offset = openCount * 28;
  const width = Math.min(960, Math.floor(window.innerWidth * 0.78));
  const height = Math.min(820, Math.floor(window.innerHeight * 0.88));
  return {
    pos: {
      x: Math.max(16, Math.floor(window.innerWidth * 0.12) + offset),
      y: Math.max(16, Math.floor(window.innerHeight * 0.06) + offset),
    },
    size: { width, height },
  };
}
