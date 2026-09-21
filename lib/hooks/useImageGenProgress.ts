"use client";

import { useEffect, useState } from "react";
import {
  estimateImageGenProgress,
  type ImageGenProgress,
} from "@/lib/chat/imageGenProgress";
import type { ImageGenStatus } from "@/lib/stores/imageGen";

/** 只在生成中走时钟；其它状态不挂 timer，也不产生任何额外渲染。 */
export function useImageGenProgress(
  session: { id: string; status: ImageGenStatus; startedAt?: number; expectedMs?: number } | null | undefined,
  intervalMs = 250,
): ImageGenProgress {
  const status = session?.status;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status !== "loading") return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [status, intervalMs]);

  if (!session) return { percent: 0, elapsedMs: 0, remainingMs: 0, stalled: false };
  return estimateImageGenProgress({
    status: session.status,
    startedAt: session.startedAt,
    expectedMs: session.expectedMs,
    now,
    seed: session.id,
  });
}
