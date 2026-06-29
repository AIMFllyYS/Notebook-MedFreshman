"use client";

import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Download, ImagePlus, RefreshCw, Loader, AlertTriangle } from "lucide-react";
import { useImageGen, imageGenWindowId } from "@/lib/hooks/useImageGen";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import { useFullscreenTrack } from "@/lib/hooks/useFullscreenTrack";
import { useDraggable } from "@/lib/hooks/useDraggable";
import { useResizable } from "@/lib/hooks/useResizable";
import { useSettings } from "@/lib/hooks/useSettings";
import { useBillingStore, createBillingRecord } from "@/lib/hooks/useBillingStore";
import { useLightbox } from "@/lib/stores/lightbox";
import WindowChrome from "@/components/window/WindowChrome";

function ImageGenViewerSingle({ sessionId }: { sessionId: string }) {
  const session = useImageGen((s) => s.sessions[sessionId] ?? null);
  const closeViewer = useImageGen((s) => s.closeViewer);
  const startLoading = useImageGen((s) => s.startLoading);
  const updateSession = useImageGen((s) => s.updateSession);
  const managed = useWindowManager((s) =>
    s.windows.find((w) => w.id === imageGenWindowId(sessionId)),
  );
  const { bringToFront, commitGeometry, minimizeWindow, setFullscreen } = useWindowManager();
  const openLightbox = useLightbox((s) => s.open);
  const preExpandRef = useRef<{
    pos: { x: number; y: number };
    size: { width: number; height: number };
  } | null>(null);
  const requestStartedRef = useRef(false);

  const winId = imageGenWindowId(sessionId);

  const { elRef, onPointerDown } = useDraggable((dx, dy) => {
    if (!managed) return;
    commitGeometry(winId, {
      pos: {
        x: Math.max(0, Math.min(managed.pos.x + dx, window.innerWidth - managed.size.width)),
        y: Math.max(0, Math.min(managed.pos.y + dy, window.innerHeight - managed.size.height)),
      },
    });
  });
  const onResizeStart = useResizable(
    elRef,
    (width, height) => {
      commitGeometry(winId, { size: { width, height } });
    },
    { minW: 380, minH: 360 },
  );

  useFullscreenTrack(winId, managed?.fullscreen ?? false);

  const triggerGenerate = useCallback(
    async (sid: string) => {
      const cur = useImageGen.getState().sessions[sid];
      if (!cur) return;
      requestStartedRef.current = true;
      startLoading(sid);

      try {
        const settings = useSettings.getState();
        const res = await fetch("/api/image-gen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId: settings.selectedModelId,
            prompt: cur.prompt,
            size: cur.size,
            count: cur.count,
            customApiGroups: settings.customApiGroups,
            defaultImageModelId: settings.defaultImageModelId,
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          updateSession(sid, {
            status: "error",
            error: errBody?.error || `请求失败：${res.status}`,
          });
          return;
        }

        const data = await res.json();
        if (!Array.isArray(data?.images)) {
          updateSession(sid, { status: "error", error: "生图 API 返回格式异常" });
          return;
        }
        
        // 记录生图计费
        useBillingStore.getState().addRecord(createBillingRecord({
          type: 'image',
          modelId: data.model || settings.selectedModelId,
          sessionId: sid,
          customGroups: settings.customApiGroups,
          imageCount: data.images.length
        }));

        updateSession(sid, { status: "done", images: data.images, error: undefined });
      } catch (err) {
        updateSession(sid, {
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },
    [startLoading, updateSession],
  );

  useEffect(() => {
    if (!session) return;
    if (session.status !== "idle") return;
    if (requestStartedRef.current) return;
    void triggerGenerate(sessionId);
  }, [session, sessionId, triggerGenerate]);

  useEffect(() => {
    if (!session) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer(sessionId);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [session, sessionId, closeViewer]);

  if (!session || !managed) return null;

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
      commitGeometry(winId, {
        pos: { x: rect.left, y: rect.top },
        size: { width: rect.width, height: rect.height },
      });
    }
    setFullscreen(winId, true);
  }

  const handleRetry = () => {
    requestStartedRef.current = false;
    void triggerGenerate(sessionId);
  };

  const downloadImage = async (url: string, idx: number) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = `${session.title || "image"}-${idx + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objUrl), 60000);
    } catch {
      window.open(url, "_blank", "noopener");
    }
  };

  const isLoading = session.status === "loading" || session.status === "idle";
  const isDone = session.status === "done";
  const isError = session.status === "error";
  const placeholderCount = Math.max(1, session.count || 1);
  const gridCols = placeholderCount === 1 ? 1 : 2;

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
        title={session.title}
        icon={<ImagePlus size={15} />}
        onClose={() => closeViewer(sessionId)}
        onMinimize={() => minimizeWindow(winId)}
        onFullscreen={toggleFullscreen}
        isFullscreen={managed.fullscreen}
        isMinimized={managed.minimized}
        onDragStart={onPointerDown}
        bodyClassName="flex flex-col"
      >
        {!managed.minimized && (
          <div className="flex h-full min-h-0 flex-col">
            <div
              className="shrink-0 border-b px-4 py-2 text-[11.5px]"
              style={{
                borderColor: "var(--md-sys-color-outline-variant)",
                background: "var(--md-sys-color-surface-container-low)",
                color: "var(--md-sys-color-on-surface-variant)",
              }}
            >
              <span style={{ fontWeight: 600 }}>提示词：</span>
              <span className="break-words">{session.prompt}</span>
              <span
                className="ml-2 inline-block rounded px-1 text-[10px]"
                style={{ background: "var(--md-sys-color-surface-container-high)" }}
              >
                {session.size} · {session.count} 张
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              {isLoading && <WatercolorLoading count={placeholderCount} />}

              {isError && (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-8 text-center">
                  <AlertTriangle size={36} style={{ color: "var(--md-sys-color-error)" }} />
                  <div
                    className="text-[13px] font-semibold"
                    style={{ color: "var(--md-sys-color-on-surface)" }}
                  >
                    生图失败
                  </div>
                  <div
                    className="max-w-md text-[12px] leading-relaxed"
                    style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                  >
                    {session.error || "未知错误"}
                  </div>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="press inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold"
                    style={{
                      background: "var(--md-sys-color-primary)",
                      color: "var(--md-sys-color-on-primary)",
                    }}
                  >
                    <RefreshCw size={13} /> 重试
                  </button>
                </div>
              )}

              {isDone && session.images.length > 0 && (
                <div
                  className="grid gap-3 p-4"
                  style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                  {session.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative overflow-hidden rounded-xl border"
                      style={{
                        borderColor: "var(--md-sys-color-outline-variant)",
                        background: "var(--md-sys-color-surface-container-low)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={`${session.title} ${idx + 1}`}
                        className="w-full cursor-zoom-in"
                        style={{ display: "block" }}
                        onClick={() => openLightbox(img.url, session.title)}
                      />
                      <button
                        type="button"
                        onClick={() => downloadImage(img.url, idx)}
                        title="下载图片"
                        className="press absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                        style={{
                          background: "var(--md-sys-color-surface)",
                          color: "var(--md-sys-color-on-surface)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                        }}
                      >
                        <Download size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {isDone && session.images.length === 0 && (
                <div
                  className="flex h-full items-center justify-center text-[12px]"
                  style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                >
                  生图完成，但未返回任何图片
                </div>
              )}
            </div>

            {isDone && (
              <div
                className="shrink-0 border-t px-3 py-2"
                style={{ borderColor: "var(--md-sys-color-outline-variant)" }}
              >
                <button
                  type="button"
                  onClick={handleRetry}
                  className="press inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium"
                  style={{
                    borderColor: "var(--md-sys-color-outline-variant)",
                    color: "var(--md-sys-color-on-surface-variant)",
                  }}
                >
                  <RefreshCw size={13} /> 重新生成
                </button>
                <span
                  className="ml-3 text-[10.5px]"
                  style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                >
                  图片 URL 1 小时后失效，请及时下载
                </span>
              </div>
            )}
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
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          >
            <path d="M11 4 L4 11" />
            <path d="M11 8 L8 11" />
          </svg>
        </div>
      )}
    </div>,
    document.body,
  );
}

export default function ImageGenViewerLayer() {
  const openIds = useImageGen((s) => s.openIds);
  return (
    <>
      {openIds.map((id) => (
        <ImageGenViewerSingle key={id} sessionId={id} />
      ))}
    </>
  );
}

function WatercolorLoading({ count }: { count: number }) {
  const cells = Array.from({ length: count });
  const cols = count === 1 ? 1 : 2;
  return (
    <div
      className="grid gap-3 p-4"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      <style>{`
        @keyframes hf-watercolor-1 {
          0% { transform: translate(0%, 0%) scale(1); opacity: 0.55; }
          50% { transform: translate(15%, -10%) scale(1.15); opacity: 0.78; }
          100% { transform: translate(0%, 0%) scale(1); opacity: 0.55; }
        }
        @keyframes hf-watercolor-2 {
          0% { transform: translate(0%, 0%) scale(1); opacity: 0.5; }
          50% { transform: translate(-12%, 10%) scale(1.2); opacity: 0.75; }
          100% { transform: translate(0%, 0%) scale(1); opacity: 0.5; }
        }
        @keyframes hf-watercolor-3 {
          0% { transform: translate(0%, 0%) scale(1); opacity: 0.45; }
          50% { transform: translate(8%, 14%) scale(1.18); opacity: 0.7; }
          100% { transform: translate(0%, 0%) scale(1); opacity: 0.45; }
        }
        @keyframes hf-watercolor-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes hf-watercolor-pulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
      `}</style>
      {cells.map((_, idx) => (
        <div
          key={idx}
          className="relative overflow-hidden rounded-xl"
          style={{
            aspectRatio: "1 / 1",
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--md-sys-color-tertiary) 8%, var(--md-sys-color-surface-container-low)), var(--md-sys-color-surface-container-low))",
            border: "1px solid var(--md-sys-color-outline-variant)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "-15%",
              top: "-15%",
              width: "70%",
              height: "70%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--md-sys-color-primary) 80%, transparent) 0%, transparent 70%)",
              filter: "blur(28px)",
              animation: `hf-watercolor-1 5.2s ease-in-out infinite`,
              animationDelay: `${idx * 0.3}s`,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "-15%",
              bottom: "-12%",
              width: "75%",
              height: "75%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--md-sys-color-tertiary) 75%, transparent) 0%, transparent 72%)",
              filter: "blur(32px)",
              animation: `hf-watercolor-2 6.4s ease-in-out infinite`,
              animationDelay: `${idx * 0.4}s`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "20%",
              top: "30%",
              width: "60%",
              height: "60%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--md-sys-color-secondary) 65%, transparent) 0%, transparent 70%)",
              filter: "blur(24px)",
              animation: `hf-watercolor-3 7.0s ease-in-out infinite`,
              animationDelay: `${idx * 0.55}s`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              zIndex: 2,
              animation: "hf-watercolor-pulse 2.4s ease-in-out infinite",
            }}
          >
            <Loader
              size={28}
              style={{
                color: "var(--md-sys-color-primary)",
                animation: "hf-watercolor-spin 1.4s linear infinite",
              }}
            />
            <div
              className="text-[11.5px] font-medium"
              style={{
                color: "var(--md-sys-color-on-surface)",
                textShadow:
                  "0 1px 2px color-mix(in srgb, var(--md-sys-color-surface) 60%, transparent)",
              }}
            >
              正在生成图片…
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
