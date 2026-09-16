"use client";

import { useEffect, useRef, useState } from "react";
import { Link2 } from "lucide-react";
import SpotlightDialog from "@/components/search/SpotlightDialog";
import { SPOTLIGHT_INPUT_CLASS } from "@/components/search/spotlightChrome";
import { openSourcePreview } from "@/lib/chat/openSourcePreview";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";

export function parseOpenableUrl(raw: string): { href: string; hostname: string; isHtml: boolean } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return {
      href: parsed.toString(),
      hostname: parsed.hostname,
      isHtml: /\.html?(?:$|[?#])/i.test(parsed.pathname),
    };
  } catch {
    return null;
  }
}

export default function OpenUrlDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useOverlayRegistration({
    id: "open-url",
    open,
    onClose,
    priority: 80,
  });

  useEffect(() => {
    if (!open) return;
    setUrl("");
    setUrlError(null);
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const addUrl = () => {
    const parsed = parseOpenableUrl(url);
    if (!parsed) {
      setUrlError("请输入有效的 http:// 或 https:// 地址");
      return;
    }
    openSourcePreview({
      url: parsed.href,
      title: `${parsed.isHtml ? "HTML" : "网址"} · ${parsed.hostname}`,
    });
    onClose();
  };

  return (
    <SpotlightDialog
      open={open}
      onClose={onClose}
      label="输入网址"
      icon={<Link2 size={18} className="shrink-0 text-[var(--md-sys-color-primary)]" />}
      input={
        <input
          ref={inputRef}
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setUrlError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") addUrl();
          }}
          placeholder="输入网址…"
          aria-label="网址"
          className={SPOTLIGHT_INPUT_CLASS}
        />
      }
    >
      <div className="px-4 py-3">
        {urlError ? (
          <p className="text-[12px] text-[var(--md-sys-color-error)]">{urlError}</p>
        ) : (
          <p className="text-[13px] text-[var(--ink-faint)]">输入 http:// 或 https:// 地址，回车即可打开</p>
        )}
        <button
          type="button"
          onClick={addUrl}
          className="mt-3 rounded-md bg-[var(--md-sys-color-primary)] px-2 py-1.5 text-[11px] font-medium text-[var(--md-sys-color-on-primary)]"
        >
          打开
        </button>
      </div>
    </SpotlightDialog>
  );
}
