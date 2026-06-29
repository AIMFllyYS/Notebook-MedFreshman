import { useWindowManager, type ManagedWindow, type ImageGenViewerData } from "@/lib/hooks/useWindowManager";
import { useFloatingChats } from "@/lib/hooks/useFloatingChats";
import { useArtifacts } from "@/lib/hooks/useArtifacts";
import { useImageGen } from "@/lib/hooks/useImageGen";
import { useRecordPreviews } from "@/lib/hooks/useRecordPreviews";

/** 解析当前应操作的 managed 窗口（activeWindowId 或 z 最高未最小化）。 */
export function getActiveManagedWindow(): ManagedWindow | null {
  const { windows, activeWindowId } = useWindowManager.getState();
  if (activeWindowId) {
    const win = windows.find((w) => w.id === activeWindowId);
    if (win) return win;
  }
  const visible = windows.filter((w) => !w.minimized);
  if (visible.length === 0) return null;
  return visible.reduce((a, b) => (a.z >= b.z ? a : b));
}

/** 按窗口类型正确关闭（避免只删 managed 记录、遗留 session）。 */
export function closeManagedWindow(win: ManagedWindow): void {
  switch (win.type) {
    case "floating-chat":
      useFloatingChats.getState().closeWindow(win.id);
      break;
    case "artifact-viewer":
      useArtifacts.getState().closeViewer();
      break;
    case "image-gen-viewer": {
      const data = win.data as ImageGenViewerData;
      useImageGen.getState().closeViewer(data.imageGenId);
      break;
    }
    case "record-preview":
      useRecordPreviews.getState().close(win.id);
      break;
    default:
      useWindowManager.getState().closeWindow(win.id);
  }
}

export function closeActiveWindow(): boolean {
  const win = getActiveManagedWindow();
  if (!win) return false;
  closeManagedWindow(win);
  return true;
}

export function toggleMinimizeActiveWindow(): boolean {
  const win = getActiveManagedWindow();
  if (!win) return false;
  const { minimizeWindow, restoreWindow } = useWindowManager.getState();
  if (win.minimized) restoreWindow(win.id);
  else minimizeWindow(win.id);
  return true;
}

export function toggleFullscreenActiveWindow(): boolean {
  const win = getActiveManagedWindow();
  if (!win) return false;
  const { setFullscreen } = useWindowManager.getState();
  setFullscreen(win.id, !win.fullscreen);
  return true;
}
