"use client";

import { motion, useDragControls } from "framer-motion";
import { useState } from "react";
import { useStore } from "@/lib/store";

export default function PipPlayer() {
  const video = useStore((s) => s.pipVideo);
  const close = useStore((s) => s.closePip);
  const controls = useDragControls();
  const [width, setWidth] = useState(440);

  if (!video) return null;

  function nativePip() {
    const v = document.getElementById("pip-video-el") as HTMLVideoElement | null;
    if (v && "requestPictureInPicture" in v) {
      (v as HTMLVideoElement).requestPictureInPicture().catch(() => {});
    }
  }

  function startResize(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = width;
    const move = (ev: PointerEvent) => {
      setWidth(Math.min(760, Math.max(300, startW + (ev.clientX - startX))));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <motion.div
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }}
      exit={{ opacity: 0, scale: 0.85, y: 20, transition: { duration: 0.2 } }}
      whileDrag={{ scale: 1.02, boxShadow: "0 24px 60px rgba(20,24,40,0.25)" }}
      className="fixed bottom-6 right-6 z-[100] overflow-hidden rounded-xl border border-black/20 bg-black shadow-[var(--shadow-lg)]"
      style={{ width }}
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="flex cursor-move items-center justify-between gap-2 bg-[var(--ink)] px-2.5 py-1.5 text-white"
      >
        <span className="truncate text-[12.5px] font-medium">{video.title}</span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={nativePip}
            title="浏览器原生画中画"
            className="grid h-6 w-6 place-items-center rounded hover:bg-white/15"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="14" rx="2" />
              <rect x="11" y="10" width="8" height="6" rx="1" fill="currentColor" />
            </svg>
          </button>
          <button
            onClick={close}
            title="关闭"
            className="grid h-6 w-6 place-items-center rounded hover:bg-white/15"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <video
        id="pip-video-el"
        src={video.src}
        poster={video.poster}
        controls
        autoPlay
        className="block w-full bg-black"
      />

      <div
        onPointerDown={startResize}
        className="absolute bottom-0 right-0 z-10 h-4 w-4 cursor-se-resize"
        title="拖动调整大小"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" className="text-white/50">
          <path d="M14 6 6 14M14 10l-4 4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </motion.div>
  );
}
