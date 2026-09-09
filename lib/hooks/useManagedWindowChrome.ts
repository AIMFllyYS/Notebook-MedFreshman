"use client";

import { useCallback, useRef } from "react";
import { resolveFullscreenRect, type FullscreenTarget } from "@/lib/constants/layout";
import { useDraggable } from "@/lib/hooks/useDraggable";
import { useFullscreenTrack } from "@/lib/hooks/useFullscreenTrack";
import { useResizable } from "@/lib/hooks/useResizable";
import { useWindowManager, type WindowSize } from "@/lib/hooks/useWindowManager";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";

export type { FullscreenTarget };

export interface UseManagedWindowChromeOptions {
  windowId: string;
  onClose: () => void;
  /** 默认 `notes`：与现网八个 viewer 的全屏对齐笔记区行为一致。 */
  fullscreenTarget?: FullscreenTarget;
  minSize?: { minW: number; minH: number };
  overlayPriority?: number;
  overlayId?: string;
  registerOverlay?: boolean;
  onResize?: (size: WindowSize) => void;
}

/**
 * 浮窗壳的接线：拖拽 / 缩放 / 全屏跟踪 / Esc 栈 / 进出全屏几何。
 * `ManagedWindow` 消费本 hook；`FloatingChatWindow` 若几何模型冲突可只复用这里、自绘外壳。
 */
export function useManagedWindowChrome({
  windowId,
  onClose,
  fullscreenTarget = "notes",
  minSize = { minW: 420, minH: 320 },
  overlayPriority = 30,
  overlayId,
  registerOverlay = true,
  onResize,
}: UseManagedWindowChromeOptions) {
  const managed = useWindowManager((s) => s.windows.find((w) => w.id === windowId));
  const { bringToFront, commitGeometry, minimizeWindow, setFullscreen } = useWindowManager();
  const preExpandRef = useRef<{ pos: { x: number; y: number }; size: WindowSize } | null>(null);
  const targetRef = useRef(fullscreenTarget);
  targetRef.current = fullscreenTarget;
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  const { elRef, onPointerDown } = useDraggable((dx, dy) => {
    const current = useWindowManager.getState().windows.find((w) => w.id === windowId);
    if (!current) return;
    commitGeometry(windowId, {
      pos: {
        x: Math.max(0, Math.min(current.pos.x + dx, window.innerWidth - current.size.width)),
        y: Math.max(0, Math.min(current.pos.y + dy, window.innerHeight - current.size.height)),
      },
    });
  });

  const onResizeStart = useResizable(
    elRef,
    (width, height) => {
      commitGeometry(windowId, { size: { width, height } });
      onResizeRef.current?.({ width, height });
    },
    minSize,
  );

  useFullscreenTrack(windowId, managed?.fullscreen ?? false, fullscreenTarget);

  useOverlayRegistration({
    id: overlayId ?? windowId,
    open: registerOverlay && !!managed,
    onClose,
    priority: overlayPriority,
  });

  const toggleFullscreen = useCallback(() => {
    const current = useWindowManager.getState().windows.find((w) => w.id === windowId);
    if (!current) return;
    if (current.fullscreen) {
      const snap = preExpandRef.current;
      if (snap) commitGeometry(windowId, { pos: snap.pos, size: snap.size });
      preExpandRef.current = null;
      setFullscreen(windowId, false);
      return;
    }
    preExpandRef.current = { pos: current.pos, size: current.size };
    const rect = resolveFullscreenRect(targetRef.current);
    if (rect && rect.width > 0 && rect.height > 0) {
      commitGeometry(windowId, {
        pos: { x: rect.left, y: rect.top },
        size: { width: rect.width, height: rect.height },
      });
    }
    setFullscreen(windowId, true);
  }, [commitGeometry, setFullscreen, windowId]);

  return {
    managed,
    elRef,
    onPointerDown,
    onResizeStart,
    toggleFullscreen,
    bringToFront,
    minimizeWindow,
    commitGeometry,
  };
}
