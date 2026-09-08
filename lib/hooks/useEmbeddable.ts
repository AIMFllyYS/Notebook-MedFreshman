"use client";

import { useEffect, useState } from "react";
import { getCachedEmbed, probeCanEmbed } from "@/lib/browser/canEmbed";

export function useEmbeddable(url: string | null) {
  const [blocked, setBlocked] = useState(false);
  const [reason, setReason] = useState<string | undefined>();
  const [forced, setForced] = useState<string | null>(null);

  useEffect(() => {
    if (!url || forced === url) {
      setBlocked(false);
      return;
    }
    const cached = getCachedEmbed(url);
    if (cached) {
      setBlocked(!cached.embeddable);
      setReason(cached.reason);
      return;
    }
    setBlocked(false);
    let alive = true;
    probeCanEmbed(url).then((verdict) => {
      if (!alive || forced === url) return;
      setBlocked(!verdict.embeddable);
      setReason(verdict.reason);
    });
    return () => {
      alive = false;
    };
  }, [url, forced]);

  return {
    blocked: blocked && forced !== url,
    reason,
    forceEmbed: () => {
      if (url) setForced(url);
    },
  };
}
