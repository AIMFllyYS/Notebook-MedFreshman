"use client";

import { useCallback } from "react";
import type { FullscreenTarget } from "@/lib/constants/layout";
import { useDraggable } from "@/lib/hooks/useDraggable";
import { useFullscreenTrack } from "@/lib/hooks/useFullscreenTrack";
import { useResizable } from "@/lib/hooks/useResizable";
import { useWestResizable } from "@/lib/hooks/useWestResizable";
import { useWindowManager, type WindowSize } from "@/lib/hooks/useWindowManager";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";
import { isAgentWorkspace } from "@/lib/stores/workspace";
import { toggleManagedWindowFullscreen } from "@/lib/window/toggleManagedFullscreen";

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
  const { bringToFront, commitGeometry, minimizeWindow } = useWindowManager();

  const { elRef, onPointerDown } = useDraggable((dx, dy) => {
    if (isAgentWorkspace()) return;
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
      onResize?.({ width, height });
    },
    minSize,
  );

  const onWestResizeStart = useWestResizable(
    elRef,
    (geom) => {
      commitGeometry(windowId, geom);
      onResize?.(geom.size);
    },
    { minW: minSize.minW },
  );

  useFullscreenTrack(windowId, managed?.fullscreen ?? false, fullscreenTarget);

  useOverlayRegistration({
    id: overlayId ?? windowId,
    open: registerOverlay && !!managed,
    onClose,
    priority: overlayPriority,
  });

  const toggleFullscreen = useCallback(() => {
    toggleManagedWindowFullscreen(windowId, fullscreenTarget);
  }, [fullscreenTarget, windowId]);

  return {
    managed,
    elRef,
    onPointerDown,
    onResizeStart,
    onWestResizeStart,
    toggleFullscreen,
    bringToFront,
    minimizeWindow,
    commitGeometry,
  };
}
