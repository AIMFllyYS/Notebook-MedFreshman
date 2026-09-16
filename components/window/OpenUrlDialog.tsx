"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { SPOTLIGHT_INPUT_CLASS } from "@/components/search/spotlightChrome";
import { openSourcePreview } from "@/lib/chat/openSourcePreview";

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

/** 加号菜单最后一栏的内联网址栏：复用搜索 input class，不另开 Spotlight 页。 */
export default function OpenUrlField({ onOpened }: { onOpened?: () => void }) {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

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
    setUrl("");
    setUrlError(null);
    onOpened?.();
  };

  return (
    <div role="group" aria-label="输入网址" data-menu-group="open-url">
      <div className="flex items-center gap-1.5 px-1">
        <Link2 size={14} className="shrink-0 text-[var(--md-sys-color-primary)]" />
        <input
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
        <button
          type="button"
          onClick={addUrl}
          className="rounded-md bg-[var(--md-sys-color-primary)] px-2 py-1.5 text-[11px] font-medium text-[var(--md-sys-color-on-primary)]"
        >
          打开
        </button>
      </div>
      {urlError ? (
        <p className="px-1 pt-1 text-[12px] text-[var(--md-sys-color-error)]">{urlError}</p>
      ) : null}
    </div>
  );
}
