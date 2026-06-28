"use client";

import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  useFloatingChats,
  persistFloatingSize,
  FLOATING_MIN_W,
  FLOATING_MIN_H,
  type FloatingWin,
} from "@/lib/hooks/useFloatingChats";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { useFullscreenTrack } from "@/lib/hooks/useFullscreenTrack";
import { useChatHistory } from "@/lib/hooks/useChatHistory";
import { useStore } from "@/lib/store";
import { useFloatingTokenTracker } from "@/lib/hooks/useFloatingTokenTracker";
import { useDraggable } from "@/lib/hooks/useDraggable";
import { useResizable } from "@/lib/hooks/useResizable";
import WindowChrome from "@/components/window/WindowChrome";
import PencilSparklesIcon from "@/components/icons/PencilSparklesIcon";
import FloatingChatBody from "@/components/chat/FloatingChatBody";

export default function FloatingChatWindow({ win }: { win: FloatingWin }) {
  const managed = useWindowManager((state) => state.windows.find((item) => item.id === win.id));
  const closeFloatingWindow = useFloatingChats((state) => state.closeWindow);
  const updateFloatingWindow = useFloatingChats((state) => state.updateWindow);
  const { bringToFront, commitGeometry, minimizeWindow, setFullscreen, updateWindow: updateManagedWindow } = useWindowManager();
  const sessionTitle = useChatHistory(
    (state) => state.sessionsMeta.find((item) => item.id === win.sessionId)?.title,
  );

  const activeSubjectId = useStore((state) => state.activeSubjectId);
  const activeCategoryId = useStore((state) => state.activeCategoryId);
  const activeItemId = useStore((state) => state.activeItemId);
  const chatContext = useMemo(
    () => ({
      subjectId: activeSubjectId,
      categoryId: activeCategoryId,
      itemId: activeItemId,
      currentTopic: `${activeSubjectId} ${activeCategoryId} ${activeItemId}`,
    }),
    [activeSubjectId, activeCategoryId, activeItemId],
  );

  const preExpandRef = useRef<{ pos: { x: number; y: number }; size: { width: number; height: number } } | null>(null);

  const { elRef, onPointerDown: onDragStart } = useDraggable((dx, dy) => {
    if (!managed) return;
    const x = Math.max(0, Math.min(managed.pos.x + dx, window.innerWidth - managed.size.width));
    const y = Math.max(0, Math.min(managed.pos.y + dy, window.innerHeight - managed.size.height));
    commitGeometry(win.id, { pos: { x, y } });
  });
  const onResizeStart = useResizable(
    elRef,
    (width, height) => {
      const size = { width, height };
      persistFloatingSize(size);
      commitGeometry(win.id, { size });
    },
    { minW: FLOATING_MIN_W, minH: FLOATING_MIN_H },
  );

  useFullscreenTrack(win.id, managed?.fullscreen ?? false);

  useEffect(() => {
    if (sessionTitle && managed && managed.title !== sessionTitle) {
      updateManagedWindow(win.id, { title: sessionTitle });
    }
  }, [managed, sessionTitle, updateManagedWindow, win.id]);

  useEffect(() => {
    function onResize() {
      if (!managed) return;
      if (!managed.fullscreen) {
        commitGeometry(win.id, {
          pos: {
            x: Math.max(0, Math.min(managed.pos.x, window.innerWidth - managed.size.width)),
            y: Math.max(0, Math.min(managed.pos.y, window.innerHeight - managed.size.height)),
          },
        });
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [commitGeometry, managed, win.id]);

  if (!managed) return null;

  function handleClose() {
    useFloatingTokenTracker.getState().resetSession(win.sessionId);
    closeFloatingWindow(win.id);
  }

  function handleMinimize() {
    minimizeWindow(win.id);
  }

  function toggleExpand() {
    const current = useWindowManager.getState().windows.find((item) => item.id === win.id);
    if (!current) return;
    if (current.fullscreen) {
      const snap = preExpandRef.current;
      if (snap) commitGeometry(win.id, { pos: snap.pos, size: snap.size });
      preExpandRef.current = null;
      setFullscreen(win.id, false);
    } else {
      preExpandRef.current = { pos: current.pos, size: current.size };
      const rect = document.getElementById("notes-panel")?.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        commitGeometry(win.id, { pos: { x: rect.left, y: rect.top }, size: { width: rect.width, height: rect.height } });
      } else {
        commitGeometry(win.id, {
          pos: { x: 0, y: 48 },
          size: { width: Math.floor(window.innerWidth / 2), height: window.innerHeight - 48 },
        });
      }
      setFullscreen(win.id, true);
    }
  }

  const titleLabel =
    sessionTitle && sessionTitle !== "新对话"
      ? sessionTitle
      : win.seedMode === "explain"
        ? "AI 解释"
        : win.seedMode === "example"
          ? "AI 举例"
          : "AI 追问";

  const bodyVisible = !managed.minimized;

  return createPortal(
    <div
      ref={elRef}
      onPointerDownCapture={() => bringToFront(win.id)}
      style={{
        position: "fixed",
        left: managed.pos.x,
        top: managed.pos.y,
        width: managed.size.width,
        height: managed.size.height,
        background: "var(--md-sys-color-surface-container-lowest)",
        borderRadius: managed.fullscreen ? 0 : 12,
        boxShadow: managed.fullscreen
          ? "0 0 0 1px var(--md-sys-color-outline-variant)"
          : "0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px var(--md-sys-color-outline-variant)",
        zIndex: managed.z,
        display: managed.minimized ? "none" : "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: bodyVisible ? "scale-up 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)" : undefined,
      }}
    >
      <WindowChrome
        title={titleLabel}
        icon={<PencilSparklesIcon size={15} />}
        onClose={handleClose}
        onMinimize={handleMinimize}
        onFullscreen={toggleExpand}
        isFullscreen={managed.fullscreen}
        isMinimized={managed.minimized}
        onDragStart={onDragStart}
        bodyClassName="flex flex-col"
      >
        {bodyVisible && (
          <FloatingChatBody
            win={win}
            chatContext={chatContext}
            onModelChange={(modelId) => updateFloatingWindow(win.id, { modelId })}
          />
        )}
      </WindowChrome>

      {bodyVisible && !managed.fullscreen && (
        <div
          onPointerDown={onResizeStart}
          data-no-drag
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 16,
            height: 16,
            cursor: "nwse-resize",
            background: "linear-gradient(135deg, transparent 50%, var(--md-sys-color-outline-variant) 50%)",
            touchAction: "none",
          }}
        />
      )}
    </div>,
    document.body,
  );
}
